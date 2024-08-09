import {
  genUUID,
  hexToUtf8String,
  littleEndianHexStringToInt,
  utf8StringToHex,
} from "./utils/utils";

describe.only("testHexToString", () => {
  let id: string;
  let hex: string;

  // beforeEach 是 Jest 提供的一个钩子函数，它会在每个测试用例运行之前执行。这里我们用它来初始化测试所需的变量。
  beforeEach(() => {
    id = "0f4c3f18c3714a20bae2242ac902e183";
    hex = "0x3066346333663138633337313461323062616532323432616339303265313833";
  });

  test.only("测试 hexToUtf8String", () => {
    let result = utf8StringToHex(id);
    expect(result).toBe(hex);
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
