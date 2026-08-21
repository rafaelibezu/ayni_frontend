export type AdminPaymentStatus =
  | 'PENDIENTE'
  | 'EN_REVISION'
  | 'VALIDADO'
  | 'RECHAZADO'
  | 'FALLIDO';

export interface AdminPayment {
  id: number;
  orderId: number;
  codigoPedido: string;
  clienteNombre: string;
  clienteEmail?: string;
  metodoPago: string;
  estado: AdminPaymentStatus;
  monto: number;
  numeroOperacion: string | null;
  comprobanteUrl: string | null;
  observacion: string | null;
  creadoEn: string;
  validadoEn?: string | null;
}

export interface UpdateAdminPaymentStatusRequest {
  estado: AdminPaymentStatus;
  observacion: string;
}