const operationText = document.getElementById('operation')
const rocket = document.getElementById('rocket')
const gameArea = document.getElementById('gameArea')
const scoreText = document.getElementById('score')
const message = document.getElementById('message')
const livesText = document.getElementById('lives')
const timerText = document.getElementById('timer')

const successSound = document.getElementById('successSound')
const wrongSound = document.getElementById('wrongSound')

let score = 0
let correctAnswer = 0
let rocketX = 50
let isPlaying = true
let lives = 3
let gameTime = 0
let gameStartTime = Date.now()

const fallingNumbers = []
const NUM_FALLING = 3
const INCORRECT_SPEED_MULTIPLIER = 1.6

function randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

function updateLivesDisplay() {
    const hearts = '❤️'.repeat(lives)
    livesText.textContent = hearts
}

function showGameOver() {
    isPlaying = false

    const gameOverDiv = document.createElement('div')
    gameOverDiv.classList.add('game-over')
    gameOverDiv.innerHTML = `
        <div class="game-over-content">
            <h2>¡GAME OVER! 😢</h2>
            <div class="game-over-stats">
                <p>Puntaje Final</p>
                <span>${score}</span>
                <p style="margin-top: 15px; font-size: 0.95rem;">Tiempo jugado: ${gameTime}s</p>
            </div>
            <button class="game-over-button" onclick="location.reload()">Jugar de Nuevo</button>
        </div>
    `
    document.body.appendChild(gameOverDiv)
}

function createFallingNumber() {
    const options = [
        correctAnswer,
        correctAnswer + randomNumber(1, 8),
        correctAnswer - randomNumber(1, 6)
    ].filter(n => n > 0)

    const value = options[randomNumber(0, options.length - 1)]
    const isCorrect = value === correctAnswer

    const element = document.createElement('div')
    element.classList.add('falling-number')
    if (isCorrect) {
        element.classList.add('correct')
    } else {
        element.classList.add('incorrect')
    }
    element.textContent = value

    const positions = [20, 50, 80]
    const randomPos = positions[randomNumber(0, 2)]
    const startX = randomPos
    const floatDirection = Math.random() > 0.5 ? 1 : -1
    const floatAmount = randomNumber(5, 12)

    element.style.left = `${randomPos}%`
    element.style.top = '-70px'
    gameArea.appendChild(element)

    const numberObj = {
        value,
        isCorrect,
        element,
        top: -70,
        caught: false,
        shot: false,
        startX,
        floatDirection,
        floatAmount,
        timeOffset: randomNumber(0, 1000)
    }

    if (!isCorrect) {
        element.addEventListener('touchstart', (e) => {
            e.preventDefault()
            e.stopPropagation()
            if (!numberObj.shot && !numberObj.caught) {
                shootNumber(numberObj)
            }
        }, false)
    }

    fallingNumbers.push(numberObj)
}

function shootNumber(numberObj) {
    numberObj.shot = true

    const numberRect = numberObj.element.getBoundingClientRect()
    const rocketRect = rocket.getBoundingClientRect()
    const areaRect = gameArea.getBoundingClientRect()

    const startX = rocketRect.left - areaRect.left + rocketRect.width / 2
    const startY = rocketRect.top - areaRect.top + rocketRect.height / 2
    const endX = numberRect.left - areaRect.left + numberRect.width / 2
    const endY = numberRect.top - areaRect.top + numberRect.height / 2

    const bullet = document.createElement('div')
    bullet.classList.add('bullet')

    const distance = Math.hypot(endX - startX, endY - startY)
    const duration = Math.max(0.2, distance / 600)

    bullet.style.setProperty('--startX', `${startX}px`)
    bullet.style.setProperty('--startY', `${startY}px`)
    bullet.style.setProperty('--endX', `${endX}px`)
    bullet.style.setProperty('--endY', `${endY}px`)
    bullet.style.setProperty('--duration', `${duration}s`)

    gameArea.appendChild(bullet)

    setTimeout(() => {
        bullet.remove()
        destroyNumber(numberObj)
    }, duration * 1000)

    successSound.currentTime = 0
    successSound.play()

    createExplosion(numberObj)

    score += 5
    scoreText.textContent = score
    message.textContent = '¡Excelente disparo! 💥'
}

function destroyNumber(numberObj) {
    numberObj.caught = true
    numberObj.element.classList.add('fadeOut')

    setTimeout(() => {
        if (numberObj.element.parentNode) {
            numberObj.element.remove()
        }
        fallingNumbers.splice(fallingNumbers.indexOf(numberObj), 1)
    }, 300)
}

function moveRocket(clientX) {
    const areaRect = gameArea.getBoundingClientRect()
    const x = clientX - areaRect.left

    let percent = (x / areaRect.width) * 100

    if (percent < 12) percent = 12
    if (percent > 88) percent = 88

    rocketX = percent
    rocket.style.left = `${rocketX}%`
}

gameArea.addEventListener('mousemove', (e) => {
    moveRocket(e.clientX)
})

gameArea.addEventListener('touchmove', (e) => {
    moveRocket(e.touches[0].clientX)
})

function checkCollisionWithNumber(num) {
    const numberRect = num.element.getBoundingClientRect()
    const rocketRect = rocket.getBoundingClientRect()

    return !(
        numberRect.bottom < rocketRect.top ||
        numberRect.top > rocketRect.bottom ||
        numberRect.right < rocketRect.left ||
        numberRect.left > rocketRect.right
    )
}

let gameLoopTime = 0

function getSpeedMultiplier() {
    const width = window.innerWidth
    if (width <= 360) return 0.6
    if (width <= 480) return 0.7
    if (width <= 768) return 0.8
    return 1
}

function gameLoop() {
    if (isPlaying) {
        const speedMultiplier = getSpeedMultiplier()
        const baseDifficulty = (0.5 + (score / 200) * 0.2) * speedMultiplier
        gameLoopTime += 16

        fallingNumbers.forEach((num, index) => {
            const difficulty = num.isCorrect ? baseDifficulty : baseDifficulty * INCORRECT_SPEED_MULTIPLIER

            if (!num.shot) {
                num.top += difficulty
            }

            const floatCycle = ((gameLoopTime + num.timeOffset) % 8000) / 8000
            const floatWave = Math.sin(floatCycle * Math.PI * 2) * num.floatAmount * num.floatDirection
            const currentX = num.startX + floatWave

            num.element.style.top = `${num.top}px`
            num.element.style.left = `${currentX}%`
            if (!num.shot) {
                num.element.style.transform = `translateX(-50%) rotate(${floatCycle * 360}deg)`
            }

            if (!num.caught && !num.shot && checkCollisionWithNumber(num)) {
                handleCatch(num)
            }

            if (num.top > gameArea.clientHeight) {
                if (!num.caught && !num.shot) {
                    if (num.isCorrect) {
                        lives--
                        updateLivesDisplay()
                        message.textContent = '😅 Se escapó el número correcto... 💜'
                        wrongSound.currentTime = 0
                        wrongSound.play()

                        if (lives <= 0) {
                            setTimeout(() => {
                                showGameOver()
                            }, 500)
                        }
                    } else {
                        message.textContent = '💪 Un número incorrecto escapó'
                    }
                }

                if (num.element.parentNode) {
                    num.element.remove()
                }
                fallingNumbers.splice(index, 1)
                createFallingNumber()
            }
        })

        if (fallingNumbers.length < NUM_FALLING) {
            createFallingNumber()
        }
    }

    requestAnimationFrame(gameLoop)
}

function handleCatch(num) {
    if (!isPlaying || !num.isCorrect) return

    num.caught = true
    score += 10
    scoreText.textContent = score
    message.textContent = '¡Excelente! Lo atrapaste ⭐'

    successSound.currentTime = 0
    successSound.play()

    createExplosion(num)

    setTimeout(() => {
        num.element.remove()
        fallingNumbers.splice(fallingNumbers.indexOf(num), 1)

        const table = randomNumber(2, 6)
        const multiplier = randomNumber(1, 10)
        correctAnswer = table * multiplier
        operationText.textContent = `${table} × ${multiplier}`
    }, 100)
}

function createExplosion(num) {
    const numberRect = num.element.getBoundingClientRect()
    const areaRect = gameArea.getBoundingClientRect()

    for (let i = 0; i < 16; i++) {
        const particle = document.createElement('span')
        particle.classList.add('explosion')

        particle.style.left = `${numberRect.left - areaRect.left + numberRect.width / 2}px`
        particle.style.top = `${numberRect.top - areaRect.top + numberRect.height / 2}px`

        particle.style.setProperty('--x', `${Math.random() * 240 - 120}px`)
        particle.style.setProperty('--y', `${Math.random() * 240 - 120}px`)

        gameArea.appendChild(particle)

        setTimeout(() => {
            particle.remove()
        }, 800)
    }
}

function createSadExplosion(num) {
    const rocketRect = rocket.getBoundingClientRect()
    const areaRect = gameArea.getBoundingClientRect()

    for (let i = 0; i < 12; i++) {
        const particle = document.createElement('span')
        particle.classList.add('sad-particle')

        particle.style.left =
            `${rocketRect.left - areaRect.left + rocketRect.width / 2}px`

        particle.style.top =
            `${rocketRect.top - areaRect.top + rocketRect.height / 2}px`

        particle.style.setProperty(
            '--x',
            `${Math.random() * 180 - 90}px`
        )

        particle.style.setProperty(
            '--y',
            `${Math.random() * 180 - 90}px`
        )

        gameArea.appendChild(particle)

        setTimeout(() => {
            particle.remove()
        }, 900)
    }
}

function initGame() {
    const table = randomNumber(2, 6)
    const multiplier = randomNumber(1, 10)
    correctAnswer = table * multiplier
    operationText.textContent = `${table} × ${multiplier}`

    updateLivesDisplay()

    for (let i = 0; i < NUM_FALLING; i++) {
        createFallingNumber()
    }
}

function startTimer() {
    setInterval(() => {
        if (isPlaying) {
            gameTime++
            timerText.textContent = gameTime
        }
    }, 1000)
}

initGame()
startTimer()
gameLoop()