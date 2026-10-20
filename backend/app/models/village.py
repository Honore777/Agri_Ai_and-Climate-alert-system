from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from app.database.base import Base


class Village(Base):
    __tablename__ = "villages"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)

    cell_id = Column(
        Integer,
        ForeignKey("cells.id", ondelete="CASCADE"),
        nullable=False
    )

    cell = relationship(
        "Cell",
        back_populates="villages"
    )
    
    # Users assigned to this village
    users = relationship(
        "User",
        back_populates="village",
        foreign_keys="[User.village_id]"
    )
