import type { SeedTest } from "./types.js";

// Original demo content. Not official IELTS material.
// Short version (Part 1 only, 4 questions); no audio yet.

export const listeningDemo1: SeedTest = {
  id: "listening-demo-1",
  title: "Listening — Demo 1",
  skill: "listening",
  module: null,
  status: "published",
  isFree: false,
  durationMinutes: 30,
  sections: [
    {
      id: "l1-s1",
      kind: "listening_part",
      title: "Part 1: Booking a Community Room",
      paragraphs: null,
      audioUrl: null,
      groups: [
        {
          id: "l1-g1",
          instructions:
            "Complete the form below. Write ONE WORD AND/OR A NUMBER for each answer.",
          payload: { type: "form_completion", maxWords: 1, allowNumber: true },
          questions: [
            {
              id: "l1-q1",
              prompt: "Name of group: Riverside ________ Club",
              options: null,
              answers: ["photography"],
            },
            {
              id: "l1-q2",
              prompt: "Day of booking: ________",
              options: null,
              answers: ["Thursday"],
            },
            {
              id: "l1-q3",
              prompt: "Expected number of people: ________",
              options: null,
              answers: ["25", "twenty-five"],
            },
            {
              id: "l1-q4",
              prompt: "Room requested: the ________ Room",
              options: null,
              answers: ["Garden"],
            },
          ],
        },
      ],
    },
  ],
};
