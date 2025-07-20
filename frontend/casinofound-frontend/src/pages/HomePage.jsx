import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Coins, 
  TrendingUp, 
  Shield, 
  Users, 
  Clock, 
  ExternalLink,
  Play,
  ChevronRight,
  Star,
  Zap
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import WalletConnect from '../components/WalletConnect';
import { useWeb3 } from '../hooks/useWeb3';
import { apiClient } from '../lib/api';
import { formatNumber } from '../lib/web3';

const HomePage = () => {
  const { isConnected } = useWeb3();
  const [icoData, setIcoData] = useState(null);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  // Carregar dados da ICO
  useEffect(() => {
    const loadICOData = async () => {
      try {
        const response = await apiClient.getICOStatus();
        if (response.success) {
          setIcoData(response.ico);
        }
      } catch (error) {
        console.error('Erro ao carregar dados da ICO:', error);
      }
    };

    loadICOData();
  }, []);

  // Timer de contagem regressiva
  useEffect(() => {
    if (!icoData?.currentPhase?.endDate) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const endTime = new Date(icoData.currentPhase.endDate).getTime();
      const distance = endTime - now;

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [icoData]);

  const features = [
    {
      icon: Coins,
      title: 'Token CFD',
      description: 'Token ERC-20 na rede Polygon com total de 21 milhões de tokens',
      color: 'text-primary'
    },
    {
      icon: TrendingUp,
      title: 'Dividendos em USDT',
      description: '60% dos lucros do casino distribuídos mensalmente para holders',
      color: 'text-secondary'
    },
    {
      icon: Shield,
      title: 'Segurança Blockchain',
      description: 'Contratos inteligentes auditados na rede Polygon',
      color: 'text-green-500'
    },
    {
      icon: Users,
      title: 'Comunidade',
      description: 'Participe da governança e decisões do projeto',
      color: 'text-blue-500'
    }
  ];

  const stats = [
    { label: 'Total Supply', value: '21M CFD', icon: Coins },
    { label: 'Holders Elegíveis', value: '1,234', icon: Users },
    { label: 'Dividendos Distribuídos', value: '$45,678', icon: TrendingUp },
    { label: 'Próxima Distribuição', value: '15 dias', icon: Clock }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-casino">
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative container mx-auto px-4 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center lg:text-left"
            >
              <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
                🚀 ICO Fase 1 Ativa
              </Badge>
              
              <h1 className="text-4xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-white to-secondary bg-clip-text text-transparent">
                CasinoFound
              </h1>
              
              <p className="text-xl lg:text-2xl text-gray-300 mb-8">
                O primeiro casino online financiado por criptomoeda com distribuição de lucros em USDT
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-black font-semibold">
                  <Link to="/ico" className="flex items-center gap-2">
                    <Coins className="h-5 w-5" />
                    Comprar Tokens CFD
                  </Link>
                </Button>
                
                <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  <Link to="/whitepaper" className="flex items-center gap-2">
                    <ExternalLink className="h-5 w-5" />
                    Whitepaper
                  </Link>
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex justify-center"
            >
              {!isConnected ? (
                <WalletConnect />
              ) : (
                <Card className="w-full max-w-md bg-card/50 backdrop-blur border-white/10">
                  <CardHeader>
                    <CardTitle className="text-center text-primary">
                      Bem-vindo ao CasinoFound!
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button asChild className="w-full">
                      <Link to="/dashboard">
                        <BarChart3 className="mr-2 h-4 w-4" />
                        Acessar Dashboard
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full">
                      <Link to="/ico">
                        <Coins className="mr-2 h-4 w-4" />
                        Comprar Tokens
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ICO Status Section */}
      {icoData && (
        <section className="py-16 bg-card/30">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                ICO {icoData.currentPhase?.name}
              </h2>
              <p className="text-xl text-muted-foreground">
                {icoData.currentPhase?.description}
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-8 items-center">
              {/* Timer */}
              <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
                <CardHeader>
                  <CardTitle className="text-center text-2xl">
                    Tempo Restante
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4 text-center">
                    {Object.entries(timeLeft).map(([unit, value]) => (
                      <div key={unit} className="space-y-2">
                        <div className="text-3xl font-bold text-primary">
                          {value.toString().padStart(2, '0')}
                        </div>
                        <div className="text-sm text-muted-foreground capitalize">
                          {unit === 'days' ? 'Dias' : 
                           unit === 'hours' ? 'Horas' :
                           unit === 'minutes' ? 'Min' : 'Seg'}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Progress */}
              <Card>
                <CardHeader>
                  <CardTitle>Progresso da ICO</CardTitle>
                  <CardDescription>
                    Fase {icoData.currentPhase?.phase} de 3
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Tokens Vendidos</span>
                      <span className="font-semibold">
                        {formatNumber(icoData.currentPhase?.tokensSold || 0)} / {formatNumber(icoData.currentPhase?.totalTokens || 0)}
                      </span>
                    </div>
                    <Progress 
                      value={icoData.currentPhase?.progress || 0} 
                      className="h-3"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-primary">
                        ${icoData.currentPhase?.tokenPrice}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Preço Atual
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-secondary">
                        {formatNumber(icoData.overall?.totalRaised || 0)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Total Arrecadado
                      </div>
                    </div>
                  </div>

                  <Button asChild className="w-full" size="lg">
                    <Link to="/ico">
                      <Zap className="mr-2 h-4 w-4" />
                      Comprar Agora
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Por que escolher CasinoFound?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Uma plataforma inovadora que combina entretenimento e investimento
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover-lift">
                  <CardHeader>
                    <feature.icon className={`h-12 w-12 ${feature.color} mb-4`} />
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="text-center">
                  <CardContent className="pt-6">
                    <stat.icon className="h-8 w-8 mx-auto mb-4 text-primary" />
                    <div className="text-3xl font-bold mb-2">{stat.value}</div>
                    <div className="text-muted-foreground">{stat.label}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Card className="max-w-4xl mx-auto bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
              <CardContent className="p-12">
                <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                  Pronto para começar?
                </h2>
                <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Junte-se à revolução dos casinos online e comece a receber dividendos em USDT
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" asChild>
                    <Link to="/ico">
                      <Coins className="mr-2 h-5 w-5" />
                      Comprar Tokens CFD
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link to="/whitepaper">
                      <ExternalLink className="mr-2 h-5 w-5" />
                      Ler Whitepaper
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;

