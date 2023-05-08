import admin from "../config/firebase-config";
import { NextFunction, Request, Response } from "express";
import logger from "../logger";
import {
    INTERNAL_ERROR_MESSAGE,
    UNAUTHORIZED_MESSAGE,
} from "../assets/magicValues";

const decodeToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (token) {
            const decodeValue = await admin.auth().verifyIdToken(token);
            if (decodeValue) {
                res.locals.uid = decodeValue.uid;
                return next();
            }
        }
        logger.warn(UNAUTHORIZED_MESSAGE);
        return res.status(401).json({ message: UNAUTHORIZED_MESSAGE });
    } catch (error) {
        if (error instanceof Error) {
            logger.error(error.message);
        }
        return res.status(500).json({ message: INTERNAL_ERROR_MESSAGE });
    }
};

export default decodeToken;
