// use frame_system::Config;
// use frame_support::BoundedVec;
// use frame_support::pallet_prelude::ConstU32;
// use codec::Encode;
// use sp_std::vec::Vec;

// use crate::{model::model::{AuditStatus, Company, CompanyId, ExApplyId, ExhibitionApply}, CompanyVec, ExhibitionApplyVec};

// /// 保存公司数据，并返回公司id
// pub fn save_company<T: Config>(
//     who: &T::AccountId,                                    // 账户id
//     company: &mut Company,                                 // 公司数据
//     company_vec: &mut CompanyVec, // 公司表
// ) -> Option<CompanyId> {
//     // 生成公司id
//     let company_id = gen_company_id::<T>(who, &company_vec);
//     // 设置公司id
//     company.set_id(company_id.clone());
//     // 将公司数据存入到公司表中
//     log::debug!("1. save_company(): 公司表长度: {:?}", company_vec.len());
//     company_vec
//         .try_push(company.clone())
//         .expect("Failed to push company data");
//     log::debug!("2. save_company(): 公司表长度: {:?}", company_vec.len());
//     company_id
// }

// /// 保存报名数据，并返回报名id
// pub fn save_apply<T: Config>(
//     apply_vec: &mut ExhibitionApplyVec, // 报名表
//     exhibition_apply: &mut ExhibitionApply,       // 报名数据
//     company_id: &BoundedVec<u8, ConstU32<16>>,
//     cert_num: u8,   // 可申请证件数量
// ) -> Option<ExApplyId> {
//     // 生成报名id
//     let apply_id = gen_apply_id::<T>(&company_id, &apply_vec);
//     // 设置报名id
//     exhibition_apply.set_id(apply_id.clone());
//     // 设置审核状态：默认通过
//     exhibition_apply.set_status(Some(AuditStatus::Approved(cert_num)));
//     // 将报名数据存入到报名表中
//     apply_vec
//         .try_push(exhibition_apply.clone())
//         .expect("Failed to push apply data");

//     apply_id
// }

// /// 生成公司id
// fn gen_company_id<T: Config>(
//     who: &T::AccountId,
//     company_vec: &CompanyVec,
// ) -> Option<CompanyId> {
//     // 生成公司id
//     let mut company_id: CompanyId = CompanyId::new();
//     // 公司id 由账户id和该公司在公司表中的索引+1组成
//     let who_encoded: Vec<u8> = who.encode();
//     let len_encoded: Vec<u8> = (company_vec.len() as u64 + 1).to_le_bytes().to_vec();

//     for byte in who_encoded.iter() {
//         company_id
//             .try_push(*byte)
//             .expect("Failed to push company id");
//     }

//     for byte in len_encoded.iter() {
//         company_id
//             .try_push(*byte)
//             .expect("Failed to push company id");
//     }
//     Some(company_id)
// }

// /// 生成报名id
// fn gen_apply_id<T: Config>(
//     company_id: &BoundedVec<u8, ConstU32<16>>,
//     apply_vec: &ExhibitionApplyVec,
// ) -> Option<ExApplyId> {
//     // 生成报名id
//     let mut apply_id: ExApplyId = ExApplyId::new();
//     // 报名id 由公司id 和 该报名在报名表中的索引+1组成
//     let len_encoded: Vec<u8> = (apply_vec.len() as u64 + 1).to_le_bytes().to_vec();
//     for byte in company_id.iter() {
//         apply_id.try_push(*byte).expect("Failed to push apply id");
//     }
//     for byte in len_encoded.iter() {
//         apply_id.try_push(*byte).expect("Failed to push apply id");
//     }
//     Some(apply_id)
// }
