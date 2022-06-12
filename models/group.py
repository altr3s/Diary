from sqlalchemy import Column, Integer, String
from pydantic import BaseModel
from data.data import Base


class Group(Base):
    __tablename__ = 'groups'
    name = Column(String, primary_key=True)
    school_id = Column(Integer)
    # students: relationship(Student)
    # tasks: relationship(Task)
    # teacher: relationship - back(Teacher)


class ApiGroup(BaseModel):
    name: str
    school_id: int
