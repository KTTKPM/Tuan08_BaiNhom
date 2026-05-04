import React from 'react';
import type { AppConfig } from '../types';


interface SettingsPanelProps {
  config: AppConfig;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (newConfig: AppConfig) => void;
  onResetMock: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  config,
  isOpen,
  onClose,
  onUpdate,
  onResetMock
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    onUpdate({
      ...config,
      [name]: type === 'checkbox' ? checked : value
    });
  };

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

      {/* Side Drawer */}
      <div style={{
        position: 'fixed',
        top: 0,
        right: 0,
        width: '400px',
        maxWidth: '100%',
        height: '100vh',
        backgroundColor: 'rgba(11, 15, 25, 0.95)',
        borderLeft: '1px solid var(--border-color)',
        backdropFilter: 'blur(16px)',
        zIndex: 999,
        padding: '32px 28px',
        display: 'flex',
        flexDirection: 'column',
        gap: '28px',
        boxShadow: 'var(--shadow-lg)',
        transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        overflowY: 'auto'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: 600, color: '#fff', letterSpacing: '-0.4px' }}>Cài đặt hệ thống</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Tùy chỉnh Processing Unit API URLs và chế độ chạy thử</p>
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
          gap: '20px',
          flexGrow: 1
        }}>
          {/* Mode toggle */}
          <div style={{
            backgroundColor: 'rgba(30, 41, 59, 0.35)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontWeight: 500,
              cursor: 'pointer',
              userSelect: 'none'
            }}>
              <span>Chế độ Giả lập (Mock Mode)</span>
              <input
                type="checkbox"
                name="useMockMode"
                checked={config.useMockMode}
                onChange={handleChange}
                style={{
                  width: '20px',
                  height: '20px',
                  accentColor: 'var(--primary)',
                  cursor: 'pointer'
                }}
              />
            </label>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
              Khi bật, frontend sẽ không gọi API thật từ LAN/Localhost. Dữ liệu sẽ lưu trong RAM/Local Storage để test thuận tiện.
            </p>
          </div>

          {/* User ID config */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: 500, color: '#f8fafc' }}>
              User ID
            </label>
            <input
              type="text"
              name="userId"
              value={config.userId}
              onChange={handleChange}
              placeholder="e.g. user_999"
              style={{
                backgroundColor: 'rgba(30, 41, 59, 0.5)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '10px 14px',
                color: '#f8fafc',
                outline: 'none',
                transition: 'border 0.2s'
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--primary)')}
              onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border-color)')}
            />
          </div>

          <hr style={{ border: '0', height: '1px', backgroundColor: 'var(--border-color)' }} />

          {/* PU URL Inputs */}
          <div>
            <h3 style={{ fontSize: '14px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '14px' }}>
              Processing Units (LAN IPs)
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  PU1 – Product Service (8081)
                </label>
                <input
                  type="text"
                  name="pu1Url"
                  value={config.pu1Url}
                  onChange={handleChange}
                  style={{
                    backgroundColor: 'rgba(30, 41, 59, 0.5)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  PU2 – Cart Service (8082)
                </label>
                <input
                  type="text"
                  name="pu2Url"
                  value={config.pu2Url}
                  onChange={handleChange}
                  style={{
                    backgroundColor: 'rgba(30, 41, 59, 0.5)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  PU3 – Order Service (8083)
                </label>
                <input
                  type="text"
                  name="pu3Url"
                  value={config.pu3Url}
                  onChange={handleChange}
                  style={{
                    backgroundColor: 'rgba(30, 41, 59, 0.5)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  PU4 – Inventory Service (8084)
                </label>
                <input
                  type="text"
                  name="pu4Url"
                  value={config.pu4Url}
                  onChange={handleChange}
                  style={{
                    backgroundColor: 'rgba(30, 41, 59, 0.5)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action button at bottom */}
        {config.useMockMode && (
          <button
            onClick={onResetMock}
            style={{
              backgroundColor: 'rgba(251, 146, 60, 0.1)',
              border: '1px solid rgba(251, 146, 60, 0.25)',
              color: 'var(--primary)',
              borderRadius: '8px',
              padding: '12px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
              textAlign: 'center'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(251, 146, 60, 0.2)';
              e.currentTarget.style.borderColor = 'var(--primary)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(251, 146, 60, 0.1)';
              e.currentTarget.style.borderColor = 'rgba(251, 146, 60, 0.25)';
            }}
          >
            🔄 Khôi phục Mock Products & Stocks ban đầu
          </button>
        )}
      </div>
    </>
  );
};
