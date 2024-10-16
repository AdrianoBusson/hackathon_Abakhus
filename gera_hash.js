// Código do programa gera_hash.js para atualizar o campo h_1 dos documentos de usuário no MongoDB

// Primeiro, instale os pacotes necessários
// Execute no terminal: npm install mongodb crypto

const { MongoClient } = require('mongodb');
const crypto = require('crypto');

const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);
const dbName = 'consorcioDB';

async function run() {
  try {
    // Conectar ao servidor MongoDB
    await client.connect();
    console.log('Conectado ao MongoDB com sucesso');

    const db = client.db(dbName);
    const usersCollection = db.collection('users');

    // Buscar todos os documentos de usuários
    const users = await usersCollection.find().toArray();

    for (const user of users) {
      // Gerar um hash do documento do usuário
      const hash = crypto.createHash('sha256').update(JSON.stringify(user)).digest('hex');

      // Atualizar o campo h_1 com o hash gerado
      await usersCollection.updateOne(
        { _id: user._id },
        { $set: { h_1: hash } }
      );

      console.log(`Hash atualizado para o usuário com ID: ${user.userID}`);
    }
  } catch (err) {
    console.error('Erro ao atualizar os hashes:', err);
  } finally {
    // Fechar a conexão com o MongoDB
    await client.close();
  }
}

run();