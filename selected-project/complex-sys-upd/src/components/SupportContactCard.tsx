import React from 'react';

export const SupportContactCard = () => {
  return (
    <div className="support-contact-card">
      <h3>Need Help?</h3>
      <div className="support-options">
        <div className="support-option">
          <h4>Email Support</h4>
          <p>support@example.com</p>
          <p>Response time: 24 hours</p>
        </div>
        <div className="support-option">
          <h4>Live Chat</h4>
          <p>Available 9AM-5PM EST</p>
          <button>Start Chat</button>
        </div>
        <div className="support-option">
          <h4>Phone Support</h4>
          <p>+1 (800) 123-4567</p>
          <p>24/7 for critical issues</p>
        </div>
      </div>
      <div className="documentation-link">
        <a href="#">View Documentation & FAQs</a>
      </div>
    </div>
  );
};