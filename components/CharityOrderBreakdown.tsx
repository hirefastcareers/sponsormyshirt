import { formatCharityOrderBreakdown } from "@/lib/charity";

interface CharityOrderBreakdownProps {
  totalGbp: number;
  className?: string;
}

export default function CharityOrderBreakdown({
  totalGbp,
  className = "",
}: CharityOrderBreakdownProps) {
  if (totalGbp <= 0) return null;

  return (
    <p
      className={`text-xs leading-relaxed text-emerald-800 ${className}`.trim()}
    >
      {formatCharityOrderBreakdown(totalGbp)}
    </p>
  );
}
