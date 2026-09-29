import mongoose, { Schema, model, models, Document } from "mongoose";

export type OrderStatus =
  | "Pending"
  | "Confirmed"
  | "Shipped"
  | "Delivered"
  | "Cancelled";

export type RefundStatus = "" | "Processing" | "Refunded" | "Failed";

export interface IOrder extends Document {
  userId: mongoose.Types.ObjectId;

  checkoutIdempotencyKey: string;
  checkoutFingerprint: string;

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

    refundStatus: RefundStatus;
    razorpayRefundId: string;
    refundError: string;
    refundAttemptCount: number;
    refundLastAttemptAt?: Date;
  };

  inventory: {
    reserved: boolean;
    released: boolean;
    reservedAt: Date;
    expiresAt: Date;
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
      index: true,
    },

    checkoutIdempotencyKey: {
      type: String,
      required: true,
      trim: true,
      minlength: 16,
      maxlength: 128,
    },

    // Binds an idempotency key to the exact server-normalized checkout.
    checkoutFingerprint: {
      type: String,
      required: true,
      minlength: 64,
      maxlength: 64,
      select: false,
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
      min: 0,
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

      refundStatus: {
        type: String,
        enum: ["", "Processing", "Refunded", "Failed"],
        default: "",
      },

      razorpayRefundId: {
        type: String,
        default: "",
      },

      refundError: { type: String, default: "", maxlength: 1000 },
      refundAttemptCount: { type: Number, default: 0, min: 0 },
      refundLastAttemptAt: { type: Date, default: null },
    },

    inventory: {
      reserved: {
        type: Boolean,
        required: true,
        default: false,
      },

      released: {
        type: Boolean,
        required: true,
        default: false,
      },

      reservedAt: {
        type: Date,
        default: Date.now,
      },

      expiresAt: {
        type: Date,
        required: true,
      },
    },

    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

/*
 * One checkout attempt = one order per user.
 */
orderSchema.index(
  {
    userId: 1,
    checkoutIdempotencyKey: 1,
  },
  {
    unique: true,
    name: "unique_user_checkout_idempotency",
  },
);

/*
 * One Razorpay order = one internal order.
 */
orderSchema.index(
  {
    "payment.razorpayOrderId": 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      "payment.razorpayOrderId": {
        $type: "string",
        $ne: "",
      },
    },
    name: "unique_razorpay_order_id",
  },
);

/*
 * One Razorpay payment = one internal order.
 */
orderSchema.index(
  {
    "payment.razorpayPaymentId": 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      "payment.razorpayPaymentId": {
        $type: "string",
        $ne: "",
      },
    },
    name: "unique_razorpay_payment_id",
  },
);

/*
 * One Razorpay refund = one internal order.
 */
orderSchema.index(
  {
    "payment.razorpayRefundId": 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      "payment.razorpayRefundId": {
        $type: "string",
        $ne: "",
      },
    },
    name: "unique_razorpay_refund_id",
  },
);

orderSchema.index({
  userId: 1,
  createdAt: -1,
});

orderSchema.index({
  status: 1,
  "inventory.expiresAt": 1,
});

const Order = models.Order || model<IOrder>("Order", orderSchema);

export default Order;
