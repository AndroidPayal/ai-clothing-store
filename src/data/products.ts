
export type Product = {
  id: number;
  title: string;
  price: number;
  inStock: boolean;
  thumbnail: string;
  image: string;  
  category: string;
  description: string;
};

export type CartItem = {
  product : Product;
  quantity : number;
}

export type Order = {
    id: string;
    items: CartItem[];
    total: number;

    customer: {
        fullName: string;
        phone: string;
        address: string;
        city: string;
        pinCode: string;
    };

    createdAt: string;
};

export const products: Product[] = [
  {
    id: 1,
    title: "Blue T-Shirt",
    price: 799,
    inStock: true,
    thumbnail: "/images/products/thumb_1.jpg",
    image: "/images/products/image_1.jpg",
    category:"Top wear",
    description:"Men's pure cotton blue shirt"
  },
  {
    id: 2,
    title: "Black Jeans",
    price: 1499,
    inStock: false,
    thumbnail: "/images/products/thumb_2.jpg",
    image: "/images/products/image_2.jpg",
    category:'Bottom wear',
    description:"solid black jeans for womens"
  },
  {
    id: 3,
    title: "White Shoes",
    price: 2499,
    inStock: true,
    thumbnail: "/images/products/thumb_3.jpg",
    image: "/images/products/image_3.jpg",
    category: "Shoes",
    description: "White men's shoes with washable soul"
  },
];