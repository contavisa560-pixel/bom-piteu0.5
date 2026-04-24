import { jsPDF } from 'jspdf';

// Função auxiliar para adicionar texto com quebras automáticas e controlo de página
const addWrappedText = (doc, text, x, y, maxWidth, lineHeight, options = {}) => {
  const lines = doc.splitTextToSize(text, maxWidth);
  let currentY = y;
  for (let i = 0; i < lines.length; i++) {
    if (currentY > 280) {
      doc.addPage();
      currentY = 20;
      // Adicionar cabeçalho em cada nova página
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text('BOM PITEU – Documento Legal', 105, 10, { align: 'center' });
      doc.setLineWidth(0.5);
      doc.line(20, 12, 190, 12);
      doc.setTextColor(0);
    }
    doc.text(lines[i], x, currentY, options);
    currentY += lineHeight;
  }
  return currentY;
};

// Função para adicionar cabeçalho da página
const addHeader = (doc, title, version = '1.0', date = '18 de março de 2026') => {
  doc.setFontSize(18);
  doc.setFont(undefined, 'bold');
  doc.text(title, 20, 20);
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(100);
  doc.text(`Versão ${version} · Última atualização: ${date}`, 20, 28);
  doc.setLineWidth(0.5);
  doc.line(20, 32, 190, 32);
  doc.setTextColor(0);
};

// Função para adicionar rodapé
const addFooter = (doc, pageNumber) => {
  const pageCount = doc.internal.getNumberOfPages();
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text(`BOM PITEU · centaurosa@gmail.com · +244 958 999 999`, 105, 290, { align: 'center' });
  doc.text(`Página ${pageNumber} de ${pageCount}`, 105, 295, { align: 'center' });
};

// Gerar Política de Privacidade (conteúdo extenso ~2000 linhas)
export const generatePrivacyPolicy = () => {
  const doc = new jsPDF();
  let pageNumber = 1;
  addHeader(doc, 'POLÍTICA DE PRIVACIDADE', '4.2', '18 de março de 2026');

  const content = [
    '',
    'A sua privacidade é fundamental para o Bom Piteu. Esta Política explica detalhadamente como recolhemos, usamos, armazenamos e protegemos os seus dados pessoais quando utiliza a nossa aplicação e website, em conformidade com o Regulamento Geral de Proteção de Dados (RGPD) e a legislação angolana aplicável.',
    '',
    '1. INTRODUÇÃO',
    'O Bom Piteu, com sede em Luanda, Angola, é o responsável pelo tratamento dos seus dados pessoais. Esta política aplica-se a todos os serviços oferecidos pelo Bom Piteu, incluindo a aplicação móvel, o website e qualquer outra plataforma associada.',
    'Ao utilizar os nossos serviços, você confia-nos as suas informações. Esta Política de Privacidade destina-se a ajudá-lo a compreender que dados recolhemos, porque os recolhemos e o que fazemos com eles. É importante que leia este documento em conjunto com outras políticas que possamos fornecer em ocasiões específicas.',
    '',
    '2. DADOS PESSOAIS QUE RECOLHEMOS',
    '2.1 Dados fornecidos diretamente por si:',
    '- Informações de registo: nome completo, endereço de e-mail, data de nascimento, país de residência, número de telefone (opcional).',
    '- Preferências alimentares: alergias, intolerâncias, dietas seguidas (ex.: vegetariana, vegan, cetogénica), objetivos nutricionais (ex.: perder peso, ganhar massa muscular, controlar colesterol).',
    '- Conteúdo gerado: receitas guardadas, notas pessoais, fotografias de pratos, comentários na comunidade.',
    '- Dados de pagamento: quando subscreve um plano Premium, recolhemos informações de faturação (morada, NIF) e método de pagamento (processado por entidades externas, não armazenamos dados de cartões).',
    '',
    '2.2 Dados recolhidos automaticamente:',
    '- Dados de utilização: receitas visualizadas, ingredientes pesquisados, interações com o Chef IA, tempo de sessão, funcionalidades mais usadas.',
    '- Dados técnicos: endereço IP, tipo de dispositivo, sistema operativo, versão do browser, identificadores únicos do dispositivo, dados de rede móvel.',
    '- Dados de localização aproximada (com base no IP) para sugerir receitas regionais e conteúdos personalizados.',
    '- Cookies e tecnologias semelhantes: consulte a nossa Política de Cookies para mais detalhes.',
    '',
    '3. FINALIDADES DO TRATAMENTO',
    'Tratamos os seus dados para as seguintes finalidades:',
    '3.1 Prestação do serviço:',
    '- Criar e gerir a sua conta, autenticar o acesso, garantir a segurança da sua conta.',
    '- Gerar receitas personalizadas com base nas suas preferências, alergias e objetivos.',
    '- Permitir a interação com o Chef IA, guardar o histórico de conversas e receitas geradas.',
    '- Disponibilizar funcionalidades como lista de compras, planeamento de refeições, notas pessoais.',
    '',
    '3.2 Melhoria e desenvolvimento:',
    '- Analisar a utilização do serviço para melhorar a nossa inteligência artificial e a experiência do utilizador.',
    '- Realizar pesquisas e análises estatísticas anonimizadas para identificar tendências alimentares.',
    '- Desenvolver novas funcionalidades e otimizar as existentes.',
    '',
    '3.3 Comunicação e marketing:',
    '- Enviar comunicações relacionadas com o serviço, como alertas de segurança, atualizações de funcionalidades, informações sobre a sua subscrição.',
    '- Com o seu consentimento, enviar newsletters, promoções e ofertas personalizadas (pode retirar o consentimento a qualquer momento).',
    '- Responder a pedidos de suporte e dúvidas enviadas através dos nossos canais de contacto.',
    '',
    '3.4 Obrigações legais:',
    '- Cumprir obrigações fiscais e legais (ex.: emissão de faturas, retenção de dados por períodos exigidos por lei).',
    '- Responder a pedidos de autoridades judiciais ou reguladoras, no estrito cumprimento da lei.',
    '- Prevenir fraudes e abusos dos nossos serviços.',
    '',
    '4. FUNDAMENTOS JURÍDICOS PARA O TRATAMENTO',
    'O tratamento dos seus dados baseia-se nos seguintes fundamentos, de acordo com o RGPD:',
    '- Execução de um contrato: quando o tratamento é necessário para a prestação dos serviços que solicitou (ex.: criar conta, gerar receitas).',
    '- Consentimento: quando nos dá autorização explícita para finalidades específicas (ex.: marketing direto, cookies não essenciais). Pode retirar o consentimento em qualquer altura.',
    '- Interesse legítimo: para melhorar os nossos serviços, garantir a segurança, prevenir fraudes, desde que os seus direitos e liberdades não prevaleçam.',
    '- Obrigação legal: para cumprir disposições legais (ex.: conservação de dados fiscais).',
    '',
    '5. PARTILHA DE DADOS COM TERCEIROS',
    'Não vendemos os seus dados pessoais a terceiros. Podemos partilhar informações nas seguintes circunstâncias:',
    '5.1 Prestadores de serviços:',
    'Trabalhamos com subcontratantes que nos ajudam a operar e melhorar o serviço, tais como:',
    '- Fornecedores de alojamento cloud (servidores seguros).',
    '- Serviços de análise de dados (ex.: Google Analytics, com dados anonimizados).',
    '- Processadores de pagamento (ex.: Stripe, PayPal, Multicaixa Express) – estes seguem as suas próprias políticas de privacidade.',
    '- Ferramentas de apoio ao cliente (ex.: Zendesk).',
    'Todos os subcontratantes estão vinculados a contratos que garantem a proteção dos seus dados e o cumprimento do RGPD.',
    '',
    '5.2 Obrigações legais:',
    'Podemos divulgar os seus dados se formos obrigados por lei ou mediante pedido válido de autoridade pública (ex.: tribunal, entidade reguladora).',
    '',
    '5.3 Transferências internacionais:',
    'Os seus dados podem ser transferidos e processados em países fora do Espaço Económico Europeu (incluindo Angola). Nessas transferências, asseguramos garantias adequadas, como cláusulas contratuais tipo aprovadas pela Comissão Europeia.',
    '',
    '6. CONSERVAÇÃO DOS DADOS',
    'Conservamos os seus dados apenas pelo tempo necessário para as finalidades para que foram recolhidos, incluindo para cumprir obrigações legais, fiscais ou regulatórias.',
    '- Dados da conta: enquanto a conta estiver ativa. Após pedido de eliminação, os dados são apagados em 30 dias, exceto os que devemos reter por lei (ex.: faturas por 10 anos).',
    '- Dados de utilização anonimizados: conservados por tempo indeterminado para fins estatísticos, sem possibilidade de identificação.',
    '- Registos de pagamento: conservados por 10 anos (obrigação fiscal).',
    '- Dados de marketing: até retirar o consentimento ou solicitar a remoção.',
    '',
    '7. OS SEUS DIREITOS',
    'Ao abrigo do RGPD, tem os seguintes direitos:',
    '7.1 Direito de acesso: pode solicitar uma cópia dos seus dados pessoais que tratamos.',
    '7.2 Direito de retificação: pode pedir a correção de dados incompletos ou inexatos.',
    '7.3 Direito ao apagamento ("direito a ser esquecido"): pode solicitar a eliminação dos seus dados, exceto quando a lei exija a sua conservação.',
    '7.4 Direito à limitação do tratamento: pode pedir a suspensão do tratamento em determinadas situações.',
    '7.5 Direito de portabilidade: pode receber os seus dados num formato estruturado e de uso corrente, ou solicitar a transmissão para outro responsável.',
    '7.6 Direito de oposição: pode opor-se ao tratamento baseado em interesse legítimo ou para fins de marketing direto.',
    '7.7 Direito de retirar consentimento: a qualquer momento, sem comprometer a licitude do tratamento efetuado até então.',
    '',
    'Para exercer os seus direitos, envie um e-mail para centaurosa@gmail.com com o assunto "Direitos RGPD". Responderemos no prazo máximo de 30 dias.',
    'Tem também o direito de apresentar reclamação à autoridade de controlo competente (em Angola, a Autoridade Geral de Proteção de Dados – AGPD).',
    '',
    '8. SEGURANÇA DOS DADOS',
    'Implementamos medidas técnicas e organizativas adequadas para proteger os seus dados contra acesso não autorizado, perda acidental, destruição ou danificação:',
    '- Encriptação de dados em trânsito (SSL/TLS) e em repouso (AES-256).',
    '- Controlos de acesso rigorosos e autenticação multifator para a nossa equipa.',
    '- Monitorização contínua dos sistemas e testes de penetração regulares.',
    '- Formação da equipa em privacidade e segurança da informação.',
    '',
    '9. COOKIES E TECNOLOGIAS SEMELHANTES',
    'Utilizamos cookies e tecnologias similares para melhorar a sua experiência, analisar o tráfego e personalizar conteúdo. Para mais informações, consulte a nossa Política de Cookies disponível no website.',
    '',
    '10. ALTERAÇÕES A ESTA POLÍTICA',
    'Podemos atualizar esta Política periodicamente para refletir alterações nas nossas práticas ou por razões legais. Notificaremos os utilizadores registados por e-mail em caso de alterações substanciais e publicaremos a versão atualizada nesta página com a data de revisão.',
    '',
    '11. CONTACTOS',
    'Para questões relacionadas com privacidade ou para exercer os seus direitos, contacte o nosso Encarregado de Proteção de Dados:',
    'E-mail: centaurosa@gmail.com',
    'Telefone: +244 958 999 999',
    'Morada: Benfica, Zona verde 3, Luanda, Angola',
    '',
    'Data de entrada em vigor: 18 de março de 2026'
  ];

  let y = 40;
  const maxWidth = 170;
  const lineHeight = 7;

  content.forEach(paragraph => {
    y = addWrappedText(doc, paragraph, 20, y, maxWidth, lineHeight);
    y += 3; // espaço extra entre parágrafos
    if (y > 280) {
      doc.addPage();
      addHeader(doc, 'POLÍTICA DE PRIVACIDADE (continuação)', '4.2', '18 de março de 2026');
      y = 40;
    }
  });

  // Adicionar rodapé em todas as páginas
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter(doc, i);
  }

  return doc.output('blob');
};

// Gerar Termos de Serviço (conteúdo extenso)
export const generateTermsOfService = () => {
  const doc = new jsPDF();
  addHeader(doc, 'TERMOS DE SERVIÇO', '3.1', '18 de março de 2026');

  const content = [
    '',
    'Bem-vindo ao Bom Piteu! Ao aceder ou utilizar a nossa plataforma, concorda em cumprir estes Termos de Serviço. Leia atentamente.',
    '',
    '1. ACEITAÇÃO DOS TERMOS',
    'Ao descarregar, instalar ou usar a aplicação Bom Piteu, ou ao aceder ao nosso website, celebra um contrato vinculativo connosco. Se não concordar com qualquer parte destes Termos, não utilize os nossos serviços.',
    'Estes Termos aplicam-se a todos os utilizadores, incluindo aqueles que contribuem com conteúdo, e aos utilizadores dos serviços gratuitos e pagos.',
    '',
    '2. DESCRIÇÃO DO SERVIÇO',
    'O Bom Piteu é uma plataforma tecnológica que utiliza inteligência artificial para fornecer:',
    '- Geração de receitas personalizadas com base em preferências alimentares, alergias, intolerâncias e objetivos nutricionais.',
    '- Assistente culinário interativo (Chef IA) que responde a perguntas, sugere receitas e guia passo a passo na cozinha.',
    '- Funcionalidades de gestão: lista de compras, planeamento de refeições, diário alimentar, favoritos.',
    '- Comunidade para partilha de receitas e dicas (com moderação).',
    '- Conteúdos educativos sobre nutrição e técnicas culinárias.',
    '- Serviços premium com funcionalidades adicionais (ex.: reconhecimento de pratos por foto, acesso offline, planos familiares).',
    '',
    '3. CRIAÇÃO DE CONTA E SEGURANÇA',
    '3.1 Para aceder a determinadas funcionalidades, necessita de criar uma conta, fornecendo informações exatas e completas. É responsável por manter a confidencialidade da sua palavra-passe e por todas as atividades que ocorram na sua conta.',
    '3.2 Deve ter pelo menos 16 anos para criar uma conta. Se tiver entre 13 e 16 anos, necessita de autorização dos pais ou tutores legais, que assumem a responsabilidade por todas as atividades.',
    '3.3 Notifique-nos imediatamente em caso de uso não autorizado da sua conta ou violação de segurança através de centaurosa@gmail.com.',
    '3.4 Reservamo-nos o direito de recusar o registo, suspender ou encerrar contas que violem estes Termos.',
    '',
    '4. SUBSCRIÇÕES E PAGAMENTOS',
    '4.1 O Bom Piteu oferece planos gratuitos e pagos (Premium e Família). As características de cada plano estão descritas no website e na aplicação.',
    '4.2 Os pagamentos são processados por entidades terceiras (Stripe, PayPal, Multicaixa Express). Não armazenamos dados de cartões de crédito.',
    '4.3 As subscrições são renovadas automaticamente no final de cada período, salvo cancelamento até 24 horas antes do término.',
    '4.4 Pode cancelar a qualquer momento na secção "Subscrição" da sua conta. O cancelamento produz efeitos no fim do período em curso, sem reembolso do período já pago, exceto nos casos previstos na lei (ex.: direito de arrependimento em 14 dias para novos assinantes, desde que não tenham usado o serviço).',
    '4.5 Reservamo-nos o direito de alterar preços, notificando com 30 dias de antecedência.',
    '',
    '5. CONTEÚDO GERADO PELO UTILIZADOR',
    '5.1 Pode publicar conteúdo na comunidade, incluindo receitas, comentários, fotografias. Ao fazê-lo, concede ao Bom Piteu uma licença mundial, não exclusiva, gratuita, para usar, reproduzir, modificar, adaptar, publicar e distribuir esse conteúdo para efeitos de operação e promoção do serviço.',
    '5.2 Declara e garante que é o proprietário do conteúdo ou tem as autorizações necessárias, e que o conteúdo não viola direitos de terceiros nem é ilegal, ofensivo, difamatório ou obsceno.',
    '5.3 O Bom Piteu reserva-se o direito de moderar, editar ou remover qualquer conteúdo que considere inadequado ou violador destes Termos, sem aviso prévio.',
    '',
    '6. CONTEÚDO GERADO POR IA',
    '6.1 O Chef IA utiliza inteligência artificial para gerar receitas e sugestões. Embora nos esforcemos pela precisão, as receitas são geradas automaticamente e podem conter erros ou não ser adequadas a todas as alergias, intolerâncias ou condições de saúde.',
    '6.2 É da sua responsabilidade verificar os ingredientes, quantidades e métodos de preparação, especialmente se tiver restrições alimentares graves. O Bom Piteu não se responsabiliza por danos resultantes da utilização das receitas geradas.',
    '6.3 As respostas do Chef IA baseiam-se em modelos de linguagem e não constituem aconselhamento médico ou nutricional profissional. Consulte sempre um especialista qualificado para questões de saúde.',
    '',
    '7. PROPRIEDADE INTELECTUAL',
    '7.1 Todos os direitos de propriedade intelectual sobre a plataforma, logótipos, design, software e conteúdos originais (exceto os gerados pelos utilizadores) pertencem ao Bom Piteu ou aos seus licenciantes.',
    '7.2 É proibido copiar, modificar, distribuir, vender, alugar ou utilizar qualquer parte do serviço para fins comerciais sem autorização prévia por escrito.',
    '7.3 Não é permitido extrair dados (scraping) da plataforma, nem utilizar robots ou outros meios automatizados para aceder ao serviço sem autorização.',
    '',
    '8. CONDUTA DO UTILIZADOR',
    'Ao utilizar o Bom Piteu, concorda em:',
    '- Não violar qualquer lei ou regulamento aplicável.',
    '- Não infringir direitos de terceiros.',
    '- Não enviar spam, publicidade não solicitada ou conteúdo promocional.',
    '- Não tentar aceder a áreas restritas do sistema ou a contas de outros utilizadores.',
    '- Não introduzir vírus, malware ou qualquer código malicioso.',
    '- Não interferir com o funcionamento do serviço.',
    '',
    '9. LIMITAÇÃO DE RESPONSABILIDADE',
    '9.1 O Bom Piteu é fornecido "no estado em que se encontra" e "conforme disponível", sem garantias de qualquer tipo, expressas ou implícitas, incluindo, mas não limitado a, garantias de comercialização, adequação a um fim específico e não violação.',
    '9.2 Não garantimos que o serviço seja ininterrupto, seguro ou livre de erros.',
    '9.3 Em nenhuma circunstância o Bom Piteu, seus diretores, colaboradores ou agentes serão responsáveis por danos indiretos, incidentais, especiais, consequentes ou punitivos, incluindo perda de lucros, dados ou uso, ainda que informados da possibilidade de tais danos.',
    '9.4 A nossa responsabilidade total perante si, por qualquer reclamação decorrente destes Termos, não excederá o montante pago por si ao Bom Piteu nos 12 meses anteriores à reclamação, ou 100.000 Kz, consoante o valor mais baixo.',
    '',
    '10. INDEMNIZAÇÃO',
    'Concorda em indemnizar e isentar o Bom Piteu e suas afiliadas, diretores, colaboradores e agentes de e contra quaisquer reclamações, responsabilidades, danos, perdas e despesas, incluindo honorários advocatícios, decorrentes de: (a) violação destes Termos por si; (b) conteúdo que publique; (c) uso indevido do serviço.',
    '',
    '11. RESCISÃO',
    '11.1 Pode rescindir a sua conta a qualquer momento, eliminando-a nas definições ou contactando-nos.',
    '11.2 Podemos suspender ou encerrar o seu acesso ao serviço, sem aviso prévio, se acreditarmos que violou estes Termos ou por qualquer outra razão, a nosso critério.',
    '11.3 Após a rescisão, o seu direito de utilizar o serviço cessa imediatamente. Algumas disposições destes Termos sobrevivem à rescisão, incluindo propriedade intelectual, limitação de responsabilidade e indemnização.',
    '',
    '12. LEI APLICÁVEL E FORO',
    'Estes Termos são regidos e interpretados de acordo com as leis da República de Angola. Qualquer litígio decorrente destes Termos será submetido exclusivamente ao foro da comarca de Luanda, com expressa renúncia a qualquer outro.',
    '',
    '13. ALTERAÇÕES AOS TERMOS',
    'Reservamo-nos o direito de modificar estes Termos a qualquer momento. As alterações entram em vigor 30 dias após a publicação no website ou na aplicação, ou imediatamente se forem de natureza técnica ou legal. O uso continuado do serviço após esse período constitui aceitação dos novos Termos.',
    '',
    '14. DISPOSIÇÕES GERAIS',
    '14.1 Se qualquer disposição destes Termos for considerada inválida ou inexequível, as restantes disposições permanecem em pleno vigor.',
    '14.2 A falha em exercer qualquer direito previsto nestes Termos não constitui renúncia a esse direito.',
    '14.3 Estes Termos constituem o acordo integral entre si e o Bom Piteu relativamente ao uso do serviço.',
    '',
    '15. CONTACTOS',
    'Para questões relacionadas com estes Termos, contacte-nos:',
    'E-mail: centaurosa@gmail.com',
    'Telefone: +244 958 999 999',
    '',
    'Data de entrada em vigor: 18 de março de 2026'
  ];

  let y = 40;
  const maxWidth = 170;
  const lineHeight = 7;

  content.forEach(paragraph => {
    y = addWrappedText(doc, paragraph, 20, y, maxWidth, lineHeight);
    y += 3;
    if (y > 280) {
      doc.addPage();
      addHeader(doc, 'TERMOS DE SERVIÇO (continuação)', '3.1', '18 de março de 2026');
      y = 40;
    }
  });

  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter(doc, i);
  }

  return doc.output('blob');
};

// Gerar Política de Cookies
export const generateCookiesPolicy = () => {
  const doc = new jsPDF();
  addHeader(doc, 'POLÍTICA DE COOKIES', '2.3', '18 de março de 2026');

  const content = [
    '',
    '1. O QUE SÃO COOKIES?',
    'Cookies são pequenos ficheiros de texto que os sites visitados enviam para o seu navegador e são armazenados no seu dispositivo (computador, tablet, smartphone). Permitem que o site se lembre de ações e preferências (como idioma, tamanho de letra, etc.) durante um período de tempo, evitando a necessidade de as reconfigurar sempre que volta a visitar o site ou navega entre páginas.',
    '',
    '2. COOKIES QUE UTILIZAMOS',
    '2.1 Cookies estritamente necessários:',
    'São essenciais para o funcionamento do site e permitem que navegue e utilize as suas funcionalidades, como aceder a áreas seguras. Sem estes cookies, o serviço não pode funcionar corretamente.',
    '- Autenticação: para manter a sua sessão iniciada.',
    '- Segurança: para detetar atividades fraudulentas.',
    '- Gestão de consentimento: para recordar as suas preferências de cookies.',
    '',
    '2.2 Cookies de desempenho e análise:',
    'Recolhem informações sobre como os utilizadores interagem com o site, como as páginas mais visitadas, tempo de permanência, erros ocorridos. Ajudam-nos a melhorar o desempenho e a experiência do utilizador.',
    '- Google Analytics: usamos para analisar o tráfego e comportamento anonimizado. Os dados são agregados e não identificam individualmente.',
    '- Hotjar: para compreender como navega e identificar problemas de usabilidade (opcional).',
    '',
    '2.3 Cookies funcionais:',
    'Permitem que o site se lembre das suas escolhas (idioma, região, preferências de visualização) e forneça funcionalidades melhoradas e personalizadas.',
    '- Idioma preferido.',
    '- Receitas favoritas guardadas.',
    '- Preferências de exibição.',
    '',
    '2.4 Cookies de publicidade e marketing:',
    'Utilizados para rastrear a sua atividade online e criar um perfil dos seus interesses, de modo a mostrar anúncios relevantes em outros sites. Apenas são colocados com o seu consentimento explícito.',
    '- Google Ads, Facebook Pixel, etc.',
    '',
    '3. COOKIES DE TERCEIROS',
    'Alguns cookies são colocados por terceiros em quem confiamos para fornecer determinados serviços. Por exemplo:',
    '- Redes sociais: para permitir partilha de conteúdo (Facebook, Instagram).',
    '- Processadores de pagamento: para garantir transações seguras.',
    '- Ferramentas de apoio ao cliente (Zendesk).',
    '',
    '4. COMO GERIR OS COOKIES',
    'Pode controlar e/ou eliminar cookies conforme desejar. Pode apagar todos os cookies já armazenados no seu dispositivo e configurar a maioria dos navegadores para impedir a sua colocação. No entanto, se o fizer, poderá ter de ajustar manualmente algumas preferências cada vez que visitar o site e alguns serviços poderão não funcionar.',
    'Para gerir as suas preferências de cookies, utilize as opções do seu navegador:',
    '- Google Chrome: Configurações > Privacidade e segurança > Cookies e outros dados do site.',
    '- Mozilla Firefox: Opções > Privacidade e segurança > Cookies e dados do site.',
    '- Safari: Preferências > Privacidade > Gerir dados de websites.',
    '- Microsoft Edge: Configurações > Cookies e permissões do site.',
    '',
    '5. CONSENTIMENTO',
    'Quando visita o nosso site pela primeira vez, apresentamos um banner de cookies onde pode escolher quais as categorias de cookies que aceita. Pode alterar as suas preferências a qualquer momento clicando no link "Gerir cookies" no rodapé.',
    '',
    '6. ATUALIZAÇÕES DA POLÍTICA',
    'Podemos atualizar esta Política de Cookies periodicamente. Publicaremos a versão mais recente nesta página, com a data de revisão.',
    '',
    '7. CONTACTOS',
    'Se tiver dúvidas sobre a nossa utilização de cookies, contacte-nos:',
    'E-mail: centaurosa@gmail.com',
    'Telefone: +244 958 999 999',
    '',
    'Data de entrada em vigor: 18 de março de 2026'
  ];

  let y = 40;
  const maxWidth = 170;
  const lineHeight = 7;

  content.forEach(paragraph => {
    y = addWrappedText(doc, paragraph, 20, y, maxWidth, lineHeight);
    y += 3;
    if (y > 280) {
      doc.addPage();
      addHeader(doc, 'POLÍTICA DE COOKIES (continuação)', '2.3', '18 de março de 2026');
      y = 40;
    }
  });

  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter(doc, i);
  }

  return doc.output('blob');
};

// Gerar Diretrizes da Comunidade
export const generateCommunityGuidelines = () => {
  const doc = new jsPDF();
  addHeader(doc, 'DIRETRIZES DA COMUNIDADE', '1.8', '18 de março de 2026');

  const content = [
    '',
    'O Bom Piteu é mais do que uma aplicação – é uma comunidade de entusiastas da culinária que partilham a paixão pela comida. Para manter um ambiente acolhedor, seguro e inspirador, pedimos que todos os membros sigam estas diretrizes.',
    '',
    '1. RESPEITO E CORDIALIDADE',
    '1.1 Trate todos os membros com respeito e empatia, independentemente da sua origem, cultura, religião, género, orientação sexual ou nível de experiência culinária.',
    '1.2 Críticas construtivas são bem-vindas, mas devem ser apresentadas de forma educada e focadas na receita, não na pessoa.',
    '1.3 Não são tolerados discursos de ódio, assédio, bullying, discriminação ou qualquer forma de intimidação.',
    '',
    '2. CONTEÚDO APROPRIADO',
    '2.1 Partilhe apenas receitas, fotografias e comentários originais ou com os devidos créditos. Respeite os direitos de autor.',
    '2.2 Ao publicar uma receita, indique claramente os ingredientes alergénios (ex.: glúten, lactose, frutos secos, marisco) para segurança dos outros utilizadores.',
    '2.3 Não publique conteúdo ofensivo, violento, sexualmente explícito, ilegal ou que promova atividades perigosas.',
    '2.4 Não faça spam, autopromoção excessiva, marketing não solicitado ou divulgação de links maliciosos.',
    '2.5 Não partilhe informações pessoais suas ou de terceiros (morada, telefone, dados bancários).',
    '',
    '3. SEGURANÇA ALIMENTAR',
    '3.1 As receitas partilhadas são da responsabilidade dos seus autores. O Bom Piteu não se responsabiliza por reações alérgicas ou problemas de saúde decorrentes da sua utilização.',
    '3.2 Recomendamos vivamente que, antes de cozinhar, verifique todos os ingredientes e quantidades, especialmente se tiver alergias ou restrições alimentares.',
    '3.3 Inclua instruções de armazenamento e prazos de validade para as sobras.',
    '3.4 Mencione temperaturas de confeção adequadas para carnes, peixes e ovos, de modo a prevenir intoxicações.',
    '',
    '4. MODERAÇÃO',
    '4.1 A equipa do Bom Piteu monitoriza ativamente a comunidade e reserva-se o direito de remover qualquer conteúdo que viole estas diretrizes, sem aviso prévio.',
    '4.2 Os utilizadores que violarem as regras estarão sujeitos a ações corretivas, que podem incluir:',
    '- Aviso por e-mail.',
    '- Suspensão temporária da conta (7 a 30 dias).',
    '- Banimento permanente em casos graves ou reincidência.',
    '4.3 Para denunciar conteúdo inadequado, utilize o botão "Denunciar" disponível em cada publicação ou contacte a moderação através de centaurosa@gmail.com.',
    '',
    '5. PRIVACIDADE E DADOS PESSOAIS',
    '5.1 Não publique informações que possam identificar terceiros sem o seu consentimento.',
    '5.2 Respeite a privacidade alheia; não tire screenshots de conversas privadas para partilhar publicamente.',
    '',
    '6. DIREITOS DE AUTOR E ATRIBUIÇÃO',
    '6.1 Se partilhar uma receita adaptada de outra fonte, dê o crédito devido ao criador original.',
    '6.2 Não copie receitas na íntegra de livros, sites ou outras plataformas sem autorização.',
    '',
    '7. LINGUAGEM E COMUNICAÇÃO',
    '7.1 Utilize uma linguagem clara e acessível a todos.',
    '7.2 Evite abreviaturas excessivas ou jargão que possa excluir utilizadores menos experientes.',
    '',
    '8. COLABORAÇÃO E CRESCIMENTO',
    '8.1 Incentivamos a partilha de dicas, truques e variações regionais.',
    '8.2 Participe de forma positiva, ajude outros membros e celebre as suas conquistas culinárias.',
    '',
    '9. ALTERAÇÕES ÀS DIRETRIZES',
    'Podemos atualizar estas diretrizes periodicamente. As alterações entrarão em vigor após publicação na comunidade. O uso continuado da plataforma implica aceitação das novas regras.',
    '',
    '10. CONTACTOS',
    'Para questões ou denúncias relacionadas com a comunidade:',
    'E-mail: centaurosa@gmail.com',
    '',
    'Data de entrada em vigor: 18 de março de 2026'
  ];

  let y = 40;
  const maxWidth = 170;
  const lineHeight = 7;

  content.forEach(paragraph => {
    y = addWrappedText(doc, paragraph, 20, y, maxWidth, lineHeight);
    y += 3;
    if (y > 280) {
      doc.addPage();
      addHeader(doc, 'DIRETRIZES DA COMUNIDADE (continuação)', '1.8', '18 de março de 2026');
      y = 40;
    }
  });

  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter(doc, i);
  }

  return doc.output('blob');
};

// Gerar Política de Pagamentos
export const generatePaymentsPolicy = () => {
  const doc = new jsPDF();
  addHeader(doc, 'POLÍTICA DE PAGAMENTOS', '3.0', '18 de março de 2026');

  const content = [
    '',
    '1. MÉTODOS DE PAGAMENTO ACEITES',
    '1.1 Cartões de crédito/débito: Visa, Mastercard, American Express (processados pela Stripe).',
    '1.2 MB WAY (apenas para Portugal).',
    '1.3 PayPal.',
    '1.4 Multicaixa Express (Angola).',
    '1.5 Transferência bancária (apenas para Angola, para planos anuais).',
    '1.6 Apple Pay e Google Pay (em dispositivos compatíveis).',
    'Todos os pagamentos são processados por entidades certificadas PCI DSS nível 1. O Bom Piteu não armazena números de cartões de crédito.',
    '',
    '2. PLANOS E PREÇOS',
    '2.1 Plano Grátis: 0 Kz/mês – inclui 10 interações com Chef IA, acesso a receitas básicas, lista de compras simples.',
    '2.2 Plano Premium: 3.500 Kz/mês ou 35.000 Kz/ano – inclui interações ilimitadas, reconhecimento de pratos por foto, planeamento de refeições, receitas exclusivas, sem anúncios.',
    '2.3 Plano Família: 7.500 Kz/mês ou 75.000 Kz/ano – até 5 perfis, lista de compras partilhada, controlo parental.',
    'Os preços incluem todos os impostos aplicáveis. Reservamo-nos o direito de alterar preços com aviso prévio de 30 dias.',
    '',
    '3. FATURAÇÃO',
    '3.1 Após cada pagamento, é gerada uma fatura eletrónica enviada para o e-mail associado à conta.',
    '3.2 Para faturas com NIF, atualize os dados de faturação no seu perfil antes de efetuar o pagamento.',
    '3.3 Para empresas, podemos emitir faturas pró-forma e recibos verdes. Contacte centaurosa@gmail.com.',
    '',
    '4. RENOVAÇÕES E CANCELAMENTO',
    '4.1 As subscrições são renovadas automaticamente no final de cada período, exceto se canceladas com antecedência.',
    '4.2 Pode cancelar a qualquer momento na secção "Subscrição" da aplicação. O cancelamento produz efeitos no fim do período em curso, não havendo lugar a reembolso do período já pago.',
    '4.3 Se optar pelo cancelamento, continuará a ter acesso às funcionalidades premium até ao final do período faturado.',
    '',
    '5. REEMBOLSOS',
    '5.1 Direito de arrependimento: nos termos da lei, tem 14 dias para cancelar e solicitar reembolso total, desde que não tenha utilizado o serviço (ex.: não tenha gerado receitas).',
    '5.2 Reembolsos parciais: em subscrições anuais, se cancelar após 30 dias, pode solicitar reembolso proporcional ao tempo não utilizado, deduzido de uma taxa administrativa de 10%.',
    '5.3 Não há reembolso para subscrições mensais após o início do período.',
    '5.4 Para solicitar reembolso, contacte centaurosa@gmail.com com o assunto "Reembolso".',
    '',
    '6. PAGAMENTOS SEGUROS',
    '6.1 Utilizamos encriptação SSL/TLS em todas as transações.',
    '6.2 A Stripe, PayPal e entidades bancárias parceiras cumprem as mais rigorosas normas de segurança.',
    '6.3 Não armazenamos dados sensíveis de pagamento nos nossos servidores.',
    '',
    '7. FALHAS NO PAGAMENTO',
    '7.1 Se o pagamento falhar, tentaremos cobrar novamente nos 7 dias seguintes. Caso persista, a conta poderá ser rebaixada para o plano gratuito até regularização.',
    '7.2 Em caso de cobrança indevida, contacte-nos imediatamente para regularização.',
    '',
    '8. POLÍTICA PARA PAGAMENTOS INTERNACIONAIS',
    '8.1 Os preços são apresentados em Kwanzas (Kz). Para pagamentos internacionais, o valor será convertido pela entidade processadora, podendo haver diferenças devido a taxas de câmbio.',
    '8.2 Podem ser aplicadas taxas adicionais pelo seu banco ou pelo processador.',
    '',
    '9. CONTACTOS FINANCEIROS',
    'Para questões sobre faturas, reembolsos ou pagamentos:',
    'E-mail: centaurosa@gmail.com',
    'Telefone: +244 958 999 999',
    '',
    'Data de entrada em vigor: 18 de março de 2026'
  ];

  let y = 40;
  const maxWidth = 170;
  const lineHeight = 7;

  content.forEach(paragraph => {
    y = addWrappedText(doc, paragraph, 20, y, maxWidth, lineHeight);
    y += 3;
    if (y > 280) {
      doc.addPage();
      addHeader(doc, 'POLÍTICA DE PAGAMENTOS (continuação)', '3.0', '18 de março de 2026');
      y = 40;
    }
  });

  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter(doc, i);
  }

  return doc.output('blob');
};

// Gerar Política de Eliminação de Dados
export const generateDataDeletion = () => {
  const doc = new jsPDF();
  addHeader(doc, 'ELIMINAÇÃO DE DADOS', '2.1', '18 de março de 2026');

  const content = [
    '',
    'Este documento explica como pode solicitar a eliminação dos seus dados pessoais do Bom Piteu e o que acontece após o pedido, em conformidade com o RGPD.',
    '',
    '1. COMO SOLICITAR A ELIMINAÇÃO',
    '1.1 Através da aplicação:',
    'Aceda a Definições > Conta > Eliminar conta. Siga as instruções e confirme com a sua palavra-passe.',
    '1.2 Por e-mail:',
    'Envie um e-mail para centaurosa@gmail.com com o assunto "Eliminação de dados", indicando o seu nome de utilizador e o motivo (opcional). Responderemos com instruções para confirmar a identidade.',
    '1.3 Através do formulário online:',
    'Preencha o formulário disponível em bompiteu.com/eliminar-dados (em breve).',
    '',
    '2. PROCESSO DE ELIMINAÇÃO',
    '2.1 Receção do pedido: enviaremos uma confirmação imediata por e-mail com um número de processo.',
    '2.2 Verificação de identidade: em alguns casos, poderemos solicitar informação adicional para confirmar que é o titular da conta.',
    '2.3 Prazo de eliminação: os dados são eliminados dos sistemas ativos em até 7 dias úteis.',
    '2.4 Eliminação de backups: os backups são mantidos por segurança até 30 dias, findos os quais são apagados.',
    '2.5 Confirmação final: após a eliminação completa, receberá um e-mail de confirmação.',
    '',
    '3. DADOS QUE SÃO ELIMINADOS',
    '- Informações pessoais: nome, e-mail, data de nascimento, telefone, morada (se fornecida).',
    '- Preferências alimentares: alergias, intolerâncias, dietas, objetivos.',
    '- Histórico de receitas geradas, conversas com o Chef IA, receitas favoritas, notas pessoais.',
    '- Fotografias carregadas.',
    '- Dados de utilização anonimizados (estes não são apagados, pois não permitem identificação).',
    '',
    '4. DADOS QUE NÃO SÃO ELIMINADOS',
    '- Registos de pagamento e faturas: por obrigação fiscal, são retidos por 10 anos. Estes dados não incluem informação de cartões de crédito, apenas montantes, datas e NIF.',
    '- Dados anonimizados para estatísticas: contribuem para análises agregadas e não podem ser associados a si.',
    '',
    '5. CONSEQUÊNCIAS DA ELIMINAÇÃO',
    '5.1 Após a eliminação, a conta fica irreversivelmente apagada. Não é possível recuperar dados.',
    '5.2 Receitas que tenha partilhado publicamente podem permanecer na comunidade, mas serão anonimizadas (o autor passará a "Utilizador eliminado").',
    '5.3 Comentários e interações em fóruns públicos também são anonimizados.',
    '5.4 Subscrições ativas são canceladas sem reembolso proporcional.',
    '',
    '6. DIREITO DE OPOSIÇÃO',
    'Se preferir não eliminar a conta, mas opor-se a determinados tratamentos, pode exercer o direito de oposição contactando-nos.',
    '',
    '7. CONTACTOS',
    'Para dúvidas sobre eliminação de dados:',
    'E-mail: centaurosa@gmail.com',
    'Telefone: +244 958 999 999',
    '',
    'Data de entrada em vigor: 18 de março de 2026'
  ];

  let y = 40;
  const maxWidth = 170;
  const lineHeight = 7;

  content.forEach(paragraph => {
    y = addWrappedText(doc, paragraph, 20, y, maxWidth, lineHeight);
    y += 3;
    if (y > 280) {
      doc.addPage();
      addHeader(doc, 'ELIMINAÇÃO DE DADOS (continuação)', '2.1', '18 de março de 2026');
      y = 40;
    }
  });

  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter(doc, i);
  }

  return doc.output('blob');
};

// Gerar Sobre Nós
export const generateAbout = () => {
  const doc = new jsPDF();
  addHeader(doc, 'SOBRE NÓS', '1.0', '18 de março de 2026');

  const content = [
    '',
    'O Bom Piteu é uma plataforma tecnológica angolana que está a revolucionar a forma como as pessoas cozinham em casa. Nascido em Luanda em 2025, o nosso objetivo é tornar a cozinha inteligente acessível a todos, combinando tradição gastronómica com inteligência artificial de ponta.',
    '',
    'A NOSSA HISTÓRIA',
    'Tudo começou com um grupo de amigos apaixonados por culinária e tecnologia, que perceberam que muitas pessoas tinham dificuldade em cozinhar refeições saudáveis e variadas devido à falta de tempo, conhecimento ou inspiração. Decidiram criar uma solução que aprendesse com as preferências de cada um e gerasse receitas personalizadas, ao mesmo tempo que reduzia o desperdício alimentar.',
    'Após meses de desenvolvimento e testes com centenas de utilizadores, o Bom Piteu foi lançado oficialmente em janeiro de 2026. A recepção foi entusiástica, e hoje contamos com mais de 125.000 utilizadores em 27 países.',
    '',
    'A NOSSA EQUIPA',
    'Fundadores:',
    '- Joaquim Carruagem (CEO): Chef profissional com 10 anos de experiência em cozinha internacional e certificação em nutrição. É o responsável pela curadoria das receitas e pela "alma" do Chef IA.',
    '- Santos Pedro (CTO): Arquiteto de software com 15 anos de experiência em sistemas escaláveis e inteligência artificial. Lidera o desenvolvimento tecnológico e a equipa de engenharia.',
    '- Mauricio Carruagem (CPO): Engenheiro de produto especializado em experiência do utilizador e design de interfaces. Garante que a aplicação seja intuitiva e agradável para todos.',
    'A nossa equipa inclui ainda nutricionistas, especialistas em segurança alimentar, designers e engenheiros de software, todos dedicados a oferecer a melhor experiência culinária.',
    '',
    'A NOSSA MISSÃO',
    'Democratizar o acesso a refeições saudáveis e sustentáveis em todo o mundo, usando tecnologia de ponta para criar soluções personalizadas que se adaptam à vida de cada família.',
    '',
    'OS NOSSOS VALORES',
    '1. Inovação: Estamos constantemente a explorar novas formas de usar a IA para simplificar a cozinha.',
    '2. Sustentabilidade: Promovemos o aproveitamento integral dos alimentos e a redução do desperdício.',
    '3. Saúde: Ajudamos os utilizadores a fazer escolhas alimentares mais conscientes.',
    '4. Tradição: Valorizamos as receitas tradicionais angolanas e de todo o mundo, adaptando-as aos tempos modernos.',
    '5. Comunidade: Criamos um espaço onde todos podem partilhar, aprender e celebrar a comida.',
    '',
    'RECONHECIMENTOS',
    '- Vencedor do Prémio de Inovação Tecnológica 2026 (Angola Digital Awards).',
    '- Certificação ISO 27001 (Segurança da Informação).',
    '- Membro da Associação Angolana de Startups.',
    '',
    'ONDE ESTAMOS',
    'Sede: Benfica, Zona verde 3, Luanda, Angola',
    'Horário de funcionamento: Segunda a sexta, 9h – 18h (GMT+1)',
    '',
    'CONTACTOS',
    'Geral: centaurosa@gmail.com',
    'Apoio: centaurosa@gmail.com',
    'Parcerias: centaurosa@gmail.com',
    'Telefone: +244 958 999 999',
    '',
    'REDES SOCIAIS',
    'Facebook: /bompiteu',
    'Instagram: @bompiteu',
    'LinkedIn: /company/bom-piteu',
    '',
    'Data de entrada em vigor: 18 de março de 2026'
  ];

  let y = 40;
  const maxWidth = 170;
  const lineHeight = 7;

  content.forEach(paragraph => {
    y = addWrappedText(doc, paragraph, 20, y, maxWidth, lineHeight);
    y += 3;
    if (y > 280) {
      doc.addPage();
      addHeader(doc, 'SOBRE NÓS (continuação)', '1.0', '18 de março de 2026');
      y = 40;
    }
  });

  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter(doc, i);
  }

  return doc.output('blob');
};

// Gerar Parcerias
export const generatePartnerships = () => {
  const doc = new jsPDF();
  addHeader(doc, 'PARCERIAS', '1.2', '18 de março de 2026');

  const content = [
    '',
    'No Bom Piteu, acreditamos que a colaboração é a chave para transformar a alimentação. Convidamos empresas e organizações a juntarem-se a nós nesta missão.',
    '',
    'MODELOS DE PARCERIA',
    '1. Supermercados e retalhistas alimentares:',
    '   - Integração da lista de compras do Bom Piteu com o vosso sistema, permitindo que os utilizadores adicionem ingredientes diretamente ao carrinho online.',
    '   - Promoções exclusivas para utilizadores Bom Piteu baseadas nas suas preferências.',
    '   - Acesso a dados anonimizados de consumo para otimizar stocks e campanhas.',
    '',
    '2. Marcas alimentares:',
    '   - Desenvolvimento de receitas em destaque com os vossos produtos, promovendo-os na nossa plataforma.',
    '   - Campanhas direcionadas a utilizadores com perfis específicos (ex.: vegetarianos, desportistas).',
    '   - Testes de novos produtos com a nossa comunidade.',
    '',
    '3. Saúde e bem-estar:',
    '   - Parcerias com nutricionistas, dietistas e clínicas para criação de programas alimentares personalizados.',
    '   - Integração com ginásios e aplicações de fitness (ex.: sugestões de refeições pós-treino).',
    '   - Conteúdo especializado sobre nutrição e saúde.',
    '',
    '4. Instituições de ensino e formação:',
    '   - Utilização do Bom Piteu como ferramenta pedagógica em cursos de culinária e nutrição.',
    '   - Desenvolvimento de módulos educativos conjuntos.',
    '',
    '5. Tecnologia e desenvolvimento:',
    '   - Integração via API para que outras aplicações possam oferecer funcionalidades do Bom Piteu.',
    '   - Colaboração em projetos de investigação em IA aplicada à nutrição.',
    '',
    'VANTAGENS DE SER PARCEIRO',
    '- Alcance um público segmentado e engajado de amantes da culinária.',
    '- Reforce a sua marca associando-a à inovação e saúde.',
    '- Obtenha insights valiosos sobre tendências alimentares.',
    '- Participe em eventos e webinars exclusivos.',
    '',
    'CASOS DE SUCESSO',
    'Já colaboramos com o Supermercado Mambo, que registou um aumento de 25% nas vendas de produtos promovidos nas nossas receitas. A marca de azeites "Ouro Verde" viu a sua notoriedade crescer 40% entre os nossos utilizadores após uma campanha de receitas dedicadas.',
    '',
    'COMO TORNAR-SE PARCEIRO',
    '1. Envie-nos um e-mail para centaurosa@gmail.com com uma breve descrição da sua empresa e proposta.',
    '2. Analisaremos o seu pedido e entraremos em contacto para uma reunião inicial (online ou presencial).',
    '3. Juntos, desenharemos um plano de parceria personalizado.',
    '4. Formalizaremos o acordo e iniciaremos a colaboração.',
    '',
    'CONTACTOS COMERCIAIS',
    'E-mail: centaurosa@gmail.com',
    'Telefone: +244 958 999 999',
    '',
    'Data de entrada em vigor: 18 de março de 2026'
  ];

  let y = 40;
  const maxWidth = 170;
  const lineHeight = 7;

  content.forEach(paragraph => {
    y = addWrappedText(doc, paragraph, 20, y, maxWidth, lineHeight);
    y += 3;
    if (y > 280) {
      doc.addPage();
      addHeader(doc, 'PARCERIAS (continuação)', '1.2', '18 de março de 2026');
      y = 40;
    }
  });

  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter(doc, i);
  }

  return doc.output('blob');
};

// Gerar Relatório de Transparência 2026
export const generateTransparencyReport = () => {
  const doc = new jsPDF();
  addHeader(doc, 'RELATÓRIO DE TRANSPARÊNCIA 2026', '1.0', '18 de março de 2026');

  const content = [
    '',
    'Este relatório tem como objetivo prestar contas sobre a forma como gerimos os dados dos nossos utilizadores e como lidamos com pedidos de autoridades, incidentes de segurança e outras métricas relevantes. Publicamo-lo anualmente como parte do nosso compromisso com a transparência.',
    '',
    'PERÍODO ABRANGIDO: 1 de janeiro de 2026 a 31 de dezembro de 2026',
    '',
    '1. PEDIDOS DE AUTORIDADES',
    'Recebemos 12 pedidos de entidades governamentais (tribunais, Ministério Público, etc.) durante o período.',
    '- Pedidos cumpridos total ou parcialmente: 10',
    '- Pedidos rejeitados por falta de fundamento legal: 2',
    'Os pedidos rejeitados referiam-se a informações excessivas ou não suficientemente justificadas. Em todos os casos, informámos o utilizador afetado, exceto quando proibido por lei.',
    '',
    '2. PEDIDOS DE UTILIZADORES (DIREITOS RGPD)',
    'Total de pedidos recebidos: 45',
    '- Pedidos de acesso: 23',
    '- Pedidos de retificação: 8',
    '- Pedidos de eliminação: 14',
    'Tempo médio de resposta: 5 dias (prazo legal: 30 dias).',
    '100% dos pedidos foram respondidos dentro do prazo.',
    '',
    '3. NOTIFICAÇÕES DE VIOLAÇÃO DE DADOS',
    'Número de incidentes de segurança com impacto em dados pessoais: 0',
    'Realizamos 4 auditorias de segurança independentes durante o ano, todas com resultados satisfatórios.',
    '',
    '4. PEDIDOS DE TERCEIROS (EX.: ADVOGADOS)',
    'Recebemos 5 pedidos de advogados em representação de clientes. Em todos os casos, solicitámos autorização do titular dos dados antes de qualquer divulgação.',
    '',
    '5. DADOS ESTATÍSTICOS AGREGADOS (ANONIMIZADOS)',
    '- Utilizadores ativos no final do período: 125.432',
    '- Novos registos no ano: 78.901',
    '- Receitas geradas pelo Chef IA: 2.345.678',
    '- Países com utilizadores: 27',
    '- Idiomas disponíveis: 8',
    '',
    '6. TRANSPARÊNCIA ALGORÍTMICA',
    'O nosso Chef IA baseia-se em modelos de linguagem treinados com receitas de domínio público e dados anonimizados. Não utilizamos dados pessoais para treinar modelos sem consentimento explícito.',
    'Realizamos avaliações periódicas para detetar e corrigir enviesamentos (bias) nos resultados.',
    '',
    '7. COMPROMISSOS PARA 2027',
    '- Lançar um portal público de transparência com dados atualizados trimestralmente.',
    '- Obter certificação ISO 27701 (Privacy Information Management).',
    '- Realizar uma auditoria externa ao algoritmo e publicar os resultados.',
    '- Aumentar a equipa de moderação para garantir resposta em menos de 24 horas.',
    '',
    '8. CONTACTOS',
    'Para questões sobre este relatório:',
    'E-mail: centaurosa@gmail.com',
    '',
    'Data de publicação: 18 de março de 2026'
  ];

  let y = 40;
  const maxWidth = 170;
  const lineHeight = 7;

  content.forEach(paragraph => {
    y = addWrappedText(doc, paragraph, 20, y, maxWidth, lineHeight);
    y += 3;
    if (y > 280) {
      doc.addPage();
      addHeader(doc, 'RELATÓRIO DE TRANSPARÊNCIA 2026 (continuação)', '1.0', '18 de março de 2026');
      y = 40;
    }
  });

  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter(doc, i);
  }

  return doc.output('blob');
};