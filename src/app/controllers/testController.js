const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const resApi = require('../../../config/functions');

exports.practice = async function (req, res) {
    try {
        const connection = await pool.getConnection(async conn => conn);
        try {
            const [rows] = await connection.query(
                `
                select D.dpName as '동영상이름'
                , case
                    when timestampdiff(minute, D.createdAt, current_timestamp())<1
                    then '방금'
                    when timestampdiff(minute, D.createdAt, current_timestamp())<60
                    then concat(timestampdiff(minute, D.createdAt, current_timestamp()), '분 전')
                    when timestampdiff(minute, D.createdAt, current_timestamp()) between 60 and 1440
                    then concat(timestampdiff(minute, D.createdAt, current_timestamp()), '시간 전')
                    else date_format(D.createdAt, '%c월 %e일')
                    end 업로드날짜
                from display D;
                `
            );
            connection.release();
            return res.json(rows);


        } catch (err) {
            logger.error(`example non transaction Query error\n: ${JSON.stringify(err)}`);
            connection.release();
            return false;
        }
    } catch (err) {
        logger.error(`example non transaction DB Connection error\n: ${JSON.stringify(err)}`);
        return false;
    }

};

exports.getChannel = async function (req,res){
    try{
        const userIdx = req.params.userIdx;

        // if ()){
        //     return res.json(resApi(false,200,'유저 인덱스 값은 항상 정수 입니다.'));
        // }

        const connection = await pool.getConnection(async conn=>conn());
        try{
            const getExistUserIdxQuery =`select exists(select userIdx from user where userIdx = ?) as exist;`;

            const [isExist] = await connection.query(getExistUserIdxQuery,userIdx);

            console.log(isExist);

            if(!isExist[0].exist){
                return res.json(resApi(false,200,'존재하지 않는 인덱스 입니다.'));
            }

            const getYoutubeQuery = `
                SELECT channelName
                FROM user
                where userIdx = ?;
                `;

            const [getChannel] = await connection.query(getYoutubeQuery,userIdx);

            let responseData = resApi(true,100,'api 성공')
            responseData.result = getChannel;


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

exports.getChannelList = async function (req, res) {
    try {
        const connection = await pool.getConnection(async conn => conn);
        try {

            const getYoutubeQuery = `
                SELECT channelName
                FROM user;
                `;

            const [youtubeDataRows] = await connection.query(getYoutubeQuery);


            let resposeData = resApi(true,100, "api 성공");
            resposeDatresult = youtubeDataRows;

            connection.release();
            return res.json(resposeData);
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


exports.postPlayList = async function (req,res){
    try{
        //변수 선언
        let userIdx = req.body.userIdx
        let dpIdx = req.body.dpIdx

        const connection = await pool.getConnection(async conn=>conn());
        try{
            // record DB 'insert' 대입
            const insertPlayListQuery = `insert into record(userIdx, dpIdx) values (?, ?);`;

            // insertRecordParams 안에 userIdx, dpIdx 값 대입
            const insertRecordParams = [userIdx, dpIdx];
            const [inserResult] = await connection.query(insertPlayListQuery,insertRecordParams);

            //responseData 안에 resApi 객체 함수 대
            let responseData = {};
            responseData = resApi(true,100, "api 성공");
            // 결과 화면
            responseData.result = inserResult

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

// 좋아요/싫어요
// exports.postLikeStatus = async function (req,res){
//     try{
//         const likeStatus = req.body.likeStatus;
//         let userIdx = req.body.userIdx;
//         let displayIdx = req.body.displayIdx;
//
//         const connection = await pool.getConnection(async conn=>conn());
//         try{
//
//
//             if (likeStatus === 1){//좋아요 누름
//                 //insert like 히스토리
//                 const insertLikesHistoryQuery = `insert ignore into likesHistroy(userIdx, displayIdx) values(?, ?);`;
//                 const insertLikesHistoryParams = [userIdx, displayIdx];
//                 const [insertLikesHistory] = await connection.query(insertLikesHistoryQuery, insertLikesHistoryParams);
//
//                 //update display listCount +1요
//                 const updateLikesCountQuery = `update display set likesCount = likesCount +1 where displayIdx = ?;`;
//                 const [updateLikesCountResult] = await connection.query(updateLikesCountQuery, displayIdx);
//
//                 let responseData = {};
//                 responseData = resApi(true,100, "api 성공");
//                 responseData.result = updateLikesCountResult;
//                 connection.release();
//                 return res.json(responseData);
//             }
//             else if (likeStatus ===2){//안좋아
//                 //update like 히스토리 1->2
//                 const updateLikesHistoryQuery = `update likesHistory set likeStatus = 2 where displayIdx = ?;`;
//                 const [updateLikesHistoryResult] = await connection.query(updateLikesHistoryQuery, displayIdx);
//
//                 //update display likeCount -1요
//                 const updateDisLikesCountQuery = `update display set dislikesCount = dislikesCount +1 where displayIdx =?;`;
//                 const [updateDisLikesCountResult] = await connection.query(updateDisLikesCountQuery, displayIdx);
//
//                 let responseData = {};
//                 responseData = resApi(true,100, "api 성공");
//                 responseData.result = updateDisLikesCountResult;
//                 connection.release();
//                 return res.json(responseData);
//             }
//             // else if (likeStatus === 0 ){
//             //     //update like 히스토리 2->0
//             //     const updateLikesHistoryQuery = `update likesHistory set likestatus = 0 where displayIdx = ?;`;
//             //     const [updateLikesHistoryResult] = await connection.query(updateLikesHistoryQuery, displayIdx);
//             //
//             //     //update display dislikeCount -1요
//             //     const update
//             // }
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


 exports.postLikeStatus = async function (req,res){
    try{
        const likeStatus = req.body.likeStatus;
        let userIdx = req.body.userIdx;
        let displayIdx = req.body.displayIdx;

        const connection = await pool.getConnection(async conn=>conn());
        try{

            if (likeStatus === 1){//좋아요 누름
                //insert like 히스토리
                const insertLikesQuery = `insert into likes(userIdx, displayIdx) values(?, ?)`
                const insertLikesParams = [userIdx, displayIdx];
                const [insertLikesResult] = await connection.query(insertLikesQuery, insertLikesParams);

                //update display likesCount +1
                const updateLikesQuery = `update display set likesCount = likesCount + 1 where displayIdx = ?`
                const [updateLikesResult] = await connection.query(updateLikesQuery, displayIdx);

                let responseData = {};
                responseData = resApi(true,100, "api 성공");
                responseData.result = updateLikesResult;

                connection.release();

                return res.json(responseData)

            }
            else if (likeStatus ===2){//안좋아
                //insert dislikes 히스토리
                const insertDisLikesQuery = `insert into dislikes(userIdx, displayIdx) values(?, ?)`
                const insertDisLikesParams = [userIdx, displayIdx];
                const [insertResult] = await connection.query(insertDisLikesQuery, insertDisLikesParams);

                const updateDisLikesQuery = `update display set dislikesCount = dislikesCount + 1 where displayIdx = ?`
                const [updateDisLikesResult] = await connection.query(updateDisLikesQuery, displayIdx);


                //update display dislikesCount -1
                const updateLikesQuery = `update display set likesCount = likesCount - 1 where displayIdx = ?`
                const [updateLikesResult] = await connection.query(updateLikesQuery, displayIdx);

                let responseData = {};
                responseData = resApi(true,100, "api 성공");
                responseData.result = updateLikesResult;

                connection.release();

                return res.json(responseData)
                //update display dislikeCount +1요
            }
            else if (likeStatus === 0 ){
                //좋아요/안좋아요가 눌러져 있는 것을 취소할 때

                // 1) update likesCount -1
                const updateLikesQuery = `update display set likesCount = likesCount - 1 where displayIdx = ?`
                const [updateLikesResult] = await connection.query(updateLikesQuery, displayIdx);

                let responseData = {};
                responseData = resApi(true,100, "api 성공");
                responseData.result = updateLikesResult;

                connection.release();

                return res.json(responseData)

                //update like 히스토리 2->0

                //update display dislikeCount -1요
            }
            else if (likeStatus === 3) {

                // 2) update dislikesCount -1
                const updateDisLikesQuery = `update display set dislikesCount = disLikesCount - 1 where displayIdx = ?`
                const [updateDisLikesResult] = await connection.query(updateDisLikesQuery, displayIdx);

                let responseData = {};
                responseData = resApi(true,100, "api 성공");
                responseData.result = updateDisLikesResult;

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


// exports.getChannel = async function (req,res){
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

// // 좋아요/안좋아요 api
// exports.postLikeStatus = async function (req,res){
//     try{
//         const likeStatus = req.body.likeStatus;
//         let userIdx = req.body.userIdx;
//         let displayIdx = req.body.displayIdx;
//
//         const connection = await pool.getConnection(async conn=>conn());
//         try{
//
//
//             if (likeStatus === 1){//좋아요 누름
//                 //insert like 히스토리
//                 const
//                 //update display listCount +1요
//
//
//             }
//             else if (likeStatus ===2 ){//안좋아
//                 //update like 히스토리 1->2
//
//                 //update display likeCount -1요
//                 //update display dislikeCount +1요
//             }
//             // else if (likeStatus === 0 ){
//             //     //update like 히스토리 2->0
//             //
//             //     //update display dislikeCount -1요
//             // }
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