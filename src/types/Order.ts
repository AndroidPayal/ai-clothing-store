import { CartItem } from "@/types/Product";

export type OrderStatus =
  | "Pending"
  | "Confirmed"
  | "Shipped"
  | "Delivered"
  | "Cancelled";

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

  status: OrderStatus;

  createdAt: string;
};
