import mongoose, { Schema, model, models, Document } from "mongoose";

export interface IReview extends Document {
  userId: mongoose.Types.ObjectId;
  productId: number;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    productId: {
      type: Number,
      required: true,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    comment: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
  },
);

// One user can review a product only once
reviewSchema.index(
  {
    userId: 1,
    productId: 1,
  },
  {
    unique: true,
  },
);

const Review = models.Review || model<IReview>("Review", reviewSchema);

export default Review;
