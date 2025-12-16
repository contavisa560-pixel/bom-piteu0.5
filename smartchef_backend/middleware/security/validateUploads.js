const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  }
});

const fileFilter = (allowedTypes) => (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Tipo de arquivo não permitido"), false);
  }
};

const upload = (allowedTypes = [".png", ".jpg", ".jpeg"]) => multer({
  storage,
  fileFilter: fileFilter(allowedTypes),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

module.exports = { upload };
