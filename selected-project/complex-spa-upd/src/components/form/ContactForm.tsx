import { useState } from 'react';
import styles from './ContactForm.module.css';

export const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'general',
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h2 className={styles.title}>Contact Us</h2>
      <p className={styles.description}>Have questions? Fill out the form below and we'll get back to you soon.</p>
      
      <div className={styles.grid}>
        <div className={styles.inputGroup}>
          <label htmlFor="name" className={styles.label}>Full Name</label>
          <input
            id="name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={styles.input}
            placeholder="John Doe"
            required
          />
        </div>
        
        <div className={styles.inputGroup}>
          <label htmlFor="email" className={styles.label}>Email</label>
          <input
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={styles.input}
            placeholder="your@email.com"
            required
          />
        </div>
      </div>
      
      <div className={styles.inputGroup}>
        <label htmlFor="phone" className={styles.label}>Phone Number</label>
        <input
          id="phone"
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className={styles.input}
          placeholder="(123) 456-7890"
        />
      </div>
      
      <div className={styles.inputGroup}>
        <label htmlFor="subject" className={styles.label}>Subject</label>
        <select
          id="subject"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          className={styles.select}
        >
          <option value="general">General Inquiry</option>
          <option value="support">Technical Support</option>
          <option value="billing">Billing Question</option>
          <option value="feedback">Feedback</option>
        </select>
      </div>
      
      <div className={styles.inputGroup}>
        <label htmlFor="message" className={styles.label}>Message</label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          className={styles.textarea}
          placeholder="Your message here..."
          rows={5}
          required
        />
      </div>
      
      <button type="submit" className={styles.submitButton}>Send Message</button>
    </form>
  );
};