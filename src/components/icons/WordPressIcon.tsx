interface WordPressIconProps {
  className?: string;
  size?: number;
}

export const WordPressIcon = ({ className = "", size = 24 }: WordPressIconProps) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M4.5 12h2.5l2 6 3-12 2 9 2-3h3" />
    </svg>
  );
};
