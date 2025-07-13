import mongoose from 'mongoose'

const workSchema = new mongoose.Schema({

    title: {
        type: String,
        required:true
    },
    image: {
        type: String,
        required:true
    },
    logo: {
        type: String,
        required:true
    },
}, { timestamps: true })

export default mongoose.model("Work", workSchema)