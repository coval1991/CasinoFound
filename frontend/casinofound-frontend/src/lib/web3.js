import { ethers } from 'ethers';

// Configurações da rede Polygon
export const POLYGON_CONFIG = {
  chainId: '0x89', // 137 em hexadecimal
  chainName: 'Polygon Mainnet',
  nativeCurrency: {
    name: 'MATIC',
    symbol: 'MATIC',
    decimals: 18,
  },
  rpcUrls: ['https://polygon-rpc.com'],
  blockExplorerUrls: ['https://polygonscan.com'],
};

// Endereços dos contratos
export const CONTRACTS = {
  CFD_TOKEN: '0x7fE9eE1975263998D7BfD7ed46CAD44Ee62A63bE',
  AFFILIATE_MANAGER: '0x2f6737CFDE18D201C3300C1C87e70f620C38F68C',
  ICO_PHASE1: '0x8008A571414ebAF2f965a5a8d34D78cEfa8BD8bD',
  USDT: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F'
};

// ABIs dos contratos
export const CFD_TOKEN_ABI = [
  {
    "inputs": [],
    "name": "name",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [{"internalType": "uint8", "name": "", "type": "uint8"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "to", "type": "address"},
      {"internalType": "uint256", "name": "value", "type": "uint256"}
    ],
    "name": "transfer",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "from", "type": "address"},
      {"indexed": true, "internalType": "address", "name": "to", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "value", "type": "uint256"}
    ],
    "name": "Transfer",
    "type": "event"
  }
];

export const ICO_ABI = [
  {
    "inputs": [
      {"internalType": "address payable", "name": "affiliate", "type": "address"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "payAffiliate",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  }
];

// Classe para gerenciar Web3
export class Web3Manager {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.account = null;
    this.contracts = {};
  }

  // Verificar se MetaMask está instalado
  isMetaMaskInstalled() {
    return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
  }

  // Conectar com MetaMask
  async connectWallet() {
    if (!this.isMetaMaskInstalled()) {
      throw new Error('MetaMask não está instalado');
    }

    try {
      // Solicitar acesso às contas
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (accounts.length === 0) {
        throw new Error('Nenhuma conta encontrada');
      }

      // Configurar provider e signer
      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();
      this.account = accounts[0];

      // Verificar se está na rede Polygon
      await this.switchToPolygon();

      // Inicializar contratos
      this.initializeContracts();

      return {
        account: this.account,
        provider: this.provider
      };
    } catch (error) {
      console.error('Erro ao conectar wallet:', error);
      throw error;
    }
  }

  // Trocar para a rede Polygon
  async switchToPolygon() {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: POLYGON_CONFIG.chainId }],
      });
    } catch (switchError) {
      // Se a rede não estiver adicionada, adicionar
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [POLYGON_CONFIG],
          });
        } catch (addError) {
          throw new Error('Erro ao adicionar rede Polygon');
        }
      } else {
        throw new Error('Erro ao trocar para rede Polygon');
      }
    }
  }

  // Inicializar contratos
  initializeContracts() {
    if (!this.signer) return;

    this.contracts.cfdToken = new ethers.Contract(
      CONTRACTS.CFD_TOKEN,
      CFD_TOKEN_ABI,
      this.signer
    );

    this.contracts.icoPhase1 = new ethers.Contract(
      CONTRACTS.ICO_PHASE1,
      ICO_ABI,
      this.signer
    );
  }

  // Obter saldo de CFD
  async getCFDBalance(address = null) {
    const targetAddress = address || this.account;
    if (!targetAddress || !this.contracts.cfdToken) return '0';

    try {
      const balance = await this.contracts.cfdToken.balanceOf(targetAddress);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Erro ao obter saldo CFD:', error);
      return '0';
    }
  }

  // Obter saldo de MATIC
  async getMaticBalance(address = null) {
    const targetAddress = address || this.account;
    if (!targetAddress || !this.provider) return '0';

    try {
      const balance = await this.provider.getBalance(targetAddress);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Erro ao obter saldo MATIC:', error);
      return '0';
    }
  }

  // Comprar tokens na ICO
  async buyTokens(amountInMatic, affiliateAddress = null) {
    if (!this.contracts.icoPhase1) {
      throw new Error('Contrato ICO não inicializado');
    }

    try {
      const value = ethers.parseEther(amountInMatic.toString());
      
      let tx;
      if (affiliateAddress) {
        // Compra com afiliado
        tx = await this.contracts.icoPhase1.payAffiliate(
          affiliateAddress,
          value,
          { value }
        );
      } else {
        // Compra direta (enviar MATIC para o contrato)
        tx = await this.signer.sendTransaction({
          to: CONTRACTS.ICO_PHASE1,
          value: value
        });
      }

      return tx;
    } catch (error) {
      console.error('Erro ao comprar tokens:', error);
      throw error;
    }
  }

  // Assinar mensagem para autenticação
  async signMessage(message) {
    if (!this.signer) {
      throw new Error('Wallet não conectada');
    }

    try {
      const signature = await this.signer.signMessage(message);
      return signature;
    } catch (error) {
      console.error('Erro ao assinar mensagem:', error);
      throw error;
    }
  }

  // Desconectar wallet
  disconnect() {
    this.provider = null;
    this.signer = null;
    this.account = null;
    this.contracts = {};
  }

  // Verificar se está conectado
  isConnected() {
    return !!this.account && !!this.provider;
  }

  // Escutar mudanças de conta
  onAccountChanged(callback) {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          this.disconnect();
        } else {
          this.account = accounts[0];
        }
        callback(accounts);
      });
    }
  }

  // Escutar mudanças de rede
  onChainChanged(callback) {
    if (window.ethereum) {
      window.ethereum.on('chainChanged', (chainId) => {
        callback(chainId);
        // Recarregar a página quando a rede mudar
        window.location.reload();
      });
    }
  }
}

// Instância global do Web3Manager
export const web3Manager = new Web3Manager();

// Utilitários
export const formatAddress = (address) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const formatNumber = (number, decimals = 2) => {
  return parseFloat(number).toLocaleString('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};

export const formatCurrency = (amount, currency = 'MATIC') => {
  return `${formatNumber(amount)} ${currency}`;
};

