import { PAGE_SIZE } from "assets/magicValues";
import { Request, Response } from "express";
import { Category, Choice, Post } from "models";
import { getDescPaginationCondition } from "utils/getPaginationCondition";

export const getAllPosts = async (
    req: Request<{}, {}, {}, { lastId?: string }>,
    res: Response
) => {
    try {
        const { lastId } = req.query;
        const posts = await Post.findAll({
            // 왜래키로 연결된 데이터 필드 가져오기
            include: [
                {
                    model: Category, // join할 모델
                    as: "category",
                    attributes: ["name"], // select해서 표시할 필드 지정
                },
            ],
            order: [["createdAt", "DESC"]], // 이차원 배열로 순서 구현(내림차순)
            ...getDescPaginationCondition(lastId, PAGE_SIZE),
        });
        return res.status(200).json(posts);
    } catch (error) {
        return res.status(500).json({ message: error });
    }
};

export const getPostsAboutCategory = async (
    req: Request<{ categoryId: string }, {}, {}, { lastId?: string }>,
    res: Response
) => {
    const categoryId = req.params.categoryId;
    const { lastId } = req.query;
    if (!categoryId)
        return res.status(400).json({
            message: "잘못된 형식의 요청입니다. categoryId가 필요합니다.",
        });
    try {
        const posts = await Post.findAndCountAll({
            // 개수와 전체 개시글 목록까지 반환
            order: [["createdAt", "DESC"]], // 이차원 배열로 순서 구현(내림차순)
            ...getDescPaginationCondition(lastId, PAGE_SIZE, {
                categoryId,
            }),
        });
        return res.status(200).json(posts);
    } catch (error) {
        return res.status(500).json({ message: error });
    }
};

export const getPost = async (req: Request, res: Response) => {
    const postId = req.params.postId;
    if (!postId)
        return res.status(400).json({
            message: "잘못된 형식의 요청입니다. postId가 필요합니다.",
        });
    try {
        const post = await Post.findByPk(postId, {
            // 왜래키로 연결된 데이터 필드 가져오기
            attributes: [
                "id",
                "categoryId",
                "choice1",
                "choice1Url",
                "choice1Count",
                "choice2",
                "choice2Url",
                "choice2Count",
                "title",
                "createdAt",
                "updatedAt",
            ],
        });
        return res.status(200).json(post);
    } catch (error) {
        return res.status(500).json({ message: error });
    }
};

export const uploadPost = async (req: Request, res: Response) => {
    const {
        body: { title, choice1, choice2, uploaderId, categoryName },
    } = req;
    const files = req.files as { [fieldname: string]: Express.MulterS3.File[] }; // 와 겨우 알았네
    // https://stackoverflow.com/questions/56491896/using-multer-and-express-with-typescript
    try {
        if (!uploaderId)
            return res.status(401).json({ message: "Unauthorized" });
        if (!categoryName || !title || !choice1 || !choice2)
            return res
                .status(400)
                .json({ message: "잘못된 형식의 요청입니다." }); // 다른 데이터들 있는지 체크해야
        let finalCateogoryId;
        // 검색 후 하나 발견한 순간 정지
        const searchedCategory = await Category.findOne({
            where: { name: categoryName },
        });
        // 카테고리 있으면 기존 id 가져오기
        if (searchedCategory) {
            finalCateogoryId = searchedCategory.id;
        } else {
            const newCategory = await Category.create({ name: categoryName }); // 없으면 새로 생성 후 id 할당
            finalCateogoryId = newCategory.id;
        }
        const result = await Post.create({
            title,
            choice1,
            choice2,
            choice1Url: Array.isArray(files.choice1Image)
                ? files.choice1Image[0].location
                : null,
            choice1Count: 0,
            choice2Url: Array.isArray(files.choice1Image)
                ? files.choice2Image[0].location
                : null,
            choice2Count: 0,
            uploaderId,
            categoryId: finalCateogoryId,
        });
        return res.status(201).json({ postId: result.id });
    } catch (error) {
        return res.status(500).json({ message: error });
    }
};

export const getUserPosts = async (req: Request, res: Response) => {
    try {
        const posts = await Post.findAll({
            where: {
                uploaderId: res.locals.uid,
            },
            attributes: [
                "id",
                "categoryId",
                "choice1",
                "choice1Url",
                "choice1Count",
                "choice2",
                "choice2Url",
                "choice2Count",
                "title",
                "createdAt",
                "updatedAt",
            ],
            order: [["createdAt", "DESC"]], // 이차원 배열로 순서 구현(내림차순)
            limit: PAGE_SIZE, // 개수 10개로 제한
        });
        return res.status(200).json(posts);
    } catch (error) {
        return res.status(500).json({ message: error });
    }
};

export const deletePost = async (req: Request, res: Response) => {
    const postId = req.params.postId;
    try {
        const result = await Post.destroy({
            where: {
                id: postId,
            },
        });
        return res
            .status(result ? 200 : 204) // 204: 요청은 유효하나 해당 자원을
            .json(
                result ? "게시글 삭제 성공" : "해당 게시글이 존재하지 않습니다."
            );
    } catch (error) {
        return res.status(500).json({ message: error });
    }
};

export const getChoice = async (req: Request, res: Response) => {
    const {
        params: { postId },
    } = req;
    const uid = res.locals.uid;
    if (!postId)
        return res.status(400).json({
            message: "잘못된 형식의 요청입니다. postId가 필요합니다.",
        });
    try {
        const choiceTypeObj = await Choice.findOne({
            attributes: ["choiceType"],
            where: {
                uid,
                postId,
            },
        });
        return res.status(200).json(choiceTypeObj); // 나중에 null인 경우에 객체로 수정
    } catch (error) {
        return res.status(500).json({ message: error });
    }
};

export const postChoice = async (req: Request, res: Response) => {
    const {
        params: { postId },
        body: { choice },
    } = req;
    const uid = res.locals.uid;
    if (choice === "")
        return res
            .status(400)
            .json({ message: "아무것도 선택하지 않았습니다." });
    const choiceType = Number(choice); // 꼭 숫자로 바꿔주자
    if (!postId || (choiceType !== 0 && choiceType !== 1))
        return res.status(400).json({
            message:
                "잘못된 형식의 요청입니다. postId나 choiceType이 필요합니다.",
        });
    try {
        // 기존 좋아요 찾기
        const prevChoice = await Choice.findOne({
            where: { uid, postId },
        });
        const [, created] = await Choice.upsert({
            id: prevChoice ? prevChoice.id : undefined, // 이게 없으면 새로 만들고, 아니면 찾아서 업데이트
            uid,
            postId: Number(postId),
            choiceType: Boolean(choiceType),
        });
        const postToIncreOrDecre = await Post.findByPk(postId);
        if (!created) {
            // 기존 걸 제거합니다
            await postToIncreOrDecre?.decrement(
                choiceType === 0 ? "choice2Count" : "choice1Count",
                { by: 1 }
            );
        }
        await postToIncreOrDecre?.increment(
            choiceType === 0 ? "choice1Count" : "choice2Count",
            { by: 1 }
        );
        return res
            .status(201)
            .json({ message: created ? `선택 완료` : "변경 완료" });
    } catch (error) {
        return res.status(500).json({ message: error });
    }
};

export const cancelChoice = async (req: Request, res: Response) => {
    const {
        params: { postId },
    } = req;
    const uid = res.locals.uid;
    try {
        const choiceObj = await Choice.findOne({
            attributes: ["choiceType"],
            where: {
                uid,
                postId,
            },
        });
        const postToDecre = await Post.findByPk(postId);
        if (choiceObj?.choiceType !== undefined && postToDecre) {
            await postToDecre.decrement(
                choiceObj.choiceType ? "choice2Count" : "choice1Count",
                { by: 1 }
            );
        }
        // 1이면 삭제함, 0이면 원래 없던 것
        const result = await Choice.destroy({
            where: {
                uid,
                postId,
            },
        });
        return res.status(200).json({ message: "취소 완료" });
    } catch (error) {
        return res.status(500).json({ message: error });
    }
};
