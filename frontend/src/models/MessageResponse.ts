export interface MessageResponse {
  id: number;
  articleId: number;
  title: string;
  question: string;
  displayName: string;
  response?: string;
  adminEmail?: string;
  closed: boolean;
  createdAt: string;
}
