export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  image: string;
  description?: string;
}

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  totalPrice: number;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  createdAt: string;
}

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

export interface AppConfig {
  pu1Url: string;
  pu2Url: string;
  pu3Url: string;
  pu4Url: string;
  userId: string;
  useMockMode: boolean;
  redisUrl?: string;
}

