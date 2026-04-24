import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, ArrowLeft, Plus, Sparkles, Camera, Calendar, Phone, AlertTriangle, Shield, Clock, Filter, FileText, Heart, X, Upload, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { useTranslation } from 'react-i18next';
import { criarSessaoDeReceita } from '@/services/profilesApi';
import {
    criarPerfil, listarPerfisPorTipo, gerarReceitaAdaptada
} from '@/services/profilesApi';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import ReceitaDetalheModal from './ReceitaDetalheModal';

const AlimentacaoSenior = ({ onNavigate, onStartChat }) => {
    const { t } = useTranslation();
    const [perfis, setPerfis] = useState([]);
    const [perfilSelecionado, setPerfilSelecionado] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showNovoPerfil, setShowNovoPerfil] = useState(false);
    const [editandoPerfil, setEditandoPerfil] = useState(null);
    const [showEditarModal, setShowEditarModal] = useState(false);
    const [salvandoHorarios, setSalvandoHorarios] = useState(false);
    const [filtroSaude, setFiltroSaude] = useState('todas');
    const [showResumoPlanejamento, setShowResumoPlanejamento] = useState(false);
    const [planejamentoResumo, setPlanejamentoResumo] = useState([]);
    const [showConfigHorarios, setShowConfigHorarios] = useState(false);
    const [showEmergencia, setShowEmergencia] = useState(false);
    const [showPersonalizarReceita, setShowPersonalizarReceita] = useState(false);
    const [gerandoReceita, setGerandoReceita] = useState(false);
    const [salvandoPerfil, setSalvandoPerfil] = useState(false);
    const [opcoesReceita, setOpcoesReceita] = useState({
        tipoRefeicao: 'almoço',
        numeroPessoas: 2,
        dificuldade: 'media',
        tempoMaximo: 45,
        observacoes: ''
    });
    const [showFacilModal, setShowFacilModal] = useState(false);
    const [opcoesFacil, setOpcoesFacil] = useState({
        tipoRefeicao: 'auto',
        tempoMaximo: 20,
        ingredientes: '',
        tipoRefeicaoManual: 'almoço'
    });
    const [lembretes, setLembretes] = useState([
        { hora: '08:00', tipo: 'breakfast', ativo: true },
        { hora: '13:00', tipo: 'lunch', ativo: true },
        { hora: '20:00', tipo: 'dinner', ativo: true }
    ]);
    const [showPlanejarSemana, setShowPlanejarSemana] = useState(false);
    const [planejamento, setPlanejamento] = useState({
        segunda: { cafe: true, almoco: true, jantar: true, lanche: false },
        terca: { cafe: true, almoco: true, jantar: true, lanche: false },
        quarta: { cafe: true, almoco: true, jantar: true, lanche: false },
        quinta: { cafe: true, almoco: true, jantar: true, lanche: false },
        sexta: { cafe: true, almoco: true, jantar: true, lanche: false },
        sabado: { cafe: false, almoco: true, jantar: true, lanche: true },
        domingo: { cafe: false, almoco: true, jantar: true, lanche: true }
    });
    const [gerandoPlanejamento, setGerandoPlanejamento] = useState(false);
    const [showReceitaModal, setShowReceitaModal] = useState(false);
    const [receitaSelecionada, setReceitaSelecionada] = useState(null);
    const [novoPerfil, setNovoPerfil] = useState({
        name: '',
        birthDate: null,
        country: 'PT',
        conditions: [],
        difficulties: [],
        allergies: [],
        intolerances: [],
        emergencyContact: '',
        emergencyPhone: '',
        otherAllergies: '',
        otherIntolerances: '',
        otherConditions: '',
        otherDifficulties: '',
        profileImage: null,
        profileImagePreview: ''
    });

    // Opções para condições de saúde
    const condicoesSaude = [
        t('alimentacaoSenior.healthConditions.diabetes'),
        t('alimentacaoSenior.healthConditions.highBloodPressure'),
        t('alimentacaoSenior.healthConditions.highCholesterol'),
        t('alimentacaoSenior.healthConditions.heartProblems'),
        t('alimentacaoSenior.healthConditions.dementia'),
        t('alimentacaoSenior.healthConditions.parkinson'),
        t('alimentacaoSenior.healthConditions.arthritis'),
        t('alimentacaoSenior.healthConditions.osteoporosis'),
        t('alimentacaoSenior.healthConditions.chewingDifficulty'),
        t('alimentacaoSenior.healthConditions.swallowingDifficulty'),
        t('alimentacaoSenior.healthConditions.kidneyFailure'),
        t('alimentacaoSenior.healthConditions.anemia'),
        t('alimentacaoSenior.healthConditions.obesity'),
        t('alimentacaoSenior.healthConditions.malnutrition')
    ];

    // Opções para dificuldades
    const dificuldades = [
        t('alimentacaoSenior.difficulties.limitedChewing'),
        t('alimentacaoSenior.difficulties.difficultySwallowing'),
        t('alimentacaoSenior.difficulties.reducedVision'),
        t('alimentacaoSenior.difficulties.reducedMobility'),
        t('alimentacaoSenior.difficulties.weakMemory'),
        t('alimentacaoSenior.difficulties.preparingAlone')
    ];

    useEffect(() => {
        carregarPerfis();
    }, []);

    const carregarPerfis = async () => {
        try {
            setLoading(true);
            const data = await listarPerfisPorTipo('senior');
            setPerfis(data);

            if (data.length > 0 && !perfilSelecionado) {
                setPerfilSelecionado(data[0]);
                await carregarLembretes(data[0]._id);
                await carregarPlanejamento(data[0]._id);
            }
        } catch (error) {
            console.error('Erro ao carregar perfis:', error);
            toast({
                title: t('common.error'),
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const carregarLembretes = async (perfilId) => {
        try {
            const token = localStorage.getItem("bomPiteuToken") || localStorage.getItem("token");
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/profiles/${perfilId}/lembretes`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();

                const mapeamento = {
                    // Português
                    'Café da Manhã': 'breakfast',
                    'Almoço': 'lunch',
                    'Jantar': 'dinner',
                    'Lanche': 'snack',

                    // Inglês
                    'Breakfast': 'breakfast',
                    'Lunch': 'lunch',
                    'Dinner': 'dinner',
                    'Snack': 'snack',

                    // Espanhol
                    'Desayuno': 'breakfast',
                    'Almuerzo': 'lunch',
                    'Cena': 'dinner',
                    'Merienda': 'snack',

                    // Francês
                    'Petit-déjeuner': 'breakfast',
                    'Déjeuner': 'lunch',
                    'Dîner': 'dinner',
                    'Collation': 'snack',

                    // Alemão
                    'Frühstück': 'breakfast',
                    'Mittagessen': 'lunch',
                    'Abendessen': 'dinner',
                    'Snack': 'snack',

                    // Italiano
                    'Colazione': 'breakfast',
                    'Pranzo': 'lunch',
                    'Cena': 'dinner',
                    'Spuntino': 'snack',

                    // Russo
                    'Завтрак': 'breakfast',
                    'Обед': 'lunch',
                    'Ужин': 'dinner',
                    'Перекус': 'snack',

                    // Chinês
                    '早餐': 'breakfast',
                    '午餐': 'lunch',
                    '晚餐': 'dinner',
                    '零食': 'snack',

                    // Japonês
                    '朝食': 'breakfast',
                    '昼食': 'lunch',
                    '夕食': 'dinner',
                    '間食': 'snack',

                    // Coreano
                    '아침식사': 'breakfast',
                    '점심식사': 'lunch',
                    '저녁식사': 'dinner',
                    '간식': 'snack',

                    // Árabe
                    'فطور': 'breakfast',
                    'غداء': 'lunch',
                    'عشاء': 'dinner',
                    'وجبة خفيفة': 'snack',

                    // Hindi
                    'नाश्ता': 'breakfast',
                    'दोपहर का खाना': 'lunch',
                    'रात का खाना': 'dinner',
                    'नाश्ता': 'snack',

                    // Turco
                    'Kahvaltı': 'breakfast',
                    'Öğle yemeği': 'lunch',
                    'Akşam yemeği': 'dinner',
                    'Atıştırmalık': 'snack',

                    // Polaco
                    'Śniadanie': 'breakfast',
                    'Obiad': 'lunch',
                    'Kolacja': 'dinner',
                    'Przekąska': 'snack',

                    // Neerlandês
                    'Ontbijt': 'breakfast',
                    'Lunch': 'lunch',
                    'Diner': 'dinner',
                    'Snack': 'snack',

                    // Sueco
                    'Frukost': 'breakfast',
                    'Lunch': 'lunch',
                    'Middag': 'dinner',
                    'Mellanmål': 'snack',

                    // Indonésio
                    'Sarapan': 'breakfast',
                    'Makan siang': 'lunch',
                    'Makan malam': 'dinner',
                    'Camilan': 'snack',

                    // Vietnamita
                    'Bữa sáng': 'breakfast',
                    'Bữa trưa': 'lunch',
                    'Bữa tối': 'dinner',
                    'Bữa nhẹ': 'snack',

                    // Tailandês
                    'อาหารเช้า': 'breakfast',
                    'อาหารกลางวัน': 'lunch',
                    'อาหารเย็น': 'dinner',
                    'ของว่าง': 'snack',

                    // Ucraniano
                    'Сніданок': 'breakfast',
                    'Обід': 'lunch',
                    'Вечеря': 'dinner',
                    'Перекус': 'snack',

                    // Checo
                    'Snídaně': 'breakfast',
                    'Oběd': 'lunch',
                    'Večeře': 'dinner',
                    'Svačina': 'snack',

                    // Romeno
                    'Mic dejun': 'breakfast',
                    'Prânz': 'lunch',
                    'Cină': 'dinner',
                    'Gustare': 'snack',

                    // Húngaro
                    'Reggeli': 'breakfast',
                    'Ebéd': 'lunch',
                    'Vacsora': 'dinner',
                    'Snack': 'snack',

                    // Grego
                    'Πρωινό': 'breakfast',
                    'Μεσημεριανό': 'lunch',
                    'Βραδινό': 'dinner',
                    'Σνακ': 'snack',

                    // Hebraico
                    'ארוחת בוקר': 'breakfast',
                    'ארוחת צהריים': 'lunch',
                    'ארוחת ערב': 'dinner',
                    'חטיף': 'snack',

                    // Persa
                    'صبحانه': 'breakfast',
                    'ناهار': 'lunch',
                    'شام': 'dinner',
                    'میان وعده': 'snack',

                    // Bengali
                    'সকালের নাস্তা': 'breakfast',
                    'দুপুরের খাবার': 'lunch',
                    'রাতের খাবার': 'dinner',
                    'স্ন্যাক': 'snack',

                    // Swahili
                    'Kifungua kinywa': 'breakfast',
                    'Chakula cha mchana': 'lunch',
                    'Chakula cha jioni': 'dinner',
                    'Vitafunio': 'snack',

                    // Malaio
                    'Sarapan': 'breakfast',
                    'Makan tengah hari': 'lunch',
                    'Makan malam': 'dinner',
                    'Snek': 'snack',
                };
                const lembretesConvertidos = data.lembretes.map(lembrete => ({
                    ...lembrete,
                    tipo: mapeamento[lembrete.tipo] || lembrete.tipo
                }));
                setLembretes(lembretesConvertidos);
            }
        } catch (error) {
            console.error('Erro ao carregar lembretes:', error);
        }
    };

    const carregarPlanejamento = async (perfilId) => {
        try {
            const token = localStorage.getItem("bomPiteuToken") || localStorage.getItem("token");
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/profiles/${perfilId}/planejamento`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                setPlanejamento(data.planejamento);
            }
        } catch (error) {
            console.error('Erro ao carregar planejamento:', error);
        }
    };

    const salvarPlanejamento = async () => {
        if (!perfilSelecionado) return;

        try {
            const token = localStorage.getItem("bomPiteuToken") || localStorage.getItem("token");
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/profiles/${perfilSelecionado._id}/planejamento`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ planejamento })
            });

            if (!res.ok) throw new Error(t('alimentacaoSenior.errors.savePlanningError'));

            console.log('✅ Planejamento salvo com sucesso!');
        } catch (error) {
            console.error('Erro ao salvar planejamento:', error);
        }
    };

    const adicionarReceitaAoPerfil = async (receita, tipoRefeicao) => {
        if (!perfilSelecionado) return;

        try {
            const token = localStorage.getItem("bomPiteuToken") || localStorage.getItem("token");

            const mealTypeMap = {
                'cafe': 'breakfast',
                'almoco': 'lunch',
                'jantar': 'dinner',
                'lanche': 'snack',
                'pequeno-almoço': 'breakfast',
                'almoço': 'lunch'
            };

            const recipeData = {
                mealType: mealTypeMap[tipoRefeicao] || 'lunch',
                notes: [{
                    content: receita.title || receita.titulo || t('alimentacaoSenior.recipe'),
                    emoji: "📝"
                }],
                imageUrl: receita.finalImage || '/default-recipe.jpg',
                quantity: 1,
                readyToCook: 'false',
                ingredients: receita.ingredients || [],
                steps: receita.steps || [],
                time: receita.time || '30 min',
                difficulty: receita.difficulty || t('alimentacaoSenior.difficulty.medium')
            };

            console.log('📤 Enviando receita completa:', recipeData);

            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/profiles/${perfilSelecionado._id}/recipe`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(recipeData)
            });

            if (!res.ok) throw new Error(t('alimentacaoSenior.errors.saveRecipeError'));

            const result = await res.json();
            console.log('✅ Receita salva no perfil:', result);

            setPerfilSelecionado(prev => ({
                ...prev,
                recipes: [...(prev.recipes || []), result.recipe]
            }));

            setPerfis(prev => prev.map(p =>
                p._id === perfilSelecionado._id
                    ? { ...p, recipes: [...(p.recipes || []), result.recipe] }
                    : p
            ));

            return result.recipe;
        } catch (error) {
            console.error('❌ Erro ao salvar receita no perfil:', error);
            throw error;
        }
    };

    const handleCriarPerfil = async (e) => {
        e.preventDefault();

        try {
            if (!novoPerfil.name || !novoPerfil.birthDate) {
                toast({
                    title: t('alimentacaoSenior.errors.requiredFields'),
                    description: t('alimentacaoSenior.errors.requiredFieldsDesc'),
                    variant: "destructive"
                });
                return;
            }
            setSalvandoPerfil(true);

            const birthDate = new Date(novoPerfil.birthDate);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }

            const formData = new FormData();
            formData.append('name', novoPerfil.name);
            formData.append('type', 'senior');
            formData.append('birthDate', new Date(novoPerfil.birthDate).toISOString());
            formData.append('country', novoPerfil.country);
            formData.append('allergies', JSON.stringify(novoPerfil.allergies));
            formData.append('intolerances', JSON.stringify(novoPerfil.intolerances));
            formData.append('conditions', JSON.stringify(novoPerfil.conditions));
            formData.append('difficulties', JSON.stringify(novoPerfil.difficulties));
            const emergencyInfo = `${t('alimentacaoSenior.emergency.contact')}: ${novoPerfil.emergencyContact} - ${t('alimentacaoSenior.emergency.phone')}: ${novoPerfil.emergencyPhone}`;
            formData.append('emergencyInfo', emergencyInfo);

            if (novoPerfil.profileImage) {
                formData.append('profileImage', novoPerfil.profileImage);
            }

            const token = localStorage.getItem("bomPiteuToken") || localStorage.getItem("token");
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/profiles`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData
            });

            if (!res.ok) throw new Error(t('alimentacaoSenior.errors.createProfileError'));
            const perfilCriado = await res.json();

            const lembretesPadrao = [
                { hora: '08:00', tipo: 'breakfast', ativo: true },
                { hora: '13:00', tipo: 'lunch', ativo: true },
                { hora: '20:00', tipo: 'dinner', ativo: true }
            ];

            await fetch(`${import.meta.env.VITE_API_URL}/api/profiles/${perfilCriado._id}/lembretes`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ lembretes: lembretesPadrao })
            });

            await carregarPerfis();

            toast({
                title: t('alimentacaoSenior.success.profileCreated'),
                description: t('alimentacaoSenior.success.profileCreatedDesc', { name: novoPerfil.name }),
                duration: 3000
            });

            setShowNovoPerfil(false);
            resetNovoPerfil();
        } catch (error) {
            toast({
                title: t('common.error'),
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setSalvandoPerfil(false);
        }
    };

    const handleGerarReceita = () => {
        if (!perfilSelecionado) {
            toast({
                title: t('alimentacaoSenior.errors.noProfileSelected'),
                description: t('alimentacaoSenior.errors.noProfileSelectedDesc'),
                variant: "destructive"
            });
            return;
        }
        setShowPersonalizarReceita(true);
    };

    const processarGeracaoReceita = async () => {
        if (!perfilSelecionado) return;

        setGerandoReceita(true);

        try {
            toast({
                title: t('alimentacaoSenior.preparingRecipe'),
                description: t('alimentacaoSenior.preparingRecipeDesc'),
            });

            const receita = await gerarReceitaAdaptada(perfilSelecionado._id, opcoesReceita.numeroPessoas, {
                mealType: opcoesReceita.tipoRefeicao,
                difficulty: opcoesReceita.dificuldade,
                maxTime: opcoesReceita.tempoMaximo,
                userRequest: opcoesReceita.observacoes || undefined
            });

            const dadosSessao = {
                titulo: receita.title,
                descricao: receita.description,
                ingredientes: receita.ingredients,
                passos: receita.steps,
                tempo: receita.time,
                dificuldade: receita.difficulty,
                imagemUrl: receita.finalImage
            };

            const { sessionId } = await criarSessaoDeReceita(dadosSessao);

            toast({
                title: t('alimentacaoSenior.success.recipeGenerated'),
                description: t('alimentacaoSenior.success.recipeGeneratedDesc', { title: receita.title }),
                duration: 4000
            });

            setShowPersonalizarReceita(false);

            setOpcoesReceita({
                tipoRefeicao: 'almoço',
                numeroPessoas: 2,
                dificuldade: 'media',
                tempoMaximo: 45,
                observacoes: ''
            });

            try {
                await adicionarReceitaAoPerfil(receita, opcoesReceita.tipoRefeicao);
            } catch (error) {
                console.error('Erro ao salvar receita no perfil:', error);
            }

            onStartChat({
                title: receita.title,
                recipe: receita,
                perfilId: perfilSelecionado._id,
                fromPersonalizado: true,
                opcoes: opcoesReceita,
                source: 'receita_criada',
                sessionId: sessionId,
                finalImage: receita.finalImage,
                podeIniciarPassoAPasso: true,
                mensagemInicio: t('alimentacaoSenior.chat.startMessage', { title: receita.title }),
                totalPassos: receita.steps?.length || 0
            });

        } catch (error) {
            console.error('Erro ao gerar receita:', error);
            toast({
                title: t('common.error'),
                description: error.message || t('alimentacaoSenior.errors.generateRecipeError'),
                variant: "destructive"
            });
        } finally {
            setGerandoReceita(false);
        }
    };

    const gerarPlanejamentoSemanal = async () => {
        if (!perfilSelecionado) return;

        setGerandoPlanejamento(true);

        try {
            toast({
                title: t('alimentacaoSenior.planningInProgress'),
                description: t('alimentacaoSenior.planningInProgressDesc'),
            });

            const receitasGeradas = [];

            const diasComRefeicoes = Object.entries(planejamento)
                .filter(([_, refeicoes]) => Object.values(refeicoes).some(v => v === true))
                .map(([dia]) => dia);

            console.log('📅 Dias com refeições:', diasComRefeicoes);

            for (const [dia, refeicoes] of Object.entries(planejamento)) {
                const temRefeicao = Object.values(refeicoes).some(v => v === true);

                if (!temRefeicao) {
                    console.log(`⏭️ Dia ${dia} sem refeições, ignorando`);
                    continue;
                }

                const refeicoesAtivas = Object.entries(refeicoes)
                    .filter(([_, ativa]) => ativa === true)
                    .map(([tipo]) => tipo);

                console.log(`🍳 Gerando para ${dia}:`, refeicoesAtivas);

                for (const tipo of refeicoesAtivas) {
                    const mealTypeMap = {
                        cafe: 'pequeno-almoço',
                        almoco: 'almoço',
                        jantar: 'jantar',
                        lanche: 'lanche'
                    };

                    const receita = await gerarReceitaAdaptada(perfilSelecionado._id, 1, {
                        mealType: mealTypeMap[tipo],
                        difficulty: 'media',
                        maxTime: 45,
                        userRequest: t('alimentacaoSenior.planning.userRequest', { dia: t(`alimentacaoSenior.days.${dia}`), mealType: mealTypeMap[tipo] })
                    });

                    receitasGeradas.push({
                        dia,
                        tipo,
                        titulo: receita.title,
                        descricao: receita.description,
                        ingredients: receita.ingredients,
                        steps: receita.steps,
                        time: receita.time,
                        difficulty: receita.difficulty,
                        finalImage: receita.finalImage
                    });

                    try {
                        await adicionarReceitaAoPerfil(receita, tipo);
                    } catch (error) {
                        console.error(`Erro ao salvar receita ${receita.title} no perfil:`, error);
                    }
                }
            }

            console.log('✅ Total de receitas geradas:', receitasGeradas.length);

            await salvarPlanejamento();

            toast({
                title: t('alimentacaoSenior.success.planningCreated'),
                description: t('alimentacaoSenior.success.planningCreatedDesc', { count: receitasGeradas.length }),
                duration: 4000
            });

            setShowPlanejarSemana(false);
            setPlanejamentoResumo(receitasGeradas);
            setShowResumoPlanejamento(true);

        } catch (error) {
            console.error('Erro ao gerar planejamento:', error);
            toast({
                title: t('common.error'),
                description: error.message || t('alimentacaoSenior.errors.planningError'),
                variant: "destructive"
            });
        } finally {
            setGerandoPlanejamento(false);
        }
    };

    const handleFacilPreparar = () => {
        if (!perfilSelecionado) {
            toast({
                title: t('alimentacaoSenior.errors.noProfileSelected'),
                description: t('alimentacaoSenior.errors.noProfileSelectedDesc'),
                variant: "destructive"
            });
            return;
        }
        setShowFacilModal(true);
    };

    const handlePlanejarSemana = () => {
        if (!perfilSelecionado) {
            toast({
                title: t('alimentacaoSenior.errors.noProfileSelected'),
                description: t('alimentacaoSenior.errors.noProfileSelectedDesc'),
                variant: "destructive"
            });
            return;
        }
        setShowPlanejarSemana(true);
    };

    const handleContatoEmergencia = () => {
        if (!perfilSelecionado?.emergencyInfo || perfilSelecionado.emergencyInfo.includes('Contato:  - Tel: ')) {
            toast({
                title: t('alimentacaoSenior.emergency.notConfigured'),
                description: t('alimentacaoSenior.emergency.notConfiguredDesc'),
                variant: "destructive"
            });
            return;
        }
        setShowEmergencia(true);
    };

    const resetNovoPerfil = () => {
        setNovoPerfil({
            name: '',
            birthDate: null,
            country: 'PT',
            conditions: [],
            difficulties: [],
            allergies: [],
            intolerances: [],
            emergencyContact: '',
            emergencyPhone: '',
            otherAllergies: '',
            otherIntolerances: '',
            otherConditions: '',
            otherDifficulties: '',
            profileImage: null,
            profileImagePreview: ''
        });
    };

    const handleLigarEmergencia = () => {
        const match = perfilSelecionado.emergencyInfo.match(/Tel: (.*)/);
        if (match && match[1]) {
            window.open(`tel:${match[1]}`, '_blank');
            toast({
                title: t('alimentacaoSenior.emergency.calling'),
                description: t('alimentacaoSenior.emergency.callingDesc')
            });
        }
    };

    const filtrarReceitas = (receitas) => {
        if (!receitas) return [];

        let filtered = [...receitas];

        if (filtroSaude !== 'todas') {
            filtered = filtered.filter(r => {
                if (filtroSaude === 'facil-mastigar') return r.difficulty === 'facil';
                if (filtroSaude === 'baixo-sal') return r.lowSalt === true;
                if (filtroSaude === 'baixo-acucar') return r.lowSugar === true;
                if (filtroSaude === 'rico-fibra') return r.highFiber === true;
                if (filtroSaude === 'liquidos') return r.texture === 'liquid';
                return true;
            });
        }

        return filtered;
    };

    const toggleAllergy = (allergy) => {
        setNovoPerfil(prev => ({
            ...prev,
            allergies: prev.allergies.includes(allergy)
                ? prev.allergies.filter(a => a !== allergy)
                : [...prev.allergies, allergy]
        }));
    };

    const toggleIntolerance = (intolerance) => {
        setNovoPerfil(prev => ({
            ...prev,
            intolerances: prev.intolerances.includes(intolerance)
                ? prev.intolerances.filter(i => i !== intolerance)
                : [...prev.intolerances, intolerance]
        }));
    };

    const toggleCondition = (condition) => {
        setNovoPerfil(prev => ({
            ...prev,
            conditions: prev.conditions.includes(condition)
                ? prev.conditions.filter(c => c !== condition)
                : [...prev.conditions, condition]
        }));
    };

    const toggleDifficulty = (difficulty) => {
        setNovoPerfil(prev => ({
            ...prev,
            difficulties: prev.difficulties.includes(difficulty)
                ? prev.difficulties.filter(d => d !== difficulty)
                : [...prev.difficulties, difficulty]
        }));
    };

    const handleProfileImageUpload = (file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            setNovoPerfil(prev => ({
                ...prev,
                profileImagePreview: reader.result,
                profileImage: file
            }));
        };
        reader.readAsDataURL(file);
    };

    const handleEditarPerfil = (perfil) => {
        let emergencyName = '';
        let emergencyPhone = '';

        if (perfil.emergencyInfo) {
            const match = perfil.emergencyInfo.match(/Contato: (.*?) - Tel: (.*)/);
            if (match) {
                emergencyName = match[1];
                emergencyPhone = match[2];
            }
        }

        setNovoPerfil({
            name: perfil.name,
            birthDate: perfil.birthDate ? perfil.birthDate.split('T')[0] : '',
            country: perfil.country || 'PT',
            conditions: perfil.conditions || [],
            difficulties: perfil.difficulties || [],
            allergies: perfil.allergies || [],
            intolerances: perfil.intolerances || [],
            emergencyContact: emergencyName,
            emergencyPhone: emergencyPhone,
            profileImage: null,
            profileImagePreview: perfil.profileImage || '',
            otherAllergies: '',
            otherIntolerances: '',
            otherConditions: '',
            otherDifficulties: ''
        });

        setEditandoPerfil(perfil);
        setShowEditarModal(true);
    };

    const handleAtualizarPerfil = async (e) => {
        e.preventDefault();
        if (!editandoPerfil) return;

        try {
            const formData = new FormData();
            formData.append('name', novoPerfil.name);
            formData.append('type', 'senior');
            formData.append('birthDate', new Date(novoPerfil.birthDate).toISOString());
            formData.append('country', novoPerfil.country);
            formData.append('allergies', JSON.stringify(novoPerfil.allergies));
            formData.append('intolerances', JSON.stringify(novoPerfil.intolerances));
            formData.append('conditions', JSON.stringify(novoPerfil.conditions));
            formData.append('difficulties', JSON.stringify(novoPerfil.difficulties));

            const emergencyInfo = `${t('alimentacaoSenior.emergency.contact')}: ${novoPerfil.emergencyContact} - ${t('alimentacaoSenior.emergency.phone')}: ${novoPerfil.emergencyPhone}`;
            formData.append('emergencyInfo', emergencyInfo);

            if (novoPerfil.profileImage) {
                formData.append('profileImage', novoPerfil.profileImage);
            }

            const token = localStorage.getItem("bomPiteuToken") || localStorage.getItem("token");
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/profiles/${editandoPerfil._id}`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}` },
                body: formData
            });

            if (!res.ok) throw new Error(t('alimentacaoSenior.errors.updateProfileError'));

            const perfilAtualizado = await res.json();

            setPerfis(prev => prev.map(p => p._id === perfilAtualizado._id ? perfilAtualizado : p));
            if (perfilSelecionado?._id === perfilAtualizado._id) {
                setPerfilSelecionado(perfilAtualizado);
            }

            toast({ title: t('alimentacaoSenior.success.profileUpdated'), description: t('alimentacaoSenior.success.profileUpdatedDesc', { name: novoPerfil.name }) });
            setShowEditarModal(false);
            setEditandoPerfil(null);
            resetNovoPerfil();
        } catch (error) {
            toast({ title: t('common.error'), description: error.message, variant: "destructive" });
        }
    };

    const handleExcluirPerfil = async (perfilId) => {
        const perfil = perfis.find(p => p._id === perfilId);
        if (!confirm(t('alimentacaoSenior.confirm.deleteProfile', { name: perfil?.name }))) return;

        try {
            const token = localStorage.getItem("bomPiteuToken") || localStorage.getItem("token");
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/profiles/${perfilId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) throw new Error(t('alimentacaoSenior.errors.deleteProfileError'));

            setPerfis(prev => prev.filter(p => p._id !== perfilId));
            if (perfilSelecionado?._id === perfilId) {
                setPerfilSelecionado(perfis.length > 1 ? perfis[0] : null);
            }

            toast({ title: t('alimentacaoSenior.success.profileDeleted'), description: t('alimentacaoSenior.success.profileDeletedDesc') });
        } catch (error) {
            toast({ title: t('common.error'), description: error.message, variant: "destructive" });
        }
    };

    const handleCozinharReceita = async (receita) => {
        try {
            setGerandoReceita(true);

            const dadosSessao = {
                titulo: receita.notes?.[0]?.content || t('alimentacaoSenior.recipe'),
                descricao: t('alimentacaoSenior.recipeDescription', { mealType: t(`alimentacaoSenior.mealTypes.${receita.mealType || 'meal'}`) }),
                ingredientes: receita.ingredients || [],
                passos: receita.steps || [t('alimentacaoSenior.steps.prepare'), t('alimentacaoSenior.steps.cook'), t('alimentacaoSenior.steps.serve')],
                tempo: receita.time || '30 min',
                dificuldade: receita.difficulty || t('alimentacaoSenior.difficulty.medium'),
                imagemUrl: receita.imageUrl || null
            };

            const { sessionId } = await criarSessaoDeReceita(dadosSessao);

            setShowReceitaModal(false);

            onStartChat({
                title: dadosSessao.titulo,
                recipe: {
                    title: dadosSessao.titulo,
                    ingredients: dadosSessao.ingredientes,
                    steps: dadosSessao.passos.map((desc, idx) => ({
                        stepNumber: idx + 1,
                        description: desc
                    })),
                    time: dadosSessao.tempo,
                    difficulty: dadosSessao.dificuldade,
                    finalImage: receita.imageUrl
                },
                sessionId: sessionId,
                totalPassos: dadosSessao.passos.length,
                podeIniciarPassoAPasso: true,
                mensagemInicio: t('alimentacaoSenior.chat.startMessage', { title: dadosSessao.titulo }),
                source: 'receita_criada',
                finalImage: receita.imageUrl
            });

        } catch (error) {
            console.error('Erro ao iniciar cozinhar:', error);
            toast({
                title: t('common.error'),
                description: t('alimentacaoSenior.errors.startCookingError'),
                variant: "destructive"
            });
        } finally {
            setGerandoReceita(false);
        }
    };

    const handleVerReceita = (receita) => {
        setReceitaSelecionada(receita);
        setShowReceitaModal(true);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    const receitasFiltradas = perfilSelecionado ? filtrarReceitas(perfilSelecionado.recipes) : [];

    return (
        <div className="space-y-6 dark:text-gray-200">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-2xl shadow-lg"
            >
                <Button
                    variant="ghost"
                    onClick={() => onNavigate('dashboard')}
                    className="text-white hover:bg-white/20 mb-4"
                >
                    <ArrowLeft className="mr-2 h-5 w-5" /> {t('common.backToDashboard')}
                </Button>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <User className="h-8 w-8" /> {t('alimentacaoSenior.title')}
                </h1>
                <p className="text-white/90 mt-2">{t('alimentacaoSenior.subtitle')}</p>
            </motion.div>

            {/* Contato de Emergência */}
            <div className="fixed bottom-6 right-6 z-50">
                <Button
                    onClick={handleContatoEmergencia}
                    size="lg"
                    className="bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg flex items-center gap-2"
                >
                    <Shield className="h-5 w-5" />
                    <span className="hidden md:inline">{t('alimentacaoSenior.emergency.button')}</span>
                </Button>
            </div>

            {/* Dialog de Emergência */}
            {showEmergencia && perfilSelecionado?.emergencyInfo && (
                <div className="fixed inset-0 bg-black/50 dark:bg-black/80 flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl"
                    >
                        <div className="text-center">
                            <div className="bg-red-100 dark:bg-red-900/30 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertTriangle className="h-10 w-10 text-red-600 dark:text-red-400" />
                            </div>

                            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                                {t('alimentacaoSenior.emergency.title')}
                            </h3>

                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                {t('alimentacaoSenior.emergency.description', { name: perfilSelecionado.name })}
                            </p>

                            {(() => {
                                const emergencyText = perfilSelecionado.emergencyInfo;
                                const match = emergencyText.match(/Contato: (.*?) - Tel: (.*)/);

                                if (match) {
                                    const [_, nomeContato, telefone] = match;
                                    return (
                                        <div className="bg-blue-50 dark:bg-blue-900/30 rounded-xl p-5 mb-6 border border-blue-200 dark:border-blue-800">
                                            <p className="text-sm text-blue-700 dark:text-blue-300 mb-1">{t('alimentacaoSenior.emergency.responsible')}</p>
                                            <p className="font-bold text-xl text-gray-800 dark:text-white mb-2">{nomeContato}</p>
                                            <p className="text-lg text-blue-600 dark:text-blue-400 font-medium">{telefone}</p>
                                        </div>
                                    );
                                }

                                return (
                                    <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-5 mb-6">
                                        <p className="text-gray-600 dark:text-gray-300">{emergencyText}</p>
                                    </div>
                                );
                            })()}

                            <div className="flex gap-3">
                                <Button
                                    onClick={handleLigarEmergencia}
                                    className="flex-1 bg-red-500 hover:bg-red-600 text-white h-12"
                                >
                                    <Phone className="mr-2 h-5 w-5" /> {t('alimentacaoSenior.emergency.callNow')}
                                </Button>

                                <Button
                                    variant="outline"
                                    onClick={() => setShowEmergencia(false)}
                                    className="flex-1 h-12 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                                >
                                    {t('common.cancel')}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Seletor de Perfis */}
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                            <User className="h-6 w-6 text-indigo-500 dark:text-indigo-400" />
                            {t('alimentacaoSenior.profilesTitle', { count: perfis.length })}
                        </CardTitle>

                        <Button
                            size="sm"
                            onClick={() => setShowNovoPerfil(true)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                            <Plus className="mr-2 h-4 w-4" /> {t('alimentacaoSenior.newProfile')}
                        </Button>
                    </div>
                </CardHeader>

                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {perfis.map((perfil) => (
                            <motion.div
                                key={perfil._id}
                                whileHover={{ scale: 1.05 }}
                                className={`p-4 rounded-xl cursor-pointer transition-all relative ${perfilSelecionado?._id === perfil._id
                                    ? 'bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 border-2 border-indigo-500 dark:border-indigo-400'
                                    : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    }`}
                            >
                                {/* Menu de opções */}
                                <div className="absolute top-2 right-2 z-10">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                                                <MoreVertical className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                                            <DropdownMenuItem
                                                onClick={(e) => { e.stopPropagation(); handleEditarPerfil(perfil); }}
                                                className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                            >
                                                <Edit className="mr-2 h-4 w-4" /> {t('common.edit')}
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={(e) => { e.stopPropagation(); handleExcluirPerfil(perfil._id); }}
                                                className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" /> {t('common.delete')}
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                <div className="text-center" onClick={() => {
                                    setPerfilSelecionado(perfil);
                                    carregarLembretes(perfil._id);
                                    carregarPlanejamento(perfil._id);
                                }}>
                                    <div className="text-4xl mb-2 flex justify-center">
                                        {perfil.profileImage ? (
                                            <img src={perfil.profileImage} alt={perfil.name} className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600" />
                                        ) : (
                                            '👴'
                                        )}
                                    </div>
                                    <p className="font-bold text-gray-900 dark:text-white">{perfil.name}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {perfil.birthDate ? new Date().getFullYear() - new Date(perfil.birthDate).getFullYear() : perfil.age} {t('alimentacaoSenior.years')}
                                    </p>
                                    {perfil.healthObservations && perfil.healthObservations.length > 0 && (
                                        <>
                                            {perfil.healthObservations
                                                .filter(item => !item.startsWith(t('alimentacaoSenior.emergency.contact')) && condicoesSaude.includes(item))
                                                .slice(0, 1)
                                                .map((cond, idx) => (
                                                    <p key={idx} className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                                                        ⚕️ {cond}
                                                    </p>
                                                ))
                                            }
                                            {perfil.healthObservations
                                                .filter(item =>
                                                    !item.startsWith(t('alimentacaoSenior.emergency.contact')) &&
                                                    !item.startsWith('alimentacaoSenior') &&
                                                    condicoesSaude.includes(item)
                                                )
                                                .slice(0, 1)
                                                .map((cond, idx) => (
                                                    <p key={idx} className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                                                        ⚕️ {cond}
                                                    </p>
                                                ))
                                            }
                                        </>
                                    )}
                                    {perfil.emergencyInfo && (() => {
                                        // Tenta extrair nome e telefone do formato "Contato: Nome - Tel: 123"
                                        const match = perfil.emergencyInfo.match(/Contato: (.*?) - Tel: (.*)/);
                                        if (match) {
                                            const nome = match[1];
                                            const telefone = match[2];
                                            return (
                                                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                                    <Shield className="h-3 w-3 inline mr-1" />
                                                    {t('alimentacaoSenior.emergency.contact')}: {nome} - {t('alimentacaoSenior.emergency.phone')}: {telefone}
                                                </div>
                                            );
                                        } else {
                                            // Se a string parecer uma chave de tradução (começar com "alimentacaoSenior"), não mostra nada
                                            if (perfil.emergencyInfo && perfil.emergencyInfo.startsWith('alimentacaoSenior')) {
                                                return null; // ou você pode colocar uma mensagem como "Contato não disponível"
                                            }
                                            return (
                                                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                                    <Shield className="h-3 w-3 inline mr-1" />
                                                    {perfil.emergencyInfo}
                                                </div>
                                            );
                                        }
                                    })()}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Modal de Edição de Perfil (idêntico ao de criação, mas com título diferente) */}
            <Dialog open={showEditarModal} onOpenChange={setShowEditarModal}>
                <DialogContent className="sm:max-w-lg w-[95vw] max-h-[85vh] flex flex-col p-0 overflow-hidden border-none shadow-2xl dark:bg-gray-800">
                    <DialogHeader className="p-4 pb-0">
                        <DialogTitle className="text-lg font-bold text-indigo-700 dark:text-indigo-400">{t('alimentacaoSenior.editProfile')}</DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleAtualizarPerfil} className="flex flex-col flex-1 overflow-hidden">
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {/* Header com Foto */}
                            <div className="flex items-center gap-4 bg-indigo-50/50 dark:bg-indigo-900/20 p-3 rounded-xl border border-indigo-100 dark:border-indigo-800">
                                <div className="relative shrink-0">
                                    <div className="w-14 h-14 rounded-full overflow-hidden bg-white dark:bg-gray-700 border-2 border-indigo-500 dark:border-indigo-400 shadow-sm">
                                        {novoPerfil.profileImagePreview ? (
                                            <img src={novoPerfil.profileImagePreview} alt={t('alimentacaoSenior.previewAlt')} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-2xl">👴</div>
                                        )}
                                    </div>
                                    <label htmlFor="edit-profile-image" className="absolute -bottom-1 -right-1 bg-indigo-600 dark:bg-indigo-500 text-white p-1 rounded-full cursor-pointer shadow-lg">
                                        <Upload className="h-3 w-3" />
                                        <input
                                            id="edit-profile-image"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) handleProfileImageUpload(file);
                                            }}
                                        />
                                    </label>
                                </div>

                                <div className="flex-1 grid grid-cols-2 gap-2">
                                    <div>
                                        <Label className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400">{t('alimentacaoSenior.form.name')} *</Label>
                                        <Input
                                            value={novoPerfil.name}
                                            onChange={(e) => setNovoPerfil({ ...novoPerfil, name: e.target.value })}
                                            placeholder={t('alimentacaoSenior.form.namePlaceholder')}
                                            required
                                            className="h-7 text-xs bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400">{t('alimentacaoSenior.form.birthDate')} *</Label>
                                        <Input
                                            type="date"
                                            value={novoPerfil.birthDate ? novoPerfil.birthDate.split('T')[0] : ''}
                                            onChange={(e) => setNovoPerfil({ ...novoPerfil, birthDate: e.target.value })}
                                            required
                                            className="h-7 text-xs bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Condições de Saúde */}
                            <div className="space-y-1">
                                <Label className="text-xs font-semibold text-gray-700 dark:text-gray-300">{t('alimentacaoSenior.form.healthConditions')}</Label>
                                <select
                                    className="w-full h-8 px-2 rounded-md border border-input bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (val && !novoPerfil.conditions.includes(val)) toggleCondition(val);
                                        e.target.value = "";
                                    }}
                                    value=""
                                >
                                    <option value="">{t('alimentacaoSenior.form.addCondition')}...</option>
                                    {condicoesSaude.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {novoPerfil.conditions.map(c => (
                                        <span key={c} className="inline-flex items-center gap-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded text-[10px] font-medium border border-indigo-200 dark:border-indigo-800">
                                            {c}
                                            <X className="h-2.5 w-2.5 cursor-pointer" onClick={() => toggleCondition(c)} />
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Dificuldades */}
                            <div className="space-y-1">
                                <Label className="text-xs font-semibold text-gray-700 dark:text-gray-300">{t('alimentacaoSenior.form.difficulties')}</Label>
                                <select
                                    className="w-full h-8 px-2 rounded-md border border-input bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-purple-500"
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (val && !novoPerfil.difficulties.includes(val)) toggleDifficulty(val);
                                        e.target.value = "";
                                    }}
                                    value=""
                                >
                                    <option value="">{t('alimentacaoSenior.form.addDifficulty')}...</option>
                                    {dificuldades.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {novoPerfil.difficulties.map(d => (
                                        <span key={d} className="inline-flex items-center gap-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-1.5 py-0.5 rounded text-[10px] font-medium border border-purple-200 dark:border-purple-800">
                                            {d}
                                            <X className="h-2.5 w-2.5 cursor-pointer" onClick={() => toggleDifficulty(d)} />
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Alergias + Intolerâncias */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label className="text-xs font-semibold text-gray-700 dark:text-gray-300">{t('alimentacaoSenior.form.allergies')}</Label>
                                    <select
                                        className="w-full h-8 px-2 rounded-md border border-input bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-red-500"
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (val && !novoPerfil.allergies.includes(val)) toggleAllergy(val);
                                            e.target.value = "";
                                        }}
                                        value=""
                                    >
                                        <option value="">{t('alimentacaoSenior.form.addAllergy')}...</option>
                                        <option value={t('allergies.peanut')}>{t('allergies.peanut')}</option>
                                        <option value={t('allergies.treeNuts')}>{t('allergies.treeNuts')}</option>
                                        <option value={t('allergies.milk')}>{t('allergies.milk')}</option>
                                        <option value={t('allergies.egg')}>{t('allergies.egg')}</option>
                                        <option value={t('allergies.soy')}>{t('allergies.soy')}</option>
                                        <option value={t('allergies.wheat')}>{t('allergies.wheat')}</option>
                                        <option value={t('allergies.fish')}>{t('allergies.fish')}</option>
                                        <option value={t('allergies.shellfish')}>{t('allergies.shellfish')}</option>
                                    </select>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {novoPerfil.allergies.map(a => (
                                            <span key={a} className="inline-flex items-center gap-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-1.5 py-0.5 rounded text-[10px] font-medium border border-red-200 dark:border-red-800">
                                                {a}
                                                <X className="h-2.5 w-2.5 cursor-pointer" onClick={() => toggleAllergy(a)} />
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <Label className="text-xs font-semibold text-gray-700 dark:text-gray-300">{t('alimentacaoSenior.form.intolerances')}</Label>
                                    <select
                                        className="w-full h-8 px-2 rounded-md border border-input bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-amber-500"
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (val && !novoPerfil.intolerances.includes(val)) toggleIntolerance(val);
                                            e.target.value = "";
                                        }}
                                        value=""
                                    >
                                        <option value="">{t('alimentacaoSenior.form.addIntolerance')}...</option>
                                        <option value={t('intolerances.lactose')}>{t('intolerances.lactose')}</option>
                                        <option value={t('intolerances.gluten')}>{t('intolerances.gluten')}</option>
                                        <option value={t('intolerances.histamine')}>{t('intolerances.histamine')}</option>
                                        <option value={t('intolerances.fructose')}>{t('intolerances.fructose')}</option>
                                        <option value={t('intolerances.caffeine')}>{t('intolerances.caffeine')}</option>
                                    </select>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {novoPerfil.intolerances.map(i => (
                                            <span key={i} className="inline-flex items-center gap-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-1.5 py-0.5 rounded text-[10px] font-medium border border-amber-200 dark:border-amber-800">
                                                {i}
                                                <X className="h-2.5 w-2.5 cursor-pointer" onClick={() => toggleIntolerance(i)} />
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Contato de Emergência */}
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800 space-y-2">
                                <Label className="text-xs font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-1">
                                    <Phone className="h-3 w-3" /> {t('alimentacaoSenior.form.emergencyContact')}
                                </Label>
                                <div className="grid grid-cols-2 gap-2">
                                    <Input
                                        value={novoPerfil.emergencyContact}
                                        onChange={(e) => setNovoPerfil({ ...novoPerfil, emergencyContact: e.target.value })}
                                        placeholder={t('alimentacaoSenior.form.emergencyNamePlaceholder')}
                                        required
                                        className="h-8 text-xs bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                                    />
                                    <Input
                                        value={novoPerfil.emergencyPhone}
                                        onChange={(e) => setNovoPerfil({ ...novoPerfil, emergencyPhone: e.target.value })}
                                        placeholder={t('alimentacaoSenior.form.emergencyPhonePlaceholder')}
                                        required
                                        className="h-8 text-xs bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Rodapé */}
                        <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex gap-2 bg-white dark:bg-gray-800">
                            <Button
                                variant="ghost"
                                onClick={() => { setShowEditarModal(false); resetNovoPerfil(); }}
                                type="button"
                                className="flex-1 h-8 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                {t('common.cancel')}
                            </Button>
                            <Button
                                type="submit"
                                className="flex-1 h-8 text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
                            >
                                {t('common.save')}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal de Personalização de Receita */}
            <Dialog open={showPersonalizarReceita} onOpenChange={setShowPersonalizarReceita}>
                <DialogContent className="sm:max-w-md dark:bg-gray-800">
                    <DialogHeader>
                        <DialogTitle className="text-indigo-700 dark:text-indigo-400 flex items-center gap-2">
                            <Sparkles className="h-5 w-5" />
                            {t('alimentacaoSenior.customizeRecipeTitle', { name: perfilSelecionado?.name })}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {/* Tipo de Refeição */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('alimentacaoSenior.customize.mealType')}</Label>
                            <div className="grid grid-cols-3 gap-2">
                                {['pequeno-almoço', 'almoço', 'jantar'].map((tipo) => (
                                    <Button
                                        key={tipo}
                                        type="button"
                                        variant={opcoesReceita.tipoRefeicao === tipo ? "default" : "outline"}
                                        className={opcoesReceita.tipoRefeicao === tipo
                                            ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                                            : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                        }
                                        onClick={() => setOpcoesReceita({ ...opcoesReceita, tipoRefeicao: tipo })}
                                    >
                                        {tipo === 'pequeno-almoço' ? t('alimentacaoSenior.mealTypes.breakfast') :
                                            tipo === 'almoço' ? t('alimentacaoSenior.mealTypes.lunch') :
                                                t('alimentacaoSenior.mealTypes.dinner')}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {/* Número de Pessoas */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('alimentacaoSenior.customize.numberOfPeople')}</Label>
                            <div className="flex items-center gap-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setOpcoesReceita({
                                        ...opcoesReceita,
                                        numeroPessoas: Math.max(1, opcoesReceita.numeroPessoas - 1)
                                    })}
                                    className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                                >
                                    -
                                </Button>
                                <span className="text-lg font-semibold min-w-[40px] text-center text-gray-900 dark:text-white">
                                    {opcoesReceita.numeroPessoas}
                                </span>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setOpcoesReceita({
                                        ...opcoesReceita,
                                        numeroPessoas: Math.min(10, opcoesReceita.numeroPessoas + 1)
                                    })}
                                    className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                                >
                                    +
                                </Button>
                                <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                                    {opcoesReceita.numeroPessoas === 1 ? t('alimentacaoSenior.customize.person') : t('alimentacaoSenior.customize.people')}
                                </span>
                            </div>
                        </div>

                        {/* Dificuldade */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('alimentacaoSenior.customize.difficulty')}</Label>
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { value: 'facil', label: t('alimentacaoSenior.difficulty.easy'), desc: t('alimentacaoSenior.difficulty.easyDesc') },
                                    { value: 'media', label: t('alimentacaoSenior.difficulty.medium'), desc: t('alimentacaoSenior.difficulty.mediumDesc') },
                                    { value: 'dificil', label: t('alimentacaoSenior.difficulty.hard'), desc: t('alimentacaoSenior.difficulty.hardDesc') }
                                ].map((tipo) => (
                                    <Button
                                        key={tipo.value}
                                        type="button"
                                        variant={opcoesReceita.dificuldade === tipo.value ? "default" : "outline"}
                                        className={`flex flex-col h-auto py-2 px-1 ${opcoesReceita.dificuldade === tipo.value
                                            ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                                            : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                            }`}
                                        onClick={() => setOpcoesReceita({ ...opcoesReceita, dificuldade: tipo.value })}
                                    >
                                        <span className="text-sm">{tipo.label}</span>
                                        <span className="text-[10px] opacity-75">{tipo.desc}</span>
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {/* Tempo Máximo */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('alimentacaoSenior.customize.maxTime')}</Label>
                            <Select
                                value={opcoesReceita.tempoMaximo.toString()}
                                onValueChange={(value) => setOpcoesReceita({ ...opcoesReceita, tempoMaximo: parseInt(value) })}
                            >
                                <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                    <SelectValue placeholder={t('alimentacaoSenior.customize.selectTime')} />
                                </SelectTrigger>
                                <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                                    <SelectItem value="15" className="dark:text-white dark:focus:bg-gray-700">15 {t('alimentacaoSenior.customize.minutes')} ({t('alimentacaoSenior.customize.fast')})</SelectItem>
                                    <SelectItem value="30" className="dark:text-white dark:focus:bg-gray-700">30 {t('alimentacaoSenior.customize.minutes')}</SelectItem>
                                    <SelectItem value="45" className="dark:text-white dark:focus:bg-gray-700">45 {t('alimentacaoSenior.customize.minutes')}</SelectItem>
                                    <SelectItem value="60" className="dark:text-white dark:focus:bg-gray-700">60 {t('alimentacaoSenior.customize.minutes')} (1h)</SelectItem>
                                    <SelectItem value="90" className="dark:text-white dark:focus:bg-gray-700">90 {t('alimentacaoSenior.customize.minutes')} (1h30)</SelectItem>
                                    <SelectItem value="120" className="dark:text-white dark:focus:bg-gray-700">120 {t('alimentacaoSenior.customize.minutes')} (2h)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Observações Adicionais */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('alimentacaoSenior.customize.specialPreferences')}</Label>
                            <Input
                                placeholder={t('alimentacaoSenior.customize.specialPreferencesPlaceholder')}
                                value={opcoesReceita.observacoes}
                                onChange={(e) => setOpcoesReceita({ ...opcoesReceita, observacoes: e.target.value })}
                                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                            />
                            <p className="text-xs text-gray-400 dark:text-gray-500">
                                💡 {t('alimentacaoSenior.customize.tip')}
                            </p>
                        </div>

                        {/* Resumo das restrições do perfil */}
                        {perfilSelecionado && (
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                                <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1">{t('alimentacaoSenior.customize.profileRestrictions')}</p>
                                <div className="flex flex-wrap gap-1">
                                    {perfilSelecionado.conditions?.slice(0, 2).map((cond, idx) => (
                                        <span key={idx} className="text-[10px] bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded">
                                            {cond}
                                        </span>
                                    ))}
                                    {perfilSelecionado.allergies?.slice(0, 2).map((alergia, idx) => (
                                        <span key={idx} className="text-[10px] bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-2 py-0.5 rounded">
                                            🚫 {alergia}
                                        </span>
                                    ))}
                                    {(perfilSelecionado.conditions?.length > 2 || perfilSelecionado.allergies?.length > 2) && (
                                        <span className="text-[10px] text-gray-500 dark:text-gray-400">...</span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Botões de Ação */}
                    <div className="flex gap-2 justify-end">
                        <Button
                            variant="outline"
                            onClick={() => setShowPersonalizarReceita(false)}
                            disabled={gerandoReceita}
                            className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                        >
                            {t('common.cancel')}
                        </Button>
                        <Button
                            onClick={processarGeracaoReceita}
                            disabled={gerandoReceita}
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white min-w-[140px]"
                        >
                            {gerandoReceita ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    {t('alimentacaoSenior.generating')}
                                </>
                            ) : (
                                t('alimentacaoSenior.createRecipe')
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Modal de Receita Fácil */}
            <Dialog open={showFacilModal} onOpenChange={setShowFacilModal}>
                <DialogContent className="sm:max-w-md dark:bg-gray-800">
                    <DialogHeader>
                        <DialogTitle className="text-indigo-700 dark:text-indigo-400 flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            {t('alimentacaoSenior.easyRecipeTitle', { name: perfilSelecionado?.name })}
                        </DialogTitle>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {t('alimentacaoSenior.easyRecipeDesc')}
                        </p>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {/* Tipo de Refeição simplificado */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('alimentacaoSenior.easy.whichMeal')}</Label>
                            <div className="grid grid-cols-2 gap-2">
                                <Button
                                    type="button"
                                    variant={opcoesFacil.tipoRefeicao === 'auto' ? "default" : "outline"}
                                    className={opcoesFacil.tipoRefeicao === 'auto'
                                        ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                                        : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    }
                                    onClick={() => setOpcoesFacil({ ...opcoesFacil, tipoRefeicao: 'auto' })}
                                >
                                    {t('alimentacaoSenior.easy.auto')}
                                </Button>
                                <Button
                                    type="button"
                                    variant={opcoesFacil.tipoRefeicao === 'manual' ? "default" : "outline"}
                                    className={opcoesFacil.tipoRefeicao === 'manual'
                                        ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                                        : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    }
                                    onClick={() => setOpcoesFacil({ ...opcoesFacil, tipoRefeicao: 'manual' })}
                                >
                                    {t('alimentacaoSenior.easy.choose')}
                                </Button>
                            </div>

                            {opcoesFacil.tipoRefeicao === 'manual' && (
                                <Select
                                    value={opcoesFacil.tipoRefeicaoManual}
                                    onValueChange={(value) => setOpcoesFacil({ ...opcoesFacil, tipoRefeicaoManual: value })}
                                >
                                    <SelectTrigger className="mt-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                        <SelectValue placeholder={t('alimentacaoSenior.easy.selectMeal')} />
                                    </SelectTrigger>
                                    <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                                        <SelectItem value="pequeno-almoço" className="dark:text-white dark:focus:bg-gray-700">🌅 {t('alimentacaoSenior.mealTypes.breakfast')}</SelectItem>
                                        <SelectItem value="almoço" className="dark:text-white dark:focus:bg-gray-700">☀️ {t('alimentacaoSenior.mealTypes.lunch')}</SelectItem>
                                        <SelectItem value="jantar" className="dark:text-white dark:focus:bg-gray-700">🌙 {t('alimentacaoSenior.mealTypes.dinner')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        </div>

                        {/* Tempo máximo simplificado */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('alimentacaoSenior.easy.availableTime')}</Label>
                            <div className="grid grid-cols-3 gap-2">
                                {[15, 20, 30].map(tempo => (
                                    <Button
                                        key={tempo}
                                        type="button"
                                        variant={opcoesFacil.tempoMaximo === tempo ? "default" : "outline"}
                                        className={opcoesFacil.tempoMaximo === tempo
                                            ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                                            : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                        }
                                        onClick={() => setOpcoesFacil({ ...opcoesFacil, tempoMaximo: tempo })}
                                    >
                                        {tempo} min
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {/* Ingredientes que tem (opcional) */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('alimentacaoSenior.easy.ingredientsAtHome')} <span className="text-gray-400 dark:text-gray-500">({t('alimentacaoSenior.easy.optional')})</span></Label>
                            <Input
                                placeholder={t('alimentacaoSenior.easy.ingredientsPlaceholder')}
                                value={opcoesFacil.ingredientes}
                                onChange={(e) => setOpcoesFacil({ ...opcoesFacil, ingredientes: e.target.value })}
                                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                            />
                            <p className="text-xs text-gray-400 dark:text-gray-500">{t('alimentacaoSenior.easy.separateByComma')}</p>
                        </div>

                        {/* Resumo das restrições */}
                        {perfilSelecionado && (
                            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
                                <p className="text-xs font-semibold text-green-700 dark:text-green-300 mb-1">{t('alimentacaoSenior.easy.restrictionsConsidered')}</p>
                                <div className="flex flex-wrap gap-1">
                                    {perfilSelecionado.conditions?.slice(0, 2).map((cond, idx) => (
                                        <span key={idx} className="text-[10px] bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-0.5 rounded">
                                            {cond}
                                        </span>
                                    ))}
                                    {perfilSelecionado.allergies?.slice(0, 2).map((alergia, idx) => (
                                        <span key={idx} className="text-[10px] bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-2 py-0.5 rounded">
                                            🚫 {alergia}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-2 justify-end">
                        <Button
                            variant="outline"
                            onClick={() => setShowFacilModal(false)}
                            disabled={gerandoReceita}
                            className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                        >
                            {t('common.cancel')}
                        </Button>
                        <Button
                            onClick={async () => {
                                setGerandoReceita(true);
                                try {
                                    let mealType = 'almoço';
                                    if (opcoesFacil.tipoRefeicao === 'auto') {
                                        const hora = new Date().getHours();
                                        if (hora < 11) mealType = 'pequeno-almoço';
                                        else if (hora < 15) mealType = 'almoço';
                                        else mealType = 'jantar';
                                    } else {
                                        mealType = opcoesFacil.tipoRefeicaoManual || 'almoço';
                                    }

                                    let userRequest = t('alimentacaoSenior.easy.userRequest');
                                    if (opcoesFacil.ingredientes) {
                                        userRequest += `, usando principalmente: ${opcoesFacil.ingredientes}`;
                                    }

                                    const receita = await gerarReceitaAdaptada(perfilSelecionado._id, 1, {
                                        mealType: mealType,
                                        difficulty: 'facil',
                                        maxTime: opcoesFacil.tempoMaximo,
                                        userRequest: userRequest
                                    });

                                    const dadosSessao = {
                                        titulo: receita.title,
                                        descricao: receita.description,
                                        ingredientes: receita.ingredients,
                                        passos: receita.steps,
                                        tempo: receita.time,
                                        dificuldade: receita.difficulty,
                                        imagemUrl: receita.finalImage
                                    };

                                    const { sessionId } = await criarSessaoDeReceita(dadosSessao);

                                    toast({
                                        title: t('alimentacaoSenior.success.easyRecipeCreated'),
                                        description: t('alimentacaoSenior.success.easyRecipeCreatedDesc', { title: receita.title, time: opcoesFacil.tempoMaximo }),
                                        duration: 4000
                                    });

                                    setShowFacilModal(false);

                                    onStartChat({
                                        title: receita.title,
                                        recipe: receita,
                                        perfilId: perfilSelecionado._id,
                                        source: 'receita_criada',
                                        sessionId: sessionId,
                                        finalImage: receita.finalImage,
                                        podeIniciarPassoAPasso: true,
                                        mensagemInicio: t('alimentacaoSenior.chat.easyStartMessage'),
                                        totalPassos: receita.steps?.length || 0
                                    });

                                } catch (error) {
                                    toast({
                                        title: t('common.error'),
                                        description: error.message,
                                        variant: "destructive"
                                    });
                                } finally {
                                    setGerandoReceita(false);
                                }
                            }}
                            disabled={gerandoReceita}
                            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white min-w-[140px]"
                        >
                            {gerandoReceita ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    {t('alimentacaoSenior.generating')}
                                </>
                            ) : (
                                t('alimentacaoSenior.easy.createButton')
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Modal de Planejamento Semanal */}
            <Dialog open={showPlanejarSemana} onOpenChange={setShowPlanejarSemana}>
                <DialogContent className="sm:max-w-5xl w-[95vw] max-h-[90vh] p-0 overflow-hidden flex flex-col border-none shadow-2xl">
                    <DialogHeader className="p-6 bg-white border-b">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-50 rounded-lg">
                                <Calendar className="h-6 w-6 text-indigo-600" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl font-bold text-slate-800">
                                    {t('alimentacaoSenior.planning.title', { name: perfilSelecionado?.name })}
                                </DialogTitle>
                                <p className="text-sm text-slate-500">{t('alimentacaoSenior.planning.subtitle')}</p>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="flex-1 overflow-x-auto overflow-y-auto min-h-0 p-6 bg-slate-50/50">
                        {/* Legenda */}
                        <div className="flex flex-wrap gap-3 mb-8 justify-center">
                            {[
                                { label: t('alimentacaoSenior.mealTypes.breakfast'), color: 'bg-indigo-600' },
                                { label: t('alimentacaoSenior.mealTypes.lunch'), color: 'bg-green-600' },
                                { label: t('alimentacaoSenior.mealTypes.dinner'), color: 'bg-purple-600' },
                                { label: t('alimentacaoSenior.mealTypes.snack'), color: 'bg-orange-600' }
                            ].map(item => (
                                <div key={item.label} className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border shadow-sm text-xs font-medium text-slate-600">
                                    <div className={`w-2 h-2 rounded-full ${item.color}`} />
                                    {item.label}
                                </div>
                            ))}
                        </div>

                        {/* Grid Semanal */}
                        <div className="grid grid-cols-7 gap-4 pb-4 min-w-[1000px] md:min-w-0">
                            {[
                                { key: 'segunda', label: t('alimentacaoSenior.days.monday') },
                                { key: 'terca', label: t('alimentacaoSenior.days.tuesday') },
                                { key: 'quarta', label: t('alimentacaoSenior.days.wednesday') },
                                { key: 'quinta', label: t('alimentacaoSenior.days.thursday') },
                                { key: 'sexta', label: t('alimentacaoSenior.days.friday') },
                                { key: 'sabado', label: t('alimentacaoSenior.days.saturday') },
                                { key: 'domingo', label: t('alimentacaoSenior.days.sunday') }
                            ].map(dia => (
                                <div key={dia.key} className="flex flex-col gap-2">
                                    <div className="text-center py-2 mb-1">
                                        <span className="text-sm font-bold text-slate-700 uppercase tracking-wider">{dia.label}</span>
                                    </div>

                                    {/* Botões de Refeição */}
                                    <div className="flex flex-col gap-2 p-2 bg-white rounded-xl border border-slate-200 shadow-sm">
                                        {[
                                            { tipo: 'cafe', label: t('alimentacaoSenior.mealTypes.breakfastShort') },
                                            { tipo: 'almoco', label: t('alimentacaoSenior.mealTypes.lunchShort') },
                                            { tipo: 'jantar', label: t('alimentacaoSenior.mealTypes.dinnerShort') },
                                            { tipo: 'lanche', label: t('alimentacaoSenior.mealTypes.snackShort') }
                                        ].map((item) => {
                                            const isSelected = planejamento[dia.key]?.[item.tipo];
                                            const colorClass = isSelected && {
                                                cafe: 'bg-indigo-600',
                                                almoco: 'bg-green-600',
                                                jantar: 'bg-purple-600',
                                                lanche: 'bg-orange-600'
                                            }[item.tipo] || '';

                                            return (
                                                <Button
                                                    key={item.tipo}
                                                    variant="outline"
                                                    size="sm"
                                                    className={`w-full h-9 text-[11px] font-semibold transition-all duration-200 capitalize ${isSelected ? `${colorClass} text-white border-transparent` : 'bg-transparent text-slate-500 border-slate-100'}`}
                                                    onClick={() => setPlanejamento({
                                                        ...planejamento,
                                                        [dia.key]: { ...planejamento[dia.key], [item.tipo]: !isSelected }
                                                    })}
                                                >
                                                    {item.label}
                                                </Button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer com Resumo */}
                    <div className="p-6 bg-white border-t flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex flex-col">
                            <span className="text-sm font-semibold text-slate-700">
                                {t('alimentacaoSenior.planning.totalMeals', { count: Object.values(planejamento).reduce((acc, dia) => acc + Object.values(dia || {}).filter(v => v === true).length, 0) })}
                            </span>
                            <span className="text-xs text-slate-400">{t('alimentacaoSenior.planning.adaptedMessage', { name: perfilSelecionado?.name })}</span>
                        </div>

                        <div className="flex gap-3 w-full md:w-auto">
                            <Button
                                variant="ghost"
                                onClick={() => setShowPlanejarSemana(false)}
                                disabled={gerandoPlanejamento}
                                className="flex-1 md:flex-none text-slate-500"
                            >
                                {t('common.cancel')}
                            </Button>
                            <Button
                                onClick={gerarPlanejamentoSemanal}
                                disabled={gerandoPlanejamento}
                                className="flex-1 md:flex-none bg-indigo-600 hover:bg-indigo-700 text-white px-8 shadow-lg shadow-indigo-200"
                            >
                                {gerandoPlanejamento ? t('alimentacaoSenior.generating') : t('alimentacaoSenior.planning.createButton')}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Modal de Resumo do Planejamento */}
            <Dialog open={showResumoPlanejamento} onOpenChange={setShowResumoPlanejamento}>
                <DialogContent className="max-w-4xl w-[95vw] max-h-[85vh] p-0 overflow-hidden flex flex-col border-none shadow-2xl">
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-3 py-2 sm:px-4 sm:py-3 flex-shrink-0">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
                                <h2 className="text-sm sm:text-base font-bold">
                                    {t('alimentacaoSenior.planning.summaryTitle', { name: perfilSelecionado?.name })}
                                </h2>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs bg-white/30 px-2 py-0.5 rounded-full">
                                    {planejamentoResumo.length}
                                </span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setShowResumoPlanejamento(false)}
                                    className="h-6 w-6 text-white hover:bg-white/20"
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 sm:p-3 bg-gray-50">
                        <div className="space-y-2">
                            {['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'].map(dia => {
                                const receitasDoDia = planejamentoResumo.filter(r => r.dia === dia);
                                if (receitasDoDia.length === 0) return null;

                                const nomesDia = {
                                    segunda: t('alimentacaoSenior.days.monday'),
                                    terca: t('alimentacaoSenior.days.tuesday'),
                                    quarta: t('alimentacaoSenior.days.wednesday'),
                                    quinta: t('alimentacaoSenior.days.thursday'),
                                    sexta: t('alimentacaoSenior.days.friday'),
                                    sabado: t('alimentacaoSenior.days.saturday'),
                                    domingo: t('alimentacaoSenior.days.sunday')
                                };

                                const coresDia = {
                                    segunda: 'border-l-4 border-indigo-500',
                                    terca: 'border-l-4 border-purple-500',
                                    quarta: 'border-l-4 border-pink-500',
                                    quinta: 'border-l-4 border-orange-500',
                                    sexta: 'border-l-4 border-green-500',
                                    sabado: 'border-l-4 border-blue-500',
                                    domingo: 'border-l-4 border-red-500'
                                };

                                return (
                                    <div key={dia} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                        <div
                                            className={`${coresDia[dia]} bg-gray-50 px-3 py-2 flex items-center justify-between cursor-pointer hover:bg-gray-100`}
                                            onClick={() => {
                                                const content = document.getElementById(`receitas-${dia}`);
                                                if (content) content.classList.toggle('hidden');
                                            }}
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-sm">{nomesDia[dia]}</span>
                                                <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                                                    {receitasDoDia.length}
                                                </span>
                                            </div>
                                            <span className="text-gray-400 text-xs">▼</span>
                                        </div>

                                        <div id={`receitas-${dia}`} className={dia === 'segunda' ? 'p-2' : 'hidden p-2'}>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                                {receitasDoDia.map((receita, idx) => (
                                                    <div
                                                        key={idx}
                                                        onClick={async () => {
                                                            setShowResumoPlanejamento(false);
                                                            const dadosSessao = {
                                                                titulo: receita.titulo,
                                                                descricao: receita.descricao,
                                                                ingredientes: receita.ingredients,
                                                                passos: receita.steps,
                                                                tempo: receita.time,
                                                                dificuldade: receita.difficulty,
                                                                imagemUrl: receita.finalImage
                                                            };
                                                            try {
                                                                const { sessionId } = await criarSessaoDeReceita(dadosSessao);
                                                                onStartChat({
                                                                    title: receita.titulo,
                                                                    recipe: receita,
                                                                    perfilId: perfilSelecionado._id,
                                                                    source: 'planejamento_semanal',
                                                                    sessionId: sessionId,
                                                                    finalImage: receita.finalImage,
                                                                    podeIniciarPassoAPasso: true,
                                                                    mensagemInicio: `${nomesDia[dia]}: ${receita.titulo}`,
                                                                    totalPassos: receita.steps?.length || 0
                                                                });
                                                            } catch (error) {
                                                                toast({
                                                                    title: t('common.error'),
                                                                    description: t('alimentacaoSenior.errors.loadRecipeError'),
                                                                    variant: "destructive"
                                                                });
                                                            }
                                                        }}
                                                        className="group cursor-pointer"
                                                    >
                                                        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-all hover:border-indigo-300">
                                                            <div className="h-14 bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                                                                {receita.finalImage ? (
                                                                    <img src={receita.finalImage} alt={receita.titulo} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <span className="text-xl">
                                                                        {receita.tipo === 'cafe' ? '☕' :
                                                                            receita.tipo === 'almoco' ? '🍲' :
                                                                                receita.tipo === 'jantar' ? '🌙' : '🍪'}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="p-1.5">
                                                                <div className="flex items-center justify-between mb-0.5">
                                                                    <span className={`
                                                                        text-[8px] px-1 py-0.5 rounded-full font-medium
                                                                        ${receita.tipo === 'cafe' ? 'bg-amber-100 text-amber-700' : ''}
                                                                        ${receita.tipo === 'almoco' ? 'bg-green-100 text-green-700' : ''}
                                                                        ${receita.tipo === 'jantar' ? 'bg-indigo-100 text-indigo-700' : ''}
                                                                        ${receita.tipo === 'lanche' ? 'bg-orange-100 text-orange-700' : ''}
                                                                    `}>
                                                                        {receita.tipo === 'cafe' ? t('alimentacaoSenior.mealTypes.breakfastShort') :
                                                                            receita.tipo === 'almoco' ? t('alimentacaoSenior.mealTypes.lunchShort') :
                                                                                receita.tipo === 'jantar' ? t('alimentacaoSenior.mealTypes.dinnerShort') :
                                                                                    t('alimentacaoSenior.mealTypes.snackShort')}
                                                                    </span>
                                                                    <span className="text-[8px] text-gray-400 flex items-center">
                                                                        <Clock className="h-2.5 w-2.5 mr-0.5" />
                                                                        {receita.time?.replace('min', '')}
                                                                    </span>
                                                                </div>
                                                                <p className="text-[9px] font-medium text-gray-700 line-clamp-1">
                                                                    {receita.titulo}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="border-t bg-white p-2 flex justify-end gap-2 flex-shrink-0">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowResumoPlanejamento(false)}
                            className="h-7 text-xs px-3"
                        >
                            {t('common.close')}
                        </Button>
                        {planejamentoResumo.length > 0 && (
                            <Button
                                size="sm"
                                onClick={() => {
                                    setShowResumoPlanejamento(false);
                                    const primeira = planejamentoResumo[0];
                                    onStartChat({
                                        title: primeira.titulo,
                                        recipe: primeira,
                                        perfilId: perfilSelecionado._id,
                                        source: 'planejamento_semanal',
                                        finalImage: primeira.finalImage,
                                        podeIniciarPassoAPasso: true,
                                        mensagemInicio: t('alimentacaoSenior.planning.firstRecipeMessage', { title: primeira.titulo }),
                                        totalPassos: primeira.steps?.length || 0
                                    });
                                }}
                                className="h-7 text-xs bg-indigo-600 hover:bg-indigo-700 px-3"
                            >
                                <Sparkles className="h-3 w-3 mr-1" />
                                {t('alimentacaoSenior.planning.firstRecipeButton')}
                            </Button>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {perfilSelecionado && (
                <>
                    {/* Lembretes de Refeição */}
                    <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                                <Clock className="h-6 w-6 text-indigo-500 dark:text-indigo-400" />
                                {t('alimentacaoSenior.reminders.title')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {lembretes.map((lembrete, index) => (
                                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                                        <div>
                                            <p className="font-bold text-lg text-gray-900 dark:text-white">{lembrete.hora}</p>
                                            <p className="text-gray-600 dark:text-gray-400">
                                                {t(`alimentacaoSenior.mealTypes.${lembrete.tipo}`)}
                                            </p>
                                        </div>
                                        <Switch
                                            checked={lembrete.ativo}
                                            onClick={async () => {
                                                const novosLembretes = [...lembretes];
                                                novosLembretes[index].ativo = !novosLembretes[index].ativo;
                                                setLembretes(novosLembretes);

                                                toast({
                                                    title: novosLembretes[index].ativo ? t('alimentacaoSenior.reminders.enabled') : t('alimentacaoSenior.reminders.disabled'),
                                                    description: t('alimentacaoSenior.reminders.statusDesc', { tipo: t(`alimentacaoSenior.mealTypes.${lembrete.tipo}`), hora: lembrete.hora })
                                                });

                                                try {
                                                    const token = localStorage.getItem("bomPiteuToken") || localStorage.getItem("token");
                                                    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/profiles/${perfilSelecionado._id}/lembretes`, {
                                                        method: 'PUT',
                                                        headers: {
                                                            Authorization: `Bearer ${token}`,
                                                            'Content-Type': 'application/json'
                                                        },
                                                        body: JSON.stringify({ lembretes: novosLembretes })
                                                    });

                                                    if (!res.ok) throw new Error(t('alimentacaoSenior.errors.saveRemindersError'));
                                                } catch (error) {
                                                    console.error('Erro ao salvar lembretes:', error);
                                                    toast({
                                                        title: t('common.error'),
                                                        description: t('alimentacaoSenior.errors.saveRemindersError'),
                                                        variant: "destructive"
                                                    });
                                                    const revertidos = [...novosLembretes];
                                                    revertidos[index].ativo = !revertidos[index].ativo;
                                                    setLembretes(revertidos);
                                                }
                                            }}
                                            className="data-[state=checked]:bg-indigo-500"
                                        />
                                    </div>
                                ))}
                            </div>
                            <Button
                                variant="outline"
                                className="w-full mt-4 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                onClick={() => setShowConfigHorarios(true)}
                            >
                                <Calendar className="mr-2 h-4 w-4" />
                                {t('alimentacaoSenior.reminders.configure')}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Modal de Configurar Horários */}
                    <Dialog open={showConfigHorarios} onOpenChange={setShowConfigHorarios}>
                        <DialogContent className="sm:max-w-md dark:bg-gray-800">
                            <DialogHeader>
                                <DialogTitle className="text-indigo-700 dark:text-indigo-400">{t('alimentacaoSenior.reminders.configureTitle')}</DialogTitle>
                            </DialogHeader>

                            <div className="space-y-4 py-4">
                                {lembretes.map((lembrete, index) => (
                                    <div key={index} className="flex items-center gap-4">
                                        <Label className="w-24 font-medium text-gray-700 dark:text-gray-300">
                                            {t(`alimentacaoSenior.mealTypes.${lembrete.tipo}`)}
                                        </Label>
                                        <Input
                                            type="time"
                                            value={lembrete.hora}
                                            onChange={(e) => {
                                                const novos = [...lembretes];
                                                novos[index].hora = e.target.value;
                                                setLembretes(novos);
                                            }}
                                            className="flex-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            disabled={salvandoHorarios}
                                        />
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            {lembrete.ativo ? '🔔 ' + t('alimentacaoSenior.reminders.active') : '🔕 ' + t('alimentacaoSenior.reminders.inactive')}
                                        </div>
                                    </div>
                                ))}

                                <div className="text-sm text-gray-500 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                                    <p>💡 {t('alimentacaoSenior.reminders.tip1')}</p>
                                    <p>{t('alimentacaoSenior.reminders.tip2')}</p>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowConfigHorarios(false)}
                                    disabled={salvandoHorarios}
                                    className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                                >
                                    {t('common.cancel')}
                                </Button>
                                <Button
                                    onClick={async () => {
                                        setSalvandoHorarios(true);
                                        try {
                                            const token = localStorage.getItem("bomPiteuToken") || localStorage.getItem("token");
                                            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/profiles/${perfilSelecionado._id}/lembretes`, {
                                                method: 'PUT',
                                                headers: {
                                                    Authorization: `Bearer ${token}`,
                                                    'Content-Type': 'application/json'
                                                },
                                                body: JSON.stringify({ lembretes })
                                            });

                                            if (!res.ok) throw new Error(t('alimentacaoSenior.errors.saveRemindersError'));

                                            toast({
                                                title: t('alimentacaoSenior.success.remindersUpdated'),
                                                description: t('alimentacaoSenior.success.remindersUpdatedDesc'),
                                            });
                                            setShowConfigHorarios(false);
                                        } catch (error) {
                                            toast({
                                                title: t('common.error'),
                                                description: t('alimentacaoSenior.errors.saveRemindersError'),
                                                variant: "destructive"
                                            });
                                        } finally {
                                            setSalvandoHorarios(false);
                                        }
                                    }}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[140px]"
                                    disabled={salvandoHorarios}
                                >
                                    {salvandoHorarios ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            {t('alimentacaoSenior.saving')}
                                        </>
                                    ) : (
                                        t('common.save')
                                    )}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>

                    {/* Filtros de Saúde */}
                    <div>
                        <Label className="text-sm text-gray-600 dark:text-gray-400 mb-2 block">{t('alimentacaoSenior.filters.title')}</Label>
                        <div className="flex gap-2 flex-wrap">
                            {[
                                { id: 'todas', label: t('alimentacaoSenior.filters.all'), icon: Filter },
                                { id: 'facil-mastigar', label: t('alimentacaoSenior.filters.easyChew'), icon: Heart },
                                { id: 'baixo-sal', label: t('alimentacaoSenior.filters.lowSalt'), icon: FileText },
                                { id: 'baixo-acucar', label: t('alimentacaoSenior.filters.lowSugar'), icon: FileText },
                                { id: 'rico-fibra', label: t('alimentacaoSenior.filters.highFiber'), icon: FileText },
                                { id: 'liquidos', label: t('alimentacaoSenior.filters.liquids'), icon: FileText },
                                { id: 'facil-preparo', label: t('alimentacaoSenior.filters.easyPrep'), icon: Filter }
                            ].map(filtro => (
                                <Button
                                    key={filtro.id}
                                    size="sm"
                                    variant={filtroSaude === filtro.id ? "default" : "outline"}
                                    onClick={() => setFiltroSaude(filtro.id)}
                                    className={`flex items-center gap-1 ${filtroSaude === filtro.id
                                        ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                        : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                        }`}
                                >
                                    <filtro.icon className="h-4 w-4" />
                                    {filtro.label}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Receitas */}
                    <Card className="overflow-hidden border-0 shadow-lg bg-white dark:bg-gray-800">
                        <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 border-b border-gray-200 dark:border-gray-700">
                            <CardTitle className="flex items-center gap-2 text-xl text-gray-900 dark:text-white">
                                <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                {t('alimentacaoSenior.recipes.title', { count: receitasFiltradas.length, name: perfilSelecionado?.name })}
                            </CardTitle>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {t('alimentacaoSenior.recipes.subtitle', { name: perfilSelecionado?.name })}
                            </p>
                        </CardHeader>

                        <CardContent className="p-6">
                            {receitasFiltradas.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                                    {receitasFiltradas.map((receita, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            whileHover={{ y: -5 }}
                                            className="group bg-white dark:bg-gray-700 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-600 cursor-pointer"
                                            onClick={() => handleVerReceita(receita)}
                                        >
                                            <div className="relative h-40 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 overflow-hidden">
                                                {receita.imageUrl && receita.imageUrl !== '/default-recipe.jpg' ? (
                                                    <img
                                                        src={receita.imageUrl}
                                                        alt={receita.notes?.[0]?.content || t('alimentacaoSenior.recipe')}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <span className="text-7xl opacity-30 transform group-hover:scale-110 transition-transform duration-500">
                                                            {receita.mealType === 'breakfast' ? '☕' :
                                                                receita.mealType === 'lunch' ? '🍲' :
                                                                    receita.mealType === 'dinner' ? '🍽️' : '🍪'}
                                                        </span>
                                                    </div>
                                                )}

                                                <div className="absolute top-3 left-3">
                                                    <span className={`
                                                        px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg
                                                        ${receita.mealType === 'breakfast' ? 'bg-amber-500 text-white' : ''}
                                                        ${receita.mealType === 'lunch' ? 'bg-green-500 text-white' : ''}
                                                        ${receita.mealType === 'dinner' ? 'bg-indigo-500 text-white' : ''}
                                                        ${receita.mealType === 'snack' ? 'bg-orange-500 text-white' : ''}
                                                    `}>
                                                        {receita.mealType === 'breakfast' ? t('alimentacaoSenior.mealTypes.breakfast') :
                                                            receita.mealType === 'lunch' ? t('alimentacaoSenior.mealTypes.lunch') :
                                                                receita.mealType === 'dinner' ? t('alimentacaoSenior.mealTypes.dinner') :
                                                                    t('alimentacaoSenior.mealTypes.snack')}
                                                    </span>
                                                </div>

                                                {perfilSelecionado?.conditions?.length > 0 && (
                                                    <div className="absolute top-3 right-3">
                                                        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur rounded-full px-2 py-1 shadow-lg flex items-center gap-1">
                                                            <Heart className="h-3 w-3 text-rose-500" />
                                                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                                                {perfilSelecionado.conditions.length}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="p-4">
                                                <h3 className="font-bold text-gray-800 dark:text-white mb-2 line-clamp-2 min-h-[3rem]">
                                                    {receita.notes?.[0]?.content || t('alimentacaoSenior.recipe')}
                                                </h3>

                                                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        <span>{receita.time || '30 min'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <span>•</span>
                                                        <span>{receita.difficulty || t('alimentacaoSenior.difficulty.medium')}</span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                                                    <p className="text-xs text-gray-400 dark:text-gray-500">
                                                        {new Date(receita.createdAt).toLocaleDateString('pt-PT', {
                                                            day: '2-digit',
                                                            month: '2-digit',
                                                            year: 'numeric'
                                                        })}
                                                    </p>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-7 px-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleVerReceita(receita);
                                                        }}
                                                    >
                                                        {t('alimentacaoSenior.recipes.view')}
                                                    </Button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-16 bg-gray-50 dark:bg-gray-700/50 rounded-2xl border border-gray-200 dark:border-gray-700">
                                    <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <FileText className="h-10 w-10 text-indigo-400 dark:text-indigo-300" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        {t('alimentacaoSenior.recipes.emptyTitle')}
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                                        {t('alimentacaoSenior.recipes.emptyDesc', { name: perfilSelecionado?.name })}
                                    </p>
                                    <Button onClick={handleGerarReceita} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                                        <Sparkles className="mr-2 h-4 w-4" />
                                        {t('alimentacaoSenior.recipes.generateFirst')}
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Ações Rápidas */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Button
                            onClick={handleGerarReceita}
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                        >
                            <Sparkles className="mr-2 h-5 w-5" />
                            {t('alimentacaoSenior.actions.generateAdapted')}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={handleFacilPreparar}
                            disabled={gerandoReceita}
                            className="relative border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            {gerandoReceita ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    {t('alimentacaoSenior.generating')}
                                </>
                            ) : (
                                <>
                                    <Filter className="mr-2 h-5 w-5" />
                                    {t('alimentacaoSenior.actions.easyPrep')}
                                </>
                            )}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={handlePlanejarSemana}
                            disabled={gerandoPlanejamento}
                            className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            {gerandoPlanejamento ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    {t('alimentacaoSenior.generating')}
                                </>
                            ) : (
                                <>
                                    <Calendar className="mr-2 h-5 w-5" />
                                    {t('alimentacaoSenior.actions.planWeek')}
                                </>
                            )}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => onNavigate('observacoesPessoais')}
                            className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            <Camera className="mr-2 h-5 w-5" />
                            {t('alimentacaoSenior.actions.registerMeal')}
                        </Button>
                    </div>

                    {/* Informações de Saúde */}
                    {perfilSelecionado.conditions && perfilSelecionado.conditions.length > 0 && (
                        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                                    <AlertTriangle className="h-6 w-6 text-orange-500" />
                                    {t('alimentacaoSenior.health.title')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {perfilSelecionado.conditions.map((condicao, idx) => (
                                        <div key={idx} className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                                            <AlertTriangle className="h-5 w-5 text-orange-500 dark:text-orange-400 flex-shrink-0" />
                                            <div>
                                                <p className="font-medium text-orange-800 dark:text-orange-300">{condicao}</p>
                                                <p className="text-sm text-orange-600 dark:text-orange-400">
                                                    {condicao.includes(t('alimentacaoSenior.healthConditions.diabetes')) && t('alimentacaoSenior.health.recommendations.diabetes')}
                                                    {condicao.includes(t('alimentacaoSenior.healthConditions.highBloodPressure')) && t('alimentacaoSenior.health.recommendations.highBloodPressure')}
                                                    {condicao.includes(t('alimentacaoSenior.healthConditions.highCholesterol')) && t('alimentacaoSenior.health.recommendations.highCholesterol')}
                                                    {condicao.includes(t('alimentacaoSenior.healthConditions.chewingDifficulty')) && t('alimentacaoSenior.health.recommendations.chewingDifficulty')}
                                                    {condicao.includes(t('alimentacaoSenior.healthConditions.swallowingDifficulty')) && t('alimentacaoSenior.health.recommendations.swallowingDifficulty')}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </>
            )}

            {perfis.length === 0 && (
                <div className="text-center py-16">
                    <User className="h-24 w-24 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                        {t('alimentacaoSenior.empty.title')}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-500 mb-6 max-w-md mx-auto">
                        {t('alimentacaoSenior.empty.description')}
                    </p>
                    <Button onClick={() => setShowNovoPerfil(true)} size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                        <Plus className="mr-2 h-5 w-5" />
                        {t('alimentacaoSenior.empty.createButton')}
                    </Button>
                </div>
            )}

            {/* Modal de Detalhes da Receita */}
            {showReceitaModal && (
                <ReceitaDetalheModal
                    receita={receitaSelecionada}
                    onClose={() => setShowReceitaModal(false)}
                    onCozinhar={handleCozinharReceita}
                />
            )}

            {/* MODAL DE CRIAÇÃO DE PERFIL SÉNIOR */}
            <Dialog open={showNovoPerfil} onOpenChange={setShowNovoPerfil}>
                <DialogContent className="sm:max-w-lg w-[95vw] max-h-[85vh] flex flex-col p-0 overflow-hidden border-none shadow-2xl dark:bg-gray-800">
                    <DialogHeader className="p-4 pb-0">
                        <DialogTitle className="text-lg font-bold text-indigo-700 dark:text-indigo-400">{t('alimentacaoSenior.newProfile')}</DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleCriarPerfil} className="flex flex-col flex-1 overflow-hidden">
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {/* Header com foto */}
                            <div className="flex items-center gap-4 bg-indigo-50/50 dark:bg-indigo-900/20 p-3 rounded-xl border border-indigo-100 dark:border-indigo-800">
                                <div className="relative shrink-0">
                                    <div className="w-14 h-14 rounded-full overflow-hidden bg-white dark:bg-gray-700 border-2 border-indigo-500 dark:border-indigo-400 shadow-sm">
                                        {novoPerfil.profileImagePreview ? (
                                            <img src={novoPerfil.profileImagePreview} alt={t('alimentacaoSenior.previewAlt')} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-2xl">👴</div>
                                        )}
                                    </div>
                                    <label htmlFor="profile-image" className="absolute -bottom-1 -right-1 bg-indigo-600 dark:bg-indigo-500 text-white p-1 rounded-full cursor-pointer shadow-lg">
                                        <Upload className="h-3 w-3" />
                                        <input
                                            id="profile-image"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) handleProfileImageUpload(file);
                                            }}
                                        />
                                    </label>
                                </div>

                                <div className="flex-1 grid grid-cols-2 gap-2">
                                    <div>
                                        <Label className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400">{t('alimentacaoSenior.form.name')} *</Label>
                                        <Input
                                            value={novoPerfil.name}
                                            onChange={(e) => setNovoPerfil({ ...novoPerfil, name: e.target.value })}
                                            placeholder={t('alimentacaoSenior.form.namePlaceholder')}
                                            required
                                            className="h-7 text-xs bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400">{t('alimentacaoSenior.form.birthDate')} *</Label>
                                        <Input
                                            type="date"
                                            value={novoPerfil.birthDate ? novoPerfil.birthDate.split('T')[0] : ''}
                                            onChange={(e) => setNovoPerfil({ ...novoPerfil, birthDate: e.target.value })}
                                            required
                                            className="h-7 text-xs bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Condições de Saúde */}
                            <div className="space-y-1">
                                <Label className="text-xs font-semibold text-gray-700 dark:text-gray-300">{t('alimentacaoSenior.form.healthConditions')}</Label>
                                <select
                                    className="w-full h-8 px-2 rounded-md border border-input bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (val && !novoPerfil.conditions.includes(val)) toggleCondition(val);
                                        e.target.value = "";
                                    }}
                                    value=""
                                >
                                    <option value="">{t('alimentacaoSenior.form.addCondition')}...</option>
                                    {condicoesSaude.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {novoPerfil.conditions.map(c => (
                                        <span key={c} className="inline-flex items-center gap-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded text-[10px] font-medium border border-indigo-200 dark:border-indigo-800">
                                            {c}
                                            <X className="h-2.5 w-2.5 cursor-pointer" onClick={() => toggleCondition(c)} />
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Dificuldades */}
                            <div className="space-y-1">
                                <Label className="text-xs font-semibold text-gray-700 dark:text-gray-300">{t('alimentacaoSenior.form.difficulties')}</Label>
                                <select
                                    className="w-full h-8 px-2 rounded-md border border-input bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-purple-500"
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (val && !novoPerfil.difficulties.includes(val)) toggleDifficulty(val);
                                        e.target.value = "";
                                    }}
                                    value=""
                                >
                                    <option value="">{t('alimentacaoSenior.form.addDifficulty')}...</option>
                                    {dificuldades.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {novoPerfil.difficulties.map(d => (
                                        <span key={d} className="inline-flex items-center gap-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-1.5 py-0.5 rounded text-[10px] font-medium border border-purple-200 dark:border-purple-800">
                                            {d}
                                            <X className="h-2.5 w-2.5 cursor-pointer" onClick={() => toggleDifficulty(d)} />
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Alergias + Intolerâncias */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label className="text-xs font-semibold text-gray-700 dark:text-gray-300">{t('alimentacaoSenior.form.allergies')}</Label>
                                    <select
                                        className="w-full h-8 px-2 rounded-md border border-input bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-red-500"
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (val && !novoPerfil.allergies.includes(val)) toggleAllergy(val);
                                            e.target.value = "";
                                        }}
                                        value=""
                                    >
                                        <option value="">{t('alimentacaoSenior.form.addAllergy')}...</option>
                                        <option value={t('allergies.peanut')}>{t('allergies.peanut')}</option>
                                        <option value={t('allergies.treeNuts')}>{t('allergies.treeNuts')}</option>
                                        <option value={t('allergies.milk')}>{t('allergies.milk')}</option>
                                        <option value={t('allergies.egg')}>{t('allergies.egg')}</option>
                                        <option value={t('allergies.soy')}>{t('allergies.soy')}</option>
                                        <option value={t('allergies.wheat')}>{t('allergies.wheat')}</option>
                                        <option value={t('allergies.fish')}>{t('allergies.fish')}</option>
                                        <option value={t('allergies.shellfish')}>{t('allergies.shellfish')}</option>
                                    </select>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {novoPerfil.allergies.map(a => (
                                            <span key={a} className="inline-flex items-center gap-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-1.5 py-0.5 rounded text-[10px] font-medium border border-red-200 dark:border-red-800">
                                                {a}
                                                <X className="h-2.5 w-2.5 cursor-pointer" onClick={() => toggleAllergy(a)} />
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <Label className="text-xs font-semibold text-gray-700 dark:text-gray-300">{t('alimentacaoSenior.form.intolerances')}</Label>
                                    <select
                                        className="w-full h-8 px-2 rounded-md border border-input bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-amber-500"
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (val && !novoPerfil.intolerances.includes(val)) toggleIntolerance(val);
                                            e.target.value = "";
                                        }}
                                        value=""
                                    >
                                        <option value="">{t('alimentacaoSenior.form.addIntolerance')}...</option>
                                        <option value={t('intolerances.lactose')}>{t('intolerances.lactose')}</option>
                                        <option value={t('intolerances.gluten')}>{t('intolerances.gluten')}</option>
                                        <option value={t('intolerances.histamine')}>{t('intolerances.histamine')}</option>
                                        <option value={t('intolerances.fructose')}>{t('intolerances.fructose')}</option>
                                        <option value={t('intolerances.caffeine')}>{t('intolerances.caffeine')}</option>
                                    </select>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {novoPerfil.intolerances.map(i => (
                                            <span key={i} className="inline-flex items-center gap-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-1.5 py-0.5 rounded text-[10px] font-medium border border-amber-200 dark:border-amber-800">
                                                {i}
                                                <X className="h-2.5 w-2.5 cursor-pointer" onClick={() => toggleIntolerance(i)} />
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Contato de Emergência */}
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800 space-y-2">
                                <Label className="text-xs font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-1">
                                    <Phone className="h-3 w-3" /> {t('alimentacaoSenior.form.emergencyContact')}
                                </Label>
                                <div className="grid grid-cols-2 gap-2">
                                    <Input
                                        value={novoPerfil.emergencyContact}
                                        onChange={(e) => setNovoPerfil({ ...novoPerfil, emergencyContact: e.target.value })}
                                        placeholder={t('alimentacaoSenior.form.emergencyNamePlaceholder')}
                                        required
                                        className="h-8 text-xs bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                                    />
                                    <Input
                                        value={novoPerfil.emergencyPhone}
                                        onChange={(e) => setNovoPerfil({ ...novoPerfil, emergencyPhone: e.target.value })}
                                        placeholder={t('alimentacaoSenior.form.emergencyPhonePlaceholder')}
                                        required
                                        className="h-8 text-xs bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Rodapé */}
                        <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex gap-2 bg-white dark:bg-gray-800">
                            <Button
                                variant="ghost"
                                onClick={() => {
                                    setShowNovoPerfil(false);
                                    resetNovoPerfil();
                                }}
                                type="button"
                                className="flex-1 h-8 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                disabled={salvandoPerfil}
                            >
                                {t('common.cancel')}
                            </Button>
                            <Button
                                type="submit"
                                className="flex-1 h-8 text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
                                disabled={salvandoPerfil}
                            >
                                {salvandoPerfil ? t('alimentacaoSenior.saving') : t('common.save')}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AlimentacaoSenior;