// src/services/relatorioService.js
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Gera um PDF a partir de um elemento HTML
 * @param {HTMLElement} element - O elemento a ser capturado
 * @param {string} filename - Nome do ficheiro (ex: "relatorio-saude.pdf")
 */
export const gerarPDF = async (element, filename = 'relatorio-saude.pdf') => {
  if (!element) throw new Error('Elemento não encontrado');

  try {
    // 1. Capturar o elemento como canvas
    const canvas = await html2canvas(element, {
      scale: 2,               // Alta qualidade
      backgroundColor: '#ffffff',
      logging: false,
      allowTaint: true,
      useCORS: true
    });

    const imgData = canvas.toDataURL('image/png');

    // 2. Criar PDF no formato A4
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
    pdf.save(filename);

    return true;
  } catch (error) {
    console.error('❌ Erro ao gerar PDF:', error);
    throw error;
  }
};

/**
 * Formata data para o padrão português
 */
export const formatarData = (data) => {
  if (!data) return '—';
  const d = new Date(data);
  return d.toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

/**
 * Formata data por extenso
 */
export const formatarDataExtenso = (data) => {
  if (!data) return '—';
  const d = new Date(data);
  return d.toLocaleDateString('pt-PT', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};