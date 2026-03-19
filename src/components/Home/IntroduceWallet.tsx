import { useNavigate } from 'react-router-dom';
import SplitText from '@/components/Animations/SplitText';
import RotatingText from '@/components/Animations/RotatingText';

export default function IntroduceWallet() {
  const navigate = useNavigate();

  const rotatingTexts = [
    'Roguelike Dungeon Crawler',
    'Epic Adventure',
    'Mysterious Quest',
    'Endless Dungeons Await',
    'Explore Unique Bosses',
    'Challenge Your Skills',
    'Discover Hidden Treasures',
    'Compete for Rewards',
    'Daily Quests Await',
    'Unleash Your Power',
    'Connect, Play, and Earn',
    'Your Adventure Begins'
  ];

  return (
    <div className="relative h-screen flex items-center justify-center">
      {/* Background */}
      <div className="absolute inset-0 w-full h-full">
        <img src="/bg3.png" alt="Background" className="w-full h-full object-cover" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center w-full px-4 md:px-0">
        <div className="flex flex-col items-center mx-auto no-select">
          <h1 className="text-[48px] md:text-[96px] text-center font-bold text-white mb-4">
            <SplitText text="Welcome to" className="block mb-2" delay={50} />
            <SplitText
              text="VexLand"
              className="cyberpunk-text block"
              delay={50}
              animationFrom={{ opacity: 0, transform: 'translate3d(0,60px,0)' }}
              animationTo={{ opacity: 1, transform: 'translate3d(0,0,0)' }}
            />
          </h1>
          <div className="flex flex-col md:flex-row items-center gap-2 text-[16px] md:text-[18px] text-center text-white mb-8">
            <RotatingText
              texts={rotatingTexts}
              mainClassName="bg-[rgb(103,232,249)] text-black px-4 py-1 rounded overflow-hidden"
              staggerFrom="first"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '-120%' }}
              staggerDuration={0.025}
              splitLevelClassName="overflow-hidden"
              transition={{ type: 'spring', damping: 30, stiffness: 400 }}
              rotationInterval={3000}
            />
            <span className="mt-2 md:mt-0">on Avalanche</span>
          </div>
          <button
            onClick={() => navigate('/game')}
            className="cyberpunk-btn-wrapper inline-block scale-75 md:scale-100"
          >
            <button className="cyberpunk-btn">
              <span className="cyberpunk-btn-content text-[14px] md:text-[16px]">Play Now</span>
            </button>
          </button>
        </div>
      </div>
    </div>
  );
}
