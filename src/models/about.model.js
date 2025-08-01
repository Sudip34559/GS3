import mongoose from 'mongoose'

const statSchema = new mongoose.Schema({
    label: {
        type: String,
        requires: true
    },
    value: {
        type: String,
        required: true
    }
}, { timestamps: true })

const timelineSchema = new mongoose.Schema({
  year: {
    type: String,
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
  images: [String],
}, { timestamps: true }); 


const aboutSchema = new mongoose.Schema({
    stats: [statSchema],
    timeline: [timelineSchema],
}, { timestamps: true })

export default mongoose.model("About", aboutSchema);