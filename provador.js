// Código do programa provador_api.js para rodar permanentemente como uma API

// Primeiro, instale os pacotes necessários
// Execute no terminal: npm install express mongodb crypto

const express = require('express');
const { MongoClient } = require('mongodb');
const crypto = require('crypto');

const app = express();
const port = 3000;

const url = 'mongodb://192.168.1.202:27017';
const client = new MongoClient(url);
const dbName = 'consorcioDB';

// Middleware para ler JSON do corpo das requisições
app.use(express.json());

async function connectToDB() {
  await client.connect();
  console.log('Conectado ao MongoDB com sucesso');
  return client.db(dbName);
}

app.post('/generate-zkp', async (req, res) => {
  const { userID, v } = req.body;

  if (!userID || !v) {
    return res.status(400).send('userID e v são obrigatórios.');
  }

  try {
    const db = await connectToDB();
    const usersCollection = db.collection('users');

    // Buscar o documento pelo userID
    const document = await usersCollection.findOne({ 'userID': userID });

    if (!document) {
      return res.status(404).send('Documento não encontrado');
    }

    // Gerar um nonce aleatório (r) apenas conhecido pelo provador
    const r = crypto.randomBytes(16).toString('hex');

    // Hash do JSON do documento (h_1) e verificar integridade
    const h_1 = document.h_1;
    const recalculatedHash = crypto.createHash('sha256').update(JSON.stringify(document)).digest('hex');
    if (h_1 !== recalculatedHash) {
      return res.status(400).send('Diferença de HASH');
    }

    // Gerar a prova ZKP utilizando Fiat-Shamir/Schnorr
    // Calcular o desafio (c) = H(h_1, r, v)
    const c = crypto.createHash('sha256').update(h_1 + r + v).digest('hex');

    // Calcular a resposta (s) = combinação de h_1, r, e v
    const s = crypto.createHash('sha256').update(h_1 + r + v).digest('hex');

    // Enviar a prova ZKP como resposta
    res.json({
      h_1: h_1,
      c: c,
      s: s
    });
  } catch (error) {
    console.error('Erro ao processar a requisição:', error);
    res.status(500).send('Erro interno do servidor');
  }
});

app.listen(port, () => {
  console.log(`Provador API rodando em http://192.168.1.202:${port}`);
});

process.on('SIGINT', async () => {
  await client.close();
  console.log('Conexão com MongoDB fechada');
  process.exit(0);
});