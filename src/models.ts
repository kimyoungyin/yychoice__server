import Sequelize, {
    CreationOptional,
    DataTypes,
    ForeignKey,
    InferAttributes,
    InferCreationAttributes,
    Model,
} from "sequelize";
import sequelize from "database";

export class Category extends Model<
    InferAttributes<Category>,
    InferCreationAttributes<Category>
> {
    declare id: CreationOptional<number>;
    declare name: string;
}

export class Post extends Model<
    InferAttributes<Post>,
    InferCreationAttributes<Post> // creation 시에 optional로 작용할 프로퍼티(id)가 있음을 알림
> {
    declare id: CreationOptional<number>; // creation 시에는 id 프로퍼티가 필요 없기 때문에
    declare categoryId: ForeignKey<Category["id"]>;
    declare title: string;
    declare choice1: string;
    declare choice1Count: number;
    declare choice1Url: string | null;
    declare choice2: string;
    declare choice2Count: number;
    declare choice2Url: string | null;
    declare uploaderId: string;

    declare createdAt: CreationOptional<Date>; // 이것도 생성 시에는 입력할 필요 없는 것들
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
        sequelize, // db.sequelize로, 나중에 연결해줌
        timestamps: false,
        underscored: false, // true로 하면 테이블 명과 컬럼 명을 스네이크 케이스로 바꿈
        modelName: "Cateogry",
        tableName: "categories",
        paranoid: false, // deletedAt 컬럼 생성. 나중에 복원하려는 경우
        charset: "utf8mb4", // 한글이 가능하려면 utf8, 이모지 가능하게 하려면 utf8mb4
        collate: "utf8mb4_general_ci", // 한글이 가능하려면 utf8_general_ci, 이모지 가능하게 하려면 utf8mb4_general_ci
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
        choice1Count: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        choice2: {
            type: Sequelize.STRING(20),
            allowNull: false,
        },
        choice2Url: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        choice2Count: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        uploaderId: {
            type: Sequelize.STRING(28),
            allowNull: false,
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
    },
    {
        sequelize, // db.sequelize로, 나중에 연결해줌
        timestamps: true,
        underscored: false, // true로 하면 테이블 명과 컬럼 명을 스네이크 케이스로 바꿈
        modelName: "Post",
        tableName: "posts",
        paranoid: false, // deletedAt 컬럼 생성. 나중에 복원하려는 경우
        charset: "utf8mb4", // 한글이 가능하려면 utf8, 이모지 가능하게 하려면 utf8mb4
        collate: "utf8mb4_general_ci", // 한글이 가능하려면 utf8_general_ci, 이모지 가능하게 하려면 utf8mb4_general_ci
    }
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
    {
        sequelize, // db.sequelize로, 나중에 연결해줌
        timestamps: false,
        underscored: false, // true로 하면 테이블 명과 컬럼 명을 스네이크 케이스로 바꿈
        modelName: "Choice",
        tableName: "choices",
        paranoid: false, // deletedAt 컬럼 생성. 나중에 복원하려는 경우
        charset: "utf8", // 한글이 가능하려면 utf8, 이모지 가능하게 하려면 utf8mb4
        collate: "utf8_general_ci", // 한글이 가능하려면 utf8_general_ci, 이모지 가능하게 하려면 utf8mb4_general_ci
    }
);
