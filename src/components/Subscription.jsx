
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CheckCircle, Gem, ArrowLeft, Star, Users } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const Subscription = ({ user, onSubscribe, onNavigate }) => {
  const [selectedPlan, setSelectedPlan] = useState('monthly');

  const premiumFeatures = [
    'Acesso a TODAS as receitas exclusivas',
    'Análise de ingredientes com a câmara',
    'Pesquisa por voz ilimitada',
    'Planeamento de refeições semanais',
    'Receitas para dietas especiais (Saúde)',
    'Sem anúncios',
  ];

  const handlePayment = (plan) => {
    if (plan === 'free') {
        onSubscribe('free');
        toast({
            title: "Plano Gratuito Ativado!",
            description: `Bem-vindo ao Bom Piteu, ${user.name.split(' ')[0]}! Começa a tua aventura culinária.`,
        });
        return;
    }

    toast({
      title: "A processar o seu pedido... 💳",
      description: "Esta é uma demonstração. Numa aplicação real, serias redirecionado para o pagamento.",
    });
    setTimeout(() => {
      onSubscribe(plan);
      toast({
        title: "Subscrição Ativada! ✨",
        description: `Bem-vindo ao Bom Piteu Premium, ${user.name.split(' ')[0]}!`,
      });
    }, 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto"
    >
      <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
        <Gem className="h-16 w-16 mx-auto text-yellow-500" />
        <h1 className="text-4xl font-bold text-gray-800 mt-4">Escolhe o teu Plano</h1>
        <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
          Desbloqueia todo o poder do Bom Piteu e eleva a tua experiência culinária a um novo nível.
        </p>

        <div className="grid md:grid-cols-3 gap-8 mt-10 text-left">
          {/* Plano Gratuito */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-gray-100 p-6 rounded-xl flex flex-col border-2 border-gray-200"
          >
            <Star className="h-8 w-8 text-gray-500 mb-2"/>
            <h2 className="text-2xl font-bold text-gray-800">Gratuito</h2>
            <p className="text-gray-600 mb-4">Para começar a explorar.</p>
            <p className="text-3xl font-extrabold text-gray-900 mb-6">0 Kz<span className="text-lg font-normal">/mês</span></p>
            <ul className="space-y-2 text-sm text-gray-700 mb-6">
                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2"/> Acesso a receitas populares</li>
                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2"/> 10 interações com o Chef IA / mês</li>
            </ul>
            <Button onClick={() => handlePayment('free')} variant="outline" className="w-full mt-auto">Continuar Grátis</Button>
          </motion.div>
          
          {/* Plano Premium */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-orange-50 p-6 rounded-xl flex flex-col border-2 border-orange-500 relative"
          >
            <div className="absolute -top-3 right-3 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">MAIS POPULAR</div>
            <Gem className="h-8 w-8 text-orange-500 mb-2"/>
            <h2 className="text-2xl font-bold text-orange-800">Premium</h2>
            <p className="text-orange-700/80 mb-4">A experiência completa.</p>
            <p className="text-3xl font-extrabold text-orange-600 mb-6">3.500 Kz<span className="text-lg font-normal">/mês</span></p>
            <ul className="space-y-2 text-sm text-gray-700 mb-6">
              {premiumFeatures.slice(0,3).map((f, i) => (
                <li key={i} className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2"/> {f}</li>
              ))}
            </ul>
            <Button onClick={() => handlePayment('monthly')} size="lg" className="w-full mt-auto bg-gradient-to-r from-orange-500 to-red-500 text-white">Subscrever Agora</Button>
          </motion.div>

          {/* Plano Familiar */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-blue-50 p-6 rounded-xl flex flex-col border-2 border-blue-200"
          >
            <Users className="h-8 w-8 text-blue-500 mb-2"/>
            <h2 className="text-2xl font-bold text-blue-800">Familiar</h2>
            <p className="text-blue-700/80 mb-4">Para toda a família.</p>
            <p className="text-3xl font-extrabold text-blue-600 mb-6">7.500 Kz<span className="text-lg font-normal">/mês</span></p>
            <ul className="space-y-2 text-sm text-gray-700 mb-6">
                <li className="flex items-center font-bold"><CheckCircle className="h-4 w-4 text-green-500 mr-2"/> Todas as vantagens Premium</li>
                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2"/> Até 5 perfis</li>
                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2"/> Sincronização de listas de compras</li>
            </ul>
            <Button onClick={() => handlePayment('family')} className="w-full mt-auto bg-blue-600 hover:bg-blue-700 text-white">Escolher Plano Familiar</Button>
          </motion.div>
        </div>
         <p className="text-xs text-gray-500 mt-8 text-center">
              Pagamentos seguros via VISA, PayPal e Multicaixa Express. Podes cancelar a qualquer momento.
            </p>
      </div>
    </motion.div>
  );
};

export default Subscription;
  