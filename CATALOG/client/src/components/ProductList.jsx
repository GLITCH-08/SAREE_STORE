import React, { useState, useEffect, useRef } from 'react';
import ProductCard from './ProductCard';
import { productService } from '../services/api';
import './ProductList.css';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef(null);
  const animationRef = useRef(null);
  const isPausedRef = useRef(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (products.length > 0) {
      startScrollAnimation();
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [products]);

  const startScrollAnimation = () => {
    const container = containerRef.current;
    if (!container) return;

    const cardWidth = 450 + 32; // card width + gap (2rem = 32px)
    const speed = 1; // pixels per frame
    let currentTranslate = 0;

    const animate = () => {
      if (!isPausedRef.current && products.length > 0) {
        currentTranslate -= speed;
        
        // When the first card is completely off screen, reset and move it to the end
        if (Math.abs(currentTranslate) >= cardWidth) {
          // First, compensate the position BEFORE moving the card
          currentTranslate += cardWidth;
          
          // Then move the first card to the end
          const firstCard = container.firstElementChild;
          if (firstCard) {
            // Apply the corrected transform immediately to prevent wobble
            container.style.transform = `translateX(${currentTranslate}px)`;
            // Then move the DOM element
            container.appendChild(firstCard);
          }
        } else {
          // Normal transform update
          container.style.transform = `translateX(${currentTranslate}px)`;
        }
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await productService.getAllProducts();
      
      if (response.success) {
        setProducts(response.data);
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

  if (!products || products.length === 0) {
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
    <div className="product-list-container">
      <div className="product-list-header">
        <h2>Saree Collection ({products.length})</h2>
        <button onClick={fetchProducts} className="refresh-btn">
          Refresh
        </button>
      </div>
      
      <div className="product-grid">
        <div 
          ref={containerRef}
          className="product-row"
          onMouseEnter={() => {
            setIsPaused(true);
            isPausedRef.current = true;
          }}
          onMouseLeave={() => {
            setIsPaused(false);
            isPausedRef.current = false;
          }}
        >
          {products.map((product, index) => (
            <ProductCard 
              key={product._id || index} 
              product={product} 
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductList;