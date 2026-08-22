export interface AddCartItemRequest {
  productId: number;
  cantidad: number;
}

export interface UpdateCartItemRequest {
  cantidad: number;
}

export interface CartItemResponse {
  itemId?: number; // Es opcional porque en LocalStorage no tendremos este ID de la BD
  productId: number;
  nombre: string;
  slug: string;
  imagenPrincipalUrl: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  stock: number;
}

export interface CartResponse {
  cartId?: number;
  items: CartItemResponse[];
  totalItems: number;
  subtotal: number;
}