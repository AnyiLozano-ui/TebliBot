const sequenceContainer = document.getElementById('sequence')
const answersContainer = document.getElementById('answers')
const scoreText = document.getElementById('score')
const message = document.getElementById('message')
const nextBtn = document.getElementById('nextBtn')

const successSound = document.getElementById('successSound')
const wrongSound = document.getElementById('wrongSound')
const clickSound = document.getElementById('clickSound')
const winSound = document.getElementById('winSound')
const bubblesSound = document.getElementById('bubblesSound')

let score = 0
let correctAnswer = 0
let answered = false
let patternsCompleted = 0

function randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

function shuffle(array) {
    return array.sort(() => Math.random() - 0.5)
}

function createPattern() {
    answered = false
    nextBtn.classList.remove('show')
    sequenceContainer.innerHTML = ''
    answersContainer.innerHTML = ''

    message.textContent = 'Mira el patrón con calma 😊'

    const table = randomNumber(2, 6)
    const start = randomNumber(1, 3)

    const sequence = [
        table * start,
        table * (start + 1),
        table * (start + 2),
        table * (start + 3)
    ]

    correctAnswer = table * (start + 4)

    sequence.forEach(number => {
        const item = document.createElement('div')
        item.classList.add('seq-item')
        item.textContent = number
        sequenceContainer.appendChild(item)
    })

    let answers = [correctAnswer]

    while (answers.length < 4) {
        const wrong = correctAnswer + randomNumber(-12, 12)

        if (wrong > 0 && wrong !== correctAnswer && !answers.includes(wrong)) {
            answers.push(wrong)
        }
    }

    answers = shuffle(answers)

    answers.forEach(answer => {
        const button = document.createElement('button')
        button.classList.add('answer-btn')
        button.textContent = answer

        button.addEventListener('click', () => {
            clickSound.currentTime = 0
            clickSound.play()
            checkAnswer(button, answer)
        })

        answersContainer.appendChild(button)
    })
}

function checkAnswer(button, answer) {
    if (answered) return

    if (answer === correctAnswer) {
        answered = true
        patternsCompleted++

        score += 10
        scoreText.textContent = score

        button.classList.add('correct')
        message.textContent = '🎉 ¡Muy bien! Seguiste el patrón'

        successSound.currentTime = 0
        successSound.play()

        createHappyStars(button)
        createBubbles()

        // Victoria cada 5 patrones
        if (patternsCompleted % 5 === 0) {
            setTimeout(() => {
                winSound.currentTime = 0
                winSound.play()
                message.textContent = '🏆 ¡Vas muy bien! Lleva 5 patrones'
            }, 600)
        }

        nextBtn.classList.add('show')
    } else {
        button.classList.add('wrong')
        message.textContent = '💜 Casi... mira la secuencia otra vez'

        wrongSound.currentTime = 0
        wrongSound.play()

        createSadParticles(button)
        createBubblesOnWrong()

        setTimeout(() => {
            button.classList.remove('wrong')
        }, 700)
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

function createBubbles() {
    bubblesSound.currentTime = 0
    bubblesSound.play()

    const colors = [
        'rgba(181, 108, 255, 0.7)',
        'rgba(115, 53, 232, 0.65)',
        'rgba(255, 107, 107, 0.7)',
        'rgba(78, 205, 196, 0.7)',
        'rgba(255, 216, 61, 0.75)'
    ]

    for (let i = 0; i < 20; i++) {
        setTimeout(() => {
            const bubble = document.createElement('div')
            const size = Math.random() * 50 + 35
            const drift = (Math.random() - 0.5) * 150
            const duration = 6 + Math.random() * 2

            bubble.classList.add('bubble')
            bubble.style.left = `${Math.random() * 100}%`
            bubble.style.width = `${size}px`
            bubble.style.height = `${size}px`
            bubble.style.top = '-60px'
            bubble.style.zIndex = '9999'
            bubble.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)]
            bubble.style.boxShadow = `inset -3px -3px 10px rgba(255, 255, 255, 0.5), 0 10px 20px rgba(0, 0, 0, 0.25)`
            bubble.style.setProperty('--drift', `${drift}px`)
            bubble.style.animation = `bubbleFloat ${duration}s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards`

            document.querySelector('.game').appendChild(bubble)

            setTimeout(() => {
                bubble.remove()
            }, duration * 1000)
        }, i * 150)
    }
}

function createBubblesOnWrong() {
    for (let i = 0; i < 15; i++) {
        setTimeout(() => {
            const bubble = document.createElement('div')
            const size = Math.random() * 40 + 25
            const drift = (Math.random() - 0.5) * 120
            const duration = 5 + Math.random() * 1.5

            bubble.classList.add('bubble')
            bubble.style.left = `${Math.random() * 100}%`
            bubble.style.width = `${size}px`
            bubble.style.height = `${size}px`
            bubble.style.top = '-60px'
            bubble.style.zIndex = '9999'
            bubble.style.backgroundColor = 'rgba(124, 231, 255, 0.8)'
            bubble.style.boxShadow = `inset -3px -3px 10px rgba(255, 255, 255, 0.6), 0 10px 20px rgba(0, 0, 0, 0.2)`
            bubble.style.setProperty('--drift', `${drift}px`)
            bubble.style.animation = `bubbleFloat ${duration}s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards`

            document.querySelector('.game').appendChild(bubble)

            setTimeout(() => {
                bubble.remove()
            }, duration * 1000)
        }, i * 100)
    }
}

nextBtn.addEventListener('click', createPattern)

createPattern()