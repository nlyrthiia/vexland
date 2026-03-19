import { useEffect, useState } from 'react';
import { useAccount, useDisconnect, useWriteContract } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import styles from './CocosGame.module.css';
import Profile from './Profile';
import { track } from '@vercel/analytics';
import BackpackModal from './BackpackModal';
import StoreModal from './StoreModal';
import { recordWalletSignatureConfig } from '@/lib/vexlandContract';

// Add type declaration for SystemJS
declare const System: {
  import(moduleName: string): Promise<any>;
};

// Add type for analytics events
type AnalyticsEvent = {
  wallet_address?: string;
  timestamp?: string;
  duration?: number;
  error?: string;
  success?: boolean;
  wallet_type?: string;
  task_type?: string;
  script?: string;
};

declare module 'react' {
  interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
    cc_exact_fit_screen?: string;
  }
}

export default function CocosGame() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { writeContract } = useWriteContract();

  const [isBrowser, setIsBrowser] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [gameInstance, setGameInstance] = useState<any>(null);
  const [lastClaimTimestamp, setLastClaimTimestamp] = useState(0);
  const [showBackpack, setShowBackpack] = useState(false);
  const [showStore, setShowStore] = useState(false);
  const [hasRecordedUser, setHasRecordedUser] = useState(false);

  useEffect(() => {
    setIsBrowser(true);
  }, []);

  useEffect(() => {
    if (!isConnected || !address) return;

    const recordedKey = `recorded_signature_${address}`;
    const alreadyRecorded = localStorage.getItem(recordedKey);

    if (alreadyRecorded) {
      setHasRecordedUser(true);
      return;
    }

    writeContract(recordWalletSignatureConfig(), {
      onSuccess: () => {
        localStorage.setItem(recordedKey, 'true');
        setHasRecordedUser(true);
        track('user_signature_recorded', { wallet_address: address });
      },
      onError: (error: Error) => {
        console.log('Signature record status:', error);
      },
    });
  }, [isConnected, address, writeContract]);

  useEffect(() => {
    if (!isConnected || !isBrowser || isInitialized) return;

    let isComponentMounted = true;

    // Track game session start
    const analyticsData: AnalyticsEvent = {
      wallet_address: address || '',
      timestamp: new Date().toISOString()
    };
    track('game_session_start', analyticsData);

    const loadScript = (src: string, type?: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        const existingScript = document.querySelector(`script[src="${src}"]`);
        if (existingScript) {
          resolve();
          return;
        }

        const script = document.createElement('script');
        script.src = src;
        if (type) {
          script.type = type;
        }
        script.onload = () => {
          console.log(`Loaded script: ${src}`);
          resolve();
        };
        script.onerror = (e) => {
          console.error(`Error loading script ${src}:`, e);
          track('script_load_error', {
            script: src,
            error: e.toString()
          });
          reject(e);
        };
        document.body.appendChild(script);
      });
    };

    const loadStyle = () => {
      const existingStyle = document.querySelector('link[href="/style.css"]');
      if (existingStyle) return;

      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.type = 'text/css';
      link.href = '/style.css';
      link.onload = () => console.log('Loaded style.css');
      link.onerror = (e) => console.error('Error loading style.css:', e);
      document.head.appendChild(link);
    };

    const initGame = async () => {
      if (!isComponentMounted) return;

      try {
        console.log('Starting game initialization...');
        track('game_initialization_start');
        loadStyle();

        await loadScript('/src/polyfills.bundle.js');
        await loadScript('/src/system.bundle.js');

        const existingImportMap = document.querySelector('script[type="systemjs-importmap"]');
        if (!existingImportMap) {
          const importMapScript = document.createElement('script');
          importMapScript.type = 'systemjs-importmap';
          importMapScript.textContent = JSON.stringify({
            imports: {
              cc: '/cocos-js/cc.js'
            }
          });
          document.body.appendChild(importMapScript);
          console.log('Added import map');
        }

        await new Promise((resolve) => setTimeout(resolve, 100));

        if (typeof System === 'undefined') {
          throw new Error('SystemJS not initialized');
        }

        console.log('Starting game load...');
        const game = await System.import('/index.js');
        if (isComponentMounted) {
          setGameInstance(game);
          setIsInitialized(true);
          console.log('Game loaded successfully');

          setTimeout(() => {
            const gameCanvas = document.getElementById('GameCanvas');
            if (gameCanvas) {
              gameCanvas.focus();
            }
          }, 1000);

          track('game_initialization_complete', {
            success: true
          });
        }
      } catch (error: any) {
        if (isComponentMounted) {
          console.error('Failed to initialize game:', error);
          track('game_initialization_error', {
            error: error?.message || error?.toString() || 'Unknown error'
          });
        }
      }
    };

    initGame();

    return () => {
      isComponentMounted = false;
      if (isInitialized) {
        const endData: AnalyticsEvent = {
          wallet_address: address || '',
          duration: Date.now() - lastClaimTimestamp
        };
        track('game_session_end', endData);
        cleanupGameResources();
      }
    };
  }, [isConnected, isBrowser, isInitialized, address, lastClaimTimestamp]);

  const cleanupGameResources = () => {
    console.log('Cleaning up game resources...');

    try {
      const anyWindow = window as any;
      if (anyWindow.cc) {
        if (anyWindow.cc.audioEngine) {
          anyWindow.cc.audioEngine.stopAll();
          anyWindow.cc.audioEngine.uncacheAll();
        }
        if (anyWindow.cc.game) {
          anyWindow.cc.game.pause();
          anyWindow.cc.game.end();
          anyWindow.cc.game = null;
        }
        if (anyWindow.cc.sys && anyWindow.cc.sys.capabilities.audio) {
          const audioContext = anyWindow.cc.sys.__audioSupport?.context;
          if (audioContext && audioContext.close) {
            audioContext.close();
          }
        }
        if (anyWindow.cc.renderer) {
          anyWindow.cc.renderer.clear();
        }
        if (anyWindow.cc.assetManager) {
          anyWindow.cc.assetManager.releaseAll();
        }
        delete anyWindow.cc;
      }
      if (anyWindow.game) {
        anyWindow.game = null;
      }
      if (anyWindow.cocosGame) {
        anyWindow.cocosGame = null;
      }
    } catch (error) {
      console.error('Error cleaning up game instance:', error);
    }

    const scripts = document.querySelectorAll('script');
    scripts.forEach((script) => {
      if (script.src.includes('/')) {
        script.remove();
      }
    });

    const styleElements = document.querySelectorAll('link');
    styleElements.forEach((style) => {
      if (style.href.includes('/')) {
        style.remove();
      }
    });

    const gameDiv = document.getElementById('GameDiv');
    if (gameDiv) {
      gameDiv.innerHTML = '';
      gameDiv.remove();
    }

    const cocosContainer = document.getElementById('Cocos3dGameContainer');
    if (cocosContainer) {
      cocosContainer.innerHTML = '';
      cocosContainer.remove();
    }

    const canvas = document.getElementById('GameCanvas') as HTMLCanvasElement;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, (canvas as HTMLCanvasElement).width, (canvas as HTMLCanvasElement).height);
      }
      canvas.remove();
    }

    setGameInstance(null);

    if (window.gc) {
      try {
        window.gc();
      } catch (error) {
        console.error('Error forcing garbage collection:', error);
      }
    }

    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  const handleDisconnect = async () => {
    try {
      disconnect();
      cleanupGameResources();
      setShowProfile(false);

      setTimeout(() => {
        const root = document.documentElement;
        root.style.height = '100%';
        document.body.style.height = '100%';
        document.body.style.margin = '0';
        document.body.style.padding = '0';
      }, 0);
    } catch (error) {
      console.error('Failed to disconnect:', error);
    }
  };

  if (!isConnected) {
    return (
      <div
        style={{
          backgroundColor: '#000000',
          backgroundImage: 'url("/imgs/bg@2x.png")',
          backgroundSize: 'auto 100vh',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          position: 'fixed',
          width: '100%',
          height: '100vh',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-end',
          padding: '0 20px 40px'
        }}
      >
        <div className="mb-52">
          <ConnectButton />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="absolute left-4 top-3 z-10 flex flex-col gap-2">
        <button onClick={() => setShowProfile(true)} className="rounded bg-[#50666c] px-4 py-2 text-sm text-white">
          Profile
        </button>
        <button onClick={() => setShowBackpack(true)} className="rounded bg-[#50666c] px-4 py-2 text-sm text-white">
          Backpack
        </button>
        <button onClick={() => setShowStore(true)} className="rounded bg-[#50666c] px-4 py-2 text-sm text-white">
          Store
        </button>
      </div>
      {showProfile && (
        <Profile
          onDisconnect={() => {
            handleDisconnect();
            const gameCanvas = document.getElementById('GameCanvas');
            if (gameCanvas) {
              gameCanvas.focus();
            }
          }}
          onClose={() => {
            setShowProfile(false);
            const gameCanvas = document.getElementById('GameCanvas');
            if (gameCanvas) {
              gameCanvas.focus();
            }
          }}
        />
      )}
      {showBackpack && (
        <BackpackModal
          onClose={() => {
            setShowBackpack(false);
            const gameCanvas = document.getElementById('GameCanvas');
            if (gameCanvas) {
              gameCanvas.focus();
            }
          }}
        />
      )}
      {showStore && (
        <StoreModal
          onClose={() => {
            setShowStore(false);
            const gameCanvas = document.getElementById('GameCanvas');
            if (gameCanvas) {
              gameCanvas.focus();
            }
          }}
        />
      )}
      <div id="GameDiv" data-cc-exact-fit-screen="true" className={styles.gameContainer}>
        <div id="Cocos3dGameContainer">
          <canvas id="GameCanvas" onContextMenu={(e) => e.preventDefault()} tabIndex={99} />
        </div>
      </div>
    </div>
  );
}
