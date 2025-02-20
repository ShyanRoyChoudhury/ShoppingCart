import { NextFunction, Request, Response } from "express";
import { ResponseClass, Status } from "../utils/ResponseClass";
import { users, UserType } from "../dataStore/user";

export interface AuthenticatedRequest extends Request {
    user: UserType;
}

export const verifyAuthMiddleware = async(req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try{
        const userId = req?.body?.userId;

        console.log('userId', userId)
        if(!userId) throw new Error("Unauthenticated User");
        const user = users.find(u=> u.userid === userId)
        if(!user) throw new Error("ERR3");
        req.user = user

        next();
    }catch(err){
        return res.json(new ResponseClass({}, "ERR3", Status.Fail))
    }
}
