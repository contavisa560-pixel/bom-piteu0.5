const { callOpenAIText } = require("../services/openaiClients");

async function gerarReceitaAdaptada(profile, numberOfPeople = 1) {
    const alergias = profile.allergies?.length ? profile.allergies.join(", ") : "Nenhuma";
    const intolerancias = profile.intolerances?.length ? profile.intolerances.join(", ") : "Nenhuma";
    const observacoes = profile.healthObservations?.length ? profile.healthObservations.join(", ") : "Nenhuma";

    const promptBase = profile.type === "infantil"
        ? `Crie uma receita saudável, lúdica e atraente para uma criança de ${profile.age} anos.`
        : `Crie uma receita nutritiva, de fácil mastigação e digestão para um adulto sénior de ${profile.age} anos.`;

    const messages = [
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
    ];

    // ✅ Usando a função callOpenAIText já importada
    const recipeText = await callOpenAIText(messages, { response_format: { type: "json_object" } });
    return JSON.parse(recipeText);
}

module.exports = { gerarReceitaAdaptada };