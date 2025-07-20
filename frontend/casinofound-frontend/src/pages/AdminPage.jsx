import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Users, 
  TrendingUp, 
  Coins,
  BarChart3,
  Settings,
  Bell,
  FileText,
  Download,
  Upload,
  Loader2,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { apiClient } from '../lib/api';
import { formatNumber, formatCurrency } from '../lib/web3';

const AdminPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Dashboard data
  const [dashboardData, setDashboardData] = useState(null);
  const [holdersSnapshot, setHoldersSnapshot] = useState(null);
  const [distributions, setDistributions] = useState([]);
  
  // Forms
  const [dividendAmount, setDividendAmount] = useState('');
  const [dividendNotes, setDividendNotes] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState('info');
  const [notificationTarget, setNotificationTarget] = useState('all');

  useEffect(() => {
    checkAuthStatus();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadAdminData();
    }
  }, [isAuthenticated]);

  const checkAuthStatus = async () => {
    try {
      const response = await apiClient.verifyToken();
      if (response.valid && response.user.isAdmin) {
        setIsAuthenticated(true);
      }
    } catch (error) {
      // Not authenticated
    }
  };

  const handleLogin = async () => {
    if (!password) {
      setError('Digite a senha');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await apiClient.loginAdmin(password);
      
      if (response.success) {
        setIsAuthenticated(true);
        setPassword('');
        setSuccess('Login realizado com sucesso!');
      }
    } catch (error) {
      setError(error.message || 'Senha incorreta');
    } finally {
      setLoading(false);
    }
  };

  const loadAdminData = async () => {
    try {
      const [dashboardResponse, snapshotResponse, distributionsResponse] = await Promise.all([
        apiClient.getAdminDashboard(),
        apiClient.getHoldersSnapshot(),
        apiClient.getDividendDistributionsList()
      ]);

      if (dashboardResponse.success) {
        setDashboardData(dashboardResponse.dashboard);
      }

      if (snapshotResponse.success) {
        setHoldersSnapshot(snapshotResponse.snapshot);
      }

      if (distributionsResponse.success) {
        setDistributions(distributionsResponse.distributions);
      }
    } catch (error) {
      console.error('Erro ao carregar dados admin:', error);
      setError('Erro ao carregar dados do painel');
    }
  };

  const handleCreateDividendDistribution = async () => {
    if (!dividendAmount || parseFloat(dividendAmount) <= 0) {
      setError('Digite um valor válido para distribuição');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await apiClient.createDividendDistribution(
        parseFloat(dividendAmount),
        dividendNotes
      );
      
      if (response.success) {
        setSuccess('Distribuição de dividendos criada com sucesso!');
        setDividendAmount('');
        setDividendNotes('');
        await loadAdminData();
      }
    } catch (error) {
      setError(error.message || 'Erro ao criar distribuição');
    } finally {
      setLoading(false);
    }
  };

  const handleSendNotification = async () => {
    if (!notificationMessage) {
      setError('Digite uma mensagem');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await apiClient.sendNotification(
        notificationMessage,
        notificationType,
        notificationTarget
      );
      
      if (response.success) {
        setSuccess(`Notificação enviada para ${response.usersNotified} usuários`);
        setNotificationMessage('');
      }
    } catch (error) {
      setError(error.message || 'Erro ao enviar notificação');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Acesso Administrativo
                </CardTitle>
                <CardDescription>
                  Digite a senha para acessar o painel administrativo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                      placeholder="Digite a senha"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <Button 
                  onClick={handleLogin}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verificando...
                    </>
                  ) : (
                    <>
                      <Shield className="mr-2 h-4 w-4" />
                      Entrar
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Painel Administrativo</h1>
            <p className="text-muted-foreground">
              Gerencie o CasinoFound e monitore métricas importantes
            </p>
          </div>
          <Badge variant="secondary" className="bg-green-500/20 text-green-600">
            <Shield className="mr-1 h-3 w-3" />
            Admin
          </Badge>
        </div>
      </motion.div>

      {/* Alerts */}
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

      {/* Dashboard Stats */}
      {dashboardData && (
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.users.total}</div>
                <p className="text-xs text-muted-foreground">
                  {dashboardData.users.cfdHolders} holders CFD
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tokens Vendidos</CardTitle>
                <Coins className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatNumber(dashboardData.ico.totalTokensSold)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(dashboardData.ico.totalRaised, 'MATIC')} arrecadado
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Elegíveis Dividendos</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardData.users.eligibleForDividends}
                </div>
                <p className="text-xs text-muted-foreground">
                  {dashboardData.users.blockchainEligible} na blockchain
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Dividendos Distribuídos</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${formatNumber(dashboardData.dividends.totalDistributed)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {dashboardData.dividends.totalDistributions} distribuições
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="dividends" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dividends">Dividendos</TabsTrigger>
          <TabsTrigger value="holders">Holders</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>

        {/* Tab Dividendos */}
        <TabsContent value="dividends" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Criar Distribuição */}
            <Card>
              <CardHeader>
                <CardTitle>Criar Distribuição de Dividendos</CardTitle>
                <CardDescription>
                  Distribua lucros em USDT para holders elegíveis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="dividendAmount">Valor Total (USDT)</Label>
                  <Input
                    id="dividendAmount"
                    type="number"
                    value={dividendAmount}
                    onChange={(e) => setDividendAmount(e.target.value)}
                    placeholder="10000"
                    step="0.01"
                  />
                </div>

                <div>
                  <Label htmlFor="dividendNotes">Observações (Opcional)</Label>
                  <Textarea
                    id="dividendNotes"
                    value={dividendNotes}
                    onChange={(e) => setDividendNotes(e.target.value)}
                    placeholder="Distribuição referente aos lucros de..."
                    rows={3}
                  />
                </div>

                <Button 
                  onClick={handleCreateDividendDistribution}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="mr-2 h-4 w-4" />
                      Criar Distribuição
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Histórico de Distribuições */}
            <Card>
              <CardHeader>
                <CardTitle>Distribuições Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                {distributions.length > 0 ? (
                  <div className="space-y-3">
                    {distributions.slice(0, 5).map((dist) => (
                      <div key={dist._id} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                        <div>
                          <div className="font-medium">
                            ${formatNumber(dist.totalAmount)} USDT
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {dist.eligibleHolders} holders • {new Date(dist.createdAt).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                        <Badge variant={
                          dist.status === 'completed' ? 'default' :
                          dist.status === 'processing' ? 'secondary' : 'outline'
                        }>
                          {dist.status === 'completed' ? 'Concluída' :
                           dist.status === 'processing' ? 'Processando' : 'Pendente'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-8 text-muted-foreground">
                    <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma distribuição encontrada</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab Holders */}
        <TabsContent value="holders">
          <Card>
            <CardHeader>
              <CardTitle>Snapshot de Holders</CardTitle>
              <CardDescription>
                Lista de holders elegíveis para dividendos
              </CardDescription>
            </CardHeader>
            <CardContent>
              {holdersSnapshot ? (
                <div className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold">{holdersSnapshot.totalHolders}</div>
                      <div className="text-sm text-muted-foreground">Total Holders</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{holdersSnapshot.eligibleHolders}</div>
                      <div className="text-sm text-muted-foreground">Elegíveis</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{formatNumber(holdersSnapshot.totalTokensEligible)}</div>
                      <div className="text-sm text-muted-foreground">Tokens Elegíveis</div>
                    </div>
                  </div>

                  <div className="max-h-96 overflow-y-auto">
                    <div className="space-y-2">
                      {holdersSnapshot.holders.slice(0, 20).map((holder, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                          <div>
                            <div className="font-mono text-sm">
                              {holder.walletAddress.slice(0, 6)}...{holder.walletAddress.slice(-4)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {holder.source}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">
                              {formatNumber(holder.cfdBalance)} CFD
                            </div>
                            <Badge variant={holder.isEligibleForDividends ? 'default' : 'outline'}>
                              {holder.isEligibleForDividends ? 'Elegível' : 'Aguardando'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button variant="outline" className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Exportar Lista Completa
                  </Button>
                </div>
              ) : (
                <div className="text-center p-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Carregando snapshot...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Notificações */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Enviar Notificação</CardTitle>
              <CardDescription>
                Envie mensagens para usuários da plataforma
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="notificationType">Tipo</Label>
                  <Select value={notificationType} onValueChange={setNotificationType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">Informação</SelectItem>
                      <SelectItem value="success">Sucesso</SelectItem>
                      <SelectItem value="warning">Aviso</SelectItem>
                      <SelectItem value="error">Erro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="notificationTarget">Destinatários</Label>
                  <Select value={notificationTarget} onValueChange={setNotificationTarget}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os usuários</SelectItem>
                      <SelectItem value="holders">Apenas holders CFD</SelectItem>
                      <SelectItem value="eligible">Apenas elegíveis para dividendos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="notificationMessage">Mensagem</Label>
                <Textarea
                  id="notificationMessage"
                  value={notificationMessage}
                  onChange={(e) => setNotificationMessage(e.target.value)}
                  placeholder="Digite sua mensagem..."
                  rows={4}
                />
              </div>

              <Button 
                onClick={handleSendNotification}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Bell className="mr-2 h-4 w-4" />
                    Enviar Notificação
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Relatórios */}
        <TabsContent value="reports">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Upload de Relatório</CardTitle>
                <CardDescription>
                  Envie relatórios financeiros para os holders
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="reportFile">Arquivo (PDF, DOC, DOCX)</Label>
                  <Input
                    id="reportFile"
                    type="file"
                    accept=".pdf,.doc,.docx"
                  />
                </div>

                <div>
                  <Label htmlFor="reportTitle">Título</Label>
                  <Input
                    id="reportTitle"
                    placeholder="Relatório Financeiro Q1 2024"
                  />
                </div>

                <div>
                  <Label htmlFor="reportDescription">Descrição</Label>
                  <Textarea
                    id="reportDescription"
                    placeholder="Descrição do relatório..."
                    rows={3}
                  />
                </div>

                <Button className="w-full">
                  <Upload className="mr-2 h-4 w-4" />
                  Enviar Relatório
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Relatórios Disponíveis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center p-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum relatório encontrado</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPage;

