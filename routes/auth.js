const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Registrar usuário (wallet)
router.post('/register', async (req, res) => {
  try {
    const { walletAddress } = req.body;

    if (!walletAddress) {
      return res.status(400).json({ error: 'Endereço da wallet é obrigatório' });
    }

    // Verificar se usuário já existe
    let user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });
    
    if (user) {
      // Se usuário já existe, fazer login
      const token = jwt.sign(
        { userId: user._id, walletAddress: user.walletAddress },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.json({
        success: true,
        message: 'Login realizado com sucesso',
        token,
        user: {
          id: user._id,
          walletAddress: user.walletAddress,
          isAdmin: user.isAdmin,
          createdAt: user.createdAt
        }
      });
    }

    // Criar novo usuário
    user = new User({
      walletAddress: walletAddress.toLowerCase(),
      isAdmin: walletAddress.toLowerCase() === process.env.ADMIN_WALLET_ADDRESS?.toLowerCase()
    });

    await user.save();

    const token = jwt.sign(
      { userId: user._id, walletAddress: user.walletAddress },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Usuário registrado com sucesso',
      token,
      user: {
        id: user._id,
        walletAddress: user.walletAddress,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Login com wallet
router.post('/login', async (req, res) => {
  try {
    const { walletAddress } = req.body;

    if (!walletAddress) {
      return res.status(400).json({ error: 'Endereço da wallet é obrigatório' });
    }

    // Buscar usuário
    let user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });
    
    if (!user) {
      // Se usuário não existe, criar automaticamente
      user = new User({
        walletAddress: walletAddress.toLowerCase(),
        isAdmin: walletAddress.toLowerCase() === process.env.ADMIN_WALLET_ADDRESS?.toLowerCase()
      });
      await user.save();
    }

    const token = jwt.sign(
      { userId: user._id, walletAddress: user.walletAddress },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      token,
      user: {
        id: user._id,
        walletAddress: user.walletAddress,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Definir senha do admin (primeira vez)
router.post('/set-admin-password', async (req, res) => {
  try {
    const { walletAddress, password } = req.body;

    if (!walletAddress || !password) {
      return res.status(400).json({ error: 'Endereço da wallet e senha são obrigatórios' });
    }

    // Verificar se é o endereço do admin
    if (walletAddress.toLowerCase() !== process.env.ADMIN_WALLET_ADDRESS?.toLowerCase()) {
      return res.status(403).json({ error: 'Apenas o admin pode definir a senha' });
    }

    // Buscar ou criar usuário admin
    let user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });
    
    if (!user) {
      user = new User({
        walletAddress: walletAddress.toLowerCase(),
        isAdmin: true
      });
    }

    // Hash da senha
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    user.password = hashedPassword;
    user.isAdmin = true;
    await user.save();

    const token = jwt.sign(
      { userId: user._id, walletAddress: user.walletAddress },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Senha do admin definida com sucesso',
      token,
      user: {
        id: user._id,
        walletAddress: user.walletAddress,
        isAdmin: user.isAdmin,
        hasPassword: true,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('Erro ao definir senha do admin:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Login do admin com senha
router.post('/admin-login', async (req, res) => {
  try {
    const { walletAddress, password } = req.body;

    if (!walletAddress || !password) {
      return res.status(400).json({ error: 'Endereço da wallet e senha são obrigatórios' });
    }

    // Buscar usuário admin
    const user = await User.findOne({ 
      walletAddress: walletAddress.toLowerCase(),
      isAdmin: true 
    });

    if (!user || !user.password) {
      return res.status(401).json({ error: 'Admin não encontrado ou senha não definida' });
    }

    // Verificar senha
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Senha incorreta' });
    }

    const token = jwt.sign(
      { userId: user._id, walletAddress: user.walletAddress },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login do admin realizado com sucesso',
      token,
      user: {
        id: user._id,
        walletAddress: user.walletAddress,
        isAdmin: user.isAdmin,
        hasPassword: true,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('Erro no login do admin:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Verificar token
router.get('/verify', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        walletAddress: user.walletAddress,
        isAdmin: user.isAdmin,
        hasPassword: !!user.password,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('Erro na verificação:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logout realizado com sucesso'
  });
});

module.exports = router;

