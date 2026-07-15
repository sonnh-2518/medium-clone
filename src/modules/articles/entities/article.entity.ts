export class Article {
  id: number;
  slug: string;
  title: string;
  description: string;
  body: string;
  tagList: string[];
  authorId: number;
  createdAt: Date;
  updatedAt: Date;
}
