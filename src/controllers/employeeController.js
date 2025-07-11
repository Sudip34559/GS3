import bcrypt from 'bcrypt'
import User from '../models/user.model.js';
import { ApiResponse } from '../utils/apiResponce.js'

export async function createEmployee(req,res){
    const {username,email,password} = req.body;
    const existingEmployee = await User.findOne({email});
    if(existingEmployee){
        return res.status(400).json ({message:"Employee already exists"});
    }
    const hashed = await bcrypt.hash(password,10);
    const employee = await User.create({
        username,
        email,
        password:hashed,
        role:'employee'
    })
    res.status(201).json(new ApiResponse(201,employee,"Employee Registered"))
}