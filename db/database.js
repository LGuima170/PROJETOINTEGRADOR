const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./db/esporteagenda.sqlite');

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT,
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
      disponibilidade TEXT,
      detalhes TEXT
    )
  `);

  // Inserir usuário admin padrão (evita duplicatas)
  db.run(`INSERT OR IGNORE INTO usuarios (nome, usuario, senha) VALUES (?, ?, ?)`, ['Admin', 'admin', '1234']);
});

module.exports = db;
