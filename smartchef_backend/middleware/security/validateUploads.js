const multer = require("multer");
const path = require("path");

const storage = multer.memoryStorage();

const fileFilter = (allowedTypes) => (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedTypes.includes(ext)) cb(null, true);
  else cb(new Error("Tipo de arquivo não permitido"), false);
};

const upload = (allowedTypes = [".png", ".jpg", ".jpeg"]) =>
  multer({
    storage,
    fileFilter: fileFilter(allowedTypes),
    limits: { fileSize: 5 * 1024 * 1024 },
  });

module.exports = { upload };
