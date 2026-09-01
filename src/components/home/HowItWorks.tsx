export default function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Choose your pieces",
      description:
        "Start with what already speaks to you. The clothes you own are the beginning of every possibility.",
    },
    {
      number: "02",
      title: "Discover new looks",
      description:
        "Explore unexpected pairings and fresh ways to bring familiar pieces together.",
    },
    {
      number: "03",
      title: "Make it yours",
      description:
        "Find combinations that feel natural, personal, and entirely your own.",
    },
  ];

  return (
    <section className="relative overflow-hidden bg-muslin px-6 py-24 sm:px-10 sm:py-32 lg:px-16">
      <div className="mx-auto max-w-[1440px]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-thread-grey/30 pb-5">
          <span className="font-utility text-[9px] tracking-[0.22em] text-thread-grey">
            03 — THE PROCESS
          </span>

          <span className="hidden font-utility text-[8px] tracking-[0.18em] text-thread-grey sm:block">
            MADE FOR DISCOVERY
          </span>
        </div>

        {/* Intro */}
        <div className="grid gap-12 py-20 sm:py-28 lg:grid-cols-[1fr_0.7fr] lg:gap-24">
          <div>
            <div className="mb-8 flex items-center gap-4">
              <span className="h-px w-10 bg-awadh-ink" />

              <span className="font-utility text-[9px] tracking-[0.22em] text-awadh-ink">
                YOUR STYLE, UNFOLDED
              </span>
            </div>

            <h2 className="font-display text-5xl leading-[0.96] tracking-tight text-thread-black sm:text-6xl lg:text-7xl">
              More possibilities.
              <br />
              Less guesswork.
            </h2>
          </div>

          <div className="flex items-end">
            <p className="max-w-lg font-editorial text-lg leading-relaxed text-thread-grey sm:text-xl">
              A better wardrobe is not always about owning more. Sometimes, it
              is about seeing what you already have in a completely different
              way.
            </p>
          </div>
        </div>

        {/* Steps */}
        <div className="border-y border-thread-grey/30">
          <div className="grid lg:grid-cols-3">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className={`group relative min-h-[390px] px-0 py-12 sm:min-h-[420px] sm:py-16 lg:px-10 ${
                  index !== 0
                    ? "border-t border-thread-grey/20 lg:border-t-0 lg:border-l"
                    : ""
                }`}
              >
                {/* Number */}
                <div className="flex items-center justify-between">
                  <span className="font-utility text-[9px] tracking-[0.2em] text-awadh-ink">
                    {step.number}
                  </span>

                  <span className="font-utility text-[8px] tracking-[0.18em] text-thread-grey">
                    STEP
                  </span>
                </div>

                {/* Title */}
                <h3 className="mt-14 max-w-sm font-display text-4xl leading-[1.05] text-thread-black transition-transform duration-500 group-hover:translate-x-2 sm:text-5xl">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="mt-7 max-w-sm font-editorial text-base leading-relaxed text-thread-grey">
                  {step.description}
                </p>

                {/* Bottom line */}
                <div className="absolute bottom-12 left-0 right-0 flex items-center justify-between sm:bottom-16 lg:left-10 lg:right-10">
                  <span className="h-px w-8 bg-thread-grey/40 transition-all duration-500 group-hover:w-16 group-hover:bg-awadh-ink" />

                  <span className="text-xl text-thread-grey transition-all duration-500 group-hover:-translate-y-1 group-hover:text-awadh-ink">
                    ↗
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col gap-8 pt-8 sm:flex-row sm:items-end sm:justify-between">
          <p className="max-w-xl font-editorial text-xl italic leading-relaxed text-thread-grey sm:text-2xl">
            The best style advice starts with paying attention.
          </p>

          <div className="flex items-center gap-3">
            <span className="h-1 w-1 rounded-full bg-awadh-ink" />

            <span className="font-utility text-[8px] tracking-[0.2em] text-thread-grey">
              THE JOURNEY CONTINUES
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
