// ─────────────────────────────────────────────────────────────────────────────
// HOW TO EDIT EXPERIENCE ENTRIES
// ─────────────────────────────────────────────────────────────────────────────
//
// Each role is one object in the `EXPERIENCE` array below.
// Entries are displayed in the order they appear here — put the most
// recent or most prominent roles first.
//
// REQUIRED FIELDS:
//   company     — organization name shown as the card heading
//   initials    — 2-letter fallback shown in the logo circle when logoPath is null
//                 e.g. "MS" for MakerSpace NYC
//   role        — your title at that organization
//   dates       — human-readable date range shown on the card
//                 e.g. "Jul 2025 – Aug 2025" or "Sept 2025 – Present"
//   year        — short year label used for sorting/display (e.g. "2025" or "2025–26")
//   description — 2–4 sentences describing what you did and the impact
//   tech        — array of tool/skill strings shown as tags
//
// OPTIONAL FIELDS:
//   logoPath    — path to a company/org logo image relative to /public
//                 e.g. "/logos/makerspace-nyc.png"
//                 Set to `null` to show the `initials` fallback circle instead.
//
// ─────────────────────────────────────────────────────────────────────────────
// WHERE TO PUT LOGO FILES:
//
//   Logo image → /public/logos/[org-name].png
//                (recommended: square, at least 80×80px, PNG with transparency)
//
//   After adding the file, set logoPath: "/logos/[org-name].png"
//   The logo is displayed at 40×40px inside a circle — keep it simple.
//
// ─────────────────────────────────────────────────────────────────────────────
// HOW TO ADD A NEW ENTRY:
//
//   1. Copy one of the objects below as a template.
//   2. Fill in all required fields.
//   3. Set logoPath to null (uses initials fallback) until you have a logo file.
//   4. Add the entry in the position you want it to appear on the page.
//
// ─────────────────────────────────────────────────────────────────────────────

export type ExperienceEntry = {
  company: string;
  initials: string;        // 2-letter fallback when logoPath is null
  logoPath: string | null; // null = show initials circle
  role: string;
  dates: string;           // display string, e.g. "Jul 2025 – Aug 2025"
  year: string;            // short label, e.g. "2025"
  description: string;
  tech: readonly string[];
};

export const EXPERIENCE: readonly ExperienceEntry[] = [
  // ── ENTRY 1 ──────────────────────────────────────────────────────────────
  {
    company: "IeSoSc @ NYU",
    initials: "IN",
    logoPath: null, // replace with "/logos/nyu.png" once you have the file
    role: "Intern",
    dates: "Jul 2025 – Aug 2025",
    year: "2025",
    description:
      "Led the design of Aerio — a wearable smart air purification mask — during NYU's Innovation, Entrepreneurship and Science of Smart Cities program. Owned mechanical design in Fusion360, contributed C++ Arduino firmware, and built a Python companion app tracking air quality, gas levels, and filter status. Pitched to investors at the final showcase and received two offers.",
    tech: ["Fusion360", "Arduino", "C++", "Python"],
  },

  // ── ENTRY 2 ──────────────────────────────────────────────────────────────
  {
    company: "MakerSpace NYC",
    initials: "MS",
    logoPath: null,
    role: "Program Member",
    dates: "Jul 2024 – Aug 2024",
    year: "2024",
    description:
      "Operated laser cutters, table saws, and sanding machines alongside CorelDRAW and Fusion360. Designed and built furniture — tables, chairs, and a standing desk for users with disabilities. Won first place for best chair design out of the full cohort.",
    tech: ["Fusion360", "CorelDRAW", "Laser Cutter", "Woodworking"],
  },

  // ── ENTRY 3 ──────────────────────────────────────────────────────────────
  {
    company: "Explortle",
    initials: "EX",
    logoPath: null,
    role: "Event Manager",
    dates: "Feb 2025 – Present",
    year: "2025",
    description:
      "Lead interviews with STEM professionals and design educational presentations on engineering disciplines. Compiled pamphlets and mini-project materials introducing kids to fundamental STEM concepts. Educated 50+ students directly and distributed materials to 200+ families.",
    tech: ["Curriculum Design", "Presentation"],
  },

  // ── ENTRY 4 ──────────────────────────────────────────────────────────────
  {
    company: "Electrical Workshop Club",
    initials: "EW",
    logoPath: null,
    role: "President",
    dates: "Jan 2025 – Present",
    year: "2025",
    description:
      "Run weekly circuitry sessions teaching electronics assembly. Hand-soldered a fully functional mechanical keyboard from a bare PCB. Expanded the club beyond solder kits — introduced CAD instruction and DIY hardware projects, including a member-built electric car.",
    tech: ["Soldering", "PCB Assembly", "CAD"],
  },

  // ── ENTRY 5 ──────────────────────────────────────────────────────────────
  {
    company: "SITHS Saturn Robotics",
    initials: "SR",
    logoPath: null,
    role: "Build Team",
    dates: "Sept 2025 – Present",
    year: "2025–26",
    description:
      "CAD, build, and assemble the team's FTC competition robot. Helped earn 1st place at NYC Qualifier 2 as winning alliance captain, and a Top 6 alliances finish at the NYC Championship. Scout opposing teams at competitions and contribute match strategy.",
    tech: ["Onshape", "Mechanical Assembly", "FTC"],
  },

  // ── ENTRY 6 ──────────────────────────────────────────────────────────────
  {
    company: "bonsyfilms",
    initials: "BF",
    logoPath: null,
    role: "Videographer / Creator",
    dates: "Sept 2025 – Present",
    year: "2025–",
    description:
      "Run a videography-focused social media account covering filmmaking, editing, and music. 1M+ views and 250k+ likes on TikTok. The practice sharpens composition and pacing instincts that feed back into how I document and present engineering work.",
    tech: ["Video Production", "Editing", "TikTok"],
  },
];
