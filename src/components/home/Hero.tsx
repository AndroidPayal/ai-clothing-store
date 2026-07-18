import Button from "@/components/ui/Button";

export default function Hero() {
  return (
    <section className="flex min-h-[50vh] flex-col items-center justify-center px-6 text-center">
      <h1 className="text-5xl font-bold">
        Design Your Perfect Outfit with AI
      </h1>

      <p className="mt-6 max-w-2xl text-lg text-gray-600">
        Discover personalized fashion recommendations powered by Artificial
        Intelligence. Create stylish outfits for every occasion.
      </p>

      <div className="mt-8">
        <Button text="Shop Now" />
      </div>
    </section>
  );
}