const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const resApi = require('../../../config/functions');

// jwt
// const jwt = require('jsonwebtoken');
// const secret_config = require('../../../config/secret');
const jwt = require('jsonwebtoken');
const regexEmail = require('regex-email');
const crypto = require('crypto');
const secret_config = require('../../../config/secret');

exports.default = async function (req, res) {
    try {
        const userIdx = req.body.userIdx;
        const userId = req.body.userId;

        const connection = await pool.getConnection(async conn => conn);
        try {
            const getYoutubeQuery = `
                SELECT userName, userId
                FROM user
                where userIdx = ? and userId = ?;
                `;
            const useParams = [userIdx, userId]
            const [youtubeDataRows] = await connection.query(getYoutubeQuery, useParams);

            //Token 발급
            let token = await jwt.sign({
                    userIdx : getYoutubeQuery[0].userName,
                    userId : getYoutubeQuery[0].email
                },
                secret_config.jwtsecret,
                {
                    expiresIn: '365d',
                    subject: 'userInfo',
                }
            );
            connection.release();

            let responseData = {};
            responseData.JWT = token;
            return res.json(responseData);
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

exports.comment = async function (req,res){
    try{
        const jwtToken = req.headers['x-access-token'];
        // let jwtDecode = jwt.verify(jwtToken, secret_config.jwtsecret);

        let jwtDecode = jwtToken.verify(jwtToken, secret_config,jwtsecret);
        const userIdx = req.body.userIdx;
        const userId = jwtDecode.userId;

        const displayIdx = req.body.displayIdx;
        const description = req.body.description;

        const connection = await pool.getConnection(async conn=>conn());
        try{
            // const userIdx = jwtDecode.userIdx;
            // const userId = jwtDecode.userId;

            const insertDisplayClickQuery = `insert into comment(userIdx, displayIdx, description) values (?, ?, ?);`;

            const insertCommentSubParams = [userIdx, displayIdx, description];
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



// /token
exports.token = async function (req, res) {
    const connection = await pool.getConnection(async conn=>conn());
    const jwtToken = req.headers['x-access-token'];
    // 유효한 토큰 검사
    let jwtDecode = jwt.verify(jwtToken, secret_config.jwtsecret);
    const userIdx = jwtDecode.userIdx;
    const userId = jwtDecode.userId;
    const checkTokenValidQuery = `select exists(select userIdx from user where userIdx = ? and userId = ?) as exist;`;
    const [isValidUser] = await connection.query(checkTokenValidQuery, [userIdx, userId]);
    //
    //
    console.log(isValidUser[0].exist)
    console.log(jwtDecode)
    if (!isValidUser[0].exist) {
        connection.release();
        return res.json(resApi(false, 204, '유효하지않는 토큰입니다.'));
    }
    return res.json(resApi(true, 100, '유효한 토큰입니다.'));
}

// /testToken 토큰발급
exports.testToken = async function (req, res){
    const connection = await pool.getConnection(async conn=>conn());
    let token = await jwt.sign({
            userIdx: "1",
            userId: "itSub",
        }, // 토큰의 내용(payload)
        secret_config.jwtsecret, // 비밀 키
        {
            expiresIn: '365d',
            subject: 'userInfo',
        } // 유효 시간은 365일
    );
    console.log(token)
    connection.release();
    let responseData = {};
    responseData.JWT = token;
    return res.json(responseData)
}