// Cliente API para comunicação com o backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('auth_token');
  }

  // Configurar token de autenticação
  setAuthToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  // Obter headers padrão
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Fazer requisição HTTP
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  // Métodos GET
  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  // Métodos POST
  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Métodos PUT
  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Métodos DELETE
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // === AUTENTICAÇÃO ===

  // Login com wallet
  async loginWithWallet(walletAddress, signature, message) {
    const response = await this.post('/auth/wallet-login', {
      walletAddress,
      signature,
      message
    });
    
    if (response.success && response.token) {
      this.setAuthToken(response.token);
    }
    
    return response;
  }

  // Login admin
  async loginAdmin(password) {
    const response = await this.post('/auth/admin-login', { password });
    
    if (response.success && response.token) {
      this.setAuthToken(response.token);
    }
    
    return response;
  }

  // Verificar token
  async verifyToken() {
    return this.get('/auth/verify');
  }

  // Logout
  async logout() {
    const response = await this.post('/auth/logout');
    this.setAuthToken(null);
    return response;
  }

  // === WALLET ===

  // Verificar wallet
  async verifyWallet(walletAddress) {
    return this.post('/wallet/verify', { walletAddress });
  }

  // Obter transações
  async getTransactions(walletAddress, page = 1, limit = 20, type = null) {
    let endpoint = `/wallet/transactions/${walletAddress}?page=${page}&limit=${limit}`;
    if (type) {
      endpoint += `&type=${type}`;
    }
    return this.get(endpoint);
  }

  // Obter estatísticas da wallet
  async getWalletStats(walletAddress) {
    return this.get(`/wallet/stats/${walletAddress}`);
  }

  // Atualizar saldo
  async refreshBalance(walletAddress) {
    return this.post('/wallet/refresh-balance', { walletAddress });
  }

  // === ICO ===

  // Obter status da ICO
  async getICOStatus() {
    return this.get('/ico/status');
  }

  // Processar compra de tokens
  async purchaseTokens(walletAddress, amountInMatic, phase, txHash, affiliateCode = null) {
    return this.post('/ico/purchase', {
      walletAddress,
      amountInMatic,
      phase,
      txHash,
      affiliateCode
    });
  }

  // Obter histórico de compras
  async getPurchaseHistory(walletAddress, page = 1, limit = 10) {
    return this.get(`/ico/purchases/${walletAddress}?page=${page}&limit=${limit}`);
  }

  // Obter estatísticas da ICO
  async getICOStats() {
    return this.get('/ico/stats');
  }

  // === DIVIDENDOS ===

  // Obter informações de dividendos
  async getDividendInfo(walletAddress) {
    return this.get(`/dividends/info/${walletAddress}`);
  }

  // Reivindicar dividendos
  async claimDividends(walletAddress, distributionIds) {
    return this.post('/dividends/claim', {
      walletAddress,
      distributionIds
    });
  }

  // Obter distribuições
  async getDividendDistributions(page = 1, limit = 10) {
    return this.get(`/dividends/distributions?page=${page}&limit=${limit}`);
  }

  // Calcular projeção de dividendos
  async calculateDividendProjection(walletAddress, monthlyProfit = null) {
    return this.post('/dividends/projection', {
      walletAddress,
      monthlyProfit
    });
  }

  // === BLOCKCHAIN ===

  // Obter saldo CFD
  async getCFDBalance(address) {
    return this.get(`/blockchain/balance/cfd/${address}`);
  }

  // Obter saldo USDT
  async getUSDTBalance(address) {
    return this.get(`/blockchain/balance/usdt/${address}`);
  }

  // Verificar período de posse
  async getHoldingPeriod(address) {
    return this.get(`/blockchain/holding-period/${address}`);
  }

  // Obter preço do MATIC
  async getMaticPrice() {
    return this.get('/blockchain/price/matic');
  }

  // Estimar gas fee
  async estimateGasFee(to, data = '0x') {
    return this.post('/blockchain/estimate-gas', { to, data });
  }

  // Validar endereço
  async validateAddress(address) {
    return this.get(`/blockchain/validate-address/${address}`);
  }

  // === ADMIN ===

  // Obter dashboard admin
  async getAdminDashboard() {
    return this.get('/admin/dashboard');
  }

  // Obter snapshot de holders
  async getHoldersSnapshot() {
    return this.get('/admin/snapshot');
  }

  // Criar distribuição de dividendos
  async createDividendDistribution(totalAmount, notes = '') {
    return this.post('/admin/create-dividend-distribution', {
      totalAmount,
      notes
    });
  }

  // Listar distribuições
  async getDividendDistributionsList(page = 1, limit = 10) {
    return this.get(`/admin/dividend-distributions?page=${page}&limit=${limit}`);
  }

  // Enviar notificação
  async sendNotification(message, type = 'info', targetGroup = 'all') {
    return this.post('/admin/send-notification', {
      message,
      type,
      targetGroup
    });
  }

  // Obter estatísticas de ICO
  async getAdminICOStats() {
    return this.get('/admin/ico-stats');
  }

  // === UTILITÁRIOS ===

  // Health check
  async healthCheck() {
    return this.get('/health');
  }
}

// Instância global do cliente API
export const apiClient = new ApiClient();

// Hooks para React Query
export const queryKeys = {
  // Auth
  verifyToken: ['auth', 'verify'],
  
  // Wallet
  walletInfo: (address) => ['wallet', 'info', address],
  walletTransactions: (address, page, type) => ['wallet', 'transactions', address, page, type],
  walletStats: (address) => ['wallet', 'stats', address],
  
  // ICO
  icoStatus: ['ico', 'status'],
  icoStats: ['ico', 'stats'],
  purchaseHistory: (address, page) => ['ico', 'purchases', address, page],
  
  // Dividends
  dividendInfo: (address) => ['dividends', 'info', address],
  dividendDistributions: (page) => ['dividends', 'distributions', page],
  dividendProjection: (address, monthlyProfit) => ['dividends', 'projection', address, monthlyProfit],
  
  // Blockchain
  cfdBalance: (address) => ['blockchain', 'cfd-balance', address],
  usdtBalance: (address) => ['blockchain', 'usdt-balance', address],
  holdingPeriod: (address) => ['blockchain', 'holding-period', address],
  maticPrice: ['blockchain', 'matic-price'],
  
  // Admin
  adminDashboard: ['admin', 'dashboard'],
  holdersSnapshot: ['admin', 'snapshot'],
  adminDividendDistributions: (page) => ['admin', 'dividend-distributions', page],
  adminICOStats: ['admin', 'ico-stats'],
};

export default apiClient;

