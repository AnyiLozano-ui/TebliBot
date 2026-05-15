const operationText = document.getElementById('operation')
const foodsContainer = document.getElementById('foods')
const monster = document.getElementById('monster')
const scoreText = document.getElementById('score')
const message = document.getElementById('message')
const nextBtn = document.getElementById('nextBtn')

const successSound = document.getElementById('successSound')
const wrongSound = document.getElementById('wrongSound')
const burbujasSound = document.getElementById('burbujasSound')
const ganadorSound = document.getElementById('ganadorSound')

let score = 0
let correctAnswer = 0
let answered = false
let draggedFood = null

function randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

function shuffle(array) {
    return array.sort(() => Math.random() - 0.5)
}

function createQuestion() {
    answered = false
    nextBtn.classList.remove('show')
    foodsContainer.innerHTML = ''

    monster.classList.remove('happy', 'sad')
    monster.querySelector('.monster-face').src = './imagenes/monstruofelix.png'
    message.textContent = 'Arrastra la comida correcta 😊'

    const table = randomNumber(2, 6)
    const multiplier = randomNumber(1, 10)

    correctAnswer = table * multiplier
    operationText.textContent = `${table} × ${multiplier}`

    let answers = [correctAnswer]

    while (answers.length < 4) {
        const wrong = correctAnswer + randomNumber(-10, 10)

        if (wrong > 0 && wrong !== correctAnswer && !answers.includes(wrong)) {
            answers.push(wrong)
        }
    }

    answers = shuffle(answers)

    const foodIcons = ['🍎', '🍕', '🍩', '🍔']

    answers.forEach((answer, index) => {
        const food = document.createElement('button')
        food.classList.add('food')
        food.dataset.answer = answer

        food.innerHTML = `
      <span>${foodIcons[index]}</span>
      ${answer}
    `

        food.addEventListener('pointerdown', startDrag)
        foodsContainer.appendChild(food)
    })
}

function startDrag(e) {
    if (answered) return

    draggedFood = e.currentTarget
    draggedFood.classList.add('dragging')

    const rect = draggedFood.getBoundingClientRect()

    draggedFood.dataset.shiftX = e.clientX - rect.left
    draggedFood.dataset.shiftY = e.clientY - rect.top

    draggedFood.style.position = 'fixed'
    draggedFood.style.left = `${rect.left}px`
    draggedFood.style.top = `${rect.top}px`
    draggedFood.style.width = `${rect.width}px`

    draggedFood.setPointerCapture(e.pointerId)

    draggedFood.addEventListener('pointermove', dragFood)
    draggedFood.addEventListener('pointerup', dropFood)
}

function dragFood(e) {
    if (!draggedFood) return

    const shiftX = Number(draggedFood.dataset.shiftX)
    const shiftY = Number(draggedFood.dataset.shiftY)

    draggedFood.style.left = `${e.clientX - shiftX}px`
    draggedFood.style.top = `${e.clientY - shiftY}px`
}

function dropFood(e) {
    if (!draggedFood) return

    draggedFood.releasePointerCapture(e.pointerId)

    draggedFood.removeEventListener('pointermove', dragFood)
    draggedFood.removeEventListener('pointerup', dropFood)

    const foodRect = draggedFood.getBoundingClientRect()
    const monsterRect = monster.getBoundingClientRect()

    const isOverMonster = !(
        foodRect.bottom < monsterRect.top ||
        foodRect.top > monsterRect.bottom ||
        foodRect.right < monsterRect.left ||
        foodRect.left > monsterRect.right
    )

    if (isOverMonster) {
        checkFood(draggedFood)
    } else {
        resetFood(draggedFood)
    }

    draggedFood.classList.remove('dragging')
    draggedFood = null
}

function checkFood(food) {
    const answer = Number(food.dataset.answer)

    if (answer === correctAnswer) {
        answered = true

        score += 10
        scoreText.textContent = score

        monster.classList.add('happy')
        monster.querySelector('.monster-face').src = './imagenes/monstruo1.png'
        message.textContent = '🎉 ¡Rico! Alimentaste al monstruo'

        successSound.currentTime = 0
        successSound.play()

        setTimeout(() => {
            ganadorSound.currentTime = 0
            ganadorSound.play()
        }, 200)

        createConfetti()
        flashBackground()
        if (navigator.vibrate) {
            navigator.vibrate([100, 50, 100])
        }

        food.style.visibility = 'hidden'
        nextBtn.classList.add('show')
    } else {
        monster.classList.add('sad')
        monster.querySelector('.monster-face').src = './imagenes/monstruo1.png'
        message.textContent = '💜 Casi... prueba otra comida'

        wrongSound.currentTime = 0
        wrongSound.volume = 0.7
        wrongSound.play()

        food.classList.add('wrong')

        setTimeout(() => {
            monster.classList.remove('sad')
            monster.querySelector('.monster-face').src = './imagenes/monstruofelix.png'
            food.classList.remove('wrong')
            resetFood(food)
        }, 700)
    }
}

function resetFood(food) {
    food.style.position = ''
    food.style.left = ''
    food.style.top = ''
    food.style.width = ''
}

function flashBackground() {
    const game = document.querySelector('.game')
    const originalBg = game.style.background

    game.style.background = 'linear-gradient(135deg, #ffd93d, #ffb032)'
    game.style.boxShadow = 'inset 0 0 60px rgba(255, 217, 61, 0.6)'

    setTimeout(() => {
        game.style.background = originalBg
        game.style.boxShadow = 'none'
    }, 400)
}

function createConfetti() {
    const confettiCount = 30
    const container = monster.parentElement

    for (let i = 0; i < confettiCount; i++) {
        if (i % 6 === 0) {
            setTimeout(() => {
                burbujasSound.currentTime = 0
                burbujasSound.volume = 0.4 + Math.random() * 0.3
                burbujasSound.play().catch(() => {})
            }, i * 30)
        }
        const confetti = document.createElement('div')
        confetti.style.position = 'fixed'
        confetti.style.width = '12px'
        confetti.style.height = '12px'
        confetti.style.borderRadius = '50%'
        confetti.style.pointerEvents = 'none'

        const colors = ['#ffd93d', '#ff6b9d', '#7b35ef', '#249cf4', '#39c95d']
        confetti.style.background = colors[Math.floor(Math.random() * colors.length)]

        const monsterRect = monster.getBoundingClientRect()
        const startX = monsterRect.left + monsterRect.width / 2
        const startY = monsterRect.top + monsterRect.height / 2

        confetti.style.left = startX + 'px'
        confetti.style.top = startY + 'px'

        document.body.appendChild(confetti)

        const angle = (Math.PI * 2 * i) / confettiCount
        const velocity = 5 + Math.random() * 5
        const vx = Math.cos(angle) * velocity
        const vy = Math.sin(angle) * velocity - 3

        let x = startX
        let y = startY
        let rotation = Math.random() * 360

        const animate = () => {
            x += vx
            y += vy
            rotation += 12

            confetti.style.left = x + 'px'
            confetti.style.top = y + 'px'
            confetti.style.transform = `rotate(${rotation}deg)`
            confetti.style.opacity = Math.max(0, 1 - (y - startY) / 300)

            if (y < startY + 300) {
                requestAnimationFrame(animate)
            } else {
                confetti.remove()
            }
        }

        animate()
    }
}

nextBtn.addEventListener('click', createQuestion)

createQuestion()