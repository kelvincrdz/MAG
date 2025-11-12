from __future__ import annotations
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel

# User
class UserBase(BaseModel):
    codigo: str
    nome: str
    email: str
    departamento: str
    perfil: str

class UserOut(UserBase):
    id: int
    created_at: datetime
    is_active: int

    class Config:
        from_attributes = True

# Auth
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

class LoginRequest(BaseModel):
    codigo: str

# Mag
class MagOut(BaseModel):
    id: int
    file_name: str
    file_size: int
    total_files: int
    date_processed: datetime

    class Config:
        from_attributes = True

class AudioFileOut(BaseModel):
    id: int
    mag_id: int
    file_name: str
    size: int
    mime_type: str
    file_url: str
    date_added: datetime
    # Campos adicionais (não necessariamente persistidos) para enriquecer o front
    internal_path: str | None = None
    role: str | None = None  # 'primary' ou 'attachment'
    association_tag: str | None = None

    class Config:
        from_attributes = True

class MarkdownFileOut(BaseModel):
    id: int
    mag_id: int
    file_name: str
    title: str
    content: str
    date_added: datetime
    internal_path: str | None = None
    association_tag: str | None = None

    class Config:
        from_attributes = True

class RelationshipOut(BaseModel):
    id: int
    source_id: int
    source_type: str
    target_id: int
    target_type: str
    date_created: datetime

    class Config:
        from_attributes = True

class SearchResult(BaseModel):
    audios: List[AudioFileOut]
    markdowns: List[MarkdownFileOut]

class MagProcessResult(BaseModel):
    mag: MagOut
    audioFiles: List[AudioFileOut]
    markdownFiles: List[MarkdownFileOut]
