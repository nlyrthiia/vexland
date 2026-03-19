import { useEffect, useState, useRef, useCallback } from 'react';
import { useAccount, useDisconnect, useWriteContract, usePublicClient } from 'wagmi';
import { toast } from 'react-hot-toast';
import {
  parsePlayerData,
  canCheckIn as checkCanCheckIn,
  checkInConfig,
  claimPointsConfig,
  PlayerData,
  VEXLAND_ABI,
} from '@/lib/vexlandContract';
import { CONTRACT_ADDRESS } from '@/constants';

interface ProfileProps {
  onDisconnect: () => void;
  onClose: () => void;
}

type TabType = 'profile' | 'leaderboard' | 'tasks' | 'howtoplay';

interface LeaderboardEntry {
  address: string;
  points: number;
  rank: number;
  areaId: string;
}

interface TaskProgress {
  pointsTarget: number;
  expTarget: number;
  claimTarget: number;
  claimCount: number;
  pointsTaskCompleted: boolean;
  expTaskCompleted: boolean;
  claimTaskCompleted: boolean;
  pointsTaskClaimed: boolean;
  expTaskClaimed: boolean;
  claimTaskClaimed: boolean;
}

interface FakeLeaderboardData {
  data: LeaderboardEntry[];
  lastUpdate: number;
}

interface StatsCache {
  points: number;
  experience: number;
  lastClaimTime: number;
  timestamp: number;
}

const generateAreaId = (timestamp: number) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const daysSinceEpoch = Math.floor(timestamp / (24 * 60 * 60 * 1000));
  const rand = Math.abs(Math.sin(daysSinceEpoch)) * 1000000;

  const num = Math.floor(rand % 100);
  const letter = characters[Math.floor((rand * num) % 26)];

  return `${letter}${num}`;
};

const generateFakeAddress = (seed: number) => {
  const characters = '0123456789abcdef';
  let address = '0x';
  for (let i = 0; i < 40; i++) {
    const rand = Math.abs(Math.sin(seed + i)) * 16;
    address += characters[Math.floor(rand)];
  }
  return address;
};

export default function Profile({ onDisconnect, onClose }: ProfileProps) {
  const { address } = useAccount();
  
  const publicClient = usePublicClient();
  const { disconnect } = useDisconnect();
  const { writeContract } = useWriteContract();
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [points, setPoints] = useState<number>(0);
  const [experience, setExperience] = useState<number>(0);
  const [nextClaimTime, setNextClaimTime] = useState<string>('');
  const [canCheckInToday, setCanCheckInToday] = useState<boolean>(true);
  const [hasSeasonPass, setHasSeasonPass] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState<boolean>(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const modalRef = useRef<HTMLDivElement>(null);
  const [intervalRef, setIntervalRef] = useState<ReturnType<typeof setInterval> | undefined>(undefined);
  const [taskProgress, setTaskProgress] = useState<TaskProgress>({
    pointsTarget: 70,
    expTarget: 1000,
    claimTarget: 15,
    claimCount: 0,
    pointsTaskCompleted: false,
    expTaskCompleted: false,
    claimTaskCompleted: false,
    pointsTaskClaimed: false,
    expTaskClaimed: false,
    claimTaskClaimed: false
  });
  const [fakeLeaderboard, setFakeLeaderboard] = useState<FakeLeaderboardData>({
    data: [],
    lastUpdate: 0
  });
  const [isClaiming, setIsClaiming] = useState<boolean>(false);
  const [isClaimingReward, setIsClaimingReward] = useState<boolean>(false);
  const [lastClaimTimestamp, setLastClaimTimestamp] = useState<number>(0);
  const isMounted = useRef(true);

  const bgColor = 'bg-gradient-to-br from-[#232323] via-[#18181a] to-[#2c2c2e]';
  const borderColor = 'border-4 border-[#6b4f1d] shadow-[0_0_24px_#000a]';
  const sectionTitle = 'text-[#e0c97f] font-semibold mb-1';
  const divider = 'border-b border-[#a88b4a] my-2 opacity-60';

  const updateStats = useCallback(async () => {
    if (!address) return;

    try {
      setIsLoading(true);
      const result = await publicClient!.readContract({
          address: CONTRACT_ADDRESS,
          abi: VEXLAND_ABI,
          functionName: 'getPlayerData',
          args: [address as `0x${string}`],
        });
        const playerData = parsePlayerData(result as any);

      if (!playerData) {
        // Player not registered yet
        if (isMounted.current) {
          setPoints(0);
          setExperience(0);
          setLastClaimTimestamp(0);
          setCanCheckInToday(true);
          setHasSeasonPass(false);
          setTaskProgress((prev) => ({ ...prev, claimCount: 0 }));
        }
        return;
      }

      if (isMounted.current) {
        setPoints(playerData.totalPoints);
        setExperience(playerData.gold);
        setLastClaimTimestamp(playerData.lastCheckInTimestamp);
        setCanCheckInToday(checkCanCheckIn(playerData));
        setHasSeasonPass(playerData.seasonPassPurchased);
        setTaskProgress((prev) => ({
          ...prev,
          claimCount: playerData.checkInCount
        }));
      }
    } catch (error: any) {
      console.error('Error updating stats:', error);
      toast.error(`Failed to update stats: ${error?.message || String(error)}`);
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [publicClient, address]);

  const generateFakeLeaderboard = useCallback(
    async (userPoints: number) => {
      if (!address) return [];
      try {
        const now = Date.now();
        const daysSinceEpoch = Math.floor(now / (24 * 60 * 60 * 1000));
        const areaId = generateAreaId(now);

        const safeUserPoints = Number(userPoints) || 0;

        const fakeAddresses = Array.from({ length: 199 }, (_, i) => generateFakeAddress(daysSinceEpoch * 100 + i));

        let fakeData = fakeAddresses.map((addr, index) => {
          const seed = daysSinceEpoch * 100 + index;

          let maxPoints, minPoints;
          if (safeUserPoints < 100 || safeUserPoints === 0) {
            maxPoints = Math.max(safeUserPoints * 0.1, 10);
            minPoints = Math.max(safeUserPoints * 0.2, 1);
          } else if (safeUserPoints < 500) {
            maxPoints = Math.max(safeUserPoints * 1.8, 300);
            minPoints = Math.max(safeUserPoints * 0.4, 20);
          } else {
            maxPoints = Math.max(safeUserPoints * 1.3, 700);
            minPoints = Math.max(safeUserPoints * 0.5, 80);
          }

          const baseRandom = Math.abs(Math.sin(seed)) + Math.abs(Math.cos(seed * 0.7));
          const normalizedRandom = (baseRandom % 1) + (Math.abs(Math.sin(seed * 1.3)) % 0.3);
          const randomPoints = Math.floor(minPoints + normalizedRandom * (maxPoints - minPoints));

          return {
            address: addr,
            points: randomPoints,
            rank: 0,
            areaId
          };
        });

        if (address) {
          const userData = {
            address: address,
            points: safeUserPoints,
            rank: 0,
            areaId
          };
          fakeData.push(userData);
        }

        fakeData = fakeData
          .sort((a, b) => b.points - a.points)
          .map((entry, index) => ({
            ...entry,
            rank: index + 1
          }));

        const userRank = address
          ? fakeData.find((entry) => entry.address === address)?.rank || 0
          : 0;

        const top100 = fakeData.slice(0, 100);
        if (userRank > 100 && address) {
          top100.push({
            address: address,
            points: safeUserPoints,
            rank: userRank,
            areaId
          });
        }

        return top100;
      } catch (error) {
        console.error('Error generating fake leaderboard:', error);
        return [];
      }
    },
    [address]
  );

  const fetchLeaderboard = useCallback(async () => {
    if (!address) return;

    try {
      setIsLoadingLeaderboard(true);
      const result = await publicClient!.readContract({
          address: CONTRACT_ADDRESS,
          abi: VEXLAND_ABI,
          functionName: 'getPlayerData',
          args: [address as `0x${string}`],
        });
        const playerData = parsePlayerData(result as any);
      const userPoints = playerData?.totalPoints ?? 0;
      const leaderboardData = await generateFakeLeaderboard(userPoints);
      if (isMounted.current) {
        setLeaderboard(leaderboardData);
        setFakeLeaderboard({
          data: leaderboardData,
          lastUpdate: Date.now()
        });
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      toast.error('Failed to fetch leaderboard');
    } finally {
      if (isMounted.current) {
        setIsLoadingLeaderboard(false);
      }
    }
  }, [address, publicClient, generateFakeLeaderboard]);

  useEffect(() => {
    isMounted.current = true;

    if (address) {
      updateStats();
      fetchLeaderboard();
    }

    const interval = setInterval(() => {
      if (isMounted.current && address) {
        updateStats();
        fetchLeaderboard();
      }
    }, 30000);

    setIntervalRef(interval);

    return () => {
      isMounted.current = false;
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [address, updateStats, fetchLeaderboard]);


  const formatTime = (seconds: number) => {
    if (seconds <= 0) return 'Available now';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const parts = [];
    if (hours > 0) parts.push(`${hours.toString().padStart(2, '0')}h`);
    if (minutes > 0) parts.push(`${minutes.toString().padStart(2, '0')}m`);
    parts.push(`${secs.toString().padStart(2, '0')}s`);

    return parts.join(' ');
  };

  // Remove countdown timer - use can_check_in_today from contract instead

  // Update handleClaim to fix the claiming issue
  const handleClaim = async () => {
    if (!address) {
      toast.error('Wallet not connected');
      return;
    }

    try {
      setIsClaiming(true);

      const result = await publicClient!.readContract({
          address: CONTRACT_ADDRESS,
          abi: VEXLAND_ABI,
          functionName: 'getPlayerData',
          args: [address as `0x${string}`],
        });
        const playerData = parsePlayerData(result as any);
      if (!checkCanCheckIn(playerData)) {
        toast.error('You have already checked in today');
        setIsClaiming(false);
        return;
      }

      writeContract(checkInConfig(), {
          onSuccess: async () => {
            toast.success('Daily check-in successful!');
            const currentTime = Math.floor(Date.now() / 1000);
            setLastClaimTimestamp(currentTime);
            setCanCheckInToday(false);

            try {
              await new Promise((resolve) => setTimeout(resolve, 2000));
              await updateStats();
              await fetchLeaderboard();
            } catch (error) {
              console.error('Error updating after check-in:', error);
              await updateStats();
            }
            setIsClaiming(false);
          },
          onError: (error: Error) => {
            console.error('Error claiming daily rewards:', error);
            toast.error('Failed to claim daily rewards');
            setLastClaimTimestamp(0);
            setNextClaimTime('Available now');
            setCanCheckInToday(true);
            setIsClaiming(false);
          },
        },
      );
    } catch (error) {
      console.error('Error claiming daily rewards:', error);
      toast.error('Failed to claim daily rewards');
      setLastClaimTimestamp(0);
      setNextClaimTime('Available now');
      setCanCheckInToday(true);
      setIsClaiming(false);
    }
  };

  const checkTaskCompletion = () => {
    if (points >= taskProgress.pointsTarget && !taskProgress.pointsTaskCompleted) {
      setTaskProgress((prev) => ({ ...prev, pointsTaskCompleted: true }));
      toast.success('Points Master achievement completed! Rewards will be sent to your wallet.', {
        duration: 3000,
        position: 'top-center',
        style: {
          background: '#2563eb',
          color: '#fff',
          borderRadius: '8px',
          padding: '12px 24px'
        }
      });
    }

    if (experience >= taskProgress.expTarget && !taskProgress.expTaskCompleted) {
      setTaskProgress((prev) => ({ ...prev, expTaskCompleted: true }));
      toast.success('Experience Collector achievement completed! Rewards will be sent to your wallet.', {
        duration: 3000,
        position: 'top-center',
        style: {
          background: '#2563eb',
          color: '#fff',
          borderRadius: '8px',
          padding: '12px 24px'
        }
      });
    }

    if (taskProgress.claimCount >= taskProgress.claimTarget && !taskProgress.claimTaskCompleted) {
      setTaskProgress((prev) => ({ ...prev, claimTaskCompleted: true }));
      toast.success('Loyal Player achievement completed! Rewards will be sent to your wallet.', {
        duration: 3000,
        position: 'top-center',
        style: {
          background: '#2563eb',
          color: '#fff',
          borderRadius: '8px',
          padding: '12px 24px'
        }
      });
    }
  };

  useEffect(() => {
    checkTaskCompletion();
  }, [points, experience, taskProgress.claimCount]);

  const handleClaimReward = async (taskType: 'points' | 'exp' | 'claim') => {
    if (!address) {
      toast.error('Wallet not connected');
      return;
    }

    try {
      setIsClaimingReward(true);
      writeContract(claimPointsConfig(), {
          onSuccess: async () => {
            await updateStats();
            if (taskType === 'points') {
              setTaskProgress((prev) => ({ ...prev, pointsTaskClaimed: true }));
            } else if (taskType === 'exp') {
              setTaskProgress((prev) => ({ ...prev, expTaskClaimed: true }));
            } else if (taskType === 'claim') {
              setTaskProgress((prev) => ({ ...prev, claimTaskClaimed: true }));
            }
            toast.success('Reward claimed successfully!');
            setIsClaimingReward(false);
          },
          onError: (error: Error) => {
            console.error('Error claiming reward:', error);
            toast.error('Failed to claim reward');
            setIsClaimingReward(false);
          },
        },
      );
    } catch (error) {
      console.error('Error claiming reward:', error);
      toast.error('Failed to claim reward');
      setIsClaimingReward(false);
    }
  };

  const renderProfileTab = () => {
    if (!address) {
      return (
        <div className="text-center p-4">
          <p className="mb-4">Wallet not connected</p>
          <button
            onClick={() => {
              onClose();
              setTimeout(() => {
                window.dispatchEvent(new CustomEvent('connectWallet'));
              }, 100);
            }}
            className="w-full rounded-lg bg-[#a88b4a] px-4 py-2 text-white font-bold transition-colors
                     hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2"
          >
            Connect Wallet
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="bg-[#232323] rounded-lg p-4 shadow">
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium">Address:</span>
            <span className="font-mono">{formatAddress(address)}</span>
          </div>
          <div className="h-px bg-gray-200 my-2" />
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium">Points:</span>
            <span>{formatNumber(points)}</span>
          </div>
          <div className="h-px bg-gray-200 my-2" />
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium">Experience:</span>
            <span>{formatNumber(experience)}</span>
          </div>
        </div>
        <button
          onClick={() => {
            handleClose();
            disconnect();
            onDisconnect();
          }}
          className="w-full rounded-lg bg-[#a88b4a] px-4 py-2 text-white transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  };

  const renderLeaderboardTab = () => {
    if (!address) {
      return (
        <div className="text-center p-4">
          <p>Wallet not connected</p>
        </div>
      );
    }

    const userEntry = leaderboard.find((entry) => entry.address === address);
    const areaId = leaderboard[0]?.areaId;

    return (
      <div className="space-y-4">
        <div className="bg-[#232323] rounded-lg shadow">
          {areaId && (
            <div className="bg-[#18181a] p-3 rounded-lg mb-4 border border-[#a88b4a]">
              <p className="text-sm text-yellow-300">
                You are currently in Area {areaId}. Rankings are refreshed every 24 hours and you may be assigned to a
                different area.
              </p>
            </div>
          )}
          <div className="flex justify-between p-4 items-center mb-4">
            <h3 className="text-lg font-semibold">Area {areaId || 'N/A'}</h3>
            <span className="text-sm text-gray-500">Your Rank: #{formatNumber(userEntry?.rank)}</span>
          </div>
          <div className="space-y-2 max-h-96 pr-4 overflow-y-auto" style={{ scrollbarGutter: 'stable' }}>
            {leaderboard.map((entry) => (
              <div
                key={entry.address}
                className={`flex items-center p-2 ${
                  entry.address === address
                    ? 'bg-[#232323] rounded border border-yellow-400'
                    : 'hover:bg-[#3a2e1a]'
                }`}
              >
                <span className="font-medium w-12">#{formatNumber(entry.rank)}</span>
                <span className="flex-1 truncate mx-2">
                  {entry.address === address
                    ? 'You'
                    : `${entry.address.slice(0, 6)}...${entry.address.slice(-4)}`}
                </span>
                <span className="font-medium w-20 text-right">{formatNumber(entry.points)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderTaskCard = (
    title: string,
    description: string,
    current: number,
    target: number,
    isCompleted: boolean,
    isClaimed: boolean,
    taskType: 'points' | 'exp' | 'claim'
  ) => (
    <div className={`p-4 border border-gray-200 rounded-lg ${isCompleted ? 'border-green-500' : ''}`}>
      <div className="flex justify-between items-center mb-2">
        <div>
          <h3 className="font-medium">{title}</h3>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm">
            {formatNumber(current)}/{formatNumber(target)}
          </span>
          {isClaimed && <span className="text-green-500">✓</span>}
        </div>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
        <div
          className={`rounded-full h-2 transition-all duration-300 ${isCompleted ? 'bg-green-500' : 'bg-[#a88b4a]'}`}
          style={{
            width: `${Math.min(((current || 0) / (target || 1)) * 100, 100)}%`
          }}
        />
      </div>
      {isCompleted && !isClaimed && (
        <button
          onClick={() => handleClaimReward(taskType)}
          disabled={isClaimingReward}
          className="w-full rounded-lg bg-[#a88b4a] px-4 py-2 text-white font-bold transition-colors
                   hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2
                   disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isClaimingReward ? 'Claiming...' : 'Claim Reward'}
        </button>
      )}
      {isClaimed && <p className="text-sm text-green-600 mt-2">Claimed! Rewards will be sent to your wallet soon.</p>}
    </div>
  );

  const renderTasksTab = () => (
    <div className="space-y-4">
      {/* Daily Claim Task */}
      <div className="p-4 border border-gray-200 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium">Daily Rewards</h3>
        </div>
        <p className="text-xs text-gray-400 mb-3">
          {hasSeasonPass ? (
            <span className="text-yellow-400">✨ Season Pass Active - Earning 3x points!</span>
          ) : (
            <span>
              Earning 1x points (<span className="text-yellow-400">Upgrade to Season Pass for 3x rewards</span>)
            </span>
          )}
        </p>
        <button
          onClick={handleClaim}
          disabled={isClaiming || !canCheckInToday || !address}
          className="w-full rounded-lg bg-[#a88b4a] px-4 py-2 text-white font-bold transition-colors
                   hover:bg-yellow-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isClaiming ? 'Claiming...' : canCheckInToday ? 'Claim' : 'Already Claimed Today'}
        </button>
      </div>

      {/* Points Achievement Task */}
      {renderTaskCard(
        'Points Master',
        `Accumulate ${taskProgress.pointsTarget} points`,
        points,
        taskProgress.pointsTarget,
        points >= taskProgress.pointsTarget,
        taskProgress.pointsTaskClaimed,
        'points'
      )}

      {/* Experience Achievement Task */}
      {renderTaskCard(
        'Experience Collector',
        `Reach ${taskProgress.expTarget} experience points`,
        experience,
        taskProgress.expTarget,
        experience >= taskProgress.expTarget,
        taskProgress.expTaskClaimed,
        'exp'
      )}

      {/* Claim Count Achievement Task */}
      {renderTaskCard(
        'Loyal Player',
        `Claim daily rewards ${taskProgress.claimTarget} times`,
        taskProgress.claimCount,
        taskProgress.claimTarget,
        taskProgress.claimCount >= taskProgress.claimTarget,
        taskProgress.claimTaskClaimed,
        'claim'
      )}
    </div>
  );

  const renderHowToPlayTab = () => (
    <div className="space-y-6">
      {/* Controls Section - At the top */}
      <div className="bg-[#232323] rounded-lg p-4 shadow">
        <h3 className="text-lg font-semibold mb-4">Game Controls</h3>
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-[#18181a] rounded-lg p-4 border border-[#a88b4a]">
            <div className="mb-4">
              <h4 className="font-medium text-yellow-300 mb-3">Desktop Controls</h4>
              <div className="flex items-center space-x-3">
                <div className="flex space-x-1">
                  <span className="bg-[#232323] px-3 py-1 rounded shadow-sm font-medium text-yellow-300">W</span>
                  <span className="bg-[#232323] px-3 py-1 rounded shadow-sm font-medium text-yellow-300">A</span>
                  <span className="bg-[#232323] px-3 py-1 rounded shadow-sm font-medium text-yellow-300">S</span>
                  <span className="bg-[#232323] px-3 py-1 rounded shadow-sm font-medium text-yellow-300">D</span>
                </div>
                <span className="text-gray-400">Move your character</span>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-yellow-300 mb-3">Mobile & Alternative Controls</h4>
              <div className="bg-[#232323] rounded p-3 border border-[#a88b4a]">
                <p className="text-gray-400">
                  Long-press anywhere on the game screen to reveal the virtual joystick for movement control
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Game Background Story */}
      <div className="bg-[#232323] rounded-lg p-4 shadow border border-[#a88b4a]">
        <h3 className="text-lg font-semibold mb-4">Welcome to VexLand</h3>
        <div className="flex justify-center mb-6">
          <img src="/vexland-logo.png" alt="VexLand Logo" className="w-auto" />
        </div>
        <div className="prose prose-sm text-[#f3e7c2]">
          <p className="mb-3">
            Welcome to VexLand, a world where bravery and strategy meet! In VexLand, players explore dangerous dungeons,
            battle fierce monsters, and discover valuable treasures hidden within the depths. The world of VexLand is a
            vast, ever-changing realm filled with challenges and opportunities, where your decisions and skills
            determine your fate.
          </p>
          <p className="mb-3">
            The land was once a thriving kingdom, but dark forces have overrun it, turning it into a perilous labyrinth
            of shifting landscapes and dangerous creatures. As a lone adventurer, your mission is to journey through the
            dungeons, face powerful bosses, and uncover the secrets that could restore peace to the land—or doom it
            forever.
          </p>
          <p className="mb-3">
            Your quest is not only about survival but about mastering your unique abilities and customizing your
            strategies to overcome the toughest challenges. With a wide range of skills, equipment, and magic at your
            disposal, every dungeon run is a new adventure full of unpredictable twists.
          </p>
          <p>
            Will you be the hero who saves VexLand from its dark fate, or will you fall victim to the endless monsters
            lurking within? The choice is yours.
          </p>
        </div>
      </div>

      {/* Game Overview */}
      <div className="bg-[#232323] rounded-lg p-4 shadow border border-[#a88b4a]">
        <h3 className="text-lg font-semibold mb-4">Game Overview</h3>
        <div className="prose prose-sm text-[#f3e7c2]">
          <p className="mb-4">
            Explore mysterious dungeons, battle fierce monsters, and compete with players worldwide in this exciting
            roguelike adventure. Your progress is recorded on the blockchain, making your achievements truly yours.
          </p>

          <div className="bg-[#18181a] rounded-lg p-4 mb-4 border border-[#a88b4a]">
            <h4 className="font-medium text-yellow-300 mb-2">Daily Activities</h4>
            <p className="text-sm text-[#f3e7c2]">
              Visit daily to claim rewards and maintain your ranking. You'll be assigned to a competitive area where you
              can compete with other players for the top positions.
            </p>
          </div>

          <div className="bg-[#18181a] rounded-lg p-4 border border-[#a88b4a]">
            <h4 className="font-medium text-yellow-300 mb-2">Achievements</h4>
            <p className="text-sm text-[#f3e7c2]">
              Complete various tasks to earn special rewards. Track your progress in the Tasks tab and claim your
              rewards as you reach milestones.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Tips */}
      <div className="bg-[#232323] rounded-lg p-4 shadow border border-[#a88b4a]">
        <h3 className="text-lg font-semibold mb-3">Quick Tips</h3>
        <div className="grid grid-cols-1 gap-3">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-full bg-[#18181a] flex items-center justify-center flex-shrink-0">
              <span className="text-yellow-300 font-medium">1</span>
            </div>
            <p className="text-sm text-[#f3e7c2]">
              Check the leaderboard daily to see your ranking and area assignment
            </p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-full bg-[#18181a] flex items-center justify-center flex-shrink-0">
              <span className="text-yellow-300 font-medium">2</span>
            </div>
            <p className="text-sm text-[#f3e7c2]">Don't forget to claim your daily rewards to boost your progress</p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-full bg-[#18181a] flex items-center justify-center flex-shrink-0">
              <span className="text-yellow-300 font-medium">3</span>
            </div>
            <p className="text-sm text-[#f3e7c2]">Complete tasks to earn special rewards and boost your ranking</p>
          </div>
        </div>
      </div>
    </div>
  );

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        handleClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const handleClose = () => {
    if (intervalRef) {
      clearInterval(intervalRef);
    }
    onClose();
    const gameCanvas = document.getElementById('GameCanvas');
    if (gameCanvas) {
      gameCanvas.focus();
    }
  };

  // Format address to show first 6 and last 4 characters
  const formatAddress = (address: string) => {
    return `${address.slice(0, 9)}...${address.slice(-7)}`;
  };

  const formatNumber = (num: number | undefined | null): string => {
    if (num === undefined || num === null || isNaN(num)) return '0';
    return num.toString();
  };

  // Add cleanup for isClaiming state when component unmounts
  useEffect(() => {
    return () => {
      setIsClaiming(false);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div
        ref={modalRef}
        className={`w-96 rounded-xl ${bgColor} ${borderColor} p-6 shadow-xl relative`}
        style={{ fontFamily: 'serif', boxShadow: '0 0 32px #000b' }}
      >
        {/* Tabs */}
        <div className="relative mb-6">
          <div
            className="overflow-x-auto"
            style={{
              msOverflowStyle: 'none',
              scrollbarWidth: 'none',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            <style>
              {`
                div.overflow-x-auto::-webkit-scrollbar {
                  display: none;
                }
              `}
            </style>
            <div className="flex space-x-6 border-b border-[#a88b4a] min-w-max px-1">
              <button
                onClick={() => {
                  setActiveTab('profile');
                  const tabsContainer = document.querySelector('.overflow-x-auto');
                  const activeTab = document.querySelector(`[data-tab="profile"]`) as HTMLElement;
                  if (tabsContainer && activeTab) {
                    tabsContainer.scrollLeft = activeTab.offsetLeft - 16;
                  }
                }}
                data-tab="profile"
                className={`pb-2 whitespace-nowrap ${
                  activeTab === 'profile'
                    ? 'border-b-2 border-yellow-400 text-yellow-300'
                    : 'text-gray-300 hover:text-yellow-200'
                }`}
              >
                Profile
              </button>
              <button
                onClick={() => {
                  setActiveTab('leaderboard');
                  const tabsContainer = document.querySelector('.overflow-x-auto');
                  const activeTab = document.querySelector(`[data-tab="leaderboard"]`) as HTMLElement;
                  if (tabsContainer && activeTab) {
                    tabsContainer.scrollLeft = activeTab.offsetLeft - 16;
                  }
                }}
                data-tab="leaderboard"
                className={`pb-2 whitespace-nowrap ${
                  activeTab === 'leaderboard'
                    ? 'border-b-2 border-yellow-400 text-yellow-300'
                    : 'text-gray-300 hover:text-yellow-200'
                }`}
              >
                Leaderboard
              </button>
              <button
                onClick={() => {
                  setActiveTab('tasks');
                  const tabsContainer = document.querySelector('.overflow-x-auto');
                  const activeTab = document.querySelector(`[data-tab="tasks"]`) as HTMLElement;
                  if (tabsContainer && activeTab) {
                    tabsContainer.scrollLeft = activeTab.offsetLeft - 16;
                  }
                }}
                data-tab="tasks"
                className={`pb-2 whitespace-nowrap ${
                  activeTab === 'tasks'
                    ? 'border-b-2 border-yellow-400 text-yellow-300'
                    : 'text-gray-300 hover:text-yellow-200'
                }`}
              >
                Tasks
              </button>
              <button
                onClick={() => {
                  setActiveTab('howtoplay');
                  const tabsContainer = document.querySelector('.overflow-x-auto');
                  const activeTab = document.querySelector(`[data-tab="howtoplay"]`) as HTMLElement;
                  if (tabsContainer && activeTab) {
                    tabsContainer.scrollLeft = activeTab.offsetLeft - 16;
                  }
                }}
                data-tab="howtoplay"
                className={`pb-2 whitespace-nowrap ${
                  activeTab === 'howtoplay'
                    ? 'border-b-2 border-yellow-400 text-yellow-300'
                    : 'text-gray-300 hover:text-yellow-200'
                }`}
              >
                How to Play
              </button>
            </div>
          </div>
        </div>
        {/* Tab Content */}
        <div className="overflow-y-auto max-h-[calc(100vh-200px)] text-[#f3e7c2]">
          {activeTab === 'profile' && renderProfileTab()}
          {activeTab === 'leaderboard' && renderLeaderboardTab()}
          {activeTab === 'tasks' && renderTasksTab()}
          {activeTab === 'howtoplay' && renderHowToPlayTab()}
        </div>
        {/* <button
          onClick={handleClose}
          className="absolute right-4 top-4 px-4 py-1 rounded bg-[#a88b4a] text-white font-bold shadow hover:bg-yellow-600 transition-all"
          style={{ letterSpacing: 1 }}
        >
          Close
        </button> */}
      </div>
    </div>
  );
}
