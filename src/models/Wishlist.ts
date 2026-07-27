import { Schema, model, models } from "mongoose";

const wishlistSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    items: {
      type: [Object],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

const Wishlist = models.Wishlist || model("Wishlist", wishlistSchema);

export default Wishlist;
