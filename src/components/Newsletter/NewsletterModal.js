import React, { useState, useEffect } from 'react';
import NewsletterForm from './NewsletterForm';
import './NewsletterModal.css';

/**
 * NewsletterModal Component
 * Full-screen modal for newsletter subscription
 * Used when user navigates with ?newsletter=true
 */
const NewsletterModal = ({ isOpen, onClose }) => {
  const [fadeOut, setFadeOut] = useState(false);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleClose = () => {
    setFadeOut(true);
    setTimeout(() => {
      onClose();
      setFadeOut(false);
    }, 300);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={`newsletter-modal-backdrop ${fadeOut ? 'fade-out' : ''}`}
      onClick={handleBackdropClick}
      role="presentation"
    >
      <div className="newsletter-modal-container">
        <button
          type="button"
          className="newsletter-modal-close"
          onClick={handleClose}
          aria-label="Close newsletter modal"
        >
          ✕
        </button>

        <div className="newsletter-modal-content">
          <div className="newsletter-modal-header">
            <h2 className="newsletter-modal-title">🐾 Join HALT Newsletter</h2>
            <p className="newsletter-modal-subtitle">
              Stay connected with rescue stories, adoption updates, and ways to help
            </p>
          </div>

          <div className="newsletter-modal-form-wrapper">
            <NewsletterForm
              variant="modal"
              onSuccess={() => {
                setTimeout(() => {
                  handleClose();
                }, 3000);
              }}
            />
          </div>

          <div className="newsletter-modal-benefits">
            <h3 className="newsletter-modal-benefits-title">What You'll Get:</h3>
            <ul className="newsletter-modal-benefits-list">
              <li>
                <span className="newsletter-modal-benefit-icon">📖</span>
                <span>Heartwarming rescue success stories</span>
              </li>
              <li>
                <span className="newsletter-modal-benefit-icon">🐾</span>
                <span>Updates about animals in our care</span>
              </li>
              <li>
                <span className="newsletter-modal-benefit-icon">🚨</span>
                <span>Urgent alerts when animals need help</span>
              </li>
              <li>
                <span className="newsletter-modal-benefit-icon">💝</span>
                <span>Sponsorship opportunities and events</span>
              </li>
              <li>
                <span className="newsletter-modal-benefit-icon">🤝</span>
                <span>Ways to volunteer and support</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsletterModal;
