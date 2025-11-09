export type Item = {
  id: string;
  name: string;
  description: string;
  price: number;
  type: 'product' | 'course';
  vendor: string;
  rating: number;
  imageId: string;
  stock?: number;
};
