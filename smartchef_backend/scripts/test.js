require("dotenv").config({ path: "../.env" });
const fal = require("@fal-ai/serverless-client");

fal.config({
  credentials: process.env.FAL_KEY,
});

(async () => {
  const res = await fal.subscribe("fal-ai/flux/schnell", {
    input: { prompt: "Sopa de peixe angolana" },
  });

  console.log(res.images[0].url);
})();
