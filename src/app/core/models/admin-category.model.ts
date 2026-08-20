export interface AdminCategory {
  id: number;
  nombre: string;
  slug: string;
  descripcion: string | null;
  imagenUrl: string | null;
  activo: boolean;
  creadoEn: string;
  actualizadoEn: string | null;
}

export interface AdminCategoryRequest {
  nombre: string;
  descripcion: string | null;
  imagenUrl: string | null;
  activo: boolean;
}