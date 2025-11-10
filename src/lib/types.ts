
export type ItemCategory =
  | 'Electronics'
  | 'Computers & Accessories'
  | 'Mobiles & Accessories'
  | 'Home & Kitchen'
  | 'Home Appliances'
  | 'Fashion'
  | 'Beauty & Personal Care'
  | 'Health & Household'
  | 'Sports & Outdoors'
  | 'Books'
  | 'Toys & Games'
  | 'Automotive'
  | 'Art & Crafts'
  | 'Software'
  | 'Courses'
  | 'Lifestyle';

export type Lesson = {
  title: string;
  duration: string;
  content: string;
}

export type Item = {
  id: string;
  name: string;
  description: string;
  price: number;
  type: 'product' | 'course';
  category: ItemCategory;
  vendor: string;
  vendorId: string;
  rating: number;
  imageId: string;
  stock?: number;
  lessons?: Lesson[];
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
    itemType: 'product' | 'course';
    itemName: string;
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

export type Address = {
    id: string;
    userId: string;
    fullName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    isDefault: boolean;
};

export type UserProfile = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  dateJoined: string;
}

export type Question = {
    id: string;
    userId: string;
    userName: string;
    itemId: string;
    itemType: 'product' | 'course';
    question: string;
    createdAt: string;
};

export type Answer = {
    id: string;
    questionId: string;
    userId: string;
    userName: string;
    answer: string;
    createdAt: string;
};
