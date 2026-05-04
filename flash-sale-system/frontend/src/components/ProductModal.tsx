import React, { useState } from 'react';
import type { Product } from '../types';


interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (id: string, quantity: number) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  onClose,
  onAddToCart
}) => {
  const [qty, setQty] = useState(1);

  if (!product) return null;

  const isOutOfStock = product.stock <= 0;
  const formatVND = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const handleQtyChange = (val: number) => {
    if (val < 1 || val > product.stock) return;
    setQty(val);
  };

  const handleSubmit = () => {
    if (qty > 0 && !isOutOfStock) {
      onAddToCart(product.id, qty);
      onClose();
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(8px)',
        zIndex: 995,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid var(--border-color)',
          borderRadius: '20px',
          maxWidth: '850px',
          width: '100%',
          overflow: 'hidden',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          boxShadow: 'var(--shadow-lg)',
          animation: 'fadeIn 0.3s ease-out forwards',
          maxHeight: 'calc(100vh - 48px)',
          overflowY: 'auto'
        }}
      >
        {/* Product Visual */}
        <div style={{ position: 'relative', minHeight: '340px' }}>
          <img
            src={product.image || 'https://via.placeholder.com/600x400'}
            alt={product.name}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
        </div>

        {/* Details Panel */}
        <div style={{ padding: '32px 36px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h2 style={{ fontSize: '24px', color: '#fff', fontWeight: 600, letterSpacing: '-0.4px', marginBottom: '4px' }}>
                {product.name}
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>ID: {product.id}</p>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: '28px',
                cursor: 'pointer',
                lineHeight: 1,
                padding: '4px',
                transition: 'color 0.15s ease'
              }}
              onMouseOver={(e) => (e.currentTarget.style.color = '#fff')}
              onMouseOut={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              &times;
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Giá ưu đãi chớp nhoáng
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
              <span style={{ fontSize: '28px', color: 'var(--primary)', fontWeight: 700 }}>
                {formatVND(product.price)}
              </span>
              {/* Fake higher previous price */}
              <span style={{ fontSize: '14px', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                {formatVND(product.price * 1.25)}
              </span>
            </div>
          </div>

          <p style={{ fontSize: '14px', color: 'var(--text-main)', lineHeight: 1.6, opacity: 0.9 }}>
            {product.description || 'Sản phẩm Flash Sale cao cấp, chất lượng cực tốt. Nhanh tay săn ngay trước khi hết hàng!'}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)' }}>
              <span>Số lượng mua:</span>
              <span style={{ color: isOutOfStock ? 'var(--accent-red)' : 'var(--text-main)', fontWeight: 600 }}>
                {isOutOfStock ? 'Hết hàng' : `Trong kho còn: ${product.stock}`}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              {!isOutOfStock && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: 'rgba(30, 41, 59, 0.45)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  padding: '4px'
                }}>
                  <button
                    onClick={() => handleQtyChange(qty - 1)}
                    style={{
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: 'var(--text-muted)',
                      width: '36px',
                      height: '36px',
                      cursor: 'pointer',
                      fontSize: '18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    -
                  </button>
                  <span style={{
                    width: '32px',
                    textAlign: 'center',
                    fontWeight: 600,
                    fontSize: '14px',
                    color: '#fff'
                  }}>{qty}</span>
                  <button
                    onClick={() => handleQtyChange(qty + 1)}
                    style={{
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: 'var(--text-muted)',
                      width: '36px',
                      height: '36px',
                      cursor: 'pointer',
                      fontSize: '18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    +
                  </button>
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={isOutOfStock}
                style={{
                  flexGrow: 1,
                  backgroundColor: isOutOfStock ? 'rgba(30, 41, 59, 0.45)' : 'var(--primary)',
                  color: isOutOfStock ? 'var(--text-muted)' : 'var(--text-inverse)',
                  border: isOutOfStock ? '1px solid var(--border-color)' : 'none',
                  borderRadius: '10px',
                  padding: '12px 24px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
                onMouseOver={(e) => {
                  if (!isOutOfStock) e.currentTarget.style.backgroundColor = 'var(--primary-hover)';
                }}
                onMouseOut={(e) => {
                  if (!isOutOfStock) e.currentTarget.style.backgroundColor = 'var(--primary)';
                }}
              >
                {isOutOfStock ? 'Đã hết hàng' : '🚀 Thêm vào giỏ hàng'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
