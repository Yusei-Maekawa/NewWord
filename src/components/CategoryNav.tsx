import React from 'react';
import { getCategoryName } from '../utils/helpers';

interface CategoryNavProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

const categories = ['all', 'english', 'applied', 'advanced', 'gkentei'];

const CategoryNav: React.FC<CategoryNavProps> = ({ activeCategory, onCategoryChange }) => {
  return (
    <nav className="category-nav">
      {categories.map(category => (
        <button
          key={category}
          className={`category-btn ${activeCategory === category ? 'active' : ''}`}
          onClick={() => onCategoryChange(category)}
        >
          {getCategoryName(category)}
        </button>
      ))}
    </nav>
  );
};

export default CategoryNav;
