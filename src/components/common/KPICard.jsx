import React from 'react';

/**
 * Color scheme configurations
 */
const colorSchemes = {
  blue: {
    border: 'border-l-primary-500',
    bg: 'bg-primary-50',
    text: 'text-primary-700',
    icon: 'text-primary-600'
  },
  green: {
    border: 'border-l-success-500',
    bg: 'bg-success-50',
    text: 'text-success-700',
    icon: 'text-success-600'
  },
  red: {
    border: 'border-l-danger-500',
    bg: 'bg-danger-50',
    text: 'text-danger-700',
    icon: 'text-danger-600'
  },
  orange: {
    border: 'border-l-warning-500',
    bg: 'bg-warning-50',
    text: 'text-warning-700',
    icon: 'text-warning-600'
  },
  yellow: {
    border: 'border-l-yellow-500',
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    icon: 'text-yellow-600'
  },
  purple: {
    border: 'border-l-purple-500',
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    icon: 'text-purple-600'
  },
  cyan: {
    border: 'border-l-info-500',
    bg: 'bg-info-50',
    text: 'text-info-700',
    icon: 'text-info-600'
  },
  gray: {
    border: 'border-l-gray-500',
    bg: 'bg-gray-50',
    text: 'text-gray-700',
    icon: 'text-gray-600'
  }
};

/**
 * KPI Card Component
 * Displays a key performance indicator with icon, value, and optional trend
 *
 * @param {Object} props
 * @param {string} props.label - KPI label
 * @param {string|number} props.value - Main value to display
 * @param {string} [props.subValue] - Secondary value or description
 * @param {React.ComponentType} [props.icon] - Lucide icon component
 * @param {string} [props.color='blue'] - Color scheme
 * @param {number} [props.trend] - Trend percentage (positive = up/bad, negative = down/good)
 * @param {string} [props.ariaLabel] - Custom aria-label
 */
export function KPICard({
  label,
  value,
  subValue,
  icon: Icon,
  color = 'blue',
  trend,
  ariaLabel
}) {
  const scheme = colorSchemes[color] || colorSchemes.blue;
  const accessibleLabel = ariaLabel || `${label}: ${value}${subValue ? `, ${subValue}` : ''}`;

  return (
    <div
      role="region"
      aria-label={accessibleLabel}
      className={`
        rounded-lg border-l-4 shadow-sm card-hover
        p-3 sm:p-4
        ${scheme.border} ${scheme.bg}
      `}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs sm:text-sm text-gray-600 uppercase font-medium tracking-wide">
          {label}
        </p>
        {Icon && (
          <Icon
            size={16}
            className={`${scheme.icon} hidden xs:block sm:w-5 sm:h-5`}
            aria-hidden="true"
          />
        )}
      </div>

      <p className={`text-xl sm:text-2xl lg:text-3xl font-bold mt-1 ${scheme.text}`}>
        {value}
      </p>

      {subValue && (
        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
          {subValue}
        </p>
      )}

      {trend !== undefined && trend !== null && (
        <p
          className={`text-xs sm:text-sm mt-1 font-medium ${
            trend > 0 ? 'text-danger-600' : 'text-success-600'
          }`}
          aria-label={`Trend: ${trend > 0 ? 'up' : 'down'} ${Math.abs(trend)} percent`}
        >
          <span aria-hidden="true">{trend > 0 ? '↑' : '↓'}</span>
          {' '}{Math.abs(trend)}%
          <span className="sr-only">
            {trend > 0 ? ' increase' : ' decrease'}
          </span>
        </p>
      )}
    </div>
  );
}

export default KPICard;
