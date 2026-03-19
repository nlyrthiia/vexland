import FadeInVisible from '@/components/Animations/FadeInVisible';
import IntroduceWallet from '@/components/Home/IntroduceWallet';
import SimplifyCommands from '@/components/Home/SimplifyCommands';
import SimplifySection from '@/components/Home/SimplifyJourney';
import WhatNext from '@/components/Home/WhatNext';
import About from '@/components/Home/About';
import '@/styles/landing.css';
import { useNavigate } from 'react-router-dom';
import { useRef } from 'react';

export default function Landing() {
  const navigate = useNavigate();

  // Refs for each section
  const aboutRef = useRef<HTMLDivElement>(null);
  const howToPlayRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const roadmapRef = useRef<HTMLDivElement>(null);


  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#000000] relative">
      <div className="absolute inset-0 w-full h-full">
        <img src="/all_bg.png" alt="Background" className="w-full h-full object-cover" />
      </div>
      <div className="relative w-full h-full z-1">
        {/* Header */}
        <div className="h-[92px] bg-[#111318] w-screen fixed top-0 left-0 z-50 no-select">
          <div className="max-w-desktop h-full m-auto flex justify-between items-center px-4 md:px-10">
            <div className="flex items-center gap-3">
              <img src="/vexland-logo.png" alt="VexLand Logo" className="w-8 h-8 rounded-[8px]" />
              <p className="text-[16px] md:text-[18px] text-white">VexLand</p>
            </div>
            <div className="flex items-center">
              <div className="hidden md:flex gap-8 mr-4">
                <p
                  onClick={() => scrollToSection(aboutRef)}
                  className="text-[14px] cursor-pointer hover:opacity-80 transition-all text-white"
                >
                  About
                </p>
                <p
                  onClick={() => scrollToSection(howToPlayRef)}
                  className="text-[14px] cursor-pointer hover:opacity-80 transition-all text-white"
                >
                  How to Play
                </p>
                <p
                  onClick={() => scrollToSection(roadmapRef)}
                  className="text-[14px] cursor-pointer hover:opacity-80 transition-all text-white"
                >
                  Future Plans
                </p>
                <div className="relative group">
                  <p className="text-[14px] cursor-pointer hover:opacity-80 transition-all text-white flex items-center gap-1">
                    More
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </p>
                  <div className="absolute top-full right-0 bg-[#111318] rounded-[12px] shadow-lg py-2 min-w-[120px] hidden group-hover:block hover:block translate-y-[-2px]">
                    <p
                      onClick={() => scrollToSection(featuresRef)}
                      className="px-4 py-2 text-[14px] cursor-pointer hover:bg-white/10 transition-all text-white"
                    >
                      Features
                    </p>

                  </div>
                </div>
              </div>
              <div className="scale-75">
                <button onClick={() => navigate('/game')} className="cyberpunk-btn-wrapper inline-block scale-90">
                  <button className="cyberpunk-btn">
                    <span className="cyberpunk-btn-content text-[14px] md:text-[16px]">Let's play</span>
                  </button>
                </button>
              </div>
              <div className="md:hidden flex items-center relative">
                <button
                  onClick={() => {
                    const menu = document.getElementById('mobile-menu');
                    if (menu) {
                      menu.classList.toggle('hidden');
                    }
                  }}
                  className="focus:outline-none"
                >
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 6h16M4 12h16m-7 6h7"
                    ></path>
                  </svg>
                </button>
                <div
                  id="mobile-menu"
                  className="absolute top-full right-0 bg-[#111318] rounded-[12px] shadow-lg py-2 min-w-[120px] hidden translate-y-[10px]"
                >
                  <p
                    onClick={() => {
                      scrollToSection(aboutRef);
                      const menu = document.getElementById('mobile-menu');
                      if (menu) menu.classList.add('hidden');
                    }}
                    className="px-4 py-2 text-[14px] cursor-pointer hover:bg-white/10 transition-all text-white"
                  >
                    About
                  </p>
                  <p
                    onClick={() => {
                      scrollToSection(howToPlayRef);
                      const menu = document.getElementById('mobile-menu');
                      if (menu) menu.classList.add('hidden');
                    }}
                    className="px-4 py-2 text-[14px] cursor-pointer hover:bg-white/10 transition-all text-white"
                  >
                    How to Play
                  </p>
                  <p
                    onClick={() => {
                      scrollToSection(roadmapRef);
                      const menu = document.getElementById('mobile-menu');
                      if (menu) menu.classList.add('hidden');
                    }}
                    className="px-4 py-2 text-[14px] cursor-pointer hover:bg-white/10 transition-all text-white"
                  >
                    Future Plans
                  </p>
                  <p
                    onClick={() => {
                      scrollToSection(featuresRef);
                      const menu = document.getElementById('mobile-menu');
                      if (menu) menu.classList.add('hidden');
                    }}
                    className="px-4 py-2 text-[14px] cursor-pointer hover:bg-white/10 transition-all text-white"
                  >
                    Features
                  </p>

                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="w-full">
          <IntroduceWallet />
          <div className="container mx-auto px-4">
            <div className="flex flex-col py-10 md:py-20">
              <div className="py-16 md:py-32" ref={aboutRef}>
                <FadeInVisible>
                  <About />
                </FadeInVisible>
              </div>

              <div className="py-16 md:py-32" ref={howToPlayRef}>
                <FadeInVisible>
                  <SimplifyCommands />
                </FadeInVisible>
              </div>

              <div className="py-16 md:py-32" ref={featuresRef}>
                <FadeInVisible>
                  <SimplifySection />
                </FadeInVisible>
              </div>

              <div className="py-16 md:py-32" ref={roadmapRef}>
                <FadeInVisible>
                  <WhatNext />
                </FadeInVisible>
              </div>


            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
