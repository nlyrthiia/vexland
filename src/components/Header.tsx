import DisconnectModal from '@/components/DisconnectModal.tsx';
import ConnectModal from '@/components/ConnectModal.tsx';
import { useAccount, useDisconnect } from 'wagmi';

export const Header = () => {
  const { address: userAddress } = useAccount();
  const { disconnect } = useDisconnect();
  return (
    <header className={'flex justify-between items-center p-5'}>
      <a href="https://vexland.xyz/" target="_blank" className={'flex items-center gap-2'}>
        <img src="/vexland-logo.png" className="logo w-8 h-8" alt="logo" />
        <div>VexLand</div>
      </a>
      {userAddress ? <DisconnectModal address={userAddress} onDisconnect={() => disconnect()} /> : <ConnectModal />}
    </header>
  );
};
