"use client";

import { Badge } from "@/components/ui/badge";
import { Platform } from "@/lib/scrapers/types";

const config: Record<Platform, { label: string; className: string }> = {
  amazon: {
    label: "Amazon",
    className: "bg-orange-100 text-orange-800 hover:bg-orange-200 border-orange-300",
  },
  ebay: {
    label: "eBay",
    className: "bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-300",
  },
};

export function PlatformBadge({ platform }: { platform: Platform }) {
  const { label, className } = config[platform];
  return (
    <Badge variant="outline" className={className}>
      {label}
    </Badge>
  );
}
