import { Button as AntButton } from 'antd';
import React from 'react';

type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'primary' | 'default' | 'dashed' | 'text' | 'link';
  disabled?: boolean;
};

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  type = 'primary',
  disabled = false
}) => {
  return (
    <AntButton type={type} onClick={onClick} disabled={disabled}>
      {children}
    </AntButton>
  );
};