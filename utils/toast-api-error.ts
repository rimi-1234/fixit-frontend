import { toast } from "sonner";

import { ApiError } from "@/lib/api-client";

/** Default mutation error toast — surfaces backend `message` (and field issues later in forms). */
export function toastApiError(error: unknown, fallback = "Something went wrong") {
  if (error instanceof ApiError) {
    toast.error(error.message || fallback);
    return;
  }
  if (error instanceof Error) {
    toast.error(error.message || fallback);
    return;
  }
  toast.error(fallback);
}
