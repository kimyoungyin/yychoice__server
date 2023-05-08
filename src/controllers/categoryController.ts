import { PAGE_SIZE } from "../assets/magicValues";
import { Request, Response } from "express";
import { Category } from "../models";
import { getDescPaginationCondition } from "../utils/getPaginationCondition";
import logger from "../logger";

const getAllCategories = async (
    req: Request<{}, {}, {}, { lastId?: string }>,
    res: Response
) => {
    const { lastId } = req.query;

    try {
        const categories = await Category.findAll({
            ...getDescPaginationCondition(lastId, PAGE_SIZE),
        });
        return res.status(200).json(categories);
    } catch (error) {
        if (error instanceof Error) {
            logger.error(error.message);
        }
        return res.status(500).send(`알 수 없는 에러가 발생했습니다.`);
    }
};

export default getAllCategories;
