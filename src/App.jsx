import React, { useState, useEffect, useRef } from 'react';
import {
  BrowserRouter as Router, Routes, Route, Link,
  useParams, useNavigate, useLocation,
} from 'react-router-dom';
import {
  motion, AnimatePresence, useMotionValue,
  useSpring, useTransform, useScroll,
} from 'framer-motion';

// ─── DESIGN SYSTEM ────────────────────────────────────────────────────────────
const C = {
  bg:      '#020617',
  surface: '#0F172A',
  accent:  '#5EEAD4',
  sec:     '#334155',
  text:    '#F8FAFC',
  muted:   '#94A3B8',
  subtle:  '#475569',
  border:  'rgba(94,234,212,0.10)',
  sub:     'rgba(255,255,255,0.06)',
};
const glass = {
  background: 'rgba(15,23,42,0.65)',
  backdropFilter: 'blur(28px)',
  WebkitBackdropFilter: 'blur(28px)',
  border: `1px solid ${C.border}`,
  boxShadow: '0 0 64px rgba(94,234,212,0.04), 0 32px 64px -16px rgba(0,0,0,0.7)',
};
const SPR      = { type:'spring', stiffness:100, damping:20 };
const SPR_FAST = { type:'spring', stiffness:240, damping:30 };
const TAB_H    = 56;   // file-tab strip height (px)
const NAV_H    = 88;   // navbar height (px)

// ─── DATA ─────────────────────────────────────────────────────────────────────
const projects = [
  {
    id:'aerio', title:'Aerio — Smart Air Mask',
    category:'Hardware + Software', accent:'#5EEAD4', year:'2025',
    desc:'Designed a wearable air purification mask with embedded particulate sensors. Architected the enclosure in Fusion360 and wrote Arduino C++ firmware, then built a Python companion app.',
    tech:['Fusion360','Arduino C++','Python','CAD','BLE','Embedded'],
    doc:{
      abstract:'Aerio is a wearable air purification mask equipped with embedded PM2.5/PM10 sensors providing real-time air quality feedback through an onboard display and companion app.',
      sections:[
        { n:'01', title:'Introduction',         body:'Urban air quality has deteriorated significantly. Aerio addresses the gap between awareness and action — providing individuals with real-time personal air quality data through a wearable form factor that is both practical and unobtrusive.' },
        { n:'02', title:'Technical Requirements',body:'PM2.5/PM10 sensing at ±5% accuracy. Battery life: 8+ hours. BLE connectivity. IPX4 sealed enclosure. Total component volume ≤150 cm³. Fan noise <35 dB at 20 cm.' },
        { n:'03', title:'Implementation',        body:'The enclosure was parametrically designed in Fusion360. The C++ firmware runs a 1 Hz sampling loop with rolling-average smoothing and a low-power sleep mode. The Python companion app communicates over BLE and renders EPA-threshold-aware time-series charts.' },
        { n:'04', title:'Results & Outcomes',    body:'Presented at NYU IeSoSc. Pitch deck covered TAM/SAM/SOM analysis, manufacturing cost breakdown, and go-to-market strategy. Two investor offers received at program conclusion.' },
      ],
    },
  },
  {
    id:'standing-desk', title:'Accessible Standing Desk',
    category:'Furniture Design', accent:'#4fc3f7', year:'2024',
    desc:'Ergonomic standing desk for people with disabilities — fabricated with laser cutters & CNC. Featured by Makers Making Change.',
    tech:['CNC','Laser Cutting','CAD','Fusion360','Woodworking'],
    doc:{
      abstract:'An ergonomic height-adjustable standing desk designed for wheelchair users and individuals with limited mobility. Featured by Makers Making Change internationally.',
      sections:[
        { n:'01', title:'Introduction',         body:'Existing standing desks are inaccessible to users with limited mobility. This project bridges that gap through human-centered design, prioritizing accessibility without sacrificing structural integrity.' },
        { n:'02', title:'Technical Requirements',body:'Height range: 28–48 inches. Max load: 50 lbs. Single-hand height adjustment. Total material cost <$200. Must fit standard doorframe when collapsed.' },
        { n:'03', title:'Implementation',        body:'CNC-routed structural panels with laser-cut joinery. Aluminum extrusions form the vertical adjustment mechanism. Baltic birch plywood provides the work surface with a protective finish.' },
        { n:'04', title:'Results & Outcomes',    body:'Won 1st place at MakerSpace NYC. Featured by Makers Making Change, an international platform connecting makers with people who need assistive devices.' },
      ],
    },
  },
  {
    id:'robotics', title:'FTC Saturn Robotics',
    category:'Robotics', accent:'#ff6b6b', year:'2025',
    desc:'CAD\'d, assembled, and competed with a robot that won NYC FTC Qualifier 2 (1st place) and placed Top 6 at NYC Championship.',
    tech:['Java','FTC SDK','Onshape','Mecanum Drive','Odometry'],
    doc:{
      abstract:'Competition robot for the FIRST Tech Challenge (FTC) 2024-2025 season. Won NYC Qualifier 2 (1st Place, Winning Alliance Captain) and placed Top 6 at NYC Championship.',
      sections:[
        { n:'01', title:'Introduction',         body:'The 2024-2025 FTC season demanded precise game piece manipulation and reliable autonomous navigation. Our team built from scratch over a 10-week design sprint with weekly iteration cycles.' },
        { n:'02', title:'Technical Requirements',body:'Robot dimensions: 18"×18"×18" maximum. Drive: holonomic mecanum. Autonomous: odometry dead reckoning. Actuation: DC motors with encoder feedback. Control: REV Robotics hardware ecosystem.' },
        { n:'03', title:'Implementation',        body:'Four mecanum wheels enable full holonomic motion. Autonomous routines use two-wheel odometry for consistent field positioning. TeleOp input curves are smoothed via exponential scaling for precise driver control.' },
        { n:'04', title:'Results & Outcomes',    body:'1st Place and Winning Alliance Captain at NYC FTC Qualifier 2. Top 6 Alliance at the NYC Championship competing against 40+ teams across New York City.' },
      ],
    },
  },
  {
    id:'keyboard', title:'Hand-Soldered Keyboard',
    category:'Electronics', accent:'#c084fc', year:'2025',
    desc:'Fully designed and soldered a custom mechanical keyboard — PCB routing, switch selection, QMK firmware.',
    tech:['KiCad','QMK Firmware','SMD Soldering','PCB','ATmega32U4'],
    doc:{
      abstract:'A fully custom 65% mechanical keyboard built from scratch — from PCB schematic and component selection through hand-soldering and QMK firmware configuration.',
      sections:[
        { n:'01', title:'Introduction',         body:'Commercial keyboards lack the depth of customization that experienced users demand. This project explores the full hardware stack from PCB design to firmware programming to produce a truly bespoke input device.' },
        { n:'02', title:'Technical Requirements',body:'Form factor: 65% ANSI. Per-key RGB via WS2812B. Hot-swap Kailh sockets. USB-C connectivity. MCU: ATmega32U4. PCB: 2-layer FR4, 1.6mm.' },
        { n:'03', title:'Implementation',        body:'Schematic capture and routing in KiCad with DFM rules applied before fabrication. All SMD components hand-soldered with a temperature-controlled iron. QMK firmware provides fully programmable layouts, tap-dance, and RGB animations.' },
        { n:'04', title:'Results & Outcomes',    body:'Fully functional 65% keyboard with working per-key RGB, tap-dance modifiers, and custom macros. Complete firmware config version-controlled on GitHub.' },
      ],
    },
  },
  {
    id:'bonsyfilms', title:'bonsyfilms',
    category:'Videography', accent:'#fbbf24', year:'2025–',
    desc:'Videography & editing TikTok account — 850K+ views and 200K+ likes covering filmmaking, editing techniques, and music production.',
    tech:['DaVinci Resolve','Premiere Pro','After Effects','Color Grading'],
    doc:{
      abstract:'A TikTok and social media channel (@bonsyfilms) focused on filmmaking education, editing breakdowns, and music production content. 750K+ views and 200K+ likes organically.',
      sections:[
        { n:'01', title:'Introduction',         body:'Short-form filmmaking education has an underserved audience of aspiring creators who want professional techniques without formal education. bonsyfilms exists to close that gap with accessible, high-production content.' },
        { n:'02', title:'Technical Requirements',body:'Camera: mirrorless with LOG profile. Post: DaVinci Resolve. Format: vertical 9:16 for TikTok primary, 16:9 for YouTube. Color pipeline: LOG capture → exposure normalisation → custom LUT → finishing grade.' },
        { n:'03', title:'Implementation',        body:'Each video is scripted, shot, edited, and graded in-house. Custom DaVinci Resolve pipeline with color grades built from scratch per video to match the intended mood. All audio mixed with reference monitoring.' },
        { n:'04', title:'Results & Outcomes',    body:'850K+ total views and 200K+ likes without paid promotion. Consistent aesthetic identity across 80+ posts. Cross-published to Instagram Reels and YouTube Shorts.' },
      ],
    },
  },
];

const experience = [
  { role:'Intern',         org:'IeSoSc @ NYU',         period:'Jul 2025 – Aug 2025',    bullets:["NYU's Innovation, Entrepreneurship & Science of Smart Cities program.",'Head designer of Aerio smart mask — Fusion360 CAD, C++ Arduino firmware, Python app.','Delivered a business pitch that received two investor offers.'] },
  { role:'Co President',   org:'Electrical Workshop Club',period:'Jan 2025 – Present',  bullets:['Led circuitry projects and electronics kit assemblies for club members.','Expanded curriculum beyond soldering — introduced CAD and DIY car projects.','Hand-soldered and programmed a full mechanical keyboard at home.'] },
  { role:'Event Coordinator',org:'Explortle',          period:'Feb 2025 – Present',    bullets:['Interviewed STEM professionals and led career guidance questionnaires.','Educated 50+ students; distributed pamphlets to 200+ families.'] },
  { role:'Intern',         org:'MakerSpace NYC',        period:'Jul 2024 – Aug 2024',   bullets:['Operated laser cutters, table saws, and sanding machines.','Won 1st place for best chair design; built accessible standing desk.'] },
];

const skillGroups = [
  { label:'Design & CAD',       accent:'#4fc3f7', items:['Fusion360','AutoCAD','Onshape','Inventor','CorelDRAW'] },
  { label:'Engineering & Code', accent:'#5EEAD4', items:['Arduino (C++)','Python','Soldering'] },
  { label:'Fabrication',        accent:'#fbbf24', items:['CNC','Table Saw','3D Printing','Laser Cutting','Power Tools'] },
  { label:'Languages & Certs',  accent:'#c084fc', items:['English','Mandarin','Russian','AutoCAD Certified','OSHA Certified'] },
];

const awards = [
  { title:'AutoCAD Certified',                                    year:'Jan 2025' },
  { title:'OSHA Certified',                                       year:'Jan 2025' },
  { title:'FTC NYC Qualifier 2 — 1st Place & Winning Alliance Captain', year:'2025' },
  { title:'FTC NYC Championship — Top 6 Alliance',               year:'2025' },
  { title:'SITHS National Honors Society',                        year:'Present' },
  { title:'MakerSpace NYC — Best Chair Design (1st Place)',       year:'2024' },
];

const socials = [
  { name:'Email',     label:'Connect on Email',     url:'https://mail.google.com/mail/?view=cm&fs=1&to=huangeric1029@gmail.com' },
  { name:'TikTok',    label:'Connect on TikTok',    url:'https://tiktok.com/@bonsyfilms' },
  { name:'Instagram', label:'Connect on Instagram', url:'https://instagram.com/stemmics_' },
  { name:'LinkedIn',  label:'Connect on LinkedIn',  url:'https://www.linkedin.com/in/eric-huang-49346a36a/' },
];

// ─── SVG ICONS ────────────────────────────────────────────────────────────────
const Ico = {
  Email:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{width:'100%',height:'100%'}}><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>,
  TikTok:   <svg viewBox="0 0 24 24" fill="currentColor" style={{width:'100%',height:'100%'}}><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.19 8.19 0 0 0 4.78 1.52V6.77a4.85 4.85 0 0 1-1.01-.08z"/></svg>,
  Instagram:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{width:'100%',height:'100%'}}><rect width="20" height="20" x="2" y="2" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>,
  LinkedIn: <svg viewBox="0 0 24 24" fill="currentColor" style={{width:'100%',height:'100%'}}><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>,
  Arrow:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{width:'100%',height:'100%'}}><path d="M5 12h14M12 5l7 7-7 7"/></svg>,
  X:        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{width:'100%',height:'100%'}}><path d="M18 6 6 18M6 6l12 12"/></svg>,
  Chevron:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{width:'100%',height:'100%'}}><path d="m6 9 6 6 6-6"/></svg>,
  External: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{width:'100%',height:'100%'}}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" x2="21" y1="14" y2="3"/></svg>,
};

const icoMap = { Email: Ico.Email, TikTok: Ico.TikTok, Instagram: Ico.Instagram, LinkedIn: Ico.LinkedIn };

// ─── STAR CANVAS ──────────────────────────────────────────────────────────────
const StarCanvas = () => {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');
    let raf;
    let stars = [];
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    const init = () => {
      stars = Array.from({ length: 180 }, () => ({
        x: Math.random() * canvas.width,   y: Math.random() * canvas.height,
        r: Math.random() * 1.1 + 0.2,
        vx: (Math.random() - 0.5) * 0.08, vy: (Math.random() - 0.5) * 0.08,
        phase: Math.random() * Math.PI * 2, speed: Math.random() * 0.0007 + 0.0002,
      }));
    };
    const draw = (t) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach(s => {
        s.x += s.vx; s.y += s.vy;
        if (s.x < 0) s.x = canvas.width;  if (s.x > canvas.width)  s.x = 0;
        if (s.y < 0) s.y = canvas.height; if (s.y > canvas.height) s.y = 0;
        const a = 0.2 + 0.55 * Math.sin(s.phase + t * s.speed);
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(248,250,252,${a})`; ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    const onResize = () => { resize(); init(); };
    resize(); init(); raf = requestAnimationFrame(draw);
    window.addEventListener('resize', onResize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize); };
  }, []);
  return <canvas ref={ref} style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0, opacity:0.6 }} />;
};

// ─── NOISE OVERLAY ────────────────────────────────────────────────────────────
const Noise = () => (
  <div style={{ position:'fixed', inset:0, zIndex:1, pointerEvents:'none', opacity:0.025,
    backgroundImage:'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
    backgroundRepeat:'repeat', backgroundSize:'256px' }} />
);

// ─── NAVBAR ───────────────────────────────────────────────────────────────────
const Navbar = () => {
  const [drop, setDrop] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);
  return (
    <nav style={{ position:'fixed', top:0, width:'100%', zIndex:100,
      padding: scrolled ? '12px 0' : '22px 0',
      background: scrolled ? 'rgba(2,6,23,0.94)' : 'transparent',
      backdropFilter: scrolled ? 'blur(24px)' : 'none',
      WebkitBackdropFilter: scrolled ? 'blur(24px)' : 'none',
      borderBottom: scrolled ? `1px solid ${C.sub}` : 'none',
      transition: 'all 0.3s ease' }}>
      <div style={{ maxWidth:1080, margin:'0 auto', padding:'0 28px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <button onClick={() => { window.scrollTo({top:0,behavior:'smooth'}); navigate('/'); }}
          style={{ fontFamily:'monospace', fontSize:14, fontWeight:700, letterSpacing:'0.06em', color:C.accent, background:'none', border:'none', cursor:'pointer', padding:0 }}>
          EH
        </button>
        <div style={{ display:'flex', alignItems:'center', gap:24 }}>
          {['#experience','#skills','#awards'].map(h => (
            <a key={h} href={`/${h}`} style={{ fontSize:13, fontWeight:500, color:C.muted, textDecoration:'none', transition:'color 0.2s', letterSpacing:'-0.01em' }}
              onMouseEnter={e=>e.target.style.color=C.text} onMouseLeave={e=>e.target.style.color=C.muted}>
              {h.slice(1).charAt(0).toUpperCase()+h.slice(2)}
            </a>
          ))}
          <div style={{ position:'relative' }}>
            <button onClick={() => setDrop(v=>!v)}
              style={{ display:'flex', alignItems:'center', gap:6, fontSize:13, fontWeight:500, color:C.muted, background:'none', border:'none', cursor:'pointer', padding:0, transition:'color 0.2s' }}
              onMouseEnter={e=>e.currentTarget.style.color=C.text} onMouseLeave={e=>e.currentTarget.style.color=C.muted}>
              Projects
              <span style={{ width:14, height:14, display:'inline-flex', transform:drop?'rotate(180deg)':'rotate(0deg)', transition:'transform 0.2s' }}>{Ico.Chevron}</span>
            </button>
            <AnimatePresence>
              {drop && (
                <motion.div initial={{opacity:0,y:8,scale:0.96}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:8,scale:0.96}}
                  transition={SPR_FAST}
                  style={{ position:'absolute', right:0, top:'calc(100% + 12px)', width:260, borderRadius:14, padding:6, ...glass, zIndex:200 }}>
                  {projects.map(p => (
                    <Link key={p.id} to={`/project/${p.id}`} onClick={()=>setDrop(false)}
                      style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'9px 12px', borderRadius:9, fontSize:13, color:C.muted, textDecoration:'none', transition:'all 0.15s' }}
                      onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,255,255,0.06)';e.currentTarget.style.color=C.text;}}
                      onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color=C.muted;}}>
                      <span>{p.title}</span>
                      <span style={{ fontFamily:'monospace', fontSize:10, color:p.accent }}>{p.year}</span>
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <a href="/#contact"
            style={{ fontSize:13, fontWeight:500, color:C.accent, textDecoration:'none', padding:'7px 18px', borderRadius:9999, background:`rgba(94,234,212,0.08)`, border:`1px solid rgba(94,234,212,0.22)`, transition:'background 0.2s', letterSpacing:'-0.01em' }}
            onMouseEnter={e=>e.currentTarget.style.background='rgba(94,234,212,0.16)'}
            onMouseLeave={e=>e.currentTarget.style.background='rgba(94,234,212,0.08)'}>
            Contact
          </a>
        </div>
      </div>
    </nav>
  );
};

// ─── MONO NAME HOVER ──────────────────────────────────────────────────────────
const MonoNameHover = () => {
  const [on, setOn] = useState(false);
  return (
    <div onMouseEnter={()=>setOn(true)} onMouseLeave={()=>setOn(false)} style={{ cursor:'default', userSelect:'none' }}>
      <motion.h1
        animate={{ color: on ? C.accent : C.text }}
        transition={{ duration:0.4 }}
        style={{ fontSize:'clamp(56px,10vw,96px)', fontWeight:600, letterSpacing:'-0.03em', lineHeight:0.92, margin:0 }}>
        Eric Huang
      </motion.h1>
      <AnimatePresence>
        {on && (
          <motion.div
            initial={{ opacity:0, height:0, marginTop:0 }}
            animate={{ opacity:1, height:'auto', marginTop:16 }}
            exit={{ opacity:0, height:0, marginTop:0 }}
            transition={SPR}
            style={{ overflow:'hidden' }}>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:20, paddingTop:16, borderTop:`1px solid ${C.border}` }}>
              {[['Role','Engineer & Builder'],['Location','Brooklyn, NY'],['Status','Open to Work']].map(([k,v],i)=>(
                <div key={k}>
                  <p style={{ fontFamily:'monospace', fontSize:10, letterSpacing:'0.15em', textTransform:'uppercase', color:C.subtle, margin:'0 0 4px' }}>{k}</p>
                  <p style={{ fontSize:13, color: i===2 ? C.accent : C.muted, margin:0 }}>{v}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── SECTION HEADER ───────────────────────────────────────────────────────────
const SH = ({ label, title }) => (
  <div style={{ marginBottom:52 }}>
    <p style={{ fontFamily:'monospace', fontSize:11, letterSpacing:'0.2em', textTransform:'uppercase', color:C.accent, margin:'0 0 10px' }}>{label}</p>
    <h2 style={{ fontSize:34, fontWeight:600, letterSpacing:'-0.02em', color:C.text, margin:0 }}>{title}</h2>
  </div>
);

// ─── FILE CARD (sticky project card) ─────────────────────────────────────────
const FileCard = ({ project: p, index: i }) => {
  const [hov, setHov] = useState(false);
  return (
    <motion.div
      onHoverStart={()=>setHov(true)} onHoverEnd={()=>setHov(false)}
      animate={{ boxShadow: hov ? `0 0 80px ${p.accent}14, 0 40px 80px -20px rgba(0,0,0,0.8)` : '0 24px 64px -12px rgba(0,0,0,0.6)' }}
      transition={SPR}
      style={{ borderRadius:18, overflow:'hidden', border:`1px solid ${hov ? p.accent+'3a' : C.border}`, background:C.surface, transition:'border-color 0.3s' }}>

      {/* ── Tab strip ── */}
      <div style={{ display:'flex', alignItems:'center', gap:12, padding:`16px 24px`, height:TAB_H,
        background:`${p.accent}0a`, borderBottom:`1px solid ${C.border}` }}>
        <span style={{ fontFamily:'monospace', fontSize:11, color:C.subtle, letterSpacing:'0.1em' }}>
          {String(i+1).padStart(2,'0')}
        </span>
        <span style={{ fontSize:14, fontWeight:600, color:C.text, letterSpacing:'-0.01em', flex:1 }}>{p.title}</span>
        <span style={{ fontFamily:'monospace', fontSize:10, letterSpacing:'0.12em', textTransform:'uppercase', color:p.accent,
          background:`${p.accent}18`, padding:'3px 10px', borderRadius:9999 }}>{p.category}</span>
        <span style={{ fontFamily:'monospace', fontSize:10, color:C.subtle }}>{p.year}</span>
      </div>

      {/* ── Body ── */}
      <div style={{ display:'grid', gridTemplateColumns:'minmax(0,1fr) minmax(0,1.3fr)', gap:0 }}>
        {/* Media */}
        <div style={{ padding:24, borderRight:`1px solid ${C.border}` }}>
          <div style={{ aspectRatio:'16/9', borderRadius:12, background:'rgba(255,255,255,0.03)',
            border:'1px solid rgba(255,255,255,0.06)', display:'flex', alignItems:'center', justifyContent:'center',
            fontFamily:'monospace', fontSize:11, color:C.subtle }}>
            [ Media / Embed ]
          </div>
        </div>
        {/* Info */}
        <div style={{ padding:24, display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
          <div>
            <p style={{ fontSize:13, lineHeight:1.8, color:C.muted, marginBottom:20 }}>{p.desc}</p>
            <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:24 }}>
              {p.tech.map(t=>(
                <span key={t} style={{ fontFamily:'monospace', fontSize:10, padding:'4px 11px', borderRadius:9999,
                  color:C.muted, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)' }}>{t}</span>
              ))}
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'flex-end' }}>
            <Link to={`/project/${p.id}`} style={{ textDecoration:'none' }}>
              <motion.div whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }} transition={SPR_FAST}
                style={{ display:'inline-flex', alignItems:'center', gap:8, fontSize:13, fontWeight:500,
                  color:C.accent, background:`rgba(94,234,212,0.09)`, border:`1px solid rgba(94,234,212,0.28)`,
                  padding:'9px 20px', borderRadius:9999, cursor:'pointer' }}>
                Learn More
                <span style={{ width:14, height:14, display:'flex' }}>{Ico.Arrow}</span>
              </motion.div>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ─── HOME ─────────────────────────────────────────────────────────────────────
const Home = () => (
  <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0,y:-20}} transition={{duration:0.4}}
    style={{ position:'relative', zIndex:10 }}>
    <div style={{ maxWidth:1080, margin:'0 auto', padding:'148px 28px 120px' }}>

      {/* HERO */}
      <motion.section initial={{opacity:0,y:36}} animate={{opacity:1,y:0}} transition={{...SPR, delay:0.1}} style={{ marginBottom:140 }}>
        {/* Available badge */}
        <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{...SPR, delay:0.25}}
          style={{ display:'inline-flex', alignItems:'center', gap:8, marginBottom:36, padding:'7px 16px', borderRadius:9999, ...glass }}>
          <span style={{ width:6, height:6, borderRadius:'50%', background:C.accent, boxShadow:`0 0 8px ${C.accent}`, animation:'pulse 2s infinite' }} />
          <span style={{ fontFamily:'monospace', fontSize:11, letterSpacing:'0.18em', textTransform:'uppercase', color:C.accent }}>Available for opportunities</span>
        </motion.div>

        <motion.div initial={{opacity:0,y:24}} animate={{opacity:1,y:0}} transition={{...SPR, delay:0.15}} style={{ marginBottom:24 }}>
          <MonoNameHover />
        </motion.div>

        <motion.p initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.35}}
          style={{ fontSize:20, fontWeight:300, letterSpacing:'-0.01em', color:C.muted, margin:'0 0 14px' }}>
          Engineer. Builder. Creator.
        </motion.p>
        <motion.p initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.45}}
          style={{ fontSize:14, lineHeight:1.85, color:C.subtle, maxWidth:480, marginBottom:52 }}>
          STEM student at Staten Island Technical High School passionate about hardware, software, and the intersection of both. I design, prototype, and ship — from smart masks to award-winning robots.
        </motion.p>

        {/* Social cards */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))', gap:12, marginBottom:64 }}>
          {socials.map((s,i)=>(
            <motion.a key={s.name} href={s.url} target="_blank" rel="noreferrer"
              initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{...SPR, delay:0.3+i*0.07}}
              whileHover={{ scale:1.02, transition:SPR_FAST }}
              style={{ display:'flex', flexDirection:'column', gap:14, padding:18, borderRadius:14, ...glass, textDecoration:'none', transition:'box-shadow 0.3s' }}
              onMouseEnter={e=>e.currentTarget.style.boxShadow=`0 0 32px rgba(94,234,212,0.1), 0 16px 40px -8px rgba(0,0,0,0.5)`}
              onMouseLeave={e=>e.currentTarget.style.boxShadow=glass.boxShadow}>
              <span style={{ width:18, height:18, display:'flex', color:C.subtle }}>{icoMap[s.name]}</span>
              <div>
                <p style={{ fontFamily:'monospace', fontSize:10, letterSpacing:'0.12em', textTransform:'uppercase', color:C.subtle, margin:'0 0 3px' }}>Connect</p>
                <p style={{ fontSize:13, fontWeight:500, color:C.text, margin:0 }}>{s.name} →</p>
              </div>
            </motion.a>
          ))}
        </div>

        {/* Stats */}
        <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.6}}
          style={{ display:'flex', flexWrap:'wrap', gap:40, paddingTop:32, borderTop:`1px solid ${C.sub}` }}>
          {[['850k+','TikTok Views'],['200k+','TikTok Likes'],['1k+','Followers'],['4.0','GPA'],['2×','FTC Awards'],['50+','Students Taught']].map(([v,l],i)=>(
            <motion.div key={l} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:0.65+i*0.05}}>
              <p style={{ fontSize:30, fontWeight:600, letterSpacing:'-0.025em', color:C.text, lineHeight:1, marginBottom:5 }}>{v}</p>
              <p style={{ fontFamily:'monospace', fontSize:10, letterSpacing:'0.16em', textTransform:'uppercase', color:C.subtle, margin:0 }}>{l}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* ── FILE STACK PROJECTS ── */}
      <section id="projects" style={{ scrollMarginTop:96 }}>
        <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={SPR}>
          <SH label="Portfolio" title="Selected Work" />
        </motion.div>

        {/* Sticky file stack: all cards share one parent, staggered top offsets */}
        <div style={{ position:'relative', paddingBottom:'20vh' }}>
          {projects.map((p,i)=>(
            <div key={p.id} style={{ position:'sticky', top: NAV_H + i * TAB_H, zIndex: 20 + i }}>
              <FileCard project={p} index={i} />
            </div>
          ))}
        </div>
      </section>

      {/* ── EXPERIENCE ── */}
      <section id="experience" style={{ paddingTop:80, scrollMarginTop:96 }}>
        <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={SPR}>
          <SH label="Background" title="Experience" />
        </motion.div>
        <div style={{ borderLeft:`1px solid ${C.sub}`, marginLeft:12, display:'flex', flexDirection:'column', gap:20 }}>
          {experience.map((exp,idx)=>(
            <motion.div key={idx} style={{ position:'relative', paddingLeft:32 }}
              initial={{opacity:0,x:-16}} whileInView={{opacity:1,x:0}} viewport={{once:true}} transition={{...SPR, delay:idx*0.09}}>
              <span style={{ position:'absolute', left:-6, top:12, width:12, height:12, borderRadius:'50%', background:C.bg, border:`2px solid ${C.accent}`, boxShadow:`0 0 10px ${C.accent}60` }} />
              <motion.div whileHover={{borderColor:'rgba(94,234,212,0.2)'}} transition={{duration:0.2}}
                style={{ padding:24, borderRadius:14, ...glass }}>
                <div style={{ display:'flex', flexWrap:'wrap', justifyContent:'space-between', gap:8, marginBottom:14 }}>
                  <div style={{ fontSize:15, fontWeight:600, color:C.text, letterSpacing:'-0.01em' }}>
                    {exp.role}
                    <span style={{ fontWeight:400, color:C.subtle, margin:'0 6px' }}>@</span>
                    <span style={{ color:C.accent }}>{exp.org}</span>
                  </div>
                  <div style={{ fontFamily:'monospace', fontSize:11, color:C.subtle }}>{exp.period}</div>
                </div>
                <ul style={{ listStyle:'none', padding:0, margin:0, display:'flex', flexDirection:'column', gap:7 }}>
                  {exp.bullets.map((b,bi)=>(
                    <li key={bi} style={{ display:'flex', alignItems:'flex-start', gap:10, fontSize:13, color:C.muted, lineHeight:1.75 }}>
                      <span style={{ width:4, height:4, borderRadius:'50%', background:C.sec, marginTop:8, flexShrink:0 }} />
                      {b}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── SKILLS ── */}
      <section id="skills" style={{ paddingTop:80, scrollMarginTop:96 }}>
        <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={SPR}>
          <SH label="Capabilities" title="Skills & Tools" />
        </motion.div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:14 }}>
          {skillGroups.map((sg,idx)=>(
            <motion.div key={idx} initial={{opacity:0,y:16}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{...SPR, delay:idx*0.08}}
              style={{ padding:24, borderRadius:14, ...glass }}>
              <p style={{ fontFamily:'monospace', fontSize:10, letterSpacing:'0.16em', textTransform:'uppercase', color:sg.accent, margin:'0 0 16px' }}>{sg.label}</p>
              <div style={{ display:'flex', flexWrap:'wrap', gap:7 }}>
                {sg.items.map(item=>(
                  <span key={item} style={{ fontFamily:'monospace', fontSize:11, padding:'5px 13px', borderRadius:9999,
                    color:C.muted, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)' }}>{item}</span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── AWARDS ── */}
      <section id="awards" style={{ paddingTop:80, scrollMarginTop:96 }}>
        <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={SPR}>
          <SH label="Recognition" title="Awards & Certifications" />
        </motion.div>
        <div style={{ borderRadius:16, overflow:'hidden', border:`1px solid ${C.border}` }}>
          {awards.map((a,idx)=>(
            <motion.div key={idx}
              initial={{opacity:0}} whileInView={{opacity:1}} viewport={{once:true}} transition={{delay:idx*0.06}}
              style={{ display:'flex', flexWrap:'wrap', justifyContent:'space-between', alignItems:'center', padding:'15px 24px', gap:8,
                background: idx%2===0 ? 'rgba(15,23,42,0.5)' : 'rgba(15,23,42,0.3)',
                borderBottom: idx<awards.length-1 ? `1px solid ${C.sub}` : 'none', transition:'background 0.15s' }}
              onMouseEnter={e=>e.currentTarget.style.background='rgba(94,234,212,0.04)'}
              onMouseLeave={e=>e.currentTarget.style.background=idx%2===0?'rgba(15,23,42,0.5)':'rgba(15,23,42,0.3)'}>
              <div style={{ display:'flex', alignItems:'center', gap:12, fontSize:13, color:C.muted }}>
                <span style={{ width:5, height:5, borderRadius:'50%', background:C.accent, boxShadow:`0 0 6px ${C.accent}80`, flexShrink:0 }} />
                {a.title}
              </div>
              <span style={{ fontFamily:'monospace', fontSize:11, color:C.subtle }}>{a.year}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="contact" style={{ paddingTop:80, scrollMarginTop:96 }}>
        <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={SPR}>
          <SH label="Get in Touch" title="Contact" />
        </motion.div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:52 }}>
          <div>
            <p style={{ fontSize:14, lineHeight:1.85, color:C.subtle, marginBottom:32 }}>
              Open to internships, collaborations, and interesting projects. Whether you have a hardware challenge or want to talk engineering, I'd love to hear from you.
            </p>
            <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
              {socials.map(s=>(
                <a key={s.name} href={s.url} target="_blank" rel="noreferrer"
                  style={{ display:'flex', alignItems:'center', gap:12, fontSize:13, color:C.muted, textDecoration:'none', transition:'color 0.2s' }}
                  onMouseEnter={e=>e.currentTarget.style.color=C.accent} onMouseLeave={e=>e.currentTarget.style.color=C.muted}>
                  <span style={{ width:16, height:16, display:'flex', flexShrink:0 }}>{icoMap[s.name]}</span>
                  {s.label}
                </a>
              ))}
            </div>
          </div>
          <ContactForm />
        </div>
      </section>

    </div>
  </motion.div>
);

// ─── CONTACT FORM ─────────────────────────────────────────────────────────────
const ContactForm = () => {
  const [form, setForm] = useState({ name:'', email:'', message:'' });
  const h = e => setForm(f=>({...f, [e.target.name]:e.target.value}));
  const sub = e => {
    e.preventDefault();
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=huangeric1029@gmail.com&su=${encodeURIComponent('Portfolio: '+form.name)}&body=${encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`)}`, '_blank');
  };
  const field = { width:'100%', boxSizing:'border-box', background:'rgba(255,255,255,0.03)', border:`1px solid ${C.sub}`, borderRadius:10, padding:'12px 16px', fontSize:14, color:C.text, outline:'none', fontFamily:"'Inter',sans-serif", transition:'border-color 0.2s, box-shadow 0.2s' };
  const fi = e => { e.target.style.borderColor='rgba(94,234,212,0.45)'; e.target.style.boxShadow=`0 0 0 3px rgba(94,234,212,0.07)`; };
  const fo = e => { e.target.style.borderColor=C.sub; e.target.style.boxShadow='none'; };
  return (
    <form onSubmit={sub} style={{ display:'flex', flexDirection:'column', gap:16 }}>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
        {[['name','Name','Your name'],['email','Email','you@email.com']].map(([n,l,ph])=>(
          <div key={n}>
            <label style={{ display:'block', fontFamily:'monospace', fontSize:10, letterSpacing:'0.15em', textTransform:'uppercase', color:C.subtle, marginBottom:8 }}>{l}</label>
            <input name={n} value={form[n]} onChange={h} required placeholder={ph} type={n==='email'?'email':'text'} style={field} onFocus={fi} onBlur={fo} />
          </div>
        ))}
      </div>
      <div>
        <label style={{ display:'block', fontFamily:'monospace', fontSize:10, letterSpacing:'0.15em', textTransform:'uppercase', color:C.subtle, marginBottom:8 }}>Message</label>
        <textarea name="message" value={form.message} onChange={h} required rows={5} placeholder="Tell me about your project or opportunity..."
          style={{ ...field, resize:'vertical' }} onFocus={fi} onBlur={fo} />
      </div>
      <motion.button type="submit" whileHover={{ scale:1.01 }} whileTap={{ scale:0.99 }} transition={SPR_FAST}
        style={{ width:'100%', padding:'13px 0', borderRadius:10, fontSize:14, fontWeight:500, fontFamily:"'Inter',sans-serif",
          color:C.accent, background:`rgba(94,234,212,0.09)`, border:`1px solid rgba(94,234,212,0.25)`, cursor:'pointer', letterSpacing:'-0.01em' }}>
        Send Message →
      </motion.button>
    </form>
  );
};

// ─── RESEARCH PAPER PAGE ──────────────────────────────────────────────────────
const ResearchPaper = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const p = projects.find(x => x.id === id);

  if (!p) return (
    <div style={{ position:'relative', zIndex:10, display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', color:C.text }}>
      Not found.{' '}
      <button onClick={()=>navigate('/')} style={{ color:C.accent, background:'none', border:'none', cursor:'pointer', marginLeft:8 }}>Go back</button>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity:0, y:40 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:20 }}
      transition={{ ...SPR, delay:0.05 }}
      style={{ position:'relative', zIndex:10, minHeight:'100vh', paddingTop:NAV_H+20 }}>

      {/* Ambient glow behind content */}
      <div style={{ position:'fixed', top:'30vh', left:'50%', transform:'translateX(-50%)', width:700, height:400, borderRadius:'50%',
        background:`radial-gradient(ellipse, ${p.accent}07 0%, transparent 70%)`, pointerEvents:'none', zIndex:0, filter:'blur(60px)' }} />

      <div style={{ maxWidth:1080, margin:'0 auto', padding:'32px 28px 96px', position:'relative', zIndex:2 }}>

        {/* Back */}
        <motion.button
          onClick={()=>navigate(-1)}
          whileHover={{ x:-2 }} transition={SPR_FAST}
          style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'8px 18px', borderRadius:9999, fontFamily:'monospace', fontSize:11, letterSpacing:'0.12em', textTransform:'uppercase', color:C.muted, ...glass, border:`1px solid ${C.sub}`, cursor:'pointer', marginBottom:40, background:'rgba(15,23,42,0.5)' }}>
          ← Back
        </motion.button>

        {/* Two-column research layout */}
        <div style={{ display:'grid', gridTemplateColumns:'320px 1fr', gap:48, alignItems:'start' }}>

          {/* ── LEFT SIDEBAR ── */}
          <div style={{ position:'sticky', top: NAV_H + 20 }}>
            {/* Category + year */}
            <div style={{ display:'flex', gap:8, marginBottom:20 }}>
              <span style={{ fontFamily:'monospace', fontSize:10, letterSpacing:'0.13em', textTransform:'uppercase', color:p.accent, background:`${p.accent}18`, padding:'4px 12px', borderRadius:9999 }}>{p.category}</span>
              <span style={{ fontFamily:'monospace', fontSize:10, color:C.subtle, display:'flex', alignItems:'center' }}>{p.year}</span>
            </div>

            {/* Media */}
            <div style={{ aspectRatio:'16/9', borderRadius:14, background:'rgba(255,255,255,0.03)', border:`1px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'monospace', fontSize:11, color:C.subtle, marginBottom:24, overflow:'hidden' }}>
              [ Media / Images ]
            </div>

            {/* Tech stack */}
            <div style={{ marginBottom:24 }}>
              <p style={{ fontFamily:'monospace', fontSize:10, letterSpacing:'0.15em', textTransform:'uppercase', color:C.subtle, margin:'0 0 12px' }}>Tech Stack</p>
              <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                {p.tech.map(t=>(
                  <span key={t} style={{ fontFamily:'monospace', fontSize:11, padding:'4px 11px', borderRadius:9999,
                    color:C.muted, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)' }}>{t}</span>
                ))}
              </div>
            </div>

            {/* Links */}
            <div>
              <p style={{ fontFamily:'monospace', fontSize:10, letterSpacing:'0.15em', textTransform:'uppercase', color:C.subtle, margin:'0 0 12px' }}>Links</p>
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {['GitHub Repository','Download Files','View Demo'].map(lbl=>(
                  <a key={lbl} href="#"
                    style={{ display:'flex', alignItems:'center', gap:8, fontSize:12, color:C.muted, textDecoration:'none', transition:'color 0.2s' }}
                    onMouseEnter={e=>e.currentTarget.style.color=C.accent} onMouseLeave={e=>e.currentTarget.style.color=C.muted}>
                    <span style={{ width:14, height:14, display:'flex' }}>{Ico.External}</span>{lbl}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* ── RIGHT MAIN ── */}
          <div>
            {/* Abstract header */}
            <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{...SPR, delay:0.15}}
              style={{ padding:'32px 36px', borderRadius:18, marginBottom:36, ...glass,
                borderLeft:`4px solid ${p.accent}` }}>
              <p style={{ fontFamily:'monospace', fontSize:10, letterSpacing:'0.2em', textTransform:'uppercase', color:p.accent, margin:'0 0 14px' }}>Abstract</p>
              <h1 style={{ fontSize:'clamp(24px,4vw,36px)', fontWeight:600, letterSpacing:'-0.02em', color:C.text, margin:'0 0 16px', lineHeight:1.2 }}>{p.title}</h1>
              <p style={{ fontSize:14, lineHeight:1.85, color:C.muted, margin:0 }}>{p.doc.abstract}</p>
            </motion.div>

            {/* Sections */}
            <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
              {p.doc.sections.map((sec, si) => (
                <motion.div key={si}
                  initial={{opacity:0, y:20}} whileInView={{opacity:1, y:0}} viewport={{once:true}}
                  transition={{...SPR, delay:si*0.07}}
                  style={{ padding:'28px 36px', borderRadius:16, marginBottom:12, background:'rgba(15,23,42,0.55)', border:`1px solid ${C.sub}`, backdropFilter:'blur(16px)' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:14 }}>
                    <span style={{ fontFamily:'monospace', fontSize:11, color:p.accent, letterSpacing:'0.1em', opacity:0.7 }}>{sec.n}</span>
                    <span style={{ width:1, height:18, background:C.border, flexShrink:0 }} />
                    <h3 style={{ fontSize:15, fontWeight:600, letterSpacing:'-0.01em', color:C.text, margin:0, textTransform:'uppercase', letterSpacing:'0.06em', fontSize:12 }}>{sec.title}</h3>
                  </div>
                  <p style={{ fontSize:14, lineHeight:1.85, color:C.muted, margin:0, paddingLeft:28 }}>{sec.body}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ─── FOOTER ───────────────────────────────────────────────────────────────────
const Footer = () => (
  <footer style={{ position:'relative', zIndex:10, padding:'24px 28px', borderTop:`1px solid ${C.sub}` }}>
    <div style={{ maxWidth:1080, margin:'0 auto', display:'flex', flexWrap:'wrap', justifyContent:'space-between', alignItems:'center', gap:14 }}>
      <span style={{ fontFamily:'monospace', fontSize:11, color:C.sec }}>© 2026 Eric Huang — Brooklyn, NY</span>
      <div style={{ display:'flex', gap:20 }}>
        {socials.map(s=>(
          <a key={s.name} href={s.url} target="_blank" rel="noreferrer"
            style={{ fontFamily:'monospace', fontSize:11, color:C.sec, textDecoration:'none', transition:'color 0.2s' }}
            onMouseEnter={e=>e.target.style.color=C.accent} onMouseLeave={e=>e.target.style.color=C.sec}>
            {s.name}
          </a>
        ))}
      </div>
    </div>
  </footer>
);

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
const AppContent = () => {
  const location = useLocation();
  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', background:C.bg, color:C.text, fontFamily:"'Inter',sans-serif" }}>
      <StarCanvas />
      <Noise />
      <Navbar />
      <main style={{ flex:1 }}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/"           element={<Home />} />
            <Route path="/project/:id" element={<ResearchPaper />} />
          </Routes>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
};

export default function App() {
  return <Router><AppContent /></Router>;
}
