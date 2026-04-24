import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import {
  generatePrivacyPolicy,
  generateTermsOfService,
  generateCookiesPolicy,
  generateCommunityGuidelines,
  generatePaymentsPolicy,
  generateDataDeletion,
  generateAbout,
  generatePartnerships,
  generateTransparencyReport
} from './pdfGenerator';

export const downloadAllDocumentsAsZip = async () => {
  const zip = new JSZip();

  // Gerar todos os PDFs e adicionar ao ZIP
  const pdfs = [
    { name: 'Politica_Privacidade.pdf', generator: generatePrivacyPolicy },
    { name: 'Termos_Servico.pdf', generator: generateTermsOfService },
    { name: 'Politica_Cookies.pdf', generator: generateCookiesPolicy },
    { name: 'Diretrizes_Comunidade.pdf', generator: generateCommunityGuidelines },
    { name: 'Politica_Pagamentos.pdf', generator: generatePaymentsPolicy },
    { name: 'Eliminacao_Dados.pdf', generator: generateDataDeletion },
    { name: 'Sobre_Nos.pdf', generator: generateAbout },
    { name: 'Parcerias.pdf', generator: generatePartnerships },
    { name: 'Relatorio_Transparencia_2026.pdf', generator: generateTransparencyReport }
  ];

  for (const pdf of pdfs) {
    const blob = pdf.generator(); // gera o blob do PDF
    zip.file(pdf.name, blob);
  }

  // Gerar o ficheiro ZIP
  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, 'documentos_legais_bom_piteu.zip');
};