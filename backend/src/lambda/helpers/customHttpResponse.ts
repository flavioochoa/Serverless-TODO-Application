export const customHttpResponse = ({statusCode, body=null}) => {
    if(body == null) {
        body = '';
    } else {
        body = JSON.stringify(body)
    }

    return {
        statusCode,
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        body
    };
}