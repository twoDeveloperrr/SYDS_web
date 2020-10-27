const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const resApi = require('../../../config/functions');

const fs = require('fs');

// exports.postRecord = async function (req,res){
//     try{
//         //변수 선언
//         let userIdx = req.body.userIdx;
//         let displayIdx = req.body.displayIdx;
//
//         const connection = await pool.getConnection(async conn=>conn());
//         try{
//             // record DB 'insert' 대입
//             const insertRecordQuery = `insert into record(userIdx, displayIdx) values (?, ?);`;
//
//             // insertRecordParams 안에 userIdx, dpIdx 값 대입
//             const insertRecordParams = [userIdx, displayIdx];
//             const [insertRecordResult] = await connection.query(insertRecordQuery,insertRecordParams);
//
//             //responseData 안에 resApi 객체 함수 대입
//             let responseData = {};
//             responseData = resApi(true,100, "record api 성공");
//             // 결과 화면
//             responseData.result = insertRecordResult;
//
//             //connection.release(); 필수, 이 함수를 넣지 않으면 서버 터짐
//             connection.release();
//
//             //responseData값 json형식으로 리턴
//             return res.json(responseData)
//
//         }catch (err) {
//             logger.error(`post PlayList transaction Query error\n: ${JSON.stringify(err)}`);
//             connection.release();
//             return resApi(false,200,"trx fail");
//         }
//     }catch (err){
//         logger.error(`post PlayList transaction DB Connection error\n: ${JSON.stringify(err)}`);
//         return resApi(false,201,"db connection fail");
//     }
// };


exports.postRecord = async function (req,res){
    try{
        //변수 선언
        let userIdx = req.body.userIdx;
        let displayIdx = req.body.displayIdx;

        const connection = await pool.getConnection(async conn=>conn());
        try{
            // record DB 'insert' 대입
            const insertRecordQuery = `insert into record(userIdx, displayIdx) values (?, ?);`;

            // insertRecordParams 안에 userIdx, dpIdx 값 대입
            const insertRecordParams = [userIdx, displayIdx];
            const [insertRecordResult] = await connection.query(insertRecordQuery,insertRecordParams);

            //responseData 안에 resApi 객체 함수 대입
            let responseData = {};
            responseData = resApi(true,100, "record api 성공");
            // 결과 화면
            responseData.result = insertRecordResult;

            //connection.release(); 필수, 이 함수를 넣지 않으면 서버 터짐
            connection.release();

            //responseData값 json형식으로 리턴
            return res.json(responseData)

        }catch (err) {
            logger.error(`post PlayList transaction Query error\n: ${JSON.stringify(err)}`);
            connection.release();
            return resApi(false,200,"trx fail");
        }
    }catch (err){
        logger.error(`post PlayList transaction DB Connection error\n: ${JSON.stringify(err)}`);
        return resApi(false,201,"db connection fail");
    }
};
