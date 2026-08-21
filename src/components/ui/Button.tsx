type ButtonProps = {
  text: string;
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
};

export default function Button({
  text,
  disabled = false,
  onClick,
  type = "button",
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className="
        inline-flex
        items-center
        justify-center
        border
        border-thread-black
        bg-thread-black
        px-6
        py-3
        font-utility
        text-[9px]
        tracking-[0.18em]
        text-muslin
        transition-colors
        duration-300
        hover:bg-awadh-ink
        hover:border-awadh-ink
        disabled:cursor-not-allowed
        disabled:border-thread-grey
        disabled:bg-thread-grey
        disabled:text-muslin
      "
    >
      {text}
    </button>
  );
}