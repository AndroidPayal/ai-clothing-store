import { Schema, model, models, Document } from "mongoose";

export type WebhookEventStatus = "Processing" | "Processed" | "Failed";

export interface IRazorpayWebhookEvent extends Document {
  eventId: string;
  event: string;
  status: WebhookEventStatus;
  orderId: string;
  paymentId: string;
  error: string;
  processingStartedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const razorpayWebhookEventSchema = new Schema<IRazorpayWebhookEvent>(
  {
    eventId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },

    event: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["Processing", "Processed", "Failed"],
      default: "Processing",
      required: true,
      index: true,
    },

    orderId: {
      type: String,
      default: "",
      trim: true,
    },

    paymentId: {
      type: String,
      default: "",
      trim: true,
    },

    error: {
      type: String,
      default: "",
      trim: true,
    },

    /*
     * Used as a processing lease.
     *
     * If the server crashes while processing a webhook,
     * a later Razorpay retry can reclaim the event after
     * the lease expires.
     */
    processingStartedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

razorpayWebhookEventSchema.index({
  status: 1,
  processingStartedAt: 1,
});

const RazorpayWebhookEvent =
  models.RazorpayWebhookEvent ||
  model<IRazorpayWebhookEvent>(
    "RazorpayWebhookEvent",
    razorpayWebhookEventSchema,
  );

export default RazorpayWebhookEvent;
