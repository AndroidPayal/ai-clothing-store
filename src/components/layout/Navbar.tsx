import Link from "next/link";


type NavbarProps = {
  cartCount : number;
  wishlistCount : number;
};

export default function Navbar({
  cartCount,
  wishlistCount
} : NavbarProps) {
  return (
    <header className="border-b">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <h1 className="text-xl font-bold">
          AI Clothing Store
        </h1>

        <div className="flex gap-8">

         <div className="flex items-center gap-6">

    <Link
        href="/wishlist"
        className="relative text-2xl"
    >
        🤍

        {wishlistCount > 0 && (
            <span
                className="
                    absolute
                    -top-2
                    -right-3
                    rounded-full
                    bg-red-500
                    text-white
                    text-xs
                    w-5
                    h-5
                    flex
                    items-center
                    justify-center
                "
            >
                {wishlistCount}
            </span>
        )}
    </Link>

    <Link
        href="/cart"
        className="relative text-2xl"
    >
        🛒

        {cartCount > 0 && (
            <span
                className="
                    absolute
                    -top-2
                    -right-3
                    rounded-full
                    bg-blue-600
                    text-white
                    text-xs
                    w-5
                    h-5
                    flex
                    items-center
                    justify-center
                "
            >
                {cartCount}
            </span>
        )}
    </Link>

</div>

          <Link href="/">Home</Link>
          <Link href="/">Shop</Link>
          <Link href="/wishlist">Wishlist</Link>
          <Link href="/cart">Cart</Link>
          <Link href="/orders">Orders</Link>

        </div>
      </nav>
    </header>
  );
}