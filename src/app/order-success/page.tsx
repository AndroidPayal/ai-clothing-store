import Link from "next/link";
import Button from "@/components/ui/Button";

export default function OrderSuccess() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center gap-6">

      <h1 className="text-5xl">🎉</h1>

      <h2 className="text-4xl font-bold">
        Order Placed Successfully!
      </h2>

      <p className="text-center text-gray-600">
        Thank you for shopping with AI Clothing Store.
      </p>

      <Link href="/">
        <Button text="Continue Shopping" />
      </Link>

    </div>
  );
}