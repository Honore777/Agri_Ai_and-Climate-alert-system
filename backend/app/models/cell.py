from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from app.database.base import Base

class Cell(Base):
    __tablename__ = "cells"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)

    sector_id = Column(
        Integer,
        ForeignKey("sectors.id", ondelete="CASCADE"),
        nullable=False
    )

    sector = relationship(
        "Sector",
        back_populates="cells"
    )

    villages = relationship(
        "Village",
        back_populates="cell",
        cascade="all, delete"
    )
    
    # Users assigned to this cell
    users = relationship(
        "User",
        back_populates="cell",
        foreign_keys="[User.cell_id]"
    )
