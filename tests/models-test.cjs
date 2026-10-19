const fs=require('fs'),assert=require('assert'),{JSDOM}=require('jsdom');
const root=__dirname+'/../web/';
const dom=new JSDOM(fs.readFileSync(root+'index.html','utf8'),{url:'https://calculator.test/',runScripts:'outside-only'}),w=dom.window,d=w.document;
w.ResizeObserver=class{observe(){}disconnect(){}};w.HTMLCanvasElement.prototype.getContext=()=>new Proxy({},{get:()=>()=>{}});w.HTMLElement.prototype.scrollIntoView=()=>{};
w.HTMLDialogElement.prototype.showModal=function(){this.open=true};w.HTMLDialogElement.prototype.close=function(){this.open=false};
for(const f of ['math','engine','modes','app','toolkit-tools','advanced-calculators','everyday-calculators','library','model-modes','models','toolkit'])w.eval(fs.readFileSync(root+f+'.js','utf8'));
const C=w.ModelCollection, modes=w.ModelModes;let count=0;function test(name,fn){fn();console.log('PASS '+name);count++}function near(a,b,eps=1e-8){assert(Math.abs(Number(a)-b)<eps,`${a} != ${b}`)}
function state(p){w.localStorage.removeItem('fx991-model-state-'+p.id);return C.createState(p.id)}function seq(p,s,keys){keys.forEach(k=>C.press(p,s,k));return s}
function calc(p,expression){return C.evaluate(p,expression,state(p)).value}
assert.equal(C.profiles.length,11);
for(const p of C.profiles){
 test(p.name+' — keypad 7 × 8',()=>{const s=seq(p,state(p),['7','×','8',p.family==='TI'||p.family==='TI30'?'ENTER':p.family.startsWith('SHARP')?'=':'EXE']);near(s.answer,56)});
 test(p.name+' — degree trig',()=>near(calc(p,'sin(30)'),.5));
 test(p.name+' — precedence',()=>{const s=seq(p,state(p),['2','+','3','×','4','=']);near(s.answer,p.family==='SHARP501'?20:14)});
 test(p.name+' — selector renders keypad and constrained tools',()=>{const sel=d.querySelector('.model-select');sel.value=p.id;sel.dispatchEvent(new w.Event('change'));assert(d.querySelectorAll('.model-key').length>25);assert(!d.querySelector('.screen-mode').textContent.includes('undefined'));const opts=[...d.querySelectorAll('[aria-label="Calculator mode"] option')].map(x=>x.value);assert.deepEqual(opts,[...modes.available(p)]);});
 if(p.matrixMax)test(p.name+' — matrix det & size limit',()=>{near(modes.calculate('matrix',{a:'1,2\n3,4',op:'det'},p),-2);const oversized=Array(p.matrixMax+1).fill(Array(p.matrixMax+1).fill('1').join(',')).join('\n');assert.throws(()=>modes.calculate('matrix',{a:oversized,op:'det'},p));});
 if(p.polyMax)test(p.name+' — quadratic roots',()=>{const r=modes.calculate('poly',{coefficients:'1,-5,6'},p).map(Number).sort((a,b)=>a-b);near(r[0],2);near(r[1],3)});
 if(p.hasComplex)test(p.name+' — complex',()=>{const z=calc(p,'(2+3*i)*(4-i)');near(z.re,11);near(z.im,10)});else test(p.name+' — rejects complex',()=>assert.throws(()=>calc(p,'sqrt(-1)')));
 if(p.hasCalculus)test(p.name+' — derivative & integral',()=>{near(modes.calculate('calculus',{expression:'x^2',op:'derivative',x:'3'},p),6,1e-5);near(modes.calculate('calculus',{expression:'x^2',op:'integral',x:'0',hi:'1',steps:'200'},p),1/3,1e-7)});
 if(p.hasTable)test(p.name+' — table',()=>{const r=modes.calculate('table',{expression:'x^2',start:'0',step:'1',count:'3'},p);assert.equal(JSON.stringify(r),'[[0,0],[1,1],[2,4]]')});
}
const ms=C.profile('fx991ms-2'),es=C.profile('fx991es-plus-2'),ti30=C.profile('ti30xs-multiview'),ti=C.profile('ti36x-pro');
test('Manual function constraints',()=>{assert(!ms.hasTable);assert.equal(es.polyMax,3);assert(!es.hasDist);assert.equal(ti.polyMax,3);assert(!modes.available(ti30).some(x=>['matrix','vector','solve','poly','calculus','dist','spreadsheet'].includes(x)))});
test('Both ES editions share their original computational set',()=>{const a=C.profile('fx991es-plus-1'),b=C.profile('fx991es-plus-2');assert.equal(a.polyMax,b.polyMax);assert.equal(a.hasDist,b.hasDist)});
test('EX/570EX include spreadsheet subset',()=>{assert(C.profile('fx991ex').hasSpreadsheet);assert(C.profile('fx570ex').hasSpreadsheet)});
test('Zero/repeated polynomial root finite',()=>{const r=modes.calculate('poly',{coefficients:'1,0,0'},es);r.forEach(x=>near(x,0))});
test('Descending cubic coefficients',()=>{const r=modes.calculate('poly',{coefficients:'1,-6,11,-6'},es).map(Number).sort((a,b)=>a-b);[1,2,3].forEach((x,i)=>near(r[i],x,1e-5))});
test('Base conversion rejects illegal digits',()=>assert.throws(()=>modes.calculate('base',{value:'102',base:'2'},ms)));
test('Regression preserves negative correlation',()=>{const r=modes.calculate('regression',{x:'1,2,3',y:'6,4,2'},es);near(r.slope,-2);near(r.r,-1)});
test('Large binomial remains finite',()=>near(modes.calculate('dist',{kind:'binomial',n:'1000',x:'500',p:'.5'},ti),.02522501817836,1e-10));
test('Existing 42-entry catalogue and donation retained',()=>{w.CalculatorHub.select('catalogue');assert.equal(d.querySelectorAll('.directory-card').length,42);assert(d.querySelector('a[href^="upi://"]'));w.CalculatorHub.select('scientific');assert(!d.querySelector('#classic-workspace').hidden)});
console.log(`${count} model tests passed`);dom.window.close();
