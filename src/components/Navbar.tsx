import Link from "next/link";

export default function Navbar() {
  return (
    <header className="border-b">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <h1 className="text-xl font-bold">
          AI Clothing Store
        </h1>

        <div className="flex gap-8">
          <Link href="/">Home</Link>
          <Link href="/">Shop</Link>
          <Link href="/">Women</Link>
          <Link href="/">Men</Link>
          <Link href="/">Contact</Link>
        </div>
      </nav>
    </header>
  );
}