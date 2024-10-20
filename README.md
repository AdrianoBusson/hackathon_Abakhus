# Arbitrum Hacker House (2024-2)
Projeto desenvolvido para o Hackathon Abakhus - Arbitrum

## ZKP-Privacy
Apresentado dia 15/10/2024

Por Adriano Busson

# Pitch de apresentação

## Problema:

Empresas enfrentam grandes desafios ao armazenar dados sensíveis, especialmente em conformidade com a Lei Geral de Proteção de Dados (LGPD). 

A necessidade de garantir privacidade, segurança e, ao mesmo tempo, permitir auditorias seguras é uma dor constante para setores como bancos, seguradoras, saúde e e-commerce. 

Além disso, as empresas precisam assegurar o direito ao esquecimento e a possibilidade de editar dados conforme regulamentações, sem comprometer a integridade dos registros.

## Solução:

Nossa plataforma híbrida de armazenamento de dados combina as melhores práticas de armazenamento seguro em sistemas NoSQL com a integridade da blockchain pública e Zero Knowledge Proof (ZKP). 

O sistema permite que dados sensíveis sejam armazenados de forma segura em bases de dados NoSQL, oferecendo suporte a edições, direito ao esquecimento e auditoria. 

Simultaneamente, dados não sensíveis e hashes anonimizados são publicados em blockchain, garantindo segurança, conformidade e transparência.

## Diferenciais:

**Armazenamento NoSQL Seguro:**

Utilizamos bancos de dados NoSQL para armazenar dados sensíveis em qualquer formato, oferecendo flexibilidade e escalabilidade, permitindo que os dados sejam editados ou apagados conforme necessário, em conformidade com o direito ao esquecimento da LGPD.


**Provas de Conhecimento Zero (ZKP):**

Publicamos provas em blockchain utilizando Zero Knowledge Proof, permitindo auditorias que garantem a integridade e existência dos dados, sem expor informações sensíveis.

**Conformidade e Transparência:**

A publicação de hashes em blockchain assegura que os dados são protegidos, anonimizados e auditáveis, permitindo a comprovação de sua existência e segurança de forma permanente.

**Apagou ou Editou? É só gerar outro Hash e publicar na blockchain, e quando for prerciso é só gerar nova prova ZKP.**

## Benefícios: 

**Conformidade Total com a LGPD:** O sistema assegura que todos os dados sensíveis sejam armazenados de forma segura, com direito ao esquecimento e edição, enquanto mantém a imutabilidade e a transparência dos registros por meio da blockchain.

**Segurança e Auditabilidade:** O uso de blockchain pública garante a segurança dos dados e facilita auditorias sem a necessidade de expor informações sensíveis, tudo validado por ZKP.

**Flexibilidade do Sistema NoSQL:** A flexibilidade de um banco de dados NoSQL permite manipular os dados de forma eficiente e atender a regulamentações, como a edição ou exclusão de informações pessoais.

## Mercado  Alvo:

Empresas e grupos empresariais que manipulam grandes volumes de dados sensíveis e precisam de conformidade com a LGPD, como instituições financeiras, seguradoras, hospitais, empresas de e-commerce, telecomunicações e educação.

# Descrição técnica de sistema:

## O sistema é dividido em 3 blocos principais:
1- Um banco de dados MongoDB.

2- Um programa em node.js, chamado de "Provador" que recebe requisições por uma API, faz CRUD com o banco de dados, faz processamentos de Zero Knoledge Proof e faz publicações em uma API externa.

3- Um programa em node.js, chamado de "Verificador" que interaje com uma API Pública externa e faz requisições para a API do Provador.

## O banco de dados MongoDB tem as seguintes caracteristicas:
### 1.1- Cadastro de usuários, onde cada usuário tem várias características (dados cadastrais, financeiros, resultados de exames, registros de consultas, etc.).
### 1.2- Cada usuário deve ter um identificador único (um campo userID).
### 1.3- Características do Usuário: As seguintes características podem ser armazenadas como subdocumentos embutidos, sendo que cada documento embutido deverá ter um identificador único (docID):
**Informações pessoais:** nome, endereço, data de nascimento, etc.

**Dados Financeiros:** salário, histórico de crédito, transações, etc.

**Resultados de Exames Médicos:** Podem incluir diferentes tipos e formatos de dados, como imagens, PDFs ou valores numéricos.

**Registro de Consultas Médicas:** Notas médicas, prescrições, recomendações, etc.

**Outras Coleções de Dados:** Qualquer outra informação relevante que precisa ser armazenada.

### 1.4- Cada documento embutido deve incluir os seguintes campos adicionais:

**h_1:** Uma representação hash criptográfica do JSON completo do documento embutido utilizando uma função hash segura (SHA-256). Isso assegura a integridade dos dados e permite verificar se eles não foram alterados.

**tokenID:** Um identificador de token da blockchain Arbitrum.

## O programa chamado Provador terá as seguintes caracteristicas:

### 2.1- Fazer CRUD no mongoDB

### 2.2- Receber via API os seguintes dados nas requisições:

**docID:** Que identifica o documento (docID) no Banco de dados.

**v:** Uma string enviada para computação para ter uma função de nonce que só o verificador conhece.

### 2.3- Ao receber a requisição via API o Provador fará o seguinte:

Fazer a leitura do documento embutido no banco de dados pelo docID recebido via API.

Gerar uma prova ZPK Fiat-Sharmir/Schnorr com as seguintes caracteristicas:

Utilizar o JSON lido anteriormente para geração de uma prova ZKP incluindo no cálculo, (que já possui um valor nonce (r) aleatório só conhecido pelo provador), o nonce (v) recebido via API como prova designada pelo verificador para evitar não Simulabilidade e transferibilidade das provas. 

Verificar se o hash resultado do cálculo ZPK é o mesmo que o campo hash do documento embutido docID. Se não for exibir uma mensagem de erro de "Diferença de HASH"

## A resposta via APi será a prova ZPK para o verificador contendo o seguinte:

**h_1:** Esse é o hash do JSON, que serve como compromisso inicial do provador, que foi calculado a partir do JSON utilizando uma função hash segura (SHA-256). Esse hash é representativo do conteúdo do JSON e serve para verificar a integridade dos dados.

**Desafio (c):** O desafio é gerado utilizando o heurístico Fiat-Shamir-Schnorr. Esse heurístico transforma uma prova interativa em uma prova não interativa, usando uma função hash criptográfica para simular o papel do verificador na criação de um "desafio" que é gerado da seguinte maneira:

c = H(h_1, r, v), onde H é uma função hash segura. Este valor é determinístico e depende do hash h_1, do nonce r e do nounce v. Ou seja, ele é gerado de maneira que qualquer um possa recalculá-lo se tiver os mesmos valores de entrada, mas só pode ser produzido corretamente pelo provador que conhece r e o v.

**Resposta (s):**  A resposta s é gerada pelo provador com base em um cálculo que envolve o nonce r, o compromisso (h_1) e o nonce v. A resposta serve para provar que o provador realmente conhece o valor original (JSON) que gerou o hash público h_1. O cálculo para s deve ser feito de modo a garantir que o valor não possa ser produzido sem o conhecimento do nonce r e do nonce v.
 
## O programa chamado Verificador tem as seguintes caracteristicas:

### 3.1- Fazer leitura de dados de uma API pública que terão detalhes futuramente mas que terão os seguintes dados como retorno:

**docID:** Valor que identifica um documento (docID) no Banco de dados do provador.

**h_1:** O Hash do JSON no banco de dados e utilizado no cálculo do ZKP.

### 3.2- Ao receber os dados citados anteriormente, fazer requisição para uma API do programa "Provador" enviando os seguintes dados:

**docID:** Valor que identifica um documento (docID) no Banco de dados do provador.

**h_1:** Valor do hash lido pela API pública.

**v:** Um nonce, um número calculado de forma aleatória enviada para ser utilizada como nonce no cálculo da prova ZKP.

### 3.3- A resposta via APi será a prova ZPK do provador contendo o seguinte:

**h_1:** Esse é o hash do JSON, que serve como compromisso inicial do provador, lido no banco de dados anteriormente e que foi calculado a partir do JSON utilizando uma função hash segura (SHA-256). Esse hash é representativo do conteúdo do JSON e serve para verificar a integridade dos dados.

**c:** Um desafio gerado utilizando o heurístico Fiat-Shamir. Esse heurístico transforma uma prova interativa em uma prova não interativa, usando uma função hash criptográfica para simular o papel do verificador na criação de um "desafio".

**s:** Resposta gerada pelo provador com base em um cálculo que envolve o nonce r, o compromisso (h_1) e o nonce v. A resposta serve para provar que o provador realmente conhece o valor original (JSON) que gerou o hash público h_1. O cálculo para s deve ser feito de modo a garantir que o valor não possa ser produzido sem o conhecimento do nonce r e do nonce v.

### 3.4- Cálculo de validação da prova ZKP:

O verificador deve usar os valores recebidos (h_1, c, s) para validar que o provador realmente conhece o conteúdo original que produziu o hash público h_1.

### O verificador faz o seguinte:

**Recalcula o Desafio c:**

O verificador usa os valores fornecidos pelo provador h_1 e a resposta s e o nonce v que o verificador conhece, para recalcular o valor do desafio (c, o qual chamamos de cv. Esse recalculo pode ser descrito pela mesma função hash que foi usada pelo provador:

cv = H(h_1, r, v), onde r está embutido nos cálculos que o provador fez na geração de s.

**Comparação entre c e cv:**

O valor original do desafio c gerado pelo provador e o valor recalculado pelo verificador cv devem ser iguais.

Se cv for igual a c, isso significa que a prova é válida, ou seja, o provador conseguiu reproduzir uma resposta que corresponde ao desafio gerado de forma consistente. Isso só seria possível se o provador realmente conhecesse o valor r, v e o JSON original, pois esses valores são necessários para gerar s e, consequentemente, para que c' coincida com c. 

Se cv for igual a c exibir uma mensagem "Prova Válida" do contrário exibir "Prova não válida."


## Observação: Os códigos anexados do node.js possuem algumas diferenças devido a simplificação do programa. Por exemplo não é utilizado (docID), o tratamento do programa foi feito apenas sobre o userID.
