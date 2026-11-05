// Extraction candidate, not a compatibility patch. Node >=22, no dependencies.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const root=process.cwd(), source=path.join(root,'dist'), out=path.join(root,'_site');
const reportDir=path.join(root,'pages-reports');
const base='/manifelator-yokohama/';
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
if(JSON.parse(fs.readFileSync(path.join(root,'package.json'))).version!=='0.35.0')throw Error('Expected beta 0.35.0 source');
const roots=new Set(['screen-guide','open-data','data','vendor','videos','downloads','maps','citizens','manifestos']);
const exts=new Set(['.html','.css','.js','.mjs','.json','.jsonld','.ttl','.csv','.md','.txt','.svg','.png','.jpg','.jpeg','.webp','.gif','.ico','.pdf','.mp4','.webm','.woff','.woff2','.ttf','.otf','.wasm','.gz','.bcmap']);
const rows=[],issues=[];
fs.rmSync(out,{recursive:true,force:true});fs.mkdirSync(out,{recursive:true});fs.mkdirSync(reportDir,{recursive:true});
function visit(dir,rel=''){
 for(const entry of fs.readdirSync(dir,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name))){
  const name=rel?rel+'/'+entry.name:entry.name, full=path.join(dir,entry.name);
  if(entry.isSymbolicLink())throw Error('Symlink rejected: '+name);
  if(entry.name.startsWith('.')||['client','server','node_modules'].includes(entry.name))continue;
  if(entry.isDirectory()){if(roots.has(name.split('/')[0]))visit(full,name);continue;}
  if(!entry.isFile()||(!exts.has(path.extname(name).toLowerCase())&&!['LICENSE','NOTICE'].includes(entry.name)))continue;
  const bytes=fs.readFileSync(full);const target=path.join(out,name);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,bytes);
  rows.push({path:name,bytes:bytes.length,sha256:hash(bytes)});
  if(/\.(html|css|js|mjs|json|jsonld|ttl|csv)$/.test(name)){
   const text=bytes.toString('utf8');
   for(const [kind,re] of [['api-reference',/\/api\//],['old-site-reference',/manifelator-yokohama\.chobery\.chatgpt\.site/],['root-reference',/(?:href|src|action)=["']\/(?!\/)|(?:fetch\(|url\()["']?\/(?!\/)/]]){
    if(re.test(text))issues.push({path:name,kind});
   }
  }
 }
}
visit(source);
if(!rows.some(r=>r.path==='index.html'))throw Error('Missing index.html');
fs.writeFileSync(path.join(out,'.nojekyll'),'');rows.push({path:'.nojekyll',bytes:0,sha256:hash('')});rows.sort((a,b)=>a.path.localeCompare(b.path));
const digest=hash(JSON.stringify(rows));
const report={sourceVersion:'0.35.0',basePath:base,files:rows.length,bytes:rows.reduce((n,r)=>n+r.bytes,0),digest,issues,releaseReady:false,note:'Reference scan is advisory, not a runtime or secret audit. Review every occurrence; preserve provenance URLs.'};
fs.writeFileSync(path.join(reportDir,'files.json'),JSON.stringify(rows,null,2));
fs.writeFileSync(path.join(reportDir,'readiness.json'),JSON.stringify(report,null,2));
fs.writeFileSync(path.join(reportDir,'files.tsv'),'path\tbytes\tsha256\n'+rows.map(r=>[r.path,r.bytes,r.sha256].join('\t')).join('\n')+'\n');
console.log(JSON.stringify({files:report.files,bytes:report.bytes,referenceFindings:issues.length,releaseReady:false}));
if(process.argv.includes('--release'))throw Error('Release blocked: static capability UI, subpath and LOD adaptation plus acceptance tests are not implemented. Replace this gate only after the documented review.');
