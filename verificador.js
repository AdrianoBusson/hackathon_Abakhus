// Código do programa verificador.js para acessar a API pública e interagir com o Provador

// Primeiro, instale os pacotes necessários
// Execute no terminal: npm install axios crypto

const axios = require('axios');
const crypto = require('crypto');

// Variável global Tokens como coleção
let Tokens = [];

async function fetchTokens() {
  try {
    console.log('Acessando API...6')
    //const response = await axios.get('https://arbitrum.abakhus.io/api/getMetadataByTokenId', {
      //params: {
       // 'owner': '0xdfc0c9df7c1bea2281aeebc90fd9ead94f9e1d0f',
       // 'tokenId': '1'
     // },
      //headers: {
      //  'accept': 'application/json',
      //  'x-api-key': '267963a15ae6c2c0dbcfed3ecc253d50'
     // }
    //});

// Preencher a variável Tokens com valores padrão como coleção
// Preencher a variável Tokens com valores padrão como coleção

const Tokens = [
    { userID: 1, h_1: 'b36dd1e2dcf98c6aba4f289a049ca82718c8a19c0c22b823ec4190bf10a8be4c' },
    { userID: 2, h_1: 'f222ca82bf4585e44765452f49308b63ed09422e0423bd29ad176e3fc294c900' }
  ];


console.log('Tokens preenchidos com valores:', Tokens);

    // Armazenar userID e h_1 na coleção Tokens
    //const { user, h_1 } = response.data;
    //Tokens.push({ userID: user, h_1 });
  } catch (error) {
    console.error('Erro ao acessar a API pública:', error.message);
    
    
  }
}

async function verifyTokens() {
    console.log('Acessando provador...2')
    Tokens.forEach((documento, index) => {
        console.log(`Documento ${index + 1}:`, documento);
      });
    try{ console.log('Acessando provador...3')
        for (const token of Tokens) {
            try { console.log('Acessando provador...')
            const { userID, h_1 } = token;
            const v = crypto.randomBytes(16).toString('hex'); // Gerar nonce aleatório v
            console.log('Acessando:',userID)
            
            // Fazer requisição para a API do Provador
            
            const response = await axios.post('http://192.168.1.139:3000/generate-zkp', {
                docID: userID,
                v: v
            });

            const { h_1: provador_h_1, c, s } = response.data;

            // Verificar se o hash recebido é o mesmo do banco de dados
            if (h_1 !== provador_h_1) {
                console.error(`Erro: Hash diferente para o usuário ${userID}`);
                continue;
            }

            // Recalcular o desafio c (cv) para validação
            const cv = crypto.createHash('sha256').update(h_1 + s + v).digest('hex');

            // Comparar c e cv
            if (c === cv) {
                console.log(`Prova Válida para o usuário ${userID}`);
            } else {
                console.log(`Prova não válida para o usuário ${userID}`);
            }
            } catch (error) {
            console.error(`Erro ao acessar a API do Provador para o usuário ${userID}:`, error.message);
            }
        }
    }catch (error) {
        console.error(`Erro ao acessar a API do Provador para o usuário ${userID}:`, error.message);
        }    
}

async function run() {
  await fetchTokens();
  await verifyTokens();
}

run();