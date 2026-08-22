"use client";

import Image from "next/image";
import Link from "next/link";

const collections = [
  {
    title: "New Arrivals",
    subtitle: "Fresh styles, just for you",
    image: "/images/collections/new-arrivals.jpg",
    href: "/products",
  },
  {
    title: "Women",
    subtitle: "Elegant everyday fashion",
    image: "/images/collections/women.jpg",
    href: "/products?category=women",
  },
  {
    title: "Men",
    subtitle: "Modern essentials",
    image: "/images/collections/men.jpg",
    href: "/products?category=men",
  },
];

export default function CollectionReveal() {
  return (
    <section className="bg-muslin px-6 py-24 sm:px-10 sm:py-32 lg:px-16">
      <div className="mx-auto max-w-[1440px]">
        {/* Section label */}
        <div className="flex items-center justify-between border-b border-kora pb-5">
          {/* <span className="font-utility text-[9px] tracking-[0.22em] text-awadh-ink">
            03 — COLLECTIONS
          </span> */}

          <span className="font-utility text-[9px] tracking-[0.18em] text-thread-grey">
            FIND YOUR DIRECTION
          </span>
        </div>

        {/* Heading */}
        <div className="flex flex-col justify-between gap-8 py-16 md:flex-row md:items-end">
          <div>
            <div className="mb-7 flex items-center gap-4">
              <span className="h-px w-10 bg-awadh-ink" />

              <span className="font-utility text-[9px] tracking-[0.22em] text-awadh-ink">
                THE COLLECTION
              </span>
            </div>

            <h2 className="font-display text-5xl leading-[0.95] tracking-tight text-thread-black sm:text-6xl lg:text-7xl">
              Find what
              <br />
              feels like you.
            </h2>
          </div>

          <p className="max-w-md font-editorial text-lg leading-relaxed text-thread-grey sm:text-xl">
            Different pieces. Different moods. One collection shaped around the
            way you want to be seen.
          </p>
        </div>

        {/* Collections */}
        <div className="grid gap-6 md:grid-cols-3">
          {collections.map((collection, index) => (
            <Link
              key={collection.title}
              href={collection.href}
              className="group relative block overflow-hidden border border-kora bg-kora"
            >
              {/* Image */}
              <div className="relative aspect-[4/5] overflow-hidden">
                <Image
                  src={collection.image}
                  alt={collection.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-thread-black/10 transition-colors duration-500 group-hover:bg-thread-black/30" />

                {/* Number */}
                <div className="absolute right-5 top-5">
                  <span className="font-display text-5xl leading-none text-muslin/70">
                    0{index + 1}
                  </span>
                </div>

                {/* Explore */}
                <div className="absolute bottom-5 left-5 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                  <span className="bg-muslin px-4 py-2.5 font-utility text-[9px] tracking-[0.18em] text-thread-black">
                    EXPLORE
                  </span>
                </div>
              </div>

              {/* Information */}
              <div className="border-t border-kora p-5 sm:p-6">
                <p className="font-utility text-[8px] tracking-[0.2em] text-thread-grey">
                  COLLECTION
                </p>

                <div className="mt-3 flex items-end justify-between gap-4">
                  <div>
                    <h3 className="font-display text-2xl leading-tight text-thread-black transition-colors group-hover:text-awadh-ink">
                      {collection.title}
                    </h3>

                    <p className="mt-2 font-editorial text-base text-thread-grey">
                      {collection.subtitle}
                    </p>
                  </div>

                  <span className="mb-1 text-xl text-thread-black transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
