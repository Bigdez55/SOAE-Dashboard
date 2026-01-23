import React, { useState, useId } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

/**
 * Collapsible Section Component
 * Expandable section with count badge and LD exposure
 *
 * @param {Object} props
 * @param {string} props.title - Section title
 * @param {number} [props.count] - Item count to display in badge
 * @param {number} [props.ld] - Liquidated damages amount
 * @param {React.ReactNode} props.children - Section content
 * @param {boolean} [props.defaultOpen=false] - Initial expanded state
 * @param {string} [props.className] - Additional CSS classes
 */
export function CollapsibleSection({
  title,
  count,
  ld,
  children,
  defaultOpen = false,
  className = ''
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const contentId = useId();
  const headerId = useId();

  const handleToggle = () => {
    setIsOpen(prev => !prev);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggle();
    }
  };

  return (
    <div className={`border rounded-lg overflow-hidden ${className}`}>
      {/* Header - Accessible button */}
      <button
        id={headerId}
        type="button"
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        aria-expanded={isOpen}
        aria-controls={contentId}
        className="
          w-full flex items-center justify-between
          p-3 sm:p-4
          bg-gray-50 hover:bg-gray-100
          focus-ring
          text-left
          transition-colors
          min-h-touch
        "
      >
        <div className="flex items-center gap-3">
          {isOpen ? (
            <ChevronDown size={18} className="text-gray-500 flex-shrink-0" aria-hidden="true" />
          ) : (
            <ChevronRight size={18} className="text-gray-500 flex-shrink-0" aria-hidden="true" />
          )}

          <span className="font-medium text-gray-900 text-sm sm:text-base">
            {title}
          </span>

          {count !== undefined && count !== null && (
            <span
              className="
                bg-danger-100 text-danger-700
                px-2 py-0.5 rounded-full
                text-xs font-medium
              "
              aria-label={`${count} items`}
            >
              {count}
            </span>
          )}
        </div>

        {ld !== undefined && ld !== null && ld > 0 && (
          <span
            className="font-bold text-danger-700 text-sm sm:text-base"
            aria-label={`Liquidated damages: ${formatCurrency(ld)}`}
          >
            {formatCurrency(ld)}
          </span>
        )}
      </button>

      {/* Content panel */}
      <div
        id={contentId}
        role="region"
        aria-labelledby={headerId}
        hidden={!isOpen}
        className={`
          border-t transition-all
          ${isOpen ? 'p-3 sm:p-4' : 'h-0 p-0 overflow-hidden'}
        `}
      >
        {isOpen && children}
      </div>
    </div>
  );
}

export default CollapsibleSection;
