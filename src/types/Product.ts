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
  product: Product;
  quantity: number;
};
