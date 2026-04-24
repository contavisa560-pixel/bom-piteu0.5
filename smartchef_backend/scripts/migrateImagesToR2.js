// scripts/migrateImagesToR2.js
const mongoose = require('mongoose');
const RecipeSession = require('../models/RecipeSession');
const storageService = require('../services/storageService');
require('dotenv').config();

async function migrateImages() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Conectado ao MongoDB');

        // Busca todas as RecipeSessions com imagens da OpenAI
        const sessions = await RecipeSession.find({
            $or: [
                { recipeFinalImage: { $regex: 'oaidalleapiprodscus', $options: 'i' } },
                { 'selectedRecipe.steps.imageUrl': { $regex: 'oaidalleapiprodscus', $options: 'i' } }
            ]
        });

        console.log(`📊 Encontradas ${sessions.length} sessões com imagens OpenAI`);

        let migratedCount = 0;
        let errorCount = 0;

        for (const session of sessions) {
            try {
                console.log(`\n🔍 Processando: ${session.selectedRecipe?.title || session._id}`);

                // 1. Migrar imagem final
                if (session.recipeFinalImage && session.recipeFinalImage.includes('oaidalleapiprodscus')) {
                    console.log(`  💾 Migrando imagem final...`);
                    const newUrl = await storageService.ensurePermanentImageUrl(
                        session.recipeFinalImage,
                        session.selectedRecipe?.title || 'Receita',
                        'final-dish'
                    );

                    if (newUrl && !newUrl.includes('oaidalleapiprodscus')) {
                        session.recipeFinalImage = newUrl;
                        console.log(`    ✅ Nova URL: ${newUrl.substring(0, 80)}...`);
                        migratedCount++;
                    }
                }

                // 2. Migrar imagens dos passos
                if (session.selectedRecipe?.steps) {
                    for (let i = 0; i < session.selectedRecipe.steps.length; i++) {
                        const step = session.selectedRecipe.steps[i];
                        if (step.imageUrl && step.imageUrl.includes('oaidalleapiprodscus')) {
                            console.log(`  💾 Migrando passo ${step.stepNumber}...`);
                            const newUrl = await storageService.ensurePermanentImageUrl(
                                step.imageUrl,
                                `${session.selectedRecipe.title} - Passo ${step.stepNumber}`,
                                'step'
                            );

                            if (newUrl && !newUrl.includes('oaidalleapiprodscus')) {
                                session.selectedRecipe.steps[i].imageUrl = newUrl;
                                console.log(`    ✅ Nova URL: ${newUrl.substring(0, 80)}...`);
                                migratedCount++;
                            }
                        }
                    }
                }

                // Salva as alterações
                await session.save();
                console.log(`  ✅ Sessão atualizada!`);

            } catch (err) {
                errorCount++;
                console.error(`  ❌ Erro na sessão ${session._id}:`, err.message);
            }
        }

        console.log(`\n🎉 MIGRAÇÃO COMPLETA!`);
        console.log(`✅ Imagens migradas: ${migratedCount}`);
        console.log(`❌ Erros: ${errorCount}`);
        console.log(`📊 Total de sessões processadas: ${sessions.length}`);

        mongoose.disconnect();

    } catch (error) {
        console.error('❌ Erro geral:', error);
        process.exit(1);
    }
}

// Executa se chamado diretamente
if (require.main === module) {
    migrateImages();
}

module.exports = { migrateImages };