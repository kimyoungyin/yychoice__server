import express from "express";
import cors from "cors";
import morgan from "morgan";
import categoryRouter from "./routers/categoryRouter";
import postRouter from "./routers/postRouter";
import sequelize from "./database";
import { Category, Choice, Post } from "./models";
import logger from "./logger";
import helmet from "helmet";
import hpp from "hpp";
// 꼭 가져와야 sync가 정상 작동한다.

const PORT = process.env.PORT || 4000;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // body 접근 가능

app.use(
    cors({
        origin: `http://localhost:3000`,
        credentials: true,
        optionsSuccessStatus: 200,
    })
);

if (process.env.NODE_ENV === "production") {
    app.use(morgan("combined"));
    app.use(
        helmet({
            contentSecurityPolicy: false,
            crossOriginEmbedderPolicy: false,
        })
    ); // 복잡한 설정이므로 꺼주는 contentSecurityPolicy
    app.use(hpp());
} else {
    app.use(morgan("dev"));
}

app.use("/posts", postRouter);
app.use("/categories", categoryRouter);

app.use((req, res, next) => {
    const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
    logger.error(error.message);
    res.status(404).json(error.message);
});
// association
Post.belongsTo(Category, {
    constraints: true,
    as: "category",
    onDelete: "CASCADE",
}); // 삭제될 경우 연결된 테이블 내용도 삭제
Category.hasMany(Post, { sourceKey: "id", foreignKey: "categoryId" }); // foreignKey를 설정해야 model의 왜래 키를 인식한다.
Choice.belongsTo(Post, { constraints: true, as: "post", onDelete: "CASCADE" });
Post.hasMany(Choice, { sourceKey: "id", foreignKey: "postId" }); // foreignKey를 설정해야 model의 왜래 키를 인식한다.

const handleListening = () =>
    logger.info(`✅ Server listenting on port http://localhost:${PORT} 🚀`);

sequelize
    .sync()
    //{ force: true }는 기존 테이블 제거 후 덮어쓰기 => 이후 다시 지워야 함
    // sequelize에 정의된 모든 모델을 가져오고 해당 테이블이 없으면 생성함(테이블명은 복수형으로 자동 생성), id, createdAt, updatedAt
    .then(() => {
        app.listen(PORT, handleListening);
    })
    .catch((error) => logger.error(error));
