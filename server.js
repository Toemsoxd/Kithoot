const express = require('express');
const Kahoot = require('kahoot.js-updated'); // Usamos la versión mantenida

const app = express();

app.use(express.json());
app.use(express.static('public'));

// Guardaremos la instancia activa de la sesión
let activeClient = null;

process.on('uncaughtException', (err) => {
    console.error('Error interno capturado:', err.message);
});

// Endpoint para unirte a la partida
app.post('/join', async (req, res) => {
    let { pin, name } = req.body;

    if (!pin || !name) {
        return res.status(400).json({ error: "Falta el PIN o el apodo" });
    }

    const numericPin = parseInt(pin, 10);
    if (isNaN(numericPin)) {
        return res.status(400).json({ error: "El PIN debe ser un número válido." });
    }

    try {
        // Creamos un cliente FRESCO para cada intento de conexión
        const client = new Kahoot();
        
        client.on("Disconnect", (reason) => {
            console.log("Desconectado de Kahoot:", reason);
        });

        client.on("QuestionStart", (question) => {
            console.log("¡Nueva pregunta iniciada!");
        });

        // Intentamos la conexión
        await client.join(numericPin, String(name));
        
        // Guardamos la sesión exitosa
        activeClient = client;

        console.log(`¡Bot '${name}' conectado con éxito al PIN ${numericPin}!`);
        res.json({ success: true, message: "¡Conectado exitosamente!" });

    } catch (err) {
        console.error("Error DETALLADO al unirse a Kahoot:", err);
        res.status(400).json({ 
            error: "No se pudo conectar a Kahoot. Revisa el PIN o los logs del servidor." 
        });
    }
});

// Endpoint para enviar la respuesta desde la tablet
app.post('/answer', (req, res) => {
    const { choice } = req.body;
    
    if (!activeClient) {
        return res.status(400).json({ error: "No hay ninguna sesión activa de Kahoot." });
    }

    try {
        if (activeClient.quiz && activeClient.quiz.currentQuestion) {
            activeClient.quiz.currentQuestion.answer(Number(choice));
            res.json({ success: true });
        } else {
            activeClient.answer(Number(choice));
            res.json({ success: true });
        }
    } catch (e) {
        console.error("Error al responder:", e.message);
        res.status(400).json({ error: "Error al enviar respuesta." });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Servidor Kithoot activo en el puerto ${PORT}`);
});
