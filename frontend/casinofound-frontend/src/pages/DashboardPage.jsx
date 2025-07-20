import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Wallet, 
  TrendingUp, 
  Clock, 
  Gift,
  History,
  Calculator,
  RefreshCw,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useAuth } from '../hooks/useAuth';
import { apiClient } from '../lib/api';
import { formatNumber, formatCurrency, formatAddress } from '../lib/web3';

const DashboardPage = () => {
  const { isConnected, address, user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dividendInfo, setDividendInfo] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [projection, setProjection] = useState(null);
  const [monthlyProfit, setMonthlyProfit] = useState('100000');
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [balances, setBalances] = useState({
    cfd: '0',
    matic: '0',
    usdt: '0'
  });

  useEffect(() => {
    if (isConnected && address && user) {
      loadDashboardData();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [isConnected, address, user, authLoading]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      // Carregar dados em paralelo
      const [dividendResponse, transactionResponse, balanceResponse] = await Promise.all([
        apiClient.get(`/dividends/info/${address}`).catch(() => ({ data: { success: false } })),
        apiClient.get(`/ico/purchases/${address}`).catch(() => ({ data: { success: false, purchases: [] } })),
        apiClient.get(`/wallet/balance/${address}`).catch(() => ({ data: { success: false } }))
      ]);

      // Processar dividendos
      if (dividendResponse.data.success) {
        setDividendInfo(dividendResponse.data.dividendInfo);
      }

      // Processar transações
      if (transactionResponse.data.success) {
        setTransactions(transactionResponse.data.purchases || []);
      }

      // Processar saldos
      if (balanceResponse.data.success) {
        setBalances(balanceResponse.data.balances);
      }

      // Calcular projeção inicial
      calculateProjection(monthlyProfit);

    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      setError('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  const calculateProjection = (profit) => {
    if (!dividendInfo || !profit) return;

    const monthlyProfitNum = parseFloat(profit);
    const userTokens = parseFloat(balances.cfd);
    const totalSupply = 21000000; // 21M tokens
    
    if (userTokens === 0) {
      setProjection({
        monthlyDividend: 0,
        yearlyDividend: 0,
        userPercentage: 0
      });
      return;
    }

    const userPercentage = (userTokens / totalSupply) * 100;
    const monthlyDividend = (monthlyProfitNum * 0.6 * userTokens) / totalSupply; // 60% dos lucros
    const yearlyDividend = monthlyDividend * 12;

    setProjection({
      monthlyDividend,
      yearlyDividend,
      userPercentage
    });
  };

  const handleClaimDividends = async () => {
    try {
      setClaiming(true);
      setError('');
      setSuccess('');

      const response = await apiClient.post('/dividends/claim', {
        walletAddress: address
      });

      if (response.data.success) {
        setSuccess('Dividendos reivindicados com sucesso!');
        await loadDashboardData(); // Recarregar dados
      } else {
        setError(response.data.error || 'Erro ao reivindicar dividendos');
      }
    } catch (error) {
      console.error('Erro ao reivindicar dividendos:', error);
      setError(error.response?.data?.error || 'Erro ao reivindicar dividendos');
    } finally {
      setClaiming(false);
    }
  };

  const handleRefresh = () => {
    loadDashboardData();
  };

  // Recalcular projeção quando lucro mensal muda
  useEffect(() => {
    calculateProjection(monthlyProfit);
  }, [monthlyProfit, dividendInfo, balances]);

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Carregando dashboard...</span>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <Wallet className="h-16 w-16 mx-auto mb-6 text-muted-foreground" />
          <h1 className="text-3xl font-bold mb-4">Dashboard do Holder</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Conecte sua wallet para acessar seu dashboard
          </p>
          <w3m-button />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold">Dashboard do Holder</h1>
            <p className="text-muted-foreground">
              Wallet: {formatAddress(address)}
            </p>
          </div>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-4">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Coluna Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cards de Saldo */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Tokens CFD</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {formatNumber(balances.cfd)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Tokens em posse
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Saldo MATIC</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(balances.matic, 'MATIC')}
                </div>
                <p className="text-xs text-muted-foreground">
                  Para transações
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Dividendos USDT</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(dividendInfo?.availableDividends || 0, 'USDT')}
                </div>
                <p className="text-xs text-muted-foreground">
                  Disponível para saque
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="dividends" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="dividends">Dividendos</TabsTrigger>
              <TabsTrigger value="transactions">Transações</TabsTrigger>
              <TabsTrigger value="calculator">Calculadora</TabsTrigger>
            </TabsList>

            {/* Tab Dividendos */}
            <TabsContent value="dividends" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gift className="h-5 w-5" />
                    Status dos Dividendos
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {dividendInfo ? (
                    <>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label>Elegível para Dividendos</Label>
                          <div className="flex items-center gap-2 mt-1">
                            {dividendInfo.isEligible ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <Clock className="h-4 w-4 text-yellow-600" />
                            )}
                            <span className={dividendInfo.isEligible ? 'text-green-600' : 'text-yellow-600'}>
                              {dividendInfo.isEligible ? 'Sim' : 'Não (aguarde 30 dias)'}
                            </span>
                          </div>
                        </div>

                        <div>
                          <Label>Dias de Posse</Label>
                          <div className="text-lg font-semibold mt-1">
                            {dividendInfo.daysHolding || 0} dias
                          </div>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label>Total Recebido</Label>
                          <div className="text-lg font-semibold text-green-600 mt-1">
                            {formatCurrency(dividendInfo.totalReceived || 0, 'USDT')}
                          </div>
                        </div>

                        <div>
                          <Label>Última Distribuição</Label>
                          <div className="text-sm text-muted-foreground mt-1">
                            {dividendInfo.lastDistribution 
                              ? new Date(dividendInfo.lastDistribution).toLocaleDateString('pt-BR')
                              : 'Nenhuma'
                            }
                          </div>
                        </div>
                      </div>

                      {dividendInfo.isEligible && dividendInfo.availableDividends > 0 && (
                        <Button 
                          onClick={handleClaimDividends}
                          disabled={claiming}
                          className="w-full"
                        >
                          {claiming ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Reivindicando...
                            </>
                          ) : (
                            <>
                              <Gift className="mr-2 h-4 w-4" />
                              Reivindicar {formatCurrency(dividendInfo.availableDividends, 'USDT')}
                            </>
                          )}
                        </Button>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <Gift className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        Nenhuma informação de dividendos disponível
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab Transações */}
            <TabsContent value="transactions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5" />
                    Histórico de Transações
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {transactions.length > 0 ? (
                    <div className="space-y-3">
                      {transactions.map((tx) => (
                        <div key={tx._id} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                          <div>
                            <div className="font-medium">
                              {formatNumber(tx.tokensReceived)} CFD
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(tx.createdAt).toLocaleDateString('pt-BR')}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">
                              {formatCurrency(tx.amount, 'MATIC')}
                            </div>
                            <Badge variant="outline">
                              Fase {tx.icoPhase}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <History className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        Nenhuma transação encontrada
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab Calculadora */}
            <TabsContent value="calculator" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Calculadora de Dividendos
                  </CardTitle>
                  <CardDescription>
                    Simule seus dividendos baseado no lucro mensal do casino
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="monthlyProfit">Lucro Mensal do Casino (USDT)</Label>
                    <Input
                      id="monthlyProfit"
                      type="number"
                      value={monthlyProfit}
                      onChange={(e) => setMonthlyProfit(e.target.value)}
                      placeholder="100000"
                    />
                  </div>

                  {projection && (
                    <div className="space-y-3 p-4 bg-primary/5 rounded-lg">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Sua Participação</Label>
                          <div className="text-lg font-semibold">
                            {formatNumber(projection.userPercentage, 6)}%
                          </div>
                        </div>
                        <div>
                          <Label>Dividendo Mensal</Label>
                          <div className="text-lg font-semibold text-green-600">
                            {formatCurrency(projection.monthlyDividend, 'USDT')}
                          </div>
                        </div>
                      </div>
                      <div>
                        <Label>Dividendo Anual (Estimado)</Label>
                        <div className="text-xl font-bold text-green-600">
                          {formatCurrency(projection.yearlyDividend, 'USDT')}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status da Conta */}
          <Card>
            <CardHeader>
              <CardTitle>Status da Conta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>Tipo de Usuário</span>
                <Badge variant={user?.isAdmin ? 'default' : 'secondary'}>
                  {user?.isAdmin ? 'Admin' : 'Holder'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Membro desde</span>
                <span className="text-sm">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-BR') : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Status</span>
                <Badge variant="outline" className="text-green-600">
                  Ativo
                </Badge>
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
                Ver no PolygonScan
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <ExternalLink className="mr-2 h-4 w-4" />
                Whitepaper
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <ExternalLink className="mr-2 h-4 w-4" />
                Suporte
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

