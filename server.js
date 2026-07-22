const express = require('express');
const Kahoot = require('kahoot.js-latest');

const app = express();
// Se recomienda instanciar un cliente por usuario/sesión si se van a conectar múltiples bots
const client = new Kahoot();

app.use(express.json());
app.use(express.static('public'));

// Prevenir caídas por errores no capturados en el proceso
process.on('uncaughtException', (err) => {
    console.error('Error interno capturado:', err.message);
});

// Listener de errores globales del cliente de Kahoot
client.on("Disconnect", (reason) => {
    console.log("Desconectado de Kahoot:", reason);
});

// Endpoint para unirte a la partida
app.post('/join', async (req, res) => {
    let { pin, name } = req.body;

    if (!pin || !name) {
        return res.status(400).json({ error: "Falta el PIN o el apodo" });
    }

    // Asegurar que el PIN sea un número entero válido
    const numericPin = parseInt(pin, 10);
    if (isNaN(numericPin)) {
        return res.status(400).json({ error: "El PIN debe ser un número válido." });
    }

    try {
        await client.join(numericPin, String(name));
        res.json({ success: true, message: "¡Conectado exitosamente!" });
    } catch (err) {
        console.error("Error al unirse a Kahoot:", err);
        res.status(400).json({ 
            error: "No se pudo conectar a Kahoot. Revisa que el PIN sea correcto y que la partida esté abierta." 
        });
    }
});

// Listener cuando empieza una pregunta
client.on("QuestionStart", (question) => {
    console.log("¡Nueva pregunta iniciada!");
});

// Endpoint para enviar la respuesta desde la tablet
app.post('/answer', (req, res) => {
    const { choice } = req.body;
    
    try {
        if (client.quiz && client.quiz.currentQuestion) {
            client.quiz.currentQuestion.answer(Number(choice));
            res.json({ success: true });
        } else {
            // Intento de envío directo a la pregunta activa
            client.answer(Number(choice));
            res.json({ success: true });
        }
    } catch (e) {
        console.error("Error al responder:", e.message);
        res.status(400).json({ error: "No hay pregunta activa o error al responder" });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Servidor Kithoot activo en el puerto ${PORT}`);
});
