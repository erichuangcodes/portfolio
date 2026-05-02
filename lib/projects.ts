// ─────────────────────────────────────────────────────────────────────────────
// HOW TO EDIT PROJECTS
// ─────────────────────────────────────────────────────────────────────────────
//
// Each project is one object in the `projects` array below.
//
// REQUIRED FIELDS:
//   id        — unique lowercase string, no spaces (e.g. "aerio")
//   slug      — URL path segment, must match id  (e.g. /projects/aerio)
//   title     — display title on the card and detail hero
//   role      — your role (e.g. "Mechanical Designer & Engineer")
//   year      — string shown in the card corner (e.g. "2025" or "2024–25")
//   pitch     — ONE sentence shown in the hero glass card and used as
//               the page <meta description>
//   tech      — array of tool/skill strings shown as tags
//   links     — object of optional URLs (see LINKS section below)
//   gradient  — CSS gradient used as background until heroImage is uploaded
//   sections  — array of content sections (see SECTIONS section below)
//
// OPTIONAL FIELDS:
//   heroImage — path to the hero image relative to /public
//               e.g. "/projects/aerio-hero.jpg"
//               Set to `null` to use the gradient placeholder instead.
//
// ─────────────────────────────────────────────────────────────────────────────
// LINKS OBJECT — all fields are optional, include only what you have:
//   github   — GitHub repository URL
//   cad      — OnShape / Fusion360 / any CAD viewer URL
//   demo     — live demo, article, or press coverage URL
//   video    — YouTube, Vimeo, or TikTok URL
//   writeup  — PDF or blog post URL
//
// ─────────────────────────────────────────────────────────────────────────────
// SECTIONS ARRAY — each entry becomes a two-column section on the detail page:
//   heading  — section title shown large (e.g. "Overview", "Process")
//   body     — multi-paragraph text. Use \n\n to start a new paragraph.
//   images   — array of /public-relative image paths for that section.
//              Leave as [] until you have images to add.
//              Multiple images show a left/right arrow viewer.
//
// Typical section order:
//   1. "Overview"       — what the project is, the problem it solves
//   2. "Process"        — how you built it, early stages
//   3. "Errors & Fixes" — problems encountered and how you solved them
//   4. "Final Result"   — outcome, achievements, lessons learned
//
// ─────────────────────────────────────────────────────────────────────────────
// WHERE TO PUT IMAGE FILES:
//
//   Hero image → /public/projects/[slug]-hero.jpg  (1600×900px recommended)
//   Section images → /public/projects/[slug]-1.jpg, [slug]-2.jpg, etc.
//   Recommended: consistent aspect ratio, 1200px wide minimum, JPG or WebP
//
//   After adding a file to /public/, reference it with a leading slash:
//   heroImage: "/projects/aerio-hero.jpg"
//   images: ["/projects/aerio-1.jpg", "/projects/aerio-2.jpg"]
//
// ─────────────────────────────────────────────────────────────────────────────
// HOW TO ADD A NEW PROJECT:
//
//   1. Copy one of the objects below as a template.
//   2. Give it a unique `id` and matching `slug`.
//   3. Fill in required fields and at least one section.
//   4. Upload hero image to /public/projects/[slug]-hero.jpg and set heroImage.
//   5. The project will appear in the carousel and get its own URL automatically.
//
// ─────────────────────────────────────────────────────────────────────────────

export type ProjectSection = {
  heading: string;
  body: string;    // use \n\n to separate paragraphs
  images: string[]; // /public-relative paths; [] = no images yet
};

export type Project = {
  id: string;
  slug: string;
  title: string;
  role: string;
  year: string;
  pitch: string;   // one sentence — hero glass card + page meta description
  tech: string[];
  links: {
    github?: string;
    cad?: string;
    demo?: string;
    video?: string;
    writeup?: string;
  };
  heroImage: string | null; // null = show gradient placeholder
  gradient: string;         // always renders behind heroImage
  sections: ProjectSection[];
};

export const projects: Project[] = [
  // ── PROJECT 1 ────────────────────────────────────────────────────────────
  {
    id: "aerio",
    slug: "aerio",
    title: "Aerio",
    role: "Designer and App Developer",
    year: "2025",
    pitch: "A wearable smart mask that detects particulates and gas concentrations in real time.",
    tech: ["Fusion360", "Arduino", "C++", "Python"],
    links: {},
    heroImage: null,
    gradient: "linear-gradient(145deg, #1a6fa8 0%, #0ecfcf 100%)",
    sections: [
      {
        heading: "Overview",
        body: "Aerio is a wearable smart air purification mask built during NYU's IeSoSc program. It detects particulate matter and gas concentrations in real time using embedded sensors, giving the wearer immediate feedback on air quality.\n\nThe system runs Arduino C++ firmware on a custom sensor array, pairs with a Python companion app, and displays live readings on a small dashboard. At the final program showcase, the project received two investor offers.",
        images: ["/projects/version2aerio.png", "/projects/hollowshellv2aerio.png"]
      },
      {
        heading: "Version 1: Concept & Prototyping",
        body: "The project started with defining what a wearable air quality sensor actually needed to measure. After researching common environmental hazards, I selected sensors for PM2.5, CO2, and VOC levels — then prototyped a mount that fit inside a standard N95 form factor.\n\nMechanical design was done in Fusion360, iterating the sensor housing through three prints to get the fit right without restricting airflow.",
        images: ["/projects/Version1front.png", "/projects/version1backaerio.png", "/projects/applayoutaerio.png"],
      },
      {
        heading: "Errors & Fixes",
        body: "The biggest challenge was power consumption — running all sensors simultaneously drained the battery in under two hours. Solved by implementing a duty-cycle sampling schedule in firmware: sensors wake on a staggered interval and the MCU sleeps between reads.\n\nAnother issue was sensor cross-talk between the CO2 and VOC readings. Adding a physical separator between sensor chambers in revision 3 of the housing eliminated the interference.",
        images: ["/projects/version2cablesaerio.jpg"],
      },
      {
        heading: "Final Result",
        body: "Aerio demonstrated real-time air quality monitoring in a wearable form factor, with battery life extended to eight hours in the final firmware build. The companion app logs readings over time and flags threshold breaches.\n\nPresented at the NYU IeSoSc showcase — received two investor offers from the panel.",
        images: ["/projects/groupphotoaerio.png"],
      },
    ],
  },

  // ── PROJECT 2 ────────────────────────────────────────────────────────────
  {
    id: "adaptive-standing-desk",
    slug: "adaptive-standing-desk",
    title: "Adaptive Standing Desk",
    role: "Product Designer",
    year: "2024",
    pitch: "An adjustable desk for users with disabilities, designed and fabricated at MakerSpace NYC.",
    tech: ["Fusion360", "Laser Cutter", "CorelDRAW"],
    links: {
      demo: "https://www.makersmakingchange.com/news/makerspace-nyc-camp-participants-design-standing-desk-assistive-technology-solut-MCXJOQXBNX2ZCGRMROKIRBPZZBZE",
    },
    heroImage: null,
    gradient: "linear-gradient(145deg, #7a5230 0%, #e07b39 100%)",
    sections: [
      {
        heading: "Overview",
        body: "This standing desk was designed for wheelchair users and individuals with limited mobility who need an adjustable work surface. The goal was a clean, manufacturable design that a makerspace could reproduce without specialized tooling.\n\nAll parts were laser cut from plywood and assembled without fasteners, using friction-fit joinery. The height-adjustment mechanism uses a sliding rail with indexed stops.",
        images: [],
      },
      {
        heading: "Process",
        body: "The design process started with measurements from occupational therapy guidelines for wheelchair-accessible work surfaces. I modeled the desk in Fusion360, then cut templates in CorelDRAW for the laser cutter.\n\nFirst prototype exposed a racking issue in the rail — the desk would shift laterally under load. Added cross-bracing in revision 2, which solved it without adding visual bulk.",
        images: [],
      },
      {
        heading: "Errors & Fixes",
        body: "The friction-fit joints were too loose on the first cut due to kerf miscalculation. After measuring the actual kerf on our laser cutter (0.2mm), I updated the DXF files and the second cut fit together without gaps.\n\nThe sliding rail also needed more indexed stops — the first version only had three height positions. Added five more stops to cover the full range in 2-inch increments.",
        images: [],
      },
      {
        heading: "Final Result",
        body: "The desk was featured by Makers Making Change for its accessibility focus. The design files are available for other makerspaces to reproduce and adapt.\n\nBeyond the object itself, this project changed how I think about constraints — designing for a specific user need produces more interesting solutions than designing for an average case.",
        images: [],
      },
    ],
  },

  // ── PROJECT 3 ────────────────────────────────────────────────────────────
  {
    id: "chair-design",
    slug: "chair-design",
    title: "Award-Winning Chair",
    role: "Product Designer",
    year: "2024",
    pitch: "First-place chair design from MakerSpace NYC's summer program.",
    tech: ["Fusion360", "CorelDRAW", "Laser Cutter"],
    links: {},
    heroImage: null,
    gradient: "linear-gradient(145deg, #2d7a4f 0%, #1a9e8a 100%)",
    sections: [
      {
        heading: "Overview",
        body: "The chair was designed for MakerSpace NYC's summer program final exhibition. The brief was open: design and fabricate a chair in two weeks using the shop's tools. The constraint that shaped the design most was the laser cutter's bed size — every part had to fit within 24×18 inches.\n\nThe result is a three-legged stool with compound-angle joinery hidden inside the legs, so the structure reads as simple from a distance.",
        images: ["/projects/chairgallery.png"],
      },
      {
        heading: "Process",
        body: "I started by studying joints — specifically how Japanese joinery achieves rigidity without fasteners. The compound mortise-and-tenon I landed on locks under load: the harder you sit, the tighter it gets.\n\nAll pieces were modeled in Fusion360 and exported to CorelDRAW for laser cutting. The tight tolerances meant the kerf calibration from the standing desk project was immediately useful.",
        images: ["/projects/chairv1.png"],
      },
      {
        heading: "Errors & Fixes",
        body: "The first assembly had a twist — one leg sat 3mm higher than the others because the compound angle on the mortise was cut at the wrong orientation. Fixed by re-cutting just the affected leg and adding a reference mark to the jig to prevent recurrence.\n\nSanding the compound angles was harder than expected. Ended up building a simple angled sanding block from scrap material to hold the part at the right angle.",
        images: ["/projects/chairside.png"],
      },
      {
        heading: "Final Result",
        body: "Won first place for best chair design out of the full program cohort. The judges highlighted the joinery detail — most entries used screws or brackets.\n\nForm follows material — that became the guiding principle of the project. The joint type available to me with a laser cutter determined the silhouette, which meant the form and the structure became the same thing.",
        images: [],
      },
    ],
  },

  // ── PROJECT 4 ────────────────────────────────────────────────────────────
  {
    id: "mechanical-keyboard",
    slug: "mechanical-keyboard",
    title: "Mechanical Keyboard",
    role: "Builder",
    year: "2025",
    pitch: "Hand-soldered from a bare PCB — every switch placed by hand, firmware flashed with QMK.",
    tech: ["Soldering", "PCB", "QMK Firmware"],
    links: {},
    heroImage: null,
    gradient: "linear-gradient(145deg, #6b31b0 0%, #d4649a 100%)",
    sections: [
      {
        heading: "Overview",
        body: "Started with a bare 60% PCB from KBDfans and soldered every component from scratch at home. The build taught the full process of through-hole soldering, switch modding, and QMK firmware configuration.\n\nNow my daily driver. The experience directly seeded the Electrical Workshop Club's curriculum — I used this build as the demo for the club's first PCB soldering session.",
        images: [],
      },
      {
        heading: "Process",
        body: "The PCB arrived as a bare board with no components. First step was flashing the bootloader to verify the microcontroller was functional before soldering anything permanent.\n\nSwitch placement came next — each switch is hot-glued into the plate, then soldered in two passes: first leg only to check alignment, then the second leg once confirmed. Desoldering is painful, so the two-pass approach saved several switches.",
        images: [],
      },
      {
        heading: "Errors & Fixes",
        body: "Three switches had cold solder joints on the first pass — the solder balled up instead of flowing into the pad. Reflowed with flux and a higher iron temperature. The root cause was using too little flux from the start.\n\nThe QMK configuration also had a layer conflict — the Fn layer was overriding the default layer on certain combos. Fixed by re-reading the QMK docs on layer precedence and restructuring the keymap.",
        images: [],
      },
      {
        heading: "Final Result",
        body: "A fully functional 60% mechanical keyboard that I use every day. The build took one weekend plus evenings over two weeks.\n\nEvery keystroke is a decision you made with your hands. That ended up being the reason I kept it: there's a directness to using something you built component by component that changes how you relate to the tool.",
        images: [],
      },
    ],
  },

  // ── PROJECT 5 ────────────────────────────────────────────────────────────
  {
    id: "ftc-robot-2026",
    slug: "ftc-robot-2026",
    title: "FTC Competition Robot",
    role: "Mechanical Build Team",
    year: "2025–26",
    pitch: "CAD, fabrication, and assembly for the SITHS Saturn Robotics competition robot.",
    tech: ["Onshape", "Machining", "FTC"],
    links: {},
    heroImage: null,
    gradient: "linear-gradient(145deg, #b52020 0%, #e06830 100%)",
    sections: [
      {
        heading: "Overview",
        body: "SITHS Saturn Robotics competes in FIRST Tech Challenge, a robotics competition where teams build a 18×18×18-inch robot to complete game-specific tasks autonomously and under driver control.\n\nMy role is mechanical: CAD in Onshape, fabrication in the shop, and assembly and maintenance during competition season. The 2025–26 robot earned 1st place at NYC Qualifier 2 and reached Top 6 at the NYC Championship.",
        images: ["/projects/ftcrobotirl.png"],
      },
      {
        heading: "Process",
        body: "The season starts with game analysis — breaking down the scoring objectives and deciding which tasks are worth building mechanisms for. We then CAD the full robot in Onshape before cutting any metal, which lets us catch interference issues early.\n\nFabrication uses a mix of aluminum extrusion, custom-machined brackets, and 3D-printed housings. Iterating on mechanisms between qualifiers is the hardest part — changes have to happen fast and hold up under competition stress.",
        images: ["/projects/ftcrobotcad.png"],
      },
      {
        heading: "Errors & Fixes",
        body: "The intake mechanism failed at our first scrimmage — the rollers slipped on the game element because the contact surface was too smooth. We added grip tape to the rollers overnight and it worked for the rest of the season.\n\nDuring Qualifier 2, a drive motor mount cracked mid-match. The robot finished the match on three wheels. That bracket was redesigned with a gusset and a thicker wall — no further failures.",
        images: ["/projects/ftcrobotcadrealistic.png"],
      },
      {
        heading: "Final Result",
        body: "Won NYC Qualifier 2 as alliance captain, which qualified us for the NYC Championship where we finished in the Top 6 alliances.\n\nBeyond the results: the season taught me that winning alliances are built in the shop, not on the field. Reliability beats peak performance. A robot that works every match beats one that's impressive but fragile.",
        images: [],
      },
    ],
  },

  // ── PROJECT 6 ────────────────────────────────────────────────────────────
  {
    id: "bonsyfilms",
    slug: "bonsyfilms",
    title: "bonsyfilms",
    role: "Videographer & Creator",
    year: "2025–",
    pitch: "A TikTok videography account covering filmmaking, editing, and music — 1M+ views.",
    tech: ["Video Production", "Editing"],
    links: { demo: "https://www.tiktok.com/@bonsyfilms" },
    heroImage: null,
    gradient: "linear-gradient(145deg, #2a2a2a 0%, #8a8a8a 100%)",
    sections: [
      {
        heading: "Overview",
        body: "bonsyfilms is a TikTok account focused on filmmaking, editing techniques, and music. 1M+ views and 250k+ likes across videos covering everything from color grading to camera movement to sync editing.\n\nThe account started as a place to post video experiments and became a consistent creative practice. It runs in parallel with engineering work — and the skills transfer more than expected.",
        images: [],
      },
      {
        heading: "Process",
        body: "Each video starts with a specific technique I want to explore or demonstrate. Most are under 60 seconds, which forces tight editing — every cut has to earn its place.\n\nThe constraint of short-form video sharpened my sense of pacing and visual hierarchy faster than longer work would have. Identifying the single strongest shot and building around it is the same skill as identifying the key constraint in a mechanical design.",
        images: [],
      },
      {
        heading: "Errors & Fixes",
        body: "Early videos had inconsistent color — I was grading on a monitor that wasn't calibrated, and the videos looked different on every other screen. Getting a proper calibration target and learning to grade for a neutral reference fixed this.\n\nPacing was also an issue in early edits — cuts would land a beat too late, breaking momentum. Learned to edit to the transient of the beat, not the note.",
        images: [],
      },
      {
        heading: "Final Result",
        body: "1M+ views, 250k+ likes, and a consistent creative practice that sharpens the instincts I bring to engineering documentation and presentation.\n\nThe edit is where the story becomes true. That applies to film, but also to how a project is documented, presented, and remembered.",
        images: [],
      },
    ],
  },
];
