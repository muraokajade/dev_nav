export interface ArticleModel {
  id: number;
  slug: string;
  title: string;
  content: string;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
  published: boolean;
  category: string;
}
