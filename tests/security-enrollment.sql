-- Run inside a transaction with the migration installed, then ROLLBACK.
do $$
declare test_user text := 'security-test-' || gen_random_uuid();
        payment uuid := gen_random_uuid();
        course text := 'certificate-ii-security-operations';
        rejected boolean := false;
begin
  insert into public.student_profiles(user_key,email) values(test_user,'security-test@example.invalid');
  insert into public.course_enrollments(user_key,course_slug,status,amount_paid) values(test_user,course,'active',0);
  if exists(select 1 from public.student_assignment_access where user_key=test_user and unlocked) then raise exception 'Unpaid student has access'; end if;
  insert into public.payment_intents(id,provider,purpose,status,user_key,course_slug,assignment_key,amount_cents,currency)
    values(payment,'stripe','assignment_unlock','pending',test_user,course,'assignment-1',15000,'AUD');
  begin perform public.fulfill_security_cluster_one(payment); exception when others then rejected := true; end;
  if not rejected then raise exception 'Pending payment was accepted'; end if;
  update public.payment_intents set status='paid',amount_cents=100 where id=payment;
  rejected := false;
  begin perform public.fulfill_security_cluster_one(payment); exception when others then rejected := true; end;
  if not rejected then raise exception 'Wrong amount was accepted'; end if;
  update public.payment_intents set amount_cents=15000 where id=payment;
  perform public.fulfill_security_cluster_one(payment);
  if not exists(select 1 from public.student_assignment_access where user_key=test_user and assignment_key='assignment-1' and unlocked) then raise exception 'Cluster 1 did not unlock'; end if;
  if exists(select 1 from public.student_assignment_access where user_key=test_user and assignment_key<>'assignment-1' and unlocked) then raise exception 'Later cluster unlocked'; end if;
  update public.student_assignment_access set unlocked=false where user_key=test_user;
  perform public.fulfill_security_cluster_one(payment);
  if exists(select 1 from public.student_assignment_access where user_key=test_user and unlocked) then raise exception 'Retry undid admin lock'; end if;
  if (select amount_paid from public.course_enrollments where user_key=test_user and course_slug=course) <> 15000 then raise exception 'Payment counted twice'; end if;
  if has_function_privilege('authenticated','public.fulfill_security_cluster_one(uuid)','execute') then raise exception 'Student can invoke fulfillment'; end if;
  if has_table_privilege('authenticated','public.lln_attempts','insert') then raise exception 'Student can forge LLN grade'; end if;
end $$;
