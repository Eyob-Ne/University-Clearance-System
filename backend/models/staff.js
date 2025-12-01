const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: true,
  },

  // 🔑 User role
     role: {
      type: String,
      enum: [
        "Library",
        "Dormitory",
        "Finance",
        "Registrar",
        "Cafeteria",
        "Department Head",
      ],
      required: true,
    },

    department: {
      type: String,
      required: function () {
        return this.role === "Department Head";
      },
    },
  },
  { timestamps: true }
);

// 🔐 Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// 🔑 Compare passwords during login
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("staff", userSchema);
