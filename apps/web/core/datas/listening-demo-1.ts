import "server-only";

import type { TestRecord } from "@/core/models/records";

// Konten orisinal untuk demo. Bukan soal resmi IELTS.
// Versi pendek (Part 1 saja, 4 soal); audio belum ada.

export const listeningDemo1: TestRecord = {
  id: "listening-demo-1",
  title: "Listening — Demo 1",
  skill: "listening",
  module: null,
  isFree: false,
  durationMinutes: 30,
  sections: [
    {
      id: "l1-s1",
      order: 1,
      kind: "listening_part",
      title: "Part 1: Booking a Community Room",
      content: null,
      audioUrl: null,
      groups: [
        {
          id: "l1-g1",
          order: 1,
          numberFrom: 1,
          numberTo: 4,
          instructions:
            "Complete the form below. Write ONE WORD AND/OR A NUMBER for each answer.",
          payload: { type: "form_completion", maxWords: 1, allowNumber: true },
          questions: [
            {
              id: "l1-q1",
              number: 1,
              prompt: "Name of group: Riverside ________ Club",
              options: null,
            },
            {
              id: "l1-q2",
              number: 2,
              prompt: "Day of booking: ________",
              options: null,
            },
            {
              id: "l1-q3",
              number: 3,
              prompt: "Expected number of people: ________",
              options: null,
            },
            {
              id: "l1-q4",
              number: 4,
              prompt: "Room requested: the ________ Room",
              options: null,
            },
          ],
        },
      ],
    },
  ],
  answerKey: {
    "l1-q1": ["photography"],
    "l1-q2": ["Thursday"],
    "l1-q3": ["25", "twenty-five"],
    "l1-q4": ["Garden"],
  },
};
