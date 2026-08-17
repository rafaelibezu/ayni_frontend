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

export interface UpdateUserProfileRequest {
  nombres: string;
  apellidos: string;
  celular: string;
  documentoTipo?: string | null;
  documentoNumero?: string | null;
}

export interface UpdatePasswordRequest {
  passwordActual: string;
  nuevaPassword: string;
  confirmarPassword: string;
}

export interface UserAddress {
  id: number;
  destinatario: string;
  celular: string;
  documentoTipo: string | null;
  documentoNumero: string | null;
  direccion: string;
  distrito: string;
  referencia: string | null;
  esPrincipal: boolean;
  creadoEn: string;
}

export interface AddressRequest {
  destinatario: string;
  celular: string;
  documentoTipo: string;
  documentoNumero: string;
  direccion: string;
  distrito: string;
  referencia: string;
  esPrincipal: boolean;
}
