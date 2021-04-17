'use strict';

(() => {

  document.addEventListener('DOMContentLoaded', () => {

    const students = [];
    const $form = document.querySelector('.student-form');
    const $formInput = document.querySelectorAll('.required');
    const $submitButton = document.querySelector('.submit__btn');
    const $clearAllButton = document.querySelector('.clear__btn');
    const $name = document.querySelector('.form__input--name');
    const $faculty = document.querySelector('.form__input--faculty');
    const $birthday = document.querySelector('.form__input--bday');
    const $admission = document.querySelector('.form__input--admission');
    const $table = document.querySelector('.students-list');
    const $tableSort = document.querySelectorAll('.table-sort');
    const $tableFilter = document.querySelectorAll('.filter-input');
    const $tableBody = document.querySelector('.table__body');
    const $tableRows = $tableBody.getElementsByTagName('tr');
    const $tableFooter = document.querySelector('.table__footer');

    $submitButton.addEventListener('click', (e) => {
      e.preventDefault();
      addStudent();
      clearStudentsBtn();
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
        $clearAllButton.setAttribute('disabled', 'true');
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
      columnFilter();
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
            input.parentNode.querySelector('.invalid-feedback').innerText = 'Введите корректную дату рождения';
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

    const clearStudentsBtn = () => {
      if (students.length > 0) {
        $clearAllButton.removeAttribute('disabled');
      } else {
        $clearAllButton.setAttribute('disabled', 'true');
      };
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
          clearStudentsBtn();
        };
      });

      $tableBody.appendChild($row);
      totalStudents();
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

    const columnFilter = () => {

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
      $tableFooter.querySelector('th').innerHTML = `Общее количество студентов: <span>${$tableRows.length}</span>`
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

    clearStudentsBtn();

    /*

    let num = '42';
    console.log(typeof (num));
    console.log(typeof Number(num));
    console.log(typeof + num);

    if (isNaN(Number('Aleksey'))) {
      console.log('Ошибка');
    } else {
      console.log('Ошибки нет');
    }

    console.log(`Метод ParseInt: ${parseInt(42.15)}`);
    console.log(`Метод ParseFloat: ${parseFloat(42.15)}`);

    console.log(String(42));
    console.log(42);

    console.log(Boolean(1));
    console.log(Boolean(0));

    console.log({
      toString() {
        return '3';
      }
    } == 3); // true

    // Работа со строками:

    let str = 'Строка для проверки';
    console.log(`Строка для работы: '${str}'`);

    console.log(`Строка включает в себя 'для': ${str.includes('для')}`);
    console.log(`Строка включает в себя '42': ${str.includes(42)}`);

    console.log(`Строка начинается с 'Строка ': ${str.startsWith('Строка ')}`);
    console.log(`Строка начинается с 'для ': ${str.startsWith('для')}`);
    console.log(`Строка заканчивается на 'верки': ${str.endsWith('верки')}`);

    let str2 = 'сТрОкА дЛя ПрОвЕРкИ';
    console.log(str2);

    console.log(str2.toUpperCase());
    console.log(str2.toLowerCase());
    console.log(`Строка для проверки #2 включает в себя 'для': ${str2.includes('для')}`);
    console.log(`Строка для проверки #2 после преобразования включает в себя 'для': ${str2.toLowerCase().includes('для')}`);

    let str3 = 'На ёлке ёжики ещё не перевелись';
    console.log(str3.replace('ё', 'е'));
    console.log(str3.split(' '));
    console.log(str3.split('ё').join('е')); // Замена всех символов ё на е
    console.log('\n\t 123 \n\t'.trim()); // Убираем все пробелы и табуляции

    let str4 = '0123456789';
    console.log(str4.substr(3));
    console.log(str4.substr(3, 2));
    console.log(str4.substr(3, 5));
    console.log(str4.substr(3, 100500));

    console.log(str4.substr(-5));
    console.log(str4.substr(-5, 2));

    console.log(str4.substr(-100500, 2));

    const fullName = 'Алексей Александрович Пономарёв';
    const surname = 'Пономарёв';

    const surnameIndex = fullName.indexOf(surname); // indexOf начинает поиск сначала строки, lastIndexOf - с конца
    console.log(`Фамилия начинается с индекса: ${surnameIndex}`);

    if (surnameIndex > 0) {
      console.log(`Фамилия начинается с индекса ${surnameIndex}, перемещаем её в начало`);
      console.log(surname + ' ' + fullName.replace(surname, '').trim());
    } else {
      console.log(fullName);
    };

    // Работа с массивами:

    parseEmployeesData(`
Пономарёв  Алексей Александрович,  Frontend-разработчик
Семёнов Семён  Семёнович ,   web-разработчик
`);

    function parseEmployeesData(dataString) {
      return dataString
        .split('\n')
        .filter(line => line.trim().length > 0)
        .map(line => {
          const [fullName, occupation] = line
            .split(',')
            .map(str => str.trim())
            .filter(text => text.length > 0);
          const [surname, name, middleName] = fullName
            .split(' ')
            .filter(text => text.length > 0);
          return {
            surname,
            name,
            middleName,
            occupation
          };
        });
    };

    console.log(parseEmployeesData(`
    Пономарёв  Алексей Александрович,  Frontend-разработчик
    Семёнов Семён  Семёнович ,   web-разработчик
    `));

    function getPageLinkDomains() {
      return Array.from(document.getElementsByTagName('a'))
        .map(link => link.href
          .replace('http://', '')
          .replace('https://', '')
          .replace('www.', '')
          .split('/')
          .shift()
        )
        .reduce((uniqueDomains, domain) => {
          if (uniqueDomains.includes(domain)) return uniqueDomains;
          return [...uniqueDomains, domain];
        }, []);

    };

    console.log(getPageLinkDomains());

    const numbers = [1, 2, 3, 4, 5, 6, 7, 8];

    const students = [{
        name: 'Василий',
        age: 18
      },
      {
        name: 'Семён',
        age: 19
      },
      {
        name: 'Ольга',
        age: 21
      },
      {
        name: 'Алексей',
        age: 17
      },
      {
        name: 'Иннокентий',
        age: 20
      },
      {
        name: 'Захар',
        age: 17
      },
      {
        name: 'Прохор',
        age: 19
      },
    ];

    students.forEach((student, index) => {
      console.log(`Студент №${index + 1}: ${student.name}`);
    });

    // То же самое с помощью циклов:
    for (const index in students) {
      const student = students[index];
      console.log(`Студент №${parseInt(index, 10) + 1}: ${student.name}`);
    };

    const me = {
      name: 'Алексей',
      age: '33',
      toString() {
        return this.name + ', ' + this.age;
      }
    }

    alert(me);

    const cartItems = [{
        name: 'Гречка, 500 гр',
        price: 50,
        quantity: 3,
      },
      {
        name: 'Сок яблочный',
        price: 100,
        quantity: 1,
      },
      {
        name: 'Перфоратор',
        price: 8000,
        quantity: 2,
      },
    ];

    // Посчитаем сумму к оплате:
    cartItems.reduce(
      // 1й аргумент - функция, в неё первым аргументом передаётся уже 'накопленное' значение, а вторым - очередной элемент массива:
      (total, item) => total + item.price * item.quantity,
      // 2й аргумент - начальное значение для total:
      0
    );

    // Чтобы стало понятнее, давайте посчитаем без reduce:
    let total = 0;
    for (const item of cartItems) {
      total = total + item.price * item.quantity;
    };

    console.log(students.includes({
      name: 'Василий',
      age: 18
    })); // false, так как это не тот Василий

    console.log(students.find(student => student.name === 'Василий' && student.age === 18));
    // Находим студента (возвращает элемент)
    console.log(students.findIndex(student => student.name === 'Семён' && student.age === 19)); // Находим его индекс в массиве
    console.log(students.every(student => student.age < 30)); // true, т.к. все студенты младше 30 лет
    console.log(students.some(student => student.name === 'Иван')); // false, т.к. ни одного Ивана у нас нет
    // Метод filter фильтрует массив (все элементы, которые удовлетворяют условию - попадут в выходной массив):
    const kids = students.filter(student => student.age < 18);
    console.log(kids);
    const notAleksey = students.filter(student => student.name != 'Алексей');
    console.log(notAleksey);
    // Метод map позволяет преобразовать элементы массива из одного значения в другое:
    console.log(students.map(student => student.name));

    const numbersReversed = numbers.reverse();
    console.log(numbersReversed); // Метод "переворачивает" массив
    console.log(numbersReversed.sort()); // Метод sort() сортирует массив по возрастанию
    numbersReversed.push(10, 11);
    console.log(numbersReversed.sort());
    console.log(numbersReversed.sort((a, b) => a - b)); // Исправляем ошибку при сортировке чисел
    console.log(numbersReversed.sort((a, b) => b - a)); // Сотрируем числа в обратном порядке

    numbers.slice(); // полная копия массива, если передать параметры - то скопирует отдельные элементы
    console.log(numbers.slice(2, -2));

    numbers.includes(100); // false (проверяет наличие элемента в массиве)
    numbers.includes(8); // true (проверяет наличие элемента в массиве)
    numbers.indexOf(100); // -1
    numbers.indexOf(3); // 7 (находит индекс значения с начала массива)
    numbers.lastIndexOf(3); // 7 (находит индекс значения с конца массива)

    numbers.unshift(0); // Добавляем элемент в начало массива
    numbers.push(9); // Добавляем элемент в конец массива

    const first = numbers.shift(); // Метод удаляет из массива первый элемент и сразу же возвращает его
    console.log(first);
    console.log(numbers);

    const last = numbers.pop(); // Метод удаляет из массива последний элемент и сразу же возвращает его
    console.log(last);
    console.log(numbers);

    // while (numbers.length) {
    //   console.log(`Another one bites the dust: ${numbers.pop()}`);
    // };

    const middle = numbers.splice(4, 2); // Убираем два элемента, начиная с четвёртого индекса в массиве
    console.log(middle);
    console.log(numbers);

    numbers.splice(4, 0, 5, 6); // возвращаем обратно в массив элементы 5 и 6
    console.log(numbers);

    */

  });

})();