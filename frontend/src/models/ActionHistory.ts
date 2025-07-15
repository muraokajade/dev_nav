export interface ActionHistory  {
  type: "review" | "comment" | "read";
  content: string;
  date: string;
  articleTitle?: string;
  articleId?: number;
};
