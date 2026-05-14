let tablaSeleccionada = 2;
let numeroAleatorio = 1;
let respuestaCorrecta = 0;
let puntaje = 0;

function iniciarJuego() {
    tablaSeleccionada = parseInt(document.getElementById("tabla").value);

    document.getElementById("mensajeIA").textContent =
        "Muy bien, vamos a practicar la tabla del " + tablaSeleccionada;

    document.getElementById("resultado").textContent = "";

    generarPregunta();

    hablar("Hola, soy TabliBot. Vamos a practicar la tabla del " + tablaSeleccionada, 0.75);
}

function generarPregunta() {
    numeroAleatorio = Math.floor(Math.random() * 10) + 1;
    respuestaCorrecta = tablaSeleccionada * numeroAleatorio;

    document.getElementById("pregunta").textContent =
        tablaSeleccionada + " × " + numeroAleatorio + " = ?";

    generarOpciones();
}

function generarOpciones() {
    const opcionesDiv = document.getElementById("opciones");
    opcionesDiv.innerHTML = "";

    let opciones = [respuestaCorrecta];

    while (opciones.length < 4) {
        let opcion = Math.floor(Math.random() * 90) + 1;

        if (!opciones.includes(opcion)) {
            opciones.push(opcion);
        }
    }

    opciones.sort(() => Math.random() - 0.5);

    opciones.forEach(opcion => {
        const boton = document.createElement("button");
        boton.textContent = opcion;
        boton.onclick = () => validarRespuesta(opcion);
        opcionesDiv.appendChild(boton);
    });
}

function validarRespuesta(opcion) {
    const resultado = document.getElementById("resultado");

    if (opcion === respuestaCorrecta) {
        puntaje++;

        resultado.textContent = "¡Es correcto!";
        resultado.style.color = "green";

        document.getElementById("mensajeIA").textContent =
            "¡Es correcto! Muy bien, la respuesta es " + respuestaCorrecta + ".";

        document.getElementById("puntaje").textContent = puntaje;

        hablar("¡Es correcto! Muy bien, la respuesta es " + respuestaCorrecta + ".", 0.75);

        setTimeout(generarPregunta, 1800);
    } else {
        resultado.textContent = "Casi lo logras. Inténtalo otra vez.";
        resultado.style.color = "orange";

        document.getElementById("mensajeIA").textContent =
            "Pista: suma " + tablaSeleccionada + " varias veces hasta llegar al resultado.";

        hablar(
            "Casi lo logras. Vamos a pensarlo juntos. " +
            tablaSeleccionada + " por " + numeroAleatorio +
            " significa sumar " + tablaSeleccionada +
            " un total de " + numeroAleatorio + " veces.",
            0.75
        );
    }
}

function hablar(texto, velocidad = 0.75) {
    speechSynthesis.cancel();

    const voz = new SpeechSynthesisUtterance(texto);
    voz.lang = "es-ES";
    voz.rate = velocidad;
    voz.pitch = 1;
    voz.volume = 1;

    speechSynthesis.speak(voz);
}

function explicarConVoz() {
    let explicacion =
        "Vamos a resolverlo paso a paso. " +
        tablaSeleccionada + " por " + numeroAleatorio +
        " significa sumar " + tablaSeleccionada +
        " un total de " + numeroAleatorio + " veces. ";

    let suma = "";

    for (let i = 1; i <= numeroAleatorio; i++) {
        suma += tablaSeleccionada;

        if (i < numeroAleatorio) {
            suma += " más ";
        }
    }

    explicacion +=
        "Por ejemplo: " + suma + ". " +
        "Piensa que tienes " + numeroAleatorio +
        " grupos, y en cada grupo hay " + tablaSeleccionada +
        " objetos. " +
        "Ahora mira las opciones y escoge la respuesta correcta.";

    document.getElementById("mensajeIA").textContent = explicacion;
    hablar(explicacion, 0.7);
}