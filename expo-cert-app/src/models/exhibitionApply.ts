import {
  Default_Exhibitor_Cert_Num,
  Default_Visitor_Cert_Num,
  SQUARE_METERS_PER_CERTIFICATE,
} from "../constants/constants";

/** 展会报名 */
export class ExhibitionApply {
  private _id: string | null = null;
  private _companyId: string;
  private _status: AuditStatus = AuditStatus.Pending;
  private _purpose: Purpose;
  private _exhibits: string | null = null;
  private _boothType: BoothType | null = null;
  private _boothNumOrArea: number | null = null;
  private _numOfVisitorCert: number | null = null;
  private _numOfExhibitorCert: number | null = null;

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
  /** 专业观众证数量 */
  get numOfVisitorCert(): number | null {
    return this._numOfVisitorCert;
  }
  /** 专业观众证数量 */
  set numOfVisitorCert(value: number | null) {
    this._numOfVisitorCert = value;
  }
  /** 参展商证数量 */
  get numOfExhibitorCert(): number | null {
    return this._numOfExhibitorCert;
  }
  /** 参展商证数量 */
  set numOfExhibitorCert(value: number | null) {
    this._numOfExhibitorCert = value;
  }

  calculateCertNum = () => {
    // 如果是采购目的，专业观众证数量为2，参展商证数量为0
    if (this.purpose === Purpose.Purchase) {
      this.numOfVisitorCert = Default_Visitor_Cert_Num;
      this.numOfExhibitorCert = 0;
      return;
    }
    // 如果是参展目的，且是标准展位，根据展位数量计算专业观众证数量和参展商证数量
    if (this.boothType === BoothType.Standard && this.boothNumOrArea !== null) {
      this.numOfVisitorCert = this.boothNumOrArea * Default_Visitor_Cert_Num;
      this.numOfExhibitorCert =
        this.boothNumOrArea * Default_Exhibitor_Cert_Num;
      return;
    }
    // 如果是参展目的，且是净地展位，根据展位面积计算专业观众证数量和参展商证数量
    if (
      this.boothType === BoothType.BareSpace &&
      this.boothNumOrArea !== null
    ) {
      // 计算总的证件数量
      const totalCerts = Math.round(
        this.boothNumOrArea / SQUARE_METERS_PER_CERTIFICATE,
      );
      // 平均分给专业观众证和参展商证
      this.numOfVisitorCert = Math.round(totalCerts / 2);
      this.numOfExhibitorCert = totalCerts - this.numOfVisitorCert;
    }
  };
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
