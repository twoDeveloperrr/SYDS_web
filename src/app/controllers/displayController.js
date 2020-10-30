const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const resApi = require('../../../config/functions');

const jwt = require('jsonwebtoken');
const secret_config = require('../../../config/secret');

// GET /display
exports.getDisplayList = async function (req, res) {
    try {
        const connection = await pool.getConnection(async conn => conn);
        try {
            const getYoutubeQuery = `
                    select U.channelName 채널이름, D.dpName, D.dpUrl, D.imgUrl, D.time, P.profileUrl,
                    case
                        when timestampdiff(minute, D.createdAt, current_timestamp())<1
                    then '방금'
                        when timestampdiff(minute, D.createdAt, current_timestamp())<60
                    then concat(timestampdiff(minute, D.createdAt, current_timestamp()), '분 전')
                        when timestampdiff(minute, D.createdAt, current_timestamp()) between 60 and 1440
                    then concat(timestampdiff(minute, D.createdAt, current_timestamp()), '시간 전')
                        else date_format(D.createdAt, '%c월 %e일')
                    end 업로드날짜
                    from user U
                    left join display D
                    on U.userIdx = D.userIdx
                    left join profile P
                    on U.userIdx = P.userIdx
                    `;

            const [youtubeDataRows] = await connection.query(getYoutubeQuery);

            console.log(youtubeDataRows[0].채널이름)

            // Token 생성
            let token = await jwt.sign({
                channelName : youtubeDataRows[0].채널이름,
            }, // Token의 내용
            secret_config.jwtsecret,
                {
                    expiresIn : '365d',
                    subject : 'userInfo',
                } // 유효시간 365일
             );

            let responseData = {};
            responseData.JWT = token;
            connection.release();
            return res.json(responseData);

            // let resposeData = resApi(true,100, "api 성공");
            // resposeData.result = youtubeDataRows;
            //
            // connection.release();
            // return res.json(resposeData);
        } catch (err) {
            logger.error(`example non transaction Query error\n: ${JSON.stringify(err)}`);
            connection.release();
            return resApi(false,200,"trx fail");
        }
    } catch (err) {
        logger.error(`example non transaction DB Connection error\n: ${JSON.stringify(err)}`);
        return resApi(false,201,"db connection fail");
    }

};

// GET /diplay/:displayIdx
exports.getDisplay = async function (req,res){
    try{
        const displayIdx = req.params.displayIdx;
        // const jwtoken = req.headers['x-access-token'];

        // if ()){
        //     return res.json(resApi(false,200,'유저 인덱스 값은 항상 정수 입니다.'));
        // }

        const connection = await pool.getConnection(async conn=>conn());
        try{
            const getExistUserIdxQuery =`select exists(select displayIdx from display where displayIdx = ?) as exist;`;
            const [isExist] = await connection.query(getExistUserIdxQuery,displayIdx);
            console.log(isExist);
            console.log("두수");

            if(!isExist[0].exist){
                return res.json(resApi(false,200,'존재하지 않는 인덱스 입니다.'));
            }


            const getYoutubeQuery =
                    `
                    select U.channelName, D.dpName, D.dpUrl, D.imgUrl, D.time, P.profileUrl, C.description,
                    case
                        when timestampdiff(minute, D.createdAt, current_timestamp())<1
                    then '방금'
                        when timestampdiff(minute, D.createdAt, current_timestamp())<60
                    then concat(timestampdiff(minute, D.createdAt, current_timestamp()), '분 전')
                        when timestampdiff(minute, D.createdAt, current_timestamp()) between 60 and 1440
                    then concat(timestampdiff(minute, D.createdAt, current_timestamp()), '시간 전')
                        else date_format(D.createdAt, '%c월 %e일')
                    end 업로드날짜 
                    from user U
                    left join display D
                    on U.userIdx = D.userIdx
                    left join profile P
                    on U.userIdx = P.userIdx
                    left join comment C
                    on U.userIdx = C.userIdx
                    where D.displayIdx = ?;
                    `;

            const [getDisplay] = await connection.query(getYoutubeQuery,displayIdx);

            let responseData = resApi(true,100,'api 성공')
            responseData.result = getDisplay;


            return res.json(responseData);
        }catch (err) {
            logger.error(`example non transaction Query error\n: ${JSON.stringify(err)}`);
            connection.release();
            return res.json(resApi(false,200,"trx fail"));
        }
    }catch (err){
        logger.error(`example non transaction DB Connection error\n: ${JSON.stringify(err)}`);
        return resApi(false,201,"db connection fail");
    }
};

// 영상에 대한 조회
// exports.postDisplayClick = async function (req,res){
//     try{
//         //변수 선언
//         let userIdx = req.body.userIdx;
//         let dpIdx = req.body.displayIdx;
//
//         const connection = await pool.getConnection(async conn=>conn());
//         try{
//             // record DB 'insert' 대입
//             const insertDisplayClickQuery = `insert into click(userIdx, displayIdx) values (?, ?);`;
//
//             // insertRecordParams 안에 userIdx, dpIdx 값 대입
//             const insertClickParams = [userIdx, dpIdx];
//             const [insertResult] = await connection.query(insertDisplayClickQuery,insertClickParams);
//
//             //responseData 안에 resApi 객체 함수 대입
//             let responseData = {};
//             responseData = resApi(true,100, "api 성공");
//             // 결과 화면
//             responseData.result = insertResult
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