
    import React from 'react';
    import { motion } from 'framer-motion';
    import { ArrowLeft, Camera, Sparkles, Upload } from 'lucide-react';
    import { Button } from '@/components/ui/button';
    import { toast } from '@/components/ui/use-toast';
    import { Card, CardContent } from '@/components/ui/card';

    const ImageRecognition = ({ onNavigate, onStartChat, user }) => {
      const handleUpload = () => {
        if (!user.isPremium) {
          toast({
            title: "Funcionalidade Premium! ✨",
            description: "Analisa os teus ingredientes com a câmara e obtém receitas exclusivas. Faz upgrade para o plano Premium!",
            variant: "destructive",
          });
        } else {
          toast({
            title: '🚧 A câmara está a aquecer!',
            description: 'A análise de imagens estará disponível em breve para revolucionar a tua cozinha!',
          });
          // Simular reconhecimento e ir para o chat
          setTimeout(() => {
            onStartChat({ title: "Receita por Imagem", query: "Analisei a imagem, parece que tens tomates, queijo e manjericão. Que tal uma Pizza Margherita?" });
          }, 1500);
        }
      };

      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto text-center"
        >
          <Button variant="ghost" onClick={() => onNavigate('dashboard')} className="mb-8">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar ao Início
          </Button>

          <Camera className="h-24 w-24 mx-auto text-orange-500" />
          <h1 className="text-4xl font-bold text-gray-800 mt-4">Reconhecimento por Imagem</h1>
          <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
            Não sabes o que cozinhar? Tira uma foto aos teus ingredientes e deixa que o nosso Chef IA crie uma receita para ti.
          </p>

          <Card className="mt-12 bg-white/50">
            <CardContent className="p-8">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="border-2 border-dashed border-gray-300 rounded-2xl p-12 flex flex-col items-center justify-center cursor-pointer"
                onClick={handleUpload}
              >
                <Upload className="h-16 w-16 text-gray-400 mb-4" />
                <span className="font-semibold text-gray-700">Clica para carregar uma imagem</span>
                <span className="text-sm text-gray-500 mt-1">PNG, JPG, GIF até 10MB</span>
              </motion.div>
            </CardContent>
          </Card>
           <p className="text-sm text-gray-500 mt-6 flex items-center justify-center">
            <Sparkles className="h-4 w-4 mr-2 text-yellow-500" />
            Esta é uma funcionalidade Premium.
           </p>
        </motion.div>
      );
    };

    export default ImageRecognition;
  