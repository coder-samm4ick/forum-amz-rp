export default function Avatar({
  name,
  color,
  size = 40,
  className = "",
}: {
  name: string;
  color: string;
  size?: number;
  className?: string;
}) {
  const initials = name
    .replace(/[_\-\d]/g, " ")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
  return (
    <span
      className={`inline-flex items-center justify-center rounded-lg font-bold shrink-0 select-none ${className}`}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.38,
        background: `linear-gradient(145deg, ${color}33, ${color}14)`,
        border: `1px solid ${color}66`,
        color,
        textShadow: `0 0 12px ${color}55`,
      }}
      aria-hidden
    >
      {initials || "?"}
    </span>
  );
}
