import mongoose, { mongo } from "mongoose"

const teamSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    position:{
         type:String,
        required:true
    },
    about:{
         type:String,
        required:true
    },
    github:{
         type:String,
    },
    linkedin:{
         type:String,
    },
    image:{
        type:String
    }
},{timestamps:true})

const Team = mongoose.model("Team",teamSchema);
export default Team;