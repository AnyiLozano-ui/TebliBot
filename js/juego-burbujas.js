const popSound = document.getElementById('popSound')
const wrongSound = document.getElementById("wrongSound");

const questionText = document.getElementById('question')
const bubblesContainer = document.getElementById('bubbles')
const message = document.getElementById('message')
const scoreText = document.getElementById('score')
const nextBtn = document.getElementById('nextBtn')

let score = 0
let correctAnswer = 0
let answered = false

function randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

function shuffle(array) {
    return array.sort(() => Math.random() - 0.5)
}

function createQuestion() {
    answered = false
    message.textContent = 'Toca una burbuja 😊'
    bubblesContainer.innerHTML = ''

    const table = randomNumber(2, 6)
    const multiplier = randomNumber(1, 10)

    correctAnswer = table * multiplier

    questionText.textContent = `${table} × ${multiplier}`

    let answers = [correctAnswer]

    while (answers.length < 4) {
        let wrongAnswer = correctAnswer + randomNumber(-10, 10)

        if (
            wrongAnswer > 0 &&
            wrongAnswer !== correctAnswer &&
            !answers.includes(wrongAnswer)
        ) {
            answers.push(wrongAnswer)
        }
    }

    answers = shuffle(answers)

    answers.forEach((answer) => {
        const bubble = document.createElement('button')
        bubble.classList.add('bubble')
        bubble.textContent = answer

        bubble.addEventListener('click', () => checkAnswer(bubble, answer))

        bubblesContainer.appendChild(bubble)
    })
}

function checkAnswer(bubble, answer) {
    if (answered) return

    if (answer === correctAnswer) {
        answered = true
        score += 10
        scoreText.textContent = score

        bubble.classList.add('pop')

        popSound.currentTime = 0
        popSound.play()
        message.textContent = '¡Muy bien! Lo lograste ⭐'

        setTimeout(() => {
            createQuestion()
        }, 1400)
    } else {
        wrongSound.currentTime = 0
        wrongSound.play()

        bubble.classList.add('wrong')
        bubble.classList.add('wrong-effect')

        message.textContent = '😅 ¡Casi! Tú puedes 💜'

        createParticles(bubble)

        setTimeout(() => {
            bubble.classList.remove('wrong')
            bubble.classList.remove('wrong-effect')
        }, 700)
    }
}

function createParticles(element) {
    for (let i = 0; i < 18; i++) {
        const particle = document.createElement('span')

        particle.classList.add('particle')

        particle.style.left =
            element.offsetLeft + element.offsetWidth / 2 + 'px'

        particle.style.top =
            element.offsetTop + element.offsetHeight / 2 + 'px'

        particle.style.setProperty(
            '--x',
            `${Math.random() * 420 - 210}px`
        )

        particle.style.setProperty(
            '--y',
            `${Math.random() * 420 - 210}px`
        )

        bubblesContainer.appendChild(particle)

        setTimeout(() => {
            particle.remove()
        }, 700)
    }
}

nextBtn.addEventListener('click', createQuestion)

createQuestion()