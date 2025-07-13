import mongoose from 'mongoose'

const testimonialSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    position: {
        type: String,
        required: true
    },
    discussion: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        min: 0,
        max: 5,
        required: true
    },
    image: {
        type: String,
        required: true
    }
}, { timeseries: true })

const Testimonial = mongoose.model("Testimonial", testimonialSchema);
export default Testimonial;