import React from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Download, 
  ExternalLink,
  Coins,
  TrendingUp,
  Shield,
  Users,
  Target,
  BarChart3,
  Globe,
  Zap
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';

const WhitepaperPage = () => {
  const sections = [
    {
      id: 'introducao',
      title: '1. Introdução',
      icon: FileText,
      content: `O CasinoFound (CFD) representa uma revolução no setor de jogos online, combinando a transparência da tecnologia blockchain com a lucratividade comprovada da indústria de cassinos. Nossa plataforma oferece uma oportunidade única para investidores participarem diretamente dos lucros de um cassino online através da posse de tokens CFD.`
    },
    {
      id: 'problema',
      title: '2. Problema e Solução',
      icon: Target,
      content: `A indústria de cassinos online movimenta bilhões de dólares anualmente, mas os lucros são concentrados apenas nos operadores. O CasinoFound democratiza esses lucros, permitindo que qualquer pessoa se torne um "sócio" do cassino através da compra de tokens CFD e receba dividendos mensais em USDT.`
    },
    {
      id: 'tokenomics',
      title: '3. Tokenomics',
      icon: Coins,
      content: `Total Supply: 21.000.000 CFD tokens
      • ICO (38%): 7.980.000 tokens
      • Liquidez (10%): 2.100.000 tokens  
      • Marketing/Legal (30%): 6.300.000 tokens
      • Equipe (15%): 3.150.000 tokens
      • Reserva (7%): 1.470.000 tokens`
    },
    {
      id: 'ico',
      title: '4. Fases da ICO',
      icon: TrendingUp,
      content: `Fase 1 (8% - 1.680.000 tokens): $0,01 por token + 20% bônus
      Fase 2 (20% - 4.200.000 tokens): $0,05 por token + 10% bônus  
      Fase 3 (10% - 2.100.000 tokens): $1,00 por token (pós-lançamento)`
    },
    {
      id: 'dividendos',
      title: '5. Sistema de Dividendos',
      icon: BarChart3,
      content: `60% dos lucros líquidos mensais do cassino são distribuídos em USDT para holders de CFD que mantiveram seus tokens por pelo menos 30 dias. A distribuição é proporcional à quantidade de tokens possuída. Os dividendos são calculados automaticamente e podem ser reivindicados a qualquer momento.`
    },
    {
      id: 'tecnologia',
      title: '6. Tecnologia',
      icon: Shield,
      content: `O CasinoFound utiliza contratos inteligentes na rede Polygon para garantir transparência e segurança. Todos os contratos são auditados e verificáveis publicamente. A escolha da Polygon garante taxas baixas e transações rápidas para uma melhor experiência do usuário.`
    },
    {
      id: 'roadmap',
      title: '7. Roadmap',
      icon: Globe,
      content: `Q1 2024: Lançamento da ICO Fase 1
      Q2 2024: Desenvolvimento da plataforma de cassino
      Q3 2024: ICO Fase 2 e testes beta
      Q4 2024: Lançamento oficial do cassino e ICO Fase 3
      Q1 2025: Primeira distribuição de dividendos
      Q2 2025: Expansão de jogos e parcerias`
    },
    {
      id: 'equipe',
      title: '8. Equipe e Parcerias',
      icon: Users,
      content: `Nossa equipe é composta por profissionais experientes em blockchain, desenvolvimento de jogos e marketing digital. Contamos com parcerias estratégicas com provedores de jogos renomados e empresas de auditoria blockchain para garantir a qualidade e segurança da plataforma.`
    }
  ];

  const stats = [
    { label: 'Total Supply', value: '21M CFD', icon: Coins },
    { label: 'Distribuição de Lucros', value: '60%', icon: TrendingUp },
    { label: 'Período de Elegibilidade', value: '30 dias', icon: Shield },
    { label: 'Rede Blockchain', value: 'Polygon', icon: Zap }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
          📄 Documentação Oficial
        </Badge>
        <h1 className="text-4xl lg:text-5xl font-bold mb-4">
          Whitepaper CasinoFound
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Conheça todos os detalhes técnicos e estratégicos do projeto CasinoFound
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg">
            <Download className="mr-2 h-5 w-5" />
            Download PDF
          </Button>
          <Button size="lg" variant="outline">
            <ExternalLink className="mr-2 h-5 w-5" />
            Ver no GitHub
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-12">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
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

      {/* Índice */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mb-12"
      >
        <Card>
          <CardHeader>
            <CardTitle>Índice</CardTitle>
            <CardDescription>
              Navegue pelos tópicos do whitepaper
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {sections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
                >
                  <section.icon className="h-5 w-5 text-primary" />
                  <span className="font-medium">{section.title}</span>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Conteúdo */}
      <div className="space-y-12">
        {sections.map((section, index) => (
          <motion.div
            key={section.id}
            id={section.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <section.icon className="h-6 w-6 text-primary" />
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-gray dark:prose-invert max-w-none">
                  {section.content.split('\n').map((paragraph, pIndex) => (
                    <p key={pIndex} className="mb-4 text-muted-foreground leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Seção Especial - Contratos */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="mt-12"
      >
        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
          <CardHeader>
            <CardTitle className="text-2xl">Contratos Inteligentes</CardTitle>
            <CardDescription>
              Todos os contratos são verificáveis e auditados
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-card rounded-lg">
                <h4 className="font-semibold mb-2">Token CFD</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Contrato principal do token ERC-20
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Ver no PolygonScan
                </Button>
              </div>
              
              <div className="p-4 bg-card rounded-lg">
                <h4 className="font-semibold mb-2">ICO Manager</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Gerenciamento das fases da ICO
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Ver no PolygonScan
                </Button>
              </div>
              
              <div className="p-4 bg-card rounded-lg">
                <h4 className="font-semibold mb-2">Dividend Manager</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Distribuição automática de dividendos
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Ver no PolygonScan
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Disclaimer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="mt-12"
      >
        <Card className="border-yellow-500/20 bg-yellow-500/5">
          <CardHeader>
            <CardTitle className="text-yellow-600 dark:text-yellow-400">
              ⚠️ Aviso Importante
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                Este whitepaper é apenas para fins informativos e não constitui uma oferta de investimento. 
                Criptomoedas e tokens digitais envolvem riscos significativos.
              </p>
              <p>
                Sempre faça sua própria pesquisa (DYOR) antes de investir. Os dividendos projetados são 
                estimativas baseadas em modelos teóricos e não garantem retornos futuros.
              </p>
              <p>
                O CasinoFound promove o jogo responsável. Se você tem problemas com jogos, procure ajuda 
                profissional.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* CTA Final */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="mt-12 text-center"
      >
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-8">
            <h3 className="text-2xl font-bold mb-4">
              Pronto para participar?
            </h3>
            <p className="text-muted-foreground mb-6">
              Junte-se à ICO do CasinoFound e comece a receber dividendos em USDT
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg">
                <Coins className="mr-2 h-5 w-5" />
                Comprar Tokens CFD
              </Button>
              <Button size="lg" variant="outline">
                <Users className="mr-2 h-5 w-5" />
                Entrar no Telegram
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default WhitepaperPage;

