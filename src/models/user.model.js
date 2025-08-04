import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    // --- THIS IS THE FIX ---
    // The 'enum' restriction has been removed.
    // The role can now be any string provided from the form.
    role: {
        type: String,
        default: "employee"
    },
    status:{
        type:String,
        enum:["Logged In","Logged Out"],
        default:"Logged Out"
    },
    lastSeen:{
        type:Date,
        default:Date.now,
    },
    image: { type: String }

}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;
