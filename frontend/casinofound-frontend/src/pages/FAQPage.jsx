import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  HelpCircle, 
  ChevronDown, 
  ChevronUp,
  MessageCircle,
  Mail,
  ExternalLink,
  Shield,
  Coins,
  TrendingUp,
  Clock
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../components/ui/collapsible';

const FAQPage = () => {
  const [openItems, setOpenItems] = useState(new Set());

  const toggleItem = (index) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index);
    } else {
      newOpenItems.add(index);
    }
    setOpenItems(newOpenItems);
  };

  const faqCategories = [
    {
      title: 'Geral',
      icon: HelpCircle,
      color: 'text-blue-500',
      questions: [
        {
          question: 'O que é o CasinoFound (CFD)?',
          answer: 'O CasinoFound é uma plataforma inovadora que combina um cassino online com tecnologia blockchain. Holders do token CFD recebem dividendos mensais em USDT baseados nos lucros do cassino.'
        },
        {
          question: 'Como funciona o sistema de dividendos?',
          answer: '60% dos lucros líquidos mensais do cassino são distribuídos proporcionalmente entre os holders de CFD que mantiveram seus tokens por pelo menos 30 dias. Os dividendos são pagos em USDT.'
        },
        {
          question: 'O projeto é legal e regulamentado?',
          answer: 'Sim, o CasinoFound opera dentro das regulamentações aplicáveis. Nossos contratos inteligentes são auditados e a plataforma segue as melhores práticas de compliance.'
        },
        {
          question: 'Qual a diferença entre CFD e outros tokens de cassino?',
          answer: 'O CFD oferece participação real nos lucros através de dividendos em USDT, não apenas utilidade dentro da plataforma. É um modelo de investimento transparente e sustentável.'
        }
      ]
    },
    {
      title: 'Token CFD',
      icon: Coins,
      color: 'text-primary',
      questions: [
        {
          question: 'Quantos tokens CFD existem?',
          answer: 'O total supply é de 21.000.000 tokens CFD. Não haverá criação de novos tokens, garantindo a escassez e valor para os holders.'
        },
        {
          question: 'Em qual blockchain o CFD está?',
          answer: 'O token CFD é um ERC-20 na rede Polygon, garantindo taxas baixas e transações rápidas para uma melhor experiência do usuário.'
        },
        {
          question: 'Posso vender meus tokens CFD?',
          answer: 'Sim, após o lançamento oficial, os tokens CFD estarão disponíveis para negociação em exchanges descentralizadas (DEX) na rede Polygon.'
        },
        {
          question: 'Há taxa de transferência?',
          answer: 'Não há taxas especiais para transferências de CFD, apenas as taxas normais de gas da rede Polygon, que são muito baixas.'
        }
      ]
    },
    {
      title: 'ICO',
      icon: TrendingUp,
      color: 'text-secondary',
      questions: [
        {
          question: 'Quais são as fases da ICO?',
          answer: 'Fase 1: 8% dos tokens a $0,01 (+ 20% bônus). Fase 2: 20% dos tokens a $0,05 (+ 10% bônus). Fase 3: 10% dos tokens a $1,00 (pós-lançamento).'
        },
        {
          question: 'Como posso participar da ICO?',
          answer: 'Conecte sua wallet MetaMask, certifique-se de estar na rede Polygon, e use MATIC para comprar tokens CFD diretamente em nosso site.'
        },
        {
          question: 'Há valor mínimo ou máximo para compra?',
          answer: 'Sim, cada fase tem limites específicos. Fase 1: mín 0,01 MATIC, máx 1000 MATIC. Os limites podem variar entre as fases.'
        },
        {
          question: 'Posso usar código de afiliado?',
          answer: 'Sim! Use um código de afiliado válido durante a compra e o afiliado receberá 5% de comissão sobre sua compra.'
        }
      ]
    },
    {
      title: 'Dividendos',
      icon: TrendingUp,
      color: 'text-green-500',
      questions: [
        {
          question: 'Quando recebo meus primeiros dividendos?',
          answer: 'Você precisa manter seus tokens CFD por pelo menos 30 dias para se tornar elegível. Após isso, receberá dividendos de todas as distribuições mensais.'
        },
        {
          question: 'Como são calculados os dividendos?',
          answer: 'Os dividendos são proporcionais à sua participação no total de tokens elegíveis. Se você possui 1% dos tokens elegíveis, receberá 1% dos dividendos distribuídos.'
        },
        {
          question: 'Preciso reivindicar os dividendos?',
          answer: 'Sim, você precisa reivindicar seus dividendos através do dashboard. Eles ficam disponíveis até você decidir reivindicá-los.'
        },
        {
          question: 'Em que moeda recebo os dividendos?',
          answer: 'Todos os dividendos são pagos em USDT (Tether) na rede Polygon, garantindo estabilidade de valor.'
        }
      ]
    },
    {
      title: 'Técnico',
      icon: Shield,
      color: 'text-purple-500',
      questions: [
        {
          question: 'Os contratos são auditados?',
          answer: 'Sim, todos os contratos inteligentes passaram por auditoria de segurança e são verificáveis publicamente no PolygonScan.'
        },
        {
          question: 'Como conectar à rede Polygon?',
          answer: 'Nossa plataforma adiciona automaticamente a rede Polygon ao seu MetaMask. Você também pode adicionar manualmente usando os parâmetros oficiais da Polygon.'
        },
        {
          question: 'Minha wallet é segura?',
          answer: 'Sim, utilizamos apenas interações padrão com contratos auditados. Nunca solicitamos sua chave privada ou seed phrase.'
        },
        {
          question: 'Posso usar outras wallets além do MetaMask?',
          answer: 'Atualmente suportamos MetaMask, mas planejamos adicionar suporte para outras wallets compatíveis com Ethereum/Polygon no futuro.'
        }
      ]
    }
  ];

  const supportOptions = [
    {
      title: 'Telegram',
      description: 'Junte-se à nossa comunidade oficial',
      icon: MessageCircle,
      action: 'Entrar no Grupo',
      color: 'bg-blue-500'
    },
    {
      title: 'Email',
      description: 'Envie suas dúvidas por email',
      icon: Mail,
      action: 'Enviar Email',
      color: 'bg-green-500'
    },
    {
      title: 'Documentação',
      description: 'Consulte nossa documentação técnica',
      icon: ExternalLink,
      action: 'Ver Docs',
      color: 'bg-purple-500'
    }
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
          ❓ Perguntas Frequentes
        </Badge>
        <h1 className="text-4xl lg:text-5xl font-bold mb-4">
          FAQ - Dúvidas Frequentes
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Encontre respostas para as principais dúvidas sobre o CasinoFound
        </p>
      </motion.div>

      {/* FAQ Categories */}
      <div className="space-y-8">
        {faqCategories.map((category, categoryIndex) => (
          <motion.div
            key={category.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <category.icon className={`h-6 w-6 ${category.color}`} />
                  {category.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {category.questions.map((faq, questionIndex) => {
                  const itemIndex = `${categoryIndex}-${questionIndex}`;
                  const isOpen = openItems.has(itemIndex);
                  
                  return (
                    <Collapsible key={questionIndex}>
                      <CollapsibleTrigger
                        onClick={() => toggleItem(itemIndex)}
                        className="flex w-full items-center justify-between p-4 text-left bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                      >
                        <span className="font-medium">{faq.question}</span>
                        {isOpen ? (
                          <ChevronUp className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        )}
                      </CollapsibleTrigger>
                      <CollapsibleContent className="px-4 pb-4">
                        <div className="pt-4 text-muted-foreground leading-relaxed">
                          {faq.answer}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  );
                })}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Support Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="mt-16"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">
            Ainda tem dúvidas?
          </h2>
          <p className="text-xl text-muted-foreground">
            Entre em contato conosco através dos canais oficiais
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {supportOptions.map((option, index) => (
            <motion.div
              key={option.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="text-center hover-lift">
                <CardContent className="pt-6">
                  <div className={`w-16 h-16 ${option.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <option.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{option.title}</h3>
                  <p className="text-muted-foreground mb-4">{option.description}</p>
                  <Button className="w-full">
                    {option.action}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="mt-16"
      >
        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
          <CardContent className="p-8">
            <div className="grid md:grid-cols-4 gap-6 text-center">
              <div>
                <Clock className="h-8 w-8 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">30 dias</div>
                <div className="text-sm text-muted-foreground">Período mínimo para dividendos</div>
              </div>
              <div>
                <TrendingUp className="h-8 w-8 mx-auto mb-2 text-secondary" />
                <div className="text-2xl font-bold">60%</div>
                <div className="text-sm text-muted-foreground">Dos lucros distribuídos</div>
              </div>
              <div>
                <Coins className="h-8 w-8 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">21M</div>
                <div className="text-sm text-muted-foreground">Total de tokens CFD</div>
              </div>
              <div>
                <Shield className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <div className="text-2xl font-bold">100%</div>
                <div className="text-sm text-muted-foreground">Contratos auditados</div>
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
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <div className="text-yellow-500 mt-1">⚠️</div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="font-medium text-yellow-600 dark:text-yellow-400">
                  Aviso de Responsabilidade
                </p>
                <p>
                  As informações fornecidas neste FAQ são apenas para fins educacionais. 
                  Criptomoedas envolvem riscos e você deve fazer sua própria pesquisa antes de investir.
                </p>
                <p>
                  O CasinoFound promove o jogo responsável. Se você tem problemas com jogos, 
                  procure ajuda profissional.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default FAQPage;

