import * as AWS from 'aws-sdk'

export class S3Access {
    private readonly s3;

    constructor(
        public readonly bucketName = process.env.TODOS_S3_BUCKET,
        private readonly urlExpiration = process.env.SIGNED_URL_EXPIRATION,
        
    ) {
        this.s3 = new AWS.S3({
            signatureVersion: 'v4'
        });
    }

    getUploadUrl(todoId: string) {
        return this.s3.getSignedUrl('putObject', {
          Bucket: this.bucketName,
          Key: todoId,
          Expires: this.urlExpiration
        })
    }
}
