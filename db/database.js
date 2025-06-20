const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./db/esporteagenda.sqlite');

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT,
      email TEXT NOT NULL UNIQUE,
      telefone TEXT,
      usuario TEXT NOT NULL UNIQUE,
      senha TEXT NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS quadras (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT,
      localizacao TEXT,
      tipo TEXT,
      esportes TEXT,
      preco TEXT,
      dia_inicio TEXT,
      dia_fim TEXT,
      hora_inicio TEXT,
      hora_fim TEXT,
      detalhes TEXT,
      imagem_url TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS alugueis (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      quadra_id INTEGER NOT NULL,
      usuario_id INTEGER NOT NULL,
      data_reserva DATE NOT NULL,
      hora_inicio TIME NOT NULL,
      hora_fim TIME NOT NULL,
      esporte TEXT,
      observacoes TEXT,
      status TEXT DEFAULT 'pendente',
      data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (quadra_id) REFERENCES quadras (id),
      FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
    )
  `);

  // Inserir usuário admin padrão (evita duplicatas)
  db.run(`INSERT OR IGNORE INTO usuarios (nome, email, telefone, usuario, senha) VALUES (?, ?, ?, ?, ?)`, ['Admin', 'admin@esporteagenda.com', '', 'admin', '1234']);
});

module.exports = db;
