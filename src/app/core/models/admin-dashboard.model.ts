export interface AdminDashboardSummary {
  totalVentas: number;
  totalPedidos: number;
  pagosEnRevision: number;
  productosActivos: number;
  usuariosActivos?: number;
  suscriptoresNewsletter?: number;
}

export interface AdminRecentOrder {
  id: number;
  codigoPedido: string;
  clienteNombre: string;
  clienteEmail?: string;
  estado: string;
  total: number;
  creadoEn: string;
}

export interface AdminRecentPayment {
  id: number;
  orderId: number;
  codigoPedido: string;
  clienteNombre: string;
  numeroOperacion: string;
  monto: number;
  estado: string;
  creadoEn: string;
}