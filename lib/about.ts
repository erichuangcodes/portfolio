// Everything editable in the About section lives here. Components read this
// file only, so copy, photos, links and the song can change without touching
// any component code.

export type AboutPhoto = {
  /** Path under /public, e.g. "/about/workshop.jpg". null = placeholder. */
  src: string | null;
  alt: string;
};

export type AboutTool = {
  name: string;
  /** simple-icons slug, or null for a text label. */
  icon: string | null;
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

  /** 3–4 short paragraphs. */
  paragraphs: [
    "hi, my name is eric! i'm currently a high school senior in NYC. I aspire to become a mechanical engineer major and specialize in robotics.",
    "some of my work includes embedded systems, enclosement design, and hardware design. I've explored how sensors interact with the real world, and am currently attempting to debug that with my FTC team right now.",
    "outside of that, i love playing basketball and biking. while biking, since im usually in the city, i will film around and post edits on social media.",
    "if your building something or are just curious in anything, please reach out! i dont bite :0",
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
    title: "Loft Music",
    artist: "The Weeknd",
    // Cover art lives in /public/about. null shows a placeholder.
    albumArt: "/about/house-of-balloons.png" as string | null,
  },

  /**
   * Sliding tool band between About and Projects. Order here is the order on
   * screen. `icon` is a simple-icons slug; null shows the name as a text label.
   * A new slug also needs adding to ICONS in components/sections/ToolsBand.tsx.
   */
  tools: {
    /** Small heading above the band. Set to null to hide it. */
    heading: null as string | null,
    items: [
      { name: "Fusion 360", icon: null }, // only a generic Autodesk logo exists
      { name: "Inventor", icon: null }, // not in simple-icons
      { name: "AutoCAD", icon: "autocad" },
      { name: "Onshape", icon: null }, // not in simple-icons
      { name: "Arduino", icon: "arduino" },
      { name: "C++", icon: "cplusplus" },
      { name: "Python", icon: "python" },
      { name: "JavaScript", icon: "javascript" },
      { name: "Node.js", icon: "nodedotjs" },
      { name: "React", icon: "react" },
      { name: "LVGL", icon: "lvgl" },
      { name: "QMK", icon: "qmk" },
      { name: "CorelDRAW", icon: "coreldraw" },
      { name: "DaVinci Resolve", icon: "davinciresolve" },
      { name: "CapCut", icon: null }, // not in simple-icons
    ] satisfies AboutTool[],
  },
};
