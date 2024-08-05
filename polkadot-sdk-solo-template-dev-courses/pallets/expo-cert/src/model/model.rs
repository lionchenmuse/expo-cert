use codec::{Decode, Encode, MaxEncodedLen};
use scale_info::TypeInfo;
use frame_support::BoundedVec;
use frame_support::pallet_prelude::ConstU32;

/// 公司ID：BoundedVec<u8, ConstU32<16>> 
pub type CompanyId = BoundedVec<u8, ConstU32<16>>;

/// 公司信息
#[derive(Debug, Clone, Eq, Decode, Encode, MaxEncodedLen, TypeInfo)]
pub struct Company {
    /// 公司ID
    id: Option<CompanyId>,
    /// 公司名称
    pub name: BoundedVec<u8, ConstU32<240>>,
    /// 公司地址
    pub address: BoundedVec<u8, ConstU32<240>>,
    /// 联系人
    pub contact: BoundedVec<u8, ConstU32<60>>,
    /// 联系人邮箱
    pub email: BoundedVec<u8, ConstU32<30>>,
    /// 联系人手机
    pub mobile: BoundedVec<u8, ConstU32<30>>,
    /// 经营范围
    pub business_scope: BoundedVec<u8, ConstU32<1024>>,
}

impl Company {
    pub fn new() -> Self {
        Self {
            id: None,
            name: BoundedVec::new(),
            address: BoundedVec::new(),
            contact: BoundedVec::new(),
            email: BoundedVec::new(),
            mobile: BoundedVec::new(),
            business_scope: BoundedVec::new(),
        }
    }

    pub fn id(&self) -> Option<CompanyId> {
        self.id.clone()
    }

    pub fn set_id(&mut self, id: Option<CompanyId>) {
        self.id = id;
    }
}

impl PartialEq for Company {

    fn eq(&self, other: &Self) -> bool {
        if self.id.is_some() && other.id.is_some() {
            // self.id.unwrap() == other.id.unwrap()
            self.id.as_ref().unwrap() == other.id.as_ref().unwrap()
        } else {
            self.name == other.name
        }
    }
}

/// 展会报名ID：BoundedVec<u8, ConstU32<24>>
pub type ExApplyId = BoundedVec<u8, ConstU32<24>>;

/// 展会报名表
#[derive(Debug, Clone, Eq, Decode, Encode, MaxEncodedLen, TypeInfo)]
pub struct ExhibitionApply {
    /// 展会报名ID
    id: Option<ExApplyId>,
    /// 公司ID
    company_id: Option<CompanyId>,
    /// 展会
    pub exhibition: Option<Exhibition>,
    /// 审核状态
    status: Option<AuditStatus>,
    /// 参加展会目的
    pub participation_purpose: Option<ParticipationPurpose>,
    /// 展品
    pub exhibits: Option<BoundedVec<u8, ConstU32<1024>>>,
    /// 展位类型
    pub booth_type: Option<BoothType>,
}

impl ExhibitionApply {
    pub fn new() -> Self {
        Self {
            id: None,
            company_id: None, 
            exhibition: None,
            status: None,
            participation_purpose: None,
            exhibits: None,
            booth_type: None,
        }
    }
    pub fn id(&self) -> Option<ExApplyId> {
        self.id.clone()
    }

    pub fn set_id(&mut self, id: Option<ExApplyId>) {
        self.id = id;
    }

    pub fn company_id(&self) -> Option<CompanyId> {
        self.company_id.clone()
    } 

    pub fn set_company_id(&mut self, company_id: Option<CompanyId>) {
        self.company_id = company_id;
    }

    pub fn status(&self) -> Option<AuditStatus> {
        self.status.clone()
    }

    pub fn set_status(&mut self, status: Option<AuditStatus>) {
        self.status = status;
    }
}

impl PartialEq for ExhibitionApply {

    fn eq(&self, other: &Self) -> bool {
        self.id == other.id || (self.company_id == other.company_id && self.exhibition == other.exhibition)
    }
}

/// 参加参会目的：参展；采购
#[derive(Debug, Clone, PartialEq, Eq, Decode, Encode, MaxEncodedLen, TypeInfo)]
pub enum ParticipationPurpose {
    /// 参展
    Exhibit,
    /// 采购
    Purchase,
}

/// 展位类型：标准展位；净地展位
#[derive(Debug, Clone, PartialEq, Eq, Decode, Encode, MaxEncodedLen, TypeInfo)]
pub enum BoothType {
    /// 标准展位(数量：个数)
    Standard(u32),
    /// 净地展位(面积：m2)
    BareSpace(u32),
}

/// 报名审核状态
#[derive(Debug, Clone, PartialEq, Eq, Decode, Encode, MaxEncodedLen, TypeInfo, Default)]
pub enum AuditStatus {
    /// 未审核
    #[default]
    UnAudited,
    /// 审核通过(可申请证件数量)
    Approved(u8),
    /// 审核不通过(不通过原因)
    Rejected(BoundedVec<u8, ConstU32<240>>),
}

/// 展会信息
#[derive(Debug, Clone, PartialEq, Eq, Decode, Encode, MaxEncodedLen, TypeInfo)]
pub enum Exhibition {
    /// 东博会
    CAEXPO,
    /// 广交会
    CantonFair,
    /// 进博会：China International Import Expo
    CIIE
}
