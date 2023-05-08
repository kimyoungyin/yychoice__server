import express from "express";
import {
    cancelChoice,
    deletePost,
    getAllPosts,
    getChoice,
    getPost,
    getPostsAboutCategory,
    getUserPosts,
    postChoice,
    uploadPost,
} from "../controllers/postController";
import { deleteAWSImage, uploadFiles } from "../middlewares/s3Middlewares";
import decodeToken from "../middlewares/decodeToken";

const postRouter = express.Router();

postRouter
    .route("/")
    .get(getAllPosts)
    .post(
        decodeToken,
        uploadFiles.fields([
            { name: "choice1Image", maxCount: 1 },
            { name: "choice2Image", maxCount: 1 },
        ]),
        uploadPost
    );
postRouter.get("/profile", decodeToken, getUserPosts);
postRouter.get("/category/:categoryId", getPostsAboutCategory);
postRouter
    .route("/:postId/choice")
    .get(decodeToken, getChoice)
    .post(decodeToken, postChoice)
    .delete(decodeToken, cancelChoice);
postRouter
    .route("/:postId")
    .get(getPost)
    .delete(decodeToken, deleteAWSImage, deletePost);

export default postRouter;
