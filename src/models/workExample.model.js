import mongoose from "mongoose";
const workExampleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    logo: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true
    },
    workId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Work",
        required: true
    }
}, { timestamps: true })

export default mongoose.model("WorkExample", workExampleSchema);