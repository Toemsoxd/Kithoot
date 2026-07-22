const express = require('express');
const { Client } = require('kahoot.js-updated');

const app = express();
const kahoot = new Client();

app.use(express.json());
app.use(express.static('public'));

let currentPin = null;

// Endpoint para unirte a la partida desde la tablet
app.post('/join', (req, res) => {
    const { pin, name } = req.body;
    
    kahoot.join(pin, name)
        .then(() => {
            currentPin = pin;
            res.json({ success: true, message: "¡Conectado exitosamente!" });
        })
        .catch(err => {
            res.status(400).json({ success: false, error: err.description || "Error al conectar" });
        });
});

// Listener de preguntas
kahoot.on("QuestionStart", (question) => {
    console.log("¡Nueva pregunta iniciada!");
});

// Endpoint para enviar respuesta
app.post('/answer', (req, res) => {
    const { choice } = req.body;
    
    try {
        if (kahoot.quiz && kahoot.quiz.currentQuestion) {
            kahoot.quiz.currentQuestion.answer(choice);
        } else {
            kahoot.answer(choice);
        }
        res.json({ success: true });
    } catch (e) {
        res.status(400).json({ error: "No hay pregunta activa o error al responder" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor Relay activo en el puerto ${PORT}`);
});