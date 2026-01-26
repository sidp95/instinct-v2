import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { categoryColors } from '../data/markets';

const ALL_CATEGORIES = ['Crypto', 'Sports', 'Politics', 'Finance', 'Tech', 'Culture', 'Other'];

/**
 * Category filter component - matches HistoryPage FilterBar styling exactly.
 * @param {Set} selectedCategories - Set of currently selected category names
 * @param {function} onToggle - Called with category name when toggled
 * @param {Array} availableCategories - Optional: categories that exist in current markets
 */
export default function CategoryFilter({ selectedCategories, onToggle, availableCategories }) {
  const { colors } = useTheme();

  // Use available categories if provided, otherwise show all
  const categories = availableCategories && availableCategories.length > 0
    ? ALL_CATEGORIES.filter(cat => availableCategories.includes(cat))
    : ALL_CATEGORIES;

  const allSelected = categories.every(cat => selectedCategories.has(cat));

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

  // Match HistoryPage FilterBar styling exactly
  const getCategoryStyle = (category, isSelected) => {
    if (isSelected) {
      return {
        backgroundColor: colors.border,
        color: '#fff',
      };
    }
    // Category gets its badge color when unselected
    return {
      backgroundColor: categoryColors[category] || colors.backgroundSecondary,
      color: '#222',
    };
  };

  const getAllStyle = (isSelected) => {
    if (isSelected) {
      return {
        backgroundColor: colors.border,
        color: '#fff',
      };
    }
    return {
      backgroundColor: colors.backgroundSecondary,
      color: colors.text,
    };
  };

  return (
    <div className="px-4 py-2">
      <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
        {/* All button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleToggleAll}
          className="px-3 py-1.5 rounded-full font-bold text-sm border-2 whitespace-nowrap transition-all flex-shrink-0"
          style={{
            ...getAllStyle(allSelected),
            borderColor: colors.border,
            boxShadow: allSelected ? 'none' : `1px 1px 0 ${colors.border}`,
          }}
        >
          All
        </motion.button>

        {/* Category pills */}
        {categories.map(category => {
          const isSelected = selectedCategories.has(category);
          const style = getCategoryStyle(category, isSelected);

          return (
            <motion.button
              key={category}
              whileTap={{ scale: 0.95 }}
              onClick={() => onToggle(category)}
              className="px-3 py-1.5 rounded-full font-bold text-sm border-2 whitespace-nowrap transition-all flex-shrink-0"
              style={{
                ...style,
                borderColor: colors.border,
                boxShadow: isSelected ? 'none' : `1px 1px 0 ${colors.border}`,
              }}
            >
              {category}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
