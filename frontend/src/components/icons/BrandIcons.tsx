import React from 'react';
import { FaApple } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';

export const AppleIcon: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 20,
}) => {
  return (
    <span className={`inline-flex items-center justify-center ${className}`}>
      <FaApple size={size} />
    </span>
  );
};

export const GoogleIcon: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 20,
}) => {
  return (
    <span className={`inline-flex items-center justify-center ${className}`}>
      <FcGoogle size={size} />
    </span>
  );
};