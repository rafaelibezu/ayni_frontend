export type AdminOrderStatus =
  | 'PENDIENTE_PAGO'
  | 'PAGO_EN_REVISION'
  | 'PAGADO'
  | 'PREPARANDO'
  | 'ENVIADO'
  | 'ENTREGADO'
  | 'CANCELADO';

export interface AdminOrderItem {
  id: number;
  productId?: number;
  nombreProducto: string;
  sku: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface AdminOrder {
  id: number;
  codigoPedido: string;
  clienteId?: number;
  clienteNombre: string;
  clienteEmail: string;
  estado: AdminOrderStatus;
  subtotal: number;
  costoEnvio: number;
  total: number;
  metodoPago: string | null;
  estadoPago: string | null;
  direccionEnvio?: string | null;
  observaciones?: string | null;
  items: AdminOrderItem[];
  creadoEn: string;
}

export interface UpdateAdminOrderStatusRequest {
  estado: AdminOrderStatus;
}