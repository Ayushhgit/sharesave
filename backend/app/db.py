from sqlmodel import SQLModel, Session, create_engine
from .config import get_settings

settings = get_settings()

connect_args = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    settings.DATABASE_URL,
    echo=False,
    connect_args=connect_args,
    pool_pre_ping=True,
)


def init_db() -> None:
    from . import models  # noqa: F401 - register tables
    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session
