import { createLogger, format, transports } from "winston";
import winstonDaily from "winston-daily-rotate-file";
// console.log 대신하며, 기록을 저장할 수 있음

const { combine, timestamp, label, printf, colorize } = format;

const logDir = `${process.cwd()}/logs`; // logs 디렉토리 하위에 로그 파일 저장

// https://velog.io/@ash/Node.js-%EC%84%9C%EB%B2%84%EC%97%90-logging-%EB%9D%BC%EC%9D%B4%EB%B8%8C%EB%9F%AC%EB%A6%AC-winston-%EC%A0%81%EC%9A%A9%ED%95%98%EA%B8%B0
const logFormat = printf(({ level, message, label, timestamp }) => {
    return `${timestamp} [${label}] ${level}: ${message}`; // 날짜 [시스템이름] 로그레벨 메세지
});

const logger = createLogger({
    level: "info",
    format: combine(
        timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), // 타임스탬프 형식
        label({ label: "yyChoice__server" }), // 앱 이름
        logFormat
    ),
    transports: [
        //* info 레벨 로그를 저장할 파일 설정 (info: 2 보다 높은 error: 0 와 warn: 1 로그들도 자동 포함해서 저장)
        new winstonDaily({
            level: "info", // info 레벨에선
            datePattern: "YYYY-MM-DD", // 파일 날짜 형식
            dirname: logDir, // 파일 경로
            filename: `%DATE%.log`, // 파일 이름
            maxFiles: 30, // 최근 30일치 로그 파일을 남김
            zippedArchive: true,
        }),
        //* error 레벨 로그를 저장할 파일 설정 (info에 자동 포함되지만 일부러 따로 빼서 설정)
        new winstonDaily({
            level: "error", // error 레벨에선
            datePattern: "YYYY-MM-DD",
            dirname: logDir + "/error", // /logs/error 하위에 저장
            filename: `%DATE%.error.log`, // 에러 로그는 2020-05-28.error.log 형식으로 저장
            maxFiles: 30,
            zippedArchive: true,
        }),
    ],
});

if (process.env.NODE_ENV !== "production") {
    logger.add(
        new transports.Console({
            format: combine(
                colorize({ all: true }), // console 에 출력할 로그 컬러 설정 적용함
                logFormat // log format 적용
            ),
        })
    );
}

export default logger;
