#!/usr/bin/env node
require("dotenv").config({ path: "../.env" });
const fs = require("fs").promises;
const path = require("path");
const fetch = require("node-fetch").default;
const FormData = require("form-data");

const TEST_CONFIG = {
    SERVER_URL: "http://localhost:5000",
    USER_TOKEN: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5NjdhOWQ3NDkxYzc1MGViMzliMGZjNiIsImlhdCI6MTc2ODQwMTM2OCwiZXhwIjoxNzY5MDA2MTY4fQ.PydsI5a65FSX9OAQqLVpINy9qCbVm1avM8u-FUqgu10",
    TEST_IMAGE_PATH: "C:/Users/Mauricio carruagem/bom-piteu0.5/public/Calde_de_Peixe_da_Ilha_.jpg"
};

console.log("🚀 Teste Auto-Recipe SmartChef (TEXTO + IMAGEM)");
console.log("📡 Servidor:", TEST_CONFIG.SERVER_URL);
console.log("🖼️  Imagem:", TEST_CONFIG.TEST_IMAGE_PATH);

// 🔥 TESTE 1: MODO TEXTO PURO
async function testTextOptions() {
    console.log("\n📝 [1/4] POST /api/auto-recipe/options (TEXTO PURO)...");

    const response = await fetch(`${TEST_CONFIG.SERVER_URL}/api/auto-recipe/options`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${TEST_CONFIG.USER_TOKEN}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            ingredients: "batata , ovo"
        })
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${JSON.stringify(data)}`);
    }

    console.log("✅ TEXTO → 3 opções:", data.options.map(o => o.title));
    console.log("📱 Session ID:", data.sessionId);
    console.log("🎨 Modo usado:", data.mode || "image");
    return data;
}

// 🔥 TESTE 2: MODO IMAGEM (ORIGINAL)
async function testImageOptions() {
    console.log("\n🖼️ [1/4] POST /api/auto-recipe/options (IMAGEM)...");

    try {
        const imageBuffer = await fs.readFile(TEST_CONFIG.TEST_IMAGE_PATH);

        const form = new FormData();
        form.append("image", imageBuffer, {
            filename: "cabrito-assado-no-forno.jpg",
            contentType: "image/jpeg",
        });

        const response = await fetch(`${TEST_CONFIG.SERVER_URL}/api/auto-recipe/options`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${TEST_CONFIG.USER_TOKEN}`,
                ...form.getHeaders(),
            },
            body: form,
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(`Erro ${response.status}: ${JSON.stringify(data)}`);
        }

        console.log("✅ IMAGEM → 3 opções:", data.options.map(o => o.title));
        return data;
    } catch (error) {
        console.error("❌ Erro testImageOptions:", error.message);
        throw error;
    }
}

// 🔥 SELECIONAR RECEITA (igual para ambos)
async function testSelect(sessionId) {
    console.log("\n🍳 [2/4] POST /api/auto-recipe/select...");

    const response = await fetch(`${TEST_CONFIG.SERVER_URL}/api/auto-recipe/select`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${TEST_CONFIG.USER_TOKEN}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ sessionId, choice: 1 }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(`Erro ${response.status}: ${JSON.stringify(data)}`);
    console.log("✅ Receita gerada:", data.recipe?.title || data);
    console.log("🖼️ Prato final:", data.finalImage?.slice(0, 60) + "...");
    return data;
}

// 🔥 PASSOS (igual para ambos)
async function testSteps(sessionId) {
    console.log("\n🚶 [3/4] TESTANDO PASSOS...");
    let stepCount = 0;
    
    while (stepCount < 10) {
        const response = await fetch(`${TEST_CONFIG.SERVER_URL}/api/auto-recipe/step`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${TEST_CONFIG.USER_TOKEN}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ sessionId }),
        });

        const data = await response.json();
        if (!response.ok) {
            console.log("⚠️ Erro no passo:", data);
            break;
        }

        stepCount++;
        console.log(`✅ Passo ${stepCount}:`, data.step?.description?.slice(0, 80) + "...");
        console.log("🖼️ Imagem:", data.step?.imageUrl?.slice(0, 60) + "...");

        if (data.message?.includes("concluída")) {
            console.log("🎉 Receita finalizada!");
            break;
        }
        
        // Pausa 1s entre passos
        await new Promise(r => setTimeout(r, 1000));
    }
}

// 🔥 TESTE COMPLETO: TEXTO PRIMEIRO
async function testTextMode() {
    console.log("\n" + "=".repeat(60));
    console.log("🔥 TESTANDO MODO TEXTO COMPLETO");
    console.log("=".repeat(60));
    
    const textResult = await testTextOptions();
    await testSelect(textResult.sessionId);
    await testSteps(textResult.sessionId);
    console.log("\n✅ MODO TEXTO CONCLUÍDO!\n");
}

// 🔥 TESTE COMPLETO: IMAGEM DEPOIS
async function testImageMode() {
    console.log("\n" + "=".repeat(60));
    console.log("🔥 TESTANDO MODO IMAGEM COMPLETO");
    console.log("=".repeat(60));
    
    const imageResult = await testImageOptions();
    await testSelect(imageResult.sessionId);
    await testSteps(imageResult.sessionId);
    console.log("\n✅ MODO IMAGEM CONCLUÍDO!\n");
}

// 🔥 EXECUÇÃO PRINCIPAL
async function runFullTest() {
    try {
        console.log("🚀 Iniciando testes duplos...\n");
        
        // 1. TEXTO PRIMEIRO
        await testTextMode();
        
        // 2. IMAGEM DEPOIS  
        await testImageMode();
        
        console.log("\n🎊 AMBOS MODOS FUNCIONAM 100%!");
        console.log("📝 TEXTO + 👁️ VISION = ✅ OK");
        
    } catch (error) {
        console.error("💥 ERRO TOTAL:", error.message);
        process.exit(1);
    }
}

runFullTest();
