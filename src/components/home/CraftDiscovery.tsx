import Image from "next/image";

export default function CraftDiscovery() {
  return (
    <section className="relative overflow-hidden bg-kora px-4 py-16 sm:px-10 sm:py-28 lg:px-16">
      <div className="mx-auto max-w-[1440px]">
        {/* HEADER */}
        <div className="flex items-center justify-between gap-4 border-b border-thread-grey/30 pb-5">
          <span className="font-utility text-[8px] tracking-[0.18em] text-thread-grey sm:text-[9px] sm:tracking-[0.2em]">
            02 — THE IDEA
          </span>

          <span className="hidden text-right font-utility text-[7px] tracking-[0.14em] text-thread-grey sm:block sm:text-[8px] sm:tracking-[0.18em]">
            CLOTH / IDENTITY / POSSIBILITY
          </span>
        </div>

        <div className="grid gap-14 py-14 sm:gap-16 sm:py-20 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-24">
          {/* LEFT */}
          <div>
            <div className="mb-7 flex items-center gap-3 sm:mb-8 sm:gap-4">
              <span className="h-px w-8 bg-awadh-ink sm:w-10" />

              <span className="font-utility text-[8px] tracking-[0.18em] text-awadh-ink sm:text-[9px] sm:tracking-[0.22em]">
                MORE THAN CLOTHES
              </span>
            </div>

            <h2 className="max-w-2xl font-display text-[3rem] leading-[0.94] tracking-tight text-thread-black sm:text-6xl lg:text-[5.5rem]">
              What if your
              <br />
              clothes
              <br />
              understood you?
            </h2>

            <div className="mt-8 max-w-xl sm:mt-10">
              <p className="font-editorial text-base leading-relaxed text-thread-grey sm:text-xl">
                Your wardrobe already holds possibilities. The question is not
                how much you own.
              </p>

              <p className="mt-5 font-editorial text-base leading-relaxed text-thread-grey sm:mt-6 sm:text-lg">
                It is how many ways you have yet to see it.
              </p>
            </div>

            <div className="mt-10 flex items-center gap-4 sm:mt-12">
              <span className="font-display text-3xl text-awadh-ink/80">
                ०२
              </span>

              <div>
                <p className="font-utility text-[8px] tracking-[0.2em] text-thread-black">
                  DISCOVERY
                </p>

                <p className="mt-1 font-editorial text-sm italic text-thread-grey">
                  Style begins with possibility.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="relative mt-2 sm:mt-0">
            <div className="group relative ml-auto aspect-[4/5] w-[91%] overflow-hidden bg-muslin sm:w-[82%]">
              <Image
                src="/images/silk-image.png"
                alt="Handwoven silk fabric"
                fill
                className="object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                sizes="(max-width: 640px) 82vw, (max-width: 1024px) 70vw, 42vw"
              />

              <div className="absolute inset-0 bg-thread-black/[0.04]" />

              <div className="absolute right-3 top-3 sm:right-4 sm:top-4">
                <span className="font-utility text-[7px] tracking-[0.16em] text-muslin/80 sm:text-[8px] sm:tracking-[0.18em]">
                  01 / TEXTILE
                </span>
              </div>
            </div>

            <div className="absolute left-0 top-[12%] max-w-[190px] bg-thread-black px-4 py-3 sm:max-w-none sm:px-6 sm:py-4">
              <p className="font-utility text-[7px] tracking-[0.18em] text-muslin sm:text-[8px] sm:tracking-[0.2em]">
                FABRIC / FORM
              </p>

              <p className="mt-1 font-editorial text-xs italic text-muslin/70 sm:text-sm">
                The material matters.
              </p>
            </div>

            <div className="absolute bottom-[-3%] left-0">
              <span className="font-display text-[6rem] leading-none text-thread-black/[0.07] sm:text-[11rem]">
                02
              </span>
            </div>

            <div className="absolute bottom-[8%] right-[-1%] hidden h-16 w-16 border border-awadh-ink/50 sm:block" />
          </div>
        </div>

        {/* BOTTOM */}
        <div className="flex flex-col gap-5 border-t border-thread-grey/30 pt-6 sm:flex-row sm:items-end sm:justify-between sm:gap-6 sm:pt-7">
          <p className="max-w-2xl font-editorial text-lg italic leading-relaxed text-thread-black sm:text-2xl">
            Thirty-two possibilities can live inside one familiar wardrobe.
          </p>

          <span className="font-utility text-[7px] tracking-[0.2em] text-awadh-ink sm:text-[8px] sm:tracking-[0.22em]">
            LOOK CLOSER →
          </span>
        </div>
      </div>
    </section>
  );
}
