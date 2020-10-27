const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const resApi = require('../../../config/functions');

const jwt = require('jsonwebtoken');
const secret_config = require('../../../config/secret');

/** POST display/:displayIdx/comment
 1. comment API = 댓글 추가
 2. 댓글을 쓰기 위해선 로그인이 필요함 따라서 token 필요여부 o **/
exports.postComment = async function (req,res){
    try{
        const displayIdx = req.params.displayIdx;
        const description = req.body.description;

        const connection = await pool.getConnection(async conn=>conn());
        try{
            const jwtToken = req.headers['x-access-token'];
            // 유효한 토큰 검사
            let jwtDecode = jwt.verify(jwtToken, secret_config.jwtsecret);
            const userIdx = jwtDecode.userIdx;
            const userId = jwtDecode.userId;
            const checkTokenValidQuery = `select exists(select userIdx from user where userId = ? and userIdx = ?) as exist;`;
            const [isValidUser] = await connection.query(checkTokenValidQuery, [userId, userIdx]);
            console.log(jwtDecode)
            if (!isValidUser[0].exist) {
                connection.release();
                return res.json(resApi(false, 204, '유효하지않는 토큰입니다.'));
            }

            const insertDisplayClickQuery = `insert into comment(userIdx, displayIdx, description) values (?, ?, ?);`;
            const insertCommentParams = [userIdx, displayIdx, description];
            const [insertResult] = await connection.query(insertDisplayClickQuery,insertCommentParams);

            //responseData 안에 resApi 객체 함수 대입
            let responseData = {};
            responseData = resApi(true,100, "댓글 추가 완료");
            responseData.result = insertResult
            connection.release();
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

/** POST /display/:displayIdx/comment/:commentIdx/like
 1. commentLike API = 영상에 달린 댓글 좋아요 **/
exports.postCommentLike = async function (req, res) {
    try {
        const newCommentLikeStatus = req.body.commentLikeStatus;
        const userIdx = req.body.userIdx;
        const displayIdx = req.params.displayIdx;
        const commentIdx = req.params.commentIdx;

        const connection = await pool.getConnection(async conn => conn);
        try {
            const jwtToken = req.headers['x-access-token'];
            // 유효한 토큰 검사
            let jwtDecode = jwt.verify(jwtToken, secret_config.jwtsecret);
            const userIdx = jwtDecode.userIdx;
            const userId = jwtDecode.userId;
            const checkTokenValidQuery = `select exists(select userIdx from user where userId = ? and userIdx = ?) as exist;`;
            const [isValidUser] = await connection.query(checkTokenValidQuery, [userId, userIdx]);
            console.log(jwtDecode)
            if (!isValidUser[0].exist) {
                connection.release();
                return res.json(resApi(false, 204, '유효하지않는 토큰입니다.'));
            }

            if(newCommentLikeStatus === 1) {
                const getExistCommentQuery = `select exists(select userIdx, displayIdx, commentIdx from commentLike where userIdx = ? and displayIdx = ? and commentIdx = ?) as exist; `;
                const getExistCommentParams = [userIdx, displayIdx, commentIdx];
                const [isExist] = await connection.query(getExistCommentQuery, getExistCommentParams);
                console.log(isExist[0].exist);

                if (isExist[0].exist === 0) {
                    const insertCommentLikeQuery = `insert into commentLike(userIdx, displayIdx, commentIdx, commentLikeStatus) values (?,?,?,1);`;
                    const insertCommentLikeParams = [userIdx, displayIdx, commentIdx];
                    const [insertCommentLikeResult] = await connection.query(insertCommentLikeQuery, insertCommentLikeParams);

                    const updateCommentLikeQuery = `update comment set commentLikeCount = commentLikeCount + 1 where commentIdx = ?;`;
                    const [updateCommentLikeResult] = await connection.query(updateCommentLikeQuery, commentIdx);

                    let responseData = {};
                    responseData = resApi(true,100, "commentLike 테이블 추가완료");
                    responseData.result = updateCommentLikeResult;
                    connection.release();
                    return res.json(responseData)
                }


                const currentCommentLikeQuery = `select commentLikeStatus from commentLike where userIdx =? and displayIdx =? and commentIdx =?`
                const currentCommentLikeParams = [userIdx, displayIdx, commentIdx];
                const [currentCommentLikeResult] = await connection.query(currentCommentLikeQuery, currentCommentLikeParams);
                console.log(currentCommentLikeResult[0].commentLikeStatus);

                if (currentCommentLikeResult[0].commentLikeStatus === 1) {
                    connection.release();
                    return res.json(resApi(false, 200, "이미 좋아요 누름"));
                }
            }
            else if (newCommentLikeStatus === 2) {
                const currentCommentLikeQuery = `select commentLikeStatus from commentLike where userIdx =? and displayIdx =? and commentIdx =?;`;
                const currentCommentLikeParams = [userIdx, displayIdx, commentIdx];
                const [currentCommentLikeResult] = await connection.query(currentCommentLikeQuery, currentCommentLikeParams);
                console.log(currentCommentLikeResult[0].commentLikeStatus);

                if(currentCommentLikeResult[0].commentLikeStatus === 2) {
                    return res.json(resApi(false, 200, "이미 좋아요 취소 누름"));
                }
                const updateCommentLikeQuery = `update comment set commentLikeCount = commentLikeCount - 1  where commentIdx = ?;`;
                const [updateCommentLikeResult] = await connection.query(updateCommentLikeQuery, commentIdx);

                const updateCommentLikeStatus = `update commentLike set commentLikeStatus = 2 where userIdx =? and displayIdx =? and commentIdx =?;`;
                const updateCommentLikeStatusParams = [userIdx, displayIdx, commentIdx];
                const [updateCommentLikeStatusResult] = await connection.query(updateCommentLikeStatus, updateCommentLikeStatusParams);

                let responseData = {};
                responseData = resApi(true,100, "commentLike 좋아요 취소 완료");
                responseData.result = updateCommentLikeResult;
                connection.release();
                return res.json(responseData)
            }
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







// POST display/comment/commentSub
exports.postCommentSub = async function (req,res){
    try{
        let commentIdx = req.body.commentIdx;
        let userIdx = req.body.userIdx;
        let description = req.body.description;

        const connection = await pool.getConnection(async conn=>conn());
        try{
            const insertDisplayClickQuery = `insert into commentSub(commentIdx, userIdx, displayIdx, description) values (?, ?,?, ?);`;

            const insertCommentSubParams = [commentIdx, userIdx, description];
            const [insertResult] = await connection.query(insertDisplayClickQuery,insertCommentSubParams);

            let responseData = {};
            responseData = resApi(true,100, "api 성공");
            responseData.result = insertResult

            connection.release();

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


// GET display/comment/:displayIdx
exports.getComment = async function (req,res){
    try{
        const displayIdx = req.params.displayIdx;
        const connection = await pool.getConnection(async conn=>conn());
        try{
            const getExistUserIdxQuery =`select exists(select displayIdx from display where displayIdx = ?) as exist;`;
            const [isExist] = await connection.query(getExistUserIdxQuery,displayIdx);
            console.log(isExist);
            if(!isExist[0].exist){
                return res.json(resApi(false,200,'존재하지 않는 인덱스 입니다.'));
            }

            const getCommentQuery =
                `select D.dpUrl 동영상, U.channelName 댓글단채널이름, C.description 댓글,
                    case
                        when timestampdiff(minute, C.createdAt, current_timestamp())<1
                    then '방금'
                        when timestampdiff(minute, C.createdAt, current_timestamp())<60
                    then concat(timestampdiff(minute, C.createdAt, current_timestamp()), '분 전')
                        when timestampdiff(minute, C.createdAt, current_timestamp()) between 60 and 1440
                    then concat(timestampdiff(minute, C.createdAt, current_timestamp()), '시간 전')
                        else date_format(C.createdAt, '%c월 %e일')
                    end 댓글업로드날짜
                from comment C
                left join display D
                on C.displayIdx = D.displayIdx
                left join user U
                on U.userIdx = C.userIdx
                where C.displayIdx = ?;
                `;

            const [getComment] = await connection.query(getCommentQuery,displayIdx);
            let responseData = resApi(true,100,'api 성공')
            responseData.result = getComment;
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


// GET display/comment/commentSub/:commentSubIdx
exports.getCommentSub = async function (req,res){
    try{
        const commentSubIdx = req.params.commentSubIdx;

        // if ()){
        //     return res.json(resApi(false,200,'유저 인덱스 값은 항상 정수 입니다.'));
        // }

        const connection = await pool.getConnection(async conn=>conn());
        try{
            const getExistUserIdxQuery =`select exists(select commentSubIdx from commentSub where commentSubIdx = ?) as exist;`;
            const [isExist] = await connection.query(getExistUserIdxQuery,commentSubIdx);
            console.log(isExist);

            if(!isExist[0].exist){
                return res.json(resApi(false,200,'존재하지 않는 인덱스 입니다.'));
            }

            const getYoutubeQuery =
                `select U.channelName 대댓글단채널이름, C.description 댓글, CS.description 대댓글,
                    case
                        when timestampdiff(minute, CS.createdAt, current_timestamp())<1
                    then '방금'
                        when timestampdiff(minute, CS.createdAt, current_timestamp())<60
                    then concat(timestampdiff(minute, CS.createdAt, current_timestamp()), '분 전')
                        when timestampdiff(minute, CS.createdAt, current_timestamp()) between 60 and 1440
                    then concat(timestampdiff(minute, CS.createdAt, current_timestamp()), '시간 전')
                        else date_format(CS.createdAt, '%c월 %e일')
                    end 대댓글업로드날짜
                    from commentSub CS
                    left join comment C
                    on CS.commentIdx = C.commentIdx
                    left join user U
                    on CS.userIdx = U.userIdx
                    where commentSubIdx = ?;
                `;

            const [getComment] = await connection.query(getYoutubeQuery,commentSubIdx);
            let responseData = resApi(true,100,'api 성공')
            responseData.result = getComment;
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

// DELETE display/comment
// 문제점 : 삭제를 할 때 user가 하나의 display에 여러 댓글을 달면 아래 조건문으로 동작할 시 다 삭제됨.
exports.deleteComment = async function (req,res){
    try{
        let userIdx = req.body.userIdx;
        let displayIdx = req.body.displayIdx;

        const connection = await pool.getConnection(async conn=>conn());
        try{
            const deleteCommentQuery = `delete from comment where userIdx=? and displayIdx=?;`;
            const deleteCommentParams = [userIdx, displayIdx];
            const [deleteResult] = await connection.query(deleteCommentQuery,deleteCommentParams);

            let responseData = {};
            responseData = resApi(true,100, "api 성공");
            responseData.result = deleteResult;

            connection.release();

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


// exports.getChannel = async function (req,res){
//
//     try{
//         const connection = await pool.getConnection(async conn=>conn());
//         try{
//
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