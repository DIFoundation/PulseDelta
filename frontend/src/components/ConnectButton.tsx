import { useAccount, useConnect } from "wagmi";
import { Button } from "@/components/ui/button";

export default function ConnectButton() {
  const { isConnected } = useAccount();
  const { connectors, connect } = useConnect();

  if (isConnected) {
    return null;
  }

  const handleConnect = () => {
    if (connectors[0]) {
      connect({ connector: connectors[0] });
    }
  };

  return <Button onClick={handleConnect}>Connect Wallet</Button>;
}
