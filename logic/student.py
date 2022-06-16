from Dairy.models.group import Group
from Dairy.models.student import ApiStudent, Student
from Dairy.data.data import Sessions
from fastapi.responses import JSONResponse
from fastapi import status
from Dairy.logic.auth import get_password_hash
from Dairy.logic.key import get_student_key, delete_student_key


def create_new_student(student: ApiStudent):
    with Sessions() as session:
        key = get_student_key(student.key)
        group = session.query(Group).filter_by(name=key.group).first()
        if key is None:
            return JSONResponse(status_code=status.HTTP_409_CONFLICT, content='Wrong key')
        if not session.query(Student).filter_by(email=student.email).first() is None:
            return JSONResponse(status_code=status.HTTP_409_CONFLICT, content='Name already in use')
        student = Student(email=student.email, password=get_password_hash(student.password), name=key.name,
                          surname=key.surname, school_id=key.school_id, group=key.group)
        group.students.append(student)
        session.add(group)
        session.commit()
        delete_student_key(key.value)
    return JSONResponse(status_code=status.HTTP_201_CREATED, content='Student created')
