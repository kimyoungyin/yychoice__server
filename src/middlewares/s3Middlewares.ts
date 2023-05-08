import multer from "multer";
import multerS3 from "multer-s3";
import { DeleteObjectsCommand, S3Client } from "@aws-sdk/client-s3";
import { NextFunction, Request, Response } from "express";
import { Post } from "../models";
import logger from "../logger";
import { INTERNAL_ERROR_MESSAGE } from "../assets/magicValues";

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

export const deleteAWSImage = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const postId = req.params.postId;
    if (!postId) {
        logger.warn("잘못된 형식의 요청입니다.");
        return res.status(400).send("잘못된 형식의 요청입니다.");
    }
    try {
        const postToDelete = await Post.findByPk(postId, {
            attributes: ["choice1Url", "choice2Url", "uploaderId"],
        });
        if (!postToDelete)
            return res.status(404).send("이미 삭제된 게시글입니다.");
        // 본인 인증
        if (postToDelete.uploaderId !== res.locals.uid)
            return res
                .status(401)
                .json({ message: "본인이 작성한 글만 삭제할 수 있습니다." });
        const urls: string[] = [];
        postToDelete.choice1Url && urls.push(postToDelete.choice1Url);
        postToDelete.choice2Url && urls.push(postToDelete.choice2Url);
        if (urls.length > 0) {
            const fileObjectsToDelete = urls.map((url) => {
                const arr = url.split("/");
                const fileNametoDelete = arr[arr.length - 1];
                return { Key: fileNametoDelete };
            });
            // https://docs.aws.amazon.com/AmazonS3/latest/userguide/example_s3_DeleteObjects_section.html
            const command = new DeleteObjectsCommand({
                Bucket: "choiceweb",
                Delete: {
                    Objects: fileObjectsToDelete,
                },
            });
            const { Deleted } = await s3.send(command);
            if (Deleted) {
                logger.info(
                    `Successfully deleted ${Deleted.length} objects from S3 bucket. Deleted objects:`
                );
                logger.info(Deleted.map((d) => ` • ${d.Key}`).join("\n"));
                return next();
            } else {
                return res.status(500).json({
                    message: INTERNAL_ERROR_MESSAGE,
                });
            }
        } else {
            return next();
        }
    } catch (error) {
        if (error instanceof Error) {
            logger.error(error.message);
        }
        return res.status(500).json({ message: INTERNAL_ERROR_MESSAGE });
    }
};
