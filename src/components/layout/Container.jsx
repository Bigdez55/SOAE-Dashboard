import React from 'react';

/**
 * Container Component
 * Main content container with max-width and padding
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Container content
 * @param {string} [props.className] - Additional CSS classes
 * @param {boolean} [props.narrow] - Use narrower max-width
 */
export function Container({ children, className = '', narrow = false }) {
  return (
    <div
      className={`
        mx-auto px-3 sm:px-4 lg:px-6
        ${narrow ? 'max-w-4xl' : 'max-w-content'}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

/**
 * Card Container Component
 * White card with padding and shadow
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Card content
 * @param {string} [props.className] - Additional CSS classes
 */
export function Card({ children, className = '' }) {
  return (
    <div
      className={`
        bg-white rounded-lg sm:rounded-xl
        p-3 sm:p-4 lg:p-6
        shadow-sm
        ${className}
      `}
    >
      {children}
    </div>
  );
}

/**
 * Page Section Component
 * Vertical section with consistent spacing
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Section content
 * @param {string} [props.className] - Additional CSS classes
 */
export function Section({ children, className = '' }) {
  return (
    <section className={`space-y-4 sm:space-y-6 ${className}`}>
      {children}
    </section>
  );
}

/**
 * Grid Component
 * Responsive grid with predefined column configurations
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Grid items
 * @param {string} [props.cols='auto'] - Column configuration
 * @param {string} [props.gap='4'] - Gap size
 * @param {string} [props.className] - Additional CSS classes
 */
export function Grid({ children, cols = 'auto', gap = '4', className = '' }) {
  const colsConfig = {
    '1': 'grid-cols-1',
    '2': 'grid-cols-1 sm:grid-cols-2',
    '3': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    '4': 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
    '6': 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6',
    'auto': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
  };

  const gapConfig = {
    '2': 'gap-2',
    '3': 'gap-3',
    '4': 'gap-3 sm:gap-4',
    '6': 'gap-4 sm:gap-6'
  };

  return (
    <div
      className={`
        grid
        ${colsConfig[cols] || colsConfig.auto}
        ${gapConfig[gap] || gapConfig['4']}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

export default Container;
