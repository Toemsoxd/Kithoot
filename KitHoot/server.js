const express = require('express');
const Kahoot = require('kahoot.js-v2');

const app = express();
const client = new Kahoot();

app.use(express.json());
app.use(express.static('public'));

// Prevenir caídas por errores no capturados
process.on('uncaughtException', (err) => {
    console.error('Error interno capturado:', err.message);
});

// Endpoint para unirte a la partida
app.post('/join', (req, res) => {
    const { pin, name } = req.body;

    if (!pin || !name) {
        return res.status(400).json({ error: "Falta el PIN o el apodo" });
    }

    client.join(pin, name)
        .then(() => {
            res.json({ success: true, message: "¡Conectado exitosamente!" });
        })
        .catch(err => {
            console.error("Error al unirse:", err);
            res.status(400).json({ error: "No se pudo conectar a Kahoot. Revisa el PIN." });
        });
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
            client.quiz.currentQuestion.answer(choice);
            res.json({ success: true });
        } else {
            // Intento alternativo según estado
            client.answer(choice);
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
});            kahoot.quiz.currentQuestion.answer(choice);
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
