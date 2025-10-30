const units: { [key: string]: number } = {
  Bytes: 1,
  KB: 1024,
  MB: 1024 * 1024,
  GB: 1024 * 1024 * 1024,
};

export function parseToBytes(size: string): number {
  const [value, unit] = size.trim().split(" ");
  return parseFloat(value) * (units[unit.trim()] || 1);
}
