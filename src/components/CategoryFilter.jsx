import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { categoryColors } from '../data/markets';

const ALL_CATEGORIES = ['Crypto', 'Sports', 'Politics', 'Finance', 'Tech', 'Culture', 'Other'];

/**
 * Category filter dropdown component
 * @param {Set} selectedCategories - Set of currently selected category names
 * @param {function} onToggle - Called with category name when toggled
 * @param {Array} availableCategories - Optional: categories that exist in current markets
 */
export default function CategoryFilter({ selectedCategories, onToggle, availableCategories }) {
  const { colors, isDark } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Use available categories if provided, otherwise show all
  const categories = availableCategories && availableCategories.length > 0
    ? ALL_CATEGORIES.filter(cat => availableCategories.includes(cat))
    : ALL_CATEGORIES;

  const allSelected = categories.every(cat => selectedCategories.has(cat));
  const selectedCount = categories.filter(cat => selectedCategories.has(cat)).length;
  const hasFilter = !allSelected;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  const handleToggleAll = () => {
    if (allSelected) {
      // Deselect all except first category
      categories.forEach((cat, idx) => {
        if (idx > 0 && selectedCategories.has(cat)) {
          onToggle(cat);
        }
      });
    } else {
      // Select all
      categories.forEach(cat => {
        if (!selectedCategories.has(cat)) {
          onToggle(cat);
        }
      });
    }
  };

  const handleClear = () => {
    // Select all categories
    categories.forEach(cat => {
      if (!selectedCategories.has(cat)) {
        onToggle(cat);
      }
    });
  };

  const handleApply = () => {
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative', zIndex: 100 }}>
      {/* Filter Button */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg font-bold text-sm border-2"
        style={{
          backgroundColor: hasFilter ? colors.border : colors.paper,
          color: hasFilter ? '#fff' : colors.text,
          borderColor: colors.border,
          boxShadow: isOpen ? 'none' : `2px 2px 0 ${colors.border}`,
          transform: isOpen ? 'translate(2px, 2px)' : 'none',
        }}
      >
        {/* Filter Icon */}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
        </svg>
        Filter
        {hasFilter && (
          <span
            style={{
              backgroundColor: '#fff',
              color: colors.border,
              borderRadius: '9999px',
              padding: '0 6px',
              fontSize: '11px',
              fontWeight: 'bold',
              minWidth: '18px',
              textAlign: 'center',
            }}
          >
            {selectedCount}
          </span>
        )}
        {/* Chevron */}
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute',
              top: '100%',
              left: '16px',
              marginTop: '4px',
              backgroundColor: colors.paper,
              border: `3px solid ${colors.border}`,
              borderRadius: '12px',
              boxShadow: `4px 4px 0 ${colors.border}`,
              minWidth: '200px',
              overflow: 'hidden',
            }}
          >
            {/* All checkbox */}
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 12px',
                cursor: 'pointer',
                borderBottom: `2px solid ${colors.backgroundSecondary}`,
                backgroundColor: allSelected ? (isDark ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.1)') : 'transparent',
              }}
              onClick={handleToggleAll}
            >
              <div
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '4px',
                  border: `2px solid ${colors.border}`,
                  backgroundColor: allSelected ? '#22c55e' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {allSelected && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
              <span style={{ fontWeight: 'bold', fontSize: '14px', color: colors.text }}>
                All Categories
              </span>
            </label>

            {/* Category checkboxes */}
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {categories.map(category => {
                const isSelected = selectedCategories.has(category);
                const catColor = categoryColors[category] || '#888';

                return (
                  <label
                    key={category}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 12px',
                      cursor: 'pointer',
                      backgroundColor: isSelected ? (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)') : 'transparent',
                    }}
                    onClick={() => onToggle(category)}
                  >
                    <div
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '4px',
                        border: `2px solid ${colors.border}`,
                        backgroundColor: isSelected ? catColor : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {isSelected && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                    <span style={{ fontSize: '14px', color: colors.text }}>
                      {category}
                    </span>
                    <div
                      style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        backgroundColor: catColor,
                        marginLeft: 'auto',
                        flexShrink: 0,
                      }}
                    />
                  </label>
                );
              })}
            </div>

            {/* Action buttons */}
            <div
              style={{
                display: 'flex',
                gap: '8px',
                padding: '10px 12px',
                borderTop: `2px solid ${colors.backgroundSecondary}`,
              }}
            >
              <button
                onClick={handleClear}
                style={{
                  flex: 1,
                  padding: '8px',
                  backgroundColor: colors.backgroundSecondary,
                  color: colors.text,
                  border: `2px solid ${colors.border}`,
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                }}
              >
                Clear
              </button>
              <button
                onClick={handleApply}
                style={{
                  flex: 1,
                  padding: '8px',
                  backgroundColor: colors.border,
                  color: '#fff',
                  border: `2px solid ${colors.border}`,
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                }}
              >
                Apply
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
