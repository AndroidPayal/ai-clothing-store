import Product from "@/models/Product";

export type CheckoutItemInput = {
  productId: number;
  quantity: number;
};

export type CustomerInput = {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  pinCode: string;
};

const MAX_ITEM_QUANTITY = 99;
const MAX_CART_ITEMS = 50;

export async function buildTrustedOrderData(items: CheckoutItemInput[]) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Cart is empty");
  }

  if (items.length > MAX_CART_ITEMS) {
    throw new Error("Too many items in cart");
  }

  const normalizedItems = items.map((item) => ({
    productId: Number(item?.productId),
    quantity: Number(item?.quantity),
  }));

  if (
    normalizedItems.some(
      (item) =>
        !Number.isInteger(item.productId) ||
        item.productId <= 0 ||
        !Number.isInteger(item.quantity) ||
        item.quantity < 1 ||
        item.quantity > MAX_ITEM_QUANTITY,
    )
  ) {
    throw new Error("Invalid cart items");
  }

  /*
   * Prevent duplicate product entries.
   */
  const productIds = normalizedItems.map((item) => item.productId);

  const uniqueProductIds = [...new Set(productIds)];

  if (uniqueProductIds.length !== productIds.length) {
    throw new Error("Duplicate products are not allowed");
  }

  /*
   * Fetch products ONLY from MongoDB.
   *
   * Price and inventory are never trusted from the client.
   */
  const products = await Product.find({
    id: { $in: uniqueProductIds },
  }).lean();

  if (products.length !== uniqueProductIds.length) {
    throw new Error("One or more products are no longer available");
  }

  const productMap = new Map(products.map((product) => [product.id, product]));

  let total = 0;

  const trustedItems = normalizedItems.map((item) => {
    const product = productMap.get(item.productId);

    if (!product) {
      throw new Error("Product not found");
    }

    /*
     * Inventory must be configured correctly.
     *
     * Existing products that don't have stockQuantity
     * will be treated as unavailable until an admin
     * sets their inventory.
     */
    if (
      typeof product.stockQuantity !== "number" ||
      !Number.isInteger(product.stockQuantity) ||
      product.stockQuantity < 0
    ) {
      throw new Error(`${product.title} has invalid inventory`);
    }

    /*
     * Do not allow checkout when there is no stock.
     */
    if (product.stockQuantity <= 0) {
      throw new Error(`${product.title} is currently out of stock`);
    }

    /*
     * IMPORTANT:
     *
     * Prevent the customer from ordering more pieces
     * than the currently available inventory.
     */
    if (item.quantity > product.stockQuantity) {
      throw new Error(
        `Only ${product.stockQuantity} ${
          product.stockQuantity === 1 ? "piece" : "pieces"
        } of ${product.title} are available`,
      );
    }

    /*
     * Keep inStock compatible with the existing schema,
     * but derive it from the real inventory.
     */
    const inStock = product.stockQuantity > 0;

    /*
     * Price comes ONLY from MongoDB.
     *
     * Never use a price supplied by the browser.
     */
    if (
      typeof product.price !== "number" ||
      !Number.isFinite(product.price) ||
      product.price < 0
    ) {
      throw new Error(`Invalid price configured for ${product.title}`);
    }

    total += product.price * item.quantity;

    return {
      product: {
        id: product.id,
        title: product.title,
        price: product.price,
        inStock,
        thumbnail: product.thumbnail,
        image: product.image,
        category: product.category,
        description: product.description,
      },
      quantity: item.quantity,
    };
  });

  /*
   * Protect against invalid numeric totals.
   */
  if (!Number.isFinite(total) || total <= 0) {
    throw new Error("Invalid order total");
  }

  /*
   * Round to two decimal places before payment.
   */
  total = Math.round(total * 100) / 100;

  return {
    items: trustedItems,
    total,
  };
}

export function validateCustomer(customer: CustomerInput) {
  if (!customer || typeof customer !== "object") {
    throw new Error("Shipping details are required");
  }

  const requiredFields = [
    "fullName",
    "phone",
    "address",
    "city",
    "pinCode",
  ] as const;

  for (const field of requiredFields) {
    if (typeof customer[field] !== "string" || !customer[field].trim()) {
      throw new Error("Please provide complete shipping details");
    }
  }

  const fullName = customer.fullName.trim();
  const phone = customer.phone.trim();
  const address = customer.address.trim();
  const city = customer.city.trim();
  const pinCode = customer.pinCode.trim();

  if (fullName.length < 2 || fullName.length > 80) {
    throw new Error("Please provide a valid full name");
  }

  if (!/^[6-9]\d{9}$/.test(phone)) {
    throw new Error("Please provide a valid 10-digit mobile number");
  }

  if (address.length < 5 || address.length > 300) {
    throw new Error("Please provide a valid shipping address");
  }

  if (city.length < 2 || city.length > 80) {
    throw new Error("Please provide a valid city");
  }

  if (!/^\d{6}$/.test(pinCode)) {
    throw new Error("Please provide a valid 6-digit PIN code");
  }

  return {
    fullName,
    phone,
    address,
    city,
    pinCode,
  };
}
