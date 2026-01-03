const jwt = require("jsonwebtoken");
require("dotenv").config();

const userId = "693b641455b1b167611a49bf"; // do passo 1
const token = jwt.sign({ _id: userId, name: "Mauricio Test", email: "mauricio.teste@example.com" }, process.env.JWT_SECRET, { expiresIn: "7d" });

console.log("Token JWT:", token);
