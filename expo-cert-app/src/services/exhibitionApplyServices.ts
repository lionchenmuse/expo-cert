import { ApiPromise, Keyring } from "@polkadot/api";
import { KeyringPair } from "@polkadot/keyring/types";
import { createType } from "@polkadot/types";
import {
  Company_Store,
  ExhibitionApply_Store,
  Key_Store,
} from "../constants/constants";
import {
  littleEndianHexStringToInt,
  printStar,
  setPrintStarFlag,
  utf8StringToHex,
} from "../utils/utils";
import { AuditStatus, ExhibitionApply } from "../models/exhibitionApply";
import { Company } from "../models/company";
import {
  BusinessError,
  CompanyRepeatedApplyError,
} from "../error/businessError";

export const save_company_apply = (
  userIndex: number,
  company: Company,
  apply: ExhibitionApply,
) => {
  try {
    // 获取用户
    const user = Key_Store[userIndex - 1];
    // 保存企业信息
    if (Company_Store.has(user.address)) {
      Company_Store.get(user.address)?.push(company);
    } else {
      Company_Store.set(user.address, [company]);
    }
    ExhibitionApply_Store.push(apply);
    return true;
  } catch (error) {
    console.error("save_company_apply error:", error);
    return false;
  }
};

export const send_company_apply = async (
  api: ApiPromise,
  keyring: Keyring,
  index: number,
  apply: ExhibitionApply,
) => {
  const sender = Key_Store[index - 1];
  await send_company_apply_with_keyringpair(api, keyring, sender, apply);
};

export const send_company_apply_with_keyringpair = async (
  api: ApiPromise,
  keyring: Keyring,
  sender: KeyringPair,
  apply: ExhibitionApply,
) => {
  return new Promise(async (resolve, reject) => {
    setPrintStarFlag(true);
    printStar();
    let success = true;
    try {
      const tx = await api.tx.expoCert.companyApply({
        id: utf8StringToHex(apply.id!),
        status: apply.status,
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
                if (errorCode === 0) {
                  throw new CompanyRepeatedApplyError(
                    `Company: id: ${apply.companyId} has already applied!`,
                  );
                }
              }
            });
            setPrintStarFlag(true);
            printStar();
          } catch (error) {
            console.log("send_company_apply_with_keyringpair() error:", error);
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
      console.log("send_company_apply_with_keyringpair error:", error);
      success = false;
      reject(error);
    }
    if (success) {
      apply.status = AuditStatus.Approved;
    }
  });
};
