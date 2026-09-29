"use client";

import Image from "next/image";
import Link from "next/link";

const collections = [
  {
    number: "01",
    title: "Men",
    subtitle: "Modern essentials",
    image: "/images/collections/men.jpg",
    href: "/products?category=men",
  },
  {
    number: "02",
    title: "Women",
    subtitle: "Elegant everyday fashion",
    image: "/images/collections/women.jpg",
    href: "/products?category=women",
  },
  {
    number: "03",
    title: "Kids",
    subtitle: "Little styles, big personality",
    image: "/images/collections/kids-image.jpg",
    href: "/products?category=kids",
  },
];

export default function CollectionReveal() {
  return (
    <section className="bg-muslin px-5 py-20 sm:px-8 sm:py-28 lg:px-16 lg:py-32">
      <div className="mx-auto max-w-[1440px]">
        {/* Section Header */}
        <div className="flex items-center justify-between border-b border-kora pb-4 sm:pb-5">
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 shrink-0 rounded-full bg-awadh-terracotta"
            />

            <span className="font-utility text-[8px] tracking-[0.18em] text-thread-grey sm:text-[9px]">
              FIND YOUR DIRECTION
            </span>
          </div>

          <span className="hidden font-utility text-[8px] tracking-[0.18em] text-thread-grey sm:block">
            04 / COLLECTION
          </span>
        </div>

        {/* Intro */}
        <div className="flex flex-col gap-10 py-12 sm:py-16 md:flex-row md:items-end md:justify-between md:gap-12">
          <div>
            {/* Eyebrow */}
            <div className="mb-6 flex items-center gap-3 sm:mb-7 sm:gap-4">
              <span
                aria-hidden="true"
                className="h-px w-8 bg-awadh-ink sm:w-10"
              />

              <span className="font-utility text-[8px] tracking-[0.2em] text-awadh-ink sm:text-[9px] sm:tracking-[0.22em]">
                THE COLLECTION
              </span>
            </div>

            <h2 className="font-display text-[2.8rem] leading-[0.94] tracking-tight text-thread-black sm:text-6xl lg:text-7xl">
              Find what
              <br />
              feels like you.
            </h2>

            {/* Editorial Detail */}
            <div className="mt-7 flex items-center gap-3 sm:mt-8">
              <span
                aria-hidden="true"
                className="h-px w-10 bg-awadh-terracotta sm:w-14"
              />

              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full bg-awadh-terracotta"
              />
            </div>
          </div>

          <p className="max-w-md font-editorial text-base leading-relaxed text-thread-grey sm:text-lg md:text-xl">
            Different pieces. Different moods. One collection shaped around the
            way you want to be seen.
          </p>
        </div>

        {/* Collection Cards */}
        <div className="grid gap-5 sm:gap-6 md:grid-cols-3">
          {collections.map((collection) => (
            <Link
              key={collection.title}
              href={collection.href}
              aria-label={`Explore ${collection.title} collection`}
              className="group relative block overflow-hidden border border-kora bg-kora focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-awadh-terracotta focus-visible:ring-offset-2"
            >
              {/* Image */}
              <div className="relative aspect-[4/5] overflow-hidden bg-kora">
                <Image
                  src={collection.image}
                  alt={`${collection.title} collection`}
                  fill
                  priority={collection.number === "01"}
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                  sizes="(max-width: 767px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />

                {/* Image Overlay */}
                <div className="absolute inset-0 bg-thread-black/10 transition-colors duration-500 group-hover:bg-thread-black/30" />

                {/* Number */}
                <div className="absolute right-4 top-4 sm:right-5 sm:top-5">
                  <span className="font-display text-4xl leading-none text-muslin/75 sm:text-5xl">
                    {collection.number}
                  </span>
                </div>

                {/* Corner Detail */}
                <div
                  aria-hidden="true"
                  className="absolute bottom-5 right-5 h-8 w-8 border-b border-r border-awadh-terracotta/80 opacity-0 transition-all duration-500 group-hover:h-12 group-hover:w-12 group-hover:opacity-100"
                />

                {/* Explore */}
                <div className="absolute bottom-5 left-5 hidden sm:block">
                  <span className="inline-block translate-y-2 bg-muslin px-4 py-2.5 font-utility text-[9px] tracking-[0.18em] text-thread-black opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                    EXPLORE
                  </span>
                </div>
              </div>

              {/* Card Information */}
              <div className="border-t border-kora p-5 sm:p-6">
                <p className="font-utility text-[8px] tracking-[0.2em] text-thread-grey">
                  COLLECTION
                </p>

                <div className="mt-3 flex items-end justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="font-display text-2xl leading-tight text-thread-black transition-colors duration-300 group-hover:text-awadh-ink sm:text-[1.7rem]">
                      {collection.title}
                    </h3>

                    <p className="mt-2 font-editorial text-sm leading-relaxed text-thread-grey sm:text-base">
                      {collection.subtitle}
                    </p>
                  </div>

                  <span
                    aria-hidden="true"
                    className="mb-1 shrink-0 text-xl text-thread-black transition-all duration-300 group-hover:translate-x-1 group-hover:text-awadh-ink"
                  >
                    →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom Editorial Line */}
        <div className="mt-12 flex items-center justify-between border-t border-kora pt-5 sm:mt-16 sm:pt-6">
          <span className="font-utility text-[7px] tracking-[0.18em] text-thread-grey sm:text-[8px]">
            MEN / WOMEN / KIDS
          </span>

          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="h-px w-8 bg-awadh-terracotta sm:w-12"
            />

            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 rounded-full bg-awadh-terracotta"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
