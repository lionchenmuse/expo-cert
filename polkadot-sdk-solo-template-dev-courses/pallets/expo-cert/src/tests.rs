
use frame_support::{assert_noop, assert_ok};
use crate::{mock::{new_test_ext, ExpoCert, RuntimeOrigin, System, Test}, model::model::{ApplyId, AuditStatus, CertApply, ExhibitionApply}, Error};

/// 测试公司报名
#[test]
fn test_company_apply() {
    new_test_ext().execute_with(|| {
        System::set_block_number(1);

        let id = "123456789".to_string();
        let mut apply_id = ApplyId::new();
        for c in id.chars() {
            apply_id.try_push(c as u8).expect("push char to apply_id failed");
        }

        let apply = ExhibitionApply {
            id: apply_id.clone(),
            status: crate::model::model::AuditStatus::Pending,
        };

        assert_ok!(ExpoCert::company_apply(RuntimeOrigin::signed(1), apply.clone()));

        let apply_in_chain = 
            ExpoCert::exhibition_applies(apply_id.clone()).unwrap();

        assert_eq!(apply, apply_in_chain);     
        assert_eq!(apply_in_chain.status, AuditStatus::Approved);   
    });
}

/// 测试多次公司报名
#[test]
fn test_multi_company_apply() {
    new_test_ext().execute_with(|| {
        System::set_block_number(1);

        let id = "123456789".to_string();
        let mut apply_id = ApplyId::new();
        for c in id.chars() {
            apply_id.try_push(c as u8).expect("push char to apply_id failed");
        }

        let apply = ExhibitionApply {
            id: apply_id.clone(),
            status: crate::model::model::AuditStatus::Pending,
        };

        assert_ok!(ExpoCert::company_apply(RuntimeOrigin::signed(1), apply.clone()));
        let apply_in_chain = 
            ExpoCert::exhibition_applies(apply_id.clone()).unwrap();

        assert_eq!(apply, apply_in_chain);        

        apply_id.try_push(0).expect("push char to apply_id failed");

        let apply2 = ExhibitionApply {
            id: apply_id.clone(),
            status: crate::model::model::AuditStatus::Pending,
        };

        assert_ok!(ExpoCert::company_apply(RuntimeOrigin::signed(1), apply2.clone()));
        let apply_in_chain2 = 
            ExpoCert::exhibition_applies(apply_id.clone()).unwrap();

        assert_eq!(apply2, apply_in_chain2);        

    })
}

/// 测试重复报名
#[test]
fn test_repeated_apply() {
    new_test_ext().execute_with(|| {
        System::set_block_number(1);

        let id = "123456789".to_string();
        let mut apply_id = ApplyId::new();
        for c in id.chars() {
            apply_id.try_push(c as u8).expect("push char to apply_id failed");
        }

        let apply = ExhibitionApply {
            id: apply_id.clone(),
            status: crate::model::model::AuditStatus::Pending,
        };

        assert_ok!(ExpoCert::company_apply(RuntimeOrigin::signed(1), apply.clone()));
        let apply_in_chain = 
            ExpoCert::exhibition_applies(apply_id.clone()).unwrap();

        assert_eq!(apply, apply_in_chain);        

        let apply2 = ExhibitionApply {
            id: apply_id.clone(),
            status: crate::model::model::AuditStatus::Pending,
        };

        assert_noop!(
            ExpoCert::company_apply(RuntimeOrigin::signed(1), apply2.clone()),
            Error::<Test>::CompanyRepeatedApply
        );

    })
}

/// 测试证件申请
#[test]
fn test_cert_apply() {
    new_test_ext().execute_with(|| {
        System::set_block_number(1);

        let id = "123456789".to_string();
        let mut apply_id = ApplyId::new();
        for c in id.chars() {
            apply_id.try_push(c as u8).expect("push char to apply_id failed");
        }

        let apply = ExhibitionApply {
            id: apply_id.clone(),
            status: crate::model::model::AuditStatus::Pending,
        };

        assert_ok!(ExpoCert::company_apply(RuntimeOrigin::signed(1), apply.clone()));

        // let id = "987654321".to_string();
        let id = "0x6330343339656432653862393461626239356165376332313133313863646239".to_string();
        let mut cert_apply_id = ApplyId::new();
        for c in id.chars() {
            cert_apply_id.try_push(c as u8).expect("push char to apply_id failed");
        }

        let cert_apply = CertApply {
            id: cert_apply_id.clone(),
            exhibition_apply_id: apply_id.clone(),
            status: crate::model::model::CertStatus::Pending,
        };

        assert_ok!(ExpoCert::cert_apply(RuntimeOrigin::signed(1), cert_apply.clone()));

        let cert_apply_in_chain = 
            ExpoCert::cert_applies(cert_apply_id.clone()).unwrap();

        assert_eq!(cert_apply, cert_apply_in_chain);        
    })
}

/// 测试公司未报名直接申请证件
#[test]
fn test_cert_apply_failure() {
    new_test_ext().execute_with(|| {
        System::set_block_number(1);

        // 测试未报名直接申请证件
        let id = "123456789".to_string();
        let mut apply_id = ApplyId::new();
        for c in id.chars() {
            apply_id.try_push(c as u8).expect("push char to apply_id failed");
        }

        let id = "987654321".to_string();
        let mut cert_apply_id = ApplyId::new();
        for c in id.chars() {
            cert_apply_id.try_push(c as u8).expect("push char to apply_id failed");
        }

        let cert_apply = CertApply {
            id: cert_apply_id.clone(),
            exhibition_apply_id: apply_id.clone(),
            status: crate::model::model::CertStatus::Pending,
        };

        assert_noop!(
            ExpoCert::cert_apply(RuntimeOrigin::signed(1), cert_apply.clone()),
            Error::<Test>::CompanyNotApply
        );
    });
}

/// 测试证件重复申请
#[test]
fn test_cert_apply_repeated() {
    new_test_ext().execute_with(|| {
        System::set_block_number(1);

        let id = "123456789".to_string();
        let mut apply_id = ApplyId::new();
        for c in id.chars() {
            apply_id.try_push(c as u8).expect("push char to apply_id failed");
        }

        let apply = ExhibitionApply {
            id: apply_id.clone(),
            status: crate::model::model::AuditStatus::Pending,
        };

        assert_ok!(ExpoCert::company_apply(RuntimeOrigin::signed(1), apply.clone()));

        let id = "987654321".to_string();
        let mut cert_apply_id = ApplyId::new();
        for c in id.chars() {
            cert_apply_id.try_push(c as u8).expect("push char to apply_id failed");
        }

        let cert_apply = CertApply {
            id: cert_apply_id.clone(),
            exhibition_apply_id: apply_id.clone(),
            status: crate::model::model::CertStatus::Pending,
        };

        assert_ok!(ExpoCert::cert_apply(RuntimeOrigin::signed(1), cert_apply.clone()));

        assert_noop!(
            ExpoCert::cert_apply(RuntimeOrigin::signed(1), cert_apply.clone()),
            Error::<Test>::CertRepeatedApply
        );
    });
}

/// 测试证件审核通过
#[test]
fn test_approve_cert_apply() {
    new_test_ext().execute_with(|| {
        System::set_block_number(1);

        let id = "123456789".to_string();
        let mut apply_id = ApplyId::new();
        for c in id.chars() {
            apply_id.try_push(c as u8).expect("push char to apply_id failed");
        }

        let apply = ExhibitionApply {
            id: apply_id.clone(),
            status: crate::model::model::AuditStatus::Pending,
        };
        assert_ok!(ExpoCert::company_apply(RuntimeOrigin::signed(1), apply.clone()));

        let id = "6330343339656432653862393461626239356165376332313133313863646239".to_string();
        let mut cert_apply_id = ApplyId::new();
        for c in id.chars() {
            cert_apply_id.try_push(c as u8).expect("push char to apply_id failed");
        }

        let cert_apply = CertApply {
            id: cert_apply_id.clone(),
            exhibition_apply_id: apply_id.clone(),
            status: crate::model::model::CertStatus::Pending,
        };
        assert_ok!(ExpoCert::cert_apply(RuntimeOrigin::signed(1), cert_apply.clone()));

        assert_ok!(ExpoCert::approve_cert(RuntimeOrigin::signed(1), cert_apply_id.clone()));

        let cert_apply_in_chain = 
            ExpoCert::cert_applies(cert_apply_id.clone()).unwrap();
        assert_eq!(cert_apply_in_chain.status, crate::model::model::CertStatus::Approved);        

        // 测试重复审核通过
        assert_noop!(
            ExpoCert::approve_cert(RuntimeOrigin::signed(1), cert_apply_id.clone()),
            Error::<Test>::CertApplyStatusError
        );
    });
}

/// 测试证件审核驳回
#[test]
fn test_reject_cert_apply() {
    new_test_ext().execute_with(|| {
        System::set_block_number(1);

        let id = "123456789".to_string();
        let mut apply_id = ApplyId::new();
        for c in id.chars() {
            apply_id.try_push(c as u8).expect("push char to apply_id failed");
        }

        let apply = ExhibitionApply {
            id: apply_id.clone(),
            status: crate::model::model::AuditStatus::Pending,
        };
        assert_ok!(ExpoCert::company_apply(RuntimeOrigin::signed(1), apply.clone()));

        let id = "987654321".to_string();
        let mut cert_apply_id = ApplyId::new();
        for c in id.chars() {
            cert_apply_id.try_push(c as u8).expect("push char to apply_id failed");
        }

        let cert_apply = CertApply {
            id: cert_apply_id.clone(),
            exhibition_apply_id: apply_id.clone(),
            status: crate::model::model::CertStatus::Pending,
        };
        assert_ok!(ExpoCert::cert_apply(RuntimeOrigin::signed(1), cert_apply.clone()));

        assert_ok!(ExpoCert::approve_cert(RuntimeOrigin::signed(1), cert_apply_id.clone()));

        let cert_apply_in_chain = 
            ExpoCert::cert_applies(cert_apply_id.clone()).unwrap();
        assert_eq!(cert_apply_in_chain.status, crate::model::model::CertStatus::Approved);

        // 测试重复审核通过和驳回
        assert_noop!(
            ExpoCert::approve_cert(RuntimeOrigin::signed(1), cert_apply_id.clone()),
            Error::<Test>::CertApplyStatusError
        );
        assert_noop!(
            ExpoCert::reject_cert(RuntimeOrigin::signed(1), cert_apply_id.clone()),
            Error::<Test>::CertApplyStatusError
        );
    });
}

/// 测试已制证
#[test]
fn test_cert_made() {
    new_test_ext().execute_with(|| {
        System::set_block_number(1);

        let id = "123456789".to_string();
        let mut apply_id = ApplyId::new();
        for c in id.chars() {
            apply_id.try_push(c as u8).expect("push char to apply_id failed");
        }

        let apply = ExhibitionApply {
            id: apply_id.clone(),
            status: crate::model::model::AuditStatus::Pending,
        };
        assert_ok!(ExpoCert::company_apply(RuntimeOrigin::signed(1), apply.clone()));

        let id = "987654321".to_string();
        let mut cert_apply_id = ApplyId::new();
        for c in id.chars() {
            cert_apply_id.try_push(c as u8).expect("push char to apply_id failed");
        }

        let cert_apply = CertApply {
            id: cert_apply_id.clone(),
            exhibition_apply_id: apply_id.clone(),
            status: crate::model::model::CertStatus::Pending,
        };
        assert_ok!(ExpoCert::cert_apply(RuntimeOrigin::signed(1), cert_apply.clone()));

        assert_ok!(ExpoCert::approve_cert(RuntimeOrigin::signed(1), cert_apply_id.clone()));

        let cert_apply_in_chain = 
            ExpoCert::cert_applies(cert_apply_id.clone()).unwrap();
        assert_eq!(cert_apply_in_chain.status, crate::model::model::CertStatus::Approved);

        assert_ok!(ExpoCert::made_cert(RuntimeOrigin::signed(1), cert_apply_id.clone()));

        let cert_apply_in_chain = 
            ExpoCert::cert_applies(cert_apply_id.clone()).unwrap();
        assert_eq!(cert_apply_in_chain.status, crate::model::model::CertStatus::Made);

        // 测试重复制证
        assert_noop!(
            ExpoCert::made_cert(RuntimeOrigin::signed(1), cert_apply_id.clone()),
            Error::<Test>::CertApplyStatusError
        );
    });
}

/// 测试已发证
#[test]
fn test_issued_cert() {
    new_test_ext().execute_with(|| {
        System::set_block_number(1);

        let id = "123456789".to_string();
        let mut apply_id = ApplyId::new();
        for c in id.chars() {
            apply_id.try_push(c as u8).expect("push char to apply_id failed");
        }

        let apply = ExhibitionApply {
            id: apply_id.clone(),
            status: crate::model::model::AuditStatus::Pending,
        };
        assert_ok!(ExpoCert::company_apply(RuntimeOrigin::signed(1), apply.clone()));

        let id = "987654321".to_string();
        let mut cert_apply_id = ApplyId::new();
        for c in id.chars() {
            cert_apply_id.try_push(c as u8).expect("push char to apply_id failed");
        }

        let cert_apply = CertApply {
            id: cert_apply_id.clone(),
            exhibition_apply_id: apply_id.clone(),
            status: crate::model::model::CertStatus::Pending,
        };
        assert_ok!(ExpoCert::cert_apply(RuntimeOrigin::signed(1), cert_apply.clone()));

        assert_ok!(ExpoCert::approve_cert(RuntimeOrigin::signed(1), cert_apply_id.clone()));

        let cert_apply_in_chain = 
            ExpoCert::cert_applies(cert_apply_id.clone()).unwrap();
        assert_eq!(cert_apply_in_chain.status, crate::model::model::CertStatus::Approved);

        assert_ok!(ExpoCert::made_cert(RuntimeOrigin::signed(1), cert_apply_id.clone()));

        assert_ok!(ExpoCert::issued_cert(RuntimeOrigin::signed(1), cert_apply_id.clone()));

        let cert_apply_in_chain = 
            ExpoCert::cert_applies(cert_apply_id.clone()).unwrap();
        assert_eq!(cert_apply_in_chain.status, crate::model::model::CertStatus::Issued);

        // 测试重复发证
        assert_noop!(
            ExpoCert::issued_cert(RuntimeOrigin::signed(1), cert_apply_id.clone()),
            Error::<Test>::CertApplyStatusError
        );
    });
}

