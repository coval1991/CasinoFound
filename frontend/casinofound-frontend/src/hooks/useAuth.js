import { useState, useEffect, useContext, createContext } from 'react';
import { useWeb3ModalProvider, useWeb3ModalAccount } from '@web3modal/ethers/react';
import { apiClient } from '../lib/api';

// Contexto de autenticação
const AuthContext = createContext();

// Provider de autenticação
export const AuthProvider = ({ children }) => {
  const { walletProvider } = useWeb3ModalProvider();
  const { address, isConnected } = useWeb3ModalAccount();
  
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('auth_token'));
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Função para fazer login/registro automático quando wallet conecta
  const authenticateWithWallet = async (walletAddress) => {
    try {
      setLoading(true);
      
      // Tentar fazer login/registro com a wallet
      const response = await apiClient.post('/auth/register', {
        walletAddress: walletAddress.toLowerCase()
      });

      if (response.data.success) {
        const { token: newToken, user: userData } = response.data;
        
        // Salvar token no localStorage
        localStorage.setItem('auth_token', newToken);
        setToken(newToken);
        setUser(userData);
        setIsAuthenticated(true);
        
        // Configurar token no apiClient para próximas requisições
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        
        return { success: true, user: userData };
      }
    } catch (error) {
      console.error('Erro na autenticação:', error);
      return { success: false, error: error.response?.data?.error || 'Erro na autenticação' };
    } finally {
      setLoading(false);
    }
  };

  // Função para verificar token existente
  const verifyToken = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      // Configurar token no apiClient
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      const response = await apiClient.get('/auth/verify');
      
      if (response.data.success) {
        setUser(response.data.user);
        setIsAuthenticated(true);
      } else {
        // Token inválido, limpar
        logout();
      }
    } catch (error) {
      console.error('Erro na verificação do token:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  // Função de logout
  const logout = () => {
    localStorage.removeItem('auth_token');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    delete apiClient.defaults.headers.common['Authorization'];
  };

  // Efeito para verificar token ao carregar
  useEffect(() => {
    verifyToken();
  }, []);

  // Efeito para autenticar quando wallet conecta
  useEffect(() => {
    if (isConnected && address && !isAuthenticated) {
      authenticateWithWallet(address);
    } else if (!isConnected && isAuthenticated) {
      // Se wallet desconectou, fazer logout
      logout();
    }
  }, [isConnected, address]);

  // Função para definir senha do admin
  const setAdminPassword = async (password) => {
    if (!address || !isConnected) {
      throw new Error('Wallet não conectada');
    }

    try {
      const response = await apiClient.post('/auth/set-admin-password', {
        walletAddress: address.toLowerCase(),
        password
      });

      if (response.data.success) {
        const { token: newToken, user: userData } = response.data;
        
        localStorage.setItem('auth_token', newToken);
        setToken(newToken);
        setUser(userData);
        setIsAuthenticated(true);
        
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        
        return { success: true, user: userData };
      }
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Erro ao definir senha');
    }
  };

  // Função para login do admin com senha
  const adminLogin = async (password) => {
    if (!address || !isConnected) {
      throw new Error('Wallet não conectada');
    }

    try {
      const response = await apiClient.post('/auth/admin-login', {
        walletAddress: address.toLowerCase(),
        password
      });

      if (response.data.success) {
        const { token: newToken, user: userData } = response.data;
        
        localStorage.setItem('auth_token', newToken);
        setToken(newToken);
        setUser(userData);
        setIsAuthenticated(true);
        
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        
        return { success: true, user: userData };
      }
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Erro no login do admin');
    }
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    isConnected,
    address,
    walletProvider,
    authenticateWithWallet,
    logout,
    setAdminPassword,
    adminLogin,
    verifyToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook para usar o contexto de autenticação
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export default useAuth;

