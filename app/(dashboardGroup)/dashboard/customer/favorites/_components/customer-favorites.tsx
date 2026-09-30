"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Heart, Loader2, Star } from "lucide-react";

import { favoriteService } from "@/service/favorite.service";
import type { FavoriteTechnician } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { SafePhoto } from "@/components/safe-photo";
import { FavoriteButton } from "@/components/favorite-button";
import { displayNameFromEmail } from "@/utils/display-name";
import { technicianImageUrl } from "@/utils/technician-images";
import { formatCurrency } from "@/utils/format-currency";

export function CustomerFavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteTechnician[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await favoriteService.getAll();
      setFavorites(data);
    } catch {
      setError("Could not load favorites. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleRemove = (technicianId: string) => {
    setFavorites((prev) => prev.filter((f) => f.technicianId !== technicianId));
  };

  if (loading) {
    return (
      <div className="flex min-h-48 items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-48 flex-col items-center justify-center gap-3 text-center">
        <p className="text-sm text-muted-foreground">{error}</p>
        <Button variant="outline" size="sm" onClick={load}>Retry</Button>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center gap-4 text-center">
        <Heart className="size-10 text-muted-foreground/30" />
        <div>
          <p className="font-medium">No favorites yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Browse technicians and tap the heart to save your favorites.
          </p>
        </div>
        <Button nativeButton={false} render={<Link href="/technicians" />}>
          Browse technicians
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Favorite Technicians</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {favorites.length} saved technician{favorites.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {favorites.map((fav) => {
          const tech = fav.technician;
          if (!tech) return null;
          const displayName = tech.name ?? displayNameFromEmail(tech.email);
          const avatar = technicianImageUrl({ id: tech.id, email: tech.email, technicianProfile: tech.technicianProfile ?? null });
          const skills = tech.technicianProfile?.skills ?? [];
          const minPrice = tech.services.length > 0
            ? Math.min(...tech.services.map((s) => s.price))
            : null;

          return (
            <div
              key={fav.id}
              className="group relative flex flex-col gap-4 rounded-xl border border-border bg-card p-4 transition-shadow hover:shadow-md"
            >
              <div className="absolute right-3 top-3">
                <FavoriteButton
                  technicianId={tech.id}
                  size="sm"
                />
              </div>

              <div className="flex items-center gap-3">
                <Link href={`/technicians/${tech.id}`} className="shrink-0">
                  <div className="size-14 overflow-hidden rounded-full ring-2 ring-border transition-all group-hover:ring-primary">
                    <SafePhoto src={avatar} alt={displayName} className="size-full" />
                  </div>
                </Link>
                <div className="min-w-0">
                  <Link
                    href={`/technicians/${tech.id}`}
                    className="block truncate font-semibold hover:text-primary"
                  >
                    {displayName}
                  </Link>
                  {tech.technicianProfile?.location && (
                    <p className="truncate text-xs text-muted-foreground">
                      {tech.technicianProfile.location}
                    </p>
                  )}
                  {tech.technicianProfile?.hourlyRate ? (
                    <p className="mt-0.5 text-xs font-medium text-primary">
                      {formatCurrency(tech.technicianProfile.hourlyRate)}/hr
                    </p>
                  ) : minPrice != null ? (
                    <p className="mt-0.5 text-xs font-medium text-primary">
                      From {formatCurrency(minPrice)}
                    </p>
                  ) : null}
                </div>
              </div>

              {skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {skills.slice(0, 4).map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
                    >
                      {skill}
                    </span>
                  ))}
                  {skills.length > 4 && (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                      +{skills.length - 4}
                    </span>
                  )}
                </div>
              )}

              <div className="mt-auto flex items-center justify-between gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  nativeButton={false}
                  render={<Link href={`/technicians/${tech.id}`} />}
                >
                  View profile
                </Button>
                <Button
                  size="sm"
                  className="flex-1"
                  nativeButton={false}
                  render={<Link href={`/technicians/${tech.id}`} />}
                >
                  Book now
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
