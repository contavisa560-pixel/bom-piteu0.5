const fs = require("fs");
const ai = require("../utils/openaiWrapper"); // ajuste o caminho conforme sua pasta

async function extrairReceita(imagePath) {
    try {
        const imageData = fs.readFileSync(imagePath, { encoding: 'base64' });

        const response = await ai.chat.completions.create({
            model: "gpt-4o", 
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: "Analise esta imagem. Se for uma receita, extraia: title, ingredients (array), steps (array). Se não for, retorne um objeto vazio. Retorne em JSON." },
                        { type: "image_url", image_url: { url: `data:image/jpeg;base64,${imageData}` } }
                    ],
                },
            ],
            response_format: { type: "json_object" }
        });

        return JSON.parse(response.choices[0].message.content);
    } catch (error) {
        console.error("Erro no OCR:", error);
        return null;
    }
}

module.exports = { extrairReceita };