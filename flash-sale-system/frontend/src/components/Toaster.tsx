import React from 'react';
import type { ToastMessage } from '../types';


interface ToasterProps {
  toasts: ToastMessage[];
  removeToast: (id: string) => void;
}

export const Toaster: React.FC<ToasterProps> = ({ toasts, removeToast }) => {
  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      maxWidth: '380px',
      width: 'calc(100% - 48px)'
    }}>
      {toasts.map((toast) => {
        let color = 'var(--primary)';
        let bg = 'rgba(251, 146, 60, 0.1)';
        let border = 'rgba(251, 146, 60, 0.3)';

        if (toast.type === 'error') {
          color = 'var(--accent-red)';
          bg = 'rgba(248, 113, 113, 0.1)';
          border = 'rgba(248, 113, 113, 0.3)';
        } else if (toast.type === 'success') {
          color = 'var(--accent-green)';
          bg = 'rgba(74, 222, 128, 0.1)';
          border = 'rgba(74, 222, 128, 0.3)';
        } else if (toast.type === 'info') {
          color = 'var(--accent-blue)';
          bg = 'rgba(56, 189, 248, 0.1)';
          border = 'rgba(56, 189, 248, 0.3)';
        }

        return (
          <div
            key={toast.id}
            onClick={() => removeToast(toast.id)}
            className="fade-in"
            style={{
              backgroundColor: bg,
              border: `1px solid ${border}`,
              borderRadius: '12px',
              padding: '16px 20px',
              backdropFilter: 'blur(12px)',
              boxShadow: 'var(--shadow-lg)',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              cursor: 'pointer',
              animation: 'fadeIn 0.2s ease-out forwards',
              transition: 'transform 0.15s ease'
            }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{
                color: color,
                fontWeight: 600,
                fontSize: '15px',
                letterSpacing: '0.3px'
              }}>{toast.title}</span>
              <span style={{
                fontSize: '18px',
                lineHeight: 1,
                color: 'var(--text-muted)',
                opacity: 0.6
              }}>&times;</span>
            </div>
            <p style={{
              color: 'var(--text-main)',
              fontSize: '13px',
              lineHeight: 1.4,
              fontWeight: 400
            }}>
              {toast.message}
            </p>
          </div>
        );
      })}
    </div>
  );
};
