const mongoose = require("mongoose");

const StepSchema = new mongoose.Schema({
    stepNumber: Number,
    objective: String,
    expectedAction: String,
    expectedVisual: String,
    warnings: [String],

    userText: String,
    userImageUrl: String,
    visionAnalysis: Object,

    validationStatus: {
        type: String,
        enum: ["PENDING", "VALID", "INVALID"],
        default: "PENDING"
    },

    chefFeedback: String,
    completedAt: Date
});

const RecipeSessionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    recipeId: String,

    sessionId: {
        type: String,
        required: true,
        unique: true,
        default: () => new mongoose.Types.ObjectId().toString() // 
    },

    status: {
        type: String,
        enum: ["IN_PROGRESS", "COMPLETED", "ABANDONED"],
        default: "IN_PROGRESS"
    },

    currentStep: { type: Number, default: 1 },
    totalSteps: Number,
    steps: [StepSchema],
    startedAt: { type: Date, default: Date.now },
    finishedAt: Date
});

module.exports = mongoose.model("RecipeSession", RecipeSessionSchema);
