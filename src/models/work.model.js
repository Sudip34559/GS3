import mongoose from 'mongoose'

const workSchema = new mongoose.Schema({

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
    },
    liveLink: String,
    caseStudyLink: String,
    isSelected: {
        type: Boolean,
        default: false,
    },
    caseStudyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CaseStudy', // This links to the CaseStudy model for population
        default: null
    },
}, { timestamps: true })

export default mongoose.model("Work", workSchema)