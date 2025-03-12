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
    title: "Define Talk Topic & Abstract",
    description:
      "Clarify the central theme of the talk, ensuring it aligns with JS World's audience. Draft an abstract that captures the core message in a compelling way.",
  },
  {
    title: "Research & Gather Data",
    description:
      "Collect relevant statistics, case studies, and real-world examples to support key points in the talk. Ensure credibility and up-to-date references.",
  },
  {
    title: "Outline Talk Structure",
    description:
      "Break down the talk into sections (introduction, main points, conclusion) with estimated timing to ensure smooth flow and pacing.",
  },
  {
    title: "Create Slide Deck Draft",
    description:
      "Design an initial set of slides covering all key points. Use clear visuals and avoid text-heavy slides.",
  },
  {
    title: "Code Demos & Live Examples",
    description:
      "Develop small, reliable, and engaging code demos to illustrate key concepts. Ensure they run smoothly in different environments.",
  },
  {
    title: "Review & Polish Key Messages",
    description:
      "Ensure that key takeaways are clear, memorable, and actionable. Revise phrasing for clarity and impact.",
  },
  {
    title: "Rehearse & Time the Talk",
    description:
      "Do a full run-through to test timing and adjust content if needed. Identify areas that need more or less emphasis.",
  },
  {
    title: "Prepare for Q&A Session",
    description:
      "Anticipate possible audience questions and prepare strong responses. Consider adding backup slides or references for complex questions.",
  },
  {
    title: "Finalize Slide Design & Branding",
    description:
      "Apply a polished, consistent design to the slide deck, ensuring it matches the conference theme and branding guidelines.",
  },
  {
    title: "Submit Materials & Travel Logistics",
    description:
      "Ensure all required materials (slides, bio, talk summary) are submitted to JS World on time. Confirm travel, accommodation, and any AV setup needs.",
  },
];

const issues = fisherYatesShuffle(baseIssues);
