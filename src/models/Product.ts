import mongoose, { Schema, model, models, Document } from "mongoose";

export interface IProduct extends Document {
  id: number;
  title: string;
  price: number;
  inStock: boolean;
  stockQuantity: number;
  thumbnail: string;
  image: string;
  category: string;
  description: string;
}

const productSchema = new Schema<IProduct>(
  {
    id: {
      type: Number,
      required: true,
      unique: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    /*
     * Kept for compatibility with the existing application.
     *
     * stockQuantity is now the real inventory value.
     */
    inStock: {
      type: Boolean,
      required: true,
      default: true,
    },

    /*
     * Actual inventory quantity.
     *
     * Example:
     * 10 = ten pieces available
     * 1  = one piece available
     * 0  = out of stock
     */
    stockQuantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    thumbnail: {
      type: String,
      required: true,
      trim: true,
    },

    image: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

const Product = models.Product || model<IProduct>("Product", productSchema);

export default Product;
