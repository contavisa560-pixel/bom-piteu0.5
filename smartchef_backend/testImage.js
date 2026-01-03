const fs = require("fs");
const path = require("path");
const FormData = require("form-data");
const axios = require("axios");

// Caminho da imagem
const imagePath = path.join(__dirname, "cabrito-assado-no-forno.jpg");

// Criar FormData
const form = new FormData();
form.append("image", fs.createReadStream(imagePath));
form.append("prompt", "Analise esta imagem do prato");

// Enviar para a rota de teste
axios
  .post("http://localhost:5000/api/chat/image-chat-test", form, {
    headers: form.getHeaders(),
  })
  .then((res) => {
    console.log(" RESPOSTA DO SERVIDOR:");
    console.log(res.data);
  })
  .catch((err) => {
    console.error(" ERRO AO ENVIAR IMAGEM:", err.response?.data || err.message);
  });
