"""
ASSIGNMENT.PY - Agronomist to Region Assignment Model
======================================================

Represents assignment of agronomist to geographic region(s).
Flexible: can assign to province, district, sector, cell, or village level.
Multiple assignments allowed per agronomist.

Example:
  Agronomist John is assigned to:
  - Sector A (covers all cells/villages in sector A)
  - Sector B (covers all cells/villages in sector B)
  
Farmers in those sectors will see John as their agronomist.
"""

from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.base import Base


class Assignment(Base):
    __tablename__ = 'assignments'
    
    # Primary key
    id = Column(Integer, primary_key=True, index=True)
    
    # WHO: Agronomist being assigned
    agronomist_id = Column(Integer, ForeignKey('users.id'), nullable=False, index=True)
    agronomist = relationship(
        'User',
        back_populates='assignments_as_agronomist',
        foreign_keys=[agronomist_id]
    )
    
    # WHO CREATED IT: Cooperative Admin
    created_by_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    created_by = relationship(
        'User',
        foreign_keys=[created_by_id]
    )
    
    # ORGANIZATION: Which cooperative
    organization_id = Column(Integer, ForeignKey('organizations.id'), nullable=False, index=True)
    organization = relationship('Organization')
    
    # WHERE: Assigned to which location(s)
    # Flexibility: can assign to any level
    # If sector_id set, covers all cells/villages in that sector
    # If district_id set, covers all sectors/cells/villages in district
    # etc.
    
    province_id = Column(Integer, ForeignKey('provinces.id'), nullable=True, index=True)
    province = relationship('Province')
    
    district_id = Column(Integer, ForeignKey('districts.id'), nullable=True, index=True)
    district = relationship('District')
    
    sector_id = Column(Integer, ForeignKey('sectors.id'), nullable=True, index=True)
    sector = relationship('Sector')
    
    cell_id = Column(Integer, ForeignKey('cells.id'), nullable=True, index=True)
    cell = relationship('Cell')
    
    village_id = Column(Integer, ForeignKey('villages.id'), nullable=True, index=True)
    village = relationship('Village')
    
    # METADATA
    is_active = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    def __repr__(self):
        location = ""
        if self.village_id:
            location = f"Village {self.village.name}"
        elif self.cell_id:
            location = f"Cell {self.cell.name}"
        elif self.sector_id:
            location = f"Sector {self.sector.name}"
        elif self.district_id:
            location = f"District {self.district.name}"
        elif self.province_id:
            location = f"Province {self.province.name}"
        
        return f"<Assignment: {self.agronomist.full_name} → {location}>"