from __future__ import annotations
from datetime import datetime
from typing import Optional
from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship, Mapped, mapped_column

from .database import Base

class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    codigo: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    nome: Mapped[str] = mapped_column(String(120))
    email: Mapped[str] = mapped_column(String(120))
    departamento: Mapped[str] = mapped_column(String(120))
    perfil: Mapped[str] = mapped_column(String(80))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    is_active: Mapped[int] = mapped_column(Integer, default=1)

class Mag(Base):
    __tablename__ = "mags"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    file_name: Mapped[str] = mapped_column(String(255))
    file_size: Mapped[int] = mapped_column(Integer)
    total_files: Mapped[int] = mapped_column(Integer)
    date_processed: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

class AudioFile(Base):
    __tablename__ = "audio_files"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    mag_id: Mapped[int] = mapped_column(ForeignKey("mags.id"))
    file_name: Mapped[str] = mapped_column(String(255))
    size: Mapped[int] = mapped_column(Integer)
    mime_type: Mapped[str] = mapped_column(String(80))
    storage_path: Mapped[str] = mapped_column(String(500))
    file_url: Mapped[str] = mapped_column(String(500))
    date_added: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

class MarkdownFile(Base):
    __tablename__ = "markdown_files"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    mag_id: Mapped[int] = mapped_column(ForeignKey("mags.id"))
    file_name: Mapped[str] = mapped_column(String(255))
    title: Mapped[str] = mapped_column(String(255))
    content: Mapped[str] = mapped_column(Text)
    date_added: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

class Relationship(Base):
    __tablename__ = "relationships"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    source_id: Mapped[int] = mapped_column(Integer)
    source_type: Mapped[str] = mapped_column(String(50))  # 'markdown'
    target_id: Mapped[int] = mapped_column(Integer)
    target_type: Mapped[str] = mapped_column(String(50))  # 'audio' ou 'markdown'
    date_created: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
