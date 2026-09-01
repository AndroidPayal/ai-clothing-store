import Image from "next/image";

export default function CraftDiscovery() {
  return (
    <section className="relative overflow-hidden bg-kora px-6 py-20 sm:px-10 sm:py-28 lg:px-16">
      <div className="mx-auto max-w-[1440px]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-thread-grey/30 pb-5">
          <span className="font-utility text-[9px] tracking-[0.2em] text-thread-grey">
            02 — THE IDEA
          </span>

          <span className="font-utility text-[8px] tracking-[0.18em] text-thread-grey">
            CLOTH / IDENTITY / POSSIBILITY
          </span>
        </div>

        <div className="grid gap-16 py-16 sm:py-20 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-24">
          {/* LEFT */}
          <div>
            <div className="mb-8 flex items-center gap-4">
              <span className="h-px w-10 bg-awadh-ink" />

              <span className="font-utility text-[9px] tracking-[0.22em] text-awadh-ink">
                MORE THAN CLOTHES
              </span>
            </div>

            <h2 className="max-w-2xl font-display text-5xl leading-[0.96] tracking-tight text-thread-black sm:text-6xl lg:text-[5.5rem]">
              What if your
              <br />
              clothes
              <br />
              understood you?
            </h2>

            <div className="mt-10 max-w-xl">
              <p className="font-editorial text-lg leading-relaxed text-thread-grey sm:text-xl">
                Your wardrobe already holds possibilities. The question is not
                how much you own.
              </p>

              <p className="mt-6 font-editorial text-lg leading-relaxed text-thread-grey">
                It is how many ways you have yet to see it.
              </p>
            </div>

            {/* Editorial detail */}
            <div className="mt-12 flex items-center gap-4">
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
          <div className="relative">
            {/* Image */}
            <div className="group relative ml-auto aspect-[4/5] w-[88%] overflow-hidden bg-muslin sm:w-[82%]">
              <Image
                src="/images/silk-image.png"
                alt="Handwoven silk fabric"
                fill
                className="object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                sizes="(max-width: 1024px) 80vw, 42vw"
              />

              <div className="absolute inset-0 bg-thread-black/[0.04]" />

              <div className="absolute right-4 top-4">
                <span className="font-utility text-[8px] tracking-[0.18em] text-muslin/80">
                  01 / TEXTILE
                </span>
              </div>
            </div>

            {/* Offset label */}
            <div className="absolute left-0 top-[12%] bg-thread-black px-5 py-4 sm:px-6">
              <p className="font-utility text-[8px] tracking-[0.2em] text-muslin">
                FABRIC / FORM
              </p>

              <p className="mt-1 font-editorial text-sm italic text-muslin/70">
                The material matters.
              </p>
            </div>

            {/* Large number */}
            <div className="absolute bottom-[-4%] left-0">
              <span className="font-display text-[7rem] leading-none text-thread-black/[0.07] sm:text-[11rem]">
                02
              </span>
            </div>

            {/* Small accent block */}
            <div className="absolute bottom-[8%] right-[-2%] hidden h-16 w-16 border border-awadh-ink/50 sm:block" />
          </div>
        </div>

        {/* Bottom statement */}
        <div className="flex flex-col gap-6 border-t border-thread-grey/30 pt-7 sm:flex-row sm:items-end sm:justify-between">
          <p className="max-w-2xl font-editorial text-xl italic leading-relaxed text-thread-black sm:text-2xl">
            Thirty-two possibilities can live inside one familiar wardrobe.
          </p>

          <span className="font-utility text-[8px] tracking-[0.22em] text-awadh-ink">
            LOOK CLOSER →
          </span>
        </div>
      </div>
    </section>
  );
}
