import React from 'react';
import { Wallet, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { useWeb3 } from '../hooks/useWeb3';
import { formatAddress } from '../lib/web3';

const WalletConnect = ({ onConnect, showBalance = true, compact = false }) => {
  const {
    isConnected,
    account,
    isConnecting,
    error,
    balances,
    isMetaMaskInstalled,
    connect,
    disconnect
  } = useWeb3();

  const handleConnect = async () => {
    const success = await connect();
    if (success && onConnect) {
      onConnect(account);
    }
  };

  if (!isMetaMaskInstalled) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            MetaMask Necessário
          </CardTitle>
          <CardDescription>
            Para usar o CasinoFound, você precisa instalar o MetaMask
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => window.open('https://metamask.io/download/', '_blank')}
            className="w-full"
          >
            Instalar MetaMask
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (compact && isConnected) {
    return (
      <div className="flex items-center gap-3">
        {showBalance && (
          <div className="text-sm text-muted-foreground">
            {parseFloat(balances.cfd).toFixed(2)} CFD
          </div>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={disconnect}
          className="flex items-center gap-2"
        >
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          {formatAddress(account)}
        </Button>
      </div>
    );
  }

  if (isConnected) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            Wallet Conectada
          </CardTitle>
          <CardDescription>
            {formatAddress(account)}
          </CardDescription>
        </CardHeader>
        {showBalance && (
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">
                  {parseFloat(balances.cfd).toFixed(2)}
                </div>
                <div className="text-xs text-muted-foreground">CFD</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {parseFloat(balances.matic).toFixed(3)}
                </div>
                <div className="text-xs text-muted-foreground">MATIC</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-secondary">
                  {parseFloat(balances.usdt).toFixed(2)}
                </div>
                <div className="text-xs text-muted-foreground">USDT</div>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={disconnect}
              className="w-full"
            >
              Desconectar
            </Button>
          </CardContent>
        )}
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Conectar Wallet
        </CardTitle>
        <CardDescription>
          Conecte sua wallet MetaMask para acessar o CasinoFound
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <Button 
          onClick={handleConnect}
          disabled={isConnecting}
          className="w-full"
        >
          {isConnecting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Conectando...
            </>
          ) : (
            <>
              <Wallet className="mr-2 h-4 w-4" />
              Conectar MetaMask
            </>
          )}
        </Button>
        
        <div className="text-xs text-muted-foreground text-center">
          Certifique-se de estar na rede Polygon
        </div>
      </CardContent>
    </Card>
  );
};

export default WalletConnect;

