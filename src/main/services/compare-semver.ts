function parseVersion(version: string): number[] {
  return version
    .replace(/^v/i, '')
    .split('.')
    .map((part) => parseInt(part, 10) || 0);
}

/** Returns positive if a > b, negative if a < b, 0 if equal. */
export function compareSemver(a: string, b: string): number {
  const partsA = parseVersion(a);
  const partsB = parseVersion(b);
  const length = Math.max(partsA.length, partsB.length);

  for (let i = 0; i < length; i++) {
    const diff = (partsA[i] ?? 0) - (partsB[i] ?? 0);
    if (diff !== 0) {
      return diff;
    }
  }

  return 0;
}
