import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

/**
 * Official Facebook brand logo SVG
 */
export const FacebookLogo: React.FC<LogoProps> = ({ className = 'w-6 h-6', size }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    style={size ? { width: size, height: size } : undefined}
    aria-label="Facebook"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
    />
  </svg>
);

/**
 * Official Instagram brand logo with authentic vibrant multi-stop gradient
 */
export const InstagramLogo: React.FC<LogoProps> = ({ className = 'w-6 h-6', size }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    style={size ? { width: size, height: size } : undefined}
    aria-label="Instagram"
  >
    <defs>
      <radialGradient id="ig-grad-radial" cx="20%" cy="105%" r="130%" fx="0%" fy="100%">
        <stop offset="0%" stopColor="#ffd600" />
        <stop offset="15%" stopColor="#ff7a00" />
        <stop offset="50%" stopColor="#ff0169" />
        <stop offset="70%" stopColor="#d300c5" />
        <stop offset="100%" stopColor="#7638fa" />
      </radialGradient>
      <linearGradient id="ig-grad-linear" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4f5bd5" />
        <stop offset="25%" stopColor="#962fbf" />
        <stop offset="50%" stopColor="#d62976" />
        <stop offset="75%" stopColor="#fa7e1e" />
        <stop offset="100%" stopColor="#feda75" />
      </linearGradient>
    </defs>
    <rect width="24" height="24" rx="6" fill="url(#ig-grad-radial)" />
    <circle cx="12" cy="12" r="4.3" stroke="#ffffff" strokeWidth="1.8" />
    <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" stroke="#ffffff" strokeWidth="1.8" />
    <circle cx="17.2" cy="6.8" r="1.15" fill="#ffffff" />
  </svg>
);

/**
 * Official WhatsApp brand logo SVG
 */
export const WhatsAppLogo: React.FC<LogoProps> = ({ className = 'w-6 h-6', size }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    style={size ? { width: size, height: size } : undefined}
    aria-label="WhatsApp"
  >
    <circle cx="12" cy="12" r="12" fill="#25D366" />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347zM12.016 20.088h-.006c-1.464 0-2.902-.394-4.156-1.14l-.298-.177-3.09.81.824-3.013-.194-.309c-.82-1.305-1.253-2.825-1.253-4.387 0-4.57 3.719-8.288 8.291-8.288 2.215 0 4.297.863 5.862 2.43 1.566 1.566 2.427 3.649 2.426 5.865-.002 4.572-3.722 8.29-8.292 8.29z"
      fill="#ffffff"
    />
  </svg>
);

/**
 * Official Messenger brand logo SVG
 */
export const MessengerLogo: React.FC<LogoProps> = ({ className = 'w-6 h-6', size }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    style={size ? { width: size, height: size } : undefined}
    aria-label="Messenger"
  >
    <defs>
      <linearGradient id="msg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#00B2FE" />
        <stop offset="50%" stopColor="#006AFF" />
        <stop offset="100%" stopColor="#9E14FE" />
      </linearGradient>
    </defs>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2C6.477 2 2 6.145 2 11.258c0 2.913 1.458 5.518 3.737 7.218V22l3.375-1.853c.92.255 1.89.393 2.888.393 5.523 0 10-4.145 10-9.258C22 6.145 17.523 2 12 2zm1.05 12.336l-2.55-2.72-4.98 2.72 5.48-5.816 2.61 2.72 4.92-2.72-5.48 5.816z"
      fill="url(#msg-grad)"
    />
  </svg>
);
