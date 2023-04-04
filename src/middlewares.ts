import multer from "multer";
import multerS3 from "multer-s3";
import { S3Client } from "@aws-sdk/client-s3";
import admin from "config/firebase-config";
import { NextFunction, Request, Response } from "express";

const s3 = new S3Client({
    region: "ap-northeast-2",
    credentials: {
        accessKeyId: process.env.AWS_ID as string,
        secretAccessKey: process.env.AWS_SECRET as string,
    },
});

const uploadStorage = multerS3({
    s3: s3,
    bucket: "choiceweb",
    acl: "public-read", // 아직 이게 작동 안함
});

export const uploadFiles = multer({
    dest: "uploads/",
    limits: { fileSize: 1 * 1024 * 1024 }, // 파일 사이즈 1MB
    storage: uploadStorage,
});

export const decodeToken = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (token) {
            const decodeValue = await admin.auth().verifyIdToken(token);
            if (decodeValue) {
                res.locals.uid = decodeValue.uid;
                return next();
            }
        }
        return res.status(401).json({ message: "unauthorized" });
    } catch (error) {
        return res.status(500).json({ message: "internal error" });
    }
};
