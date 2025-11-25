const API_URL = "http://localhost:4000";

// Buscar utilizador
export async function getUser(id) {
  const res = await fetch(`${API_URL}/api/users/${id}`);
  return res.json();
}

// Atualizar utilizador geral
export async function updateUser(id, data) {
  const res = await fetch(`${API_URL}/api/users/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

// Atualizar definições (darkMode, idioma, notificações)
export async function updateSettings(id, settings) {
  const res = await fetch(`${API_URL}/api/users/${id}/settings`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(settings),
  });
  return res.json();
}

// Upload de avatar
export async function uploadAvatar(id, file) {
  const form = new FormData();
  form.append("avatar", file);

  const res = await fetch(`${API_URL}/api/users/${id}/avatar`, {
    method: "POST",
    body: form,
  });

  return res.json();
}

// Deletar utilizador
export async function deleteUser(id) {
  const res = await fetch(`${API_URL}/api/users/${id}`, {
    method: "DELETE",
  });
  return res.json();
}
// Adicionar ao fim de src/services/api.js (ou src/api.js)
export async function getUserSettings(id) {
  const res = await fetch(`${API_URL}/api/users/${id}/settings`);
  return res.json();
}

export async function updateUserSettings(id, settings) {
  const res = await fetch(`${API_URL}/api/users/${id}/settings`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(settings),
  });
  return res.json();
}
