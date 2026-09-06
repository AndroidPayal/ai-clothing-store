import Product from "@/models/Product";

export type CheckoutItemInput = {
  product: {
    id: number;
  };
  quantity: number;
};

export type CustomerInput = {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  pinCode: string;
};

export async function buildTrustedOrderData(items: CheckoutItemInput[]) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Cart is empty");
  }

  const normalizedItems = items.map((item) => ({
    productId: Number(item?.product?.id),
    quantity: Number(item?.quantity),
  }));

  if (
    normalizedItems.some(
      (item) =>
        !Number.isInteger(item.productId) ||
        !Number.isInteger(item.quantity) ||
        item.quantity < 1 ||
        item.quantity > 99,
    )
  ) {
    throw new Error("Invalid cart items");
  }

  const productIds = [
    ...new Set(normalizedItems.map((item) => item.productId)),
  ];

  const products = await Product.find({
    id: { $in: productIds },
  }).lean();

  const productMap = new Map(products.map((product) => [product.id, product]));

  if (products.length !== productIds.length) {
    throw new Error("One or more products are no longer available");
  }

  let total = 0;

  const trustedItems = normalizedItems.map((item) => {
    const product = productMap.get(item.productId);

    if (!product) {
      throw new Error("Product not found");
    }

    if (!product.inStock) {
      throw new Error(`${product.title} is currently out of stock`);
    }

    total += product.price * item.quantity;

    return {
      product: {
        id: product.id,
        title: product.title,
        price: product.price,
        inStock: product.inStock,
        thumbnail: product.thumbnail,
        image: product.image,
        category: product.category,
        description: product.description,
      },
      quantity: item.quantity,
    };
  });

  return {
    items: trustedItems,
    total,
  };
}

export function validateCustomer(customer: CustomerInput) {
  if (!customer) {
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

  return {
    fullName: customer.fullName.trim(),
    phone: customer.phone.trim(),
    address: customer.address.trim(),
    city: customer.city.trim(),
    pinCode: customer.pinCode.trim(),
  };
}
