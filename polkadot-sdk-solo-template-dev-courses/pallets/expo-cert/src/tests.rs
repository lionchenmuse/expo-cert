
use frame_support::assert_ok;

use crate::{mock::{new_test_ext, ExpoCert, RuntimeOrigin, System, Test}, model::model::{BoothType, Company, Exhibition, ExhibitionApply, ParticipationPurpose}, CompanyData, ExhibitionApplyData};

// 为什么单元测试的时候，重复调用同一个pallet::call，并在 BoundedVec存入多个数据后，数据会自己丢失？
// 上一次调用结束BoundedVec显示长度是2，接下来一次调用，
// 刚进入方法内部，未执行任何处理逻辑，BoundedVec长度变成1？

#[test]
fn test_company_apply() {
    new_test_ext().execute_with(|| {
        System::set_block_number(1);

        let mut company: Company = Company::new();
        company.name = "区块链公司1".as_bytes().to_vec().try_into().unwrap();
        company.address = "北京".as_bytes().to_vec().try_into().unwrap();
        company.contact = "张三".as_bytes().to_vec().try_into().unwrap();
        company.email = "tom@abc.com".as_bytes().to_vec().try_into().unwrap();
        company.mobile = "13800000000".as_bytes().to_vec().try_into().unwrap();
        company.business_scope = "区块链技术、WEB3、展会上链".as_bytes().to_vec().try_into().unwrap();

        let mut exhibition_apply: ExhibitionApply = ExhibitionApply::new();
        exhibition_apply.exhibition = Some(Exhibition::CAEXPO);
        exhibition_apply.participation_purpose = Some(ParticipationPurpose::Exhibit);
        exhibition_apply.exhibits = Some("展品1, 展品2".as_bytes().to_vec().try_into().unwrap());
        exhibition_apply.booth_type = Some(BoothType::Standard(3));

        assert_ok!(ExpoCert::company_apply(
            RuntimeOrigin::signed(1), 
            company.clone(), 
            exhibition_apply.clone()));

        let company_vec = CompanyData::<Test>::get(1_u64).unwrap();
        assert_eq!(company_vec.len(), 1);

        assert!(company_vec.contains(&company));
        println!("company id: {:?}", company_vec[0].id());

        let apply_vec = ExhibitionApplyData::<Test>::get(company_vec[0].id().unwrap()).unwrap();
        assert_eq!(apply_vec.len(), 1);
        assert!(apply_vec.contains(&exhibition_apply));
        println!("apply id: {:?}", apply_vec[0].id());
    });
}
