'use strict';

(() => {

  document.addEventListener('DOMContentLoaded', () => {

    const students = [];
    const $form = document.querySelector('.student-form');
    const $formInput = document.querySelectorAll('.required');
    const $submitButton = document.querySelector('.submit__btn');
    const $clearAllButton = document.querySelector('.btn-clear');
    const $name = document.querySelector('.form__input--name');
    const $faculty = document.querySelector('.form__input--faculty');
    const $birthday = document.querySelector('.form__input--bday');
    const $admission = document.querySelector('.form__input--admission');
    const $tableInner = document.querySelector('.table-inner');
    const $table = document.querySelector('.students-list');
    const $tableSort = document.querySelectorAll('.table-sort');
    const $tableFilter = document.querySelectorAll('.filter-input');
    const $tableBody = document.querySelector('.table__body');
    const $tableRows = $tableBody.getElementsByTagName('tr');
    const $tableFooter = document.querySelector('.table__footer');

    $submitButton.addEventListener('click', (e) => {
      e.preventDefault();
      addStudent();
      totalStudents();
      console.log(students);
    });

    $clearAllButton.addEventListener('click', (e) => {
      e.preventDefault();
      if ($tableRows.length > 0 && confirm('Вы уверены, что хотите отчислить всех студентов?')) {
        for (let i = $tableRows.length - 1; i >= 0; i--) {
          $tableBody.removeChild($tableRows[i]);
        };
        students.length = 0;
        localStorage.clear();
      };
      totalStudents();
    });

    $tableSort.forEach((item) => item.addEventListener('click', () => {
      if (!item.classList.contains('sorted', 'reversed') || item.classList.contains('reversed')) {
        $tableSort.forEach(el => el.classList.remove('sorted', 'reversed'));
        item.classList.add('sorted');
        if (item.dataset.sort != 2) {
          сolumnSort(item.dataset.sort);
        } else if (item.dataset.sort == 2) {
          ageSort(item.dataset.sort);
        };
      } else if (item.classList.contains('sorted')) {
        item.classList.replace('sorted', 'reversed');
        if (item.dataset.sort != 2) {
          сolumnSort(item.dataset.sort, true);
        } else if (item.dataset.sort == 2) {
          ageSort(item.dataset.sort, true);
        };
      };
    }));

    $tableFilter.forEach((input) => input.addEventListener('input', () => {
      Array.from($tableBody.querySelectorAll('tr')).forEach((el) => {
        if (!el.classList.contains('row--hidden')) {
          el.classList.add('row--hidden');
        };
      });
      tableFilter();
    }))

    function addStudent() {
      let error = formValidate($form);

      if (error === 0) {
        createStudent($name.value, $faculty.value, $birthday.valueAsDate, $admission.value);
        $form.reset();
        $formInput.forEach(
          input => input.classList.remove('is-valid')
        );
      };
    };

    function formValidate(form) {
      let error = 0;

      for (let i = 0; i < $formInput.length; i++) {
        const input = $formInput[i];
        formRemoveError(input);
        if (input.classList.contains('form__input--name')) {
          if (textTest($name.value)) {
            formAddError(input);
            error++;
            input.parentNode.querySelector('.invalid-feedback').innerText = 'Используйте кириллицу';
          };
          $name.value = spacesTest($name.value);
          if (!$name.value) {
            formAddError(input);
            error++;
            input.parentNode.querySelector('.invalid-feedback').innerText = 'Пожалуйста, введите ФИО студента';
          } else {
            $name.value = $name.value.toLowerCase().replace(/(^|\s)\S/g, function (a) {
              return a.toUpperCase()
            });
          };
        } else if (input.classList.contains('form__input--faculty')) {
          if (textTest($faculty.value)) {
            formAddError(input);
            error++;
            input.parentNode.querySelector('.invalid-feedback').innerText = 'Используйте кириллицу';
          };
          $faculty.value = spacesTest($faculty.value);
          if (!$faculty.value) {
            formAddError(input);
            error++;
            input.parentNode.querySelector('.invalid-feedback').innerText = 'Пожалуйста, введите факультет';
          } else {
            $faculty.value = $faculty.value.charAt(0).toUpperCase() + $faculty.value.toLowerCase().slice(1);
          };
        } else if (input.classList.contains('form__input--bday')) {
          if ($birthday.valueAsDate == null || $birthday.valueAsDate.getFullYear() < 1900 || $birthday.valueAsDate.getFullYear() > new Date().getFullYear() - 14) {
            formAddError(input);
            error++;
            input.parentNode.querySelector('.invalid-feedback').innerHTML = 'Введите корректную дату рождения (&ge; 14 лет)';
          };
        } else if (input.classList.contains('form__input--admission')) {
          if (input.value < 2000 || input.value > new Date().getFullYear()) {
            formAddError(input);
            error++;
          };
        } else {
          if (input.value === '') {
            formAddError(input);
            error++;
          };
        };
      };

      return error;
    };

    function spacesTest(value) {
      return value.replace(/\s+/g, ' ').trim();
    };

    function textTest(value) {
      return !/[А-Яа-яЁё\s]+$/.test(value);
    };

    function formAddError(input) {
      input.classList.remove('is-valid');
      input.classList.add('is-invalid');
    };

    function formRemoveError(input) {
      input.classList.remove('is-invalid');
      input.classList.add('is-valid');
    };

    const createStudent = (name, faculty, bday, admission, id) => {

      const student = new Object();
      if (!id) {
        student.id = getID();
      } else {
        student.id = id;
      };
      student.name = name;
      student.faculty = faculty;
      student.birthday = new Date(bday);
      student.admission = admission;
      students.push(student);

      createNewRow(student.name, student.faculty, student.birthday, student.admission, student.id);
      totalStudents();
      toLocal('students');

    };

    const getID = () => {
      let id = Math.floor(Math.random() * 1000);
      if (students.length > 0 && students.find(student => student.id == id)) {
        console.log('Найден студент с таким же ID, вычисляю новый ID...');
        getID();
      };
      return id;
    };

    const getAge = (bday) => {
      const now = new Date();
      let age = (now.getFullYear() - bday.getFullYear());

      if (now.getMonth() < bday.getMonth() ||
        now.getMonth() == bday.getMonth() && now.getDate() < bday.getDate()) {
        age--;
      };

      return age;
    };

    const getCourse = (admission) => {
      const now = new Date();
      let courseNum = now.getFullYear() - admission;
      let course = `${courseNum} курс`;
      if (now.getMonth() > 7) {
        courseNum++;
      };
      if (courseNum > 4) {
        course = 'закончил';
      };
      return course;
    };

    const createNewRow = (name, faculty, bday, admission, id) => {

      const $row = document.createElement('tr');
      const $name = document.createElement('td');
      const $faculty = document.createElement('td');
      const $bday = document.createElement('td');
      const $admission = document.createElement('td');
      const $expulsion = document.createElement('td');
      const $expulsionBtn = document.createElement('button');

      $row.dataset.id = id;
      $row.appendChild($name);
      $row.appendChild($faculty);
      $row.appendChild($bday);
      $row.appendChild($admission);
      $row.appendChild($expulsion);
      $expulsion.appendChild($expulsionBtn);
      $name.innerText = name;
      $faculty.innerText = faculty;
      $bday.innerText = `${bday.toLocaleDateString()} (${getAge(bday)} лет)`;
      $bday.dataset.age = getAge(bday);
      $admission.innerText = `${admission} - ${Number(admission) + 4} (${getCourse(admission)})`;
      $expulsionBtn.setAttribute('class', 'btn btn-danger');
      $expulsionBtn.innerText = 'Отчислить';

      $expulsionBtn.addEventListener('click', () => {
        if (confirm('Вы уверены, что хотите отчислить этого студента?')) {
          $row.remove();
          students.splice(students.findIndex(student => student.id == $row.dataset.id), 1);
          toLocal('students');
          totalStudents();
        };
      });

      $tableBody.appendChild($row);
    };

    const сolumnSort = (column, reversed) => {
      let sortedRows = Array.from($tableRows);
      if (!reversed) {
        sortedRows.sort((rowA, rowB) => rowA.cells[column].innerText > rowB.cells[column].innerText ? 1 : -1);
      } else {
        sortedRows.sort((rowA, rowB) => rowA.cells[column].innerText > rowB.cells[column].innerText ? -1 : 1);
      };
      $table.tBodies[0].append(...sortedRows);
    };

    const tableFilter = () => {

      const $nameFilter = document.getElementById('filter-by-name');
      const $facultyFilter = document.getElementById('filter-by-faculty');
      const $bdayFilter = document.getElementById('filter-by-bday');
      const $admissionFilter = document.getElementById('filter-by-admission');

      if ($nameFilter.value || $facultyFilter.value || $bdayFilter.value || $admissionFilter.value) {
        $tableBody.classList.add('table-filtered');
      } else {
        $tableBody.classList.remove('table-filtered');
      };

      let filterededRows = Array.from($tableRows).filter(function (row) {
        return row.cells[0].innerText.toLowerCase().indexOf($nameFilter.value.toLowerCase()) !== -1 &&
          row.cells[1].innerText.toLowerCase().indexOf($facultyFilter.value.toLowerCase()) !== -1 &&
          row.cells[2].innerText.toLowerCase().indexOf($bdayFilter.value.toLowerCase()) !== -1 &&
          row.cells[3].innerText.toLowerCase().indexOf($admissionFilter.value.toLowerCase()) !== -1
      });
      filterededRows.forEach(el => el.classList.remove('row--hidden'));
    };

    const ageSort = (column, reversed) => {
      let sortedRows = Array.from($tableRows);
      if (!reversed) {
        sortedRows.sort((rowA, rowB) => rowA.cells[column].dataset.age > rowB.cells[column].dataset.age ? 1 : -1);
      } else {
        sortedRows.sort((rowA, rowB) => rowA.cells[column].dataset.age > rowB.cells[column].dataset.age ? -1 : 1);
      };
      $table.tBodies[0].append(...sortedRows);
    };

    const totalStudents = () => {
      $tableFooter.querySelector('th').innerHTML = `Общее количество студентов: <span>${$tableRows.length}</span>`;
      if ($tableRows.length === 0) {
        $tableInner.classList.add('table-inner--hidden');
        $clearAllButton.classList.add('btn-clear--hidden');
      } else {
        $tableInner.classList.remove('table-inner--hidden');
        $clearAllButton.classList.remove('btn-clear--hidden');
      };
    };

    function toLocal(studentsList) {
      localStorage.setItem([studentsList.toString()], JSON.stringify(students));
    };

    function fromLocal(studentsList) {
      if (JSON.parse(localStorage[studentsList.toString()]).length != 0) {
        const list = JSON.parse(localStorage[studentsList.toString()]);
        for (let i = 0; i < list.length; i++) {
          createStudent(list[i].name, list[i].faculty, list[i].birthday, list[i].admission, list[i].id);
        };
      };
    };

    if (localStorage['students']) {
      fromLocal('students');
    };

    totalStudents();

  });

})();