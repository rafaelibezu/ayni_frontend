export interface AdminProduct {
  id: number;
  nombre: string;
  slug: string;
  sku: string;
  descripcion: string;
  precio: number;
  precioComparacion: number | null;
  stock: number;
  imagenPrincipalUrl: string | null;
  badge: string | null;
  destacado: boolean;
  activo: boolean;
  categoriaId: number;
  categoriaNombre: string;
  categoriaSlug: string;
  creadoEn: string;
  actualizadoEn: string | null;
}

export interface AdminProductRequest {
  categoriaId: number;
  nombre: string;
  sku: string;
  descripcion: string;
  precio: number;
  precioComparacion: number | null;
  stock: number;
  imagenPrincipalUrl: string | null;
  badge: string | null;
  destacado: boolean;
  activo: boolean;
}

export interface UpdateProductStockRequest {
  stock: number;
}