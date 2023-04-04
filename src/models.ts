import Sequelize, {
    CreationOptional,
    DataTypes,
    ForeignKey,
    InferAttributes,
    InferCreationAttributes,
    Model,
} from "sequelize";
import sequelize from "database";

// sequelize model = musql table
// export const Category = sequelize.define(
//     "category",
//     {
//         // id는 sequelize에서 자동으로 생김
//         name: {
//             type: Sequelize.STRING(10),
//             allowNull: false,
//         },
//     },
//     { timestamps: false }
// ); // createdAt, updatedAT 필요 없음

export class Category extends Model<
    InferAttributes<Category>,
    InferCreationAttributes<Category>
> {
    declare id: CreationOptional<number>;
    declare name: string;
}

export class Post extends Model<
    InferAttributes<Post>,
    InferCreationAttributes<Post>
> {
    declare id: CreationOptional<number>;
    declare categoryId: ForeignKey<Category["id"]>;
    declare title: string;
    declare choice1: string;
    declare choice1Url: string | null;
    declare choice2: string;
    declare choice2Url: string | null;
    declare uploaderId: string;

    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
}
export class Choice extends Model<
    InferAttributes<Choice>,
    InferCreationAttributes<Choice>
> {
    declare id: CreationOptional<number>;
    declare postId: ForeignKey<Post["id"]>;

    declare uid: string;
    declare choiceType: boolean;
}

Category.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: Sequelize.STRING(10),
            allowNull: false,
        },
    },
    {
        tableName: "categories",
        timestamps: false,
        sequelize,
    }
);

Post.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        title: {
            type: Sequelize.STRING(20),
            allowNull: false,
        },
        choice1: {
            type: Sequelize.STRING(20),
            allowNull: false,
        },
        choice1Url: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        choice2: {
            type: Sequelize.STRING(20),
            allowNull: false,
        },
        choice2Url: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        uploaderId: {
            type: Sequelize.STRING(28),
            allowNull: false,
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
    },
    { tableName: "posts", timestamps: true, sequelize }
);

Choice.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        uid: {
            type: Sequelize.STRING(28), // uid 길이
            allowNull: false,
        },
        choiceType: {
            type: Sequelize.BOOLEAN, // 1 혹은 0
            allowNull: false,
        },
    },
    { tableName: "choices", timestamps: false, sequelize }
);

// export const Post = sequelize.define("post", {
//     // id는 sequelize에서 자동으로 생김
//     title: {
//         type: Sequelize.STRING(20), // 20자 제한 추가함
//         allowNull: false,
//     },
//     choice1: {
//         type: Sequelize.STRING(20), // 20자 제한 추가
//         allowNull: false,
//     },
//     choice1Url: {
//         type: Sequelize.STRING,
//         allowNull: true,
//     },
//     choice2: {
//         type: Sequelize.STRING(20), // 20자 제한 추가
//         allowNull: false,
//     },
//     choice2Url: {
//         type: Sequelize.STRING,
//         allowNull: true,
//     },
//     uploaderId: {
//         type: Sequelize.STRING(28),
//         allowNull: false,
//     },
// });

// export const Choice = sequelize.define(
//     "choice",
//     {
//         uid: {
//             type: Sequelize.STRING(28), // uid 길이
//             allowNull: false,
//         },
//         choiceType: {
//             type: Sequelize.BOOLEAN, // 1 혹은 0
//             allowNull: false,
//         },
//     },
//     { timestamps: false } // createdAt, updatedAT 필요 없음
// );
