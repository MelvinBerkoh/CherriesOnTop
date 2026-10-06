export type CateringPackage = {
  id: string;
  name: string;
  description: string;
  pricePerPersonCents: number;
  minimumGuests: number;
  serviceMinutes: number;
  menu: string[];
};

// Initial content from the original site. Confirm with the owner before launch.
export const cateringPackages: CateringPackage[] = [
  {
    id: "sweet-simplicity",
    name: "Sweet Simplicity",
    description: "The classics, served with a little vintage charm.",
    pricePerPersonCents: 1200,
    minimumGuests: 75,
    serviceMinutes: 60,
    menu: ["Ice cream sandwiches or hand-scooped sundaes", "Water ice"],
  },
  {
    id: "choice-chill",
    name: "Choice Chill",
    description: "A little more choice for your celebration.",
    pricePerPersonCents: 1500,
    minimumGuests: 75,
    serviceMinutes: 60,
    menu: ["Hand-scooped sundaes", "Water ice", "Gelatti ice"],
  },
  {
    id: "ultimate-scoop",
    name: "Ultimate Scoop",
    description: "More treats. More ways to make it yours.",
    pricePerPersonCents: 2000,
    minimumGuests: 50,
    serviceMinutes: 60,
    menu: [
      "Sundaes or waffles with ice cream",
      "Milkshakes or fruit smoothies",
      "Old-fashioned soda floats",
      "Water ice",
      "Gelatti ice",
    ],
  },
];

export function getPackageEstimate(
  cateringPackage: CateringPackage,
  guests: number,
): number | null {
  if (!Number.isSafeInteger(guests) || guests < cateringPackage.minimumGuests) {
    return null;
  }

  return cateringPackage.pricePerPersonCents * guests;
}