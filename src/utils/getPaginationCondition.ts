import { Op, WhereOptions } from "sequelize";

export const getDescPaginationCondition = (
    lastId: string | undefined,
    limit: number,
    extraWhereCondition?: WhereOptions
): {
    where: WhereOptions | undefined;
    limit: number;
} => {
    return {
        where:
            lastId && parseInt(lastId, 10)
                ? {
                      id: { [Op.lt]: parseInt(lastId, 10) },
                      ...extraWhereCondition,
                  }
                : { ...extraWhereCondition },
        limit,
    };
};
