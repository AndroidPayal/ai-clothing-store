export default function CraftDiscovery() {
  return (
    <section className="relative overflow-hidden bg-kora px-6 py-24 sm:px-10 sm:py-32 lg:px-16">
      <div className="mx-auto max-w-[1440px]">
        {/* Section label */}
        <div className="flex items-center justify-between border-b border-thread-grey/40 pb-5">
          <span className="font-utility text-[9px] tracking-[0.22em] text-awadh-ink">
            02 — DISCOVERY
          </span>

          <span className="font-utility text-[9px] tracking-[0.18em] text-thread-grey">
            THE THREAD CONTINUES
          </span>
        </div>

        <div className="grid gap-16 py-20 lg:grid-cols-2 lg:items-center lg:gap-24">
          {/* Left content */}
          <div>
            <div className="mb-8 flex items-center gap-4">
              <span className="h-px w-10 bg-awadh-ink" />

              <span className="font-utility text-[9px] tracking-[0.22em] text-awadh-ink">
                MORE THAN CLOTHES
              </span>
            </div>

            <h2 className="font-display text-5xl leading-[0.98] tracking-tight text-thread-black sm:text-6xl lg:text-7xl">
              What if your clothes
              <br className="hidden lg:block" />
              understood you?
            </h2>

            <p className="mt-10 max-w-xl font-editorial text-lg leading-relaxed text-thread-grey sm:text-xl">
              Your wardrobe already holds possibilities. The question is not how
              much you own. It is how many ways you have yet to see it.
            </p>

            <p className="mt-6 max-w-xl font-editorial text-lg leading-relaxed text-thread-grey">
              Style begins with discovery — finding the combinations that feel
              unmistakably yours.
            </p>
          </div>

          {/* Right visual composition */}
          <div className="relative min-h-[380px] sm:min-h-[500px] lg:min-h-[600px]">
            {/* Large fabric block */}
            <div
              className="
              absolute
              right-0
              top-0
              h-[72%]
              w-[78%]
              border
              border-thread-grey/30
              bg-muslin
              transition-transform
              duration-700
              hover:-translate-x-2
              hover:translate-y-2
            "
            />
            {/* Small label */}
            <div className="absolute left-0 top-[12%] bg-thread-black px-5 py-4">
              <span className="font-utility text-[9px] tracking-[0.2em] text-muslin">
                FABRIC / FORM / SELF
              </span>
            </div>

            {/* Thread motif */}
            <svg
              className="absolute bottom-[10%] left-[5%] h-[45%] w-[90%]"
              viewBox="0 0 600 300"
              fill="none"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path
                d="M0 230 C90 120 160 270 260 160 C350 60 430 190 600 40"
                stroke="#25324E"
                strokeWidth="1.5"
                vectorEffect="non-scaling-stroke"
              />
            </svg>

            {/* Number */}
            <div className="absolute bottom-0 right-0">
              <span className="font-display text-[7rem] leading-none text-thread-black/10 sm:text-[10rem]">
                02
              </span>
            </div>
          </div>
        </div>

        {/* Bottom statement */}
        <div className="border-t border-thread-grey/40 pt-6">
          <p className="max-w-2xl font-editorial text-xl italic leading-relaxed text-thread-black sm:text-2xl">
            Thirty-two possibilities can live inside one familiar wardrobe.
          </p>
        </div>
      </div>
    </section>
  );
}
