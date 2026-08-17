export interface AddCartItemRequest {
  productId: number;
  cantidad: number;
}

export interface CartItem {
  itemId: number;
  productId: number;
  nombre: string;
  slug: string;
  imagenPrincipalUrl: string | null;
  precioUnitario: number;
  cantidad: number;
  subtotal: number;
  stock: number;
}

export interface Cart {
  cartId: number;
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  timestamp?: string;
}
