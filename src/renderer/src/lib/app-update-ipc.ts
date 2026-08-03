import type { AppUpdateCheckResult } from '../../../types/app-update';

export function isAppUpdateCheckResult(value: unknown): value is AppUpdateCheckResult {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as AppUpdateCheckResult;
  return (
    typeof candidate.updateAvailable === 'boolean' &&
    typeof candidate.currentVersion === 'string' &&
    typeof candidate.latestVersion === 'string'
  );
}

export function getIpcErrorMessage(value: unknown): string {
  if (value instanceof Error) {
    return value.message;
  }

  if (value && typeof value === 'object' && 'error' in value && typeof (value as { error: unknown }).error === 'string') {
    return (value as { error: string }).error;
  }

  if (value && typeof value === 'object' && 'message' in value && typeof (value as { message: unknown }).message === 'string') {
    return (value as { message: string }).message;
  }

  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}
