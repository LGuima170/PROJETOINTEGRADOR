const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db/database');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Rota de login
app.post('/login', (req, res) => {
  const { usuario, senha } = req.body;

  db.get(`SELECT * FROM usuarios WHERE usuario = ? AND senha = ?`, [usuario, senha], (err, row) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Erro interno' });
    }

    if (row) {
      return res.json({ success: true, redirectUrl: '/menuprincipal.html' });
    } else {
      return res.status(401).json({ success: false, message: 'Usuário ou senha incorretos' });
    }
  });
});

// Rota de cadastro
app.post('/api/cadastrar', (req, res) => {
  const { nome, usuario, senha, email } = req.body;

  db.run(
    `INSERT INTO usuarios (nome, usuario, senha, email) VALUES (?, ?, ?, ?)`,
    [nome, usuario, senha, email],
    function (err) {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ success: false, message: 'Erro ao cadastrar usuário' });
      }
      return res.json({ success: true, redirectUrl: '/telalogin.html' });
    }
  );
});

// Rota de publicação de quadra
app.post('/api/publicar-quadra', (req, res) => {
  const { nome, localizacao, tipo, esportes, preco, disponibilidade, detalhes } = req.body;

  db.run(`
    INSERT INTO quadras (nome, localizacao, tipo, esportes, preco, disponibilidade, detalhes)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [nome, localizacao, tipo, esportes, preco, disponibilidade, detalhes], function (err) {
    if (err) {
      return res.status(500).json({ success: false, message: 'Erro ao publicar quadra.' });
    }
    return res.json({ success: true, redirectUrl: '/menuprincipal.html' });
  });
});

// Rota de recuperação de senha (nova)
app.post('/recuperar-senha', (req, res) => {
  const { email } = req.body;

  db.get(`SELECT * FROM usuarios WHERE email = ?`, [email], (err, row) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Erro interno ao consultar email' });
    }

    if (!row) {
      return res.status(404).json({ success: false, message: 'Email não encontrado no sistema' });
    }

    // Enviar o nome do usuário e redirecionar
    return res.json({ success: true, usuario: row.usuario, redirectUrl: '/Nova senha.html' });
  });
});

// Rota para o menu principal
app.get('/menu', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'menuprincipal.html'));
});

// Rota para a página de menu em destaque
app.get('/menu-destaque', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'menuemdestaque.html'));
});

// 🔥 Rota para a página de Principais Eventos
app.get('/eventos', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'principaiseventos.html'));
});

app.listen(PORT, () => {
  console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
});

// Rota para a página de "Esqueci a senha"
app.get('/esqueci-senha', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'esqueci-senha.html'));
});

// Rota para a página de "Nova Senha"
app.get('/nova-senha', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'Nova senha.html'));
});

// Rota de cadastro
app.post('/api/cadastrar', (req, res) => {
  const { nome, usuario, senha, email } = req.body;

  db.run(
    `INSERT INTO usuarios (nome, usuario, senha, email) VALUES (?, ?, ?, ?)`,
    [nome, usuario, senha, email],
    function (err) {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ success: false, message: 'Erro ao cadastrar usuário' });
      }
      return res.json({ success: true, redirectUrl: '/telalogin.html' });
    }
  );
});

// Rota de publicação de quadra
app.post('/api/publicar-quadra', (req, res) => {
  const { nome, localizacao, tipo, esportes, preco, disponibilidade, detalhes } = req.body;

  db.run(`
    INSERT INTO quadras (nome, localizacao, tipo, esportes, preco, disponibilidade, detalhes)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [nome, localizacao, tipo, esportes, preco, disponibilidade, detalhes], function (err) {
    if (err) {
      return res.status(500).json({ success: false, message: 'Erro ao publicar quadra.' });
    }
    return res.json({ success: true, redirectUrl: '/menuprincipal.html' });
  });
});

// Rota para o menu principal
app.get('/menu', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'menuprincipal.html'));
});

// Rota para a página de menu em destaque
app.get('/menu-destaque', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'menuemdestaque.html'));
});

// 🔥 Rota para a página de Principais Eventos
app.get('/eventos', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'principaiseventos.html'));
});

app.listen(PORT, () => {
  console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
});

// Rota para a página de "Esqueci a senha"
app.get('/esqueci-senha', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'Esqueci a senha.html'));
});

// Rota para a página de "Nova Senha"
app.get('/nova-senha', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'Nova senha.html'));
});
