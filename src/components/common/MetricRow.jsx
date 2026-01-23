import React from 'react';

/**
 * Metric Row Component
 * Simple two-column display for label/value pairs
 *
 * @param {Object} props
 * @param {string} props.label - Metric label
 * @param {string|number} props.value - Metric value
 * @param {boolean} [props.highlight] - Highlight row with warning style
 * @param {string} [props.className] - Additional CSS classes
 */
export function MetricRow({ label, value, highlight = false, className = '' }) {
  return (
    <div
      className={`
        flex justify-between items-center py-2 px-3
        ${highlight ? 'bg-warning-50 rounded-md' : ''}
        ${className}
      `}
    >
      <span className="text-sm text-gray-600">
        {label}
      </span>
      <span
        className={`
          text-sm font-medium
          ${highlight ? 'text-danger-700' : 'text-gray-900'}
        `}
      >
        {value}
      </span>
    </div>
  );
}

/**
 * Metric Group Component
 * Container for multiple MetricRow components
 *
 * @param {Object} props
 * @param {string} [props.title] - Optional group title
 * @param {React.ReactNode} props.children - MetricRow children
 * @param {string} [props.className] - Additional CSS classes
 */
export function MetricGroup({ title, children, className = '' }) {
  return (
    <div className={`divide-y divide-gray-100 ${className}`}>
      {title && (
        <h4 className="text-sm font-medium text-gray-700 pb-2 mb-2">
          {title}
        </h4>
      )}
      {children}
    </div>
  );
}

export default MetricRow;
