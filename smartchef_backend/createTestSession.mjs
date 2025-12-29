// testFullFlow.js
import fetch from "node-fetch";

const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5NDAwYzEwN2FiYWI1MTQ3Y2NlMmUwZiIsImlhdCI6MTc2Njg3NjM3NSwiZXhwIjoxNzY3NDgxMTc1fQ.HQ7hZfdiHk-Y9JF3_xD-DLEClG3KBG8c-aKCAvJOtNc"; // substitua pelo token válido do seu usuário

async function createSession() {
  const res = await fetch("http://localhost:5000/api/recipe/session/start", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${TOKEN}`
    },
    body: JSON.stringify({
      recipeTitle: "Torta de Teste",
      fullRecipeData: { steps: [] } // receita inicial vazia só para criar a sessão
    })
  });

  const data = await res.json();
  console.log("Sessão criada:", data);
  return data.sessionId;
}

async function startCooking(sessionId) {
   const res = await fetch("http://localhost:5000/api/recipe/session/sendStepMessage", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${TOKEN}`
    },
    body: JSON.stringify({ sessionId, content: message })
  });

  const text = await res.text(); // pega o texto bruto
  try {
    const data = JSON.parse(text); // tenta converter em JSON
    console.log("Resposta do chef:", data);
    return data;
  } catch (err) {
    console.error("Erro ao parsear JSON:", text); // mostra o HTML retornado
    throw err;
  }

  const data = await res.json();
  console.log("Modo cozinha iniciado:", data);
  return data;
}

async function sendMessage(sessionId, message) {
   const res = await fetch("http://localhost:5000/api/recipe/session/sendStepMessage", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${TOKEN}`
    },
    body: JSON.stringify({ sessionId, content: message })
  });

  const text = await res.text(); // pega o texto bruto
  try {
    const data = JSON.parse(text); // tenta converter em JSON
    console.log("Resposta do chef:", data);
    return data;
  } catch (err) {
    console.error("Erro ao parsear JSON:", text); // mostra o HTML retornado
    throw err;
  }

  const data = await res.json();
  console.log("Resposta do chef:", data);
  return data;
}

async function runTest() {
  console.log("=== Iniciando teste completo ===");

  // 1️⃣ Criar sessão
  const sessionId = await createSession();

  // 2️⃣ Iniciar modo cozinha
  await startCooking(sessionId);

  // 3️⃣ Enviar ingredientes ou prato desejado
  const ingredients = "quero cozinhar uma torta com chocolate e frutas";
  const explorationResponse = await sendMessage(sessionId, ingredients);

  // 4️⃣ Escolher a primeira receita sugerida
  if (explorationResponse.options?.length > 0) {
    console.log("\n--- Escolhendo primeira receita ---");
    const firstRecipe = explorationResponse.options[0];
    const chooseResponse = await sendMessage(sessionId, firstRecipe.title);

    console.log("\n--- Início do passo a passo ---");
    if (chooseResponse.step) {
      console.log("Primeiro passo:", chooseResponse.step);
    }
  }

  console.log("\n✅ Teste completo finalizado!");
}

runTest().catch(err => console.error(err));
