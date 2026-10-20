from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from app.database.base import Base


class District(Base):
    __tablename__ = "districts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)

    province_id = Column(
        Integer,
        ForeignKey("provinces.id", ondelete="CASCADE"),
        nullable=False
    )
    province = relationship(
        "Province",
        back_populates="districts"
    )

    sectors = relationship('Sector', back_populates='district', cascade='all, delete')
    
    # Users assigned to this district
    users = relationship(
        "User",
        back_populates="district",
        foreign_keys="[User.district_id]"
    )