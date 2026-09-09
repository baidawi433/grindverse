const UNITS = [
  { value: 1e12, suffix: "T" },
  { value: 1e9, suffix: "B" },
  { value: 1e6, suffix: "M" },
  { value: 1e3, suffix: "K" },
];

export function formatNumber(num) {
  const value = Math.floor(num);

  if (value < 1000) return `${value}`;

  for (const unit of UNITS) {
    if (Math.abs(value) >= unit.value) {
      const shortValue = value / unit.value;
      return `${shortValue.toFixed(shortValue < 10 ? 2 : 1)}${unit.suffix}`;
    }
  }

  return `${value}`;
}