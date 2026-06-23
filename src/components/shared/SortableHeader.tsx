"use client";

import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type SortDirection = "asc" | "desc" | null;

export interface SortConfig {
  key: string;
  direction: SortDirection;
}

interface SortableHeaderProps {
  label: string;
  sortKey: string;
  currentSort: SortConfig;
  onSort: (key: string) => void;
  className?: string;
}

export function SortableHeader({
  label,
  sortKey,
  currentSort,
  onSort,
  className,
}: SortableHeaderProps) {
  const isActive = currentSort.key === sortKey;
  const direction = isActive ? currentSort.direction : null;

  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center gap-1 font-semibold hover:text-foreground transition-colors cursor-pointer select-none group",
        isActive ? "text-foreground" : "text-muted-foreground",
        className
      )}
      onClick={() => onSort(sortKey)}
    >
      {label}
      <span className="shrink-0">
        {direction === "asc" ? (
          <ArrowUp className="h-3.5 w-3.5 text-primary" />
        ) : direction === "desc" ? (
          <ArrowDown className="h-3.5 w-3.5 text-primary" />
        ) : (
          <ArrowUpDown className="h-3.5 w-3.5 opacity-40 group-hover:opacity-70 transition-opacity" />
        )}
      </span>
    </button>
  );
}

/** Helper: cycle through null → asc → desc → null */
export function getNextSort(
  currentSort: SortConfig,
  key: string
): SortConfig {
  if (currentSort.key !== key) return { key, direction: "asc" };
  if (currentSort.direction === "asc") return { key, direction: "desc" };
  if (currentSort.direction === "desc") return { key: "", direction: null };
  return { key, direction: "asc" };
}

/** Generic sort comparator */
export function sortData<T>(
  data: T[],
  sort: SortConfig,
  getField: (item: T, key: string) => string | number | Date
): T[] {
  if (!sort.key || !sort.direction) return data;

  return [...data].sort((a, b) => {
    const aVal = getField(a, sort.key);
    const bVal = getField(b, sort.key);

    let comparison = 0;
    if (typeof aVal === "string" && typeof bVal === "string") {
      comparison = aVal.localeCompare(bVal, "id", { sensitivity: "base" });
    } else if (aVal instanceof Date && bVal instanceof Date) {
      comparison = aVal.getTime() - bVal.getTime();
    } else {
      comparison = Number(aVal) - Number(bVal);
    }

    return sort.direction === "desc" ? -comparison : comparison;
  });
}
