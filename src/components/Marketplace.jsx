
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ShoppingCart, ExternalLink, MapPin, Star, Search, Carrot, Apple, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from '@/components/ui/input';

const Marketplace = ({ onNavigate }) => {
  const partners = [
    {
      name: 'Tupuca',
      description: 'Entrega rápida de supermercado e restaurantes.',
      logo: 'Tupuca logo',
      url: 'https://www.tupuca.com/',
      distance: '1.2 km',
      rating: 4.8,
      category: 'Supermercado',
      image: 'https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8'
    },
    {
      name: 'Mambo',
      description: 'As tuas compras online com entrega em casa.',
      logo: 'Mambo logo',
      url: 'https://www.mambo.co.ao/',
      distance: '2.5 km',
      rating: 4.6,
      category: 'Supermercado',
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e'
    },
    {
      name: 'Paparoca Frescos',
      description: 'Produtos frescos e naturais, diretos do produtor.',
      logo: 'Paparoca logo',
      url: '#',
      distance: '3.1 km',
      rating: 4.9,
      category: 'Produtos Locais',
      image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37'
    },
    {
      name: 'Shoprite',
      description: 'Grande variedade de produtos a preços baixos.',
      logo: 'Shoprite logo',
      url: '#',
      distance: '1.8 km',
      rating: 4.5,
      category: 'Supermercado',
      image: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58'
    },
  ];

  const featuredProducts = [
    { name: 'Tomates Orgânicos', price: '850 Kz/kg', image: 'https://images.unsplash.com/photo-1561155653-2956a0da272c' },
    { name: 'Abacates Frescos', price: '1.200 Kz/kg', image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578' },
    { name: 'Cenouras Baby', price: '600 Kz/maço', image: 'https://images.unsplash.com/photo-1590431306482-f700ee050c59' },
    { name: 'Espinafres Frescos', price: '550 Kz/saco', image: 'https://images.unsplash.com/photo-1576045057995-568f588f2f80' },
  ];

  const handlePartnerClick = (partner) => {
    if (partner.url === '#') {
      toast({
        title: `Parceria em breve: ${partner.name}`,
        description: 'Estamos a trabalhar para integrar esta loja. Fica atento!',
      });
    } else {
      toast({
        title: `A redirecionar para ${partner.name}`,
        description: 'Serás levado para o site do nosso parceiro para fazeres as tuas compras.',
      });
      window.open(partner.url, '_blank');
    }
  };

  const handleMapClick = () => {
    toast({
      title: '🚧 Mapa em Construção!',
      description: 'Em breve poderás ver as lojas mais próximas de ti e traçar rotas!',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto"
    >
      <Button variant="ghost" onClick={() => onNavigate('dashboard')} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Voltar ao Início
      </Button>

      <div className="text-center mb-12">
        <ShoppingCart className="h-16 w-16 mx-auto text-orange-500" />
        <h1 className="text-4xl font-bold text-gray-800 mt-4">Marketplace Bom Piteu</h1>
        <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
          Falta-te um ingrediente? Compra vegetais e produtos frescos dos nossos parceiros e recebe em casa.
        </p>
      </div>

      <Tabs defaultValue="stores" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="stores"><ShoppingCart className="mr-2 h-4 w-4"/>Lojas Parceiras</TabsTrigger>
          <TabsTrigger value="products"><Carrot className="mr-2 h-4 w-4"/>Produtos Frescos</TabsTrigger>
          <TabsTrigger value="map"><MapPin className="mr-2 h-4 w-4"/>Mapa</TabsTrigger>
        </TabsList>

        <TabsContent value="stores">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input placeholder="Procurar loja ou produto..." className="pl-10" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {partners.map((partner, index) => (
              <motion.div
                key={partner.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-white hover:shadow-xl transition-shadow duration-300 flex flex-col h-full overflow-hidden">
                  <div className="h-40 overflow-hidden">
                    <img src={partner.image} alt={partner.name} className="w-full h-full object-cover"/>
                  </div>
                  <CardHeader>
                    <CardTitle>{partner.name}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-gray-500 pt-1">
                      <span className="flex items-center"><MapPin className="h-4 w-4 mr-1"/>{partner.distance}</span>
                      <span className="flex items-center"><Star className="h-4 w-4 mr-1 text-yellow-500 fill-yellow-500"/>{partner.rating}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="text-gray-600">{partner.description}</p>
                  </CardContent>
                  <CardFooter>
                    <Button
                      onClick={() => handlePartnerClick(partner)}
                      className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white"
                    >
                      Visitar Loja <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="products">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Produtos em Destaque</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {featuredProducts.map((product, index) => (
              <motion.div
                key={product.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="overflow-hidden group cursor-pointer">
                  <div className="h-40 overflow-hidden relative">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"/>
                    <div className="absolute inset-0 bg-black/20"></div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-gray-800">{product.name}</h3>
                    <p className="text-orange-600 font-bold">{product.price}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="map">
          <Card>
            <CardContent className="p-0">
              <div 
                className="h-[60vh] bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 cursor-pointer hover:bg-gray-300 transition-colors relative overflow-hidden"
                onClick={handleMapClick}
              >
                <img src="https://www.hostinger.com/tutorials/wp-content/uploads/sites/2/2022/07/what-is-openstreetmap.webp" alt="Mapa placeholder" className="w-full h-full object-cover opacity-50"/>
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-center justify-center">
                  <div className="text-center bg-white/80 p-8 rounded-lg shadow-xl backdrop-blur-sm">
                    <MapPin className="h-12 w-12 mx-auto mb-2 text-orange-500"/>
                    <p className="font-semibold text-xl text-gray-800">Ver mapa de lojas</p>
                    <p className="text-sm text-gray-600">(Funcionalidade em breve)</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default Marketplace;
