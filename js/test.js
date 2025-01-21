let currentQuestion = 0;
let test = null;

// Получаем ID теста из URL
const urlParams = new URLSearchParams(window.location.search);
const testId = urlParams.get('id');

// Загружаем тест из localStorage
test = JSON.parse(localStorage.getItem(`test_${testId}`));

// Если теста нет, показываем заглушку
if (!test) {
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
} else {
    // Отображаем название теста
    document.getElementById('testTitle').textContent = test.title;

    // Создаем вопросы
    function createQuestionBlock(question, index) {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question-block';
        questionDiv.innerHTML = `
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
        return questionDiv;
    }

    // Обновляем карусель
    function updateCarousel() {
        const container = document.querySelector('.questions-container');
        container.style.transform = `translateX(-${currentQuestion * 100}%)`;
        
        // Обновляем точки
        const dots = document.querySelector('.carousel-dots');
        dots.innerHTML = test.questions.map((_, i) => 
            `<span class="carousel-dot ${i === currentQuestion ? 'active' : ''}" data-index="${i}"></span>`
        ).join('');

        // Обновляем состояние кнопок
        const prevButton = document.querySelector('.carousel-arrow.prev');
        const nextButton = document.querySelector('.carousel-arrow.next');
        prevButton.disabled = currentQuestion === 0;
        nextButton.disabled = currentQuestion === test.questions.length - 1;

        // Обновляем прогресс
        updateProgress();
    }

    // Обновляем прогресс
    function updateProgress() {
        const questions = document.querySelectorAll('.question-block');
        let answered = 0;

        questions.forEach(block => {
            if (block.querySelector('input[type="radio"]:checked')) {
                answered++;
            }
        });

        const progress = (answered / questions.length) * 100;
        document.querySelector('.progress-fill').style.width = `${progress}%`;
        document.querySelector('.progress-text').textContent = `Пройдено: ${Math.round(progress)}%`;
        document.querySelector('.questions-count').textContent = 
            `Вопрос: ${currentQuestion + 1}/${questions.length}`;
    }

    // Инициализация теста
    test.questions.forEach((question, index) => {
        const questionBlock = createQuestionBlock(question, index);
        document.getElementById('questions').appendChild(questionBlock);
    });

    // Обработчики для кнопок карусели
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

    // Обработчик для точек
    document.querySelector('.carousel-dots').addEventListener('click', (e) => {
        if (e.target.classList.contains('carousel-dot')) {
            currentQuestion = parseInt(e.target.dataset.index);
            updateCarousel();
        }
    });

    // Обработчик изменения ответов
    document.getElementById('questions').addEventListener('change', updateProgress);

    // Поддержка свайпов для мобильных устройств
    let touchStartX = 0;
    let touchEndX = 0;

    document.querySelector('.questions-carousel').addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
    });

    document.querySelector('.questions-carousel').addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0 && currentQuestion < test.questions.length - 1) {
                currentQuestion++;
                updateCarousel();
            } else if (diff < 0 && currentQuestion > 0) {
                currentQuestion--;
                updateCarousel();
            }
        }
    }

    // Обработчик отправки теста
    document.getElementById('submitTest').addEventListener('click', () => {
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

        const results = {
            testTitle: test.title,
            studentName,
            studentEmail,
            teacherEmail: test.teacherEmail,
            score,
            totalQuestions: test.questions.length,
            answers
        };

        // В реальном приложении здесь был бы код для отправки результатов на сервер
        alert(`Тест завершен!\nВаш результат: ${score} из ${test.questions.length}`);
        console.log('Результаты теста:', results);
    });

    // Инициализация карусели
    updateCarousel();
} 
