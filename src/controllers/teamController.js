import Team from "../models/team.model.js";
import {ApiResponse} from '../utils/apiResponce.js'

export async function createTeamMember(req,res){
    const {name,position,about,github,linkedin} = req.body;
    const image = req.file ? `/team_images/${req.file.filename}` : "";

    const member = await Team.create({name,position,about,github,linkedin,image});
    res.status(201).json(new ApiResponse(201,member,"Team Member Created"));
}
