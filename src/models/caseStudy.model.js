import mongoose from 'mongoose';

const caseStudySchema = new mongoose.Schema({
    // Link to the specific work/project this case study is for
    workId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Work",
        required: true,
        unique: true, // Ensures one case study per project
    },
    title: {
        type: String,
        required: true,
    },
    // ADDED: Tagline for the hero section
    tagline: {
        type: String,
    },
    description: {
        type: String,
        required: true,
    },
    heroImage: {
        type: String,
        required: true,
    },
    // ADDED: Team members/roles involved
    team: {
        type: [String], // An array of strings
    },
    // ADDED: The final result of the project
    result: {
        type: String,
    },
    slug: {
        type: String,
        required: true,
        unique: true,
    }
}, { timestamps: true });

const caseStudyDetailSchema = new mongoose.Schema({
    caseStudyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CaseStudy",
        required: true,
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
}, { timestamps: true });

export const CaseStudy = mongoose.model("CaseStudy", caseStudySchema);
export const CaseStudyDetail = mongoose.model("CaseStudyDetail", caseStudyDetailSchema);