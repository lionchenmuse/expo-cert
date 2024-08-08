import { KeyringPair } from "@polkadot/keyring/types";
import { Company } from "../models/company";
import { ExhibitionApply } from "../models/exhibitionApply";
import { Person } from "../models/person";
import { PassCert } from "../models/passCert";

export const WS_URL = "ws://127.0.0.1:9944";
export const ALICE_ADDRESS = "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY";
export const BOB_ADDRESS = "5HpG9w8EBLe5XCrbczpwq5TSXvedjrBGCwqxK1iQ7qUsSWFc";
export const ALICE_URI = "//Alice";
export const BOB_URI = "//Bob";
export const ALICE = "Alice";
export const BOB = "Bob";

/** 默认一个标准展位可以申请的专业观众证数量 */
export const Default_Visitor_Cert_Num = 2;
/** 默认一个标准展位可以申请的参展商证数量 */
export const Default_Exhibitor_Cert_Num = 3;
/** 默认一个净地展位每多少平米可以申请的1张证件 */
export const SQUARE_METERS_PER_CERTIFICATE = 6;

export const Key_Store: KeyringPair[] = [];
/** 公司表：key：账户公钥，value：公司数组 */
export const Company_Store = new Map<string, Company[]>();
export const ExhibitionApply_Store: ExhibitionApply[] = [];
export const Person_Store: Person[] = [];
/** 证件申请表：key: Person.id，value: PassCert[] */
export const PassCert_Store = new Map<string, PassCert>();
