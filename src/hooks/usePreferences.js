import { useState, useEffect, useCallback, useRef } from 'react';
import {
    getPreferences,
    savePreferences as updatePreferences
} from '@/services/preferencesApi';


/**
 * 🍽️ Hook para gerenciar preferências alimentares
 * 
 * @returns {Object} Estado e funções para gerenciar preferências
 */
export function usePreferences() {
    const [preferences, setPreferences] = useState({
        diets: [],
        allergies: [],
        intolerances: [],
        goals: [],
        macros: { carb: 50, protein: 25, fat: 25 },
        calorieTarget: null,
        bloodType: null
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hasChanges, setHasChanges] = useState(false);

    /**
     * 📥 Carrega preferências do backend
     */
    const loadPreferences = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const data = await getPreferences();

            // Garante que todos os campos existem
            const safeData = {
                diets: data.diets || [],
                allergies: data.allergies || [],
                intolerances: data.intolerances || [],
                goals: data.goals || [],
                macros: data.macros || { carb: 50, protein: 25, fat: 25 },
                calorieTarget: data.calorieTarget || null,
                bloodType: data.bloodType || null
            };

            setPreferences(safeData);
            setHasChanges(false);
            console.log('✅ Preferências carregadas:', safeData);
        } catch (err) {
            setError(err.message);
            console.error('❌ Erro ao carregar preferências:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * 💾 Salva preferências no backend
     */
    const save = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const saved = await updatePreferences(preferences);

            // Atualiza estado com dados salvos
            setPreferences(saved || preferences);
            setHasChanges(false);
            console.log('✅ Preferências salvas:', saved || preferences);

            return { success: true, data: saved };
        } catch (err) {
            setError(err.message);
            console.error('❌ Erro ao salvar preferências:', err);
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    }, [preferences]);

       const saveTimeoutRef = useRef(null);
    /**
     * 🔧 Atualiza campo específico
     */
    const updateField = useCallback((field, value) => {
        setPreferences(prev => ({
            ...prev,
            [field]: value
        }));
        setHasChanges(true);
    }, []);

    //  Auto-save com debounce de 1 segundo
    useEffect(() => {
        if (!hasChanges) return;

        // Limpa timeout anterior
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        // Cria novo timeout
        saveTimeoutRef.current = setTimeout(async () => {
            // Valida calorieTarget antes de salvar
            if (preferences.calorieTarget !== null &&
                (preferences.calorieTarget < 800 || preferences.calorieTarget > 5000)) {
                console.warn(' Calorias fora do intervalo válido (800-5000), não salvando');
                return;
            }

            try {
                await updatePreferences(preferences);
                setHasChanges(false);
                console.log('✅ Preferências salvas automaticamente (debounce)');
            } catch (err) {
                console.error('❌ Erro no auto-save:', err);
            }
        }, 1000); // Espera 1 segundo após parar de digitar

        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, [preferences, hasChanges]);

    /**
     * ➕ Adiciona dieta
     */
    const addDiet = useCallback((diet) => {
        setPreferences(prev => ({
            ...prev,
            diets: [...new Set([...prev.diets, diet])]
        }));
        setHasChanges(true);
    }, []);

    /**
     * ➖ Remove dieta
     */
    const removeDiet = useCallback((diet) => {
        setPreferences(prev => ({
            ...prev,
            diets: prev.diets.filter(d => d !== diet)
        }));
        setHasChanges(true);
    }, []);

    /**
     * ➕ Adiciona alergia
     */
    const addAllergy = useCallback((name, severity = 'moderada', customName = null) => {
        setPreferences(prev => ({
            ...prev,
            allergies: [
                ...prev.allergies,
                { name, severity, ...(customName && { customName }) }
            ]
        }));
        setHasChanges(true);
    }, []);

    /**
     * ➖ Remove alergia
     */
    const removeAllergy = useCallback((name) => {
        setPreferences(prev => ({
            ...prev,
            allergies: prev.allergies.filter(a =>
                a.name !== name && a.customName !== name
            )
        }));
        setHasChanges(true);
    }, []);

    /**
     * ➕ Adiciona intolerância
     */
    const addIntolerance = useCallback(async (name, customName = null) => {
        const newPrefs = {
            ...preferences,
            intolerances: [
                ...preferences.intolerances,
                { name, ...(customName && { customName }) }
            ]
        };

        setPreferences(newPrefs);
        setHasChanges(true);

        // AUTO-SAVE
        try {
            await updatePreferences(newPrefs);
            console.log('✅ Intolerância salva automaticamente');
        } catch (err) {
            console.error('❌ Erro ao salvar intolerância:', err);
        }
    }, [preferences]);

    /**
     * ➖ Remove intolerância
     */
    const removeIntolerance = useCallback(async (name) => {
        const newPrefs = {
            ...preferences,
            intolerances: preferences.intolerances.filter(i =>
                i.name !== name && i.customName !== name
            )
        };

        setPreferences(newPrefs);
        setHasChanges(true);

        // AUTO-SAVE
        try {
            await updatePreferences(newPrefs);
            console.log('✅ Intolerância removida automaticamente');
        } catch (err) {
            console.error('❌ Erro ao remover intolerância:', err);
        }
    }, [preferences]);

    /**
     * ➕ Adiciona objetivo
     */
    const addGoal = useCallback(async (name, intensity = 'moderado', customName = null) => {
        const newPrefs = {
            ...preferences,
            goals: [
                ...preferences.goals,
                { name, intensity, ...(customName && { customName }) }
            ]
        };

        setPreferences(newPrefs);
        setHasChanges(true);

        //  AUTO-SAVE
        try {
            await updatePreferences(newPrefs);
            console.log('✅ Objetivo salvo automaticamente');
        } catch (err) {
            console.error('❌ Erro ao salvar objetivo:', err);
        }
    }, [preferences]);

    /**
     * ➖ Remove objetivo
     */
    const removeGoal = useCallback(async (name) => {
        const newPrefs = {
            ...preferences,
            goals: preferences.goals.filter(g =>
                g.name !== name && g.customName !== name
            )
        };

        setPreferences(newPrefs);
        setHasChanges(true);

        //  AUTO-SAVE
        try {
            await updatePreferences(newPrefs);
            console.log('✅ Objetivo removido automaticamente');
        } catch (err) {
            console.error('❌ Erro ao remover objetivo:', err);
        }
    }, [preferences]);

    /**
     * 🔢 Atualiza macros
     */
    const updateMacros = useCallback((field, value) => {
        setPreferences(prev => ({
            ...prev,
            macros: {
                ...prev.macros,
                [field]: Math.max(0, Math.min(100, Number(value) || 0))
            }
        }));
        setHasChanges(true);
    }, []);

    /**
     * 🔄 Reseta para padrão
     */
    const reset = useCallback(() => {
        setPreferences({
            diets: [],
            allergies: [],
            intolerances: [],
            goals: [],
            macros: { carb: 50, protein: 25, fat: 25 },
            calorieTarget: null,
            bloodType: null
        });
        setHasChanges(false);
    }, []);

    // Carrega preferências ao montar
    useEffect(() => {
        const token = localStorage.getItem('bomPiteuToken');
        if (!token) {
            console.log('Preferências aguardando autenticação...');
            setLoading(false);
            return;
        }

        loadPreferences();
    }, [loadPreferences]);


    return {
        preferences,
        loading,
        error,
        hasChanges,

        // Funções
        load: loadPreferences,
        save,
        updateField,
        reset,

        // Dietas
        addDiet,
        removeDiet,

        // Alergias
        addAllergy,
        removeAllergy,

        // Intolerâncias
        addIntolerance,
        removeIntolerance,

        // Objetivos
        addGoal,
        removeGoal,

        // Macros
        updateMacros
    };
}