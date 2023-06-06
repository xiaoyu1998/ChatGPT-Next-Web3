import { NextRequest } from "next/server";
import { getServerSideConfig } from "../config/server";
import md5 from "spark-md5";
import { ACCESS_CODE_PREFIX } from "../constant";

//web3Payment------xiaoyu1998
import { checkExpiration, ONE_SECOND } from "web3/crypto";
const cacheCheckExpiration = new Map<string, [number, boolean]>();
//web3Payment------xiaoyu1998

function getIP(req: NextRequest) {
  let ip = req.ip ?? req.headers.get("x-real-ip");
  const forwardedFor = req.headers.get("x-forwarded-for");

  if (!ip && forwardedFor) {
    ip = forwardedFor.split(",").at(0) ?? "";
  }

  return ip;
}

function parseApiKey(bearToken: string) {
  const token = bearToken.trim().replaceAll("Bearer ", "").trim();
  const isOpenAiKey = !token.startsWith(ACCESS_CODE_PREFIX);

  return {
    accessCode: isOpenAiKey ? "" : token.slice(ACCESS_CODE_PREFIX.length),
    apiKey: isOpenAiKey ? token : "",
  };
}

export async function auth(req: NextRequest) {
  const authToken = req.headers.get("Authorization") ?? "";

  //web3Payment------xiaoyu1998
  const ethAddress = req.headers.get("ethAddress");

  // check if it is openai api key or user token
  const { accessCode, apiKey: token } = parseApiKey(authToken);

  const hashedCode = md5.hash(accessCode ?? "").trim();

  const serverConfig = getServerSideConfig();
  console.log("[Auth] allowed hashed codes: ", [...serverConfig.codes]);
  console.log("[Auth] got access code:", accessCode);
  console.log("[Auth] hashed access code:", hashedCode);
  console.log("[User IP] ", getIP(req));
  console.log("[Time] ", new Date().toLocaleString());

  if (
    serverConfig.needCode &&
    !serverConfig.codes.has(hashedCode) &&
    !token &&
    !ethAddress //web3Payment------xiaoyu1998
  ) {
    return {
      error: true,
      msg: !accessCode ? "empty access code" : "wrong access code",
    };
  }

  //ethAddress = "0x180c2c655f5c7D4Cc43076f26078Ef6E8678828D"

  ////web3Payment------xiaoyu1998
  if (ethAddress) {
    var Expired;
    const lastCheck = cacheCheckExpiration.get(ethAddress);
    const now = Date.now();
    // console.log("[Auth] got access ethAddress:", ethAddress);
    if (lastCheck == undefined || lastCheck[0] + ONE_SECOND > now) {
      Expired = await checkExpiration(ethAddress, serverConfig.servideId);
      console.log("[Auth] ethAddress: ", ethAddress, Expired);
      if (!Expired) {
        cacheCheckExpiration.set(ethAddress, [now, Expired]);
      }
    } else {
      Expired = lastCheck[1];
    }
    if (Expired) {
      return {
        error: true,
        msg: "the web3 payment has been expired",
      };
    }
  }
  //web3Payment------xiaoyu1998

  // if user does not provide an api key, inject system api key
  if (!token) {
    const apiKey = serverConfig.apiKey;
    if (apiKey) {
      console.log("[Auth] use system api key");
      req.headers.set("Authorization", `Bearer ${apiKey}`);
    } else {
      console.log("[Auth] admin did not provide an api key");
      return {
        error: true,
        msg: "admin did not provide an api key",
      };
    }
  } else {
    console.log("[Auth] use user api key");
  }

  return {
    error: false,
  };
}
