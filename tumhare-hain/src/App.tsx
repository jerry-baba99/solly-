/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'motion/react';
import { Heart, Sparkles } from 'lucide-react';

const LYRICS = [
  { text: "Tumhare thhe tumhare hain", duration: 3200 },
  { text: "Tumhare hi rahenge hum", duration: 4400 },
  { text: "Ooo vaada tha kab ka ab jaa ke aaye", duration: 5000 },
  { text: "Phir bhi ganeemat aaye toh hai", duration: 3900 },
  { text: "Vaada tha kab ka ab jaa ke aaye", duration: 4600 },
  { text: "Phir bhi ganeemat aaye toh hai", duration: 3800 },
  { text: "Aaiye aaiye shauq se aaiye", duration: 3800 },
  { text: "Aaiye aake iss baar na jaiye", duration: 4000 },
];

const useMousePosition = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  return { mouseX, mouseY };
};

export default function App() {
  const [page, setPage] = useState(1);
  const [currentLyricIndex, setCurrentLyricIndex] = useState(-1);
  const [showFinalGif, setShowFinalGif] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { mouseX, mouseY } = useMousePosition();

  // Smooth springs for parallax
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  const startLyrics = () => {
    setPage(4);
    if (audioRef.current) {
      audioRef.current.play().catch(e => console.log("Audio play failed:", e));
    }
    setCurrentLyricIndex(0);
  };

  const ShimmerButton = ({ onClick, children, className }: { onClick: (e: React.MouseEvent) => void; children: React.ReactNode; className?: string }) => (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`relative overflow-hidden group ${className}`}
    >
      <span className="relative z-10">{children}</span>
      <motion.div
        initial={{ x: "-100%" }}
        whileHover={{ x: "100%" }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
      />
    </motion.button>
  );

  const HeartBurst = ({ x, y, onComplete }: { x: number; y: number; onComplete: () => void }) => {
    return (
      <div className="fixed inset-0 pointer-events-none z-[70]">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ x, y, opacity: 1, scale: 0 }}
            animate={{ 
              x: x + (Math.random() - 0.5) * 400,
              y: y + (Math.random() - 0.5) * 400,
              opacity: 0,
              scale: Math.random() * 2 + 1,
              rotate: Math.random() * 360
            }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            onAnimationComplete={i === 0 ? onComplete : undefined}
            className="absolute text-pink-500"
          >
            <Heart fill="currentColor" size={24} />
          </motion.div>
        ))}
      </div>
    );
  };

  const [burstPos, setBurstPos] = useState<{ x: number; y: number } | null>(null);

  const handlePageTransition = (nextPage: number, e?: React.MouseEvent) => {
    if (e) {
      setBurstPos({ x: e.clientX, y: e.clientY });
    }
    setTimeout(() => {
      setPage(nextPage);
      setBurstPos(null);
    }, 100);
  };

  const startLyricsWithBurst = (e: React.MouseEvent) => {
    setBurstPos({ x: e.clientX, y: e.clientY });
    setTimeout(() => {
      startLyrics();
      setBurstPos(null);
    }, 100);
  };

  useEffect(() => {
    if (page === 4 && currentLyricIndex >= 0 && currentLyricIndex < LYRICS.length) {
      const timer = setTimeout(() => {
        if (currentLyricIndex < LYRICS.length - 1) {
          setCurrentLyricIndex(prev => prev + 1);
        } else {
          setTimeout(() => setShowFinalGif(true), 2000);
        }
      }, LYRICS[currentLyricIndex].duration);
      return () => clearTimeout(timer);
    }
  }, [page, currentLyricIndex]);

  const Orb = ({ color, size, delay }: { color: string; size: number; delay: number }) => {
    const parallaxX = useSpring(0);
    const parallaxY = useSpring(0);

    useEffect(() => {
      const unsubscribeX = springX.on("change", (v) => parallaxX.set((v - window.innerWidth / 2) * 0.05));
      const unsubscribeY = springY.on("change", (v) => parallaxY.set((v - window.innerHeight / 2) * 0.05));
      return () => { unsubscribeX(); unsubscribeY(); };
    }, []);

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ 
          opacity: [0.1, 0.3, 0.1],
          scale: [1, 1.2, 1],
          x: [0, 50, 0],
          y: [0, 30, 0]
        }}
        transition={{ 
          duration: 10 + Math.random() * 5, 
          delay, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute rounded-full blur-[100px] pointer-events-none"
        style={{ 
          x: parallaxX,
          y: parallaxY,
          backgroundColor: color,
          width: size,
          height: size,
          top: Math.random() * 100 + "%",
          left: Math.random() * 100 + "%",
        }}
      />
    );
  };

  const FloatingHeart = ({ delay = 0 }: { delay?: number; key?: any }) => {
    const parallaxX = useSpring(0);
    const parallaxY = useSpring(0);

    useEffect(() => {
      const unsubscribeX = springX.on("change", (v) => parallaxX.set((v - window.innerWidth / 2) * 0.02));
      const unsubscribeY = springY.on("change", (v) => parallaxY.set((v - window.innerHeight / 2) * 0.02));
      return () => { unsubscribeX(); unsubscribeY(); };
    }, []);

    return (
      <motion.div
        initial={{ y: "110vh", x: Math.random() * 100 + "vw", scale: 0, opacity: 0 }}
        animate={{ 
          y: "-10vh", 
          scale: [0, 1.5, 1], 
          opacity: [0, 0.6, 0],
          rotate: Math.random() * 360 
        }}
        style={{ x: parallaxX, y: parallaxY }}
        transition={{ 
          duration: 6 + Math.random() * 4, 
          delay, 
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute pointer-events-none text-red-900/30"
      >
        <Heart fill="currentColor" size={15 + Math.random() * 25} />
      </motion.div>
    );
  };

  const Star = ({ delay = 0 }: { delay?: number; key?: any }) => {
    const parallaxX = useSpring(0);
    const parallaxY = useSpring(0);

    useEffect(() => {
      const unsubscribeX = springX.on("change", (v) => parallaxX.set((v - window.innerWidth / 2) * 0.01));
      const unsubscribeY = springY.on("change", (v) => parallaxY.set((v - window.innerHeight / 2) * 0.01));
      return () => { unsubscribeX(); unsubscribeY(); };
    }, []);

    return (
      <motion.div
        initial={{ opacity: 0.2, scale: 0.5 }}
        animate={{ opacity: [0.2, 1, 0.2], scale: [0.5, 1, 0.5] }}
        transition={{ duration: 2 + Math.random() * 3, delay, repeat: Infinity }}
        className="absolute w-1 h-1 bg-white rounded-full shadow-[0_0_5px_white]"
        style={{ 
          x: parallaxX,
          y: parallaxY,
          top: Math.random() * 100 + "%", 
          left: Math.random() * 100 + "%" 
        }}
      />
    );
  };

  const FallingStar = ({ delay = 0 }: { delay?: number; key?: any }) => {
    const duration = 1 + Math.random() * 2;
    const angle = 30 + Math.random() * 30;
    const startX = Math.random() * 100;
    const startY = Math.random() * 50;

    return (
      <motion.div
        initial={{ x: `${startX}%`, y: `${startY}%`, opacity: 0, scale: 0 }}
        animate={{ 
          x: [`${startX}%`, `${startX + 40}%`], 
          y: [`${startY}%`, `${startY + 60}%`], 
          opacity: [0, 1, 0],
          scale: [0, 1, 0]
        }}
        transition={{ 
          duration, 
          delay, 
          repeat: Infinity, 
          repeatDelay: 2 + Math.random() * 8,
          ease: "easeOut"
        }}
        className="absolute w-40 h-[2px] bg-gradient-to-r from-transparent via-white to-transparent"
        style={{ 
          transform: `rotate(${angle}deg)`,
          filter: "blur(1px)"
        }}
      />
    );
  };

  const FloatingParticle = ({ delay = 0 }: { delay?: number; key?: any }) => (
    <motion.div
      initial={{ y: "110vh", x: Math.random() * 100 + "vw", opacity: 0 }}
      animate={{ 
        y: "-10vh", 
        opacity: [0, 0.3, 0],
        x: [Math.random() * 100 + "vw", Math.random() * 100 + "vw"]
      }}
      transition={{ 
        duration: 15 + Math.random() * 10, 
        delay, 
        repeat: Infinity,
        ease: "linear"
      }}
      className="absolute w-1 h-1 bg-pink-200 rounded-full blur-[1px] pointer-events-none"
    />
  );
  const Sparkle = ({ delay = 0 }: { delay?: number; key?: any }) => (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ 
        scale: [0, 1.2, 0], 
        opacity: [0, 0.8, 0],
        rotate: [0, 180]
      }}
      transition={{ 
        duration: 2 + Math.random() * 2, 
        delay, 
        repeat: Infinity,
        repeatDelay: Math.random() * 5
      }}
      className="absolute text-yellow-200/40 pointer-events-none"
      style={{ 
        top: Math.random() * 100 + "%", 
        left: Math.random() * 100 + "%" 
      }}
    >
      <div className="w-1 h-1 bg-white rounded-full shadow-[0_0_10px_white]" />
    </motion.div>
  );

  const StaggeredText = ({ text }: { text: string; key?: any }) => {
    const letters = Array.from(text);
    const container = {
      hidden: { opacity: 0 },
      visible: (i = 1) => ({
        opacity: 1,
        transition: { staggerChildren: 0.05, delayChildren: 0.04 * i },
      }),
      exit: {
        opacity: 0,
        y: -20,
        transition: { duration: 0.5 }
      }
    };

    const child = {
      visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        rotate: 0,
        filter: "blur(0px)",
        transition: { 
          type: "spring", 
          damping: 12, 
          stiffness: 200 
        },
      },
      hidden: {
        opacity: 0,
        y: 40,
        scale: 0.3,
        rotate: -15,
        filter: "blur(10px)",
        transition: { 
          type: "spring", 
          damping: 12, 
          stiffness: 200 
        },
      },
    };

    return (
      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="w-full flex flex-wrap justify-center text-center text-4xl sm:text-5xl md:text-8xl font-king text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.6)]"
      >
        {letters.map((letter, index) => (
          <motion.span variants={child} key={index} className="inline-block whitespace-pre">
            {letter}
          </motion.span>
        ))}
      </motion.div>
    );
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black flex items-center justify-center">
      {burstPos && <HeartBurst x={burstPos.x} y={burstPos.y} onComplete={() => {}} />}
      <audio ref={audioRef} src="/11.mp3" loop />

      {/* Night Sky Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-[#050005] to-[#1a001a] z-0">
        {/* Glowing Orbs */}
        <Orb color="#ff0080" size={400} delay={0} />
        <Orb color="#4000ff" size={300} delay={2} />
        <Orb color="#ff8000" size={350} delay={4} />

        {/* Stars */}
        {[...Array(80)].map((_, i) => (
          <Star key={i} delay={i * 0.1} />
        ))}

        {/* Sparkles */}
        {[...Array(20)].map((_, i) => (
          <Sparkle key={i} delay={i * 0.5} />
        ))}

        {/* Falling Stars */}
        {[...Array(5)].map((_, i) => (
          <FallingStar key={i} delay={i * 3} />
        ))}

        {/* Floating Hearts */}
        {[...Array(20)].map((_, i) => (
          <FloatingHeart key={i} delay={i * 0.6} />
        ))}

        {/* Floating Particles */}
        {[...Array(30)].map((_, i) => (
          <FloatingParticle key={i} delay={i * 0.5} />
        ))}
      </div>

      {/* Watermark */}
      <div className="fixed bottom-4 right-4 z-[100] font-caveat text-white/40 text-lg pointer-events-none">
        made with ❤️ by @j3ryy.css
      </div>

      <AnimatePresence mode="wait">
        {page === 1 && (
          <motion.div
            key="page1"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            className="relative z-10 flex flex-col items-center justify-center gap-8 text-center px-4 w-full h-full"
          >
            <img 
              src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOGo4bWp3ZmlvNWN4dGljcDRmMmcxeHI1NzJrYXN3aW9zeG5wMzIwZCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/Lz6971fkGSgCMOOncl/giphy.gif" 
              alt="Sad GIF" 
              className="w-48 h-48 md:w-64 md:h-64 rounded-2xl shadow-2xl border-2 border-white/10 object-cover"
              referrerPolicy="no-referrer"
            />
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-caveat text-pink-500 drop-shadow-lg text-center px-2">Heyy baby sorry na 🥹 </h1>
            <ShimmerButton 
              onClick={(e: any) => handlePageTransition(2, e)}
              className="px-8 py-3 md:px-10 md:py-4 bg-pink-600 hover:bg-pink-500 text-white rounded-full font-caveat text-2xl md:text-3xl transition-all shadow-xl text-center"
            >
              Not gonna forgive ..
            </ShimmerButton>
          </motion.div>
        )}

        {page === 2 && (
          <motion.div
            key="page2"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="relative z-10 flex flex-col items-center justify-center gap-8 text-center px-4 w-full h-full"
          >
            <img 
              src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExazI2NDI2bWpkczM4d2R3djI2dWx5ZmlmaDM0NDg4Nml3djl5M25zaiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/UksRwZQXDijMUSy72G/giphy.gif" 
              alt="Sorry GIF" 
              className="w-48 h-48 md:w-64 md:h-64 rounded-2xl shadow-2xl border-2 border-white/10 object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="space-y-4 flex flex-col items-center px-4">
              <h1 className="text-3xl sm:text-4xl md:text-6xl font-caveat text-blue-500 drop-shadow-lg text-center">Really sorry na babu 🥹</h1>
              <p className="text-lg sm:text-xl md:text-2xl font-caveat text-gray-300 max-w-md text-center">
                Sorryyyy 😭 I know I was slow as hell. Your phone literally took naps waiting for me…
              </p>
            </div>
            <ShimmerButton 
              onClick={(e: any) => handlePageTransition(3, e)}
              className="px-8 py-3 md:px-10 md:py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-caveat text-2xl md:text-3xl transition-all shadow-xl"
            >
              But you know what...
            </ShimmerButton>
          </motion.div>
        )}

        {page === 3 && (
          <motion.div
            key="page3"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 2 }}
            className="relative z-10 flex flex-col items-center justify-center gap-8 text-center px-4 w-full h-full"
          >
            <img 
              src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNXZuNnAydGI4ZXNsaHpkdDNoNTh0NGhzdTNjbTQ3bzA3aGdyamFuMyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/t8xgPfC5oNIRMrNooe/giphy.gif" 
              alt="Heart GIF" 
              className="w-48 h-48 md:w-64 md:h-64 rounded-2xl shadow-2xl border-2 border-white/10 object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="space-y-4 flex flex-col items-center px-4">
              <h1 className="text-3xl sm:text-4xl md:text-6xl font-indie text-red-500 drop-shadow-lg text-center">Aww don’t say that 😭 I still owe you a proper apology.</h1>
              <p className="text-lg sm:text-xl md:text-2xl font-caveat text-gray-300 max-w-md text-center">
                Thanks for not staying mad though… I’ll make it up to you 🤍
              </p>
            </div>
            <ShimmerButton 
              onClick={(e: any) => startLyricsWithBurst(e)}
              className="px-8 py-3 md:px-10 md:py-4 bg-red-600 hover:bg-red-500 text-white rounded-full font-caveat text-2xl md:text-3xl transition-all shadow-xl"
            >
              One last thing..
            </ShimmerButton>
          </motion.div>
        )}

        {page === 4 && (
          <motion.div
            key="page4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden"
          >
            {/* Lyrics Container */}
            <div className="relative z-10 text-center px-6 w-full max-w-4xl flex items-center justify-center">
              <AnimatePresence mode="wait">
                {currentLyricIndex >= 0 && currentLyricIndex < LYRICS.length && (
                  <motion.div
                    key={currentLyricIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="relative"
                  >
                    {/* Background Glow for Text (Audio Visualizer Style) */}
                    <motion.div 
                      animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.2, 0.5, 0.2],
                        rotate: [0, 180, 360]
                      }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute inset-0 blur-[100px] bg-gradient-to-r from-pink-500/30 via-purple-500/30 to-blue-500/30 rounded-full scale-150"
                    />
                    <StaggeredText text={LYRICS[currentLyricIndex].text} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Final GIF Overlay */}
            <AnimatePresence>
              {showFinalGif && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black"
                >
                  <img 
                    src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExeG91bGxkbHpsczVuYXEwbDQzYm90cW5oa24zczNiNWh5ZW84bWwwaiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/GKIiTfcyFthV6/giphy.gif" 
                    alt="Final GIF" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5, type: "spring" }}
                    className="absolute inset-0 flex flex-col items-center justify-center bg-black/40"
                  >
                    <motion.h1 
                      animate={{ 
                        y: [0, -20, 0],
                        textShadow: [
                          "0 0 20px rgba(244,114,182,0.8)",
                          "0 0 50px rgba(244,114,182,1)",
                          "0 0 20px rgba(244,114,182,0.8)"
                        ]
                      }}
                      transition={{ 
                        y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                        textShadow: { duration: 2, repeat: Infinity }
                      }}
                      className="text-5xl sm:text-7xl md:text-9xl lg:text-[12rem] font-king text-pink-400 text-center px-4"
                    >
                      Aailobhuuuuu
                    </motion.h1>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
