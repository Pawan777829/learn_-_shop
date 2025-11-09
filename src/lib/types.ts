export type ItemCategory =
  | 'Electronics'
  | 'Computers & Accessories'
  | 'Home & Kitchen'
  | 'Clothing, Shoes & Jewelry'
  | 'Books'
  | 'Software'
  | 'Courses'
  | 'Health & Household'
  | 'Sports & Outdoors'
  | 'Toys & Games'
  | 'Art & Crafts'
  | 'Lifestyle';

export type Item = {
  id: string;
  name: string;
  description: string;
  price: number;
  type: 'product' | 'course';
  category: ItemCategory;
  vendor: string;
  rating: number;
  imageId: string;
  stock?: number;
};

export type CartItem = Item & {
  quantity: number;
};

export type Order = {
  id: string;
  userId: string;
  orderDate: string;
  totalAmount: number;
  status: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  items: CartItem[];
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
