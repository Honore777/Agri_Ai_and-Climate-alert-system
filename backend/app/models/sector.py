from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from app.database.base import Base

class Sector(Base):
    __tablename__ = "sectors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)

    district_id = Column(
        Integer,
        ForeignKey("districts.id", ondelete="CASCADE"),
        nullable=False
    )

    district = relationship(
        "District",
        back_populates="sectors"
    )

    cells = relationship(
        "Cell",
        back_populates="sector",
        cascade="all, delete"
    )
    
    # Users assigned to this sector
    users = relationship(
        "User",
        back_populates="sector",
        foreign_keys="[User.sector_id]"
    )
