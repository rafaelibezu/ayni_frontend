export interface Favorite {
  id: number;
  productId: number;
  nombre: string;
  slug: string;
  precio: number;
  precioComparacion: number | null;
  stock: number | null;
  imagenPrincipalUrl: string | null;
  badge: string | null;
  categoriaNombre: string;
  categoriaSlug: string;
  creadoEn: string;
}
