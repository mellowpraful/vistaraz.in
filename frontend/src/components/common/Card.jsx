import React from 'react';
import './Card.css';

/**
 * Vistaraz Card Component
 * Reusable card supporting standard cards, mood assessment cards, interactive cards.
 * 
 * @param {'default' | 'pink' | 'peach' | 'yellow' | 'mint' | 'sky' | 'lavender'} variant
 * @param {'none' | 'sm' | 'md' | 'lg'} padding
 * @param {boolean} hoverable
 * @param {boolean} selected
 * @param {boolean} clickable
 */
export default function Card({
  children,
  variant = 'default',
  padding = 'md',
  hoverable = false,
  selected = false,
  clickable = false,
  onClick,
  className = '',
  ...props
}) {
  const classes = [
    'vz-card',
    `vz-card--${variant}`,
    `vz-card--padding-${padding}`,
    hoverable ? 'vz-card--hoverable' : '',
    selected ? 'vz-card--selected' : '',
    clickable ? 'vz-card--clickable' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={classes}
      onClick={clickable ? onClick : undefined}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      {...props}
    >
      {children}
    </div>
  );
}

// Subcomponents for structured card layouts
Card.Header = function CardHeader({ children, className = '', ...props }) {
  return <div className={`vz-card__header ${className}`} {...props}>{children}</div>;
};

Card.Body = function CardBody({ children, className = '', ...props }) {
  return <div className={`vz-card__body ${className}`} {...props}>{children}</div>;
};

Card.Footer = function CardFooter({ children, className = '', ...props }) {
  return <div className={`vz-card__footer ${className}`} {...props}>{children}</div>;
};
