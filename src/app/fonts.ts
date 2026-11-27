import localFont from 'next/font/local';

export const plusJakartaSans = localFont({
  src: '../../public/fonts/plus-jakarta-sans-latin.woff2',
  weight: '300 800',
  style: 'normal',
  display: 'swap',
  preload: true,
  variable: '--font-plus-jakarta',
  fallback: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
});

export const jetbrainsMono = localFont({
  src: '../../public/fonts/jetbrains-mono-latin.woff2',
  weight: '400 700',
  style: 'normal',
  display: 'swap',
  preload: false,
  variable: '--font-jetbrains-mono',
  fallback: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
});

export const poppins = localFont({
  src: [
    {
      path: '../../public/fonts/poppins-600-latin.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../../public/fonts/poppins-700-latin.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  display: 'swap',
  preload: false,
  variable: '--font-poppins',
  fallback: ['ui-sans-serif', 'system-ui', 'sans-serif'],
});
