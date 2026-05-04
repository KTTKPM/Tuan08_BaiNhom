import type { AppConfig, Product, CartItem, Order } from './types';


// Initial fallback mock data
let mockProducts: Product[] = [
  {
    id: "1",
    name: "iPhone 15",
    price: 20000000,
    stock: 10,
    image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=640&auto=format&fit=crop",
    description: "Apple iPhone 15 mang lại trải nghiệm đỉnh cao với Dynamic Island độc đáo và hiệu năng vô song từ chip A16 Bionic."
  },
  {
    id: "2",
    name: "Samsung Galaxy S24 Ultra",
    price: 28000000,
    stock: 15,
    image: "https://images.unsplash.com/photo-1610945661011-92ce404d887a?q=80&w=640&auto=format&fit=crop",
    description: "Samsung Galaxy S24 Ultra với bút S-Pen quyền năng, camera 200MP và tích hợp AI siêu việt dẫn đầu xu hướng."
  },
  {
    id: "3",
    name: "Xiaomi 14 Ultra",
    price: 22500000,
    stock: 20,
    image: "https://images.unsplash.com/photo-1598327105666-5b89991aa2cd?q=80&w=640&auto=format&fit=crop",
    description: "Xiaomi 14 Ultra sở hữu ống kính Leica huyền thoại và sạc siêu nhanh 90W đáp ứng mọi nhu cầu chụp ảnh."
  },
  {
    id: "4",
    name: "MacBook Air M3 2024",
    price: 32990000,
    stock: 5,
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=640&auto=format&fit=crop",
    description: "MacBook Air M3 mới mang tới tốc độ cực nhanh, màn hình Liquid Retina tuyệt đẹp trong thiết kế mỏng nhẹ tinh tế."
  }
];

let mockCart: CartItem[] = [];

export const api = {
  async getProducts(config: AppConfig): Promise<Product[]> {
    if (config.useMockMode) {
      return [...mockProducts];
    }

    // Real call to PU1
    const response = await fetch(`${config.pu1Url}/products`);
    if (!response.ok) throw new Error(`HTTP error ${response.status} from PU1`);
    const data = await response.json();
    let prods = Array.isArray(data) ? data : (data.products || data.data || []);
    return prods.map((p: any) => ({
      id: String(p.id || p._id || p.productId || ''),
      name: p.name || p.title || 'Product',
      price: Number(p.price || p.amount || 0),
      stock: typeof p.stock === 'number' ? p.stock : (typeof p.quantity === 'number' ? p.quantity : 0),
      image: p.image || p.imageUrl || p.img || '',
      description: p.description || p.desc || ''
    }));
  },


  async getProductById(config: AppConfig, id: string): Promise<Product> {
    if (config.useMockMode) {
      const prod = mockProducts.find(p => p.id === id);
      if (!prod) throw new Error('Product not found in Mock Mode');
      return { ...prod };
    }

    // Real call to PU1
    const response = await fetch(`${config.pu1Url}/products/${id}`);
    if (!response.ok) throw new Error(`HTTP error ${response.status} from PU1`);
    const data = await response.json();
    const p = data && data.product ? data.product : data;
    return {
      id: String(p.id || p._id || p.productId || id || ''),
      name: p.name || p.title || 'Product',
      price: Number(p.price || p.amount || 0),
      stock: typeof p.stock === 'number' ? p.stock : (typeof p.quantity === 'number' ? p.quantity : 0),
      image: p.image || p.imageUrl || p.img || '',
      description: p.description || p.desc || ''
    };
  },


  async getCart(config: AppConfig): Promise<CartItem[]> {
    if (config.useMockMode) {
      return [...mockCart];
    }

    // Real call to PU2
    const response = await fetch(`${config.pu2Url}/cart?userId=${config.userId}`);
    if (!response.ok) throw new Error(`HTTP error ${response.status} from PU2`);
    const data = await response.json();
    let rawItems: any[] = [];
    if (Array.isArray(data)) {
      rawItems = data;
    } else if (data && typeof data === 'object') {
      if (Array.isArray(data.data)) rawItems = data.data;
      else if (Array.isArray(data.items)) rawItems = data.items;
      else if (Array.isArray(data.cart)) rawItems = data.cart;
      else if (data.cart && Array.isArray(data.cart.items)) rawItems = data.cart.items;
      else if (data.data && Array.isArray(data.data.items)) rawItems = data.data.items;
      else if (data.data && Array.isArray(data.data.cart)) rawItems = data.data.cart;
      else if (data.items && typeof data.items === 'object') {
        rawItems = Object.entries(data.items).map(([pId, qty]) => ({
          id: pId,
          productId: pId,
          quantity: Number(qty)
        }));
      } else if (data.cart && typeof data.cart === 'object') {
        rawItems = Object.entries(data.cart).map(([pId, qty]) => ({
          id: pId,
          productId: pId,
          quantity: Number(qty)
        }));
      } else if (data.data && typeof data.data === 'object') {
        if (data.data.items && typeof data.data.items === 'object' && !Array.isArray(data.data.items)) {
          rawItems = Object.entries(data.data.items).map(([pId, qty]) => ({
            id: pId,
            productId: pId,
            quantity: Number(qty)
          }));
        }
      } else {
        const allKeysNumeric = Object.keys(data).every(k => !isNaN(Number(k)));
        if (allKeysNumeric && Object.keys(data).length > 0) {
          rawItems = Object.entries(data).map(([pId, qty]) => ({
            id: pId,
            productId: pId,
            quantity: Number(qty)
          }));
        }
      }
    }




    return rawItems.map((item: any) => {
      const pId = String(item.productId || item.pId || item.id || '');
      return {
        id: String(item.id || pId || Math.random().toString()),
        productId: pId,
        productName: item.productName || item.name || item.title || `Product ${pId}`,
        price: Number(item.price || item.amount || 0),
        quantity: Number(item.quantity || item.qty || 1),
        image: item.image || item.imageUrl || item.img || ''
      };
    });
  },



  async addToCart(config: AppConfig, productId: string, quantity: number): Promise<CartItem> {
    if (config.useMockMode) {
      const product = mockProducts.find(p => p.id === productId);
      if (!product) throw new Error('Product not found in Mock Mode');
      const existing = mockCart.find(item => item.productId === productId);
      if (existing) {
        existing.quantity += quantity;
        return { ...existing };
      }
      const newItem: CartItem = {
        id: Math.random().toString(36).substr(2, 9),
        productId,
        productName: product.name,
        price: product.price,
        quantity,
        image: product.image
      };
      mockCart.push(newItem);
      return { ...newItem };
    }

    // Real call to PU2
    const numUserId = !isNaN(Number(config.userId)) ? Number(config.userId) : config.userId;
    const numProductId = !isNaN(Number(productId)) ? Number(productId) : productId;

    const response = await fetch(`${config.pu2Url}/cart/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: numUserId, productId: numProductId, quantity: Number(quantity) })
    });
    if (!response.ok) throw new Error(`HTTP error ${response.status} from PU2`);
    try {
      const data = await response.json();
      return data;
    } catch {
      return {} as any;
    }
  },



  async checkout(config: AppConfig): Promise<Order> {
    if (config.useMockMode) {
      if (mockCart.length === 0) throw new Error('Your cart is empty');

      // Decrease stock in memory for mock mode
      for (const item of mockCart) {
        const prod = mockProducts.find(p => p.id === item.productId);
        if (prod) {
          if (prod.stock < item.quantity) {
            throw new Error(`Sản phẩm ${prod.name} đã hết hàng (chỉ còn ${prod.stock} cái)`);
          }
          prod.stock -= item.quantity;
        }
      }

      const total = mockCart.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const items = [...mockCart];
      mockCart = []; // empty the cart

      return {
        id: 'ORD-' + Math.floor(1000 + Math.random() * 9000),
        items,
        totalPrice: total,
        status: 'SUCCESS',
        createdAt: new Date().toISOString()
      };
    }

    // Real call to PU3
    const response = await fetch(`${config.pu3Url}/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: config.userId })
    });
    if (!response.ok) throw new Error(`HTTP error ${response.status} from PU3`);
    const data = await response.json();
    if (data && data.order) return data.order;
    return data;
  },

  async getProductStock(config: AppConfig, productId: string): Promise<number> {
    if (config.useMockMode) {
      const prod = mockProducts.find(p => p.id === productId);
      return prod ? prod.stock : 0;
    }

    // Real call to PU4
    const response = await fetch(`${config.pu4Url}/stock/${productId}`);
    if (!response.ok) throw new Error(`HTTP error ${response.status} from PU4`);
    const data = await response.json();
    if (typeof data === 'number') return data;
    if (typeof data === 'object' && data !== null) {
      if (typeof data.stock === 'number') return data.stock;
      if (typeof data.quantity === 'number') return data.quantity;
      if (typeof data.data === 'number') return data.data;
    }
    return 0;

  },

  // Helper method to replenish stock in mock mode
  resetMockData() {
    mockProducts = [
      {
        id: "1",
        name: "iPhone 15",
        price: 20000000,
        stock: 10,
        image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=640&auto=format&fit=crop",
        description: "Apple iPhone 15 mang lại trải nghiệm đỉnh cao với Dynamic Island độc đáo và hiệu năng vô song từ chip A16 Bionic."
      },
      {
        id: "2",
        name: "Samsung Galaxy S24 Ultra",
        price: 28000000,
        stock: 15,
        image: "https://images.unsplash.com/photo-1610945661011-92ce404d887a?q=80&w=640&auto=format&fit=crop",
        description: "Samsung Galaxy S24 Ultra với bút S-Pen quyền năng, camera 200MP và tích hợp AI siêu việt dẫn đầu xu hướng."
      },
      {
        id: "3",
        name: "Xiaomi 14 Ultra",
        price: 22500000,
        stock: 20,
        image: "https://images.unsplash.com/photo-1598327105666-5b89991aa2cd?q=80&w=640&auto=format&fit=crop",
        description: "Xiaomi 14 Ultra sở hữu ống kính Leica huyền thoại và sạc siêu nhanh 90W đáp ứng mọi nhu cầu chụp ảnh."
      },
      {
        id: "4",
        name: "MacBook Air M3 2024",
        price: 32990000,
        stock: 5,
        image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=640&auto=format&fit=crop",
        description: "MacBook Air M3 mới mang tới tốc độ cực nhanh, màn hình Liquid Retina tuyệt đẹp trong thiết kế mỏng nhẹ tinh tế."
      }
    ];
    mockCart = [];
  }
};
