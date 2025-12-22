import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Suppress MetaMask extension errors in development
if (process.env.NODE_ENV === 'development') {
  const originalError = console.error;
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('MetaMask') || 
       args[0].includes('chrome-extension://nkbihfbeogaeaoehlefnkodbefgpgknn'))
    ) {
      return; // Suppress MetaMask extension errors
    }
    originalError.apply(console, args);
  };

  // Additional defensive filters to reduce noisy extension logs
  const originalWarn = console.warn;
  const suppressPatterns = [
    'MetaMask',
    'inpage.js',
    'ObjectMultiplex - malformed chunk',
    'StreamMiddleware - Unknown response id',
    'Failed to connect to MetaMask',
    'MetaMask extension not found',
    'chrome-extension://nkbihfbeogaeaoehlefnkodbefgpgknn'
  ];
  const shouldSuppress = (msg) => typeof msg === 'string' && suppressPatterns.some((p) => msg.includes(p));

  console.warn = (...args) => {
    if (shouldSuppress(args[0])) return;
    originalWarn.apply(console, args);
  };

  // Suppress global window errors originating from injected extension scripts
  window.addEventListener('error', (event) => {
    if (shouldSuppress(event.message)) {
      event.preventDefault();
    }
  });

  // Suppress unhandled promise rejections from extension scripts
  window.addEventListener('unhandledrejection', (event) => {
    let reasonText = '';
    if (event.reason) {
      if (typeof event.reason === 'string') {
        reasonText = event.reason;
      } else if (event.reason.message) {
        reasonText = event.reason.message;
      } else if (event.reason.stack) {
        reasonText = event.reason.stack;
      } else {
        reasonText = String(event.reason);
      }
    }
    if (shouldSuppress(reasonText)) {
      event.preventDefault();
    }
  });

  // Also suppress errors that bubble up from inpage.js before becoming unhandled rejections
  const originalErrorHandler = window.onerror;
  window.onerror = (msg, url, line, col, errorObj) => {
    if (shouldSuppress(msg) || shouldSuppress(String(errorObj))) {
      return true; // Suppress
    }
    return originalErrorHandler ? originalErrorHandler(msg, url, line, col, errorObj) : false;
  };
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
