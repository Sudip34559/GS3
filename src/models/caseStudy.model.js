import mongoose from 'mongoose';

const caseStudySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    heroImage: {
        type: String,
        required: true,
    },
}, { timestamps: true })

const caseStudyDetailSchema = new mongoose.Schema({
    caseStudyId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"CaseStudy",
        required:true,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
},{timestamps:true})

export const CaseStudy = mongoose.model("CaseStudy",caseStudySchema)
export const CaseStudyDetail = mongoose.model("CaseStudyDetail",caseStudyDetailSchema)