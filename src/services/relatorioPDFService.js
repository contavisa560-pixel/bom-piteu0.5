// src/services/relatorioPDFService.js
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Formata data para DD/MM/AAAA
 */
const formatarData = (data) => {
  if (!data) return '—';
  const d = new Date(data);
  return d.toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

/**
 * Formata data extenso (para o cabeçalho)
 */
const formatarDataExtenso = (data) => {
  if (!data) return '—';
  const d = new Date(data);
  return d.toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
};

/**
 * Gera PDF profissional de relatório nutricional
 * @param {Object} relatorio - Dados do relatório
 * @param {Object} user - Dados do utilizador
 * @returns {jsPDF} - Documento PDF gerado
 */
export const gerarPDFRelatorio = (relatorio, user) => {
  // 1. Criar documento em A4
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let y = margin;

  // ========== CABEÇALHO PROFISSIONAL ==========
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('BOM PITÉU', pageWidth / 2, y, { align: 'center' });
  y += 8;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Relatório Clínico Nutricional', pageWidth / 2, y, { align: 'center' });
  y += 8;

  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text(`Gerado em: ${formatarDataExtenso(new Date())}`, pageWidth / 2, y, { align: 'center' });
  y += 12;

  // Linha separadora
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  // ========== IDENTIFICAÇÃO DO PACIENTE ==========
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(0);
  doc.text('IDENTIFICAÇÃO DO PACIENTE', margin, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(50);

  const paciente = [
    `Nome: ${user?.name || 'Paciente'}`,
    `ID: ${user?.id || user?._id || '—'}`,
    `Período: Últimos 30 dias`
  ];
  paciente.forEach(line => {
    doc.text(line, margin + 2, y);
    y += 5;
  });
  y += 4;

  // ========== SUMÁRIO EXECUTIVO ==========
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('RESUMO DO PERÍODO', margin, y);
  y += 6;

  const stats = relatorio.stats || {};
  const summary = [
    ['Total de refeições', stats.totalMeals || 0],
    ['Vegetais consumidos', stats.vegetables || 0],
    ['Receitas favoritas', stats.favorites || 0],
    ['Última atualização', formatarData(stats.lastUpdate)]
  ];

  autoTable(doc, {
    startY: y,
    margin: { left: margin },
    head: [['Indicador', 'Valor']],
    body: summary,
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 80, fontStyle: 'bold' },
      1: { cellWidth: 40, halign: 'center' }
    },
    styles: { fontSize: 10, cellPadding: 3 }
  });

  y = doc.lastAutoTable.finalY + 10;

  // ========== LIMITES NUTRICIONAIS ==========
  if (relatorio.limits) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('LIMITES DIÁRIOS PERSONALIZADOS', margin, y);
    y += 6;

    const limits = relatorio.limits;
    const limitesData = [
      ['Açúcar', `${limits.sugar || 25} g/dia`, limits.sugarAlert ? 'Alerta ativo' : '—'],
      ['Calorias', `${limits.calories || 2000} kcal/dia`, limits.caloriesAlert ? 'Alerta ativo' : '—'],
      ['Gordura', `${limits.fat || 20} g/dia`, limits.fatAlert ? 'Alerta ativo' : '—']
    ];

    autoTable(doc, {
      startY: y,
      margin: { left: margin },
      head: [['Nutriente', 'Limite diário', 'Estado']],
      body: limitesData,
      theme: 'grid',
      headStyles: { fillColor: [46, 204, 113], textColor: 255, fontStyle: 'bold' },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 50, halign: 'center' },
        2: { cellWidth: 50, halign: 'center' }
      },
      styles: { fontSize: 10, cellPadding: 3 }
    });

    y = doc.lastAutoTable.finalY + 10;
  }

  // ========== HISTÓRICO DE REFEIÇÕES ==========
  const recentMeals = relatorio.recentMeals || [];
  if (recentMeals.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('REGISTO ALIMENTAR DETALHADO', margin, y);
    y += 6;

    const mealsData = recentMeals.slice(0, 15).map(meal => [
      formatarData(meal.date),
      meal.recipeTitle || '—',
      meal.mealType || '—',
      meal.rating ? '⭐'.repeat(meal.rating) : '—',
      meal.mood || '—',
      meal.ingredients?.slice(0, 2).join(', ') || '—'
    ]);

    autoTable(doc, {
      startY: y,
      margin: { left: margin },
      head: [['Data', 'Refeição', 'Tipo', 'Aval.', 'Humor', 'Ingredientes']],
      body: mealsData,
      theme: 'grid',
      headStyles: { fillColor: [155, 89, 182], textColor: 255, fontStyle: 'bold' },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 45 },
        2: { cellWidth: 25 },
        3: { cellWidth: 20, halign: 'center' },
        4: { cellWidth: 20, halign: 'center' },
        5: { cellWidth: 55 }
      },
      styles: { fontSize: 9, cellPadding: 2 }
    });

    y = doc.lastAutoTable.finalY + 10;
  }

  // ========== RECOMENDAÇÕES AUTOMÁTICAS ==========
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('RECOMENDAÇÕES CLÍNICAS', margin, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(80);

  const vegStatus = (stats.totalMeals && stats.vegetables) 
    ? (stats.vegetables / stats.totalMeals) * 100 
    : 0;

  let vegText = '';
  if (vegStatus >= 40) vegText = 'Excelente consumo de vegetais. Continue assim.';
  else if (vegStatus >= 25) vegText = 'Bom consumo de vegetais. Tente incluir em mais refeições.';
  else if (vegStatus >= 15) vegText = 'Consumo moderado de vegetais. Adicione legumes ao almoço e jantar.';
  else vegText = 'Consumo insuficiente de vegetais. Recomenda-se aumentar para pelo menos 5 porções/dia.';

  const recomendacoes = [
    `• ${vegText}`,
    `• Hidratação: Ingerir no mínimo 1.5L de água diariamente.`,
    `• Variedade alimentar: Inclua diferentes grupos alimentares em cada refeição.`,
    `• Este relatório pode ser apresentado ao médico ou nutricionista.`
  ];

  if (relatorio.limits?.caloriesAlert) {
    recomendacoes.splice(2, 0, '• Alerta de calorias ativo: evite refeições com mais de 700 kcal.');
  }
  if (relatorio.limits?.sugarAlert) {
    recomendacoes.splice(2, 0, '• Alerta de açúcar ativo: reduza o consumo de doces e bebidas açucaradas.');
  }
  if (relatorio.limits?.fatAlert) {
    recomendacoes.splice(2, 0, '• Alerta de gordura ativo: prefira preparações grelhadas ou cozidas.');
  }

  recomendacoes.forEach(line => {
    doc.text(line, margin + 2, y);
    y += 6;
  });

  y += 4;

  // ========== RODAPÉ ==========
  const footerY = pageHeight - margin - 15;
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, footerY, pageWidth - margin, footerY);
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text('Bom Pitéu · Meu Canto de Saúde', margin, footerY + 5);
  doc.text('Documento gerado automaticamente – válido para consulta médica/nutricional.', margin, footerY + 10);
  doc.text(`Página 1 de 1`, pageWidth - margin, footerY + 5, { align: 'right' });

  return doc;
};