import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Gera um PDF profissional com imagens reais
 */
export const generateRecipePDF = async (recipeData, messages, ratingInfo, userName) => {
    // Criar documento
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    // Cores
    const laranja = [249, 115, 22];
    const verde = [16, 185, 129];
    const cinza = [51, 51, 51];

    // ===== CAPA =====
    doc.setFillColor(...laranja);
    doc.rect(0, 0, 210, 297, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(36);
    doc.setFont('helvetica', 'bold');

    // Título da receita
    const titulo = recipeData?.title || 'Minha Receita';
    const tituloLines = doc.splitTextToSize(titulo, 150);
    let yPos = 80;
    tituloLines.forEach(line => {
        doc.text(line, 105, yPos, { align: 'center' });
        yPos += 15;
    });

    // Subtítulo
    doc.setFontSize(16);
    doc.setFont('helvetica', 'normal');
    doc.text('Receita Bom Piteu!', 105, yPos + 10, { align: 'center' });

    // Data e chef
    doc.setFontSize(12);
    doc.text(new Date().toLocaleDateString('pt-PT'), 105, 250, { align: 'center' });
    doc.text(`Chef: ${userName || 'Bom Pitéu'}`, 105, 260, { align: 'center' });

    // ===== PÁGINA 2 - INFORMAÇÕES =====
    doc.addPage();

    // Título da página
    doc.setTextColor(...laranja);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('DETALHES DA RECEITA', 105, 20, { align: 'center' });

    // Informações rápidas
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(20, 30, 170, 30, 3, 3, 'F');

    doc.setTextColor(...cinza);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');

    const tempo = recipeData?.time || ratingInfo?.cookingTime || '30 min';
    const dificuldade = recipeData?.difficulty || ratingInfo?.difficulty || 'Média';

    doc.text(` Tempo: ${tempo}`, 30, 45);
    doc.text(` Dificuldade: ${dificuldade}`, 120, 45);

    // Avaliação (se existir)
    if (ratingInfo?.rating) {
        doc.setTextColor(...verde);
        doc.setFontSize(14);
        doc.text(` Avaliação: ${ratingInfo.rating}/5`, 30, 70);
        if (ratingInfo.feedback) {
            doc.setFontSize(11);
            doc.setTextColor(...cinza);
            doc.text(`"${ratingInfo.feedback}"`, 30, 80);
        }
    }

    // ===== INGREDIENTES =====
    doc.setTextColor(...laranja);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('INGREDIENTES', 20, 100);

    const ingredientes = recipeData?.ingredients || ratingInfo?.ingredientsUsed || [];

    doc.setTextColor(...cinza);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');

    let yIng = 110;
    ingredientes.forEach((ing, i) => {
        doc.text(`• ${ing}`, 25, yIng + (i * 7));
    });

    // ===== IMAGEM FINAL (se existir) =====
    const finalImage = messages.find(m => m.type === 'recipe-completed')?.finalImage;

    if (finalImage) {
        try {
            doc.addPage();
            doc.setTextColor(...laranja);
            doc.setFontSize(20);
            doc.text('PRATO FINAL', 105, 20, { align: 'center' });

            // Tentar carregar a imagem real
            try {
                const img = new Image();
                img.crossOrigin = 'Anonymous';

                const imgPromise = new Promise((resolve, reject) => {
                    img.onload = () => {
                        try {
                            const canvas = document.createElement('canvas');
                            canvas.width = img.width;
                            canvas.height = img.height;
                            const ctx = canvas.getContext('2d');
                            ctx.drawImage(img, 0, 0);
                            const imgData = canvas.toDataURL('image/jpeg', 0.8);
                            doc.addImage(imgData, 'JPEG', 30, 40, 150, 100);
                            resolve();
                        } catch (e) {
                            reject(e);
                        }
                    };
                    img.onerror = reject;
                    img.src = finalImage;
                });

                await imgPromise;
            } catch (imgErr) {
                console.log('Erro ao carregar imagem final:', imgErr);
                // Placeholder elegante
                doc.setFillColor(245, 245, 245);
                doc.roundedRect(30, 40, 150, 100, 5, 5, 'F');
                doc.setDrawColor(...laranja);
                doc.setLineWidth(0.5);
                doc.roundedRect(30, 40, 150, 100, 5, 5, 'S');
                doc.setTextColor(...laranja);
                doc.setFontSize(16);
                doc.text('🍳', 105, 90, { align: 'center' });
                doc.setFontSize(12);
                doc.setTextColor(...cinza);
                doc.text('Imagem do prato final', 105, 110, { align: 'center' });
            }
        } catch (err) {
            console.log('Erro ao processar imagem final:', err);
        }
    }

    // ===== PASSO A PASSO COM IMAGENS =====
    const stepMessages = messages.filter(msg =>
        msg.type === 'cooking-step' && msg.step
    ).sort((a, b) => a.step.stepNumber - b.step.stepNumber);

    for (let i = 0; i < stepMessages.length; i++) {
        const msg = stepMessages[i];

        // Nova página para cada passo
        doc.addPage();

        // Fundo do passo
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(...laranja);
        doc.setLineWidth(0.5);
        doc.roundedRect(15, 15, 180, 260, 5, 5, 'FD');

        // Número do passo em círculo
        doc.setFillColor(...laranja);
        doc.circle(35, 35, 10, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(msg.step.stepNumber.toString(), 35, 39, { align: 'center' });

        // Título
        doc.setTextColor(...laranja);
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text(`PASSO ${msg.step.stepNumber}`, 55, 40);

        // Descrição
        doc.setTextColor(...cinza);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');

        const descLines = doc.splitTextToSize(msg.step.description, 160);
        doc.text(descLines, 25, 60);

        // IMAGEM DO PASSO (se existir)
        // IMAGEM DO PASSO (se existir)
        if (msg.step.imageUrl) {
            try {
                // Posição da imagem (após a descrição)
                const yImage = 90 + (descLines.length * 4);

                // Tentar carregar a imagem real
                try {
                    const img = new Image();
                    img.crossOrigin = 'Anonymous';

                    const imgPromise = new Promise((resolve, reject) => {
                        img.onload = () => {
                            try {
                                const canvas = document.createElement('canvas');
                                canvas.width = img.width;
                                canvas.height = img.height;
                                const ctx = canvas.getContext('2d');
                                ctx.drawImage(img, 0, 0);
                                const imgData = canvas.toDataURL('image/jpeg', 0.8);
                                doc.addImage(imgData, 'JPEG', 30, yImage, 150, 100);
                                resolve();
                            } catch (e) {
                                reject(e);
                            }
                        };
                        img.onerror = reject;
                        img.src = msg.step.imageUrl;
                    });

                    await imgPromise;
                } catch (imgErr) {
                    console.log(`Erro ao carregar imagem do passo ${msg.step.stepNumber}:`, imgErr);

                    // Placeholder com estilo
                    doc.setFillColor(245, 245, 245);
                    doc.roundedRect(30, yImage, 150, 100, 5, 5, 'F');
                    doc.setDrawColor(...laranja);
                    doc.setLineWidth(0.5);
                    doc.roundedRect(30, yImage, 150, 100, 5, 5, 'S');
                    doc.setTextColor(...laranja);
                    doc.setFontSize(24);
                    doc.text('📸', 105, yImage + 40, { align: 'center' });
                    doc.setFontSize(10);
                    doc.setTextColor(...cinza);
                    doc.text('Demonstração do passo', 105, yImage + 60, { align: 'center' });
                    doc.text(msg.step.stepNumber ? `Passo ${msg.step.stepNumber}` : '', 105, yImage + 75, { align: 'center' });
                }
            } catch (err) {
                console.log(`Erro ao processar imagem do passo ${msg.step.stepNumber}:`, err);
            }
        }
    }

    // ===== PÁGINA FINAL - DICAS =====
    doc.addPage();

    doc.setTextColor(...laranja);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('DICAS DO CHEF', 105, 40, { align: 'center' });

    const dicas = [
        '• Use ingredientes frescos para melhor sabor',
        '• Tempere a gosto durante o preparo',
        '• Organize tudo antes de começar',
        '• Aproveita cada momento na cozinha',
        '• Partilha com quem amas!'
    ];

    doc.setTextColor(...cinza);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');

    dicas.forEach((dica, i) => {
        doc.text(dica, 30, 80 + (i * 10));
    });

    // Mensagem final
    doc.setTextColor(...verde);
    doc.setFontSize(20);
    doc.text(' BOM APETITE! ', 105, 200, { align: 'center' });

    doc.setTextColor(150, 150, 150);
    doc.setFontSize(10);
    doc.text('Receita gerada pelo Bom Pitéu', 105, 280, { align: 'center' });

    // Salvar PDF
    const nomeArquivo = `${recipeData?.title?.replace(/[^a-zA-Z0-9]/g, '_') || 'receita'}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(nomeArquivo);

    return true;
};