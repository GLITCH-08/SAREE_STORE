import React from 'react';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const handleImageError = (e) => {
    e.target.src = 'https://via.placeholder.com/300x400/f0f0f0/999?text=No+Image';
  };

  const convertGoogleDriveUrl = (url) => {
    if (!url) return null;
    
    // Extract file ID from Google Drive URL
    const fileIdMatch = url.match(/id=([a-zA-Z0-9-_]+)/);
    if (fileIdMatch && fileIdMatch[1]) {
      const fileId = fileIdMatch[1];
      // Return proxy URL through our backend
      return `http://localhost:5000/api/image/${fileId}`;
    }
    
    return url;
  };

  const getImageUrl = () => {
    if (product.imageUrl) {
      return convertGoogleDriveUrl(product.imageUrl);
    }
    if (product.image) {
      return product.image;
    }
    return 'https://via.placeholder.com/300x400/f0f0f0/999?text=No+Image';
  };

  const openDriveLink = () => {
    if (product.driveLink) {
      window.open(product.driveLink, '_blank');
    } else if (product.imageUrl) {
      window.open(product.imageUrl, '_blank');
    }
  };

  return (
    <div className="product-card">
      <div className="product-image-container">
        <img
          src={getImageUrl()}
          alt={product.title || 'Product Image'}
          className="product-image"
          onError={handleImageError}
        />
        {(product.driveLink || product.imageUrl) && (
          <button className="drive-link-btn" onClick={openDriveLink} title="View Drive Files">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </button>
        )}
      </div>
      
      <div className="product-info">
        <h3 className="product-name">{product.title || 'Unnamed Product'}</h3>
        
        {product.price && (
          <p className="product-price">₹{product.price}</p>
        )}
        
        {product.description && (
          <p className="product-description">{product.description}</p>
        )}
        
        {product.category && (
          <span className="product-category">{product.category}</span>
        )}
        
        <div className="product-actions">
          {product.driveLink && (
            <button className="btn btn-primary" onClick={openDriveLink}>
              View Details
            </button>
          )}
          
          <button className="btn btn-secondary">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;