export class Company {
  private _id: string | null = null;
  private _userAddress: string = "";
  private _name: string;
  private _mobile: string;

  constructor(name: string, mobile: string) {
    this._name = name;
    this._mobile = mobile;
  }

  // getter and setter
  get id() {
    return this._id;
  }
  set id(value) {
    this._id = value;
  }
  get userAddress() {
    return this._userAddress;
  }
  set userAddress(value) {
    this._userAddress = value;
  }
  get name() {
    return this._name;
  }
  set name(value) {
    this._name = value;
  }
  get mobile() {
    return this._mobile;
  }
  set mobile(value) {
    this._mobile = value;
  }

  toString = () => {
    return `id: ${this._id}, name: ${this._name}, mobile: ${this._mobile}`;
  };

  toJson = () => {
    return JSON.stringify(this, null, 2);
  };
}
