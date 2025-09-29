
import React from 'react';
import { RouletteSegment } from '../types';
import { TicketIcon, SparklesIcon } from './Icons'; // Or any other icon you prefer

interface PrizeRouletteProps {
  segments: RouletteSegment[];
  rotation: number;
  animationPhase: 'fast-spin' | 'landing' | 'none';
}

const PrizeRoulette: React.FC<PrizeRouletteProps> = ({ segments, rotation, animationPhase }) => {
  const numSegments = segments.length;
  const segmentAngle = 360 / numSegments;

  const VIBRANT_RED_BORDER = '#ef4444'; 
  const SOFT_WHITE_PINK_BORDER = '#fff1f2'; 
  const GOLDEN_YELLOW_PIN = '#facc15'; 
  const GOLDEN_YELLOW_PIN_BORDER = '#ca8a04';
  const GOLDEN_YELLOW_WHEEL_BORDER = '#facc15';
  const REDDISH_ORANGE_SPIN_RING = '#f97316';
  const VIBRANT_RED_SPIN_BUTTON = '#ef4444';
  const PURPLE_SPIN_BUTTON_BORDER = '#c026d3';


  const conicGradient = segments.map((segment, i) => {
    const start = i * segmentAngle;
    const end = start + segmentAngle;
    const color = segment.color === 'green' ? '#4CAF50' : '#F44336'; // Green for prize, Red for no_prize
    return `${color} ${start}deg ${end}deg`;
  }).join(', ');

  const getTransitionStyle = () => {
    switch (animationPhase) {
      case 'fast-spin':
        return { transition: 'transform 2s linear' };
      case 'landing':
        return { transition: 'transform 4s cubic-bezier(0.25, 0.1, 0.25, 1)' };
      case 'none':
      default:
        return { transition: 'none' };
    }
  };

  return (
    <div
      className="relative mx-auto my-8 select-none"
      style={{ width: '320px', height: '320px' }} 
      role="img"
      aria-label="Roleta de Prêmios KAIROS"
    >
      {/* Outer Candy Cane Border - Static */}
      <div
        className="absolute inset-0 rounded-full shadow-xl"
        style={{
          padding: '20px', 
          background: `repeating-conic-gradient(${VIBRANT_RED_BORDER} 0deg 11.25deg, ${SOFT_WHITE_PINK_BORDER} 11.25deg 22.5deg)`,
          boxShadow: 'inset 0 0 10px rgba(0,0,0,0.3), 0 5px 15px rgba(0,0,0,0.4)',
        }}
      >
        {/* Inner Wheel - This is what rotates */}
        <div
          className="w-full h-full rounded-full relative"
          style={{
            transform: `rotate(${rotation}deg)`,
            ...getTransitionStyle(),
            background: `conic-gradient(${conicGradient})`,
            border: `4px solid ${GOLDEN_YELLOW_WHEEL_BORDER}`,
            boxShadow: 'inset 0 0 15px rgba(0,0,0,0.5)',
          }}
        >
          {/* Pins - Now inside the rotating wheel */}
          {Array.from({ length: numSegments }).map((_, i) => {
            const angle = i * segmentAngle + segmentAngle / 2; 
            const rad = angle * (Math.PI / 180);
            const wheelRadius = 140; 
            const pinDistanceFromCenter = wheelRadius - 15; 
            
            const x = wheelRadius + pinDistanceFromCenter * Math.cos(rad); 
            const y = wheelRadius + pinDistanceFromCenter * Math.sin(rad);
            
            return (
              <div
                key={`pin-${i}`}
                className="absolute w-3 h-3 rounded-full shadow-md"
                style={{
                  backgroundColor: GOLDEN_YELLOW_PIN,
                  top: `${y}px`,
                  left: `${x}px`,
                  transform: 'translate(-50%, -50%)', 
                  border: `1px solid ${GOLDEN_YELLOW_PIN_BORDER}`,
                  zIndex: 1, 
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Central SPIN Button - Static relative to outer container */}
      <div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 group" // Added group for group-hover on icon
        style={{ width: '100px', height: '100px' }}
      >
        {/* Flames (decorative elements around spin button) */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={`flame-${i}`}
            className="absolute w-3 h-6" 
            style={{
              backgroundColor: GOLDEN_YELLOW_PIN, 
              top: '50%',
              left: '50%',
              transformOrigin: '50% 100%', 
              transform: `translate(-50%, -100%) rotate(${i * 45}deg) translateY(-38px)`, 
              clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)', 
            }}
          />
        ))}

        {/* Reddish-Orange Ring */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: REDDISH_ORANGE_SPIN_RING,
            padding: '8px', 
            boxShadow: 'inset 0 0 5px rgba(0,0,0,0.4), 0 2px 4px rgba(0,0,0,0.3)',
          }}
        >
          {/* Golden Ring (inside Reddish-Orange Ring) */}
          <div
            className="w-full h-full rounded-full"
            style={{
              border: `3px solid ${GOLDEN_YELLOW_WHEEL_BORDER}`, 
            }}
          >
            {/* Main Button */}
            <div
              className="absolute rounded-full flex items-center justify-center cursor-pointer"
              style={{
                width: 'calc(100% - 10px)', 
                height: 'calc(100% - 10px)',
                top: '5px', 
                left: '5px',
                background: VIBRANT_RED_SPIN_BUTTON,
                boxShadow: 'inset 0 0 8px rgba(0,0,0,0.5), 0 3px 3px rgba(0,0,0,0.3)',
                border: `2px solid ${PURPLE_SPIN_BUTTON_BORDER}`, 
              }}
            >
              <div className="flex flex-col items-center justify-center text-center">
                <TicketIcon className="w-10 h-10 text-white opacity-90 group-hover:opacity-100 transition-opacity duration-300 group-hover:animate-pulse" aria-hidden="true"/>
                {/* Text "Girar" removed from here */}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pointer - Static relative to outer container */}
      <div
        className="absolute left-1/2 transform -translate-x-1/2 z-20"
        style={{ top: '-28px' }} 
      >
        <div
          className="absolute w-8 h-8 bg-transparent border-4 rounded-b-full"
          style={{
            borderColor: GOLDEN_YELLOW_WHEEL_BORDER,
            borderTopColor: 'transparent',
            top: '13px', 
            left: '50%',
            transform: 'translateX(-50%) scaleY(0.7)',
            zIndex: -1, 
          }}
        />
        <div
          style={{
            width: 0,
            height: 0,
            borderLeft: '15px solid transparent',
            borderRight: '15px solid transparent',
            borderTop: `25px solid ${GOLDEN_YELLOW_WHEEL_BORDER}`,
            filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.5))',
          }}
        />
      </div>
    </div>
  );
};

export default PrizeRoulette;
