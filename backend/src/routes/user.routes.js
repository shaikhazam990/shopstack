const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { protect } = require("../middlewares/auth.middleware");
const { upload, uploadToCloudinary } = require("../middlewares/upload.middleware");
const { body } = require("express-validator");
const validate = require("../middlewares/validate.middleware");

router.use(protect);

// GET /api/users/profile
router.get("/profile", (req, res) => res.json({ success: true, data: req.user }));

// PUT /api/users/profile
router.put("/profile",
  [body("name").optional().trim().isLength({ min: 2 })],
  validate,
  async (req, res, next) => {
    try {
      const { name } = req.body;
      const user = await User.findByIdAndUpdate(req.user._id, { name }, { new: true });
      res.json({ success: true, data: user });
    } catch (error) { next(error); }
  }
);

// PUT /api/users/avatar
router.put("/avatar", upload.single("avatar"), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });
    const result = await uploadToCloudinary(req.file.buffer, "luminary/avatars");
    const user = await User.findByIdAndUpdate(req.user._id, { avatar: result.secure_url }, { new: true });
    res.json({ success: true, data: user });
  } catch (error) { next(error); }
});

// POST /api/users/addresses
router.post("/addresses", async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (req.body.isDefault) user.addresses.forEach((a) => (a.isDefault = false));
    user.addresses.push(req.body);
    await user.save();
    res.status(201).json({ success: true, data: user.addresses });
  } catch (error) { next(error); }
});

// PUT /api/users/addresses/:id
router.put("/addresses/:id", async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const address = user.addresses.id(req.params.id);
    if (!address) return res.status(404).json({ success: false, message: "Address not found" });
    if (req.body.isDefault) user.addresses.forEach((a) => (a.isDefault = false));
    Object.assign(address, req.body);
    await user.save();
    res.json({ success: true, data: user.addresses });
  } catch (error) { next(error); }
});

// DELETE /api/users/addresses/:id
router.delete("/addresses/:id", async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    user.addresses = user.addresses.filter((a) => a._id.toString() !== req.params.id);
    await user.save();
    res.json({ success: true, data: user.addresses });
  } catch (error) { next(error); }
});

// GET /api/users/wishlists
router.get("/wishlists", async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate("wishlistFolders.products", "name price images ratings slug");
    res.json({ success: true, data: user.wishlistFolders });
  } catch (error) { next(error); }
});

// POST /api/users/wishlists
router.post("/wishlists", async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    user.wishlistFolders.push({ name: req.body.name, icon: req.body.icon, products: [] });
    await user.save();
    res.status(201).json({ success: true, data: user.wishlistFolders });
  } catch (error) { next(error); }
});

// PUT /api/users/wishlists/:folderId/toggle/:productId
router.put("/wishlists/:folderId/toggle/:productId", async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const folder = user.wishlistFolders.id(req.params.folderId);
    if (!folder) return res.status(404).json({ success: false, message: "Folder not found" });

    const idx = folder.products.indexOf(req.params.productId);
    if (idx > -1) {
      folder.products.splice(idx, 1);
    } else {
      folder.products.push(req.params.productId);
    }
    folder.updatedAt = new Date();
    await user.save();
    res.json({ success: true, data: folder });
  } catch (error) { next(error); }
});

module.exports = router;
