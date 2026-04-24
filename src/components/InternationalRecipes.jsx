import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, X, Clock, ChefHat, Utensils,
  Globe, Flame, Star, MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

// ─── Helper: converte URLs Unsplash para máxima qualidade ─────────────────────
const toHQ = (url) => {
  if (!url || !url.includes('unsplash.com')) return url;
  // Remove parâmetros antigos e aplica máxima qualidade
  const base = url.split('?')[0];
  return `${base}?w=1600&q=100&fit=crop&auto=format&fm=webp`;
};

// ─── Mapa de fotos por receita (todas convertidas para máxima qualidade) ───────
export const recipeImages = {
  "Pizza Margherita": toHQ("https://images.unsplash.com/photo-1574071318508-1cdbab80d002"),
  "Sushi (Hosomaki de Salmão)": "/transferir (9).png",
  "Tacos al Pastor": toHQ("https://images.unsplash.com/photo-1565299585323-38d6b0865b47"),
  "Ratatouille": toHQ("https://images.unsplash.com/photo-1572453800999-e8d2d1589b7c"),
  "Hambúrguer Clássico Americano": toHQ("https://images.unsplash.com/photo-1568901346375-23c9450c58cd"),
  "Paella Valenciana": toHQ("https://images.unsplash.com/photo-1534080564583-6be75777b70a"),
  "Feijoada Brasileira":"/Feijoada Brasileira.png",
  "Chicken Tikka Masala": toHQ("https://images.unsplash.com/photo-1565557623262-b51c2513a641"),
  "Pad Thai": toHQ("https://images.unsplash.com/photo-1559314809-0d155014e29e"),
  "Bobotie": toHQ("https://images.unsplash.com/photo-1574484284002-952d92456975"),
  "Jollof Rice": toHQ("https://images.unsplash.com/photo-1604329760661-e71dc83f8f26"),
  "Peking Duck (Pato à Pequim)": toHQ("https://images.unsplash.com/photo-1518492104633-130d0cc84637"),
  "Wiener Schnitzel": toHQ("https://images.unsplash.com/photo-1599921841143-819065a55cc6"),
  "Moussaka": toHQ("https://images.unsplash.com/photo-1600891964092-4316c288032e"),
  "Goulash": toHQ("https://images.unsplash.com/photo-1547592166-23ac45744acd"),
  "Ceviche Peruano": "/transferir (6).jpeg",
  "Kimchi": "/transferir (5).jpeg",
  "Fish and Chips": toHQ("https://images.unsplash.com/photo-1518492104633-130d0cc84637"),
  "Poutine": toHQ("https://images.unsplash.com/photo-1585238342024-78d387f4a707"),
  "Arepas": toHQ("https://images.unsplash.com/photo-1604329760661-e71dc83f8f26"),
  "Tagine de Cordeiro": toHQ("https://images.unsplash.com/photo-1547592180-85f173990554"),
  "Pho Bo (Sopa de Noodles de Vaca)": toHQ("https://images.unsplash.com/photo-1555126634-323283e090fa"),
  "Borscht": toHQ("https://images.unsplash.com/photo-1603105037880-880cd4edfb0d"),
  "Couscous com Sete Legumes": toHQ("https://images.unsplash.com/photo-1574484284002-952d92456975"),
  "Köttbullar (Almôndegas Suecas)": toHQ("https://images.unsplash.com/photo-1529042410759-befb1204b468"),
  "Injera com Doro Wat": "/transferir (2).jpeg",
  "Ful Medames": toHQ("https://images.unsplash.com/photo-1511690656952-34342bb7c2f2"),
  "Thieboudienne": toHQ("https://images.unsplash.com/photo-1604329760661-e71dc83f8f26"),
  "Maafe": toHQ("https://images.unsplash.com/photo-1547592180-85f173990554"),
  "Nyama Choma": toHQ("https://images.unsplash.com/photo-1544025162-d76694265947"),
  "Muamba de Galinha": toHQ("https://images.unsplash.com/photo-1567364816519-cbc0f5f59474"),
  "Ndolé": toHQ("https://images.unsplash.com/photo-1574484284002-952d92456975"),
  "Mafe de Amendoim": toHQ("https://images.unsplash.com/photo-1547592180-85f173990554"),
  "Sadza com Nyama": toHQ("https://images.unsplash.com/photo-1544025162-d76694265947"),
  "Chakalaka": toHQ("https://images.unsplash.com/photo-1512621776951-a57141f2eefd"),
  "Piri-Piri de Camarão": toHQ("https://images.unsplash.com/photo-1565557623262-b51c2513a641"),
  "Romazava": toHQ("https://images.unsplash.com/photo-1547592180-85f173990554"),
  "Shakshuka": toHQ("https://images.unsplash.com/photo-1590412200988-a436970781fa"),
  "Mansaf": toHQ("https://images.unsplash.com/photo-1529042410759-befb1204b468"),
  "Kabsa": toHQ("https://images.unsplash.com/photo-1604329760661-e71dc83f8f26"),
  "Hummus": toHQ("https://images.unsplash.com/photo-1631452180519-c014fe946bc7"),
  "Dolma": "/transferir (4).jpeg",
  "Ash Reshteh": toHQ("https://images.unsplash.com/photo-1547592180-85f173990554"),
  "Biryani": toHQ("https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8"),
  "Dal Bhat": toHQ("https://images.unsplash.com/photo-1546833999-b9f581a1996d"),
  "Momo": toHQ("https://images.unsplash.com/photo-1626804475297-41608ea09aeb"),
  "Khachapuri": toHQ("https://images.unsplash.com/photo-1603105037880-880cd4edfb0d"),
  "Pelmeni": toHQ("https://images.unsplash.com/photo-1559314809-0d155014e29e"),
  "Pierogi": toHQ("https://images.unsplash.com/photo-1565299507177-b0ac66763828"),
  "Svíčková": toHQ("https://images.unsplash.com/photo-1544025162-d76694265947"),
  "Smørrebrød": "/transferir (3).jpeg",
  "Fiskesupe": toHQ("https://images.unsplash.com/photo-1547592180-85f173990554"),
  "Kalakukko": toHQ("https://images.unsplash.com/photo-1574484284002-952d92456975"),
  "Stroopwafel": toHQ("https://images.unsplash.com/photo-1558961363-fa8fdf82db35"),
  "Carbonnade Flamande": toHQ("https://images.unsplash.com/photo-1547592180-85f173990554"),
  "Pastel de Nata": toHQ("https://images.unsplash.com/photo-1558961363-fa8fdf82db35"),
  "Khinkali": toHQ("https://images.unsplash.com/photo-1626804475297-41608ea09aeb"),
  "Cevapi": toHQ("https://images.unsplash.com/photo-1544025162-d76694265947"),
  "Burek": toHQ("https://images.unsplash.com/photo-1603105037880-880cd4edfb0d"),
  "Baklava": toHQ("https://images.unsplash.com/photo-1558961363-fa8fdf82db35"),
  "Khorovats": toHQ("https://images.unsplash.com/photo-1544025162-d76694265947"),
  "Plov": toHQ("https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8"),
  "Beshbarmak": toHQ("https://images.unsplash.com/photo-1529042410759-befb1204b468"),
  "Kare Kare": toHQ("https://images.unsplash.com/photo-1547592180-85f173990554"),
  "Nasi Goreng": toHQ("https://images.unsplash.com/photo-1512058564366-18510be2db19"),
  "Laksa": toHQ("https://images.unsplash.com/photo-1555126634-323283e090fa"),
  "Hainanese Chicken Rice": toHQ("https://images.unsplash.com/photo-1604329760661-e71dc83f8f26"),
  "Adobo de Frango": toHQ("https://images.unsplash.com/photo-1567364816519-cbc0f5f59474"),
  "Tom Yum Goong": toHQ("https://images.unsplash.com/photo-1559314809-0d155014e29e"),
  "Banh Mi": toHQ("https://images.unsplash.com/photo-1568901346375-23c9450c58cd"),
  "Gyoza": toHQ("https://images.unsplash.com/photo-1626804475297-41608ea09aeb"),
  "Dim Sum (Har Gow)": toHQ("https://images.unsplash.com/photo-1563245372-f21724e3856d"),
  "Rendang": toHQ("https://images.unsplash.com/photo-1574484284002-952d92456975"),
  "Pho Chay (Pho Vegetariano)": toHQ("https://images.unsplash.com/photo-1555126634-323283e090fa"),
  "Empanada Argentina": toHQ("https://images.unsplash.com/photo-1565299585323-38d6b0865b47"),
  "Asado": toHQ("https://images.unsplash.com/photo-1544025162-d76694265947"),
  "Caldo de Gallina": toHQ("https://images.unsplash.com/photo-1547592180-85f173990554"),
  "Anticucho": toHQ("https://images.unsplash.com/photo-1565299507177-b0ac66763828"),
  "Bandeja Paisa": toHQ("https://images.unsplash.com/photo-1604329760661-e71dc83f8f26"),
  "Chivito": toHQ("https://images.unsplash.com/photo-1568901346375-23c9450c58cd"),
  "Salteña": toHQ("https://images.unsplash.com/photo-1565299585323-38d6b0865b47"),
  "Mofongo": toHQ("https://images.unsplash.com/photo-1574484284002-952d92456975"),
  "Jouk": toHQ("https://images.unsplash.com/photo-1546833999-b9f581a1996d"),
  "Pelau": toHQ("https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8"),
  "Ropa Vieja": toHQ("https://images.unsplash.com/photo-1547592180-85f173990554"),
  "Pollo a la Brasa": "/transferir (7).jpeg",
  "Sopa de Lima": toHQ("https://images.unsplash.com/photo-1559314809-0d155014e29e"),
  "Stamppot": toHQ("https://images.unsplash.com/photo-1574484284002-952d92456975"),
  "Tartiflette": toHQ("https://images.unsplash.com/photo-1603105037880-880cd4edfb0d"),
  "Haggis": toHQ("https://images.unsplash.com/photo-1544025162-d76694265947"),
  "Irish Stew": toHQ("https://images.unsplash.com/photo-1547592180-85f173990554"),
  "Zürcher Geschnetzeltes": toHQ("https://images.unsplash.com/photo-1544025162-d76694265947"),
  "Brandade de Bacalhau": "randade de Bacalhau.jpeg",
  "Pastel de Choclo": toHQ("https://images.unsplash.com/photo-1574484284002-952d92456975"),
  "Seco de Cordero": toHQ("https://images.unsplash.com/photo-1547592180-85f173990554"),
  "Cachapa": toHQ("https://images.unsplash.com/photo-1558961363-fa8fdf82db35"),
  "Mole Negro": toHQ("https://images.unsplash.com/photo-1567364816519-cbc0f5f59474"),
  "Muamba de Galinha": "/transferir (1).jpeg",

  "Cachupa Rica": "/Cachupa Rica.png",
  "Cachupa Guisada": "/Cachupa Guisada (Cachupa Refogada).png",
  "Caldo de Peixe": "/Caldo de Peixe Caldeirada.png",
  "Mufete": "/Mufete.png",
  "Feijoada Cabo-Verdiana": "/Feijoada Cabo-Verdiana.png",
  "Arroz de Polvo": "/Arroz de Polvo.png",
  "Arroz de Marisco": "/Arroz de Marisco.png",
  "Búzio Guisado": "/Búzio Guisado.png",
  "Lapas Guisadas": "/Lapas Guisadas.png",
  "Peixe Assado na Brasa": "/Peixe Assado na Brasa (Grelhado).png",
  "Moreia Frita": "/Moreia Frita.png",
  "Lapas Grelhadas": "/Lapas Grelhadas.png",
  "Carne de Porco com Favas": "/Carne de Porco com Favas.png",
  "Lagosta Suada": "/Lagosta Suada (Estufada).png",
  "Salada Morna de Tubarão": "/Salada morna de tubarão.png",
  "Moamba de Galinha (Angola)": "/Moamba de Galinha (Angola).png",
  "Calulu de Peixe": "/Calulu de Peixe.png",
  "Calulu de Carne Seca": "/Calulu de Carne Seca.png",
  "Funge de Bombó": "/Funge de Bombó.png",
  "Funge de Milho": "/Funge de Milho.png",
  "Mufete (Angola)": "/Mufete (Angola).png",
  "Feijão de Óleo de Palma": "/Feijão de Óleo de Palma.png",
  "Moamba de Peixe": "/Moamba de Peixe.png",
  "Arroz de Garoupa": "/Arroz de Garoupa.png",
  "Cabrito Assado": "/Cabrito Assado.png",
  "Caldo da Dipanda": "/Caldo da Dipanda.png",
  "Feijoada de Luanda": "/Feijoada de Luanda.png",
  "Galinha à Cabidela": "/Galinha à Cabidela.png",
  "Moamba de Bacalhau com Funge": "/Moamba de Bacalhau com Funge.png",
  "Moamba de Galinha com Pirão": "/Moamba de Galinha com Pirão.png",
  "Muqueca de Bacalhau": "/Muqueca de Bacalhau.png",
  "Muqueca de Camarão": "/Muqueca de Camarão.png",
  "Muzongué": "/Muzongué.png",
  "Quizaca": "/Quizaca.png",
  "Galinha Rija com Muamba": "/Galinha Rija com Muamba.png",
  "Fumbua (Kizaka)": "/Fumbua (Kizaka).png",
  "Muteta": "/Muteta.png",
  "Liboke": "/Liboke.jpeg",
  "Makayabu": "/Makayabu.jpeg",
  "Catato": "/Catato.jpeg",
  "Pirão": "/Pirão.jpeg",
  "Quibeba": "/Quibeba.jpeg",
  "Sumatena (Súmate)": "/Sumatena (Súmate).png",
  "Gonguenha": "/Gonguenha.png",
  "Moqueca (Angola)": "/Moqueca (Angola).jpeg",
  "Mututo": "/Mututo.jpeg",
  "Cocada (Angola)": "/Cocada (Angola).png",


  "Tortilla de Patatas": "/Tortilla de Patatas.png",
  "Gazpacho Andaluz": "/Gazpacho Andaluz.png",
  "Cocido Madrileño": "/Cocido Madrileño.png",
  "Fabada Asturiana": "/Fabada Asturiana.png",
  "Lentejas con Chorizo": "/Lentejas con Chorizo.png",
  "Callos a la Madrileña": "/Callos à la Madrileña.png",
  "Pulpo a la Gallega": "/Pulpo à la Gallega.png",
  "Gambas al Ajillo": "/Gambas al Ajillo.png",
  "Boquerones en Vinagre": "/Boquerones en Vinagre.png",
  "Rabo de Toro": "/Rabo de Toro.png",
  "Pimientos del Padrón": "/Pimientos del Padrón.png",
  "Croquetas de Jamón": "/Croquetas de Jamón.png",
  "Churros con Chocolate": "/Churros con Chocolate.png",
  "Crema Catalana": "/Crema Catalana.png",
  "Tarta de Santiago": "/Tarta de Santiago.png",
  "Torrijas": "/Torrijas.png",
  "Mac 'n' Cheese": "/Mac 'n' Cheese.png",
  "Southern Fried Chicken": "/Southern Fried Chicken.png",
  "New York Style Hot Dog": "/New York Style Hot Dog.png",
  "Classic Meatloaf": "/Classic Meatloaf.png",
  "Texas BBQ Brisket": "/Texas BBQ Brisket .png",
  "Slow Cooker Pulled Pork": "/Slow Cooker Pulled Pork.png",
  "Seafood Gumbo": "/Seafood Gumbo.png",
  "Jambalaya": "/Jambalaya.png",
  "Buffalo Wings": "/Buffalo Wings.png",
  "New England Clam Chowder": "/New England Clam Chowder.png",
  "Maine Lobster Roll": "/Maine Lobster Roll.png",
  "Maryland Crab Cakes": "/Maryland Crab Cakes.png",
  "Chicago Deep Dish Pizza": "/Chicago Deep Dish Pizza.png",
  "Apple Pie": "/Apple Pie.png",
  "Fluffy Pancakes": "/Fluffy Pancakes.png",
  "New York Cheesecake": "/New York Cheesecake.png",
  "Chocolate Chip Cookies": "/Chocolate Chip Cookies.png",
  "Pecan Pie": "/Pecan Pie.png",
  "Eggs Benedict": "/Eggs Benedict.png",
  "Lasagna alla Bolognese": "/Lasagna alla Bolognese.png",
  "Spaghetti alla Carbonara": "/Spagueth.png",
  "Risotto alla Milanese": "/risoto.png",
  "Trofie al Pesto": "/trofier 2.png",
  "Penne all'Arrabbiata": "/Penne.png",
  "Tagliatelle al Tartufo": "/Tagliatelle al Tartufo.png",
  "Tortellini in Brodo": "/Tortellini in Brodo.png",
  "Bistecca alla Fiorentina": "/Bistecca alla Fiorentina.png",
  "Ossobuco alla Milanese": "/Ossobuco alla Milanese.png",
  "Saltimbocca alla Romana": "/Saltimbocca alla Romana.png",
  "Cacciucco": "/Cacciucco.png",
  "Pollo alla Cacciatora": "/Pollo alla Cacciatora.png",
  "Pizza Napoletana": "/pizza-napolitana-margherita-com-mussarela-e-molho-de-tomate-servido-em-uma-mesa-de-madeira-para-um-jantar-no-restaurante-italiano-italia-co.webp",
  "Arancini": "/Arancini.png",
  "Focaccia di Recco": "/focaccia-di-recco-3-1200px.webp",
  "Melanzane alla Parmigiana": "/parmigiana-di-melanzane-7.webp",
  "Carpaccio di Manzo": "/Carpaccio di Manzo.png",
  "Tiramisù": "/Tiramisù.png",
  "Panna Cotta": "/Panna Cotta.png",
  "Cannoli Siciliani": "/Cannoli.webp",

  "Sushi (Nigiri)": "/Sushi (Nigiri).png",
  "Sashimi": "/Sashimi.png",
  "Unagi no Kabayaki": "/Unagi no Kabayaki.png",
  "Takoyaki": "/Takoyaki.png",
  "Shoyu Ramen": "/Shoyu Ramen.png",
  "Kake Udon": "/Kake Udon.png",
  "Zaru Soba": "/Zaru Soba .png",
  "Misoshiru (Sopa de Missô)": "/Misoshiru (Sopa de Missô).png",
  "Tempura": "/Tempura.jpeg",
  "Tonkatsu": "/Tonkatsu.jpeg",
  "Yakitori": "/Yakitori.jpeg",
  "Sukiyaki": "/Sukiyaki.jpeg",
  "Gyudon": "/Gyudon.jpeg",
  "Okonomiyaki": "/Okonomiyaki.jpeg",
  "Karē Raisu (Curry Japonês)": "/Karē Raisu (Curry Japonês).jpeg",
  "Onigiri": "/Onigiri.jpeg",
  "Omurice": "/Omurice.jpeg",
  "Mochi": "/Mochi.jpeg",
  "Dorayaki": "/Dorayaki.jpeg",
  "Taiyaki": "/Taiyaki.jpeg",

  "Tacos al Pastor": "/Tacos al Pastor.png",
  "Chilaquiles Verdes": "/Chilaquiles Verdes.png",
  "Enchiladas Rojas": "/Enchiladas Rojas.png",
  "Quesadillas": "/Quesadillas.png",
  "Tamales de Carne": "/Tamales de Carne.png",
  "Gorditas de Chicharrón": "/Gorditas de Chicharrón.png",
  "Mole Poblano": "/Mole Poblano.png",
  "Chiles en Nogada": "/Chiles en Nogada.png",
  "Pozole Rojo": "/Pozole Rojo.png",
  "Cochinita Pibil": "/Cochinita Pibil.png",
  "Birria de Res": "/Birria de Res.png",
  "Barbacoa": "/Barbacoa.png",
  "Aguachile Verde de Camarão": "/Aguachile Verde de Camarão.png",
  "Pescado a la Talla": "/Pescado a la Talla.png",
  "Ceviche Mexicano": "/Ceviche Mexicano.png",
  "Sopa de Lima": "/Sopa de Lima.png",
  "Tlayuda Oaxaqueña": "/Tlayuda Oaxaqueña.png",
  "Pambazos": "/Pambazos.png",
  "Aguachile de Callo de Hacha": "/Aguachile de Callo de Hacha.png",
  "Mole Negro Oaxaqueño": "/Mole Negro Oaxaqueño.png",
  "Bacalhau à Brás": "/transferir (8).jpeg",
  "Bacalhau com Natas": "/Bacalhau com Natas.png",
  "Sardinhas Assadas": "/Sardinhas Assadas.png",
  "Arroz de Marisco": "/Arroz de Marisco 1.png",
  "Polvo à Lagareiro": "/Polvo à Lagareiro .png",
  "Cataplana de Peixe": "/Cataplana de Peixe.png",
  "Amêijoas à Bulhão Pato": "/Amêijoas à Bulhão Pato.png",
  "Cozido à Portuguesa": "/Cozido à Portuguesa.png",
  "Francesinha": "/Francesinha.png",
  "Alheira de Mirandela": "/Alheira de Mirandela.png",
  "Carne de Porco à Alentejana": "/Carne de Porco à Alentejana.png",
  "Rojões à Moda do Minho": "/Rojões à Moda do Minho.png",
  "Arroz de Pato": "/Arroz de Pato.png",
  "Caldo Verde": "/Caldo Verde.png",
  "Pica-pau": "/Pica-pau.png",
  "Pastel de Nata": "/Pastel de Nata.png",
  "Arroz Doce": "/Arroz Doce.png",
  "Pão de Ló de Alfeizerão": "/Pão de Ló de Alfeizerão.png",
  "Ovos Moles de Aveiro": "/Ovos Moles de Aveiro.png",

  "Pad Thai": "/Pad Thai.png",
  "Tom Yum Goong": "/Tom Yum Goong.png",
  "Green Curry (Gaeng Keow Wan)": "/Green Curry (Gaeng Keow Wan).png",
  "Som Tum (Salada de Papaia Verde)": "/Som Tum (Salada de Papaia Verde).png",
  "Mango Sticky Rice (Khao Niew Mamuang)": "/Mango Sticky Rice (Khao Niew Mamuang).png",
  "Massaman Curry": "/Massaman Curry.png",
  "Pad Krapow Moo Saap (Porco com Manjericão Sagrado)": "/Pad Krapow Moo Saap (Porco com Manjericão Sagrado).png",
  "Khao Pad (Arroz Frito Tailandês)": "/Khao Pad (Arroz Frito Tailandês).png",
  "Larb Gai (Salada de Frango Picante)": "/Larb Gai (Salada de Frango Picante).png",
  "Pad See Ew (Macarrão Largo com Soja)": "/Pad See Ew (Macarrão Largo com Soja).png",
  "Tom Kha Gai (Sopa de Frango com Coco)": "/Tom Kha Gai (Sopa de Frango com Coco).png",
  "Satay de Frango": "/Satay de Frango.png",
  "Khao Soi (Sopa de Curry com Macarrão Crocante)": "/Khao Soi (Sopa de Curry com Macarrão Crocante).png",
  "Gai Pad Med Ma-muang (Frango com Castanhas)": "/Gai Pad Med Ma-muang (Frango com Castanhas).png",
  "Pad Kee Mao (Drunken Noodles)": "/Pad Kee Mao (Drunken Noodles).png",
  "Red Curry (Gaeng Daeng)": "/Red Curry (Gaeng Daeng).png",
  "Tod Mun Pla (Bolinhos de Peixe)": "/Tod Mun Pla (Bolinhos de Peixe).png",
  "Yam Nua (Salada de Carne Grelhada)": "/Yam Nua (Salada de Carne Grelhada).png",
  "Sai Oua (Salsicha do Norte)": "/Sai Oua (Salsicha do Norte).png",
  "Khanom Krok (Panquecas de Coco)": "/Khanom Krok (Panquecas de Coco).png",
  "Porco Agridoce (Tangcu Liji)": "/Porco Agridoce (Tangcu Liji).png",

  "Frango Kung Pao (Gong Bao Ji Ding)": "/Frango Kung Pao (Gong Bao Ji Ding).png",
  "Porco Dongpo": "/Porco Dongpo.png",
  "Char Siu (Churrasco de Porco)": "/Char Siu (Churrasco de Porco).png",
  "Har Gow (Dim Sum de Camarão)": "/Har Gow (Dim Sum de Camarão).png",
  "Jiaozi (Dumplings Tradicionais)": "/Jiaozi (Dumplings Tradicionais).png",
  "Xiaolongbao (Soup Dumplings)": "/Xiaolongbao (Soup Dumplings).png",
  "Zha Jiang Mian (Macarrão com Pasta de Soja)": "/Zha Jiang Mian (Macarrão com Pasta de Soja).png",
  "Wonton Soup": "/Wonton Soup.png",
  "Mapo Tofu": "/Mapo Tofu.png",
  "Chow Mein (Macarrão Frito)": "/Chow Mein (Macarrão Frito).jpeg",
  "Pato Laqueado (Peking Duck)": "/Pato Laqueado (Peking Duck).jpeg",
  "Porco à Cantonesa (Char Siu no forno)": "/Porco à Cantonesa (Char Siu no forno).png",
  "Guotie (Dumplings Fritos)": "/Guotie (Dumplings Fritos).jpeg",
  "Frango com Castanha de Caju (Kai Shou Ji)": "/Frango com Castanha de Caju (Kai Shou Ji).jpeg",
  "Tofu com Molho de Ostra (Tofu com Cogumelos)": "/Tofu com Molho de Ostra (Tofu com Cogumelos).jpeg",
  "Ovos Centenários (Pidan) com Tofu": "/Ovos Centenários (Pidan) com Tofu.jpeg",
  "Bolo de Lua (Mooncake)": "/Bolo de Lua (Mooncake).jpeg",

  "Coq au Vin": "/Coq au Vin.jpeg",
  "Boeuf Bourguignon": "/Boeuf Bourguignon.jpeg",
  "Quiche Lorraine": "/Quiche Lorraine.jpeg",
  "Soupe à l'Oignon": "/Soupe à l'Oignon.jpeg",
  "Bouillabaisse": "/Bouillabaisse.jpeg",
  "Tarte Tatin": "/Tarte Tatin.jpeg",
  "Crêpes": "/Crêpes.jpeg",
  "Croque Monsieur": "/Croque Monsieur.jpeg",
  "Cassoulet": "/Cassoulet.jpeg",
  "Escargots de Bourgogne": "/Escargots de Bourgogne.jpeg",
  "Salade Niçoise": "/Salade Niçoise.jpeg",
  "Moules Marinières": "/Moules Marinières.jpeg",
  "Gratin Dauphinois": "/Gratin Dauphinois.jpeg",
  "Profiteroles": "/Profiteroles.jpeg",
  "Crème Brûlée": "/Crème Brûlée.jpeg",

  "Chicken Tikka Masala": "/Chicken Tikka Masala.jpeg",
  "Butter Chicken (Murgh Makhani)": "/Butter Chicken (Murgh Makhani).jpeg",
  "Biryani de Frango": "/Biryani de Frango.jpeg",
  "Palak Paneer": "/Palak Paneer.jpeg",
  "Rogan Josh": "/Rogan Josh.jpeg",
  "Dal Makhani": "/Dal Makhani.jpeg",
  "Chana Masala": "/Chana Masala.jpeg",
  "Saag Paneer": "/Saag Paneer.jpeg",
  "Tandoori Chicken": "/Tandoori Chicken.jpeg",
  "Malai Kofta": "/Malai Kofta.jpeg",
  "Pani Puri (Golgappa)": "/Pani Puri (Golgappa).jpeg",
  "Samosas": "/Samosas.jpeg",
  "Naan (Pão Indiano)": "/Naan (Pão Indiano).jpeg",
  "Pav Bhaji": "/Pav Bhaji.jpeg",
  "Aloo Gobi": "/Aloo Gobi.jpeg",
  "Vindaloo de Porco (Goa)": "/Vindaloo de Porco (Goa).jpeg",
  "Matar Paneer": "/Matar Paneer.jpeg",
  "Gajar Ka Halwa (Pudim de Cenoura)": "/Gajar Ka Halwa (Pudim de Cenoura).jpeg",
  "Gulab Jamun": "/Gulab Jamun.jpeg",
  "Raita (Iogurte com Pepino)": "/Raita (Iogurte com Pepino).jpeg",

 
  "Moqueca Baiana": "/Moqueca Baiana.png",
  "Vatapá": "/Vatapá.jpeg",
  "Acarajé": "/Acarajé.png",
  "Bobó de Camarão": "/Bobó de Camarão.png",
  "Pão de Queijo": "/Pão de Queijo.png",
  "Coxinha de Frango": "/Coxinha de Frango.png",
  "Pastel de Feira": "/Pastel de Feira.png",
  "Feijão Tropeiro": "/Feijão Tropeiro.jpeg",
  "Picanha na Brasa": "/Picanha na Brasa.png",
  "Farofa de Bacon": "/Farofa de Bacon.jpeg",
  "Baião de Dois": "/Baião de Dois.png",
  "Tacacá": "/Tacacá.png",

  "Poulet Moambé (Frango com Molho de Palmito)": "/Poulet Moambé (Frango com Molho de Palmito).jpeg",
  "Saka Saka (Folhas de Mandioca com Amendoim)": "/Saka Saka (Folhas de Mandioca com Amendoim).jpeg",
  "Liboké de Poisson (Peixe em Folhas de Bananeira)": "/Liboké de Poisson (Peixe em Folhas de Bananeira).jpeg",
  "Funge (Papa de Mandioca)": "/Funge (Papa de Mandioca).jpeg",
  "Maboké (Carne Grelhada em Folha)": "/Maboké (Carne Grelhada em Folha).jpeg",
  "Poulet à la Moambé (Variação com Amendoim)": "/Poulet à la Moambé (Variação com Amendoim).jpeg",
  "Mikate (Bolinhos de Mandioca Fritos)": "/Mikate (Bolinhos de Mandioca Fritos).jpeg",
  "Mbika (Pó de Sementes de Abóbora com Peixe)": "/Mbika (Pó de Sementes de Abóbora com Peixe).jpeg",
  "Matemba (Peixe Seco com Mandioca)": "/Matemba (Peixe Seco com Mandioca).jpeg",
  "Salade Congolaise (Salada de Abacate e Peixe Fumado)": "/Salade Congolaise (Salada de Abacate e Peixe Fumado).jpeg",
};

// ─── Cor de destaque por país ─────────────────────────────────────────────────
const countryAccents = {
  'Itália': { from: '#e63946', to: '#457b9d', light: '#fff5f5' },
  'Japão': { from: '#bc4749', to: '#386641', light: '#fff0f0' },
  'México': { from: '#e76f51', to: '#2a9d8f', light: '#fff8f0' },
  'França': { from: '#1d3557', to: '#e63946', light: '#f0f4ff' },
  'EUA': { from: '#2d6a4f', to: '#d62828', light: '#f0fff4' },
  'Espanha': { from: '#e9c46a', to: '#e76f51', light: '#fffdf0' },
  'Brasil': { from: '#2d6a4f', to: '#f4a261', light: '#f0fff4' },
  'Portugal': { from: '#006400', to: '#c1121f', light: '#f0fff4' },
  'Índia': { from: '#e76f51', to: '#f4a261', light: '#fff8f0' },
  'Tailândia': { from: '#2d6a4f', to: '#bc4749', light: '#f0fff4' },
  'África Do Sul': { from: '#2d6a4f', to: '#e9c46a', light: '#f0fff4' },
  'Nigéria': { from: '#2d6a4f', to: '#264653', light: '#f0fff4' },
  'China': { from: '#bc4749', to: '#e9c46a', light: '#fff5f5' },
  'Áustria': { from: '#bc4749', to: '#1d3557', light: '#fff5f5' },
  'Grécia': { from: '#1d3557', to: '#e9c46a', light: '#f0f4ff' },
  'Hungria': { from: '#bc4749', to: '#2d6a4f', light: '#fff5f5' },
  'Peru': { from: '#bc4749', to: '#e9c46a', light: '#fff5f5' },
  'Coreia do Sul': { from: '#1d3557', to: '#bc4749', light: '#f0f4ff' },
  'Reino Unido': { from: '#1d3557', to: '#bc4749', light: '#f0f4ff' },
  'Canadá': { from: '#bc4749', to: '#264653', light: '#fff5f5' },
  'Colômbia/Venezuela': { from: '#e9c46a', to: '#bc4749', light: '#fffdf0' },
  'Marrocos': { from: '#e76f51', to: '#2d6a4f', light: '#fff8f0' },
  'Vietname': { from: '#2d6a4f', to: '#e63946', light: '#f0fff4' },
  'Ucrânia': { from: '#1d3557', to: '#e9c46a', light: '#f0f4ff' },
  'Argélia': { from: '#2d6a4f', to: '#264653', light: '#f0fff4' },
  'Suécia': { from: '#1d3557', to: '#e9c46a', light: '#f0f4ff' },
  'Angola': { from: '#bc4749', to: '#2d6a4f', light: '#fff5f5' },
  'Etiópia': { from: '#c1121f', to: '#2d6a4f', light: '#fff5f5' },
  'Egito': { from: '#c9a227', to: '#264653', light: '#fffdf0' },
  'Senegal': { from: '#2d6a4f', to: '#c1121f', light: '#f0fff4' },
  'Mali': { from: '#c9a227', to: '#2d6a4f', light: '#fffdf0' },
  'Quénia': { from: '#006400', to: '#c1121f', light: '#f0fff4' },
  'Camarões': { from: '#2d6a4f', to: '#c9a227', light: '#f0fff4' },
  'Gâmbia': { from: '#c1121f', to: '#2d6a4f', light: '#fff5f5' },
  'Zimbabwe': { from: '#2d6a4f', to: '#c9a227', light: '#f0fff4' },
  'Lesoto': { from: '#264653', to: '#2d6a4f', light: '#f0f4ff' },
  'Moçambique': { from: '#c9a227', to: '#2d6a4f', light: '#fffdf0' },
  'Madagáscar': { from: '#c1121f', to: '#2d6a4f', light: '#fff5f5' },
  'Israel': { from: '#1d3557', to: '#c1121f', light: '#f0f4ff' },
  'Jordânia': { from: '#c1121f', to: '#264653', light: '#fff5f5' },
  'Arábia Saudita': { from: '#2d6a4f', to: '#c9a227', light: '#f0fff4' },
  'Líbano': { from: '#c1121f', to: '#264653', light: '#fff5f5' },
  'Irão': { from: '#2d6a4f', to: '#c1121f', light: '#f0fff4' },
  'Paquistão': { from: '#2d6a4f', to: '#264653', light: '#f0fff4' },
  'Nepal': { from: '#bc4749', to: '#264653', light: '#fff5f5' },
  'Tibete': { from: '#bc4749', to: '#c9a227', light: '#fff5f5' },
  'Geórgia': { from: '#bc4749', to: '#1d3557', light: '#fff5f5' },
  'Rússia': { from: '#bc4749', to: '#1d3557', light: '#fff5f5' },
  'Polónia': { from: '#bc4749', to: '#264653', light: '#fff5f5' },
  'República Checa': { from: '#1d3557', to: '#bc4749', light: '#f0f4ff' },
  'Dinamarca': { from: '#bc4749', to: '#264653', light: '#fff5f5' },
  'Noruega': { from: '#bc4749', to: '#1d3557', light: '#fff5f5' },
  'Finlândia': { from: '#1d3557', to: '#264653', light: '#f0f4ff' },
  'Holanda': { from: '#e76f51', to: '#1d3557', light: '#fff8f0' },
  'Bélgica': { from: '#1d3557', to: '#e9c46a', light: '#f0f4ff' },
  'Arménia': { from: '#bc4749', to: '#e9c46a', light: '#fff5f5' },
  'Usbequistão': { from: '#2d6a4f', to: '#1d3557', light: '#f0fff4' },
  'Cazaquistão': { from: '#2d6a4f', to: '#264653', light: '#f0fff4' },
  'Filipinas': { from: '#1d3557', to: '#bc4749', light: '#f0f4ff' },
  'Indonésia': { from: '#bc4749', to: '#264653', light: '#fff5f5' },
  'Malásia': { from: '#bc4749', to: '#c9a227', light: '#fff5f5' },
  'Singapura': { from: '#bc4749', to: '#264653', light: '#fff5f5' },
  'Argentina': { from: '#1d3557', to: '#c9a227', light: '#f0f4ff' },
  'Equador': { from: '#c9a227', to: '#2d6a4f', light: '#fffdf0' },
  'Colômbia': { from: '#c9a227', to: '#bc4749', light: '#fffdf0' },
  'Uruguai': { from: '#1d3557', to: '#264653', light: '#f0f4ff' },
  'Bolívia': { from: '#bc4749', to: '#c9a227', light: '#fff5f5' },
  'Porto Rico': { from: '#1d3557', to: '#bc4749', light: '#f0f4ff' },
  'Haiti': { from: '#1d3557', to: '#bc4749', light: '#f0f4ff' },
  'Trinidad e Tobago': { from: '#bc4749', to: '#264653', light: '#fff5f5' },
  'Cuba': { from: '#1d3557', to: '#bc4749', light: '#f0f4ff' },
  'Chile': { from: '#bc4749', to: '#264653', light: '#fff5f5' },
  'Venezuela': { from: '#c9a227', to: '#bc4749', light: '#fffdf0' },
  'Escócia': { from: '#1d3557', to: '#264653', light: '#f0f4ff' },
  'Irlanda': { from: '#2d6a4f', to: '#e9c46a', light: '#f0fff4' },
  'Suíça': { from: '#bc4749', to: '#264653', light: '#fff5f5' },
  'Bósnia': { from: '#1d3557', to: '#c9a227', light: '#f0f4ff' },
  'Sérvia': { from: '#bc4749', to: '#1d3557', light: '#fff5f5' },
  'Cabo Verde': { from: '#003893', to: '#CFB53B', light: '#f0f8ff' },
  'República do Congo': { from: '#009543', to: '#FBDE4A', light: '#f0fff4' },
};

const getFlag = (countryName) => {
  const flags = {
    'Itália': '🇮🇹', 'Japão': '🇯🇵', 'México': '🇲🇽', 'França': '🇫🇷', 'EUA': '🇺🇸',
    'Espanha': '🇪🇸', 'Brasil': '🇧🇷', 'Portugal': '🇵🇹', 'Índia': '🇮🇳', 'Tailândia': '🇹🇭',
    'África Do Sul': '🇿🇦', 'Nigéria': '🇳🇬', 'China': '🇨🇳', 'Áustria': '🇦🇹', 'Grécia': '🇬🇷',
    'Hungria': '🇭🇺', 'Peru': '🇵🇪', 'Coreia do Sul': '🇰🇷', 'Reino Unido': '🇬🇧', 'Canadá': '🇨🇦',
    'Colômbia/Venezuela': '🇨🇴', 'Marrocos': '🇲🇦', 'Vietname': '🇻🇳', 'Ucrânia': '🇺🇦',
    'Argélia': '🇩🇿', 'Suécia': '🇸🇪', 'Angola': '🇦🇴', 'Etiópia': '🇪🇹', 'Egito': '🇪🇬', 'Senegal': '🇸🇳', 'Mali': '🇲🇱', 'Quénia': '🇰🇪',
    'Camarões': '🇨🇲', 'Gâmbia': '🇬🇲', 'Zimbabwe': '🇿🇼', 'Lesoto': '🇱🇸', 'Moçambique': '🇲🇿',
    'Madagáscar': '🇲🇬', 'Israel': '🇮🇱', 'Jordânia': '🇯🇴', 'Arábia Saudita': '🇸🇦', 'Líbano': '🇱🇧',
    'Irão': '🇮🇷', 'Paquistão': '🇵🇰', 'Nepal': '🇳🇵', 'Tibete': 'TB', 'Geórgia': '🇬🇪',
    'Rússia': '🇷🇺', 'Polónia': '🇵🇱', 'República Checa': '🇨🇿', 'Dinamarca': '🇩🇰', 'Noruega': '🇳🇴',
    'Finlândia': '🇫🇮', 'Holanda': '🇳🇱', 'Bélgica': '🇧🇪', 'Arménia': '🇦🇲', 'Usbequistão': '🇺🇿',
    'Cazaquistão': '🇰🇿', 'Filipinas': '🇵🇭', 'Indonésia': '🇮🇩', 'Malásia': '🇲🇾', 'Singapura': '🇸🇬',
    'Argentina': '🇦🇷', 'Equador': '🇪🇨', 'Colômbia': '🇨🇴', 'Uruguai': '🇺🇾', 'Bolívia': '🇧🇴',
    'Porto Rico': '🇵🇷', 'Haiti': '🇭🇹', 'Trinidad e Tobago': '🇹🇹', 'Cuba': '🇨🇺', 'Chile': '🇨🇱',
    'Venezuela': '🇻🇪', 'Escócia': '󠁧󠁢󠁳󠁣󠁴󠁿es', 'Irlanda': '🇮🇪', 'Suíça': '🇨🇭', 'Bósnia': '🇧🇦', 'Sérvia': '🇷🇸', 'Turquia': 'TQ', 'Cabo Verde': '🇨🇻', 'República do Congo': '🇨🇬',  
  };
  return flags[countryName] || '🏳️';
};

// ─── Badge de perfil alimentar ────────────────────────────────────────────────
const ProfileBadge = ({ label }) => {
  const { t } = useTranslation();
  const map = {
    'Vegano': 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
    'Vegetariano': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
    'Sem Glúten': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
    'Normal': 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
  };
  const base = 'text-[10px] font-semibold px-2 py-0.5 rounded-full';
  const color = Object.entries(map).find(([k]) => label.includes(k))?.[1]
    || 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300';
  const translatedLabel = t(`internationalRecipes.profiles.${label}`, { defaultValue: label });
  return <span className={`${base} ${color}`}>{translatedLabel}</span>;
};

// ─── Componente de imagem com máxima qualidade ────────────────────────────────
const HQImage = ({ src, alt, className, onError }) => {
  const isUnsplash = src && src.includes('unsplash.com');
  
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      // Para imagens Unsplash, usamos srcSet para servir resoluções diferentes
      // consoante o ecrã (retina/4K vs normal)
      srcSet={isUnsplash ? [
        `${src.split('?')[0]}?w=800&q=100&fit=crop&auto=format&fm=webp 800w`,
        `${src.split('?')[0]}?w=1200&q=100&fit=crop&auto=format&fm=webp 1200w`,
        `${src.split('?')[0]}?w=1600&q=100&fit=crop&auto=format&fm=webp 1600w`,
        `${src.split('?')[0]}?w=2400&q=100&fit=crop&auto=format&fm=webp 2400w`,
      ].join(', ') : undefined}
      sizes={isUnsplash ? "(max-width: 640px) 800px, (max-width: 1280px) 1200px, 1600px" : undefined}
      // Máxima nitidez — desativa suavização de pixeis
      style={{ imageRendering: 'crisp-edges', WebkitImageRendering: 'crisp-edges' }}
      loading="lazy"
      decoding="async"
      onError={onError}
    />
  );
};

// ─── Card de receita individual ───────────────────────────────────────────────
const RecipeCard = ({ recipe, index, onChat }) => {
  const { t } = useTranslation();
  const [imgError, setImgError] = useState(false);
const imgSrc = recipe.imagem_url || recipeImages[recipe.nome_receita];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.35 }}
      className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col"
    >
      {/* Imagem */}
      <div className="relative h-44 overflow-hidden bg-gray-100 dark:bg-gray-700 shrink-0">
        {imgSrc && !imgError ? (
          <HQImage
            src={imgSrc}
            alt={recipe.nome_receita}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Utensils className="h-12 w-12 text-gray-300 dark:text-gray-600" />
          </div>
        )}
        {/* Overlay gradiente */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        {/* Categoria */}
        <span className="absolute top-3 left-3 bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
          {recipe.categoria}
        </span>
        {/* Tempo */}
        <span className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white text-[10px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {recipe.tempo_preparo}
        </span>
      </div>

      {/* Conteúdo */}
      <div className="p-4 flex flex-col flex-1 gap-3">
        <h3 className="font-bold text-gray-900 dark:text-white text-base leading-snug line-clamp-2">
          {recipe.nome_receita}
        </h3>

        {/* Perfis alimentares */}
        <div className="flex flex-wrap gap-1">
          {recipe.perfil_alimentar.split(',').map(p => (
            <ProfileBadge key={p} label={p.trim()} />
          ))}
        </div>

        {/* Ingredientes resumo */}
        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
          <span className="font-semibold text-gray-600 dark:text-gray-300">{t('internationalRecipes.ingredientsLabel')}: </span>
          {recipe.ingredientes}
        </p>

        {/* Botão */}
        <button
          onClick={() => onChat(recipe)}
          className="mt-auto w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-sm font-semibold py-2.5 rounded-xl transition-all duration-200 active:scale-95 shadow-sm hover:shadow-md"
        >
          <ChefHat className="h-4 w-4" />
          {t('internationalRecipes.cookButton')}
        </button>
      </div>
    </motion.div>
  );
};

// ─── Painel de país (drawer lateral / overlay) ────────────────────────────────
const CountryPanel = ({ country, recipes, onClose, onChat }) => {
  const { t } = useTranslation();
  const accent = countryAccents[country] || { from: '#e76f51', to: '#2d6a4f', light: '#fff8f0' };
  const flag = getFlag(country);

  return (
    <AnimatePresence>
      <motion.div
        key="overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      <motion.div
        key="panel"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
        className="fixed right-0 top-0 h-full w-full max-w-2xl z-50 flex flex-col bg-gray-50 dark:bg-gray-900 shadow-2xl overflow-hidden"
      >
        {/* Header do painel */}
        <div
          className="relative px-6 pt-8 pb-6 shrink-0"
          style={{ background: `linear-gradient(135deg, ${accent.from}, ${accent.to})` }}
        >
          <div className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'radial-gradient(circle at 20% 80%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)',
              backgroundSize: '32px 32px'
            }}
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="relative z-10 flex items-center gap-4">
            <span className="text-6xl drop-shadow-md">{flag}</span>
            <div>
              <p className="text-white/70 text-sm font-medium uppercase tracking-wider mb-1">{t('internationalRecipes.panel.gastronomyOf')}</p>
              <h2 className="text-3xl font-bold text-white">{country}</h2>
              <p className="text-white/80 text-sm mt-1">
                {t('internationalRecipes.panel.recipesCount', { count: recipes.length })}
              </p>
            </div>
          </div>

          <div className="relative z-10 flex gap-3 mt-5">
            <div className="bg-white/15 backdrop-blur-sm rounded-xl px-3 py-2 flex items-center gap-2">
              <Flame className="h-4 w-4 text-white/80" />
              <span className="text-white text-xs font-semibold"> {t('internationalRecipes.panel.dishes', { count: recipes.length })}</span>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-xl px-3 py-2 flex items-center gap-2">
              <Star className="h-4 w-4 text-white/80" />
              <span className="text-white text-xs font-semibold">{t('internationalRecipes.panel.authentic')}</span>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-xl px-3 py-2 flex items-center gap-2">
              <Globe className="h-4 w-4 text-white/80" />
              <span className="text-white text-xs font-semibold">{t('internationalRecipes.panel.international')}</span>
            </div>
          </div>
        </div>

        {/* Lista de receitas */}
        <div className="flex-1 overflow-y-auto p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {recipes.map((recipe, i) => (
              <RecipeCard
                key={recipe.nome_receita}
                recipe={recipe}
                index={i}
                onChat={(r) => {
                  onChat({
                    title: r.nome_receita,
                    source: 'receita_internacional_direta',
                    nomeReceita: r.nome_receita,
                    pais: country
                  });
                  onClose();
                }}
              />
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-between gap-4"
          >
            <div>
              <p className="font-semibold text-gray-800 dark:text-white text-sm">
                {t('internationalRecipes.panel.ctaTitle', { country })}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {t('internationalRecipes.panel.ctaSubtitle')}
              </p>
            </div>
            <button
              onClick={() => {
                onChat({ title: t('internationalRecipes.panel.ctaChatTitle', { country }), query: t('internationalRecipes.panel.ctaChatQuery', { country }) });
                onClose();
              }}
              className="shrink-0 flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all duration-200 active:scale-95 shadow-sm"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              {t('internationalRecipes.panel.askChef')}
            </button>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

// ─── Componente principal ─────────────────────────────────────────────────────
const InternationalRecipes = ({ onNavigate, onStartChat }) => {
  const { t } = useTranslation();
  const [selectedCountry, setSelectedCountry] = useState(null);
   const [internationalRecipes, setInternationalRecipes] = useState([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/international-recipes/public`)
      .then(r => r.json())
      .then(data => setInternationalRecipes(data.data || []))
      .catch(console.error);
  }, []);

  const countries = [...new Set(internationalRecipes.map(r => r.pais))].map(country => {
    const recipes = internationalRecipes.filter(r => r.pais === country);
    return {
      name: country,
      count: recipes.length,
      example: recipes[0]?.nome_receita || '',
previewImg: recipes[0]?.imagem_url || recipeImages[recipes[0]?.nome_receita],
    };
  });

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="dark:text-gray-200 pb-10"
      >
        {/* Voltar */}
        <Button
          variant="ghost"
          onClick={() => onNavigate('dashboard')}
          className="mb-4 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> {t('common.backToDashboard')}
        </Button>

        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs font-bold px-3 py-1.5 rounded-full mb-4">
            <Globe className="h-3.5 w-3.5" />
           + {t('internationalRecipes.countriesAvailable', { count: countries.length })}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-3">
            {t('internationalRecipes.title')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto text-base">
            {t('internationalRecipes.subtitle')}
          </p>
        </div>

        {/* Grid de países */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {countries.map(({ name, count, example, previewImg }, idx) => {
            const accent = countryAccents[name] || { from: '#e76f51', to: '#2d6a4f' };
            return (
              <motion.div
                key={name}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.03 }}
                whileHover={{ y: -4, scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setSelectedCountry(name)}
                className="cursor-pointer group"
              >
                <div className="relative rounded-2xl overflow-hidden bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all duration-300">
                  {/* Banner de cor do país */}
                  <div
                    className="h-2 w-full"
                    style={{ background: `linear-gradient(90deg, ${accent.from}, ${accent.to})` }}
                  />

                  {/* Preview de imagem (se existir) — com HQImage para Unsplash */}
                  {previewImg && (
                    <div className="h-28 overflow-hidden">
                      <HQImage
                        src={previewImg}
                        alt={name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-80"
                        onError={(e) => { e.target.parentElement.style.display = 'none'; }}
                      />
                    </div>
                  )}

                  <div className="p-3 text-center">
                    <div className="text-4xl mb-2 filter drop-shadow-sm">{getFlag(name)}</div>
                    <h3 className="font-bold text-sm text-gray-800 dark:text-white leading-tight">{name}</h3>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                      {t('internationalRecipes.dishCount', { count })}
                    </p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 line-clamp-1 italic">
                      {example}
                    </p>
                  </div>

                  {/* Indicador hover */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"
                    style={{ boxShadow: `inset 0 0 0 2px ${accent.from}` }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Painel lateral com receitas do país */}
      <AnimatePresence>
       {selectedCountry && (
  <CountryPanel
    country={selectedCountry}
    recipes={internationalRecipes.filter(r => r.pais === selectedCountry)}
    onClose={() => setSelectedCountry(null)}
    onChat={onStartChat}
  />
)}
      </AnimatePresence>
    </>
  );
};

export default InternationalRecipes;