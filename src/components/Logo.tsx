import { Link } from "@tanstack/react-router";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`inline-flex items-baseline ${className}`}>
      <span className="font-display text-3xl tracking-tight text-plum">Alluring</span>
    </Link>
  );
}
