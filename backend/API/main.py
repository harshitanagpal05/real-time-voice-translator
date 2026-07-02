import os
import secrets

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from googletrans import Translator

from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.orm import sessionmaker, declarative_base
from passlib.context import CryptContext

from google.oauth2 import id_token as google_id_token
from google.auth.transport import requests as google_requests

# -----------------------------
# APP INITIALIZATION
# -----------------------------
app = FastAPI()
translator = Translator()

# -----------------------------
# CORS (for React)
# -----------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# DATABASE SETUP (SQLite)
# -----------------------------
DATABASE_URL = "sqlite:///./users.db"

engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

# -----------------------------
# USER TABLE
# -----------------------------
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    role = Column(String, default="user")

Base.metadata.create_all(bind=engine)

# ----------------------------
# PASSWORD HASHING
# ----------------------------
from passlib.context import CryptContext

pwd_context = CryptContext(
    schemes=["pbkdf2_sha256"],
    deprecated="auto"
)

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(password: str, hashed: str) -> bool:
    return pwd_context.verify(password, hashed)


# -----------------------------
# REQUEST MODELS
# -----------------------------
class TranslateRequest(BaseModel):
    text: str
    source_lang: str
    target_lang: str

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class GoogleAuthRequest(BaseModel):
    credential: str

GOOGLE_CLIENT_ID = os.environ.get(
    "GOOGLE_CLIENT_ID",
    "1024232829760-pgfhsbglmouhthhlf3lg015j36724o0c.apps.googleusercontent.com",
)

# -----------------------------
# HEALTH CHECK
# -----------------------------
@app.get("/")
def root():
    return {"status": "Backend running successfully"}

# -----------------------------
# TRANSLATION ENDPOINT (UNCHANGED)
# -----------------------------
@app.post("/translate")
async def translate_text(data: TranslateRequest):
    if not data.text.strip():
        return {"translated_text": ""}

    result = await translator.translate(
        data.text,
        src=data.source_lang,
        dest=data.target_lang
    )

    return {"translated_text": result.text}

# -----------------------------
# AUTH: REGISTER
# -----------------------------
@app.post("/register")
def register(user: RegisterRequest):
    db = SessionLocal()

    existing = db.query(User).filter(User.email == user.email).first()
    if existing:
        db.close()
        return {"error": "Email already registered"}

    hashed = hash_password(user.password)

    new_user = User(
        name=user.name,
        email=user.email,
        password=hashed
    )

    db.add(new_user)
    db.commit()
    db.close()

    return {"message": "Registered successfully"}

# -----------------------------
# AUTH: LOGIN
# -----------------------------
@app.post("/login")
def login(data: LoginRequest):
    db = SessionLocal()
    user = db.query(User).filter(User.email == data.email).first()
    db.close()

    if not user or not verify_password(data.password, user.password):
        return {"error": "Invalid email or password"}

    return {
        "message": "Login successful",
        "email": user.email,
        "name": user.name,
        "role": user.role
    }

# -----------------------------
# AUTH: GOOGLE SIGN-IN
# -----------------------------
@app.post("/auth/google")
def google_auth(data: GoogleAuthRequest):
    try:
        idinfo = google_id_token.verify_oauth2_token(
            data.credential,
            google_requests.Request(),
            GOOGLE_CLIENT_ID,
        )
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid Google token")

    email = idinfo.get("email")
    name = idinfo.get("name", email.split("@")[0] if email else "")

    if not email:
        raise HTTPException(status_code=400, detail="Google account has no email")

    db = SessionLocal()
    user = db.query(User).filter(User.email == email).first()

    if not user:
        # Auto-register Google user with a random placeholder password
        placeholder_pw = hash_password(secrets.token_urlsafe(32))
        user = User(name=name, email=email, password=placeholder_pw, role="user")
        db.add(user)
        db.commit()
        db.refresh(user)

    result = {
        "message": "Login successful",
        "email": user.email,
        "name": user.name,
        "role": user.role,
    }
    db.close()
    return result

# -----------------------------
# ADMIN: VIEW REGISTERED USERS
# -----------------------------
@app.get("/admin/users")
def get_users():
    db = SessionLocal()
    users = db.query(User).all()
    db.close()

    return [
        {
            "name": u.name,
            "email": u.email,
            "role": u.role
        }
        for u in users
    ]
