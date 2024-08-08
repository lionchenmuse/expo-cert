export class BusinessError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BusinessError";
  }
}

export class CompanyRepeatedApplyError extends BusinessError {
  constructor(message: string) {
    super(message);
    this.name = "CompanyRepeatedApplyError";
  }
}

export class CompanyNotApplyError extends BusinessError {
  constructor(message: string) {
    super(message);
    this.name = "CompanyNotApplyError";
  }
}

export class CompanyNotApproved extends BusinessError {
  constructor(message: string) {
    super(message);
    this.name = "CompanyNotApproved";
  }
}

export class CertRepeatedApply extends BusinessError {
  constructor(message: string) {
    super(message);
    this.name = "CertRepeatedApply";
  }
}
