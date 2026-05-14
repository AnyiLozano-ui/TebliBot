let tablaSeleccionada = 2
let numeroAleatorio = 1
let respuestaCorrecta = 0
let puntaje = 0

function iniciarJuego() {
    tablaSeleccionada = parseInt(document.getElementById('tabla').value)

    document.getElementById('mensajeIA').textContent =
        'Muy bien, vamos a practicar la tabla del ' + tablaSeleccionada

    document.getElementById('resultado').textContent = ''

    generarPregunta()

    hablar(
        'Hola, soy TabliBot. Vamos a practicar la tabla del ' +
        tablaSeleccionada + '. ' +
        'Intenta responder, y si necesitas ayuda, presiona el botón de explicarme por vos.',
        0.75,
    )
}

function generarPregunta() {
    numeroAleatorio = Math.floor(Math.random() * 10) + 1
    respuestaCorrecta = tablaSeleccionada * numeroAleatorio

    document.getElementById('pregunta').textContent =
        tablaSeleccionada + ' × ' + numeroAleatorio + ' = ?'

    generarOpciones()
}

function generarOpciones() {
    const opcionesDiv = document.getElementById('opciones')
    opcionesDiv.innerHTML = ''

    let opciones = [respuestaCorrecta]

    while (opciones.length < 4) {
        // Generar opciones cercanas a la respuesta correcta
        let variacion = (Math.floor(Math.random() * 20) - 10) * tablaSeleccionada
        let opcion = respuestaCorrecta + variacion

        // Asegurar que la opción sea positiva y diferente a las existentes
        if (opcion > 0 && !opciones.includes(opcion)) {
            opciones.push(opcion)
        }
    }

    opciones.sort(() => Math.random() - 0.5)

    opciones.forEach((opcion) => {
        const boton = document.createElement('button')
        boton.textContent = opcion
        boton.onclick = () => validarRespuesta(opcion)
        opcionesDiv.appendChild(boton)
    })
}

function validarRespuesta(opcion) {
    const resultado = document.getElementById('resultado')
    const botones = document.querySelectorAll('.opciones button')

    // Desactivar todos los botones mientras se procesa la respuesta
    botones.forEach(btn => btn.disabled = true)

    if (opcion === respuestaCorrecta) {
        puntaje++

        resultado.textContent = '¡Es correcto!'
        resultado.style.color = 'green'

        document.getElementById('mensajeIA').textContent =
            '¡Es correcto! Muy bien, la respuesta es ' + respuestaCorrecta + '.'

        document.getElementById('puntaje').textContent = puntaje

        // Resaltar el botón correcto
        botones.forEach(btn => {
            if (parseInt(btn.textContent) === respuestaCorrecta) {
                btn.style.background = '#22c55e'
                btn.style.transform = 'scale(1.1)'
            }
        })

        hablar(
            '¡Es correcto! Muy bien, la respuesta es ' +
            respuestaCorrecta +
            '.',
            0.75,
        )

        // Esperar a que termine el audio antes de cambiar de pregunta
        setTimeout(() => {
            botones.forEach(btn => {
                btn.style.background = ''
                btn.style.transform = ''
            })
            generarPregunta()
            botones.forEach(btn => btn.disabled = false)
        }, 4000)
    } else {
        resultado.textContent = 'Casi lo logras. Inténtalo otra vez.'
        resultado.style.color = 'orange'

        document.getElementById('mensajeIA').textContent =
            'Pista: suma ' +
            tablaSeleccionada +
            ' varias veces hasta llegar al resultado.'

        hablar(
            'Casi lo logras. Vamos a pensarlo juntos. ' +
            tablaSeleccionada +
            ' por ' +
            numeroAleatorio +
            ' significa sumar ' +
            tablaSeleccionada +
            ' un total de ' +
            numeroAleatorio +
            ' veces.',
            0.75,
        )

        // Re-habilitar los botones después del mensaje de error
        setTimeout(() => {
            botones.forEach(btn => btn.disabled = false)
        }, 3000)
    }
}

function hablar(texto, velocidad = 0.6) {

    speechSynthesis.cancel();

    const voz = new SpeechSynthesisUtterance(texto);

    voz.lang = "es-ES";
    voz.rate = velocidad;
    voz.pitch = 0.9;
    voz.volume = 1;

    const voces = speechSynthesis.getVoices();

    const vozSuave =
        voces.find(v => v.name.includes("Elvira")) ||
        voces.find(v => v.name.includes("Paulina")) ||
        voces.find(v => v.name.includes("Helena")) ||
        voces.find(v => v.lang.includes("es"));

    if (vozSuave) {
        voz.voice = vozSuave;
    }

    speechSynthesis.speak(voz);
}

function explicarConVoz() {
    let explicacion =
        'Vamos a resolver: ' + tablaSeleccionada + ' × ' + numeroAleatorio + ' es igual a ' + respuestaCorrecta + '. ' +
        'Ahora elige la respuesta correcta.'

    // Solo hablar, sin mostrar el texto en pantalla
    hablar(explicacion, 0.75)
}

