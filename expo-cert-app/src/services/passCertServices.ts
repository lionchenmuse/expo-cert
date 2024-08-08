import { ApiPromise, Keyring } from "@polkadot/api";
import { CertStatus, PassCert } from "../models/passCert";
import { Company_Store } from "../constants/constants";
import { KeyringPair } from "@polkadot/keyring/types";
import {
  littleEndianHexStringToInt,
  printStar,
  setPrintStarFlag,
  utf8StringToHex,
} from "../utils/utils";
import {
  BusinessError,
  CertRepeatedApply,
  CompanyNotApplyError,
  CompanyNotApproved,
} from "../error/businessError";

export const certApply = async (
  api: ApiPromise,
  keyring: Keyring,
  sender: KeyringPair,
  passCert: PassCert,
) => {
  return new Promise(async (resolve, reject) => {
    setPrintStarFlag(true);
    printStar();
    let success = true;
    try {
      const tx = await api.tx.expoCert.certApply({
        id: utf8StringToHex(passCert.id!),
        exhibitionApplyId: utf8StringToHex(passCert.applyId),
        status: passCert.status,
      });
      await tx.signAndSend(sender, async ({ events = [], status }) => {
        // Ready 状态表示交易已经被发送到网络，但还没有被打包到区块中
        if (status.isReady) {
          setPrintStarFlag(false);
          console.log(`Current status: ${status.type} ....... `);
          setPrintStarFlag(true);
          printStar();
          // InBlock 状态表示交易已经被打包到区块中
        } else if (status.isInBlock) {
          setPrintStarFlag(false);
          console.log(
            "\nTransaction included at block hash",
            status.asInBlock.toHex(),
          );
          console.log();

          try {
            events.forEach(({ event: { data, method, section }, phase }) => {
              if (method === "ExtrinsicFailed") {
                let errorJson = JSON.parse(data.toString());
                const {
                  module: { index, error },
                } = errorJson[0];
                const errorCode: number = littleEndianHexStringToInt(error);
                switch (errorCode) {
                  case 1:
                    throw new CompanyNotApplyError("Company has not applied!");
                  case 2:
                    throw new CompanyNotApproved(
                      "Company has not been approved!",
                    );
                  case 3:
                    throw new CertRepeatedApply(
                      "Certificate has been applied!",
                    );
                  default:
                    throw new BusinessError(`Error code: ${errorCode}`);
                }
              }
            });
            setPrintStarFlag(true);
            printStar();
          } catch (error) {
            console.log("certApply()：error:", error);
            success = false;
          }

          // Finalized 状态表示交易已经被打包到区块中，并且区块已经被链上的大多数节点确认
          // 注意：如果上面交易失败，仍会走到这里！
          // 即 Finalized 状态不代表交易成功!
        } else if (status.isFinalized) {
          setPrintStarFlag(false);
          console.log();

          console.log(
            "\nTransaction finalized at block hash",
            status.asFinalized.toHex(),
          );
          resolve(void 0);
          // Dropped：交易被移除
          // Invalid：交易无效
          // Usurped：交易被篡改
        } else if (status.isDropped || status.isInvalid || status.isUsurped) {
          setPrintStarFlag(false);
          throw new BusinessError(`Transaction status: ${status.type}`);
        }
      });
    } catch (error) {
      console.error("certApply error:", error);
      reject(error);
    }
    if (success) {
      passCert.status = CertStatus.Pending;
    }
  });
};
