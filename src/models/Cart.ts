import mongoose, { Schema, model, models } from "mongoose";

const cartItemSchema = new Schema(
  {
    product: {
      type: Object,
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  {
    _id: false,
  },
);

const cartSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    items: {
      type: [cartItemSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

const Cart = models.Cart || model("Cart", cartSchema);

export default Cart;
