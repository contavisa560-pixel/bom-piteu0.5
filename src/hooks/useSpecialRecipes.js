import { useQuery } from '@tanstack/react-query';

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

async function fetchSpecialRecipes(tipo) {
  const res = await fetch(`${API}/api/special-recipes/public?tipo=${tipo}`);
  const json = await res.json();
  return json.data || [];
}

export function useSpecialRecipes(tipo) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['special-recipes', tipo],
    queryFn: () => fetchSpecialRecipes(tipo),
    staleTime: 5 * 60 * 1000, // 5 minutos – dados considerados frescos
  });


  return { data: data ?? [], loading: isLoading, error };
}