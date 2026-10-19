/* Practical touch models for the documented calculator families. */
(function (root) {
  'use strict';
  var Engine = root.CalcEngine || (typeof CalcEngine !== 'undefined' && CalcEngine);
  var STORAGE = 'fx991-model-state-';
  var profiles = [
    {id:'fx991ms-2',name:'Casio fx-991MS (2nd edition)',family:'MS',matrixMax:3,hasCalculus:true,hasComplex:true,hasTable:false,hasDist:false,hasSpreadsheet:false,polyMax:3,modes:['COMP','CMPLX','EQN','MAT','STAT']},
    {id:'fx991es-plus-1',name:'Casio fx-991ES Plus (1st edition)',family:'ES',matrixMax:3,hasCalculus:true,hasComplex:true,hasTable:true,hasDist:false,hasSpreadsheet:false,polyMax:3,modes:['COMP','CMPLX','EQN','MAT','TABLE','STAT']},
    {id:'fx991es-plus-2',name:'Casio fx-991ES Plus (2nd edition)',family:'ES',matrixMax:3,hasCalculus:true,hasComplex:true,hasTable:true,hasDist:false,hasSpreadsheet:false,polyMax:3,modes:['COMP','CMPLX','EQN','MAT','TABLE','STAT']},
    {id:'fx991ex',name:'Casio fx-991EX',family:'EX',matrixMax:4,hasCalculus:true,hasComplex:true,hasTable:true,hasDist:true,hasSpreadsheet:true,polyMax:4,modes:['Calculate','Complex','Equation/Func','Matrix','Table','Statistics','Distribution','Spreadsheet']},
    {id:'fx991cw',name:'Casio fx-991CW',family:'CW',matrixMax:4,hasCalculus:true,hasComplex:true,hasTable:true,hasDist:true,hasSpreadsheet:true,polyMax:4,modes:['Calculate','Complex','Equation','Matrix','Table','Statistics','Distribution','Spreadsheet']},
    {id:'fx570ex',name:'Casio fx-570EX',family:'EX',matrixMax:4,hasCalculus:true,hasComplex:true,hasTable:true,hasDist:true,hasSpreadsheet:true,polyMax:4,modes:['Calculate','Complex','Equation/Func','Matrix','Table','Statistics','Distribution','Spreadsheet']},
    {id:'fx570cw',name:'Casio fx-570CW',family:'CW',matrixMax:4,hasCalculus:true,hasComplex:true,hasTable:true,hasDist:true,hasSpreadsheet:true,polyMax:4,modes:['Calculate','Complex','Equation','Matrix','Table','Statistics','Distribution','Spreadsheet']},
    {id:'ti36x-pro',name:'TI-36X Pro',family:'TI',matrixMax:3,hasCalculus:true,hasComplex:true,hasTable:true,hasDist:true,hasSpreadsheet:false,polyMax:3,modes:['Calculator','Complex','Matrix','Vector','Equation','Polynomial','Table','Statistics','Distribution','Base']},
    {id:'ti30xs-multiview',name:'TI-30XS MultiView',family:'TI30',matrixMax:0,hasCalculus:false,hasComplex:false,hasTable:true,hasDist:false,hasSpreadsheet:false,polyMax:0,modes:['Normal','Statistics','Table']},
    {id:'sharp-el501w',name:'Sharp EL-501W',family:'SHARP501',matrixMax:0,hasCalculus:false,hasComplex:true,hasTable:false,hasDist:false,hasSpreadsheet:false,polyMax:0,modes:['NORMAL','STAT']},
    {id:'sharp-el506w',name:'Sharp EL-506W',family:'SHARP506',matrixMax:3,hasCalculus:true,hasComplex:true,hasTable:false,hasDist:false,hasSpreadsheet:false,polyMax:0,modes:['NORMAL','STAT','COMPLEX','MAT','CALC']}
  ];
  var refs = {
    'fx991ms-2':['https://support.casio.com/pdf/004/fx570MS_991MS_E.pdf','Original MS family: no TABLE mode; natural display and advanced workspaces are limited.'],
    'fx991es-plus-1':['https://www.casio.com/content/dam/casio/global/support/manuals/calculators/pdf/2022/mutual/fx-570ES_991ES_9910NG_PLUS_EN.pdf','ES Plus shared mathematics; distribution and spreadsheet are not original features.'],
    'fx991es-plus-2':['https://www.casio.com/content/dam/casio/global/support/manuals/calculators/pdf/2022/mutual/fx-570ES_991ES_9910NG_PLUS_EN.pdf','ES Plus shared mathematics; distribution and spreadsheet are not original features.'],
    'fx991ex':['https://www.casio.com/content/dam/casio/global/support/manuals/calculators/pdf/004-en/f/fx-570_991EX_EN.pdf','Touch implementation covers the documented EX workspaces; spreadsheet is a practical subset.'],
    'fx991cw':['https://www.casio.com/content/dam/casio/global/support/manuals/calculators/pdf/004-en/f/fx-570CW_991CW_EN.pdf','Touch implementation covers documented CW HOME/CATALOG/TOOLS concepts; exact firmware menus may differ.'],
    'fx570ex':['https://www.casio.com/content/dam/casio/global/support/manuals/calculators/pdf/004-en/f/fx-570_991EX_EN.pdf','Touch implementation covers the documented EX workspaces; spreadsheet is a practical subset.'],
    'fx570cw':['https://www.casio.com/content/dam/casio/global/support/manuals/calculators/pdf/004-en/f/fx-570CW_991CW_EN.pdf','Touch implementation covers documented CW HOME/CATALOG/TOOLS concepts; exact firmware menus may differ.'],
    'ti36x-pro':['https://education.ti.com/html/eguides/scientifics/PDFs/EN/TI-36X-PRO-Guidebook_EN.pdf','Four-line history, vectors, base conversion, distribution, and polynomial degree 3 are represented; some TI workspaces remain partial.'],
    'ti30xs-multiview':['https://education.ti.com/html/eguides/scientifics/PDFs/EN/TI30XS-MV-Teacher-Guide_EN.pdf','No complex, calculus, matrix, vector, solver, polynomial, distribution, or spreadsheet workspace.'],
    'sharp-el501w':['https://global.sharp/contents/calculator/support/illustration/pdf/el501w.pdf','Official key illustration documents complex capability; this model implements core complex arithmetic and immediate unary behavior only.'],
    'sharp-el506w':['https://global.sharp/products/calculators/sc_calculator/pdf/spec_sheet.pdf','Core scientific and complex behavior is implemented; equation-solver details are intentionally not invented and remain an implementation gap.']
  };
  profiles.forEach(function(p){var r=refs[p.id];p.source=r[0];p.limitations=r[1];p.missing=[];if(!p.hasCalculus)p.missing.push('calculus');if(!p.matrixMax)p.missing.push('matrix');if(!p.hasTable)p.missing.push('table');p.hasVector=['MS','ES','EX','CW','TI'].indexOf(p.family)>=0;p.hasBase=['MS','ES','EX','CW','TI','SHARP501','SHARP506'].includes(p.family);p.hasRegression=p.family!=='SHARP501';p.hasStats=p.modes.some(function(m){return /STAT/i.test(m);});p.hasSolver=p.family!=='TI30'&&p.polyMax>0;});
  var byId={};profiles.forEach(function(p){byId[p.id]=p;});
  function profile(model){return typeof model==='string'?byId[model]:(model&&model.id?(byId[model.id]||model):profiles[0]);}
  function blankState(p){return {model:p.id,display:'',expr:'',answer:'',history:[],memory:0,angle:'DEG',shift:false,second:false,fraction:false,mode:p.modes[0],catalog:false,tool:null,lastKey:'',error:''};}
  function createState(model){var p=profile(model),s=blankState(p);try{var old=JSON.parse(root.localStorage.getItem(STORAGE+p.id));if(old)s=Object.assign(s,old);}catch(e){}if(!p.modes.includes(s.mode))s.mode=p.modes[0];return s;}
  function save(s){try{root.localStorage.setItem(STORAGE+s.model,JSON.stringify(s));}catch(e){}}
  function finite(v){if(typeof v==='number')return Number.isFinite(v);if(v&&typeof v.re==='number')return Number.isFinite(v.re)&&Number.isFinite(v.im);if(Array.isArray(v))return v.every(finite);return true;}
  var funcs=/^(sin|cos|tan|asin|acos|atan|sinh|cosh|tanh|asinh|acosh|atanh|ln|log|sqrt|cbrt|factorial|nCr|nPr|abs|round|floor|ceil|exp|normalCDF|pi|e|x|X|i)$/;
  function safeEval(model,expression,state){
    var p=profile(model),s=String(expression==null?'':expression).trim();if(!s)return 0;
    if(s.length>240)throw Error('Use 240 characters or fewer.');
    s=s.replace(/×/g,'*').replace(/÷/g,'/').replace(/−/g,'-').replace(/π/g,'pi').replace(/√/g,'sqrt');
    var opens=(s.match(/\(/g)||[]).length,closes=(s.match(/\)/g)||[]).length;if(opens>closes)s+=')'.repeat(opens-closes);
    var lim=p.family==='TI30'?69:170,node=root.math.parse(s),count=0;
    function literal(n){if(!n.isConstantNode||!Number.isInteger(n.value)||n.value<0||n.value>lim)throw Error('Use literal combinatoric arguments from 0 to '+lim+'.');}
    node.traverse(function(n){if(++count>100)throw Error('Expression is too complex.');
      if(!['OperatorNode','ConstantNode','SymbolNode','FunctionNode','ParenthesisNode'].includes(n.type))throw Error('Only scientific arithmetic is supported.');
      if(n.isSymbolNode&&!funcs.test(n.name))throw Error('Unknown function or symbol: '+n.name);
      if(n.isFunctionNode){if(!funcs.test(n.fn.name))throw Error('Function not available.');if(['factorial','nCr','nPr'].includes(n.fn.name))n.args.forEach(literal);}
      if(n.isOperatorNode){if(!['+','-','*','/','^','!','%'].includes(n.op))throw Error('Operator not supported.');if(n.op==='!')literal(n.args[0]);}
    });
    if(!Engine||!Engine.evaluate)throw Error('Calculation engine is not loaded');
    var scope=Object.assign({x:0,X:0},state&&state.variables||{}),v=Engine.evaluate(s,state&&state.angle||'DEG',scope);
    if(!finite(v))throw Error('Result is not finite');if(!p.hasComplex&&v&&typeof v.re==='number'&&Math.abs(v.im)>1e-12)throw Error('Complex result is not supported by this model');return v;
  }
  function format(v,state){return Engine&&Engine.format?Engine.format(v,'NORM',10):String(v);}
  function setResult(s,v,expr){s.answer=format(v,s);s.expr=expr||s.expr;s.display=s.answer;s.error='';s.justEvaluated=true;s.history=(s.history||[]).concat([{input:expr||'',output:s.answer}]).slice(-20);return v;}
  function evaluate(model,expression,state){var p=profile(model),s=state||createState(p),v=safeEval(p,expression,s);setResult(s,v,String(expression));save(s);return {value:v,text:s.answer,state:s};}
  function append(s,text){if(s.justEvaluated&&/^[0-9.]$/.test(text)){s.expr='';s.answer='';s.justEvaluated=false;}s.expr+=text;s.display=s.expr;s.error='';s.justEvaluated=false;}
  function sharpBinary(s,p){if(p.family==='SHARP501'&&s.expr){try{var v=safeEval(p,s.expr,s);setResult(s,v,s.expr);s.expr=s.answer;}catch(e){s.error=e.message;}}}
  function unary(s,p,k){var map={sin:'sin(',cos:'cos(',tan:'tan(',asin:'asin(',acos:'acos(',atan:'atan(',sinh:'sinh(',cosh:'cosh(',tanh:'tanh(',ln:'ln(',log:'log(',sqrt:'sqrt(',cbrt:'cbrt(',exp:'exp('};if(p.family==='SHARP501'&&s.expr&&/^[-+]?\d*\.?\d+$/.test(s.expr)){try{setResult(s,safeEval(p,k+'('+s.expr+')',s),k+'('+s.expr+')');return true;}catch(e){}}append(s,map[k]||k+'(');return false;}
  function press(model,state,key){var p=profile(model),s=state||createState(p),k=String(key);s.lastKey=k;
    if(k==='SHIFT'||k==='2nd'){s.shift=!s.shift;s.second=s.shift;save(s);return s;}
    if(k==='AC'){s.expr='';s.display='';s.answer='';s.error='';s.menu=null;s.shift=false;s.justEvaluated=false;save(s);return s;}
    if(['HOME','MODE','MENU','STAT','CATALOG','OPTN','TOOLS'].includes(k)){s.menu=k==='CATALOG'||k==='OPTN'?'functions':k==='TOOLS'?'settings':'apps';s.error='';if(k==='STAT')s.toolMode='stats';save(s);return s;}
    if(k==='ALPHA'){s.error='ALPHA variable-memory editing is not implemented in this touch subset.';save(s);return s;}
    if(k==='√')k='sqrt';if(k==='i'&&!p.hasComplex){s.error='Complex numbers are not available on this model.';return s;}
    if(k==='DEL'||k==='←'){s.expr=s.expr.slice(0,-1);s.display=s.expr;s.error='';save(s);return s;}
    if(k==='DRG'){s.angle=s.angle==='DEG'?'RAD':s.angle==='RAD'?'GRAD':'DEG';save(s);return s;}
    if(k==='S⇔D'||k==='F↔D'||k==='FRAC'){s.fraction=!s.fraction;save(s);return s;}
    if(k==='EXE'||k==='='||k==='ENTER'){try{evaluate(p,s.expr,s);}catch(e){s.error=e.message;s.display='Error: '+e.message;s.answer='';}save(s);return s;}
    if(k==='ANS'){append(s,s.answer||'0');}
    else if(k==='M+'||k==='M−'){try{s.memory+=(k==='M+'?1:-1)*Number(s.answer||safeEval(p,s.expr,s));}catch(e){s.error=e.message;s.display='Error: '+e.message;}}
    else {if(s.justEvaluated&&['×','÷','−','+','*','/','x²','x³','x⁻¹'].includes(k)){s.expr=s.answer;s.justEvaluated=false;}if(s.shift){var shifted={sin:'asin',cos:'acos',tan:'atan',log:'10^(',ln:'e^(','x²':'^2','x³':'^3'};k=shifted[k]||k;s.shift=false;s.second=false;}if(k==='sin'||k==='cos'||k==='tan'||k==='asin'||k==='acos'||k==='atan'||k==='sinh'||k==='cosh'||k==='tanh'||k==='ln'||k==='log'||k==='sqrt'||k==='cbrt'||k==='exp')unary(s,p,k);else if(k==='x²')append(s,'^2');else if(k==='x³')append(s,'^3');else if(k==='x⁻¹')append(s,'^(-1)');else if(k==='nCr'||k==='nPr')append(s,k+'(');else if(k==='a b/c')append(s,'/');else if(k==='±')s.expr='-('+s.expr+')';else if(k==='EXP'||k==='EE')append(s,'*10^(');else if(k==='π')append(s,'pi');else if(k==='×'){sharpBinary(s,p);append(s,'*');}else if(k==='÷'){sharpBinary(s,p);append(s,'/');}else if(k==='−'){sharpBinary(s,p);append(s,'-');}else if(k==='('||k===')'||k==='+'||k==='*'||k==='/'||/^\d$/.test(k)||k==='.') {if(k==='+'&&p.family==='SHARP501')sharpBinary(s,p);if(p.family==='SHARP501'&&/^[+\-*/]$/.test(k)&&s.expr){try{var v=safeEval(p,s.expr,s);setResult(s,v,s.expr);s.expr=s.answer;}catch(e){s.error=e.message;}}append(s,k);}else append(s,k);}
    save(s);return s;
  }
  var layouts={MS:['SHIFT','ALPHA','MODE','DRG','←','7','8','9','÷','sin','4','5','6','×','cos','1','2','3','−','tan','0','.','EXP','+','(',')','x²','√','S⇔D','EXE'],ES:['SHIFT','ALPHA','MENU','DRG','←','7','8','9','÷','sin','4','5','6','×','cos','1','2','3','−','tan','0','.','EXP','+','π','(',')','x²','√','S⇔D','EXE'],EX:['SHIFT','OPTN','MENU','TOOLS','←','7','8','9','÷','sin','4','5','6','×','cos','1','2','3','−','tan','0','.','EXP','+','π','(',')','x²','√','S⇔D','EXE'],CW:['SHIFT','CATALOG','HOME','TOOLS','←','7','8','9','÷','sin','4','5','6','×','cos','1','2','3','−','tan','0','.','EXP','+','π','(',')','x²','√','F↔D','EXE'],TI:['2nd','MODE','STAT','DRG','←','7','8','9','÷','sin','4','5','6','×','cos','1','2','3','−','tan','0','.','EE','+','(',')','x²','√','ANS','ENTER'],TI30:['2nd','MODE','STAT','DRG','←','7','8','9','÷','sin','4','5','6','×','cos','1','2','3','−','tan','0','.','EE','+','(',')','x²','√','ANS','ENTER'],SHARP501:['2nd','MODE','DRG','←','7','8','9','÷','sin','4','5','6','×','cos','1','2','3','−','tan','0','.','EXP','+','(',')','x²','√','=','AC'],SHARP506:['2nd','MODE','DRG','←','7','8','9','÷','sin','4','5','6','×','cos','1','2','3','−','tan','0','.','EXP','+','(',')','√','=','AC']};
  function button(label,cls){var b=document.createElement('button');b.type='button';b.className='model-key '+(cls||'');b.textContent=label;b.setAttribute('aria-label',label);return b;}
  function render(container){
    if(!container)throw Error('A container is required');container.classList.add('model-collection');container.replaceChildren();
    function el(tag,cls,text){var n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;}
    var wrap=el('section','model-shell'),head=el('div','model-header'),title=el('div');title.append(el('span','eyebrow','MANUAL-INFORMED TOUCH SIMULATORS'),el('h2','','Choose your calculator'));head.append(title);
    var select=el('select','model-select');select.setAttribute('aria-label','Calculator model');profiles.forEach(function(p){var o=el('option','',p.name);o.value=p.id;select.append(o);});head.append(select);wrap.append(head);
    var body=el('div','model-body'),calc=el('div','model-calculator'),badge=el('div','model-badge'),screen=el('div','model-screen');screen.setAttribute('role','status');screen.setAttribute('aria-live','polite');var mode=el('span','screen-mode'),hist=el('div','screen-history'),expr=el('div','screen-expr'),ans=el('div','screen-answer');screen.append(mode,hist,expr,ans);var menu=el('div','model-menu'),pad=el('div','model-pad');calc.append(badge,screen,menu,pad);var right=el('div'),tools=el('aside','model-tools'),details=el('details','model-details');details.open=true;right.append(tools,details);body.append(calc,right);wrap.append(body);container.append(wrap);var state=createState(select.value);
    var missingByFamily={
      MS:'New model workspace: full SHIFT/ALPHA memory menus, SD/REG variants, constants/conversions, DMS, engineering notation and exact hardware precision. The separate FX-991MS classic retains its existing deeper key flows.',
      ES:'Full natural-input cursor/templates, exact radical/pi output, ALPHA memories, constants/conversions, DMS, nonlinear regressions and complete native SHIFT menus. Both editions intentionally share their original mathematical function set.',
      EX:'Inequality and ratio apps, QR output, constants/conversions, full regression/distribution catalogs, exact radical output, native memory menus and the full 45-row spreadsheet.',
      CW:'Inequality, ratio and Math Box apps, QR output, full catalog, exact radical output, native variable storage, complete distribution catalog and the full 45-row spreadsheet.',
      TI:'Exact radical/pi output, complete multi-tap key cycling, RREF/REF matrix tools, list formulas, nonlinear regressions, cumulative/inverse distributions, native memory menus and exact TI error/precision rules.',
      TI30:'List formulas/frequency entry, nonlinear statistical options, exact MathPrint cursor editing, native memory storage and complete probability menus. Matrix, complex, calculus and equation solving are not original TI-30XS features.',
      SHARP501:'Frequency entry/data correction, dedicated CPLX real/imaginary registers, polar conversion, HYP/TAB settings and original memory workflows. No matrix, calculus or solver on the original. Regression is not exposed for this one-variable model.',
      SHARP506:'EQN and LIST workflows, original matrix/list memories, constants/conversions, full regression options and hardware-specific setup. Matrix tools here are a conservative 3×3 web subset, not a verified hardware maximum. Conventional display, not EL-W506 WriteView.'
    };
    function sync(){var p=profile(select.value);mode.textContent=(state.toolMode||state.mode||p.modes[0])+' · '+state.angle+(state.shift?' · '+(p.family.startsWith('TI')?'2nd':'SHIFT'):'');expr.textContent=state.error?'Error: '+state.error:(state.expr||'0');ans.replaceChildren();if(state.answer){if(state.fraction&&Engine.fraction&&!/i$/.test(state.answer)){var text=Engine.fraction(Number(state.answer)),parts=text.split('/');if(parts.length===2&&['ES','EX','CW','TI','TI30'].includes(p.family)){var f=el('span','stacked-fraction');f.append(el('span','',parts[0]),el('span','fraction-bar',''),el('span','',parts[1]));ans.append(f);}else ans.textContent=text;}else ans.textContent=state.answer;}
      hist.replaceChildren();if(p.family==='TI'||p.family==='TI30')(state.history||[]).slice(-3).forEach(function(r){hist.append(el('div','history-line',r.input+' = '+r.output));});
    }
    function drawMenu(){var p=profile(select.value);menu.replaceChildren();menu.hidden=!state.menu;if(!state.menu)return;
      var choices=state.menu==='apps'?root.ModelModes.available(p):state.menu==='settings'?['DEG','RAD','GRAD','Fraction / decimal']:['sin','cos','tan','ln','log','sqrt','cbrt','sinh','cosh','tanh','factorial','nCr','nPr'].concat(p.hasComplex?['i']:[]);
      choices.forEach(function(x,i){var b=el('button','',state.menu==='apps'?(i+1)+' · '+x.toUpperCase():x);b.type='button';b.onclick=function(){if(state.menu==='apps'){state.toolMode=x;state.mode=x;state.menu=null;save(state);draw();return;}if(state.menu==='settings'){if(['DEG','RAD','GRAD'].includes(x))state.angle=x;else state.fraction=!state.fraction;}else{if(x==='i')append(state,'i');else append(state,x+'(');}state.menu=null;save(state);drawMenu();sync();};menu.append(b);});
    }
    function draw(){var p=profile(select.value);state.model=p.id;calc.className='model-calculator model-family-'+p.family.toLowerCase()+(p.family==='TI'||p.family==='TI30'?' model-history-four':'');badge.textContent=p.name+' · '+({MS:'S-V.P.A.M. / two-line',ES:'Natural Display inspired',EX:'ClassWiz / icon menus',CW:'HOME / app workflow',TI:'MathPrint inspired',TI30:'MultiView inspired',SHARP501:'Post-entry scientific',SHARP506:'Conventional algebraic'}[p.family]||'');
      pad.replaceChildren();var keys=(layouts[p.family]||layouts.MS).filter(function(k){return k!=='ALPHA';});if(!keys.includes('AC'))keys.splice(4,0,'AC');keys=keys.concat(['ln','log','x⁻¹','a b/c','nCr','nPr',',']);if(p.hasComplex)keys.push('i');if(p.family.startsWith('TI'))keys.push('F↔D');
      keys.forEach(function(k){var b=button(k,k==='EXE'||k==='ENTER'||k==='='?'is-enter':k==='SHIFT'||k==='2nd'?'is-shift':/^\d$/.test(k)?'is-number':'');b.onclick=function(){press(p,state,k);if(['MODE','MENU','HOME','CATALOG','OPTN','TOOLS','STAT'].includes(k))draw();else{drawMenu();sync();}};pad.append(b);});
      root.ModelModes.render(tools,p,state,function(v,label){state.answer=root.ModelModes.format?root.ModelModes.format(v):typeof v==='object'?root.math.format(v,{precision:10}):String(v);state.error='';state.display=state.answer;state.history=state.history.concat([{input:label||state.toolMode||'Tool',output:state.answer}]).slice(-20);save(state);sync();});
      details.replaceChildren();details.append(el('summary','','Supported subset & original functions still missing'),el('p','','Independent learning recreation—not official firmware or a claim to every mathematical operation. Numerical precision and key placement can differ from the physical calculator.'),el('p','',missingByFamily[p.family]));if(p.family==='MS')details.append(el('p','','The original MS has no TABLE app. Use the separate graphing/toolkit workspace for additional tools.'));if(['EX','CW'].includes(p.family))details.append(el('p','','The fx-570 sibling shares this mathematical feature set; its physical power supply differs. The web spreadsheet is limited to A1:E5.'));
      var src=el('a','model-source','Read the model manual / reference ↗');src.href=p.source;src.target='_blank';src.rel='noopener';details.append(src);if(p.family==='SHARP506'){var alt=el('a','model-source',' · Exact EL-506W/546W manual mirror ↗');alt.href='https://manuals.plus/m/8e27bafd746a620ba6a5b4196a11318b2b0d4cbbb8a49685a30c4c17174a2c75';alt.target='_blank';alt.rel='noopener';details.append(alt);}drawMenu();sync();
    }
    select.onchange=function(){state=createState(select.value);draw();};draw();return wrap;
  }
  root.ModelCollection={profiles:profiles,render:render,createState:createState,press:press,evaluate:evaluate,format:format,safeEvaluate:safeEval,profile:profile};if(typeof module==='object'&&module.exports)module.exports=root.ModelCollection;
})(typeof window!=='undefined'?window:globalThis);
