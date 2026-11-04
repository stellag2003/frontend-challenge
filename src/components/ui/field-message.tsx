import { cn } from "@/lib/utils";

export function FieldMessage({
  id,
  children,
  tone = "error",
}: {
  id?: string;
  children: React.ReactNode;
  tone?: "error" | "muted";
}) {
  return (
    <p
      id={id}
      role={tone === "error" ? "alert" : undefined}
      className={cn("text-xs", tone === "error" ? "text-destructive" : "text-muted-foreground")}
    >
      {children}
    </p>
  );
}
