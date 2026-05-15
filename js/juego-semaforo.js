const operationText = document.getElementById('operation')
const scoreText = document.getElementById('score')
const timerText = document.getElementById('timer')
const message = document.getElementById('message')
const nextBtn = document.getElementById('nextBtn')

const correctBtn = document.getElementById('correctBtn')
const wrongBtn = document.getElementById('wrongBtn')

const redLight = document.getElementById('redLight')
const yellowLight = document.getElementById('yellowLight')
const greenLight = document.getElementById('greenLight')

const successSound = document.getElementById('successSound')
const wrongSound = document.getElementById('wrongSound')

let score = 0
let combo = 0
let isCorrectOperation = false
let answered = false
let responseTime = 0

let timeLeft = 10
let timerInterval = null
let startTime = 0

const operationTypes = ['suma', 'resta', 'multiplicacion']

function randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

function createChallenge() {
    answered = false
    nextBtn.classList.remove('show')

    timeLeft = 10
    timerText.textContent = timeLeft
    responseTime = 0

    message.textContent = 'Mira bien y responde 😊'

    correctBtn.disabled = false
    wrongBtn.disabled = false

    correctBtn.classList.remove('correct-effect', 'wrong-effect')
    wrongBtn.classList.remove('correct-effect', 'wrong-effect')

    const comboBox = document.getElementById('comboBox')
    if (combo > 0) {
        comboBox.textContent = `🔥 ¡Racha ×${combo}!`
        comboBox.style.display = 'block'
    } else {
        comboBox.style.display = 'none'
    }

    const operationType = operationTypes[Math.floor(Math.random() * operationTypes.length)]

    let num1, num2, realResult, shownResult, operationSymbol

    if (operationType === 'suma') {
        num1 = randomNumber(5, 20)
        num2 = randomNumber(5, 20)
        realResult = num1 + num2
        operationSymbol = '+'
    } else if (operationType === 'resta') {
        num1 = randomNumber(10, 25)
        num2 = randomNumber(5, num1 - 2)
        realResult = num1 - num2
        operationSymbol = '−'
    } else {
        num1 = randomNumber(2, 7)
        num2 = randomNumber(2, 12)
        realResult = num1 * num2
        operationSymbol = '×'
    }

    isCorrectOperation = Math.random() > 0.5
    shownResult = realResult

    if (!isCorrectOperation) {
        const difference = randomNumber(-9, 9)
        shownResult = realResult + difference

        while (shownResult <= 0 || shownResult === realResult) {
            shownResult = realResult + randomNumber(-9, 9)
        }
    }

    operationText.textContent = `${num1} ${operationSymbol} ${num2} = ${shownResult}`

    startTimer()
}

function startTimer() {
    clearInterval(timerInterval)
    updateLights()
    startTime = Date.now()

    timerInterval = setInterval(() => {
        timeLeft--
        timerText.textContent = timeLeft
        updateLights()

        if (timeLeft <= 0) {
            clearInterval(timerInterval)
            if (!answered) {
                handleTimeout()
            }
        }
    }, 1000)
}

function updateLights() {
    redLight.classList.remove('active')
    yellowLight.classList.remove('active')
    greenLight.classList.remove('active')

    if (timeLeft >= 7) {
        greenLight.classList.add('active')
    } else if (timeLeft >= 4) {
        yellowLight.classList.add('active')
    } else {
        redLight.classList.add('active')
    }
}

function checkAnswer(userSaysCorrect, button) {
    if (answered) return

    answered = true
    clearInterval(timerInterval)

    responseTime = Math.max(0, 5 - timeLeft)

    correctBtn.disabled = true
    wrongBtn.disabled = true

    if (userSaysCorrect === isCorrectOperation) {
        combo++

        let points = 10
        let speedBonus = 0
        let comboBonus = 0
        let speedMessage = ''

        if (responseTime <= 4) {
            speedBonus = 15
            speedMessage = '⚡ ¡RÁPIDO!'
        } else if (responseTime <= 6) {
            speedBonus = 10
            speedMessage = '🚀 ¡MUY BIEN!'
        } else if (responseTime <= 8) {
            speedBonus = 5
            speedMessage = '✅ ¡CORRECTO!'
        } else {
            speedMessage = '⏱ ¡Lo hiciste!'
        }

        if (combo >= 10) {
            comboBonus = 25
        } else if (combo >= 5) {
            comboBonus = 15
        } else if (combo >= 3) {
            comboBonus = 5
        }

        points += speedBonus + comboBonus

        score += points
        scoreText.textContent = score

        button.classList.add('correct-effect')

        let messageText = `🎉 ${speedMessage}`
        if (comboBonus > 0) {
            messageText += ` | 🔥 Racha ×${combo}`
        }
        messageText += ` | +${points}pts`

        message.textContent = messageText

        playSuccessSound(responseTime)
        createHappyStars(button)
        createFloatingScore(button, `+${points}`)

        nextBtn.classList.add('show')
    } else {
        combo = 0

        button.classList.add('wrong-effect')
        message.textContent = '😅 Eso no era... Intentemos otra'

        playWrongSound()
        createSadParticles(button)

        nextBtn.classList.add('show')
    }
}

function handleTimeout() {
    answered = true
    combo = 0

    correctBtn.disabled = true
    wrongBtn.disabled = true

    message.textContent = '⏱ ¡Se acabó el tiempo! Más rápido la próxima'

    wrongSound.currentTime = 0
    wrongSound.play()

    createSadParticles(document.querySelector('.operation-card'))

    nextBtn.classList.add('show')
}

function playSuccessSound(time) {
    successSound.currentTime = 0
    successSound.playbackRate = 1 + (time * 0.1)
    successSound.play()
}

function playWrongSound() {
    wrongSound.currentTime = 0
    wrongSound.playbackRate = 0.9
    wrongSound.play()
}

function createFloatingScore(element, text) {
    const rect = element.getBoundingClientRect()
    const gameRect = document.querySelector('.game').getBoundingClientRect()

    const score = document.createElement('span')
    score.classList.add('floating-score')
    score.textContent = text

    score.style.left = `${rect.left - gameRect.left + rect.width / 2}px`
    score.style.top = `${rect.top - gameRect.top}px`

    document.querySelector('.game').appendChild(score)

    setTimeout(() => {
        score.remove()
    }, 1200)
}

function createHappyStars(element) {
    const rect = element.getBoundingClientRect()
    const gameRect = document.querySelector('.game').getBoundingClientRect()

    for (let i = 0; i < 35; i++) {
        const star = document.createElement('span')

        star.classList.add('happy-star')

        star.style.left = `${rect.left - gameRect.left + rect.width / 2}px`
        star.style.top = `${rect.top - gameRect.top + rect.height / 2}px`

        star.style.setProperty('--x', `${Math.random() * 380 - 190}px`)
        star.style.setProperty('--y', `${Math.random() * 380 - 190}px`)

        document.querySelector('.game').appendChild(star)

        setTimeout(() => {
            star.remove()
        }, 1200)
    }

    if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100])
    }
}

function createSadParticles(element) {
    const rect = element.getBoundingClientRect()
    const gameRect = document.querySelector('.game').getBoundingClientRect()

    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('span')

        particle.classList.add('sad-particle')

        particle.style.left = `${rect.left - gameRect.left + rect.width / 2}px`
        particle.style.top = `${rect.top - gameRect.top + rect.height / 2}px`

        particle.style.setProperty('--x', `${Math.random() * 260 - 130}px`)
        particle.style.setProperty('--y', `${Math.random() * 260 - 130}px`)

        document.querySelector('.game').appendChild(particle)

        setTimeout(() => {
            particle.remove()
        }, 1200)
    }

    if (navigator.vibrate) {
        navigator.vibrate([50, 30, 50, 30, 50])
    }
}

correctBtn.addEventListener('click', () => {
    checkAnswer(true, correctBtn)
})

wrongBtn.addEventListener('click', () => {
    checkAnswer(false, wrongBtn)
})

nextBtn.addEventListener('click', createChallenge)

createChallenge()