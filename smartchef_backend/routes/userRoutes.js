const express = require("express");
const router = express.Router();
const User = require("../models/User");

// GET PROFILE
router.get("/profile/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user)
      return res.status(404).json({ success: false, message: "Usuário não encontrado" });

    return res.json({
      success: true,
      data: user
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: "Erro ao buscar perfil", error });
  }
});

// UPDATE PROFILE
router.put("/profile/:id", async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    return res.json({
      success: true,
      message: "Perfil atualizado!",
      data: updated
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Erro ao atualizar perfil",
      error
    });
  }
});

router.post("/:id/avatar", (req, res) => {
  
  try {
    const {avatarUrl} = req.file;
    if(avatarUrl === null && typeof avatarUrl != string) {
      res.status(400).json({message: "invalido"})
    }
    //no maximo 3mb
    const user = await User.create({
      ...user, 
      avatarUrl
    });
    user.save();
  } catch(error){
    console.error("Erro na atualizar o avatat");
    res.status(500).json({message: "Erro ao atualizat avatar !"});
  }
});
module.exports = router;