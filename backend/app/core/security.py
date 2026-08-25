"""Security utilities: JWT, password hashing, encryption."""
import base64
from datetime import datetime, timedelta
from typing import Optional

from cryptography.fernet import Fernet
from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against a hashed password."""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash a password."""
    return pwd_context.hash(password)


def create_access_token(subject: str, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token."""
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(hours=settings.JWT_EXPIRATION_HOURS)
    to_encode = {"exp": expire, "sub": str(subject), "type": "access"}
    return jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def create_refresh_token(subject: str) -> str:
    """Create a JWT refresh token."""
    expire = datetime.utcnow() + timedelta(days=settings.JWT_REFRESH_EXPIRATION_DAYS)
    to_encode = {"exp": expire, "sub": str(subject), "type": "refresh"}
    return jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def decode_token(token: str) -> Optional[dict]:
    """Decode and validate a JWT token."""
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except JWTError:
        return None


def _get_fernet_key() -> bytes:
    """Derive a stable 32-byte Fernet key from the JWT secret."""
    raw = settings.JWT_SECRET.encode("utf-8")
    padded = raw.ljust(32, b"0")[:32]
    return base64.urlsafe_b64encode(padded)


_cipher: Optional[Fernet] = None


def get_cipher() -> Fernet:
    """Get or create a Fernet cipher instance."""
    global _cipher
    if _cipher is None:
        _cipher = Fernet(_get_fernet_key())
    return _cipher


def encrypt_value(plain_text: str) -> str:
    """Encrypt a sensitive value."""
    return get_cipher().encrypt(plain_text.encode("utf-8")).decode("utf-8")


def decrypt_value(encrypted_text: str) -> str:
    """Decrypt an encrypted value."""
    return get_cipher().decrypt(encrypted_text.encode("utf-8")).decode("utf-8")