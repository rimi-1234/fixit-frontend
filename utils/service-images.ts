/** Curated Unsplash images technicians can pick when adding a service. */
export const SERVICE_IMAGE_PRESETS = [
  {
    id: "cleaning",
    label: "Cleaning",
    url: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "plumbing",
    label: "Plumbing",
    url: "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "electrical",
    label: "Electrical",
    url: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "ac",
    label: "AC / HVAC",
    url: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "painting",
    label: "Painting",
    url: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "tools",
    label: "General",
    url: "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=900&q=80",
  },
] as const;

export function imageForCategory(name?: string) {
  const key = (name ?? "").toLowerCase();
  if (key.includes("plumb")) return SERVICE_IMAGE_PRESETS[1].url;
  if (key.includes("electric")) return SERVICE_IMAGE_PRESETS[2].url;
  if (key.includes("clean")) return SERVICE_IMAGE_PRESETS[0].url;
  if (key.includes("ac") || key.includes("air") || key.includes("hvac")) {
    return SERVICE_IMAGE_PRESETS[3].url;
  }
  if (key.includes("paint")) return SERVICE_IMAGE_PRESETS[4].url;
  return SERVICE_IMAGE_PRESETS[5].url;
}

export function serviceImageUrl(service: {
  imageUrl?: string | null;
  category?: { name?: string } | null;
}) {
  if (service.imageUrl) return service.imageUrl;
  return imageForCategory(service.category?.name);
}
