export default function SimplifyCommands() {
  return (
    <div className="flex flex-col-reverse md:flex-row items-center justify-around gap-8 md:gap-40">
      <div className="flex-1 flex justify-center w-full">
        <div className="w-full flex justify-center px-4 md:px-0">
          <img src="/avt_2.svg" alt="Gameplay" className="w-full max-w-[300px] md:max-w-[500px] animate-breathing" />
        </div>
      </div>
      <div className="flex-1 text-center md:text-left">
        <h2 className="text-[28px] md:text-[34px] font-bold text-white mb-6 md:mb-8">How to Play</h2>
        <div className="space-y-4 md:space-y-6">
          <StepItem
            number="1"
            title="Set Up Your Wallet"
            description="Install a EVM-compatible wallet (like MetaMask or Core Wallet) and create an account. You'll need this wallet to interact with VexLand and manage your assets."
          />
          <StepItem
            number="2"
            title="Access VexLand"
            description="Visit VexLand.vercel.app to access VexLand directly from your browser."
          />
          <StepItem
            number="3"
            title="Connect & Play"
            description="Connect your wallet, sign in, and dive into the world of VexLand. Your dungeon crawling adventure awaits!"
          />
          <StepItem
            number="4"
            title="Earn & Compete"
            description="Complete daily quests, defeat powerful bosses, and climb the leaderboard for rewards, including in-game assets and exclusive prizes."
          />
        </div>
      </div>
    </div>
  );
}

function StepItem({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="flex gap-3 md:gap-4">
      <div className="w-6 h-6 md:w-8 md:h-8 flex-shrink-0 rounded-full bg-white/10 flex items-center justify-center text-white text-[12px] md:text-[14px] font-medium">
        {number}
      </div>
      <div className="text-left">
        <h3 className="text-[16px] md:text-[18px] font-bold mb-1 md:mb-2 text-white">{title}</h3>
        <p className="text-[12px] md:text-[14px] text-[#637592]">{description}</p>
      </div>
    </div>
  );
}
