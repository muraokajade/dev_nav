export interface Procedure {
  id: number;
  stepNumber:string
  slug: string;
  title: string;
  category: string;
  content: string;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
  published: boolean;
}
