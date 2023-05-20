import { Wallet, verifyMessage, getDefaultProvider, Contract } from "ethers";
import { AIWAYS_ABI } from "./abis";

export const ONE_DAY = 24 * 60 * 60 * 1000;
export const ONE_SECOND = 1 * 1000;

export function generateKeys() {
  const wallet = Wallet.createRandom();
  return [wallet.privateKey, wallet.addres];
}

export async function sign(message: string, privateKey: string) {
  const wallet = new Wallet(privateKey);
  const signature = await wallet.signMessage(message);
  return signature;
}

export function recoverAddress(message: string, signature: string) {
  return verifyMessage(message, signature);
}

export async function checkExpiration(ethAddress: string, serviceId: string) {
  const provider = getDefaultProvider(process.env.URL_ETH);
  const aiways = new Contract(process.env.AIWAIYS, AIWAYS_ABI, provider);

  console.log("serviceId", serviceId);
  console.log("parseInt", parseInt(serviceId, 16));
  return await aiways.checkExpiration(ethAddress, parseInt(serviceId, 16));
}

export async function getLatestPayments(
  ethAddress: string,
  packageIds: Array<string>,
) {
  const ids = JSON.stringify(packageIds);
  const queryQL = /* GraphQL */ `
        {
          payments(
          where :{ to:"${ethAddress}" packageId_in: ${ids} }
          first:3  orderBy:time orderDirection:desc) {
            id
            packageId
            payAmount
            time
            to
            payer
          }
        }
      `;
  const options = {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json;charset=UTF-8",
    },
    body: JSON.stringify({
      query: queryQL,
    }),
  };

  const response = await fetch(process.env.URL_GRAPHQL, options).then(
    (response) => response.json(),
  );
  return response.data.payments;
}
