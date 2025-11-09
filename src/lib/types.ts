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
  [key: string]: any; // To allow for extra properties like uniqueId
};

export type CartItem = Item & {
  quantity: number;
};

export type OrderItem = {
    id: string;
    name: string;
    price: number;
    quantity: number;
    type: 'product' | 'course';
    category: ItemCategory;
    vendor: string;
    imageId: string;
}

export type Order = {
  id: string;
  userId: string;
  orderDate: string;
  totalAmount: number;
  status: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  shippingInfo: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    zip: string;
  };
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

export type Review = {
    id: string;
    userId: string;
    userName: string;
    itemId: string;
    rating: number;
    comment: string;
    createdAt: string;
}

export type WishlistItem = {
  id: string;
  userId: string;
  itemId: string;
  itemType: 'product' | 'course';
  addedAt: string;
}
    

    
