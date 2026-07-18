type ButtonProps = {
  text: string;
  disabled?: boolean;
  onClick?: () => void;
};

export default function Button({
  text,
  disabled = false,
  onClick,
}: ButtonProps) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className="rounded-lg bg-black px-6 py-3 text-white hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
    >
      {text}
    </button>
  );
}