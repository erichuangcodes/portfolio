import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// --- DATA CONFIGURATION ---

const projects = [
  { id: "aerio", title: "Aerio — Smart Air Mask", category: "Hardware + Software", color: "#00f5a0", year: "2025", desc: "Designed a wearable air purification mask with embedded particulate sensors. Architected the enclosure in Fusion360 and wrote Arduino C++ firmware, then built a Python companion app.", large: true },
  { id: "standing-desk", title: "Accessible Standing Desk", category: "Furniture Design", color: "#4fc3f7", year: "2024", desc: "Ergonomic standing desk for people with disabilities — fabricated with laser cutters & CNC. Featured by Makers Making Change.", large: false },
  { id: "robotics", title: "FTC Saturn Robotics", category: "Robotics", color: "#ff6b6b", year: "2025", desc: "CAD'd, assembled, and competed with a robot that won NYC FTC Qualifier 2 (1st place) and placed Top 6 at NYC Championship.", large: false },
  { id: "keyboard", title: "Hand-Soldered Keyboard", category: "Electronics", color: "#c084fc", year: "2025", desc: "Fully designed and soldered a custom mechanical keyboard — PCB routing, switch selection, firmware.", large: false },
  { id: "bonsyfilms", title: "bonsyfilms", category: "Videography", color: "#fbbf24", year: "2025–", desc: "Videography & editing TikTok account — 400K+ views and 150K+ likes covering filmmaking, editing techniques, and music production.", large: false }
];

const experience = [
  { role: "Intern", org: "IeSoSc @ NYU", period: "Jul 2025 – Aug 2025", bullets: ["NYU's Innovation, Entrepreneurship & Science of Smart Cities program.", "Head designer of Aerio smart mask — Fusion360 CAD, C++ Arduino firmware, Python app.", "Delivered a business pitch that received two investor offers."] },
  { role: "President", org: "Electrical Workshop Club", period: "Jan 2025 – Present", bullets: ["Led circuitry projects and electronics kit assemblies for club members.", "Expanded curriculum beyond soldering — introduced CAD and DIY car projects.", "Hand-soldered and programmed a full mechanical keyboard at home."] },
  { role: "Event Manager", org: "Explortle", period: "Feb 2025 – Present", bullets: ["Interviewed STEM professionals and led career guidance questionnaires.", "Educated 50+ students; distributed pamphlets to 200+ families."] },
  { role: "Program Member", org: "MakerSpace NYC", period: "Jul 2024 – Aug 2024", bullets: ["Operated laser cutters, table saws, and sanding machines.", "Won 1st place for best chair design; built accessible standing desk."] }
];

const skills = [
  { label: "Design & CAD", color: "#4fc3f7", items: ["Fusion360", "AutoCAD", "Onshape", "Inventor", "Framer", "CorelDRAW"] },
  { label: "Engineering & Code", color: "#00f5a0", items: ["Arduino (C++)", "Python", "Soldering", "PCB Routing", "Laser Cutting"] },
  { label: "Fabrication", color: "#fbbf24", items: ["CNC", "Table Saw", "3D Printing", "Furniture Design", "Power Tools"] },
  { label: "Languages & Certifications", color: "#c084fc", items: ["English", "Mandarin", "Russian", "AutoCAD Certified", "OSHA Certified"] }
];

const awards = [
  { title: "AutoCAD Certified", year: "Jan 2025" },
  { title: "OSHA Certified", year: "Jan 2025" },
  { title: "FTC NYC Qualifier 2 — 1st Place & Winning Alliance Captain", year: "2025" },
  { title: "FTC NYC Championship — Top 6 Alliance", year: "2025" },
  { title: "SITHS National Honors Society", year: "Present" },
  { title: "MakerSpace NYC — Best Chair Design (1st Place)", year: "2024" }
];

// --- COMPONENTS ---

const SectionHeader = ({ label, title }) => (
  <div className="mb-12">
    <p className="font-mono text-[12px] tracking-widest text-[#00f5a0] uppercase mb-2">{label}</p>
    <h2 className="text-4xl font-bold tracking-tight text-white">{title}</h2>
  </div>
);

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Helper to handle smooth scrolling to the top/hero
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsOpen(false);
  };

  return (
    <nav className="fixed top-0 w-full z-50 flex justify-between items-center p-6 bg-[#09090b]/80 backdrop-blur-md border-b border-white/5">
      {/* LOGO - Always goes home and scrolls up */}
      <Link to="/" onClick={scrollToTop} className="font-mono text-zinc-400 font-bold text-[14px]">
        <span className="text-[#00f5a0]">E</span>H
      </Link>
      
      <div className="flex gap-6 items-center">
        {/* HOME BUTTON - Explicitly scrolls to top */}
        <Link 
          to="/" 
          onClick={scrollToTop}
          className="text-zinc-400 hover:text-white transition-colors text-[14px] font-medium"
        >
          Home
        </Link>

        {/* PROJECT DROPDOWN (Restored) */}
        <div className="relative">
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="text-zinc-400 hover:text-white transition-colors text-[14px] font-medium flex items-center gap-1"
          >
            Projects <span className="text-[10px] opacity-50">{isOpen ? '▲' : '▼'}</span>
          </button>
          
          <AnimatePresence>
            {isOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 8 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: 8 }}
                className="absolute right-0 mt-4 w-64 bg-[#121214] border border-zinc-800 rounded-2xl p-2 shadow-[0_8px_24px_rgba(0,0,0,0.5)]"
              >
                {projects.map(p => (
                  <Link 
                    key={p.id} 
                    to={`/project/${p.id}`} 
                    onClick={() => setIsOpen(false)} 
                    className="block p-3 text-[14px] text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                  >
                    {p.title}
                  </Link>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* SECTION ANCHORS */}
        <a href="/#experience" className="text-zinc-400 hover:text-white transition-colors text-[14px] font-medium hidden md:block">Experience</a>
        <a href="/#skills" className="text-zinc-400 hover:text-white transition-colors text-[14px] font-medium hidden md:block">Skills</a>
        <a href="/#awards" className="text-zinc-400 hover:text-white transition-colors text-[14px] font-medium hidden md:block">Awards</a>
      </div>
    </nav>
  );
};

// --- PAGES ---

const Home = () => {
  const socials = [
    { name: "Email", url: "https://mail.google.com/mail/?view=cm&fs=1&to=huangeric1029@gmail.com" },
    { name: "TikTok", url: "https://tiktok.com/@bonsyfilms" },
    { name: "Instagram", url: "https://instagram.com/stemmics_" },
    { name: "LinkedIn", url: "https://www.linkedin.com/in/eric-huang-49346a36a/" }
  ];

  return (
    <div className="pt-32 px-8 max-w-4xl mx-auto pb-24">
      
      {/* HERO SECTION */}
      <motion.section initial={{opacity:0, y:24}} animate={{opacity:1, y:0}} className="mb-32">
        <div className="flex items-center gap-2 mb-6">
          <span className="w-2 h-2 rounded-full bg-[#00f5a0] animate-pulse"></span>
          <span className="font-mono text-[12px] tracking-widest text-[#00f5a0] uppercase">Available for opportunities</span>
        </div>
        <h1 className="text-6xl md:text-[88px] font-black tracking-tight mb-4 leading-none">Eric Huang</h1>
        <p className="text-[20px] md:text-[24px] text-zinc-400 font-light tracking-tight mb-4">Engineer. Builder. Creator.</p>
        <p className="text-[14px] text-zinc-500 leading-relaxed max-w-lg mb-12">STEM student at Staten Island Technical High School passionate about hardware, software, and the intersection of both. I design, prototype, and ship — from smart masks to award-winning robots.</p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {socials.map(s => (
            <a key={s.name} href={s.url} target="_blank" rel="noreferrer" className="p-4 border border-zinc-800 rounded-2xl bg-zinc-900/40 hover:border-[#00f5a0] transition-all group shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
              <p className="text-[12px] font-mono text-zinc-500 uppercase mb-1 group-hover:text-[#00f5a0] transition-colors">Connect</p>
              <p className="font-bold text-[14px] text-white group-hover:translate-x-1 transition-transform">{s.name} →</p>
            </a>
          ))}
        </div>
      {/* STATS ROW */}
        <div className="flex flex-wrap gap-10 pt-8 border-t border-zinc-800/60">
          {[
            { val: "750k+", label: "TikTok Views" },
            { val: "200k+", label: "TikTok Likes" },
            { val: "1k+", label: "Followers" },
            { val: "4.0", label: "GPA" },
            { val: "2×", label: "FTC Awards" },
            { val: "50+", label: "Students Taught" },
            

          ].map((s) => (
            <div key={s.label}>
              <p className="text-[32px] font-black tracking-tight text-white leading-none">{s.val}</p>
              <p className="font-mono text-[12px] text-zinc-500 uppercase tracking-widest mt-1.5">{s.label}</p>
            </div>
          ))}
        </div>
      </motion.section>

      {/* PROJECTS GRID */}
      <motion.section id="projects" initial={{opacity:0}} whileInView={{opacity:1}} viewport={{once:true}} className="py-16 scroll-mt-24">
        <SectionHeader label="Portfolio" title="Selected Work" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((p) => (
            <Link key={p.id} to={`/project/${p.id}`} className={`p-6 border border-zinc-800 rounded-2xl bg-zinc-900/40 hover:border-zinc-600 transition-all shadow-[0_4px_12px_rgba(0,0,0,0.1)] flex flex-col ${p.large ? 'md:col-span-2' : ''}`}>
              <div className="flex justify-between items-start mb-4">
                <span className="font-mono text-[12px] px-3 py-1 rounded-md tracking-widest uppercase" style={{color: p.color, background: `${p.color}15`}}>{p.category}</span>
                <span className="font-mono text-[12px] text-zinc-500">{p.year}</span>
              </div>
              <h3 className="text-[20px] font-bold tracking-tight mb-2">{p.title}</h3>
              <p className="text-[14px] text-zinc-500 leading-relaxed mb-6">{p.desc}</p>
            </Link>
          ))}
        </div>
      </motion.section>

      {/* EXPERIENCE TIMELINE */}
      <motion.section id="experience" initial={{opacity:0}} whileInView={{opacity:1}} viewport={{once:true}} className="py-16 scroll-mt-24">
        <SectionHeader label="Background" title="Experience" />
        <div className="relative border-l border-zinc-800 ml-3 space-y-8">
          {experience.map((exp, idx) => (
            <div key={idx} className="relative pl-8">
              <span className="absolute -left-[5px] top-2 w-2.5 h-2.5 rounded-full bg-[#09090b] border-2 border-[#00f5a0]"></span>
              <div className="p-6 border border-zinc-800 rounded-2xl bg-zinc-900/40 hover:border-zinc-700 transition-colors shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4">
                  <div className="text-[16px] font-bold">{exp.role} <span className="text-zinc-500 font-normal">@</span> <span className="text-[#00f5a0]">{exp.org}</span></div>
                  <div className="font-mono text-[12px] text-zinc-500">{exp.period}</div>
                </div>
                <ul className="space-y-2">
                  {exp.bullets.map((bullet, bIdx) => (
                    <li key={bIdx} className="text-[14px] text-zinc-400 flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-700 mt-1.5 shrink-0"></span>
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* SKILLS */}
      <motion.section id="skills" initial={{opacity:0}} whileInView={{opacity:1}} viewport={{once:true}} className="py-16 scroll-mt-24">
        <SectionHeader label="Skills" title="Skills & Tools" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {skills.map((skillGroup, idx) => (
            <div key={idx} className="p-6 border border-zinc-800 rounded-2xl bg-zinc-900/40 shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
              <p className="font-mono text-[12px] tracking-widest uppercase mb-4" style={{color: skillGroup.color}}>{skillGroup.label}</p>
              <div className="flex flex-wrap gap-2">
                {skillGroup.items.map(item => (
                  <span key={item} className="font-mono text-[12px] px-4 py-2 rounded-full border border-zinc-800 text-zinc-400 hover:border-zinc-600 transition-colors bg-[#09090b]">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* AWARDS */}
      <motion.section id="awards" initial={{opacity:0}} whileInView={{opacity:1}} viewport={{once:true}} className="py-16 scroll-mt-24">
        <SectionHeader label="Recognition" title="Awards & Certifications" />
        <div className="border border-zinc-800 rounded-2xl bg-zinc-900/40 overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
          {awards.map((award, idx) => (
            <div key={idx} className="flex flex-col md:flex-row md:items-center justify-between p-6 border-b border-zinc-800 hover:bg-white/5 transition-colors last:border-0 gap-2">
              <div className="flex items-center gap-3 text-[14px] text-zinc-300">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00f5a0] shrink-0"></span>
                {award.title}
              </div>
              <span className="font-mono text-[12px] text-zinc-500">{award.year}</span>
            </div>
          ))}
        </div>
      </motion.section>

    </div>
  );
};

// PROJECT DETAIL PAGE
const ProjectDetail = () => {
  const { id } = useParams();
  const project = projects.find(p => p.id === id);

  if (!project) return <div className="pt-32 text-center text-white">Project not found</div>;

  return (
    <motion.div initial={{opacity:0, y:24}} animate={{opacity:1, y:0}} className="pt-32 px-8 max-w-4xl mx-auto min-h-screen">
      <Link to="/" className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600 mb-12 font-mono text-[12px] transition-all">
        ← BACK TO HOME
      </Link>
      
      <span className="font-mono text-[12px] px-3 py-1 rounded-md tracking-widest uppercase" style={{color: project.color, background: `${project.color}15`}}>{project.category}</span>
      <h1 className="text-5xl font-black tracking-tight mt-6 mb-8">{project.title}</h1>
      <p className="text-[16px] text-zinc-400 leading-relaxed mb-12 max-w-2xl">{project.desc}</p>
      
      <div className="aspect-video bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center text-zinc-700 font-mono shadow-[0_8px_24px_rgba(0,0,0,0.15)]">
        [Media Embed: Video / Images]
      </div>
    </motion.div>
  );
};

// --- MAIN APP COMPONENT ---

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/project/:id" element={<ProjectDetail />} />
          </Routes>
        </main>
        
        {/* FOOTER */}
        <footer className="border-t border-zinc-800 py-8 px-8">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <span className="font-mono text-[12px] text-zinc-500">© 2026 Eric Huang — Brooklyn, NY</span>
            <a href="mailto:huangeric1029@gmail.com" className="font-mono text-[12px] text-zinc-500 hover:text-[#00f5a0] transition-colors">huangeric1029@gmail.com</a>
          </div>
        </footer>
      </div>
    </Router>
  );
}