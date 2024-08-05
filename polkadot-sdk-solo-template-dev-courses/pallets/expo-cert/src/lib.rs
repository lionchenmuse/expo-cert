#![cfg_attr(not(feature = "std"), no_std)]

// Re-export pallet items so that they can be accessed from the crate namespace.
pub use pallet::*;

#[cfg(test)]
mod mock;

#[cfg(test)]
mod tests;

mod model;
mod service;



#[frame_support::pallet]
pub mod pallet {
    // Import various useful types required by all FRAME pallets.
    use super::*;
    use frame_support::pallet_prelude::*;
    use frame_system::pallet_prelude::*;
    use model::model::{Company, ExhibitionApply};
    use service::service::*;

    // The `Pallet` struct serves as a placeholder to implement traits, methods and dispatchables
    // (`Call`s) in this pallet.
    #[pallet::pallet]
    pub struct Pallet<T>(_);

    /// The pallet's configuration trait.
    ///
    /// All our types and constants a pallet depends on must be declared here.
    /// These types are defined generically and made concrete when the pallet is declared in the
    /// `runtime/src/lib.rs` file of your chain.
    #[pallet::config]
    pub trait Config: frame_system::Config {
        /// The overarching runtime event type.
        type RuntimeEvent: From<Event<Self>> + IsType<<Self as frame_system::Config>::RuntimeEvent>;
        /// 每个用户的公司表最大上限
        #[pallet::constant]
        type MaxCompanyVecLimit: Get<u32>;
        /// 每家公司报名展会数量的最大上限
        #[pallet::constant]
        type MaxExhibitionApplyVecLimit: Get<u32>;
        /// 报名审核通过后，默认可申请证件数量
        #[pallet::constant]
        type DefaultCertLimit: Get<u8>;
    }

    /// 公司表：每个用户最多给1000家公司报名
    pub type CompanyVec = BoundedVec<Company, ConstU32<100>>;
    /// 展会报名表：每家公司最多报名3个展会
    pub type ExhibitionApplyVec = BoundedVec<ExhibitionApply, ConstU32<3>>;

    /// 存储公司信息
    /// 用户可根据自己的id 找到公司信息，方便查询
    #[pallet::storage]
    #[pallet::getter(fn company_data)]
    pub type CompanyData<T: Config> = StorageMap<
        _,
        Identity,
        T::AccountId,
        CompanyVec,
    >;

    /// 存储报名信息
    /// 审核人员可快速遍历报名信息
    #[pallet::storage]
    #[pallet::getter(fn exhibition_apply_data)]
    pub type ExhibitionApplyData<T: Config> = StorageMap<
        _,
        Blake2_128Concat,
        BoundedVec<u8, ConstU32<16>>,    // key 是 company id
        ExhibitionApplyVec
    >;

    #[pallet::event]
    #[pallet::generate_deposit(pub(super) fn deposit_event)]
    pub enum Event<T: Config> {
        /// 展会报名成功
        ExhibitionApplied(T::AccountId, Company, ExhibitionApply),
        /// 报名审核通过
        ExhibitionApplyApproved(T::AccountId, Company, ExhibitionApply),
        /// 报名审核不通过
        ExhibitionApplyAuditRejected(T::AccountId, Company, ExhibitionApply),
    }

    #[pallet::error]
    pub enum Error<T> {
        /// 企业报名数量已达上限
        MeetCompanyApplyLimit,
        /// 企业的展会报名数量已达上限
        MeetExhibitionApplyLimit,
        /// 企业已报名该展会
        CompanyAlreadyApplied,
    }

    #[pallet::hooks]
    // 为上面定义的Pallet结构体实现钩子函数：Hooks<BlockNumberFor<T>>
    impl<T: Config> Hooks<BlockNumberFor<T>> for Pallet<T> {}   // 没有定义钩子函数


    #[pallet::call]
    impl <T: Config> Pallet<T> {
        #[pallet::call_index(0)]
        #[pallet::weight({0})]
        pub fn company_apply(
            origin: OriginFor<T>,
            mut company: Company,
            mut exhibition_apply: ExhibitionApply,
        ) -> DispatchResult {
            let who = ensure_signed(origin)?;
            match CompanyData::<T>::get(&who).as_mut() {
                // data: CompanyVec
                Some(mut data) => {     // 如果该用户的公司表已存在                  
                    if !company_contained(&data, &company) { // 如果公司不在用户的公司表中
                        // 判断用户报名的公司是否已达数量上限
                        // println!("公司表长度：{:?}", data.len());
                        ensure!(data.len() < T::MaxCompanyVecLimit::get() as usize, Error::<T>::MeetCompanyApplyLimit);
                        // 将公司数据存入到公司表中，并返回公司id
                        let company_id = save_company::<T>(&who, &mut company, &mut data);
                        // println!("公司表长度：{:?}", data.len());
                        // 该公司从未报名，创建该公司的报名表
                        let mut apply_vec = ExhibitionApplyVec::new();
                        // 将报名数据存入到报名表中
                        save_apply::<T>(&mut apply_vec, &mut exhibition_apply, company_id.as_ref().unwrap(), T::DefaultCertLimit::get());
                        // 建立公司和报名表之间的映射关系
                        ExhibitionApplyData::<T>::insert(company.id().unwrap().clone(), apply_vec);

                    } else {    // 如果该公司已在用户的公司表中，                      
                        // 检查该公司是否有对应的报名表
                        match ExhibitionApplyData::<T>::get(company.id().unwrap().clone()).as_mut() {
                            // apply_data: BoundedVec<ExhibitionApply, ConstU32<3>>
                            Some(mut apply_data) => {   // 如果该公司有对应的报名表
                                if apply_contained(&apply_data, &exhibition_apply) {
                                    // 如果该公司已报名该展会，报错返回
                                    return Err(Error::<T>::CompanyAlreadyApplied.into());
                                } 
                                // 如果该公司未报名该展会
                                save_apply::<T>(&mut apply_data, &mut exhibition_apply, company.id().as_ref().unwrap(), T::DefaultCertLimit::get());                     
                            }, 
                            None => {
                                // 该公司未报名任何展会，没有对应的报名表
                                // 创建该公司的报名表
                                let mut apply_vec: BoundedVec<ExhibitionApply, ConstU32<3>> = ExhibitionApplyVec::new();
                                // 将报名数据存入到报名表中
                                save_apply::<T>(&mut apply_vec, &mut exhibition_apply, company.id().as_ref().unwrap(), T::DefaultCertLimit::get());
                                // 建立公司和报名表之间的映射关系
                                ExhibitionApplyData::<T>::insert(company.id().unwrap().clone(), apply_vec);
                            }
                        }
                    }
                },
                None => {   // 该用户没有公司表！
                    // 该用户从未为任何公司报名，全新创建
                    brand_new_apply::<T>(&who, &mut company, &mut exhibition_apply, T::DefaultCertLimit::get());
                }
            }
            // 触发事件
            Self::deposit_event(Event::ExhibitionApplied(who, company.clone(), exhibition_apply.clone()));
            Ok(())
        }

        
    }
    /// 全新报名：新公司+新报名
    fn brand_new_apply<T: Config>(
        who: &T::AccountId,
        company: &mut Company,
        exhibition_apply: &mut ExhibitionApply,
        cert_num: u8,   // 可申请证件数量
    ) {
        // 如果该代表团对应的公司表不存在，则创建公司表
        let mut company_vec: CompanyVec = CompanyVec::new();
        // 将公司数据存入到公司表中，并返回公司id
        let company_id = save_company::<T>(who, company, &mut company_vec);
        // 建立用户和公司表之间的映射关系
        CompanyData::<T>::insert(who.clone(), company_vec);

        // 新建报名表
        let mut apply_vec: BoundedVec<ExhibitionApply, ConstU32<3>> = BoundedVec::new();
        // 将报名数据存入到报名表中
        save_apply::<T>(&mut apply_vec, exhibition_apply, company_id.as_ref().unwrap(), cert_num);
        // 建立公司和报名表之间的映射关系
        ExhibitionApplyData::<T>::insert(company.id().unwrap(), apply_vec);
    }

    /// 判断用户的公司表中是否存在该公司
    fn company_contained(company_data: &CompanyVec, company: &Company) -> bool {
        for c in company_data.iter() {
            if *c == *company { // 根据公司名进行比较
                return true;
            }
        }
        return false;
    }

    /// 判断公司的报名表中是否已报名该展会
    fn apply_contained(apply_data: &ExhibitionApplyVec, apply: &ExhibitionApply) -> bool {
        for a in apply_data.iter() {
            if *a == *apply {   // 根据公司id和报名展会进行比较
                return true;
            }
        }
        return false;
    }

}
