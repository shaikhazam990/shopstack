const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const addressSchema = new mongoose.Schema({
  label: { type: String, default: "Home" },
  fullName: String,
  phone: String,
  line1: String,
  line2: String,
  city: String,
  state: String,
  zip: String,
  country: { type: String, default: "IN" },
  isDefault: { type: Boolean, default: false },
});

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, minlength: 6, select: false },
    avatar: { type: String, default: "" },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },

    // OAuth
    googleId: { type: String },
    authProvider: { type: String, enum: ["local", "google"], default: "local" },

    // Address book
    addresses: [addressSchema],

    // Wishlist folders
    wishlistFolders: [
      {
        name: String,
        icon: String,
        products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
        updatedAt: { type: Date, default: Date.now },
      },
    ],

    // Tokens
    refreshToken: { type: String, select: false },
    emailVerifyToken: { type: String, select: false },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: Date,

    lastLogin: Date,
  },
  { timestamps: true }
);

// Hash password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshToken;
  delete obj.emailVerifyToken;
  delete obj.passwordResetToken;
  return obj;
};

module.exports = mongoose.model("User", userSchema);
