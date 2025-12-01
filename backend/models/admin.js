const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const AdminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["admin", "superadmin"],
      default: "admin"
    }
  },
  { timestamps: true }
);

// 🔐 Hash before saving
AdminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// 🔐 Compare password
AdminSchema.methods.matchPassword = async function (entered) {
  return await bcrypt.compare(entered, this.password);
};

// 🔐 JWT Token - INCLUDE ROLE IN TOKEN
AdminSchema.methods.generateToken = function () {
  return jwt.sign(
    { 
      id: this._id, 
      role: this.role, // Include role in token
      email: this.email 
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

module.exports = mongoose.model("Admin", AdminSchema);