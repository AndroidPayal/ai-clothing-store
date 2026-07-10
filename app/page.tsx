import Navbar from "../components/Navbar";

export default function Home() {
  return (
    <nav className="flex items-center justify-between px-8 py-4 shadow-md">
      <h1 className="text-2xl font-bold text-blue-600">
        AI Clothing Store
      </h1>

      <div className="flex gap-6">
        <a href="#" className="hover:text-blue-600">Home</a>
        <a href="#" className="hover:text-blue-600">Men</a>
        <a href="#" className="hover:text-blue-600">Women</a>
        <a href="#" className="hover:text-blue-600">Contact</a>
      </div>
    </nav>
  );
}