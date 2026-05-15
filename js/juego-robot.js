const operationText = document.getElementById('operation')
const answersContainer = document.getElementById('answers')
const scoreText = document.getElementById('score')
const message = document.getElementById('message')
const nextBtn = document.getElementById('nextBtn')
const robotText = document.getElementById('robotText')
const robotFace = document.getElementById('robotFace')

let score = 0
let correctAnswer = 0
let answered = false
let streak = 0

// ===== GENERADOR DE SONIDOS CON WEB AUDIO API =====
const audioContext = new (window.AudioContext || window.webkitAudioContext)()

function playSound(frequency, duration, type = 'sine', volume = 0.3) {
    const now = audioContext.currentTime
    const osc = audioContext.createOscillator()
    const gain = audioContext.createGain()

    osc.connect(gain)
    gain.connect(audioContext.destination)

    osc.type = type
    osc.frequency.value = frequency

    gain.gain.setValueAtTime(volume, now)
    gain.gain.exponentialRampToValueAtTime(0.01, now + duration)

    osc.start(now)
    osc.stop(now + duration)
}

function playSuccessSound() {
    // Notas ascendentes: DO-RE-MI (C-D-E)
    const notes = [262, 294, 330] // Frecuencias en Hz
    notes.forEach((freq, i) => {
        setTimeout(() => playSound(freq, 0.15, 'sine', 0.4), i * 100)
    })
}

function playErrorSound() {
    // Sonido "boing" divertido
    playSound(400, 0.1, 'sine', 0.4)
    playSound(300, 0.15, 'sine', 0.3)
}

function playStreakSound() {
    // Sonido de racha: "ding ding"
    const dingDing = [523, 523] // Notas altas
    dingDing.forEach((freq, i) => {
        setTimeout(() => playSound(freq, 0.1, 'sine', 0.35), i * 150)
    })
}

function playVictorySound() {
    // Sonido épico de victoria
    const victoryNotes = [330, 330, 392, 440, 494, 523, 587]
    victoryNotes.forEach((freq, i) => {
        setTimeout(() => playSound(freq, 0.1, 'sine', 0.3), i * 80)
    })
}

function playBubbleSound() {
    const bubbleAudio = document.getElementById('bubbleSound')
    bubbleAudio.volume = 0.15
    bubbleAudio.currentTime = 0
    bubbleAudio.play().catch(() => {})
}

// ===== GENERADOR DE GOTAS DE AGUA =====
function createConfetti() {
    const sizes = [25, 35, 45, 55, 65, 80]

    for (let i = 0; i < 30; i++) {
        const bubble = document.createElement('div')
        bubble.classList.add('bubble')

        const size = sizes[Math.floor(Math.random() * sizes.length)]
        bubble.style.width = size + 'px'
        bubble.style.height = size + 'px'

        const startX = Math.random() * window.innerWidth
        bubble.style.left = startX + 'px'
        bubble.style.top = '-100px'

        // Drift más variado para más dispersión
        const drift = (Math.random() - 0.5) * 300
        bubble.style.setProperty('--drift', drift + 'px')

        // Rotación al caer
        const rotate = Math.random() * 720 - 360
        bubble.style.setProperty('--rotate', rotate + 'deg')

        const delay = Math.random() * 0.8
        bubble.style.animationDelay = delay + 's'

        const duration = 5 + Math.random() * 2.5
        bubble.style.setProperty('--duration', duration + 's')
        bubble.style.animationDuration = duration + 's'

        document.body.appendChild(bubble)

        // Sonido de burbuja cuando comienza a caer
        const delayMs = delay * 1000
        setTimeout(() => {
            playBubbleSound()
        }, delayMs)

        const totalTime = (duration + delay) * 1000
        setTimeout(() => {
            bubble.remove()
        }, totalTime)
    }
}

// ===== EFECTO DE FLASH =====
function createFlash() {
    const flash = document.createElement('div')
    flash.classList.add('flash-bg')
    document.querySelector('.game').appendChild(flash)

    setTimeout(() => flash.remove(), 500)
}

// ===== BADGE DE RACHA =====
function showStreakBadge(streakNumber) {
    const badge = document.createElement('div')
    badge.classList.add('streak-badge')
    badge.textContent = `🔥 ${streakNumber}`

    document.querySelector('.game').appendChild(badge)

    setTimeout(() => badge.remove(), 800)
}

// ===== NÚMEROS ANIMADOS DE PUNTOS =====
function showFloatingPoints(points) {
    // Flash suave primero
    const flash = document.createElement('div')
    flash.classList.add('flash-bg')
    document.body.appendChild(flash)

    // Número flotante
    const floatingText = document.createElement('div')
    floatingText.style.position = 'fixed'
    floatingText.style.top = '50%'
    floatingText.style.left = '50%'
    floatingText.style.transform = 'translate(-50%, -50%)'
    floatingText.style.fontSize = '4.5rem'
    floatingText.style.fontWeight = '900'
    floatingText.style.color = '#FFD700'
    floatingText.style.pointerEvents = 'none'
    floatingText.style.zIndex = '997'
    floatingText.style.textShadow = '0 0 30px rgba(255, 215, 0, 1), 0 0 60px rgba(255, 165, 0, 0.8), 0 4px 15px rgba(0, 0, 0, 0.4)'
    floatingText.style.letterSpacing = '2px'
    floatingText.textContent = `+${points} ⭐`
    floatingText.style.animation = 'floatingPoints 2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards'

    document.body.appendChild(floatingText)

    const style = document.createElement('style')
    style.textContent = `
        @keyframes floatingPoints {
            0% {
                transform: translate(-50%, -50%) scale(0.2) rotate(-30deg);
                opacity: 0;
                filter: brightness(1.5);
            }
            20% {
                opacity: 1;
                transform: translate(-50%, -50%) scale(1.2) rotate(0deg);
            }
            80% {
                opacity: 1;
                transform: translate(-50%, -180%) scale(1.3) rotate(20deg);
                filter: brightness(1);
            }
            100% {
                transform: translate(-50%, -320%) scale(1.8) rotate(360deg);
                opacity: 0;
                filter: brightness(0.8);
            }
        }
    `
    document.head.appendChild(style)

    setTimeout(() => {
        floatingText.remove()
        flash.remove()
    }, 2000)
}

function randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

function shuffle(array) {
    return array.sort(() => Math.random() - 0.5)
}

function createQuestion() {
    answered = false
    nextBtn.classList.remove('show')
    answersContainer.innerHTML = ''

    robotFace.textContent = '🤖'
    robotText.textContent = 'Necesito tu ayuda 💜'
    message.textContent = 'Toca la respuesta correcta 😊'

    const table = randomNumber(2, 6)
    const multiplier = randomNumber(1, 10)

    correctAnswer = table * multiplier
    operationText.textContent = `${table} × ${multiplier} = ?`

    let answers = [correctAnswer]

    while (answers.length < 4) {
        const wrong = correctAnswer + randomNumber(-10, 10)

        if (wrong > 0 && wrong !== correctAnswer && !answers.includes(wrong)) {
            answers.push(wrong)
        }
    }

    answers = shuffle(answers)

    answers.forEach(answer => {
        const button = document.createElement('button')

        button.classList.add('answer-btn')
        button.textContent = answer

        button.addEventListener('mouseenter', () => {
            if (!answered) {
                button.classList.add('glowing')
                setTimeout(() => button.classList.remove('glowing'), 300)
            }
        })

        button.addEventListener('click', () => checkAnswer(button, answer))

        answersContainer.appendChild(button)
    })
}

function checkAnswer(button, answer) {
    if (answered) return

    if (answer === correctAnswer) {
        answered = true
        streak++

        const pointsEarned = 10 + (streak > 1 ? streak * 5 : 0)
        score += pointsEarned
        scoreText.textContent = score

        button.classList.add('correct')
        robotFace.classList.add('robot-celebrate')

        // Variedad de expresiones
        const celebrations = [
            { face: '🥳', text: '¡Increíble! Eres un genio ⭐' },
            { face: '🎉', text: '¡Perfecto! Eres el mejor 🌟' },
            { face: '😍', text: '¡Excelente! Gracias amigo 💜' },
            { face: '🚀', text: '¡Volando alto! Muy bien 🎯' }
        ]

        const celebration = celebrations[Math.floor(Math.random() * celebrations.length)]
        robotFace.textContent = celebration.face
        robotText.textContent = celebration.text
        message.textContent = '🎊 ¡Excelente trabajo!'

        playSuccessSound()
        createFlash()
        createConfetti()
        showFloatingPoints(pointsEarned)
        createHappyStars()

        // Mostrar racha cada 3 aciertos
        if (streak % 3 === 0 && streak > 0) {
            playStreakSound()
            showStreakBadge(streak)
        }

        // Victory al llegar a ciertos puntos
        if (streak === 5) {
            playVictorySound()
        }

        setTimeout(() => {
            robotFace.classList.remove('robot-celebrate')
        }, 800)

        nextBtn.classList.add('show')
    } else {
        button.classList.add('wrong')
        streak = 0 // Reiniciar racha con error

        robotFace.textContent = '😅'
        robotText.textContent = 'Casi... intentemos otra vez'
        message.textContent = '💜 Tú puedes, prueba otra respuesta'

        playErrorSound()
        createSadParticles()

        setTimeout(() => {
            button.classList.remove('wrong')
            robotFace.textContent = '🤖'
            robotText.textContent = 'Necesito tu ayuda 💜'
        }, 700)
    }
}

function createHappyStars() {
    const card = document.querySelector('.robot-card')
    const rect = card.getBoundingClientRect()
    const gameRect = document.querySelector('.game').getBoundingClientRect()

    for (let i = 0; i < 22; i++) {
        const star = document.createElement('span')
        star.classList.add('happy-star')

        star.style.left = `${rect.left - gameRect.left + rect.width / 2}px`
        star.style.top = `${rect.top - gameRect.top + rect.height / 2}px`

        star.style.setProperty('--x', `${Math.random() * 280 - 140}px`)
        star.style.setProperty('--y', `${Math.random() * 280 - 140}px`)

        document.querySelector('.game').appendChild(star)

        setTimeout(() => {
            star.remove()
        }, 900)
    }
}

function createSadParticles() {
    const card = document.querySelector('.robot-card')
    const rect = card.getBoundingClientRect()
    const gameRect = document.querySelector('.game').getBoundingClientRect()

    for (let i = 0; i < 14; i++) {
        const particle = document.createElement('span')
        particle.classList.add('sad-particle')

        particle.style.left = `${rect.left - gameRect.left + rect.width / 2}px`
        particle.style.top = `${rect.top - gameRect.top + rect.height / 2}px`

        particle.style.setProperty('--x', `${Math.random() * 200 - 100}px`)
        particle.style.setProperty('--y', `${Math.random() * 200 - 100}px`)

        document.querySelector('.game').appendChild(particle)

        setTimeout(() => {
            particle.remove()
        }, 900)
    }
}

nextBtn.addEventListener('click', createQuestion)

createQuestion()
