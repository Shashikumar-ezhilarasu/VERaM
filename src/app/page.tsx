"use client";

import React, { useRef } from 'react';
import Link from 'next/link';
import { PillButton } from '@/components/ui/PillButton';
import { DashedCircle } from '@/components/ui/DashedCircle';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Mic, ArrowRight, Zap, Shield, Database, MessageSquare } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const circleRef = useRef<HTMLDivElement>(null);
  const pipelineRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Hero Entrance
    const tl = gsap.timeline();
    
    // Animate title
    if (titleRef.current) {
      // Simple word split for staggered reveal
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

    // Continuous idle animation for the circle
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
    
    // Pipeline ScrollTrigger
    if (pipelineRef.current) {
      const cards = gsap.utils.toArray('.pipeline-card');
      
      gsap.to(cards, {
        xPercent: -100 * (cards.length - 1),
        ease: "none",
        scrollTrigger: {
          trigger: pipelineRef.current,
          pin: true,
          scrub: 1,
          end: () => "+=" + pipelineRef.current?.offsetWidth
        }
      });
    }

  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="bg-forest min-h-screen text-ink-green overflow-hidden">
      {/* 1. Hero Section */}
      <section ref={heroRef} className="min-h-screen flex items-center justify-center p-8 relative">
        <div className="max-w-6xl w-full grid md:grid-cols-2 gap-12 items-center">
          
          {/* Left: Illustration */}
          <div className="relative flex items-center justify-center h-96" ref={circleRef}>
            <DashedCircle size={400} className="hero-dashed-ring absolute opacity-50" />
            <div className="hero-solid-circle w-64 h-64 bg-ink-green rounded-full flex items-center justify-center shadow-2xl z-10 relative">
              <Mic size={80} className="text-accent-pink" />
              {/* Yellow badge */}
              <div className="absolute -top-4 -right-4 w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-xl">✦</span>
              </div>
            </div>
            
            {/* Tilted card */}
            <div className="absolute -bottom-8 -left-8 bg-cream p-4 rounded-xl shadow-xl transform -rotate-6 z-20 border-2 border-ink-green">
              <p className="font-mono text-xs font-bold text-accent-pink tracking-widest mb-2">ASK ANYTHING</p>
              <div className="flex gap-1 items-end h-8">
                {[1, 2, 3, 2, 1].map((h, i) => (
                  <div key={i} className="w-2 bg-ink-green" style={{ height: `${h * 20}%` }} />
                ))}
              </div>
            </div>
          </div>

          {/* Right: Copy */}
          <div className="z-10 text-cream">
            <p className="hero-fade-up font-mono text-xs font-bold text-accent-pink tracking-[0.2em] mb-4">VOICE-ENABLED RAG</p>
            <h1 ref={titleRef} className="text-5xl md:text-7xl font-serif text-cream mb-6 leading-tight">
              Speak a question. Get a grounded answer.
            </h1>
            <p className="hero-fade-up font-mono text-lg text-cream/70 mb-8 leading-relaxed max-w-lg">
              No typing. No generic LLM fluff. Real-time voice capture streamed to a 
              custom retrieval-augmented generation pipeline, delivering cited answers in under a second.
            </p>
            
            <div className="hero-fade-up flex flex-wrap gap-4">
              <Link href="/demo">
                <PillButton variant="solid">Try the live demo</PillButton>
              </Link>
              <PillButton variant="outline" className="text-cream border-cream hover:bg-cream hover:text-forest">
                View architecture
              </PillButton>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Pipeline Section */}
      <section ref={pipelineRef} className="h-screen bg-cream flex flex-col justify-center overflow-hidden">
        <div className="max-w-6xl mx-auto w-full px-8 mb-12">
          <p className="font-mono text-xs font-bold text-accent-pink tracking-[0.2em] mb-4">HOW IT WORKS</p>
          <h2 className="text-4xl font-serif text-ink-green">The Pipeline</h2>
        </div>
        
        <div className="flex w-[200vw] px-8 gap-8">
          {[
            { step: "01", title: "Speak", icon: Mic, desc: "Raw PCM audio is captured and streamed over WebSockets." },
            { step: "02", title: "Transcribe", icon: MessageSquare, desc: "Sub-second STT converts audio frames to streaming text." },
            { step: "03", title: "Retrieve", icon: Database, desc: "Vector similarity search finds grounded context." },
            { step: "04", title: "Generate", icon: Zap, desc: "LLM synthesizes the answer with strict guardrails." },
            { step: "05", title: "Answer", icon: Shield, desc: "Tokens stream back to the UI in real-time." }
          ].map((item, idx) => (
            <div key={idx} className="pipeline-card w-100 shrink-0 bg-forest/5 p-8 rounded-3xl border border-ink-green/10">
              <div className="w-12 h-12 bg-accent-pink-soft rounded-full flex items-center justify-center mb-6">
                <span className="font-mono font-bold text-accent-pink">{item.step}</span>
              </div>
              <item.icon size={32} className="text-ink-green mb-6" />
              <h3 className="text-2xl font-serif mb-4 text-ink-green">{item.title}</h3>
              <p className="font-mono text-ink-muted leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
      
      {/* Simple Footer */}
      <footer className="bg-forest py-12 text-center text-cream">
        <p className="font-mono text-accent-pink tracking-[0.2em] mb-4">#RAGInGoa</p>
        <Link href="/demo">
          <PillButton variant="solid">Try the live demo</PillButton>
        </Link>
      </footer>
    </div>
  );
}
