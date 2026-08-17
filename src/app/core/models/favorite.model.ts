export interface Favorite {
  id: number;
  productId: number;
  nombreProducto: string;
  slug: string;
  precio: number;
  imagenPrincipalUrl: string;
  stock: number | null;
  creadoEn: string;
}
