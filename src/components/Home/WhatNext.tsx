export default function WhatNext() {

  return (
    <div className="flex flex-col items-center text-center">
      <h2 className="text-[28px] md:text-[34px] font-bold text-white mb-6 md:mb-8">Future Plans</h2>
      <div className="w-full overflow-x-auto pb-4 [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-track]:bg-white/5 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-white/30">
        <div className="flex gap-6 md:gap-8 min-w-max px-4">
          <PlanItem
            title="Avalanche Launch & Stabilization"
            items={[
              'Avalanche C-Chain deployment completed',
              'Integrated with Avalanche wallets',
              'Optimized for PC and mobile',
              'Initial community engagement and growth'
            ]}
          />
          <PlanItem
            title="Expansion and Features"
            items={[
              'Introduce in-game rewards',
              'Enhance daily quest mechanics',
              'New bosses and dungeon updates',
              'Points System',
              'Leaderboard Activity'
            ]}
          />
          <PlanItem
            title="Advanced Gameplay"
            items={[
              'Introduce advanced dungeons and gameplay features',
              'Explore deeper integration within the Avalanche ecosystem',
              'Better mobile adaptation and optimization',
              'Cross-chain compatibility and broader integration'
            ]}
          />
          <PlanItem
            title="Mobile App & Ecosystem Integration"
            items={[
              'Launch official marketplace',
              'Release mobile app for iOS and Android',
              'Introduce token economy',
              'More updates...'
            ]}
          />
        </div>
      </div>
    </div>
  );
}

function PlanItem({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="bg-white/5 rounded-[12px] p-4 md:p-6 w-[280px] md:w-[320px] flex-shrink-0">
      <h3 className="text-[16px] md:text-[18px] font-bold mb-3 md:mb-4 text-white">{title}</h3>
      <ul className="space-y-1.5 md:space-y-2 text-left">
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-2 text-[12px] md:text-[14px] text-[#637592]">
            <div className="w-1 h-1 md:w-1.5 md:h-1.5 bg-white/20 rounded-full" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

