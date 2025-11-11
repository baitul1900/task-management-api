import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";



const userSchema = new Schema(
    {
        userName: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        fullName: {
            type: String,
            required: true,
            trim: true
        },
        password: {
            type: String,
            required: [true, "Password is required"],
        },
        // Kept for basic profile info
        gender: {
            type: String,
            enum: ["male", "female", "other"],
            required: true
        },
        // Essential for OTP/Email verification
        emailVerifiedAt: {
            type: Date,
            default: null
        },
        // Essential for token management
        refreshToken: {
            type: String,
        },
        
        isActive: {
            type: Boolean,
            default: true
        }
        
    },
    {
        timestamps: true, // Keep track of creation and update times
        versionKey: false
    }
);



userSchema.pre("save", async function (next) {
    if (!this.isModified("password"))
        return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.methods.isPasswordMatched = async function (password) {
    return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken  = function () {
    return jwt.sign(
        {
            _id : this._id,
            email: this.email,
            userName: this.userName
        },
        process.env.ACCESS_TOKEN,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXP || "1d"
        }
    )
};


userSchema.methods.generateRefreshToken  = function () {
    return jwt.sign(
        {
            _id : this._id,
        },
        process.env.REFRESH_TOKEN,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXP || "7d"
        }
    )
};


// indexs 
userSchema.index({ createdAt: -1 }); 
userSchema.index({ userName: "text", fullName: "text", email: "text" }); 
userSchema.index({ emailVerifiedAt: 1 });


export const User = mongoose.model("User", userSchema);