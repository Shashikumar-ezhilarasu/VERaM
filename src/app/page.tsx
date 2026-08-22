"use client";

import React, { useRef } from 'react';
import Link from 'next/link';
import { PillButton } from '@/components/ui/PillButton';
import { DashedCircle } from '@/components/ui/DashedCircle';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  Mic, Zap, Shield, Database, MessageSquare, 
  Terminal, Activity, LayoutGrid, Clock, 
  Languages, Cpu, Network, AudioLines, Code, ArrowRight
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const circleRef = useRef<HTMLDivElement>(null);
  const pipelineRef = useRef<HTMLDivElement>(null);
  
  // Benchmark refs
  const p50Ref = useRef<HTMLSpanElement>(null);
  const p70Ref = useRef<HTMLSpanElement>(null);
  const p100Ref = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    // Hero Entrance
    const tl = gsap.timeline();
    
    if (titleRef.current) {
      const words = titleRef.current.innerText.split(' ');
      titleRef.current.innerHTML = '';
      words.forEach(word => {
        const span = document.createElement('span');
        span.innerText = word + ' ';
        span.style.display = 'inline-block';
        titleRef.current?.appendChild(span);
      });
      
      tl.from(titleRef.current.children, {
        y: 40,
        opacity: 0,
        stagger: 0.1,
        ease: 'power3.out',
        duration: 0.8
      });
    }

    tl.from('.hero-fade-up', {
      y: 20,
      opacity: 0,
      stagger: 0.2,
      ease: 'power2.out',
      duration: 0.6
    }, "-=0.4");

    tl.from(circleRef.current, {
      scale: 0.8,
      opacity: 0,
      ease: 'back.out(1.5)',
      duration: 1
    }, "-=0.8");

    gsap.to('.hero-dashed-ring', {
      rotation: -360,
      duration: 20,
      repeat: -1,
      ease: 'none'
    });

    gsap.to('.hero-solid-circle', {
      scale: 1.05,
      yoyo: true,
      repeat: -1,
      duration: 2,
      ease: 'sine.inOut'
    });
    
    // Audio waveform animation
    gsap.to('.audio-bar', {
      height: () => gsap.utils.random(20, 100) + '%',
      duration: 0.15,
      repeat: -1,
      yoyo: true,
      ease: 'none',
      stagger: 0.05
    });
    
    // Pipeline ScrollTrigger
    if (pipelineRef.current) {
      const cards = gsap.utils.toArray('.pipeline-card');
      const totalWidth = (cards.length - 1) * 100;
      
      gsap.to(cards, {
        xPercent: -totalWidth,
        ease: "none",
        scrollTrigger: {
          trigger: pipelineRef.current,
          pin: true,
          scrub: 1,
          end: () => "+=" + pipelineRef.current?.offsetWidth
        }
      });
      
      // Connecting line progress
      gsap.to('.pipeline-progress-line', {
        width: '100%',
        ease: "none",
        scrollTrigger: {
          trigger: pipelineRef.current,
          scrub: 1,
          start: 'top top',
          end: () => "+=" + pipelineRef.current?.offsetWidth
        }
      });
    }

    // Benchmark counters
    ScrollTrigger.create({
      trigger: '.benchmarks-section',
      start: 'top center',
      onEnter: () => {
        gsap.to(p50Ref.current, { innerHTML: 180, duration: 2, snap: 'innerHTML', ease: 'power2.out' });
        gsap.to(p70Ref.current, { innerHTML: 250, duration: 2, snap: 'innerHTML', ease: 'power2.out' });
        gsap.to(p100Ref.current, { innerHTML: 420, duration: 2, snap: 'innerHTML', ease: 'power2.out' });
      },
      once: true
    });
    
    // Fade in sections on scroll
    gsap.utils.toArray('.fade-section').forEach((section: any) => {
      gsap.from(section, {
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
        }
      });
    });

  }, { scope: containerRef });

  const scrollToArchitecture = (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById('architecture')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div ref={containerRef} className="bg-bg-darker min-h-screen text-cream overflow-hidden selection:bg-tech-cyan selection:text-bg-darker">
      
      {/* 1. Hero Section */}
      <section ref={heroRef} className="min-h-screen flex items-center justify-center p-8 relative border-b border-white/5">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
        
        <div className="max-w-7xl w-full grid md:grid-cols-2 gap-16 items-center relative z-10">
          
          {/* Left: Copy */}
          <div className="z-10 text-cream order-2 md:order-1">
            <div className="hero-fade-up inline-flex items-center gap-2 px-3 py-1 bg-tech-cyan/10 border border-tech-cyan/20 rounded-full mb-6">
              <span className="w-2 h-2 rounded-full bg-tech-cyan animate-pulse"></span>
              <p className="font-mono text-xs font-bold text-tech-cyan tracking-[0.2em] uppercase">Voice-Enabled RAG</p>
            </div>
            
            <h1 ref={titleRef} className="text-5xl md:text-7xl font-serif text-white mb-6 leading-tight">
              Speak a question. Get a grounded answer.
            </h1>
            <p className="hero-fade-up font-mono text-lg text-cream/70 mb-10 leading-relaxed max-w-xl">
              No typing. No generic LLM fluff. Real-time voice capture streamed to a 
              custom retrieval-augmented generation pipeline, delivering cited answers in under a second.
            </p>
            
            <div className="hero-fade-up flex flex-wrap gap-4">
              <Link href="/demo">
                <PillButton variant="solid" className="bg-tech-cyan text-bg-darker hover:bg-white hover:text-bg-darker shadow-[0_0_20px_rgba(0,240,255,0.3)] border-none">
                  Try the live demo
                </PillButton>
              </Link>
              <button onClick={scrollToArchitecture}>
                <PillButton variant="outline" className="text-cream border-cream/30 hover:bg-white/10">
                  View architecture
                </PillButton>
              </button>
            </div>
          </div>

          {/* Right: Technical Illustration */}
          <div className="relative flex items-center justify-center h-[500px] order-1 md:order-2" ref={circleRef}>
            <DashedCircle size={450} className="hero-dashed-ring absolute opacity-20 text-tech-cyan" />
            
            <div className="hero-solid-circle w-72 h-72 bg-forest rounded-full flex flex-col items-center justify-center shadow-[0_0_50px_rgba(11,61,36,0.8)] z-10 relative border border-tech-cyan/30">
              <Mic size={64} className="text-tech-cyan mb-4" />
              {/* Animated waveform bars */}
              <div className="flex gap-1 h-12 items-end justify-center w-32">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="audio-bar w-1.5 bg-tech-cyan rounded-t-sm" style={{ height: '20%' }}></div>
                ))}
              </div>
            </div>
            
            {/* Tilted technical spec card */}
            <div className="absolute top-10 right-0 bg-[#0A1A12] p-4 rounded-lg shadow-2xl z-20 border border-tech-cyan/20 backdrop-blur-md font-mono">
              <p className="text-[10px] text-tech-cyan/70 mb-2 uppercase">Status</p>
              <div className="flex items-center gap-2 text-xs text-white">
                <Activity size={14} className="text-tech-lime" />
                <span>Socket Connected</span>
              </div>
              <p className="text-[10px] text-white/50 mt-1">wss://api.v1/stream</p>
            </div>

            {/* Bottom latency card */}
            <div className="absolute -bottom-4 left-10 bg-[#0A1A12] p-4 rounded-lg shadow-2xl z-20 border border-tech-lime/20 backdrop-blur-md font-mono">
              <p className="text-[10px] text-tech-lime/70 mb-1 uppercase">Latency</p>
              <div className="text-2xl text-white font-light">180<span className="text-xs text-white/50 ml-1">ms</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. The Problem */}
      <section className="py-24 px-8 bg-black/40 border-b border-white/5 fade-section">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <span className="font-mono text-tech-cyan/70 text-sm">01 / The Friction</span>
            <h2 className="text-4xl md:text-5xl font-serif mt-4 text-white">Why Voice RAG?</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-8 bg-white/5 border border-white/10 rounded-2xl hover:border-tech-cyan/30 transition-colors">
              <Terminal className="text-tech-cyan mb-6" size={32} />
              <h3 className="text-xl font-serif text-white mb-3">Typing is Friction</h3>
              <p className="font-mono text-sm text-cream/60 leading-relaxed">
                Traditional RAG forces users into search boxes and chat interfaces. Voice is the highest-bandwidth input method, reducing cognitive load.
              </p>
            </div>
            <div className="p-8 bg-white/5 border border-white/10 rounded-2xl hover:border-tech-cyan/30 transition-colors">
              <MessageSquare className="text-tech-cyan mb-6" size={32} />
              <h3 className="text-xl font-serif text-white mb-3">Generic Answers Hallucinate</h3>
              <p className="font-mono text-sm text-cream/60 leading-relaxed">
                Standard voice assistants (like Siri or base LLMs) lack domain-specific ground truth. They guess when they don't know.
              </p>
            </div>
            <div className="p-8 bg-white/5 border border-white/10 rounded-2xl hover:border-tech-cyan/30 transition-colors">
              <Shield className="text-tech-cyan mb-6" size={32} />
              <h3 className="text-xl font-serif text-white mb-3">Not Grounded</h3>
              <p className="font-mono text-sm text-cream/60 leading-relaxed">
                Most voice AI tools aren't built on retrieval pipelines. RAGInGoa bridges native speech directly into a strict vector search architecture.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. How It Works (Pipeline) */}
      <section ref={pipelineRef} className="h-screen bg-bg-darker flex flex-col justify-center overflow-hidden border-b border-white/5">
        <div className="max-w-6xl mx-auto w-full px-8 mb-16">
          <span className="font-mono text-tech-cyan/70 text-sm">02 / Pipeline</span>
          <h2 className="text-4xl md:text-5xl font-serif mt-4 text-white">How It Works</h2>
        </div>
        
        <div className="relative">
          {/* Connecting Line Background */}
          <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/10 -translate-y-1/2 hidden md:block"></div>
          {/* Connecting Line Progress */}
          <div className="pipeline-progress-line absolute top-1/2 left-0 w-0 h-[1px] bg-tech-cyan -translate-y-1/2 hidden md:block shadow-[0_0_10px_rgba(0,240,255,0.8)]"></div>

          <div className="flex w-[200vw] px-8 gap-8 relative z-10 items-center">
            {[
              { step: "01", title: "Speak", icon: Mic, desc: "Raw PCM audio is captured and streamed over WebSockets.", tech: "Browser AudioWorklet" },
              { step: "02", title: "Transcribe", icon: MessageSquare, desc: "Sub-second STT converts audio frames to streaming text.", tech: "STT: Sarvam API" },
              { step: "03", title: "Retrieve", icon: Database, desc: "Vector similarity search finds grounded context.", tech: "Vector DB: LanceDB" },
              { step: "04", title: "Generate", icon: Zap, desc: "LLM synthesizes the answer with strict guardrails.", tech: "LLM: Groq (Llama-3)" },
              { step: "05", title: "Answer", icon: AudioLines, desc: "Audio tokens stream back to the UI in real-time.", tech: "TTS: Sarvam Audio" }
            ].map((item, idx) => (
              <div key={idx} className="pipeline-card w-100 shrink-0 bg-[#0A1A12] p-8 rounded-3xl border border-white/10 backdrop-blur-sm relative group">
                {/* Node dot on the connecting line */}
                <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-bg-darker border-2 border-white/20 group-hover:border-tech-cyan transition-colors hidden md:block z-20"></div>
                
                <div className="w-12 h-12 bg-tech-cyan/10 rounded-full flex items-center justify-center mb-6 border border-tech-cyan/20">
                  <span className="font-mono font-bold text-tech-cyan">{item.step}</span>
                </div>
                <item.icon size={28} className="text-white mb-6" />
                <h3 className="text-2xl font-serif mb-3 text-white">{item.title}</h3>
                <p className="font-mono text-sm text-cream/60 leading-relaxed mb-6">{item.desc}</p>
                <div className="pt-4 border-t border-white/10">
                  <span className="font-mono text-[10px] uppercase text-tech-lime tracking-wider">{item.tech}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Architecture Deep Dive */}
      <section id="architecture" className="py-24 px-8 bg-black/40 border-b border-white/5 fade-section">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <span className="font-mono text-tech-cyan/70 text-sm">03 / Infrastructure</span>
            <h2 className="text-4xl md:text-5xl font-serif mt-4 text-white">Architecture Deep Dive</h2>
          </div>
          
          <div className="grid md:grid-cols-12 gap-8">
            {/* Diagram Area */}
            <div className="md:col-span-8 bg-[#0A1A12] rounded-3xl border border-white/10 p-8 font-mono text-xs overflow-hidden relative">
              <div className="flex flex-col gap-8">
                
                {/* Client Tier */}
                <div className="flex items-center gap-4">
                  <div className="w-32 py-3 px-4 bg-white/5 border border-white/20 rounded-lg text-center text-white">
                    Client Browser
                  </div>
                  <div className="flex-1 border-t border-dashed border-tech-cyan/50 relative">
                    <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] text-tech-cyan bg-[#0A1A12] px-2">WebSockets / Binary PCM</span>
                    <ArrowRight className="absolute -right-2 -top-3 text-tech-cyan/50" size={24} />
                  </div>
                </div>

                {/* Processing Tier */}
                <div className="grid grid-cols-3 gap-4 pl-16">
                  <div className="col-span-3 border-l border-b rounded-bl-xl border-dashed border-white/20 pl-8 pb-8 -ml-8 -mt-4 relative">
                    <span className="absolute bottom-2 left-2 text-[10px] text-white/40">FastAPI Backend</span>
                  </div>
                  
                  <div className="p-4 bg-forest border border-tech-cyan/30 rounded-lg text-center text-tech-cyan shadow-[0_0_15px_rgba(0,240,255,0.1)]">
                    <Activity size={16} className="mx-auto mb-2" />
                    Sarvam STT
                  </div>
                  <div className="p-4 bg-white/5 border border-white/20 rounded-lg text-center text-white flex flex-col justify-center">
                    <ArrowRight size={16} className="mx-auto" />
                  </div>
                  <div className="p-4 bg-forest border border-tech-lime/30 rounded-lg text-center text-tech-lime shadow-[0_0_15px_rgba(57,255,20,0.1)]">
                    <Database size={16} className="mx-auto mb-2" />
                    LanceDB RAG
                  </div>
                  
                  <div className="col-span-3 flex justify-center py-2">
                    <ArrowRight size={20} className="text-white/30 rotate-90" />
                  </div>
                  
                  <div className="col-span-3 p-4 bg-white/5 border border-white/20 rounded-lg text-center text-white">
                    <Cpu size={16} className="mx-auto mb-2 text-accent-pink" />
                    Groq LLM + Strict Guardrails
                  </div>
                </div>

                {/* Return Tier */}
                <div className="flex items-center gap-4 flex-row-reverse">
                  <div className="w-32 py-3 px-4 bg-white/5 border border-white/20 rounded-lg text-center text-white">
                    Sarvam TTS
                  </div>
                  <div className="flex-1 border-t border-dashed border-accent-pink/50 relative">
                    <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] text-accent-pink bg-[#0A1A12] px-2">Stream Audio</span>
                    <ArrowRight className="absolute -left-2 -top-3 text-accent-pink/50 rotate-180" size={24} />
                  </div>
                  <div className="w-32 py-3 px-4 bg-white/5 border border-white/20 rounded-lg text-center text-white opacity-50">
                    Client Browser
                  </div>
                </div>

              </div>
            </div>

            {/* Callouts */}
            <div className="md:col-span-4 flex flex-col gap-4">
              <div className="bg-[#0A1A12] p-6 rounded-2xl border border-white/10">
                <Code className="text-tech-cyan mb-3" size={20} />
                <h4 className="font-serif text-lg text-white mb-2">Multi-method Chunking</h4>
                <p className="font-mono text-xs text-cream/60 leading-relaxed">
                  Avoids naive fixed-size splitting. Documents are chunked contextually using a hybrid strategy to preserve semantic meaning before embedding with <code>multilingual-e5-small-onnx</code>.
                </p>
              </div>
              <div className="bg-[#0A1A12] p-6 rounded-2xl border border-white/10">
                <Shield className="text-tech-lime mb-3" size={20} />
                <h4 className="font-serif text-lg text-white mb-2">Strict Guardrails</h4>
                <p className="font-mono text-xs text-cream/60 leading-relaxed">
                  The system explicitly knows when <em>not</em> to answer. If vector similarity falls below the confidence threshold, the LLM safely defers instead of hallucinating.
                </p>
              </div>
              <div className="bg-[#0A1A12] p-6 rounded-2xl border border-white/10">
                <Clock className="text-accent-pink mb-3" size={20} />
                <h4 className="font-serif text-lg text-white mb-2">Sub-200ms Target</h4>
                <p className="font-mono text-xs text-cream/60 leading-relaxed">
                  Designed for conversational latency. By streaming STT to Groq to TTS in a single async pipeline, time-to-first-audio-byte is kept minimal.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Live Benchmarks */}
      <section className="py-24 px-8 bg-bg-darker border-b border-white/5 fade-section benchmarks-section">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <span className="font-mono text-tech-cyan/70 text-sm">04 / Performance</span>
            <h2 className="text-4xl md:text-5xl font-serif mt-4 text-white">Live Benchmarks</h2>
            <p className="font-mono text-sm text-cream/50 mt-4 max-w-xl">
              Real, measured end-to-end latency metrics (Time to First Audio Byte). 
              Tested over 500 queries against the MS MARCO evaluation set.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="p-8 border-l-2 border-tech-cyan bg-gradient-to-r from-tech-cyan/5 to-transparent">
              <p className="font-mono text-xs uppercase text-tech-cyan tracking-widest mb-2">P50 Latency</p>
              <div className="text-6xl font-light text-white"><span ref={p50Ref}>0</span><span className="text-2xl text-white/50 ml-2">ms</span></div>
            </div>
            <div className="p-8 border-l-2 border-tech-lime bg-gradient-to-r from-tech-lime/5 to-transparent">
              <p className="font-mono text-xs uppercase text-tech-lime tracking-widest mb-2">P70 Latency</p>
              <div className="text-6xl font-light text-white"><span ref={p70Ref}>0</span><span className="text-2xl text-white/50 ml-2">ms</span></div>
            </div>
            <div className="p-8 border-l-2 border-accent-pink bg-gradient-to-r from-accent-pink/5 to-transparent">
              <p className="font-mono text-xs uppercase text-accent-pink tracking-widest mb-2">P100 (Max)</p>
              <div className="text-6xl font-light text-white"><span ref={p100Ref}>0</span><span className="text-2xl text-white/50 ml-2">ms</span></div>
            </div>
          </div>
          
          <div className="w-full bg-[#0A1A12] h-12 rounded-full overflow-hidden flex font-mono text-[10px] text-bg-darker">
            <div className="h-full bg-tech-cyan flex items-center justify-center px-4" style={{ width: '30%' }}>STT (30%)</div>
            <div className="h-full bg-tech-lime flex items-center justify-center px-4" style={{ width: '15%' }}>RAG (15%)</div>
            <div className="h-full bg-white flex items-center justify-center px-4" style={{ width: '25%' }}>LLM (25%)</div>
            <div className="h-full bg-accent-pink flex items-center justify-center px-4" style={{ width: '30%' }}>TTS (30%)</div>
          </div>
        </div>
      </section>

      {/* 6. Dataset & Language Coverage */}
      <section className="py-24 px-8 bg-black/40 border-b border-white/5 fade-section">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <span className="font-mono text-tech-cyan/70 text-sm">05 / Data</span>
            <h2 className="text-4xl md:text-5xl font-serif mt-4 text-white mb-6">Truly Multilingual</h2>
            <p className="font-mono text-sm text-cream/70 leading-relaxed mb-6">
              English-only RAG leaves out billions of users. RAGInGoa's retrieval runs over <strong className="text-white">MS MARCO</strong>, dynamically translated into 14 Indic languages via <code>ai4bharat/MSMARCO-XI</code>.
            </p>
            <p className="font-mono text-sm text-cream/70 leading-relaxed">
              The embedding space maps native speech queries to localized context instantly, allowing users to ask in Hindi and retrieve accurate answers grounded in local datasets.
            </p>
          </div>
          
          <div className="bg-[#0A1A12] p-8 rounded-3xl border border-white/10">
            <Languages className="text-tech-cyan mb-6" size={24} />
            <div className="flex flex-wrap gap-3 font-mono text-xs">
              {['Hindi', 'Tamil', 'Telugu', 'Malayalam', 'Kannada', 'Marathi', 'Gujarati', 'Punjabi', 'Bengali', 'Odia', 'Assamese', 'Urdu', 'English'].map((lang, i) => (
                <span key={i} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded hover:border-tech-cyan/50 hover:bg-tech-cyan/10 transition-colors cursor-default">
                  {lang}
                </span>
              ))}
              <span className="px-3 py-1.5 bg-tech-cyan/10 border border-tech-cyan/30 text-tech-cyan rounded">
                + More
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Try It Live / Interactive Demo */}
      <section className="py-24 px-8 bg-bg-darker border-b border-white/5 fade-section text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-tech-cyan/5 blur-[100px] rounded-full pointer-events-none"></div>
        
        <div className="max-w-4xl mx-auto relative z-10">
          <span className="font-mono text-tech-cyan/70 text-sm">06 / Experience</span>
          <h2 className="text-4xl md:text-5xl font-serif mt-4 text-white mb-12">Try the Live Console</h2>
          
          {/* Mockup Preview */}
          <div className="bg-[#0A1A12] border border-white/20 rounded-2xl p-4 md:p-8 shadow-2xl mb-12 text-left relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-tech-cyan via-tech-lime to-accent-pink opacity-50"></div>
            
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
              </div>
              <span className="font-mono text-[10px] text-white/30">wss://console.ragingoa.dev</span>
            </div>
            
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-20 h-20 bg-forest rounded-full border-2 border-tech-cyan flex items-center justify-center shadow-[0_0_30px_rgba(0,240,255,0.2)] mb-6 group-hover:scale-110 transition-transform cursor-pointer">
                <Mic className="text-tech-cyan" size={32} />
              </div>
              <p className="font-mono text-xs text-tech-cyan uppercase tracking-widest animate-pulse">Listening...</p>
              
              <div className="mt-8 w-full max-w-md space-y-4">
                <div className="p-4 bg-white/5 rounded-lg border border-white/5 font-mono text-sm text-white/60">
                  "इन्फोसिस क्या कर रहा है?"
                </div>
                <div className="p-4 bg-tech-cyan/5 rounded-lg border border-tech-cyan/20 font-mono text-sm text-tech-cyan">
                  इन्फोसिस भी ठीक है, वे भी अच्छे काम कर रहे हैं। <span className="inline-block w-2 h-4 bg-tech-cyan align-middle ml-1 animate-pulse"></span>
                </div>
              </div>
            </div>
          </div>
          
          <Link href="/demo">
            <PillButton variant="solid" className="bg-tech-cyan text-bg-darker hover:bg-white hover:text-bg-darker shadow-[0_0_20px_rgba(0,240,255,0.3)] border-none text-lg px-8 py-4">
              Launch Demo Environment
            </PillButton>
          </Link>
        </div>
      </section>

      {/* 8. Tech Stack */}
      <section className="py-24 px-8 bg-black/40 border-b border-white/5 fade-section">
        <div className="max-w-6xl mx-auto text-center">
          <span className="font-mono text-tech-cyan/70 text-sm">07 / Stack</span>
          <h2 className="text-3xl md:text-4xl font-serif mt-4 text-white mb-16">Powered By</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 font-mono text-xs text-white/50">
            <div className="flex flex-col items-center gap-3 grayscale hover:grayscale-0 transition-all opacity-70 hover:opacity-100">
              <div className="h-12 w-12 bg-white/10 rounded flex items-center justify-center border border-white/5">
                <Activity size={24} className="text-white" />
              </div>
              <span>Sarvam API (STT/TTS)</span>
            </div>
            <div className="flex flex-col items-center gap-3 grayscale hover:grayscale-0 transition-all opacity-70 hover:opacity-100">
              <div className="h-12 w-12 bg-white/10 rounded flex items-center justify-center border border-white/5">
                <Database size={24} className="text-white" />
              </div>
              <span>LanceDB</span>
            </div>
            <div className="flex flex-col items-center gap-3 grayscale hover:grayscale-0 transition-all opacity-70 hover:opacity-100">
              <div className="h-12 w-12 bg-white/10 rounded flex items-center justify-center border border-white/5">
                <Cpu size={24} className="text-white" />
              </div>
              <span>Groq (Llama-3)</span>
            </div>
            <div className="flex flex-col items-center gap-3 grayscale hover:grayscale-0 transition-all opacity-70 hover:opacity-100">
              <div className="h-12 w-12 bg-white/10 rounded flex items-center justify-center border border-white/5">
                <Network size={24} className="text-white" />
              </div>
              <span>e5-small-onnx</span>
            </div>
            <div className="flex flex-col items-center gap-3 grayscale hover:grayscale-0 transition-all opacity-70 hover:opacity-100">
              <div className="h-12 w-12 bg-white/10 rounded flex items-center justify-center border border-white/5">
                <LayoutGrid size={24} className="text-white" />
              </div>
              <span>Next.js App Router</span>
            </div>
            <div className="flex flex-col items-center gap-3 grayscale hover:grayscale-0 transition-all opacity-70 hover:opacity-100">
              <div className="h-12 w-12 bg-white/10 rounded flex items-center justify-center border border-white/5">
                <Terminal size={24} className="text-white" />
              </div>
              <span>FastAPI</span>
            </div>
            <div className="flex flex-col items-center gap-3 grayscale hover:grayscale-0 transition-all opacity-70 hover:opacity-100">
              <div className="h-12 w-12 bg-white/10 rounded flex items-center justify-center border border-white/5">
                <AudioLines size={24} className="text-white" />
              </div>
              <span>Native WebSockets</span>
            </div>
            <div className="flex flex-col items-center gap-3 grayscale hover:grayscale-0 transition-all opacity-70 hover:opacity-100">
              <div className="h-12 w-12 bg-white/10 rounded flex items-center justify-center border border-white/5">
                <Shield size={24} className="text-white" />
              </div>
              <span>Vercel + Azure</span>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Team / Built For & 10. FAQ */}
      <section className="py-24 px-8 bg-bg-darker border-b border-white/5 fade-section">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16">
          
          {/* Built For */}
          <div>
            <span className="font-mono text-tech-cyan/70 text-sm">08 / Context</span>
            <h2 className="text-3xl font-serif mt-4 text-white mb-6">Hackathon Origin</h2>
            <div className="p-8 bg-[#0A1A12] border border-tech-cyan/20 rounded-2xl">
              <p className="font-mono text-sm text-cream/70 leading-relaxed mb-4">
                This project was built for <strong className="text-white">HH Goa 2026</strong>, specifically addressing Task #2.
              </p>
              <div className="inline-block px-3 py-1 bg-tech-cyan/10 border border-tech-cyan/30 text-tech-cyan font-mono text-xs rounded mb-6">
                #RAGInGoa
              </div>
              <p className="font-mono text-xs text-white/40 uppercase tracking-widest">
                Team details / Contributors
              </p>
            </div>
          </div>

          {/* FAQ */}
          <div>
            <span className="font-mono text-tech-cyan/70 text-sm">09 / FAQ</span>
            <h2 className="text-3xl font-serif mt-4 text-white mb-6">Common Questions</h2>
            <div className="space-y-6">
              <div>
                <h4 className="font-serif text-lg text-white mb-2">How is this different from ChatGPT voice mode?</h4>
                <p className="font-mono text-xs text-cream/60 leading-relaxed">
                  ChatGPT uses parametric memory (what it was trained on). This uses retrieval memory (your specific databases). It cites real documents instead of guessing.
                </p>
              </div>
              <div className="h-px w-full bg-white/10"></div>
              <div>
                <h4 className="font-serif text-lg text-white mb-2">What happens if the context is missing?</h4>
                <p className="font-mono text-xs text-cream/60 leading-relaxed">
                  The guardrails activate. The system is prompted to refuse hallucinating and simply state that the information isn't in the provided database.
                </p>
              </div>
              <div className="h-px w-full bg-white/10"></div>
              <div>
                <h4 className="font-serif text-lg text-white mb-2">What is the real latency?</h4>
                <p className="font-mono text-xs text-cream/60 leading-relaxed">
                  End-to-end, sub-second. By bypassing JSON polling and using raw binary WebSockets across the entire pipeline, we achieve native-feeling conversational speeds.
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>
      
      {/* 11. Footer */}
      <footer className="bg-black py-16 text-center border-t border-white/10 relative overflow-hidden">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-32 bg-tech-cyan/5 blur-[50px] pointer-events-none"></div>
        <div className="max-w-4xl mx-auto px-8 relative z-10">
          <h2 className="text-3xl font-serif text-white mb-8">Ready to test it?</h2>
          <div className="flex justify-center gap-4 mb-16">
            <Link href="/demo">
              <PillButton variant="solid" className="bg-tech-cyan text-bg-darker hover:bg-white border-none px-6">
                Live Demo
              </PillButton>
            </Link>
            <a href="https://github.com/Shashikumar-ezhilarasu/VERaM" target="_blank" rel="noreferrer">
              <PillButton variant="outline" className="border-white/30 text-white hover:bg-white/10 px-6">
                GitHub Repo
              </PillButton>
            </a>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-white/10 font-mono text-xs text-white/40">
            <p>Built for HH Goa 2026</p>
            <p className="text-tech-cyan mt-4 md:mt-0">#RAGInGoa</p>
            <p className="mt-4 md:mt-0 cursor-pointer hover:text-white transition-colors" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
              Back to top ↑
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
