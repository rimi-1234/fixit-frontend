import type { FieldValues, Path, UseFormSetError } from "react-hook-form";

import { ApiError } from "@/lib/api-client";
import { toastApiError } from "@/utils/toast-api-error";

/** Map backend Zod `errorDetails.issues` onto RHF fields; toast non-field errors. */
export function applyApiFieldErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  fallbackMessage = "Something went wrong"
) {
  if (!(error instanceof ApiError)) {
    toastApiError(error, fallbackMessage);
    return;
  }

  const issues = error.errorDetails.issues;
  if (!issues?.length) {
    toastApiError(error, fallbackMessage);
    return;
  }

  let matchedField = false;
  for (const issue of issues) {
    const field = String(issue.field);
    if (!field || field === "undefined") continue;
    setError(field as Path<T>, { type: "server", message: issue.message });
    matchedField = true;
  }

  if (!matchedField) {
    toastApiError(error, fallbackMessage);
  } else {
    toastApiError(error, error.message || fallbackMessage);
  }
}
