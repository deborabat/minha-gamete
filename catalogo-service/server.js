const express = require("express");
const app = express();
app.use(express.json());

let jogos = [
  { id: 1, titulo: "Hollow Knight", plataforma: "PC", genero: "Metroidvania" },
  { id: 2, titulo: "Hades", plataforma: "Switch", genero: "Roguelike" },
  { id: 3, titulo: "Celeste", plataforma: "PC", genero: "Plataforma" },
  { id: 4, titulo: "Stardew Valley", plataforma: "PC", genero: "Simulação" },
];

let proximoId = 5;

// GET /jogos — lista todos
app.get("/jogos", (req, res) => {
  res.json(jogos);
});

// GET /jogos/:id — busca um
app.get("/jogos/:id", (req, res) => {
  const jogo = jogos.find((j) => j.id === parseInt(req.params.id));
  if (!jogo) return res.status(404).json({ error: "Jogo não encontrado" });
  res.json(jogo);
});

// POST /jogos — cadastra
app.post("/jogos", (req, res) => {
  const { titulo, plataforma, genero } = req.body;
  if (!titulo || !plataforma || !genero) {
    return res
      .status(400)
      .json({ error: "titulo, plataforma e genero são obrigatórios" });
  }
  const novoJogo = { id: proximoId++, titulo, plataforma, genero };
  jogos.push(novoJogo);
  res.status(201).json(novoJogo);
});

// DELETE /jogos/:id — remove
app.delete("/jogos/:id", (req, res) => {
  const index = jogos.findIndex((j) => j.id === parseInt(req.params.id));
  if (index === -1)
    return res.status(404).json({ error: "Jogo não encontrado" });
  jogos.splice(index, 1);
  res.json({ message: "Jogo removido com sucesso" });
});

app.listen(3001, () => console.log("catalogo-service rodando na porta 3001"));
