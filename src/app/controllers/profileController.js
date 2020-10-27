const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const resApi = require('../../../config/functions');

/** GET user/profile/:profileIdx
 1. profile API = 프로필
 2. 프로필은 누구나 열람가능 따라서 token 필요여부 x
  **/
exports.getProfile = async function (req,res){
    try{
        const profileIdx = req.params.profileIdx;

        const connection = await pool.getConnection(async conn=>conn());
        try{
            // 예외처리
            const getExistUserIdxQuery =`select exists(select profileIdx from profile where profileIdx = ?) as exist;`;
            const [isExist] = await connection.query(getExistUserIdxQuery,profileIdx);
            console.log('profileIdx가  존재하지 않을 경우 ' + isExist[0].exist);
            if(!isExist[0].exist){
                return res.json(resApi(false,200,'존재하지 않는 인덱스 입니다.'));
            }

            const getYoutubeQuery =
                `
                select U.channelName '채널이름' ,P.profileUrl '프로필'
                from profile P
                left join user U
                on P.userIdx=U.userIdx
                where P.userIdx = ?;
                `;

            const [getYoutubeResult] = await connection.query(getYoutubeQuery, profileIdx);

            let responseData = {};
            responseData = resApi(true,100,'api 성공');
            responseData.result = getYoutubeResult;
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

