import React from 'react';
import { Link } from 'react-router-dom';
import './Button.css';

/**
 * Vistaraz Button Component
 * Reusable button supporting multiple variants, sizes, icons, and router navigation.
 * 
 * @param {'primary' | 'accent' | 'secondary' | 'outline' | 'ghost' | 'soft'} variant
 * @param {'sm' | 'md' | 'lg'} size
 * @param {React.ReactNode} icon
 * @param {'left' | 'right'} iconPosition
 * @param {string} to - React Router destination
 * @param {string} href - External URL destination
 * @param {boolean} fullWidth
 * @param {boolean} disabled
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'right',
  to,
  href,
  onClick,
  disabled = false,
  type = 'button',
  fullWidth = false,
  className = '',
  ...props
}) {
  const classes = [
    'vz-btn',
    `vz-btn--${variant}`,
    `vz-btn--${size}`,
    fullWidth ? 'vz-btn--full' : '',
    disabled ? 'vz-btn--disabled' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      {icon && iconPosition === 'left' && <span className="vz-btn__icon vz-btn__icon--left">{icon}</span>}
      {children && <span className="vz-btn__label">{children}</span>}
      {icon && iconPosition === 'right' && <span className="vz-btn__icon vz-btn__icon--right">{icon}</span>}
    </>
  );

  if (to && !disabled) {
    return (
      <Link to={to} className={classes} {...props}>
        {content}
      </Link>
    );
  }

  if (href && !disabled) {
    return (
      <a href={href} className={classes} {...props}>
        {content}
      </a>
    );
  }

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {content}
    </button>
  );
}
