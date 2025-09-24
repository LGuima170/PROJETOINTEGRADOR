const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db/database');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Garante que o diretório de uploads exista
const uploadDir = 'public/assets/images/quadras';
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuração do Multer para upload de imagens
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); // Diretório onde as imagens serão salvas
  },
  filename: function (req, file, cb) {
    // Renomeia o arquivo: nomeDoEstabelecimento-timestamp.extensao
    const originalName = file.originalname;
    const extension = path.extname(originalName);
    const courtName = req.body.nome.replace(/\s+/g, '-').toLowerCase();
    const uniqueSuffix = Date.now();
    cb(null, `${courtName}-${uniqueSuffix}${extension}`);
  }
});

const upload = multer({ storage: storage });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Rota para buscar todas as quadras (deve vir antes das outras rotas)
app.get('/api/quadras', (req, res) => {
  db.all(`SELECT * FROM quadras ORDER BY id DESC`, (err, rows) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ success: false, message: 'Erro ao buscar quadras' });
    }
    return res.json({ success: true, quadras: rows });
  });
});
  function checkroles(role){
    return (req, res, next) => {
      if (req.user && req.user.role === role){
        next();}//passar para a rota 
      else{
        status(403).send("Não pode!");
      }
    }
  }

//Rotas para controlar dono da quadra
app.post("/api/quadras",
  checkroles("admin"), (req, res) =>{});

//Rota para atleta 
app.post("api/quadras", 
  checkroles("user"), (req, res) =>{}
);

// Rota para criar uma reserva
app.post('/api/reservar-quadra', (req, res) => {
  const { quadra_id, usuario_id, data_reserva, hora_inicio, hora_fim, esporte, observacoes } = req.body;

  // Verificar se a quadra existe
  db.get(`SELECT * FROM quadras WHERE id = ?`, [quadra_id], (err, quadra) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Erro ao verificar quadra' });
    }
    if (!quadra) {
      return res.status(404).json({ success: false, message: 'Quadra não encontrada' });
    }

    // Verificar se o horário está dentro do funcionamento da quadra
    const dataReserva = new Date(data_reserva);
    const diaSemana = dataReserva.getDay(); // 0 = Domingo, 1 = Segunda, 2 = Terça, etc.
    
    // Mapear dias da semana (0-6) para os valores do banco
    const diasSemana = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
    const diaReserva = diasSemana[diaSemana];
    
    // Debug: Log das informações
    console.log('Debug - Data da reserva:', data_reserva);
    console.log('Debug - Dia da semana (número):', diaSemana);
    console.log('Debug - Dia da semana (nome):', diaReserva);
    console.log('Debug - Funcionamento da quadra:', quadra.dia_inicio, 'a', quadra.dia_fim);
    
    // Verificar se o dia da reserva está dentro do funcionamento
    const diasFuncionamento = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'];
    const indiceInicio = diasFuncionamento.indexOf(quadra.dia_inicio);
    const indiceFim = diasFuncionamento.indexOf(quadra.dia_fim);
    const indiceReserva = diasFuncionamento.indexOf(diaReserva);
    
    console.log('Debug - Índices:', { indiceInicio, indiceFim, indiceReserva });
    
    // Verificar se o dia da reserva está dentro do intervalo de funcionamento
    let diaValido = false;
    if (indiceInicio <= indiceFim) {
      // Funcionamento normal (ex: segunda a sexta)
      diaValido = indiceReserva >= indiceInicio && indiceReserva <= indiceFim;
    } else {
      // Funcionamento que cruza o domingo (ex: sexta a segunda)
      diaValido = indiceReserva >= indiceInicio || indiceReserva <= indiceFim;
    }
    
    console.log('Debug - Dia válido:', diaValido);
    
    if (!diaValido) {
      return res.status(400).json({ 
        success: false, 
        message: `A quadra não funciona neste dia (${diaReserva}). Funciona de ${quadra.dia_inicio} a ${quadra.dia_fim}. Data da reserva: ${data_reserva}` 
      });
    }

    if (hora_inicio < quadra.hora_inicio || hora_fim > quadra.hora_fim) {
      return res.status(400).json({ 
        success: false, 
        message: `Horário fora do funcionamento. Funciona das ${quadra.hora_inicio} às ${quadra.hora_fim}` 
      });
    }

    // Verificar se já existe reserva para este horário
    db.get(`
      SELECT * FROM alugueis 
      WHERE quadra_id = ? AND data_reserva = ? 
      AND ((hora_inicio <= ? AND hora_fim > ?) OR (hora_inicio < ? AND hora_fim >= ?))
      AND status != 'cancelado'
    `, [quadra_id, data_reserva, hora_inicio, hora_inicio, hora_fim, hora_fim], (err, reservaExistente) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Erro ao verificar disponibilidade' });
      }
      if (reservaExistente) {
        return res.status(400).json({ success: false, message: 'Horário já reservado' });
      }

      // Criar a reserva
      db.run(`
        INSERT INTO alugueis (quadra_id, usuario_id, data_reserva, hora_inicio, hora_fim, esporte, observacoes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [quadra_id, usuario_id, data_reserva, hora_inicio, hora_fim, esporte, observacoes], function (err) {
        if (err) {
          console.error(err.message);
          return res.status(500).json({ success: false, message: 'Erro ao criar reserva' });
        }
        return res.json({ 
          success: true, 
          message: 'Reserva criada com sucesso!',
          reserva_id: this.lastID 
        });
      });
    });
  });
});

// Rota para buscar reservas de um usuário
app.get('/api/minhas-reservas/:usuario_id', (req, res) => {
  const { usuario_id } = req.params;

  db.all(`
    SELECT a.*, q.nome as nome_quadra, q.localizacao, q.preco
    FROM alugueis a
    JOIN quadras q ON a.quadra_id = q.id
    WHERE a.usuario_id = ?
    ORDER BY a.data_reserva DESC, a.hora_inicio DESC
  `, [usuario_id], (err, rows) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ success: false, message: 'Erro ao buscar reservas' });
    }
    return res.json({ success: true, reservas: rows });
  });
});

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
  const { nome, usuario, senha, email, role } = req.body;

  db.run(
    `INSERT INTO usuarios (nome, usuario, senha, email, role) VALUES (?, ?, ?, ?, ?)`,
    [nome, usuario, senha, email, papel],
    function (err) {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ success: false, message: 'Erro ao cadastrar usuário' });
      }
      return res.json({ success: true, redirectUrl: '/telalogin.html' });
    }
  );
});

// Rota de publicação de quadra com upload de imagem
app.post('/api/publicar-quadra', upload.single('imagem'), (req, res) => {
  const { nome, localizacao, tipo, esportes, preco, dia_inicio, dia_fim, hora_inicio, hora_fim, detalhes } = req.body;
  
  // O caminho do arquivo salvo fica disponível em req.file.path
  // Vamos normalizar para um caminho URL
  const imagem_url = req.file ? req.file.path.replace(/\\/g, '/').replace('public/', '') : null;

  db.run(`
    INSERT INTO quadras (nome, localizacao, tipo, esportes, preco, dia_inicio, dia_fim, hora_inicio, hora_fim, detalhes, imagem_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [nome, localizacao, tipo, esportes, preco, dia_inicio, dia_fim, hora_inicio, hora_fim, detalhes, imagem_url], function (err) {
    if (err) {
      console.error(err.message);
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

