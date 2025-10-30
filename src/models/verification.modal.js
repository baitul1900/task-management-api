import mongoose, { Schema } from "mongoose";

const verificationSchema = new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    channel : {type : String , enum : ["email"], default: "email"}, 
    purpose : { type : String, enum : ["register", "reset_password"], required: true},
    codeHash : {type : String, required : true},
    attempts: {type : Number, default : 0},
    maxAttempts: {type : Number, default : 3},
    resentCount : { type : Number, default : 0},
    expiresAt :  { type : Date, required : true},
    consumedAt : { type : Date, default : null}
    
}, { timestamps: true })


verificationSchema.index({expiresAt : 1}, {expireAfterSeconds: 0});

verificationSchema.index(
    {userId: 1, purpose : 1},
    {partialFilterExpression : {consumedAt : {$eq : null}}}
)


export const VerificationOtp = mongoose.model("VerificationOtp", verificationSchema);