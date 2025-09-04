const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db/database');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// -------------------- ROTAS DE AUTENTICAÇÃO --------------------

// Login
app.post('/login', (req, res) => {
  const { email, senha } = req.body;
  db.get(
    `SELECT * FROM usuarios WHERE usuario = ? AND senha = ?`,
    [email, senha],
    (err, row) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Erro interno' });
      }
      if (row) {
        return res.json({ success: true, redirectUrl: '/menuprincipal.html' });
      } else {
        return res.status(401).json({ success: false, message: 'Usuário ou senha incorretos' });
      }
    }
  );
});

// Cadastro (verifica duplicidade)
app.post('/api/cadastrar', (req, res) => {
  const { nome, senha, email, telefone } = req.body;
  const usuario = email; // Usa email como usuário

  db.get(`SELECT * FROM usuarios WHERE usuario = ?`, [usuario], (err, row) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Erro ao verificar usuário.' });
    }
    if (row) {
      return res.status(409).json({ success: false, message: 'Usuário já cadastrado.' });
    }

    db.run(
      `INSERT INTO usuarios (nome, usuario, senha, email, telefone) VALUES (?, ?, ?, ?, ?)`,
      [nome, usuario, senha, email, telefone],
      function (err) {
        if (err) {
          console.error(err.message);
          return res.status(500).json({ success: false, message: 'Erro ao cadastrar usuário' });
        }
        return res.json({ success: true, redirectUrl: '/telalogin.html' });
      }
    );
  });
});

// -------------------- ROTAS DE RECUPERAÇÃO DE SENHA --------------------

// Recuperação de senha (verifica email)
app.post('/recuperar-senha', (req, res) => {
  const { email } = req.body;
  db.get(`SELECT * FROM usuarios WHERE email = ?`, [email], (err, row) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Erro interno ao consultar email' });
    }
    if (!row) {
      return res.status(404).json({ success: false, message: 'Email não encontrado no sistema' });
    }
    // Envia o nome do usuário e redireciona
    return res.json({ success: true, usuario: row.usuario, redirectUrl: '/Nova senha.html' });
  });
});

// Atualiza a senha
app.post('/nova-senha', (req, res) => {
  const { email, senha } = req.body;
  db.run(
    `UPDATE usuarios SET senha = ? WHERE email = ?`,
    [senha, email],
    function (err) {
      if (err) {
        return res.status(500).json({ success: false, message: 'Erro ao atualizar senha.' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ success: false, message: 'Usuário não encontrado.' });
      }
      return res.json({ success: true, message: 'Senha atualizada com sucesso!' });
    }
  );
});

// -------------------- ROTAS DE QUADRAS --------------------

// Publicação de quadra
app.post('/api/publicar-quadra', (req, res) => {
  const { nome, localizacao, tipo, esportes, preco, disponibilidade, detalhes } = req.body;
  db.run(
    `INSERT INTO quadras (nome, localizacao, tipo, esportes, preco, disponibilidade, detalhes)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [nome, localizacao, tipo, esportes, preco, disponibilidade, detalhes],
    function (err) {
      if (err) {
        return res.status(500).json({ success: false, message: 'Erro ao publicar quadra.' });
      }
      return res.json({ success: true, redirectUrl: '/menuprincipal.html' });
    }
  );
});

// -------------------- ROTAS DE PÁGINAS --------------------

// Menu principal
app.get('/menu', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'menuprincipal.html'));
});

// Menu em destaque
app.get('/menu-destaque', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'menuemdestaque.html'));
});

// Principais eventos
app.get('/eventos', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'principaiseventos.html'));
});

// Esqueci a senha
app.get('/esqueci-senha', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'esqueci-senha.html'));
});

// Nova senha
app.get('/nova-senha', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'Nova senha.html'));
});

// -------------------- INICIALIZAÇÃO DO SERVIDOR --------------------

app.listen(PORT, () => {
  console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
});
