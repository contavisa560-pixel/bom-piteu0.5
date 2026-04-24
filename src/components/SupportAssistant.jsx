import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Bot, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// ============================================
// BASE DE CONHECIMENTO EXTENSA
// ============================================
const knowledgeBase = [
  // ===== Conta e Registo =====
  {
    keywords: ['criar conta', 'registar', 'cadastrar', 'inscrever', 'sign up', 'novo utilizador', 'novo usuário'],
    answer: 'Para criar uma conta, clique em "Registar" no canto superior direito. O processo é gratuito e rápido. Necessita apenas de um email e palavra-passe.'
  },
  {
    keywords: ['gratuito', 'grátis', 'custa', 'preço', 'quanto custa', 'free'],
    answer: 'O Bom Piteu tem um plano gratuito que permite acesso a funcionalidades básicas, incluindo pesquisar receitas e utilizar o chat de IA com limites diários. Também oferecemos planos premium com vantagens adicionais.'
  },
  {
    keywords: ['esqueci senha', 'recuperar senha', 'reset password', 'nova senha', 'redefinir'],
    answer: 'Na página de login, clique em "Esqueci a senha". Receberá um email com instruções para criar uma nova palavra-passe. Verifique também a pasta de spam.'
  },
  {
    keywords: ['alterar senha', 'mudar password', 'trocar senha'],
    answer: 'Aceda ao seu Perfil > Definições de Segurança. Poderá alterar a palavra-passe a qualquer momento.'
  },
  {
    keywords: ['apagar conta', 'eliminar conta', 'remover conta', 'cancelar conta'],
    answer: 'Lamentamos vê-lo partir. Para eliminar a sua conta, aceda a Definições > Privacidade e selecione "Eliminar conta". Esta ação é irreversível.'
  },

  // ===== Planos e Assinaturas =====
  {
    keywords: ['planos', 'assinatura', 'premium', 'pago', 'mensalidade', 'anual', 'subscrever'],
    answer: 'Oferecemos planos Premium com benefícios como receitas exclusivas, análise de imagens ilimitada e prioridade no suporte. Consulte a página "Assinatura" no seu painel para ver preços e vantagens.'
  },
  {
    keywords: ['cancelar assinatura', 'parar pagamento', 'desativar premium'],
    answer: 'Pode cancelar a sua assinatura a qualquer momento em "Assinatura" > "Gerir assinatura". O acesso premium manter-se-á até ao fim do período pago.'
  },

  // ===== Funcionalidades do App =====
  {
    keywords: ['receita', 'como cozinhar', 'ingredientes', 'prato', 'sugestão', 'receitas'],
    answer: 'Use a barra de pesquisa na página principal para encontrar receitas por nome ou ingredientes. O nosso chat de IA também pode sugerir receitas personalizadas com base no que tem em casa.'
  },
  {
    keywords: ['chat', 'assistente', 'ia', 'inteligência artificial', 'conversar'],
    answer: 'O Chat de IA está disponível para todos os utilizadores. Pode pedir sugestões de receitas, tirar dúvidas sobre culinária ou pedir ajuda com o que cozinhar. Os utilizadores gratuitos têm um limite diário de mensagens.'
  },
  {
    keywords: ['imagem', 'foto', 'reconhecimento', 'analisar prato', 'câmara', 'upload'],
    answer: 'A funcionalidade "Análise de Imagem" permite tirar uma foto de ingredientes ou de um prato e receber sugestões. Disponível nos planos premium e com limite diário para gratuitos.'
  },
  {
    keywords: ['voz', 'comando de voz', 'falar', 'reconhecimento de voz'],
    answer: 'Pode utilizar comandos de voz para pesquisar receitas ou interagir com o chat. Basta clicar no microfone e falar claramente.'
  },
  {
    keywords: ['favoritos', 'guardar receita', 'salvar', 'minhas receitas'],
    answer: 'Para guardar uma receita nos favoritos, clique no ícone de coração na página da receita. As suas receitas favoritas ficam acessíveis no seu perfil.'
  },
  {
    keywords: ['histórico', 'receitas vistas', 'últimas pesquisas'],
    answer: 'O histórico das suas interações e receitas visualizadas pode ser encontrado em "Histórico" no menu principal.'
  },
  {
    keywords: ['notificações', 'alertas', 'lembretes'],
    answer: 'Pode configurar as notificações nas Definições. Receberá alertas sobre novas receitas, dicas e atualizações.'
  },

  // ===== Perfil e Dados Pessoais =====
  {
    keywords: ['editar perfil', 'alterar nome', 'mudar foto', 'avatar'],
    answer: 'No seu Perfil, clique em "Editar" para alterar nome, foto, data de nascimento e outras informações pessoais.'
  },
  {
    keywords: ['preferências alimentares', 'restrições', 'dieta', 'vegano', 'vegetariano', 'sem glúten', 'alergia'],
    answer: 'Nas Definições de Perfil, pode indicar as suas preferências e restrições alimentares. Isso ajuda o chat a sugerir receitas adequadas.'
  },
  {
    keywords: ['idioma', 'língua', 'português', 'inglês', 'espanhol'],
    answer: 'O Bom Piteu está disponível em português, inglês e espanhol. Pode alterar o idioma nas Definições > Idioma.'
  },

  // ===== Pagamentos e Faturação =====
  {
    keywords: ['métodos pagamento', 'cartão crédito', 'mbway', 'multibanco', 'transferência', 'paypal'],
    answer: 'Aceitamos cartões de crédito/débito, MB WAY, referência multibanco e transferência bancária. Todos os pagamentos são processados com segurança.'
  },
  {
    keywords: ['fatura', 'recibo', 'comprovativo', 'nif'],
    answer: 'Após cada pagamento, pode gerar o recibo/fatura na área "Assinatura" > "Histórico de pagamentos". Inclua o seu NIF nas definições de perfil para que apareça automaticamente.'
  },
  {
    keywords: ['problema pagamento', 'pagamento recusado', 'erro ao pagar'],
    answer: 'Se o pagamento for recusado, verifique os dados do cartão ou tente outro método. Caso persista, contacte o seu banco ou envie-nos um email com detalhes.'
  },

  // ===== Suporte e Ajuda =====
  {
    keywords: ['contacto', 'falar com humano', 'suporte', 'atendente', 'email', 'telefone'],
    answer: 'Para assistência personalizada, envie um email para suporte@bompiteu.com. Utilizadores premium têm prioridade no atendimento.'
  },
  {
    keywords: ['reportar bug', 'erro no app', 'problema técnico', 'falha'],
    answer: 'Lamentamos o inconveniente. Por favor, descreva o problema com o máximo de detalhes para suporte@bompiteu.com. Inclua versão do app e sistema operativo se possível.'
  },
  {
    keywords: ['sugestão', 'melhoria', 'ideia', 'feedback'],
    answer: 'Agradecemos o seu feedback! Envie-nos as suas sugestões para sugestoes@bompiteu.com. Ajuda-nos a melhorar.'
  },

  // ===== Privacidade e Segurança =====
  {
    keywords: ['privacidade', 'dados pessoais', 'rgpd', 'lgpd', 'proteção de dados'],
    answer: 'A sua privacidade é importante. Consulte a nossa Política de Privacidade em /privacy para saber como tratamos os seus dados.'
  },
  {
    keywords: ['dois fatores', '2fa', 'autenticação dois fatores', 'segurança extra'],
    answer: 'Pode ativar a autenticação de dois fatores nas Definições de Segurança. Isso adiciona uma camada extra de proteção à sua conta.'
  },
  {
    keywords: ['cookies', 'rastreamento'],
    answer: 'Utilizamos cookies para melhorar a experiência. Saiba mais na nossa Política de Cookies em /cookies.'
  },

  // ===== Marketplace e Parcerias =====
  {
    keywords: ['marketplace', 'comprar', 'vender', 'produtos', 'loja'],
    answer: 'O Marketplace permite-lhe descobrir produtos relacionados com culinária. Pode aceder através do menu principal.'
  },
  {
    keywords: ['parcerias', 'colaborar', 'anunciar', 'tornar parceiro'],
    answer: 'Interessado em parcerias? Envie um email para parcerias@bompiteu.com com a sua proposta.'
  }
];

// Função para normalizar texto
const normalize = (text) => {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
};

// Função que encontra a melhor resposta
const findAnswer = (question) => {
  const normalizedQuestion = normalize(question);
  let bestMatch = null;
  let maxMatches = 0;

  for (const item of knowledgeBase) {
    for (const keyword of item.keywords) {
      const normalizedKeyword = normalize(keyword);
      // Se a keyword estiver contida na pergunta (e não for muito curta)
      if (normalizedQuestion.includes(normalizedKeyword) && normalizedKeyword.length > 2) {
        // Conta quantas palavras da pergunta correspondem (opcional, mas podemos dar prioridade a mais palavras)
        // Para simplicidade, retornamos a primeira correspondência.
        // Mas podemos melhorar: se várias keywords do mesmo item baterem, esse item é mais relevante.
        // Vamos contar quantas keywords do item aparecem.
        let matchCount = 0;
        for (const kw of item.keywords) {
          if (normalizedQuestion.includes(normalize(kw))) matchCount++;
        }
        if (matchCount > maxMatches) {
          maxMatches = matchCount;
          bestMatch = item.answer;
        }
        // break? Não, porque queremos verificar todos os itens.
      }
    }
  }

  if (bestMatch) return bestMatch;

  // Fallback
  return 'Desculpe, não encontrei uma resposta para a sua pergunta. Tente reformular ou contacte-nos por email: suporte@bompiteu.com.';
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
const SupportAssistant = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState([
    { role: 'bot', content: 'Olá! Sou o assistente virtual do Bom Piteu. Pergunte-me sobre a plataforma.' }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);

    setTimeout(() => {
      const answer = findAnswer(input);
      setMessages(prev => [...prev, { role: 'bot', content: answer }]);
    }, 600);

    setInput('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[10000] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg h-[600px] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-500 to-red-500 text-white">
              <div className="flex items-center gap-2">
                <Bot size={24} />
                <h3 className="font-semibold text-lg">Assistente Virtual</h3>
              </div>
              <button onClick={onClose} className="text-white hover:text-gray-200 transition">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start gap-2 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    {msg.role === 'bot' && <Bot size={20} className="mt-1 text-orange-500 flex-shrink-0" />}
                    {msg.role === 'user' && <User size={20} className="mt-1 text-gray-500 flex-shrink-0" />}
                    <div
                      className={`p-3 rounded-2xl shadow-sm text-sm ${
                        msg.role === 'user'
                          ? 'bg-orange-500 text-white rounded-br-none'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="p-4 border-t dark:border-gray-700 flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escreva a sua pergunta..."
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white text-sm"
              />
              <button
                type="submit"
                className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl px-4 py-2 flex items-center gap-1 transition-colors"
              >
                <Send size={16} />
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SupportAssistant;