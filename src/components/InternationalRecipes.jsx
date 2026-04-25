import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, X, Clock, ChefHat, Utensils,
  Globe, Flame, Star, MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
const R2 = "https://pub-bdd590c2c0b44bdb8e466578d5efb24a.r2.dev/public-images";

// ─── Helper: converte URLs Unsplash para máxima qualidade ─────────────────────
const toHQ = (url) => {
  if (!url || !url.includes('unsplash.com')) return url;
  // Remove parâmetros antigos e aplica máxima qualidade
  const base = url.split('?')[0];
  return `${base}?w=1600&q=100&fit=crop&auto=format&fm=webp`;
};

// ─── Mapa de fotos por receita ───────
export const recipeImages = {
  "Pizza Margherita": toHQ("https://images.unsplash.com/photo-1574071318508-1cdbab80d002"),
  "Sushi (Hosomaki de Salmão)": `${R2}/transferir (9).png`,
  "Tacos al Pastor": toHQ("https://images.unsplash.com/photo-1565299585323-38d6b0865b47"),
  "Ratatouille": toHQ("https://images.unsplash.com/photo-1572453800999-e8d2d1589b7c"),
  "Hambúrguer Clássico Americano": toHQ("https://images.unsplash.com/photo-1568901346375-23c9450c58cd"),
  "Paella Valenciana": toHQ("https://images.unsplash.com/photo-1534080564583-6be75777b70a"),
  "Feijoada Brasileira": `${R2}/Feijoada Brasileira.png`,
  "Chicken Tikka Masala": toHQ("https://images.unsplash.com/photo-1565557623262-b51c2513a641"),
  "Pad Thai": toHQ("https://images.unsplash.com/photo-1559314809-0d155014e29e"),
  "Bobotie": toHQ("https://images.unsplash.com/photo-1574484284002-952d92456975"),
  "Jollof Rice": toHQ("https://images.unsplash.com/photo-1604329760661-e71dc83f8f26"),
  "Peking Duck (Pato à Pequim)": toHQ("https://images.unsplash.com/photo-1518492104633-130d0cc84637"),
  "Wiener Schnitzel": toHQ("https://images.unsplash.com/photo-1599921841143-819065a55cc6"),
  "Moussaka": toHQ("https://images.unsplash.com/photo-1600891964092-4316c288032e"),
  "Goulash": toHQ("https://images.unsplash.com/photo-1547592166-23ac45744acd"),
  "Ceviche Peruano": `${R2}/transferir (6).jpeg`,
  "Kimchi": `${R2}/transferir (5).jpeg`,
  "Fish and Chips": toHQ("https://images.unsplash.com/photo-1518492104633-130d0cc84637"),
  "Poutine": toHQ("https://images.unsplash.com/photo-1585238342024-78d387f4a707"),
  "Arepas": toHQ("https://images.unsplash.com/photo-1604329760661-e71dc83f8f26"),
  "Tagine de Cordeiro": toHQ("https://images.unsplash.com/photo-1547592180-85f173990554"),
  "Pho Bo (Sopa de Noodles de Vaca)": toHQ("https://images.unsplash.com/photo-1555126634-323283e090fa"),
  "Borscht": toHQ("https://images.unsplash.com/photo-1603105037880-880cd4edfb0d"),
  "Couscous com Sete Legumes": toHQ("https://images.unsplash.com/photo-1574484284002-952d92456975"),
  "Köttbullar (Almôndegas Suecas)": toHQ("https://images.unsplash.com/photo-1529042410759-befb1204b468"),
  "Injera com Doro Wat": `${R2}/transferir (2).jpeg`,
  "Ful Medames": toHQ("https://images.unsplash.com/photo-1511690656952-34342bb7c2f2"),
  "Thieboudienne": toHQ("https://images.unsplash.com/photo-1604329760661-e71dc83f8f26"),
  "Maafe": toHQ("https://images.unsplash.com/photo-1547592180-85f173990554"),
  "Nyama Choma": toHQ("https://images.unsplash.com/photo-1544025162-d76694265947"),
  "Muamba de Galinha": `${R2}/transferir (1).jpeg`,
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
  "Dolma": `${R2}/transferir (4).jpeg`,
  "Ash Reshteh": toHQ("https://images.unsplash.com/photo-1547592180-85f173990554"),
  "Biryani": toHQ("https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8"),
  "Dal Bhat": toHQ("https://images.unsplash.com/photo-1546833999-b9f581a1996d"),
  "Momo": toHQ("https://images.unsplash.com/photo-1626804475297-41608ea09aeb"),
  "Khachapuri": toHQ("https://images.unsplash.com/photo-1603105037880-880cd4edfb0d"),
  "Pelmeni": toHQ("https://images.unsplash.com/photo-1559314809-0d155014e29e"),
  "Pierogi": toHQ("https://images.unsplash.com/photo-1565299507177-b0ac66763828"),
  "Svíčková": toHQ("https://images.unsplash.com/photo-1544025162-d76694265947"),
  "Smørrebrød": `${R2}/transferir (3).jpeg`,
  "Fiskesupe": toHQ("https://images.unsplash.com/photo-1547592180-85f173990554"),
  "Kalakukko": toHQ("https://images.unsplash.com/photo-1574484284002-952d92456975"),
  "Stroopwafel": toHQ("https://images.unsplash.com/photo-1558961363-fa8fdf82db35"),
  "Carbonnade Flamande": toHQ("https://images.unsplash.com/photo-1547592180-85f173990554"),
  "Pastel de Nata": `${R2}/Pastel de Nata.png`,
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
  "Tom Yum Goong": `${R2}/Tom Yum Goong.png`,
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
  "Pollo a la Brasa": `${R2}/transferir (7).jpeg`,
  "Sopa de Lima": `${R2}/Sopa de Lima.png`,
  "Stamppot": toHQ("https://images.unsplash.com/photo-1574484284002-952d92456975"),
  "Tartiflette": toHQ("https://images.unsplash.com/photo-1603105037880-880cd4edfb0d"),
  "Haggis": toHQ("https://images.unsplash.com/photo-1544025162-d76694265947"),
  "Irish Stew": toHQ("https://images.unsplash.com/photo-1547592180-85f173990554"),
  "Zürcher Geschnetzeltes": toHQ("https://images.unsplash.com/photo-1544025162-d76694265947"),
  "Brandade de Bacalhau": `${R2}/randade de Bacalhau.jpeg`,
  "Pastel de Choclo": toHQ("https://images.unsplash.com/photo-1574484284002-952d92456975"),
  "Seco de Cordero": toHQ("https://images.unsplash.com/photo-1547592180-85f173990554"),
  "Cachapa": toHQ("https://images.unsplash.com/photo-1558961363-fa8fdf82db35"),
  "Mole Negro": toHQ("https://images.unsplash.com/photo-1567364816519-cbc0f5f59474"),
  "Cachupa Rica": `${R2}/Cachupa Rica.png`,
  "Cachupa Guisada": `${R2}/Cachupa Guisada (Cachupa Refogada).png`,
  "Caldo de Peixe": `${R2}/Caldo de Peixe Caldeirada.png`,
  "Mufete": `${R2}/Mufete.png`,
  "Feijoada Cabo-Verdiana": `${R2}/Feijoada Cabo-Verdiana.png`,
  "Arroz de Polvo": `${R2}/Arroz de Polvo.png`,
  "Arroz de Marisco": `${R2}/Arroz de Marisco.png`,
  "Búzio Guisado": `${R2}/Búzio Guisado.png`,
  "Lapas Guisadas": `${R2}/Lapas Guisadas.png`,
  "Peixe Assado na Brasa": `${R2}/Peixe Assado na Brasa (Grelhado).png`,
  "Moreia Frita": `${R2}/Moreia Frita.png`,
  "Lapas Grelhadas": `${R2}/Lapas Grelhadas.png`,
  "Carne de Porco com Favas": `${R2}/Carne de Porco com Favas.png`,
  "Lagosta Suada": `${R2}/Lagosta Suada (Estufada).png`,
  "Salada Morna de Tubarão": `${R2}/Salada morna de tubarão.png`,
  "Moamba de Galinha (Angola)": `${R2}/Moamba de Galinha (Angola).png`,
  "Calulu de Peixe": `${R2}/Calulu de Peixe.png`,
  "Calulu de Carne Seca": `${R2}/Calulu de Carne Seca.png`,
  "Funge de Bombó": `${R2}/Funge de Bombó.png`,
  "Funge de Milho": `${R2}/Funge de Milho.png`,
  "Mufete (Angola)": `${R2}/Mufete (Angola).png`,
  "Feijão de Óleo de Palma": `${R2}/Feijão de Óleo de Palma.png`,
  "Moamba de Peixe": `${R2}/Moamba de Peixe.png`,
  "Arroz de Garoupa": `${R2}/Arroz de Garoupa.png`,
  "Cabrito Assado": `${R2}/Cabrito Assado.png`,
  "Caldo da Dipanda": `${R2}/Caldo da Dipanda.png`,
  "Feijoada de Luanda": `${R2}/Feijoada de Luanda.png`,
  "Galinha à Cabidela": `${R2}/Galinha à Cabidela.png`,
  "Moamba de Bacalhau com Funge": `${R2}/Moamba de Bacalhau com Funge.png`,
  "Moamba de Galinha com Pirão": `${R2}/Moamba de Galinha com Pirão.png`,
  "Muqueca de Bacalhau": `${R2}/Muqueca de Bacalhau.png`,
  "Muqueca de Camarão": `${R2}/Muqueca de Camarão.png`,
  "Muzongué": `${R2}/Muzongué.png`,
  "Quizaca": `${R2}/Quizaca.png`,
  "Galinha Rija com Muamba": `${R2}/Galinha Rija com Muamba.png`,
  "Fumbua (Kizaka)": `${R2}/Fumbua (Kizaka).png`,
  "Muteta": `${R2}/Muteta.png`,
  "Liboke": `${R2}/Liboke.jpeg`,
  "Makayabu": `${R2}/Makayabu.jpeg`,
  "Catato": `${R2}/Catato.jpeg`,
  "Pirão": `${R2}/Pirão.jpeg`,
  "Quibeba": `${R2}/Quibeba.jpeg`,
  "Sumatena (Súmate)": `${R2}/Sumatena (Súmate).png`,
  "Gonguenha": `${R2}/Gonguenha.png`,
  "Moqueca (Angola)": `${R2}/Moqueca (Angola).jpeg`,
  "Mututo": `${R2}/Mututo.jpeg`,
  "Cocada (Angola)": `${R2}/Cocada (Angola).png`,
  "Tortilla de Patatas": `${R2}/Tortilla de Patatas.png`,
  "Gazpacho Andaluz": `${R2}/Gazpacho Andaluz.png`,
  "Cocido Madrileño": `${R2}/Cocido Madrileño.png`,
  "Fabada Asturiana": `${R2}/Fabada Asturiana.png`,
  "Lentejas con Chorizo": `${R2}/Lentejas con Chorizo.png`,
  "Callos a la Madrileña": `${R2}/Callos à la Madrileña.png`,
  "Pulpo a la Gallega": `${R2}/Pulpo à la Gallega.png`,
  "Gambas al Ajillo": `${R2}/Gambas al Ajillo.png`,
  "Boquerones en Vinagre": `${R2}/Boquerones en Vinagre.png`,
  "Rabo de Toro": `${R2}/Rabo de Toro.png`,
  "Pimientos del Padrón": `${R2}/Pimientos del Padrón.png`,
  "Croquetas de Jamón": `${R2}/Croquetas de Jamón.png`,
  "Churros con Chocolate": `${R2}/Churros con Chocolate.png`,
  "Crema Catalana": `${R2}/Crema Catalana.png`,
  "Tarta de Santiago": `${R2}/Tarta de Santiago.png`,
  "Torrijas": `${R2}/Torrijas.png`,
  "Mac 'n' Cheese": `${R2}/Mac 'n' Cheese.png`,
  "Southern Fried Chicken": `${R2}/Southern Fried Chicken.png`,
  "New York Style Hot Dog": `${R2}/New York Style Hot Dog.png`,
  "Classic Meatloaf": `${R2}/Classic Meatloaf.png`,
  "Texas BBQ Brisket": `${R2}/Texas BBQ Brisket .png`,
  "Slow Cooker Pulled Pork": `${R2}/Slow Cooker Pulled Pork.png`,
  "Seafood Gumbo": `${R2}/Seafood Gumbo.png`,
  "Jambalaya": `${R2}/Jambalaya.png`,
  "Buffalo Wings": `${R2}/Buffalo Wings.png`,
  "New England Clam Chowder": `${R2}/New England Clam Chowder.png`,
  "Maine Lobster Roll": `${R2}/Maine Lobster Roll.png`,
  "Maryland Crab Cakes": `${R2}/Maryland Crab Cakes.png`,
  "Chicago Deep Dish Pizza": `${R2}/Chicago Deep Dish Pizza.png`,
  "Apple Pie": `${R2}/Apple Pie.png`,
  "Fluffy Pancakes": `${R2}/Fluffy Pancakes.png`,
  "New York Cheesecake": `${R2}/New York Cheesecake.png`,
  "Chocolate Chip Cookies": `${R2}/Chocolate Chip Cookies.png`,
  "Pecan Pie": `${R2}/Pecan Pie.png`,
  "Eggs Benedict": `${R2}/Eggs Benedict.png`,
  "Lasagna alla Bolognese": `${R2}/Lasagna alla Bolognese.png`,
  "Spaghetti alla Carbonara": `${R2}/Spagueth.png`,
  "Risotto alla Milanese": `${R2}/risoto.png`,
  "Trofie al Pesto": `${R2}/trofier 2.png`,
  "Penne all'Arrabbiata": `${R2}/Penne.png`,
  "Tagliatelle al Tartufo": `${R2}/Tagliatelle al Tartufo.png`,
  "Tortellini in Brodo": `${R2}/Tortellini in Brodo.png`,
  "Bistecca alla Fiorentina": `${R2}/Bistecca alla Fiorentina.png`,
  "Ossobuco alla Milanese": `${R2}/Ossobuco alla Milanese.png`,
  "Saltimbocca alla Romana": `${R2}/Saltimbocca alla Romana.png`,
  "Cacciucco": `${R2}/Cacciucco.png`,
  "Pollo alla Cacciatora": `${R2}/Pollo alla Cacciatora.png`,
  "Pizza Napoletana": `${R2}/pizza-napolitana-margherita-com-mussarela-e-molho-de-tomate-servido-em-uma-mesa-de-madeira-para-um-jantar-no-restaurante-italiano-italia-co.webp`,
  "Arancini": `${R2}/Arancini.png`,
  "Focaccia di Recco": `${R2}/focaccia-di-recco-3-1200px.webp`,
  "Melanzane alla Parmigiana": `${R2}/parmigiana-di-melanzane-7.webp`,
  "Carpaccio di Manzo": `${R2}/Carpaccio di Manzo.png`,
  "Tiramisù": `${R2}/Tiramisù.png`,
  "Panna Cotta": `${R2}/Panna Cotta.png`,
  "Cannoli Siciliani": `${R2}/Cannoli.webp`,
  "Sushi (Nigiri)": `${R2}/Sushi (Nigiri).png`,
  "Sashimi": `${R2}/Sashimi.png`,
  "Unagi no Kabayaki": `${R2}/Unagi no Kabayaki.png`,
  "Takoyaki": `${R2}/Takoyaki.png`,
  "Shoyu Ramen": `${R2}/Shoyu Ramen.png`,
  "Kake Udon": `${R2}/Kake Udon.png`,
  "Zaru Soba": `${R2}/Zaru Soba .png`,
  "Misoshiru (Sopa de Missô)": `${R2}/Misoshiru (Sopa de Missô).png`,
  "Tempura": `${R2}/Tempura.jpeg`,
  "Tonkatsu": `${R2}/Tonkatsu.jpeg`,
  "Yakitori": `${R2}/Yakitori.jpeg`,
  "Sukiyaki": `${R2}/Sukiyaki.jpeg`,
  "Gyudon": `${R2}/Gyudon.jpeg`,
  "Okonomiyaki": `${R2}/Okonomiyaki.jpeg`,
  "Karē Raisu (Curry Japonês)": `${R2}/Karē Raisu (Curry Japonês).jpeg`,
  "Onigiri": `${R2}/Onigiri.jpeg`,
  "Omurice": `${R2}/Omurice.jpeg`,
  "Mochi": `${R2}/Mochi.jpeg`,
  "Dorayaki": `${R2}/Dorayaki.jpeg`,
  "Taiyaki": `${R2}/Taiyaki.jpeg`,
  "Tacos al Pastor": `${R2}/Tacos al Pastor.png`,
  "Chilaquiles Verdes": `${R2}/Chilaquiles Verdes.png`,
  "Enchiladas Rojas": `${R2}/Enchiladas Rojas.png`,
  "Quesadillas": `${R2}/Quesadillas.png`,
  "Tamales de Carne": `${R2}/Tamales de Carne.png`,
  "Gorditas de Chicharrón": `${R2}/Gorditas de Chicharrón.png`,
  "Mole Poblano": `${R2}/Mole Poblano.png`,
  "Chiles en Nogada": `${R2}/Chiles en Nogada.png`,
  "Pozole Rojo": `${R2}/Pozole Rojo.png`,
  "Cochinita Pibil": `${R2}/Cochinita Pibil.png`,
  "Birria de Res": `${R2}/Birria de Res.png`,
  "Barbacoa": `${R2}/Barbacoa.png`,
  "Aguachile Verde de Camarão": `${R2}/Aguachile Verde de Camarão.png`,
  "Pescado a la Talla": `${R2}/Pescado a la Talla.png`,
  "Ceviche Mexicano": `${R2}/Ceviche Mexicano.png`,
  "Tlayuda Oaxaqueña": `${R2}/Tlayuda Oaxaqueña.png`,
  "Pambazos": `${R2}/Pambazos.png`,
  "Aguachile de Callo de Hacha": `${R2}/Aguachile de Callo de Hacha.png`,
  "Mole Negro Oaxaqueño": `${R2}/Mole Negro Oaxaqueño.png`,
  "Bacalhau à Brás": `${R2}/transferir (8).jpeg`,
  "Bacalhau com Natas": `${R2}/Bacalhau com Natas.png`,
  "Sardinhas Assadas": `${R2}/Sardinhas Assadas.png`,
  "Arroz de Marisco": `${R2}/Arroz de Marisco 1.png`,
  "Polvo à Lagareiro": `${R2}/Polvo à Lagareiro .png`,
  "Cataplana de Peixe": `${R2}/Cataplana de Peixe.png`,
  "Amêijoas à Bulhão Pato": `${R2}/Amêijoas à Bulhão Pato.png`,
  "Cozido à Portuguesa": `${R2}/Cozido à Portuguesa.png`,
  "Francesinha": `${R2}/Francesinha.png`,
  "Alheira de Mirandela": `${R2}/Alheira de Mirandela.png`,
  "Carne de Porco à Alentejana": `${R2}/Carne de Porco à Alentejana.png`,
  "Rojões à Moda do Minho": `${R2}/Rojões à Moda do Minho.png`,
  "Arroz de Pato": `${R2}/Arroz de Pato.png`,
  "Caldo Verde": `${R2}/Caldo Verde.png`,
  "Pica-pau": `${R2}/Pica-pau.png`,
  "Arroz Doce": `${R2}/Arroz Doce.png`,
  "Pão de Ló de Alfeizerão": `${R2}/Pão de Ló de Alfeizerão.png`,
  "Ovos Moles de Aveiro": `${R2}/Ovos Moles de Aveiro.png`,
  "Pad Thai": `${R2}/Pad Thai.png`,
  "Green Curry (Gaeng Keow Wan)": `${R2}/Green Curry (Gaeng Keow Wan).png`,
  "Som Tum (Salada de Papaia Verde)": `${R2}/Som Tum (Salada de Papaia Verde).png`,
  "Mango Sticky Rice (Khao Niew Mamuang)": `${R2}/Mango Sticky Rice (Khao Niew Mamuang).png`,
  "Massaman Curry": `${R2}/Massaman Curry.png`,
  "Pad Krapow Moo Saap (Porco com Manjericão Sagrado)": `${R2}/Pad Krapow Moo Saap (Porco com Manjericão Sagrado).png`,
  "Khao Pad (Arroz Frito Tailandês)": `${R2}/Khao Pad (Arroz Frito Tailandês).png`,
  "Larb Gai (Salada de Frango Picante)": `${R2}/Larb Gai (Salada de Frango Picante).png`,
  "Pad See Ew (Macarrão Largo com Soja)": `${R2}/Pad See Ew (Macarrão Largo com Soja).png`,
  "Tom Kha Gai (Sopa de Frango com Coco)": `${R2}/Tom Kha Gai (Sopa de Frango com Coco).png`,
  "Satay de Frango": `${R2}/Satay de Frango.png`,
  "Khao Soi (Sopa de Curry com Macarrão Crocante)": `${R2}/Khao Soi (Sopa de Curry com Macarrão Crocante).png`,
  "Gai Pad Med Ma-muang (Frango com Castanhas)": `${R2}/Gai Pad Med Ma-muang (Frango com Castanhas).png`,
  "Pad Kee Mao (Drunken Noodles)": `${R2}/Pad Kee Mao (Drunken Noodles).png`,
  "Red Curry (Gaeng Daeng)": `${R2}/Red Curry (Gaeng Daeng).png`,
  "Tod Mun Pla (Bolinhos de Peixe)": `${R2}/Tod Mun Pla (Bolinhos de Peixe).png`,
  "Yam Nua (Salada de Carne Grelhada)": `${R2}/Yam Nua (Salada de Carne Grelhada).png`,
  "Sai Oua (Salsicha do Norte)": `${R2}/Sai Oua (Salsicha do Norte).png`,
  "Khanom Krok (Panquecas de Coco)": `${R2}/Khanom Krok (Panquecas de Coco).png`,
  "Porco Agridoce (Tangcu Liji)": `${R2}/Porco Agridoce (Tangcu Liji).png`,
  "Frango Kung Pao (Gong Bao Ji Ding)": `${R2}/Frango Kung Pao (Gong Bao Ji Ding).png`,
  "Porco Dongpo": `${R2}/Porco Dongpo.png`,
  "Char Siu (Churrasco de Porco)": `${R2}/Char Siu (Churrasco de Porco).png`,
  "Har Gow (Dim Sum de Camarão)": `${R2}/Har Gow (Dim Sum de Camarão).png`,
  "Jiaozi (Dumplings Tradicionais)": `${R2}/Jiaozi (Dumplings Tradicionais).png`,
  "Xiaolongbao (Soup Dumplings)": `${R2}/Xiaolongbao (Soup Dumplings).png`,
  "Zha Jiang Mian (Macarrão com Pasta de Soja)": `${R2}/Zha Jiang Mian (Macarrão com Pasta de Soja).png`,
  "Wonton Soup": `${R2}/Wonton Soup.png`,
  "Mapo Tofu": `${R2}/Mapo Tofu.png`,
  "Chow Mein (Macarrão Frito)": `${R2}/Chow Mein (Macarrão Frito).jpeg`,
  "Pato Laqueado (Peking Duck)": `${R2}/Pato Laqueado (Peking Duck).png`,
  "Porco à Cantonesa (Char Siu no forno)": `${R2}/Porco à Cantonesa (Char Siu no forno).png`,
  "Guotie (Dumplings Fritos)": `${R2}/Guotie (Dumplings Fritos).jpeg`,
  "Frango com Castanha de Caju (Kai Shou Ji)": `${R2}/Frango com Castanha de Caju (Kai Shou Ji).jpeg`,
  "Tofu com Molho de Ostra (Tofu com Cogumelos)": `${R2}/Tofu com Molho de Ostra (Tofu com Cogumelos).jpeg`,
  "Ovos Centenários (Pidan) com Tofu": `${R2}/Ovos Centenários (Pidan) com Tofu.jpeg`,
  "Bolo de Lua (Mooncake)": `${R2}/Bolo de Lua (Mooncake).jpeg`,
  "Coq au Vin": `${R2}/Coq au Vin.jpeg`,
  "Boeuf Bourguignon": `${R2}/Boeuf Bourguignon.jpeg`,
  "Quiche Lorraine": `${R2}/Quiche Lorraine.jpeg`,
  "Soupe à l'Oignon": `${R2}/Soupe à l'Oignon.jpeg`,
  "Bouillabaisse": `${R2}/Bouillabaisse.jpeg`,
  "Tarte Tatin": `${R2}/Tarte Tatin.jpeg`,
  "Crêpes": `${R2}/Crêpes.jpeg`,
  "Croque Monsieur": `${R2}/Croque Monsieur.jpeg`,
  "Cassoulet": `${R2}/Cassoulet.jpeg`,
  "Escargots de Bourgogne": `${R2}/Escargots de Bourgogne.jpeg`,
  "Salade Niçoise": `${R2}/Salade Niçoise.jpeg`,
  "Moules Marinières": `${R2}/Moules Marinières.jpeg`,
  "Gratin Dauphinois": `${R2}/Gratin Dauphinois.jpeg`,
  "Profiteroles": `${R2}/Profiteroles.jpeg`,
  "Crème Brûlée": `${R2}/Crème Brûlée.jpeg`,
  "Chicken Tikka Masala": `${R2}/Chicken Tikka Masala.jpeg`,
  "Butter Chicken (Murgh Makhani)": `${R2}/Butter Chicken (Murgh Makhani).jpeg`,
  "Biryani de Frango": `${R2}/Biryani de Frango.jpeg`,
  "Palak Paneer": `${R2}/Palak Paneer.jpeg`,
  "Rogan Josh": `${R2}/Rogan Josh.jpeg`,
  "Dal Makhani": `${R2}/Dal Makhani.jpeg`,
  "Chana Masala": `${R2}/Chana Masala.jpeg`,
  "Saag Paneer": `${R2}/Saag Paneer.jpeg`,
  "Tandoori Chicken": `${R2}/Tandoori Chicken.jpeg`,
  "Malai Kofta": `${R2}/Malai Kofta.jpeg`,
  "Pani Puri (Golgappa)": `${R2}/Pani Puri (Golgappa).jpeg`,
  "Samosas": `${R2}/Samosas.jpeg`,
  "Naan (Pão Indiano)": `${R2}/Naan (Pão Indiano).jpeg`,
  "Pav Bhaji": `${R2}/Pav Bhaji.jpeg`,
  "Aloo Gobi": `${R2}/Aloo Gobi.jpeg`,
  "Vindaloo de Porco (Goa)": `${R2}/Vindaloo de Porco (Goa).jpeg`,
  "Matar Paneer": `${R2}/Matar Paneer.jpeg`,
  "Gajar Ka Halwa (Pudim de Cenoura)": `${R2}/Gajar Ka Halwa (Pudim de Cenoura).jpeg`,
  "Gulab Jamun": `${R2}/Gulab Jamun.jpeg`,
  "Raita (Iogurte com Pepino)": `${R2}/Raita (Iogurte com Pepino).jpeg`,
  "Moqueca Baiana": `${R2}/Moqueca Baiana.png`,
  "Vatapá": `${R2}/Vatapá.jpeg`,
  "Acarajé": `${R2}/Acarajé.png`,
  "Bobó de Camarão": `${R2}/Bobó de Camarão.png`,
  "Pão de Queijo": `${R2}/Pão de Queijo.png`,
  "Coxinha de Frango": `${R2}/Coxinha de Frango.png`,
  "Pastel de Feira": `${R2}/Pastel de Feira.png`,
  "Feijão Tropeiro": `${R2}/Feijão Tropeiro.jpeg`,
  "Picanha na Brasa": `${R2}/Picanha na Brasa.png`,
  "Farofa de Bacon": `${R2}/Farofa de Bacon.jpeg`,
  "Baião de Dois": `${R2}/Baião de Dois.png`,
  "Tacacá": `${R2}/Tacacá.png`,
  "Poulet Moambé (Frango com Molho de Palmito)": `${R2}/Poulet Moambé (Frango com Molho de Palmito).jpeg`,
  "Saka Saka (Folhas de Mandioca com Amendoim)": `${R2}/Saka Saka (Folhas de Mandioca com Amendoim).jpeg`,
  "Liboké de Poisson (Peixe em Folhas de Bananeira)": `${R2}/Liboké de Poisson (Peixe em Folhas de Bananeira).jpeg`,
  "Funge (Papa de Mandioca)": `${R2}/Funge (Papa de Mandioca).jpeg`,
  "Maboké (Carne Grelhada em Folha)": `${R2}/Maboké (Carne Grelhada em Folha).jpeg`,
  "Poulet à la Moambé (Variação com Amendoim)": `${R2}/Poulet à la Moambé (Variação com Amendoim).jpeg`,
  "Mikate (Bolinhos de Mandioca Fritos)": `${R2}/Mikate (Bolinhos de Mandioca Fritos).jpeg`,
  "Mbika (Pó de Sementes de Abóbora com Peixe)": `${R2}/Mbika (Pó de Sementes de Abóbora com Peixe).jpeg`,
  "Matemba (Peixe Seco com Mandioca)": `${R2}/Matemba (Peixe Seco com Mandioca).jpeg`,
  "Salade Congolaise (Salada de Abacate e Peixe Fumado)": `${R2}/Salade Congolaise (Salada de Abacate e Peixe Fumado).jpeg`,
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