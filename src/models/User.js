const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    userName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      default: null,
    },
    gender: {
      type: Boolean,
      default: false,
    },
    dateOfBirth: {
      type: Date,
      default: new Date("2000-01-01"),
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

userSchema.statics.findByCendentials = async function (email, password) {
  try {
    const user = await this.findOne({ email });
    if (!user) {
      throw new Error("Not found email");
    }
    const isMatch = await bcrypt.compare(password, user.password);
    // console.log(isMatch);
    if (!isMatch) {
      throw new Error("Wrong password");
    }
    return user;
  } catch (err) {
    throw new Error(err.message);
  }
};

const User = mongoose.model("User", userSchema);
module.exports = User;
