"use client";

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  Mic, Zap, Shield, Database, MessageSquare, 
  Terminal, Activity, LayoutGrid, Clock, 
  Languages, Cpu, Network, AudioLines, Code, ArrowRight,
  Sun, Palmtree, Waves, Plus, Minus
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const pipelineRef = useRef<HTMLDivElement>(null);
  
  // FAQ state
  const [openFaq, setOpenFaq] = useState<number | null>(0);

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
        y: 30,
        opacity: 0,
        stagger: 0.05,
        ease: 'power3.out',
        duration: 0.6
      });
    }

    tl.from('.hero-fade-up', {
      y: 20,
      opacity: 0,
      stagger: 0.1,
      ease: 'power2.out',
      duration: 0.6
    }, "-=0.4");
    
    // Audio waveform animation
    gsap.to('.audio-bar', {
      height: () => gsap.utils.random(20, 100) + '%',
      duration: 0.15,
      repeat: -1,
      yoyo: true,
      ease: 'none',
      stagger: 0.05
    });
    
    // Swaying palm trees
    gsap.to('.sway', {
      rotation: 3,
      transformOrigin: 'bottom center',
      duration: 4,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
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
      
      // Connecting progress line
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
    gsap.utils.toArray('.fade-section').forEach((section: HTMLElement) => {
      gsap.from(section, {
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 85%',
        }
      });
    });

  }, { scope: containerRef });

  const scrollToArchitecture = (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById('architecture')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div ref={containerRef} className="bg-hhgoa-green min-h-screen text-hhgoa-cream overflow-hidden selection:bg-hhgoa-yellow selection:text-hhgoa-green font-mono">
      
      {/* 1. Hero Section (Green) */}
      <section ref={heroRef} className="min-h-screen flex items-center justify-center p-8 relative border-b-4 border-hhgoa-yellow overflow-hidden">
        
        {/* Background Vector Art (Sun & Palms) */}
        <div className="absolute bottom-0 right-0 opacity-20 pointer-events-none sway">
          <Palmtree size={400} className="text-hhgoa-yellow translate-x-1/4 translate-y-1/4" strokeWidth={1} />
        </div>
        <div className="absolute top-10 right-20 opacity-10 pointer-events-none">
          <Sun size={600} className="text-hhgoa-yellow" strokeWidth={1} />
        </div>
        
        <div className="max-w-7xl w-full grid md:grid-cols-2 gap-16 items-center relative z-10">
          
          {/* Left: Copy */}
          <div className="z-10 text-hhgoa-cream order-2 md:order-1">
            <div className="hero-fade-up inline-block px-3 py-1 bg-hhgoa-green-dark border border-hhgoa-cream/20 mb-6">
              <p className="font-mono text-[10px] font-bold text-hhgoa-yellow tracking-widest uppercase">HH GOA 2026 / TASK 02</p>
            </div>
            
            <h1 ref={titleRef} className="text-6xl md:text-8xl font-serif font-bold uppercase tracking-tighter text-hhgoa-yellow mb-6 leading-[0.85] drop-shadow-[2px_2px_0_rgba(0,0,0,0.2)]">
              ASK ANYTHING.<br/>
              VOICE-ENABLED RAG.
            </h1>
            <p className="hero-fade-up font-mono text-sm text-hhgoa-cream/80 mb-10 leading-relaxed max-w-lg uppercase tracking-wide">
              No typing. No generic LLM fluff. Real-time voice capture streamed to a 
              custom retrieval-augmented generation pipeline, delivering cited answers.
            </p>
            
            <div className="hero-fade-up flex flex-wrap gap-4">
              <Link href="/demo">
                <button className="bg-hhgoa-yellow text-hhgoa-green font-serif font-black uppercase text-xl px-8 py-4 outline-dashed outline-2 outline-offset-[-6px] outline-hhgoa-green hover:bg-hhgoa-cream transition-colors">
                  Try the live demo
                </button>
              </Link>
              <button onClick={scrollToArchitecture} className="bg-hhgoa-green-dark text-hhgoa-yellow font-serif font-black uppercase text-xl px-8 py-4 border-2 border-hhgoa-yellow hover:bg-hhgoa-yellow hover:text-hhgoa-green transition-colors">
                View architecture
              </button>
            </div>
          </div>

          {/* Right: Technical/Voice Illustration */}
          <div className="relative flex items-center justify-center h-[500px] order-1 md:order-2">
            <div className="w-80 h-80 bg-hhgoa-green-dark rounded-full flex flex-col items-center justify-center relative border-4 border-hhgoa-yellow">
              <Mic size={80} className="text-hhgoa-yellow mb-6" strokeWidth={1.5} />
              {/* Hand-drawn style waveform bars */}
              <div className="flex gap-2 h-16 items-end justify-center w-48">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="audio-bar w-1.5 bg-hhgoa-pink rounded-t-sm" style={{ height: '20%' }}></div>
                ))}
              </div>
            </div>
            
            {/* Notice Board Tags */}
            <div className="absolute top-10 right-0 bg-hhgoa-cream p-4 z-20 border-2 border-hhgoa-green rotate-3">
              <div className="w-3 h-3 bg-hhgoa-pink rounded-full absolute -top-1.5 left-1/2 -translate-x-1/2"></div>
              <p className="text-[10px] text-hhgoa-green mb-1 uppercase font-bold tracking-widest">Target Latency</p>
              <div className="text-2xl text-hhgoa-green font-serif font-black">&lt; 200ms</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. The Problem (Cream) */}
      <section className="py-24 px-8 bg-hhgoa-cream border-b-4 border-hhgoa-green fade-section">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <span className="font-mono text-hhgoa-green font-bold tracking-widest uppercase text-xs">01 / The Problem</span>
            <h2 className="text-5xl font-serif font-black uppercase tracking-tight mt-4 text-hhgoa-green">Why Voice RAG?</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 bg-hhgoa-white border-2 border-hhgoa-green relative">
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-hhgoa-pink flex items-center justify-center mb-6">
                <Terminal className="text-hhgoa-pink" size={28} />
              </div>
              <h3 className="text-2xl font-serif font-black uppercase tracking-tight text-hhgoa-green mb-3">Typing is Friction</h3>
              <p className="font-mono text-xs text-hhgoa-green/80 leading-relaxed uppercase">
                Traditional RAG forces users into search boxes and chat interfaces. Voice is the highest-bandwidth input method.
              </p>
            </div>
            <div className="p-8 bg-hhgoa-white border-2 border-hhgoa-green relative">
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-hhgoa-pink flex items-center justify-center mb-6">
                <MessageSquare className="text-hhgoa-pink" size={28} />
              </div>
              <h3 className="text-2xl font-serif font-black uppercase tracking-tight text-hhgoa-green mb-3">Generic Answers</h3>
              <p className="font-mono text-xs text-hhgoa-green/80 leading-relaxed uppercase">
                Standard voice assistants (like Siri or base LLMs) lack domain-specific ground truth. They hallucinate when they don't know.
              </p>
            </div>
            <div className="p-8 bg-hhgoa-white border-2 border-hhgoa-green relative">
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-hhgoa-pink flex items-center justify-center mb-6">
                <Shield className="text-hhgoa-pink" size={28} />
              </div>
              <h3 className="text-2xl font-serif font-black uppercase tracking-tight text-hhgoa-green mb-3">Not Grounded</h3>
              <p className="font-mono text-xs text-hhgoa-green/80 leading-relaxed uppercase">
                Most voice AI tools aren't built on strict retrieval pipelines. We bridge native speech directly into vector search.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. How It Works (Pipeline) (Green) */}
      <section ref={pipelineRef} className="h-screen bg-hhgoa-green flex flex-col justify-center overflow-hidden border-b-4 border-hhgoa-yellow relative">
        <div className="absolute top-0 right-0 opacity-10 pointer-events-none sway">
          <Palmtree size={600} className="text-hhgoa-yellow transform translate-x-1/4 -translate-y-1/4" strokeWidth={1} />
        </div>
        
        <div className="max-w-6xl mx-auto w-full px-8 mb-16 relative z-10">
          <span className="inline-block px-3 py-1 bg-hhgoa-yellow text-hhgoa-green font-mono font-bold tracking-widest uppercase text-xs mb-4">
            02 / THE PIPELINE
          </span>
          <h2 className="text-5xl font-serif font-black uppercase tracking-tight text-hhgoa-yellow">How It Works</h2>
        </div>
        
        <div className="relative">
          {/* Connecting Line */}
          <div className="absolute top-1/2 left-0 w-full h-1 bg-hhgoa-green-dark -translate-y-1/2 hidden md:block"></div>
          {/* Progress Line */}
          <div className="pipeline-progress-line absolute top-1/2 left-0 w-0 h-1 bg-hhgoa-pink -translate-y-1/2 hidden md:block"></div>

          <div className="flex w-[200vw] px-8 gap-8 relative z-10 items-center">
            {[
              { step: "DAY 01", title: "Speak", icon: Mic, desc: "Raw PCM audio is captured and streamed over WebSockets.", tech: "Browser AudioWorklet" },
              { step: "DAY 02", title: "Transcribe", icon: MessageSquare, desc: "Sub-second STT converts audio frames to streaming text.", tech: "STT: Sarvam API" },
              { step: "DAY 03", title: "Retrieve", icon: Database, desc: "Vector similarity search finds grounded context.", tech: "Vector DB: LanceDB" },
              { step: "DAY 04", title: "Generate", icon: Zap, desc: "LLM synthesizes the answer with strict guardrails.", tech: "LLM: Groq (Llama-3)" },
              { step: "DAY 05", title: "Answer", icon: AudioLines, desc: "Audio tokens stream back to the UI in real-time.", tech: "TTS: Sarvam Audio" }
            ].map((item, idx) => (
              <div key={idx} className="pipeline-card w-96 shrink-0 bg-hhgoa-cream p-8 border-4 border-hhgoa-green relative group">
                <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-5 h-5 bg-hhgoa-yellow border-2 border-hhgoa-green rounded-full group-hover:bg-hhgoa-pink transition-colors hidden md:block z-20"></div>
                
                <div className="inline-block px-2 py-1 bg-hhgoa-pink text-hhgoa-white font-mono text-[10px] uppercase font-bold tracking-widest mb-6">
                  {item.step}
                </div>
                
                <h3 className="text-3xl font-serif font-black uppercase tracking-tight mb-3 text-hhgoa-green">{item.title}</h3>
                <p className="font-mono text-xs uppercase text-hhgoa-green/70 leading-relaxed mb-6 h-12">{item.desc}</p>
                <div className="pt-4 border-t-2 border-dashed border-hhgoa-green/20 flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-widest font-bold text-hhgoa-green">{item.tech}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Architecture Deep Dive (Cream) */}
      <section id="architecture" className="py-24 px-8 bg-hhgoa-cream border-b-4 border-hhgoa-green fade-section relative">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <span className="font-mono text-hhgoa-green font-bold tracking-widest uppercase text-xs">03 / Infrastructure</span>
            <h2 className="text-5xl font-serif font-black uppercase tracking-tight mt-4 text-hhgoa-green">Architecture Deep Dive</h2>
          </div>
          
          <div className="grid md:grid-cols-12 gap-12">
            {/* Diagram Area */}
            <div className="md:col-span-7 bg-hhgoa-white border-2 border-hhgoa-green p-8 relative overflow-hidden">
              <div className="flex flex-col gap-8 relative z-10">
                
                {/* Client Tier */}
                <div className="flex items-center gap-4">
                  <div className="w-32 py-4 px-4 bg-hhgoa-yellow border-2 border-hhgoa-green text-center text-hhgoa-green font-serif font-black uppercase text-sm">
                    Client Browser
                  </div>
                  <div className="flex-1 border-t-2 border-dashed border-hhgoa-green relative">
                    <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[10px] text-hhgoa-green bg-hhgoa-white px-2 font-mono font-bold uppercase tracking-wider">WebSocket Audio Stream</span>
                    <ArrowRight className="absolute -right-2 -top-3 text-hhgoa-green" size={24} />
                  </div>
                </div>

                {/* Processing Tier */}
                <div className="grid grid-cols-3 gap-4 pl-16">
                  <div className="col-span-3 border-l-2 border-b-2 border-dashed border-hhgoa-green pl-8 pb-8 -ml-8 -mt-4 relative">
                    <span className="absolute bottom-2 left-2 text-[10px] text-hhgoa-green/50 font-mono font-bold uppercase tracking-wider">FastAPI Server</span>
                  </div>
                  
                  <div className="p-4 bg-hhgoa-green text-hhgoa-yellow border-2 border-hhgoa-green text-center flex flex-col items-center">
                    <Activity size={24} className="mb-2" />
                    <span className="font-mono font-bold text-[10px] uppercase">Sarvam STT</span>
                  </div>
                  
                  <div className="p-4 flex flex-col justify-center">
                    <ArrowRight size={24} className="mx-auto text-hhgoa-green" />
                  </div>
                  
                  <div className="p-4 bg-hhgoa-green text-hhgoa-yellow border-2 border-hhgoa-green text-center flex flex-col items-center">
                    <Database size={24} className="mb-2" />
                    <span className="font-mono font-bold text-[10px] uppercase">LanceDB</span>
                  </div>
                  
                  <div className="col-span-3 flex justify-center py-2">
                    <ArrowRight size={24} className="text-hhgoa-pink rotate-90" />
                  </div>
                  
                  <div className="col-span-3 p-4 bg-hhgoa-pink text-hhgoa-white border-2 border-hhgoa-green text-center flex flex-col items-center">
                    <Cpu size={24} className="mb-2" />
                    <span className="font-mono font-bold text-xs uppercase tracking-widest">Groq LLM + Guardrails</span>
                  </div>
                </div>

                {/* Return Tier */}
                <div className="flex items-center gap-4 flex-row-reverse">
                  <div className="w-32 py-4 px-4 bg-hhgoa-yellow border-2 border-hhgoa-green text-center text-hhgoa-green font-serif font-black uppercase text-sm">
                    Sarvam TTS
                  </div>
                  <div className="flex-1 border-t-2 border-dashed border-hhgoa-green relative">
                    <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[10px] text-hhgoa-green bg-hhgoa-white px-2 font-mono font-bold uppercase tracking-wider">Stream Response</span>
                    <ArrowRight className="absolute -left-2 -top-3 text-hhgoa-green rotate-180" size={24} />
                  </div>
                  <div className="w-32 py-4 px-4 bg-hhgoa-cream border-2 border-hhgoa-green border-dashed text-center text-hhgoa-green font-serif font-black uppercase text-sm">
                    Client Browser
                  </div>
                </div>

              </div>
            </div>

            {/* Callouts */}
            <div className="md:col-span-5 flex flex-col gap-6 justify-center">
              <div className="bg-hhgoa-white p-6 border-2 border-hhgoa-green flex gap-4">
                <div className="text-hhgoa-pink shrink-0">
                  <Code size={24} />
                </div>
                <div>
                  <h4 className="font-serif font-black uppercase text-hhgoa-green mb-1 text-xl">Smart Chunking</h4>
                  <p className="font-mono text-xs uppercase text-hhgoa-green/70 leading-relaxed">
                    Chunking strategy is multi-method, not naive fixed-size splitting. Embedded with e5-small-onnx.
                  </p>
                </div>
              </div>
              
              <div className="bg-hhgoa-white p-6 border-2 border-hhgoa-green flex gap-4">
                <div className="text-hhgoa-pink shrink-0">
                  <Shield size={24} />
                </div>
                <div>
                  <h4 className="font-serif font-black uppercase text-hhgoa-green mb-1 text-xl">Strict Guardrails</h4>
                  <p className="font-mono text-xs uppercase text-hhgoa-green/70 leading-relaxed">
                    The system explicitly knows when not to answer rather than hallucinating based on vector similarity thresholds.
                  </p>
                </div>
              </div>
              
              <div className="bg-hhgoa-white p-6 border-2 border-hhgoa-green flex gap-4">
                <div className="text-hhgoa-pink shrink-0">
                  <Clock size={24} />
                </div>
                <div>
                  <h4 className="font-serif font-black uppercase text-hhgoa-green mb-1 text-xl">Sub-200ms Target</h4>
                  <p className="font-mono text-xs uppercase text-hhgoa-green/70 leading-relaxed">
                    Fast, async execution from STT to LLM to TTS keeps latency budget incredibly tight for native-feeling conversation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Live Benchmarks (Green) */}
      <section className="py-24 px-8 bg-hhgoa-green border-b-4 border-hhgoa-yellow fade-section benchmarks-section">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <span className="inline-block px-3 py-1 bg-hhgoa-yellow text-hhgoa-green font-mono font-bold tracking-widest uppercase text-xs mb-4">
              04 / PERFORMANCE
            </span>
            <h2 className="text-5xl font-serif font-black uppercase tracking-tight mt-4 text-hhgoa-yellow">Live Benchmarks</h2>
            <p className="font-mono text-sm text-hhgoa-cream/70 mt-4 max-w-xl uppercase tracking-wide">
              Real, measured numbers. Not marketing fluff. Tested over 500 queries against the MS MARCO dataset.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-0 max-w-3xl mx-auto mb-16 relative">
            {/* The Signpost Pole */}
            <div className="absolute left-1/2 -translate-x-1/2 top-0 w-4 h-full bg-hhgoa-green-dark border-x-2 border-hhgoa-yellow z-0 hidden md:block"></div>
            
            <div className="md:col-span-3 flex justify-center mb-6 z-10">
              <div className="bg-hhgoa-yellow py-6 px-12 border-4 border-hhgoa-green shadow-[8px_8px_0_rgba(0,0,0,0.3)] relative w-full md:w-[600px] hover:translate-x-2 transition-transform" style={{ clipPath: 'polygon(0% 0%, 90% 0%, 100% 50%, 90% 100%, 0% 100%)' }}>
                <p className="font-mono text-[10px] uppercase font-bold tracking-widest text-hhgoa-green mb-2">P50 Latency</p>
                <div className="text-7xl font-serif font-black text-hhgoa-green"><span ref={p50Ref}>0</span><span className="text-2xl ml-2">ms</span></div>
              </div>
            </div>
            
            <div className="md:col-span-3 flex justify-center mb-6 z-10">
              <div className="bg-hhgoa-pink py-6 px-12 border-4 border-hhgoa-green shadow-[8px_8px_0_rgba(0,0,0,0.3)] relative w-full md:w-[650px] hover:-translate-x-2 transition-transform" style={{ clipPath: 'polygon(10% 0%, 100% 0%, 100% 100%, 10% 100%, 0% 50%)' }}>
                <p className="font-mono text-[10px] uppercase font-bold tracking-widest text-hhgoa-white mb-2 text-right">P70 Latency</p>
                <div className="text-7xl font-serif font-black text-hhgoa-white text-right"><span ref={p70Ref}>0</span><span className="text-2xl ml-2">ms</span></div>
              </div>
            </div>
            
            <div className="md:col-span-3 flex justify-center z-10">
              <div className="bg-hhgoa-yellow py-6 px-12 border-4 border-hhgoa-green shadow-[8px_8px_0_rgba(0,0,0,0.3)] relative w-full md:w-[700px] hover:translate-x-2 transition-transform" style={{ clipPath: 'polygon(0% 0%, 90% 0%, 100% 50%, 90% 100%, 0% 100%)' }}>
                <p className="font-mono text-[10px] uppercase font-bold tracking-widest text-hhgoa-green mb-2">P100 (Max) Latency</p>
                <div className="text-7xl font-serif font-black text-hhgoa-green"><span ref={p100Ref}>0</span><span className="text-2xl ml-2">ms</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Dataset & Language Coverage (Cream) */}
      <section className="py-24 px-8 bg-hhgoa-cream border-b-4 border-hhgoa-green fade-section relative overflow-hidden">
        {/* Ocean Waves Squiggle */}
        <div className="absolute top-10 left-10 opacity-20 pointer-events-none">
          <Waves size={300} className="text-hhgoa-green" strokeWidth={1} />
        </div>

        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center relative z-10">
          <div>
            <span className="font-mono text-hhgoa-green font-bold tracking-widest uppercase text-xs">05 / Data</span>
            <h2 className="text-5xl font-serif font-black uppercase tracking-tight mt-4 text-hhgoa-green mb-6">Truly Multilingual</h2>
            <p className="font-mono text-sm uppercase text-hhgoa-green/80 leading-relaxed mb-6">
              English-only RAG leaves out billions of users. Retrieval runs over <strong className="text-hhgoa-pink">MS MARCO</strong>, dynamically translated into 14 Indic languages via ai4bharat/MSMARCO-XI.
            </p>
          </div>
          
          <div className="bg-hhgoa-white p-8 border-2 border-hhgoa-green relative">
            {/* Pushpin */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-hhgoa-pink rounded-full border-2 border-hhgoa-green shadow-sm"></div>
            
            <Languages className="text-hhgoa-pink mb-6" size={32} />
            <div className="flex flex-wrap gap-2 font-mono text-xs uppercase font-bold tracking-widest">
              {['Hindi', 'Tamil', 'Telugu', 'Malayalam', 'Kannada', 'Marathi', 'Gujarati', 'Punjabi', 'Bengali', 'Odia', 'Assamese', 'Urdu', 'English'].map((lang, i) => (
                <span key={i} className="px-3 py-2 bg-hhgoa-cream border border-hhgoa-green text-hhgoa-green">
                  {lang}
                </span>
              ))}
              <span className="px-3 py-2 bg-hhgoa-pink text-hhgoa-white border border-hhgoa-green">
                + MORE
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Try It Live / Interactive Demo (Green) */}
      <section className="py-24 px-8 bg-hhgoa-green border-b-4 border-hhgoa-yellow fade-section text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10">
          <span className="inline-block px-3 py-1 bg-hhgoa-yellow text-hhgoa-green font-mono font-bold tracking-widest uppercase text-xs mb-4">
            06 / EXPERIENCE
          </span>
          <h2 className="text-5xl font-serif font-black uppercase tracking-tight text-hhgoa-yellow mb-12">Try the Live Console</h2>
          
          {/* Mockup Preview */}
          <div className="bg-hhgoa-cream border-4 border-hhgoa-yellow p-4 md:p-8 mb-12 text-left relative overflow-hidden">
            <div className="flex items-center justify-between border-b-2 border-hhgoa-green pb-4 mb-6">
              <div className="flex gap-2">
                <div className="w-4 h-4 bg-hhgoa-green border border-hhgoa-green-dark"></div>
                <div className="w-4 h-4 bg-hhgoa-yellow border border-hhgoa-green-dark"></div>
                <div className="w-4 h-4 bg-hhgoa-pink border border-hhgoa-green-dark"></div>
              </div>
              <span className="font-mono font-bold text-[10px] text-hhgoa-green uppercase tracking-widest">RAGInGoa.exe</span>
            </div>
            
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-24 h-24 bg-hhgoa-yellow border-4 border-hhgoa-green flex items-center justify-center mb-6 cursor-pointer hover:bg-hhgoa-white transition-colors">
                <Mic className="text-hhgoa-green" size={40} />
              </div>
              <p className="font-mono font-bold text-xs text-hhgoa-green uppercase tracking-widest animate-pulse">Listening...</p>
              
              <div className="mt-8 w-full max-w-md space-y-4">
                <div className="p-4 bg-hhgoa-white border-2 border-hhgoa-green font-mono text-sm text-hhgoa-green/60">
                  "इन्फोसिस क्या कर रहा है?"
                </div>
                <div className="p-4 bg-hhgoa-green text-hhgoa-yellow border-2 border-hhgoa-green font-mono text-sm font-bold shadow-[4px_4px_0_rgba(236,72,153,1)]">
                  इन्फोसिस भी ठीक है, वे भी अच्छे काम कर रहे हैं। <span className="inline-block w-2 h-4 bg-hhgoa-yellow align-middle ml-1 animate-pulse"></span>
                </div>
              </div>
            </div>
          </div>
          
          <Link href="/demo">
            <button className="bg-hhgoa-yellow text-hhgoa-green font-serif font-black uppercase text-2xl px-12 py-6 outline-dashed outline-2 outline-offset-[-6px] outline-hhgoa-green hover:bg-hhgoa-cream transition-colors shadow-[8px_8px_0_rgba(0,0,0,0.3)]">
              Launch Demo
            </button>
          </Link>
        </div>
      </section>

      {/* 8. Tech Stack (Cream) */}
      <section className="py-24 px-8 bg-hhgoa-cream border-b-4 border-hhgoa-green fade-section">
        <div className="max-w-6xl mx-auto text-center">
          <span className="font-mono text-hhgoa-green font-bold tracking-widest uppercase text-xs">07 / STACK</span>
          <h2 className="text-4xl md:text-5xl font-serif font-black uppercase tracking-tight mt-4 text-hhgoa-green mb-16">Powered By</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 font-mono font-bold text-xs text-hhgoa-green uppercase tracking-widest">
            <div className="flex flex-col items-center gap-4">
              <div className="h-20 w-20 bg-hhgoa-green rounded-full flex items-center justify-center text-hhgoa-yellow border-4 border-hhgoa-yellow">
                <Activity size={32} />
              </div>
              <span>Sarvam API</span>
            </div>
            <div className="flex flex-col items-center gap-4">
              <div className="h-20 w-20 bg-hhgoa-green rounded-full flex items-center justify-center text-hhgoa-yellow border-4 border-hhgoa-yellow">
                <Database size={32} />
              </div>
              <span>LanceDB</span>
            </div>
            <div className="flex flex-col items-center gap-4">
              <div className="h-20 w-20 bg-hhgoa-green rounded-full flex items-center justify-center text-hhgoa-yellow border-4 border-hhgoa-yellow">
                <Cpu size={32} />
              </div>
              <span>Groq LLM</span>
            </div>
            <div className="flex flex-col items-center gap-4">
              <div className="h-20 w-20 bg-hhgoa-green rounded-full flex items-center justify-center text-hhgoa-yellow border-4 border-hhgoa-yellow">
                <Network size={32} />
              </div>
              <span>e5-small-onnx</span>
            </div>
            <div className="flex flex-col items-center gap-4">
              <div className="h-20 w-20 bg-hhgoa-green rounded-full flex items-center justify-center text-hhgoa-yellow border-4 border-hhgoa-yellow">
                <LayoutGrid size={32} />
              </div>
              <span>Next.js App</span>
            </div>
            <div className="flex flex-col items-center gap-4">
              <div className="h-20 w-20 bg-hhgoa-green rounded-full flex items-center justify-center text-hhgoa-yellow border-4 border-hhgoa-yellow">
                <Terminal size={32} />
              </div>
              <span>FastAPI</span>
            </div>
            <div className="flex flex-col items-center gap-4">
              <div className="h-20 w-20 bg-hhgoa-green rounded-full flex items-center justify-center text-hhgoa-yellow border-4 border-hhgoa-yellow">
                <AudioLines size={32} />
              </div>
              <span>WebSockets</span>
            </div>
            <div className="flex flex-col items-center gap-4">
              <div className="h-20 w-20 bg-hhgoa-green rounded-full flex items-center justify-center text-hhgoa-yellow border-4 border-hhgoa-yellow">
                <Shield size={32} />
              </div>
              <span>Vercel + Azure</span>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Team & 10. FAQ (Green & Cream) */}
      <section className="bg-hhgoa-green border-b-4 border-hhgoa-yellow fade-section">
        <div className="grid md:grid-cols-2">
          
          {/* Built For (Notice Board style on Green) */}
          <div className="p-16 flex flex-col justify-center items-center relative min-h-[500px]">
            <span className="absolute top-8 left-8 inline-block px-3 py-1 bg-hhgoa-yellow text-hhgoa-green font-mono font-bold tracking-widest uppercase text-xs">
              08 / CONTEXT
            </span>
            
            <div className="bg-hhgoa-cream p-10 border-2 border-hhgoa-green shadow-[8px_8px_0_rgba(0,0,0,0.3)] rotate-3 relative max-w-md w-full">
              {/* Pushpin */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-hhgoa-pink rounded-full border-2 border-hhgoa-green shadow-sm"></div>
              
              <h2 className="text-4xl font-serif font-black uppercase tracking-tight text-hhgoa-green mb-6 text-center">Hackathon Origin</h2>
              <p className="font-mono text-xs uppercase text-hhgoa-green/80 leading-relaxed mb-6 text-center font-bold">
                Built for <strong className="text-hhgoa-pink">HH Goa 2026</strong>, Task #2. Developers who live in their terminals. No fluff, no useless networking.
              </p>
              <div className="flex justify-center">
                <div className="inline-block px-4 py-2 bg-hhgoa-pink text-hhgoa-white font-mono font-bold text-xs uppercase tracking-widest border-2 border-hhgoa-green">
                  #RAGInGoa
                </div>
              </div>
            </div>
          </div>

          {/* FAQ (Cream Accordion) */}
          <div className="bg-hhgoa-cream p-16 border-l-4 border-hhgoa-yellow">
            <span className="font-mono text-hhgoa-green font-bold tracking-widest uppercase text-xs">09 / FAQ</span>
            <h2 className="text-4xl font-serif font-black uppercase tracking-tight text-hhgoa-green mt-4 mb-10">Common Questions</h2>
            
            <div className="space-y-0">
              {[
                { q: "How is this different from ChatGPT voice?", a: "ChatGPT uses parametric memory. This uses retrieval memory (your specific databases). It cites real documents instead of guessing." },
                { q: "What happens if context is missing?", a: "The guardrails activate. The system explicitly refuses to hallucinate and simply states that the information isn't in the database." },
                { q: "What is the real latency?", a: "End-to-end, sub-second. By bypassing JSON polling and using raw binary WebSockets across the entire pipeline, we achieve native-feeling conversational speeds." }
              ].map((faq, i) => (
                <div key={i} className="border-t-2 border-hhgoa-green">
                  <button 
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full py-6 flex items-center justify-between text-left group"
                  >
                    <span className="font-serif font-black uppercase text-xl text-hhgoa-green">{faq.q}</span>
                    {openFaq === i ? <Minus size={24} className="text-hhgoa-pink" /> : <Plus size={24} className="text-hhgoa-green group-hover:text-hhgoa-pink transition-colors" />}
                  </button>
                  {openFaq === i && (
                    <div className="pb-6 px-4 bg-hhgoa-green text-hhgoa-cream p-4 font-mono text-xs uppercase tracking-wider leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                  {i < 2 && <div className="text-center text-hhgoa-pink tracking-[1em] text-xs py-2">✦ ✦ ✦</div>}
                </div>
              ))}
              <div className="border-t-2 border-hhgoa-green"></div>
            </div>
          </div>

        </div>
      </section>
      
      {/* 11. Footer (Green) */}
      <footer className="bg-hhgoa-green-dark py-20 text-center relative overflow-hidden">
        {/* Palm tree silhouettes in footer matching HH Goa */}
        <div className="absolute bottom-0 left-10 opacity-30 pointer-events-none sway">
          <Palmtree size={250} className="text-hhgoa-green" strokeWidth={1} />
        </div>
        <div className="absolute bottom-0 right-10 opacity-30 pointer-events-none sway" style={{ animationDelay: '-2s' }}>
          <Palmtree size={200} className="text-hhgoa-green" strokeWidth={1} />
        </div>
        
        <div className="max-w-4xl mx-auto px-8 relative z-10">
          <h2 className="text-6xl font-serif font-black uppercase tracking-tighter text-hhgoa-yellow mb-12">READY TO TEST IT?</h2>
          <div className="flex justify-center gap-6 mb-20 font-mono font-bold uppercase tracking-widest text-sm">
            <Link href="/demo">
              <button className="bg-hhgoa-yellow text-hhgoa-green font-serif font-black uppercase text-xl px-8 py-4 outline-dashed outline-2 outline-offset-[-4px] outline-hhgoa-green hover:bg-hhgoa-cream transition-colors">
                Live Demo
              </button>
            </Link>
            <a href="https://github.com/Shashikumar-ezhilarasu/VERaM" target="_blank" rel="noreferrer">
              <button className="bg-hhgoa-green text-hhgoa-yellow font-serif font-black uppercase text-xl px-8 py-4 border-2 border-hhgoa-yellow hover:bg-hhgoa-yellow hover:text-hhgoa-green transition-colors">
                GitHub Repo
              </button>
            </a>
          </div>
          
          <div className="flex flex-col items-center justify-center pt-8 font-mono font-bold text-[10px] text-hhgoa-cream uppercase tracking-widest space-y-4">
            <p className="border-b border-hhgoa-yellow/50 pb-2">GOA, INDIA · 28–31 OCT 2026</p>
            <p className="text-hhgoa-pink text-sm">#RAGInGoa</p>
            <p className="cursor-pointer hover:text-hhgoa-yellow transition-colors pt-4" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
              BACK TO TOP ↑
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
