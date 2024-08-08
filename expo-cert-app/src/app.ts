import { createInterface } from "readline";
import {
  createAccount,
  generateMnemonic,
  readAccount,
  accountList,
  transferAndSubscribe,
} from "./services/accountServices";
import {
  connect,
  createKeyring,
  genUUID,
  initial_apply,
  initial_person_passcert,
  readInput,
  readRuntimeVersion,
} from "./utils/utils";
import Keyring from "@polkadot/keyring";
import { KeyringPair } from "@polkadot/keyring/types";
import { ApiPromise } from "@polkadot/api";
import {
  Company_Store,
  ExhibitionApply_Store,
  Key_Store,
  PassCert_Store,
  Person_Store,
} from "./constants/constants";
import { Company } from "./models/company";
import {
  AuditStatus,
  BoothType,
  ExhibitionApply,
  Purpose,
} from "./models/exhibitionApply";
import {
  save_company_apply,
  send_company_apply,
  send_company_apply_with_keyringpair,
} from "./services/exhibitionApplyServices";
import { CertType, PassCert } from "./models/passCert";
import { certApply } from "./services/passCertServices";

const main = async () => {
  console.log("欢迎来到Expo Universe\n");

  // 获取连接
  const api = await connect();

  // 创建keyring
  const keyring = createKeyring();

  await readRuntimeVersion(api);
  console.log();

  while (true) {
    console.log("请根据以下列出的选项，选择您要进行的操作，输入序号数字即可：");
    console.log("1. 创建钱包账户");
    console.log("2. 查看账户");
    console.log("3. 转账");
    console.log("4. 企业报名");
    console.log("5. 报名查询");
    console.log("6. 申请证件");
    console.log("7. 证件查询");
    console.log("8. 初始化报名信息");
    console.log("0. 退出");
    console.log();

    // 获取用户输入
    const input = await readInput("(输入0退出)>: ");

    if (input === "0") {
      console.log("Bye!\n");
      api.disconnect();
      process.exit(0);
    }

    switch (input) {
      case "1":
        await newAccount(keyring);
        break;
      case "2":
        await checkAccount(api, keyring);
        break;
      case "3":
        await transferAmount(api, keyring);
        break;
      case "4":
        await companyApply(api, keyring); // 企业报名
        break;
      case "5":
        await checkApplies(api, keyring); // 查询报名信息
        break;
      case "6":
        console.log("申请证件 TODO...");

        break;
      case "7":
        await checkPassCerts(api, keyring); // 查询证件信息
        break;
      case "8":
        initialDatas(api, keyring); // 初始化报名信息
        break;
      default:
        console.log("无效的选项，请重新输入。");
        break;
    }
    console.log();
  }
};

main()
  .then(() => {
    console.log("Bye!");
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

// 创建账号
const newAccount = async (keyring: Keyring) => {
  const mnemonic = generateMnemonic();
  console.log("您的账号助记词是（请务必保存到安全位置）：");
  console.log(mnemonic);
  console.log("请输入您的账号名称：");
  const username = await readInput(">:");
  console.log("正在生成您的账号...");
  const account = createAccount(keyring, mnemonic, username);
  console.log("账号创建成功，您的账号地址是：", account.address);
  // console.log(account.meta.name);

  console.log("请保存您的账号地址，以便于以后使用。");
};

// 查看账号
const checkAccount = async (api: ApiPromise, keyring: Keyring) => {
  while (true) {
    console.log("请选择要查看的账号（输入数字即可）：");
    accountList();

    const input = await readInput("(输入0退出)>: ");
    if (input === "0") {
      console.log("已退出查看账号，回到主程序。");
      break;
    }
    // 将 input 转换为数字
    const index = parseInt(input, 10);

    if (isNaN(index) || index < 0 || index > Key_Store.length) {
      console.log("无效的选项，请重新输入。\n");
      continue;
    }

    const account = await readAccount(api, index);
    console.log("\n您的账户信息：");
    console.log(
      `户名：${account.name}\n地址：${account.address}\n余额：${account.freeBalance}`,
    );
    console.log();
  }
};

async function transferAmount(api: ApiPromise, keyring: Keyring) {
  while (true) {
    console.log("已有账户列表：");
    accountList();
    let input = await readInput("请输入待转出【账户序号】(输入0退出)>: ");
    if (input === "0") {
      console.log("已退出查看账号，回到主程序。");
      break;
    }
    // 将 input 转换为数字
    const from = parseInt(input, 10);
    if (isNaN(from) || from < 0 || from > Key_Store.length) {
      console.log("无效的选项，请重新输入。\n");
      continue;
    }

    input = await readInput("请输入待转入【账户序号】(输入0退出)>: ");
    if (input === "0") {
      console.log("已退出查看账号，回到主程序。");
      break;
    }
    const to = parseInt(input, 10);
    if (isNaN(to) || to < 0 || to > Key_Store.length) {
      console.log("无效的选项，请重新输入。\n");
      continue;
    }

    input = await readInput("请输入【转账金额】(输入0退出)>: ");
    if (input === "0") {
      console.log("已退出查看账号，回到主程序。");
      break;
    }

    const amount = parseInt(input, 10);
    if (isNaN(amount) || amount < 0) {
      console.log("无效的选项，请重新输入。\n");
      continue;
    }
    console.log("正在转账：");
    await transferAndSubscribe(api, keyring, from, to, amount);
    console.log();
  }
}

const companyApply = async (api: ApiPromise, keyring: Keyring) => {
  console.log("已有用户列表：");
  accountList();
  let input = await readInput("请选择用户(输入0退出)>: ");
  if (input === "0") {
    console.log("已退出展会报名，回到主程序。");
    return;
  }
  // 将 input 转换为数字
  const index = parseInt(input, 10);
  if (isNaN(index) || index < 0 || index > Key_Store.length) {
    console.log("无效的选项，回到主程序。\n");
    return;
  }
  let company = await enterCompanyInfo(index);
  if (company === null) {
    return;
  }

  let apply = await enteryApplyInfo(company.id!);
  if (apply === null) {
    return;
  }
  let success = save_company_apply(index, company, apply);
  if (success) {
    await send_company_apply(api, keyring, index, apply);
  }
};

async function enterCompanyInfo(index: number): Promise<Company | null> {
  console.log("请输入公司信息：");
  let name = await readInput("公司名称(输入0退出)>: ");
  name = name.trim();
  if (name === "0") {
    console.log("已退出，回到主程序。");
    return null;
  }
  // 遍历 Company_Store Map，检查公司是否已存在
  for (let [_, companies] of Company_Store) {
    for (let c of companies) {
      if (c.name === name) {
        console.log("公司已存在。退出，回到主程序。");
        return null;
      }
    }
  }

  let mobile = await readInput("联系方式（手机）(输入0退出)：");
  let company = new Company(name, mobile);

  company.id = genUUID();
  company.userAddress = Key_Store[index - 1].address;
  return company;
}

async function enteryApplyInfo(
  companyId: string,
): Promise<ExhibitionApply | null> {
  // 遍历 Exhibition_Store []，检查公司是否已报名
  for (let a of ExhibitionApply_Store) {
    if (a.companyId === companyId) {
      console.log("公司已报名。退出，回到主程序。");
      return null;
    }
  }

  console.log("请输入展会报名信息：");
  console.log("参加展会目的：");
  console.log("1. 参展\n2. 采购");
  let purpose = await readInput("请选择序号(输入0退出)>: ");
  let apply: ExhibitionApply | null = null;
  switch (purpose) {
    case "0":
      console.log("已退出，回到主程序。");
      return null;
    case "1":
      apply = new ExhibitionApply(companyId, Purpose.Exhibit);
      break;
    case "2":
      apply = new ExhibitionApply(companyId, Purpose.Purchase);
      break;
    default:
      console.log("无效的选项，已退出，回到主程序。");
      return null;
  }

  if (apply!.purpose === Purpose.Exhibit) {
    let exhibits = await readInput("请输入展品(输入0退出)>: ");
    if (exhibits === "0") {
      console.log("已退出，回到主程序。");
      return null;
    }
    apply!.exhibits = exhibits;

    console.log("请选择展位类型：");
    console.log("1. 标准展位\n2. 净地展位");
    let boothType = await readInput("请选择序号(输入0退出)>: ");
    switch (boothType) {
      case "0":
        console.log("已退出，回到主程序。");
        return null;
      case "1":
        apply!.boothType = BoothType.Standard;
        break;
      case "2":
        apply!.boothType = BoothType.BareSpace;
        break;
      default:
        console.log("无效的选项，已退出，回到主程序。");
        return null;
    }
    let boothNumOrAreaStr = await readInput(
      "请输入展位数量或面积(输入0退出)>: ",
    );
    if (boothNumOrAreaStr === "0") {
      console.log("已退出，回到主程序。");
      return null;
    }
    let boothNumOrArea = parseInt(boothNumOrAreaStr, 10);
    if (isNaN(boothNumOrArea) || boothNumOrArea < 0) {
      console.log("无效输入，已退出，回到主程序。");
      return null;
    }
    apply!.boothNumOrArea = boothNumOrArea;
    apply.calculateCertNum();
  }
  apply.status = AuditStatus.Pending;

  return apply;
}

const checkApplies = async (api: ApiPromise, keyring: Keyring) => {
  console.log("报名信息如下：\n");

  for (let [_, companies] of Company_Store) {
    for (let c of companies) {
      console.log(`公司名称：${c.name}\n联系方式：${c.mobile}`);
      for (let a of ExhibitionApply_Store) {
        if (a.companyId === c.id) {
          console.log(
            `参加展会目的：${
              a.purpose === Purpose.Exhibit ? "参展" : "采购"
            }\n展品：${a.exhibits}\n展位类型：${
              a.boothType === BoothType.Standard ? "标准展位" : "净地展位"
            }\n展位数量或面积：${a.boothNumOrArea}\n专业观众证数量：${
              a.numOfVisitorCert
            }\n参展商证数量：${a.numOfExhibitorCert}
            \n状态：${a.status === AuditStatus.Approved ? "已通过" : a.status === AuditStatus.Pending ? "待审" : "已驳回"}\n`,
          );
        }
      }
    }
  }
  let input = await readInput("请输入公司名称(输入0退出)>: ");
  if (input === "0") {
    console.log("已退出，回到主程序。");
    return;
  }
  let [userAddress, company] = findCompanyByName(input);
  if (userAddress === null) {
    console.log("用户不存在，已退出，回到主程序。");
    return;
  }
  if (company === null) {
    console.log("公司不存在，已退出，回到主程序。");
    return;
  }
  let apply = findExhibitionApplyByCompanyId(company.id!);
  if (apply === null) {
    console.log("公司未报名，已退出，回到主程序。");
    return;
  }
  let keypair = findKeypairByAddress(userAddress!);
  if (keypair === null) {
    console.log("用户不存在，已退出，回到主程序。");
    return;
  }
  await send_company_apply_with_keyringpair(api, keyring, keypair!, apply);
};

const initialDatas = (api: ApiPromise, keyring: Keyring) => {
  console.log("\n初始化公司报名信息...\n");
  initial_apply();
  console.log("公司报名信息初始化完成。\n");
  console.log("初始化证件申请信息...\n");
  initial_person_passcert();
  console.log("证件申请信息初始化完成。\n");
};

const findCompanyByName = (name: string): [string | null, Company | null] => {
  for (let [key, companies] of Company_Store) {
    for (let c of companies) {
      if (c.name === name) {
        return [key, c];
      }
    }
  }
  return [null, null];
};

const findExhibitionApplyByCompanyId = (
  companyId: string,
): ExhibitionApply | null => {
  for (let a of ExhibitionApply_Store) {
    if (a.companyId === companyId) {
      return a;
    }
  }
  return null;
};

const findKeypairByAddress = (address: string): KeyringPair | null => {
  for (let k of Key_Store) {
    if (k.address === address) {
      return k;
    }
  }
  return null;
};

const checkPassCerts = async (api: ApiPromise, keyring: Keyring) => {
  printPersonCerts();
  await applyCert(api, keyring);
};

const printPersonCerts = () => {
  Company_Store.forEach((companies, key) => {
    companies.forEach((company) => {
      const persons = Person_Store.filter(
        (person) => person.companyId == company.id,
      );
      persons.forEach((p) => {
        let passCert: PassCert | undefined = PassCert_Store.get(p.id as string);
        if (passCert) {
          // let passCert = passCerts[0];
          console.log(`公司名称：${company.name}\n`);
          console.log(
            `人员id：${p.id}\n姓名：${p.name}\n年龄：${p.age}\n性别：${p.gender.toString()}\n手机：${p.mobile}\n职位：${p.position}\n`,
          );
          console.log(
            `证件申请id：${passCert.id}\n申请人id：${passCert.personId}\n展会证件：${passCert.certType === CertType.ExhibitorCert ? "参展商证" : "专业观众证"}\n`,
          );
          console.log("--------------------------------------------------");
        } else {
          console.log("**************************************************");
          console.log("以下人员未申请证件：");
          console.log(`公司id：${company.id}\t公司名称：${company.name}\n`);
          console.log(
            `人员id：${p.id}\t姓名：${p.name}\n年龄：${p.age}\n性别：${p.gender.toString()}\n手机：${p.mobile}\n职位：${p.position}\n`,
          );
          console.log(
            `无相关证件申请信息：${PassCert_Store.get(p.id as string)}`,
          );

          console.log("**************************************************");
        }
      });
    });
  });
};

const applyCert = async (api: ApiPromise, keyring: Keyring) => {
  let name = await readInput("请输入人员姓名(输入0退出)>: ");
  name = name.trim();
  if (name === "0") {
    console.log("已退出，回到主程序。");
    return;
  }

  let person = findPersonByName(name);
  if (person === null) {
    console.log("人员不存在，已退出，回到主程序。");
    return;
  }

  let passCert = PassCert_Store.get(person.id as string);
  if (!passCert) {
    console.log("人员未申请证件，已退出，回到主程序。");
    return;
  }
  let [address, _] = findCompanyById(person.companyId);
  if (address === null) {
    console.log("公司不存在，已退出，回到主程序。");
    return;
  }
  let keypair = findKeypairByAddress(address as string);
  if (keypair === null) {
    console.log("错误，已退出，回到主程序。");
    return;
  }
  await certApply(api, keyring, keypair, passCert);
};

const findPersonByName = (name: string) => {
  const persons = Person_Store.filter((p) => p.name === name) || [];
  if (persons.length === 0) {
    console.log("人员不存在。");
    return null;
  }
  return persons[0];
};

const findCompanyById = (companyId: string) => {
  for (let [key, companies] of Company_Store) {
    for (let c of companies) {
      if (c.id === companyId) {
        return [key, c];
      }
    }
  }
  return [null, null];
};