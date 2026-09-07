import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,cp,readFile,writeFile,rm,mkdir} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {escapeHTML,safeURL,localHref} from '../src/templates/html.mjs';
import {loadModel,validateModel,assetPath} from '../scripts/model.mjs';
import {build} from '../scripts/build.mjs';
import {renderPages} from '../src/templates/pages.mjs';

const root=path.resolve(fileURLToPath(new URL('..',import.meta.url)));
const digest=text=>createHash('sha256').update(text).digest('hex');
async function fixture(t){
 const dir=await mkdtemp(path.join(tmpdir(),'nra-test-'));
 for(const folder of ['content','src','public'])await cp(path.join(root,folder),path.join(dir,folder),{recursive:true});
 t.after(()=>rm(dir,{recursive:true,force:true}));return dir;
}
const readJSON=async p=>JSON.parse(await readFile(p,'utf8'));
const writeJSON=(p,data)=>writeFile(p,JSON.stringify(data,null,2)+'\n');

test('the delivered content passes validation',async()=>{
 const report=await validateModel(await loadModel(root));assert.deepEqual(report.errors,[]);assert.ok(report.warnings.some(w=>w.includes('noindex')));
});
test('untrusted content is escaped, not interpreted as HTML',()=>{
 assert.equal(escapeHTML('<img src=x onerror="alert(1)"> & \'test\''),'&lt;img src=x onerror=&quot;alert(1)&quot;&gt; &amp; &#39;test&#39;');
});
test('external links reject executable protocols and credentials',()=>{
 for(const value of ['javascript:alert(1)','data:text/html,evil','http://example.com','https://user:password@example.com'])assert.throws(()=>safeURL(value));
 assert.equal(safeURL('https://www.nordicrentaway.com/contact'),'https://www.nordicrentaway.com/contact');
});
test('local assets cannot escape the public asset folder',()=>{
 for(const value of ['assets/../secret.json','../assets/photo.jpg','https://example.com/a.jpg','assets//bad.jpg','assets/a\\b.jpg'])assert.throws(()=>assetPath(value));
 assert.equal(assetPath('assets/photos/home-640.webp'),'assets/photos/home-640.webp');
});
test('relative navigation works from deeply nested local HTML',()=>{
 assert.equal(localHref('properties/seacoast/index.html','contact/index.html'),'../../contact/index.html');
 assert.equal(localHref('services/index.html','index.html#how-it-works'),'../index.html#how-it-works');
});
test('duplicate property slugs are rejected',async()=>{
 const model=await loadModel(root);model.properties[1].slug=model.properties[0].slug;
 assert.ok((await validateModel(model)).errors.some(e=>e.includes('Duplicate property slug')));
});
test('missing image references are rejected rather than guessed',async()=>{
 const model=await loadModel(root);model.properties[0].mediaIds=['not-present'];
 assert.ok((await validateModel(model)).errors.some(e=>e.includes('Unknown media ID')));
});
test('an approved image requires real local files and metadata',async()=>{
 const model=await loadModel(root);model.media[0].status='approved';model.media[0].width=null;model.media[0].fallback='assets/missing.jpg';
 assert.ok((await validateModel(model)).errors.some(e=>e.includes('positive integer')));
 assert.ok((await validateModel(model)).errors.some(e=>e.includes('public/assets')));
});
test('draft property data stays outside published HTML',async()=>{
 const model=await loadModel(root);model.properties.push({id:'draft-xyz',slug:'draft-home',status:'draft',order:20});
 assert.deepEqual((await validateModel(model)).errors,[]);
 assert.equal(renderPages(model).size,13);
 assert.ok(![...renderPages(model).values()].join('').includes('draft-home'));
});
test('unknown optional facts are omitted rather than rendered as zero',async()=>{
 const model=await loadModel(root);const item=model.properties[0];item.guests=null;item.bedrooms=null;item.bathrooms=null;
 const html=renderPages(model).get(`properties/${item.slug}/index.html`);
 assert.ok(!html.includes('<dt>Bathrooms</dt>'));assert.ok(!html.includes('<dt>Bedrooms</dt>'));assert.ok(!html.includes('<dt>Guests</dt>'));
});
test('a project contribution requires an explicit evidence source',async()=>{
 const model=await loadModel(root);model.properties[0].scope={en:'Interior renovation'};
 assert.ok((await validateModel(model)).errors.some(e=>e.includes('project contribution')));
});
test('zero public properties renders a real empty state without dead links',async()=>{
 const model=await loadModel(root);model.properties.forEach(p=>p.status='draft');
 const pages=renderPages(model);assert.equal(pages.size,10);assert.ok(pages.get('properties/index.html').includes('Our property selection is being prepared.'));
});
test('the contact form cannot be enabled before real delivery is implemented',async()=>{
 const model=await loadModel(root);model.pages.contact.en.form.enabled=true;
 assert.ok((await validateModel(model)).errors.some(e=>e.includes('form is deliberately not connected')));
});
test('redirect cycles are rejected',async()=>{
 const model=await loadModel(root);model.redirects=[{from:'/a',to:'/b'},{from:'/b',to:'/a'}];
 assert.ok((await validateModel(model)).errors.some(e=>e.includes('Redirect cycle')));
});
test('production is blocked while approvals and the publishing connection are missing',async()=>{
 const model=await loadModel(root,'production');const report=await validateModel(model);
 assert.ok(report.errors.some(e=>e.includes('domain')));assert.ok(report.errors.some(e=>e.includes('publishingConfigured')));
});
test('a malformed content file leaves the last working dist intact',async t=>{
 const dir=await fixture(t);await build({root:dir});const file=path.join(dir,'dist/index.html');const before=await readFile(file,'utf8');
 await writeFile(path.join(dir,'content/pages/home.json'),'{not json');await assert.rejects(build({root:dir}));assert.equal(await readFile(file,'utf8'),before);
});
test('an internal link failure does not replace the working output',async t=>{
 const dir=await fixture(t);await build({root:dir});const file=path.join(dir,'dist/index.html'),before=await readFile(file,'utf8');
 const config=path.join(dir,'content/site.json'),site=await readJSON(config);site.navigation.push({label:'Broken test link',path:'missing/index.html'});await writeJSON(config,site);
 await assert.rejects(build({root:dir}),/Missing local target/);assert.equal(await readFile(file,'utf8'),before);
});
test('a text edit and restoration change only content, not layout code',async t=>{
 const dir=await fixture(t),source=path.join(dir,'content/pages/home.json'),original=await readFile(source,'utf8');
 const template=path.join(dir,'src/templates/pages.mjs'),beforeTemplate=digest(await readFile(template));
 await build({root:dir});const originalHTML=await readFile(path.join(dir,'dist/index.html'),'utf8');
 const data=JSON.parse(original);data.en.heading='Your home. An edited test heading.';await writeJSON(source,data);await build({root:dir});
 assert.ok((await readFile(path.join(dir,'dist/index.html'),'utf8')).includes('An edited test heading.'));
 await writeFile(source,original);await build({root:dir});assert.equal(await readFile(path.join(dir,'dist/index.html'),'utf8'),originalHTML);
 assert.equal(digest(await readFile(template)),beforeTemplate);
});
test('a fourth reference is created from data without modifying the template',async t=>{
 const dir=await fixture(t),model=await loadModel(dir),item=structuredClone(model.properties[0]);
 const template=path.join(dir,'src/templates/pages.mjs'),beforeTemplate=digest(await readFile(template));
 item.id='test-property-only';item.slug='isolated-test-home';item.order=4;item.en.name='ISOLATED TEST DATA';item.en.seoTitle='Isolated test property';
 await writeJSON(path.join(dir,'content/properties/isolated-test-home.json'),item);const result=await build({root:dir});
 assert.equal(result.pages,14);assert.ok((await readFile(path.join(dir,'dist/properties/isolated-test-home/index.html'),'utf8')).includes('ISOLATED TEST DATA'));
 assert.equal(digest(await readFile(template)),beforeTemplate);
});
test('a deterministic build stays within the own-code budget',async t=>{
 const dir=await fixture(t);const result=await build({root:dir});assert.equal(result.pages,13);assert.ok(result.cssGzipBytes<40000);assert.ok(result.jsGzipBytes<40000);
 const first=await readFile(path.join(dir,'dist/index.html'),'utf8');await build({root:dir});assert.equal(await readFile(path.join(dir,'dist/index.html'),'utf8'),first);
});
