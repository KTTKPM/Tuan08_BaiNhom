import { useState, useEffect } from 'react';
import type { AppConfig, Product, CartItem, ToastMessage } from './types';

import { loadConfig, saveConfig } from './config';
import { api } from './api';
import { ProductCard } from './components/ProductCard';
import { ProductModal } from './components/ProductModal';
import { CartDrawer } from './components/CartDrawer';
import { SettingsPanel } from './components/SettingsPanel';
import { Toaster } from './components/Toaster';

function App() {
  // Configuration State
  const [config, setConfig] = useState<AppConfig>(loadConfig);

  // Core Data State
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // UI State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Toasts State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Show live toast message
  const showToast = (title: string, message: string, type: ToastMessage['type'] = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => removeToast(id), 5000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Update & persist config
  const updateConfig = (newConfig: AppConfig) => {
    setConfig(newConfig);
    saveConfig(newConfig);
  };

  const resetMockData = () => {
    api.resetMockData();
    showToast('Đã làm mới dữ liệu', 'Dữ liệu Mock đã khôi phục về trạng thái ban đầu.', 'success');
    fetchProducts();
    fetchCart();
  };

  // Fetch product list
  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const data = await api.getProducts(config);
      setProducts(data);
    } catch (err: any) {
      showToast(
        'Lỗi tải sản phẩm',
        `Không thể tải từ PU1 (${config.pu1Url}). Hãy đảm bảo dịch vụ đang chạy hoặc dùng Chế độ Giả lập.`,
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch cart
  const fetchCart = async () => {
    try {
      const items = await api.getCart(config);
      const enriched = await Promise.all(items.map(async (item) => {
        let prod = products.find((p) => p.id === item.productId);
        if (!prod && !config.useMockMode) {
          try {
            prod = await api.getProductById(config, item.productId);
          } catch (err) {
            //
          }
        }
        return {
          ...item,
          productName: prod ? prod.name : item.productName,
          price: prod ? prod.price : item.price,
          image: prod ? prod.image : item.image
        };
      }));
      setCartItems(enriched);
    } catch (err: any) {
      //
    }
  };



  // Real-time stock polling
  const refreshStocks = async () => {
    if (products.length === 0) return;
    try {
      const updatedProds = await Promise.all(
        products.map(async (prod) => {
          try {
            const currentStock = await api.getProductStock(config, prod.id);
            return { ...prod, stock: currentStock };
          } catch {
            return prod;
          }
        })
      );
      setProducts(updatedProds);
    } catch {
      // Quietly fail for smooth UX
    }
  };

  // Initial Data Load & Polling setup
  useEffect(() => {
    fetchProducts();
    fetchCart();
  }, [config.useMockMode, config.userId, config.pu1Url, config.pu2Url]);


  // Set up polling for real-time stock
  useEffect(() => {
    const timer = setInterval(() => {
      refreshStocks();
    }, 4500);
    return () => clearInterval(timer);
  }, [products]);

  // Handlers
  const handleAddToCart = async (id: string, quantity: number = 1) => {
    const targetProd = products.find((p) => p.id === id);
    if (!targetProd) return;

    if (typeof targetProd.stock === 'number' && targetProd.stock < quantity) {

      showToast('Sản phẩm hết hàng', `Rất tiếc! Số lượng tồn kho không đủ để bán.`, 'error');
      return;
    }

    try {
      await api.addToCart(config, id, quantity);
      showToast(
        'Đã thêm vào giỏ hàng',
        `Sản phẩm "${targetProd.name}" (${quantity} cái) đã được thêm vào giỏ hàng của bạn.`,
        'success'
      );
      fetchCart();
      refreshStocks();
    } catch (err: any) {
      showToast('Thất bại', `Không thể thêm vào giỏ hàng: ${err.message}`, 'error');
    }
  };

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    try {
      const order = await api.checkout(config);
      showToast(
        'Đặt hàng thành công! 🎉',
        `Mã đơn: ${order.id}. Tổng giá: ${new Intl.NumberFormat('vi-VN', {
          style: 'currency',
          currency: 'VND'
        }).format(order.totalPrice)}`,
        'success'
      );
      setCartItems([]);
      setIsCartOpen(false);
      refreshStocks();
    } catch (err: any) {
      showToast('Lỗi thanh toán', `${err.message}`, 'error');
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%',
        padding: '24px'
      }}
    >
      {/* Top Header Navigation */}
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 28px',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: '20px',
          backdropFilter: 'blur(12px)',
          boxShadow: 'var(--shadow-md)',
          animation: 'fadeIn 0.4s ease-out',
          marginBottom: '32px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '32px' }}>⚡</span>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1
                style={{
                  fontSize: '22px',
                  fontWeight: 700,
                  letterSpacing: '-0.5px',
                  color: '#fff',
                  margin: 0,
                  lineHeight: 1
                }}
              >
                Space-Based Flash Sale
              </h1>
              <span
                style={{
                  backgroundColor: config.useMockMode ? 'rgba(56, 189, 248, 0.15)' : 'rgba(74, 222, 128, 0.15)',
                  color: config.useMockMode ? 'var(--accent-blue)' : 'var(--accent-green)',
                  border: config.useMockMode
                    ? '1px solid rgba(56, 189, 248, 0.3)'
                    : '1px solid rgba(74, 222, 128, 0.3)',
                  padding: '3px 8px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: 600,
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase'
                }}
              >
                {config.useMockMode ? 'Chạy Giả Lập' : 'Chạy Thực Tế'}
              </span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Bán hàng tốc độ cao (In-Memory Data Grid)
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={() => setIsSettingsOpen(true)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '20px',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '12px',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
              e.currentTarget.style.color = '#fff';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--text-muted)';
            }}
          >
            ⚙️
          </button>

          <button
            onClick={() => setIsCartOpen(true)}
            style={{
              backgroundColor: 'rgba(251, 146, 60, 0.12)',
              border: '1px solid rgba(251, 146, 60, 0.22)',
              color: 'var(--primary)',
              borderRadius: '14px',
              padding: '10px 18px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(251, 146, 60, 0.22)';
              e.currentTarget.style.borderColor = 'var(--primary)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(251, 146, 60, 0.12)';
              e.currentTarget.style.borderColor = 'rgba(251, 146, 60, 0.22)';
            }}
          >
            🛒 Giỏ hàng
            {cartItems.length > 0 && (
              <span
                style={{
                  backgroundColor: 'var(--primary)',
                  color: 'var(--text-inverse)',
                  borderRadius: '12px',
                  padding: '2px 8px',
                  fontSize: '11px',
                  fontWeight: 700
                }}
              >
                {cartItems.reduce((acc, c) => acc + c.quantity, 0)}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Hero Header Section */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
          marginBottom: '40px',
          animation: 'fadeIn 0.5s ease-out forwards'
        }}
      >
        <div
          style={{
            backgroundColor: 'rgba(251, 146, 60, 0.03)',
            border: '1px solid rgba(251, 146, 60, 0.15)',
            borderRadius: '16px',
            padding: '24px 28px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--primary)', letterSpacing: '1px', textTransform: 'uppercase' }}>
            Flash Sale Độc Quyền
          </span>
          <h2 style={{ fontSize: '28px', fontWeight: 700, color: '#fff', letterSpacing: '-0.5px' }}>
            Mua sắm thả ga, không lo nghẽn mạng!
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: 1.5, maxWidth: '440px' }}>
            Tận hưởng tốc độ chớp mắt với Space-Based Architecture. Dữ liệu xử lý cực nhanh trực tiếp trên RAM nhờ Redis/Hazelcast!
          </p>
        </div>

        <div
          style={{
            backgroundColor: 'rgba(30, 41, 59, 0.2)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '24px 28px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: '12px'
          }}
        >
          <div>
            <h3 style={{ fontSize: '15px', color: '#f8fafc', fontWeight: 600, marginBottom: '2px' }}>
              Kiến trúc Space-Based
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: 1.4 }}>
              Hệ thống chia làm các Processing Units (PUs) độc lập liên kết với Memory Data Grid, tối ưu hoá latency & throughput.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['PU1-Product', 'PU2-Cart', 'PU3-Order', 'PU4-Inventory'].map((pu) => (
              <span
                key={pu}
                style={{
                  fontSize: '11px',
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-muted)',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  fontWeight: 500
                }}
              >
                {pu}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Main Product Shelf Section */}
      <main style={{ display: 'flex', flexDirection: 'column', gap: '24px', flexGrow: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#fff', letterSpacing: '-0.3px' }}>
              Gian hàng Hot Chớp Nhoáng
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
              Danh sách sản phẩm lấy real-time từ PU1 (Product Processing Unit)
            </p>
          </div>

          <button
            onClick={fetchProducts}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-main)',
              borderRadius: '10px',
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)')}
          >
            🔄 Tải lại sản phẩm
          </button>
        </div>

        {/* Loading Spinner or Grid */}
        {isLoading ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '60px 0',
              gap: '12px'
            }}
          >
            <div className="spinner" style={{ width: '32px', height: '32px' }} />
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Đang tải danh sách sản phẩm...</p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: '24px',
              animation: 'fadeIn 0.5s ease-out forwards'
            }}
          >
            {products.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onSelect={(prod) => setSelectedProduct(prod)}
                onAddToCart={(id) => handleAddToCart(id)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Custom Component Panels Overlay */}
      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={(id, qty) => handleAddToCart(id, qty)}
      />

      <CartDrawer
        items={cartItems}
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onCheckout={handleCheckout}
        isCheckingOut={isCheckingOut}
      />

      <SettingsPanel
        config={config}
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onUpdate={updateConfig}
        onResetMock={resetMockData}
      />

      <Toaster toasts={toasts} removeToast={removeToast} />

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid var(--border-color)',
          marginTop: '60px',
          paddingTop: '24px',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}
      >
        <p style={{ fontWeight: 500 }}>⚡ Space-Based Platform • Developed for Flash Sale System ⚡</p>
        <p style={{ opacity: 0.6 }}>Thiết kế giao diện hiện đại & High-load processing</p>
      </footer>
    </div>
  );
}

export default App;
