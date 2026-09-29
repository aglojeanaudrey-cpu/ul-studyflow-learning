import re
import os
import hashlib
import secrets

def normalize_phone(raw_phone: str):
    """
    Normalise un numéro de téléphone pour le Togo et l'Afrique de l'Ouest.
    Exemples acceptés :
    - '90 12 34 56' -> '+22890123456', '+228 90 12 34 56', True
    - '+228 99705920' -> '+22899705920', '+228 99 70 59 20', True
    - '00228 71676945' -> '+22871676945', '+228 71 67 69 45', True
    """
    if not raw_phone:
        return '', '', False

    cleaned = re.sub(r'[^\d+]', '', str(raw_phone).strip())

    if cleaned.startswith('00228'):
        cleaned = '+228' + cleaned[5:]
    elif cleaned.startswith('228') and not cleaned.startswith('+228'):
        cleaned = '+228' + cleaned[3:]
    elif not cleaned.startswith('+'):
        # Numéro local togolais à 8 chiffres
        cleaned = '+228' + cleaned

    # Vérification: +228 suivi de 8 chiffres, ou numéro international valide (+ suivi de 8 à 14 chiffres)
    is_valid = bool(re.match(r'^\+228\d{8}$', cleaned) or re.match(r'^\+\d{8,14}$', cleaned))

    display = cleaned
    if re.match(r'^\+228\d{8}$', cleaned):
        local = cleaned[4:]
        display = f"+228 {local[0:2]} {local[2:4]} {local[4:6]} {local[6:8]}"

    return cleaned, display, is_valid


def hash_legacy_password(password: str, salt: str = None) -> tuple[str, str]:
    """
    Hashage PBKDF2 avec SHA-512 (100 000 itérations), identique au backend d'origine Node.js.
    Garantit une compatibilité 100% avec les comptes existants.
    """
    if not salt:
        salt = secrets.token_hex(16)
    dk = hashlib.pbkdf2_hmac('sha512', password.encode('utf-8'), salt.encode('utf-8'), 100000)
    return dk.hex(), salt


def verify_legacy_password(password: str, stored_hash: str, salt: str) -> bool:
    """Vérifie le mot de passe avec l'algorithme PBKDF2 SHA-512."""
    if not stored_hash or not salt:
        return False
    dk = hashlib.pbkdf2_hmac('sha512', password.encode('utf-8'), salt.encode('utf-8'), 100000)
    return secrets.compare_digest(dk.hex(), stored_hash)
