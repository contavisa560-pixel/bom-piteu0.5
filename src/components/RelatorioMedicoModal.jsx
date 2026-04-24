// src/components/RelatorioMedicoModal.jsx
import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import {
    X, Download, Heart, Calendar, Activity,
    TrendingUp, Clock, Star, ChefHat, Carrot,
    Apple, Beef, AlertCircle, FileText, User,
    Scale, Droplet, Flame
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';
import { gerarPDFRelatorio } from '@/services/relatorioPDFService';
import { formatarData, formatarDataExtenso } from '@/services/relatorioService';
import { useTranslation } from 'react-i18next';

const RelatorioMedicoModal = ({ isOpen, onClose, relatorio, user }) => {
    const { t } = useTranslation();
    const reportRef = useRef(null);

    if (!isOpen || !relatorio) return null;

    // Extrair dados com fallback
    const stats = relatorio.stats || {};
    const limits = relatorio.limits || {};
    const recentMeals = relatorio.recentMeals || [];
    const generatedAt = relatorio.generatedAt || new Date();

    // Função para obter ícone do tipo de refeição
    const getMealIcon = (type) => {
        switch (type) {
            case 'breakfast': return t('relatorioMedicoModal.mealIcons.breakfast');
            case 'lunch': return t('relatorioMedicoModal.mealIcons.lunch');
            case 'dinner': return t('relatorioMedicoModal.mealIcons.dinner');
            case 'snack': return t('relatorioMedicoModal.mealIcons.snack');
            default: return '';
        }
    };

    // Função para exportar PDF
    const handleExportPDF = () => {
        try {
            toast({
                title: t('relatorioMedicoModal.toast.generatingPDF'),
                description: t('relatorioMedicoModal.toast.generatingPDFDesc'),
            });

            const doc = gerarPDFRelatorio(relatorio, user);

            const nomePaciente = (user?.name || t('relatorioMedicoModal.patient')).replace(/\s+/g, '_').toLowerCase();
            const dataAtual = formatarData(new Date()).replace(/\//g, '-');
            doc.save(`relatorio_${nomePaciente}_${dataAtual}.pdf`);

            toast({
                title: t('relatorioMedicoModal.toast.pdfSuccess'),
                description: t('relatorioMedicoModal.toast.pdfSuccessDesc'),
            });
        } catch (error) {
            console.error('Erro PDF:', error);
            toast({
                title: t('common.error'),
                description: t('relatorioMedicoModal.toast.pdfError'),
                variant: "destructive"
            });
        }
    };

    // Calcular percentagens para recomendações
    const getVegetableStatus = () => {
        const total = stats.totalMeals || 0;
        const veg = stats.vegetables || 0;
        if (total === 0) return { status: t('relatorioMedicoModal.vegetableStatus.noData'), color: 'gray' };
        const percent = (veg / total) * 100;
        if (percent >= 40) return { status: t('relatorioMedicoModal.vegetableStatus.excellent'), color: 'green' };
        if (percent >= 25) return { status: t('relatorioMedicoModal.vegetableStatus.good'), color: 'emerald' };
        if (percent >= 15) return { status: t('relatorioMedicoModal.vegetableStatus.fair'), color: 'yellow' };
        return { status: t('relatorioMedicoModal.vegetableStatus.poor'), color: 'red' };
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl"
            >
                {/* Cabeçalho fixo com ações */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10">
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-r from-red-500 to-pink-500 p-2 rounded-lg">
                            <FileText className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">{t('relatorioMedicoModal.title')}</h2>
                            <p className="text-xs text-gray-500">
                                {t('relatorioMedicoModal.generatedOn', { date: formatarDataExtenso(generatedAt) })}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleExportPDF}
                            className="gap-2"
                        >
                            <Download className="h-4 w-4" />
                            {t('relatorioMedicoModal.exportPDF')}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={onClose}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* CONTEÚDO DO RELATÓRIO - REF para PDF */}
                <div ref={reportRef} className="p-6 space-y-6 bg-white">
                    {/* Cabeçalho do paciente */}
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-1">
                                {user?.name || t('relatorioMedicoModal.patient')}
                            </h1>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                    <User className="h-4 w-4" />
                                    {t('relatorioMedicoModal.id')}: {user?.id || user?._id || '—'}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    {t('relatorioMedicoModal.period')}: {t('relatorioMedicoModal.last30Days')}
                                </span>
                            </div>
                        </div>
                        <div className="text-right">
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                <Heart className="h-3 w-3 mr-1" />
                                {t('relatorioMedicoModal.healthCorner')}
                            </Badge>
                        </div>
                    </div>

                    <Separator />

                    {/* SUMÁRIO EXECUTIVO - 4 cards principais */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <Activity className="h-5 w-5 text-blue-500" />
                            {t('relatorioMedicoModal.periodSummary')}
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Card className="border-l-4 border-l-blue-500">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs text-gray-500">{t('relatorioMedicoModal.totalMeals')}</p>
                                            <p className="text-3xl font-bold text-gray-900">{stats.totalMeals || 0}</p>
                                        </div>
                                        <ChefHat className="h-8 w-8 text-blue-500 opacity-50" />
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="border-l-4 border-l-green-500">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs text-gray-500">{t('relatorioMedicoModal.vegetables')}</p>
                                            <p className="text-3xl font-bold text-green-600">{stats.vegetables || 0}</p>
                                        </div>
                                        <Carrot className="h-8 w-8 text-green-500 opacity-50" />
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="border-l-4 border-l-yellow-500">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs text-gray-500">{t('relatorioMedicoModal.favorites')}</p>
                                            <p className="text-3xl font-bold text-yellow-600">{stats.favorites || 0}</p>
                                        </div>
                                        <Star className="h-8 w-8 text-yellow-500 opacity-50" />
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="border-l-4 border-l-purple-500">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs text-gray-500">{t('relatorioMedicoModal.lastUpdate')}</p>
                                            <p className="text-sm font-semibold text-gray-900">
                                                {formatarData(stats.lastUpdate)}
                                            </p>
                                        </div>
                                        <Clock className="h-8 w-8 text-purple-500 opacity-50" />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* LIMITES NUTRICIONAIS */}
                    {limits && (
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <Scale className="h-5 w-5 text-orange-500" />
                                {t('relatorioMedicoModal.dailyLimits')}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Card>
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-orange-100 p-2 rounded-lg">
                                                <Droplet className="h-5 w-5 text-orange-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">{t('relatorioMedicoModal.sugar')}</p>
                                                <p className="text-xl font-bold">{limits.sugar || 25}g / {t('relatorioMedicoModal.day')}</p>
                                                {limits.sugarAlert && (
                                                    <Badge variant="outline" className="mt-1 bg-red-50 text-red-700 border-red-200 text-xs">
                                                        {t('relatorioMedicoModal.alertActive')}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-blue-100 p-2 rounded-lg">
                                                <Flame className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">{t('relatorioMedicoModal.calories')}</p>
                                                <p className="text-xl font-bold">{limits.calories || 2000} kcal / {t('relatorioMedicoModal.day')}</p>
                                                {limits.caloriesAlert && (
                                                    <Badge variant="outline" className="mt-1 bg-red-50 text-red-700 border-red-200 text-xs">
                                                        {t('relatorioMedicoModal.alertActive')}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-gray-100 p-2 rounded-lg">
                                                <Beef className="h-5 w-5 text-gray-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">{t('relatorioMedicoModal.fat')}</p>
                                                <p className="text-xl font-bold">{limits.fat || 20}g / {t('relatorioMedicoModal.day')}</p>
                                                {limits.fatAlert && (
                                                    <Badge variant="outline" className="mt-1 bg-red-50 text-red-700 border-red-200 text-xs">
                                                        {t('relatorioMedicoModal.alertActive')}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    )}

                    {/* HISTÓRICO DE REFEIÇÕES (TABELA PROFISSIONAL) */}
                    {recentMeals.length > 0 && (
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-green-600" />
                                {t('relatorioMedicoModal.detailedFoodLog')}
                            </h3>
                            <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-200">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-100 border-b border-gray-200">
                                            <tr>
                                                <th className="px-4 py-3 text-left font-semibold text-gray-700">{t('relatorioMedicoModal.table.date')}</th>
                                                <th className="px-4 py-3 text-left font-semibold text-gray-700">{t('relatorioMedicoModal.table.meal')}</th>
                                                <th className="px-4 py-3 text-left font-semibold text-gray-700">{t('relatorioMedicoModal.table.type')}</th>
                                                <th className="px-4 py-3 text-center font-semibold text-gray-700">{t('relatorioMedicoModal.table.rating')}</th>
                                                <th className="px-4 py-3 text-left font-semibold text-gray-700">{t('relatorioMedicoModal.table.mood')}</th>
                                                <th className="px-4 py-3 text-left font-semibold text-gray-700">{t('relatorioMedicoModal.table.ingredients')}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {recentMeals.map((meal, idx) => (
                                                <tr key={idx} className="hover:bg-white transition-colors">
                                                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                                                        {formatarData(meal.date)}
                                                    </td>
                                                    <td className="px-4 py-3 font-medium text-gray-900">
                                                        {meal.recipeTitle || '—'}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <Badge variant="outline" className="bg-gray-50">
                                                            {getMealIcon(meal.mealType)} {meal.mealType || '—'}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        {meal.rating ? (
                                                            <div className="flex justify-center">
                                                                {[...Array(5)].map((_, i) => (
                                                                    <Star
                                                                        key={i}
                                                                        className={`h-4 w-4 ${i < meal.rating
                                                                                ? 'text-yellow-500 fill-yellow-500'
                                                                                : 'text-gray-300'
                                                                            }`}
                                                                    />
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            '—'
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-2xl text-center">
                                                        {meal.mood || '—'}
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-600 max-w-[200px] truncate">
                                                        {meal.ingredients?.slice(0, 2).join(', ') || '—'}
                                                        {meal.ingredients?.length > 2 && '...'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* RECOMENDAÇÕES AUTOMÁTICAS (INTELIGENTE) */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-amber-500" />
                            {t('relatorioMedicoModal.observationsAndRecommendations')}
                        </h3>
                        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
                            <CardContent className="p-6">
                                <ul className="space-y-3">
                                    {/* Recomendação baseada em vegetais */}
                                    <li className="flex items-start gap-3">
                                        <div className="bg-amber-100 p-1 rounded-full mt-0.5">
                                            <div className="w-2 h-2 bg-amber-600 rounded-full"></div>
                                        </div>
                                        <span className="text-gray-700">
                                            <span className="font-semibold">{t('relatorioMedicoModal.recommendations.vegetableConsumption')}:</span>{' '}
                                            {stats.vegetables || 0} {t('relatorioMedicoModal.recommendations.recordsInPeriod')}.{' '}
                                            {getVegetableStatus().status === t('relatorioMedicoModal.vegetableStatus.excellent') && t('relatorioMedicoModal.recommendations.vegetableExcellent')}
                                            {getVegetableStatus().status === t('relatorioMedicoModal.vegetableStatus.good') && t('relatorioMedicoModal.recommendations.vegetableGood')}
                                            {getVegetableStatus().status === t('relatorioMedicoModal.vegetableStatus.fair') && t('relatorioMedicoModal.recommendations.vegetableFair')}
                                            {getVegetableStatus().status === t('relatorioMedicoModal.vegetableStatus.poor') && t('relatorioMedicoModal.recommendations.vegetablePoor')}
                                        </span>
                                    </li>

                                    {/* Recomendação baseada em alertas */}
                                    {limits.caloriesAlert && (
                                        <li className="flex items-start gap-3">
                                            <div className="bg-red-100 p-1 rounded-full mt-0.5">
                                                <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                                            </div>
                                            <span className="text-gray-700">
                                                <span className="font-semibold">{t('relatorioMedicoModal.recommendations.calorieAlertActive')}:</span> {t('relatorioMedicoModal.recommendations.calorieAlertDesc')}
                                            </span>
                                        </li>
                                    )}
                                    {limits.sugarAlert && (
                                        <li className="flex items-start gap-3">
                                            <div className="bg-red-100 p-1 rounded-full mt-0.5">
                                                <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                                            </div>
                                            <span className="text-gray-700">
                                                <span className="font-semibold">{t('relatorioMedicoModal.recommendations.sugarAlertActive')}:</span> {t('relatorioMedicoModal.recommendations.sugarAlertDesc')}
                                            </span>
                                        </li>
                                    )}
                                    {limits.fatAlert && (
                                        <li className="flex items-start gap-3">
                                            <div className="bg-red-100 p-1 rounded-full mt-0.5">
                                                <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                                            </div>
                                            <span className="text-gray-700">
                                                <span className="font-semibold">{t('relatorioMedicoModal.recommendations.fatAlertActive')}:</span> {t('relatorioMedicoModal.recommendations.fatAlertDesc')}
                                            </span>
                                        </li>
                                    )}

                                    {/* Recomendação geral */}
                                    <li className="flex items-start gap-3">
                                        <div className="bg-green-100 p-1 rounded-full mt-0.5">
                                            <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                                        </div>
                                        <span className="text-gray-700">
                                            <span className="font-semibold">{t('relatorioMedicoModal.recommendations.hydration')}:</span> {t('relatorioMedicoModal.recommendations.hydrationDesc')}
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="bg-blue-100 p-1 rounded-full mt-0.5">
                                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                        </div>
                                        <span className="text-gray-700">
                                            <span className="font-semibold">{t('relatorioMedicoModal.recommendations.nextAppointment')}:</span> {t('relatorioMedicoModal.recommendations.nextAppointmentDesc')}
                                        </span>
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>
                    </div>

                    {/* RODAPÉ - ASSINATURA MÉDICA */}
                    <div className="pt-4 border-t border-gray-200">
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-xs text-gray-500">{t('relatorioMedicoModal.footer.autoGeneratedBy')}</p>
                                <p className="text-sm font-semibold text-gray-800">{t('relatorioMedicoModal.footer.appName')}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-gray-500">{t('relatorioMedicoModal.footer.validFor')}</p>
                                <p className="text-sm font-medium text-gray-800">{t('relatorioMedicoModal.footer.medicalUse')}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default RelatorioMedicoModal;