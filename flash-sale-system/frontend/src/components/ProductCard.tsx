import React from 'react';
import type { Product } from '../types';


interface ProductCardProps {
  product: Product;
  onSelect: (p: Product) => void;
  onAddToCart: (id: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelect,
  onAddToCart,
}) => {
  const formatVND = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const isOutOfStock = product.stock <= 0;

  return (
    <div
      onClick={() => onSelect(product)}
      className="fade-in"
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        backdropFilter: 'blur(10px)',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        position: 'relative',
        boxShadow: 'var(--shadow-md)'
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-active)';
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
        e.currentTarget.style.boxShadow = 'var(--shadow-glow)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-color)';
        e.currentTarget.style.transform = 'translateY(0px)';
        e.currentTarget.style.backgroundColor = 'var(--bg-card)';
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
      }}
    >
      {/* Product Image */}
      <div style={{ position: 'relative', width: '100%', paddingTop: '65%', overflow: 'hidden' }}>
        <img
          src={product.image || 'https://via.placeholder.com/400x260'}
          alt={product.name}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.4s'
          }}
        />
        {/* Flash Sale Badge / Stock Indicator */}
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          backgroundColor: isOutOfStock ? 'rgba(30, 41, 59, 0.85)' : 'rgba(251, 146, 60, 0.95)',
          color: isOutOfStock ? 'var(--text-muted)' : 'var(--text-inverse)',
          padding: '4px 10px',
          borderRadius: '20px',
          fontSize: '11px',
          fontWeight: 600,
          letterSpacing: '0.5px',
          backdropFilter: 'blur(4px)',
          textTransform: 'uppercase'
        }}>
          {isOutOfStock ? 'Hết hàng' : 'Flash Sale'}
        </div>
      </div>

      {/* Product Content */}
      <div style={{
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        flexGrow: 1
      }}>
        <div>
          <h3 style={{
            fontSize: '17px',
            fontWeight: 600,
            color: 'var(--text-main)',
            lineHeight: 1.3,
            marginBottom: '4px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical'
          }}>
            {product.name}
          </h3>
          <p style={{
            fontSize: '18px',
            color: 'var(--primary)',
            fontWeight: 700,
            letterSpacing: '0.2px'
          }}>
            {formatVND(product.price)}
          </p>
        </div>

        {/* Real-time inventory bar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
            <span style={{ fontWeight: 500 }}>
              {isOutOfStock ? 'Không còn sản phẩm' : `Còn lại: ${product.stock}`}
            </span>
            <span>{isOutOfStock ? '0%' : 'Số lượng có hạn'}</span>
          </div>
          <div style={{
            height: '6px',
            backgroundColor: 'rgba(255, 255, 255, 0.06)',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${Math.min(100, (product.stock / 20) * 100)}%`,
              height: '100%',
              background: isOutOfStock 
                ? 'rgba(255, 255, 255, 0.1)' 
                : 'linear-gradient(90deg, var(--primary), #f97316)',
              borderRadius: '4px',
              transition: 'width 0.4s ease'
            }} />
          </div>
        </div>

        {/* Action Button */}
        <div style={{ marginTop: 'auto', paddingTop: '8px' }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (!isOutOfStock) onAddToCart(product.id);
            }}
            disabled={isOutOfStock}
            style={{
              width: '100%',
              backgroundColor: isOutOfStock ? 'rgba(30, 41, 59, 0.45)' : 'var(--primary)',
              color: isOutOfStock ? 'var(--text-muted)' : 'var(--text-inverse)',
              border: isOutOfStock ? '1px solid var(--border-color)' : 'none',
              borderRadius: '10px',
              padding: '10px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: isOutOfStock ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
            onMouseOver={(e) => {
              if (!isOutOfStock) e.currentTarget.style.backgroundColor = 'var(--primary-hover)';
            }}
            onMouseOut={(e) => {
              if (!isOutOfStock) e.currentTarget.style.backgroundColor = 'var(--primary)';
            }}
          >
            🛒 Mua Ngay
          </button>
        </div>
      </div>
    </div>
  );
};
