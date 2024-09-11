"use strict";

const {
  TosClient,
  TosClientError,
  TosServerError,
} = require("@volcengine/tos-sdk");

function handleError(error) {
  if (error instanceof TosClientError) {
    console.log("Client Err Msg:", error.message);
    console.log("Client Err Stack:", error.stack);
  } else if (error instanceof TosServerError) {
    console.log("Request ID:", error.requestId);
    console.log("Response Status Code:", error.statusCode);
    console.log("Response Header:", error.headers);
    console.log("Response Err Code:", error.code);
    console.log("Response Err Msg:", error.message);
  } else {
    console.log("unexpected exception, message: ", error);
  }
}

module.exports = {
  provider: "volcengine-tos",
  name: "VolcEngine TOS",
  init: (config) => {
    const defaultBucketParams = {
      ACL: "public-read",
      signedUrlExpires: 30 * 60, // 30 minutes
    };

    const tosClient = new TosClient({
      accessKeyId: config.accessKeyId,
      accessKeySecret: config.accessKeySecret,
      region: config.region,
      endpoint: config.endpoint,
      maxRetryCount: 3,
    });

    const getFileKey = (file) => {
      const path = file.path ? `${file.path}/` : "";
      return `${config.uploadPath + "/" || ""}${path}${file.hash}${file.ext}`;
    };

    const upload = (file, customParams = {}) =>
      new Promise(async (resolve, reject) => {
        const path = config.uploadPath ? `${config.uploadPath}/` : "";
        const fileName = `${file.hash}${file.ext}`;
        const fullPath = `${path}${fileName}`;

        try {
          const res = await tosClient.putObject({
            bucket: config.bucket,
            key: fullPath,
            body: file.stream || Buffer.from(file.buffer, "binary"),
            ...customParams,
          });

          if (config.baseUrl) {
            let baseUrl = config.baseUrl.replace(/\/$/, "");
            file.url = `${baseUrl}/${fullPath}`;
          } else {
            file.url = `https://${config.bucket}.${config.endpoint}/${fullPath}`;
          }
          resolve();
        } catch (e) {
          reject(e);
          handleError(e);
        }
      });

    return {
      isPrivate() {
        return !!config.bucketParams && config.bucketParams.ACL === "private";
      },
      async getSignedUrl(file, customParams = {}) {
        const fileKey = getFileKey(file);
        try {
          const url = await tosClient.getPreSignedUrl({
            bucket: config.bucket,
            key: fileKey,
            method: "GET",
            expires:
              customParams.expires || defaultBucketParams.signedUrlExpires,
          });
          return { url };
        } catch (e) {
          handleError(e);
          throw e;
        }
      },
      uploadStream(file, customParams = {}) {
        return upload(file, customParams);
      },
      upload(file, customParams = {}) {
        return upload(file, customParams);
      },
      delete(file, customParams = {}) {
        return new Promise(async (resolve, reject) => {
          const path = config.uploadPath ? `${config.uploadPath}/` : "";
          const fullPath = `${path}${file.hash}${file.ext}`;
          try {
            await tosClient.deleteObject({
              bucket: config.bucket,
              key: fullPath,
              ...customParams,
            });
            resolve();
          } catch (e) {
            reject(e);
            handleError(e);
          }
        });
      },
    };
  },
};
