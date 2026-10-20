/**
 * Normalize any thrown error into a human-readable string.
 *
 * FastAPI validation errors return detail as an ARRAY of
 * { type, loc, msg, input } objects — rendering that object
 * directly crashes React. This always returns a string.
 */
export function getErrorMessage(
  err: unknown,
  fallback = 'Something went wrong. Please try again.'
): string {
  const axiosErr = err as any;
  const detail = axiosErr?.response?.data?.detail;

  if (typeof detail === 'string' && detail) return detail;

  if (Array.isArray(detail)) {
    return (
      detail
        .map((d) => {
          if (typeof d === 'string') return d;
          const field = Array.isArray(d?.loc) ? d.loc[d.loc.length - 1] : null;
          const msg = d?.msg ?? JSON.stringify(d);
          return field && field !== 'body' ? `${field}: ${msg}` : msg;
        })
        .join('; ') || fallback
    );
  }

  if (detail && typeof detail === 'object') {
    return detail.msg ?? detail.message ?? fallback;
  }

  if (axiosErr?.code === 'ERR_NETWORK' || axiosErr?.message === 'Network Error') {
    return 'Cannot reach the server. Check that the backend is running and try again.';
  }

  if (typeof axiosErr?.message === 'string' && axiosErr.message) {
    return axiosErr.message;
  }

  return fallback;
}
