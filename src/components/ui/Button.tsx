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
      className="rounded-lg bg-black px-6 py-3 text-white hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
    >
      {text}
    </button>
  );
}
