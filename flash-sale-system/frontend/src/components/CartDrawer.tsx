import React from 'react';
import type { CartItem } from '../types';


interface CartDrawerProps {
  items: CartItem[];
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
  isCheckingOut: boolean;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  items,
  isOpen,
  onClose,
  onCheckout,
  isCheckingOut
}) => {
  const formatVND = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
            backdropFilter: 'blur(4px)',
            zIndex: 998,
            animation: 'fadeIn 0.25s ease-out'
          }}
        />
      )}

      {/* Cart Drawer */}
      <div style={{
        position: 'fixed',
        top: 0,
        right: 0,
        width: '420px',
        maxWidth: '100%',
        height: '100vh',
        backgroundColor: 'rgba(11, 15, 25, 0.95)',
        borderLeft: '1px solid var(--border-color)',
        backdropFilter: 'blur(16px)',
        zIndex: 999,
        padding: '32px 28px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        boxShadow: 'var(--shadow-lg)',
        transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: 600, color: '#fff', letterSpacing: '-0.4px' }}>Giỏ hàng của bạn</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{items.length} mặt hàng đang chờ thanh toán</p>
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

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          flexGrow: 1,
          overflowY: 'auto',
          paddingRight: '4px'
        }}>
          {items.length === 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              flexGrow: 1,
              gap: '12px',
              opacity: 0.6
            }}>
              <span style={{ fontSize: '40px' }}>🛒</span>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: 500 }}>
                Giỏ hàng của bạn đang trống!
              </p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.productId}
                style={{
                  display: 'flex',
                  gap: '14px',
                  padding: '14px',
                  backgroundColor: 'rgba(30, 41, 59, 0.35)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  animation: 'fadeIn 0.25s'
                }}
              >
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.productName}
                    style={{
                      width: '64px',
                      height: '64px',
                      objectFit: 'cover',
                      borderRadius: '8px'
                    }}
                  />
                )}
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flexGrow: 1 }}>
                  <div>
                    <h4 style={{ fontSize: '14px', color: '#f8fafc', fontWeight: 600, marginBottom: '2px' }}>
                      {item.productName}
                    </h4>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      Số lượng: {item.quantity}
                    </span>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline'
                  }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                      {formatVND(item.price)}
                    </span>
                    <span style={{ fontSize: '15px', color: '#f8fafc', fontWeight: 600 }}>
                      {formatVND(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div style={{
            borderTop: '1px solid var(--border-color)',
            paddingTop: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 500 }}>Tổng tiền:</span>
              <span style={{ fontSize: '22px', color: 'var(--primary)', fontWeight: 700 }}>{formatVND(total)}</span>
            </div>

            <button
              onClick={onCheckout}
              disabled={isCheckingOut}
              style={{
                backgroundColor: 'var(--primary)',
                color: 'var(--text-inverse)',
                border: 'none',
                borderRadius: '12px',
                padding: '14px',
                fontSize: '15px',
                fontWeight: 600,
                cursor: isCheckingOut ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                transition: 'all 0.2s',
                opacity: isCheckingOut ? 0.75 : 1
              }}
              onMouseOver={(e) => {
                if (!isCheckingOut) e.currentTarget.style.backgroundColor = 'var(--primary-hover)';
              }}
              onMouseOut={(e) => {
                if (!isCheckingOut) e.currentTarget.style.backgroundColor = 'var(--primary)';
              }}
            >
              {isCheckingOut ? (
                <>
                  <div className="spinner" /> Đang thanh toán...
                </>
              ) : (
                '🛍️ Đặt hàng ngay'
              )}
            </button>
          </div>
        )}
      </div>
    </>
  );
};
