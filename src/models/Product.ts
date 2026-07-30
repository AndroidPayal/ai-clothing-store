import mongoose, { Schema, model, models, Document } from "mongoose";

export interface IProduct extends Document {
  id: number;
  title: string;
  price: number;
  inStock: boolean;
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
    },

    price: {
      type: Number,
      required: true,
    },

    inStock: {
      type: Boolean,
      required: true,
      default: true,
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
  {
    timestamps: true,
  },
);

const Product = models.Product || model<IProduct>("Product", productSchema);

export default Product;
