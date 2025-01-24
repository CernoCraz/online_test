let questionCount = 1;
let currentQuestion = 0;

function createQuestionBlock(number) {
    const block = document.createElement('div');
    block.className = 'question-block';
    block.innerHTML = `
        <div class="question-header">
            <div class="question-header-content">
                <h3>Вопрос ${number}</h3>
                <span class="question-number">${number}/${number}</span>
            </div>
            <button type="button" class="btn-delete" title="Удалить вопрос">×</button>
        </div>
        <input type="text" class="question-text modern-input" placeholder="Введите вопрос" required>
        
        <div class="answers">
            <div class="answer-wrapper">
                <span class="answer-label">A</span>
                <input type="text" class="answer modern-input" placeholder="Вариант ответа 1" required>
            </div>
            <div class="answer-wrapper">
                <span class="answer-label">B</span>
                <input type="text" class="answer modern-input" placeholder="Вариант ответа 2" required>
            </div>
            <div class="answer-wrapper">
                <span class="answer-label">C</span>
                <input type="text" class="answer modern-input" placeholder="Вариант ответа 3">
            </div>
            <div class="answer-wrapper">
                <span class="answer-label">D</span>
                <input type="text" class="answer modern-input" placeholder="Вариант ответа 4">
            </div>
        </div>
        
        <div class="correct-answer-wrapper">
            <label>Правильный ответ:</label>
            <select class="correct-answer modern-select">
                <option value="0">Вариант A</option>
                <option value="1">Вариант B</option>
                <option value="2">Вариант C</option>
                <option value="3">Вариант D</option>
            </select>
        </div>
    `;

    // Добавляем обработчик для кнопки удаления
    block.querySelector('.btn-delete').addEventListener('click', () => {
        if (document.querySelectorAll('.question-block').length > 1) {
            block.classList.add('removing');
            setTimeout(() => {
                block.remove();
                updateQuestionNumbers();
            }, 300);
        } else {
            alert('Тест должен содержать хотя бы один вопрос');
        }
    });

    // Обновляем нумерацию всех вопросов
    setTimeout(() => {
        updateQuestionNumbers();
    }, 0);

    return block;
}

function updateQuestionNumbers() {
    const questions = document.querySelectorAll('.question-block');
    const total = questions.length;
    questions.forEach((question, index) => {
        const number = index + 1;
        question.querySelector('.question-number').textContent = `${number}/${total}`;
    });
}

function updateCarousel() {
    const container = document.querySelector('.questions-container');
    container.style.transform = `translateX(-${currentQuestion * 100}%)`;
    
    // Обновляем точки
    const dots = document.querySelector('.carousel-dots');
    dots.innerHTML = Array.from({ length: questionCount }, (_, i) => 
        `<span class="carousel-dot ${i === currentQuestion ? 'active' : ''}" data-index="${i}"></span>`
    ).join('');

    // Обновляем состояние кнопок
    const prevButton = document.querySelector('.carousel-arrow.prev');
    const nextButton = document.querySelector('.carousel-arrow.next');
    prevButton.disabled = currentQuestion === 0;
    nextButton.disabled = currentQuestion === questionCount - 1;

    // Обновляем номер вопроса
    updateQuestionNumbers();
}

// Обработчики для кнопок карусели
document.querySelector('.carousel-arrow.prev').addEventListener('click', () => {
    if (currentQuestion > 0) {
        currentQuestion--;
        updateCarousel();
    }
});

document.querySelector('.carousel-arrow.next').addEventListener('click', () => {
    if (currentQuestion < questionCount - 1) {
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

// Обновляем обработчик добавления вопроса
document.getElementById('addQuestion').addEventListener('click', () => {
    questionCount++;
    document.getElementById('questions').appendChild(createQuestionBlock(questionCount));
    currentQuestion = questionCount - 1; // Переключаемся на новый вопрос
    updateCarousel();
});

// Добавляем поддержку свайпов для мобильных устройств
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
    const swipeThreshold = 50; // Минимальное расстояние для свайпа
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0 && currentQuestion < questionCount - 1) {
            // Свайп влево
            currentQuestion++;
            updateCarousel();
        } else if (diff < 0 && currentQuestion > 0) {
            // Свайп вправо
            currentQuestion--;
            updateCarousel();
        }
    }
}

// Инициализация карусели
updateCarousel();

function showModal(testUrl) {
    const modalHtml = `
        <div class="modal-overlay">
            <div class="modal">
                <h2>Тест успешно создан!</h2>
                <p>Используйте эту ссылку, чтобы поделиться тестом с учениками:</p>
                <div class="test-url">
                    <input type="text" value="${testUrl}" readonly>
                    <button class="copy-button" onclick="copyTestUrl(this)">Копировать</button>
                </div>
                <div class="modal-buttons">
                    <button class="modern-button primary" onclick="closeModal()">Закрыть</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    setTimeout(() => {
        document.querySelector('.modal-overlay').classList.add('active');
    }, 10);
}

function closeModal() {
    const modal = document.querySelector('.modal-overlay');
    modal.classList.remove('active');
    setTimeout(() => modal.remove(), 300);
}

function copyTestUrl(button) {
    const input = button.parentElement.querySelector('input');
    input.select();
    document.execCommand('copy');
    button.textContent = 'Скопировано!';
    setTimeout(() => {
        button.textContent = 'Копировать';
    }, 2000);
}

function validateQuestion(block) {
    const question = block.querySelector('.question-text').value.trim();
    const answers = Array.from(block.querySelectorAll('.answer'))
        .map(input => input.value.trim())
        .filter(answer => answer !== '');
    
    if (question.length < 3) {
        return 'Вопрос должен содержать не менее 3 символов';
    }
    if (answers.length < 2) {
        return 'Должно быть минимум 2 варианта ответа';
    }
    return null;
}

document.getElementById('testForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const test = {
        title: document.getElementById('testTitle').value,
        teacherEmail: document.getElementById('teacherEmail').value,
        questions: []
    };

    document.querySelectorAll('.question-block').forEach(block => {
        const question = {
            text: block.querySelector('.question-text').value,
            answers: Array.from(block.querySelectorAll('.answer'))
                .map(input => input.value)
                .filter(answer => answer.trim() !== ''),
            correctAnswer: parseInt(block.querySelector('.correct-answer').value)
        };
        test.questions.push(question);
    });

    let isValid = true;
    let errorMessage = '';

    document.querySelectorAll('.question-block').forEach((block, index) => {
        const error = validateQuestion(block);
        if (error) {
            isValid = false;
            errorMessage += `Вопрос ${index + 1}: ${error}\n`;
        }
    });

    if (!isValid) {
        alert(errorMessage);
        return;
    }

    const testId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    localStorage.setItem(`test_${testId}`, JSON.stringify(test));
    
    const testUrl = `${window.location.href.replace('index.html', '')}test.html?id=${testId}`;
    showModal(testUrl);
});

function updateProgress() {
    const questions = document.querySelectorAll('.question-block');
    let filledFields = 0;
    let totalFields = 0;

    questions.forEach(block => {
        // Проверяем заполненность вопроса
        const questionText = block.querySelector('.question-text').value.trim();
        if (questionText) filledFields++;
        totalFields++;

        // Проверяем заполненность ответов
        const answers = block.querySelectorAll('.answer');
        answers.forEach(answer => {
            if (answer.value.trim()) filledFields++;
            totalFields++;
        });
    });

    const progress = (filledFields / totalFields) * 100;
    document.querySelector('.progress-fill').style.width = `${progress}%`;
    document.querySelector('.progress-text').textContent = `Заполнено: ${Math.round(progress)}%`;
    document.querySelector('.questions-count').textContent = `Вопросов: ${questions.length}`;
}

// Добавляем слушатели событий для обновления прогресса
document.getElementById('questions').addEventListener('input', updateProgress);
document.getElementById('addQuestion').addEventListener('click', () => {
    setTimeout(updateProgress, 0);
}); 
