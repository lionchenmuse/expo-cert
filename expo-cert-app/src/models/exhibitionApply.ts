/** 展会报名 */
export class ExhibitionApply {
  private _id: string | null = null;
  private _companyId: string;
  private _status: AuditStatus = AuditStatus.Pending;
  private _purpose: Purpose;
  private _exhibits: string | null = null;
  private _boothType: BoothType | null = null;
  private _boothNumOrArea: number | null = null;

  constructor(companyId: string, purpose: Purpose) {
    this._companyId = companyId;
    this._purpose = purpose;
  }

  // getter and setter
  get id(): string | null {
    return this._id;
  }
  set id(value: string | null) {
    this._id = value;
  }
  get companyId(): string {
    return this._companyId;
  }
  set companyId(value: string) {
    this._companyId = value;
  }
  get status(): AuditStatus {
    return this._status;
  }
  set status(value: AuditStatus) {
    this._status = value;
  }
  /**  参加展会目的 */
  get purpose(): Purpose {
    return this._purpose;
  }
  /**  参加展会目的 */
  set purpose(value: Purpose) {
    this._purpose = value;
  }
  /** 展品 */
  get exhibits(): string | null {
    return this._exhibits;
  }
  /** 展品 */
  set exhibits(value: string | null) {
    this._exhibits = value;
  }
  /** 展位类型 */
  get boothType(): BoothType | null {
    return this._boothType;
  }
  /** 展位类型 */
  set boothType(value: BoothType | null) {
    this._boothType = value;
  }
  /** 展位数量或面积 */
  get boothNumOrArea(): number | null {
    return this._boothNumOrArea;
  }
  /** 展位数量或面积 */
  set boothNumOrArea(value: number | null) {
    this._boothNumOrArea = value;
  }
}

/** 审核状态 */
export enum AuditStatus {
  /// 待审核
  Pending,
  /// 通过
  Approved,
  /// 拒绝
  Rejected,
}

/** 参加展会目的 */
export enum Purpose {
  /// 参展
  Exhibit,
  /// 采购
  Purchase,
}

/** 展位类型 */
export enum BoothType {
  /// 标准展位
  Standard,
  /// 空地
  BareSpace,
}
