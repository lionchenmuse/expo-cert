export class PassCert {
  private _id: string | null = null;
  private _applyId: string;
  private _personId: string;
  private _certType: CertType;
  private _status: CertStatus;
  private _onChain: boolean = false;

  constructor(
    applyId: string,
    personId: string,
    certType: CertType,
    status: CertStatus = CertStatus.Pending,
  ) {
    this._applyId = applyId;
    this._personId = personId;
    this._certType = certType;
    this._status = status;
  }

  // getter and setter
  get id(): string | null {
    return this._id;
  }
  set id(value: string | null) {
    this._id = value;
  }

  /** 展会申请ID */
  get applyId(): string {
    return this._applyId;
  }
  /** 展会申请ID */
  set applyId(value: string) {
    this._applyId = value;
  }
  /** 证件持有者ID */
  get personId(): string {
    return this._personId;
  }
  /** 证件持有者ID */
  set personId(value: string) {
    this._personId = value;
  }
  /** 展会证件类型 */
  get certType(): CertType {
    return this._certType;
  }
  /** 展会证件类型 */
  set certType(value: CertType) {
    this._certType = value;
  }
  /** 证件状态 */
  get status(): CertStatus {
    return this._status;
  }
  set status(value: CertStatus) {
    this._status = value;
  }
  /** 是否上链 */
  get onChain(): boolean {
    return this._onChain;
  }
  set onChain(value: boolean) {
    this._onChain = value;
  }
}

/** 展会证件类型 */
export enum CertType {
  /** 参展商证 */
  ExhibitorCert,
  /** 专业观众证 */
  PurchaserCert,
}

export enum CertStatus {
  /** 待审 */
  Pending,
  /** 通过 */
  Approved,
  /** 拒绝 */
  Rejected,
  /** 已制证 */
  Made,
  /** 已发证 */
  Issued,
}
