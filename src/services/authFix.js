export function ensureDemoUser() {
  const existingUser = localStorage.getItem("smartchef_user");
  if (!existingUser) {
    const demoUser = {
      id: "user1",
      name: "Chef Demo",
      email: "chef@culinaria.com",
      level: 1,
      points: 20,
      favorites: [],
      picture: "",
      isPremium: false,
    };
    localStorage.setItem("smartchef_user", JSON.stringify(demoUser));
    console.log("✅ Utilizador demo criado automaticamente!");
  } else {
    console.log("👤 Utilizador já existe no localStorage.");
  }
}
