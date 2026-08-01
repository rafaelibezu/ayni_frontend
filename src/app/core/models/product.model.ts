export interface Product {
  id: number;
  nombre: string;
  slug: string;
  descripcion: string;
  sku: string;
  precio: number;
  precioComparacion: number | null;
  stock: number;
  imagenPrincipalUrl: string;
  badge: string | null;
  destacado: boolean;
  categoriaNombre: string;
  categoriaSlug: string;
}