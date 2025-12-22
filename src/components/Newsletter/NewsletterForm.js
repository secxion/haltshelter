import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import './NewsletterForm.css';

/**
 * NewsletterForm Component
 * Handles newsletter subscription with email confirmation flow
 * Shows different states: form, success, error
 */
const NewsletterForm = ({ onSuccess, onError, variant = 'default' }) => {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gdprConsent, setGdprConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [state, setState] = useState('form'); // form, submitting, success, error
  const [message, setMessage] = useState('');
  const [errorDetails, setErrorDetails] = useState('');

  // Reset form when component mounts
  useEffect(() => {
    resetForm();
  }, []);

  const resetForm = () => {
    setEmail('');
    setFirstName('');
    setLastName('');
    setGdprConsent(false);
    setState('form');
    setMessage('');
    setErrorDetails('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorDetails('');

    // Validation
    if (!email) {
      setErrorDetails('Please enter your email address');
      return;
    }

    if (!gdprConsent) {
      setErrorDetails('Please agree to receive our newsletter');
      return;
    }

    setState('submitting');
    setLoading(true);

    try {
      const response = await apiService.newsletter.subscribe(email, {
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        gdprConsent: true,
        preferences: {
          generalNews: true,
          animalUpdates: true,
          events: true,
          fundraising: true,
          volunteerOpportunities: false
        }
      });

      setMessage(response.data.message);
      setState('success');

      if (onSuccess) {
        onSuccess({
          email,
          firstName,
          lastName
        });
      }

      // Auto-reset form after 5 seconds
      setTimeout(() => {
        resetForm();
      }, 5000);
    } catch (error) {
      const errorMessage = error?.response?.data?.error || 
                         error?.response?.data?.message ||
                         error.message ||
                         'Failed to subscribe. Please try again.';
      
      setErrorDetails(errorMessage);
      setState('error');

      if (onError) {
        onError(errorMessage);
      }

      console.error('Newsletter subscription error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Render different states
  if (state === 'success') {
    return (
      <div className={`newsletter-form newsletter-form--${variant} newsletter-form--success`}>
        <div className="newsletter-success-content">
          <div className="newsletter-success-icon">✅</div>
          <h3 className="newsletter-success-title">Almost There!</h3>
          <p className="newsletter-success-message">
            We've sent a confirmation email to <strong>{email}</strong>
          </p>
          <p className="newsletter-success-instructions">
            Please check your inbox and click the confirmation link to complete your subscription. 
            If you don't see it, check your spam folder.
          </p>
          <button
            type="button"
            onClick={resetForm}
            className="newsletter-form-button newsletter-form-button--secondary"
          >
            Subscribe Another Email
          </button>
        </div>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className={`newsletter-form newsletter-form--${variant} newsletter-form--error`}>
        <div className="newsletter-error-content">
          <div className="newsletter-error-icon">⚠️</div>
          <h3 className="newsletter-error-title">Subscription Failed</h3>
          <p className="newsletter-error-message">{errorDetails}</p>
          <button
            type="button"
            onClick={resetForm}
            className="newsletter-form-button newsletter-form-button--primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`newsletter-form newsletter-form--${variant}`}>
      <div className="newsletter-form-group">
        <div className="newsletter-form-row">
          <div className="newsletter-form-field">
            <input
              type="text"
              placeholder="First Name (optional)"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              disabled={loading}
              className="newsletter-form-input"
            />
          </div>
          <div className="newsletter-form-field">
            <input
              type="text"
              placeholder="Last Name (optional)"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              disabled={loading}
              className="newsletter-form-input"
            />
          </div>
        </div>

        <div className="newsletter-form-field">
          <input
            type="email"
            placeholder="Your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            className="newsletter-form-input"
          />
        </div>

        <div className="newsletter-form-consent">
          <label className="newsletter-form-checkbox-label">
            <input
              type="checkbox"
              checked={gdprConsent}
              onChange={(e) => setGdprConsent(e.target.checked)}
              disabled={loading}
              className="newsletter-form-checkbox"
              required
            />
            <span className="newsletter-form-consent-text">
              I'd like to receive updates about animals, stories, events, and fundraising opportunities from HALT.
              <a href="/privacy" className="newsletter-form-link"> Learn about our privacy practices</a>.
            </span>
          </label>
        </div>

        {errorDetails && state === 'form' && (
          <div className="newsletter-form-error-message">
            {errorDetails}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !email || !gdprConsent}
          className="newsletter-form-button newsletter-form-button--primary"
        >
          {loading ? (
            <>
              <span className="newsletter-form-spinner"></span>
              Subscribing...
            </>
          ) : (
            '📬 Subscribe to Newsletter'
          )}
        </button>
      </div>

      <p className="newsletter-form-disclaimer">
        We respect your privacy. Unsubscribe at any time.
      </p>
    </form>
  );
};

export default NewsletterForm;
