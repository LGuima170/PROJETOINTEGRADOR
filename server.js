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

app.listen(PORT, () => {
  console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
});
