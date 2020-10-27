const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const resApi = require('../../../config/functions');

const jwt = require('jsonwebtoken');
const secret_config = require('../../../config/secret');
// const schedule = require('node-schedule');

/** POST user/subscribe
 1. subscribe API = 구독
 **/
exports.postSubscribe = async function (req,res){
    try{
        const newSubscribeStatus = req.body.subscribeStatus;
        const fromUser = req.body.fromUser;

        const connection = await pool.getConnection(async conn=>conn());
        try{
            // token header
            const jwtToken = req.headers['x-access-token'];
            // 유효한 토큰 검사
            const jwtDecode = jwt.verify(jwtToken, secret_config.jwtsecret);
            const userIdx = jwtDecode.userIdx;
            const userId = jwtDecode.userId;
            const checkTokenValidQuery = `select exists(select userIdx from user where userId = ? and userIdx = ?) as exist;`;
            const [isValidUser] = await connection.query(checkTokenValidQuery, [userId, userIdx]);

            console.log(jwtDecode)
            if (!isValidUser[0].exist) {
                connection.release();
                return res.json(resApi(false, 204, '유효하지않는 토큰입니다.'));
            }

            if (newSubscribeStatus === 1){// 구독 누름
                // exists로 subscribe 테이블에 구독 누른 fromUser가 존재하는지 확인하는 쿼리문
                const getExistSubscribeQuery =`select exists(select userIdx, fromUser, subscribeStatus from subscribe where userIdx = ? and fromUser = ?) as exist;`;
                const getExistSubscribeParams = [userIdx, fromUser];
                const [isExist] = await connection.query(getExistSubscribeQuery, getExistSubscribeParams);
                console.log(isExist[0].exist);

                // subscribe 테이블에 값이 없을 경우 (exists로 값이 있으면 true(1) 없으면 false(0) 으로 표시) 추가
                if (isExist[0].exist === 0) {
                    const insertSubscribeQuery = `insert into subscribe(userIdx, fromUser, subscribeStatus) values(?,?,1);`;
                    const insertSubscribeParams = [userIdx, fromUser];
                    const [insertSubscribeResult] = await connection.query(insertSubscribeQuery, insertSubscribeParams);

                    // 값이 insert 되기 때문에 subscirbeCount가 +1 update
                    const updateSubscribeCountQuery = `update user set subscribeCount = subscribeCount + 1 where userIdx = ?;`;
                    const [updateSubscribeResult] = await connection.query(updateSubscribeCountQuery, userIdx);

                    let responseData = {};
                    responseData = resApi(true,100, "subscribe 테이블에 추가완료");
                    responseData.result = insertSubscribeResult;
                    connection.release();
                    return res.json(responseData)
                }

                const currentSubscribeStatusQuery = `select subscribeStatus from subscribe where userIdx = ? and fromUser = ?;`;
                const currentSubscribeParams = [userIdx, fromUser];
                const [currentSubscribeStatus] = await connection.query(currentSubscribeStatusQuery, currentSubscribeParams);
                console.log(currentSubscribeStatus[0].subscribeStatus);

                // subscribe 테이블에서 가져온 currentSubscribeStatus 값이 newSubscribeStatus값과 같으면 종료
                // 왜냐하면 한 user채널은 채널 구독을 한번만 할 수 있기 때문
                if (currentSubscribeStatus[0].subscribeStatus === newSubscribeStatus) {
                    return res.json(resApi(false,200,'이미 구독 완료 / 취소'));
                }

                // currentSubscribeStatus가 2(구독취소)이면 1(구독)로 update 시킨다.
                if (currentSubscribeStatus[0].subscribeStatus === 2){
                    const updateSubscribeQuery = `update subscribe set subscribeStatus = 1 where userIdx = ?;`;
                    const [updateSubscribeStatusResult] = await connection.query(updateSubscribeQuery, userIdx);

                    //구독을 취소했던 것을 다시 구독하게 되면 subscribeCount가 +1 증가
                    const updateSubscribeCountQuery = `update user set subscribeCount = subscribeCount + 1 where userIdx = ?;`;
                    const [updateSubscribeResult] = await connection.query(updateSubscribeCountQuery, userIdx);

                    let responseData = {};
                    responseData = resApi(true,100, "2(구독취소)에서 1(구독완료) update 완료");
                    responseData.result = updateSubscribeResult;
                    connection.release();

                    return res.json(responseData);
                }
            }
            else if (newSubscribeStatus === 2){
                // 구독 취소
                const currentSubscribeStatusQuery = `select subscribeStatus from subscribe where userIdx = ? and fromUser = ?;`;
                const currentSubscribeParams = [userIdx, fromUser];
                const [currentSubscribeStatus] = await connection.query(currentSubscribeStatusQuery, currentSubscribeParams);
                console.log(currentSubscribeStatus[0].subscribeStatus);

                if (currentSubscribeStatus[0].subscribeStatus === newSubscribeStatus) {
                    return res.json(resApi(false,200,'이미 구독 완료 / 취소'));
                }

                const updateSubscribeCountQuery = `update user set subscribeCount = subscribeCount - 1 where userIdx = ?;`;
                const [updateSubscribeResult] = await connection.query(updateSubscribeCountQuery, userIdx);

                const updateSubscribeStatusQuery = `update subscribe set subscribeStatus = 2 where userIdx= ? and fromUser = ?;`;
                const updateSubscribeStatusParams = [userIdx, fromUser];
                const [updateSubscribeStatusResult] = await connection.query(updateSubscribeStatusQuery, updateSubscribeStatusParams);

                let responseData = {};
                responseData = resApi(true,100, "1(구독완료)에서 2(구독취소) update 완료");
                responseData.result = updateSubscribeStatusResult;
                connection.release();
                return res.json(responseData)
            }
        }catch (err) {
            logger.error(`example non transaction Query error\n: ${JSON.stringify(err)}`);
            connection.release();
            return resApi(false,200,"trx fail");
        }
    }catch (err){
        logger.error(`example non transaction DB Connection error\n: ${JSON.stringify(err)}`);
        return resApi(false,201,"db connection fail");
    }
};


// exports.getSubscribe = async function (req,res){
//     try{
//         const userIdx = req.params.userIdx;
//
//         // if ()){
//         //     return res.json(resApi(false,200,'유저 인덱스 값은 항상 정수 입니다.'));
//         // }
//
//         const connection = await pool.getConnection(async conn=>conn());
//         try{
//             const getExistUserIdxQuery =`select exists(select userIdx from user where userIdx = ?) as exist;`;
//             const [isExist] = await connection.query(getExistUserIdxQuery,userIdx);
//             console.log(isExist);
//
//             if(!isExist[0].exist){
//                 return res.json(resApi(false,200,'존재하지 않는 user 입니다.'));
//             }
//
//             const getSubscribeQuery =
//                 `select channelName 채널이름, concat('구독자 ', subscribeCount, ' 명') as "구독자 수"
//                     from user
//                     where userIdx = ?;
//                 `;
//
//             const [getSubscribeResult] = await connection.query(getSubscribeQuery,userIdx);
//             console.log(getSubscribeResult[0].채널이름);
//
//             let responseData = resApi(true,100,'user당 구독자 수 GET 성공')
//             responseData.result = getSubscribeResult;
//
//             return res.json(responseData);
//         }catch (err) {
//             logger.error(`example non transaction Query error\n: ${JSON.stringify(err)}`);
//             connection.release();
//             return resApi(false,200,"trx fail");
//         }
//     }catch (err){
//         logger.error(`example non transaction DB Connection error\n: ${JSON.stringify(err)}`);
//         return resApi(false,201,"db connection fail");
//     }
// };


/** GET /user/subscribe/:subscribe
 1. 채널에 구독한 구독자 수
 2. 구독자 수는 로그인 하지 않아도 볼 수 있음 따라서 token 필요여부 x
 **/
exports.getSubscribe = async function (req,res){
    try{
        const userIdx = req.params.userIdx;

        const connection = await pool.getConnection(async conn=>conn());
        try{
            const getExistUserIdxQuery =`select exists(select userIdx from user where userIdx = ?) as exist;`;
            const [isExist] = await connection.query(getExistUserIdxQuery,userIdx);
            console.log(isExist[0].exist);

            if(!isExist[0].exist){
                return res.json(resApi(false,200,'존재하지 않는 user 입니다.'));
            }

            const getSubscribeQuery =
                `select channelName 채널이름, concat('구독자 ', subscribeCount, ' 명') as 구독자수
                    from user
                    where userIdx = ?;
                `;

            const [getSubscribeResult] = await connection.query(getSubscribeQuery,userIdx);

            let responseData = {};
            responseData = resApi(true, 100, "구독자수 api 성공");
            responseData.result = getSubscribeResult;
            connection.release();
            return res.json(responseData);
        }catch (err) {
            logger.error(`example non transaction Query error\n: ${JSON.stringify(err)}`);
            connection.release();
            return resApi(false,200,"trx fail");
        }
    }catch (err){
        logger.error(`example non transaction DB Connection error\n: ${JSON.stringify(err)}`);
        return resApi(false,201,"db connection fail");
    }
};






