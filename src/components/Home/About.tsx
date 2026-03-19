export default function About() {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12">
      <div className="flex-1 flex flex-col justify-center">
        <h2 className="text-[28px] md:text-[34px] font-bold text-white mb-6 md:mb-8 text-center md:text-left">About</h2>
        <div className="space-y-4 md:space-y-6 text-[#637592] text-center md:text-left">
          <p className="text-[16px] md:text-[18px] leading-relaxed">
            VexLand is an exciting roguelike dungeon crawler built on Avalanche, now fully accessible on the web. Dive
            into a thrilling world of challenges, epic bosses, and dynamic progression.
          </p>
          <p className="text-[16px] md:text-[18px] leading-relaxed">
            As you explore dark dungeons and battle fierce enemies, you're not just playing a game—you're also engaging
            with the Avalanche ecosystem. By integrating your wallet, VexLand brings you a seamless Web3 gaming
            experience.
          </p>
          <p className="text-[16px] md:text-[18px] leading-relaxed">
            Are you ready to embark on your journey? Explore, conquer, and earn rewards in VexLand—the adventure begins
            now!
          </p>
        </div>
      </div>
      <div className="flex-1 flex justify-center mt-8 md:mt-0">
        <img src="/avt_3.svg" alt="About VexLand" className="w-full max-w-[300px] md:max-w-[500px] animate-breathing" />
      </div>
    </div>
  );
}
