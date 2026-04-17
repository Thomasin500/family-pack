import { toast } from "sonner";

/**
 * Produce an `onError` handler for a TanStack Query mutation that surfaces
 * the failure as a sonner toast. Pass a short verb phrase (e.g. "save item")
 * that reads naturally after "Failed to ".
 *
 * Typed to `Error` so TanStack Query's error inference stays at `Error`
 * (the library's default) rather than narrowing to `unknown`.
 */
export function mutationError(label: string) {
  return (err: Error) => {
    const msg = err.message || `Failed to ${label}`;
    toast.error(msg);
  };
}
