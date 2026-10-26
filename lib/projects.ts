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
    id: "velometrics",
    slug: "velometrics",
    title: "Velometrics",
    role: "Designer & Builder",
    year: "2025",
    pitch: "A DIY ESP32-S3 bike computer with live GPS and a custom LVGL display.",
    tech: ["ESP32-S3", "LVGL", "C++", "Fusion360"],
    links: {},
    heroImage: null,
    gradient: "linear-gradient(145deg, #6b31b0 0%, #d4649a 100%)",
    sections: [
      {
        heading: "Overview",
        body: "Velometrics is a bike computer I built from scratch, since I wanted something between a phone strapped to the handlebars and a $200+ Garmin, with a screen I actually control. I finished the basic tier, which runs an LVGL interface on an ESP32-S3 with live GPS that gets a fix in about 20 to 25 seconds, and I designed the enclosure in Fusion 360.",
        images: [],
      },
      {
        heading: "Process",
        body: "Before building anything, I pressure-tested the idea by asking who would need this when a phone mount is free and Garmin already owns the serious riders; that question pushed me to scope the build in tiers, starting with a moving GPS dot and speed, then BLE sensors, then WiFi and Strava sync. Scoping it this way also let me cut the parts list from about $200 to $300 down to $60 to $70 by dropping the IMU, RTC, and buzzer.\n\nWhile the parts shipped, I designed the UI in an LVGL simulator, first in the browser and then in the C/SDL version, so the interface was ready by the time the hardware arrived. The firmware came together in phases (blink, serial, LCD, LVGL, then GPS), and I held off on CAD until the breadboard and perfboard layout was locked before modeling the enclosure in Fusion. I ultimately stopped after the basic tier, so the sensor and sync tiers are still unbuilt.",
        images: [],
      },
      {
        heading: "Errors & Fixes",
        body: "Problem: Firmware uploads kept failing whenever the GPS was wired in.\nFix: I unplugged the GPS TX wire on GPIO 16 while flashing and plugged it back in afterward; long term, I want a small switch or jumper on that line.\n\nProblem: Serial printed “HSPI Does not have default pins on ESP32S3,” since TFT_eSPI assumed classic ESP32 pins.\nFix: I set the SPI port to FSPI and defined my custom TFT pins (MOSI 11, SCLK 12, CS 10, DC 13, RST 14) in the build flags.\n\nProblem: Colors on the real LCD didn’t match the simulator.\nFix: The issue was byte swapping, so I matched LV_COLOR_16_SWAP in the build flags with the swap flag in the pushColors flush call and tested both settings.\n\nProblem: A Guru Meditation (StoreProhibited) crash hit during setup() before anything printed.\nFix: I stripped setup() down to just Serial, then re-added tft.init(), LVGL, and GPS one at a time to find the crashing line.",
        images: [],
      },
      {
        heading: "Final Result",
        body: "Designing the UI in a simulator while parts were still in the mail saved me real time, and it’s something I would do again on any hardware project. Asking early whether the device solves a real problem also kept me from just building a worse phone.",
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
    tech: ["Onshape", "Machining", "3D Printing", "RoadRunner", "FTC"],
    links: {},
    heroImage: null,
    gradient: "linear-gradient(145deg, #b52020 0%, #e06830 100%)",
    sections: [
      {
        heading: "Overview",
        body: "SITHS Saturn Robotics competes in FIRST Tech Challenge, where teams build an 18×18×18-inch robot to complete game-specific tasks autonomously and under driver control. My role is mechanical: CAD in Onshape, fabrication in the shop, and assembly and maintenance during competition season. This year’s game was the team’s first shooter, and our robot earned 1st place at NYC Qualifier 2 and reached Top 6 at the NYC Championship.",
        images: ["/projects/ftcrobotirl.png"],
      },
      {
        heading: "Process",
        body: "We started with a week of prototyping and settled on three priorities: fast shooting, a ground intake built for artifact collection, and many degrees of freedom. We dropped a spindexer and a three-at-a-time vectored intake for a simpler funneled intake feeding a belted transfer ramp. The shooter is only five mostly laser cut and 3D printed parts, with two belted motors, steel flywheels, and an adjustable hood on a servo turret. Our first parallel drive train was built from in-house materials, and the whole bot separates into subsystems with a handful of screws for quick repairs. In code, we use PID control, RoadRunner autonomous routines, and an AprilTag camera with odometry to auto-aim the turret.",
        images: ["/projects/ftcrobotcad.png"],
      },
      {
        heading: "Errors & Fixes",
        body: "Problem: Our 546 rpm drive train with 3 mm belts kept skipping, even with better tensioning and 3D printed tension adapters.\nFix: We switched to 5 mm pitch belts and a 468 rpm ratio, a reliable option we could count on.\n\nProblem: The intake had a deadzone at the center, and our first 3D printed funnels were too shallow and jammed.\nFix: Bigger compliant wheels and steeper reprinted funnels helped, and a smaller intake with more large wheels removed the last dead zones.\n\nProblem: The flywheels lost too much speed between shots, and lead beads packed between them vibrated too much.\nFix: After many failed cuts on the school’s plasma table, we made 8 steel disks that add 2 pounds, with the outer diameter maximized for moment of inertia.\n\nProblem: The turntable’s friction was too much for a 1:1 gear ratio on our servo turret.\nFix: We moved to a 1:2 ratio, which meant aiming relative to the starting position instead of with an absolute encoder.",
        images: ["/projects/ftcrobotcadrealistic.png"],
      },
      {
        heading: "Final Result",
        body: "Won NYC Qualifier 2 as alliance captain, which qualified us for the NYC Championship, where we finished in the Top 6 alliances. The pattern across the season was that the simpler, more reliable option won: higher pitch belts, a funneled intake over a spindexer, and a five-part shooter. For V2 we plan a two-servo lift that tilts the bot for full parking points, and a differential swerve drive on 6 motors.",
        images: [],
      },
    ],
  },

  // ── PROJECT 6 ────────────────────────────────────────────────────────────
  {
    id: "quota-machine",
    slug: "quota-machine",
    title: "Quota Machine",
    role: "Game Engine & Deployment",
    year: "2026",
    pitch: "A roguelike puzzle game where you wire logic circuits to hit your factory’s quota.",
    tech: ["Vite", "GitHub Pages", "GitHub Actions"],
    links: {},
    heroImage: null,
    gradient: "linear-gradient(145deg, #0f4c5c 0%, #5fb49c 100%)",
    sections: [
      {
        heading: "Overview",
        body: "Quota Machine is a browser-based roguelike puzzle game about a systems engineer drowning in debt; every turn, you solve digital logic circuit puzzles to power machines, chain those machines together, and hit a rising quota before you lose. Digital logic and the fragility of automated systems are usually taught through dry textbook diagrams, so we built a game that makes you actually feel what it means to automate something and then watch it fail.\n\nI built it with one teammate at VSHacks 2026 in about 30 hours under the hackathon’s “Automation” theme. Honorable mention at the hackathon.",
        images: [],
      },
      {
        heading: "Process",
        body: "We spent the first hour without writing any code, instead scripting out a single player turn in plain English, which caught a disagreement about what “connecting two machines” meant on screen before it could cost us a day. I prototyped and tested the hardest piece up front, a circuit evaluator that checks any player-built gate graph against a truth table, so the UI built on top of it couldn’t get blocked by unknown logic bugs.\n\nFrom there, I owned the game engine (circuit evaluator, turn resolution, stamina, failure rolls, and synergy math) and the deployment pipeline (Vite, GitHub Pages, and GitHub Actions on push to main), while Raymond owned the original idea and making bug fixes and the circuit diagram functions. To finish on time, we cut the sleep and boss favorability meters, swapped scheduled machine failures for a simple random roll after 5 turns, and hardcoded 6 machines with 3 synergy pairs instead of a procedural system.",
        images: [],
      },
      {
        heading: "Errors & Fixes",
        body: "Problem: While manually merging a stamina feature into the existing game files, I pasted the new functions beside the originals, which left two createInitialState and two advanceTurn exports and broke the build.\nFix: I merged them into single functions, adding stamina and maxStamina to the existing initial state and turn-advance return, then deleted the duplicates.\n\nProblem: An early version of the circuit editor had its validation logic at module top level instead of inside the component, referencing variables that didn’t exist in that scope.\nFix: I moved the validate-and-spend-stamina logic into a handleCheck function inside the component and threaded gameState and setGameState through as props, so it had real state to read and write.\n\nProblem: Scope creep was ultimately a bigger enemy than any bug; the original pitch had a 4-meter resource system, scheduled failures, and procedural synergies, which was unbuildable in the time we had.\nFix: We set a hard checkpoint around hour 5 or 6 for a working “place a gate, wire it, validate it” toy, with a pre-decided plan to pivot if it failed; it worked, and having that kill switch made later cuts easier to agree on.",
        images: [],
      },
      {
        heading: "Final Result",
        body: "Spending half an hour writing out one turn in plain English was probably the highest-leverage decision of the whole weekend; under time pressure the instinct is to start building immediately, but cheap questions (what “connect two machines” means, what a failure looks like, whether connecting costs stamina) get expensive fast once code is sitting on top of the wrong answer.\n\nNext time, I would also lock in the deploy pipeline in the first hour instead of trusting it to work at the end, since discovering a broken GitHub Pages config at hour 28 would have been the worst way to lose this project.",
        images: [],
      },
    ],
  },
];

// Card cover for the projects carousel: the hero image if one is set, else the
// first section image, else null (the card shows a token placeholder). Kept
// separate from `heroImage` so low-res section shots never end up full-bleed
// on the detail page hero.
export function getCoverImage(p: Project): string | null {
  if (p.heroImage) return p.heroImage;
  for (const section of p.sections) {
    if (section.images.length > 0) return section.images[0];
  }
  return null;
}
