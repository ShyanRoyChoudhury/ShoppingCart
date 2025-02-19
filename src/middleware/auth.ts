import { NextFunction, Request, Response } from "express";
import { ResponseClass, Status } from "../utils/ResponseClass";
import { users } from "../dataStore/user";

interface AuthenticatedRequest extends Request {
    userid?: string;
}

export const verifyAuthMiddleware = async(req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try{
        const userId = req.body.userId;
        
        if(!users.includes(userId)) throw new Error("ERR3")
        
        req.userid = userId

        next();
    }catch(err){
        return res.json(new ResponseClass({}, "ERR3", Status.Fail))
    }
}