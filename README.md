# Minha Gameteca

Plataforma simples de coleção de jogos construída com arquitetura de microsserviços utilizando Node.js e Express.

Atividade prática da disciplina **AS64A — Programação Web Fullstack**  
UTFPR — Campus Cornélio Procópio  
Aluna: **Debora Batista Pereira de Almeida**

---

## Arquitetura

O projeto é dividido em 3 microsserviços independentes, cada um com seu próprio `package.json` e rodando em uma porta diferente:

| Serviço | Porta | Responsabilidade |
|---|---|---|
| `catalogo-service` | 3001 | Gerencia o catálogo de jogos (CRUD) |
| `usuarios-service` | 3002 | Gerencia os usuários da plataforma (CRUD) |
| `biblioteca-service` | 3000 | Relaciona usuários e jogos, consumindo os outros dois serviços via HTTP |

> O `biblioteca-service` **não acessa diretamente os dados** dos outros serviços — ele faz chamadas HTTP para compor a resposta final. Esse é o princípio central da arquitetura de microsserviços.

---

## Estrutura de pastas

```
minha-gameteca/
├── catalogo-service/
│   ├── package.json
│   └── server.js
├── usuarios-service/
│   ├── package.json
│   └── server.js
├── biblioteca-service/
│   ├── package.json
│   └── server.js
└── README.md
```

---

## Como rodar os serviços

É necessário ter o **Node.js** instalado. Abra **3 terminais separados** e rode cada serviço:

### Terminal 1 — catálogo
```bash
cd catalogo-service
npm install
node server.js
# catalogo-service rodando na porta 3001
```

### Terminal 2 — usuários
```bash
cd usuarios-service
npm install
node server.js
# usuarios-service rodando na porta 3002
```

### Terminal 3 — biblioteca
```bash
cd biblioteca-service
npm install
node server.js
# biblioteca-service rodando na porta 3000
```

---

## Rotas e exemplos de requisição

### catalogo-service — `http://localhost:3001`

#### Listar todos os jogos
```http
GET /jogos
```
```json
[
  { "id": 1, "titulo": "Hollow Knight", "plataforma": "PC", "genero": "Metroidvania" },
  { "id": 2, "titulo": "Hades", "plataforma": "Switch", "genero": "Roguelike" }
]
```

#### Buscar jogo por ID
```http
GET /jogos/1
```

#### Cadastrar novo jogo
```http
POST /jogos
Content-Type: application/json

{
  "titulo": "Celeste",
  "plataforma": "PC",
  "genero": "Plataforma"
}
```

#### Remover jogo
```http
DELETE /jogos/1
```

---

### usuarios-service — `http://localhost:3002`

#### Listar todos os usuários
```http
GET /usuarios
```
```json
[
  { "id": 1, "nome": "Ana", "email": "ana@email.com" },
  { "id": 2, "nome": "Bruno", "email": "bruno@email.com" }
]
```

#### Buscar usuário por ID
```http
GET /usuarios/1
```

#### Cadastrar novo usuário
```http
POST /usuarios
Content-Type: application/json

{
  "nome": "Carla",
  "email": "carla@email.com"
}
```

---

### biblioteca-service — `http://localhost:3000`

#### Adicionar jogo à biblioteca de um usuário
```http
POST /biblioteca
Content-Type: application/json

{
  "usuarioId": 1,
  "jogoId": 2
}
```
```json
{ "message": "Jogo adicionado à biblioteca com sucesso" }
```

#### Ver biblioteca completa de um usuário
```http
GET /biblioteca/1
```
```json
{
  "id": 1,
  "nome": "Ana",
  "email": "ana@email.com",
  "jogos": [
    { "id": 1, "titulo": "Hollow Knight", "plataforma": "PC", "genero": "Metroidvania" },
    { "id": 2, "titulo": "Hades", "plataforma": "Switch", "genero": "Roguelike" }
  ]
}
```


## Fluxo de teste recomendado

1. Subir os 3 serviços em terminais separados
2. `GET /jogos` para ver os jogos disponíveis
3. `GET /usuarios` para ver os usuários disponíveis
4. `POST /biblioteca` para associar um jogo a um usuário
5. `GET /biblioteca/:usuarioId` para ver a biblioteca montada com dados completos


## Reflexão sobre microsserviços

### O que acontece se um serviço ficar fora do ar?

Se o `catalogo-service` estiver fora do ar, o `GET /biblioteca/:usuarioId` falha ao tentar buscar os dados dos jogos e retorna erro 503. O usuário não consegue ver sua biblioteca, mesmo que o `usuarios-service` esteja funcionando normalmente. O mesmo vale para o caminho inverso: se o `usuarios-service` cair, não é possível identificar o usuário e a requisição também falha antes de chegar ao catálogo. Isso evidencia um dos pontos críticos dos microsserviços: uma cadeia de dependências entre serviços pode propagar falhas. Para mitigar esse problema em sistemas reais, utilizam-se estratégias como circuit breaker, cache e fallback.

### Quais são as vantagens da separação em comparação a um servidor único?

Cada serviço pode ser desenvolvido, testado, atualizado e escalado de forma independente. Se o catálogo de jogos precisar suportar muito mais tráfego que os outros serviços, é possível escalar apenas ele sem mexer nos demais. Além disso, equipes diferentes podem trabalhar em serviços diferentes ao mesmo tempo sem conflitos, e uma falha em um serviço não derruba toda a aplicação — apenas as funcionalidades que dependem diretamente dele ficam comprometidas.

### Que problemas novos surgem com microsserviços?

A complexidade operacional aumenta significativamente. Em um monolito, basta subir um processo; aqui são três terminais, três processos e três portas para gerenciar. A comunicação via HTTP introduz latência que não existe em chamadas locais, e qualquer instabilidade de rede pode causar falhas em cascata. Também surgem desafios de consistência de dados: como os serviços têm dados independentes em memória, garantir que um jogo excluído do catálogo seja também removido das bibliotecas dos usuários exige lógica adicional. Em projetos maiores, isso se torna um desafio de governança considerável.


## Tecnologias utilizadas

- [Node.js](https://nodejs.org/)
- [Express.js](https://expressjs.com/)
- [Axios](https://axios-http.com/) — comunicação HTTP entre serviços
