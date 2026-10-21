import { test } from 'node:test';
import assert from 'node:assert/strict';
import { signUploadTicket, verifyUploadTicket } from '../src/lib/assignment-upload-ticket.ts';
import { uploadAssessmentFile } from '../src/lib/assignment-upload-client.ts';

const ticket = { userKey: 'student-a', assignmentKey: 'assignment-2', path: 'student-a/assignment-2/file', fileName: 'assessment.pdf', size: 6*1024*1024, mimeType: 'application/pdf', actor: 'student', expires: Date.now()+60000 };
test('upload receipt is bound to student, assignment, actor and expiry', () => {
 const signed = signUploadTicket(ticket, 'test-secret');
 assert.deepEqual(verifyUploadTicket(signed, 'test-secret', 'student-a', 'assignment-2', 'student'),ticket);
 for(const args of [['student-b','assignment-2','student'],['student-a','assignment-1','student'],['student-a','assignment-2','admin']]) assert.throws(()=>verifyUploadTicket(signed,'test-secret',...args));
 assert.throws(()=>verifyUploadTicket(signed+'x','test-secret','student-a','assignment-2','student'));
 assert.throws(()=>verifyUploadTicket(signUploadTicket({...ticket,expires:0},'test-secret'),'test-secret','student-a','assignment-2','student'));
});
test('6 MB file goes directly to signed storage, only metadata goes through API', async () => {
 const original = globalThis.fetch;
 const calls=[];
 globalThis.fetch=async(url, options)=>{
  calls.push({url,options});
  if(calls.length===1) return Response.json({uploadUrl:'https://storage.example/upload',receipt:'receipt'});
  if(calls.length===2) return new Response('',{status:200});
  return Response.json({success:true});
 };
 try {
  const file = new File([new Uint8Array(6*1024*1024)],'assessment-2.pdf',{type:'application/pdf'});
  await uploadAssessmentFile('/submit',file,{studentComment:'Completed'});
  assert.equal(calls.length,3);
  assert.equal(JSON.parse(calls[0].options.body).size,file.size);
  assert.equal(calls[1].url,'https://storage.example/upload');
  assert.equal(calls[1].options.method,'PUT');
  assert.equal(calls[1].options.body,file);
  assert.equal(JSON.parse(calls[2].options.body).receipt,'receipt');
  assert.ok(calls[0].options.body.length<1000 && calls[2].options.body.length<1000);
 } finally { globalThis.fetch=original; }
});
test('oversized files, non-JSON failures and network failures produce recoverable errors',async()=>{
 const original=globalThis.fetch;
 try {
  await assert.rejects(uploadAssessmentFile('/submit',new File([new Uint8Array(50*1024*1024+1)],'large.pdf')),/50MB/);
  globalThis.fetch=async()=>new Response('Request too large',{status:413});
  await assert.rejects(uploadAssessmentFile('/submit',new File(['data'],'a.pdf')),/file size/);
  globalThis.fetch=async()=>{throw new Error('Network unavailable');};
  await assert.rejects(uploadAssessmentFile('/submit',new File(['data'],'a.pdf')),/Network unavailable/);
 } finally {globalThis.fetch=original;}
});

// Exercise storage verification and database persistence with an isolated adapter.
import { createRequire } from 'node:module';
import fs from 'node:fs';
import vm from 'node:vm';
const require=createRequire(import.meta.url);
const ts=require('typescript');
const ticketApi=require('../src/lib/assignment-upload-ticket.ts');
const module={exports:{}};
vm.runInNewContext(ts.transpileModule(fs.readFileSync(new URL('../src/lib/assignment-upload-server.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{module,exports:module.exports,process:{env:{SUPABASE_SERVICE_ROLE_KEY:'test-secret'}},Request,File,Buffer,Date,require:(name)=>name==='@/lib/cpp20218'?{CPP20218_COURSE_SLUG:'security'}:name==='@/lib/assignment-upload-ticket'?ticketApi:require(name)});
const {processAssignmentUpload}=module.exports;
function adapter(){
 const state={record:null,removed:[],size:6*1024*1024,fail:false};
 const bucket={createSignedUploadUrl:async()=>({data:{signedUrl:'https://storage.example/upload'}}),info:async()=>({data:{size:state.size}}),remove:async paths=>{state.removed.push(...paths);return{};}};
 const db={storage:{from:()=>bucket},from:()=>({select(){return this;},eq(){return this;},maybeSingle:async()=>({data:state.record}),upsert:async record=>{if(state.fail)return {error:{message:'Database unavailable'}};state.record=record;return{};}})};
 return {state,db};
}
const jsonRequest=body=>new Request('https://ssta.example/submit',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
test('direct upload completes only after verifying stored file and is idempotent',async()=>{
 const {state,db}=adapter();
 const result=await processAssignmentUpload(jsonRequest({stage:'prepare',size:state.size,fileName:'Cluster 2.pdf',mimeType:'application/pdf'}),db,'student-a','assignment-2');
 await processAssignmentUpload(jsonRequest({stage:'complete',receipt:result.receipt,studentComment:'Completed'}),db,'student-a','assignment-2');
 assert.equal(state.record.file_size,6*1024*1024);
 assert.equal(state.record.status,'submitted');
 assert.equal(state.record.assignment_key,'assignment-2');
 state.record.status='satisfactory';
 await processAssignmentUpload(jsonRequest({stage:'complete',receipt:result.receipt}),db,'student-a','assignment-2');
 assert.equal(state.record.status,'satisfactory');
 assert.equal(state.record.resubmission_count,0);
});
test('wrong file size and forged receipts cannot create a submission; failed save retains old file',async()=>{
 const {state,db}=adapter();
 const result=await processAssignmentUpload(jsonRequest({stage:'prepare',size:state.size,fileName:'Cluster 2.pdf'}),db,'student-a','assignment-2');
 state.size=1;
 await assert.rejects(processAssignmentUpload(jsonRequest({stage:'complete',receipt:result.receipt}),db,'student-a','assignment-2'),/size/);
 assert.equal(state.record,null);
 await assert.rejects(processAssignmentUpload(jsonRequest({stage:'complete',receipt:result.receipt}),db,'other','assignment-2'),/belong/);
 state.size=6*1024*1024;
 state.record={file_path:'old.pdf',resubmission_count:0};state.fail=true;
 await assert.rejects(processAssignmentUpload(jsonRequest({stage:'complete',receipt:result.receipt}),db,'student-a','assignment-2'),/Database/);
 assert.deepEqual(state.removed,[]);
 state.fail=false;
 await processAssignmentUpload(jsonRequest({stage:'complete',receipt:result.receipt}),db,'student-a','assignment-2');
 assert.equal(state.record.resubmission_count,1);
 assert.deepEqual(state.removed,['old.pdf']);
});

function loadStudentRoute(state) {
 const module={exports:{}};
 const code=ts.transpileModule(fs.readFileSync(new URL('../src/app/api/student/assignments/[assignmentKey]/submit/route.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const db={from:table=>({select(){return this;},eq(){return this;},maybeSingle:async()=>({data:state[table]?{id:'id'}:null})})};
 vm.runInNewContext(code,{module,exports:module.exports,require:name=>({
  'next/server':{NextResponse:{json:(data,init)=>Response.json(data,init)}},
  '@/lib/auth':{getCurrentUser:async()=>state.user?{id:'student-a'}:null},
  '@/lib/supabase':{getSupabaseAdmin:()=>db},
  '@/lib/cpp20218':{CPP20218_COURSE_SLUG:'security'},
  '@/lib/assignment-upload-server':{processAssignmentUpload:async()=>{state.calls++;return{success:true};}},
 })[name]});
 return module.exports.POST;
}
test('student endpoint rechecks sign-in, lock and active enrolment before prepare or completion',async()=>{
 const state={user:false,student_assignment_access:true,course_enrollments:true,calls:0};
 const POST=loadStudentRoute(state);
 const request=()=>jsonRequest({stage:'complete',receipt:'receipt'});
 const params={params:Promise.resolve({assignmentKey:'assignment-2'})};
 assert.equal((await POST(request(),params)).status,401);
 state.user=true;state.student_assignment_access=false;
 assert.equal((await POST(request(),params)).status,403);
 state.student_assignment_access=true;state.course_enrollments=false;
 assert.equal((await POST(request(),params)).status,403);
 assert.equal(state.calls,0);
 state.course_enrollments=true;
 assert.equal((await POST(request(),params)).status,200);
 assert.equal(state.calls,1);
});
