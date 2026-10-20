from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from app.database.base import Base


class Province(Base):
    __tablename__ = "provinces"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)

    districts = relationship(
        "District",
        back_populates="province",
        cascade="all, delete"
    )
    
    # Users assigned to this province
    users = relationship(
        "User",
        back_populates="province",
        foreign_keys="[User.province_id]"
    )

