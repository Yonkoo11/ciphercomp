// BLS OEWS-inspired salary boundaries (USD annual)
// Top 5 roles x 3 locations for hackathon demo
// Boundaries represent salary thresholds for cumulative distribution buckets

export interface LocationConfig {
  name: string;
  boundaries: [number, number, number, number, number, number, number, number];
}

export interface RoleConfig {
  role: string;
  locations: LocationConfig[];
}

export const ROLES: RoleConfig[] = [
  {
    role: "Software Engineer",
    locations: [
      { name: "San Francisco", boundaries: [65000, 85000, 105000, 130000, 160000, 195000, 240000, 320000] },
      { name: "New York", boundaries: [60000, 80000, 100000, 125000, 155000, 190000, 235000, 310000] },
      { name: "Austin", boundaries: [55000, 72000, 90000, 112000, 140000, 172000, 215000, 285000] },
    ],
  },
  {
    role: "Data Scientist",
    locations: [
      { name: "San Francisco", boundaries: [70000, 90000, 112000, 138000, 168000, 205000, 250000, 330000] },
      { name: "New York", boundaries: [65000, 85000, 105000, 130000, 160000, 195000, 240000, 315000] },
      { name: "Austin", boundaries: [58000, 75000, 95000, 118000, 145000, 178000, 220000, 290000] },
    ],
  },
  {
    role: "Product Manager",
    locations: [
      { name: "San Francisco", boundaries: [72000, 92000, 115000, 142000, 175000, 212000, 258000, 340000] },
      { name: "New York", boundaries: [68000, 88000, 110000, 135000, 168000, 205000, 250000, 325000] },
      { name: "Austin", boundaries: [60000, 78000, 98000, 122000, 152000, 185000, 228000, 300000] },
    ],
  },
  {
    role: "DevOps Engineer",
    locations: [
      { name: "San Francisco", boundaries: [62000, 82000, 102000, 128000, 158000, 192000, 238000, 315000] },
      { name: "New York", boundaries: [58000, 78000, 98000, 122000, 152000, 185000, 230000, 305000] },
      { name: "Austin", boundaries: [52000, 70000, 88000, 110000, 138000, 170000, 212000, 280000] },
    ],
  },
  {
    role: "UX Designer",
    locations: [
      { name: "San Francisco", boundaries: [58000, 75000, 95000, 118000, 148000, 182000, 225000, 298000] },
      { name: "New York", boundaries: [55000, 72000, 90000, 115000, 142000, 175000, 218000, 288000] },
      { name: "Austin", boundaries: [48000, 65000, 82000, 105000, 132000, 162000, 202000, 268000] },
    ],
  },
];

export function getRoleNames(): string[] {
  return ROLES.map((r) => r.role);
}

export function getLocationsForRole(role: string): string[] {
  const found = ROLES.find((r) => r.role === role);
  return found ? found.locations.map((l) => l.name) : [];
}

export function getBoundaries(
  role: string,
  location: string
): [number, number, number, number, number, number, number, number] | null {
  const r = ROLES.find((r) => r.role === role);
  if (!r) return null;
  const l = r.locations.find((l) => l.name === location);
  return l ? l.boundaries : null;
}

export function formatSalary(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}
