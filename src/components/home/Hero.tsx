import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-muslin">
      {/* Desktop editorial hero */}
      <div className="relative hidden w-full lg:block">
        <Image
          src="/images/hero-fashion.png"
          alt="SOZAN — Morning Style editorial fashion look"
          width={1536}
          height={1024}
          priority
          quality={100}
          className="h-auto w-full"
        />

        {/* Invisible CTA hotspot over the artwork */}
        <Link
          href="#collection"
          aria-label="Discover your style"
          className="absolute left-[4.8%] top-[67%] h-[9%] w-[25%]"
        />
      </div>

      {/* Mobile */}
      <div className="relative lg:hidden">
        <Image
          src="/images/Morning Style Editorial Lookbook.png"
          alt="SOZAN — Morning Style editorial fashion look"
          width={1536}
          height={1024}
          priority
          quality={100}
          className="h-auto w-full"
        />

        <Link
          href="#collection"
          aria-label="Discover your style"
          className="absolute left-[5%] top-[67%] h-[10%] w-[40%]"
        />
      </div>
    </section>
  );
}
