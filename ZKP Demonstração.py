import hashlib
import random
from ecdsa import SECP256k1, SigningKey
from ecdsa import SigningKey, SECP256k1
from ecdsa import VerifyingKey, SECP256k1

def schnorr_identification(username, private_key, public_key, generator):
    #print("Provador ----------------")
    n = generator.order
    G = generator.generator
    #print("n:",n)
    #print("G:",G)

    # Etapa 1: Prover gera um nonce aleatório
    nonce = random.randint(1, n - 1)
    #print("Nonce aleatório:",nonce)

    # Etapa 2: Prover calcula o compromisso
    r = nonce * G
    #print("O Compromisso (nonce * G):",r)

    # Converter r para coordenadas afins e serializar
    r = r.to_affine()
    #print("r para coordenadas afins e serializar:",r)
    r_bytes = int(r.x()).to_bytes(32, byteorder='big') + int(r.y()).to_bytes(32, byteorder='big')
    #print("r_bytes:",r_bytes)

    # Etapa 3: Prover calcula o desafio
    e_bytes = hashlib.sha256(r_bytes + username.encode()).digest()
    e = int.from_bytes(e_bytes, byteorder='big') % n

    # Etapa 4: Prover calcula a resposta
    s = (nonce + e * private_key) % n

    # Prover envia (e, s) para o verificador

    # Lado do Verificador:

    # Reconstruir r' = s * G - e * P, onde P é a chave pública
    sG = s * G
    eP = e * public_key.pubkey.point  # Ponto público do provedor

    # Negar eP usando o operador unário
    eP_neg = -eP  # Negar o ponto eP

    # Calcular r' = sG + (-eP)
    r_prime = sG + eP_neg

    # Converter r' para coordenadas afins e serializar
    r_prime = r_prime.to_affine()
    r_prime_bytes = int(r_prime.x()).to_bytes(32, byteorder='big') + int(r_prime.y()).to_bytes(32, byteorder='big')

    # Verificador calcula e' = H(r' || username)
    e_prime_bytes = hashlib.sha256(r_prime_bytes + username.encode()).digest()
    e_prime = int.from_bytes(e_prime_bytes, byteorder='big') % n

    # Verificador verifica se e' == e
    return e_prime == e

# Exemplo de uso
G = SECP256k1  # Usando a curva SECP256k1

# Gerar chave privada e chave pública
sk = SigningKey.generate(curve=SECP256k1)
private_key = sk.privkey.secret_multiplier
public_key = sk.verifying_key

#print("---private_key: ",private_key)
#print("---public_key: ",public_key)

username = "Alice"

#-----
private_key = 62206577528495309915934779432223818467101708355282244484822253586294513496295

#------

#print("chave:",public_key)

# Convertendo a chave pública para bytes
public_key_bytes = public_key.to_string()

# Convertendo a chave pública para uma string hexadecimal
public_key_hex = public_key_bytes.hex()

#-------
public_key_hex = "a79da0e6217b41e0cc7f9976d4c0bf1370525d8062484b51e67377fc43ce47915bebbf6ed8f08c23b20643e142b6909c46505ca1336a9c37c6849d64bc9522b1"
#------

print("Chave pública como string (hex):", public_key_hex)

# Convertendo a string hexadecimal de volta para bytes
public_key_bytes_from_hex = bytes.fromhex(public_key_hex)

# Reconstruindo a chave pública a partir dos bytes
public_key_restored = VerifyingKey.from_string(public_key_bytes_from_hex, curve=SECP256k1)



print("chave:",public_key_restored)

print("Chave pública restaurada com sucesso.")
print("------")

#verification_result = schnorr_identification(username, private_key, public_key, G)
verification_result = schnorr_identification(username, private_key, public_key_restored, G)
print("Verification Result:", verification_result)
