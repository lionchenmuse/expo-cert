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
    use frame_support::{ensure, pallet_prelude::*, Blake2_128Concat};
    use frame_system::pallet_prelude::*;
    use model::model::{ApplyId, CertApply, ExhibitionApply};

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
    }

    /// 展会报名表：存储展会报名信息
    #[pallet::storage]
    #[pallet::getter(fn exhibition_applies)]
    pub type ExhibitionApplies<T: Config> = StorageMap<
        _,        
        Blake2_128Concat,
        ApplyId,        // 展会报名ID
        ExhibitionApply // 展会报名信息
    >;

    /// 证件申请表：存储证件申请信息
    #[pallet::storage]
    #[pallet::getter(fn cert_applies)]
    pub type CertApplies<T: Config> = StorageMap<
        _,        
        Blake2_128Concat,
        ApplyId,          // 证件申请ID
        CertApply,            // 证件申请信息
    >;


    #[pallet::event]
    #[pallet::generate_deposit(pub(super) fn deposit_event)]
    pub enum Event<T: Config> {
        /// 展会报名成功
        ExhibitionApplied(T::AccountId, ApplyId),
        /// 证件申请成功
        CertAppliedSucess(T::AccountId, ApplyId),
        /// 证件申请审核通过
        CertApplyApproved(T::AccountId, ApplyId),
        /// 证件申请审核驳回
        CertApplyRejected(T::AccountId, ApplyId),
        /// 证件已制证
        CertMade(T::AccountId, ApplyId),
        /// 证件已发证
        CertIssued(T::AccountId, ApplyId),
    }

    #[pallet::error]
    pub enum Error<T> {
        /// 企业重复报名
        CompanyRepeatedApply,
        /// 企业未报名
        CompanyNotApply,
        /// 企业报名未通过审核
        CompanyNotApproved,
        /// 重复申请证件
        CertRepeatedApply,
        /// 证件申请不存在
        CertApplyNonExistent,
        /// 证件申请状态错误
        CertApplyStatusError,
    }

    #[pallet::hooks]
    // 为上面定义的Pallet结构体实现钩子函数：Hooks<BlockNumberFor<T>>
    impl<T: Config> Hooks<BlockNumberFor<T>> for Pallet<T> {}   // 没有定义钩子函数


    #[pallet::call]
    impl <T: Config> Pallet<T> {
        /// 企业报名，默认审核通过
        #[pallet::call_index(0)]
        #[pallet::weight({0})]
        pub fn company_apply(
            origin: OriginFor<T>,
            mut exhibition_apply: ExhibitionApply,
        ) -> DispatchResult {
            log::debug!("进入company_apply()方法，开始处理。。。。。。。。。。。。");
            let who = ensure_signed(origin)?;

            let id = exhibition_apply.id.clone();
            // 判断是否已经报名，即是否已经存在该展会报名信息
            ensure!(
                !ExhibitionApplies::<T>::contains_key(id.clone()),
                Error::<T>::CompanyRepeatedApply
            );
            // 设置审核状态：审核通过（暂不做公司审核相关，时间不够）
            exhibition_apply.status = model::model::AuditStatus::Approved;

            // 存入展会报名表
            ExhibitionApplies::<T>::insert(id.clone(), exhibition_apply);
            // 触发事件
            Self::deposit_event(Event::ExhibitionApplied(who, id));
            
            log::debug!("company_apply()方法处理结束。。。。。。。。。。。。");
            Ok(())
        }

        /// 申请展会证件
        #[pallet::call_index(1)]
        #[pallet::weight({0})]
        pub fn cert_apply(
            origin: OriginFor<T>,
            mut cert_apply: CertApply,
        ) -> DispatchResult {
            log::debug!("进入cert_apply()方法，开始处理。。。。。。。。。。。。");
            let who = ensure_signed(origin)?;

            let exhibition_apply_id = cert_apply.exhibition_apply_id.clone();

            let exhibition_apply = ExhibitionApplies::<T>::get(exhibition_apply_id.clone());

            // 检查是否已报名展会
            ensure!(
                exhibition_apply.is_some(),
                Error::<T>::CompanyNotApply
            );

            // 检查展会报名是否审核通过
            ensure!(
                exhibition_apply.unwrap().status == model::model::AuditStatus::Approved,
                Error::<T>::CompanyNotApproved
            );

            // 判断是否已经申请证件，即是否已经存在该证件申请信息
            ensure!(
                !CertApplies::<T>::contains_key(cert_apply.id.clone()),
                Error::<T>::CertRepeatedApply
            );
            cert_apply.status = model::model::CertStatus::Pending;

            // 存入证件申请表
            CertApplies::<T>::insert(cert_apply.id.clone(), cert_apply.clone());
            // 触发事件
            Self::deposit_event(Event::CertAppliedSucess(who, cert_apply.id.clone()));
            Ok(())
        }

        /// 通过证件申请
        #[pallet::call_index(2)]
        #[pallet::weight({0})]
        pub fn approve_cert(
            origin: OriginFor<T>,
            cert_apply_id: ApplyId,
        ) -> DispatchResult {
            log::debug!("进入approve_cert()方法，开始处理。。。。。。。。。。。。");
            let who = ensure_signed(origin)?;

            let mut cert_apply = CertApplies::<T>::get(cert_apply_id.clone());
            // 检查证件申请是否存在
            ensure!(
                cert_apply.is_some(),
                Error::<T>::CertApplyNonExistent
            );
            // 检查证件申请状态是否为待审
            ensure!(
                cert_apply.as_ref().unwrap().status == model::model::CertStatus::Pending, 
                Error::<T>::CertApplyStatusError
            );
            // 修改证件申请状态为通过
            cert_apply.as_mut().unwrap().status = model::model::CertStatus::Approved;
            // 更新证件申请信息
            CertApplies::<T>::insert(cert_apply_id.clone(), cert_apply.unwrap());

            // 触发事件
            Self::deposit_event(Event::CertApplyApproved(who, cert_apply_id));
            log::debug!("approve_cert()方法处理结束。。。。。。。。。。。。");
            Ok(())
        }

        /// 驳回证件申请
        #[pallet::call_index(3)]
        #[pallet::weight({0})]
        pub fn reject_cert(
            origin: OriginFor<T>,
            cert_apply_id: ApplyId,
        ) -> DispatchResult {
            log::debug!("进入reject_cert()方法，开始处理。。。。。。。。。。。。");
            let who = ensure_signed(origin)?;

            let mut cert_apply = CertApplies::<T>::get(cert_apply_id.clone());
            // 检查证件申请是否存在
            ensure!(
                cert_apply.is_some(),
                Error::<T>::CertApplyNonExistent
            );
            // 检查证件申请状态是否为待审
            ensure!(
                cert_apply.as_ref().unwrap().status == model::model::CertStatus::Pending, 
                Error::<T>::CertApplyStatusError
            );
            // 修改证件申请状态为驳回
            cert_apply.as_mut().unwrap().status = model::model::CertStatus::Rejected;
            // 更新证件申请信息
            CertApplies::<T>::insert(cert_apply_id.clone(), cert_apply.unwrap());

            // 触发事件
            Self::deposit_event(Event::CertApplyRejected(who, cert_apply_id));

            log::debug!("reject_cert()方法处理结束。。。。。。。。。。。。");
            Ok(())

        }

        /// 已制证
        #[pallet::call_index(4)]
        #[pallet::weight({0})]
        pub fn made_cert(
            origin: OriginFor<T>,
            cert_apply_id: ApplyId,
        ) -> DispatchResult {
            log::debug!("进入made_cert()方法，开始处理。。。。。。。。。。。。");
            let who = ensure_signed(origin)?;

            let mut cert_apply = CertApplies::<T>::get(cert_apply_id.clone());
            // 检查证件申请是否存在
            ensure!(
                cert_apply.is_some(),
                Error::<T>::CertApplyNonExistent
            );
            // 检查证件申请状态是否为通过
            ensure!(
                cert_apply.as_ref().unwrap().status == model::model::CertStatus::Approved, 
                Error::<T>::CertApplyStatusError
            );
            // 修改证件申请状态为已制证
            cert_apply.as_mut().unwrap().status = model::model::CertStatus::Made;
            // 更新证件申请信息
            CertApplies::<T>::insert(cert_apply_id.clone(), cert_apply.unwrap());

            // 触发事件
            Self::deposit_event(Event::CertMade(who, cert_apply_id));

            log::debug!("made_cert()方法处理结束。。。。。。。。。。。。");
            Ok(())
        }

        /// 已发证
        #[pallet::call_index(5)]
        #[pallet::weight({0})]
        pub fn issued_cert(
            origin: OriginFor<T>,
            cert_apply_id: ApplyId,
        ) -> DispatchResult {
            log::debug!("进入issued_cert()方法，开始处理。。。。。。。。。。。。");
            let who = ensure_signed(origin)?;

            let mut cert_apply = CertApplies::<T>::get(cert_apply_id.clone());
            // 检查证件申请是否存在
            ensure!(
                cert_apply.is_some(),
                Error::<T>::CertApplyNonExistent
            );
            // 检查证件申请状态是否为已制证
            ensure!(
                cert_apply.as_ref().unwrap().status == model::model::CertStatus::Made, 
                Error::<T>::CertApplyStatusError
            );
            // 修改证件申请状态为已发证
            cert_apply.as_mut().unwrap().status = model::model::CertStatus::Issued;
            // 更新证件申请信息
            CertApplies::<T>::insert(cert_apply_id.clone(), cert_apply.unwrap());

            // 触发事件
            Self::deposit_event(Event::CertIssued(who, cert_apply_id));

            log::debug!("issued_cert()方法处理结束。。。。。。。。。。。。");
            Ok(())
        }
        

        
    }


}
