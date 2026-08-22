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
      title: "Discover new combinations",
      description:
        "Explore unexpected pairings and fresh ways to bring familiar pieces together.",
    },
    {
      number: "03",
      title: "Make it unmistakably yours",
      description:
        "Find the combinations that feel natural, personal, and entirely your own.",
    },
  ];

  return (
    <section className="relative overflow-hidden bg-kora px-6 py-24 sm:px-10 sm:py-32 lg:px-16">
      <div className="mx-auto max-w-[1440px]">
        {/* Top label */}
        <div className="flex items-center justify-between border-b border-thread-grey/30 pb-5">
          <span className="font-utility text-[9px] tracking-[0.22em] text-thread-grey">
            03 — THE PROCESS
          </span>

          <span className="font-utility text-[9px] tracking-[0.18em]  text-thread-grey">
            MADE FOR DISCOVERY
          </span>
        </div>

        {/* Heading */}
        <div className="max-w-4xl py-20 sm:py-28">
          <div className="mb-8 flex items-center gap-4">
            <span className="h-px w-10 bg-awadh-ink" />

            <span className="font-utility text-[9px] tracking-[0.22em] text-awadh-ink">
              YOUR STYLE, UNFOLDED
            </span>
          </div>

          <h2 className="font-display text-5xl leading-[0.98] tracking-tight  text-thread-black sm:text-6xl lg:text-7xl">
            More possibilities.
            <br />
            Less guesswork.
          </h2>

          <p className="mt-10 max-w-2xl font-editorial text-lg leading-relaxed text-thread-grey sm:text-xl">
            A better wardrobe is not always about owning more. Sometimes, it is
            about seeing what you already have in a completely different way.
          </p>
        </div>

        {/* Steps */}
        <div className="border-t border-thread-grey/30">
          <div className="grid lg:grid-cols-3">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className={`group relative min-h-[320px] px-0 py-12 sm:min-h-[360px] sm:py-16 lg:px-10 ${
                  index !== 0
                    ? "border-t border-thread-grey/30 lg:border-t-0 lg:border-l"
                    : ""
                }`}
              >
                {/* Number */}
                <span className="font-utility text-[10px] tracking-[0.2em] text-awadh-ink">
                  {step.number}
                </span>

                {/* Title */}
                <h3 className="mt-12 max-w-xs font-display text-4xl leading-tight  text-thread-black transition-transform duration-500 group-hover:translate-x-2 sm:text-5xl">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="mt-6 max-w-sm font-editorial text-base leading-relaxed text-thread-grey">
                  {step.description}
                </p>

                {/* Arrow */}
                <div className="absolute bottom-12 right-0 text-2xl text-thread-grey transition-all duration-500 group-hover:translate-x-[-10px] group-hover:text-awadh-ink sm:bottom-16 lg:right-10">
                  ↗
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom statement */}
        <div className="flex flex-col justify-between gap-8 border-t border-thread-grey/30 pt-8 sm:flex-row sm:items-end">
          <p className="max-w-xl font-editorial text-xl italic leading-relaxed text-thread-grey sm:text-2xl">
            The best style advice starts with paying attention.
          </p>

          <span className="font-utility text-[9px] tracking-[0.2em]  text-thread-grey">
            THE THREAD CONTINUES →
          </span>
        </div>
      </div>
    </section>
  );
}