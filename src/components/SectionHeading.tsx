import type { ReactNode } from "react";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  action,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: string;
  align?: "left" | "center";
  action?: ReactNode;
}) {
  return (
    <div className={`flex flex-col gap-3 mb-10 md:mb-14 ${align === "center" ? "items-center text-center" : "md:flex-row md:items-end md:justify-between"}`}>
      <div className={align === "center" ? "max-w-2xl" : "max-w-xl"}>
        {eyebrow && <p className="eyebrow text-gold mb-3">{eyebrow}</p>}
        <h2 className="font-display text-plum text-3xl md:text-5xl leading-[1.05]">{title}</h2>
        {description && <p className="text-muted-foreground mt-3 leading-relaxed">{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
