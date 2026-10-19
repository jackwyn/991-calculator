/* fx-991MS-inspired calculation engine. mathjs must be loaded before this file. */
(function (root) {
  'use strict';
  var M = root.math;
  if (!M && typeof require === 'function') { try { M = require('mathjs'); } catch (_) {} }
  if (!M) throw new Error('CalcEngine requires mathjs');

  var DEG = Math.PI / 180;
  function number(v) {
    if (typeof v === 'number') return v;
    if (v && typeof v.valueOf === 'function') { var n = v.valueOf(); if (typeof n === 'number') return n; }
    return Number(v);
  }
  function angleIn(x, angle) { return angle === 'RAD' ? x : angle === 'GRAD' ? x * Math.PI / 200 : x * DEG; }
  function angleOut(x, angle) { return angle === 'RAD' ? x : angle === 'GRAD' ? x * 200 / Math.PI : x / DEG; }
  function fact(n) {
    n = number(n);
    if (!Number.isFinite(n) || n < 0 || Math.floor(n) !== n) throw new Error('Factorial requires a non-negative integer');
    if (n > 170) return Infinity;
    var r = 1; for (var i = 2; i <= n; i++) r *= i; return r;
  }
  function comb(n, r) { n=number(n); r=number(r); if (n<0||r<0||n!==Math.floor(n)||r!==Math.floor(r)||r>n) throw new Error('Invalid nCr'); r=Math.min(r,n-r);var v=1;for(var j=1;j<=r;j++)v=v*(n-r+j)/j;return v; }
  function perm(n, r) { n=number(n); r=number(r); if (n<0||r<0||n!==Math.floor(n)||r!==Math.floor(r)||r>n) throw new Error('Invalid nPr'); var v=1;for(var j=0;j<r;j++)v*=n-j;return v; }
  function funcs(angle) {
    return {
      sin:function(x){return Math.sin(angleIn(number(x),angle));}, cos:function(x){return Math.cos(angleIn(number(x),angle));}, tan:function(x){return Math.tan(angleIn(number(x),angle));},
      asin:function(x){return angleOut(Math.asin(number(x)),angle);}, acos:function(x){return angleOut(Math.acos(number(x)),angle);}, atan:function(x){return angleOut(Math.atan(number(x)),angle);},
      sinh:Math.sinh, cosh:Math.cosh, tanh:Math.tanh, asinh:Math.asinh, acosh:Math.acosh, atanh:Math.atanh,
      ln:function(x){return M.log(x);}, log:function(x,b){return b===undefined?M.log10(x):M.divide(M.log(x),M.log(b));},
      sqrt:M.sqrt, cbrt:Math.cbrt, factorial:fact, nCr:comb, nPr:perm, combinations:comb, permutations:perm, arg:function(z){return angleOut(M.arg(z),angle);}, normalCDF:function(z){return (1+M.erf(number(z)/Math.SQRT2))/2;},
      pol:function(x,y){ return [Math.hypot(number(x),number(y)),angleOut(Math.atan2(number(y),number(x)),angle)]; }, rec:function(r,t){ return [number(r)*Math.cos(angleIn(number(t),angle)),number(r)*Math.sin(angleIn(number(t),angle))]; },
      dms:function(d,m,s){ return number(d)+number(m)/60+number(s)/3600; }, dmsToDeg:function(x){return number(x);}
    };
  }
  function normalize(expr) {
    var s = String(expr == null ? '' : expr).trim();
    s = s.replace(/[×·]/g,'*').replace(/÷/g,'/').replace(/−/g,'-').replace(/π/g,'pi').replace(/√/g,'sqrt');
    s = s.replace(/\bsqrt\s*(\d+(?:\.\d+)?)/gi,'sqrt($1)');
    s = s.replace(/\b(\d+(?:\.\d+)?)\s*nCr\s*(\d+(?:\.\d+)?)/gi,'nCr($1,$2)');
    s = s.replace(/\b(\d+(?:\.\d+)?)\s*nPr\s*(\d+(?:\.\d+)?)/gi,'nPr($1,$2)');
    // Postfix percent is deliberately simple and calculator-like: 25% -> 25/100.
    s = s.replace(/(\d+(?:\.\d+)?|\([^()]+\))\s*%/g,'($1)/100');
    var opens=(s.match(/\(/g)||[]).length, closes=(s.match(/\)/g)||[]).length; if(opens>closes)s+=')'.repeat(opens-closes);
    return s;
  }
  function scopeFor(angle, scope) {
    var out = {}; scope = scope || {};
    Object.keys(scope).forEach(function(k){out[k]=scope[k];});
    Object.assign(out, funcs(angle));
    out.Pol=out.pol; out.Rec=out.rec; out.DMS=out.dms;
    out.pi = Math.PI; out.e = Math.E; out.i = M.complex ? M.complex(0,1) : {re:0,im:1};
    return out;
  }
  function finiteResult(v) {
    if (typeof v === 'number') return Number.isFinite(v);
    if (v && typeof v.re === 'number' && typeof v.im === 'number') return Number.isFinite(v.re) && Number.isFinite(v.im);
    if (Array.isArray(v)) return v.every(finiteResult);
    if (v && v.type === 'Matrix' && typeof v.toArray === 'function') return finiteResult(v.toArray());
    return true;
  }
  function evaluate(expr, angle, scope) {
    angle = angle || 'DEG'; var s = normalize(expr); if (!s) return 0;
    if (s.length > 1000) throw Error('Expression is too long');
    if (/\b(import|createUnit|evaluate|parse|simplify|derivative|range|zeros|ones|identity|resize|randomInt)\b|[;:]/.test(s)) throw Error('Unsupported expression; use the equation workspace for equations');
    if (s.indexOf('=') >= 0) { if (s.indexOf('==') >= 0 || (s.match(/=/g)||[]).length !== 1) throw Error('Unsupported expression; use the equation workspace for equations'); var p=s.split('='); s='('+p[0]+')-('+p[1]+')'; }
    var result=M.evaluate(s, scopeFor(angle,scope)); if (!finiteResult(result)) throw Error('Result is not finite'); return result;
  }

  function format(value, mode, digits) {
    mode=(mode||'NORM').toUpperCase(); digits = digits == null ? 10 : Math.max(0, Number(digits));
    if (value == null) return '';
    if (Array.isArray(value) || (value && (value.isMatrix || value.type === 'Matrix'))) return M.format(value, {precision:digits});
    if (value && value.re !== undefined && value.im !== undefined) {
      var re = format(value.re, mode, digits), im = Math.abs(value.im), sign=value.im<0?' - ':' + ';
      return Math.abs(value.re)<1e-15 ? format(value.im,mode,digits)+'i' : re+sign+format(im,mode,digits)+'i';
    }
    var n=number(value); if (!Number.isFinite(n)) return String(n); if (Object.is(n,-0)) n=0;
    if (mode==='FIX') return n.toFixed(digits);
    if (mode==='SCI' || mode==='SCIENTIFIC') return n.toExponential(digits);
    if (mode==='ENG' || mode==='ENGINEERING') {
      if (n===0) return (0).toFixed(digits); var e=Math.floor(Math.log10(Math.abs(n))/3)*3; return (n/Math.pow(10,e)).toFixed(digits)+'e'+(e>=0?'+':'')+e;
    }
    return M.format(n,{precision:Math.max(1,digits),lowerExp:-9,upperExp:10});
  }
  function fraction(value, maxDen) {
    maxDen=maxDen||1000000; var n=number(value); if (!Number.isFinite(n)) return String(n); var sign=n<0?-1:1; n=Math.abs(n);
    var x=n, h0=0,h1=1,k0=1,k1=0, guard=0;
    while (guard++<32) { var ai=Math.floor(x), h2=ai*h1+h0, k2=ai*k1+k0; if (k2>maxDen) break; h0=h1;k0=k1;h1=h2;k1=k2; var rest=x-ai; if (rest<1e-12) break; x=1/rest; }
    var p=sign*h1; return k1===1?String(p):String(p)+'/'+String(k1);
  }
  function integrate(expr,a,b,angle) {
    a=number(a); b=number(b); angle=angle||'DEG'; if(!Number.isFinite(a)||!Number.isFinite(b))throw Error('Integration bounds must be finite'); var f=function(x){var y=number(evaluate(expr,angle,{x:x,X:x}));if(!Number.isFinite(y))throw Error('Function must be finite across the integration interval');return y;};
    function simp(l,r,fl,fc,fr){return (r-l)*(fl+4*fc+fr)/6;}
    function rec(l,r,fl,fc,fr,whole,eps,depth){var m=(l+r)/2, lm=(l+m)/2,rm=(m+r)/2, flm=f(lm),frm=f(rm), L=simp(l,m,fl,flm,fc),R=simp(m,r,fc,frm,fr); if(depth<=0||Math.abs(L+R-whole)<=15*eps)return L+R+(L+R-whole)/15; return rec(l,m,fl,flm,fc,L,eps/2,depth-1)+rec(m,r,fc,frm,fr,R,eps/2,depth-1);}
    if(a===b)return 0; var sign=a>b?-1:1;if(sign<0){var t=a;a=b;b=t;} var fa=f(a),fb=f(b),fm=f((a+b)/2); return sign*rec(a,b,fa,fm,fb,simp(a,b,fa,fm,fb),1e-10,18);
  }
  function derivative(expr,x,angle) { x=number(x); if(!Number.isFinite(x))throw Error('Derivative point must be finite'); var h=1e-5*Math.max(1,Math.abs(x)); return (number(evaluate(expr,angle,{x:x+h,X:x+h}))-number(evaluate(expr,angle,{x:x-h,X:x-h})))/(2*h); }
  function solve(expr,guess,angle) { angle=angle||'DEG'; var s=String(expr).replace(/=/g,'-('); if(String(expr).indexOf('=')>=0){var q=String(expr).split('=');s=q[0]+'-('+q.slice(1).join('=' )+')';} var x=number(guess==null?0:guess), last=x;
    function f(z){return number(evaluate(s,angle,{x:z,X:z}));} for(var i=0;i<40;i++){var y=f(x),h=1e-5*Math.max(1,Math.abs(x)),d=(f(x+h)-f(x-h))/(2*h); if(Math.abs(y)<1e-12)return x; if(!Number.isFinite(d)||Math.abs(d)<1e-14)break; var nx=x-y/d;if(!Number.isFinite(nx)||Math.abs(nx)>1e12)break;last=x;x=nx;if(Math.abs(x-last)<1e-12)return x;}
    var lo=x-10,hi=x+10, flo=f(lo),fhi=f(hi); for(var k=0;k<80;k++){if(flo*fhi<=0)break;lo-=Math.pow(1.6,k);hi+=Math.pow(1.6,k);flo=f(lo);fhi=f(hi);} if(flo*fhi<=0){for(var j=0;j<80;j++){var mid=(lo+hi)/2,fm=f(mid);if(Math.abs(fm)<1e-12)return mid;if(flo*fm<=0){hi=mid;fhi=fm;}else{lo=mid;flo=fm;}}if(Math.abs(f((lo+hi)/2))<1e-7)return (lo+hi)/2;} throw Error('No real root found near this guess');
  }

  var constants=[["mp","proton mass",1.67262192369e-27],["mn","neutron mass",1.67492749804e-27],["me","electron mass",9.1093837015e-31],["mμ","muon mass",1.883531627e-28],["a₀","Bohr radius",5.29177210903e-11],["h","Planck constant",6.62607015e-34],["μN","nuclear magneton",5.0507837461e-27],["μB","Bohr magneton",9.2740100783e-24],["ℏ","reduced Planck constant",1.054571817e-34],["α","fine-structure constant",0.0072973525693],["re","classical electron radius",2.8179403262e-15],["λc","Compton wavelength",2.42631023867e-12],["γp","proton gyromagnetic ratio",267522187.44],["λcp","proton Compton wavelength",1.32140985539e-15],["λcn","neutron Compton wavelength",1.31959090581e-15],["R∞","Rydberg constant",10973731.56816],["u","atomic mass unit",1.6605390666e-27],["μp","proton magnetic moment",1.41060679736e-26],["μe","electron magnetic moment",-9.2847647043e-24],["μn","neutron magnetic moment",-9.6623651e-27],["μμ","muon magnetic moment",-4.4904483e-26],["F","Faraday constant",96485.33212],["e","elementary charge",1.602176634e-19],["NA","Avogadro constant",6.02214076e+23],["k","Boltzmann constant",1.380649e-23],["Vm","molar volume of ideal gas",0.02241396954],["R","molar gas constant",8.31446261815324],["c₀","speed of light in vacuum",299792458],["c₁","first radiation constant",3.741771852e-16],["c₂","second radiation constant",0.01438776877],["σ","Stefan–Boltzmann constant",5.670374419e-8],["ε₀","vacuum permittivity",8.8541878128e-12],["μ₀","vacuum permeability",0.00000125663706212],["Φ₀","magnetic flux quantum",2.067833848e-15],["g","standard gravity",9.80665],["G₀","conductance quantum",0.00007748091729],["Z₀","vacuum impedance",376.730313668],["t","Celsius temperature offset",273.15],["G","Newtonian gravitational constant",6.6743e-11],["atm","standard atmosphere",101325]].map(function(x){return {symbol:x[0],name:x[1],value:x[2]};});
  var conversions=[
    ['in','cm',2.54,0],['ft','m',0.3048,0],['yd','m',0.9144,0],['mile','km',1.609344,0],['n mile','m',1852,0],['acre','m2',4046.8564224,0],['gal US','l',3.785411784,0],['gal UK','l',4.54609,0],['pc','km',3.085677581491367e13,0],['km/h','m/s',1/3.6,0],['oz','g',28.349523125,0],['lb','kg',0.45359237,0],['atm','Pa',101325,0],['mmHg','Pa',133.322387415,0],['hp','kW',0.745699872,0],['kgf/cm2','Pa',98066.5,0],['kgfm','J',9.80665,0],['lbf/in2','kPa',6.894757293168,0],['F','C',5/9,-32*5/9],['C','K',1,273.15],['cal','J',4.184,0],['m','cm',100,0]
  ].map(function(x){return {name:x[0]+' to '+x[1],from:x[0],to:x[1],factor:x[2],offset:x[3]};});
  var api={evaluate:evaluate,format:format,integrate:integrate,derivative:derivative,solve:solve,constants:constants,conversions:conversions,fraction:fraction};
  root.CalcEngine=api; if(typeof module==='object'&&module.exports) module.exports=api;
})(typeof window!=='undefined'?window:(typeof globalThis!=='undefined'?globalThis:this));
