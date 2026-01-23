import React, { useState, useRef } from 'react';
import { MoreHorizontal, X } from 'lucide-react';

/**
 * Mobile Navigation Component
 * Bottom tab bar for phone screens with overflow handling
 *
 * @param {Object} props
 * @param {Array} props.tabs - All tab definitions
 * @param {string} props.activeTab - Currently active tab ID
 * @param {Function} props.onTabChange - Tab change callback
 * @param {number} [props.maxVisible=4] - Max visible tabs before "More"
 */
export function MobileNav({ tabs, activeTab, onTabChange, maxVisible = 4 }) {
  const [showMore, setShowMore] = useState(false);
  const moreButtonRef = useRef(null);

  // Split tabs into visible and overflow
  const visibleTabs = tabs.slice(0, maxVisible);
  const overflowTabs = tabs.slice(maxVisible);
  const hasOverflow = overflowTabs.length > 0;

  // Check if active tab is in overflow
  const activeInOverflow = overflowTabs.some(t => t.id === activeTab);

  const handleTabClick = (tabId) => {
    onTabChange(tabId);
    setShowMore(false);
  };

  const handleMoreClick = () => {
    setShowMore(prev => !prev);
  };

  // Close more menu on escape
  const handleKeyDown = (e) => {
    if (e.key === 'Escape' && showMore) {
      setShowMore(false);
      moreButtonRef.current?.focus();
    }
  };

  return (
    <>
      {/* Bottom Navigation Bar */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-50 safe-bottom"
        aria-label="Main navigation"
        onKeyDown={handleKeyDown}
      >
        <div
          role="tablist"
          className="flex justify-around items-center px-2 py-1"
        >
          {visibleTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                role="tab"
                id={`mobile-tab-${tab.id}`}
                aria-selected={isActive}
                aria-controls={`panel-${tab.id}`}
                onClick={() => handleTabClick(tab.id)}
                className={`
                  flex flex-col items-center justify-center
                  min-w-[64px] min-h-touch
                  px-2 py-1.5
                  rounded-lg
                  transition-colors
                  focus-ring
                  ${isActive
                    ? 'text-primary-700'
                    : 'text-gray-500'
                  }
                `}
              >
                {Icon && <Icon size={20} aria-hidden="true" />}
                <span className="text-xs mt-0.5 font-medium">
                  {tab.shortLabel || tab.label}
                </span>
              </button>
            );
          })}

          {/* More button */}
          {hasOverflow && (
            <button
              ref={moreButtonRef}
              onClick={handleMoreClick}
              aria-expanded={showMore}
              aria-haspopup="true"
              className={`
                flex flex-col items-center justify-center
                min-w-[64px] min-h-touch
                px-2 py-1.5
                rounded-lg
                transition-colors
                focus-ring
                ${activeInOverflow || showMore
                  ? 'text-primary-700'
                  : 'text-gray-500'
                }
              `}
            >
              {showMore ? (
                <X size={20} aria-hidden="true" />
              ) : (
                <MoreHorizontal size={20} aria-hidden="true" />
              )}
              <span className="text-xs mt-0.5 font-medium">More</span>
            </button>
          )}
        </div>
      </nav>

      {/* Overflow Sheet */}
      {showMore && hasOverflow && (
        <>
          {/* Backdrop */}
          <div
            className="md:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowMore(false)}
            aria-hidden="true"
          />

          {/* Sheet */}
          <div
            className="md:hidden fixed bottom-16 left-0 right-0 bg-white rounded-t-2xl z-50 shadow-xl"
            role="menu"
            aria-label="More navigation options"
          >
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-500 mb-3">
                More Options
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {overflowTabs.map((tab) => {
                  const isActive = activeTab === tab.id;
                  const Icon = tab.icon;

                  return (
                    <button
                      key={tab.id}
                      role="menuitem"
                      onClick={() => handleTabClick(tab.id)}
                      className={`
                        flex flex-col items-center justify-center
                        p-3 rounded-lg
                        transition-colors
                        focus-ring
                        ${isActive
                          ? 'bg-primary-100 text-primary-700'
                          : 'text-gray-600 hover:bg-gray-100'
                        }
                      `}
                    >
                      {Icon && <Icon size={24} aria-hidden="true" />}
                      <span className="text-xs mt-1 font-medium">
                        {tab.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Spacer to prevent content from being hidden behind nav */}
      <div className="md:hidden h-16" aria-hidden="true" />
    </>
  );
}

export default MobileNav;
