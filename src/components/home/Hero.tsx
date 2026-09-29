import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-muslin">
      <div className="relative h-[calc(100svh-64px)] min-h-[600px] w-full sm:h-[calc(100vh-72px)] sm:min-h-[620px] lg:h-[calc(100vh-72px)]">
        <Image
          src="/images/hero-fashion.png"
          alt="SOZAN editorial fashion"
          fill
          priority
          quality={80}
          sizes="100vw"
          className="object-cover object-[58%_center] sm:object-center"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-thread-black/40 via-thread-black/5 to-thread-black/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-thread-black/45 via-transparent to-thread-black/10" />

        {/* TOP LABEL */}
        <div className="absolute left-4 right-4 top-5 sm:left-10 sm:right-10 sm:top-6 lg:left-16 lg:right-16">
          <div className="mx-auto flex max-w-[1440px] items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-start gap-2 sm:items-center sm:gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-awadh-terracotta sm:mt-0" />

                <span className="max-w-[230px] font-utility text-[7px] leading-relaxed tracking-[0.18em] text-muslin sm:max-w-none sm:text-[8px] sm:tracking-[0.24em]">
                  SOZAN — CONTEMPORARY INDIAN WEAR
                </span>
              </div>

              <div className="mt-3 h-px w-24 bg-muslin/30 sm:mt-4 sm:w-40" />
            </div>

            <span className="shrink-0 pt-0.5 font-utility text-[7px] tracking-[0.16em] text-muslin/80 sm:text-[8px] sm:tracking-[0.2em]">
              01 / 04
            </span>
          </div>
        </div>

        {/* SIDE LABEL */}
        <div className="absolute right-5 top-1/2 hidden -translate-y-1/2 lg:block">
          <div className="flex items-center gap-3 [writing-mode:vertical-rl]">
            <span className="h-12 w-px bg-muslin/60" />

            <span className="font-utility text-[8px] tracking-[0.28em] text-muslin/80">
              DRESS WITH INTENTION
            </span>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="absolute inset-x-4 bottom-8 sm:inset-x-10 sm:bottom-10 lg:inset-x-16 lg:bottom-14">
          <div className="mx-auto max-w-[1440px]">
            <div className="grid items-end gap-7 lg:grid-cols-[1fr_auto] lg:gap-10">
              {/* TITLE */}
              <div className="max-w-4xl">
                <div className="mb-5 flex items-center gap-3 sm:mb-6 sm:gap-4">
                  <span className="h-px w-8 bg-muslin/80 sm:w-12" />

                  <span className="font-utility text-[7px] tracking-[0.2em] text-muslin sm:text-[8px] sm:tracking-[0.24em]">
                    THE NEW EVERYDAY
                  </span>
                </div>

                <h1 className="font-display text-[3.25rem] leading-[0.88] tracking-[-0.035em] text-muslin sm:text-7xl sm:tracking-tight lg:text-[7.5rem]">
                  Wear what
                  <br />
                  <span className="ml-[7vw] italic">feels yours.</span>
                </h1>
              </div>

              {/* CTA */}
              <div className="max-w-md lg:pb-2 lg:max-w-xs">
                <p className="mb-5 max-w-xs font-editorial text-sm leading-relaxed text-muslin/85 sm:mb-6 sm:text-lg">
                  Thoughtful pieces for the way you live, move, and express
                  yourself.
                </p>

                <Link
                  href="#collection"
                  className="group inline-flex min-h-12 w-full items-center justify-between gap-5 border border-muslin/80 bg-muslin px-5 py-3.5 font-utility text-[7px] tracking-[0.18em] text-thread-black transition-all duration-300 hover:bg-transparent hover:text-muslin sm:w-auto sm:min-w-[270px] sm:px-6 sm:text-[8px] sm:tracking-[0.2em]"
                >
                  <span>DISCOVER THE COLLECTION</span>

                  <ArrowUpRight
                    size={16}
                    strokeWidth={1.25}
                    className="shrink-0 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                  />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* CRAFTED IN INDIA */}
        <div className="absolute bottom-4 right-4 sm:bottom-7 sm:right-10 lg:right-16">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="font-utility text-[6px] tracking-[0.16em] text-muslin/70 sm:text-[7px] sm:tracking-[0.2em]">
              CRAFTED IN INDIA
            </span>

            <span className="h-1.5 w-1.5 rounded-full bg-awadh-terracotta" />
          </div>
        </div>
      </div>

      {/* EDITORIAL STRIP */}
      <div className="border-b border-kora bg-muslin px-4 sm:px-10 lg:px-16">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-5">
          <p className="max-w-md font-editorial text-sm italic leading-relaxed text-thread-grey sm:text-base">
            Clothing with character. Style with a point of view.
          </p>

          <div className="flex items-center gap-4">
            <span className="font-utility text-[7px] tracking-[0.16em] text-thread-grey sm:text-[8px] sm:tracking-[0.18em]">
              SCROLL TO EXPLORE
            </span>

            <span className="h-px w-8 bg-awadh-terracotta sm:w-10" />
          </div>
        </div>
      </div>
    </section>
  );
}
