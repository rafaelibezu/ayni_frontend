export interface NewsletterSubscribeRequest {
  email: string;
  nombres?: string;
}

export interface NewsletterSubscriber {
  id: number;
  email: string;
  nombres: string | null;
  activo: boolean;
  creadoEn: string;
}