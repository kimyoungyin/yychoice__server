import multer from "multer";
import multerS3 from "multer-s3";
import { DeleteObjectsCommand, S3Client } from "@aws-sdk/client-s3";
import admin from "config/firebase-config";
import { NextFunction, Request, Response } from "express";
import { Post } from "models";

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

export const deleteAWSImage = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const postId = req.params.postId;
    if (!postId) return res.status(400).send("잘못된 형식의 요청입니다.");
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
                console.log(
                    `Successfully deleted ${Deleted.length} objects from S3 bucket. Deleted objects:`
                );
                console.log(Deleted.map((d) => ` • ${d.Key}`).join("\n"));
                return next();
            } else {
                return res.status(500).json({
                    message:
                        "내부 서버 에러로 인해 이미지 삭제에 실패했습니다.",
                });
            }
        } else {
            return next();
        }
    } catch (error) {
        return res.status(500).json({ message: error });
    }
};
