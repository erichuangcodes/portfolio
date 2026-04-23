import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// ─── DATA ─────────────────────────────────────────────────────────────────────

const projects = [
  {
    id: "aerio",
    title: "Aerio — Smart Air Mask",
    category: "Hardware + Software",
    accent: "#5EEAD4",
    year: "2025",
    desc: "Designed a wearable air purification mask with embedded particulate sensors. Architected the enclosure in Fusion360 and wrote Arduino C++ firmware, then built a Python companion app.",
    large: true,
    tech: ["Fusion360", "Arduino C++", "Python", "CAD", "Embedded Systems"],
    doc: {
      overview: "Aerio is a wearable air purification mask equipped with embedded particulate matter sensors (PM2.5/PM10). The system provides real-time air quality feedback through an onboard display and companion app.",
      sections: [
        { heading: "Hardware Design", body: "The enclosure was designed in Fusion360 with parametric constraints for repeatability. The mask integrates a HEPA-grade filter cartridge, a miniaturized fan for active filtration, and a sensor module housing the PM2.5/PM10 detector." },
        { heading: "Firmware Architecture", body: "Written in Arduino C++, the firmware runs a real-time sampling loop at 1 Hz, smoothing sensor readings with a rolling average. A low-power sleep mode activates when no motion is detected for 60 seconds, extending battery life to ~8 hours." },
        { heading: "Companion App", body: "A Python-based companion app visualizes historical air quality data. The app communicates over BLE, parses the sensor payload, and renders time-series charts. Users receive alerts when PM2.5 exceeds EPA threshold levels." },
        { heading: "Business Pitch", body: "Presented Aerio to stakeholders at NYU's IeSoSc program. The pitch deck covered TAM/SAM/SOM analysis, manufacturing cost breakdown, and go-to-market strategy. Two investor offers were received at program conclusion." }
      ]
    }
  },
  {
    id: "standing-desk",
    title: "Accessible Standing Desk",
    category: "Furniture Design",
    accent: "#4fc3f7",
    year: "2024",
    desc: "Ergonomic standing desk for people with disabilities — fabricated with laser cutters & CNC. Featured by Makers Making Change.",
    large: false,
    tech: ["CNC", "Laser Cutting", "CAD", "Woodworking"],
    doc: {
      overview: "An ergonomic height-adjustable standing desk designed specifically for wheelchair users and individuals with limited mobility. Featured by the international non-profit Makers Making Change.",
      sections: [
        { heading: "Design Goals", body: "The primary goal was to create a stable, height-adjustable work surface accessible from a seated or wheelchair position. All interaction points were designed to be operable with limited hand strength." },
        { heading: "Fabrication", body: "Fabricated using CNC routing for structural panels and a laser cutter for precision joinery. Material selection prioritized lightweight aluminum extrusions for the frame and Baltic birch plywood for the surface." },
        { heading: "Recognition", body: "Featured by Makers Making Change, an international platform connecting makers with people who need assistive devices. Won 1st place at MakerSpace NYC for best furniture design." }
      ]
    }
  },
  {
    id: "robotics",
    title: "FTC Saturn Robotics",
    category: "Robotics",
    accent: "#ff6b6b",
    year: "2025",
    desc: "CAD'd, assembled, and competed with a robot that won NYC FTC Qualifier 2 (1st place) and placed Top 6 at NYC Championship.",
    large: false,
    tech: ["Java", "FTC SDK", "Onshape", "Mecanum Drive", "Autonomous"],
    doc: {
      overview: "Designed, built, and programmed a competition robot for the FIRST Tech Challenge (FTC). The robot competed in the 2024–2025 season, winning the NYC Qualifier 2 and placing Top 6 Alliance at the NYC Championship.",
      sections: [
        { heading: "Mechanical Design", body: "The drivetrain uses four mecanum wheels for holonomic movement, allowing precise lateral and diagonal motion during autonomous routines. The intake and scoring mechanisms were designed in Onshape through 6 weeks of iterative prototyping." },
        { heading: "Software & Autonomous", body: "Robot control written in Java using the FTC SDK. Autonomous routines used odometry-based dead reckoning for consistent field positioning. TeleOp code was optimized for driver responsiveness with smoothed input curves." },
        { heading: "Competition Results", body: "Won 1st Place and served as Winning Alliance Captain at NYC FTC Qualifier 2. Placed in the Top 6 Alliance at the NYC Championship, competing against 40+ teams across New York City." }
      ]
    }
  },
  {
    id: "keyboard",
    title: "Hand-Soldered Keyboard",
    category: "Electronics",
    accent: "#c084fc",
    year: "2025",
    desc: "Fully designed and soldered a custom mechanical keyboard — PCB routing, switch selection, firmware.",
    large: false,
    tech: ["KiCad", "QMK Firmware", "SMD Soldering", "PCB Design"],
    doc: {
      overview: "A fully custom mechanical keyboard built from scratch — from PCB schematic to final assembly. Every component was hand-selected and hand-soldered.",
      sections: [
        { heading: "PCB Design", body: "Schematic capture and PCB routing done in KiCad. The layout features a 65% form factor with per-key RGB, hot-swap sockets, and USB-C connectivity. DFM rules were applied before sending to fabrication." },
        { heading: "Assembly", body: "All SMD components — diodes, resistors, controller IC — were hand-soldered with a temperature-controlled iron. Through-hole hot-swap sockets allow switch replacement without desoldering." },
        { heading: "Firmware", body: "Flashed with QMK firmware, enabling fully programmable key mappings, tap-dance functions, and RGB lighting control. Config files are version-controlled on GitHub." }
      ]
    }
  },
  {
    id: "bonsyfilms",
    title: "bonsyfilms",
    category: "Videography",
    accent: "#fbbf24",
    year: "2025–",
    desc: "Videography & editing TikTok account — 400K+ views and 150K+ likes covering filmmaking, editing techniques, and music production.",
    large: false,
    tech: ["DaVinci Resolve", "Premiere Pro", "After Effects", "Color Grading"],
    doc: {
      overview: "A TikTok and social media channel (@bonsyfilms) focused on filmmaking education, editing breakdowns, and music production content. Amassed 750K+ views and 200K+ likes organically.",
      sections: [
        { heading: "Content Strategy", body: "Content centers on short-form educational videos covering camera settings, color grading workflows, and music sync techniques. Each video is scripted, shot, edited, and graded in-house." },
        { heading: "Production Pipeline", body: "Footage captured on a mirrorless camera and processed through a custom DaVinci Resolve pipeline. Color grades are built from scratch for each video to match the intended mood." },
        { heading: "Growth & Metrics", body: "Reached 750K+ total views and 200K+ likes without paid promotion. The account maintains a consistent aesthetic identity and cross-posts to Instagram and YouTube Shorts." }
      ]
    }
  }
];

const experience = [
  { role: "Intern", org: "IeSoSc @ NYU", period: "Jul 2025 – Aug 2025", bullets: ["NYU's Innovation, Entrepreneurship & Science of Smart Cities program.", "Head designer of Aerio smart mask — Fusion360 CAD, C++ Arduino firmware, Python app.", "Delivered a business pitch that received two investor offers."] },
  { role: "Co President", org: "Electrical Workshop Club", period: "Jan 2025 – Present", bullets: ["Led circuitry projects and electronics kit assemblies for club members.", "Expanded curriculum beyond soldering — introduced CAD and DIY car projects.", "Hand-soldered and programmed a full mechanical keyboard at home."] },
  { role: "Event Coordinator", org: "Explortle", period: "Feb 2025 – Present", bullets: ["Interviewed STEM professionals and led career guidance questionnaires.", "Educated 50+ students; distributed pamphlets to 200+ families."] },
  { role: "Intern", org: "MakerSpace NYC", period: "Jul 2024 – Aug 2024", bullets: ["Operated laser cutters, table saws, and sanding machines.", "Won 1st place for best chair design; built accessible standing desk."] }
];

const skillGroups = [
  { label: "Design & CAD", accent: "#4fc3f7", items: ["Fusion360", "AutoCAD", "Onshape", "Inventor", "CorelDRAW"] },
  { label: "Engineering & Code", accent: "#5EEAD4", items: ["Arduino (C++)", "Python", "Soldering"] },
  { label: "Fabrication", accent: "#fbbf24", items: ["CNC", "Table Saw", "3D Printing", "Laser Cutting", "Power Tools"] },
  { label: "Languages & Certs", accent: "#c084fc", items: ["English", "Mandarin", "Russian", "AutoCAD Certified", "OSHA Certified"] }
];

const awards = [
  { title: "AutoCAD Certified", year: "Jan 2025" },
  { title: "OSHA Certified", year: "Jan 2025" },
  { title: "FTC NYC Qualifier 2 — 1st Place & Winning Alliance Captain", year: "2025" },
  { title: "FTC NYC Championship — Top 6 Alliance", year: "2025" },
  { title: "SITHS National Honors Society", year: "Present" },
  { title: "MakerSpace NYC — Best Chair Design (1st Place)", year: "2024" }
];

// ─── SVG ICONS ────────────────────────────────────────────────────────────────

const IconEmail = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%">
    <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);
const IconTikTok = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.19 8.19 0 0 0 4.78 1.52V6.77a4.85 4.85 0 0 1-1.01-.08z"/>
  </svg>
);
const IconInstagram = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%">
    <rect width="20" height="20" x="2" y="2" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);
const IconLinkedIn = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);
const IconArrow = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);
const IconX = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%">
    <path d="M18 6 6 18M6 6l12 12"/>
  </svg>
);
const IconChevron = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%">
    <path d="m6 9 6 6 6-6"/>
  </svg>
);

const socials = [
  { name: "Email", label: "Connect on Email", icon: <IconEmail />, url: "https://mail.google.com/mail/?view=cm&fs=1&to=huangeric1029@gmail.com" },
  { name: "TikTok", label: "Connect on TikTok", icon: <IconTikTok />, url: "https://tiktok.com/@bonsyfilms" },
  { name: "Instagram", label: "Connect on Instagram", icon: <IconInstagram />, url: "https://instagram.com/stemmics_" },
  { name: "LinkedIn", label: "Connect on LinkedIn", icon: <IconLinkedIn />, url: "https://www.linkedin.com/in/eric-huang-49346a36a/" }
];

// ─── STAR CANVAS ──────────────────────────────────────────────────────────────

const StarCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animId;
    let stars = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const init = () => {
      stars = Array.from({ length: 160 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.1 + 0.2,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.0008 + 0.0003
      }));
    };

    const draw = (t) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach(s => {
        const alpha = 0.25 + 0.45 * Math.sin(s.phase + t * s.speed);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(248,250,252,${alpha})`;
        ctx.fill();
      });
      animId = requestAnimationFrame(draw);
    };

    const handleResize = () => { resize(); init(); };
    resize();
    init();
    animId = requestAnimationFrame(draw);
    window.addEventListener('resize', handleResize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', handleResize); };
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, opacity: 0.65 }} />;
};

// ─── NAVBAR ───────────────────────────────────────────────────────────────────

const Navbar = () => {
  const [dropOpen, setDropOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTop = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); setDropOpen(false); };

  return (
    <nav
      style={{
        position: 'fixed', top: 0, width: '100%', zIndex: 50,
        padding: scrolled ? '12px 0' : '20px 0',
        background: scrolled ? 'rgba(2,6,23,0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none',
        transition: 'all 0.3s ease'
      }}>
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/" onClick={scrollTop} style={{ fontFamily: 'monospace', fontSize: 14, fontWeight: 700, color: '#5EEAD4', textDecoration: 'none', letterSpacing: '0.05em' }}>
          EH
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          {['home', 'experience', 'skills', 'awards'].map(item => (
            item === 'home'
              ? <Link key={item} to="/" onClick={scrollTop} className="nav-link" style={{ display: 'none' }}
                  onMouseEnter={e => e.target.style.color='#F8FAFC'} onMouseLeave={e => e.target.style.color='#94A3B8'}>Home</Link>
              : <a key={item} href={`/#${item}`} style={{ fontSize: 13, fontWeight: 500, color: '#94A3B8', textDecoration: 'none', transition: 'color 0.2s', textTransform: 'capitalize' }}
                  onMouseEnter={e => e.target.style.color='#F8FAFC'} onMouseLeave={e => e.target.style.color='#94A3B8'}
                  className="hidden-mobile">
                  {item.charAt(0).toUpperCase() + item.slice(1)}
                </a>
          ))}

          {/* Projects dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setDropOpen(v => !v)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 500, color: '#94A3B8', background: 'none', border: 'none', cursor: 'pointer', padding: 0, transition: 'color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color='#F8FAFC'} onMouseLeave={e => e.currentTarget.style.color='#94A3B8'}>
              Projects
              <span style={{ width: 14, height: 14, display: 'inline-flex', transform: dropOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>
                <IconChevron />
              </span>
            </button>
            <AnimatePresence>
              {dropOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.97 }} transition={{ duration: 0.15 }}
                  style={{ position: 'absolute', right: 0, top: 'calc(100% + 10px)', width: 256, background: '#0F172A', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 6, boxShadow: '0 16px 40px rgba(0,0,0,0.6)' }}>
                  {projects.map(p => (
                    <Link key={p.id} to={`/project/${p.id}`} onClick={() => setDropOpen(false)}
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderRadius: 8, fontSize: 13, color: '#94A3B8', textDecoration: 'none', transition: 'all 0.15s' }}
                      onMouseEnter={e => { e.currentTarget.style.background='rgba(255,255,255,0.05)'; e.currentTarget.style.color='#F8FAFC'; }}
                      onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#94A3B8'; }}>
                      <span>{p.title}</span>
                      <span style={{ fontSize: 10, color: p.accent, fontFamily: 'monospace' }}>{p.year}</span>
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <a href="/#contact"
            style={{ fontSize: 13, fontWeight: 500, color: '#5EEAD4', textDecoration: 'none', padding: '7px 16px', borderRadius: 8, background: 'rgba(94,234,212,0.08)', border: '1px solid rgba(94,234,212,0.2)', transition: 'background 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.background='rgba(94,234,212,0.16)'}
            onMouseLeave={e => e.currentTarget.style.background='rgba(94,234,212,0.08)'}>
            Contact
          </a>
        </div>
      </div>
    </nav>
  );
};

// ─── SECTION HEADER ───────────────────────────────────────────────────────────

const SectionHeader = ({ label, title }) => (
  <div style={{ marginBottom: 48 }}>
    <p style={{ fontFamily: 'monospace', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#5EEAD4', marginBottom: 12, margin: '0 0 12px' }}>{label}</p>
    <h2 style={{ fontSize: 32, fontWeight: 600, letterSpacing: '-0.01em', color: '#F8FAFC', margin: 0 }}>{title}</h2>
  </div>
);

// ─── RESEARCH PAPER MODAL ─────────────────────────────────────────────────────

const ResearchPaperModal = ({ project, onClose }) => {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const onKey = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey); };
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', overflowY: 'auto', padding: '32px 16px', background: 'rgba(2,6,23,0.88)', backdropFilter: 'blur(16px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 32, scale: 0.97 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        style={{ width: '100%', maxWidth: 900, background: '#0F172A', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 28px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: project.accent, background: `${project.accent}18`, padding: '4px 10px', borderRadius: 6 }}>{project.category}</span>
            <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#475569' }}>{project.year}</span>
          </div>
          <button onClick={onClose}
            style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: 'none', cursor: 'pointer', color: '#94A3B8', transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.background='rgba(255,255,255,0.09)'; e.currentTarget.style.color='#F8FAFC'; }}
            onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.04)'; e.currentTarget.style.color='#94A3B8'; }}>
            <span style={{ width: 14, height: 14, display: 'flex' }}><IconX /></span>
          </button>
        </div>

        {/* Body — split on desktop, stacked on mobile */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          {/* Left: media + meta */}
          <div style={{ padding: 28, borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ aspectRatio: '16/9', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace', fontSize: 11, color: '#334155' }}>
              [ Media / Images ]
            </div>
            <div>
              <p style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#334155', marginBottom: 10 }}>Tech Stack</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {project.tech.map(t => (
                  <span key={t} style={{ fontFamily: 'monospace', fontSize: 11, padding: '4px 10px', borderRadius: 6, color: '#94A3B8', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>{t}</span>
                ))}
              </div>
            </div>
            <div>
              <p style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#334155', marginBottom: 10 }}>Links</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {['View Repository', 'Download Files'].map(lbl => (
                  <a key={lbl} href="#" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#94A3B8', textDecoration: 'none', transition: 'color 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.color='#5EEAD4'} onMouseLeave={e => e.currentTarget.style.color='#94A3B8'}>
                    <span style={{ width: 14, height: 14, display: 'flex' }}><IconArrow /></span>{lbl}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Right: documentation */}
          <div style={{ padding: 28, overflowY: 'auto', maxHeight: '80vh' }}>
            <h2 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.01em', color: '#F8FAFC', marginBottom: 12 }}>{project.title}</h2>
            <p style={{ fontSize: 13, lineHeight: 1.75, color: '#94A3B8', marginBottom: 28 }}>{project.doc.overview}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
              {project.doc.sections.map((sec, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <span style={{ width: 3, height: 16, borderRadius: 2, background: project.accent, flexShrink: 0 }}></span>
                    <h3 style={{ fontSize: 14, fontWeight: 600, color: '#F8FAFC', margin: 0 }}>{sec.heading}</h3>
                  </div>
                  <p style={{ fontSize: 13, lineHeight: 1.75, color: '#94A3B8', paddingLeft: 13, margin: 0 }}>{sec.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── PROJECT CARD ─────────────────────────────────────────────────────────────

const ProjectCard = ({ project, index }) => {
  const [hovered, setHovered] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.55, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}
        style={{
          gridColumn: project.large ? 'span 2' : 'span 1',
          display: 'flex', flexDirection: 'column',
          padding: 24, borderRadius: 16,
          background: hovered ? 'rgba(15,23,42,0.95)' : 'rgba(15,23,42,0.6)',
          border: `1px solid ${hovered ? project.accent + '50' : 'rgba(255,255,255,0.07)'}`,
          boxShadow: hovered ? `0 0 40px ${project.accent}0e` : 'none',
          transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
          transition: 'all 0.25s ease', cursor: 'default'
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <span style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.13em', textTransform: 'uppercase', color: project.accent, background: `${project.accent}18`, padding: '4px 10px', borderRadius: 6 }}>{project.category}</span>
          <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#475569' }}>{project.year}</span>
        </div>
        <h3 style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.01em', color: '#F8FAFC', marginBottom: 8 }}>{project.title}</h3>
        <p style={{ fontSize: 13, lineHeight: 1.75, color: '#94A3B8', marginBottom: 20, flex: 1 }}>{project.desc}</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {project.tech.slice(0, 3).map(t => (
              <span key={t} style={{ fontFamily: 'monospace', fontSize: 10, padding: '3px 8px', borderRadius: 5, color: '#475569', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>{t}</span>
            ))}
          </div>
          <button
            onClick={() => setModalOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'monospace', fontSize: 11, padding: '7px 14px', borderRadius: 8, color: '#5EEAD4', background: 'rgba(94,234,212,0.08)', border: '1px solid rgba(94,234,212,0.2)', cursor: 'pointer', transition: 'background 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.background='rgba(94,234,212,0.16)'}
            onMouseLeave={e => e.currentTarget.style.background='rgba(94,234,212,0.08)'}>
            Learn More <span style={{ width: 12, height: 12, display: 'flex' }}><IconArrow /></span>
          </button>
        </div>
      </motion.div>
      <AnimatePresence>
        {modalOpen && <ResearchPaperModal project={project} onClose={() => setModalOpen(false)} />}
      </AnimatePresence>
    </>
  );
};

// ─── CONTACT FORM ─────────────────────────────────────────────────────────────

const ContactForm = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = e => {
    e.preventDefault();
    const subject = encodeURIComponent(`Portfolio Contact: ${form.name}`);
    const body = encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`);
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=huangeric1029@gmail.com&su=${subject}&body=${body}`, '_blank');
  };

  const fieldStyle = {
    width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 10, padding: '12px 16px', fontSize: 14, color: '#F8FAFC', outline: 'none',
    fontFamily: "'Inter', sans-serif", transition: 'border-color 0.2s', boxSizing: 'border-box'
  };

  const focusIn = e => { e.target.style.borderColor = 'rgba(94,234,212,0.4)'; };
  const focusOut = e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; };

  return (
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <label style={{ display: 'block', fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#475569', marginBottom: 8 }}>Name</label>
          <input name="name" value={form.name} onChange={handle} required placeholder="Your name" style={fieldStyle} onFocus={focusIn} onBlur={focusOut} />
        </div>
        <div>
          <label style={{ display: 'block', fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#475569', marginBottom: 8 }}>Email</label>
          <input name="email" type="email" value={form.email} onChange={handle} required placeholder="you@email.com" style={fieldStyle} onFocus={focusIn} onBlur={focusOut} />
        </div>
      </div>
      <div>
        <label style={{ display: 'block', fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#475569', marginBottom: 8 }}>Message</label>
        <textarea name="message" value={form.message} onChange={handle} required rows={5} placeholder="Tell me about your project or opportunity..."
          style={{ ...fieldStyle, resize: 'vertical' }} onFocus={focusIn} onBlur={focusOut} />
      </div>
      <button type="submit"
        style={{ width: '100%', padding: '13px 0', borderRadius: 10, fontSize: 14, fontWeight: 500, fontFamily: "'Inter', sans-serif", color: '#5EEAD4', background: 'rgba(94,234,212,0.08)', border: '1px solid rgba(94,234,212,0.22)', cursor: 'pointer', transition: 'background 0.2s' }}
        onMouseEnter={e => e.currentTarget.style.background='rgba(94,234,212,0.16)'}
        onMouseLeave={e => e.currentTarget.style.background='rgba(94,234,212,0.08)'}>
        Send Message →
      </button>
    </form>
  );
};

// ─── HOME ─────────────────────────────────────────────────────────────────────

const Home = () => {
  const [nameHovered, setNameHovered] = useState(false);

  return (
    <div style={{ position: 'relative', zIndex: 10 }}>
      <div style={{ paddingTop: 144, paddingLeft: 24, paddingRight: 24, maxWidth: 1000, margin: '0 auto', paddingBottom: 128 }}>

        {/* HERO */}
        <motion.section initial={{ opacity: 0, y: 36 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }} style={{ marginBottom: 144 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#5EEAD4', display: 'inline-block', animation: 'pulse 2s infinite' }}></span>
            <span style={{ fontFamily: 'monospace', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#5EEAD4' }}>Available for opportunities</span>
          </div>

          {/* Monof hover name */}
          <div style={{ marginBottom: 24, cursor: 'default' }}>
            <h1
              onMouseEnter={() => setNameHovered(true)}
              onMouseLeave={() => setNameHovered(false)}
              style={{
                fontSize: 'clamp(52px, 10vw, 88px)', fontWeight: 600, letterSpacing: '-0.03em', lineHeight: 1,
                color: nameHovered ? '#5EEAD4' : '#F8FAFC', transition: 'color 0.4s ease', margin: 0, cursor: 'default'
              }}>
              Eric Huang
            </h1>
            <AnimatePresence>
              {nameHovered && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  style={{ fontFamily: 'monospace', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#5EEAD4', marginTop: 8, marginBottom: 0 }}>
                  Engineer · Builder · Creator · Brooklyn, NY
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <p style={{ fontSize: 20, fontWeight: 300, letterSpacing: '-0.01em', color: '#94A3B8', marginBottom: 16 }}>
            Engineer. Builder. Creator.
          </p>
          <p style={{ fontSize: 14, lineHeight: 1.8, color: '#64748B', maxWidth: 480, marginBottom: 48 }}>
            STEM student at Staten Island Technical High School passionate about hardware, software, and the intersection of both. I design, prototype, and ship — from smart masks to award-winning robots.
          </p>

          {/* Social cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 64 }}>
            {socials.map((s, i) => (
              <motion.a key={s.name} href={s.url} target="_blank" rel="noreferrer"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.07 }}
                style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 16, borderRadius: 14, background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.07)', textDecoration: 'none', transition: 'all 0.25s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(94,234,212,0.3)'; e.currentTarget.style.background='rgba(15,23,42,0.92)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(255,255,255,0.07)'; e.currentTarget.style.background='rgba(15,23,42,0.6)'; }}>
                <span style={{ width: 18, height: 18, display: 'flex', color: '#475569' }}>{s.icon}</span>
                <div>
                  <p style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#475569', marginBottom: 3 }}>Connect</p>
                  <p style={{ fontSize: 13, fontWeight: 500, color: '#F8FAFC', margin: 0 }}>{s.name} →</p>
                </div>
              </motion.a>
            ))}
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 40, paddingTop: 32, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            {[
              { val: "750k+", label: "TikTok Views" },
              { val: "200k+", label: "TikTok Likes" },
              { val: "1k+",   label: "Followers" },
              { val: "4.0",   label: "GPA" },
              { val: "2×",    label: "FTC Awards" },
              { val: "50+",   label: "Students Taught" }
            ].map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 + i * 0.06 }}>
                <p style={{ fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em', color: '#F8FAFC', lineHeight: 1, marginBottom: 6 }}>{s.val}</p>
                <p style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#475569', margin: 0 }}>{s.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* PROJECTS */}
        <section id="projects" style={{ paddingTop: 64, paddingBottom: 64, scrollMarginTop: 96 }}>
          <SectionHeader label="Portfolio" title="Selected Work" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            {projects.map((p, i) => <ProjectCard key={p.id} project={p} index={i} />)}
          </div>
        </section>

        {/* EXPERIENCE */}
        <section id="experience" style={{ paddingTop: 64, paddingBottom: 64, scrollMarginTop: 96 }}>
          <SectionHeader label="Background" title="Experience" />
          <div style={{ borderLeft: '1px solid rgba(255,255,255,0.07)', marginLeft: 12, display: 'flex', flexDirection: 'column', gap: 24 }}>
            {experience.map((exp, idx) => (
              <motion.div key={idx} style={{ position: 'relative', paddingLeft: 32 }}
                initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.5, delay: idx * 0.1 }}>
                <span style={{ position: 'absolute', left: -6, top: 10, width: 11, height: 11, borderRadius: '50%', background: '#020617', border: '2px solid #5EEAD4' }}></span>
                <div style={{ padding: 24, borderRadius: 14, background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.07)', transition: 'border-color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor='rgba(255,255,255,0.13)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor='rgba(255,255,255,0.07)'}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#F8FAFC' }}>
                      {exp.role}
                      <span style={{ fontWeight: 400, color: '#475569', margin: '0 6px' }}>@</span>
                      <span style={{ color: '#5EEAD4' }}>{exp.org}</span>
                    </div>
                    <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#475569' }}>{exp.period}</div>
                  </div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {exp.bullets.map((b, bi) => (
                      <li key={bi} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, fontSize: 13, color: '#94A3B8', lineHeight: 1.7 }}>
                        <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#334155', marginTop: 7, flexShrink: 0 }}></span>
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* SKILLS */}
        <section id="skills" style={{ paddingTop: 64, paddingBottom: 64, scrollMarginTop: 96 }}>
          <SectionHeader label="Capabilities" title="Skills & Tools" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            {skillGroups.map((sg, idx) => (
              <motion.div key={idx} style={{ padding: 24, borderRadius: 14, background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.07)' }}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.4, delay: idx * 0.08 }}>
                <p style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: sg.accent, marginBottom: 16 }}>{sg.label}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {sg.items.map(item => (
                    <span key={item} style={{ fontFamily: 'monospace', fontSize: 11, padding: '6px 12px', borderRadius: 7, color: '#94A3B8', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>{item}</span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* AWARDS */}
        <section id="awards" style={{ paddingTop: 64, paddingBottom: 64, scrollMarginTop: 96 }}>
          <SectionHeader label="Recognition" title="Awards & Certifications" />
          <div style={{ borderRadius: 14, border: '1px solid rgba(255,255,255,0.07)', overflow: 'hidden' }}>
            {awards.map((award, idx) => (
              <motion.div key={idx}
                initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: idx * 0.06 }}
                style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', gap: 8, background: 'rgba(15,23,42,0.4)', borderBottom: idx < awards.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background='rgba(15,23,42,0.85)'}
                onMouseLeave={e => e.currentTarget.style.background='rgba(15,23,42,0.4)'}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: '#CBD5E1' }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#5EEAD4', flexShrink: 0 }}></span>
                  {award.title}
                </div>
                <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#475569' }}>{award.year}</span>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CONTACT */}
        <section id="contact" style={{ paddingTop: 64, paddingBottom: 64, scrollMarginTop: 96 }}>
          <SectionHeader label="Get in Touch" title="Contact" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 48 }}>
            <div>
              <p style={{ fontSize: 14, lineHeight: 1.8, color: '#64748B', marginBottom: 32 }}>
                Open to internships, collaborations, and interesting projects. Whether you have a hardware challenge or want to talk engineering, I'd love to hear from you.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {socials.map(s => (
                  <a key={s.name} href={s.url} target="_blank" rel="noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#94A3B8', textDecoration: 'none', transition: 'color 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.color='#5EEAD4'}
                    onMouseLeave={e => e.currentTarget.style.color='#94A3B8'}>
                    <span style={{ width: 16, height: 16, display: 'flex', flexShrink: 0 }}>{s.icon}</span>
                    {s.label}
                  </a>
                ))}
              </div>
            </div>
            <ContactForm />
          </div>
        </section>

      </div>
    </div>
  );
};

// ─── PROJECT DETAIL ───────────────────────────────────────────────────────────

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const project = projects.find(p => p.id === id);
  const [modalOpen, setModalOpen] = useState(false);

  if (!project) return (
    <div style={{ position: 'relative', zIndex: 10, paddingTop: 144, textAlign: 'center', color: '#F8FAFC' }}>
      Project not found.{' '}
      <button onClick={() => navigate('/')} style={{ color: '#5EEAD4', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}>← Go back</button>
    </div>
  );

  return (
    <motion.div style={{ position: 'relative', zIndex: 10, paddingTop: 144, paddingLeft: 24, paddingRight: 24, maxWidth: 1000, margin: '0 auto', minHeight: '100vh', paddingBottom: 96 }}
      initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>

      <button onClick={() => navigate(-1)}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 8, fontFamily: 'monospace', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#94A3B8', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', marginBottom: 48, transition: 'all 0.2s' }}
        onMouseEnter={e => { e.currentTarget.style.color='#F8FAFC'; e.currentTarget.style.borderColor='rgba(255,255,255,0.15)'; }}
        onMouseLeave={e => { e.currentTarget.style.color='#94A3B8'; e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'; }}>
        ← Back
      </button>

      <div style={{ marginBottom: 20 }}>
        <span style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: project.accent, background: `${project.accent}18`, padding: '5px 12px', borderRadius: 6 }}>{project.category}</span>
      </div>

      <h1 style={{ fontSize: 'clamp(36px,6vw,56px)', fontWeight: 600, letterSpacing: '-0.02em', color: '#F8FAFC', marginBottom: 16 }}>{project.title}</h1>
      <p style={{ fontSize: 15, lineHeight: 1.8, color: '#94A3B8', maxWidth: 600, marginBottom: 32 }}>{project.desc}</p>

      <button onClick={() => setModalOpen(true)}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 22px', borderRadius: 10, fontSize: 14, fontWeight: 500, fontFamily: "'Inter', sans-serif", color: '#5EEAD4', background: 'rgba(94,234,212,0.09)', border: '1px solid rgba(94,234,212,0.24)', cursor: 'pointer', marginBottom: 48, transition: 'background 0.2s' }}
        onMouseEnter={e => e.currentTarget.style.background='rgba(94,234,212,0.17)'}
        onMouseLeave={e => e.currentTarget.style.background='rgba(94,234,212,0.09)'}>
        Learn More <span style={{ width: 16, height: 16, display: 'flex' }}><IconArrow /></span>
      </button>

      <div style={{ aspectRatio: '16/9', borderRadius: 18, background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace', fontSize: 12, color: '#334155' }}>
        [ Media Embed: Video / Images ]
      </div>

      <AnimatePresence>
        {modalOpen && <ResearchPaperModal project={project} onClose={() => setModalOpen(false)} />}
      </AnimatePresence>
    </motion.div>
  );
};

// ─── APP ROOT ─────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <Router>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#020617', color: '#F8FAFC', fontFamily: "'Inter', sans-serif" }}>
        <StarCanvas />
        <Navbar />
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/project/:id" element={<ProjectDetail />} />
          </Routes>
        </main>
        <footer style={{ position: 'relative', zIndex: 10, padding: '28px 24px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
            <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#334155' }}>© 2026 Eric Huang — Brooklyn, NY</span>
            <div style={{ display: 'flex', gap: 24 }}>
              {socials.map(s => (
                <a key={s.name} href={s.url} target="_blank" rel="noreferrer"
                  style={{ fontFamily: 'monospace', fontSize: 11, color: '#334155', textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.target.style.color='#5EEAD4'}
                  onMouseLeave={e => e.target.style.color='#334155'}>
                  {s.name}
                </a>
              ))}
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}
