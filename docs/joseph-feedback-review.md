# Joseph feedback review — 21 October 2026

| Feedback | Finding and action |
| --- | --- |
| Remove batches from Students | Removed batch tabs, batch search, table column and visible add/edit field. Existing stored batch values are retained when editing a student. Student name/contact search and A–Z order remain. |
| Enrolment form does not match Irini's | The published Word download is a simplified SSTA form. Irini's reference has not been identified in the project. The unrelated international enrolment form in Downloads belongs to a different institution. Exact replacement needs the correct reference. |
| Change 30 years to 40 | Updated Joseph's shared biography and the homepage headline to 40 years / four decades. |
| How to unlock assessments | Existing controls and live access records confirm unlocking is already in use. Go to Assessments, open the student's name, and choose Unlock cluster. the reported learner's Assessment 2 is already unlocked and his enrolment is active. |
| Show names first under Assessments | Students now appear as collapsed, alphabetically ordered names. Opening a name reveals the existing submissions and access/review controls. |
| Remove students from Assessments | Added Remove from assessments, confirmation, a Removed students view and Restore student. This archives only CPP20218 enrolment access; it retains the student profile, other courses, cluster permissions and submitted files. Existing server checks reject downloads/submissions while the enrolment is inactive. |
| My Details should show Joseph | Added a My Details view bound to the signed-in admin's name and email. It does not disguise someone else's signed-in account as Joseph. His correct account details still need confirmation if the stored account is wrong. |
| Learner could not upload Assessment 2 | Confirmed his access is unlocked, but no Assessment 2 submission is recorded. Found a definite upload defect: the previous 50MB file allowance used a server route with Vercel's 4.5MB payload limit, and non-JSON/network errors could leave the form pending. Student and admin uploads now use private signed storage uploads followed by a small authenticated completion request. Added error recovery, actual stored-size verification, signed receipts bound to the user/cluster/actor, repeat-completion protection and refreshed student status. Historical failure logs are outside the hosting plan's retention, so the exact cause of the reported learner's attempt is unconfirmed. |

## Verification

- Read-only production checks confirmed the reported learner's active enrolment, matching authentication identity, unlocked Assessment 2 and absent Assessment 2 submission. No student access or files were changed during investigation.
- Six upload regression tests cover a 6MB direct upload, token tampering/expiry/ownership, non-JSON and network errors, stored-size checks, idempotent completion, resubmission and sign-in/lock/enrolment enforcement.
- Production build and targeted lint passed in an isolated copy using the repository's locked dependencies. The original dependency files were unusually slow to read.
- Browser checks with synthetic records confirmed Students has no batch controls, names sort A–Z, assessment files start collapsed and open on click, My Details shows the current account, and the checked screens have no console warnings/errors.
- This does not claim a successful upload from the reported learner's own browser; his device, file and session were not used.

Run upload regressions with a Node version supporting TypeScript stripping:

```sh
node --test tests/assignment-upload.test.mjs
```
