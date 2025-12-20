import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import FilterSidebar from './FilterSidebar';
import { productService } from '../services/api';
import './ProductList.css';

const ProductList = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await productService.getAllProducts();

      if (response.success) {
        setAllProducts(response.data);
        setFilteredProducts(response.data);
      } else {
        setError('Failed to fetch products');
      }
    } catch (error) {
      setError(error.message || 'Failed to fetch products');
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filtered) => {
    setFilteredProducts(filtered);
  };

  const handleRetry = () => {
    fetchProducts();
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">
          <h3>Error Loading Products</h3>
          <p>{error}</p>
          <button onClick={handleRetry} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!allProducts || allProducts.length === 0) {
    return (
      <div className="empty-container">
        <div className="empty-message">
          <h3>No Products Found</h3>
          <p>No products are available in the catalog at the moment.</p>
          <button onClick={handleRetry} className="retry-btn">
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <FilterSidebar products={allProducts} onFilterChange={handleFilterChange} />
      <div className="product-list-container">
        <div className="product-list-header">
          <h2>Our Collection</h2>
          <div className="product-count">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'Product' : 'Products'}
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="no-results">
            <h3>No products match your filters</h3>
            <p>Try adjusting your search criteria</p>
          </div>
        ) : (
          <div className="product-grid">
            {filteredProducts.map((product, index) => (
              <ProductCard
                key={product._id || index}
                product={product}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default ProductList;