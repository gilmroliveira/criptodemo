# criptodemo
Demonstração de Criptografia em Node.js
Este projeto é um script simples em Node.js que demonstra a implementação de conceitos fundamentais de criptografia:
Criptografia Simétrica (AES-256-GCM)
Criptografia Assimétrica (Híbrida: RSA + AES-256-GCM)
Geração de Hash (SHA-256) para verificação de integridade.
O objetivo é mostrar como criptografar dados, incluir um hash para verificação de integridade e, em seguida, descriptografar e validar esses dados.
🚀 Conceitos Demonstrados
Geração de Hash (SHA-256): Cria uma "impressão digital" (checksum) única de um texto. Usado para garantir a integridade dos dados (provar que não foram alterados).
Criptografia Simétrica (AES-256-GCM): Usa uma única chave secreta para criptografar e descriptografar. É extremamente rápida e ideal para grandes volumes de dados.
Criptografia Assimétrica (RSA-2048): Usa um par de chaves: uma Pública (para criptografar) e uma Privada (para descriptografar). É mais lenta, mas é fundamental para a troca segura de chaves.
Abordagem Híbrida: A prática padrão da indústria. Usamos a Criptografia Assimétrica (lenta) apenas para criptografar uma pequena chave de sessão aleatória. Em seguida, usamos essa chave de sessão (simétrica e rápida) para criptografar os dados reais.
Verificação de Integridade: O hash gerado no início é "empacotado" junto com os dados antes da criptografia. Após a descriptografia, o hash é recalculado e comparado com o original para garantir que a mensagem não foi corrompida ou adulterada no caminho.
🔧 Pré-requisitos
Node.js (versão 12 ou superior).
Não é necessário instalar nenhum pacote externo (npm install), pois o script utiliza apenas o módulo nativo crypto.
▶️ Como Executar
Salve o código-fonte em um arquivo chamado index.js.
Abra seu terminal ou prompt de comando.
Navegue até a pasta onde você salvou o arquivo.
Execute o script com o seguinte comando:
node index.js
📈 O que o Script Faz (Passo a Passo)
Ao executar node index.js, o script realiza o seguinte fluxo:
1. Preparação dos Dados
2. Texto Original: Define um texto secreto (ex: "Este é um texto secreto para o teste!").
3. Geração do Hash: Calcula o hash SHA-256 desse texto.
4. Criação do Payload: Cria um objeto JSON contendo tanto o texto original quanto seu hash.
5. {
  "data": "Este é um texto secreto para o teste!",
  "hash": "hash_sha256_do_texto_acima"
}
2. Teste Simétrico (AES-256-GCM)
Geração: Cria uma chave secreta (symKey) e um Vetor de Inicialização (iv) aleatórios.
Criptografia: Usa a symKey para criptografar o payload JSON.
Descriptografia: Usa a mesma symKey para descriptografar o payload.
Validação:
Analisa o JSON descriptografado para extrair o data e o hash original.
Calcula um novo hash usando o data recebido.
Compara o hash original com o novo hash. Se forem iguais, exibe [Validação SUCESSO].
3. Teste Assimétrico (Híbrido: RSA + AES)
Geração de Chaves: Cria um par de chaves RSA (publicKey e privateKey).
Criptografia (com Chave Pública):
Gera uma "chave de sessão" (sessionKey) aleatória (uma chave simétrica comum).
Usa esta sessionKey para criptografar o payload JSON (usando AES-GCM).
Usa a publicKey (RSA) para criptografar apenas a sessionKey.
O resultado é um pacote de dados contendo: dados_criptografados, chave_de_sessao_criptografada, iv e authTag.
Descriptografia (com Chave Privada):
Usa a privateKey (RSA) para descriptografar a chave_de_sessao_criptografada, revelando a sessionKey original.
Usa a sessionKey recuperada para descriptografar os dados_criptografados (usando AES-GCM).
Validação:
Executa o mesmo processo de validação do Teste 1, comparando os hashes para garantir a integridade dos dados.
📋 Saída Esperada
Você verá no seu console um log detalhado de cada etapa, terminando com a validação bem-sucedida para ambos os métodos de criptografia:
---INICIANDO DEMONSTRAÇÃO CRIPTOGRÁFICA ---

Texto Original: "Este é um texto secreto para o teste!"

Hash Original (SHA-256): [hash_de_64_caracteres] Payload a ser criptografado: {"data":"Este é um texto secreto para o teste!","hash":"[hash_de_64_caracteres]"}

--- 1. TESTE SIMÉTRICO (AES-256-GCM) ---

Dados Criptografados (Simétrico): [texto_criptografado_hex]...

Payload Descriptografado: {"data":"Este é um texto secreto para o teste!","hash":"[hash_de_64_caracteres]"}

[Validação SUCESSO]

Hash Recebido: [hash_de_64_caracteres]

Hash Calculado: [hash_de_64_caracteres]

Dados Originais: "Este é um texto secreto para o teste!"

--- 2. TESTE ASSIMÉTRICO (RSA + AES-GCM) ---

Chave de Sessão Criptografada: [chave_criptografada_hex]...

Dados Criptografados (Assimétrico): [texto_criptografado_hex]...

Payload Descriptografado: {"data":"Este é um texto secreto para o

teste!","hash":"[hash_de_64_caracteres]"}

[Validação SUCESSO]

Hash Recebido: [hash_de_64_caracteres]

Hash Calculado: [hash_de_64_caracteres]

Dados Originais: "Este é um texto secreto para o teste!"

--- DEMONSTRAÇÃO CONCLUÍDA --
