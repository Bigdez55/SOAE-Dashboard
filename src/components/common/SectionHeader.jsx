import React from 'react';

/**
 * Section Header Component
 * Displays a titled section header with optional icon and subtitle
 *
 * @param {Object} props
 * @param {string} props.title - Section title
 * @param {string} [props.subtitle] - Optional subtitle
 * @param {React.ComponentType} [props.icon] - Lucide icon component
 * @param {string} [props.iconBg='bg-primary-100'] - Icon background color
 * @param {string} [props.iconColor='text-primary-700'] - Icon color
 * @param {React.ReactNode} [props.action] - Optional action element (button, link)
 * @param {string} [props.className] - Additional CSS classes
 */
export function SectionHeader({
  title,
  subtitle,
  icon: Icon,
  iconBg = 'bg-primary-100',
  iconColor = 'text-primary-700',
  action,
  className = ''
}) {
  return (
    <div className={`flex items-center justify-between mb-4 ${className}`}>
      <div className="flex items-center gap-3">
        {Icon && (
          <div
            className={`p-2 rounded-lg ${iconBg}`}
            aria-hidden="true"
          >
            <Icon size={20} className={iconColor} />
          </div>
        )}
        <div>
          <h3 className="font-bold text-base sm:text-lg text-gray-900">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs sm:text-sm text-gray-500">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {action && (
        <div className="flex-shrink-0">
          {action}
        </div>
      )}
    </div>
  );
}

export default SectionHeader;
