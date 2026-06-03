import React, { useState } from 'react';
import './FormSurvey.css';

type SurveyData = {
  name: string;
  email: string;
  age: number | '';
  satisfaction: number;
  feedback: string;
  improvements: string[];
  subscribe: boolean;
};

const initialData: SurveyData = {
  name: '',
  email: '',
  age: '',
  satisfaction: 5,
  feedback: '',
  improvements: [],
  subscribe: false,
};

const improvementOptions = [
  'User interface',
  'Performance',
  'Features',
  'Documentation',
  'Customer support',
];

const FormSurvey = () => {
  const [formData, setFormData] = useState<SurveyData>(initialData);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (option: string) => {
    setFormData(prev => {
      const newImprovements = prev.improvements.includes(option)
        ? prev.improvements.filter(item => item !== option)
        : [...prev.improvements, option];
      
      return {
        ...prev,
        improvements: newImprovements
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Survey submitted:', formData);
    setSubmitted(true);
    // In a real app, you would send this data to your backend
  };

  if (submitted) {
    return (
      <div className="survey-success">
        <h2>Thank you for your feedback!</h2>
        <p>We appreciate you taking the time to complete our survey.</p>
      </div>
    );
  }

  return (
    <form className="survey-form" onSubmit={handleSubmit}>
      <h2>Product Feedback Survey</h2>
      
      <div className="form-group">
        <label htmlFor="name">Full Name</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="email">Email Address</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="age">Age</label>
        <select
          id="age"
          name="age"
          value={formData.age}
          onChange={handleSelectChange}
          required
        >
          <option value="">Select your age</option>
          <option value="18-24">18-24</option>
          <option value="25-34">25-34</option>
          <option value="35-44">35-44</option>
          <option value="45-54">45-54</option>
          <option value="55+">55+</option>
        </select>
      </div>

      <div className="form-group">
        <label>Satisfaction Level</label>
        <div className="rating-scale">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
            <React.Fragment key={num}>
              <input
                type="radio"
                id={`satisfaction-${num}`}
                name="satisfaction"
                value={num}
                checked={formData.satisfaction === num}
                onChange={handleChange}
              />
              <label htmlFor={`satisfaction-${num}`}>{num}</label>
            </React.Fragment>
          ))}
          <div className="scale-labels">
            <span>Not satisfied</span>
            <span>Very satisfied</span>
          </div>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="feedback">Additional Feedback</label>
        <textarea
          id="feedback"
          name="feedback"
          value={formData.feedback}
          onChange={handleChange}
          rows={4}
        />
      </div>

      <div className="form-group">
        <label>What could we improve? (Select all that apply)</label>
        <div className="checkbox-group">
          {improvementOptions.map(option => (
            <div key={option} className="checkbox-option">
              <input
                type="checkbox"
                id={`improve-${option.replace(/\s+/g, '-').toLowerCase()}`}
                checked={formData.improvements.includes(option)}
                onChange={() => handleCheckboxChange(option)}
              />
              <label htmlFor={`improve-${option.replace(/\s+/g, '-').toLowerCase()}`}>
                {option}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="form-group checkbox-single">
        <input
          type="checkbox"
          id="subscribe"
          name="subscribe"
          checked={formData.subscribe}
          onChange={handleChange}
        />
        <label htmlFor="subscribe">Subscribe to our newsletter</label>
      </div>

      <button type="submit" className="submit-button">
        Submit Survey
      </button>
    </form>
  );
};

export default FormSurvey;