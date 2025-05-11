from sqlalchemy import Column, Integer, String, create_engine
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker, scoped_session
import os
from ..config import Config

engine = create_engine(Config.DATABASE_URI, connect_args={"check_same_thread" : False})
db_session = scoped_session(sessionmaker(autoflush=False, bind=engine))

Base = declarative_base()
Base.query = db_session.query_property()

class Tasks(Base):
    """TODO List Table"""
    __tablename__ = "Tasks"
    id = Column(Integer, primary_key=True)
    TODO = Column(String(255), unique=False, nullable=False)

class Archived(Base):
    """Archived Tasks"""
    __tablename__ = "Archived"
    id = Column(Integer, primary_key=True)
    Finished = Column(String(255), unique=False, nullable=False)



def init_db():
    """Initialize the database by creating all tables."""
    Base.metadata.create_all(bind=engine)

def get_db_session():
    """Get a database session."""
    return db_session

def close_db_session():
    """Close the database session."""
    db_session.remove()

