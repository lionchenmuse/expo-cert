import { ApiPromise, Keyring, WsProvider } from "@polkadot/api";
import {
  ALICE,
  ALICE_URI,
  BOB,
  BOB_URI,
  Company_Store,
  ExhibitionApply_Store,
  Key_Store,
  PassCert_Store,
  Person_Store,
  WS_URL,
} from "../constants/constants";

import { createInterface } from "readline";
import { Company } from "../models/company";
import {
  AuditStatus,
  BoothType,
  ExhibitionApply,
  Purpose,
} from "../models/exhibitionApply";
import { save_company_apply } from "../services/exhibitionApplyServices";
import { KeyringPair } from "@polkadot/keyring/types";
import { Gender, Person } from "../models/person";
import { keyExtractPath } from "@polkadot/util-crypto";
import { CertStatus, CertType, PassCert } from "../models/passCert";

export const sleep = async (ms: number) => {
  await new Promise((resolve) => setTimeout(resolve, ms));
};

export const initial_apply = () => {
  let name = "测试公司";
  let mobile = "1801234567";

  for (let i = 1; i <= 5; i++) {
    let company = new Company(name + i, mobile + i);
    company.id = genUUID();
    company.userAddress = Key_Store[0].address;
    let apply = new ExhibitionApply(
      company.id,
      i % 2 === 0 ? Purpose.Exhibit : Purpose.Purchase,
    );
    apply.id = genUUID();

    if (apply.purpose == Purpose.Exhibit) {
      apply.exhibits = "展品" + i;
      apply.boothType = i % 2 === 0 ? BoothType.Standard : BoothType.BareSpace;
      if (apply.boothType === BoothType.Standard) {
        apply.boothNumOrArea = i;
      } else {
        apply.boothNumOrArea = i * 60;
      }
      apply.calculateCertNum();
    }
    apply.status = AuditStatus.Pending;
    save_company_apply(1, company, apply);
  }
};

/** 初始化人员和证件申请表*/
export const initial_person_passcert = () => {
  initial_persons();
  initial_passcerts();
};

/** 初始化证件申请表*/
export const initial_passcerts = () => {
  let numOfVisitorCert = new Map<string, number>();
  let numOfExhibitorCert = new Map<string, number>();
  Person_Store.forEach((person) => {
    const apply = ExhibitionApply_Store.filter(
      (a) => a.companyId === person.companyId,
    )[0];

    if (numOfExhibitorCert.get(apply.id!) === undefined) {
      numOfExhibitorCert.set(apply.id!, 0);
    }
    if (numOfVisitorCert.get(apply.id!) === undefined) {
      numOfVisitorCert.set(apply.id!, 0);
    }

    const cert = new PassCert(
      apply.id!,
      person.id!,
      apply.numOfVisitorCert! > numOfVisitorCert.get(apply.id!)!
        ? CertType.PurchaserCert
        : CertType.ExhibitorCert,
    );
    cert.id = genUUID();
    cert.status = CertStatus.Pending;

    PassCert_Store.set(person.id as string, cert);
  });
};

/** 初始化人员信息表 */
export const initial_persons = () => {
  let familyName = "张";
  let givenNames = [
    "一",
    "二",
    "三",
    "四",
    "五",
    "六",
    "七",
    "八",
    "九",
    "十",
    "十一",
    "十二",
    "十三",
    "十四",
    "十五",
    "十六",
    "十七",
    "十八",
    "十九",
    "二十",
  ];
  let positions = [
    "总经理",
    "副总经理",
    "销售经理",
    "技术总监",
    "财务总监",
    "市场总监",
    "采购经理",
    "生产总监",
    "研发总监",
  ];

  if (Company_Store.get(Key_Store[0].address)?.length === 0) {
    console.log("请先初始化企业信息");
    return;
  }

  for (let i = 0; i < givenNames.length; i++) {
    let name = familyName + givenNames[i];
    // 随机生成18-60岁年龄
    let age = Math.floor(Math.random() * 43) + 18;
    let gender_random = Math.random() * 3 + 1;
    let gender: Gender;
    switch (gender_random % 3) {
      case 1:
        gender = Gender.Unknown;
        break;
      case 2:
        gender = Gender.MALE;
        break;
      default:
        gender = Gender.FEMALE;
    }
    let position = positions[Math.floor(Math.random() * positions.length)];
    let companies: Company[] = Company_Store.get(Key_Store[0].address)!;
    let company = companies[Math.floor(Math.random() * companies.length)];
    // console.log(`Company:\n ${company.toString()}`);

    let person = new Person(
      company.id!,
      name,
      age,
      gender,
      company.mobile,
      position,
    );
    person.id = genUUID();
    // console.log(`Person:\n ${person.toString()}`);

    Person_Store.push(person);
  }
};

/** 从一个map 中获取一个随机键值对 */
function getRandomEntry(map: Map<any, any>): [any, any] | undefined {
  // 获取所有的键
  const keys = Array.from(map.keys());
  // 如果 Map 是空的，则返回 undefined
  if (keys.length === 0) return undefined;

  // 生成一个随机索引
  const randomIndex = Math.floor(Math.random() * keys.length);
  // 使用随机索引获取随机键
  const randomKey = keys[randomIndex];
  // 获取与随机键相关的值
  const randomValue = map.get(randomKey);

  // 返回随机键值对
  return [randomKey, randomValue];
}

export const connect = async () => {
  const wsProvider = new WsProvider(WS_URL);
  const api = await ApiPromise.create({
    provider: wsProvider,
    types: {
      // Company: {
      //   id: "Option<Bytes>",
      //   name: "Bytes",
      //   address: "Bytes",
      //   contact: "Bytes",
      //   email: "Bytes",
      //   mobile: "Bytes",
      //   businessScope: "Bytes",
      // },
      // Exhibition,
    },
  });
  await api.isReady;
  return api;
};

/** 生成Keyring，并将Alice 和 Bob 添加到STORES中 */
export const createKeyring = () => {
  const keyring = new Keyring({ type: "sr25519" });
  keyring.addFromUri(ALICE_URI, { name: ALICE });
  keyring.addFromUri(BOB_URI, { name: BOB });

  // let kp: KeyringPair = keyring.pairs[0];

  Key_Store.push(keyring.pairs[0]);
  Key_Store.push(keyring.pairs[1]);
  return keyring;
};

/** 读取RuntimeVersion */
export const readRuntimeVersion = async (api: ApiPromise) => {
  const runtimeVersion = await api.runtimeVersion;
  console.log(
    "runtimeVersion.specVersion:",
    runtimeVersion.specVersion.toNumber(),
  );
};

let printStarFlag = true;
export function setPrintStarFlag(value: boolean) {
  printStarFlag = value;
}

export function getPrintStarFlag() {
  return printStarFlag;
}

/** 打印星号 */
export const printStar = () => {
  if (printStarFlag) {
    process.stdout.write("*");
    setTimeout(printStar, 500);
  }
};

/** 生成 UUID */
export const genUUID = () => {
  const uuidTemplate = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx";
  const uuid = uuidTemplate.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });

  // 移除所有连字符
  return uuid.replace(/-/g, "");
};
/**
 * 将16进制字符串转换为UTF-8编码的字符串
 */
export function hexToUtf8String(hex: string): string {
  // 去掉0x前缀
  if (hex.startsWith("0x")) {
    hex = hex.slice(2);
  }

  // 将16进制字符串转换为字节数组
  const bytes = new Uint8Array(
    hex.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16)),
  );

  // 使用TextDecoder将字节数组转换为字符串
  const decoder = new TextDecoder("utf-8");
  return decoder.decode(bytes);
}
/**
 * 将UTF-8编码的字符串转换为16进制字符串
 */
export function utf8StringToHex(str: string): string {
  // 使用TextEncoder将字符串转换为字节数组
  const encoder = new TextEncoder();
  const uint8Array = encoder.encode(str);

  // 将字节数组转换为十六进制字符串
  let hex = "";
  for (let i = 0; i < uint8Array.length; i++) {
    const byte = uint8Array[i];
    hex += byte.toString(16).padStart(2, "0");
  }

  // 添加0x前缀
  return `0x${hex}`;
}

export function littleEndianHexStringToInt(hexString: string): number {
  // 首先验证输入的字符串是否以 "0x" 开头
  if (!hexString.startsWith("0x")) {
    throw new Error("Invalid hex string format. Expected '0x' prefix.");
  }

  // 移除 "0x" 前缀
  const cleanHexString = hexString.slice(2);

  // 将小端序的字符串反转为大端序
  const bigEndianHexString =
    cleanHexString
      .match(/.{1,2}/g)
      ?.reverse()
      ?.join("") || "";

  // 将大端序的十六进制字符串转换为整数
  const intValue = parseInt(bigEndianHexString, 16);

  return intValue;
}

/**
 * 读取用户输入的函数
 * @param prompt 提示语
 * @returns 用户输入的字符串
 */
export async function readInput(prompt: string): Promise<string> {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise<string>((resolve) => {
    rl.question(prompt, (input) => {
      rl.close();
      resolve(input);
    });
  });
}
