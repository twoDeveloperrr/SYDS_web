const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const resApi = require('../../../config/functions');

const jwt = require('jsonwebtoken');
const secret_config = require('../../../config/secret');

/** POST display/:displayIdx/like
 1. displayLikeStatus API = 영상에 대한 좋아요/싫어요
 2. 좋아요를 누르기 위해선 로그인이 필요하므로 token 필요 o
 **/
exports.postLikeStatus = async function (req,res){
    try{
        const newLikeStatus = req.body.likeStatus;
        const displayIdx = req.params.displayIdx;

        const connection = await pool.getConnection(async conn=>conn());
        try{
            const jwtToken = req.headers['x-access-token'];
            // 유효한 토큰 검사
            let jwtDecode = jwt.verify(jwtToken, secret_config.jwtsecret);
            const userIdx = jwtDecode.userIdx;
            const userId = jwtDecode.userId;
            const checkTokenValidQuery = `select exists(select userIdx from user where userId = ? and userIdx = ?) as exist;`;
            const [isValidUser] = await connection.query(checkTokenValidQuery, [userId, userIdx]);

            console.log(!isValidUser[0].exist);
            console.log(jwtDecode)
            if (!isValidUser[0].exist) {
                connection.release();
                return res.json(resApi(false, 204, '유효하지않는 토큰입니다.'));
            }

            if (newLikeStatus === 1){
                //좋아요 누름
                const getExistLikesQuery = `select exists(select userIdx, displayIdx, likeStatus from likes where userIdx = ? and displayIdx = ?) as exist;`;
                const getExistLikesParams = [userIdx, displayIdx];
                const [isExist] = await connection.query(getExistLikesQuery, getExistLikesParams);
                console.log('Sign in as ' + isExist[0].exist);

                if (isExist[0].exist === 0){
                    //insert like 히스토리
                    const insertLikesQuery = `insert into likes(userIdx, displayIdx, likeStatus) values(?, ?, 1);`;
                    const insertLikesParams = [userIdx, displayIdx];
                    const [insertLikesResult] = await connection.query(insertLikesQuery, insertLikesParams);

                    //update display likesCount +1
                    const updateLikesCountQuery = `update display set likesCount = likesCount + 1 where displayIdx = ?;`;
                    const [updateLikesResult] = await connection.query(updateLikesCountQuery, displayIdx);

                    let responseData = {};
                    responseData = resApi(true,100, "likes 테이블 추가완료");
                    responseData.result = updateLikesResult;
                    connection.release();
                    return res.json(responseData)
                }

                // 한명의 user는 하나의 display에 좋아요를 한번만 누를 수 있다.
                const currentLikeStatusQuery = `select likeStatus from likes where userIdx =? and displayIdx = ?;`;
                const currentLikeStatusParams = [userIdx, displayIdx];
                const [currentLikeStatus] = await connection.query(currentLikeStatusQuery, currentLikeStatusParams);
                console.log(currentLikeStatus[0].likeStatus);

                if(currentLikeStatus[0].likeStatus === newLikeStatus) {
                    connection.release();
                    return res.json(resApi(false,200,'이미 좋아요 누름'));
                }

                if (currentLikeStatus[0].likeStatus === 2){
                    // 2(싫어요) 일때 1(좋아요)를 누르면 likeStatus 상태를 1(좋아요)로 update
                    const updateLikeStatusQuery = `update likes set likeStatus = 1 where displayIdx = ?;`;
                    const [updateLikeStatusResult] = await connection.query(updateLikeStatusQuery, displayIdx);

                    // display의 likesCount를 +1 시킴
                    const updateLikesCountQuery = `update display set likesCount = likesCount + 1 where displayIdx = ?;`;
                    const [updateLikesCountResult] = await connection.query(updateLikesCountQuery, displayIdx);

                    // display의 dislikesCount를 -1 시킴
                    const updateDislikesCountQuery = `update display set dislikesCount = dislikesCount - 1 where displayIdx = ?;`;
                    const [updateDislikesCountResult] = await connection.query(updateDislikesCountQuery, displayIdx);

                    let responseData = {};
                    responseData = resApi(true,100, "2(구독취소)에서 1(구독완료) update 완료");
                    responseData.result = updateDislikesCountResult;
                    connection.release();
                    return res.json(responseData)
                }
            }
            else if (newLikeStatus === 2){
                //싫어요를 먼저 누른 경우
                const getExistDislikesQuery = `select exists(select userIdx, displayIdx from likes where userIdx = ? and displayIdx = ?) as exist;`;
                const getExistDislikesParams = [userIdx, displayIdx];
                const [dislikesExist] = await connection.query(getExistDislikesQuery, getExistDislikesParams);
                console.log(dislikesExist[0].exist);

                if(dislikesExist[0].exist === 0){
                    // insert like 히스토리
                    const insertDislikesQuery = `insert into likes(userIdx, displayIdx, likeStatus) values(?, ?, 2);`;
                    const insertDislikesParams = [userIdx, displayIdx];
                    const [insertDislikesResult] = await connection.query(insertDislikesQuery, insertDislikesParams);

                    const updateDislikesCountQuery = `update display set dislikesCount = dislikesCount +1 where displayIdx = ?;`;
                    const [updateDislikesResult] = await connection.query(updateDislikesCountQuery, displayIdx);

                    let responseData = {};
                    responseData = resApi(true,100, "likes 테이블에 싫어요 추가");
                    responseData.result = updateDislikesResult;
                    connection.release();
                    return res.json(responseData);
                }

                // 한명의 user는 하나의 display에 싫어요를 한번만 누를 수 있다.
                const currentDislikeStatusQuery = `select likeStatus from likes where userIdx =? and displayIdx = ?;`;
                const currentDislikeStatusParams = [userIdx, displayIdx];
                const [currentDislikeStatus] = await connection.query(currentDislikeStatusQuery, currentDislikeStatusParams);
                console.log(currentDislikeStatus[0].likeStatus);

                // 이미 싫어요를 누른 상태
                if(currentDislikeStatus[0].likeStatus === newLikeStatus) {
                    connection.release();
                    return res.json(resApi(false,200,'이미 싫어요를 누름'));
                }

                if (currentDislikeStatus[0].likeStatus === 1){
                    // 2(싫어요) 일때 1(좋아요)를 누르면 likeStatus 상태를 1(좋아요)로 update
                    const updateDislikeStatusQuery = `update likes set likeStatus = 2 where userIdx = ? and displayIdx = ?;`;
                    const updateDislikeStatusParams = [userIdx, displayIdx];
                    const [updateDislikesResult] = await connection.query(updateDislikeStatusQuery, updateDislikeStatusParams);

                    // display의 likesCount를 -1 시킴
                    const updateDislikesCountQuery = `update display set likesCount = likesCount - 1 where displayIdx = ?;`;
                    const [updateDislikesCountResult] = await connection.query(updateDislikesCountQuery, displayIdx);

                    // display의 dislikesCount를 +1 시킴
                    const updateLikesCountQuery = `update display set dislikesCount = dislikesCount + 1 where displayIdx = ?;`;
                    const [updateLikesCountResult] = await connection.query(updateLikesCountQuery, displayIdx);

                    let responseData = {};
                    responseData = resApi(true,100, "1(구독완료)에서 2(구독취소) update 완료");
                    responseData.result = updateLikesCountResult;
                    connection.release();
                    return res.json(responseData)
                }
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



// GET display/likes/:displayIdx
// select concat 값이 뜨지 않는다.
exports.getLike = async function (req,res){
    try{
        const displayIdx = req.params.displayIdx;

        const connection = await pool.getConnection(async conn=>conn());
        try{
            const getExistDisplayIdxQuery =`select exists(select displayIdx from display where displayIdx = ?) as exist;`;
            const [isExist] = await connection.query(getExistDisplayIdxQuery, displayIdx);
            console.log(isExist[0].exist);
            if(!isExist[0].exist){
                return res.json(resApi(false,200,'존재하지 않는 인덱스 입니다.'));
            }

            const getLikesQuery = `
                                select D.dpName as '동영상 제목',
                                    case
                                        when D.likesCount<1000
                                    then concat(D.likesCount, ' ')
                                        when D.likesCount between 1000 and 10000
                                    then concat(D.likesCount, ' 천')
                                        when D.likesCount>10000
                                    then concat(D.likesCount, ' 만')
                                end as likeStatus
                                from likes L
                                left join display D
                                on L.displayIdx = D.displayIdx
                                where L.displayIdx = ? and likeStatus = 1;
                                `;

            const [getLikes] = await connection.query(getLikesQuery,displayIdx);
            let responseData = resApi(true,100,'api 성공')
            responseData.result = getLikes;
            console.log(getLikes[0])
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

// GET display/dislikes/:displayIdx
// select concat 값이 뜨지 않는다.
//"type" : "buffer" 뜸
exports.getDisLike = async function (req,res){
    try{
        const displayIdx = req.params.displayIdx;

        const connection = await pool.getConnection(async conn=>conn());
        try{
            const getExistDisplayIdxQuery =`select exists(select displayIdx from display where displayIdx = ?) as exist;`;
            const [isExist] = await connection.query(getExistDisplayIdxQuery, displayIdx);

            console.log(isExist[0]);

            if(!isExist[0].exist){
                return res.json(resApi(false,200,'존재하지 않는 인덱스 입니다.'));
            }

            const getDisLikesQuery = `
                                select D.dpName '동영상 제목',
                                    case
                                        when count(*)<1000
                                    then concat(count(*), ' ')
                                        when count(*) between 1000 and 10000
                                    then concat(count(*), ' 천')
                                        when count(*)>10000
                                    then concat(count(*), ' 만')
                                end '싫어요'
                                from dislikes L
                                left join display D
                                on L.displayIdx = D.displayIdx
                                where L.displayIdx = ? and dislikeStatus = 1;
                                `;

            const [getDisLikes] = await connection.query(getDisLikesQuery,displayIdx);

            let responseData = resApi(true,100,'api 성공')
            responseData.result = getDisLikes;

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