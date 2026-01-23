import React, { useRef, useEffect } from 'react';

/**
 * Desktop Navigation Component
 * Top navigation bar for tablet and desktop screens
 *
 * @param {Object} props
 * @param {Array} props.tabs - Tab definitions
 * @param {string} props.tabs[].id - Tab identifier
 * @param {string} props.tabs[].label - Tab label
 * @param {React.ComponentType} props.tabs[].icon - Tab icon
 * @param {string} props.activeTab - Currently active tab ID
 * @param {Function} props.onTabChange - Tab change callback
 */
export function Navigation({ tabs, activeTab, onTabChange }) {
  const tabListRef = useRef(null);
  const tabRefs = useRef({});

  // Keyboard navigation within tab list
  const handleKeyDown = (e, currentIndex) => {
    const tabIds = tabs.map(t => t.id);

    let newIndex = currentIndex;

    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        newIndex = (currentIndex + 1) % tabs.length;
        break;
      case 'ArrowLeft':
        e.preventDefault();
        newIndex = (currentIndex - 1 + tabs.length) % tabs.length;
        break;
      case 'Home':
        e.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        newIndex = tabs.length - 1;
        break;
      default:
        return;
    }

    const newTabId = tabIds[newIndex];
    onTabChange(newTabId);
    tabRefs.current[newTabId]?.focus();
  };

  return (
    <nav
      className="hidden md:block bg-white border-b sticky top-0 z-40"
      aria-label="Dashboard sections"
    >
      <div className="max-w-content mx-auto px-4">
        <div
          role="tablist"
          ref={tabListRef}
          className="flex gap-1 overflow-x-auto scrollbar-hide py-2"
        >
          {tabs.map((tab, index) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                ref={el => tabRefs.current[tab.id] = el}
                role="tab"
                id={`tab-${tab.id}`}
                aria-selected={isActive}
                aria-controls={`panel-${tab.id}`}
                tabIndex={isActive ? 0 : -1}
                onClick={() => onTabChange(tab.id)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className={`
                  flex items-center gap-2
                  px-3 lg:px-4 py-2
                  rounded-lg
                  text-sm font-medium
                  whitespace-nowrap
                  transition-colors
                  focus-ring
                  ${isActive
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }
                `}
              >
                {Icon && <Icon size={16} aria-hidden="true" />}
                <span className="hidden lg:inline">{tab.label}</span>
                <span className="lg:hidden">{tab.shortLabel || tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
