import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-muslin">
      {/* HERO IMAGE */}
      <div className="relative h-[78vh] min-h-[620px] w-full lg:h-[calc(100vh-72px)]">
        <Image
          src="/images/hero-fashion.png"
          alt="SOZAN editorial fashion"
          fill
          priority
          quality={80}
          sizes="100vw"
          className="object-cover object-center"
        />

        {/* Very subtle image treatment */}
        <div className="absolute inset-0 bg-gradient-to-r from-thread-black/35 via-transparent to-thread-black/10" />

        <div className="absolute inset-0 bg-gradient-to-t from-thread-black/35 via-transparent to-transparent" />

        {/* TOP LABEL */}
        <div className="absolute left-6 right-6 top-6 sm:left-10 sm:right-10 lg:left-16 lg:right-16">
          <div className="mx-auto flex max-w-[1440px] items-start justify-between">
            {/* LEFT LABEL */}
            <div>
              <div className="flex items-center gap-3">
                <span className="h-1.5 w-1.5 rounded-full bg-awadh-terracotta" />

                <span className="font-utility text-[8px] tracking-[0.24em] text-muslin">
                  SOZAN — CONTEMPORARY INDIAN WEAR
                </span>
              </div>

              {/* SHORT EDITORIAL LINE */}
              <div className="mt-4 h-px w-100 bg-muslin/30" />
            </div>

            {/* SLIDE NUMBER */}
            <span className="font-utility text-[8px] tracking-[0.2em] text-muslin/80">
              01 / 04
            </span>
          </div>
        </div>

        {/* EDITORIAL SIDE LABEL */}
        <div className="absolute right-6 top-1/2 hidden -translate-y-1/2 lg:block">
          <div className="flex items-center gap-3 [writing-mode:vertical-rl]">
            <span className="h-12 w-px bg-muslin/60" />

            <span className="font-utility text-[8px] tracking-[0.28em] text-muslin/80">
              DRESS WITH INTENTION
            </span>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="absolute inset-x-6 bottom-8 sm:inset-x-10 sm:bottom-10 lg:inset-x-16 lg:bottom-14">
          <div className="mx-auto max-w-[1440px]">
            <div className="grid items-end gap-10 lg:grid-cols-[1fr_auto]">
              {/* LEFT — TITLE */}
              <div className="max-w-4xl">
                <div className="mb-6 flex items-center gap-4">
                  <span className="h-px w-12 bg-muslin/80" />

                  <span className="font-utility text-[8px] tracking-[0.24em] text-muslin">
                    THE NEW EVERYDAY
                  </span>
                </div>

                <h1 className="font-display text-5xl leading-[0.88] tracking-tight text-muslin sm:text-7xl lg:text-[7.5rem]">
                  Wear what
                  <br />
                  <span className="ml-[8vw] italic">feels yours.</span>
                </h1>
              </div>

              {/* RIGHT — CTA */}
              <div className="lg:pb-2">
                <p className="mb-6 max-w-xs font-editorial text-base leading-relaxed text-muslin/85 sm:text-lg">
                  Thoughtful pieces for the way you live, move, and express
                  yourself.
                </p>

                <Link
                  href="#collection"
                  className="group inline-flex items-center gap-6 border border-muslin/80 bg-muslin px-6 py-4 font-utility text-[8px] tracking-[0.2em] text-thread-black transition-all duration-300 hover:bg-transparent hover:text-muslin"
                >
                  DISCOVER THE COLLECTION
                  <ArrowUpRight
                    size={16}
                    strokeWidth={1.25}
                    className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                  />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* SMALL AWADHI ACCENT */}
        <div className="absolute bottom-7 right-6 sm:right-10 lg:right-16">
          <div className="flex items-center gap-3">
            <span className="font-utility text-[7px] tracking-[0.2em] text-muslin/70">
              CRAFTED IN INDIA
            </span>

            <span className="h-1.5 w-1.5 rounded-full bg-awadh-terracotta" />
          </div>
        </div>
      </div>

      {/* BELOW HERO — EDITORIAL STRIP */}
      <div className="border-b border-kora bg-muslin px-6 sm:px-10 lg:px-16">
        <div className="mx-auto flex max-w-[1440px] flex-col justify-between gap-5 py-5 sm:flex-row sm:items-center">
          <p className="font-editorial text-sm italic text-thread-grey sm:text-base">
            Clothing with character. Style with a point of view.
          </p>

          <div className="flex items-center gap-4">
            <span className="font-utility text-[8px] tracking-[0.18em] text-thread-grey">
              SCROLL TO EXPLORE
            </span>

            <span className="h-px w-10 bg-awadh-terracotta" />
          </div>
        </div>
      </div>
    </section>
  );
}
