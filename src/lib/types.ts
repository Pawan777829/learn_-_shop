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

export type Order = {
  id: string;
  userId: string;
  orderDate: string;
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
};

export type Enrollment = {
  id: string;
  userId: string;
  courseId: string;
  enrollmentDate: string;
  progress: number;
};

export type Course = {
    id: string;
    vendorId: string;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    lessons: string[];
};
