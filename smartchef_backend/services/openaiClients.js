const OpenAI = require("openai");

const openaiText = new OpenAI({
  apiKey: process.env.OPENAI_TEXT_KEY,
});

const openaiImage = new OpenAI({
  apiKey: process.env.OPENAI_IMAGE_KEY,
});

const openaiVision = new OpenAI({
  apiKey: process.env.OPENAI_VISION_KEY,
});

module.exports = {
  openaiText,
  openaiImage,
  openaiVision,
};
