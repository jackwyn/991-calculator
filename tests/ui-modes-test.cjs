const fs=require('fs'),assert=require('assert'),{JSDOM}=require('jsdom');const root=__dirname+'/../web/';const dom=new JSDOM(fs.readFileSync(root+'index.html','utf8'),{url:'https://calc.test/',runScripts:'outside-only'}),w=dom.window,d=w.document;
w.ResizeObserver=class{observe(){}disconnect(){}};w.HTMLCanvasElement.prototype.getContext=()=>new Proxy({},{get:()=>()=>{}});w.HTMLElement.prototype.scrollIntoView=()=>{};w.HTMLDialogElement.prototype.showModal=function(){this.open=true};w.HTMLDialogElement.prototype.close=function(){this.open=false};for(const f of ['math','engine','modes','app','toolkit-tools','advanced-calculators','everyday-calculators','library','model-modes','models','toolkit'])w.eval(fs.readFileSync(root+f+'.js','utf8'));
let n=0;function test(name,fn){fn();n++;console.log('PASS '+name)}function near(a,b){assert(Math.abs(Number(a)-b)<1e-7,a+' != '+b)}function model(id){const s=d.querySelector('.model-select');s.value=id;s.dispatchEvent(new w.Event('change'))}function key(k){const b=[...d.querySelectorAll('.model-key')].find(x=>x.textContent===k);assert(b,'Missing key '+k);b.click()}function keys(...ks){ks.forEach(key)}function answer(){return d.querySelector('.screen-answer').textContent}const C=w.ModelCollection,M=w.ModelModes;
for(const p of C.profiles){model(p.id);
 test(p.name+' visible keypad trig',()=>{key('AC');if(p.family==='SHARP501')keys('3','0','sin');else keys('sin','3','0',')');key(p.family.startsWith('TI')?'ENTER':p.family.startsWith('SHARP')?'=':'EXE');near(answer(),.5);});
 // Every model exposes its own hardware-style enter legend.
 const enter=p.family.startsWith('TI')?'ENTER':p.family.startsWith('SHARP')?'=':'EXE';
 test(p.name+' square root',()=>{keys('AC','√','9',')',enter);near(answer(),3)});
 test(p.name+' log and exponent input',()=>{keys('AC','log','1','0','0',')',enter);near(answer(),2);keys('AC','1',p.family.startsWith('TI')?'EE':'EXP','3',')',enter);near(answer(),1000)});
 test(p.name+' answer continuation',()=>{keys('AC','2','+','3',enter,'×','4',enter);near(answer(),20);keys('7',enter);near(answer(),7)});
 test(p.name+' visible manual and missing features',()=>{assert(d.querySelector('.model-details a').href.startsWith('https://'));assert(d.querySelector('.model-details').textContent.includes('not official'));assert(d.querySelector('.model-details').textContent.length>300)});
}
model('fx991cw');test('CW HOME opens actual app menu',()=>{keys('AC','HOME');assert(d.querySelectorAll('.model-menu button').length>8);assert(!d.querySelector('.screen-expr').textContent.includes('HOME'));const matrix=[...d.querySelectorAll('.model-menu button')].find(b=>b.textContent.includes('MATRIX'));matrix.click();assert.equal(d.querySelector('[aria-label="Calculator mode"]').value,'matrix')});
test('CW catalog inserts a function',()=>{key('CATALOG');[...d.querySelectorAll('.model-menu button')].find(b=>b.textContent==='ln').click();assert(d.querySelector('.screen-expr').textContent.includes('ln('))});
model('fx991es-plus-2');test('ES stacked fraction display',()=>{keys('AC','1','÷','2','EXE','S⇔D');assert.equal(d.querySelector('.stacked-fraction').textContent,'12');assert.equal(d.querySelectorAll('.stacked-fraction>span').length,3)});
test('SHIFT inverse sine',()=>{keys('AC','SHIFT','sin','0','.','5',')','EXE');near(answer(),30)});
test('Per-model state retained',()=>{keys('AC','8','×','9','EXE');model('ti30xs-multiview');model('fx991es-plus-2');near(answer(),72)});
const ex=C.profile('fx991ex'),ms=C.profile('fx991ms-2');
test('Original base modes available',()=>{for(const id of ['fx991ms-2','fx991es-plus-2','fx991ex','fx991cw','ti36x-pro','sharp-el501w','sharp-el506w'])assert(M.available(C.profile(id)).includes('base'))});
test('Binomial boundaries',()=>{near(M.calculate('dist',{kind:'binomial',n:'10',x:'1',p:'0'},ex),0);near(M.calculate('dist',{kind:'binomial',n:'10',x:'10',p:'1'},ex),1)});
test('Poisson bounded finite high argument',()=>{const r=M.calculate('dist',{kind:'poisson',x:'500',lambda:'500'},ex);assert(Number.isFinite(r));assert(r>0)});
test('Spreadsheet formulas and circular reference',()=>{assert.equal(JSON.stringify(M.calculate('spreadsheet',{data:'2,3,=A1+B1\n4,5,=SUM(A1:B2)'},ex)),'[[2,3,5],[4,5,14]]');assert.throws(()=>M.calculate('spreadsheet',{data:'=B1,=A1'},ex))});
test('Four-unknown ClassWiz system',()=>{const r=M.calculate('system',{a:'1,0,0,0\n0,1,0,0\n0,0,1,0\n0,0,0,1',b:'1,2,3,4'},ex);assert.equal(JSON.stringify(r),'[1,2,3,4]')});
test('Real-only restriction, unsupported expression and combinatorics bounded',()=>{assert.throws(()=>C.evaluate('ti30xs-multiview','ln(-1)'));assert.throws(()=>C.evaluate(ms,'nCr(3,1)+nCr(1000000000,500000000)'));assert.throws(()=>C.evaluate(ms,'a=3'));assert.throws(()=>C.evaluate(ms,'factorial(1e9)'))});
console.log(n+' UI and mode edge-case tests passed');dom.window.close();
