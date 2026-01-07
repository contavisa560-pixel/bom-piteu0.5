function validateStep(gptResponse) {
  if (gptResponse.includes("PASSO VALIDADO")) {
    return "VALID";
  }
  return "INVALID";
}

module.exports = { validateStep };

