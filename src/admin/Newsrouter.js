const express = require("express");
const router = express.Router();
const newsController = require("../controller/Newscontroller");
const multer = require("multer");

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Ensure this folder exists in server-rudraksh/
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });

router.post("/save", upload.single("image"), newsController.saveNews);
router.get("/all", newsController.fetchAllNews);
router.delete("/delete/:id", newsController.deleteNews);
router.put("/update/:id", upload.single("image"), newsController.updateNews);

module.exports = router;