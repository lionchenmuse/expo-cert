use codec::{Decode, Encode, MaxEncodedLen};
use scale_info::TypeInfo;
use frame_support::BoundedVec;
use frame_support::pallet_prelude::ConstU32;

/// 报名展会ID
pub type ApplyId = BoundedVec<u8, ConstU32<256>>;

/// 展会报名信息
#[derive(Debug, Clone, Eq, Decode, Encode, MaxEncodedLen, TypeInfo)]
pub struct ExhibitionApply {
    pub id: ApplyId, 
    pub status: AuditStatus,
}

impl PartialEq for ExhibitionApply {
    fn eq(&self, other: &Self) -> bool {
        self.id == other.id
    }
}

/// 证件申请信息
#[derive(Debug, Clone, Eq, Decode, Encode, MaxEncodedLen, TypeInfo)]
pub struct CertApply {
    pub id: ApplyId,
    pub exhibition_apply_id: ApplyId,
    pub status: CertStatus,
}

impl PartialEq for CertApply {
    fn eq(&self, other: &Self) -> bool {
        self.id == other.id
    }
}

/// 审核状态
#[derive(Debug, Clone, PartialEq, Eq, Decode, Encode, MaxEncodedLen, TypeInfo)]
pub enum AuditStatus {
    /// 待审
    Pending,
    /// 通过
    Approved,
    /// 拒绝
    Rejected
}

/// 证件状态
#[derive(Debug, Clone, PartialEq, Eq, Decode, Encode, MaxEncodedLen, TypeInfo)]
pub enum CertStatus {
    /// 待审
    Pending,
    /// 通过
    Approved,
    /// 拒绝
    Rejected,
    /// 已制证
    Made,
    /// 已发证
    Issued
}