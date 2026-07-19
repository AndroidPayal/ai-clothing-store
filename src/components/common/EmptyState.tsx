import Link from "next/link";

type EmptyStateProps = {
  emoji: string;
  title: string;
  description: string;
  buttonText: string;
  href: string;
};

export default function EmptyState({
  emoji,
  title,
  description,
  buttonText,
  href,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">

      <div className="mb-5 text-7xl">
        {emoji}
      </div>

      <h2 className="text-3xl font-bold text-gray-800">
        {title}
      </h2>

      <p className="mt-3 max-w-md text-gray-500">
        {description}
      </p>

      <Link
        href={href}
        className="
          mt-8
          rounded-lg
          bg-blue-600
          px-6
          py-3
          font-semibold
          text-white
          transition
          hover:bg-blue-700
        "
      >
        {buttonText}
      </Link>

    </div>
  );
}