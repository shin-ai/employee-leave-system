import { Button } from "@/components/ui/button";
import Link from "next/link";
import { type LucideIcon } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  actionOnClick?: () => void;
  actionIcon?: LucideIcon;
}

export function PageHeader({
  title,
  description,
  actionLabel,
  actionHref,
  actionOnClick,
  actionIcon: ActionIcon,
}: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {actionLabel && actionOnClick && (
        <Button className="w-full sm:w-auto gap-2" onClick={actionOnClick}>
          {ActionIcon && <ActionIcon className="h-4 w-4" />}
          {actionLabel}
        </Button>
      )}
      {actionLabel && actionHref && !actionOnClick && (
        <Link href={actionHref}>
          <Button className="w-full sm:w-auto gap-2">
            {ActionIcon && <ActionIcon className="h-4 w-4" />}
            {actionLabel}
          </Button>
        </Link>
      )}
    </div>
  );
}
