"use client";

import { useCallback, useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { favoriteService } from "@/service/favorite.service";
import { useAuth } from "@/hooks/use-auth";

interface FavoriteButtonProps {
  technicianId: string;
  className?: string;
  size?: "sm" | "md";
}

export function FavoriteButton({ technicianId, className, size = "md" }: FavoriteButtonProps) {
  const { isAuthenticated, role } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);

  const checkFavorite = useCallback(async () => {
    if (!isAuthenticated || role !== "CUSTOMER") return;
    try {
      const { isFavorite: val } = await favoriteService.isFavorite(technicianId);
      setIsFavorite(val);
      setChecked(true);
    } catch {
      /* ignore */
    }
  }, [technicianId, isAuthenticated, role]);

  useEffect(() => {
    checkFavorite();
  }, [checkFavorite]);

  if (!isAuthenticated || role !== "CUSTOMER") return null;

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;
    setLoading(true);
    try {
      if (isFavorite) {
        await favoriteService.remove(technicianId);
        setIsFavorite(false);
      } else {
        await favoriteService.add(technicianId);
        setIsFavorite(true);
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  if (!checked) return null;

  return (
    <button
      onClick={toggle}
      disabled={loading}
      aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
      title={isFavorite ? "Remove from favorites" : "Add to favorites"}
      className={cn(
        "inline-flex items-center justify-center rounded-full transition-all",
        size === "sm" ? "size-7" : "size-9",
        isFavorite
          ? "text-rose-500 hover:text-rose-600"
          : "text-muted-foreground hover:text-rose-500",
        "hover:bg-rose-500/10",
        loading && "opacity-50",
        className
      )}
    >
      <Heart
        className={cn(size === "sm" ? "size-4" : "size-5", isFavorite && "fill-current")}
        aria-hidden="true"
      />
    </button>
  );
}
