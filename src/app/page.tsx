import Navbar from "../components/Navbar";

export default function Home() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-6xl font-bold">
          AI Clothing Store
        </h1>

        <p className="mt-6 text-lg text-gray-600">
          Modern fashion powered by Artificial Intelligence.
        </p>
      </main>
    </>
  );
}