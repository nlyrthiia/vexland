export default function SimplifyJourney() {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12">
      <div className="flex-1">
        <h2 className="text-[28px] md:text-[34px] font-bold text-white mb-6 md:mb-8 text-center md:text-left">
          Game Features
        </h2>
        <div className="space-y-4 md:space-y-6">
          <FeatureItem
            title="Web-Based Gaming"
            description="Fully optimized for both PC and mobile. Play directly on your web browser with any EVM-compatible wallet (like MetaMask or Core Wallet)."
          />
          <FeatureItem
            title="Avalanche Integration"
            description="Integrated with Avalanche, VexLand offers secure, decentralized gameplay. Your progress and in-game assets are safely stored on-chain using your wallet."
          />
          <FeatureItem
            title="Roguelike Exploration"
            description="Battle through procedurally generated dungeons, with ever-changing enemies, unique bosses, and skill combinations to make each playthrough different."
          />
          <FeatureItem
            title="Daily Quests & Leaderboards"
            description="Complete daily quests, engage in dungeon crawling, and compete for top spots on the leaderboard. Win in-game rewards and climb higher for more challenges."
          />
        </div>
      </div>
      <div className="flex-1 flex justify-center w-full mt-8 md:mt-0">
        <div className="w-full flex justify-center px-4 md:px-0">
          <img
            src="/avt_1.svg"
            alt="Game Features"
            className="w-full max-w-[300px] md:max-w-[500px] animate-breathing"
          />
        </div>
      </div>
    </div>
  );
}

function FeatureItem({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-white/5 p-4 md:p-6 rounded-lg">
      <h3 className="text-[16px] md:text-[18px] font-bold mb-1 md:mb-2 text-white">{title}</h3>
      <p className="text-[12px] md:text-[14px] text-[#637592]">{description}</p>
    </div>
  );
}
