const mongoose = require("mongoose");

const PreferenceSchemma = new mongoose.Schemma({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  dietType: String,
  allergies: [String],
  cookingLevel: String,
});

module.exports = mongoose.model("Preference", PreferenceSchemma);
