// Everything editable in the About section lives here. Components read this
// file only, so copy, photos, links and the song can change without touching
// any component code.

export type AboutPhoto = {
  /** Path under /public, e.g. "/about/workshop.jpg". null = placeholder. */
  src: string | null;
  alt: string;
};

export type AboutLink = {
  label: string;
  /** null hides the link. */
  href: string | null;
};

export const about = {
  /** Cycled by the typing headline. Keep them short (one line). */
  greetings: [
    "Hi, I'm Eric.", // PLACEHOLDER
    "I build things.", // PLACEHOLDER
    "I make films too.", // PLACEHOLDER
  ],

  /** 3–4 short paragraphs. PLACEHOLDER copy, replace all of it. */
  paragraphs: [
    "[Placeholder] One or two sentences on who you are and what you're studying or working on right now.",
    "[Placeholder] What you like building: hardware, CAD, the moment a model becomes a real object.",
    "[Placeholder] Where design comes in, and how filmmaking shapes the way you tell a project's story.",
    "[Placeholder] What you're looking for next, or what you do when you're away from the desk.",
  ],

  /**
   * Photo viewer, shown in order and wrapping at the ends. Put the files in
   * /public/about/ and set src. The frame is a fixed 4:5, so any photo works
   * without the layout jumping; portrait photos fill it best.
   */
  photos: [
    { src: null, alt: "Placeholder photo 1" },
    { src: null, alt: "Placeholder photo 2" },
    { src: null, alt: "Placeholder photo 3" },
    { src: null, alt: "Placeholder photo 4" },
  ] satisfies AboutPhoto[],

  links: {
    /** NOTE: /public/resume.pdf doesn't exist yet. Add the file there. */
    resume: { label: "Resume", href: "/resume.pdf" } satisfies AboutLink,
    /** Optional second link, e.g. LinkedIn or GitHub. Set href to show it. */
    secondary: { label: "LinkedIn", href: null } satisfies AboutLink,
  },

  /** "On repeat lately". Static for now. albumArt: path under /public or null. */
  song: {
    title: "Song title", // PLACEHOLDER
    artist: "Artist name", // PLACEHOLDER
    albumArt: null as string | null,
  },
};
