import mongoose, { 
  Schema, 
  model, 
  models } from "mongoose";

export interface IUser extends Document {
  fullName: string;
  email: string;
  password: string;
}

const userSchema = new Schema<IUser>(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const User =
  models.User ||
  model<IUser>("User", userSchema);

export default User;