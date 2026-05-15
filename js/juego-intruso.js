const cardsGrid = document.getElementById('cardsGrid')
const scoreText = document.getElementById('score')
const livesText = document.getElementById('lives')
const streakText = document.getElementById('streak')
const message = document.getElementById('message')
const nextBtn = document.getElementById('nextBtn')
const timerText = document.getElementById('timer')
const timerBar = document.getElementById('timerBar')
const difficultyText = document.getElementById('difficulty')
const gameOverModal = document.getElementById('gameOverModal')
const restartBtn = document.getElementById('restartBtn')

const successSound = document.getElementById('successSound')
const wrongSound = document.getElementById('wrongSound')
const levelUpSound = document.getElementById('levelUpSound')
const bonusSound = document.getElementById('bonusSound')

let score = 0
let lives = 3
let streak = 0
let bestStreak = 0
let level = 1
let answered = false
let timerInterval = null
let timeLeft = 8
let speedBonus = 0

const levels = [
    { min: 2, max: 5, name: 'Tablas 2-5' },
    { min: 5, max: 8, name: 'Tablas 5-8' },
    { min: 8, max: 12, name: 'Tablas 8-12' },
    { min: 2, max: 12, name: 'Todas las Tablas' }
]

function randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

function shuffle(array) {
    return array.sort(() => Math.random() - 0.5)
}

function getCurrentLevel() {
    return levels[Math.min(level - 1, levels.length - 1)]
}

function startTimer() {
    timeLeft = 8
    speedBonus = 0
    timerBar.classList.add('active')

    timerInterval = setInterval(() => {
        timeLeft--
        timerText.textContent = timeLeft

        if (timeLeft <= 0) {
            clearInterval(timerInterval)
            if (!answered) {
                handleTimeout()
            }
        }
    }, 1000)
}

function handleTimeout() {
    answered = true
    lives--
    livesText.textContent = lives
    streak = 0
    streakText.textContent = streak

    message.textContent = '⏰ Se acabó el tiempo'
    wrongSound.play()

    if (lives <= 0) {
        endGame()
    } else {
        setTimeout(() => {
            nextBtn.classList.add('show')
        }, 800)
    }
}

function stopTimer() {
    clearInterval(timerInterval)
    timerBar.classList.remove('active')
}

function createGame() {
    answered = false
    speedBonus = 0
    cardsGrid.innerHTML = ''
    nextBtn.classList.remove('show')
    message.textContent = 'Observa con calma 😊'

    const currentLevel = getCurrentLevel()
    difficultyText.textContent = `Nivel ${level}: ${currentLevel.name}`

    const cards = []
    const operationType = level <= 2 ? 'multiply' : ['multiply', 'add', 'subtract'][Math.floor(Math.random() * 3)]

    while (cards.length < 3) {
        const num1 = randomNumber(currentLevel.min, currentLevel.max)
        const num2 = randomNumber(1, 10)

        let text, result

        if (operationType === 'multiply') {
            result = num1 * num2
            text = `${num1} × ${num2}<br>= ${result}`
        } else if (operationType === 'add') {
            result = num1 + num2
            text = `${num1} + ${num2}<br>= ${result}`
        } else {
            result = num1 - num2
            text = `${num1} - ${num2}<br>= ${result}`
        }

        if (!cards.some(card => card.text === text)) {
            cards.push({
                text,
                result,
                isIntruder: false,
                operation: operationType
            })
        }
    }

    const num1 = randomNumber(currentLevel.min, currentLevel.max)
    const num2 = randomNumber(1, 10)
    let realResult, wrongResult, intruderText

    if (operationType === 'multiply') {
        realResult = num1 * num2
        wrongResult = realResult + randomNumber(-8, 8)
        while (wrongResult <= 0 || wrongResult === realResult) {
            wrongResult = realResult + randomNumber(-8, 8)
        }
        intruderText = `${num1} × ${num2}<br>= ${wrongResult}`
    } else if (operationType === 'add') {
        realResult = num1 + num2
        wrongResult = realResult + randomNumber(-5, 5)
        while (wrongResult < 0 || wrongResult === realResult) {
            wrongResult = realResult + randomNumber(-5, 5)
        }
        intruderText = `${num1} + ${num2}<br>= ${wrongResult}`
    } else {
        realResult = num1 - num2
        wrongResult = realResult + randomNumber(-5, 5)
        while (wrongResult < 0 || wrongResult === realResult) {
            wrongResult = realResult + randomNumber(-5, 5)
        }
        intruderText = `${num1} - ${num2}<br>= ${wrongResult}`
    }

    cards.push({
        text: intruderText,
        isIntruder: true,
        operation: operationType
    })

    const shuffledCards = shuffle(cards)

    shuffledCards.forEach((card, index) => {
        const button = document.createElement('button')
        button.classList.add('intruder-card')
        button.innerHTML = card.text
        button.dataset.intruder = card.isIntruder

        button.addEventListener('click', () => checkAnswer(button, card.isIntruder))
        cardsGrid.appendChild(button)
    })

    startTimer()
}

function checkAnswer(button, isIntruder) {
    if (answered) return

    answered = true
    stopTimer()

    if (isIntruder) {
        streak++
        bestStreak = Math.max(bestStreak, streak)
        streakText.textContent = streak

        let points = 10

        if (timeLeft > 5) {
            points += 5
            speedBonus = 5
        } else if (timeLeft > 3) {
            points += 3
            speedBonus = 3
        }

        score += points
        scoreText.textContent = score

        button.classList.add('correct')

        if (speedBonus > 0) {
            message.textContent = `🎉 ¡Muy bien! +${points} puntos (${speedBonus} bonus)`
            bonusSound.currentTime = 0
            bonusSound.play()
        } else {
            message.textContent = '🎉 ¡Muy bien! Encontraste el intruso'
            successSound.currentTime = 0
            successSound.play()
        }

        createHappyStars(button)

        if (streak % 3 === 0 && streak > 0) {
            setTimeout(() => {
                levelUpSound.currentTime = 0
                levelUpSound.play()
                message.textContent += ' 🎯 ¡Subes de nivel!'
                level++
            }, 500)
        }

        setTimeout(() => {
            nextBtn.classList.add('show')
        }, 800)
    } else {
        streak = 0
        streakText.textContent = streak
        lives--
        livesText.textContent = lives

        button.classList.add('wrong')
        message.textContent = '😅 Casi... revisa otra tarjeta'

        wrongSound.currentTime = 0
        wrongSound.play()

        createSadParticles(button)

        if (lives <= 0) {
            setTimeout(() => {
                endGame()
            }, 800)
        } else {
            setTimeout(() => {
                button.classList.remove('wrong')
            }, 700)
        }
    }
}

function createHappyStars(element) {
    const rect = element.getBoundingClientRect()
    const gameRect = document.querySelector('.game').getBoundingClientRect()

    for (let i = 0; i < 18; i++) {
        const star = document.createElement('span')
        star.classList.add('happy-star')

        star.style.left = `${rect.left - gameRect.left + rect.width / 2}px`
        star.style.top = `${rect.top - gameRect.top + rect.height / 2}px`

        star.style.setProperty('--x', `${Math.random() * 260 - 130}px`)
        star.style.setProperty('--y', `${Math.random() * 260 - 130}px`)

        document.querySelector('.game').appendChild(star)

        setTimeout(() => {
            star.remove()
        }, 900)
    }
}

function createSadParticles(element) {
    const rect = element.getBoundingClientRect()
    const gameRect = document.querySelector('.game').getBoundingClientRect()

    for (let i = 0; i < 12; i++) {
        const particle = document.createElement('span')
        particle.classList.add('sad-particle')

        particle.style.left = `${rect.left - gameRect.left + rect.width / 2}px`
        particle.style.top = `${rect.top - gameRect.top + rect.height / 2}px`

        particle.style.setProperty('--x', `${Math.random() * 180 - 90}px`)
        particle.style.setProperty('--y', `${Math.random() * 180 - 90}px`)

        document.querySelector('.game').appendChild(particle)

        setTimeout(() => {
            particle.remove()
        }, 900)
    }
}

function endGame() {
    stopTimer()
    gameOverModal.classList.add('show')

    document.getElementById('finalScore').textContent = score
    document.getElementById('finalLevel').textContent = level
    document.getElementById('bestStreak').textContent = bestStreak

    const modalTitle = document.getElementById('modalTitle')
    if (score > 100) {
        modalTitle.textContent = '🏆 ¡EXCELENTE!'
    } else if (score > 50) {
        modalTitle.textContent = '😊 ¡MUY BIEN!'
    } else {
        modalTitle.textContent = '🎮 GAME OVER'
    }
}

function resetGame() {
    score = 0
    lives = 3
    streak = 0
    bestStreak = 0
    level = 1

    scoreText.textContent = score
    livesText.textContent = lives
    streakText.textContent = streak

    gameOverModal.classList.remove('show')
    createGame()
}

nextBtn.addEventListener('click', createGame)
restartBtn.addEventListener('click', resetGame)

createGame()
