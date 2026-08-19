import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative min-h-[calc(100vh-72px)] overflow-hidden bg-muslin">
      {/* Top editorial label */}
      <div className="absolute left-6 top-8 z-10 sm:left-10 lg:left-16">
        <p className="font-utility text-[9px] tracking-[0.25em] text-thread-grey">
          LOOK 01 — MORNING
        </p>
      </div>

      {/* Main content */}
      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-72px)] max-w-[1440px] items-center px-6 sm:px-10 lg:px-16">
        <div className="max-w-4xl">
          {/* Small label */}
          <div className="mb-8 flex items-center gap-4">
            <span className="h-px w-10 bg-awadh-ink" />

            <span className="font-utility text-[9px] tracking-[0.22em] text-awadh-ink">
              THE DAILY QUESTION
            </span>
          </div>

          {/* Main headline */}
          <h1 className="font-display text-5xl leading-[0.95] tracking-tight text-thread-black sm:text-7xl lg:text-[7rem]">
            Every day starts
            <br />
            with one question.
          </h1>

          {/* Description */}
          <div className="mt-10 max-w-md border-l border-kora pl-5">
            <p className="font-editorial text-lg leading-relaxed text-thread-grey sm:text-xl">
              What should I wear today?
            </p>
          </div>

          {/* CTA */}
          <div className="mt-12">
            <Link
              href="#collection"
              className="group inline-flex items-center gap-5"
            >
              <span className="font-utility text-[10px] tracking-[0.2em] text-thread-black transition-colors group-hover:text-awadh-ink">
                DISCOVER YOUR STYLE
              </span>

              <span
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-thread-black
                  text-thread-black
                  transition-all
                  duration-300
                  group-hover:translate-y-1
                  group-hover:bg-thread-black
                  group-hover:text-muslin
                "
              >
                ↓
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Decorative thread */}
      <svg
        className="pointer-events-none absolute bottom-0 left-0 h-[25%] w-full sm:h-[30%] lg:h-[35%]"
        viewBox="0 0 1440 400"
        fill="none"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M0 280 C180 180 260 360 440 250 C620 140 720 330 900 220 C1080 110 1180 260 1440 80"
          stroke="#25324E"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {/* Chapter number */}
      <div className="absolute bottom-8 right-6 z-10 sm:right-10 lg:right-16">
        <span className="font-utility text-[9px] tracking-[0.2em] text-thread-grey">
          01 / 07
        </span>
      </div>
    </section>
  );
}
