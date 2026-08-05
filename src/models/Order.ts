import mongoose, { Schema, model, models, Document } from "mongoose";

export type OrderStatus =
  | "Pending"
  | "Confirmed"
  | "Shipped"
  | "Delivered"
  | "Cancelled";

export interface IOrder extends Document {
  userId: mongoose.Types.ObjectId;

  items: {
    product: {
      id: number;
      title: string;
      price: number;
      inStock: boolean;
      thumbnail: string;
      image: string;
      category: string;
      description: string;
    };
    quantity: number;
  }[];

  total: number;

  customer: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    pinCode: string;
  };

  payment: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  };

  status: OrderStatus;

  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<IOrder>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: [
      {
        product: {
          id: {
            type: Number,
            required: true,
          },

          title: {
            type: String,
            required: true,
          },

          price: {
            type: Number,
            required: true,
          },

          inStock: {
            type: Boolean,
            required: true,
          },

          thumbnail: {
            type: String,
            required: true,
          },

          image: {
            type: String,
            required: true,
          },

          category: {
            type: String,
            required: true,
          },

          description: {
            type: String,
            required: true,
          },
        },

        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
      },
    ],

    total: {
      type: Number,
      required: true,
    },

    customer: {
      fullName: {
        type: String,
        required: true,
      },

      phone: {
        type: String,
        required: true,
      },

      address: {
        type: String,
        required: true,
      },

      city: {
        type: String,
        required: true,
      },

      pinCode: {
        type: String,
        required: true,
      },
    },

    payment: {
      razorpayOrderId: {
        type: String,
        default: "",
      },

      razorpayPaymentId: {
        type: String,
        default: "",
      },

      razorpaySignature: {
        type: String,
        default: "",
      },
    },

    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  },
);

const Order = models.Order || model<IOrder>("Order", orderSchema);

export default Order;
