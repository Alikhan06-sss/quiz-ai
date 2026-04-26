const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors()); // Это важно для работы с телефонами и облаком
app.use(express.json());

const OPENROUTER_API_KEY = "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";

app.post('/generate-quiz', async (req, res) => {
    try {
        const textContent = req.body.text || "";
        console.log("Запрос к Gemini Flash...");

        const response = await axios.post("https://openrouter.ai/api/v1/chat/completions", {
            model: "google/gemini-2.5-flash-lite", 
            messages: [{
                role: "user",
                content: `Создай тест из 15 вопросов по тексту. Верни ТОЛЬКО массив JSON. 
                Формат: [{"question": "текст", "options": ["1", "2", "3", "4"], "correct": 0}]
                Текст: ${textContent.substring(0, 10000)}`
            }]
        }, {
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "Content-Type": "application/json"
            }
        });

        let aiText = response.data.choices[0].message.content;
        const start = aiText.indexOf('[');
        const end = aiText.lastIndexOf(']') + 1;
        const cleanJson = aiText.substring(start, end);

        res.json(JSON.parse(cleanJson));
    } catch (error) {
        res.status(500).json({ error: "Ошибка ИИ" });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Сервер на порту ${PORT}`));
