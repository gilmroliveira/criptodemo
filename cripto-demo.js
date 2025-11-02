// Importa o módulo 'crypto' nativo do Node.js
const crypto = require('crypto');

// --- Constantes de Configuração ---
const AES_ALGORITHM = 'aes-256-cbc';  // Algoritmo simétrico
const HASH_ALGORITHM = 'sha256';     // Algoritmo de Hash
const TEXT_ENCODING = 'utf8';        // Codificação do texto
const HASH_ENCODING = 'hex';         // Codificação do hash/cripto
const IV_LENGTH = 16;                // Tamanho do Vetor de Inicialização (IV) para AES
const KEY_LENGTH = 32;               // Tamanho da Chave para AES-256 (32 bytes)

// --- Funções de Criptografia ---

/**
 * Gera um hash SHA-256 de um texto.
 * @param {string} text - O texto original.
 * @returns {string} - O hash em formato hexadecimal.
 */
function generateHash(text) {
  return crypto.createHash(HASH_ALGORITHM)
               .update(text, TEXT_ENCODING)
               .digest(HASH_ENCODING);
}

/**
 * Criptografa dados usando Criptografia Simétrica (AES).
 * @param {string} data - Os dados a serem criptografados.
 * @param {Buffer} key - A chave secreta (32 bytes).
 * @returns {{iv: string, encryptedData: string}} - O IV e os dados criptografados.
 */
function symmetricEncrypt(data, key) {
  // Gera um Vetor de Inicialização (IV) aleatório
  const iv = crypto.randomBytes(IV_LENGTH);
  
  // Cria o 'cipher' (cifrador)
  const cipher = crypto.createCipheriv(AES_ALGORITHM, key, iv);
  
  // Criptografa os dados
  let encrypted = cipher.update(data, TEXT_ENCODING, HASH_ENCODING);
  encrypted += cipher.final(HASH_ENCODING);
  
  // Retorna o IV (necessário para descriptografar) e os dados
  return {
    iv: iv.toString(HASH_ENCODING),
    encryptedData: encrypted
  };
}

/**
 * Descriptografa dados usando Criptografia Simétrica (AES).
 * @param {string} encryptedData - Os dados criptografados.
 * @param {string} iv - O Vetor de Inicialização (em hex).
 * @param {Buffer} key - A chave secreta (32 bytes).
 * @returns {string} - Os dados originais descriptografados.
 */
function symmetricDecrypt(encryptedData, iv, key) {
  // Converte o IV de hex para Buffer
  const ivBuffer = Buffer.from(iv, HASH_ENCODING);
  
  // Cria o 'decipher' (decifrador)
  const decipher = crypto.createDecipheriv(AES_ALGORITHM, key, ivBuffer);
  
  // Descriptografa os dados
  let decrypted = decipher.update(encryptedData, HASH_ENCODING, TEXT_ENCODING);
  decrypted += decipher.final(TEXT_ENCODING);
  
  return decrypted;
}

/**
 * Criptografa dados usando Criptografia Assimétrica (RSA - Chave Pública).
 * @param {string} data - Os dados a serem criptografados.
 * @param {string} publicKey - A chave pública em formato PEM.
 * @returns {string} - Os dados criptografados em base64.
 */
function asymmetricEncrypt(data, publicKey) {
  const bufferData = Buffer.from(data, TEXT_ENCODING);
  const encrypted = crypto.publicEncrypt(
    {
      key: publicKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: HASH_ALGORITHM
    },
    bufferData
  );
  return encrypted.toString('base64');
}

/**
 * Descriptografa dados usando Criptografia Assimétrica (RSA - Chave Privada).
 * @param {string} encryptedDataB64 - Os dados criptografados (em base64).
 * @param {string} privateKey - A chave privada em formato PEM.
 * @returns {string} - Os dados originais descriptografados.
 */
function asymmetricDecrypt(encryptedDataB64, privateKey) {
  const bufferData = Buffer.from(encryptedDataB64, 'base64');
  const decrypted = crypto.privateDecrypt(
    {
      key: privateKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: HASH_ALGORITHM
    },
    bufferData
  );
  return decrypted.toString(TEXT_ENCODING);
}

/**
 * Valida o payload descriptografado, comparando o hash original com um novo hash.
 * @param {{text: string, hash: string}} payload - O objeto de payload.
 */
function validatePayload(payload) {
  console.log(`\n--- Validando Payload ---`);
  console.log(`Texto recebido: "${payload.text}"`);
  console.log(`Hash recebido:   ${payload.hash}`);

  // Gera um novo hash a partir do texto recebido
  const newHash = generateHash(payload.text);
  console.log(`Novo hash gerado: ${newHash}`);

  // Compara os hashes
  if (newHash === payload.hash) {
    console.log(`✅ SUCESSO: O hash corresponde! A integridade do texto foi validada.`);
  } else {
    console.error(`❌ FALHA: O hash NÃO corresponde! Os dados podem ter sido corrompidos.`);
  }
}

// --- Função Principal de Demonstração ---
function main() {
  const originalText = "Este é um texto secreto para a demonstração.";

  // 1. Gerar o hash do texto original
  const originalHash = generateHash(originalText);
  console.log(`Texto Original: "${originalText}"`);
  console.log(`Hash Original:    ${originalHash}`);

  // 2. Criar o payload (texto + hash) para ser enviado
  const payload = {
    text: originalText,
    hash: originalHash
  };
  const payloadString = JSON.stringify(payload);
  console.log(`Payload (JSON): ${payloadString}`);

  console.log('\n=============================================');
  console.log('DEMONSTRAÇÃO SIMÉTRICA (AES)');
  console.log('=============================================');

  try {
    // 3. Criptografar com chave simétrica
    const symmetricKey = crypto.randomBytes(KEY_LENGTH);
    const { iv, encryptedData } = symmetricEncrypt(payloadString, symmetricKey);
    
    console.log(`Chave Simétrica: ${symmetricKey.toString(HASH_ENCODING)}`);
    console.log(`Payload Criptografado (AES): ${encryptedData}`);
    
    // 4. Descriptografar com chave simétrica
    const decryptedString = symmetricDecrypt(encryptedData, iv, symmetricKey);
    
    // 5. Validar o hash
    const decryptedPayload = JSON.parse(decryptedString);
    validatePayload(decryptedPayload);

  } catch (error) {
    console.error("Erro na demonstração simétrica:", error.message);
  }

  console.log('\n=============================================');
  console.log('DEMONSTRAÇÃO ASSIMÉTRICA (RSA)');
  console.log('=============================================');

  try {
    // Gerar um par de chaves RSA (Pública e Privada)
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
    });
    
    // 3. Criptografar com chave pública
    const asymmetricEncrypted = asymmetricEncrypt(payloadString, publicKey);
    console.log(`Payload Criptografado (RSA): ${asymmetricEncrypted.substring(0, 60)}...`);

    // 4. Descriptografar com chave privada
    const asymmetricDecryptedString = asymmetricDecrypt(asymmetricEncrypted, privateKey);
    
    // 5. Validar o hash
    const asymmetricPayload = JSON.parse(asymmetricDecryptedString);
    validatePayload(asymmetricPayload);

  } catch (error) {
    console.error("Erro na demonstração assimétrica:", error.message);
  }
}

// Executa a função principal
main();
    
