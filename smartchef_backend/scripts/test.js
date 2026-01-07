
require('dotenv').config();
const OpenAI = require('openai');

console.log('🔑 TEXT_KEY existe?', !!process.env.OPENAI_TEXT_KEY);
console.log('🔑 VISION_KEY existe?', !!process.env.OPENAI_VISION_KEY);

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_TEXT_KEY || process.env.OPENAI_API_KEY 
});

async function test() {
  try {
    console.log('🧪 Testando OpenAI...');
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: "teste" }]
    });
    console.log('✅ CHAVE FUNCIONA!');
    console.log('📄 Resposta:', response.choices[0].message.content);
  } catch (error) {
    console.log('❌ ERRO EXATO:', error.message);
    console.log('❌ Status:', error.status);
  }
}
test();

