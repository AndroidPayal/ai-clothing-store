import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";

type ReservationInput = Parameters<typeof Order.create>[0] & {
  items: {
    product: {
      id: number;
      title: string;
    };
    quantity: number;
  }[];
};

/**
 * Creates the order and removes every reserved unit
 * in one real MongoDB transaction.
 *
 * Razorpay IDs are intentionally NOT created here because
 * the Razorpay order does not exist yet.
 */
export async function reserveOrderInventory(
  input: ReservationInput,
): Promise<{ _id: { toString(): string } }> {
  await connectDB();

  const session = await mongoose.startSession();

  try {
    let order: { _id: { toString(): string } } | undefined;

    await session.withTransaction(async () => {
      for (const item of input.items) {
        const product = await Product.findOneAndUpdate(
          {
            id: item.product.id,
            stockQuantity: {
              $gte: item.quantity,
            },
          },
          {
            $inc: {
              stockQuantity: -item.quantity,
            },
          },
          {
            new: true,
            runValidators: true,
            session,
          },
        );

        if (!product) {
          throw new Error(
            `${item.product.title} is no longer available in the requested quantity`,
          );
        }

        await Product.updateOne(
          {
            _id: product._id,
          },
          {
            $set: {
              inStock: product.stockQuantity > 0,
            },
          },
          {
            session,
          },
        );
      }

      const orderData = {
        ...input,

        // Do not create placeholder Razorpay IDs.
        // These will be added after Razorpay successfully
        // creates the payment order.
        payment: {
          refundStatus: "",
          refundError: "",
          refundAttemptCount: 0,
          refundLastAttemptAt: null,
        },

        inventory: {
          ...input.inventory,
          reserved: true,
          released: false,
        },
      };

      const created = await Order.create([orderData], {
        session,
      });

      order = created[0] as unknown as {
        _id: {
          toString(): string;
        };
      };
    });

    if (!order) {
      throw new Error("Inventory reservation did not commit");
    }

    return order;
  } finally {
    await session.endSession();
  }
}
