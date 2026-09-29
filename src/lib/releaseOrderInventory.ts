import mongoose from "mongoose";

import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";

/** Releases one pending reservation together with its stock, atomically. */
export async function releaseOrderInventory(orderId: string): Promise<boolean> {
  await connectDB();
  const session = await mongoose.startSession();

  try {
    let completed = false;

    await session.withTransaction(async () => {
      const order = await Order.findOneAndUpdate(
        {
          _id: orderId,
          status: "Pending",
          "inventory.reserved": true,
          "inventory.released": false,
        },
        {
          $set: {
            "inventory.reserved": false,
            "inventory.released": true,
            status: "Cancelled",
          },
        },
        { new: true, session },
      );

      if (!order) {
        const existing = await Order.findById(orderId)
          .select("inventory")
          .session(session)
          .lean();
        completed = existing?.inventory?.released === true;
        return;
      }

      for (const item of order.items) {
        if (
          !Number.isInteger(item?.product?.id) ||
          !Number.isInteger(item.quantity) ||
          item.quantity <= 0
        ) {
          throw new Error(`Invalid inventory data for order ${order._id}`);
        }

        const product = await Product.findOneAndUpdate(
          { id: item.product.id },
          { $inc: { stockQuantity: item.quantity } },
          { new: true, runValidators: true, session },
        );

        if (!product) {
          throw new Error(
            `Product ${item.product.id} not found while releasing inventory`,
          );
        }

        await Product.updateOne(
          { _id: product._id },
          { $set: { inStock: product.stockQuantity > 0 } },
          { session },
        );
      }

      completed = true;
    });

    return completed;
  } catch (error) {
    console.error("INVENTORY RELEASE FAILED:", error);
    return false;
  } finally {
    await session.endSession();
  }
}
