import React from 'react';
import './Card.css';

type CardProps = {
  title: string;
  description: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'highlight' | 'minimal';
  onClick?: () => void;
};

const Card: React.FC<CardProps> = ({
  title,
  description,
  icon,
  variant = 'default',
  onClick,
}) => {
  const getVariantClass = () => {
    switch (variant) {
      case 'highlight':
        return 'card-highlight';
      case 'minimal':
        return 'card-minimal';
      default:
        return 'card-default';
    }
  };

  return (
    <div className={`card ${getVariantClass()}`} onClick={onClick}>
      {icon && <div className="card-icon">{icon}</div>}
      <h3 className="card-title">{title}</h3>
      <p className="card-description">{description}</p>
    </div>
  );
};

export default Card;