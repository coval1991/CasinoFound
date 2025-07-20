import { useState, useEffect, useCallback } from 'react';
import { web3Manager } from '../lib/web3';
import { apiClient } from '../lib/api';

export const useWeb3 = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [balances, setBalances] = useState({
    matic: '0',
    cfd: '0',
    usdt: '0'
  });

  // Verificar se já está conectado ao carregar
  useEffect(() => {
    checkConnection();
    setupEventListeners();
  }, []);

  // Verificar conexão existente
  const checkConnection = useCallback(async () => {
    try {
      if (web3Manager.isMetaMaskInstalled() && web3Manager.account) {
        setIsConnected(true);
        setAccount(web3Manager.account);
        await updateBalances();
      }
    } catch (error) {
      console.error('Erro ao verificar conexão:', error);
    }
  }, []);

  // Configurar listeners de eventos
  const setupEventListeners = useCallback(() => {
    web3Manager.onAccountChanged((accounts) => {
      if (accounts.length === 0) {
        disconnect();
      } else {
        setAccount(accounts[0]);
        updateBalances();
      }
    });

    web3Manager.onChainChanged((chainId) => {
      // A página será recarregada automaticamente
      console.log('Rede alterada:', chainId);
    });
  }, []);

  // Conectar wallet
  const connect = useCallback(async () => {
    if (!web3Manager.isMetaMaskInstalled()) {
      setError('MetaMask não está instalado. Por favor, instale o MetaMask para continuar.');
      return false;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const result = await web3Manager.connectWallet();
      setIsConnected(true);
      setAccount(result.account);
      await updateBalances();
      
      // Tentar fazer login automático
      await attemptLogin(result.account);
      
      return true;
    } catch (error) {
      console.error('Erro ao conectar wallet:', error);
      setError(error.message);
      return false;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  // Desconectar wallet
  const disconnect = useCallback(() => {
    web3Manager.disconnect();
    setIsConnected(false);
    setAccount(null);
    setBalances({ matic: '0', cfd: '0', usdt: '0' });
    setError(null);
    
    // Fazer logout da API
    apiClient.logout();
  }, []);

  // Atualizar saldos
  const updateBalances = useCallback(async () => {
    if (!web3Manager.isConnected()) return;

    try {
      const [maticBalance, cfdBalance] = await Promise.all([
        web3Manager.getMaticBalance(),
        web3Manager.getCFDBalance()
      ]);

      setBalances(prev => ({
        ...prev,
        matic: maticBalance,
        cfd: cfdBalance
      }));

      // Tentar obter saldo USDT via API (mais confiável)
      try {
        const usdtResponse = await apiClient.getUSDTBalance(web3Manager.account);
        if (usdtResponse.success) {
          setBalances(prev => ({
            ...prev,
            usdt: usdtResponse.balance.usdtBalance.toString()
          }));
        }
      } catch (error) {
        console.warn('Erro ao obter saldo USDT via API:', error);
      }
    } catch (error) {
      console.error('Erro ao atualizar saldos:', error);
    }
  }, []);

  // Tentar login automático
  const attemptLogin = useCallback(async (walletAddress) => {
    try {
      // Verificar se já tem token válido
      const tokenCheck = await apiClient.verifyToken();
      if (tokenCheck.valid) {
        return true;
      }
    } catch (error) {
      // Token inválido ou não existe, tentar login
    }

    try {
      // Criar mensagem para assinatura
      const message = `Fazer login no CasinoFound\nEndereço: ${walletAddress}\nTimestamp: ${Date.now()}`;
      
      // Assinar mensagem
      const signature = await web3Manager.signMessage(message);
      
      // Fazer login via API
      const loginResponse = await apiClient.loginWithWallet(walletAddress, signature, message);
      
      if (loginResponse.success) {
        console.log('Login automático realizado com sucesso');
        return true;
      }
    } catch (error) {
      console.warn('Erro no login automático:', error);
    }

    return false;
  }, []);

  // Comprar tokens
  const buyTokens = useCallback(async (amountInMatic, affiliateCode = null) => {
    if (!web3Manager.isConnected()) {
      throw new Error('Wallet não conectada');
    }

    try {
      // Executar transação
      const tx = await web3Manager.buyTokens(amountInMatic, affiliateCode);
      
      // Aguardar confirmação
      const receipt = await tx.wait();
      
      // Registrar compra na API
      try {
        await apiClient.purchaseTokens(
          web3Manager.account,
          amountInMatic,
          1, // Fase atual (pode ser dinâmica)
          receipt.hash,
          affiliateCode
        );
      } catch (apiError) {
        console.warn('Erro ao registrar compra na API:', apiError);
      }

      // Atualizar saldos
      await updateBalances();
      
      return receipt;
    } catch (error) {
      console.error('Erro ao comprar tokens:', error);
      throw error;
    }
  }, [updateBalances]);

  // Assinar mensagem
  const signMessage = useCallback(async (message) => {
    if (!web3Manager.isConnected()) {
      throw new Error('Wallet não conectada');
    }

    return await web3Manager.signMessage(message);
  }, []);

  // Verificar se MetaMask está instalado
  const isMetaMaskInstalled = web3Manager.isMetaMaskInstalled();

  return {
    // Estado
    isConnected,
    account,
    isConnecting,
    error,
    balances,
    isMetaMaskInstalled,
    
    // Ações
    connect,
    disconnect,
    updateBalances,
    buyTokens,
    signMessage,
    
    // Utilitários
    web3Manager
  };
};

