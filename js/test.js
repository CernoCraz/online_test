// Глобальные переменные
let currentQuestion = 0;
let test = null;

// Загружаем тест при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const testId = urlParams.get('id');
    test = JSON.parse(localStorage.getItem(`test_${testId}`));

    if (!test) {
        showWelcomeMessage();
    } else {
        initializeTest();
    }
});

// Показываем приветственное сообщение
function showWelcomeMessage() {
    document.getElementById('testTitle').textContent = 'Добро пожаловать!';
    document.querySelector('.form-progress').style.display = 'none';
    document.getElementById('questions').innerHTML = `
        <div class="question-block">
            <div class="question-header">
                <h3>Информация</h3>
            </div>
            <p class="question-text">
                Для прохождения теста вам нужна специальная ссылка от преподавателя.
                <br><br>
                Если у вас есть ссылка, пожалуйста, перейдите по ней для начала тестирования.
            </p>
        </div>
    `;
    document.querySelector('.carousel-controls').style.display = 'none';
    document.getElementById('submitTest').style.display = 'none';
    document.getElementById('studentInfo').style.display = 'none';
}

// Инициализируем тест
function initializeTest() {
    document.getElementById('testTitle').textContent = test.title;
    
    // Создаем вопросы
    test.questions.forEach((question, index) => {
        const questionBlock = document.createElement('div');
        questionBlock.className = 'question-block';
        questionBlock.innerHTML = `
            <div class="question-header">
                <h3>Вопрос ${index + 1}</h3>
                <span class="question-number">${index + 1}/${test.questions.length}</span>
            </div>
            <p class="question-text">${question.text}</p>
            <div class="answers">
                ${question.answers.map((answer, i) => `
                    <div class="answer-wrapper">
                        <span class="answer-label">${String.fromCharCode(65 + i)}</span>
                        <label class="answer-option">
                            <input type="radio" name="q${index}" value="${i}" required>
                            <span class="answer-text">${answer}</span>
                        </label>
                    </div>
                `).join('')}
            </div>
        `;
        document.getElementById('questions').appendChild(questionBlock);
    });

    // Добавляем обработчики событий
    setupEventListeners();
    updateCarousel();
}

// Настраиваем обработчики событий
function setupEventListeners() {
    // Кнопки навигации
    document.querySelector('.carousel-arrow.prev').addEventListener('click', () => {
        if (currentQuestion > 0) {
            currentQuestion--;
            updateCarousel();
        }
    });

    document.querySelector('.carousel-arrow.next').addEventListener('click', () => {
        if (currentQuestion < test.questions.length - 1) {
            currentQuestion++;
            updateCarousel();
        }
    });

    // Точки навигации
    document.querySelector('.carousel-dots').addEventListener('click', (e) => {
        if (e.target.classList.contains('carousel-dot')) {
            currentQuestion = parseInt(e.target.dataset.index);
            updateCarousel();
        }
    });

    // Отслеживаем ответы
    document.getElementById('questions').addEventListener('change', () => {
        const answered = document.querySelectorAll('input[type="radio"]:checked').length;
        const progress = (answered / test.questions.length) * 100;
        document.querySelector('.progress-fill').style.width = `${progress}%`;
        document.querySelector('.progress-text').textContent = `Пройдено: ${Math.round(progress)}%`;
    });

    // Кнопка завершения теста
    document.getElementById('submitTest').addEventListener('click', finishTest);
}

// Обновляем карусель
function updateCarousel() {
    const container = document.querySelector('.questions-container');
    container.style.transform = `translateX(-${currentQuestion * 100}%)`;
    
    const dots = document.querySelector('.carousel-dots');
    dots.innerHTML = test.questions.map((_, i) => 
        `<span class="carousel-dot ${i === currentQuestion ? 'active' : ''}" data-index="${i}"></span>`
    ).join('');

    const prevButton = document.querySelector('.carousel-arrow.prev');
    const nextButton = document.querySelector('.carousel-arrow.next');
    prevButton.disabled = currentQuestion === 0;
    nextButton.disabled = currentQuestion === test.questions.length - 1;

    document.querySelector('.questions-count').textContent = 
        `Вопрос: ${currentQuestion + 1}/${test.questions.length}`;
}

// Завершаем тест
function finishTest() {
    const studentName = document.getElementById('studentName').value;
    const studentEmail = document.getElementById('studentEmail').value;

    if (!studentName || !studentEmail) {
        alert('Пожалуйста, введите ваше имя и email');
        return;
    }

    let score = 0;
    const answers = [];
    let allAnswered = true;

    test.questions.forEach((question, index) => {
        const selectedAnswer = document.querySelector(`input[name="q${index}"]:checked`);
        if (!selectedAnswer) {
            allAnswered = false;
            return;
        }
        
        const answerIndex = parseInt(selectedAnswer.value);
        answers.push(answerIndex);
        
        if (answerIndex === question.correctAnswer) {
            score++;
        }
    });

    if (!allAnswered) {
        alert('Пожалуйста, ответьте на все вопросы');
        return;
    }

    const percentage = Math.round((score / test.questions.length) * 100);
    const isPassed = percentage >= 60;
    
    showResults({
        testTitle: test.title,
        studentName,
        studentEmail,
        score,
        totalQuestions: test.questions.length,
        percentage,
        isPassed
    });
}

// Показываем результаты
function showResults(results) {
    // Удаляем старые модальные окна
    document.querySelectorAll('.modal-overlay').forEach(modal => modal.remove());

    // Создаем элементы
    const modalOverlay = document.createElement('div');
    const modal = document.createElement('div');
    const title = document.createElement('h2');
    const resultsInfo = document.createElement('div');
    const buttonsDiv = document.createElement('div');

    // Настраиваем классы
    modalOverlay.className = 'modal-overlay active';
    modal.className = 'modal';
    resultsInfo.className = `results-info ${results.isPassed ? 'passed' : 'failed'}`;
    buttonsDiv.className = 'modal-buttons';

    // Создаем содержимое
    title.textContent = 'Тест завершен!';
    
    const resultMessage = results.isPassed 
        ? 'Поздравляем! Вы успешно прошли тест!' 
        : 'К сожалению, тест не пройден. Попробуйте еще раз!';

    resultsInfo.innerHTML = `
        <h3>${resultMessage}</h3>
        <p>Ваш результат: ${results.score} из ${results.totalQuestions}</p>
        <p>Процент правильных ответов: ${results.percentage}%</p>
    `;

    // Создаем кнопки
    const submitButton = document.createElement('button');
    submitButton.type = 'button';
    submitButton.className = 'modern-button primary';
    submitButton.textContent = 'Отправить результаты';

    const returnButton = document.createElement('button');
    returnButton.type = 'button';
    returnButton.className = 'modern-button secondary';
    returnButton.textContent = 'Вернуться на главную';

    // Добавляем обработчик для отправки результатов
    submitButton.addEventListener('click', () => {
        // Создаем форму
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = 'https://formsubmit.co/mr.kartichev@mail.ru';

        // Добавляем скрытые поля с данными
        const hiddenFields = {
            'Тест': results.testTitle,
            'Студент': results.studentName,
            'Email студента': results.studentEmail,
            'Результат': `${results.score} из ${results.totalQuestions}`,
            'Процент': `${results.percentage}%`,
            'Статус': results.isPassed ? 'Тест пройден' : 'Тест не пройден',
            '_subject': `Результаты теста: ${results.testTitle}`,
            '_template': 'table',
            '_captcha': 'false',
            '_next': `${window.location.origin}/success.html`
        };

        // Добавляем поля в форму
        Object.entries(hiddenFields).forEach(([name, value]) => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = name;
            input.value = value;
            form.appendChild(input);
        });

        // Показываем уведомление
        modalOverlay.remove();
        const notification = document.createElement('div');
        notification.className = 'modal-overlay active';
        notification.innerHTML = `
            <div class="modal">
                <h2>Отправка результатов</h2>
                <div class="results-info">
                    <h3>Пожалуйста, подождите...</h3>
                    <p>Результаты отправляются на сервер.</p>
                </div>
            </div>
        `;
        document.body.appendChild(notification);

        // Отправляем форму
        document.body.appendChild(form);
        form.submit();
    });

    returnButton.addEventListener('click', () => window.location.href = 'success.html');

    // Собираем структуру
    buttonsDiv.appendChild(submitButton);
    buttonsDiv.appendChild(returnButton);

    modal.appendChild(title);
    modal.appendChild(resultsInfo);
    modal.appendChild(buttonsDiv);
    modalOverlay.appendChild(modal);

    // Добавляем на страницу
    document.body.appendChild(modalOverlay);

    // Отключаем возможность редактирования теста
    document.querySelectorAll('input[type="radio"]').forEach(input => {
        input.disabled = true;
    });
    document.getElementById('submitTest').disabled = true;
}
