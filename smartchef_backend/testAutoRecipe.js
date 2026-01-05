#!/usr/bin/env node
require("dotenv").config({ path: "./.env" });
const fs = require("fs").promises;
const path = require("path");
const fetch = require("node-fetch").default;

const TEST_CONFIG = {
  SERVER_URL: "http://localhost:5000",
  USER_TOKEN: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5NWJkNGIwMmYzMTdlMTg4OGRlMjFiOSIsImlhdCI6MTc2NzYyNjQ1NSwiZXhwIjoxNzY4MjMxMjU1fQ.lJ4Mjr83kZ9QiqYa8NYPr6kHT9jSvvWS8cmHqGDSEJc",
  TEST_IMAGE_PATH: path.join(__dirname, "..", "public", "cabrito-assado-no-forno.jpg")
};

console.log("🚀 Teste Auto-Recipe SmartChef");
console.log("📡 Servidor:", TEST_CONFIG.SERVER_URL);
console.log("🖼️  Imagem:", TEST_CONFIG.TEST_IMAGE_PATH);

async function testOptions() {
  console.log("\n📸 [1/4] POST /api/auto-recipe/options...");
  
  const imageBuffer = await fs.readFile(TEST_CONFIG.TEST_IMAGE_PATH);
  const imageBase64 = imageBuffer.toString("base64");
  
  // Manda como JSON com imagem em base64 (mais simples)
  const response = await fetch(`${TEST_CONFIG.SERVER_URL}/api/auto-recipe/options`, {
    method: "POST",
    headers: { 
      "Authorization": `Bearer ${TEST_CONFIG.USER_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ 
      imageBase64,
      imageName: "cabrito-assado-no-forno.jpg"
    })
  });
  
  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Erro ${response.status}: ${JSON.stringify(data)}`);
  }
  
  console.log("✅ 3 opções recebidas:", JSON.stringify(data, null, 2));
  return data.sessionId;
}

async function testSelect(sessionId) {
  console.log("\n🍳 [2/4] POST /api/auto-recipe/select...");
  const response = await fetch(`${TEST_CONFIG.SERVER_URL}/api/auto-recipe/select`, {
    method: "POST",
    headers: { 
      "Authorization": `Bearer ${TEST_CONFIG.USER_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ sessionId, choice: 1 })
  });
  
  const data = await response.json();
  if (!response.ok) throw new Error(`Erro ${response.status}: ${JSON.stringify(data)}`);
  console.log("✅ Receita gerada:", data.recipe?.title || data);
  return data;
}

async function testSteps(sessionId) {
  console.log("\n🚶 [3/4] POST /api/auto-recipe/step...");
  let stepCount = 0;
  while (stepCount < 10) {
    const response = await fetch(`${TEST_CONFIG.SERVER_URL}/api/auto-recipe/step`, {
      method: "POST",
      headers: { 
        "Authorization": `Bearer ${TEST_CONFIG.USER_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ sessionId })
    });
    
    const data = await response.json();
    if (!response.ok) {
      console.log("⚠️  Erro no passo:", data);
      break;
    }
    
    stepCount++;
    console.log(`✅ Passo ${stepCount}:`, data.step?.description?.slice(0, 50) + "...");
    
    if (data.message?.includes("concluída")) {
      console.log("🎉 Receita finalizada!");
      break;
    }
  }
}

async function runFullTest() {
  try {
    console.log("✅ Token válido. Iniciando...\n");
    const sessionId = await testOptions();
    await testSelect(sessionId);
    await testSteps(sessionId);
    console.log("\n🎊 TESTE CONCLUÍDO!");
  } catch (error) {
    console.error("💥 ERRO:", error.message);
  }
}

runFullTest();
