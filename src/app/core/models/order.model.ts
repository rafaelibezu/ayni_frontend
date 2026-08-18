export interface OrderItem {
  id: number;
  nombreProducto: string;
  sku: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  imagenPrincipalUrl?: string | null;
}

export interface Order {
  id: number;
  codigoPedido: string;
  estado: string;
  subtotal: number;
  costoEnvio: number;
  total: number;
  metodoPago: string | null;
  estadoPago: string | null;
  items: OrderItem[];
  creadoEn: string;
}
