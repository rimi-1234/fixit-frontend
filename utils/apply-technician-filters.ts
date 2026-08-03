import type { TechnicianSummary } from "@/lib/types";
import type { TechnicianFilters } from "@/service/technician.service";

/** Client-side filter so skill/location/rating stay correct even if the API is strict. */
export function applyTechnicianFilters(
  technicians: TechnicianSummary[],
  filters: TechnicianFilters
): TechnicianSummary[] {
  const skill = filters.skill?.trim().toLowerCase();
  const location = filters.location?.trim().toLowerCase();
  const search = filters.search?.trim().toLowerCase();

  return technicians.filter((tech) => {
    const profile = tech.technicianProfile;

    if (skill) {
      const skills = profile?.skills ?? [];
      const skillHit = skills.some((s) => s.toLowerCase().includes(skill));
      const serviceHit = (tech.services ?? []).some((service) => {
        const name = service.name?.toLowerCase() ?? "";
        const category = service.category?.name?.toLowerCase() ?? "";
        return name.includes(skill) || category.includes(skill);
      });
      if (!skillHit && !serviceHit) return false;
    }

    if (location) {
      const techLocation = profile?.location?.toLowerCase() ?? "";
      if (!techLocation.includes(location)) return false;
    }

    if (filters.minExperience !== undefined) {
      if ((profile?.experience ?? 0) < filters.minExperience) return false;
    }

    if (filters.minRating !== undefined) {
      if ((tech.averageRating ?? 0) < filters.minRating) return false;
    }

    const rate = profile?.hourlyRate ?? 0;
    if (filters.minHourlyRate !== undefined && rate < filters.minHourlyRate) {
      return false;
    }
    if (filters.maxHourlyRate !== undefined && rate > filters.maxHourlyRate) {
      return false;
    }

    if (search) {
      const email = tech.email?.toLowerCase() ?? "";
      const skillsBlob = (profile?.skills ?? []).join(" ").toLowerCase();
      if (!email.includes(search) && !skillsBlob.includes(search)) return false;
    }

    return true;
  });
}
