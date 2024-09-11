# strapi-provider-upload-tos
strapi服务器上传文件到火山云TOS。

# Requirements
- Node.js >= 10
- npm > 6

# Installation
```bash
$ npm install strapi-provider-upload-tos --save
```

or

```bash
$ yarn add strapi-provider-upload-tos --save
```

For more details, please see: https://strapi.io/documentation/developer-docs/latest/development/plugins/upload.html#using-a-provider

# Usage


### Strapi v4

The lastest version of the provider supports v4 by default, configuration is updated a little bit. See example below for ```./config/plugins.js```:

```javascript
module.exports = ({ env }) => ({
  upload: {
    config: {
      provider: "strapi-provider-upload-tos", // full package name is required
      providerOptions: {
        accessKeyId: env("ACCESS_KEY_ID"), // required
        accessKeySecret: env("ACCESS_KEY_SECRET"), // required
        region: env("REGION"), // required
        endpoint: env("ENDPOINT"), // required
        bucket: env("BUCKET"), // required
        uploadPath: env("UPLOAD_PATH"),
        baseUrl: env("BASE_URL"),
        bucketParams: {
          ACL: "public-read", // default is 'public-read'
          signedUrlExpires: 60 * 60, // default is 30 * 60 (30min)
        },
      },
    },
  },
});
```

Official documentation [here](https://docs.strapi.io/developer-docs/latest/plugins/upload.html#enabling-the-provider)