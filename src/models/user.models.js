import { Schema, model } from "mongoose";
import jwt from "jsonwebtoken";
import { hash, genSalt, compare } from "bcrypt";
const userSchema = new Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: [true, "Email already exist"],
      validate: {
        validator: function (v) {
          return /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(v);
        },
        message: ({ value }) => `${value} is not a valid email address!`,
      },
      lowercase: true,
      trim: true,
    },
    socialId: {
      type: String,
      default: null,
    },
    socialType: {
      type: String,
      enum: ["google", "apple"],
      default: null,
    },
    image: {
      type: String,
      default: null,
    },
    // is user online or not
    isOnline: {
      type: Boolean,
      default: false,
    },
    lastOnline: {
      type: Date,
      default: null,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false,
    },
    role: {
      type: Number,
      default: 1, // 0 for admin, 1 for user
    },
    isActive: { type: Boolean, default: true },
    refreshToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// before save check if password is modified then encrypt it
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await genSalt(12);
  this.password = await hash(this.password, salt);
  next();
});

// method to check if password matched or not
userSchema.methods.isPasswordCorrect = async function (password) {
  if (!password || !this.password) return false;
  return await compare(password, this.password);
};

// method to generate access token
userSchema.methods.generatetoken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

//method to generate refresh token
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

// virtual to get user details
userSchema.virtual("detail").get(function () {
  return `${this.fullName}'s mail is ${this.email}`;
});

userSchema.virtual("devices", {
  ref: "userDevice", // model name of device
  localField: "_id", // user._id
  foreignField: "userId", // userDevice.userId
});
userSchema.set("toObject", { virtuals: true });
userSchema.set("toJSON", { virtuals: true });

export default model("user", userSchema);
