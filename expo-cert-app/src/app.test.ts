import {
  genUUID,
  hexToUtf8String,
  littleEndianHexStringToInt,
  utf8StringToHex,
} from "./utils/utils";

describe.only("testHexToString", () => {
  let hex: string;

  // beforeEach 是 Jest 提供的一个钩子函数，它会在每个测试用例运行之前执行。这里我们用它来初始化测试所需的变量。
  beforeEach(() => {
    hex = "0xe69d8ee581a5";
  });

  test.only("测试 hexToUtf8String", () => {
    const result = hexToUtf8String(hex);
    expect(result).toBe("李健");

    const hexStr = utf8StringToHex(result);
    expect(hexStr).toBe(hex);

    hex = "0x3830353638316364656661353435646538613437616338376636346438343162";
    const result2 = hexToUtf8String(hex);
    expect(result2).toBe("805681cdefa545de8a47ac87f64d841b");

    const hexStr2 = utf8StringToHex("500cb1d17e604c36b388336ec87476de");
    console.log("hexStr2: ", hexStr2);
  });

  test("测试小端序Hex转整数", () => {
    const hex = "0x1a000000";
    const result = littleEndianHexStringToInt(hex);
    console.log("result: ", result);

    expect(result).toBe(26);
  });
});

describe("测试UUID", () => {
  test("生成UUID", () => {
    const uuid = genUUID();
    console.log(uuid);
  });
});
