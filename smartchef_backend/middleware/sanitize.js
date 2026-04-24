// middleware/sanitize.js
const { sanitizeBody } = require("express-validator");

const sanitizeInputs = [
  sanitizeBody("*").escape().trim(),
];

module.exports = sanitizeInputs;
