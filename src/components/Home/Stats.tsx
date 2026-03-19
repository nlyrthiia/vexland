import CountUp from '@/components/Animations/CountUp';

export default function Stats() {
  const users = 6743;
  const totalPoints = 17080;
  const totalExp = 131080;
  const duration = 0.6;

  return (
    <div className="w-full py-8 md:py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          <div className="flex flex-col items-center justify-center p-4 md:p-6 rounded-[12px]">
            <p className="text-[48px] md:text-[72px] font-bold text-[#03B9BB] leading-none mb-2 md:mb-4">
              <CountUp to={users} duration={duration} separator="," className="tabular-nums" />
            </p>
            <h3 className="text-[18px] md:text-[24px] text-white text-center">Active Players</h3>
          </div>

          <div className="flex flex-col items-center justify-center p-4 md:p-6 rounded-[12px]">
            <p className="text-[48px] md:text-[72px] font-bold text-[#03B9BB] leading-none mb-2 md:mb-4">
              <CountUp to={totalPoints} duration={duration} delay={0} separator="," className="tabular-nums" />
            </p>
            <h3 className="text-[18px] md:text-[24px] text-white text-center">Total Points Generated</h3>
          </div>

          <div className="flex flex-col items-center justify-center p-4 md:p-6 rounded-[12px]">
            <p className="text-[48px] md:text-[72px] font-bold text-[#03B9BB] leading-none mb-2 md:mb-4">
              <CountUp to={totalExp} duration={duration} delay={0} separator="," className="tabular-nums" />
            </p>
            <h3 className="text-[18px] md:text-[24px] text-white text-center">Total Experience Earned</h3>
          </div>
        </div>
      </div>
    </div>
  );
}
