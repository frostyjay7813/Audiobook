export interface Sentence {
  id: string;
  text: string;
}

export interface Paragraph {
  id: string;
  sentences: Sentence[];
}

export interface Chapter {
  id: string;
  title: string;
  paragraphs: Paragraph[];
}

export interface Book {
  title: string;
  author: string;
  narrator: string;
  chapters: Chapter[];
}

// Helper to split text into sentences carefully.
// In a real app, this would be more robust to handle abbreviations (e.g., Mr., Dr.)
function parseParagraph(text: string, pIndex: number, cIndex: number): Paragraph {
  // Simplistic sentence splitting for demo purposes
  const rawSentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const sentences = rawSentences.map((s, sIndex) => ({
    id: `c${cIndex}-p${pIndex}-s${sIndex}`,
    text: s.trim()
  }));

  return {
    id: `c${cIndex}-p${pIndex}`,
    sentences: sentences.length > 0 ? sentences : [{ id: `c${cIndex}-p${pIndex}-s0`, text: text.trim() }]
  };
}

function createChapter(title: string, rawParagraphs: string[], cIndex: number): Chapter {
  return {
    id: `c${cIndex}`,
    title,
    paragraphs: rawParagraphs.map((p, pIndex) => parseParagraph(p, pIndex, cIndex))
  };
}

export const bookData: Book = {
  title: "Build Your First Gadget",
  author: "Gizmos Tech LLC",
  narrator: "The Curious Creator",
  chapters: [
    createChapter(
      "Chapter 1: Why Electronics Can Change How You See Yourself",
      [
        "For a long time, I believed that building electronics was a magical art reserved for people who were born holding a soldering iron.",
        "I thought that unless you could instantly look at a mess of wires and intuitively understand how they formed a functioning radio, you had no business even trying.",
        "But the truth is, everyone starts somewhere. And usually, that somewhere is looking at a blinking LED and thinking, 'Wow, I actually made that happen.'",
        "The shift from consumer to creator is profound. When you stop merely interacting with technology and start understanding it, a whole new world opens up. You begin to look at the devices around you not as mysterious black boxes, but as puzzles waiting to be understood.",
        "This chapter is about taking that first step. It's about giving yourself permission to be a beginner, to make mistakes, and to learn that a blown fuse is not a failure, but a necessary part of the process."
      ],
      0
    ),
    createChapter(
      "Chapter 2: Mindset Shift — Releasing the 'Not a Tech Person' Story",
      [
        "How many times have you said to yourself, 'I'm just not a tech person'?",
        "We use these labels as armor. They protect us from the frustration of not understanding something immediately. If you're 'not a tech person', then it's perfectly fine that you don't know how a resistor works. It lets you off the hook.",
        "But what if we dropped that label? What if, instead of declaring a fixed identity, we adopted a growth mindset?",
        "Learning electronics is like learning a new language. You wouldn't expect to be fluent in French after your first lesson. Why should learning the language of circuits be any different?",
        "Give yourself the grace to be confused. The confusion is where the learning happens. Embrace the moment when a concept finally clicks—it's one of the most satisfying feelings in the world."
      ],
      1
    ),
    createChapter(
      "Chapter 3: Essential Tools and Safety Basics",
      [
        "Before we dive into building, we need to gather our tools. Think of this as setting up your kitchen before cooking a grand meal.",
        "You don't need a professional laboratory to get started. A few basic, high-quality items are all that's required.",
        "First, a good soldering iron. Don't skimp here; a cheap iron will cause more frustration than it's worth. Second, a digital multimeter. This is your window into the invisible world of electricity.",
        "Finally, wire strippers, flush cutters, and a pair of safety glasses. Safety is paramount. Always respect the electricity you're working with, no matter how low the voltage.",
        "Keep your workspace clean, work in a well-ventilated area when soldering, and never work on a circuit while it is plugged into wall power. A little common sense goes a long way."
      ],
      2
    ),
    createChapter(
      "Chapter 4: The Magic of Breadboards",
      [
        "Welcome to the playground. The breadboard is where ideas become reality without the commitment of permanent solder.",
        "It's a canvas of tiny holes connected by hidden metal strips, allowing you to plug components in and pull them out with ease.",
        "We will start by building the simplest possible circuit: a power source, a resistor, and an LED.",
        "Seeing that tiny light glow for the first time is a rite of passage. It proves that you have successfully harnessed electrons and directed them to do your bidding."
      ],
      3
    )
  ]
};
