import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { apiService, authHelpers, handleApiError } from '../services/api';

// Initial state
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Action types
const AuthActionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_USER: 'SET_USER',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  LOGOUT: 'LOGOUT',
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AuthActionTypes.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };
    
    case AuthActionTypes.SET_USER:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    
    case AuthActionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    
    case AuthActionTypes.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };
    
    case AuthActionTypes.LOGOUT:
      return {
        ...initialState,
        isLoading: false,
      };
    
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = authHelpers.getToken();
        const user = authHelpers.getUser();

        if (token && user) {
          // Verify token is still valid
          try {
            const response = await apiService.auth.getProfile();
            dispatch({
              type: AuthActionTypes.SET_USER,
              payload: {
                user: response.data.user,
                token,
              },
            });
          } catch (error) {
            // Token is invalid, clear storage
            authHelpers.removeToken();
            dispatch({ type: AuthActionTypes.LOGOUT });
          }
        } else {
          dispatch({ type: AuthActionTypes.SET_LOADING, payload: false });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        dispatch({ type: AuthActionTypes.SET_LOADING, payload: false });
      }
    };

    initializeAuth();
  }, []);

  // Actions
  const login = async (credentials) => {
    try {
      dispatch({ type: AuthActionTypes.SET_LOADING, payload: true });
      dispatch({ type: AuthActionTypes.CLEAR_ERROR });

      const response = await apiService.auth.login(credentials);
      const { user, token } = response.data;

      // Store in localStorage
      authHelpers.setToken(token);
      authHelpers.setUser(user);

      dispatch({
        type: AuthActionTypes.SET_USER,
        payload: { user, token },
      });

      return { success: true, user };
    } catch (error) {
      const errorInfo = handleApiError(error);
      dispatch({
        type: AuthActionTypes.SET_ERROR,
        payload: errorInfo.message,
      });
      return { success: false, error: errorInfo.message };
    }
  };

  const register = async (userData) => {
    try {
      dispatch({ type: AuthActionTypes.SET_LOADING, payload: true });
      dispatch({ type: AuthActionTypes.CLEAR_ERROR });

      const response = await apiService.auth.register(userData);
      const { user, token } = response.data;

      // Store in localStorage
      authHelpers.setToken(token);
      authHelpers.setUser(user);

      dispatch({
        type: AuthActionTypes.SET_USER,
        payload: { user, token },
      });

      return { success: true, user };
    } catch (error) {
      const errorInfo = handleApiError(error);
      dispatch({
        type: AuthActionTypes.SET_ERROR,
        payload: errorInfo.message,
      });
      return { success: false, error: errorInfo.message };
    }
  };

  const logout = () => {
    authHelpers.removeToken();
    dispatch({ type: AuthActionTypes.LOGOUT });
  };

  const updateUser = (userData) => {
    const updatedUser = { ...state.user, ...userData };
    authHelpers.setUser(updatedUser);
    dispatch({
      type: AuthActionTypes.SET_USER,
      payload: {
        user: updatedUser,
        token: state.token,
      },
    });
  };

  const clearError = () => {
    dispatch({ type: AuthActionTypes.CLEAR_ERROR });
  };

  // Helper functions
  const hasRole = (role) => {
    return state.user && state.user.role === role;
  };

  const isAdmin = () => hasRole('admin');
  const isVolunteer = () => hasRole('volunteer') || isAdmin();

  const value = {
    // State
    user: state.user,
    token: state.token,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
    
    // Actions
    login,
    register,
    logout,
    updateUser,
    clearError,
    
    // Helper functions
    hasRole,
    isAdmin,
    isVolunteer,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Higher-order component for protecting routes
export const withAuth = (Component, requiredRole = null) => {
  return function AuthenticatedComponent(props) {
    const { isAuthenticated, isLoading, hasRole } = useAuth();

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
            <p className="text-gray-600 mb-6">You need to be logged in to access this page.</p>
            <button
              onClick={() => window.location.href = '/'}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              Go to Home
            </button>
          </div>
        </div>
      );
    }

    if (requiredRole && !hasRole(requiredRole)) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Insufficient Permissions</h2>
            <p className="text-gray-600 mb-6">You don't have permission to access this page.</p>
            <button
              onClick={() => window.location.href = '/'}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              Go to Home
            </button>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
};

export default AuthContext;
