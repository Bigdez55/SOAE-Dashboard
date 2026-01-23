import React, { useRef } from 'react';
import { Clock, RefreshCw, Upload } from 'lucide-react';

/**
 * Header Component
 * Main application header with branding and refresh controls
 *
 * @param {Object} props
 * @param {Date} [props.lastRefresh] - Last refresh timestamp
 * @param {Function} [props.onRefresh] - Refresh callback
 * @param {boolean} [props.loading] - Loading state
 */
export function Header({ lastRefresh, onRefresh, loading, onLoadCsv, dataSourceLabel }) {
  const fileInputRef = useRef(null);

  const formatTime = (date) => {
    if (!date) return '-';
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const handleFileChange = (event) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      onLoadCsv?.(files);
      event.target.value = '';
    }
  };

  return (
    <header className="bg-gradient-to-r from-primary-900 to-primary-700 text-white safe-top">
      <div className="max-w-content mx-auto px-4 py-3 sm:py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          {/* Branding */}
          <div>
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold">
              VTA Paratransit SOAE Compliance Dashboard
            </h1>
            <p className="text-primary-200 text-xs sm:text-sm">
              24-Hour Reporting Rule &bull; $5,000 + $100/day LD
            </p>
          </div>

          {/* Refresh controls */}
          <div className="flex flex-wrap items-center gap-3 text-sm text-primary-200">
            <div className="flex items-center gap-1.5">
              <Clock size={14} aria-hidden="true" />
              <span className="hidden xs:inline">Last refresh:</span>
              <span>{formatTime(lastRefresh)}</span>
            </div>

            {dataSourceLabel && (
              <div className="text-xs sm:text-sm">
                <span className="hidden xs:inline">Source:</span>{' '}
                <span className="font-medium text-white">{dataSourceLabel}</span>
              </div>
            )}

            {onLoadCsv && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.eml"
                  multiple
                  onChange={handleFileChange}
                  className="sr-only"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="
                    px-3 py-2 rounded-lg
                    bg-white/10 hover:bg-white/20
                    focus-ring
                    transition-colors
                    min-w-touch min-h-touch
                    flex items-center gap-2
                  "
                  aria-label="Load report files"
                >
                  <Upload size={16} aria-hidden="true" />
                  <span className="text-sm">Load Reports</span>
                </button>
              </>
            )}

            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={loading}
                className="
                  p-2 rounded-lg
                  hover:bg-white/10 focus-ring
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-colors
                  min-w-touch min-h-touch
                  flex items-center justify-center
                "
                aria-label="Refresh data"
              >
                <RefreshCw
                  size={16}
                  className={loading ? 'animate-spin' : ''}
                  aria-hidden="true"
                />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
