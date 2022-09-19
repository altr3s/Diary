function getAvg(studentId, mark, increase) {
    function showAvg(span) {
        let count = parseInt(span.dataset.marksCount);
        span.innerText = ((span.dataset.marksSum / (count > 0 ? count : 1)).toFixed(2)).toString();
    }

    const avgSpan = document.getElementById(`${studentId}-avg`);
    if ((typeof increase) === "string") {
        if (increase.startsWith('change')) {
            const oldMark = increase.split('-')[1];
            avgSpan.dataset.marksSum = (parseInt(avgSpan.dataset.marksSum) - parseInt(oldMark)).toString();
            avgSpan.dataset.marksSum = (parseInt(avgSpan.dataset.marksSum) + parseInt(mark)).toString();
            showAvg(avgSpan);
            return;
        }
    }
    if (increase) {
        avgSpan.dataset.marksSum = (parseInt(avgSpan.dataset.marksSum) + parseInt(mark)).toString();
        avgSpan.dataset.marksCount = (parseInt(avgSpan.dataset.marksCount) + 1).toString();
    } else {
        const newSum = parseInt(avgSpan.dataset.marksSum) - parseInt(mark)
        avgSpan.dataset.marksSum = (newSum >= 0 ? newSum : mark).toString();
        avgSpan.dataset.marksCount = (parseInt(avgSpan.dataset.marksCount) - 1).toString();
    }
    showAvg(avgSpan);
}

function openClassBook() {
    const group_id = localStorage.getItem('book_group_id');
    const class_id = localStorage.getItem('book_class_id');
    callServer(`/class_book?group_id=${group_id}&class_id=${class_id}`).then(async (response) => {
        const book = await response.json();
        document.getElementById('group').innerText = book.name;
        document.getElementById('subject').innerText = book.subject;
        let book_wrapper = document.getElementById('book-wrapper');
        book_wrapper.dataset.current_season = book['current_season'];
        let table = document.createElement('table');
        table.classList.add('white', 'border-radius')
        let first_row = document.createElement('tr');
        first_row.innerHTML = `<th class="square absolute">№</th><th class="book-student-ns absolute">Student</th>`
        for (let i = 0; i < book.dates.length; i++) {
            first_row.innerHTML += `<th class="square">${book.dates[i].short}</th>`
        }
        first_row.innerHTML += '<th class="square">AVG</th>'
        table.appendChild(first_row);
        for (let i = 0; i < book.students.length; i++) {
            let row = document.createElement('tr');
            row.innerHTML = ''
            row.innerHTML += `<th class="square absolute">
                              ${book.students[i].number}</th>
                              <td class="book-student-ns absolute">
                              ${book.students[i].surname} ${book.students[i].name}
                              </td>`
            for (let j = 0; j < book.dates.length; j++) {
                // mark cells
                const date = book.dates[j].long;
                let mark = book.students[i].marks.all[date];
                let markSaved = 1;
                if (mark === undefined) {
                    mark = {'value': '', 'id': ''};
                    markSaved = 0;
                }
                row.innerHTML += `<td id="${book.students[i].id}-${book.dates[j].long}"
                                    class="pointer mark-click-target-area" 
                                    data-student-id ="${book.students[i].id}" 
                                    data-date = "${book.dates[j].long}"
                                    data-initials = "${book.students[i].surname} ${book.students[i].name}"
                                    data-db-mark-id = "${mark.id}"
                                    data-db-mark="${mark.value}">
                                    ${mark.value}
                                  </td>`
            }
            row.innerHTML += `<td id="${book.students[i].id}-avg"
                                  data-marks-sum="${book.students[i].marks.summ}"
                                  data-marks-count="${book.students[i].marks.count}">
                                  ${(book.students[i].marks.summ / (book.students[i].marks.count > 0 ?
                book.students[i].marks.count : 1)).toFixed(2)}
                              </td>`
            table.appendChild(row)
        }
        book_wrapper.appendChild(table);
    })
}

document.addEventListener('click', showMarkModal)

function showMarkModal(e) {
    const modalWindow = document.getElementById('modal-container');
    if (e.target.classList.contains('mark-click-target-area')) {
        const studentId = parseInt(e.target.dataset.studentId);
        const date = e.target.dataset.date;
        const name = e.target.dataset.initials;
        const y = e.clientY + window.scrollY - (e.clientY + window.scrollY - 104) % 35;
        let x = e.clientX + window.scrollX - (e.clientX + window.scrollX - 272) % 35 + 35;
        if (window.screen.width + window.scrollX - x < 315) {
            x -= 350
        }
        modalWindow.style.left = `${x}px`;
        modalWindow.style.top = `${y}px`;
        const modal = document.getElementById('mark-modal');
        modal.setAttribute('data-modal-date', date);
        modal.setAttribute('data-modal-student-id', studentId);
        document.getElementById('student_name').innerText = name;
        document.getElementById('mark_date').innerText = date;
        modalWindow.classList.remove('none');
    }
}

function checkMarkEquality(cell, mark) {
    if (cell.dataset.dbMark === mark.toString()) {
        cell.classList.remove('red');
    } else {
        cell.classList.add('red');
    }
}

function placeMark(mark) {
    const modal = document.getElementById('mark-modal');
    modal.setAttribute('data-mark', mark);
    const cell = document.getElementById(`${modal.dataset.modalStudentId}-${modal.dataset.modalDate}`);
    if (cell.innerText !== mark) {
        if (cell.innerText === '') {
            getAvg(modal.dataset.modalStudentId, mark, true)
        } else {
            getAvg(modal.dataset.modalStudentId, mark, `change-${parseInt(cell.innerText)}`)
        }
        cell.innerText = mark;
        checkMarkEquality(cell, mark);
    }
}

function dismissMark() {
    const modal = document.getElementById('mark-modal');
    const cell = document.getElementById(`${modal.dataset.modalStudentId}-${modal.dataset.modalDate}`);
    const dbMark = cell.dataset.dbMark;
    if (cell.innerText === '') {
        document.getElementById('modal-container').classList.add('none');
        return;
    }
    if (cell.classList.contains('red')) {
        const oldMark = cell.innerText;
        cell.innerText = dbMark;
        getAvg(modal.dataset.modalStudentId, dbMark, `change-${parseInt(oldMark)}`);
        cell.classList.remove('red');
        document.getElementById('modal-container').classList.add('none');
    } else {
        const id = parseInt(cell.dataset.dbMarkId);
        callServer(`/mark/delete?id=${id}`, {}, 'POST').then((response) => {
            try {
                const p = alertError(response);
                checkCredentials(response);
                getAvg(modal.dataset.modalStudentId, parseInt(cell.innerText), false);
                cell.innerText = '';
                cell.dataset.dbMark = '';
                cell.dataset.dbMarkId = '';
                cell.classList.remove('red');
                document.getElementById('modal-container').classList.add('none');
            } catch (e) {
                console.log(e);
            }
        })
    }
}

function sendMark() {
    const modal = document.getElementById('mark-modal');
    const date = modal.dataset.modalDate;
    const mark = modal.dataset.mark;
    const studentId = modal.dataset.modalStudentId;
    const comment = document.getElementById('mark-comment').value;
    const season = document.getElementById('book-wrapper').dataset.current_season;
    const data = {
        'date': date, 'mark': mark, 'student_id': studentId, 'subject_id': localStorage.getItem('book_class_id'),
        'comment': comment, 'season': season
    }
    callServer('/execute/mark/create', data, 'POST').then((response) => {
        const p = alertError(response);
        checkCredentials(response);
        const cell = document.getElementById(`${studentId}-${date}`);
        cell.dataset.dbMark = (mark).toString();
        document.getElementById('modal-container').classList.add('none');
        checkMarkEquality(cell, mark);
    });
}

async function getFinalMarksTable(class_id) {
    callServer(`/final_marks?class_id=${class_id}`).then(async (response) => {
        document.getElementById('primary-content').classList.add('none');
        document.getElementById('secondary-content').classList.remove('none');
        const data = await response.json();
        const table = document.getElementById('marks-table');
        const firstRow = table.children[0];
        table.innerHTML = '';
        table.dataset.classId = class_id;
        table.appendChild(firstRow);
        data.students.forEach((student) => {
            const row = `
            <tr>
                <th>${student.number}</th>
                <td data-student-id="${student.id}">${student.initials}</td>
                <td id="${student.id}_season_1_avg" 
                    data-warning="${student.season_1_warning}">
                    <span>${student.season_1_avg}</span>
                </td>
                <td id="${student.id}_season_1_final" class="final-mark-area">${student.season_1_final}</td>
                <td id="${student.id}_season_2_avg" 
                    data-warning="${student.season_2_warning}">
                    <span>${student.season_2_avg}</span>
                </td>
                <td id="${student.id}_season_2_final" class="final-mark-area">${student.season_2_final}</td>
                <td id="${student.id}_season_3_avg" 
                    data-warning="${student.season_3_warning}">
                    <span>${student.season_3_avg}</span>
                </td>
                <td id="${student.id}_season_3_final" class="final-mark-area">${student.season_3_final}</td>
                <td id="${student.id}_season_4_avg">${student.season_4_avg}</td>
                <td id="${student.id}_season_4_final" class="final-mark-area">${student.season_4_final}</td>
            </tr>`;
            table.innerHTML += row;
        });
        data['students'].forEach((student) => {
            const cells = [
                document.getElementById(`${student.id}_season_1_avg`),
                document.getElementById(`${student.id}_season_2_avg`),
                document.getElementById(`${student.id}_season_3_avg`)
            ]
            const warnings = [
                student.season_1_warning,
                student.season_2_warning,
                student.season_3_warning
            ]
            for (let i = 0; i < 3; i++) {
                if (warnings[i] !== '') {
                    cells[i].innerHTML += `<i data-warning="${warnings[i]}" class="bi bi-exclamation-triangle warning-icon"></i>`
                }
            }
        })
    });
}

function closeTable() {
    document.getElementById('secondary-content').classList.add('none');
    document.getElementById('primary-content').classList.remove('none');
    document.getElementById('modal-container').classList.add('none');
}

window.addEventListener('click', (e) => {
    if (e.target.classList.contains('warning-icon')) {
        const warning = e.target.dataset.warning
        alert(warning !== '' ? warning : 'No problems!');
    } else if (e.target.classList.contains('final-mark-area')) {
        const initials = e.target.parentNode.children[1].innerText;
        const studentId = e.target.parentNode.children[1].dataset.studentId;
        const tableHead = document.getElementById('marks-table').children[0].children[0].children[Array.from(e.target.parentNode.children).indexOf(e.target)]
        const season_i = tableHead.dataset.season;
        const modalWindow = document.getElementById('modal-container');
        document.getElementById('student_name').innerText = initials;
        document.getElementById('season').innerText = tableHead.innerText;
        modalWindow.style.left = `${e.clientX + 50}px`;
        modalWindow.style.top = `${e.clientY + window.scrollY}px`;
        modalWindow.classList.remove('none');
        modalWindow.dataset.season = season_i;
        modalWindow.dataset.studentId = studentId;
    }
})

async function finalMark(value) {
    const modalWindow = document.getElementById('modal-container');
    console.log(modalWindow);
    const season = modalWindow.dataset.season;
    const studentId = modalWindow.dataset.studentId;
    const classId = document.getElementById('marks-table').dataset.classId;
    const data = {
        'student_id': studentId,
        'season': season,
        'mark': value,
        'subject_id': classId
    };
    console.log(data);
    callServer(`/execute/mark/create_final_mark`, data, 'POST').then(async (response) => {
        try {
            checkCredentials(response.status)
            await alertError(response);
            document.getElementById(`${studentId}_season_${season}_final`).innerText = value;
        } catch (e) {

        }
    })
}