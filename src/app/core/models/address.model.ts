export interface Address {
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

export interface CreateAddressRequest {
  alias?: string;
  destinatario: string;
  celular: string;
  documentoTipo?: string | null;
  documentoNumero?: string | null;
  direccion: string;
  distrito: string;
  referencia?: string | null;
  principal: boolean;
}
