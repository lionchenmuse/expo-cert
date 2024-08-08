export class BusinessError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BusinessError";
  }
}

/** 公司重复报名错误 */
export class CompanyRepeatedApplyError extends BusinessError {
  constructor(message: string) {
    super(message);
    this.name = "CompanyRepeatedApplyError";
  }
}

/** 公司未报名错误 */
export class CompanyNotApplyError extends BusinessError {
  constructor(message: string) {
    super(message);
    this.name = "CompanyNotApplyError";
  }
}

/** 公司未通过审核错误 */
export class CompanyNotApprovedError extends BusinessError {
  constructor(message: string) {
    super(message);
    this.name = "CompanyNotApprovedError";
  }
}

/** 展会证件重复申请错误 */
export class CertRepeatedApplyError extends BusinessError {
  constructor(message: string) {
    super(message);
    this.name = "CertRepeatedApplyError";
  }
}

/** 展会证件不存在错误 */
export class CertApplyNonExistentError extends BusinessError {
  constructor(message: string) {
    super(message);
    this.name = "CertApplyNonExistentError";
  }
}

/** 展会证件状态错误 */
export class CertApplyStatusError extends BusinessError {
  constructor(message: string) {
    super(message);
    this.name = "CertApplyStatusError";
  }
}

export const throwError = (errorCode: number) => {
  switch (errorCode) {
    case 1:
      throw new CompanyNotApplyError("Company has not applied!");
    case 2:
      throw new CompanyNotApprovedError("Company has not been approved!");
    case 3:
      throw new CertRepeatedApplyError("Certificate has been applied!");
    case 4:
      throw new CertApplyNonExistentError("Certificate does not exist!");
    case 5:
      throw new CertApplyStatusError("Certificate status error!");
    default:
      throw new BusinessError(`Error code: ${errorCode}`);
  }
};
