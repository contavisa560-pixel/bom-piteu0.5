
const ai = require("../utils/openaiWrapper");

async function gerarReceitaAdaptada(profile, numberOfPeople = 1) {
    // Garante que as listas existam antes de dar join
    const alergias = profile.allergies?.length ? profile.allergies.join(", ") : "Nenhuma";
    const intolerancias = profile.intolerances?.length ? profile.intolerances.join(", ") : "Nenhuma";
    const observacoes = profile.healthObservations?.length ? profile.healthObservations.join(", ") : "Nenhuma";

    const promptBase = profile.type === "infantil" 
        ? `Crie uma receita saudável, lúdica e atraente para uma criança de ${profile.age} anos.`
        : `Crie uma receita nutritiva, de fácil mastigação e digestão para um adulto sénior de ${profile.age} anos.`;

    const response = await ai.chat.completions.create({
        messages: [
            {
                role: "system",
                content: `Você é um nutricionista e chef especializado em alimentação ${profile.type}. Responda apenas com JSON estruturado.`
            },
            {
                role: "user",
                content: `${promptBase} 
                Restrições: Alergias (${alergias}), Intolerâncias (${intolerancias}), Condições de saúde (${observacoes}). 
                País de origem: ${profile.country || "Geral"}.
                Ajuste as quantidades para exatamente ${numberOfPeople} pessoa(s). 
                Retorne no formato: { "title": "", "ingredients": [], "steps": [] }`
            }
        ],
        response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content);
}

module.exports = { gerarReceitaAdaptada };