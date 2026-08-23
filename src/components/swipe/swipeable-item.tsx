"use client";

import { useState } from "react";
import { animate, motion, useMotionValue, type PanInfo } from "framer-motion";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

const SWIPE_THRESHOLD = 96;
const VELOCITY_THRESHOLD = 500;

type SwipeableItemProps = {
  children: React.ReactNode;
  onSwipeRight: () => void;
  onSwipeLeft: () => void;
  rightLabel?: string;
  leftLabel?: string;
  className?: string;
};

export function SwipeableItem({
  children,
  onSwipeRight,
  onSwipeLeft,
  rightLabel = "Selesai",
  leftLabel = "Skip",
  className,
}: SwipeableItemProps) {
  const x = useMotionValue(0);
  const [dragX, setDragX] = useState(0);
  const [committed, setCommitted] = useState<"right" | "left" | null>(null);

  function handleDrag() {
    setDragX(x.get());
  }

  function handleDragEnd(_: unknown, info: PanInfo) {
    const passedRight =
      info.offset.x > SWIPE_THRESHOLD || info.velocity.x > VELOCITY_THRESHOLD;
    const passedLeft =
      info.offset.x < -SWIPE_THRESHOLD || info.velocity.x < -VELOCITY_THRESHOLD;

    if (passedRight) {
      setCommitted("right");
      animate(x, 400, { duration: 0.2 }).then(() => onSwipeRight());
    } else if (passedLeft) {
      setCommitted("left");
      animate(x, -400, { duration: 0.2 }).then(() => onSwipeLeft());
    } else {
      setDragX(0);
      animate(x, 0, { type: "spring", stiffness: 500, damping: 35 });
    }
  }

  if (committed) return null;

  const revealRight = Math.min(Math.max(dragX, 0) / SWIPE_THRESHOLD, 1);
  const revealLeft = Math.min(Math.max(-dragX, 0) / SWIPE_THRESHOLD, 1);

  return (
    <div className={cn("relative overflow-hidden rounded-xl", className)}>
      <div className="absolute inset-0 flex items-center justify-between">
        <div
          className="flex h-full items-center gap-2 bg-emerald-500 px-4 text-white transition-opacity"
          style={{ opacity: revealRight }}
        >
          <Check className="size-5" />
          <span className="text-sm font-semibold">{rightLabel}</span>
        </div>
        <div
          className="flex h-full items-center gap-2 bg-rose-500 px-4 text-white transition-opacity"
          style={{ opacity: revealLeft }}
        >
          <span className="text-sm font-semibold">{leftLabel}</span>
          <X className="size-5" />
        </div>
      </div>
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.7}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        style={{ x }}
        className="relative touch-pan-y bg-background"
      >
        {children}
      </motion.div>
    </div>
  );
}
