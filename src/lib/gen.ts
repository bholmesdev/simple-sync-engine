import type { Issue } from "../types";

export let idx = 0;

export function incrementIdx() {
  idx = (idx + 1) % issues.length;
}

export function generateIssue(): Omit<Issue, "id"> {
  const issue = issues[idx];
  incrementIdx();
  return {
    ...issue,
    createdAt: new Date().toISOString(),
    status: "not started",
    owner: "unknown",
  };
}

function fisherYatesShuffle<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]; // Swap elements
  }
  return array;
}

const baseIssues = [
  {
    title: "Book Flights to Amsterdam",
    description:
      "Find and book flights to Schiphol Airport (AMS) with good timing and pricing.",
  },
  {
    title: "Choose a Hotel or Airbnb",
    description:
      "Decide between a canal-side hotel in Jordaan, a boutique stay in De Pijp, or an Airbnb with a view.",
  },
  {
    title: "Plan a Day Trip to a Castle or Historic Estate",
    description:
      "Visit Muiderslot Castle or Paleis Het Loo for a Versailles-like experience.",
  },
  {
    title: "Buy Tickets for Rijksmuseum & Van Gogh Museum",
    description:
      "Reserve entry to see Rembrandt’s 'The Night Watch' and Van Gogh’s masterpieces.",
  },
  {
    title: "Get Tickets for a Concert or Club Night",
    description:
      "Check events at Paradiso, Melkweg, or Shelter for house, electro, or 90s synth pop gigs.",
  },
  {
    title: "Make Restaurant Reservations",
    description:
      "Book tables at De Kas (farm-to-table), Rijks (Michelin-starred), or Moeders (Dutch comfort food).",
  },
  {
    title: "Plan a Canal Cruise",
    description:
      "Choose between a historic canal tour, a cocktail cruise, or an evening lights cruise.",
  },
  {
    title: "Rent Bikes & Plan a Ride",
    description:
      "Rent bikes from MacBike or A-Bike and cycle through Vondelpark, Amsterdamse Bos, or along the Amstel River.",
  },
  {
    title: "Explore a Local Market",
    description:
      "Visit Albert Cuyp Market for street food, Noordermarkt for antiques, or Foodhallen for Dutch snacks.",
  },
  {
    title: "Experience Amsterdam’s Nightlife",
    description:
      "Bar-hop in the Red Light District, grab craft beers at Brouwerij 't IJ, or find an underground club night.",
  },
];

const issues = fisherYatesShuffle(baseIssues);
