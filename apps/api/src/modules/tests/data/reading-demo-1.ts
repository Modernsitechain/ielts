import type { TestRecord } from "../test-record";

// Original demo content. Not official IELTS material.
// Short version (9 questions); a real test has 3 passages / 40 questions.

const passage = `A  Twenty years ago, keeping bees on a city rooftop would have struck most planners as eccentric, if not dangerous. Today, cities from London to Jakarta host thousands of registered hives, many of them on hotels, offices and schools. Supporters argue that the trend reconnects city dwellers with food production and raises awareness of the decline in pollinating insects.

B  The rapid growth, however, has raised a question that few early enthusiasts considered: can a city support so many bees? A honeybee colony in summer may contain 50,000 workers, each visiting hundreds of flowers a day. Where parks and gardens are limited, colonies may compete with one another, and with wild bees, for the same nectar.

C  A 2019 survey of one European capital found that the number of hives had tripled in a decade, while the area of flowering green space had barely changed. Researchers reported that honey yields per hive had fallen by almost a third over the same period. They cautioned, however, that weather and disease could also explain part of the decline.

D  Wild bees may be more vulnerable than their domesticated relatives. Many solitary species fly only a few hundred metres from their nests, so they cannot easily move elsewhere when local flowers are exhausted. Some ecologists therefore recommend that cities limit new hives in districts with little vegetation, a proposal that beekeeping associations have criticised as unnecessary.

E  A compromise may lie in planting rather than restricting. Several municipalities now require new commercial buildings to include green roofs, and some offer grants for planting native flowering species. Advocates claim that such measures benefit all pollinators, not just honeybees, although their long-term effect has yet to be measured.`;

export const readingDemo1: TestRecord = {
  id: "reading-demo-1",
  title: "Reading Academic — Demo 1",
  skill: "reading",
  module: "academic",
  isFree: true,
  durationMinutes: 60,
  sections: [
    {
      id: "r1-s1",
      order: 1,
      kind: "passage",
      title: "Passage 1: Bees in the City",
      content: passage,
      audioUrl: null,
      groups: [
        {
          id: "r1-g1",
          order: 1,
          numberFrom: 1,
          numberTo: 4,
          instructions:
            "Do the following statements agree with the information given in the passage? Write TRUE, FALSE or NOT GIVEN.",
          payload: { type: "true_false_not_given" },
          questions: [
            {
              id: "r1-q1",
              number: 1,
              prompt:
                "City planners once considered urban beekeeping to be unusual.",
              options: null,
            },
            {
              id: "r1-q2",
              number: 2,
              prompt: "Jakarta has more registered hives than London.",
              options: null,
            },
            {
              id: "r1-q3",
              number: 3,
              prompt:
                "In the survey, the area of flowering green space increased significantly.",
              options: null,
            },
            {
              id: "r1-q4",
              number: 4,
              prompt:
                "The researchers were certain that competition between bees was the only cause of lower honey yields.",
              options: null,
            },
          ],
        },
        {
          id: "r1-g2",
          order: 2,
          numberFrom: 5,
          numberTo: 6,
          instructions: "Choose the correct letter, A, B, C or D.",
          payload: { type: "multiple_choice_single" },
          questions: [
            {
              id: "r1-q5",
              number: 5,
              prompt:
                "According to paragraph D, many solitary bees are vulnerable because they",
              options: [
                { key: "A", text: "produce less honey than honeybees." },
                { key: "B", text: "travel only short distances from their nests." },
                { key: "C", text: "are kept by fewer beekeepers." },
                { key: "D", text: "avoid flowers on green roofs." },
              ],
            },
            {
              id: "r1-q6",
              number: 6,
              prompt:
                "How have beekeeping associations responded to the proposal to limit new hives?",
              options: [
                { key: "A", text: "They have supported it." },
                { key: "B", text: "They have described it as unnecessary." },
                { key: "C", text: "They have not yet commented on it." },
                { key: "D", text: "They have suggested other locations for hives." },
              ],
            },
          ],
        },
        {
          id: "r1-g3",
          order: 3,
          numberFrom: 7,
          numberTo: 9,
          instructions:
            "Complete the sentences below. Choose NO MORE THAN TWO WORDS AND/OR A NUMBER from the passage for each answer.",
          payload: { type: "sentence_completion", maxWords: 2, allowNumber: true },
          questions: [
            {
              id: "r1-q7",
              number: 7,
              prompt: "In summer, a honeybee colony may contain ________ workers.",
              options: null,
            },
            {
              id: "r1-q8",
              number: 8,
              prompt:
                "Some municipalities require new commercial buildings to include ________.",
              options: null,
            },
            {
              id: "r1-q9",
              number: 9,
              prompt: "Some cities offer grants for planting ________ species.",
              options: null,
            },
          ],
        },
      ],
    },
  ],
  answerKey: {
    "r1-q1": ["TRUE"],
    "r1-q2": ["NOT GIVEN"],
    "r1-q3": ["FALSE"],
    "r1-q4": ["FALSE"],
    "r1-q5": ["B"],
    "r1-q6": ["B"],
    "r1-q7": ["50,000", "50000", "50 000"],
    "r1-q8": ["green roofs"],
    "r1-q9": ["native flowering"],
  },
};
