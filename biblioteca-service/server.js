const express = require("express");
const axios = require("axios");
const app = express();
app.use(express.json());

const CATALOGO_URL = "http://localhost:3001";
const USUARIOS_URL = "http://localhost:3002";

// array em memória: { usuarioId, jogoId }
let biblioteca = [];

// POST /biblioteca — adiciona jogo à biblioteca do usuário
app.post("/biblioteca", async (req, res) => {
  const { usuarioId, jogoId } = req.body;

  if (!usuarioId || !jogoId) {
    return res
      .status(400)
      .json({ error: "usuarioId e jogoId são obrigatórios" });
  }

  // verifica se usuário existe
  try {
    await axios.get(`${USUARIOS_URL}/usuarios/${usuarioId}`);
  } catch {
    return res.status(404).json({ error: "Usuário não encontrado" });
  }

  // verifica se jogo existe
  try {
    await axios.get(`${CATALOGO_URL}/jogos/${jogoId}`);
  } catch {
    return res.status(404).json({ error: "Jogo não encontrado" });
  }

  // verifica duplicata
  const jaExiste = biblioteca.find(
    (b) => b.usuarioId === usuarioId && b.jogoId === jogoId,
  );
  if (jaExiste) {
    return res
      .status(409)
      .json({ error: "Jogo já está na biblioteca do usuário" });
  }

  biblioteca.push({ usuarioId, jogoId });
  res.status(201).json({ message: "Jogo adicionado à biblioteca com sucesso" });
});

// GET /biblioteca/:usuarioId — retorna usuário com jogos completos
app.get("/biblioteca/:usuarioId", async (req, res) => {
  const usuarioId = parseInt(req.params.usuarioId);

  // busca dados do usuário no usuarios-service
  let usuario;
  try {
    const resposta = await axios.get(`${USUARIOS_URL}/usuarios/${usuarioId}`);
    usuario = resposta.data;
  } catch {
    return res.status(503).json({
      error: "usuarios-service indisponível ou usuário não encontrado",
    });
  }

  // pega os jogoIds da biblioteca desse usuário
  const jogoIds = biblioteca
    .filter((b) => b.usuarioId === usuarioId)
    .map((b) => b.jogoId);

  // busca dados de cada jogo no catalogo-service (em paralelo)
  let jogos = [];
  try {
    const requisicoes = jogoIds.map((id) =>
      axios.get(`${CATALOGO_URL}/jogos/${id}`),
    );
    const respostas = await Promise.all(requisicoes);
    jogos = respostas.map((r) => r.data);
  } catch {
    return res.status(503).json({
      error: "catalogo-service indisponível ou jogo não encontrado",
    });
  }

  // monta resposta final composta
  res.json({ ...usuario, jogos });
});

app.listen(3000, () => console.log("biblioteca-service rodando na porta 3000"));
