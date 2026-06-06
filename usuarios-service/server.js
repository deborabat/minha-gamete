const express = require("express");
const app = express();
app.use(express.json());

let usuarios = [
  { id: 1, nome: "Ana", email: "ana@email.com" },
  { id: 2, nome: "Bruno", email: "bruno@email.com" },
  { id: 3, nome: "Carla", email: "carla@email.com" },
];

let proximoId = 4;

// GET /usuarios — lista todos
app.get("/usuarios", (req, res) => {
  res.json(usuarios);
});

// GET /usuarios/:id — busca um
app.get("/usuarios/:id", (req, res) => {
  const usuario = usuarios.find((u) => u.id === parseInt(req.params.id));
  if (!usuario)
    return res.status(404).json({ error: "Usuário não encontrado" });
  res.json(usuario);
});

// POST /usuarios — cadastra
app.post("/usuarios", (req, res) => {
  const { nome, email } = req.body;
  if (!nome || !email) {
    return res.status(400).json({ error: "nome e email são obrigatórios" });
  }
  const novoUsuario = { id: proximoId++, nome, email };
  usuarios.push(novoUsuario);
  res.status(201).json(novoUsuario);
});

app.listen(3002, () => console.log("usuarios-service rodando na porta 3002"));
