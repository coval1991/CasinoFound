import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Coins,
  TrendingUp,
  Clock,
  Users,
  Shield,
  AlertCircle,
  CheckCircle,
  Loader2,
  ExternalLink,
  Gift
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

import { useWeb3ModalProvider, useWeb3ModalAccount } from '@web3modal/ethers/react';
import { BrowserProvider, Contract, parseEther } from 'ethers';
import { useAuth } from '../hooks/useAuth';
import { apiClient } from '../lib/api';
import { formatNumber, formatCurrency } from '../lib/web3';

// Endereços dos contratos
const ICO_PHASE1_ADDRESS = '0x8008A571414ebAF2f965a5a8d34D78cEfa8BD8bD';

// ABI simplificada para compra
const ICO_PHASE1_ABI = [
  {
    "inputs": [
      {
        "internalType": "address payable",
        "name": "affiliate",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "payAffiliate",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  }
];

const ICOPage = () => {
  const { walletProvider } = useWeb3ModalProvider();
  const { address, isConnected } = useWeb3ModalAccount();
  const { user, isAuthenticated } = useAuth();

  const [icoStatus, setIcoStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseAmount, setPurchaseAmount] = useState('');
  const [affiliateCode, setAffiliateCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [countdown, setCountdown] = useState(null);

  useEffect(() => {
    loadICOStatus();
    const interval = setInterval(loadICOStatus, 30000); // Atualizar a cada 30 segundos
    return () => clearInterval(interval);
  }, []);

  // Countdown timer
  useEffect(() => {
    if (icoStatus?.ico?.currentPhase?.endDate) {
      const interval = setInterval(() => {
        const now = new Date().getTime();
        const endTime = new Date(icoStatus.ico.currentPhase.endDate).getTime();
        const distance = endTime - now;

        if (distance > 0) {
          const days = Math.floor(distance / (1000 * 60 * 60 * 24));
          const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((distance % (1000 * 60)) / 1000);

          setCountdown({ days, hours, minutes, seconds });
        } else {
          setCountdown(null);
          loadICOStatus(); // Recarregar status quando terminar
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [icoStatus?.ico?.currentPhase?.endDate]);

  const loadICOStatus = async () => {
    try {
      const response = await apiClient.get('/ico/status');
      if (response.data.success) {
        setIcoStatus(response.data);
      } else {
        setError('Erro ao carregar status da ICO');
      }
    } catch (error) {
      console.error('Erro ao carregar ICO:', error);
      setError('Erro ao carregar dados da ICO');
    } finally {
      setLoading(false);
    }
  };

  const calculateTokens = (amountInMatic) => {
    if (!icoStatus?.ico?.currentPhase || !amountInMatic) return { base: 0, bonus: 0, total: 0 };

    const phase = icoStatus.ico.currentPhase;
    const baseTokens = parseFloat(amountInMatic) / phase.tokenPrice;
    const bonusTokens = baseTokens * (phase.bonusPercentage / 100);
    const totalTokens = baseTokens + bonusTokens;

    return {
      base: baseTokens,
      bonus: bonusTokens,
      total: totalTokens
    };
  };

  const handlePurchase = async () => {
    if (!isConnected || !walletProvider) {
      setError('Conecte sua wallet primeiro');
      return;
    }

    if (!purchaseAmount || parseFloat(purchaseAmount) <= 0) {
      setError('Digite um valor válido');
      return;
    }

    const currentPhase = icoStatus?.ico?.currentPhase;
    if (!currentPhase) {
      setError('Nenhuma fase ativa encontrada');
      return;
    }

    if (parseFloat(purchaseAmount) < currentPhase.minPurchase) {
      setError(`Valor mínimo: ${currentPhase.minPurchase} MATIC`);
      return;
    }

    if (parseFloat(purchaseAmount) > currentPhase.maxPurchase) {
      setError(`Valor máximo: ${currentPhase.maxPurchase} MATIC`);
      return;
    }

    try {
      setPurchasing(true);
      setError('');
      setSuccess('');

      // Criar provider do ethers
      const ethersProvider = new BrowserProvider(walletProvider);
      const signer = await ethersProvider.getSigner();

      // Criar contrato
      const contract = new Contract(ICO_PHASE1_ADDRESS, ICO_PHASE1_ABI, signer);

      // Preparar transação
      const amountWei = parseEther(purchaseAmount);
      const affiliateAddress = affiliateCode || '0x0000000000000000000000000000000000000000';

      // Enviar transação
      const tx = await contract.payAffiliate(affiliateAddress, amountWei, {
        value: amountWei
      });

      setSuccess('Transação enviada! Aguardando confirmação...');

      // Aguardar confirmação
      const receipt = await tx.wait();

      // Registrar compra no backend
      const purchaseData = {
        walletAddress: address,
        amountInMatic: purchaseAmount,
        phase: currentPhase.phase,
        txHash: receipt.hash,
        affiliateCode: affiliateCode || null
      };

      const response = await apiClient.post('/ico/purchase', purchaseData);

      if (response.data.success) {
        setSuccess('Compra realizada com sucesso!');
        setPurchaseAmount('');
        setAffiliateCode('');
        await loadICOStatus(); // Recarregar dados
      } else {
        setError(response.data.error || 'Erro ao registrar compra');
      }

    } catch (error) {
      console.error('Erro na compra:', error);
      if (error.code === 'ACTION_REJECTED') {
        setError('Transação cancelada pelo usuário');
      } else if (error.code === 'INSUFFICIENT_FUNDS') {
        setError('Saldo insuficiente');
      } else {
        setError(error.message || 'Erro na transação');
      }
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Carregando ICO...</span>
        </div>
      </div>
    );
  }

  if (!icoStatus?.success) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Erro ao carregar dados da ICO. Tente novamente mais tarde.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const currentPhase = icoStatus.ico.currentPhase;
  const phases = icoStatus.ico.phases;
  const overall = icoStatus.ico.overall;
  const tokens = calculateTokens(purchaseAmount);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold mb-4">ICO CasinoFound (CFD)</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Participe da venda de tokens e torne-se um holder do futuro dos casinos online
        </p>

        {currentPhase && (
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-center gap-2">
                  <Coins className="h-6 w-6" />
                  {currentPhase.name}
                </CardTitle>
                <CardDescription>{currentPhase.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      ${formatNumber(currentPhase.tokenPrice, 3)}
                    </div>
                    <div className="text-sm text-muted-foreground">Preço por Token</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {currentPhase.bonusPercentage}%
                    </div>
                    <div className="text-sm text-muted-foreground">Bônus</div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span>Progresso da Fase</span>
                    <span>{formatNumber(currentPhase.progress, 2)}%</span>
                  </div>
                  <Progress value={currentPhase.progress} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{formatNumber(currentPhase.tokensSold)} vendidos</span>
                    <span>{formatNumber(currentPhase.totalTokens)} total</span>
                  </div>
                </div>

                {countdown && (
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground mb-2">Tempo restante:</div>
                    <div className="grid grid-cols-4 gap-2 max-w-xs mx-auto">
                      <div className="bg-primary/10 rounded p-2">
                        <div className="font-bold">{countdown.days}</div>
                        <div className="text-xs">Dias</div>
                      </div>
                      <div className="bg-primary/10 rounded p-2">
                        <div className="font-bold">{countdown.hours}</div>
                        <div className="text-xs">Horas</div>
                      </div>
                      <div className="bg-primary/10 rounded p-2">
                        <div className="font-bold">{countdown.minutes}</div>
                        <div className="text-xs">Min</div>
                      </div>
                      <div className="bg-primary/10 rounded p-2">
                        <div className="font-bold">{countdown.seconds}</div>
                        <div className="text-xs">Seg</div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </motion.div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-6">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Coluna Principal - Compra */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Comprar Tokens CFD</CardTitle>
              <CardDescription>
                {isConnected 
                  ? `Conectado: ${address?.slice(0, 6)}...${address?.slice(-4)}`
                  : 'Conecte sua wallet para comprar tokens'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isConnected ? (
                <div className="text-center py-8">
                  <Coins className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">
                    Conecte sua wallet para participar da ICO
                  </p>
                  <w3m-button />
                </div>
              ) : (
                <>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="amount">Valor em MATIC</Label>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="0.1"
                        value={purchaseAmount}
                        onChange={(e) => setPurchaseAmount(e.target.value)}
                        min={currentPhase?.minPurchase}
                        max={currentPhase?.maxPurchase}
                        step="0.01"
                      />
                      {currentPhase && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Min: {currentPhase.minPurchase} MATIC | Max: {currentPhase.maxPurchase} MATIC
                        </div>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="affiliate">Código de Afiliado (Opcional)</Label>
                      <Input
                        id="affiliate"
                        placeholder="0x..."
                        value={affiliateCode}
                        onChange={(e) => setAffiliateCode(e.target.value)}
                      />
                    </div>
                  </div>

                  {purchaseAmount && tokens.total > 0 && (
                    <div className="bg-primary/5 rounded-lg p-4 space-y-2">
                      <h4 className="font-semibold">Resumo da Compra:</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Tokens Base:</span>
                          <div className="font-semibold">{formatNumber(tokens.base)} CFD</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Tokens Bônus:</span>
                          <div className="font-semibold text-green-600">
                            +{formatNumber(tokens.bonus)} CFD ({currentPhase?.bonusPercentage}%)
                          </div>
                        </div>
                      </div>
                      <div className="border-t pt-2">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold">Total de Tokens:</span>
                          <span className="text-lg font-bold text-primary">
                            {formatNumber(tokens.total)} CFD
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <Button 
                    onClick={handlePurchase}
                    disabled={purchasing || !purchaseAmount || parseFloat(purchaseAmount) <= 0}
                    className="w-full"
                    size="lg"
                  >
                    {purchasing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      <>
                        <Coins className="mr-2 h-4 w-4" />
                        Comprar Tokens
                      </>
                    )}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Estatísticas Gerais */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Estatísticas da ICO</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {formatNumber(overall?.totalTokensSold || 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Tokens Vendidos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(overall?.totalRaised || 0, 'MATIC')}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Arrecadado</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {formatNumber(overall?.overallProgress || 0, 1)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Progresso Geral</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Fases da ICO */}
          <Card>
            <CardHeader>
              <CardTitle>Fases da ICO</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {phases?.map((phase) => (
                <div 
                  key={phase.phase}
                  className={`p-3 rounded-lg border ${
                    phase.isActive ? 'border-primary bg-primary/5' : 
                    phase.isCompleted ? 'border-green-500 bg-green-50' : 
                    'border-muted'
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold">Fase {phase.phase}</span>
                    <Badge variant={
                      phase.isActive ? 'default' : 
                      phase.isCompleted ? 'secondary' : 
                      'outline'
                    }>
                      {phase.isActive ? 'Ativa' : 
                       phase.isCompleted ? 'Completa' : 
                       'Pendente'}
                    </Badge>
                  </div>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>Preço:</span>
                      <span>${formatNumber(phase.tokenPrice, 3)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Bônus:</span>
                      <span>{phase.bonusPercentage}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Progresso:</span>
                      <span>{formatNumber(phase.progress || 0, 1)}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Informações Importantes */}
          <Card>
            <CardHeader>
              <CardTitle>Informações Importantes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <Shield className="h-4 w-4 mt-0.5 text-green-600" />
                <div>
                  <div className="font-semibold">Segurança</div>
                  <div className="text-muted-foreground">
                    Contratos auditados e verificados na blockchain
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Gift className="h-4 w-4 mt-0.5 text-blue-600" />
                <div>
                  <div className="font-semibold">Dividendos</div>
                  <div className="text-muted-foreground">
                    60% dos lucros distribuídos mensalmente
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Users className="h-4 w-4 mt-0.5 text-purple-600" />
                <div>
                  <div className="font-semibold">Comunidade</div>
                  <div className="text-muted-foreground">
                    Participe das decisões do projeto
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Links Úteis */}
          <Card>
            <CardHeader>
              <CardTitle>Links Úteis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <ExternalLink className="mr-2 h-4 w-4" />
                Whitepaper
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <ExternalLink className="mr-2 h-4 w-4" />
                Contrato no PolygonScan
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <ExternalLink className="mr-2 h-4 w-4" />
                Telegram
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ICOPage;

