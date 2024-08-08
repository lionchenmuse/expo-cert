export class Person {
  private _id: string | null = null;
  private _companyId: string;
  private _name: string;
  private _age: number;
  private _gender: Gender;
  private _mobile: string;
  private _position: string;

  constructor(
    companyId: string,
    name: string,
    age: number,
    gender: Gender,
    mobile: string,
    position: string,
  ) {
    this._companyId = companyId;
    this._name = name;
    this._age = age;
    this._gender = gender;
    this._mobile = mobile;
    this._position = position;
  }

  // getter & setter
  get id() {
    return this._id;
  }
  set id(value) {
    this._id = value;
  }
  /** 所属公司ID */
  get companyId() {
    return this._companyId;
  }
  /** 所属公司ID */
  set companyId(value) {
    this._companyId = value;
  }
  /** 姓名 */
  get name() {
    return this._name;
  }
  /** 姓名 */
  set name(value) {
    this._name = value;
  }
  /**  年龄 */
  get age() {
    return this._age;
  }
  /**  年龄 */
  set age(value) {
    this._age = value;
  }
  /** 性别 */
  get gender() {
    return this._gender;
  }
  /** 性别 */
  set gender(value) {
    this._gender = value;
  }
  /** 手机号 */
  get mobile() {
    return this._mobile;
  }
  /** 手机号 */
  set mobile(value) {
    this._mobile = value;
  }
  /** 职位 */
  get position() {
    return this._position;
  }
  /** 职位 */
  set position(value) {
    this._position = value;
  }

  toString = () => {
    // 返回所有字段信息
    return `id: ${this._id}, companyId: ${this._companyId}, name: ${this._name}, age: ${this._age}, gender: ${this._gender}, mobile: ${this._mobile}, position: ${this._position}`;
  };
}

export enum Gender {
  Unknown,
  MALE,
  FEMALE,
}
