const operationsContainer =
    document.getElementById('operations')

const answersContainer =
    document.getElementById('answers')

const message =
    document.getElementById('message')

const scoreText =
    document.getElementById('score')

const nextBtn =
    document.getElementById('nextBtn')

const svg =
    document.getElementById('lines')

const successSound =
    document.getElementById('successSound')

const wrongSound =
    document.getElementById('wrongSound')

let score = 0

let selectedOperation = null
let selectedAnswer = null

let matches = 0

const operations = []

function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

function shuffle(arr) {
    return arr.sort(() => Math.random() - .5)
}

function createGame() {

    operationsContainer.innerHTML = ''
    answersContainer.innerHTML = ''
    svg.innerHTML = ''

    selectedOperation = null
    selectedAnswer = null

    matches = 0

    operations.length = 0

    const used = []

    while (operations.length < 4) {

        const a = random(2, 9)
        const b = random(1, 10)

        const result = a * b

        if (!used.includes(result)) {

            used.push(result)

            operations.push({
                operation: `${a} × ${b}`,
                answer: result
            })
        }
    }

    const shuffledAnswers =
        shuffle([...operations])

    operations.forEach(item => {

        const btn =
            document.createElement('button')

        btn.classList.add('card')

        btn.textContent = item.operation

        btn.dataset.answer = item.answer

        btn.addEventListener('click', () => {

            document
                .querySelectorAll('.column.left .card')
                .forEach(c => c.classList.remove('selected'))

            btn.classList.add('selected')

            selectedOperation = btn

            checkMatch()
        })

        operationsContainer.appendChild(btn)
    })

    shuffledAnswers.forEach(item => {

        const btn =
            document.createElement('button')

        btn.classList.add('card', 'answer')

        btn.textContent = item.answer

        btn.dataset.answer = item.answer

        btn.addEventListener('click', () => {

            document
                .querySelectorAll('.column.right .card')
                .forEach(c => c.classList.remove('selected'))

            btn.classList.add('selected')

            selectedAnswer = btn

            checkMatch()
        })

        answersContainer.appendChild(btn)
    })
}

function checkMatch() {

    if (!selectedOperation || !selectedAnswer)
        return

    if (
        selectedOperation.dataset.answer ===
        selectedAnswer.dataset.answer
    ) {

        successSound.currentTime = 0
        successSound.play()

        selectedOperation.classList.add('correct')
        selectedAnswer.classList.add('correct')

        drawLine(
            selectedOperation,
            selectedAnswer
        )

        selectedOperation.disabled = true
        selectedAnswer.disabled = true

        message.textContent =
            '🎉 ¡Excelente trabajo!'

        matches++

        if (matches === 4) {

            score += 10
            scoreText.textContent = score

            nextBtn.classList.add('show')

            message.textContent =
                '🚀 ¡Completaste la ronda!'
        }

    } else {

        wrongSound.currentTime = 0
        wrongSound.play()

        selectedOperation.classList.add('wrong')
        selectedAnswer.classList.add('wrong')

        message.textContent =
            '😅 Ups... intenta otra vez'

        setTimeout(() => {

            selectedOperation.classList.remove('wrong')
            selectedAnswer.classList.remove('wrong')

        }, 500)
    }

    selectedOperation.classList.remove('selected')
    selectedAnswer.classList.remove('selected')

    selectedOperation = null
    selectedAnswer = null
}

function drawLine(el1, el2) {

    const board =
        document.querySelector('.board')

    const r1 =
        el1.getBoundingClientRect()

    const r2 =
        el2.getBoundingClientRect()

    const rb =
        board.getBoundingClientRect()

    const x1 = r1.right - rb.left
    const y1 = r1.top + r1.height / 2 - rb.top

    const x2 = r2.left - rb.left
    const y2 = r2.top + r2.height / 2 - rb.top

    const path =
        document.createElementNS(
            'http://www.w3.org/2000/svg',
            'path'
        )

    path.setAttribute(
        'd',
        `M ${x1} ${y1} C ${x1+60} ${y1},
     ${x2-60} ${y2},
     ${x2} ${y2}`
    )

    path.setAttribute(
        'class',
        'line-path'
    )

    svg.appendChild(path)
}

nextBtn.addEventListener('click', () => {

    nextBtn.classList.remove('show')

    message.textContent =
        'Une las parejas correctas 😊'

    createGame()
})

createGame()