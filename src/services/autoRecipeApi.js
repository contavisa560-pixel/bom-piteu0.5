import api from "./api";

/**
 * 1️⃣ Envia imagem → opções
 */
export async function uploadImageForOptions(file) {
  const formData = new FormData();
  formData.append("image", file);

  const res = await api.post("/auto-recipe/options", formData);
  return res.data;
}

/**
 * 2️⃣ Escolher receita
 */
export async function selectRecipe(sessionId, choice) {
  const res = await api.post("/auto-recipe/select", {
    sessionId,
    choice,
  });
  return res.data;
}

/**
 * 3️⃣ Gerar passo
 */
export async function generateStep(sessionId) {
  const res = await api.post("/auto-recipe/step", { sessionId });
  return res.data;
}
