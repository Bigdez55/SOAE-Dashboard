import React from 'react';

/**
 * Status badge configurations
 */
const statusConfig = {
  success: {
    bg: 'bg-success-100',
    text: 'text-success-700',
    label: 'Success'
  },
  warning: {
    bg: 'bg-warning-100',
    text: 'text-warning-700',
    label: 'Warning'
  },
  danger: {
    bg: 'bg-danger-100',
    text: 'text-danger-700',
    label: 'Danger'
  },
  info: {
    bg: 'bg-info-100',
    text: 'text-info-700',
    label: 'Info'
  },
  neutral: {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    label: 'Neutral'
  },
  // Semantic statuses
  ontime: {
    bg: 'bg-success-100',
    text: 'text-success-700',
    label: 'On Time'
  },
  late: {
    bg: 'bg-danger-100',
    text: 'text-danger-700',
    label: 'Late'
  },
  missing: {
    bg: 'bg-danger-100',
    text: 'text-danger-700',
    label: 'Missing'
  },
  matched: {
    bg: 'bg-success-100',
    text: 'text-success-700',
    label: 'Matched'
  },
  review: {
    bg: 'bg-warning-100',
    text: 'text-warning-700',
    label: 'Needs Review'
  }
};

/**
 * Status Badge Component
 * Displays a colored badge with status text
 *
 * @param {Object} props
 * @param {string} props.status - Status type (success, warning, danger, etc.)
 * @param {string} [props.text] - Custom text (defaults to status label)
 * @param {string} [props.size='sm'] - Size variant: 'xs', 'sm', 'md'
 * @param {string} [props.className] - Additional CSS classes
 */
export function StatusBadge({
  status,
  text,
  size = 'sm',
  className = ''
}) {
  const config = statusConfig[status] || statusConfig.neutral;
  const displayText = text || config.label;

  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-xs',
    sm: 'px-2 py-0.5 text-xs sm:text-sm',
    md: 'px-2.5 py-1 text-sm'
  };

  return (
    <span
      className={`
        inline-flex items-center
        rounded-full font-medium
        ${config.bg} ${config.text}
        ${sizeClasses[size] || sizeClasses.sm}
        ${className}
      `}
      role="status"
    >
      {/* Visual indicator for accessibility */}
      <span className="sr-only">Status: </span>
      {displayText}
    </span>
  );
}

export default StatusBadge;
