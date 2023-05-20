## Development

Before starting development, you must create a new `.env.local` file at project root, and place your api key into it:

```
OPENAI_API_KEY=<your api key here>
ENABLE_WEB3_PAYMENT=1
```

and you need to enable web3 payment:
```
ENABLE_WEB3_PAYMENT=1
SERVICE_ID=<your service id in aiways>
PAYMENT_PACKAGE_IDS=<your package id for you service>
URL_ETH=<ethereum endpoint url>
AIWAIYS=<aiways contract address>
```

### Local Development

```shell
# 1. install nodejs and yarn first
# 2. config local env vars in `.env.local`
# 3. run
yarn install
yarn dev
```

## LICENSE

[Anti 996 License](https://github.com/kattgu7/Anti-996-License/blob/master/LICENSE_CN_EN)
