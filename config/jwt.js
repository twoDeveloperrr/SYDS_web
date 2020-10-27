const jwt = require('jsonwebtoken');
const secret_config = require('./secret');
// const schedule = require('node-schedule');

exports.test = async function (req, res) {
    const jwtoken = req.headers['x-access-token'];
    // 유효한 토큰 검사
    let jwtDecode = jwt.verify(jwtoken, secret_config.jwtsecret);
    const userIdx = jwtDecode.userIdx;
    const userId = jwtDecode.userId;
    const checkTokenValidQuery = `select exists(select userIdx from user where userIdx = ? and userId = ?) as exist;`;
    const [isValidUser] = await connection.query(checkTokenValidQuery, [userIdx, userId]);
    //
    //
    console.log(jwtDecode)
    if (!isValidUser[0].exist) {
        connection.release();
        return res.json(resFormat(false, 204, '유효하지않는 토큰입니다.'));
    }
    return res.json(resFormat(true, 100, '유효한 토큰입니다.'));
}

exports.testsign = async function (req, res){
    let token = await jwt.sign({
            userIdx: "2",
            userId: "itSub",
        }, // 토큰의 내용(payload)
        secret_config.jwtsecret, // 비밀 키
        {
            expiresIn: '365d',
            subject: 'userInfo',
        } // 유효 시간은 365일
    );
    let responseData = {};
    responseData.JWT = token;
    return res.json(responseData)
}