import React, { useState, useEffect } from 'react';
import './FilterSidebar.css';

const FilterSidebar = ({ products, onFilterChange }) => {
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];

  const priceRanges = [
    { label: 'Under ₹1000', min: 0, max: 1000 },
    { label: '₹1000 - ₹2000', min: 1000, max: 2000 },
    { label: '₹2000 - ₹5000', min: 2000, max: 5000 },
    { label: 'Above ₹5000', min: 5000, max: Infinity }
  ];

  useEffect(() => {
    applyFilters();
  }, [priceRange, selectedCategories, searchQuery, sortBy]);

  const applyFilters = () => {
    let filtered = [...products];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        (p.title && p.title.toLowerCase().includes(query)) ||
        (p.description && p.description.toLowerCase().includes(query)) ||
        (p.category && p.category.toLowerCase().includes(query))
      );
    }

    if (selectedCategories.length > 0) {
      filtered = filtered.filter(p => selectedCategories.includes(p.category));
    }

    if (priceRange.min || priceRange.max) {
      filtered = filtered.filter(p => {
        const price = Number(p.price);
        const min = priceRange.min ? Number(priceRange.min) : 0;
        const max = priceRange.max ? Number(priceRange.max) : Infinity;
        return price >= min && price <= max;
      });
    }

    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price-high':
        filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'name':
        filtered.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        break;
      default:
        break;
    }

    onFilterChange(filtered);
  };

  const handleCategoryToggle = (category) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handlePriceRangeSelect = (min, max) => {
    setPriceRange({ min: min === 0 ? '' : min, max: max === Infinity ? '' : max });
  };

  const clearFilters = () => {
    setPriceRange({ min: '', max: '' });
    setSelectedCategories([]);
    setSearchQuery('');
    setSortBy('newest');
  };

  return (
    <aside className="filter-sidebar">
      <div className="filter-header">
        <h2>Filters</h2>
        <button onClick={clearFilters} className="clear-btn">
          Clear All
        </button>
      </div>

      <div className="filter-section">
        <h3>Search</h3>
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="filter-section">
        <h3>Sort By</h3>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="sort-select"
        >
          <option value="newest">Newest First</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="name">Name: A to Z</option>
        </select>
      </div>

      {categories.length > 0 && (
        <div className="filter-section">
          <h3>Categories</h3>
          <div className="filter-options">
            {categories.map(category => (
              <label key={category} className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category)}
                  onChange={() => handleCategoryToggle(category)}
                />
                <span>{category}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="filter-section">
        <h3>Price Range</h3>
        <div className="filter-options">
          {priceRanges.map((range, idx) => (
            <button
              key={idx}
              onClick={() => handlePriceRangeSelect(range.min, range.max)}
              className={`price-range-btn ${
                priceRange.min === (range.min === 0 ? '' : range.min) &&
                priceRange.max === (range.max === Infinity ? '' : range.max)
                  ? 'active'
                  : ''
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
        <div className="custom-range">
          <input
            type="number"
            placeholder="Min"
            value={priceRange.min}
            onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
            className="range-input"
          />
          <span>-</span>
          <input
            type="number"
            placeholder="Max"
            value={priceRange.max}
            onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
            className="range-input"
          />
        </div>
      </div>
    </aside>
  );
};

export default FilterSidebar;
