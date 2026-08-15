export interface UserLastOrder {
  id: number;
  codigoPedido: string;
  estado: string;
  total: number;
  creadoEn: string;
}

export interface UserProfile {
  id: number;
  nombres: string;
  apellidos: string;
  email: string;
  celular: string | null;
  documentoTipo: string | null;
  documentoNumero: string | null;
  activo: boolean;
  emailVerificado: boolean;
  roles: string[];
  ultimoPedido: UserLastOrder | null;
  creadoEn: string;
}