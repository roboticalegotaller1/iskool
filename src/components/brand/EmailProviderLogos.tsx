import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

/**
 * Logo Oficial de Google / Google Workspace
 */
export const GoogleOfficialLogo: React.FC<LogoProps> = ({ className = 'w-5 h-5', size }) => (
  <svg
    viewBox="0 0 24 24"
    width={size || 20}
    height={size || 20}
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      fill="#EA4335"
    />
  </svg>
);

/**
 * Logo Oficial de Gmail
 */
export const GmailOfficialLogo: React.FC<LogoProps> = ({ className = 'w-5 h-5', size }) => (
  <svg
    viewBox="0 0 24 24"
    width={size || 20}
    height={size || 20}
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73l-6.545 4.91-6.545-4.91v9.272H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L12 9.49l8.073-6c1.618-1.214 3.927-.059 3.927 1.964z"
      fill="#EA4335"
    />
    <path
      d="M0 5.455c0-.853.486-1.623 1.25-1.983L12 9.49 1.25 1.438C.486 1.798 0 2.568 0 3.42v2.035z"
      fill="#C5221F"
    />
    <path
      d="M24 5.455v-2.036c0-.852-.486-1.622-1.25-1.982L12 9.49l10.75-8.052c.764.36 1.25 1.13 1.25 1.982z"
      fill="#C5221F"
    />
  </svg>
);

/**
 * Logo Oficial de Microsoft 365 / Outlook
 */
export const OutlookOfficialLogo: React.FC<LogoProps> = ({ className = 'w-5 h-5', size }) => (
  <svg
    viewBox="0 0 24 24"
    width={size || 20}
    height={size || 20}
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M1 1h10v10H1z" fill="#F25022" />
    <path d="M13 1h10v10H13z" fill="#7FBA00" />
    <path d="M1 13h10v10H1z" fill="#00A4EF" />
    <path d="M13 13h10v10H13z" fill="#FFB900" />
  </svg>
);

/**
 * Logo Oficial de Yahoo Mail
 */
export const YahooOfficialLogo: React.FC<LogoProps> = ({ className = 'w-5 h-5', size }) => (
  <svg
    viewBox="0 0 24 24"
    width={size || 20}
    height={size || 20}
    className={className}
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.87 6.13l-2.42 5.09v4.28h-2.9v-4.28L8.13 8.13h3.04l1.19 3.01 1.22-3.01h2.29z"
      fill="#6001D2"
    />
  </svg>
);

/**
 * Logo Oficial de Apple iCloud
 */
export const AppleICloudOfficialLogo: React.FC<LogoProps> = ({ className = 'w-5 h-5', size }) => (
  <svg
    viewBox="0 0 24 24"
    width={size || 20}
    height={size || 20}
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"
      fill="#3B99FC"
    />
    <path
      d="M12 8c2.21 0 4 1.79 4 4 0 .34-.05.67-.13.98.04.01.09.02.13.02 1.66 0 3 1.34 3 3 0 1.66-1.34 3-3 3H6c-2.21 0-4-1.79-4-4 0-2.05 1.53-3.76 3.53-3.98C6.39 9.39 7.97 8 10 8c.7 0 1.35.18 1.93.5.02-.17.07-.33.07-.5 0-2.21 1.79-4 4-4z"
      fill="#5AC8FA"
      opacity="0.9"
    />
  </svg>
);

/**
 * Logo Oficial de Zoho Mail
 */
export const ZohoOfficialLogo: React.FC<LogoProps> = ({ className = 'w-5 h-5', size }) => (
  <svg
    viewBox="0 0 24 24"
    width={size || 20}
    height={size || 20}
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="2" y="2" width="9" height="9" rx="2" fill="#E42528" />
    <rect x="13" y="2" width="9" height="9" rx="2" fill="#226AB4" />
    <rect x="2" y="13" width="9" height="9" rx="2" fill="#439539" />
    <rect x="13" y="13" width="9" height="9" rx="2" fill="#F8B122" />
  </svg>
);

/**
 * Logo para Servidor Propio Institucional (POP3/IMAP)
 */
export const CustomServerOfficialLogo: React.FC<LogoProps> = ({ className = 'w-5 h-5', size }) => (
  <svg
    viewBox="0 0 24 24"
    width={size || 20}
    height={size || 20}
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="2" y="3" width="20" height="7" rx="2" fill="#0F2744" stroke="#1E5285" strokeWidth="1.5" />
    <circle cx="6" cy="6.5" r="1.2" fill="#10B981" />
    <circle cx="10" cy="6.5" r="1.2" fill="#3B82F6" />
    <path d="M15 6.5h3" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
    <rect x="2" y="14" width="20" height="7" rx="2" fill="#0F2744" stroke="#1E5285" strokeWidth="1.5" />
    <circle cx="6" cy="17.5" r="1.2" fill="#10B981" />
    <circle cx="10" cy="17.5" r="1.2" fill="#F59E0B" />
    <path d="M15 17.5h3" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);
