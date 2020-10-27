function responseFormat(isSucess,code,message){
    let resposeData = {};
    resposeData.isSuccess = isSucess;
    resposeData.code = code;//200
    resposeData.message = message;

    return resposeData;
}


module.exports = responseFormat;