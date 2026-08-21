export interface AdminUser {
  id: number;
  nombres: string;
  apellidos: string;
  email: string;
  celular: string | null;
  documentoTipo: string | null;
  documentoNumero: string | null;
  activo: boolean;
  emailVerificado: boolean;
  proveedorAuth: string | null;
  roles: string[];
  creadoEn: string;
  actualizadoEn: string | null;
}

export interface CreateAdminUserRequest {
  nombres: string;
  apellidos: string;
  email: string;
  password: string;
  celular: string | null;
}