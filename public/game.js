(()=>{
'use strict';
const RS=2,W=480,H=270,GT=186,GB=262;let LW=2600;
const cv=document.getElementById('game');let ctx=cv.getContext('2d');let OW=1,OUTP='#0a080d';
ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality="high";
const FONT='"Press Start 2P", ui-monospace, monospace';
try{document.fonts&&document.fonts.load('8px "Press Start 2P"').catch(()=>{});}catch(e){}

/* ================= utils ================= */
const rnd=(a,b)=>a+Math.random()*(b-a);
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const hsh=(a,b)=>{let h=Math.imul(a|0,374761393)+Math.imul(b|0,668265263)|0;h=Math.imul(h^(h>>>13),1274126177);return ((h^(h>>>16))>>>0)/4294967296;};
function shade(hex,f){const n=parseInt(hex.slice(1),16);const r=Math.min(255,(n>>16)*f|0),g=Math.min(255,(n>>8&255)*f|0),b=Math.min(255,(n&255)*f|0);return '#'+((1<<24)|(r<<16)|(g<<8)|b).toString(16).slice(1);}
const mkc=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
const U=s=>String(s).replace(/[ÁÉÍÓÚ]/g,c=>'AEIOU'['ÁÉÍÓÚ'.indexOf(c)]);
function txt(s,x,y,col,size,align,g){g=g||ctx;s=U(s);g.font=(size||8)+'px '+FONT;g.textAlign=align||'left';g.textBaseline='top';g.fillStyle='rgba(0,0,0,.85)';g.fillText(s,x+1,y+1);g.fillStyle=col||'#fff';g.fillText(s,x,y);}
function wrap(s,n){const out=[];let line='';for(const w of s.split(' ')){if((line+' '+w).trim().length>n){out.push(line.trim());line=w;}else line+=' '+w;}if(line.trim())out.push(line.trim());return out;}

/* ================= character styles ================= */
const OUT='#0a080d';
// Ricardio por época: ior = melena con raya al medio, bigote y barba según los años
const STY={
  ric1:{scale:1.1,skin:'#dca27a',top:'#8a3a2a',shirt:'#8a3a2a',pants:'#34507a',boots:'#e2dccb',torsoW:10.5,apron:'#d6ceb4',bell:true,
    ior:{hairC:'#17100b',hi:'#3a2a1e',len:12,beard:'none',brow:'#17100b'}},
  ric2:{scale:1.13,skin:'#e0a47a',top:'#151418',shirt:'#0d0d10',pants:'#2f4a7a',boots:'#0b0b0d',torsoW:11.5,jacket:true,studs:true,
    ior:{hairC:'#120c08',hi:'#33261c',len:15,beard:'stache',stacheC:'#120c08',brow:'#120c08'}},
  ric3:{scale:1.16,skin:'#d99c72',top:'#17161a',shirt:'#17161a',pants:'#38485e',boots:'#1a1410',torsoW:13,bareFore:true,tee:'HERMETICA',tattoo:true,
    ior:{hairC:'#140e0a',hi:'#36281c',len:17,beard:'candado',stacheC:'#140e0a',beardC:'#140e0a',brow:'#140e0a'}},
  ric4:{scale:1.18,skin:'#cf9068',top:'#18171b',shirt:'#18171b',pants:'#2a2a30',boots:'#2a1c12',torsoW:14,bareFore:true,vest:'#3a2616',scarf:'#a8241e',tattoo:true,
    ior:{hair:'crest',hairC:'#1a120c',hi:'#4a3a2e',len:0,beard:'none',stacheC:'#120c08',beardC:'#1e1610',brow:'#1a120c',gray:.25}},
  ric5:{scale:1.18,skin:'#c98a62',top:'#141317',shirt:'#141317',overall:'#4d5b46',pants:'#4d5b46',boots:'#2a1c12',torsoW:14,bareFore:true,scarf:'#a8241e',belly:true,tattoo:true,
    ior:{hair:'crest',hairC:'#8c8780',hi:'#c4bfb6',len:0,beard:'none',stacheC:'#e2ded6',beardC:'#d2cec6',brow:'#e6e2da',gray:1}},
  // vecinos y amigos
  viejo:{scale:1.0,skin:'#c98d66',hair:'boina',hairC:'#6a625a',stache:'#5a5048',top:'#6a5a48',shirt:'#c9c2b0',pants:'#3a3a40',boots:'#2a1a10',torsoW:12,apron:'#d6ceb4'},
  chofa:{scale:1.02,skin:'#e3b089',hair:'long',hairC:'#2a1a10',top:'#2a2a30',shirt:'#c8c2b0',pants:'#34507a',boots:'#111',torsoW:9.5,bell:true},
  carpo:{scale:1.14,skin:'#d79a74',hair:'long',hairC:'#100c0a',beard:true,beardC:'#100c0a',top:'#1c1a1e',shirt:'#3a3a40',pants:'#2a2a30',boots:'#0b0b0d',torsoW:13,jacket:true,belly:true},
  heavy:{scale:.98,skin:'#e6b48e',hair:'long',hairC:'#5a3a1e',band:'#c8322a',top:'#151418',shirt:'#0d0d10',pants:'#2f4a7a',boots:'#0b0b0d',torsoW:9.5,jacket:true,studs:true},
  vecina:{scale:.92,skin:'#e0aa86',hair:'boina',hairC:'#8a8278',top:'#6a3a5a',shirt:'#e0d8c8',pants:'#4a3a4a',boots:'#2a1a10',torsoW:11},
  tornero:{scale:1.04,skin:'#c98d66',hair:'short',hairC:'#2a1a10',stache:'#2a1a10',top:'#2c4a72',shirt:'#2c4a72',overall:'#2c4a72',pants:'#2c4a72',boots:'#1a1410',torsoW:11.5},
  jubilado:{scale:.95,skin:'#d8a07c',hair:'boina',hairC:'#d8d2c6',stache:'#e6e0d4',top:'#5a5a62',shirt:'#c9c2b0',pants:'#3a3a40',boots:'#2a1a10',torsoW:11},
  camionero:{scale:1.08,skin:'#b9805c',hair:'cap',hairC:'#1a1a1e',capC:'#c8322a',stache:'#1a120c',top:'#3a5a3a',shirt:'#3a5a3a',pants:'#2a3a4a',boots:'#1a1410',torsoW:13,belly:true},
  anselmo:{scale:.95,skin:'#c98d66',hair:'boina',hairC:'#d8d2c6',stache:'#e6e0d4',top:'#7a2a1e',shirt:'#c9c2b0',pants:'#3a3a40',boots:'#2a1a10',torsoW:12},
  peon:{scale:1.0,skin:'#a8714e',hair:'boina',hairC:'#141218',stache:'#141218',top:'#6a5a3a',shirt:'#c8bca0',pants:'#c8bca0',boots:'#2a1a10',torsoW:11,scarf:'#e8e2d0'},
  movilero:{scale:1.0,skin:'#e6b48e',hair:'short',hairC:'#2a1a10',top:'#b8862a',shirt:'#e8e8ea',pants:'#2f333d',boots:'#0b0b0d',torsoW:9.5},
  // capítulo 1: Caseros y el Abasto, 1978
  patotero:{scale:1.0,skin:'#d8a07c',hair:'long',hairC:'#2a1a10',stache:'#2a1a10',top:'#c8a22a',shirt:'#c8a22a',pants:'#5a3a2a',boots:'#1a1410',torsoW:10,bell:true,stripes:'#7a5a1a'},
  patotero2:{scale:1.02,skin:'#c08860',hair:'short',hairC:'#0f0a08',glasses:true,top:'#2a6a5a',shirt:'#2a6a5a',pants:'#3a2e24',boots:'#1a1410',torsoW:10,bell:true},
  chorro:{scale:.96,skin:'#e0b08e',hair:'cap',hairC:'#1a1a1e',capC:'#2a5a8a',top:'#3a3a46',shirt:'#22262e',pants:'#2a2a30',boots:'#e2dccb',torsoW:9},
  estibador:{scale:1.22,skin:'#a8714e',hair:'bald',top:'#d8d0c0',shirt:'#d8d0c0',pants:'#3a3228',boots:'#1a1410',torsoW:15,bareFore:true,stache:'#1a120c'},
  capanga:{scale:1.3,skin:'#d79a74',hair:'slick',hairC:'#1b1612',stache:'#1b1612',top:'#6a2a22',shirt:'#e0d8c8',pants:'#3a3228',boots:'#1a0f08',torsoW:13,belly:true,apron:'#c8c0a8'},
  // capítulo 2: Obras, BA Rock 1982
  hippie:{scale:.98,skin:'#e8b890',hair:'long',hairC:'#8a5a2a',band:'#e8c83a',beard:true,beardC:'#8a5a2a',top:'#c87a3a',shirt:'#c87a3a',pants:'#4a6a9a',boots:'#6a4a2a',torsoW:9.5,bell:true,flowers:true},
  hippie2:{scale:1.0,skin:'#d8a07c',hair:'long',hairC:'#5a3a1a',band:'#4f8a3a',top:'#7a5a9a',shirt:'#7a5a9a',pants:'#5a7aa8',boots:'#6a4a2a',torsoW:10,bell:true,flowers:true},
  disco:{scale:1.02,skin:'#e0b08e',hair:'slick',hairC:'#0f0a08',stache:'#0f0a08',top:'#ece8e0',shirt:'#c8322a',pants:'#ece8e0',boots:'#ece8e0',torsoW:10.5,bell:true},
  patovica:{scale:1.22,skin:'#a8714e',hair:'bald',top:'#18171b',shirt:'#18171b',pants:'#2a2a30',boots:'#0b0b0d',torsoW:15,bareFore:true},
  productor:{scale:1.3,skin:'#e0a888',hair:'slick',hairC:'#7a746c',glasses:true,top:'#3a2a4a',shirt:'#e8e0c8',tie:'#d8a22a',pants:'#3a2a4a',boots:'#1a0f08',torsoW:13,belly:true,cigar:true},
  // capítulo 3: El Oeste, 1991
  careta:{scale:1.0,skin:'#e0b08e',hair:'short',hairC:'#141218',glasses:true,top:'#3e4350',shirt:'#e8e8ea',tie:'#b82a26',pants:'#2f333d',boots:'#0b0b0d',torsoW:10},
  careta2:{scale:1.0,skin:'#b9805c',hair:'short',hairC:'#100c0a',glasses:true,top:'#4d3e5a',shirt:'#e8e8ea',tie:'#2a6ab8',pants:'#2e2838',boots:'#0b0b0d',torsoW:10},
  tasador:{scale:1.04,skin:'#f0c4a0',hair:'short',hairC:'#6b4a2a',glasses:true,top:'#2f4a44',shirt:'#e8e8ea',tie:'#d8a22a',pants:'#243630',boots:'#0b0b0d',torsoW:10},
  vaciador:{scale:1.32,skin:'#e0a888',hair:'slick',hairC:'#2a2420',stache:'#2a2420',top:'#24242e',shirt:'#e8e8ea',tie:'#c8322a',pants:'#24242e',boots:'#0b0b0d',torsoW:13.5,belly:true},
  // los de siempre: los que nombraba en letras y entrevistas
  politico:{scale:1.06,skin:'#e8b894',hair:'slick',hairC:'#2a2420',top:'#3a3a4a',shirt:'#e8e8ea',tie:'#6aa0d8',pants:'#3a3a4a',boots:'#0b0b0d',torsoW:11,belly:true},
  cipayo:{scale:1.0,skin:'#f0c4a0',hair:'slick',hairC:'#c8a060',glasses:true,top:'#5a4a2a',shirt:'#e8e8ea',tie:'#c8322a',pants:'#3a3020',boots:'#3a2414',torsoW:10},
  transa:{scale:.98,skin:'#c08860',hair:'cap',hairC:'#141218',capC:'#24242c',top:'#24242c',shirt:'#24242c',pants:'#1a1a24',boots:'#e8e8ea',torsoW:9.5,stripes:'#3a3a48'},
  reptil:{scale:1.08,skin:'#5e4c3e',hair:'bald',lizard:true,wolf:true,top:'#3a3026',shirt:'#6a5a48',pants:'#2e2a26',boots:'#4a3a2e',torsoW:11.5,belly:true},
  reptilazo:{scale:2.0,skin:'#8a2a22',hair:'bald',lizard:true,horns:true,tail:true,stache:'#140c0c',top:'#141016',shirt:'#e8e2d0',pants:'#141016',boots:'#0b0b0d',torsoW:15,jacket:true},
  // capítulo 4: la ruta, 2001
  cuatrero:{scale:1.04,skin:'#b07a54',hair:'boina',hairC:'#141218',stache:'#141218',top:'#5a4632',shirt:'#c8bca0',pants:'#c8bca0',boots:'#2a1a10',torsoW:11,scarf:'#e8e2d0'},
  bancario:{scale:1.0,skin:'#e8bc98',hair:'slick',hairC:'#3a2a1a',glasses:true,top:'#2a3a5a',shirt:'#e8e8ea',tie:'#2a6ab8',pants:'#2a3a5a',boots:'#0b0b0d',torsoW:10},
  banquero:{scale:1.3,skin:'#f0c4a0',hair:'slick',hairC:'#c8c2b8',glasses:true,top:'#1a1a24',shirt:'#e8e8ea',tie:'#2a6ab8',pants:'#1a1a24',boots:'#0b0b0d',torsoW:13,belly:true,cigar:true},
  // capítulo 5: el campo, 2023
  camara:{scale:1.08,skin:'#b9805c',hair:'cap',hairC:'#1a1a1e',capC:'#2a5a8a',top:'#3a4654',shirt:'#22262e',pants:'#3a3a40',boots:'#0b0b0d',torsoW:12},
  influ:{scale:.98,skin:'#f0c4a0',hair:'slick',hairC:'#d8c060',glasses:true,top:'#7a3a8a',shirt:'#e8e8ea',pants:'#d8d4cc',boots:'#e8e8ea',torsoW:9.5},
  agrimensor:{scale:1.02,skin:'#d8a07c',hair:'cap',hairC:'#1a1a1e',capC:'#e8e2d0',top:'#e07a1a',shirt:'#e07a1a',pants:'#3a4a5a',boots:'#1a1410',torsoW:10.5},
  loteador:{scale:1.32,skin:'#d79a74',hair:'cap',hairC:'#1b1612',capC:'#e8c83a',stache:'#1b1612',top:'#e07a1a',shirt:'#e07a1a',pants:'#3a4a5a',boots:'#1a0f08',torsoW:13.5,belly:true}
};
const NAMES={ric1:'RICARDO',ric2:'RICARDO',ric3:'RICARDO',ric4:'RICARDO',ric5:'RICARDO',viejo:'EL VIEJO',chofa:'EL CHOFA',carpo:'EL CARPO',heavy:'UN HEAVY',vecina:'DOÑA NÉLIDA',tornero:'EL TORNERO',
  jubilado:'DON TITO',camionero:'EL CAMIONERO',anselmo:'DON ANSELMO',peon:'EL PEÓN',movilero:'EL MOVILERO',capanga:'EL CAPANGA',productor:'EL PRODUCTOR',vaciador:'EL VACIADOR',banquero:'EL BANQUERO',loteador:'EL LOTEADOR',reptil:'LOBIZÓN',reptilazo:'MANDINGA'};

// v9: más épocas de Ricardio (10 capítulos) y los villanos nuevos
Object.assign(STY,{
  // 1979: pibe de rulos, campera de jean
  ricV:{scale:1.11,skin:'#dea67c',top:'#3e5f8e',shirt:'#e8e2d0',pants:'#2a3a5a',boots:'#1a1410',torsoW:11,jacket:true,bell:true,
    ior:{hairC:'#1a120c',hi:'#3e2e20',len:13,beard:'none',brow:'#1a120c',curly:true}},
  // 1988: nace Hermética, cuero negro y bigote
  ricH:{scale:1.14,skin:'#dca07a',top:'#1a1618',shirt:'#2a2a30',pants:'#22222a',boots:'#0b0b0d',torsoW:12,jacket:true,studs:true,belt:'#3a3a40',
    ior:{hairC:'#120c08',hi:'#36281c',len:17,beard:'stache',stacheC:'#120c08',brow:'#120c08'}},
  // 1994: estadios, candado y remera negra
  ricM:{scale:1.17,skin:'#d69a70',top:'#121114',shirt:'#121114',pants:'#2c2c34',boots:'#0b0b0d',torsoW:13.5,bareFore:true,tee:'HERMETICA',tattoo:true,
    ior:{hairC:'#140e0a',hi:'#3a2c20',len:18,beard:'candado',stacheC:'#140e0a',beardC:'#140e0a',brow:'#140e0a'}},
  // 1995: Almafuerte, barba cerrada oscura
  ricA:{scale:1.18,skin:'#d2946a',top:'#16151a',shirt:'#16151a',pants:'#2a2a30',boots:'#2a1c12',torsoW:14,bareFore:true,tattoo:true,scarf:'#2a2a6a',
    ior:{hair:'crest',hairC:'#160f0a',hi:'#3e2e22',len:0,beard:'none',stacheC:'#100a06',beardC:'#1a120c',brow:'#160f0a'}},
  // 2006: las sierras, barba larga que encanece, camisa de campo
  ricT:{scale:1.18,skin:'#cc8c64',top:'#5e2a20',shirt:'#5e2a20',pants:'#3a3a32',boots:'#2a1c12',torsoW:14,bareFore:true,tattoo:true,scarf:'#e8e2d0',belly:true,
    ior:{hair:'crest',hairC:'#3a3430',hi:'#7a746c',len:0,beard:'none',stacheC:'#4a443e',beardC:'#5e5850',brow:'#3a3430',gray:.35}},
  pelusa:{scale:1.06,skin:'#d09468',hair:'long',hairC:'#6a6058',beard:true,beardC:'#7a7068',top:'#2a2a30',shirt:'#c8c2b0',pants:'#34507a',boots:'#2a1c12',torsoW:12,jacket:true,belly:true},
  violero:{scale:1.0,skin:'#e3b089',hair:'long',hairC:'#3a2414',top:'#151418',shirt:'#0d0d10',pants:'#2a2a30',boots:'#111',torsoW:9.5,jacket:true},
  pibe:{scale:.94,skin:'#e6b48e',hair:'long',hairC:'#2a1a10',band:'#e8e2d0',top:'#151418',shirt:'#151418',pants:'#2f4a7a',boots:'#e8e8ea',torsoW:9,tee:true},
  // 1979: la razzia
  cana:{scale:1.04,skin:'#d8a07c',hair:'cap',hairC:'#1a1a1e',capC:'#22304a',stache:'#1a120c',top:'#2a3a5a',shirt:'#2a3a5a',pants:'#2a3a5a',boots:'#0b0b0d',torsoW:11},
  cana2:{scale:1.08,skin:'#b9805c',hair:'cap',hairC:'#1a1a1e',capC:'#22304a',top:'#2a3a5a',shirt:'#2a3a5a',pants:'#2a3a5a',boots:'#0b0b0d',torsoW:12},
  buchon:{scale:.98,skin:'#e8bc98',hair:'slick',hairC:'#2a2420',glasses:true,top:'#6a6a5a',shirt:'#e0d8c8',pants:'#4a4a42',boots:'#2a1a10',torsoW:10},
  comisario:{scale:1.32,skin:'#d79a74',hair:'cap',hairC:'#1b1612',capC:'#22304a',stache:'#1b1612',top:'#2a3a5a',shirt:'#e8e2d0',tie:'#1a1a24',pants:'#2a3a5a',boots:'#0b0b0d',torsoW:13.5,belly:true},
  // 1988: Recoleta
  cheto:{scale:1.0,skin:'#f0c4a0',hair:'slick',hairC:'#c8a060',top:'#e8d8b0',shirt:'#e8d8b0',pants:'#d8ccb0',boots:'#6a3a1e',torsoW:10,scarf:'#3a6ab8'},
  cheto2:{scale:1.02,skin:'#e8b894',hair:'short',hairC:'#3a2a1a',glasses:true,top:'#2a4a7a',shirt:'#e8e8ea',pants:'#d8ccb0',boots:'#6a3a1e',torsoW:10},
  critico:{scale:.98,skin:'#f0c4a0',hair:'boina',hairC:'#141218',glasses:true,top:'#141218',shirt:'#141218',pants:'#2a2a30',boots:'#0b0b0d',torsoW:9.5,scarf:'#c8322a'},
  curador:{scale:1.3,skin:'#f0c4a0',hair:'slick',hairC:'#d8d2c6',glasses:true,top:'#e8e2d0',shirt:'#141218',pants:'#e8e2d0',boots:'#0b0b0d',torsoW:12.5,scarf:'#d8a22a'},
  // 1994: el estadio
  revendedor:{scale:.98,skin:'#c08860',hair:'cap',hairC:'#141218',capC:'#c8322a',top:'#3a3a46',shirt:'#3a3a46',pants:'#2a2a30',boots:'#e8e8ea',torsoW:9.5},
  seguridad:{scale:1.22,skin:'#a8714e',hair:'bald',top:'#e8c83a',shirt:'#18171b',pants:'#2a2a30',boots:'#0b0b0d',torsoW:15,bareFore:true,vest:'#e8c83a'},
  empresario:{scale:1.32,skin:'#e8b894',hair:'slick',hairC:'#1a1418',glasses:true,top:'#4a1a2a',shirt:'#e8e8ea',tie:'#e8c83a',pants:'#4a1a2a',boots:'#0b0b0d',torsoW:13.5,belly:true,cigar:true},
  // 1995: Constitución
  barra:{scale:1.02,skin:'#b9805c',hair:'short',hairC:'#0f0a08',top:'#c8322a',shirt:'#c8322a',pants:'#2a2a30',boots:'#e8e8ea',torsoW:10.5,stripes:'#e8e8ea'},
  inspector:{scale:1.0,skin:'#e0b08e',hair:'short',hairC:'#2a2420',glasses:true,top:'#5a6a5a',shirt:'#e8e8ea',tie:'#2a3a2a',pants:'#3a4a3a',boots:'#0b0b0d',torsoW:10},
  clausurador:{scale:1.3,skin:'#d79a74',hair:'slick',hairC:'#2a2420',stache:'#2a2420',top:'#3a4a3a',shirt:'#e8e8ea',tie:'#c8322a',pants:'#3a4a3a',boots:'#0b0b0d',torsoW:13,belly:true},
  // 2006: las sierras
  cazador:{scale:1.04,skin:'#c98d66',hair:'cap',hairC:'#1a1a1e',capC:'#4a5a2a',stache:'#2a1a10',top:'#4a5a2a',shirt:'#4a5a2a',pants:'#3a3a2a',boots:'#2a1a10',torsoW:11.5,vest:'#6a5a2a'},
  newage:{scale:.98,skin:'#e8b890',hair:'long',hairC:'#c8a060',band:'#a83aa8',top:'#e8e2d0',shirt:'#e8e2d0',pants:'#a87a4a',boots:'#6a4a2a',torsoW:9.5,flowers:true},
  intendente:{scale:1.32,skin:'#e8b894',hair:'slick',hairC:'#3a2e24',top:'#2a2a3a',shirt:'#e8e8ea',tie:'#6aa0d8',pants:'#2a2a3a',boots:'#0b0b0d',torsoW:13.5,belly:true}
});
Object.assign(NAMES,{ricV:'RICARDO',ricH:'RICARDO',ricM:'RICARDO',ricA:'RICARDO',ricT:'RICARDO',violero:'EL VIOLERO',pelusa:'EL PELUSA',pibe:'UN PIBE HEAVY',
  cana:'LA CANA',cana2:'LA CANA',buchon:'EL BUCHÓN',comisario:'EL COMISARIO',cheto:'CHETO',cheto2:'CHETO',critico:'EL CRÍTICO',curador:'EL CURADOR',
  revendedor:'REVENDEDOR',seguridad:'SEGURIDAD',empresario:'EL EMPRESARIO',barra:'BARRA',inspector:'INSPECTOR',clausurador:'EL CLAUSURADOR',
  cazador:'CAZADOR FURTIVO',newage:'HIPPIE NEW AGE',intendente:'EL INTENDENTE'});


/* ================= poses ================= */
const PK=['lean','tilt','crouch','rot','ft1','ft2','bt1','bt2','fa1','fa2','ba1','ba2'];
const mkP=o=>Object.assign({lean:.08,tilt:0,crouch:0,rot:0,ft1:.25,ft2:.05,bt1:-.25,bt2:-.3,fa1:.7,fa2:2.4,ba1:.4,ba2:2.2},o);
const PO={
  idle:mkP({}),
  jab:mkP({fa1:1.55,fa2:1.6,lean:.15,ba1:.5,ba2:2.3}),
  cross:mkP({ba1:1.5,ba2:1.6,fa1:.4,fa2:2.2,lean:.3,ft1:.4,bt1:-.4}),
  upper:mkP({fa1:2.3,fa2:2.9,lean:-.05,crouch:-2,ft1:.3,bt1:-.35}),
  windup:mkP({fa1:-.4,fa2:1.2,lean:-.12,ba1:.6,ba2:2.3}),
  kickw:mkP({ft1:1.25,ft2:-.2,lean:-.12}),
  kick:mkP({ft1:1.65,ft2:1.55,bt1:-.15,bt2:-.12,lean:-.35,fa1:.2,fa2:1.2,ba1:-.5,ba2:.6}),
  jump:mkP({ft1:.9,ft2:-.3,bt1:.4,bt2:-.9,fa1:2.0,fa2:2.6,ba1:1.6,ba2:2.4}),
  jkick:mkP({ft1:1.45,ft2:1.45,bt1:.6,bt2:-1.0,lean:-.25,fa1:.3,fa2:1.4,ba1:-.4,ba2:.5}),
  hurt:mkP({lean:-.35,tilt:-.4,fa1:-.4,fa2:.3,ba1:-.8,ba2:-.3,crouch:2,ft1:.1,bt1:-.3}),
  hurt2:mkP({lean:.45,tilt:.4,fa1:.3,fa2:.6,ba1:.2,ba2:.5,crouch:4}),
  fall:mkP({ft1:.9,ft2:1.0,bt1:.6,bt2:.7,fa1:2.4,fa2:2.6,ba1:2.0,ba2:2.4,tilt:-.3}),
  down:mkP({ft1:.2,ft2:.3,bt1:.1,bt2:.2,fa1:2.6,fa2:2.8,ba1:2.2,ba2:2.6,tilt:-.2}),
  getup:mkP({crouch:14,lean:.6,ft1:1.3,ft2:-.3,bt1:-.5,bt2:-1.3,fa1:.2,fa2:.2}),
  grab:mkP({fa1:1.25,fa2:1.35,ba1:1.15,ba2:1.25,lean:.15}),
  grabbed:mkP({lean:.45,tilt:.3,crouch:5,fa1:.2,fa2:.4,ba1:.1,ba2:.3}),
  knee:mkP({fa1:1.1,fa2:1.5,ba1:1.0,ba2:1.4,ft1:1.7,ft2:.1,lean:.2}),
  hbutt:mkP({fa1:1.25,fa2:1.35,ba1:1.15,ba2:1.25,lean:.7,tilt:.5,crouch:2}),
  throw:mkP({lean:-.45,fa1:2.8,fa2:3.0,ba1:2.6,ba2:2.9,ft1:.4,bt1:-.5}),
  specw:mkP({fa1:.9,fa2:.6,ba1:.9,ba2:.6,lean:.4,crouch:8,tilt:.3}),
  spec:mkP({fa1:2.5,fa2:2.8,ba1:-2.5,ba2:-2.8,tilt:-.55,lean:-.2,crouch:4,ft1:.55,ft2:.4,bt1:-.55,bt2:-.4}),
  dodge:mkP({lean:.6,crouch:8,ft1:1.0,ft2:.2,bt1:-.7,bt2:-1.3,fa1:.9,fa2:2.0,ba1:.5,ba2:1.8}),
  swingw:mkP({fa1:2.9,fa2:2.6,lean:-.15,ba1:.5}),
  swing:mkP({fa1:1.3,fa2:1.15,lean:.3,ba1:.3,ba2:2.0,ft1:.45,bt1:-.4}),
  charge:mkP({lean:.75,crouch:6,fa1:.3,fa2:.7,ba1:-.3,ba2:.2,tilt:.2}),
  sit:mkP({ft1:1.3,ft2:.25,bt1:1.2,bt2:.15,fa1:1.25,fa2:1.4,ba1:1.15,ba2:1.3,lean:.2}),
  tied:mkP({fa1:-.5,fa2:-.2,ba1:-.6,ba2:-.3,tilt:.35,lean:.05,ft1:.05,ft2:0,bt1:-.05,bt2:0}),
  victory:mkP({fa1:1.9,fa2:2.9,ba1:2.75,ba2:2.95,tilt:-.25,lean:-.1,ft1:.35,bt1:-.35}),
  taunt:mkP({fa1:2.2,fa2:2.9,ba1:-2.2,ba2:-2.9,lean:-.1}),
  mate:mkP({fa1:.6,fa2:2.3,ba1:.1,ba2:.3,lean:.12,ft1:.08,ft2:0,bt1:-.08,bt2:-.05}),
  film:mkP({fa1:2.45,fa2:1.65,ba1:1.5,ba2:1.9,lean:.05}),
  stand:mkP({fa1:.15,fa2:.25,ba1:-.1,ba2:.1,ft1:.08,ft2:0,bt1:-.08,bt2:-.05,lean:.03})
};

/* ================= puppet renderer ================= */
function L(x1,y1,x2,y2,w,c,p){ctx.strokeStyle=p?c:OUTP;ctx.lineWidth=p?w:w+2.4*OW;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();}
function Cc(x,y,r,c,p){ctx.fillStyle=p?c:OUTP;ctx.beginPath();ctx.arc(x,y,p?r:r+1.2*OW,0,Math.PI*2);ctx.fill();}
function poly(pts,c,p,g){g=g||ctx;g.fillStyle=p?c:OUTP;g.beginPath();pts.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.fill();if(!p){g.strokeStyle=OUT;g.lineWidth=2.4;g.lineJoin='round';g.stroke();}}
function drawIorioHead(st,sk,hc,fl){
  const I=st.ior,bc=fl?'#fff':(I.beardC||hc),hl=I.hair==='crest'?0:(I.len||14);
  for(const p of [0,1]){
    if(I.hair==='crest'){
      Cc(-.5,-1,6.2,fl?'#fff':shade(sk,.84),p);
      poly([[4.6,-5.5],[4,-8.2],[2.2,-12],[0,-12.8],[-2.4,-12.4],[-5,-11],[-7.2,-7.5],[-7.8,-2],[-6.8,1.5],[-5,1.5],[-5.5,-2],[-4.6,-6],[-1,-7.2],[2,-6.5]],hc,p);
      Cc(1,.5,6.6,sk,p);
    }else{
      poly([[-6,-4],[0,-6],[-1,4],[-2.6,hl],[-8.6,hl-1.5],[-9.2,4]],hc,p);           // melena atrás, hasta los hombros
      Cc(1,.5,6.6,sk,p);                                                                // cara
      if(I.beard==='full'||I.beard==='long'){const by=I.beard==='long'?18:13;poly([[-.5,1.5],[3,2],[9.2,3.4],[9,by-4.5],[5.8,by+.5],[1.5,by],[-1.5,7]],bc,p);}
      poly([[-6.8,-1],[-5.4,-6.2],[0,-8.2],[5.2,-7.2],[7.6,-3.4],[4.2,-4.6],[1.6,-3.4],[.8,3],[.4,hl-2],[-3,hl-.8],[-5.4,6]],hc,p); // raya al medio: la melena cae al costado de la cara
    }
  }
  if(fl)return;
  if(I.hair==='crest'){
    ctx.strokeStyle=I.hi;ctx.lineWidth=.9;ctx.beginPath();
    ctx.moveTo(4,-8.2);ctx.lineTo(2.2,-12);ctx.moveTo(1.2,-7.5);ctx.lineTo(0,-12.8);ctx.moveTo(-1.8,-7);ctx.lineTo(-2.4,-12.4);ctx.moveTo(-4,-6.5);ctx.lineTo(-5,-11);ctx.stroke();
    if(I.gray){ctx.strokeStyle=I.gray>=1?'#ffffff':'#9a948c';ctx.lineWidth=.5;ctx.beginPath();ctx.moveTo(2.2,-12);ctx.lineTo(0,-12.8);ctx.lineTo(-2.4,-12.4);ctx.stroke();}
    Cc(-.5,-1,4.5,'rgba(40,25,20,.18)');
  }else{
    const sw=Math.sin(tick*.08)*.8;ctx.strokeStyle=I.hi;ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(-1,-6);ctx.quadraticCurveTo(.4,4,0+sw,hl-3);ctx.moveTo(-3.5,-5);ctx.quadraticCurveTo(-3,4,-4.5+sw,hl-2);ctx.moveTo(-7,0);ctx.lineTo(-7.6+sw,hl-3);ctx.moveTo(2,-6.6);ctx.lineTo(5.6,-5.4);ctx.stroke();
    ctx.strokeStyle=shade(hc,.6);ctx.beginPath();ctx.moveTo(-2.2,-4);ctx.quadraticCurveTo(-1.6,5,-2+sw,hl-1);ctx.moveTo(-5.6,-2);ctx.lineTo(-6+sw,hl-1);ctx.stroke();
    if(I.curly){for(let k=0;k<9;k++){const a=k/8*Math.PI*1.25+Math.PI*.85,r=7.4+(k%2);ctx.fillStyle=k%2?hc:shade(hc,1.35);ctx.beginPath();ctx.arc(-1+Math.cos(a)*r,-1+Math.sin(a)*r*.95,1.9,0,Math.PI*2);ctx.fill();}for(let k=0;k<4;k++){ctx.fillStyle=k%2?I.hi:hc;ctx.beginPath();ctx.arc(-3.5-k*.8+sw,6+k*2.4,1.8,0,Math.PI*2);ctx.fill();}}
    if(I.gray){ctx.strokeStyle=I.gray>=1?'#d8d4cc':'#7a746c';ctx.beginPath();ctx.moveTo(1,-6.5);ctx.lineTo(.6,hl-5);if(I.gray>=1){ctx.moveTo(-5.6,-2);ctx.lineTo(-6.4,hl-4);}ctx.stroke();}
  }
  ctx.fillStyle=I.brow;ctx.fillRect(2.6,-3.3,4.8,1.5);                              // cejas gruesas
  ctx.fillStyle='#efe6da';ctx.fillRect(3.4,-1.5,2.8,1.7);ctx.fillStyle='#3a2414';ctx.fillRect(4.5,-1.5,1.5,1.7);ctx.fillStyle='#0a0606';ctx.fillRect(4.9,-1.2,.8,1.1);ctx.fillStyle=shade(st.skin,.7);ctx.fillRect(3.2,-1.9,3.2,.6);
  ctx.globalAlpha=.35;ctx.fillStyle=shade(st.skin,.6);ctx.beginPath();ctx.ellipse(2.6,2.6,2.2,1.6,0,0,Math.PI*2);ctx.fill();ctx.globalAlpha=.25;ctx.fillStyle='#fff3e0';ctx.fillRect(4,-4.6,3,1);ctx.fillRect(7.6,.2,1,1);ctx.globalAlpha=1;
  ctx.fillStyle=sk;ctx.beginPath();ctx.arc(7.7,1.2,2.2,0,Math.PI*2);ctx.fill();      // nariz fuerte
  ctx.fillStyle=shade(st.skin,.72);ctx.fillRect(6.6,2.6,2,1);
  const sc=I.stacheC;
  if(I.beard==='none'){ctx.fillStyle=shade(st.skin,.7);ctx.fillRect(4.6,4.8,3,.9);}
  else{ctx.fillStyle=sc;ctx.fillRect(3,3.2,6,2.1);ctx.fillRect(3,4.6,1.7,3.4);ctx.fillRect(7.6,5,1.3,1.6);}  // bigote caído
  if(I.beard==='candado'){ctx.fillStyle=I.beardC;ctx.fillRect(4.4,6.6,3.6,4);ctx.fillRect(3,7.4,1.6,2.6);}
  if(I.beard==='full'||I.beard==='long'){ctx.fillStyle=shade(I.beardC,I.gray>=1?.82:1.35);const n=I.beard==='long'?5:3;for(let k=0;k<n;k++)ctx.fillRect(2+k*1.4,7+(k%2)*2,1,I.beard==='long'?8:3.5);}
}
function drawHead(hx,hy,a,st,fl){
  ctx.save();ctx.translate(hx,hy);ctx.rotate(a);ctx.scale(.86,.86);
  const sk=fl?'#fff':st.skin,hc=fl?'#fff':(st.ior?st.ior.hairC:(st.hairC||'#111'));
  if(st.ior){drawIorioHead(st,sk,hc,fl);ctx.restore();return;}
  for(const p of [0,1]){
    if(st.hair==='long')L(-3,-3,-6.5,13,9,hc,p);
    if(st.hair==='long'||st.hair==='short'||st.hair==='slick'||st.hair==='cap')Cc(-1.5,-1.5,7.2,hc,p);
    if(st.hair==='boina')Cc(-2,0,6.6,hc,p);
    Cc(1,.5,st.hair==='bald'?7:6.4,sk,p);
    if(st.beard)Cc(2.6,4.6,5.1,fl?'#fff':(st.beardC||hc),p);
    if(st.hair==='cap'){ctx.fillStyle=p?(fl?'#fff':st.capC):OUTP;ctx.beginPath();ctx.arc(.5,-2.5,p?6.8:8,Math.PI,Math.PI*2);ctx.fill();ctx.fillRect(3,-3.6,p?8:9.5,p?2:3.2);}
    if(st.hair==='boina'){ctx.fillStyle=p?(fl?'#fff':'#23212b'):OUTP;ctx.beginPath();ctx.ellipse(0,-5.6,p?8.6:9.8,p?3.2:4.2,-.08,0,Math.PI*2);ctx.fill();}
  }
  if(!fl){
    if(st.hair==='long'||st.hair==='short'||st.hair==='slick'){ctx.fillStyle=hc;ctx.beginPath();ctx.arc(.5,-4.4,5,Math.PI*.95,Math.PI*2.05);ctx.fill();}
    if(st.band){ctx.fillStyle=st.band;ctx.fillRect(-6,-4.6,13,2);}
    ctx.fillStyle=sk;ctx.beginPath();ctx.arc(7,1.2,1.7,0,Math.PI*2);ctx.fill();
    if(st.glasses){ctx.fillStyle='#050507';ctx.fillRect(.5,-2.8,7,2.9);ctx.fillStyle='#9fb4d8';ctx.fillRect(5,-2.4,1,1);}
    else if(!st.lizard){ctx.fillStyle='#efe6da';ctx.fillRect(2.6,-1.6,2.6,1.9);ctx.fillStyle='#120c0a';ctx.fillRect(3.6,-1.6,1.4,1.9);ctx.fillStyle=shade(hc,.8);ctx.fillRect(2.2,-3.4,3.6,1.1);}
    if(st.hair!=='long'&&!st.lizard){ctx.fillStyle=shade(sk,.82);ctx.beginPath();ctx.ellipse(-1.4,1.2,1.5,2,0,0,Math.PI*2);ctx.fill();ctx.fillStyle=shade(sk,.62);ctx.fillRect(-1.6,.6,.8,1.4);}
    if(!st.lizard&&!st.stache&&!st.beard){ctx.fillStyle=shade(sk,.6);ctx.fillRect(4.2,4.6,2.6,.8);}
    if(!st.lizard){ctx.globalAlpha=.28;ctx.fillStyle=shade(sk,.55);ctx.beginPath();ctx.arc(1,.5,6.4,Math.PI*.55,Math.PI*1.25);ctx.lineTo(1,.5);ctx.fill();ctx.globalAlpha=1;}
    if(st.stache){ctx.fillStyle=st.stache;ctx.fillRect(2.6,2.6,5.4,1.9);}
    if(st.cigar){ctx.fillStyle='#6a4426';ctx.fillRect(6,4,6,1.6);ctx.fillStyle=tick%20<10?'#ff6a2a':'#c8322a';ctx.fillRect(11.4,4,1.2,1.6);}
    if(st.hair==='bald'&&!st.lizard){ctx.fillStyle='rgba(30,20,15,.35)';ctx.fillRect(1,4,6,3);ctx.fillStyle='#120c0a';ctx.fillRect(2,-3.6,5,1.2);}
    if(st.lizard&&st.wolf){const fu=shade(st.skin,.7);ctx.fillStyle=fu;ctx.beginPath();ctx.moveTo(-3.5,-5);ctx.lineTo(-2,-11.5);ctx.lineTo(.4,-5.4);ctx.moveTo(.6,-5.6);ctx.lineTo(3,-10.8);ctx.lineTo(4,-5);ctx.fill();ctx.fillStyle=st.skin;ctx.beginPath();ctx.moveTo(4,-1);ctx.lineTo(11.5,1.4);ctx.lineTo(11,3.4);ctx.lineTo(4.4,5.2);ctx.fill();ctx.fillStyle='#120c0a';ctx.fillRect(10.4,.9,1.6,1.4);ctx.fillStyle='#efe6da';ctx.fillRect(6.5,3.4,1,1.4);ctx.fillRect(9,2.8,1,1.3);ctx.fillStyle=fu;for(let k=0;k<6;k++){ctx.fillRect(-6+k*1.6,5.2+(k%2),1.1,2.6);}ctx.fillStyle='#f2d22a';ctx.fillRect(2.8,-2.4,2.6,1.8);ctx.fillStyle='#120c0a';ctx.fillRect(3.9,-2.4,.8,1.8);}
    else if(st.lizard&&st.horns){ctx.fillStyle='#d8cfc0';for(const hx of [-2.5,2.5]){ctx.beginPath();ctx.moveTo(hx-1.6,-5);ctx.quadraticCurveTo(hx-2.5,-9,hx+(hx<0?-3:2),-11.5);ctx.lineTo(hx+1.4,-5.2);ctx.fill();}ctx.fillStyle='#ff5a1a';ctx.fillRect(2.8,-2.2,3,1.6);ctx.fillStyle='#120c0a';ctx.fillRect(4,-2.2,.8,1.6);ctx.fillStyle='#140c0c';ctx.beginPath();ctx.moveTo(2,4.5);ctx.lineTo(6.5,4.6);ctx.lineTo(4.6,9);ctx.fill();}
    else if(st.lizard){ctx.fillStyle=shade(st.skin,.72);for(let k=0;k<7;k++)ctx.fillRect(-4.5+(k%3)*3,-5+(k/3|0)*3+(k%2),1.4,1.4);ctx.fillStyle='#f2d22a';ctx.fillRect(2.8,-2.4,3.4,2.4);ctx.fillStyle='#120c0a';ctx.fillRect(4.1,-2.6,.9,2.8);
      ctx.fillStyle=shade(st.skin,.6);ctx.fillRect(3,4.6,5,.9);if(tick%70<10){ctx.strokeStyle='#d8324a';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(7,4.8);ctx.lineTo(11,5.2);ctx.lineTo(12.5,4.2);ctx.moveTo(11,5.2);ctx.lineTo(12.5,6.4);ctx.stroke();}
      if(st.spikes){ctx.fillStyle=shade(st.skin,.66);for(let k=0;k<4;k++){ctx.beginPath();ctx.moveTo(-7+k*3,-4.6);ctx.lineTo(-5.5+k*3,-9.5);ctx.lineTo(-4+k*3,-4.6);ctx.fill();}}}
    if(st.belly){ctx.fillStyle=shade(st.skin,.85);ctx.beginPath();ctx.arc(2,6,3.6,0,Math.PI);ctx.fill();}
  }
  ctx.restore();
}

// v13: el arma de mano cambia según la época: caño, bajo viejo o termo
function MEL(){if(lvl===0&&BGIFT.done)return 'bajo';return [ 'caño','caño','bajo','bajo','caño','bajo','caño','caño','rastrillo','rastrillo','rastrillo'][lvl]||'caño';}
function drawMelee(hx,hy,a2,ground){const k=MEL(),dx=Math.sin(a2),dy=Math.cos(a2);
  if(k==='rastrillo'){for(const p of [0,1]){L(hx-dx*6,hy-dy*6,hx+dx*24,hy+dy*24,2.4,'#8a6a3a',p);L(hx+dx*24-dy*6,hy+dy*24+dx*6,hx+dx*24+dy*6,hy+dy*24-dx*6,2.2,'#6a6a72',p);}ctx.fillStyle='#9aa0a8';for(let k=-2;k<=2;k++)ctx.fillRect(hx+dx*27+dy*k*2.6-.6,hy+dy*27-dx*k*2.6-.6,1.4,1.4);return;}
  if(k==='bajo'){BASS(hx,hy,a2+Math.PI,lvl<=2);return;}
  for(const p of [0,1])L(hx-dx*5,hy-dy*5,hx+dx*20,hy+dy*20,3.2,'#9aa0a8',p);ctx.strokeStyle='#d6dbe2';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(hx-dx*4,hy-dy*4-1);ctx.lineTo(hx+dx*19,hy+dy*19-1);ctx.stroke();}
function HELD(weapon,hx,hy,a2,f,st){
    if(weapon==='pipe')drawMelee(hx,hy,a2);
    if(weapon==='bass')BASS(hx,hy,a2,lvl<=2);
    if(weapon==='mic'){const dx=Math.sin(a2),dy=Math.cos(a2);for(const p of [0,1]){L(hx,hy,hx+dx*6,hy+dy*6,2.2,'#2a2a30',p);Cc(hx+dx*8,hy+dy*8,2.6,'#3a3a42',p);}ctx.fillStyle='#c8322a';ctx.fillRect(hx+dx*4-1.5,hy+dy*4-1.5,3,3);}
    if(weapon==='phone'){ctx.fillStyle=OUT;ctx.fillRect(hx-2.5,hy-6,5,8);ctx.fillStyle=f.state==='throwp'&&f.t>=14?'#0a0a0d':'#9fd0ff';ctx.fillRect(hx-1.5,hy-5,3,6);}
    if(weapon==='camera'){ctx.fillStyle=OUT;ctx.fillRect(hx-9,hy-7,18,10);ctx.fillStyle='#2a2c34';ctx.fillRect(hx-8,hy-6,16,8);ctx.fillStyle='#4a4e5a';ctx.fillRect(hx-8,hy-6,16,2);ctx.fillStyle='#111';ctx.fillRect(hx+8,hy-5,4,6);
      ctx.fillStyle=f.state==='aim'&&f.t%8<4?'#ff3a2a':'#5a1a14';ctx.fillRect(hx-6,hy-4,2,2);if(f.state==='aim'){ctx.fillStyle='#fff6d8';ctx.fillRect(hx+11,hy-4,2,4);}}
    if(weapon==='gavel'){const dx=Math.sin(a2),dy=Math.cos(a2);for(const p of [0,1]){L(hx,hy,hx+dx*12,hy+dy*12,2.4,'#6a4426',p);L(hx+dx*12-dy*5,hy+dy*12+dx*5,hx+dx*12+dy*5,hy+dy*12-dx*5,5.5,'#8a5a2e',p);}}
    if(weapon==='gtr'){const dx=Math.sin(a2),dy=Math.cos(a2);for(const p of [0,1]){L(hx-dx*2,hy-dy*2,hx+dx*20,hy+dy*20,2.6,'#3a2414',p);Cc(hx-dx*7,hy-dy*7,5.6,'#d8c08a',p);Cc(hx-dx*11,hy-dy*11,5,'#d8c08a',p);}ctx.fillStyle='#1a1418';ctx.fillRect(hx-dx*8-1,hy-dy*8-1,2.4,2.4);}
    if(weapon==='cacerola'){for(const p of [0,1])Cc(hx+2,hy-1,4.2,'#9aa0a8',p);ctx.fillStyle='#c9ccd2';ctx.fillRect(hx,hy-3,3,1);}
    if(weapon==='tomate'){for(const p of [0,1])Cc(hx,hy-3,3.2,'#d8322a',p);ctx.fillStyle='#4f8a3a';ctx.fillRect(hx-1,hy-7,2,2);}
    if(weapon==='papel'||weapon==='contrato'){ctx.fillStyle=OUT;ctx.fillRect(hx-5,hy-8,10,9);ctx.fillStyle='#ece8e0';ctx.fillRect(hx-4,hy-7,8,7);ctx.fillStyle='#8a8a92';ctx.fillRect(hx-3,hy-5,6,1);ctx.fillRect(hx-3,hy-3,5,1);}
    if(weapon==='patacon'){ctx.fillStyle=OUT;ctx.fillRect(hx-6,hy-6,12,7);ctx.fillStyle='#a8c08a';ctx.fillRect(hx-5,hy-5,10,5);ctx.fillStyle='#5a7a4a';ctx.fillRect(hx-1,hy-4,3,3);}
    if(weapon==='bersa'||weapon==='escopeta')drawGunHeld(weapon,hx,hy,a2,f);
    if(weapon==='mate'){for(const p of [0,1])Cc(hx+1,hy-3,3.4,'#5c3a1e',p);ctx.strokeStyle='#c9c9cf';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(hx+1,hy-5);ctx.lineTo(hx+3,hy-10);ctx.stroke();}}
function drawTruck(x,y,riding){
  ctx.save();ctx.translate(Math.round(x),Math.round(y));
  const R=(a,b,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(a,b,w,h);};
  R(-61,-37,120,28,OUT);R(-2,-55,41,22,OUT);
  R(-60,-30,118,18,'#3f6a86');R(-60,-30,118,3,'#5a87a4');R(-60,-36,58,6,'#3f6a86');R(-60,-37,58,2,'#5a87a4');
  R(-1,-54,39,22,'#e6dcc2');R(4,-50,28,13,'#24323e');R(5,-49,8,3,'#4a5e6e');
  if(riding){ctx.fillStyle='#bdb8ae';ctx.beginPath();ctx.arc(24,-42,5,0,Math.PI*2);ctx.fill();ctx.fillStyle='#d39a74';ctx.fillRect(26,-43,4,4);ctx.fillStyle='#d6d2ca';ctx.fillRect(26,-40,4,3);}
  R(38,-38,20,8,'#3f6a86');R(38,-38,20,2,'#5a87a4');R(55,-36,5,18,'#c9ccd2');R(56,-34,3,1,'#6a6e78');R(56,-30,3,1,'#6a6e78');
  R(-62,-14,8,3,'#c9ccd2');R(52,-14,9,3,'#c9ccd2');R(40,-24,6,2,'#24323e');
  ctx.fillStyle='#fff3c8';ctx.beginPath();ctx.arc(55,-27,2.5,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#e6dcc2';ctx.font='5px '+FONT;ctx.textAlign='left';ctx.textBaseline='top';ctx.fillText('F100',40,-34);
  for(const wx of [-38,34]){ctx.fillStyle=OUT;ctx.beginPath();ctx.arc(wx,-10,11,0,Math.PI*2);ctx.fill();ctx.fillStyle='#1c1b20';ctx.beginPath();ctx.arc(wx,-10,10,0,Math.PI*2);ctx.fill();ctx.fillStyle='#e6dcc2';ctx.beginPath();ctx.arc(wx,-10,4.5,0,Math.PI*2);ctx.fill();ctx.fillStyle='#8a8790';ctx.fillRect(wx-1,-11,2,2);}
  ctx.restore();}
function drawMoto(x,y,run){
  ctx.save();ctx.translate(Math.round(x),Math.round(y));ctx.lineCap='round';
  for(const p of [0,1]){Cc(-20,-10,10,'#141216',p);Cc(20,-10,10,'#141216',p);}
  ctx.fillStyle='#55525c';[-20,20].forEach(w=>{ctx.beginPath();ctx.arc(w,-10,5,0,Math.PI*2);ctx.fill();ctx.fillStyle='#8a8790';ctx.fillRect(w-1,-11,2,2);ctx.fillStyle='#55525c';});
  for(const p of [0,1]){L(-20,-10,0,-18,3,'#8a8790',p);L(20,-10,12,-28,3,'#8a8790',p);}
  ctx.fillStyle=OUT;ctx.beginPath();ctx.moveTo(-26,-22);ctx.lineTo(-4,-26);ctx.lineTo(12,-30);ctx.lineTo(16,-22);ctx.lineTo(-2,-14);ctx.lineTo(-22,-15);ctx.closePath();ctx.fill();
  ctx.fillStyle='#8c1a14';ctx.beginPath();ctx.moveTo(-6,-25);ctx.lineTo(12,-29);ctx.lineTo(14,-22);ctx.lineTo(-2,-16);ctx.closePath();ctx.fill();
  ctx.fillStyle='#1c1a20';ctx.fillRect(-25,-24,20,4);
  ctx.fillStyle='#b9b6c0';ctx.fillRect(-28,-16,14,3);
  ctx.fillStyle='#ffe9a8';ctx.fillRect(16,-30,4,4);
  ctx.strokeStyle='#8a8790';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(12,-30);ctx.lineTo(8,-36);ctx.stroke();
  ctx.restore();
}

/* ================= escenarios por capítulo ================= */
let FAR=mkc(1400,190),BG=mkc(8,8),LIGHT=mkc(8,8),LAMPS=[],SIGNS=[];
function sceneKit(g){
  const R=(x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(x,y,w,h);};
  const T=(s,x,y,c,sz,al)=>{g.font=(sz||6)+'px '+FONT;g.textAlign=al||'left';g.textBaseline='top';g.fillStyle=c;g.fillText(U(s),x,y);};
  const brick=(x,y,w,h,base)=>{R(x,y,w,h,base);for(let yy=y;yy<y+h;yy+=5){const off=((yy/5)%2)*6;for(let xx=x-off;xx<x+w;xx+=12){g.fillStyle=shade(base,.82+hsh(xx,yy)*.25);g.fillRect(Math.max(x,xx),yy,Math.min(11,x+w-Math.max(x,xx)),4);}}};
  const poster=(x,y,w,h,bg,lines)=>{R(x,y,w,h,bg);let yy=y+3;for(const [s,c,sz] of lines){T(s,x+w/2,yy,c,sz||4,'center');yy+=(sz||4)+2;}R(x+w-5,y,5,h,'rgba(0,0,0,.18)');};
  const tank=(x,y)=>{R(x,y,26,16,'#5a5c66');R(x,y,26,3,'#6e7080');R(x+3,y+16,3,8,'#3c3d46');R(x+20,y+16,3,8,'#3c3d46');};
  const reja=(x,y,w,h)=>{R(x,y,w,h,'#1a2030');R(x+2,y+2,w-4,h-4,'#3a5070');g.fillStyle='#111';for(let i=x+2;i<x+w;i+=4)g.fillRect(i,y,1,h);g.fillRect(x,y+h/2|0,w,1);};
  const houses=(x0,x1,seed,cols,opt)=>{opt=opt||{};const out=[];let x=x0,i=seed;
    while(x<x1-40){const w=Math.min(x1-x,96+(hsh(i,1)*60|0)),h=(opt.low?62:78)+(hsh(i,2)*30|0),top=176-h,base=cols[i%cols.length];
      if(hsh(i,3)>.5&&!opt.white)brick(x,top,w,h,shade(base,.9));else{R(x,top,w,h,base);for(let k=0;k<40;k++){g.fillStyle='rgba(0,0,0,.1)';g.fillRect(x+hsh(i,k)*w,top+hsh(k,i)*h,3+hsh(k,k)*8,2);}}
      R(x,top,w,4,shade(base,.6));if(!opt.notank&&hsh(i,4)>.35)tank(x+w-38,top-24);
      R(x+12,126,20,50,'#2a1c14');R(x+14,128,16,46,opt.door||'#4a3020');R(x+27,150,2,2,'#c9b26a');
      if(opt.shutters){R(x+44,112,34,30,'#e8e2d0');R(x+46,114,14,26,opt.shutters);R(x+62,114,14,26,opt.shutters);}else reja(x+44,112,34,30);
      if(w>130){R(x+88,120,40,56,'#3a3a42');g.fillStyle='#4e4e58';for(let yy=122;yy<176;yy+=4)g.fillRect(x+88,yy,40,1);}
      out.push({x,w,top});x+=w;i++;}
    return out;};
  const lamp=(x,y)=>{R(x-2,y,3,176-y+18,'#2e2c34');R(x-2,y,16,3,'#2e2c34');R(x+8,y+2,10,4,'#4a4852');};
  const sidewalk=(x0,x1,c)=>{for(let x=x0;x<x1;x+=2){R(x,176,2,24,c||'#625f68');R(x,200,2,3,'#8a8790');R(x,203,2,3,'#4e4b55');R(x,206,2,64,'#2c2a31');}
    for(let x=x0;x<x1;x+=24)R(x,176,1,24,shade(c||'#625f68',.88));R(x0,188,x1-x0,1,shade(c||'#625f68',.88));
    for(let k=0;k<(x1-x0)*.6;k++){g.fillStyle=hsh(k,13)>.5?'#38353e':'#25232a';g.fillRect(x0+hsh(k,11)*(x1-x0)|0,206+hsh(k,12)*64|0,2,1);}
    for(let x=x0+10;x<x1;x+=56)R(x,238,26,2,'#b8a040');};
  const cobble=(x0,x1,c)=>{R(x0,176,x1-x0,94,c);for(let y=178;y<270;y+=6)for(let x=x0+((y/6)%2)*5;x<x1;x+=10){g.fillStyle=shade(c,.8+hsh(x,y)*.35);g.fillRect(x,y,9,5);}};
  const floor=(x0,x1,c)=>{R(x0,176,x1-x0,94,c);for(let k=0;k<(x1-x0)/14;k++){g.fillStyle='rgba(20,18,24,.3)';g.beginPath();g.ellipse(x0+hsh(k,31)*(x1-x0),180+hsh(k,32)*85,8+hsh(k,33)*20,2+hsh(k,34)*3,0,0,Math.PI*2);g.fill();}R(x0,176,2,94,shade(c,.8));};
  const planks=(x0,x1,c)=>{R(x0,176,x1-x0,94,c);for(let y=176;y<270;y+=7){R(x0,y,x1-x0,1,shade(c,.7));for(let x=x0+hsh(y,1)*40;x<x1;x+=48+hsh(x,y)*30)R(x,y,1,7,shade(c,.7));}};
  const ruta=(x0,x1)=>{for(let x=x0;x<x1;x+=2){R(x,176,2,20,hsh(x,1)>.5?'#8a7a5a':'#7e6e50');R(x,196,2,74,'#3c3a42');}
    R(x0,198,x1-x0,2,'#d8d4cc');R(x0,262,x1-x0,2,'#d8d4cc');for(let x=x0+6;x<x1;x+=40)R(x,229,22,2,'#e8c83a');
    for(let k=0;k<(x1-x0)*.5;k++){g.fillStyle=hsh(k,13)>.5?'#46444c':'#2e2c33';g.fillRect(x0+hsh(k,11)*(x1-x0)|0,200+hsh(k,12)*62|0,2,1);}};
  const dirt=(x0,x1,c)=>{R(x0,176,x1-x0,94,c);for(let k=0;k<(x1-x0)*.4;k++){g.fillStyle=shade(c,.8+hsh(k,5)*.4);g.fillRect(x0+hsh(k,3)*(x1-x0)|0,176+hsh(k,4)*94|0,2+hsh(k,6)*3|0,1);}};
  const campo=(x0,x1)=>{for(let y=176;y<270;y+=2){R(x0,y,x1-x0,2,shade('#6a8a3a',.8+(y-176)/94*.35));}
    for(let x=x0;x<x1;x+=2){const py=214+Math.sin(x*.01)*4;R(x,py,2,30,hsh(x,2)>.5?'#8a6e4a':'#7e6442');}
    for(let k=0;k<(x1-x0)*.3;k++){const x=x0+hsh(k,7)*(x1-x0)|0,y=178+hsh(k,8)*90|0;if(y>208&&y<248)continue;R(x,y,1,3,hsh(k,9)>.5?'#86a64a':'#4e6a2a');}};
  const tree=(x,base,h,c,wide)=>{R(x-3,base-h,6,h,'#4a3424');R(x-1,base-h,2,h,'#5e4430');const r=wide||22;for(let k=0;k<7;k++){g.fillStyle=shade(c,.75+hsh(x,k)*.4);g.beginPath();g.arc(x+(hsh(k,x)-.5)*r*1.6,base-h-hsh(x+k,3)*r*.9,r*.55+hsh(k,k+x)*r*.3,0,Math.PI*2);g.fill();}};
  const alambre=(x0,x1,y)=>{for(let x=x0;x<x1;x+=38){R(x,y-26,3,28,'#6a5a3e');}g.fillStyle='rgba(200,200,200,.6)';for(let k=0;k<3;k++)g.fillRect(x0,y-22+k*8,x1-x0,1);};
  const crowd=(x0,x1,y,cols)=>{for(let x=x0;x<x1;x+=7){const h=14+hsh(x,9)*8;g.fillStyle=cols[(x/7|0)%cols.length];g.beginPath();g.arc(x+3,y-h,4,0,Math.PI*2);g.fill();g.fillRect(x,y-h+2,7,h);if(hsh(x,8)>.8){g.fillRect(x+4,y-h-12,2,10);}}};
  return {g,R,T,brick,poster,tank,reja,houses,lamp,sidewalk,cobble,floor,planks,ruta,dirt,campo,tree,alambre,crowd};
}
function sky(g,stops,stars){const gr=g.createLinearGradient(0,0,0,190);stops.forEach((c,i)=>gr.addColorStop(i/(stops.length-1),c));g.fillStyle=gr;g.fillRect(0,0,1400,190);
  for(let i=0;i<(stars||0);i++){g.fillStyle=hsh(i,7)>.85?'#fff':'#a9b2e0';g.fillRect(hsh(i,1)*1400|0,hsh(i,2)*80|0,1,1);}}
function skyline(g,col,hmin,hmax,win){let x=0;while(x<1400){const w=30+hsh(x,9)*50|0,h=hmin+hsh(x,8)*(hmax-hmin)|0;g.fillStyle=hsh(x,6)>.5?col:shade(col,1.15);g.fillRect(x,190-h,w,h);
  if(win)for(let wy=190-h+6;wy<186;wy+=7)for(let wx=x+4;wx<x+w-4;wx+=6){const v=hsh(wx,wy);if(v>.74){g.fillStyle=v>.93?'#ffe9a8':v>.84?'#f2c46a':win;g.fillRect(wx,wy,3,3);}}
  if(hsh(x,4)>.6){g.fillStyle=col;g.fillRect(x+w/2,190-h-14,1,14);}x+=w+(hsh(x,10)*6|0);}}
const SCENES=[
 { // 0 · Caseros y el Abasto, amanecer de 1978
  weather:'mist',light:'#b4a2ae',track:{x0:1040,x1:1600,col:'#7a5a34',stripe:'#d8c08a'},
  lamps:[{x:150,y:64,r:110,c:'255,214,150'},{x:450,y:64,r:110,c:'255,214,150'},{x:700,y:64,r:100,c:'255,214,150',flick:true},{x:1000,y:64,r:100,c:'255,214,150'},
    {x:1300,y:70,r:110,c:'255,226,170'},{x:1800,y:60,r:120,c:'255,200,130'},{x:2060,y:60,r:120,c:'255,200,130'},{x:2320,y:60,r:120,c:'255,200,130'},{x:2540,y:60,r:120,c:'255,200,130'}],
  signs:[{x:410,y:85,t:'VERDULERÍA',c:'#7aff9a',off:'#1a4a2a'}],
  far(g){sky(g,['#24305e','#6a5a8a','#d8866a','#f4c08a'],40);
    const sg=g.createRadialGradient(760,186,4,760,186,220);sg.addColorStop(0,'rgba(255,220,150,.8)');sg.addColorStop(1,'rgba(255,220,150,0)');g.fillStyle=sg;g.fillRect(0,0,1400,190);
    skyline(g,'#3a2e44',24,58,null);g.fillStyle='#2e2438';g.fillRect(420,96,14,94);g.beginPath();g.moveTo(416,98);g.lineTo(427,74);g.lineTo(438,98);g.fill();g.fillRect(426,64,2,12);g.fillRect(422,68,10,2);},
  bg(K){const {R,T,brick,poster,houses,lamp,sidewalk,cobble,g}=K;
    houses(0,300,0,['#8a6f5a','#6f7d86','#8c7c63']);
    // verdulería del viejo
    R(300,76,220,100,'#5a6a4a');brick(300,76,220,22,'#6a5a46');R(310,80,200,16,'#1a1418');
    for(let k=0;k<11;k++)R(304+k*20,100,20,10,k%2?'#e8e2d0':'#b8262a');for(let k=0;k<11;k++){g.fillStyle=k%2?'#e8e2d0':'#b8262a';g.beginPath();g.arc(314+k*20,110,10,0,Math.PI);g.fill();}
    R(320,120,180,56,'#2a2422');R(326,124,168,30,'#d8c08a');T('FRUTAS Y VERDURAS',410,128,'#3a2a1a',5,'center');T('PAPA · BATATA · ZAPALLO',410,138,'#6a3a1a',4,'center');
    for(let k=0;k<6;k++){R(326+k*28,156,24,18,'#6a4426');const cc=['#c8a26a','#e07a1a','#4f8a3a','#c8322a','#8a5a2a','#e8c83a'][k];for(let d=0;d<4;d++){g.fillStyle=cc;g.beginPath();g.arc(330+k*28+d*5,157,2.6,0,Math.PI*2);g.fill();}}
    const hs=houses(520,900,3,['#7a5f6e','#6d6a52','#83614a','#8a6f5a']);
    if(hs[0]){T('CLUB ESTUDIANTES',hs[0].x+6,hs[0].top+12,'#e8e2d0',6);T('CASEROS',hs[0].x+6,hs[0].top+22,'#c8322a',6);}
    if(hs[1])poster(hs[1].x+50,146,30,22,'#1a1418',[['CINE','#e8e2d0'],['LED','#f2b632'],['ZEPPELIN','#f2b632']]);
    // colectivo fileteado estacionado
    {const x=900;R(x,112,136,58,'#e8dcc0');R(x,112,136,10,'#b8262a');R(x,150,136,6,'#b8262a');for(let k=0;k<6;k++)R(x+10+k*20,124,16,18,'#2a3a48');R(x+122,120,12,30,'#2a3a48');
      g.strokeStyle='#d8a22a';g.lineWidth=1;for(let k=0;k<4;k++){g.beginPath();g.arc(x+18+k*32,160,5,Math.PI,Math.PI*2.6);g.stroke();}T('DIOS GUÍA MI CAMINO',x+68,145,'#1a3a6a',4,'center');
      for(const wx of [x+24,x+110]){g.fillStyle='#111';g.beginPath();g.arc(wx,170,9,0,Math.PI*2);g.fill();g.fillStyle='#8a8790';g.beginPath();g.arc(wx,170,4,0,Math.PI*2);g.fill();}}
    // la vía (cielo abierto para que pase el tren)
    R(1040,140,560,36,'#55555e');R(1040,140,560,4,'#6b6b76');R(1040,170,560,3,'#c8b23a');
    R(1200,84,150,56,'#9a7a5a');brick(1200,84,150,56,'#9a6a4a');R(1190,80,170,6,'#5a2a20');R(1214,92,122,14,'#1e3a6a');T('ESTACIÓN CASEROS',1275,96,'#f0f0f0',5,'center');T('F.C. SAN MARTÍN',1275,112,'#efe4d2',4,'center');
    R(1220,116,22,24,'#2a2422');R(1310,116,22,24,'#2a2422');
    R(1120,110,4,66,'#d8d4cc');for(let k=0;k<8;k++)R(1124+k*10,112,10,4,k%2?'#e8e2d0':'#c8322a');T('PARE',1112,96,'#c8322a',5);
    lamp(1300,70);
    // Mercado de Abasto
    R(1600,30,1000,146,'#c8b89a');R(1600,30,1000,8,'#a89878');R(1600,52,1000,4,'#a89878');
    T('MERCADO DE ABASTO',2100,40,'#5a4a3a',8,'center');
    for(let k=0;k<6;k++){const ax=1640+k*160;R(ax,64,110,112,'#2a2220');g.fillStyle='#2a2220';g.beginPath();g.arc(ax+55,64,55,Math.PI,Math.PI*2);g.fill();R(ax+50,10+54,4,112,'#3a302a');R(ax,64,4,112,'#b8a888');}
    for(let k=0;k<14;k++){const bx=1660+hsh(k,1)*900,by=176-12;for(let j=0;j<3;j++){R(bx+j*13,by-(j%2)*10,12,12,'#8a6a42');R(bx+j*13+2,by-(j%2)*10+2,8,2,'#6a4a2a');}}
    for(let k=0;k<5;k++){R(1700+k*190,150,26,26,'#6a4426');for(let d=0;d<4;d++){g.fillStyle='#c8a26a';g.beginPath();g.arc(1705+k*190+d*6,150,3,0,Math.PI*2);g.fill();}}
    {const x=2180;R(x,114,90,46,'#3f6a86');R(x+90,126,32,34,'#e6dcc2');R(x+96,130,20,12,'#24323e');for(const wx of [x+20,x+104]){g.fillStyle='#111';g.beginPath();g.arc(wx,166,10,0,Math.PI*2);g.fill();}T('EL CAMIÓN DEL VIEJO',x+45,128,'#e8e2d0',4,'center');}
    for(const lx of [1800,2060,2320,2540]){R(lx+8,30,1,32,'#1c2228');R(lx+2,60,14,4,'#2a3038');}
    sidewalk(0,1600);cobble(1600,2600,'#5e5a62');
    for(const l of [150,450,700,1000])lamp(l,64);}
 },
 { // 1 · Obras, BA Rock 1982
  weather:'spots',light:'#6c6690',
  lamps:[{x:120,y:64,r:110,c:'255,190,120'},{x:380,y:64,r:110,c:'255,190,120'},{x:700,y:64,r:110,c:'255,190,120',flick:true},
    {x:1000,y:30,r:150,c:'220,230,255'},{x:1320,y:30,r:150,c:'220,230,255'},{x:1620,y:30,r:150,c:'220,230,255'},
    {x:1900,y:50,r:140,c:'255,70,60'},{x:2150,y:50,r:140,c:'90,120,255'},{x:2400,y:50,r:140,c:'200,80,255'}],
  signs:[{x:2260,y:44,t:'BA ROCK 82',c:'#ff5ac8',off:'#4a1a3a',size:10}],
  far(g){sky(g,['#0b0d2a','#1e1840','#3a2050'],80);skyline(g,'#18162e',60,150,'#7d8bd0');},
  bg(K){const {R,T,brick,poster,houses,lamp,sidewalk,planks,tree,crowd,g}=K;
    R(0,96,900,80,'#3a3446');brick(0,96,900,80,'#4a3e48');
    for(let x=60;x<900;x+=170)tree(x,176,64,'#24402a',26);
    R(160,110,180,40,'#e8e2d0');R(160,110,180,6,'#6aa0d8');R(160,144,180,6,'#6aa0d8');T('LAS MALVINAS',250,120,'#1a3a6a',7,'center');T('SON ARGENTINAS',250,131,'#1a3a6a',7,'center');
    poster(380,140,30,26,'#1a1418',[['BA ROCK','#f2b632'],['82','#f2b632',6],['OBRAS','#e8e2d0']]);poster(420,138,30,28,'#e8e2d0',[['V8','#b8262a',8],['METAL','#1a1a1a'],['PESADO','#1a1a1a']]);
    poster(700,140,30,26,'#c8322a',[['HEAVY','#fff'],['METAL','#fff'],['ARGENTO','#1a1a1a']]);
    // puesto de choripán
    R(520,128,110,48,'#6a4a2e');R(516,122,118,8,'#c8322a');T('CHORIPÁN',575,113,'#f2b632',6,'center');R(530,144,90,6,'#1a1a1e');for(let k=0;k<7;k++)R(534+k*12,141,9,3,'#8c2a1a');
    crowd(30,500,176,['#151418','#1c1a22','#2a2230']);crowd(640,900,176,['#151418','#1c1a22']);
    // Estadio Obras
    R(900,34,800,142,'#6a6a74');for(let x=900;x<1700;x+=40)R(x,34,2,142,'#5a5a64');R(900,34,800,6,'#7a7a84');
    T('OBRAS',1300,52,'#e8e2d0',26,'center');T('ESTADIO OBRAS SANITARIAS',1300,84,'#c8c2b8',6,'center');
    for(const gx of [1000,1240,1480]){R(gx,112,80,64,'#1a1a22');g.fillStyle='#3a3a44';for(let i=gx;i<gx+80;i+=5)g.fillRect(i,112,1,64);}
    poster(1120,120,44,40,'#1a1418',[['BA ROCK','#f2b632',6],['FESTIVAL','#e8e2d0'],['NOVIEMBRE','#e8e2d0'],['1982','#f2b632',6]]);poster(1380,120,44,40,'#e8e2d0',[['V8','#b8262a',10],['EN VIVO','#1a1a1a'],['¡ENTRADAS!','#1a1a1a']]);
    // escenario y backstage
    R(1700,0,900,176,'#141218');for(let x=1700;x<2600;x+=4)R(x,0,1,176,'#18161c');
    for(let x=1720;x<2600;x+=24){R(x,24,2,10,'#5a5a64');}R(1700,22,900,3,'#6a6a74');R(1700,34,900,3,'#6a6a74');g.strokeStyle='#5a5a64';g.lineWidth=1;g.beginPath();for(let x=1700;x<2600;x+=12){g.moveTo(x,25);g.lineTo(x+12,34);}g.stroke();
    for(const ax of [1760,1840,2460,2540]){for(let k=0;k<3;k++){R(ax,116+k*20,60,19,'#0c0b0e');R(ax+3,119+k*20,54,13,'#2a2830');g.fillStyle='#1a181e';for(let i=0;i<54;i+=3)g.fillRect(ax+3+i,119+k*20,1,13);}}
    R(2200,140,140,14,'#2a2228');{const dx=2270;g.fillStyle='#c8c2b8';g.beginPath();g.arc(dx,132,10,0,Math.PI*2);g.fill();g.fillStyle='#8c1a14';g.fillRect(dx-10,132,20,8);R(dx-28,124,12,2,'#d8a22a');R(dx+18,120,12,2,'#d8a22a');R(dx-18,128,8,8,'#3a3440');R(dx+12,128,8,8,'#3a3440');}
    R(2160,56,220,26,'#1a1418');
    sidewalk(0,1700,'#5e5a66');planks(1700,2600,'#3a2a1e');
    for(const l of [120,380,700])lamp(l,64);}
 },
 { // 2 · El Oeste, 1991
  weather:'rain',light:'#7e789e',track:{x0:900,x1:1500,col:'#8f97a6',stripe:'#c8322a'},
  lamps:[{x:150,y:64,r:120,c:'255,214,150'},{x:430,y:64,r:120,c:'255,214,150'},{x:660,y:96,r:100,c:'255,90,60'},{x:840,y:64,r:110,c:'255,214,150',flick:true},
    {x:1060,y:70,r:110,c:'255,226,170'},{x:1300,y:70,r:110,c:'255,226,170'},{x:1600,y:64,r:120,c:'255,214,150'},{x:1820,y:64,r:110,c:'255,214,150',flick:true},
    {x:2060,y:58,r:120,c:'255,200,130'},{x:2300,y:58,r:120,c:'255,200,130'},{x:2560,y:58,r:120,c:'255,200,130'}],
  signs:[{x:660,y:85,t:'PIZZERÍA',c:'#ff5a3a',off:'#5a2018'}],
  far(g){sky(g,['#151a3a','#2c2552','#5a3460'],60);skyline(g,'#1b1a34',50,130,'#7d8bd0');
    for(const cx of [300,640,1100]){g.fillStyle='#120f22';g.fillRect(cx,40,14,150);g.fillRect(cx-4,36,22,6);g.fillStyle='rgba(120,110,140,.35)';for(let k=0;k<4;k++){g.beginPath();g.arc(cx+7+k*10,28-k*8,8+k*3,0,Math.PI*2);g.fill();}}},
  bg(K){const {R,T,brick,poster,houses,lamp,sidewalk,floor,g}=K;
    const hs=houses(0,560,0,['#8a6f5a','#6f7d86','#8c7c63','#7a5f6e']);
    if(hs[1]){T('HERMÉTICA',hs[1].x+8,hs[1].top+14,'#d8d2c6',7);}
    if(hs[3]){T('EL OESTE',hs[3].x+6,hs[3].top+12,'#c8322a',7);T('NO SE RINDE',hs[3].x+6,hs[3].top+22,'#c8322a',7);}
    poster(hs[0].x+50,146,30,24,'#e9e4d6',[['HERMÉTICA','#1a1a1a'],['ÁCIDO','#b8262a'],['ARGENTINO','#b8262a']]);
    // cartel de la convertibilidad
    R(250,26,150,58,'#e8e2d0');R(254,30,142,50,'#2a5a8a');T('1 PESO =',325,38,'#fff',9,'center');T('1 DÓLAR',325,56,'#f2b632',9,'center');R(280,84,4,40,'#3a3a42');R(366,84,4,40,'#3a3a42');
    // pizzería
    R(560,70,240,106,'#4a3a2e');brick(560,70,240,30,'#6a4a36');R(600,80,120,18,'#1a1418');R(580,110,180,66,'#2a2422');R(586,114,168,40,'#d8c08a');T('PIZZA Y FAINÁ',670,120,'#7a2a1a',6,'center');T('MOZZARELLA · NAPOLITANA',670,132,'#3a2a1a',4,'center');
    for(let k=0;k<3;k++){g.fillStyle='#e0a040';g.beginPath();g.arc(616+k*54,146,9,0,Math.PI*2);g.fill();g.fillStyle='#c8322a';for(let d=0;d<4;d++)g.fillRect(612+k*54+(d%2)*5,141+(d>1?5:0),3,3);}
    houses(800,900,7,['#6d6a52']);
    // estación del Sarmiento
    R(900,140,600,36,'#55555e');R(900,140,600,4,'#6b6b76');R(900,170,600,3,'#c8b23a');
    R(1120,70,190,70,'#8a6a52');brick(1120,70,190,70,'#9a6a4a');g.fillStyle='#5a2a20';g.beginPath();g.moveTo(1110,72);g.lineTo(1215,46);g.lineTo(1320,72);g.closePath();g.fill();
    R(1150,82,130,16,'#1e3a6a');T('LÍNEA SARMIENTO',1215,87,'#f0f0f0',5,'center');R(1138,104,26,36,'#2a2422');R(1266,104,26,36,'#2a2422');
    T('RAMAL QUE PARA,',920,146,'#e8e2d0',5);T('RAMAL QUE CIERRA',920,156,'#e8e2d0',5);
    for(const lx of [1060,1300]){R(lx-1,70,3,70,'#2e2c34');R(lx-6,66,13,5,'#4a4852');}
    // metalúrgica cerrada
    R(1500,60,420,116,'#5a4a42');brick(1500,60,420,116,'#6a4a3a');R(1500,56,420,6,'#3a2a24');T('METALÚRGICA DEL OESTE',1710,70,'#e8e2d0',7,'center');
    R(1580,98,260,78,'#1c1e24');g.fillStyle='#3a3e48';for(let i=1580;i<1840;i+=6)g.fillRect(i,98,2,78);
    R(1620,110,180,20,'#e9e4d6');R(1620,110,180,4,'#b8262a');R(1620,126,180,4,'#b8262a');T('CERRADA POR QUIEBRA',1710,116,'#1a1a1a',5,'center');
    poster(1520,120,44,34,'#f2b632',[['SE','#1a1a1a',6],['REMATA','#1a1a1a',6],['TODO','#b8262a',6]]);poster(1860,120,44,34,'#e9e4d6',[['ÁCIDO','#1a1a1a'],['ARGEN-','#1a1a1a'],['TINO','#b8262a']]);
    // galpón del remate
    R(1920,24,780,152,'#3b4550');for(let xx=1920;xx<2700;xx+=6)R(xx,24,3,152,xx%12?'#46525e':'#36404a');R(1920,24,780,10,'#1c2228');
    for(let k=0;k<5;k++){const mx=2000+k*140;R(mx,128,56,48,'#5a6a5a');R(mx+4,120,30,10,'#4a5a4a');R(mx+40,134,14,4,'#9aa0a8');g.fillStyle='#2a3a2a';g.beginPath();g.arc(mx+18,148,8,0,Math.PI*2);g.fill();R(mx+6,160,44,2,'#e9e4d6');T('LOTE '+(10+k),mx+28,165,'#e9e4d6',4,'center');}
    R(2440,120,70,56,'#4a3020');R(2436,116,78,6,'#5a3a26');R(2420,70,110,30,'#e9e4d6');R(2420,70,110,6,'#b8262a');R(2420,94,110,6,'#b8262a');T('GRAN REMATE',2475,80,'#1a1a1a',6,'center');
    for(const lx of [2060,2300,2560]){R(lx,24,1,32,'#1c2228');g.fillStyle='#2a3038';g.beginPath();g.moveTo(lx-10,62);g.lineTo(lx,54);g.lineTo(lx+10,62);g.fill();}
    sidewalk(0,1920);floor(1920,2700,'#4f4c55');
    for(const l of [150,430,840,1600,1820])lamp(l,64);}
 },
 { // 3 · El pueblo y la ruta, 2001
  weather:'dust',light:'#c8a494',
  lamps:[{x:150,y:70,r:110,c:'255,200,140'},{x:420,y:70,r:110,c:'255,200,140'},{x:700,y:70,r:110,c:'255,200,140'},{x:1600,y:80,r:120,c:'255,180,90'},
    {x:2050,y:50,r:140,c:'255,80,60'},{x:2330,y:50,r:140,c:'255,170,60'},{x:2600,y:50,r:140,c:'200,90,255'}],
  signs:[{x:1650,y:98,t:'PARRILLA',c:'#ffb340',off:'#5a3a18'}],
  far(g){sky(g,['#2e2450','#8a4a6a','#e07a4a','#f6c06a'],20);
    g.fillStyle='rgba(255,226,150,.95)';g.beginPath();g.arc(900,150,34,0,Math.PI*2);g.fill();
    g.fillStyle='#5a3a48';g.fillRect(0,166,1400,24);for(let x=0;x<1400;x+=2){g.fillStyle=hsh(x,3)>.5?'#6a4450':'#5e3c48';g.fillRect(x,164+hsh(x,1)*3,2,4);}
    for(const sx of [200,240,980,1020,1060]){g.fillStyle='#3a2836';g.fillRect(sx,116,30,52);g.beginPath();g.arc(sx+15,116,15,Math.PI,Math.PI*2);g.fill();}
    for(const mx of [520,1250]){g.fillStyle='#3a2836';g.fillRect(mx,120,3,48);for(let k=0;k<8;k++){const a=k/8*Math.PI*2;g.fillRect(mx+1+Math.cos(a)*8,118+Math.sin(a)*8,2,2);}}
    g.strokeStyle='#3a2836';g.lineWidth=1;g.beginPath();for(let x=0;x<1400;x+=140){g.moveTo(x,150);g.quadraticCurveTo(x+70,160,x+140,150);}g.stroke();},
  bg(K){const {R,T,poster,houses,lamp,dirt,ruta,crowd,tree,g}=K;
    const hs=houses(0,300,0,['#e8e0d0','#d8d0b8','#e0d4c0'],{white:1,low:1,notank:1,shutters:'#3a6a4a'});
    // banco cerrado
    R(300,70,190,106,'#d8d0c0');for(const cx of [316,356,396,436,466])R(cx,92,10,84,'#c8c0b0');R(296,64,198,10,'#b8b0a0');g.fillStyle='#c8c0b0';g.beginPath();g.moveTo(296,64);g.lineTo(395,40);g.lineTo(494,64);g.fill();
    T('BANCO',395,52,'#5a5048',7,'center');R(370,120,50,56,'#2a2a30');g.fillStyle='#6a6a72';for(let i=370;i<420;i+=4)g.fillRect(i,120,1,56);
    T('CORRALITO',326,102,'#c8322a',6);T('= CHORROS',332,112,'#c8322a',5);T('QUE SE VAYAN',306,150,'#1a1a1a',5);T('TODOS',330,160,'#1a1a1a',5);
    houses(490,620,3,['#e0d4c0','#d8d0b8'],{white:1,low:1,notank:1,shutters:'#6a3a2a'});
    // almacén de ramos generales
    R(620,84,280,92,'#c8b08a');R(620,80,280,8,'#6a4a2e');R(640,92,240,16,'#2a3a2a');T('ALMACÉN DE RAMOS GENERALES',760,97,'#e8e2d0',5,'center');R(650,116,60,60,'#3a2a1e');R(730,116,60,60,'#3a2a1e');R(810,116,60,60,'#3a2a1e');
    poster(812,122,40,36,'#1a1418',[['ALMAFUERTE','#f2b632'],['ESTA NOCHE','#e8e2d0'],['EN LA','#e8e2d0'],['RUTA','#f2b632',6]]);
    // la ruta: el Gauchito, la Difunta, el parador
    R(1000,176-12,40,12,'#8a7a5a');R(1050,120,44,56,'#c8322a');g.fillStyle='#a8241e';g.beginPath();g.moveTo(1046,122);g.lineTo(1072,100);g.lineTo(1098,122);g.fill();R(1062,136,20,24,'#3a1a14');R(1068,140,8,12,'#f2b632');
    T('GAUCHITO GIL',1072,164,'#fff',4,'center');for(const fx of [1036,1106,1124])R(fx,90,2,86,'#5a4a3a');
    for(let k=0;k<26;k++){const bx=1180+(k%13)*5,by=172-(k/13|0)*8;R(bx,by-8,3,8,'rgba(200,220,240,.8)');R(bx,by-9,3,2,'#c8322a');}T('DIFUNTA CORREA',1212,150,'#e8e2d0',4,'center');
    R(1320,96,74,40,'#2a6a3a');R(1322,98,70,36,'#3a8a4a');T('RUTA 3',1357,104,'#fff',6,'center');T('KM 512',1357,118,'#fff',6,'center');R(1340,136,3,40,'#9aa0a8');R(1372,136,3,40,'#9aa0a8');
    R(1500,96,340,80,'#d8c8a8');R(1496,90,348,8,'#8a2a1a');R(1580,106,140,18,'#1a1418');R(1520,128,60,48,'#3a2a1e');R(1740,128,80,48,'#2a2a30');T('GOMERÍA',1780,132,'#f2b632',5,'center');
    for(let k=0;k<4;k++){g.fillStyle='#141216';g.beginPath();g.arc(1760+k*16,170,7,0,Math.PI*2);g.fill();g.fillStyle='#3a3840';g.beginPath();g.arc(1760+k*16,170,3,0,Math.PI*2);g.fill();}
    for(const tx of [1440,1880])tree(tx,176,50,'#4a5a2a',20);
    // el festival
    R(2150,20,520,8,'#5a5a64');for(const px of [2150,2400,2660])R(px,20,8,156,'#5a5a64');R(2160,28,500,148,'#1a1418');
    R(2250,36,320,26,'#e8e2d0');R(2250,36,320,4,'#c8322a');R(2250,58,320,4,'#c8322a');T('FESTIVAL DE LA RUTA',2410,44,'#1a1a1a',8,'center');
    for(const ax of [2190,2600]){for(let k=0;k<3;k++){R(ax,110+k*22,50,21,'#0c0b0e');R(ax+3,113+k*22,44,15,'#2a2830');}}
    R(1960,120,120,56,'#8a5a2e');R(1956,112,128,10,'#f2b632');T('EMPANADAS',2020,114,'#6a2a1a',6,'center');R(1970,140,100,6,'#3a2a1e');for(let k=0;k<6;k++){g.fillStyle='#d8a050';g.beginPath();g.arc(1980+k*16,138,5,Math.PI,Math.PI*2);g.fill();}
    crowd(2200,2640,176,['#2a1e28','#3a2a30','#1e1a22']);
    dirt(0,960,'#8a7a62');ruta(960,1900);dirt(1900,2800,'#7a6a4a');
    for(const l of [150,420,700])lamp(l,70);lamp(1600,80);}
 },
 { // 4 · El campo, Coronel Suárez
  weather:'leaves',light:'#efe6da',
  lamps:[],signs:[],
  far(g){sky(g,['#5a90d0','#9ac4ec','#e2ecf0'],0);
    for(let k=0;k<9;k++){g.fillStyle='rgba(255,255,255,.75)';const cx=hsh(k,1)*1400,cy=24+hsh(k,2)*50;for(let j=0;j<4;j++){g.beginPath();g.ellipse(cx+j*16,cy+(j%2)*4,22,8,0,0,Math.PI*2);g.fill();}}
    g.fillStyle='#8a96b4';g.beginPath();g.moveTo(0,170);for(let x=0;x<=1400;x+=20){g.lineTo(x,150-Math.abs(Math.sin(x*.006))*50-hsh(x,3)*10);}g.lineTo(1400,190);g.lineTo(0,190);g.fill();
    g.fillStyle='#a2aec8';g.beginPath();g.moveTo(0,176);for(let x=0;x<=1400;x+=20){g.lineTo(x,164-Math.abs(Math.sin(x*.009+1))*24);}g.lineTo(1400,190);g.lineTo(0,190);g.fill();
    for(let y=172;y<190;y+=3){g.fillStyle=(y/3)%2?'#8aa84a':'#b8b45a';g.fillRect(0,y,1400,3);}},
  bg(K){const {R,T,poster,campo,tree,alambre,dirt,g}=K;
    // casa de campo y galpón
    R(120,100,260,76,'#ece6d8');R(110,92,280,10,'#8a9098');g.fillStyle='#9aa0a8';g.beginPath();g.moveTo(110,94);g.lineTo(250,66);g.lineTo(390,94);g.fill();
    R(150,120,30,56,'#5a3a24');R(220,118,40,30,'#3a6a8a');R(300,118,40,30,'#3a6a8a');R(218,116,44,2,'#5a3a24');R(298,116,44,2,'#5a3a24');R(330,74,10,22,'#8a6a5a');
    R(420,90,150,86,'#8a9098');for(let x=420;x<570;x+=5)R(x,90,2,86,'#7a8088');R(460,120,70,56,'#3a3a40');
    {const x=640;R(x,128,74,48,'#a8a4a0');R(x,128,74,4,'#c8c4c0');for(let k=0;k<6;k++)R(x+k*13,132,1,44,'#8a8680');}
    R(770,60,3,116,'#6a6a72');R(762,176-60,4,60,'#6a6a72');R(778,176-60,4,60,'#6a6a72');g.strokeStyle='#6a6a72';g.lineWidth=1;g.beginPath();g.moveTo(764,116);g.lineTo(780,176);g.moveTo(780,116);g.lineTo(764,176);g.stroke();
    for(const tx of [40,600,860])tree(tx,176,80,'#3e5a2e',24);
    // potrero
    alambre(900,1700,176);
    for(let k=0;k<9;k++){const cx=950+k*85+hsh(k,4)*30,cy=168-hsh(k,5)*6;R(cx,cy-12,26,12,'#1e1a1a');R(cx+4,cy-11,8,6,'#e8e2d8');R(cx+22,cy-16,8,8,'#1e1a1a');R(cx+2,cy,3,8,'#1e1a1a');R(cx+20,cy,3,8,'#1e1a1a');}
    for(let x=930;x<1700;x+=110)tree(x,150,70,'#4a6a3a',16);
    // tranquera
    R(1700,96,6,80,'#6a4a2e');R(1820,96,6,80,'#6a4a2e');R(1700,92,126,8,'#6a4a2e');T('LA ESPERANZA',1763,82,'#4a3424',6,'center');for(let k=0;k<5;k++)R(1706,120+k*10,114,3,'#8a6a42');
    // el loteo
    R(1980,70,200,60,'#e8e2d0');R(1984,74,192,52,'#2a6a5a');T('PRÓXIMAMENTE',2080,80,'#f2b632',6,'center');T('BARRIO CERRADO',2080,94,'#fff',7,'center');T('"LOS ALAMBRES"',2080,108,'#fff',6,'center');R(2010,130,4,46,'#5a5a64');R(2146,130,4,46,'#5a5a64');
    for(let k=0;k<12;k++){const sx=1900+k*72;R(sx,150,2,26,'#c8a26a');R(sx+2,150,8,5,'#ff6a1a');}
    for(let k=0;k<6;k++){const tx=2240+k*80;R(tx-6,168,12,8,'#8a6a42');g.fillStyle='#c8a26a';g.beginPath();g.ellipse(tx,168,6,2,0,0,Math.PI*2);g.fill();}
    for(let k=0;k<3;k++){g.fillStyle='#8a6e4a';g.beginPath();g.ellipse(2380+k*130,176,40,16,0,Math.PI,Math.PI*2);g.fill();}
    campo(0,1900);dirt(1900,2800,'#9a7e56');}
 }
];
function buildLevel(i){const S=SCENES[i];LW=LEVELS[i].LW;BG=mkc(LW*RS,H*RS);LIGHT=mkc(LW,H);FAR=mkc(1400*RS,190*RS);LAMPS=S.lamps;SIGNS=S.signs||[];
  {const fg=FAR.getContext('2d');fg.scale(RS,RS);S.far(fg);const bg2=BG.getContext('2d');bg2.scale(RS,RS);S.bg(sceneKit(bg2));realFAR(FAR);landmarkBG(BG,i);realBG(BG,LAMPS,S);extraBG(BG,i===9&&monstruoInsert.done?-1:i>9?i-1:i);}
  const g=LIGHT.getContext('2d');g.fillStyle=S.light;g.fillRect(0,0,LW,H);g.globalCompositeOperation='lighter';
  for(const l of LAMPS){const cy=l.y>40?190:150;const gr=g.createRadialGradient(l.x+8,cy,4,l.x+8,cy,l.r);gr.addColorStop(0,'rgba('+l.c+',.85)');gr.addColorStop(.5,'rgba('+l.c+',.35)');gr.addColorStop(1,'rgba('+l.c+',0)');
    g.fillStyle=gr;g.beginPath();g.ellipse(l.x+8,cy,l.r,l.r*.75,0,0,Math.PI*2);g.fill();
    const g2=g.createRadialGradient(l.x+10,l.y+6,0,l.x+10,l.y+6,40);g2.addColorStop(0,'rgba('+l.c+',.9)');g2.addColorStop(1,'rgba('+l.c+',0)');g.fillStyle=g2;g.fillRect(l.x-30,l.y-34,80,80);}
  const gw=g.createLinearGradient(0,0,0,190);gw.addColorStop(0,'rgba(0,0,0,0)');gw.addColorStop(1,'rgba(90,40,70,.25)');g.fillStyle=gw;g.fillRect(0,0,LW,190);}

// v9: escenarios de los capítulos nuevos (lugares que nombraba en entrevistas y donde tocó)
const SCENES2={
 caseros79:{ // Caseros y Ciudadela, 1979: garajes de ensayo y la razzia
  weather:'leaves',light:'#7a7092',
  lamps:[{x:140,y:64,r:110,c:'255,214,150'},{x:420,y:64,r:110,c:'255,214,150',flick:true},{x:760,y:64,r:110,c:'255,214,150'},{x:1060,y:64,r:110,c:'255,214,150'},
    {x:1380,y:64,r:110,c:'255,214,150'},{x:1700,y:64,r:110,c:'255,214,150',flick:true},{x:2000,y:64,r:110,c:'255,214,150'},{x:2300,y:60,r:120,c:'120,160,255'},{x:2520,y:60,r:120,c:'255,60,50'}],
  signs:[{x:600,y:88,t:'KIOSCO',c:'#ffd27a',off:'#4a3a1a'},{x:2380,y:40,t:'COMISARÍA',c:'#9fc4ff',off:'#1a2a4a',size:8}],
  far(g){sky(g,['#0e1230','#252450','#4a3060'],90);skyline(g,'#1a1834',20,56,'#d8b070');
    g.fillStyle='#14122a';g.fillRect(1000,120,8,70);g.fillRect(990,118,28,4);for(let k=0;k<5;k++)g.fillRect(1004-k*2,60+k*12,k*4+2,2);},
  bg(K){const {R,T,brick,poster,houses,lamp,sidewalk,reja,g}=K;
    const hs=houses(0,520,11,['#7a6f5a','#6f6d86','#8c6c53','#6a5f6e']);
    if(hs[0])poster(hs[0].x+50,146,30,22,'#e9e4d6',[['BAILE','#1a1a1a'],['SÁBADO','#1a1a1a'],['CIUDADELA','#b8262a']]);
    // el garaje de ensayo
    R(520,90,260,86,'#5a5a62');brick(520,90,260,20,'#6a5048');R(540,112,220,64,'#141218');
    for(const ax of [556,712]){for(let k=0;k<2;k++){R(ax,140+k*18,36,17,'#0c0b0e');R(ax+2,142+k*18,32,11,'#2a2830');}}
    {const dx=650;g.fillStyle='#c8c2b8';g.beginPath();g.arc(dx,156,9,0,Math.PI*2);g.fill();g.fillStyle='#8c1a14';g.fillRect(dx-9,156,18,6);R(dx-24,150,10,2,'#d8a22a');R(dx+16,146,10,2,'#d8a22a');}
    T('SALA DE ENSAYO',650,96,'#e8e2d0',6,'center');poster(600,116,26,20,'#1a1418',[['V8','#c8322a',8],['ENSAYO','#e8e2d0']]);
    // kiosco y pared pintada
    R(780,120,70,56,'#3a5a6a');R(776,114,78,8,'#c8322a');R(788,128,54,26,'#e8dcc0');for(let k=0;k<6;k++)R(790+k*9,132,7,10,['#c8322a','#e8c83a','#4f8a3a','#6aa0d8','#e07a1a','#a83aa8'][k]);
    R(850,104,300,72,'#8a8070');for(let k=0;k<30;k++){g.fillStyle='rgba(0,0,0,.08)';g.fillRect(850+hsh(k,4)*300,104+hsh(k,5)*72,8,2);}
    T('HEAVY METAL',1000,118,'#1a1a1a',10,'center');T('ROCK PESADO',1000,138,'#b8262a',8,'center');T('NO A LA RAZZIA',1000,156,'#1a3a6a',6,'center');
    const h2=houses(1150,1900,17,['#7a5f6e','#6d6a52','#83614a','#8a6f5a'],{shutters:'#4a6a5a'});
    if(h2[0])T('ALMACÉN',h2[0].x+8,h2[0].top+12,'#e8e2d0',6);if(h2[2])poster(h2[2].x+50,146,30,22,'#c8322a',[['RECITAL','#fff'],['CLUB','#fff'],['CASEROS','#1a1a1a']]);
    // plaza con árboles
    for(let x=1920;x<2240;x+=80){K.tree(x,176,58,'#2a4a2e',24);}R(1900,170,340,6,'#4a6a3a');R(2040,140,6,30,'#3a3440');R(2030,134,26,8,'#3a3440');
    // la comisaría
    R(2250,40,350,136,'#c8c2b0');R(2250,40,350,6,'#a8a290');R(2250,70,350,3,'#a8a290');T('COMISARÍA',2425,52,'#2a3a5a',8,'center');
    for(let k=0;k<4;k++)reja(2270+k*80,92,40,40);R(2405,120,40,56,'#2a2220');R(2410,124,30,52,'#3a3028');R(2422,30,4,14,'#3a3440');R(2414,30,20,10,'#6aa0d8');
    {const x=2300;R(x,138,100,30,'#e8e8ea');R(x+18,126,60,14,'#e8e8ea');R(x+24,129,22,9,'#24323e');R(x+52,129,22,9,'#24323e');R(x,150,100,4,'#2a3a6a');T('POLICÍA',x+50,155,'#2a3a6a',4,'center');R(x+40,122,8,4,'#2a6ab8');R(x+50,122,8,4,'#c8322a');
      for(const wx of [x+20,x+80]){g.fillStyle='#111';g.beginPath();g.arc(wx,168,8,0,Math.PI*2);g.fill();}}
    sidewalk(0,2600,'#5c5966');for(const l of [140,420,760,1060,1380,1700,2000])lamp(l,64);}
 },
 recoleta88:{ // Recoleta, 1988: debut de Hermética en el Centro Cultural
  weather:'leaves',light:'#c4a8a0',
  lamps:[{x:200,y:70,r:110,c:'255,226,170'},{x:520,y:70,r:110,c:'255,226,170'},{x:860,y:70,r:110,c:'255,226,170'},{x:1200,y:70,r:110,c:'255,226,170'},
    {x:1540,y:70,r:110,c:'255,226,170'},{x:1880,y:70,r:110,c:'255,226,170'},{x:2220,y:70,r:110,c:'255,226,170'},{x:2500,y:70,r:110,c:'255,226,170'}],
  signs:[{x:640,y:90,t:'CAFÉ',c:'#ffd27a',off:'#4a3a1a'}],
  far(g){sky(g,['#3a4a7a','#c88a7a','#f4c89a'],0);skyline(g,'#6a5a6a',50,120,null);
    // la basílica del Pilar: blanca, con campanario
    const x=1080;g.fillStyle='#e8e2d6';g.fillRect(x,100,120,90);g.fillRect(x+90,52,30,138);g.beginPath();g.moveTo(x+86,54);g.lineTo(x+105,30);g.lineTo(x+124,54);g.fill();
    g.fillStyle='#c8b8a0';g.fillRect(x+98,64,14,16);g.fillStyle='#e8e2d6';g.beginPath();g.moveTo(x-4,102);g.lineTo(x+46,76);g.lineTo(x+96,102);g.fill();g.fillStyle='#b8a890';g.fillRect(x+30,130,26,60);},
  bg(K){const {R,T,brick,poster,lamp,tree,g}=K;
    // edificios señoriales
    for(let x=0;x<600;x+=150){R(x,40,146,136,'#d8ccb4');R(x,40,146,6,'#b8ac94');for(let r=0;r<3;r++)for(let c=0;c<4;c++){R(x+10+c*34,58+r*34,20,24,'#3a3a4a');R(x+8+c*34,82+r*34,24,3,'#b8ac94');}}
    // café con mesitas
    R(600,110,180,66,'#6a2a20');R(596,104,188,8,'#2a4a3a');R(610,120,160,40,'#2a2422');T('CONFITERÍA',690,112,'#e8e2d0',5,'center');
    for(let k=0;k<4;k++){const tx=620+k*42;R(tx,160,18,2,'#e8e2d0');R(tx+8,162,2,14,'#3a3440');R(tx-4,164,4,12,'#6a4426');R(tx+18,164,4,12,'#6a4426');}
    // el gomero gigante
    {const x=930;R(x-14,90,28,86,'#5a4a3a');R(x-30,150,60,26,'#4a3a2e');for(let k=0;k<14;k++){g.fillStyle=shade('#2e4a2a',.7+hsh(k,3)*.5);g.beginPath();g.arc(x+(hsh(k,1)-.5)*240,70+hsh(k,2)*60,30+hsh(k,4)*24,0,Math.PI*2);g.fill();}}
    // Centro Cultural Recoleta: arcos blancos
    R(1100,50,800,126,'#ece6d8');R(1100,50,800,8,'#c8bca4');for(let k=0;k<10;k++){const ax=1120+k*78;R(ax,96,58,80,'#3a3430');g.fillStyle='#3a3430';g.beginPath();g.arc(ax+29,96,29,Math.PI,Math.PI*2);g.fill();R(ax+60,70,10,106,'#d8d0c0');}
    T('CENTRO CULTURAL',1500,58,'#5a4a3a',8,'center');poster(1290,120,40,40,'#141218',[['HERMÉTICA','#e8e2d0',5],['DEBUT','#c8322a',6],['1988','#f2b632',6]]);poster(1680,120,40,40,'#e8e2d0',[['MUESTRA','#1a1a1a'],['DE ARTE','#1a1a1a'],['MODERNO','#c8322a']]);
    // feria de artesanos
    for(let k=0;k<6;k++){const x=1920+k*110;R(x,130,90,46,'#6a4426');R(x-4,124,98,8,k%2?'#e8e2d0':'#3a6ab8');for(let d=0;d<6;d++)R(x+6+d*14,146,10,8,['#c8322a','#e8c83a','#4f8a3a','#a83aa8','#e07a1a','#6aa0d8'][d]);}
    for(let x=0;x<2600;x+=2){K.R(x,176,2,94,hsh(x,1)>.5?'#a89a84':'#9a8c76');}for(let y=180;y<270;y+=8)for(let x=(y/8%2)*8;x<2600;x+=16)R(x,y,15,7,shade('#a89a84',.9+hsh(x,y)*.2));
    for(const l of [200,520,860,1200,1540,1880,2220,2500])lamp(l,70);}
 },
 monumental94:{ // Estadio Monumental, 1994: el festival grande
  weather:'spots',light:'#605a88',
  lamps:[{x:200,y:30,r:150,c:'220,230,255'},{x:600,y:30,r:150,c:'220,230,255'},{x:1000,y:30,r:150,c:'220,230,255'},{x:1400,y:30,r:150,c:'220,230,255'},
    {x:1800,y:50,r:140,c:'255,70,60'},{x:2100,y:50,r:140,c:'90,120,255'},{x:2400,y:50,r:140,c:'200,80,255'}],
  signs:[{x:1240,y:40,t:'MONSTERS OF ROCK',c:'#ff5a3a',off:'#4a1a14',size:9}],
  far(g){sky(g,['#06081e','#141238','#2a1a40'],70);
    g.fillStyle='#1a1830';g.beginPath();g.moveTo(0,190);g.lineTo(0,90);g.quadraticCurveTo(700,40,1400,90);g.lineTo(1400,190);g.fill();
    for(let k=0;k<6;k++){const x=120+k*230;g.fillStyle='#2a2840';g.fillRect(x,20,6,90);g.fillStyle='#e8eaff';g.fillRect(x-10,14,26,10);}
    for(let i=0;i<500;i++){g.fillStyle=hsh(i,4)>.5?'#2e2a48':'#3a3456';g.fillRect(hsh(i,1)*1400|0,96+hsh(i,2)*90|0,2,2);}},
  bg(K){const {R,T,poster,crowd,floor,g}=K;
    // fila de afuera y puestos
    R(0,80,1100,96,'#5a5a64');for(let x=0;x<1100;x+=60)R(x,80,3,96,'#4a4a54');R(0,80,1100,6,'#7a7a84');
    for(const [gx,n] of [[80,1],[380,5],[700,9]]){R(gx,110,90,66,'#1a1a22');g.fillStyle='#3a3a44';for(let i=gx;i<gx+90;i+=5)g.fillRect(i,110,1,66);T('PUERTA '+n,gx+45,98,'#e8e2d0',6,'center');}
    poster(220,116,44,44,'#141218',[['MONSTERS','#f2b632',5],['OF ROCK','#f2b632',5],['1994','#e8e2d0',6],['RIVER','#c8322a']]);poster(540,116,44,44,'#e8e2d0',[['HERMÉTICA','#141218',5],['VÍCTIMAS','#c8322a',5],['DEL','#141218'],['VACIAMIENTO','#c8322a',4]]);
    R(860,128,110,48,'#2a2a30');R(856,122,118,8,'#c8322a');T('REMERAS',915,113,'#f2b632',6,'center');for(let k=0;k<5;k++)R(866+k*20,134,16,18,'#141218');
    crowd(0,1100,176,['#151418','#1c1a22','#2a2230']);
    // túnel y pasillos de cemento
    R(1100,0,600,176,'#3a3a44');for(let y=10;y<176;y+=24)R(1100,y,600,2,'#2e2e38');for(let x=1100;x<1700;x+=80)R(x,0,4,176,'#2e2e38');
    R(1300,70,200,106,'#0e0d12');g.fillStyle='#0e0d12';g.beginPath();g.arc(1400,70,100,Math.PI,Math.PI*2);g.fill();T('ACCESO CAMPO',1400,24,'#e8e2d0',7,'center');
    // el escenario grande
    R(1700,0,900,176,'#121016');for(let x=1720;x<2600;x+=30)R(x,20,3,156,'#2a2830');R(1700,18,900,4,'#5a5a64');
    for(const ax of [1740,1820,2480,2540]){for(let k=0;k<4;k++){R(ax,96+k*20,56,19,'#0c0b0e');R(ax+3,99+k*20,50,13,'#2a2830');}}
    R(1960,40,380,60,'#1a1418');T('HERMÉTICA',2150,56,'#e8e2d0',14,'center');
    floor(0,1700,'#4a4a52');floor(1700,2600,'#3a3440');}
 },
 cemento95:{ // Cemento, Constitución, 1995: nace Almafuerte
  weather:'rain',light:'#6e6a8e',
  lamps:[{x:150,y:64,r:110,c:'255,214,150'},{x:450,y:64,r:110,c:'255,214,150'},{x:760,y:64,r:110,c:'255,214,150',flick:true},{x:1060,y:64,r:110,c:'255,214,150'},
    {x:1400,y:50,r:130,c:'255,90,60'},{x:1700,y:64,r:110,c:'255,214,150'},{x:2000,y:64,r:110,c:'255,214,150'},{x:2300,y:64,r:110,c:'255,214,150',flick:true}],
  signs:[{x:1400,y:44,t:'CEMENTO',c:'#ff5a3a',off:'#4a1a14',size:12},{x:420,y:88,t:'PIZZA',c:'#ffd27a',off:'#4a3a1a'}],
  far(g){sky(g,['#10142e','#232048','#40285a'],50);skyline(g,'#191830',50,140,'#d8b070');
    // la torre del reloj de la estación Constitución
    g.fillStyle='#22203a';g.fillRect(560,30,60,160);g.fillRect(470,100,240,90);g.fillStyle='#e8e2c0';g.beginPath();g.arc(590,56,14,0,Math.PI*2);g.fill();g.fillStyle='#22203a';g.fillRect(589,46,2,10);g.fillRect(590,55,8,2);},
  bg(K){const {R,T,brick,poster,houses,lamp,sidewalk,g}=K;
    const hs=houses(0,700,23,['#6a5f5a','#5f6d76','#7c6c53','#6a4f5e']);
    if(hs[1]){T('PENSIÓN',hs[1].x+8,hs[1].top+12,'#e8e2d0',6);}
    // la estación Constitución
    R(700,50,520,126,'#b8a890');brick(700,50,520,30,'#a89070');for(let k=0;k<7;k++){const ax=716+k*72;R(ax,100,50,76,'#2a2422');g.fillStyle='#2a2422';g.beginPath();g.arc(ax+25,100,25,Math.PI,Math.PI*2);g.fill();}
    T('ESTACIÓN CONSTITUCIÓN',960,62,'#3a2a1a',7,'center');T('F.C. ROCA',960,74,'#5a3a1a',5,'center');
    // Cemento: el templo de hormigón
    R(1220,20,420,156,'#8a8a8e');for(let y=20;y<176;y+=26)R(1220,y,420,2,'#7a7a7e');for(let x=1220;x<1640;x+=60)R(x,20,2,156,'#7a7a7e');
    for(let k=0;k<40;k++){g.fillStyle='rgba(0,0,0,.12)';g.fillRect(1220+hsh(k,8)*420,20+hsh(k,9)*156,2+hsh(k,7)*10,2);}
    R(1380,110,80,66,'#141218');R(1384,114,72,62,'#24222a');poster(1260,110,40,40,'#141218',[['ALMAFUERTE','#e8e2d0',4],['MUNDO','#c8322a',5],['GUANACO','#c8322a',5],['HOY','#f2b632',6]]);
    poster(1540,110,40,40,'#e8e2d0',[['METAL','#141218',5],['UNDER','#141218',5],['TODOS','#c8322a'],['LOS FINDES','#c8322a']]);
    for(let k=0;k<7;k++){R(1240+k*56,166,2,10,'#3a3a40');}
    // parada de colectivos y kioscos
    const h2=houses(1640,2600,29,['#7a5f6e','#6d6a52','#83614a'],{shutters:'#5a4a3a'});
    if(h2[0])T('EMPANADAS',h2[0].x+6,h2[0].top+12,'#f2b632',6);
    R(1980,120,6,56,'#3a3440');R(1966,112,34,10,'#e8c83a');T('BONDI',1983,114,'#1a1a1a',4,'center');
    sidewalk(0,2600,'#57545e');for(const l of [150,450,760,1060,1700,2000,2300])lamp(l,64);}
 },
 sierras06:{ // Sierra de la Ventana, 2006: lejos de todo
  weather:'dust',light:'#e0cca8',
  lamps:[{x:900,y:110,r:110,c:'255,170,90'},{x:1500,y:110,r:110,c:'255,170,90'},{x:2300,y:110,r:110,c:'255,170,90'}],
  signs:[],
  far(g){sky(g,['#5a86c8','#9ac0e0','#f0dcb8'],0);
    // las sierras, con el cerro de la Ventana
    g.fillStyle='#6a6a8a';g.beginPath();g.moveTo(0,190);for(let x=0;x<=1400;x+=20)g.lineTo(x,110-Math.sin(x*.006)*30-Math.sin(x*.021)*12-hsh(x,3)*6);g.lineTo(1400,190);g.fill();
    g.fillStyle='#8a7a8a';g.beginPath();g.moveTo(560,190);g.lineTo(640,70);g.lineTo(700,58);g.lineTo(760,80);g.lineTo(860,190);g.fill();g.fillStyle='#9ac0e0';g.fillRect(684,76,14,10);
    g.fillStyle='#7a9a5a';g.beginPath();g.moveTo(0,190);for(let x=0;x<=1400;x+=20)g.lineTo(x,160-Math.sin(x*.01+1)*8);g.lineTo(1400,190);g.fill();},
  bg(K){const {R,T,tree,alambre,campo,poster,g}=K;
    // cartel de la ruta
    R(120,120,90,36,'#2a6a3a');R(122,122,86,32,'#e8e2d0');T('SIERRA DE',165,126,'#2a6a3a',5,'center');T('LA VENTANA',165,134,'#2a6a3a',5,'center');T('BIENVENIDOS',165,144,'#c8322a',4,'center');R(160,156,4,20,'#5a4a3a');
    for(let x=260;x<700;x+=110)tree(x,176,80,'#3e6a2e',30);
    // la casita en la loma
    R(760,104,220,72,'#e8dcc0');g.fillStyle='#8a3a2a';g.beginPath();g.moveTo(748,106);g.lineTo(870,70);g.lineTo(992,106);g.fill();R(790,128,30,48,'#5a3a1e');R(860,124,40,30,'#3a5a7a');R(930,124,30,30,'#3a5a7a');R(950,80,12,26,'#7a6a5a');
    // parrilla y mesa del asado
    R(1040,140,60,6,'#3a3440');R(1044,146,4,30,'#3a3440');R(1092,146,4,30,'#3a3440');for(let k=0;k<5;k++)R(1046+k*10,136,8,4,'#8c2a1a');
    R(1120,150,90,4,'#6a4426');R(1126,154,4,22,'#6a4426');R(1200,154,4,22,'#6a4426');R(1150,140,6,10,'#4a6a2a');R(1170,142,10,8,'#e8e2d0');
    // arroyo con puente
    R(1300,150,300,26,'#4a7aa8');for(let k=0;k<20;k++)R(1300+hsh(k,2)*300,152+hsh(k,3)*20,10,1,'#8ab0d8');R(1380,140,140,6,'#6a4426');for(let k=0;k<8;k++)R(1384+k*17,146,3,14,'#5a3a1e');
    alambre(1600,2600,176);for(let x=1660;x<2600;x+=180)tree(x,176,70,'#3e6a2e',26);
    poster(2000,130,40,30,'#e8e2d0',[['TORO','#141218',6],['Y PAMPA','#c8322a',6],['2006','#141218']]);
    R(2200,90,110,86,'#8a6a42');for(let k=0;k<6;k++)R(2200,96+k*14,110,2,'#6a4a2a');T('GALPÓN',2255,80,'#3a2a1a',6,'center');
    campo(0,2600);}
 }
};

const GLOW=(()=>{const c=mkc(64,64),g=c.getContext('2d');const gr=g.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.3,'rgba(255,255,255,.45)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,64,64);return c;})();
const tintGlow={};function glow(col){if(tintGlow[col])return tintGlow[col];const c=mkc(64,64),g=c.getContext('2d');g.drawImage(GLOW,0,0);g.globalCompositeOperation='source-in';g.fillStyle=col;g.fillRect(0,0,64,64);return tintGlow[col]=c;}

/* ================= audio ================= */
let AC=null,master,musicBus,calmG,fightG,gL,gR,bassIn,delayIn,noiseBuf,musicOn=true,nextT=0,step=0,song='c7',combatMix=0;
function audioInit(){if(AC){if(AC.state==='suspended')AC.resume();return;}try{AC=new(window.AudioContext||window.webkitAudioContext)();if(AC.state==='suspended')AC.resume();
  const comp=AC.createDynamicsCompressor();comp.threshold.value=-14;comp.ratio.value=4;comp.connect(AC.destination);
  master=AC.createGain();master.gain.value=.75;master.connect(comp);
  musicBus=AC.createGain();musicBus.gain.value=.7;musicBus.connect(master);
  calmG=AC.createGain();calmG.gain.value=.8;calmG.connect(musicBus);fightG=AC.createGain();fightG.gain.value=0;fightG.connect(musicBus);
  noiseBuf=AC.createBuffer(1,AC.sampleRate,AC.sampleRate);const d=noiseBuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
  const curve=k=>{const n=2048,c=new Float32Array(n);for(let i=0;i<n;i++){const v=i*2/n-1;c[i]=Math.tanh(v*k);}return c;};
  const side=pan=>{const inp=AC.createGain(),hp=AC.createBiquadFilter(),ws=AC.createWaveShaper(),pk=AC.createBiquadFilter(),lp=AC.createBiquadFilter(),pn=AC.createStereoPanner?AC.createStereoPanner():AC.createGain();
    hp.type='highpass';hp.frequency.value=110;ws.curve=curve(12);ws.oversample='4x';pk.type='peaking';pk.frequency.value=700;pk.gain.value=-6;pk.Q.value=1.2;lp.type='lowpass';lp.frequency.value=4200;
    if(pn.pan)pn.pan.value=pan;inp.connect(hp);hp.connect(ws);ws.connect(pk);pk.connect(lp);lp.connect(pn);pn.connect(fightG);return inp;};
  gL=side(-.65);gR=side(.65);
  bassIn=AC.createGain();const bws=AC.createWaveShaper();bws.curve=curve(2.2);const blp=AC.createBiquadFilter();blp.type='lowpass';blp.frequency.value=1500;const bg=AC.createGain();bg.gain.value=.9;
  bassIn.connect(bws);bws.connect(blp);blp.connect(bg);bg.connect(musicBus);
  delayIn=AC.createGain();const dl=AC.createDelay(1);dl.delayTime.value=.27;const fb=AC.createGain();fb.gain.value=.38;const dlp=AC.createBiquadFilter();dlp.type='lowpass';dlp.frequency.value=2200;
  delayIn.connect(calmG);delayIn.connect(dl);dl.connect(dlp);dlp.connect(fb);fb.connect(dl);dlp.connect(calmG);
  nextT=AC.currentTime+.06;revSetup();}catch(e){AC=null;}}
const mf=m=>440*Math.pow(2,(m-69)/12);
function env(g,t,a,v,d){g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(v,t+a);g.gain.exponentialRampToValueAtTime(.0008,t+d);}
function osc(type,f,t,d,v,dest,detune,a){const o=AC.createOscillator(),g=AC.createGain();o.type=type;o.frequency.value=f;if(detune)o.detune.value=detune;env(g,t,a||.004,v,d);o.connect(g);g.connect(dest);o.start(t);o.stop(t+d+.05);return o;}
function nz(t,d,v,type,freq,dest,q){const s=AC.createBufferSource();s.buffer=noiseBuf;const f=AC.createBiquadFilter();f.type=type;f.frequency.value=freq;if(q)f.Q.value=q;const g=AC.createGain();env(g,t,.002,v,d);s.connect(f);f.connect(g);g.connect(dest||master);s.start(t,Math.random()*.5);s.stop(t+d+.05);return f;}
// Bandas sonoras auténticas de Ricardo Iorio (V8, Hermética, Almafuerte) adaptadas a chiptune 16-bits (FM / SPC700)
const R16 = (s) => s.trim().split(/\s+/).map(x => x === "-" ? null : +x);
const R12 = (s) => s.trim().split(/\s+/).map(x => x === "-" ? null : +x);

const SONGS = {
  // Cap 1: Muy Cansado Estoy (V8)
  c0: {
    name: "MUY CANSADO ESTOY (V8)",
    bpm: 132, div: 12, order: ["A", "A", "B", "B", "C", "A"],
    sec: {
      A: { bars: 4, roots: [0, 0, 5, 0], riff: R12("0 - 0 3 - 5 6 - 5 3 - 0"), m: "o.po.poo.oo.", k: "x.....x..x..", s: "...x.....x..", h: "ride",
           lead: [[0, 12, 3], [3, 15, 3], [6, 17, 3], [9, 18, 1], [10, 17, 2], [12, 15, 6], [18, 12, 3], [21, 10, 3], [24, 12, 6], [36, 15, 6], [42, 12, 6]] },
      B: { bars: 4, roots: [5, 3, 0, -2], riff: R12("0 - - - - - 0 - - 0 - -"), m: "l.....l..l..", k: "x..x..x..x..", s: "...x.....x..", h: "8", fill: 1,
           lead: [[0, 17, 3], [3, 19, 3], [6, 20, 6], [12, 19, 3], [15, 17, 3], [18, 15, 6], [24, 17, 3], [27, 15, 3], [30, 14, 6], [36, 12, 12]] },
      C: { bars: 4, roots: [0, 3, 5, 7], riff: R12("0 - 0 0 - 0 0 - 0 0 - 0"), m: "p.pp.pp.pp.p", k: "x.xx.xx.xx.x", s: "...x.....x..", h: "16", fill: 1,
           lead: [[0, 24, 3], [3, 22, 3], [6, 20, 3], [9, 19, 3], [12, 17, 6], [18, 15, 6], [24, 14, 6], [30, 12, 12]] }
    }
  },
  // Cap 2: Brigadas Metálicas (V8)
  c1: {
    name: "BRIGADAS METÁLICAS (V8)",
    bpm: 196, div: 16, order: ["A", "A", "B", "A", "B", "C"],
    sec: {
      A: { bars: 4, roots: [0, 0, -4, -2], riff: R16("0 0 0 0 3 - 2 0 0 0 0 0 -2 - 0 0"), m: "ppppopopppppoopp", k: "x.x.x.x.x.x.x.x.", s: "....x.......x...", h: "8",
           lead: [[0, 12, 2], [2, 12, 2], [4, 15, 2], [6, 14, 2], [8, 12, 4], [16, 15, 2], [18, 17, 2], [20, 19, 4], [24, 17, 4], [28, 15, 4], [32, 12, 2], [34, 15, 2], [36, 14, 2], [38, 12, 2], [40, 10, 4], [48, 12, 8]] },
      B: { bars: 4, roots: [-4, -2, 0, 0], riff: R16("0 - - 0 - - 0 - 0 - 0 - 0 - 0 -"), m: "o..o..o.o.o.o.o.", k: "xxxxxxxxxxxxxxxx", dk: 1, s: "....x.......x...", h: "ride", fill: 1,
           lead: [[0, 8, 4], [4, 10, 4], [8, 12, 8], [16, 15, 4], [20, 14, 4], [24, 12, 8], [32, 15, 4], [36, 17, 4], [40, 19, 8], [48, 17, 4], [52, 15, 4], [56, 12, 8]] },
      C: { bars: 2, roots: [0, 3], riff: R16("0 0 0 0 0 0 0 0 3 3 3 3 5 5 5 5"), m: "ppppppppoooooooo", k: "xxxxxxxxxxxxxxxx", dk: 1, s: "..x...x...x...x.", h: "16", fill: 1 }
    }
  },
  // Cap 3: Destrucción (V8)
  c2: {
    name: "DESTRUCCIÓN (V8)",
    bpm: 208, div: 16, order: ["A", "A", "B", "A", "B", "C"],
    sec: {
      A: { bars: 4, roots: [0, 0, 0, 1], riff: R16("0 0 0 0 3 - 2 - 0 0 0 0 1 - 0 0"), m: "ppppoppoppppoppp", k: "xxxxxxxxxxxxxxxx", dk: 1, s: "....x.......x...", h: "8",
           lead: [[0, 24, 2], [2, 22, 2], [4, 24, 4], [8, 27, 4], [12, 26, 2], [14, 24, 2], [16, 22, 4], [20, 19, 4], [24, 24, 8], [32, 22, 4], [36, 24, 4], [40, 27, 4], [44, 26, 4], [48, 24, 8]] },
      B: { bars: 4, roots: [0, 0, 3, 1], riff: R16("0 - 7 - 0 - 7 - 0 - 8 - 7 - 5 -"), m: "o.o.o.o.o.o.o.o.", k: "xxxxxxxxxxxxxxxx", dk: 1, s: "..x...x...x...x.", h: "ride", fill: 1,
           lead: [[0, 24, 2], [2, 22, 2], [4, 19, 4], [8, 22, 4], [12, 24, 4], [16, 27, 8], [24, 26, 4], [28, 24, 4], [32, 22, 4], [36, 19, 4], [40, 24, 8]] },
      C: { bars: 4, roots: [0, -2, -4, -1], riff: R16("0 - - - - - - - 0 - - - - - - -"), m: "l.......l.......", k: "x.....x.x.....x.", s: "....x.......x...", h: "ride", fill: 1 }
    }
  },
  // Cap 4: Tú Eres Su Seguridad (Hermética)
  c3: {
    name: "TÚ ERES SU SEGURIDAD (HERMÉTICA)",
    bpm: 172, div: 16, order: ["A", "A", "B", "A", "B", "C"],
    sec: {
      A: { bars: 4, roots: [0, 0, 3, 5], riff: R16("0 - 0 0 3 - 0 0 5 - 6 5 3 - 0 0"), m: "o.ppo.ppo.poo.pp", k: "x.x.x.x.x.x.x.x.", s: "....x.......x...", h: "8",
           lead: [[0, 12, 2], [2, 15, 2], [4, 17, 4], [8, 18, 2], [10, 17, 2], [12, 15, 4], [16, 12, 2], [18, 10, 2], [20, 12, 8]] },
      B: { bars: 4, roots: [0, -2, -4, -2], riff: R16("0 - - - - - - - 0 - - - 0 - 0 -"), m: "l.......l...o.o.", k: "x..x..x.x..x..x.", s: "....x.......x...", h: "ride", fill: 1,
           lead: [[0, 12, 4], [4, 14, 2], [6, 15, 2], [8, 14, 4], [12, 12, 4], [16, 10, 4], [20, 7, 4], [24, 10, 4], [28, 12, 8]] },
      C: { bars: 2, roots: [0, 1], riff: R16("0 - - 0 - - 0 - 1 - - 1 - - 1 -"), m: "o..o..o.o..o..o.", k: "xx.xx.xx.xx.xx.x", s: "....x.......x...", h: "16", fill: 1 }
    }
  },
  // Cap 5: Memoria de Siglos (Hermética)
  c4: {
    name: "MEMORIA DE SIGLOS (HERMÉTICA)",
    bpm: 164, div: 16, order: ["A", "A", "B", "A", "B", "C"],
    sec: {
      A: { bars: 4, roots: [0, 0, -2, -4], riff: R16("0 0 - 0 0 - 0 0 3 0 - 0 5 3 - 0"), m: "pp.pp.ppo.po.oo.", k: "x.x.x.x.x.x.x.x.", s: "....x.......x...", h: "8",
           lead: [[0, 12, 2], [2, 15, 2], [4, 14, 2], [6, 12, 2], [8, 10, 2], [10, 7, 2], [12, 10, 2], [14, 12, 2],
                  [16, 15, 2], [18, 17, 2], [20, 19, 2], [22, 17, 2], [24, 15, 2], [26, 14, 2], [28, 12, 4]] },
      B: { bars: 4, roots: [-4, -2, 0, 0], riff: R16("0 - - 0 - - 0 - 0 - - 0 - - 0 -"), m: "o..o..o.o..o..o.", k: "x..x..x.x..x..x.", s: "....x.......x...", h: "ride", fill: 1,
           lead: [[0, 8, 4], [4, 10, 4], [8, 12, 8], [16, 15, 4], [20, 14, 4], [24, 12, 8], [32, 15, 4], [36, 17, 4], [40, 19, 8], [48, 17, 4], [52, 15, 4], [56, 12, 8]] },
      C: { bars: 4, roots: [0, 3, 5, 6], riff: R16("0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0"), m: "pppppppppppppppp", k: "xxxxxxxxxxxxxxxx", dk: 1, s: "....x.......x...", h: "16", fill: 1 }
    }
  },
  // Cap 6: Gil Trabajador (Hermética)
  c5: {
    name: "GIL TRABAJADOR (HERMÉTICA)",
    bpm: 154, div: 16, order: ["A", "A", "B", "A", "B", "C"],
    sec: {
      A: { bars: 4, roots: [0, 0, -2, 3], riff: R16("0 - - 0 - 0 3 - 0 - 6 5 3 - - 0"), m: "o..p.po.p.ooo..p", k: "x..x.x..x.x....x", s: "....x.......x...", h: "8",
           lead: [[0, 12, 4], [4, 15, 2], [6, 12, 2], [8, 18, 2], [10, 17, 2], [12, 15, 2], [14, 12, 2],
                  [16, 12, 4], [20, 15, 2], [22, 12, 2], [24, 18, 4], [28, 17, 4]] },
      B: { bars: 4, roots: [0, 3, 5, 3], riff: R16("0 - - - - - 0 0 - - 0 - - - - -"), m: "l.....pp..l.....", k: "x.....xx..x.....", s: "........x.......", h: "ride", fill: 1,
           lead: [[0, 12, 4], [4, 15, 4], [8, 17, 4], [12, 19, 4], [16, 17, 4], [20, 15, 4], [24, 12, 8]] },
      C: { bars: 2, roots: [0, 1], riff: R16("0 0 - 0 0 - 0 - 0 0 - 0 - 0 6 5"), m: "pp.pp.o.pp.p.poo", k: "xx.xx.x.xx.x.x..", s: "....x.......x...", h: "8", fill: 1 }
    }
  },
  // Cap 7: El Amasijo de un Gran Sueño (Almafuerte)
  c6: {
    name: "EL AMASIJO DE UN GRAN SUEÑO (ALMAFUERTE)",
    bpm: 146, div: 12, order: ["A", "A", "B", "A", "B", "C"],
    sec: {
      A: { bars: 4, roots: [0, 0, 5, 3], riff: R12("0 - 0 3 - 0 5 - 6 5 3 -"), m: "o.po.po.poo.", k: "x..x..x..x..", s: "...x.....x..", h: "sh", bombo: "x.xx..x.xx..",
           lead: [[0, 12, 3], [3, 15, 3], [6, 17, 3], [9, 18, 1], [10, 17, 2], [12, 15, 6], [18, 12, 3], [21, 10, 3], [24, 12, 6], [30, 15, 3], [33, 12, 9]] },
      B: { bars: 4, roots: [0, 3, 5, 7], riff: R12("0 - - 0 - - 0 - 0 0 - -"), m: "o..o..o.oo..", k: "x..x..x.xx..", s: "...x.....x..", h: "ride", bombo: "x..x..x..x..", fill: 1,
           lead: [[0, 17, 3], [3, 19, 3], [6, 20, 6], [12, 19, 3], [15, 17, 3], [18, 15, 6], [24, 17, 3], [27, 15, 3], [30, 14, 6], [36, 12, 12]] },
      C: { bars: 4, roots: [0, 0, -2, 0], riff: R12("0 - - - - - 0 - - - - -"), m: "l.....l.....", k: "xxxxxxxxxxxx", dk: 1, s: "......x.....", h: "ride", fill: 1, bombo: "x.....x....." }
    }
  },
  // Cap 8: Sé Vos (Almafuerte)
  c7: {
    name: "SÉ VOS (ALMAFUERTE)",
    bpm: 122, div: 16, order: ["A", "B", "A", "B", "C", "B"],
    pl: [[0, 7], [4, 12], [8, 15], [12, 19]],
    sec: {
      A: { bars: 4, roots: [0, -4, -2, 3], riff: R16("0 - - - - - - - 0 - - - 0 - - -"), m: "l.......l...l...", k: "x.......x.x.....", s: "....x.......x...", h: "ride",
           lead: [[0, 7, 2], [2, 8, 2], [4, 7, 2], [6, 5, 2], [8, 3, 2], [10, 5, 2], [12, 7, 4],
                  [16, 3, 2], [18, 2, 2], [20, 0, 8],
                  [32, 3, 2], [34, 5, 2], [36, 7, 4], [40, 10, 4], [44, 7, 2], [46, 5, 2],
                  [48, 3, 2], [50, 2, 2], [52, 0, 12]] },
      B: { bars: 4, roots: [0, -4, -2, 3], riff: R16("0 - 0 0 - 0 0 - 0 - 0 0 3 - 2 0"), m: "o.ppo.ppo.po.oop", k: "x.xx..x.x.xx..x.", s: "....x.......x...", h: "8", fill: 1,
           lead: [[0, 19, 2], [2, 20, 2], [4, 19, 2], [6, 17, 2], [8, 15, 2], [10, 17, 2], [12, 19, 4],
                  [16, 15, 2], [18, 14, 2], [20, 12, 8],
                  [32, 15, 2], [34, 17, 2], [36, 19, 4], [40, 22, 4], [44, 19, 2], [46, 17, 2],
                  [48, 15, 2], [50, 14, 2], [52, 12, 12]] },
      C: { bars: 4, roots: [-4, -2, 0, 0], riff: R16("0 - - - 0 - - - 0 - - - 0 - - -"), m: "o...o...o...o...", k: "x...x...x...x...", s: "....x.......x...", h: "ride", fill: 1,
           lead: [[0, 15, 4], [4, 17, 4], [8, 19, 8], [16, 17, 4], [20, 15, 4], [24, 14, 8], [32, 15, 4], [36, 17, 4], [40, 19, 8], [48, 22, 4], [52, 24, 8]] }
    }
  },
  // Cap 9: Toro y Pampa (Almafuerte)
  c8: {
    name: "TORO Y PAMPA (ALMAFUERTE)",
    bpm: 138, div: 12, order: ["A", "A", "B", "A", "C"],
    sec: {
      A: { bars: 4, roots: [0, 0, -2, -4], riff: R12("0 - 0 3 - 0 5 - 3 0 - 0"), m: "o.po.po.po.p", k: "x..x..x..x..", s: "...x.....x..", h: "sh", bombo: "x..x..x.x..x",
           lead: [[0, 12, 3], [3, 15, 3], [6, 17, 6], [12, 15, 3], [15, 14, 3], [18, 12, 6], [24, 15, 3], [27, 17, 3], [30, 19, 6], [36, 17, 3], [39, 15, 3], [42, 12, 6]] },
      B: { bars: 4, roots: [0, 5, 3, -2], riff: R12("0 - - 0 - - 0 - - 0 - -"), m: "l.....l.....", k: "x.....x.....", s: "...x.....x..", h: "ride", bombo: "x.....x.....", fill: 1,
           lead: [[0, 19, 3], [3, 17, 3], [6, 15, 6], [12, 17, 3], [15, 15, 3], [18, 14, 6], [24, 12, 6], [30, 10, 6], [36, 12, 12]] },
      C: { bars: 2, roots: [0, 0], riff: R12("0 0 0 0 0 0 0 0 0 0 0 0"), m: "pppppppppppp", k: "xxxxxxxxxxxx", dk: 1, s: "......x.....", h: "16", fill: 1 }
    }
  },
  // Cap 10: Muere Monstruo Muere (Almafuerte)
  c9: {
    name: "MUERE MONSTRUO MUERE (ALMAFUERTE)",
    bpm: 160, div: 16, order: ["A", "A", "B", "A", "B", "C"],
    sec: {
      A: { bars: 4, roots: [0, 0, 1, 3], riff: R16("0 0 0 0 1 - 0 0 3 - 0 0 1 - 0 0"), m: "ppppoppppoppoppp", k: "x.x.x.x.x.x.x.x.", s: "....x.......x...", h: "8",
           lead: [[0, 12, 2], [2, 13, 2], [4, 12, 4], [8, 15, 4], [12, 13, 4], [16, 12, 2], [18, 10, 2], [20, 12, 8]] },
      B: { bars: 4, roots: [0, 3, 1, -2], riff: R16("0 - - 0 - - 0 - 0 - 0 - 0 - 0 -"), m: "o..o..o.o.o.o.o.", k: "xxxxxxxxxxxxxxxx", dk: 1, s: "....x.......x...", h: "ride", fill: 1,
           lead: [[0, 15, 4], [4, 17, 4], [8, 18, 8], [16, 17, 4], [20, 15, 4], [24, 13, 4], [28, 12, 4], [32, 15, 4], [36, 13, 4], [40, 12, 8]] },
      C: { bars: 4, roots: [0, 0, 1, 0], riff: R16("0 - - - - - 0 0 - - 0 - - - - -"), m: "l.....pp..l.....", k: "x.....xx..x.....", s: "........x.......", h: "ride", fill: 1 }
    }
  },
  // Cap 11: A Vos Amigo (Almafuerte / Iorio)
  c10: {
    name: "A VOS AMIGO (ALMAFUERTE)",
    bpm: 118, div: 12, order: ["A", "A", "B", "A", "B", "C"],
    pl: [[0, 7], [3, 12], [6, 15], [9, 19]],
    sec: {
      A: { bars: 4, roots: [0, -4, -2, 0], riff: R12("0 - - - - - 0 - - - - -"), m: "l.....l.....", k: "x.....x.....", s: "...x.....x..", h: "ride",
           lead: [[0, 12, 3], [3, 14, 3], [6, 15, 6], [12, 14, 3], [15, 12, 3], [18, 10, 6], [24, 12, 3], [27, 10, 3], [30, 7, 6], [36, 10, 3], [39, 12, 9]] },
      B: { bars: 4, roots: [0, 3, 5, 3], riff: R12("0 - 0 3 - 0 5 - 3 0 - 0"), m: "o.po.po.po.p", k: "x..x..x..x..", s: "...x.....x..", h: "sh", bombo: "x..x..x.x..x", fill: 1,
           lead: [[0, 15, 3], [3, 17, 3], [6, 19, 6], [12, 17, 3], [15, 15, 3], [18, 14, 6], [24, 15, 3], [27, 14, 3], [30, 12, 6], [36, 10, 3], [39, 12, 9]] },
      C: { bars: 4, roots: [0, 7, 5, 0], riff: R12("0 - - 0 - - 0 - - 0 0 0"), m: "o..o..o..ooo", k: "x..x..x..xxx", s: "......x.....", h: "ride", fill: 1 }
    }
  },
  // Boss V8: Cautivos del Sistema
  b0: {
    name: "CAUTIVOS DEL SISTEMA (V8 - BOSS)",
    bpm: 204, div: 16, order: ["A", "A", "B"],
    sec: {
      A: { bars: 4, roots: [0, 1, 0, -2], riff: R16("0 0 0 0 0 0 0 0 0 0 0 0 1 1 1 1"), m: "ppppppppppppoooo", k: "xxxxxxxxxxxxxxxx", dk: 1, s: "....x.......x...", h: "8",
           lead: [[0, 12, 2], [2, 13, 2], [4, 15, 4], [8, 13, 2], [10, 12, 2], [12, 10, 4], [16, 12, 8], [24, 10, 8]] },
      B: { bars: 4, roots: [0, 3, 5, 1], riff: R16("0 - 7 - 0 - 7 - 0 - 8 - 7 - 5 -"), m: "o.o.o.o.o.o.o.o.", k: "xxxxxxxxxxxxxxxx", dk: 1, s: "..x...x...x...x.", h: "ride", fill: 1,
           lead: [[0, 24, 2], [2, 22, 2], [4, 19, 4], [8, 22, 4], [12, 24, 4], [16, 27, 8], [24, 26, 4], [28, 24, 4]] }
    }
  },
  // Boss Hermética: Olvídalo y Volverá por Más
  b1: {
    name: "OLVÍDALO Y VOLVERÁ POR MÁS (HERMÉTICA - BOSS)",
    bpm: 198, div: 16, order: ["A", "A", "B"],
    sec: {
      A: { bars: 4, roots: [0, 0, 1, -1], riff: R16("0 0 0 0 1 0 0 0 6 0 0 0 5 0 3 1"), m: "ppppopppopppopoo", k: "x.x.x.x.x.x.x.x.", s: "....x.......x...", h: "8",
           lead: [[0, 13, 2], [2, 12, 2], [4, 18, 4], [8, 17, 2], [10, 13, 2], [12, 12, 4], [16, 25, 8], [24, 24, 8]] },
      B: { bars: 4, roots: [0, 0, -2, -1], riff: R16("0 - - 1 - - 0 - 6 - - 5 - - - -"), m: "o..o..o.o..o....", k: "xxxxxxxxxxxxxxxx", dk: 1, s: "....x.......x...", h: "ride", fill: 1,
           lead: [[0, 24, 2], [2, 22, 2], [4, 19, 4], [8, 22, 4], [12, 24, 4], [16, 27, 8], [24, 26, 4], [28, 24, 4]] }
    }
  },
  // Boss Almafuerte: Triunfo
  b2: {
    name: "TRIUNFO (ALMAFUERTE - BOSS)",
    bpm: 156, div: 12, order: ["A", "A", "B"],
    sec: {
      A: { bars: 4, roots: [0, 0, 1, -2], riff: R12("0 - 0 1 - 0 7 - 6 0 - 0"), m: "o.po.po.oo.p", k: "x..x..x..x..", s: "......x.....", h: "8", bombo: "x..x..x.x..x",
           lead: [[0, 12, 3], [3, 13, 3], [6, 16, 6], [12, 15, 3], [15, 13, 3], [18, 12, 6]] },
      B: { bars: 4, roots: [0, -4, -2, 1], riff: R12("0 - - - - - 1 - - - - -"), m: "llllllllllll", k: "xxxxxxxxxxxx", dk: 1, s: "...x.....x..", h: "ride", fill: 1, bombo: "x.....x.....",
           lead: [[0, 19, 3], [3, 18, 3], [6, 16, 6], [12, 18, 3], [15, 19, 3], [18, 22, 6]] }
    }
  }
};

// Aliases para retrocompatibilidad total
SONGS.l1 = SONGS.c0;
SONGS.l2 = SONGS.c1;
SONGS.l3 = SONGS.c3;
SONGS.l4 = SONGS.c7;
SONGS.l5 = SONGS.c8;
SONGS.bossRock = SONGS.b0;
SONGS.bossThrash = SONGS.b1;
SONGS.bossFolk = SONGS.b2;
SONGS.street = SONGS.c7;

for (const k in SONGS) {
  const S = SONGS[k];
  if (S.order && S.sec) S.total = S.order.reduce((a, id) => a + (S.sec[id] ? S.sec[id].bars : 0), 0);
}


let revIn=null,leadWS=null;
function revSetup(){try{const conv=AC.createConvolver(),n=AC.sampleRate*1.8|0,b=AC.createBuffer(2,n,AC.sampleRate);
  for(let c=0;c<2;c++){const d=b.getChannelData(c);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/n,2.6);}
  conv.buffer=b;revIn=AC.createGain();revIn.gain.value=1;const rg=AC.createGain();rg.gain.value=.22;revIn.connect(conv);conv.connect(rg);rg.connect(musicBus);
  leadWS=AC.createWaveShaper();const c=new Float32Array(1024);for(let i=0;i<1024;i++){const v=i*2/1024-1;c[i]=Math.tanh(v*4);}leadWS.curve=c;
  const lg=AC.createGain();lg.gain.value=.8;leadWS.connect(lg);lg.connect(fightG);lg.connect(revIn);}catch(e){revIn=null;}ampSetup();}
function secOf(S,bar){let b=bar%S.total;for(const id of S.order){const s=S.sec[id];if(b<s.bars)return [s,b];b-=s.bars;}return [S.sec[S.order[0]],0];}

function pluck(m,t,v){const o=AC.createOscillator(),o2=AC.createOscillator(),f=AC.createBiquadFilter(),g=AC.createGain();o.type='sawtooth';o2.type='triangle';o.frequency.value=mf(m);o2.frequency.value=mf(m)*1.002;
  f.type='lowpass';f.frequency.setValueAtTime(3200,t);f.frequency.exponentialRampToValueAtTime(380,t+.35);env(g,t,.002,v,.7);o.connect(f);o2.connect(f);f.connect(g);g.connect(delayIn);o.start(t);o2.start(t);o.stop(t+.8);o2.stop(t+.8);}
function bombo(t,v){const o=AC.createOscillator(),g=AC.createGain();o.frequency.setValueAtTime(105,t);o.frequency.exponentialRampToValueAtTime(62,t+.25);env(g,t,.003,v,.32);o.connect(g);g.connect(calmG);o.start(t);o.stop(t+.4);nz(t,.04,v*.5,'lowpass',400,calmG);}
function musicTick(){if(!AC)return;const now=AC.currentTime;
  const want=musicOn&&state!=='pause'&&state!=='gameover'&&!lmOn()?1:0;
  musicBus.gain.setTargetAtTime(want*.55,now,.15);
  // Música 16-bits completa continua en menú, cinemáticas y combate
  fightG.gain.setTargetAtTime(want?1:0,now,.15);
  calmG.gain.setTargetAtTime(want?.35:0,now,.2);
  if(!want){nextT=now+.05;return;}
  if(nextT<now)nextT=now+.03;const S=SONGS[song]||SONGS.c7||SONGS.c0,div=S.div,spb=60/S.bpm/(div===12?3:4);
  while(nextT<now+.14){const bar=Math.floor(step/div),s=step%div,[sec,bi]=secOf(S,bar),root=36+(S.tr||0)+sec.roots[bi%sec.roots.length],t=nextT;
    const fill=sec.fill&&bi===sec.bars-1&&s>=div/2;
    const v=sec.riff[s],md=sec.m[s];
    if(v!==null&&v!==undefined&&!(fill&&s>=div-2)){
      const pm=md==='p',d=pm?spb*.55:md==='l'?spb*3.6:spb*1.7;
      gtr(root+v,t,d,pm?.045:.068,pm);
      bass(root+v-12,t,pm?spb*.75:d,pm?.15:.19);
    }
    if(fill){
      if(s%2===0)tom(t,[220,180,140,110,90,80][((s-div/2)/2)|0]||90,.5,fightG);
      if(s%2===1)snare(t,.24,fightG);
      if(s===div-1)kick(t,.58,fightG);
    } else {
      if(sec.k[s]==='x')kick(t,sec.dk?.45:.62,fightG);
      if(sec.s[s]==='x'){snare(t,.34,fightG);if(revIn)nz(t,.24,.18,'bandpass',1700,revIn,.9);}
      if(sec.h==='8'&&s%2===0)hat(t,s%4===0?.075:.048,fightG);
      else if(sec.h==='16')hat(t,s%2?.035:.065,fightG);
      else if(sec.h==='ride'&&s%2===0)ride(t,.075,fightG);
      else if(sec.h==='sh'&&s%3!==1)hat(t,s%3===0?.075:.042,fightG);
    }
    if(bi===0&&s===0)crash(t,.22,fightG);
    if(sec.bombo&&sec.bombo[s]==='x')bombo(t,.5);
    if(sec.lead){
      const lBars=sec.leadBars||sec.bars||4;
      const pos=(bi%lBars)*div+s;
      for(const [p,n,len] of sec.lead){
        if(p===pos){
          lead(52+n,t,len*spb,.14);
          if(sec.harm)lead(52+n+sec.harm,t,len*spb,.09);
        }
      }
    }
    if(sec.ch){for(const [p,n] of sec.ch)if(p===s)pluck(root+24+n,t,.06);}
    if(S.pl)for(const [st,iv] of S.pl)if(st===s)pluck(root+24+iv,t,.09);
    if(S.bo&&S.bo[s]==='x')bombo(t,.4);
    if(s===0&&(!sec.riff||sec.riff[0]===null))bass(root-12,t,spb*(div-1),.14);
    nextT+=spb;step++;}}

// v10: sonido de banda de metal: dos guitarras con amplificador y caja simulados, bajo con púa, batería con cuerpo
let drumG=null,gLead=null;
function ampChain(pan,delayS,drive,out){const inp=AC.createGain(),hp=AC.createBiquadFilter(),tight=AC.createBiquadFilter(),ws1=AC.createWaveShaper(),scoop=AC.createBiquadFilter(),ws2=AC.createWaveShaper();
  const c1=AC.createBiquadFilter(),c2=AC.createBiquadFilter(),low=AC.createBiquadFilter(),pres=AC.createBiquadFilter(),dl=AC.createDelay(.05),pn=AC.createStereoPanner?AC.createStereoPanner():AC.createGain(),g=AC.createGain();
  const curve=(k,hard)=>{const n=4096,c=new Float32Array(n);for(let i=0;i<n;i++){const v=i*2/n-1;c[i]=hard?Math.max(-.9,Math.min(.9,Math.tanh(v*k)*1.1)):Math.tanh(v*k);}return c;};
  hp.type='highpass';hp.frequency.value=90;tight.type='peaking';tight.frequency.value=900;tight.gain.value=7;tight.Q.value=.8;
  ws1.curve=curve(drive||9);ws1.oversample='4x';scoop.type='peaking';scoop.frequency.value=480;scoop.gain.value=-7;scoop.Q.value=1;ws2.curve=curve(2.4,true);ws2.oversample='4x';
  c1.type='lowpass';c1.frequency.value=4600;c1.Q.value=.9;c2.type='lowpass';c2.frequency.value=5600;c2.Q.value=.5;low.type='peaking';low.frequency.value=110;low.gain.value=4;low.Q.value=.9;
  pres.type='peaking';pres.frequency.value=2300;pres.gain.value=4;pres.Q.value=1.1;dl.delayTime.value=delayS||0;if(pn.pan)pn.pan.value=pan;g.gain.value=.42;
  inp.connect(hp);hp.connect(tight);tight.connect(ws1);ws1.connect(scoop);scoop.connect(ws2);ws2.connect(c1);c1.connect(c2);c2.connect(low);low.connect(pres);pres.connect(dl);dl.connect(pn);pn.connect(g);g.connect(out||fightG);
  if(revIn){const s=AC.createGain();s.gain.value=.12;g.connect(s);s.connect(revIn);}return inp;}
function ampSetup(){try{
  gL=ampChain(-.85,0,9);gR=ampChain(.85,.013,9.5);gLead=ampChain(0,0,16);
  // bajo: púa, un poco de saturación, graves firmes
  bassIn=AC.createGain();const bws=AC.createWaveShaper(),n=2048,c=new Float32Array(n);for(let i=0;i<n;i++){const v=i*2/n-1;c[i]=Math.tanh(v*3);}bws.curve=c;
  const blp=AC.createBiquadFilter();blp.type='lowpass';blp.frequency.value=1300;const bpk=AC.createBiquadFilter();bpk.type='peaking';bpk.frequency.value=90;bpk.gain.value=5;
  const bmid=AC.createBiquadFilter();bmid.type='peaking';bmid.frequency.value=1000;bmid.gain.value=3;const bg=AC.createGain();bg.gain.value=.75;
  bassIn.connect(bws);bws.connect(blp);blp.connect(bpk);bpk.connect(bmid);bmid.connect(bg);bg.connect(musicBus);
  // batería: bus comprimido con un poco de sala
  drumG=AC.createGain();drumG.gain.value=1;const dc=AC.createDynamicsCompressor();dc.threshold.value=-20;dc.ratio.value=4;dc.attack.value=.004;dc.release.value=.12;
  const dg=AC.createGain();dg.gain.value=1.25;drumG.connect(dc);dc.connect(dg);dg.connect(fightG);if(revIn){const s=AC.createGain();s.gain.value=.22;drumG.connect(s);s.connect(revIn);}
}catch(e){}}
// guitarra rítmica 16-bits: crunch arcade FM/pulse, palm mute resonante y acordes estéreo
function gtr(m,t,d,v,pm){for(const [dest,dt] of [[gL,-8],[gR,8]]){const g=AC.createGain(),f=AC.createBiquadFilter();f.type='lowpass';
    if(pm){f.frequency.setValueAtTime(2800,t);f.frequency.exponentialRampToValueAtTime(380,t+.045);f.Q.value=2.2;}else{f.frequency.value=6800;f.Q.value=.8;}
    g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(v*1.7,t+.002);g.gain.setTargetAtTime(v*(pm?.48:1.15),t+.018,pm?.025:.22);g.gain.setTargetAtTime(.0001,t+d,.025);
    for(const iv of (pm?[0,7]:[0,7,12])){const fr=mf(m+iv),o=AC.createOscillator();o.type='sawtooth';o.frequency.value=fr;o.detune.value=dt+(iv===7?4:0);o.connect(f);o.start(t);o.stop(t+d+.15);
      if(pm){const oSq=AC.createOscillator(),gSq=AC.createGain();oSq.type='square';oSq.frequency.value=fr;gSq.gain.value=.35;oSq.connect(gSq);gSq.connect(f);oSq.start(t);oSq.stop(t+d+.08);}}
    f.connect(g);g.connect(dest);}}
// bajo slap arcade 16-bits (YM2612 Genesis / CPS-2): ataque FM con snap de tono y sub-graves
function bass(m,t,d,v){const g=AC.createGain(),f=AC.createBiquadFilter();f.type='lowpass';f.frequency.setValueAtTime(2200,t);f.frequency.exponentialRampToValueAtTime(580,t+.09);f.Q.value=1.5;
  g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(v*1.8,t+.002);g.gain.setTargetAtTime(v*1.05,t+.012,.08);g.gain.setTargetAtTime(.0001,t+d,.025);
  const fr=mf(m);
  const o1=AC.createOscillator();o1.type='sawtooth';o1.frequency.setValueAtTime(fr*1.4,t);o1.frequency.exponentialRampToValueAtTime(fr,t+.02);o1.connect(f);o1.start(t);o1.stop(t+d+.18);
  const o2=AC.createOscillator(),g2=AC.createGain();o2.type='square';o2.frequency.setValueAtTime(fr*.5,t);g2.gain.value=.55;o2.connect(g2);g2.connect(f);o2.start(t);o2.stop(t+d+.18);
  const o3=AC.createOscillator(),g3=AC.createGain();o3.type='sine';o3.frequency.setValueAtTime(fr,t);g3.gain.value=.75;o3.connect(g3);g3.connect(f);o3.start(t);o3.stop(t+d+.18);
  f.connect(g);g.connect(bassIn);}
function kick(t,v,dest){const D=drumG||dest,o=AC.createOscillator(),g=AC.createGain(),o2=AC.createOscillator(),g2=AC.createGain();
  o.type='sine';o.frequency.setValueAtTime(170,t);o.frequency.exponentialRampToValueAtTime(42,t+.06);env(g,t,.001,v*1.4,.28);o.connect(g);g.connect(D);o.start(t);o.stop(t+.35);
  o2.type='triangle';o2.frequency.setValueAtTime(360,t);o2.frequency.exponentialRampToValueAtTime(80,t+.018);env(g2,t,.001,v*.6,.035);o2.connect(g2);g2.connect(D);o2.start(t);o2.stop(t+.06);
  nz(t,.015,v*.5,'highpass',2800,D);}
function snare(t,v,dest){const D=drumG||dest,o=AC.createOscillator(),g=AC.createGain();o.type='triangle';o.frequency.setValueAtTime(250,t);o.frequency.exponentialRampToValueAtTime(120,t+.045);env(g,t,.001,v*1.05,.12);o.connect(g);g.connect(D);o.start(t);o.stop(t+.18);
  nz(t,.2,v*1.2,'bandpass',2200,D,.75);nz(t,.08,v*.75,'highpass',6000,D);nz(t,.04,v*.6,'lowpass',1000,D);}
function hat(t,v,dest){const D=drumG||dest;nz(t,.035,v*1.2,'highpass',8500,D);nz(t,.016,v*.7,'bandpass',11000,D,1.8);}
function crash(t,v,dest){const D=drumG||dest;nz(t,1.6,v*1.0,'highpass',4800,D);nz(t,.9,v*.6,'bandpass',7200,D,.9);nz(t,.05,v*.7,'bandpass',3200,D,1.2);}
function tom(t,f,v,dest){const D=drumG||dest,o=AC.createOscillator(),g=AC.createGain();o.type='sine';o.frequency.setValueAtTime(f*1.5,t);o.frequency.exponentialRampToValueAtTime(f*.75,t+.16);env(g,t,.001,v*1.4,.28);o.connect(g);g.connect(D);o.start(t);o.stop(t+.35);nz(t,.025,v*.35,'bandpass',f*3.5,D,1.2);}
function ride(t,v,dest){const D=drumG||dest;nz(t,.4,v*.75,'bandpass',5800,D,2.6);osc('triangle',3000,t,.2,v*.24,D);osc('triangle',4400,t,.16,v*.14,D);}
// solo / melodía 16-bits: sintetizador arcade retro (Square + Sawtooth) con scoop de tono, vibrato LFO y delay estéreo
function lead(m,t,d,v){if(!gLead)return;const g=AC.createGain(),f=AC.createBiquadFilter();f.type='lowpass';f.frequency.value=5800;f.Q.value=1.4;
  g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(v*1.55,t+.004);g.gain.setTargetAtTime(v*1.1,t+.03,.22);g.gain.setTargetAtTime(.0001,t+d,.03);
  const fr=mf(m);
  const o1=AC.createOscillator();o1.type='sawtooth';o1.frequency.setValueAtTime(fr*1.018,t);o1.frequency.exponentialRampToValueAtTime(fr,t+Math.min(.035,d*.2));
  const o2=AC.createOscillator(),g2=AC.createGain();o2.type='square';o2.detune.value=8;o2.frequency.setValueAtTime(fr*1.018,t);o2.frequency.exponentialRampToValueAtTime(fr,t+Math.min(.035,d*.2));g2.gain.value=.55;
  const o3=AC.createOscillator(),g3=AC.createGain();o3.type='triangle';o3.frequency.setValueAtTime(fr*.5,t);g3.gain.value=.35;
  const lfo=AC.createOscillator(),lg=AC.createGain();lfo.frequency.value=6.0;lg.gain.setValueAtTime(0,t);lg.gain.setValueAtTime(0,t+.07);lg.gain.linearRampToValueAtTime(fr*.022,t+Math.min(.26,d*.65));
  lfo.connect(lg);lg.connect(o1.frequency);lg.connect(o2.frequency);
  o1.connect(f);o2.connect(g2);g2.connect(f);o3.connect(g3);g3.connect(f);f.connect(g);g.connect(gLead);
  o1.start(t);o1.stop(t+d+.25);o2.start(t);o2.stop(t+d+.25);o3.start(t);o3.stop(t+d+.25);lfo.start(t);lfo.stop(t+d+.25);
  if(delayIn){const s=AC.createGain();s.gain.value=.32;g.connect(s);s.connect(delayIn);}}

function sfx(n){if(!AC)return;const t=AC.currentTime;switch(n){
  case 'punch':nz(t,.08,.55,'lowpass',1400);osc('sine',130,t,.09,.45,master);break;
  case 'heavy':nz(t,.16,.8,'lowpass',900);osc('sine',90,t,.18,.7,master);nz(t,.05,.3,'highpass',3000);break;
  case 'whoosh':{const f=nz(t,.1,.14,'bandpass',700,master,1.5);f.frequency.exponentialRampToValueAtTime(2400,t+.1);break;}
  case 'grunt':{const o=osc('sawtooth',rnd(150,210),t,.14,.09,master);o.frequency.exponentialRampToValueAtTime(90,t+.14);break;}
  case 'land':nz(t,.08,.3,'lowpass',500);break;
  case 'jump':nz(t,.05,.12,'bandpass',1200);break;
  case 'break':nz(t,.25,.5,'highpass',2500);osc('square',320,t,.08,.12,master);break;
  case 'pickup':[0,4,7,12].forEach((s,i)=>osc('square',mf(76+s),t+i*.06,.08,.07,master));break;
  case 'heal':[0,5,9,12,16].forEach((s,i)=>osc('triangle',mf(72+s),t+i*.05,.12,.12,master));break;
  case 'scream':{const o=osc('sawtooth',230,t,.75,.22,master);o.frequency.linearRampToValueAtTime(150,t+.75);const o2=osc('sawtooth',345,t,.7,.12,master);o2.frequency.linearRampToValueAtTime(220,t+.7);nz(t,.6,.35,'bandpass',900,master,.7);osc('sine',55,t,.6,.6,master);break;}
  case 'train':{nz(t,3.2,.35,'lowpass',260);osc('sawtooth',311,t+.2,1.1,.06,master);osc('sawtooth',370,t+.2,1.1,.06,master);break;}
  case 'moto':{const o=osc('sawtooth',42,t,2.4,.2,master,0,.1);o.frequency.linearRampToValueAtTime(70,t+1.0);o.frequency.linearRampToValueAtTime(32,t+2.4);nz(t,2.2,.12,'lowpass',300);break;}
  case 'win':[0,4,7,12,16,19,24].forEach((s,i)=>{osc('square',mf(64+s),t+i*.09,.18,.08,master);});break;
  case 'go':osc('square',880,t,.08,.08,master);osc('square',1175,t+.1,.12,.08,master);break;
  case 'gun':nz(t,.22,.45,'highpass',3500,master);nz(t,.08,.3,'bandpass',1800,master,1);break;
  case 'escopeta':nz(t,.1,.5,'lowpass',900,master);osc('triangle',140,t,.08,.25,master);break;
  case 'truck':{const o=osc('sawtooth',55,t,2.2,.22,master,0,.1);o.frequency.linearRampToValueAtTime(48,t+2.2);nz(t,2,.16,'lowpass',260);osc('square',233,t+.1,.5,.06,master);osc('square',294,t+.1,.5,.06,master);break;}
  case 'toro':{const o=osc('sawtooth',120,t,.9,.2,master,0,.05);o.frequency.linearRampToValueAtTime(70,t+.9);nz(t,1.6,.2,'lowpass',200);break;}
  case 'blip':osc('square',660,t,.03,.04,master);break;}}

/* ================= input ================= */
const keys={},touch={},one={};
const KMAP={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',ArrowUp:'up',KeyW:'up',ArrowDown:'down',KeyS:'down',
  KeyZ:'atk',KeyJ:'atk',KeyX:'jump',KeyK:'jump',Space:'jump',KeyC:'spec',KeyL:'spec',ShiftLeft:'dodge',ShiftRight:'dodge',KeyV:'dodge',Enter:'start',Escape:'esc',KeyP:'pause',KeyM:'menu',KeyQ:'menu',KeyR:'restart',KeyB:'papa',KeyF:'papa',KeyI:'papa',KeyG:'album'};
addEventListener('keydown',e=>{const a=KMAP[e.code];if(!a)return;e.preventDefault();audioInit();if(AC&&AC.state==='suspended')AC.resume();if(!e.repeat)one[a]=1;keys[a]=1;});
addEventListener('keyup',e=>{const a=KMAP[e.code];if(a)keys[a]=0;});
addEventListener('blur',()=>{for(const k in keys)keys[k]=0;if(state==='play')state='pause';});
document.addEventListener('visibilitychange',()=>{if(document.hidden){for(const k in keys)keys[k]=0;if(state==='play')state='pause';if(AC&&AC.state==='running')AC.suspend().catch(()=>{});}else if(AC&&AC.state==='suspended')AC.resume().catch(()=>{});});
const dpad=document.getElementById('dpad');
function dpadSet(e){const r=dpad.getBoundingClientRect(),x=e.clientX-(r.left+r.width/2),y=e.clientY-(r.top+r.height/2);touch.left=touch.right=touch.up=touch.down=0;if(Math.hypot(x,y)<12)return;
  const o=Math.round(Math.atan2(y,x)/(Math.PI/4)),D={0:[1,0],1:[1,1],2:[0,1],3:[-1,1],4:[-1,0],'-4':[-1,0],'-3':[-1,-1],'-2':[0,-1],'-1':[1,-1]}[o];
  if(D[0]>0)touch.right=1;if(D[0]<0)touch.left=1;if(D[1]>0)touch.down=1;if(D[1]<0)touch.up=1;}
dpad.addEventListener('pointerdown',e=>{e.preventDefault();audioInit();try{dpad.setPointerCapture(e.pointerId);}catch(_){}dpadSet(e);});
dpad.addEventListener('pointermove',e=>{if(e.buttons||e.pointerType==='touch')dpadSet(e);});
['pointerup','pointercancel','lostpointercapture'].forEach(n=>dpad.addEventListener(n,()=>{touch.left=touch.right=touch.up=touch.down=0;}));
[['bAtk','atk'],['bJmp','jump'],['bSpc','spec'],['bDdg','dodge'],['bPap','papa']].forEach(([id,k])=>{const b=document.getElementById(id);
  b.addEventListener('pointerdown',e=>{e.preventDefault();audioInit();touch[k]=1;one[k]=1;b.classList.add('on');});
  ['pointerup','pointercancel','pointerleave'].forEach(n=>b.addEventListener(n,()=>{touch[k]=0;b.classList.remove('on');}));});
document.getElementById('bPause').addEventListener('pointerdown',e=>{e.preventDefault();audioInit();if(state==='pause')state='play';else if(state==='play')state='pause';else one.start=1;});
cv.addEventListener('pointerdown',e=>{audioInit();if(AC&&AC.state==='suspended')AC.resume();cv.focus();
  const rect=cv.getBoundingClientRect(),cy=(e.clientY-rect.top)*(H/rect.height),cx=(e.clientX-rect.left)*(W/rect.width);
  if(state==='gameover'){
    if(cy>=178&&cy<=208&&cx>=W/2-105&&cx<=W/2+105){toTitleMenu();return;}
    if(gameoverT>15){resurrectPlayer();}
  }
  else if(state==='pause'){
    if(cx>=W/2-105&&cx<=W/2+105){
      if(cy>=86&&cy<=114){state='play';sfx('blip');return;}
      if(cy>=116&&cy<=142){startChapter(lvl,false);sfx('blip');return;}
      if(cy>=144&&cy<=172){toTitleMenu();return;}
    }
    state='play';
  }
  else if(state==='title'){
    if(cy>=198&&cy<=220&&cx>=216&&cx<=468){diffSet(diff+1);sfx('blip');return;}
    if(cy>=80&&cy<=200&&cx>=218&&cx<=468){const row=Math.floor((cy-80)/10);if(row>=0&&row<LEVELS.length){sel=row;try{song=LEVELS[sel].song;step=0;}catch(e){}sfx('blip');return;}}
    one.start=1;}
  else if(state==='results'){
    if(cy>=192&&cy<=220&&cx>=W/2+20&&cx<=W/2+160){toTitleMenu();return;}
    one.start=1;
  }
  else if(state!=='play')one.start=1;});
document.getElementById('touch').addEventListener('contextmenu',e=>e.preventDefault());
let inp={},press={},lastPad={};
function readInput(){let gp=null;try{for(const p of (navigator.getGamepads?navigator.getGamepads():[]))if(p){gp=p;break;}}catch(e){}
  const g=k=>!!(keys[k]||touch[k]);inp={left:g('left'),right:g('right'),up:g('up'),down:g('down'),atk:g('atk')};
  press={};for(const k of ['atk','jump','spec','dodge','start','mute','left','right','up','down','papa','album','esc','menu','restart','pause'])press[k]=!!one[k];
  if(gp){const B=i=>!!(gp.buttons[i]&&gp.buttons[i].pressed),ax=gp.axes[0]||0,ay=gp.axes[1]||0;
    inp.left=inp.left||ax<-.4||B(14);inp.right=inp.right||ax>.4||B(15);inp.up=inp.up||ay<-.4||B(12);inp.down=inp.down||ay>.4||B(13);
    const m={atk:2,jump:0,spec:1,dodge:5,start:9,papa:7};for(const k in m){const v=B(m[k])||(k==='dodge'&&B(4))||(k==='atk'&&B(3));if(v&&!lastPad[k])press[k]=true;lastPad[k]=v;}inp.atk=inp.atk||B(2);}
  for(const k in one)one[k]=0;}

/* ================= game data ================= */
const MOVES={
  jab:{dur:14,a0:3,a1:6,reach:28,dmg:5,stun:16,kb:.6,pose:'jab',next:'cross',h:44},
  cross:{dur:16,a0:4,a1:7,reach:30,dmg:6,stun:18,kb:.8,pose:'cross',next:'upper',h:44,step:2},
  upper:{dur:20,a0:6,a1:9,reach:26,dmg:8,stun:22,kb:1,pose:'upper',next:'kick',h:48,wind:'windup'},
  kick:{dur:28,a0:9,a1:13,reach:38,dmg:13,kd:1,pose:'kick',wind:'kickw',h:34,step:3},
  pipe1:{dur:22,a0:8,a1:12,reach:44,dmg:11,stun:22,kb:1.2,pose:'swing',wind:'swingw',next:'pipe2',h:44,weapon:1},
  pipe2:{dur:26,a0:9,a1:13,reach:44,dmg:14,kd:1,pose:'swing',wind:'swingw',h:44,weapon:1},
  jkick:{reach:32,dmg:11,kd:1,h:30},
  spec:{dmg:16,kd:1.2},
  epunch:{dur:18,a0:5,a1:8,reach:26,dmg:7,stun:18,kb:.8,pose:'jab',h:44},
  ppunch:{dur:24,a0:8,a1:12,reach:31,dmg:13,kd:.9,pose:'cross',h:44,step:3},
  charge:{reach:20,dmg:12,kd:1,h:40},
  bpunch:{dur:20,a0:6,a1:9,reach:34,dmg:10,stun:20,kb:1,pose:'jab',next:'bpunch2',h:46},
  bpunch2:{dur:26,a0:9,a1:12,reach:36,dmg:12,kd:1,pose:'cross',h:46,step:4},
  bcharge:{reach:24,dmg:16,kd:1.3,h:44},
  slam:{dmg:14,kd:1},
  mpunch:{dur:16,a0:4,a1:7,reach:30,dmg:6,stun:16,kb:.8,pose:'jab',h:44,step:3},
  phone:{dmg:6,stun:14,kb:.8,h:40},phone2:{dmg:12,kd:1,h:40},
  moto:{dmg:14,kd:1.2,h:30}
};
const E=(sty,hp,spd,name,pts,o)=>Object.assign({sty,hp,spd,team:1,name,pts,punch:'epunch',wind:13,reach:26},o||{});
const N=sty=>({sty,hp:1,spd:1.6,team:2});
const DEFS={
  ricardio:{sty:'ric1',hp:120,spd:1.32,team:0},
  patotero:E('patotero',28,.95,'PATOTERO',100,{wind:14}),patotero2:E('patotero2',30,1.0,'PATOTERO',120,{wind:12}),
  chorro:E('chorro',24,1.55,'CHORRO',140,{punch:'mpunch',wind:9,reach:30,ai:'hitrun'}),
  estibador:E('estibador',72,.72,'ESTIBADOR',350,{punch:'ppunch',wind:22,reach:31,heavy:1}),
  capanga:E('capanga',300,.9,'EL CAPANGA',5000,{boss:1}),
  hippie:E('hippie',24,1.05,'HIPPIE',160,{ai:'ranged',shot:'tomate',hold:'tomate'}),hippie2:E('hippie2',28,1.0,'HIPPIE',120,{wind:12}),
  disco:E('disco',32,1.12,'TRAVOLTA',180,{wind:10}),
  patovica:E('patovica',72,.72,'PATOVICA',350,{punch:'ppunch',wind:22,reach:31,heavy:1}),
  productor:E('productor',330,.9,'EL PRODUCTOR',5000,{boss:1,bthrow:'contrato'}),
  careta:E('careta',28,.95,'CARETA',100,{wind:14}),careta2:E('careta2',30,1.0,'CARETA',120,{wind:12}),
  tasador:E('tasador',30,1.05,'TASADOR',170,{ai:'ranged',shot:'papel',hold:'papel'}),
  movilero:E('movilero',30,1.5,'MOVILERO',140,{punch:'mpunch',wind:9,reach:30,ai:'hitrun',hold:'mic'}),
  vaciador:E('vaciador',350,.92,'EL VACIADOR',6000,{boss:1,hold:'gavel'}),
  politico:E('politico',34,.95,'POLÍTICO',220,{ai:'ranged',shot:'promesa'}),cipayo:E('cipayo',32,1.0,'VENDEPATRIA',170,{wind:11,hold:'papel'}),
  transa:E('transa',26,1.6,'TRANSA',150,{punch:'mpunch',wind:9,reach:30,ai:'hitrun'}),
  reptil:E('reptil',36,1.1,'LOBIZÓN',250,{wind:10}),
  reptilazo:E('reptilazo',420,.8,'MANDINGA',9000,{boss:1,bthrow:'baba',monster:1,summons:[['reptil','reptil'],['reptil','politico']]}),
  cuatrero:E('cuatrero',34,1.08,'CUATRERO',170,{wind:10}),
  bancario:E('bancario',28,1.1,'BANCARIO',180,{ai:'ranged',shot:'patacon',hold:'patacon'}),
  banquero:E('banquero',360,.9,'EL BANQUERO',6000,{boss:1,bthrow:'patacon'}),
  camara:E('camara',40,.85,'CAMARÓGRAFO',200,{ai:'cam',hold:'camera'}),
  influ:E('influ',26,1.1,'INFLUENCER',180,{ai:'ranged',shot:'phone',hold:'phone'}),
  agrimensor:E('agrimensor',34,1.05,'AGRIMENSOR',160,{wind:11}),
  loteador:E('loteador',380,.95,'EL LOTEADOR',7000,{boss:1,dozer:1}),
  viejo:N('viejo'),chofa:N('chofa'),carpo:N('carpo'),heavy:N('heavy'),vecina:N('vecina'),tornero:N('tornero'),jubilado:N('jubilado'),
  camionero:N('camionero'),anselmo:N('anselmo'),peon:N('peon'),reporter:N('movilero')
};
// Los capítulos de su vida. Los hechos de las tarjetas salen de su biografía y entrevistas; los diálogos homenajean sus canciones y dichos reales.
const LEVELS=[
 {LW:2600,skin:'ric1',song:'l1',bossSong:'bossRock',food:'mila',chap:'CAPÍTULO 1',truck:true,villains:'Patoteros, hippies caretas, chorros, estibadores y El Capanga del Abasto',title:'EL PAPERO',place:'CASEROS · 1978',hazard:'zorra',
  card:['Ricardo nació en Ciudadela (1962) y se crió en Caseros, hijo de Alfredo Iorio y Elda Pedraza (de sangre tehuelche).','Desde pibe ayudaba a su viejo en la verdulería y lo acompañaba al Mercado de Abasto a cargar papas.','Por ese trabajo le decían "el papero". En julio de 1978, viendo la película de Led Zeppelin en un cine de barrio, conoció al Chofa Moreno.'],
  npcs:[{kind:'viejo',x:250,y:198,face:1,hold:'mate'}],
  locks:[{trig:120,L:0,groups:[[['patotero','R'],['patotero','R']],[['patotero2','R'],['chorro','L']]]},
   {trig:640,L:560,groups:[[['patotero','R'],['hippie2','L'],['chorro','R']],[['estibador','R'],['hippie2','L']]]},
   {trig:1180,L:1100,train:true,groups:[[['chorro','R'],['patotero2','L'],['patotero','R']],[['estibador','L'],['chorro','R'],['patotero2','R']]],after:'rescue'},
   {trig:1820,L:1740,hazard:true,groups:[[['patotero','L'],['estibador','R'],['patotero2','R']],[['chorro','R'],['hippie','L'],['patotero','R'],['patotero2','L']]]},
   {boss:true,groups:[]}],
  rescue:{kind:'chofa',x:1420,y:192,hold:'gtr'},guns:[[700,'escopeta'],[1950,'escopeta']],
  props:[[380,'cajon','mila'],[470,'cajon','fruta'],[860,'tacho','mate'],[1500,'tacho','mila'],[1900,'cajon','fruta'],[2050,'tacho','mate']],pipe:[1460,240],
  intro:[{w:'viejo',s:'Ricardo, levantate que son las cuatro y el camión no espera. Hay que ir al Abasto a cargar las papas.'},
   {w:'ric1',s:'Ya voy, viejo. Mirá mis manos: de cargar cajones van a salir los callos para tocar el bajo.'},
   {w:'viejo',s:'Primero el lomo, hijo. Y cuidate del Capanga de la feria: les cobra peaje a los puesteros que vienen del Oeste.'},
   {w:'ric1',s:'Al que madruga para laburar no lo pisa ningún matón. Vamos con el camión.'}],
  rescueLines:[{w:'chofa',s:'¡Gracias, loco! Salía del cine de ver la película de Led Zeppelin y estos caretas me rodearon.'},{w:'ric1',s:'¿Vos también escuchás a Zeppelin y Black Sabbath? La guitarra criolla no se escucha arriba del ruido de un motor.'},
   {w:'chofa',s:'Soy el Chofa Moreno, toco la eléctrica. Armemos una banda pesada y rabiosa, pero cantando en nuestro idioma.'},{w:'ric1',s:'Termino de descargar con mi viejo y armamos V8. En castellano y bien al frente.'}],
  boss:'capanga',summons:[['patotero','patotero2'],['estibador','chorro']],
  bossLines:[{w:'capanga',s:'¿Así que vos sos el hijo de Alfredo, el papero de Caseros? Acá en el Abasto mandamos nosotros: o pagás peaje o no descargás.'},
   {w:'ric1',s:'Mi viejo se rompe el lomo desde la madrugada. No te voy a dar ni una papa podrida, parásito.'},
   {w:'capanga',s:'¡Muchachos! ¡Enséñenle al paperito quién manda en los galpones!'}],
  winLines:[{w:'capanga',s:'¡Pará, pibe, tenés la mano pesada! ¡Que tu viejo descargue tranquilo!'},{w:'ric1',s:'La pobreza no es no tener plata: es no superarse y vivir de apretar al que trabaja.'},{w:'viejo',s:'Bien parado, hijo. Los pibes del mercado cargan bolsas cuatro meses para comprarse una campera de cuero.'},{w:'ric1',s:'Ahora sí, viejo: con el Faim en el hombro me voy a Ciudadela a ensayar con el Chofa.'}],
  winSay:'¡ORGULLO DE LABURANTE!',
  quips:['¿Papero? ¡A mucha honra!','La criolla no se escucha arriba de un motor.','No se debe ser más de lo que uno es, ni menos de lo que uno vale.','Madrugar en el Abasto te enseña quién es quién.','Una papa no se regala: se transpira.','En Caseros se aprende a no agachar la cabeza.']},
 {LW:2600,skin:'ric2',song:'l2',bossSong:'bossRock',food:'chori',chap:'CAPÍTULO 2',villains:'Hippies pacifistas falsos, travoltas de boliche, patovicas y El Productor',title:'LUCHANDO POR EL METAL',place:'OBRAS · BA ROCK 1982',hazard:null,
  card:['En 1982, Pappo pidió que V8 y Los Violadores tocaran en el BA Rock IV; si no, Riff no iba.','Antes del festival, la policía detuvo a los V8 por su aspecto y los liberó unas dos horas después.','En las canchas de Obras, los hippies les tiraron naranjas y silbaron; V8 respondió con "Destrucción" a todo volumen.'],
  npcs:[{kind:'carpo',x:250,y:200,face:1}],
  locks:[{trig:120,L:0,groups:[[['hippie2','R'],['hippie2','R']],[['hippie','R'],['disco','L']]]},
   {trig:640,L:560,groups:[[['hippie','R'],['hippie2','L'],['disco','R']],[['patovica','R'],['hippie2','L'],['hippie','R']]]},
   {trig:1180,L:1100,groups:[[['disco','R'],['disco','L'],['hippie','R']],[['patovica','L'],['hippie2','R'],['hippie','R']]],after:'rescue'},
   {trig:1820,L:1740,groups:[[['hippie','L'],['patovica','R'],['disco','R']],[['hippie','R'],['hippie','L'],['disco','R'],['patovica','L']]]},
   {boss:true,groups:[]}],
  rescue:{kind:'heavy',x:1420,y:192},
  props:[[400,'tacho','chori'],[800,'tacho','mate'],[1500,'ampli','chori'],[1900,'ampli','mate'],[2050,'ampli','chori']],pipe:[1460,240],
  intro:[{w:'ric2',s:'Antes del festival nos metieron en cana por llevar campera de cuero y tachas.'},{w:'carpo',s:'Tranquilo, Ricardo. Ya les dije a los organizadores: si no toca V8, Riff tampoco toca.'},
   {w:'ric2',s:'Afuera está lleno de hippies pidiendo paz y amor mientras nos tiran cascotes y naranjas.'},
   {w:'carpo',s:'Ustedes suban, enchufen todo al taco y demuestren que las Brigadas Metálicas llegaron para quedarse.'}],
  rescueLines:[{w:'heavy',s:'¡Ricardo! Entre los patovicas y los chetos del festival me querían arrancar las tachas.'},{w:'ric2',s:'Cálmense, pibes, no rompan el lugar, que si no dicen que los pesados somos salvajes.'},
   {w:'heavy',s:'¡El productor del festival quiere cortarles el sonido! Dice que el heavy metal asusta a los sponsors.'},{w:'ric2',s:'A los falsos profetas del acusticazo se les terminó el recreo. Vamos al escenario.'}],
  boss:'productor',summons:[['disco','hippie2'],['patovica','hippie']],
  bossLines:[{w:'productor',s:'Mirá, pibe: acá mandan las radios y la paz hippie. Si no bajan los amplificadores y cantan algo suave, les corto los cables.'},
   {w:'ric2',s:'No vinimos a pedir permiso ni a disfrazarnos de buenitos. Venimos del Oeste y tocamos metal en criollo.'},
   {w:'productor',s:'¡Seguridad! ¡Saquen a estos enfermos del metal antes de que rompan el festival!'}],
  winLines:[{w:'productor',s:'¡Pará, loco! ¡Dejen los equipos prendidos, toquen lo que quieran!'},{w:'ric2',s:'Así se habla. Que se escuche desde Libertador hasta Caseros: ¡Luchando por el metal!'}],
  winSay:'¡BRIGADAS METÁLICAS!',
  quips:['¡Llegaron las Brigadas Metálicas!','Cálmense, no rompan nada, pero no se callen.','Fuerte, crudo y en castellano.','Gracias al Carpo hoy nos escuchan todos.']},
 {LW:2700,skin:'ric3',song:'l3',bossSong:'bossThrash',food:'pizza',chap:'CAPÍTULO 3',villains:'Caretas privatizadores, Doctores de la Ley, tasadores, transas y El Vaciador',title:'ÁCIDO ARGENTINO',place:'EL OESTE · 1991',hazard:'moto',
  card:['Con Hermética puso en letras la realidad del obrero, el conurbano y el desguace industrial de los años 90.','En 1991 editaron "Ácido argentino", con temas como "Gil trabajador", "Memoria de siglos" y "En las calles de Liniers".','En 1992 abrieron para Black Sabbath y para Motörhead en Obras Sanitarias.'],
  npcs:[{kind:'vecina',x:250,y:198,face:1}],
  locks:[{trig:120,L:0,groups:[[['careta','R'],['careta','R']],[['movilero','R'],['careta2','L']]]},
   {trig:660,L:580,hazard:true,groups:[[['careta','R'],['careta2','L'],['careta','R']],[['tasador','R'],['patovica','L'],['cipayo','R']]]},
   {trig:1080,L:1000,train:true,groups:[[['transa','R'],['movilero','L'],['tasador','R']],[['patovica','R'],['transa','L'],['cipayo','R']]],after:'rescue'},
   {trig:1720,L:1640,groups:[[['politico','L'],['cipayo','R'],['careta','R']],[['patovica','R'],['politico','L'],['reptil','R'],['cipayo','L']]]},
   {boss:true,groups:[]}],
  rescue:{kind:'tornero',x:1320,y:192},
  props:[[380,'tacho','pizza'],[860,'tacho','mate'],[1560,'tacho','pizza'],[1980,'cajon','mate'],[2140,'cajon','pizza']],pipe:[1360,240],
  intro:[{w:'vecina',s:'Ricardo, vaciaron la fábrica metalúrgica de la avenida. Vinieron los doctores de la ley a rematar los tornos.'},
   {w:'ric3',s:'Al que madruga en el taller lo llaman "gil trabajador", mientras ellos firman el vaciamiento de guante blanco.'},
   {w:'vecina',s:'Los obreros están bajo la lluvia cuidando las máquinas. Y andan punteros prometiendo bolsones.'},
   {w:'ric3',s:'Olvídalo y volverá por más si nos quedamos cruzados de brazos. Vamos para el galpón.'}],
  rescueLines:[{w:'tornero',s:'¡Ricardo! Treinta años frente al torno y este síndico me trató de descartable por defender el taller.'},
   {w:'ric3',s:'Miente el patrón y miente el diario: sin tus manos el país no arranca, hermano.'},
   {w:'tornero',s:'Adentro está El Vaciador, el Doctor de la Ley, con el martillo listo para vender todo por monedas.'},{w:'ric3',s:'Hoy el martillo se lo va a guardar en el portafolio.'}],
  boss:'vaciador',summons:[['cipayo','careta'],['politico','tasador']],
  bossLines:[{w:'vaciador',s:'Soy un Doctor de la Ley, honrado de hoy y de ayer. ¡Esta fábrica se cierra, se lotea y se vende al exterior!'},
   {w:'ric3',s:'Vos sos la máscara respetable del robo. Vaciás el esfuerzo de generaciones enteras.'},
   {w:'vaciador',s:'¡El obrero ya fue, melenudo! ¡Tasadores, ejecuten el desalojo!'},
   {w:'ric3',s:'La dignidad del laburante no entra en ningún remate.'}],
  winLines:[{w:'vaciador',s:'¡Basta, suspendo la subasta! ¡Dejo las escrituras en la mesa!'},{w:'ric3',s:'Que prendan los motores de nuevo. Y esta noche los espero a todos en Obras.'}],
  winSay:'¡MEMORIA DE SIGLOS!',
  quips:['El que labura no es ningún gil trabajador.','Olvídalo y volverá por más.','Doctor de la ley, disfrazado de señor.','Ácido argentino en las venas.']},
 {LW:2800,skin:'ric4',song:'l4',bossSong:'bossFolk',food:'empanada',chap:'CAPÍTULO 4',villains:'Políticos en campaña, bancarios del corralito, cuatreros y El Banquero',title:'PIEDRA LIBRE',place:'RUTAS DEL INTERIOR · 2001',hazard:'camion',
  card:['Con Almafuerte recorrió las rutas del país profundo junto a Claudio "Tano" Marciello.','Fusionó el metal pesado con la milonga, el tango y la poesía de Pedro B. Palacios y José Larralde.','En 2001, año de crisis y corralito, editó "Piedra libre" y grabó el vivo "En vivo Obras 2001".'],
  npcs:[{kind:'jubilado',x:250,y:198,face:1,hold:'cacerola'}],
  locks:[{trig:120,L:0,groups:[[['bancario','R'],['cuatrero','R']],[['politico','R'],['bancario','L'],['cuatrero','L']]]},
   {trig:660,L:580,groups:[[['cuatrero','R'],['patovica','L'],['bancario','R']],[['cuatrero','R'],['cuatrero','L'],['bancario','R']]]},
   {trig:1180,L:1100,hazard:true,groups:[[['cuatrero','R'],['bancario','L'],['cuatrero','R']],[['patovica','L'],['politico','R'],['cuatrero','R'],['transa','L']]],after:'rescue'},
   {trig:1920,L:1840,groups:[[['bancario','L'],['patovica','R'],['cuatrero','R']],[['cuatrero','R'],['reptil','L'],['patovica','R'],['bancario','R']]]},
   {boss:true,groups:[]}],
  rescue:{kind:'camionero',x:1440,y:192},
  props:[[400,'tacho','empanada'],[820,'cajon','mate'],[1520,'tacho','empanada'],[2000,'cajon','empanada'],[2160,'cajon','mate']],pipe:[1480,240],
  intro:[{w:'jubilado',s:'¡Don Ricardo! Cerraron las persianas del banco y se quedaron con la jubilación de toda mi vida.'},
   {w:'ric4',s:'A los de abajo les dan bonos de papel pintado, mientras ellos fugan los camiones de caudales.'},
   {w:'jubilado',s:'Encima en la ruta los del banco quieren embargar los camiones de cereal y el club donde toca Almafuerte.'},
   {w:'ric4',s:'Las aguas turbias suben esta vez, abuelo, pero al pueblo no lo van a dejar de rodillas.'}],
  rescueLines:[{w:'camionero',s:'¡Gracias, Ricardo! Me habían trabado el acoplado en la balanza con una orden judicial del banco.'},
   {w:'ric4',s:'El que mueve la ruta de sol a sol es el verdadero dueño de lo que produce.'},{w:'camionero',s:'El Banquero está en la sucursal de la rotonda contando dólares antes de escaparse en helicóptero.'}],
  boss:'banquero',summons:[['politico','bancario'],['patovica','politico']],
  bossLines:[{w:'banquero',s:'Señor Iorio, sus ahorros y la recaudación del club ahora son bonos serie Z. ¡Agradezca que le damos patacones!'},
   {w:'ric4',s:'Ustedes son usureros de traje: roban con una firma más que cien ladrones con revólver.'},
   {w:'banquero',s:'¡Custodios! ¡Repriman a la fila de ahorristas y cierren el tesoro!'}],
  winLines:[{w:'banquero',s:'¡No pegue más! ¡Ahí abro la bóveda y devuelvo peso por peso!'},{w:'ric4',s:'Devolvé lo de los viejos y abrí paso, que esta noche Almafuerte toca para todo el interior.'}],
  winSay:'¡PIEDRA LIBRE AL PUEBLO!',
  quips:['La tierra y el sudor no se embargan.','Pueblo por pueblo, ruta por ruta.','Las aguas turbias suben esta vez.','Sé vos, hermano: no te dejes comprar.']},
 {LW:2800,skin:'ric5',song:'l5',bossSong:'bossFolk',food:'asado',chap:'CAPÍTULO 5',villains:'Movileros amarillistas, influencers, agrimensores y El Loteador... o Mandinga',final:true,title:'TIERRA ADENTRO',place:'CORONEL SUÁREZ · 2023',hazard:'toro',ride:true,
  card:['Instalado tierra adentro en la pampa bonaerense, en Coronel Suárez, lejos del cemento.','Defendió siempre la amistad real cara a cara, la palabra empeñada y las raíces criollas y tehuelches.','En 2023 estaba de gira por el país con "Unas estrofas más". Murió el 24 de octubre de 2023 en Coronel Suárez, donde vivía.'],
  npcs:[{kind:'anselmo',x:214,y:198,face:-1,hold:'mate'},{kind:'reporter',x:560,y:232,face:-1,hold:'mic',hidden:true}],
  locks:[{trig:120,L:0,groups:[[['movilero','R'],['agrimensor','R']],[['influ','R'],['agrimensor','L']]]},
   {trig:660,L:580,hazard:true,groups:[[['agrimensor','R'],['cuatrero','L'],['movilero','R']],[['influ','R'],['patovica','L'],['agrimensor','R']]]},
   {trig:1180,L:1100,groups:[[['movilero','R'],['movilero','L'],['camara','R']],[['camara','R'],['reptil','L'],['hippie','R']]],after:'rescue'},
   {trig:1920,L:1840,hazard:true,groups:[[['influ','L'],['agrimensor','R'],['cuatrero','R']],[['reptil','R'],['camara','L'],['hippie','R'],['reptil','L']]]},
   {boss:true,groups:[]}],
  rescue:{kind:'peon',x:1440,y:192},
  props:[[380,'fardo','asado'],[860,'fardo','mate'],[1500,'fardo','asado'],[1990,'fardo','mate'],[2150,'fardo','asado']],pipe:[1480,240],
  intro:[{w:'anselmo',s:'Ricardo, se llenó el camino de ripio de camionetas de televisión, influencers con telefonito y agrimensores.'},
   {w:'ric5',s:'Yo me vine a vivir tierra adentro para vivir tranquilo, no para hacer circo.'},
   {w:'movilero',s:'¡Ricardo! ¡Estamos en directo! ¿Qué consejo le dejás a los pibes que te miran?',fx:'reporter'},
   {w:'ric5',s:'Que estudien, que trabajen y que abracen a sus padres hoy: porque el abrazo que no se dio, se llora.'},
   {w:'anselmo',s:'Y atrás viene El Loteador con una topadora: quiere desmontar el monte para hacer un country VIP.'},
   {w:'ric5',s:'Yo no soy un ídolo, soy un trabajador de la música. Pero mi pampa no la toca nadie.'}],
  rescueLines:[{w:'peon',s:'¡Don Ricardo! Me maniataron junto al molino porque no los dejé cortar el alambrado con la topadora.'},{w:'ric5',s:'Nadie es patrón de la naturaleza, compañero. Desátese que vamos juntos.'},
   {w:'peon',s:'El Loteador tiene ojos raros, don Ricardo... cuando habla huele a azufre quemado.'},{w:'ric5',s:'Ya me parecía que atrás de tanta codicia estaba el mismísimo Mandinga.'}],
  boss:'loteador',summons:[['agrimensor','reptil'],['camara','influ']],
  bossLines:[{w:'loteador',s:'¡Iorio! ¡Vendeme estas hectáreas y te pongo un monumento de plástico en la entrada del country!'},
   {w:'ric5',s:'Acá no llega el delivery ni el asfalto, y así queremos que siga. El horizonte no tiene dueño.'},
   {w:'loteador',s:'¡Por las buenas o bajo las orugas! ¡Arranquen la topadora!'}],
  monsterLines:[{w:'loteador',s:'¡Basta de este traje de ingeniero! ¡Conocé mi verdadera cara, cantor criollo!'},{w:'ric5',s:'Mandinga tenía que ser. Siempre escondido detrás del que compra y vende voluntades.'},
   {w:'reptilazo',s:'¡Entregame tu voz y tu nombre, Ricardo, y te hago rey de todas las pantallas del mundo!'},{w:'ric5',s:'Yo ya atesoré en los cielos y en el corazón de mi gente. ¡Volvete al pozo, demonio!'}],
  winLines:[{w:'ric5',s:'Se fue Mandinga con la cola entre las patas. Ni el oro ni el rating compran un alma libre.'},{w:'ric5',s:'Sé vos, nomás, y al mundo salvarás. Nunca se olviden de dónde vienen.'},
   {w:'ric5',s:'Prendan el fogón y preparen los equipos: nos quedan unas estrofas más por cantar en cada rincón de la Patria.'}],
  winSay:'¡UNAS ESTROFAS MÁS!',
  quips:['El abrazo que no se dio, se llora.','Sé vos, nomás, y al mundo salvarás.','Yo no soy un ídolo: soy un trabajador de la música.','La pobreza no es no tener plata, es no superarse.']}
];
for(const LV of LEVELS){const b=LV.locks[LV.locks.length-1];b.L=LV.LW-W;b.trig=b.L+80;}

/* ================= world state ================= */
let lvl=0,LV=LEVELS[0],skin='ric1',state='title',tick=0,cam={x:0},lockIdx=0,lock=null,ents=[],items=[],props=[],parts=[],bubbles=[],player=null,boss=null,npcs={};
let papas=8,papaT=0,stopT=0,shake=0,flashT=0,slowT=0,banner=null,goT=0,cut=null,introT=0,train=null,score=0,hiscore=0,lives=3,meter=0,combo=0,comboT=0,maxCombo=0,hitsTaken=0,timeF=0;
let lastHit=null,hpTrail=120,results=null,gameoverT=0,shots=[],hazard=null,quipDeck=[],unl=11,sel=0,endT=0,cardT=0,total=null;
const DIFFS=[
  {id:0,name:'FÁCIL',tag:'TRANQUI',sub:'PIBE DE BARRIO',col:'#64d872',desc:'-35% daño recibido, +35% pegada, enemigos calmos'},
  {id:1,name:'NORMAL',tag:'CLÁSICO',sub:'BRIGADA METÁLICA',col:'#f2b632',desc:'El equilibrio original y balanceado del juego'},
  {id:2,name:'DIFÍCIL',tag:'DESTRUCCIÓN',sub:'PESADO · +50% PTS',col:'#ff3b2a',desc:'+45% daño recibido, enemigos implacables, +50% puntaje'}
];
let diff=1;
try{diff=parseInt(localStorage.getItem('ricardio-diff')||'1')||1;}catch(e){}
function diffSet(d){diff=(d%3+3)%3;try{localStorage.setItem('ricardio-diff',diff);}catch(e){}const b=document.getElementById('bDiff');if(b){b.textContent='DIFICULTAD: '+DIFFS[diff].name;b.style.borderColor=DIFFS[diff].col;b.style.color=DIFFS[diff].col;}}
try{const sv=JSON.parse(localStorage.getItem('ricardio-v9')||'{}');hiscore=sv.hi||0;unl=11;}catch(e){}
function saveProg(){try{localStorage.setItem('ricardio-v9',JSON.stringify({hi:hiscore,unl}));}catch(e){}}
function mk(kind,x,y){const D=DEFS[kind];
  const hpMul=diff===0?(D.boss?.8:.85):diff===2?(D.boss?1.25:1.15):1;
  const cdMin=diff===0?45:diff===2?16:30,cdMax=diff===0?110:diff===2?50:80;
  return {kind,D,st:STY[D.sty],x,y,z:0,vx:0,vy:0,vz:0,face:-1,hp:Math.max(1,Math.round(D.hp*hpMul)),max:Math.max(1,Math.round(D.hp*hpMul)),state:'idle',t:0,pose:Object.assign({},PO.idle),
  team:D.team,flash:0,inv:0,hitList:new Set(),move:null,cd:rnd(cdMin,cdMax),engaged:false,armor:0,buf:0,walkPh:Math.random()*6,connected:false,homeY:rnd(GT+6,GB-6),slot:0,hold:D.hold||null,wdur:0,retreatT:0,barkT:0};}

// v14: un tema propio por capítulo y un primer nivel más intenso (más oleadas, enemigos más encima)

// v15: villanos de lo que él criticaba en canciones y reportajes
function v15Villains(){if(v15Villains.done)return;v15Villains.done=1;
  Object.assign(STY,{
    soho:{scale:.97,skin:'#ecc4a0',hair:'cap',capC:'#c86a3a',beard:true,beardC:'#6a4a2a',glasses:true,top:'#6a8a6a',shirt:'#d8ccb0',pants:'#2a3a5a',boots:'#e8e2d0',torsoW:9},
    poser:{scale:1.0,skin:'#e8b890',hair:'long',hairC:'#e8d070',top:'#1a1a1e',shirt:'#e8e8ea',pants:'#1a1a1e',boots:'#e8e8ea',torsoW:10,jacket:true},
    faran:{scale:1.02,skin:'#f0b890',hair:'slick',hairC:'#1a1418',top:'#c8a8d8',shirt:'#f2f2f2',tie:'#e83a8a',pants:'#c8a8d8',boots:'#f2f2f2',torsoW:10.5},
    vendido:{scale:1.0,skin:'#e0b08e',hair:'slick',hairC:'#3a2a20',glasses:true,top:'#e8e8ea',shirt:'#e8e8ea',pants:'#3a6ab8',boots:'#e8e8ea',torsoW:9.5},
    lagarto:{scale:1.02,skin:'#5e8e3e',hair:'bald',lizard:true,top:'#a8b0b8',shirt:'#d8dce0',pants:'#a8b0b8',boots:'#5a6068',torsoW:10.5},
    puntero:{scale:1.06,skin:'#d8a07a',hair:'short',hairC:'#2a1a10',stache:'#2a1a10',top:'#3a5a8a',shirt:'#e8e8ea',pants:'#2a2a30',boots:'#1a1a1e',torsoW:12,belly:true}});
  Object.assign(DEFS,{
    soho:E('soho',26,1.05,'TURISTA DE PALERMO SOHO',140,{wind:13}),
    poser:E('poser',30,1.1,'CARETA CON REMERA NUEVA',150,{wind:12,hold:'phone'}),
    faran:E('faran',30,1.4,'PANELISTA DE CHIMENTOS',170,{punch:'mpunch',wind:9,reach:30,ai:'hitrun',hold:'mic'}),
    vendido:E('vendido',28,1.0,'MÚSICO TRANSERO DE LA INDUSTRIA',150,{wind:12}),
    lagarto:E('lagarto',32,1.15,'REPTILOIDE DE LAS SIERRAS',230,{ai:'ranged',shot:'baba'}),
    puntero:E('puntero',40,.9,'PUNTERO DEL COMITÉ',200,{ai:'ranged',shot:'promesa'})});
  Object.assign(NAMES,{soho:'MODERNO DE PALERMO SOHO',poser:'POSER DE MODA',faran:'PANELISTA FARANDULERO',vendido:'MÚSICO VENDIDO',puntero:'PUNTERO POLÍTICO',lagarto:'REPTILOIDE ESPACIAL'});
  Object.assign(BARKS,{soho:['¡El campo es re aesthetic, gordo!','¿Tenés flat white con leche de almendras?','¡Qué vintage tu molino, boludo!'],
    poser:['¡Compré la remera en el shopping!','¿V8? ¿No es un motor de camioneta?','¡Sacame una selfie haciendo cuernitos!'],
    faran:['¡Decí algo polémico para el graph!','¡Necesito veinte puntos de rating!','¡Recortale esa frase que es viral!'],
    vendido:['¡El heavy ya fue, ahora rinde el pop!','¡Firmá con la multinacional y hacé playback!','¡Si no sonás en el boliche no existís!'],
    lagarto:['¡Venimosss de Ganímedesss!','¡Entregá las vacasss, terrícola!','¡Ssse nos cayó el plato en el cerro!','¡Sssomos el nuevo orden!'],
    puntero:['¡Subí al micro que pasan lista!','¡Votá la boleta entera y te doy una chapa!','¡Después de las elecciones vemos!']});
  Object.assign(DIEQ,{soho:'Andá a carpir la tierra en invierno y después hablamos.',poser:'El sentimiento pesado se lleva adentro, no en una etiqueta.',faran:'Con la honra de la gente no se hace rating.',
    vendido:'Prefiero comer pan duro antes que traicionar mi canción.',puntero:'Al pueblo se le da trabajo digno, no limosna.',lagarto:'En la pampa no mandan los bichos de otro planeta.'});
  const add=(i,k)=>{const L=LEVELS[i];if(!L)return;L.locks.forEach((l,j)=>{if(l.groups&&l.groups.length)l.groups[j%l.groups.length].push([k,j%2?'L':'R']);});};
  add(2,'vendido');add(3,'poser');add(4,'puntero');add(5,'poser');add(6,'vendido');add(7,'puntero');add(8,'soho');add(9,'faran');add(9,'soho');add(8,'lagarto');add(9,'lagarto');
  const vs=['','','Músicos vendidos, ','Posers, ','Punteros políticos, ','Posers, ','Músicos vendidos, ','Punteros políticos, ','Reptiloides de las sierras, modernos de Palermo Soho, ','Panelistas faranduleros, reptiloides, modernos de Palermo Soho, '];
  LEVELS.forEach((L,i)=>{if(vs[i])L.villains=vs[i]+L.villains.charAt(0).toLowerCase()+L.villains.slice(1);});}
function v14Levels(){v15Villains();if(v14Levels.done)return;v14Levels.done=1;LEVELS.forEach((L,i)=>{L.song='c'+i;L.bossSong=['b0','b0','b0','b2','b1','b1','b2','b1','b2','b2'][i];});
LEVELS[0].locks.forEach((l,i)=>{if(l.groups&&l.groups.length)l.groups.push(i%2?[['patotero','R'],['chorro','L'],['patotero2','R'],['estibador','L']]:[['chorro','R'],['patotero2','L'],['patotero','R']]);});}
function resetWorld(i,keep){v14Levels();lvl=i;truckDone=false;truck=null;modReset();datoT=0;dato=null;papas=diff===0?10:diff===2?5:8;papaT=0;LV=LEVELS[i];skin=LV.skin;buildLevel(i);
  ents=[];items=[];props=[];parts=[];bubbles=[];shots=[];hazard=null;quipDeck=[];cam.x=0;lockIdx=0;lock=null;stopT=0;shake=0;flashT=0;slowT=0;banner=null;goT=0;cut=null;train=null;
  if(!keep){score=0;lives=3;total={t:0,combo:0,hits:0};}meter=100;combo=0;comboT=0;maxCombo=0;hitsTaken=0;timeF=0;lastHit=null;results=null;song=LV.song;step=0;
  for(const l of LV.locks){l.g=0;l.mt=0;}
  player=mk('ricardio',-40,226);player.st=STY[skin];player.face=1;
  if(diff===0){player.hp=player.max=140;}else if(diff===2){player.hp=player.max=100;}
  hpTrail=player.hp;ents.push(player);boss=null;npcs={};
  for(const n of LV.npcs){const e=mk(n.kind,n.x,n.y);e.face=n.face;e.hold=n.hold||null;if(n.hidden)e.state='hidden';npcs[n.kind]=e;ents.push(e);}
  {const r=LV.rescue,e=mk(r.kind,r.x,r.y);e.face=1;e.state='tied';e.hold=r.hold||null;npcs.rescue=e;ents.push(e);}
  for(const [x,k,d] of LV.props)props.push({kind:k,x,y:k==='tacho'?192:194,hp:1,drop:d,flash:0});
  items.push({kind:'pipe',x:LV.pipe[0],y:LV.pipe[1],z:0,vz:0,t:0});guiReset();GUI.motoDone=0;if(LV.dyn==='campo')items.push({kind:'lombriz',x:1150,y:232,z:0,vz:0,t:0});for(const [gx,gk] of (LV.guns||[]))items.push({kind:gk,x:gx,y:226,z:0,vz:0,t:0});
}

// v9: los cinco capítulos nuevos, intercalados en orden cronológico
Object.assign(DEFS,{
  cana:E('cana',32,1.0,'AGENTE DE LA RAZZIA',150,{wind:12}),cana2:E('cana2',40,.9,'CABO DE CALLE',200,{punch:'ppunch',wind:18,reach:30}),
  buchon:E('buchon',24,1.1,'BUCHÓN DE COMISARÍA',160,{ai:'ranged',shot:'papel',hold:'papel'}),
  comisario:E('comisario',330,.9,'EL COMISARIO DE LA RAZZIA',5000,{boss:1,bthrow:'papel'}),
  cheto:E('cheto',26,1.0,'SNOB DE GALERÍA',110,{wind:13}),cheto2:E('cheto2',28,1.05,'CHETO DE RECOLETA',130,{wind:12}),
  critico:E('critico',24,1.05,'CRÍTICO ELITISTA',170,{ai:'ranged',shot:'papel',hold:'papel'}),
  curador:E('curador',340,.92,'EL CURADOR DE LA ÉLITE',5500,{boss:1,bthrow:'papel'}),
  revendedor:E('revendedor',26,1.6,'REVENDEDOR DE ENTRADAS',150,{punch:'mpunch',wind:9,reach:30,ai:'hitrun'}),
  seguridad:E('seguridad',76,.72,'PATOVICA ("TÚ ERES SU SEGURIDAD")',380,{punch:'ppunch',wind:22,reach:31,heavy:1}),
  empresario:E('empresario',360,.9,'EL EMPRESARIO DEL VACIAMIENTO',6000,{boss:1,bthrow:'contrato'}),
  barra:E('barra',32,1.5,'PUNTERO DE LA ESQUINA',160,{punch:'mpunch',wind:9,reach:30,ai:'hitrun'}),
  inspector:E('inspector',28,1.05,'INSPECTOR COIMERO',170,{ai:'ranged',shot:'papel',hold:'papel'}),
  clausurador:E('clausurador',360,.9,'EL CLAUSURADOR MUNICIPAL',6000,{boss:1,bthrow:'papel',hold:'gavel'}),
  cazador:E('cazador',36,1.05,'CAZADOR FURTIVO',190,{wind:11}),newage:E('newage',24,1.05,'FALSO GURÚ NEW AGE',150,{ai:'ranged',shot:'tomate',hold:'tomate'}),
  intendente:E('intendente',380,.9,'EL INTENDENTE ESPECULADOR',7000,{boss:1,bthrow:'promesa'}),
  violero:N('violero'),pelusa:N('pelusa'),pibe:N('pibe')
});
const L_STD=(g1,g2,g3,g4)=>[{trig:120,L:0,groups:g1},{trig:640,L:560,groups:g2},{trig:1180,L:1100,groups:g3,after:'rescue'},{trig:1820,L:1740,hazard:true,groups:g4},{boss:true,groups:[]}];
const NEWLEVELS={
 caseros79:{LW:2600,skin:'ricV',song:'l2',bossSong:'bossRock',food:'chori',villains:'La cana de la razzia, buchones de esquina y El Comisario que persigue el pelo largo',title:'NACE V8',place:'CIUDADELA · CASEROS 1979',hazard:'patrullero',
  card:['En 1979, tras pasar por Alarma y Comunión Humana, fundó V8 junto a su amigo Ricardo "Chofa" Moreno.','El nombre homenajeaba a los motores V8 y a los que fabricaban la riqueza en las fábricas del conurbano.','En plena dictadura, ser joven de barrio, usar pelo largo o cargar un instrumento era motivo de razzia policial.'],
  npcs:[{kind:'vecina',x:250,y:198,face:1}],
  locks:L_STD([[['cana','R'],['cana','R']],[['buchon','R'],['cana','L']]],[[['cana','R'],['buchon','L'],['cana2','R']],[['cana2','R'],['cana','L']]],
   [[['cana','R'],['cana','L'],['buchon','R']],[['cana2','L'],['buchon','R'],['cana','R']]],[[['cana','L'],['cana2','R'],['buchon','R']],[['cana','R'],['cana','L'],['cana2','R'],['buchon','L']]]),
  rescue:{kind:'violero',x:1420,y:192,hold:'gtr'},
  props:[[380,'tacho','chori'],[860,'tacho','mate'],[1500,'tacho','chori'],[1900,'cajon','fruta'],[2050,'tacho','mate']],pipe:[1460,240],
  intro:[{w:'vecina',s:'¡Ricardo! Escondé el bajo que anda el Falcon y el celular haciendo razzia en la estación.'},{w:'ricV',s:'No robamos ni le debemos nada a nadie, doña Nélida. Vamos a ensayar con V8.'},
   {w:'vecina',s:'Los buchones del barrio andan marcando en qué garaje se juntan los pibes de pelo largo.'},{w:'ricV',s:'Aunque nos persigan en cada esquina, este motor de ocho cilindros ya arrancó.'}],
  rescueLines:[{w:'violero',s:'¡Ricardo! Me pararon en la vía y me querían secuestrar la guitarra por "averiguación de antecedentes".'},{w:'ricV',s:'Para ellos un pibe de barrio con una viola es más peligroso que un ladrón de guante blanco.'},
   {w:'violero',s:'El Comisario bloqueó la cuadra con los patrulleros. Dice que nos va a rapar a todos en el calabozo.'},{w:'ricV',s:'Las ideas no se cortan con tijera. Vamos a abrir paso.'}],
  boss:'comisario',summons:[['cana','cana'],['cana2','buchon']],
  bossLines:[{w:'comisario',s:'¡Contra la pared, melenudo! Acá se terminó el ruidito: documentos, al celular y a pasar por la peluquería.'},{w:'ricV',s:'Nosotros trabajamos todo el día y de noche hacemos música. El miedo no nos va a callar.'},{w:'comisario',s:'¡Agentes! ¡Abran la celda y metan a este revoltoso!'}],
  winLines:[{w:'comisario',s:'¡Retírense, agentes! ¡Dejen pasar a los de la banda!'},{w:'ricV',s:'Esto recién empieza: muy pronto van a escuchar rugir a V8 en todo el país.'}],
  winSay:'¡V8 NO SE CALLA!',quips:['El pelo largo no es delito.','En los garajes del Oeste nace la historia.','Fuerte, rápido y en nuestro idioma.','Aunque nos lleven mil veces, vamos a seguir tocando.']},
 recoleta88:{LW:2600,skin:'ricH',song:'l3',bossSong:'bossThrash',food:'empanada',villains:'Chetos elitistas, críticos de suplemento y El Curador que desprecia al conurbano',title:'HERMÉTICA',place:'RECOLETA · SAN MARTÍN 1988',hazard:'auto',
  card:['Tras el fin de V8, en 1988 formó Hermética junto a Claudio O\'Connor, Antonio "Tano" Romano y Fabián Spataro.','El 6 de mayo de 1988 tocaron gratis al aire libre en el Centro Cultural Recoleta, y al día siguiente debutaron en Helloween (San Martín).','Frente al rock de plástico de las radios, Hermética trajo el thrash metal crudo con poesía social argentina.'],
  npcs:[{kind:'heavy',x:250,y:200,face:1}],
  locks:L_STD([[['cheto','R'],['cheto2','R']],[['critico','R'],['cheto','L']]],[[['cheto','R'],['critico','L'],['cheto2','R']],[['patovica','R'],['cheto','L']]],
   [[['cheto2','R'],['cheto','L'],['critico','R']],[['patovica','L'],['critico','R'],['cheto','R']]],[[['cheto','L'],['patovica','R'],['critico','R']],[['cheto2','R'],['cheto','L'],['critico','R'],['patovica','L']]]),
  rescue:{kind:'pibe',x:1420,y:192},
  props:[[400,'tacho','empanada'],[800,'tacho','mate'],[1500,'ampli','empanada'],[1900,'cajon','mate'],[2050,'ampli','empanada']],pipe:[1460,240],
  intro:[{w:'heavy',s:'Ricardo, los críticos de arte de Recoleta nos miran con asco porque vinimos en tren desde San Martín.'},{w:'ricH',s:'Que miren. Venimos a cantar verdades que en sus salones perfumados nunca se nombran.'},
   {w:'heavy',s:'Mañana debutamos en Helloween de San Martín, pero hoy el Curador quiere cerrarnos el patio.'},{w:'ricH',s:'Hermética está cerrada a la hipocresía, pero abierta de par en par para el pueblo.'}],
  rescueLines:[{w:'pibe',s:'¡Ricardo! Los de seguridad de la galería me echaron por tener las zapatillas gastadas y la tacha en el cinto.'},{w:'ricH',s:'Acá nadie vale por la marca de la ropa. Vení a la primera fila, hermano.'},
   {w:'pibe',s:'El Curador dice que el metal pesado es ruido de bárbaros y que hoy sólo entra gente VIP.'},{w:'ricH',s:'Vamos a enseñarle qué es la cultura popular.'}],
  boss:'curador',summons:[['cheto','cheto2'],['critico','patovica']],
  bossLines:[{w:'curador',s:'Disculpe, joven: esto es alta cultura subvencionada. Su ruido suburbano contamina nuestra estética.'},{w:'ricH',s:'La cultura nace del que sufre y trabaja, no del que toma champagne hablando en difícil.'},{w:'curador',s:'¡Críticos, custodios! ¡Desalojen a esta tribu del conurbano!'}],
  winLines:[{w:'curador',s:'¡Por favor, no toque mi foulard! ¡Tienen el escenario habilitado!'},{w:'ricH',s:'Hoy suena en Recoleta y mañana en San Martín: ¡somos Hermética!'}],
  winSay:'¡SOMOS HERMÉTICA!',quips:['Del conurbano al centro sin cambiar la cara.','Menos pose de galería y más verdad.','La cultura no es propiedad de cuatro snobs.','Desde el Oeste llega el vendaval.']},
 monumental94:{LW:2600,skin:'ricM',song:'l3',bossSong:'bossThrash',food:'chori',villains:'Revendedores, matones de valla ("Tú eres su seguridad") y El Empresario',title:'VÍCTIMAS DEL VACIAMIENTO',place:'MONUMENTAL · 1994',hazard:'carrito',
  card:['En 1994 Hermética alcanzó la masividad con "Víctimas del vaciamiento", denunciando la corrupción, el olvido del hospital público y los abusos de poder.','El disco incluye "Olvídalo y volverá por más". El título "Tú eres su seguridad", de su primer disco (1989), inspira a los matones de valla del capítulo.','A comienzos de septiembre de 1994 tocaron en el estadio de River, en el Monsters of Rock, junto a Black Sabbath, Kiss y Slayer.'],
  npcs:[{kind:'heavy',x:250,y:200,face:1}],guns:[[1500,'bersa']],
  locks:L_STD([[['revendedor','R'],['revendedor','R']],[['seguridad','R'],['revendedor','L']]],[[['revendedor','R'],['seguridad','L'],['transa','R']],[['seguridad','R'],['revendedor','L']]],
   [[['transa','R'],['revendedor','L'],['seguridad','R']],[['seguridad','L'],['revendedor','R'],['transa','R']]],[[['revendedor','L'],['seguridad','R'],['transa','R']],[['revendedor','R'],['revendedor','L'],['seguridad','R'],['transa','L']]]),
  rescue:{kind:'pibe',x:1420,y:192},
  props:[[400,'tacho','chori'],[800,'tacho','mate'],[1500,'ampli','chori'],[1900,'ampli','mate'],[2050,'ampli','chori']],pipe:[1460,240],
  intro:[{w:'heavy',s:'¡Ricardo, mirá las banderas del Oeste en todo River! Pero en los molinetes los de seguridad les están pegando a los pibes.'},{w:'ricM',s:'Como dice la canción: "Tú eres su seguridad". Le cuidan el bolsillo al empresario verdugueando a su propio hermano.'},
   {w:'heavy',s:'Encima el promotor quiere acortar el show de Hermética y quedarse con la plata de las entradas populares.'},{w:'ricM',s:'En River tocamos completo y a los pibes se los respeta.'}],
  rescueLines:[{w:'pibe',s:'¡Gracias, Ricardo! Junté monedas todo el mes en la obra y en la valla me fajaron entre tres patovicas.'},{w:'ricM',s:'Vení conmigo al campo, pibe: vos sos la razón por la que estamos arriba de ese escenario.'},
   {w:'pibe',s:'El Empresario está atrás de las torres de sonido cerrando el negocio con los revendedores.'},{w:'ricM',s:'Se le terminó el negocio con la pasión de la gente.'}],
  boss:'empresario',summons:[['seguridad','revendedor'],['revendedor','transa']],
  bossLines:[{w:'empresario',s:'Escuchame, Iorio: acá el dueño del circo soy yo. Tocás veinte minutos, hacés buena letra y firmás la exclusividad.'},{w:'ricM',s:'Vos ves billetes donde nosotros vemos almas. A la gente que vino caminando desde el Oeste no la estafa nadie.'},{w:'empresario',s:'¡Seguridad! ¡Saquen a este indio rebelde de mi estadio!'}],
  winLines:[{w:'empresario',s:'¡Pará, pará! ¡Abran los portones y que toquen todo el repertorio!'},{w:'ricM',s:'Que tiemble el Monumental. Y aunque pronto los caminos se separen, estas canciones quedan para siempre.'}],
  winSay:'¡AGUANTE LA HINCHADA METALERA!',quips:['"Tú eres su seguridad": no seas verdugo de tu hermano.','Que no te vacíen el bolsillo ni el alma.','El estadio lo llenan los trabajadores.','Jamás firmamos la rendición.']},
 cemento95:{LW:2600,skin:'ricA',song:'l4',bossSong:'bossFolk',food:'pizza',villains:'Punteros de esquina, inspectores coimeros y El Clausurador municipal',title:'MUNDO GUANACO',place:'BUENOS AIRES · 1995',hazard:'colectivo',
  card:['Tras la disolución de Hermética a fines del 94, Ricardo armó Almafuerte en 1995 junto al virtuoso guitarrista Claudio "Tano" Marciello.','Su disco debut, "Mundo guanaco", incluyó "El amasijo de un gran sueño", "Desencuentro", "Como los bueyes" y "Zamba de resurrección".','Tomó el nombre del poeta Pedro B. Palacios, que firmaba "Almafuerte", y empezó de cero junto a Marciello y Claudio Cardaci.'],
  npcs:[{kind:'heavy',x:250,y:200,face:1}],guns:[[1500,'bersa']],
  locks:L_STD([[['barra','R'],['transa','R']],[['inspector','R'],['barra','L']]],[[['barra','R'],['inspector','L'],['transa','R']],[['patovica','R'],['barra','L']]],
   [[['transa','R'],['barra','L'],['inspector','R']],[['patovica','L'],['inspector','R'],['barra','R']]],[[['barra','L'],['patovica','R'],['inspector','R']],[['transa','R'],['barra','L'],['inspector','R'],['reptil','L']]]),
  rescue:{kind:'violero',x:1420,y:192,hold:'gtr'},
  props:[[400,'tacho','pizza'],[800,'tacho','mate'],[1500,'cajon','pizza'],[1900,'tacho','mate'],[2050,'cajon','pizza']],pipe:[1460,240],
  intro:[{w:'heavy',s:'Ricardo, algunos decían que después de Hermética estabas terminado, y mirá la cola que hay bajo la lluvia en Constitución.'},{w:'ricA',s:'Del amasijo de un gran sueño nace otro más fuerte. Por eso nos llamamos Almafuerte, como el poeta.'},
   {w:'heavy',s:'Ojo que cayó el Clausurador municipal con sus inspectores: pide coima para levantar la faja de Cemento.'},{w:'ricA',s:'Con nosotros no hay sobre ni arreglo por atrás. Vamos a abrir esa puerta.'}],
  rescueLines:[{w:'violero',s:'¡Ricardo! Soy el Tano Marciello: los inspectores y los barras me querían retener la viola y los equipos en la esquina.'},{w:'ricA',s:'Quedate tranquilo, Tano: con lo que vos tocás vamos a unir el metal pesado con la milonga y el folclore.'},
   {w:'violero',s:'El Clausurador está pegando la faja en el portón de Cemento.'},{w:'ricA',s:'Esa faja le va a quedar de bufanda.'}],
  boss:'clausurador',summons:[['inspector','barra'],['transa','inspector']],
  bossLines:[{w:'clausurador',s:'Señor Iorio: el matafuegos está vencido, el volumen excede el código y todavía no vi ningún sobre arriba de mi carpeta.'},{w:'ricA',s:'El único código que conocemos es dar la cara frente a los pibes que pagaron su entrada.'},{w:'clausurador',s:'¡Inspectores! ¡Clausura definitiva y secuestro de instrumentos!'}],
  winLines:[{w:'clausurador',s:'¡Sello aprobado! ¡Adentro, adentro, que ya está habilitado!'},{w:'ricA',s:'Entrá, Tano, y pelá esos solos criollos. ¡Bienvenidos al Mundo Guanaco!'}],
  winSay:'¡MUNDO GUANACO!',quips:['Del amasijo de un gran sueño salimos de pie.','Con el Tano Marciello, pesado y bien criollo.','Al que vive de la coima no se le baja la cabeza.','Como decía Almafuerte: no te des por vencido ni aun vencido.']},
 sierras06:{LW:2600,skin:'ricT',song:'l5',bossSong:'bossFolk',food:'asado',villains:'Cazadores furtivos, falsos gurúes new age, lobizones y El Intendente',title:'TORO Y PAMPA',place:'SIERRA DE LA VENTANA · 2006',hazard:'jabali',
  card:['En 2006 Almafuerte lanzó "Toro y pampa", celebrando la vida campera, las rutas bonaerenses y la memoria de los amigos.','Le dedicó canciones a sus afectos, como "Pa\' Pelusa" (de "Trillando la fina", 2012), dedicada a un amigo de Mar del Plata.','Radicado lejos de la histeria urbana, reivindicó al hombre de campo y su sangre criolla e indígena.'],
  npcs:[{kind:'peon',x:250,y:198,face:1,hold:'mate'}],guns:[[700,'escopeta'],[1700,'escopeta']],
  locks:L_STD([[['cazador','R'],['newage','R']],[['agrimensor','R'],['cazador','L']]],[[['newage','R'],['cazador','L'],['reptil','R']],[['cazador','R'],['newage','L']]],
   [[['reptil','R'],['cazador','L'],['newage','R']],[['agrimensor','L'],['reptil','R'],['cazador','R']]],[[['cazador','L'],['reptil','R'],['newage','R']],[['reptil','R'],['cazador','L'],['newage','R'],['agrimensor','L']]]),
  rescue:{kind:'jubilado',x:1420,y:192},
  props:[[400,'fardo','asado'],[800,'fardo','mate'],[1500,'fardo','asado'],[1900,'fardo','mate'],[2050,'fardo','asado']],pipe:[1460,240],
  intro:[{w:'peon',s:'Don Ricardo, se metieron cazadores furtivos en la sierra y el Intendente quiere alambrar el arroyo para un loteo privado.'},{w:'ricT',s:'Se llenan la boca hablando de ecología y progreso, y vienen a destruir el monte.'},
   {w:'pelusa',s:'¡Acá llegó el Pelusa para darte una mano, hermano! Después armamos el asado bajo los eucaliptos.'},{w:'ricT',s:'Grande, Pelusa: la amistad verdadera vale más que todo el oro del mundo. Vamos.'}],pelusa:true,
  rescueLines:[{w:'jubilado',s:'¡Gracias, Ricardo! Los matones del municipio me ataron al poste porque no quise vender la servidumbre de paso del arroyo.'},{w:'ricT',s:'El agua y la sierra son de la tierra, don Tito, no de una inmobiliaria.'},
   {w:'jubilado',s:'El Intendente está en el galpón firmando la excepción municipal con los cazadores.'},{w:'ricT',s:'Vamos a vetarle esa ordenanza a mano limpia.'}],
  boss:'intendente',summons:[['cazador','newage'],['reptil','cazador']],
  bossLines:[{w:'intendente',s:'¡Pero Iorio, pensá en el negocio turístico! Un barrio náutico privado en el arroyo nos deja millones a todos.'},{w:'ricT',s:'El que vende el lugar donde nació su gente no merece pisar esta pampa.'},{w:'intendente',s:'¡Cazadores, custodios! ¡Saquen a este gaucho metido del expediente!'}],
  winLines:[{w:'intendente',s:'¡Rompo el decreto, Ricardo! ¡El arroyo y el cerro quedan libres para el pueblo!'},{w:'ricT',s:'Ahora sí, muchachos: descorchen el tinto y pongan la carne al asador. ¡Toro y pampa!'}],
  winSay:'¡TORO Y PAMPA!',quips:['Toro y pampa, firme en mi huella.','Con amigos como el Pelusa no hace falta nada más.','Mi madre tenía sangre tehuelche y la llevo con orgullo.','Lejos del cemento se escucha la voz del alma.']}
};
(function(){
  const order=[0,'caseros79',1,'recoleta88',2,'monumental94','cemento95',3,'sierras06',4];
  const dyn=[null,null,null,'ruta','campo'];
  const oldL=LEVELS.slice(),oldS=SCENES.slice();oldL.forEach((L,i)=>L.dyn=dyn[i]);
  LEVELS.length=0;SCENES.length=0;
  order.forEach((k,i)=>{const L=typeof k==='number'?oldL[k]:NEWLEVELS[k],S=typeof k==='number'?oldS[k]:SCENES2[k];L.chap='CAPÍTULO '+(i+1);LEVELS.push(L);SCENES.push(S);});
  for(const L of LEVELS){const b=L.locks[L.locks.length-1];b.L=L.LW-W;b.trig=b.L+80;}
  LEVELS[9].guns=[[900,'escopeta'],[1600,'bersa']];LEVELS[7].guns=[[1500,'escopeta']];LEVELS[4].guns=[[1500,'bersa']];
})();


/* ================= fighters logic ================= */
const alive=()=>ents.filter(e=>e.team===1&&e.state!=='dead'&&!e.gone);
function hittable(t){return !t.gone&&t.inv<=0&&!['fall','down','getup','dead','thrown'].includes(t.state)&&t.team!==2;}
function startMove(f,name){f.move=MOVES[name];f.mname=name;f.state='atk';f.t=0;f.hitList=new Set();f.connected=false;}
function knockdown(t,dir,pow){bardo(t);if(t.state==='grabbed'||t.grabbedBy)releaseGrab(t);if(t.state==='grab'&&t.grab)releaseGrab(t.grab);
  t.state='fall';t.t=0;t.vz=3.1*pow;t.vx=dir*2.2*pow;t.z=Math.max(t.z,1);t.bounce=true;t.move=null;t.hold&&t===player&&dropWeapon(t);}
function releaseGrab(e){const g=e.grabbedBy;if(g){g.grab=null;if(['grab','knee','hbutt','throw'].includes(g.state)){g.state='idle';}}e.grabbedBy=null;if(e.state==='grabbed'){e.state='idle';e.cd=40;}}
function dropWeapon(f){if(!f.hold||(f.hold!=='pipe'&&!GUNS[f.hold]))return;items.push({kind:f.hold,x:f.x,y:f.y,z:20,vz:2,t:0,ammo:f.ammo});f.hold=null;}
function spark(x,y,big){parts.push({k:'spark',x,y,t:0,max:big?14:10,big});parts.push({k:'ring',x,y,t:0,max:big?14:9,r:big?22:12});}
function dust(x,y,n){for(let i=0;i<(n||5);i++)parts.push({k:'dust',x:x+rnd(-8,8),y:y-rnd(0,4),vx:rnd(-.8,.8),vy:rnd(-.6,-.1),t:0,max:rnd(18,30)|0,r:rnd(2,4)});}
function floatTxt(x,y,s,c){parts.push({k:'txt',x,y,s,c:c||'#fff',t:0,max:50});}
function say(f,s,d){bubbles=bubbles.filter(b=>b.f!==f);bubbles.push({f,s,t:d||100});if(f&&f.team===1&&state==='play'&&/papero/i.test(s)){f.papeT=260;floatTxt(player.x,player.y-100,(lvl>=2?'¡TIRALE UN DISCO! (B)':'¡TIRALE UNA PAPA! (B)'),'#f2b632');if(papas<2)papas=2;sfx('blip');paperoRide(f);if(player&&f!==player&&comebackOK())setTimeout(()=>{if(state==='play')say(player,pick(PAPERO_INS),110);},700);}}
function applyHit(a,t,mv,dirOverride){
  if(!hittable(t))return;
  let dmg=mv.dmg;
  if(t===player){dmg=Math.max(1,Math.round(dmg*(diff===0?.65:diff===2?1.45:1)));}
  else if(a===player||a.thrownBy===player){dmg=Math.max(1,Math.round(dmg*(diff===0?1.35:diff===2?.9:1)));}
  t.hp-=dmg;t.flash=3;a.connected=true;
  stopT=Math.max(stopT,mv.kd?7:4);shake=Math.max(shake,mv.kd?4:2);
  const sx=t.x-(dirOverride||a.face)*6*t.st.scale,sy=t.y-t.z-(mv.h||40)*t.st.scale;hitFx(a,t,mv,sx,sy,mv.kd);
  sfx(mv.kd?'heavy':'punch');if(t.team===1&&Math.random()<.5)sfx('grunt');
  const dir=dirOverride||a.face;t.face=-dir;
  if(a===player||a.thrownBy===player){combo++;comboT=110;maxCombo=Math.max(maxCombo,combo);meter=Math.min(300,meter+dmg*1.7);score+=dmg*10;lastHit={e:t,t:160};
    if(player.hold==='pipe'&&mv.weapon){player.wdur--;if(player.wdur<=0){player.hold=null;for(let i=0;i<5;i++)parts.push({k:'deb',x:player.x+player.face*20,y:player.y-40,vx:rnd(-2,2),vy:rnd(-3,-1),t:0,max:40,c:'#9aa0a8',w:4,h:2});}}}
  if(t===player){hitsTaken++;combo=0;}
  if(t.grabbedBy)releaseGrab(t);
  const kd=mv.kd||t.hp<=0;
  if(t.D.boss&&t.hp>0){t.armor++;if(['bcharge','slam','slamj','taunt'].includes(t.state))return;if(!(mv.kd&&mv.kd>1)&&t.armor%4!==0)return;}
  if(kd)knockdown(t,dir,mv.kd||1);
  else{t.state='hurt';t.t=mv.stun||16;t.vx=dir*(mv.kb||.6);t.move=null;t.hurtAlt=Math.random()<.5;}
}
function hitCheck(a,mv){const s=a.st.scale,x0=a.x+a.face*6*s,x1=a.x+a.face*mv.reach*s,xmin=Math.min(x0,x1),xmax=Math.max(x0,x1);
  for(const t of ents){if(t.team===a.team||t.team===2||a.hitList.has(t)||!hittable(t))continue;if(Math.abs(t.y-a.y)>9)continue;if(Math.abs(t.z-a.z)>28)continue;
    const tw=9*t.st.scale;if(t.x+tw<xmin||t.x-tw>xmax)continue;a.hitList.add(t);applyHit(a,t,mv);}
  if(a.team===0)for(const p of props){if(p.hp<=0||a.hitList.has(p))continue;if(Math.abs(p.y-a.y)>14||p.x+10<xmin||p.x-10>xmax)continue;a.hitList.add(p);breakProp(p);}}
function breakProp(p){p.hp=0;sfx('break');shake=3;stopT=3;spark(p.x,p.y-16,false);const cj=p.kind==='cajon';for(let i=0;i<7;i++)parts.push({k:'deb',x:p.x,y:p.y-18,vx:rnd(-2.5,2.5),vy:rnd(-4,-1.5),t:0,max:45,c:cj?(i%2?'#8a5a2e':['#e07a1a','#c8322a','#4f8a3a'][i%3]):(i?'#6e7080':'#9aa0a8'),w:i?3:12,h:i?3:3});
  items.push({kind:p.drop,x:p.x,y:p.y+16,z:12,vz:2.6,t:0});score+=50;}
function commonUpdate(f){
  if(f.flash>0)f.flash--;if(f.inv>0)f.inv--;
  switch(f.state){
    case 'hurt':f.t--;f.x+=f.vx;f.vx*=.82;if(f.t<=0)f.state='idle';return true;
    case 'fall':case 'thrown':{f.t++;f.x+=f.vx;f.z+=f.vz;f.vz-=.28;
      if(f.state==='thrown'){for(const o of ents){if(o===f||o.team!==1||!hittable(o))continue;if(Math.abs(o.x-f.x)<16&&Math.abs(o.y-f.y)<10){o.hp-=10;o.flash=3;spark(o.x,o.y-30,true);sfx('heavy');knockdown(o,Math.sign(f.vx)||1,1);combo++;comboT=110;maxCombo=Math.max(maxCombo,combo);score+=100;}}}
      if(f.z<=0){f.z=0;if(f.bounce){f.vz=1.7;f.bounce=false;f.vx*=.45;f.z=.1;shake=Math.max(shake,2);sfx('land');dust(f.x,f.y,6);landFx(f);if(f.state==='thrown')f.state='fall';}else{f.state='down';f.t=0;f.vx=0;}}
      return true;}
    case 'down':f.t++;
      if(f.hp<=0){if(f===player){if(f.t===70)playerDied();}else if(f.D.boss){if(f.t===1)bossDefeated();}else if(f.t>46){f.state='dead';f.t=0;score+=f.D.pts;floatTxt(f.x,f.y-30,'+'+f.D.pts,'#f2b632');if(DIEQ[f.kind]&&Math.random()<.15&&!bubbles.some(b=>b.f===player))say(player,DIEQ[f.kind],120);}}
      else if(f.t>(f===player?34:44)){f.state='getup';f.t=0;}
      return true;
    case 'getup':f.t++;f.inv=Math.max(f.inv,4);if(f.t>18){f.state='idle';f.inv=f===player?50:20;f.cd=rnd(20,50);}return true;
    case 'dead':f.t++;if(f.t>40)f.gone=true;return true;
    case 'grabbed':{const g=f.grabbedBy;if(!g){f.state='idle';return true;}f.x=g.x+g.face*17*g.st.scale;f.y=g.y;f.face=-g.face;return true;}
  }
  return false;}
function bounds(f){f.y=clamp(f.y,GT,GB);if(f===player)f.x=clamp(f.x,cam.x+10,Math.min(cam.x+W-10,lock?lock.L+W-10:LW-10));}

/* ----- player ----- */
function updPlayer(f){if(rideTick(f))return;
  if(commonUpdate(f)){bounds(f);return;}
  const ix=(inp.right?1:0)-(inp.left?1:0),iy=(inp.down?1:0)-(inp.up?1:0);
  if(press.atk)f.buf=9;else if(f.buf>0)f.buf--;
  if(f.dcd>0)f.dcd--;
  switch(f.state){
    case 'idle':case 'walk':{
      if(press.spec){startSpecial(f);break;}
      if(press.papa){if(papas>0){f.state='papa';f.t=0;}else if(!f.say)say(f,'¡Sin papas!',40);break;}
      if(press.dodge&&!(f.dcd>0)){f.state='dodge';f.t=0;const d=ix||(-f.face);f.dvx=d*3.6;f.dvy=iy*1.6;if(ix)f.face=ix;f.dcd=24;sfx('whoosh');break;}
      if(press.jump){f.state='jump';f.vz=4.4;f.vx=ix*1.7;f.vy=iy*.9;f.jatk=false;f.hitList=new Set();sfx('jump');break;}
      if(f.buf>0){f.buf=0;const it=items.find(i=>(i.kind==='pipe'||GUNS[i.kind])&&i.z<=0&&Math.abs(i.x-f.x)<16&&Math.abs(i.y-f.y)<9);
        if(it&&!f.hold&&GUNS[it.kind]){pickGun(f,it);break;}
        if(it&&!f.hold){f.hold='pipe';f.wdur=12;it.gone=true;sfx('pickup');floatTxt(f.x,f.y-80,MEL().toUpperCase(),'#d6dbe2');break;}
        if(GUNS[f.hold]){fireGun(f);break;}if(f.run&&!f.hold){f.run=0;startMove(f,'rush');break;}startMove(f,f.hold==='pipe'?'pipe1':'jab');break;}
      if(ix)f.face=ix;
      const rk=runChk(f,ix);f.x+=ix*f.D.spd*rk;f.y+=iy*f.D.spd*.68;if(rk>1)f.walkPh+=.12;
      f.state=(ix||iy)?'walk':'idle';if(ix||iy)f.walkPh+=.21;
      if(ix){const e=ents.find(e=>e.team===1&&!e.D.boss&&['idle','walk','hurt','windup'].includes(e.state)&&Math.sign(e.x-f.x)===f.face&&Math.abs(e.x-f.x)<20*f.st.scale&&Math.abs(e.y-f.y)<5&&e.z<=0);
        if(e){f.state='grab';f.t=0;f.grab=e;f.knees=0;e.state='grabbed';e.grabbedBy=f;e.move=null;sfx('punch');}}
      for(const it of items){if(it.kind!=='pipe'&&!it.gone&&it.z<=0&&Math.abs(it.x-f.x)<14&&Math.abs(it.y-f.y)<9){if(guiPick(it,f)||lombrizPick(it,f))continue;it.gone=true;const Fd=FOOD[it.kind]||FOOD.mate;f.hp=Math.min(f.max,f.hp+Fd[2]);if(it.kind==='mate'){meter=Math.min(300,meter+80);say(f,'Un whisky y seguimos.',90);}if(it.kind==='fruta'&&Math.random()<.5)say(f,'Como la de mi viejo.',90);sfx('heal');floatTxt(f.x,f.y-80,Fd[0],Fd[1]);}}
      break;}
    case 'atk':{f.t++;const mv=f.move;if(f.t===mv.a0){sfx('whoosh');if(mv.step)f.x+=f.face*mv.step;}
      if(f.t>=mv.a0&&f.t<=mv.a1)hitCheck(f,mv);
      if(f.t>mv.a1&&f.buf>0&&f.connected&&mv.next){f.buf=0;startMove(f,mv.next);break;}
      if(f.t>=mv.dur){f.state='idle';f.move=null;}break;}
    case 'jump':f.x+=f.vx;f.y+=f.vy*.5;f.vz-=.25;f.z+=f.vz;
      if(f.buf>0&&!f.jatk){f.jatk=true;f.buf=0;sfx('whoosh');}
      if(f.jatk)hitCheck(f,MOVES.jkick);
      if(f.z<=0){f.z=0;f.state='land';f.t=0;sfx('land');dust(f.x,f.y,4);}break;
    case 'land':if(++f.t>6)f.state='idle';break;
    case 'dodge':f.t++;f.x+=f.dvx;f.y+=f.dvy;f.dvx*=.88;f.dvy*=.88;if(f.t<12)f.inv=Math.max(f.inv,2);if(f.t%3===0)parts.push({k:'ghost',x:f.x,y:f.y,face:f.face,pose:Object.assign({},f.pose),t:0,max:12,f});if(f.t>16)f.state='idle';break;
    case 'shoot':gunTick(f);break;
    case 'papa':f.t++;if(f.t===6){papas--;shots.push({x:f.x+f.face*12,y:f.y,z:34*f.st.scale,vx:f.face*5.5,owner:f,t:0,k:'papa',back:true});sfx('whoosh');}if(f.t>=16)f.state='idle';break;
    case 'spec':f.t++;f.inv=Math.max(f.inv,2);
      if(f.t===12){sfx('scream');flashT=6;shake=7;stopT=5;parts.push({k:'wave',x:f.x,y:f.y,t:0,max:26});
        for(const e of ents){if(e.team!==1||!hittable(e))continue;if(Math.abs(e.x-f.x)<90&&Math.abs(e.y-f.y)<30)applyHit(f,e,MOVES.spec,Math.sign(e.x-f.x)||1);}
        for(const p of props)if(p.hp>0&&Math.abs(p.x-f.x)<90&&Math.abs(p.y-f.y)<30)breakProp(p);}
      if(f.t>44)f.state='idle';break;
    case 'grab':{f.t++;const e=f.grab;if(!e||e.state!=='grabbed'){f.state='idle';f.grab=null;break;}
      if(f.t>120){releaseGrab(e);e.state='hurt';e.t=10;e.vx=f.face*1.5;break;}
      if(f.buf>0){f.buf=0;if(ix===-f.face){f.state='throw';f.t=0;}else if(f.knees<2){f.state='knee';f.t=0;f.knees++;}else{f.state='hbutt';f.t=0;}}
      if(press.jump){releaseGrab(e);f.state='jump';f.vz=4.4;f.vx=0;f.vy=0;f.jatk=false;}
      break;}
    case 'knee':{f.t++;const e=f.grab;if(f.t===6&&e){e.hp-=6;e.flash=3;spark(e.x,e.y-28*e.st.scale,false);sfx('punch');stopT=4;shake=2;combo++;comboT=110;maxCombo=Math.max(maxCombo,combo);meter=Math.min(300,meter+10);score+=60;lastHit={e,t:160};
        if(e.hp<=0){knockdown(e,f.face,1);}}
      if(f.t>=16){f.state=f.grab&&f.grab.state==='grabbed'?'grab':'idle';f.t=0;}break;}
    case 'hbutt':{f.t++;const e=f.grab;if(f.t===10&&e){releaseGrab(e);e.hp-=14;e.flash=3;e.state='idle';spark(e.x-f.face*3,e.y-48*e.st.scale,true);sfx('heavy');stopT=8;shake=5;combo++;comboT=110;maxCombo=Math.max(maxCombo,combo);meter=Math.min(300,meter+20);score+=150;floatTxt(e.x,e.y-70,'¡CABEZAZO CRIOLLO!','#f2b632');knockdown(e,f.face,1.1);}
      if(f.t>=24)f.state='idle';break;}
    case 'throw':{f.t++;const e=f.grab;if(f.t===13&&e){releaseGrab(e);e.state='thrown';e.t=0;e.vx=-f.face*3.8;e.vz=3.6;e.z=22;e.bounce=true;e.x=f.x-f.face*12;e.hp-=16;e.flash=3;e.thrownBy=f;e.face=f.face;sfx('heavy');shake=4;stopT=4;combo++;comboT=110;maxCombo=Math.max(maxCombo,combo);score+=200;}
      if(f.t>=30){f.state='idle';f.face=-f.face;}break;}
  }
  bounds(f);}
function startSpecial(f){if(sinBajo(f))return;if(meter>=100)meter-=100;else{if(f.hp<=12)return;f.hp-=12;}f.state='spec';f.t=0;f.inv=40;say(f,lvl>=8?'¡VOZARRÓN!':'¡BAJAZO!',50);songShot(f);}

/* ----- enemies ----- */
function updEnemy(e){
  if(commonUpdate(e)){e.y=clamp(e.y,GT,GB);return;}
  if(e.D.boss){updBoss(e);e.y=clamp(e.y,GT,GB);return;}
  const p=player;e.cd--;
  if(e.barkT>0&&--e.barkT===0&&BARKS[e.kind]&&Math.random()<.35&&!['hurt','fall','down'].includes(e.state)&&barkOK())say(e,pick(BARKS[e.kind]),80);
  const ai=e.D.ai;
  switch(e.state){
    case 'idle':case 'walk':{
      if(p.hp<=0||state!=='play'){e.state='idle';break;}
      const dx=p.x-e.x,dy=p.y-e.y,sd=dx<0?-1:1;e.face=sd;
      let tx,ty;if(e.engaged){tx=p.x-sd*(24*e.st.scale+6);ty=p.y;}else{tx=p.x-sd*(78+e.slot*22);ty=e.homeY;}
      if(ai==='ranged'){tx=p.x-sd*(Math.abs(dx)<70?150:115);ty=p.y+(e.slot%2?6:-6);
        if(e.cd<=0&&Math.abs(dy)<12&&Math.abs(dx)>45&&Math.abs(dx)<230){e.state='throwp';e.t=0;break;}}
      if(ai==='cam'){tx=p.x-sd*105;ty=p.y;
        if(e.cd<=0&&Math.abs(dy)<16&&Math.abs(dx)<210&&Math.abs(dx)>40){e.state='aim';e.t=0;if(Math.random()<.5)say(e,pick(['¡Sonreí, Ricardio!','¡Mirá a cámara!','¡Estamos al aire!']),60);break;}}
      if(e.retreatT>0){e.retreatT--;tx=p.x-sd*140;ty=e.homeY;}
      if(lock)tx=clamp(tx,lock.L+14,lock.L+W-14);
      const mx=tx-e.x,my=ty-e.y,d=Math.hypot(mx,my);
      if(d>3){const sp=e.D.spd*(e.spdK||1);e.x+=mx/d*sp;e.y+=my/d*sp*.62;e.state='walk';e.walkPh+=.2;}else e.state='idle';
      if(e.engaged&&Math.abs(dx)<e.D.reach*e.st.scale+6&&Math.abs(dy)<7&&e.cd<=0&&hittable(p)){e.state='windup';e.t=0;}
      else if(e.D.heavy&&e.cd<=0&&Math.abs(dx)>130&&Math.abs(dy)<14&&Math.random()<.02){e.state='ctele';e.t=0;say(e,'¡VENÍ!',50);}
      break;}
    case 'windup':e.t++;if(e.t>=e.D.wind)startMove(e,e.D.punch);break;
    case 'atk':{e.t++;const mv=e.move;if(e.t===mv.a0){sfx('whoosh');if(mv.step)e.x+=e.face*mv.step;}if(e.t>=mv.a0&&e.t<=mv.a1)hitCheck(e,mv);if(e.t>=mv.dur){e.state='idle';e.move=null;e.cd=rnd(55,110)*(lvl===0?.9:1);if(ai==='hitrun'){e.retreatT=80;e.cd=rnd(90,130);}}break;}
    case 'throwp':e.t++;if(e.t===14){shots.push({k:e.D.shot,x:e.x+e.face*10,y:e.y,z:40*e.st.scale,vx:e.face*3.1,owner:e,t:0});sfx('whoosh');}if(e.t>=30){e.state='idle';e.cd=rnd(100,150);}break;
    case 'aim':e.t++;if(e.t===46){parts.push({k:'camflash',x:e.x+e.face*14,y:e.y-50*e.st.scale,t:0,max:16});sfx('break');
        const look=Math.sign(e.x-p.x)===p.face;
        if(hittable(p)&&look&&Math.abs(p.y-e.y)<22&&Math.abs(p.x-e.x)<230&&!['dodge','spec','jump'].includes(p.state)){releaseGrab&&p.grab&&releaseGrab(p.grab);p.grab=null;p.state='hurt';p.t=48;p.vx=0;p.dazed=60;floatTxt(p.x,p.y-90,'¡ENCANDILADO!','#fff6d8');combo=0;}}
      if(e.t>=62){e.state='idle';e.cd=rnd(160,230);}break;
    case 'ctele':e.t++;if(e.t%6<3)e.flash=1;if(e.t>28){e.state='charge';e.t=0;e.vx=e.face*3.6;e.hitList=new Set();}break;
    case 'charge':e.t++;e.x+=e.vx;hitCheck(e,MOVES.charge);if(e.t%4===0)dust(e.x-e.face*10,e.y,1);if(e.t>50||(lock&&(e.x<lock.L+8||e.x>lock.L+W-8))){e.state='idle';e.cd=100;}break;
  }
  e.y=clamp(e.y,GT,GB);}
function assignEngage(){const list=ents.filter(e=>e.team===1&&!e.D.boss&&e.D.ai!=='ranged'&&e.D.ai!=='cam'&&['idle','walk','windup','atk'].includes(e.state)).sort((a,b)=>Math.abs(a.x-player.x)-Math.abs(b.x-player.x));
  let slot=0;list.forEach((e,i)=>{const was=e.engaged;e.engaged=i<(lvl===0?3:2);if(!e.engaged)e.slot=slot++;if(e.engaged&&!was)e.cd=Math.max(e.cd,20);});}

/* ----- boss ----- */
function updBoss(b){const p=player;b.cd--;
  const dx=p.x-b.x,dy=p.y-b.y,sd=dx<0?-1:1;
  if(!b.sum1&&b.hp<b.max*.66){b.sum1=true;b.state='taunt';b.t=0;}
  else if(!b.sum2&&b.hp<b.max*.33){b.sum2=true;b.state='taunt';b.t=0;}
  switch(b.state){
    case 'idle':case 'walk':{if(p.hp<=0){b.state='idle';break;}b.face=sd;
      if(b.cd<=0){if(Math.abs(dx)<48&&Math.abs(dy)<8){startMove(b,'bpunch');break;}
        if(b.D.bthrow&&Math.abs(dx)>90&&Math.abs(dy)<16&&Math.random()<.5){b.state='bthrow';b.t=0;say(b,b.D.bthrow==='patacon'?'¡TOMÁ, PATACONES!':b.D.bthrow==='baba'?'¡LUZ MALA!':'¡FIRMÁ ESTO!',50);break;}
        const r=Math.random();if(r<.45&&Math.abs(dy)<26){b.state='ctele';b.t=0;b.ty=p.y;say(b,b.D.dozer?'¡PRENDAN LA TOPADORA!':'¡TE PASO POR ARRIBA!',60);break;}
        if(r<.75){b.state='slamj';b.t=0;b.tx=p.x;b.ty=p.y;b.sx=b.x;b.sy=b.y;say(b,b.kind==='vaciador'?'¡VENDIDO!':'¡ACÁ MANDO YO!',50);break;}
        b.cd=40;}
      const tx=p.x-sd*34,ty=p.y,mx=tx-b.x,my=ty-b.y,d=Math.hypot(mx,my);
      if(d>4){b.x+=mx/d*b.D.spd;b.y+=my/d*b.D.spd*.6;b.state='walk';b.walkPh+=.16;}else b.state='idle';break;}
    case 'atk':{b.t++;const mv=b.move;if(b.t===mv.a0){sfx('whoosh');if(mv.step)b.x+=b.face*mv.step;}if(b.t>=mv.a0&&b.t<=mv.a1)hitCheck(b,mv);
      if(b.t>mv.a1&&mv.next&&b.t>=mv.dur-4){startMove(b,mv.next);break;}if(b.t>=mv.dur){b.state='idle';b.move=null;b.cd=rnd(50,90);}break;}
    case 'ctele':b.t++;b.y+=(b.ty-b.y)*.08;if(b.t%6<3)b.flash=1;if(b.t>34){b.state='bcharge';b.t=0;b.vx=b.face*4.4;b.hitList=new Set();}break;
    case 'bcharge':b.t++;b.x+=b.vx;hitCheck(b,MOVES.bcharge);if(b.t%3===0)dust(b.x-b.face*14,b.y,2);
      if(b.x<lock.L+20||b.x>lock.L+W-20){b.x=clamp(b.x,lock.L+20,lock.L+W-20);b.state='hurt';b.t=30;b.vx=-b.face*1.5;shake=6;sfx('heavy');dust(b.x+b.face*16,b.y,10);b.cd=40;}break;
    case 'slamj':b.t++;{const k=Math.min(1,b.t/40);b.x=b.sx+(b.tx-b.sx)*k;b.y=b.sy+(b.ty-b.sy)*k;b.z=Math.sin(k*Math.PI)*70;
      if(b.t>=40){b.z=0;b.state='slam';b.t=0;shake=9;stopT=4;sfx('heavy');dust(b.x,b.y,14);parts.push({k:'wave',x:b.x,y:b.y,t:0,max:22,col:'255,190,120'});
        if(hittable(p)&&Math.abs(p.x-b.x)<70&&Math.abs(p.y-b.y)<24&&p.z<6){applyHit(b,p,MOVES.slam,Math.sign(p.x-b.x)||1);}}}break;
    case 'slam':b.t++;if(b.t>30){b.state='idle';b.cd=rnd(40,70);}break;
    case 'taunt':b.t++;if(b.t===2){say(b,b.sum2?'¡TODOS CONTRA ÉL!':'¡MUCHACHOS!',80);}if(b.t===30){const S=(b.D.summons||LV.summons)[b.sum2?1:0];spawnEnemy(S[0],'L');spawnEnemy(S[1],'R');}if(b.t>60){b.state='idle';b.cd=60;}break;
    case 'bthrow':b.t++;if(b.t===18||b.t===32){shots.push({k:b.D.bthrow,x:b.x+b.face*16,y:b.y,z:46*b.st.scale,vx:b.face*3.4,owner:b,t:0});sfx('whoosh');}if(b.t>=46){b.state='idle';b.cd=rnd(40,70);}break;
  }}
function bossDefeated(){slowT=110;flashT=10;sfx('heavy');score+=boss.D.pts;for(const e of ents)if(e.team===1&&e!==boss&&e.hp>0){e.hp=0;knockdown(e,Math.sign(e.x-player.x)||1,1);}}

/* ================= spawning & locks ================= */
function spawnEnemy(kind,side){const L=lock?lock.L:cam.x,x=side==='R'?L+W+22:L-22,e=mk(kind,x,rnd(GT+4,GB-4));e.face=side==='R'?-1:1;e.hp=e.max=Math.round(e.hp*(1+lvl*.05));e.spdK=1+lvl*.035;e.cd=rnd(40,90)*(1-lvl*.03);e.barkT=rnd(30,160)|0;e.slot=ents.length;ents.push(e);return e;}
const pick=a=>a[Math.random()*a.length|0];
const BARKS={
  patotero:['¡Eh, papero de Caseros!','¡Melenudo, largá los cajones!','¡Acá en el Abasto se paga peaje!','¡Esta vereda tiene dueño, pibe!'],patotero2:['¡Volvé a la verdulería, papero!','¡Cortate esa porra, sucio!','¡A descargar bolsas, gil!'],chorro:['¡Largá la recaudación del camión!','¡Dejá el bajo y rajá!'],estibador:['¡Te revoleo como bolsa de papa!'],
  hippie:['¡Paz y amor... tomá este naranjazo!','¡Fuera los pesados del BA Rock!','¡Canten bajito y con flauta!'],hippie2:['¡El metal es ruido de salvajes!','¡Silben a esos camperas negras!'],disco:['¡El rock ya fue, aguante el boliche!','¡Ponete brillantina, nene!'],patovica:['¡De acá no pasás con tachas!'],
  careta:['¡Sos un gil trabajador!','¡Firmá el retiro voluntario!'],careta2:['¡Privatizamos hasta el aire!','¡Achicamos el taller, viejo!'],tasador:['¡Lote uno: el torno del abuelo!','¡Remato la fábrica por monedas!'],
  movilero:['¡Danos un título escandaloso, Ricardo!','¡Contate un chisme para el prime time!','¡Mirá a cámara y enojate!'],
  cuatrero:['¡Cortamos el alambre y arriamos todo!','¡En esta ruta mandamos nosotros!'],bancario:['¡Sus ahorros quedaron en el corralito!','¡Acá tiene patacones, abuelo!','¡Golpee la persiana todo lo que quiera!'],
  reptil:['¡Auuuuu!','¡Noche de séptimo hijo varón!','¡El lobizón anda suelto en el monte!'],politico:['¡Soy el doctor de la ley, votame!','¡Prometo asfalto y trabajo para todos!','¡Olvídalo y volveré por más!'],cipayo:['¡Lo nacional no sirve para nada!','¡Vendamos la tierra en dólares!'],transa:['¡Probá esto y olvidate de luchar!','¡Te vendo el viaje más corto, pibe!'],
  influ:['¡Hacé un bailecito para las redes!','¡Todo por un millón de views!','¡No existís si no estás en tendencia!'],camara:['¡Zoom a la cara, que esto mide!'],agrimensor:['¡Acá tiramos abajo el monte para el country!','¡Correte que pasa la topadora!']};
const DIEQ={influ:'Yo nunca chateé con nadie: yo tengo amigos de verdad.',camara:'Apagá esa cámara y hablá mirando a los ojos.',hippie:'Pedían paz y amor y nos tiraban cascotes.',bancario:'Devolvele el sudor de toda la vida a los jubilados.',tasador:'El trabajo de un barrio no entra en tu carpeta.',politico:'Doctor de la ley: olvídalo y volverá por más.',cipayo:'Al que reniega de su tierra ni el viento lo respeta.',transa:'La falopa vino a estupidizar al pibe que piensa.',reptil:'Volvete al monte, bicho de la noche.'};
function quip(){if(!quipDeck.length)quipDeck=LV.quips.slice().sort(()=>Math.random()-.5);return quipDeck.pop();}
const HZ={moto:{spd:7,w:22,warn:'¡MOTOCHORRO!',snd:'moto'},zorra:{spd:5,w:22,warn:'¡CARRO DE PAPAS!',snd:'moto'},camion:{spd:6.5,w:56,warn:'¡CAMIÓN EN LA RUTA!',snd:'truck'},toro:{spd:5.5,w:26,warn:'¡SE ESCAPÓ EL TORO!',snd:'toro'}};
function updHazard(){
  if(lock&&lock.hazard&&LV.hazard&&!hazard&&(lock.mt=(lock.mt||0)+1)%300===150){const dir=Math.random()<.5?1:-1;hazard={k:LV.hazard,t:0,dir,y:clamp(player.y+rnd(-6,6),GT+6,GB-4),x:dir>0?lock.L-80:lock.L+W+80,hit:new Set()};floatTxt(lock.L+W/2,GT-20,HZ[LV.hazard].warn,'#ff5a3a');}
  if(!hazard)return;const h=hazard,Z=HZ[h.k];h.t++;
  if(h.t===50)sfx(Z.snd);
  if(h.t>50){h.x+=h.dir*Z.spd;const att={face:h.dir,team:3,st:{scale:1},connected:false};
    for(const e of ents){if(e.team===2||h.hit.has(e)||!hittable(e)||e.z>14)continue;if(Math.abs(e.y-h.y)<10&&Math.abs(e.x-h.x)<Z.w){h.hit.add(e);applyHit(att,e,MOVES.moto,h.dir);if(e.team===1){score+=150;floatTxt(e.x,e.y-70,'¡ATROPELLADO!','#f2b632');}}}
    if(h.t%3===0)dust(h.x-h.dir*20,h.y,1);
    if((h.dir>0&&h.x>cam.x+W+120)||(h.dir<0&&h.x<cam.x-120))hazard=null;}}
function updShots(){for(const s of shots){s.t++;s.x+=s.vx;if(s.vy)s.y+=s.vy;if(s.vz!=null){s.z=Math.max(4,s.z+s.vz);s.vz-=.06;}if(s.t>(s.life||150))s.gone=true;
  if(!s.back&&player.state==='atk'&&player.move&&player.t>=player.move.a0&&player.t<=player.move.a1+2&&Math.sign(s.x-player.x)===player.face&&Math.abs(s.x-player.x)<34&&Math.abs(s.y-player.y)<10){s.back=true;s.vx=-s.vx*1.4;spark(s.x,s.y-s.z,false);sfx('punch');floatTxt(s.x,s.y-70,'¡DEVUELTO!','#9fd0ff');score+=50;}
  if(s.back){for(const e of ents){if(e.team!==1||!hittable(e)||(s.hit&&s.hit.has(e)))continue;const fr=s.k==='frase',pp=s.k==='papa';if(Math.abs(e.y-s.y)<(fr?16:pp?14:10)&&Math.abs(e.x-s.x)<(fr?30:pp?18:12)*e.st.scale){const tg=pp&&e.papeT>0;applyHit(player,e,tg?MOVES.buck:(s.mv||MOVES.phone2),Math.sign(s.vx));if(tg){e.papeT=0;score+=500;papas=Math.min(8,papas+1);shake=Math.max(shake,5);floatTxt(e.x,e.y-90,(lvl>=2?'¡DISCAZO AL QUE DIJO PAPERO! +500':'¡PAPAZO AL QUE DIJO PAPERO! +500'),'#ffe08a');say(player,pick(['¡Tomá, papa!','¿Papero? ¡Con orgullo!','¡Esta es de las buenas!']),80);}if(s.hit)s.hit.add(e);else s.gone=true;if(s.k==='tomate')splat(s.x,s.y-s.z);if(s.k==='bala'||s.k==='perdigon')spark(s.x,s.y-s.z,false);if(s.k==='piedra'&&Math.random()<.3)floatTxt(e.x,e.y-70,'¡PIEDRAZO!','#9fd0ff');break;}}}
  else if(hittable(player)&&player.z<30&&Math.abs(player.y-s.y)<8&&Math.abs(player.x-s.x)<10){applyHit(s.owner,player,MOVES.phone,Math.sign(s.vx));s.gone=true;if(s.k==='tomate')splat(s.x,s.y-s.z);}}
  shots=shots.filter(s=>!s.gone);}
function splat(x,y){for(let i=0;i<6;i++)parts.push({k:'deb',x,y,vx:rnd(-2,2),vy:rnd(-3,-.5),t:0,max:30,c:'#d8322a',w:3,h:3});}
function updLocks(){
  if(!lock&&lockIdx<LV.locks.length&&player.x>LV.locks[lockIdx].trig&&state==='play'){lock=LV.locks[lockIdx];lock.g=0;lock.mt=0;goT=0;if(lock.alvear)banner={a:'¡SALIDA DEL ALVEAR!',b:'FINES DE 1982 · LA CANA EN LA PUERTA',t:150,boss:false};
    if(lock.boss){startBossCut();return;}
    lock.groups[0].forEach(([k,s])=>spawnEnemy(k,s));
    if(lock.train&&!train){train={x:lock.L+W+60,t:0};sfx('train');}}
  if(lock&&!lock.boss){const n=alive().length;
    if(lock.g<lock.groups.length-1&&n<=(lvl===0?2:1)){lock.g++;if(lvl===0)floatTxt(player.x,player.y-96,pick(['¡VIENEN MÁS!','¡LA PATOTA ENTERA!','¡OTRA TANDA!']),'#ff6a4a');lock.groups[lock.g].forEach(([k,s])=>spawnEnemy(k,s));}
    else if(lock.g>=lock.groups.length-1&&n===0){const after=lock.after;lock=null;lockIdx++;goT=200;sfx('go');hazard=null;if(after==='rescue')startRescueCut();else if(Math.random()<.4&&!bubbles.some(b=>b.f===player))say(player,quip(),170);}}}

/* ================= cutscenes ================= */
function startCut(lines,onEnd){bubbles=[];cut={lines,i:0,ch:0,onEnd};state='cut';}
function startChapter(i,keep){resetWorld(i,keep);if(cineStart())return;state='card';cardT=0;}
function startIntro(){state='intro';introT=0;if(LV.ride)sfx('moto');}
function afterIntro(){state='play';if(LV.pelusa&&!ents.some(e=>e.ally)){const p=mk('pelusa',player.x-50,player.y+6);p.ally=true;p.face=1;p.cd=60;ents.push(p);}for(const k in npcs){const n=npcs[k];if(n===npcs.rescue)continue;if(n.kind==='reporter'){if(n.state!=='hidden')n.state='runoff';}else n.state='walkoff';}
  banner={a:LV.chap,b:LV.title,t:150};}
function updIntro(){introT++;const p=player;
  if(LV.ride){const k=Math.min(1,introT/120),e=1-Math.pow(1-k,3);p.mx=-130+e*240;
    if(introT<=130){p.x=p.mx+2;p.state='ride';p.face=1;p.z=12;}
    if(introT===130){p.state='idle';p.z=0;p.x=p.mx+20;p.y=238;dust(p.x,p.y,6);sfx('land');}
    if(introT===150)startCut(LV.intro,afterIntro);}
  else{if(introT<=90){p.x=-30+introT*1.55;p.y=226;p.state='walk';p.walkPh+=.21;p.face=1;}
    if(introT===91)p.state='idle';
    if(introT===110)startCut(LV.intro,afterIntro);}}
function startRescueCut(){const f=npcs.rescue;startCut(LV.rescueLines,()=>{state='play';f.state='runoff';f.face=-1;say(player,quip(),150);});}
function startBossCut(){boss=mk(LV.boss,LW-80,224);boss.face=-1;ents.push(boss);song=LV.bossSong;step=0;
  startCut(LV.bossLines,()=>{state='play';banner={a:boss.D.name,b:LV.place,t:140,boss:true};boss.cd=90;});}
function startMonsterCut(){const old=boss;old.gone=true;ents=ents.filter(e=>e!==old);
  for(let i=0;i<24;i++)parts.push({k:'deb',x:old.x+rnd(-14,14),y:old.y-rnd(20,90),vx:rnd(-4,4),vy:rnd(-5,-1),t:0,max:60,c:i%2?'#e07a1a':'#3a4a5a',w:4,h:3});
  boss=mk('reptilazo',old.x,old.y);boss.face=-1;ents.push(boss);flashT=12;shake=8;sfx('scream');
  startCut(LV.monsterLines,()=>{state='play';banner={a:boss.D.name,b:'EL QUE COMPRA ALMAS',t:140,boss:true};boss.cd=90;});}
function monsterDeath(){const b=boss,k=110-slowT;b.flash=k%4<2?2:0;
  if(k%5===0){spark(b.x+rnd(-30,30),b.y-rnd(20,90),true);sfx('heavy');shake=Math.max(shake,5);}
  if(slowT===25){flashT=14;shake=12;sfx('scream');for(let i=0;i<46;i++)parts.push({k:'deb',x:b.x+rnd(-24,24),y:b.y-rnd(10,110),vx:rnd(-4.5,4.5),vy:rnd(-6,-1),t:0,max:80,c:i%3?'#4e7e2e':'#f2d22a',w:rnd(2,7)|0,h:rnd(2,5)|0});
    parts.push({k:'wave',x:b.x,y:b.y,t:0,max:30,col:'160,255,120'});floatTxt(b.x,b.y-120,'¡EL MONSTRUO CAYÓ!','#f2b632');b.gone=true;}}
function startWinCut(){startCut(LV.winLines,()=>{state='victory';introT=0;player.state='victory';player.holdBack='bass';player.hold=null;player.face=-1;sfx('win');});}
function updCut(){const c=cut,l=c.lines[c.i];if(l.fx==='reporter'&&npcs.reporter&&npcs.reporter.state==='hidden'){const r=npcs.reporter;r.x=cam.x+W-30;r.tx=player.x+46;r.y=player.y-4;r.state='runin';}if(c.ch<l.s.length){c.ch+=1.4;if(tick%3===0)sfx('blip');}
  if(press.atk||press.jump||press.start){if(c.ch<l.s.length)c.ch=l.s.length;else{c.i++;c.ch=0;if(c.i>=c.lines.length){cut=null;c.onEnd&&c.onEnd();}}}}
function drawHeart(x,y,full,sz){sz=sz||1;ctx.save();ctx.translate(x,y);ctx.scale(sz,sz);
  ctx.fillStyle=full?'#e22834':'#321418';ctx.beginPath();ctx.moveTo(0,2);ctx.bezierCurveTo(0,-1,-4.2,-1,-4.2,2);
  ctx.bezierCurveTo(-4.2,4.8,0,7.5,0,9);ctx.bezierCurveTo(0,7.5,4.2,4.8,4.2,2);ctx.bezierCurveTo(4.2,-1,0,-1,0,2);ctx.fill();
  if(full){ctx.fillStyle='rgba(255,255,255,.65)';ctx.fillRect(-2.5,.8,1.2,1.2);}
  else{ctx.strokeStyle='#5a1e24';ctx.lineWidth=.8;ctx.stroke();}ctx.restore();}
function toTitleMenu(){
  audioInit();
  saveHi();
  state='title';
  sel=Math.min(lvl,LEVELS.length-1);
  boss=null;ents=[];items=[];props=[];parts=[];bubbles=[];shots=[];hazard=null;cut=null;CINE=null;SHOW=null;truck=null;
  musicOn=true;
  try{song=LEVELS[sel].song;}catch(e){}
  sfx('blip');
}
function resurrectPlayer(){
  lives=3;score=Math.max(0,Math.floor(score*.85));const p=player;
  p.hp=p.max;hpTrail=p.max;p.state='getup';p.t=0;p.inv=220;meter=300;papas=Math.max(papas,6);
  flashT=16;shake=12;sfx('boss');
  for(const e of ents){if(e.team===1&&hittable(e)&&Math.abs(e.x-p.x)<180){e.hp-=18;knockdown(e,Math.sign(e.x-p.x)||1,1.8);}}
  floatTxt(p.x,p.y-120,'¡RESUCITADO! ♥♥♥','#ff3b4a');
  banner={a:'¡RESUCITADO!',b:'3 CORAZONES RESTAURADOS · ¡EL METAL NUNCA MUERE!',t:150};
  state='play';}
function playerDied(){lives--;if(lives<0){state='gameover';gameoverT=0;saveHi();return;}
  const p=player;p.hp=p.max;hpTrail=p.max;p.state='getup';p.t=0;p.inv=160;meter=Math.max(meter,100);flashT=8;shake=6;
  for(const e of ents)if(e.team===1&&hittable(e)&&Math.abs(e.x-p.x)<120){e.hp-=5;knockdown(e,Math.sign(e.x-p.x)||1,1);}}
function saveHi(){if(score>hiscore)hiscore=score;saveProg();}
function makeResults(){const t=Math.round(timeF/60);
  if(diff===2&&!results.hardBonus){score=Math.round(score*1.5);floatTxt(player.x,player.y-110,'BONUS DIFÍCIL +50% SCORE','#ff4a3a');}
  const pts=score+maxCombo*200-hitsTaken*150-Math.max(0,t-240)*20;
  const rank=hitsTaken<8&&maxCombo>=20?'S':hitsTaken<16&&maxCombo>=12?'A':hitsTaken<28?'B':'C';results={t,combo:maxCombo,hits:hitsTaken,score,rank,k:0,hardBonus:diff===2};
  total.t+=t;total.combo=Math.max(total.combo,maxCombo);total.hits+=hitsTaken;unl=Math.max(unl,Math.min(LEVELS.length,lvl+2));saveHi();}

/* ================= main update ================= */
function updNPC(n){if(n.ally){updAlly(n);return;}
  if(n.state==='walkoff'){n.face=-1;n.x-=.7;n.walkPh+=.15;if(n.x<cam.x-30)n.gone=true;}
  if(n.state==='runoff'){if(n.kind==='reporter'){n.face=1;n.x+=2.4;}else{n.face=-1;n.x-=2.2;}n.walkPh+=.3;if(n.x<cam.x-30||n.x>cam.x+W+30)n.gone=true;}
  if(n.state==='runin'){n.face=-1;if(n.x>n.tx){n.x-=2.4;n.walkPh+=.3;}else n.state='idle';}}

// v9: armas de fuego de dibujito (escopeta y Bersa), ataque con títulos de sus discos, peligros nuevos
Object.assign(MOVES,{gun:{dmg:16,kd:1,h:40},buck:{dmg:12,kd:1.4,h:40},frase:{dmg:14,kd:1.1,h:40}});
const GUNS={bersa:{name:'SIFÓN',ammo:12,dur:10,col:'#9fd0ff'},escopeta:{name:'CAJÓN DE PAPAS',ammo:6,dur:20,col:'#d8a24a'}};
function fireGun(f){f.state='shoot';f.t=0;}
function gunTick(f){const G=GUNS[f.hold];f.t++;if(!G){f.state='idle';return;}
  if(f.t===3){const z=34*f.st.scale,x=f.x+f.face*22;
    if(f.hold==='bersa'){shots.push({x,y:f.y,z,vx:f.face*7,owner:f,t:0,k:'soda',back:true,mv:MOVES.gun,life:46});sfx('gun');}
    else{for(const dy of [-6,0,6])shots.push({x,y:f.y+dy,z:z+dy*.5,vx:f.face*6.5,owner:f,t:0,k:'papa',back:true,mv:MOVES.buck,life:44});sfx('escopeta');shake=Math.max(shake,2);}
    parts.push({k:'wave',x,y:f.y,t:0,max:8,col:'255,220,120'});floatTxt(x,f.y-z-16,f.hold==='bersa'?'¡PSSSHH!':'¡TOMÁ PAPAS!','#ffe08a');
    f.ammo--;if(f.ammo<=0){floatTxt(f.x,f.y-80,'SIN BALAS','#ff5a3a');f.hold=null;}}
  if(f.t>=G.dur)f.state='idle';}
function pickGun(f,it){f.hold=it.kind;f.ammo=it.ammo||GUNS[it.kind].ammo;it.gone=true;sfx('pickup');floatTxt(f.x,f.y-80,GUNS[it.kind].name+'!',GUNS[it.kind].col);}
function drawGunItem(k,X,y){const R=(a,b,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(a,b,w,h);};
  if(k==='bersa'){R(X-5,y-20,10,20,OUT);R(X-4,y-19,8,18,'#5aa0c8');R(X-3,y-18,2,16,'rgba(255,255,255,.35)');R(X-3,y-24,6,5,'#9aa0a8');R(X+2,y-23,5,2,'#9aa0a8');}
  else{R(X-12,y-14,24,14,OUT);R(X-11,y-13,22,12,'#a8783a');R(X-11,y-9,22,1,'#6a4426');R(X-11,y-5,22,1,'#6a4426');for(let k=0;k<4;k++){ctx.fillStyle='#c89a5a';ctx.beginPath();ctx.ellipse(X-7+k*5,y-15,2.6,2,0,0,7);ctx.fill();}}
  if(tick%40<20){ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.3;ctx.drawImage(glow('#ffe9a8'),X-14,y-20,28,28);ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';}}
function drawGunHeld(k,hx,hy,a2,f){const dx=Math.sin(a2),dy=Math.cos(a2);
  if(k==='bersa'){for(const p of [0,1])L(hx-dy*4,hy+dx*4,hx+dy*6,hy-dx*6,5.4,'#5aa0c8',p);L(hx+dy*6,hy-dx*6,hx+dy*6+dx*5,hy-dx*6+dy*5,2,'#9aa0a8',1);}
  else{ctx.fillStyle=OUT;ctx.fillRect(hx-7,hy-9,14,10);ctx.fillStyle='#a8783a';ctx.fillRect(hx-6,hy-8,12,8);ctx.fillStyle='#c89a5a';ctx.fillRect(hx-5,hy-10,4,3);ctx.fillRect(hx+1,hy-10,4,3);}
  if(f&&f.state==='shoot'&&f.t>=3&&f.t<7&&false){const mx=hx+dx*(k==='bersa'?9:20),my=hy+dy*(k==='bersa'?9:20);ctx.fillStyle='#fff2a8';ctx.beginPath();ctx.arc(mx,my,k==='bersa'?3:5,0,Math.PI*2);ctx.fill();ctx.fillStyle='#ff8a2a';ctx.beginPath();ctx.arc(mx+dx*2,my+dy*2,k==='bersa'?2:3.4,0,Math.PI*2);ctx.fill();}}
// títulos de discos por época: el ataque especial los larga por el aire
const SONGT=[['LUCHANDO POR EL METAL','UN PASO MÁS EN LA BATALLA','EL FIN DE LOS INICUOS'],['HERMÉTICA','ÁCIDO ARGENTINO','VÍCTIMAS DEL VACIAMIENTO','INTÉRPRETES'],
  ['MUNDO GUANACO','DEL ENTORNO','A FONDO BLANCO','PIEDRA LIBRE','ULTIMANDO','TORO Y PAMPA','TRILLANDO LA FINA']];
function songShot(f){const era=lvl<=2?0:lvl<=5?1:2,list=SONGT[era],t=list[(tick+score)%list.length];
  shots.push({x:f.x+f.face*16,y:f.y,z:42*f.st.scale,vx:f.face*4.4,owner:f,t:0,k:'frase',txt:'¡'+t+'!',back:true,mv:MOVES.frase,hit:new Set(),life:120});}
function drawFrase(s,X,Y){const a=Math.min(1,s.t/6),sc=1+Math.sin(s.t*.3)*.06;ctx.save();ctx.translate(X,Y);ctx.scale(sc,sc);ctx.globalAlpha=s.t>100?(120-s.t)/20:a;
  ctx.font='8px '+FONT;ctx.textAlign='center';ctx.textBaseline='middle';const w=ctx.measureText(U(s.txt)).width;
  ctx.fillStyle='rgba(12,8,14,.75)';ctx.fillRect(-w/2-5,-8,w+10,16);ctx.fillStyle='#e2462c';ctx.fillRect(-w/2-5,-8,w+10,2);ctx.fillRect(-w/2-5,6,w+10,2);
  ctx.fillStyle='#7a1a14';ctx.fillText(U(s.txt),1,1);ctx.fillStyle='#f2b632';ctx.fillText(U(s.txt),0,0);ctx.restore();ctx.globalAlpha=1;}
// peligros nuevos
Object.assign(HZ,{patrullero:{spd:6.5,w:42,warn:'¡RAZZIA!',snd:'truck'},auto:{spd:7,w:38,warn:'¡AUTO IMPORTADO A FONDO!',snd:'moto'},carrito:{spd:5.5,w:26,warn:'¡CARRITO DE PRODUCCIÓN!',snd:'moto'},
  colectivo:{spd:6,w:62,warn:'¡BONDI SIN FRENOS!',snd:'truck'},jabali:{spd:6.2,w:22,warn:'¡JABALÍ!',snd:'toro'}});
function drawCar(len,h,body,roof,label,lab){const R=(a,b,w,hh,c)=>{ctx.fillStyle=c;ctx.fillRect(a,b,w,hh);};
  R(-len/2-1,-h-1,len+2,h-4,OUT);R(-len/2,-h,len,h-6,body);R(-len/2,-h,len,3,shade(body,1.2));if(roof){R(-len/4-1,-h-13,len/2+2,14,OUT);R(-len/4,-h-12,len/2,12,roof);R(-len/4+3,-h-10,len/4-4,8,'#24323e');R(4,-h-10,len/4-6,8,'#24323e');}
  if(label){ctx.font='4px '+FONT;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=lab||'#fff';ctx.fillText(U(label),0,-h/2-2);}
  R(len/2-4,-h+4,4,4,'#ffe9a8');for(const w of [-len/2+12,len/2-12]){ctx.fillStyle=OUT;ctx.beginPath();ctx.arc(w,-6,8,0,Math.PI*2);ctx.fill();ctx.fillStyle='#1c1b20';ctx.beginPath();ctx.arc(w,-6,7,0,Math.PI*2);ctx.fill();ctx.fillStyle='#8a8790';ctx.beginPath();ctx.arc(w,-6,2.6,0,Math.PI*2);ctx.fill();}}
const HZD={
  patrullero(t){drawCar(80,30,'#e8e8ea','#e8e8ea','POLICÍA','#2a3a6a');ctx.fillStyle=t%10<5?'#2a6ab8':'#c8322a';ctx.fillRect(-6,-46,12,4);},
  auto(t){drawCar(84,28,'#c8322a','#c8322a',null);ctx.fillStyle='#e8e2d0';ctx.fillRect(-42,-16,84,1);},
  carrito(t){drawCar(44,24,'#e8e8ea',null,'PROD','#c8322a');ctx.fillStyle='#2a2a30';ctx.fillRect(-4,-38,2,16);ctx.fillRect(-14,-40,24,3);},
  colectivo(t){const R=(a,b,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(a,b,w,h);};R(-66,-60,132,54,OUT);R(-65,-59,130,52,'#e8dcc0');R(-65,-59,130,8,'#2a6ab8');R(-65,-24,130,6,'#2a6ab8');
    for(let k=0;k<6;k++)R(-58+k*20,-48,16,16,'#2a3a48');R(52,-50,12,26,'#2a3a48');ctx.font='4px '+FONT;ctx.textAlign='center';ctx.fillStyle='#c8322a';ctx.fillText('CONSTITUCIÓN',0,-28);
    for(const w of [-44,44]){ctx.fillStyle=OUT;ctx.beginPath();ctx.arc(w,-6,9,0,Math.PI*2);ctx.fill();ctx.fillStyle='#1c1b20';ctx.beginPath();ctx.arc(w,-6,8,0,Math.PI*2);ctx.fill();}},
  jabali(t){const R=(a,b,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(a,b,w,h);};const lg=Math.sin(t*.6)*4;for(const [x,o] of [[-10,lg],[-4,-lg],[6,lg],[11,-lg]])R(x-1+o*.3,-10,3,10,'#1a1210');
    ctx.fillStyle=OUT;ctx.beginPath();ctx.ellipse(0,-15,17,9,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#3a2a20';ctx.beginPath();ctx.ellipse(0,-15,16,8,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#3a2a20';ctx.beginPath();ctx.moveTo(10,-21);ctx.lineTo(24,-14);ctx.lineTo(10,-9);ctx.fill();R(22,-15,3,3,'#6a4a3a');ctx.fillStyle='#e8e2d0';ctx.beginPath();ctx.moveTo(18,-12);ctx.lineTo(21,-18);ctx.lineTo(20,-11);ctx.fill();
    R(15,-18,2,2,'#ff3a2a');for(let k=0;k<6;k++)R(-12+k*4,-24,2,3,'#1a1210');}
};
Object.assign(BARKS,{cana:['¡Documentos contra el capot!','¡A la comisaría a cortarse esos rulos!','¡Averiguación de antecedentes, melenudo!'],cana2:['¡Subilo al celular!','¡Ese del bajo es el cabecilla!'],buchon:['¡Comisario, ensayan en aquel garaje!','¡Yo anoté la patente del camión!'],
  cheto:['¡Qué grasa el conurbano, por favor!','¡Guardia, este tipo no está en la lista!'],cheto2:['¡Esto es Recoleta, no San Martín!','¡Qué horror ese ruido metálico!'],critico:['¡Carece de posmodernidad estética!','¡Le pongo media estrella en el suplemento!'],
  revendedor:['¡Campo agotado, te la cobro en dólares!','¡Si no me comprás a mí te quedás afuera!'],seguridad:['¡Atrás de la valla, pibe!','¡Acá mando yo porque tengo el chaleco!'],barra:['¡Pagá el peaje de la esquina!','¡Sin arreglo acá no descarga nadie!'],
  inspector:['¡Habilitación suspendida!','¡Falta el formulario y falta la atención!'],cazador:['¡Ese guanaco vale buena plata!','¡Correte de la mira, paisano!'],newage:['¡Respirá luz violeta y entregá el campo!','¡Tu vibración telúrica me desalinea el chakra!']});
Object.assign(DIEQ,{cana:'El pelo largo y la guitarra no son delito.',cana2:'La calle es del que va a trabajar.',buchon:'Al alcahuete ni el patrón lo respeta.',cheto:'Menos champagne y más respeto por el que labura.',cheto2:'Con apellido no se compra el sentimiento.',critico:'Escribís de música y nunca subiste a un escenario.',
  revendedor:'Con la ilusión de los pibes no se trafica.',seguridad:'"Tú eres su seguridad": le pegás a tu propio hermano por dos monedas.',barra:'La vereda es del pueblo, no de los matones.',inspector:'Las coimas pedíselas a los corruptos.',cazador:'Al animal del monte no se lo mata por deporte.',newage:'Andá a meditar a Palermo, chanta.'});
// Pelusa, el amigo de "Pa Pelusa": pelea al lado, tira pizzas y comparte el mate
function updAlly(n){if(state!=='play'){n.state='idle';return;}const p=player,tx=p.x-p.face*44,ty=clamp(p.y+8,GT+6,GB-4);
  let tgt=null,d=1e9;for(const e of ents){if(e.team!==1||!hittable(e))continue;const dd=Math.abs(e.x-n.x)+Math.abs(e.y-n.y)*2;if(dd<d){d=dd;tgt=e;}}
  if(n.state==='kick'){n.t++;if(n.t===10){shots.push({x:n.x+n.face*10,y:n.y,z:36,vx:n.face*6,owner:n,t:0,k:'pizza',back:true,mv:MOVES.gun,life:80});sfx('whoosh');}if(n.t>=20)n.state='idle';return;}
  const dx=tx-n.x,dy=ty-n.y;if(Math.abs(dx)>6||Math.abs(dy)>3){n.x+=clamp(dx,-2.2,2.2);n.y+=clamp(dy,-1.2,1.2);n.walkPh+=.3;n.state='walk';}else n.state='idle';
  n.mateT=(n.mateT||0)+1;if(n.mateT>1500&&p.hp<p.max*.6){n.mateT=0;items.push({kind:'mate',x:n.x+n.face*14,y:n.y,z:20,vz:2,t:0});say(n,'¡Tomá, un whisky, hermano!',90);}
  if(tgt){n.face=tgt.x>n.x?1:-1;if(--n.cd<=0&&Math.abs(tgt.y-n.y)<16&&Math.abs(tgt.x-n.x)<220){n.state='kick';n.t=0;n.cd=110+rnd(0,40);if(Math.random()<.3)say(n,['¡Acá estoy, Ricardo!','¡Para lo que necesites!','¡Al amigo no se lo deja solo!','¡Aguante Almafuerte!','¡Pizza para los caretas!'][rnd(0,5)|0],70);}}
  else n.face=p.face;}
function drawPizza(s,X,Y){ctx.save();ctx.translate(X,Y);ctx.rotate(s.t*.4);ctx.scale(1,.8);
  ctx.fillStyle=OUT;ctx.beginPath();ctx.arc(0,0,7,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#c98a3a';ctx.beginPath();ctx.arc(0,0,6,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#f2c84a';ctx.beginPath();ctx.arc(0,0,4.6,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#c8322a';for(const [x,y] of [[-2,-1.5],[1.8,-2],[0,1.5],[-2.6,1.8],[2.8,1.2]]){ctx.beginPath();ctx.arc(x,y,1,0,Math.PI*2);ctx.fill();}
  ctx.strokeStyle='#c98a3a';ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(0,-4.6);ctx.lineTo(0,4.6);ctx.moveTo(-4.6,0);ctx.lineTo(4.6,0);ctx.stroke();ctx.restore();}

// v10: de vuelta del Abasto arriba del camión del viejo, a los papazos contra los que le gritan "¡papero!"
let truck=null,truckDone=false;
function startTruck(){truckDone=true;state='truck';ents=ents.filter(e=>e===player);shots=[];bubbles=[];hazard=null;lock=null;
  truck={x:Math.min(LW-80,cam.x+W-90),t:0,cd:0,spawn:40,hits:0,n:0};player.face=-1;player.state='idle';player.z=46;player.hold=null;
  banner={a:'¡A LOS PAPAZOS!',b:'B O Z: TIRÁ PAPAS DESDE EL CAMIÓN',t:150,boss:false};sfx('truck');}
function updTruck(){const T=truck;T.t++;if(banner&&--banner.t<=0)banner=null;
  T.x-=T.t<60?T.t/60*1.9:1.9;player.x=T.x+8;player.y=224;player.z=46;player.face=-1;player.walkPh=0;
  cam.x=clamp(T.x-W*.62,0,LW-W);
  if(--T.spawn<=0&&T.x>420){T.spawn=38+rnd(0,40);const kinds=['patotero','patotero2','chorro','hippie2','patotero'];const e=mk(kinds[rnd(0,kinds.length)|0],cam.x-14,rnd(GT+4,GT+26));
    e.face=1;e.state='idle';e.heck=1;e.cd=0;ents.push(e);}
  for(const e of ents){if(!e.heck)continue;if(e.flash>0)e.flash--;
    if(e.flyT){e.flyT++;e.x+=e.vx;e.z=Math.max(0,e.z+e.vz);e.vz-=.35;e.state=e.z>0?'hurt':'down';if(e.flyT>90)e.gone=true;continue;}
    const d=T.x-e.x;if(d<300&&d>0&&!e.yelled){e.yelled=1;say(e,['¡PAPERO!','¡Eh, PAPERO!','¡Papero, tirate una!','¡PA-PE-RO!'][rnd(0,4)|0],80);T.rage=40;T.rt=e;if(comebackOK())say(player,pick(PAPERO_INS),100);}
    e.face=e.x<T.x?1:-1;if(e.x>cam.x+W+40)e.gone=true;}
  if(T.cd>0)T.cd--;
  if(T.rage>0){T.rage--;const e=T.rt;if(T.rage%5===0&&e&&!e.flyT&&!e.gone){const dx=Math.max(20,player.x-e.x),fr=Math.max(14,dx/6.5);shots.push({x:player.x-10,y:player.y,z:64,vx:-6.5,vy:(e.y-player.y)/fr+rnd(-.3,.3),vz:2.2,t:0,k:'papa',truck:1});player.state='papa';player.t=0;sfx('whoosh');}}
  if((press.papa||press.atk||press.jump)&&T.cd<=0){T.cd=12;T.n++;player.state='papa';player.t=0;
    let tgt=null,best=1e9;for(const e of ents){if(!e.heck||e.flyT)continue;const dx=player.x-e.x;if(dx>10&&dx<300&&dx<best){best=dx;tgt=e;}}
    const fr=tgt?Math.max(14,best/6.5):40,vx=-6.5,vy=tgt?(tgt.y-player.y)/fr:-.6;shots.push({x:player.x-10,y:player.y,z:64,vx,vy,vz:2.2,t:0,k:'papa',truck:1});sfx('whoosh');}
  if(player.state==='papa'&&++player.t>14)player.state='idle';
  for(const s of shots){s.t++;s.x+=s.vx;s.y+=s.vy;s.z=Math.max(4,s.z+s.vz-.1*s.t*.0);s.vz-=.06;if(s.t>80)s.gone=true;
    for(const e of ents){if(!e.heck||e.flyT)continue;if(Math.abs(e.x-s.x)<11&&Math.abs(e.y-s.y)<9){s.gone=true;e.flyT=1;e.vx=-1.5;e.vz=3.2;e.flash=4;T.hits++;score+=150;spark(e.x,e.y-30,false);sfx('punch');
      floatTxt(e.x,e.y-60,['¡PAPAZO!','¡TOMÁ, PAPA!','¡EN LA FRENTE!','+150'][rnd(0,4)|0],'#f2b632');break;}}}
  shots=shots.filter(s=>!s.gone);ents=ents.filter(e=>!e.gone);
  if(T.t%20===0)dust(T.x+40,224,1);
  if(T.x<=240){state='victory';introT=150;score+=T.hits*100;floatTxt(player.x,player.y-90,'PAPAZOS '+T.hits+' · +'+(T.hits*100),'#f2b632');player.z=0;truck=null;makeResults();state='results';}}
function drawTruckL(X){ctx.save();ctx.translate(Math.round(X),224);ctx.scale(-1.5,1.5);drawTruck(0,0,true);ctx.restore();
  for(let k=0;k<3;k++){ctx.fillStyle=OUT;ctx.fillRect(Math.round(X)-14-k*20,164,19,15);ctx.fillStyle='#8a6a42';ctx.fillRect(Math.round(X)-13-k*20,165,17,13);ctx.fillStyle='#c8a26a';for(let d=0;d<3;d++){ctx.beginPath();ctx.arc(Math.round(X)-9-k*20+d*5,164,2.4,0,7);ctx.fill();}}}

// v24: Banda sonora 16-bits de Ricardo Iorio (V8, Hermética, Almafuerte, Solista) integrada directamente en el proyecto
const BUILTIN_TRACKS = [
  { era: 0, key: 'c0', name: 'Momento de luchar (V8)', url: 'audio/c0.mp3' },
  { era: 0, key: 'c1', name: 'Brigadas metálicas (V8)', url: 'audio/c1.mp3' },
  { era: 0, key: 'c2', name: 'Destrucción (V8)', url: 'audio/c2.mp3' },
  { era: 0, key: 'b0', name: 'Cautivos del sistema (V8)', url: 'audio/b0.mp3' },
  { era: 1, key: 'c3', name: 'Tú eres su seguridad (Hermética)', url: 'audio/c3.mp3' },
  { era: 1, key: 'c4', name: 'Memoria de siglos (Hermética)', url: 'audio/c4.mp3' },
  { era: 1, key: 'c5', name: 'Gil trabajador (Hermética)', url: 'audio/c5.mp3' },
  { era: 1, key: 'b1', name: 'Olvídalo y volverá por más (Hermética)', url: 'audio/b1.mp3' },
  { era: 2, key: 'c6', name: 'El amasijo de un gran sueño (Almafuerte)', url: 'audio/c6.mp3' },
  { era: 2, key: 'c7', name: 'Sé vos (Almafuerte)', url: 'audio/c7.mp3' },
  { era: 2, key: 'c8', name: 'Toro y pampa (Almafuerte)', url: 'audio/c8.mp3' },
  { era: 2, key: 'c10', name: 'A vos amigo (Almafuerte)', url: 'audio/c10.mp3' },
  { era: 2, key: 'b2', name: 'Triunfo (Almafuerte)', url: 'audio/b2.mp3' },
  { era: 2, key: 'intro', name: 'Tierra adentro (Iorio - Flavio)', url: 'audio/intro.mp3' }
];

const LM = { askOff: 1, retro: true, tracks: [], userTracks: [], cur: null, want: null, el: null, label: null, labT: 0, era: -1 };
const ERA_KEYS = [
  ['v8', 'luchando', 'paso mas', 'inicuos', 'destruccion', 'brigadas', 'cautivo', 'luchar'],
  ['hermetica', 'acido', 'vaciamiento', 'interpretes', 'oeste', 'seguridad', 'siglos', 'gil', 'olvidalo'],
  ['almafuerte', 'guanaco', 'entorno', 'fondo blanco', 'piedra libre', 'ultimando', 'toro', 'pampa', 'trillando', 'peso argento', 'iorio', 'flavio', 'pelusa', 'tierra adentro', 'vos amigo', 'amasijo', 'triunfo', 'se vos']
];

function lmNorm(s){return (s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');}
function lmEraOf(t){const n=lmNorm(t.path||t.name||'');for(let e=0;e<3;e++)if(ERA_KEYS[e].some(k=>n.includes(k)))return e;return -1;}
function lmChapterEra(){return lvl<=2?0:lvl<=5?1:2;}

function lmPick(){
  const pool = LM.userTracks.length ? LM.userTracks : LM.tracks;
  if(!pool.length) return null;
  const isBoss = state==='play' && boss && !boss.gone;
  if(LV && !LM.userTracks.length){
    const targetKey = isBoss ? LV.bossSong : LV.song;
    if(targetKey){
      const match = pool.find(t=>t.key===targetKey);
      if(match) return match;
    }
    if(LV.lmKey && !isBoss){
      const matchK = pool.find(t=>lmNorm(t.name).includes(LV.lmKey) || lmNorm(t.key||'').includes(LV.lmKey));
      if(matchK) return matchK;
    }
  }
  const era = lmChapterEra();
  const byEra = pool.filter(t=>t.era===era);
  const list = byEra.length ? byEra : pool;
  const fight = isBoss ? 1 : 0;
  return list[(lvl*3 + fight + (LM.skip||0)) % list.length];
}

function lmDB(){return new Promise((res,rej)=>{try{const q=indexedDB.open('ricardio-musica',1);q.onupgradeneeded=()=>q.result.createObjectStore('t');q.onsuccess=()=>res(q.result);q.onerror=()=>rej(q.error);}catch(e){rej(e);}});}
function lmSave(files){lmDB().then(db=>{const tx=db.transaction('t','readwrite');tx.objectStore('t').put(files.map(f=>({name:f.name,path:f.webkitRelativePath||f.name,blob:f})),'lista');}).catch(()=>{});}
function lmRestore(){
  lmDB().then(db=>{
    const q=db.transaction('t').objectStore('t').get('lista');
    q.onsuccess=()=>{
      const L=q.result;
      if(L && L.length){
        lmLoad(L.map(o=>{const f=o.blob;try{Object.defineProperty(f,'webkitRelativePath',{value:o.path});}catch(e){}return f;}),true);
      }
    };
  }).catch(()=>{});
}

function lmLoad(files,restored){
  const audio=[...files].filter(f=>/\.(mp3|m4a|aac|wav|ogg|flac|opus)$/i.test(f.name)||(f.type||'').startsWith('audio/'));
  if(!audio.length){LM.label='NO ENCONTRÉ TEMAS DE AUDIO';LM.labT=200;return;}
  for(const t of LM.userTracks)URL.revokeObjectURL(t.url);
  LM.userTracks=audio.sort((a,b)=>(a.webkitRelativePath||a.name).localeCompare(b.webkitRelativePath||b.name)).map(f=>{
    const t={name:f.name.replace(/\.[^.]+$/,'').replace(/^\d+[\s._-]*/,''),path:f.webkitRelativePath||f.name,url:URL.createObjectURL(f)};
    t.era=lmEraOf(t);
    return t;
  });
  LM.cur=null;
  LM.label=LM.userTracks.length+' TEMAS EXTERNOS CARGADOS · 16 BITS';
  LM.labT=200;
  if(!restored)lmSave(audio);
}

function lmInitBuiltin(){
  LM.tracks = BUILTIN_TRACKS.map(t=>({
    name: t.name,
    path: t.url,
    url: t.url,
    era: t.era,
    key: t.key
  }));
}

function lmSetup(){
  try{
    lmInitBuiltin();
    const stage=document.getElementById('stage');
    const mk=(id,txt,css)=>{
      const b=document.createElement('button');
      b.id=id;b.type='button';b.textContent=txt;
      b.style.cssText='position:absolute;z-index:5;font:7px var(--font-pixel,monospace);padding:6px 8px;border-radius:6px;border:2px solid #e2462c;background:rgba(18,14,22,.85);color:#f2b632;cursor:pointer;'+css;
      stage.appendChild(b);
      return b;
    };
    const inDir=document.createElement('input');inDir.type='file';inDir.multiple=true;inDir.accept='audio/*';inDir.setAttribute('webkitdirectory','');inDir.style.display='none';stage.appendChild(inDir);
    const inFiles=document.createElement('input');inFiles.type='file';inFiles.multiple=true;inFiles.accept='audio/*';inFiles.style.display='none';stage.appendChild(inFiles);
    const bar=document.createElement('div');bar.style.cssText='position:absolute;z-index:5;left:6px;top:6px;right:52px;display:flex;flex-wrap:wrap;gap:4px;pointer-events:none;';stage.appendChild(bar);
    const mk2=(id,txt)=>{const b=mk(id,txt,'position:static;pointer-events:auto;');bar.appendChild(b);return b;};
    const b1=mk2('bMusInfo','♫ 16-BIT IORIO: ON');b1.style.borderColor='#f2b632';
    b1.addEventListener('click',()=>{
      musicOn=!musicOn;
      b1.textContent=musicOn?'♫ 16-BIT IORIO: ON':'♫ 16-BIT IORIO: OFF';
      sfx('blip');
    });
    const b2=mk2('bMusFiles','CARGAR MP3 (OPCIONAL)');
    const b3=mk2('bMusRetro','FILTRO RETRO: SÍ');
    const bDiff=mk2('bDiff','DIFICULTAD: '+DIFFS[diff].name);
    bDiff.style.borderColor=DIFFS[diff].col;bDiff.style.color=DIFFS[diff].col;
    bDiff.addEventListener('click',()=>{diffSet(diff+1);sfx('blip');});
    const bMenu=mk2('bMenu','VOLVER AL MENÚ');bMenu.style.borderColor='#ff4a3a';bMenu.style.color='#ff6a5a';
    bMenu.addEventListener('click',()=>{toTitleMenu();});

    b2.addEventListener('click',()=>{audioInit();inFiles.click();});
    b3.addEventListener('click',()=>{LM.retro=!LM.retro;b3.textContent='FILTRO RETRO: '+(LM.retro?'SÍ':'NO');lmGraph();sfx('blip');});
    inDir.addEventListener('change',()=>lmLoad(inDir.files));
    inFiles.addEventListener('change',()=>lmLoad(inFiles.files));

    LM.btns=[b1,b2,b3,bDiff,bMenu];
    LM.el=new Audio();
    LM.el.volume=.75;
    LM.el.preload='auto';
    LM.el.addEventListener('ended',()=>{LM.skip=(LM.skip||0)+1;LM.cur=null;});
    LM.el.addEventListener('error',()=>{
      console.warn('Audio local fallback');
    });
  }catch(e){console.error(e);}
}

function lmGraph(){
  if(!AC||!LM.el)return;
  try{
    if(!LM.src){
      LM.src=AC.createMediaElementSource(LM.el);
      LM.lp=AC.createBiquadFilter();LM.lp.type='lowpass';LM.lp.frequency.value=20000;LM.lp.Q.value=.8;
      LM.chip=AC.createScriptProcessor(2048,2,2);let hl=0,hr=0,ph=0;
      LM.chip.onaudioprocess=e=>{
        const a=e.inputBuffer,b=e.outputBuffer,L=a.getChannelData(0),R=a.numberOfChannels>1?a.getChannelData(1):L,oL=b.getChannelData(0),oR=b.getChannelData(1);
        if(!LM.retro){oL.set(L);oR.set(R);return;}
        const step=AC.sampleRate/11025,q=30;
        for(let i=0;i<L.length;i++){
          ph+=1;
          if(ph>=step){
            ph-=step;
            const m=(L[i]+R[i])*.5,sd=(L[i]-R[i])*.25;
            const sq=x=>{const v=Math.tanh(x*2.2);return Math.round(v*q)/q;};
            hl=sq(m+sd*.6);hr=sq(m-sd*.6);
          }
          oL[i]=hl;oR[i]=hr;
        }
      };
      LM.cart=AC.createBiquadFilter();LM.cart.type='lowpass';LM.cart.frequency.value=20000;LM.cart.Q.value=.5;
      LM.echo=AC.createDelay(.5);LM.echo.delayTime.value=.19;
      LM.fb=AC.createGain();LM.fb.gain.value=0;
      LM.wet=AC.createGain();LM.wet.gain.value=0;
      LM.g=AC.createGain();LM.g.gain.value=1;

      LM.src.connect(LM.lp);LM.lp.connect(LM.chip);LM.chip.connect(LM.cart);LM.cart.connect(LM.g);
      LM.cart.connect(LM.echo);LM.echo.connect(LM.fb);LM.fb.connect(LM.echo);LM.echo.connect(LM.wet);LM.wet.connect(LM.g);
      LM.g.connect(master);
    }
    const r=!!LM.retro,t=AC.currentTime;
    LM.cart.frequency.setTargetAtTime(r?5200:20000,t,.05);
    LM.fb.gain.setTargetAtTime(r?.32:0,t,.05);
    LM.wet.gain.setTargetAtTime(r?.22:0,t,.05);
  }catch(e){}
}

function lmOn(){return (LM.tracks.length>0 || LM.userTracks.length>0);}

function lmTick(){
  if(!LM.el)return;
  if(LM.labT>0)LM.labT--;
  for(const b of LM.btns||[]){
    if(b.id==='bMenu')b.style.display=(state==='pause'||state==='gameover')?'block':'none';
    else b.style.display=(state==='title'||state==='pause')?'block':'none';
  }
  if(LM.ov)LM.ov.style.display='none';
  const want=musicOn&&lmOn()&&state!=='gameover';
  if(!want){
    if(!LM.el.paused)LM.el.pause();
    return;
  }
  const t=lmPick();
  if(t&&t!==LM.cur){
    LM.cur=t;
    LM.el.src=t.url;
    LM.el.play().catch(()=>{});
    LM.label='♫ 16-BIT: '+t.name.toUpperCase();
    LM.labT=240;
  } else if(LM.el.paused&&LM.cur){
    LM.el.play().catch(()=>{});
  }
  if(AC&&!LM.src)lmGraph();
  if(LM.lp){
    const calm=state==='title'||state==='card'||state==='pause'||state==='results'||(state==='play'&&!combatMix);
    LM.lp.frequency.setTargetAtTime(calm?1400:20000,AC.currentTime,.25);
  }
  const slow=state==='play'&&slowT>0;
  LM.el.preservesPitch=!slow;
  LM.el.playbackRate=slow?.62:1;
  LM.el.volume=state==='pause'?.25:.8;
}

function lmDraw(){
  if(LM.labT>0&&LM.label){
    ctx.globalAlpha=Math.min(1,LM.labT/30);
    const w=Math.min(320,U(LM.label).length*5+18);
    ctx.fillStyle='rgba(8,6,11,.85)';
    ctx.fillRect(W/2-w/2,H-20,w,13);
    txt(LM.label.slice(0,56),W/2,H-17,'#f2b632',5,'center');
    ctx.globalAlpha=1;
  }
}

lmSetup();
lmRestore();

// v10: retratos más realistas (cinemáticas, título y HUD): cara con volumen, ojos, nariz, boca, pelo en mechones
function faceSpec(st){const I=st.ior;
  if(I)return {hairC:I.hairC,hi:I.hi,len:I.len,type:I.hair==='buzz'?'buzz':I.hair==='short'?'short':I.hair==='crest'?'crest':I.hair==='swept'?'swept':I.curly?'curly':'curtain',stub:I.stub||0,stubC:I.stubC,jaw:I.jaw||0,stache:I.beard==='none'?null:I.stacheC,beard:I.beard==='candado'?'candado':I.beard==='full'?'full':I.beard==='long'?'long':null,beardC:I.beardC||I.hairC,brow:I.brow,gray:I.gray||0,age:I.gray>=1?2:I.gray?1:0};
  const h=st.hair||'short';return {hairC:st.hairC||'#1a1410',hi:shade(st.hairC||'#1a1410',1.6),len:h==='long'?13:0,type:h==='long'?'curtain':h,stache:st.stache||null,beard:st.beard?'full':null,beardC:st.beardC||st.hairC||'#1a1410',brow:shade(st.hairC||'#2a2018',.8),
    gray:0,age:(st.hairC==='#d8d2c6'||st.hairC==='#c8c2b8'||st.hairC==='#8a8278')?2:0,glasses:st.glasses,cap:h==='cap'?st.capC:null,boina:h==='boina',band:st.band,cigar:st.cigar,lizard:st.lizard,wolf:st.wolf,horns:st.horns};}
function drawFaceFront(st,x,y,sz){if(st.ior&&!st.lizard){drawIorioPortrait(st,x,y,sz);return;}const F=faceSpec(st),g=ctx,u=sz/40,sk=st.skin;g.save();g.translate(x,y);g.scale(u,u);g.lineJoin='round';g.lineCap='round';
  const P=(pts,c)=>{g.fillStyle=c;g.beginPath();g.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++){const p=pts[i];if(p.length===4)g.quadraticCurveTo(p[0],p[1],p[2],p[3]);else g.lineTo(p[0],p[1]);}g.closePath();g.fill();};
  const S=(pts,c,w)=>{g.strokeStyle=c;g.lineWidth=w;g.beginPath();g.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++){const p=pts[i];if(p.length===4)g.quadraticCurveTo(p[0],p[1],p[2],p[3]);else g.lineTo(p[0],p[1]);}g.stroke();};
  const dk=shade(sk,.72),lt=shade(sk,1.12),hc=F.hairC,len=F.len*1.3;
  // ropa y hombros
  {const gr=g.createLinearGradient(0,30,0,44);gr.addColorStop(0,shade(st.top,1.25));gr.addColorStop(1,shade(st.top,.7));P([[0,44],[2,37],[4,33,10,31.5],[16,30],[24,30],[30,31.5],[36,33,38,37],[40,44]],gr);
   if(st.jacket){P([[5,44],[8,35],[15,31],[18.5,44]],shade(st.top,1.5));P([[35,44],[32,35],[25,31],[21.5,44]],shade(st.top,1.5));S([[15,31],[17,38],[18.5,44]],shade(st.top,.6),.5);S([[25,31],[23,38],[21.5,44]],shade(st.top,.6),.5);P([[17,31],[23,31],[22,44],[18,44]],st.shirt||'#ccc');
     if(st.studs){g.fillStyle='#d8d8de';for(let k=0;k<5;k++){g.beginPath();g.arc(9+k*1.4,36+k*1.4,.45,0,7);g.arc(31-k*1.4,36+k*1.4,.45,0,7);g.fill();}}}
   if(st.vest){P([[4,44],[7,35],[15,31],[17,44]],st.vest);P([[36,44],[33,35],[25,31],[23,44]],st.vest);}
   if(st.overall){P([[12,44],[13,37],[27,37],[28,44]],st.overall);S([[13,37],[14,31]],st.overall,1.6);S([[27,37],[26,31]],st.overall,1.6);g.fillStyle='#c8c2a8';g.fillRect(13,37,1.6,1.4);g.fillRect(25.4,37,1.6,1.4);}
   if(st.apron)P([[12,44],[13,34],[27,34],[28,44]],st.apron);
   if(st.tie){P([[17.5,30.5],[22.5,30.5],[20,34]],st.shirt||'#eee');P([[19.2,32],[20.8,32],[21.6,40],[20,42],[18.4,40]],st.tie);}
   if(st.scarf)P([[14.5,30],[25.5,30],[23,33],[20,37],[17,33]],st.scarf);}
  // cuello
  {const gr=g.createLinearGradient(15,0,25,0);gr.addColorStop(0,shade(sk,.62));gr.addColorStop(.5,shade(sk,.85));gr.addColorStop(1,shade(sk,.6));P([[15.5,24],[24.5,24],[25,31.5],[20,33],[15,31.5]],gr);}
  // melena de atrás
  if(F.type==='curtain'||F.type==='curly')P([[8,14],[9,4,20,2.4],[31,4,32,14],[33.5,10+len*.7,34.5,10+len],[28,11+len],[12,11+len],[5.5,10+len],[6.5,10+len*.7,8,14]],shade(hc,.8));
  // cara: frente redonda, pómulos, mandíbula un poco cuadrada
  const face=[[20,6.2],[27,6.4,28.4,12.6],[29.2,17.6,28.2,23.4],[26.8,28.8,23,31.4],[20,32.8,17,31.4],[13.2,28.8,11.8,23.4],[10.8,17.6,11.6,12.6],[13,6.4,20,6.2]];
  {const gr=g.createRadialGradient(17.5,15,1,20,18,15);gr.addColorStop(0,lt);gr.addColorStop(.55,sk);gr.addColorStop(1,shade(sk,.68));P(face,F.lizard?sk:gr);}
  g.save();g.beginPath();g.moveTo(20,6.4);for(const p of face.slice(1))g.quadraticCurveTo(p[0],p[1],p[2],p[3]);g.closePath();g.clip();
  g.fillStyle='rgba(70,30,20,.09)';g.beginPath();g.ellipse(13.4,22,2.8,4.6,.15,0,7);g.ellipse(26.6,22,2.8,4.6,-.15,0,7);g.fill();      // mejillas hundidas
  g.fillStyle='rgba(255,240,220,.18)';g.beginPath();g.ellipse(15.4,18.6,2.2,1.2,-.3,0,7);g.ellipse(24.6,18.6,2.2,1.2,.3,0,7);g.fill();   // pómulos
  g.fillStyle='rgba(60,25,15,.22)';g.fillRect(10,28.5,20,6);
  if(F.stub){g.fillStyle=F.stubC?'rgba(150,145,138,'+F.stub*.5+')':'rgba(40,28,24,'+F.stub*.45+')';g.beginPath();g.ellipse(20,28.5,8.6,5.4,0,0,7);g.fill();}
  if(F.jaw){g.fillStyle='rgba(70,30,20,'+(.12*F.jaw)+')';g.beginPath();g.ellipse(13,27,2.4,4,.3,0,7);g.ellipse(27,27,2.4,4,-.3,0,7);g.fill();}                                                                             // sombra bajo el mentón
  g.restore();
  // orejas (asoman si no hay melena)
  if(F.type!=='curtain'&&F.type!=='curly'){P([[10.9,16],[8.6,15.6,8.8,19.6],[9.4,22.6,11.3,22]],dk);P([[29.1,16],[31.4,15.6,31.2,19.6],[30.6,22.6,28.7,22]],dk);}
  // ojos
  for(const s of [-1,1]){const ex=20+s*4.3,ey=17.2;
    g.fillStyle=shade(sk,.62);g.beginPath();g.ellipse(ex,ey-.2,2.9,1.7,0,0,7);g.fill();                                                  // cuenca
    P([[ex-2.3,ey],[ex,ey-1.25,ex+2.3,ey],[ex,ey+1.05,ex-2.3,ey]],F.lizard?'#f2d22a':'#efe6da');
    g.fillStyle=F.lizard?'#0a0a0a':'#4a2c16';g.beginPath();F.lizard?g.ellipse(ex,ey,.35,1,0,0,7):g.arc(ex+s*.15,ey,1.05,0,7);g.fill();
    if(!F.lizard){g.fillStyle='#0c0806';g.beginPath();g.arc(ex+s*.15,ey,.5,0,7);g.fill();g.fillStyle='#fff';g.beginPath();g.arc(ex+s*.15+.35,ey-.35,.25,0,7);g.fill();}
    S([[ex-2.5,ey+.1],[ex,ey-1.6,ex+2.5,ey+.1]],'#2a1810',.55);                                                                          // párpado
    if(F.age)S([[ex-1.8,ey+1.5],[ex,ey+2.3,ex+1.8,ey+1.5]],shade(sk,.62),.3);
    if(F.age>=2){S([[ex+s*2.8,ey-.3],[ex+s*3.6,ey-.8]],shade(sk,.6),.25);S([[ex+s*2.8,ey+.4],[ex+s*3.6,ey+.6]],shade(sk,.6),.25);}
    P([[ex-s*2.5,ey-2.0],[ex,ey-3.7,ex+s*3.2,ey-2.6],[ex+s*3.3,ey-2.0],[ex,ey-2.9,ex-s*2.5,ey-1.3]],F.brow||hc);}
  if(F.glasses){g.strokeStyle='#141218';g.lineWidth=.7;g.strokeRect(13.2,15.2,5.6,3.6);g.strokeRect(21.2,15.2,5.6,3.6);S([[18.8,16.6],[21.2,16.6]],'#141218',.6);g.fillStyle='rgba(160,190,230,.25)';g.fillRect(13.6,15.6,4.8,2.8);g.fillRect(21.6,15.6,4.8,2.8);}
  // nariz
  {g.fillStyle=shade(sk,.8);g.beginPath();g.moveTo(19,17.6);g.quadraticCurveTo(18.4,21.4,17.6,23.2);g.lineTo(19.2,23.4);g.closePath();g.fill();
   g.fillStyle='rgba(255,240,225,.35)';g.beginPath();g.ellipse(20.2,22.2,.9,.7,0,0,7);g.fill();g.fillStyle=shade(sk,.62);g.beginPath();g.ellipse(18.6,23.6,.8,.45,.3,0,7);g.ellipse(21.6,23.6,.8,.45,-.3,0,7);g.fill();
   S([[17.4,22.4],[17,23.8,18.2,24.2]],shade(sk,.65),.35);S([[22.8,22.4],[23.2,23.8,22,24.2]],shade(sk,.65),.35);
   if(F.age)S([[16.4,24.2],[15.4,26.6,16,28.4]],shade(sk,.66),.35),S([[23.6,24.2],[24.6,26.6,24,28.4]],shade(sk,.66),.35);}
  // boca
  P([[16.8,27],[18.4,26.2,20,26.6],[21.6,26.2,23.2,27],[20,27.6,16.8,27]],shade(sk,.6));P([[17.4,27.2],[20,29.2,22.6,27.2],[20,27.8,17.4,27.2]],shade(sk,.85));
  if(F.cigar){g.fillStyle='#6a4426';g.fillRect(22,26.6,6,1.4);g.fillStyle=tick%20<10?'#ff6a2a':'#c8322a';g.fillRect(27.6,26.6,.9,1.4);}
  // barba y bigote
  const bc=F.beardC,sc=F.stache;
  if(F.beard==='full')P([[11,17],[11.4,26,14.6,30.6],[20,34.8],[25.4,30.6,28.6,26],[29,17],[27.4,24],[24.4,28.6],[20,29.6],[15.6,28.6],[12.6,24]],bc);
  if(F.beard==='long')P([[11.2,17],[11.4,28,15,34],[20,43],[25,34,28.6,28],[28.8,17],[27.2,24],[24.4,28.6],[20,29.6],[15.6,28.6],[12.8,24]],bc);
  if(F.beard==='candado')P([[16.6,27.4],[23.4,27.4],[23.6,30.6,20,32.8],[16.4,30.6,16.6,27.4]],bc);
  if(F.beard==='full'||F.beard==='long'){const n=F.beard==='long'?14:10;for(let k=0;k<n;k++){const xx=13+k*(14/n),yy=27+Math.abs(k-n/2)*-.3;S([[xx,yy],[xx+.4,yy+(F.beard==='long'?11:5)-Math.abs(k-n/2)*.6]],shade(bc,k%2?1.5:.7),.3);}}
  if(sc){P([[15.6,26.4],[16.6,24.6,20,24.4],[23.4,24.6,24.4,26.4],[25.2,29],[25,31],[24,31],[23.4,27.6,20,26.6],[16.6,27.6,16,31],[15,31],[14.8,29]],sc);
    for(let k=0;k<8;k++)S([[16.6+k*1,24.8],[16.4+k*1.05,26.6]],shade(sc,1.6),.2);}
  // pelo de adelante
  if(F.type==='curtain'||F.type==='curly'){
    P([[20,4],[14,4.4,11,9],[9.4,13,9.2,18],[8.4,10+len*.6,7.8,10+len],[11.6,10+len-.6],[11.4,10+len*.6,11.8,17],[12.6,11,16,8.4],[19,6.6]],hc);
    P([[20,4],[26,4.4,29,9],[30.6,13,30.8,18],[31.6,10+len*.6,32.2,10+len],[28.4,10+len-.6],[28.6,10+len*.6,28.2,17],[27.4,11,24,8.4],[21,6.6]],hc);
    for(let k=0;k<5;k++){S([[18.6-k*1.6,5+k*.5],[11.6-k*.4,10,10.6+k*.2,10+len-2]],k%2?F.hi:shade(hc,.55),.4);S([[21.4+k*1.6,5+k*.5],[28.4+k*.4,10,29.4-k*.2,10+len-2]],k%2?F.hi:shade(hc,.55),.4);}
    S([[20,4],[20,6.4]],shade(sk,.8),.25);
    if(F.type==='curly'){for(let k=0;k<26;k++){const side=k%2?1:-1,yy=4+(k>>1)*1.9,xx=20+side*(8+Math.min(3,(k>>1)*.6)+Math.sin(k*1.7));g.fillStyle=(k>>1)%2?hc:F.hi;g.beginPath();g.arc(xx,yy,1.5,0,7);g.fill();}}
    if(F.gray){g.globalAlpha=Math.min(1,F.gray);for(let k=0;k<6;k++){S([[17-k*1.2,5.4],[11-k*.3,12,10.4+k*.3,10+len-3]],'#dcd8d0',.35);S([[23+k*1.2,5.4],[29+k*.3,12,29.6-k*.3,10+len-3]],'#dcd8d0',.35);}g.globalAlpha=1;}}
  else if(F.type==='buzz'){P([[10.8,14],[10.8,6.4,20,4.8],[29.2,6.4,29.2,14],[27.6,9.6,20,8.8],[12.4,9.6,10.8,14]],'rgba(30,22,18,.6)');}
  else if(F.type==='crest'){P([[10.6,14],[10.6,6,20,4.6],[29.4,6,29.4,14],[27.6,9.4,20,8.6],[12.4,9.4,10.6,14]],F.gray?'rgba(120,114,106,.55)':'rgba(40,30,26,.55)');P([[15.6,9.4],[15,2,20,.8],[25,2,24.4,9.4],[20,8.2]],hc);for(let k=0;k<5;k++)S([[16.4+k*1.8,8.6],[17+k*1.5,2.6]],k%2?F.hi:shade(hc,.6),.35);}
  else if(F.type==='swept'){P([[11,14],[10,4.6,20,2.2],[30,4.6,29,14],[28,8,24,7.4],[20,7.6],[16,7.4],[12,8,11,14]],hc);P([[9.6,12],[9.4,18],[10.6,20],[11.4,14]],shade(hc,.85));P([[30.4,12],[30.6,18],[29.4,20],[28.6,14]],shade(hc,.85));
    for(let k=0;k<9;k++)S([[13+k*1.8,7.6],[13.4+k*1.7,4.8,14+k*1.4,3.8]],k%2?F.hi:shade(hc,.72),.35);}
  else if(F.type==='short'||F.type==='slick'||F.type==='long'){P([[10.6,14],[10.6,5.4,20,3.6],[29.4,5.4,29.4,14],[27.6,9,20,8.2],[12.4,9,10.6,14]],hc);if(F.type==='slick')for(let k=0;k<5;k++)S([[13+k*3,5],[15+k*3,10]],F.hi,.3);}
  else if(F.type==='cap'){P([[10,13],[10,4,20,3.4],[30,4,30,13]],F.cap||'#333');P([[18,11.4],[33,11.2],[34,13],[18,13.2]],shade(F.cap||'#333',.7));}
  else if(F.type==='boina'){P([[8.6,11],[9,4,20,3],[31,4,31.4,11],[20,9.6]],'#23212b');g.fillStyle='#23212b';g.fillRect(19.4,1.6,1.2,1.6);}
  if(F.band){g.fillStyle=F.band;g.fillRect(10.4,9,19.2,1.8);}
  g.restore();}

// v12: pasada de realismo sobre los escenarios: textura de revoque, manchas de humedad, chorreaduras, sombra al pie de las paredes, cornisas, cables y bruma
function rhash(a,b){let h=(a*374761393+b*668265263)|0;h=(h^(h>>>13))*1274126177|0;return((h^(h>>>16))>>>0)/4294967296;}
function vnoise(x,y,s){const gx=Math.floor(x/s),gy=Math.floor(y/s),fx=x/s-gx,fy=y/s-gy,sx=fx*fx*(3-2*fx),sy=fy*fy*(3-2*fy);
  const a=rhash(gx,gy),b=rhash(gx+1,gy),c=rhash(gx,gy+1),d=rhash(gx+1,gy+1);return a+(b-a)*sx+(c-a)*sy+(a-b-c+d)*sx*sy;}
function realBG(cv,lamps,S){try{const w=cv.width,h=cv.height,g=cv.getContext('2d'),id=g.getImageData(0,0,w,h),D=id.data,gy=176*RS,top=new Int16Array(w).fill(-1);
  for(let x=0;x<w;x++)for(let y=0;y<gy;y++)if(D[(y*w+x)*4+3]>200){top[x]=y;break;}
  // chorreaduras: columnas con mancha que baja desde la cornisa
  const streak=new Float32Array(w);for(let x=0;x<w;x++){const n=vnoise(x,0,7*RS),m=vnoise(x,99,31*RS);streak[x]=Math.max(0,(n-.55))*2.2*(m>.45?1:.3);}
  for(let y=0;y<h;y++){const ground=y>=gy;for(let x=0;x<w;x++){const i=(y*w+x)*4;if(D[i+3]<200)continue;
    let r=D[i],gg=D[i+1],b=D[i+2];
    const fine=(rhash(x,y)-.5)*14,mott=(vnoise(x,y,9*RS)-.5)*26+(vnoise(x+500,y,40*RS)-.5)*30;
    let k=1+(fine+mott)/255;
    if(!ground&&top[x]>=0){const dy=y-top[x];
      if(dy<2*RS)k*=1.18;else if(dy<5*RS)k*=.78;              // cornisa con luz arriba y sombra abajo
      k*=1-streak[x]*Math.max(0,1-dy/(70*RS))*.45;            // humedad que chorrea
      const base=gy-y;if(base<26*RS)k*=.62+.38*base/(26*RS);  // sombra y suciedad al pie
      k*=1-Math.max(0,.18-dy/(400*RS));}
    if(ground){const d=y-gy;k*=.82+.18*Math.min(1,d/(10*RS));k*=1+(vnoise(x,y,3*RS)-.5)*.16;}
    r*=k;gg*=k;b*=k;const l=(r+gg+b)/3;r=l+(r-l)*.84;gg=l+(gg-l)*.84;b=l+(b-l)*.84;   // un poco menos saturado
    D[i]=r>255?255:r<0?0:r;D[i+1]=gg>255?255:gg<0?0:gg;D[i+2]=b>255?255:b<0?0:b;}}
  g.putImageData(id,0,0);
  g.save();g.setTransform(RS,0,0,RS,0,0);
  // cables entre faroles, colgando
  const L=(lamps||[]).filter(l=>l.y>40).map(l=>l.x).sort((a,b)=>a-b);g.lineWidth=.7;
  for(let j=0;j+1<L.length;j++){const a=L[j]+8,b=L[j+1]+8;if(b-a>520)continue;for(const [off,c] of [[-3,'rgba(10,8,14,.85)'],[2,'rgba(10,8,14,.6)']]){g.strokeStyle=c;g.beginPath();g.moveTo(a,60+off);g.quadraticCurveTo((a+b)/2,60+off+18+(b-a)*.03,b,60+off);g.stroke();}}
  // cordón de vereda con brillo y sombra
  const gw=cv.width/RS;g.fillStyle='rgba(255,255,255,.07)';g.fillRect(0,176,gw,1);g.fillStyle='rgba(0,0,0,.28)';g.fillRect(0,177,gw,2);
  // manchas de agua y chicles en la vereda
  for(let k=0;k<gw/14;k++){const x=rhash(k,7)*gw,y=180+rhash(k,8)*14;g.fillStyle=k%3?'rgba(0,0,0,.10)':'rgba(255,255,255,.05)';g.beginPath();g.ellipse(x,y,2+rhash(k,9)*9,1+rhash(k,10)*2,0,0,7);g.fill();}
  if(S&&S.weather==='rain'){for(let k=0;k<gw/30;k++){const x=rhash(k,11)*gw;const gr=g.createLinearGradient(0,178,0,200);gr.addColorStop(0,'rgba(170,190,230,.16)');gr.addColorStop(1,'rgba(170,190,230,0)');g.fillStyle=gr;g.fillRect(x,178,10+rhash(k,12)*24,22);}}
  g.restore();}catch(e){}}
function realFAR(cv){try{const g=cv.getContext('2d'),w=cv.width/RS;g.save();g.setTransform(RS,0,0,RS,0,0);
  const hz=g.createLinearGradient(0,90,0,190);hz.addColorStop(0,'rgba(140,120,150,0)');hz.addColorStop(1,'rgba(140,120,150,.22)');g.globalCompositeOperation='source-atop';g.fillStyle=hz;g.fillRect(0,0,w,190);
  g.globalCompositeOperation='source-over';
  // nubes bajas con volumen
  for(let k=0;k<26;k++){const x=rhash(k,21)*w,y=20+rhash(k,22)*60,r=30+rhash(k,23)*70;const gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,'rgba(200,180,200,.07)');gr.addColorStop(1,'rgba(200,180,200,0)');g.fillStyle=gr;g.beginPath();g.ellipse(x,y,r,r*.35,0,0,7);g.fill();}
  g.restore();}catch(e){}}

// v17: personajes redibujados mirando fotos de referencia por época (solo referencia: todo se dibuja por código)
// Cuerpo con volumen (miembros con forma y luz), ropa con detalle y cabeza de perfil con rasgos reales.
const PSK=1.12; // los personajes se ven un poco más grandes en pantalla
// Ricardio por época, según las fotos: V8 y Hermética de melena larga ondulada y cara afeitada,
// y desde Mundo Guanaco (Almafuerte 1995) hasta el final: corte cresta (mohawk) rapado a los costados, canosa y plateada con los años.
(function(){const A=(k,o)=>{if(STY[k])Object.assign(STY[k],o);};
  A('ric1',{ior:{hair:'long',hairC:'#1c130d',hi:'#4a3626',len:9,beard:'none',brow:'#1c130d'},top:'#18171b',shirt:'#18171b',bareFore:true,apron:null,pants:'#2e3a52',boots:'#d8d2c2',sneak:true});
  A('ricV',{ior:{hair:'long',curly:true,hairC:'#1a120c',hi:'#4a3624',len:13,beard:'none',brow:'#1a120c'},top:'#141317',shirt:'#222228',boots:'#e2dccb',sneak:true,pants:'#2e3a52',wrist:'#141216',studs:true});
  A('ric2',{ior:{hair:'long',curly:true,hairC:'#150e09',hi:'#43301f',len:18,beard:'none',brow:'#150e09'},boots:'#e4ded0',sneak:true,pants:'#3a5482',shirt:'#222228',leather:true,studs:true,wrist:'#141216'});
  A('ricH',{pants:'#1c1b20',ior:{hair:'long',hairC:'#130c08',hi:'#3e2c1e',len:19,beard:'none',brow:'#130c08'},shirt:'#18181c',leather:true,logo:'H',wrist:'#141216'});
  A('ric3',{pants:'#1c1b20',ior:{hair:'long',hairC:'#140e0a',hi:'#3e2e22',len:23,beard:'none',brow:'#140e0a',stub:.3},tattoo:true,logo:'H',wrist:'#141216'});
  A('ricM',{pants:'#1c1b20',ior:{hair:'long',hairC:'#140e0a',hi:'#3e2e22',len:23,beard:'none',brow:'#140e0a',stub:.35},wrist:'#141216',logo:'H',tattoo:true});
  A('ricA',{pants:'#1c1b20',ior:{hair:'crest',hairC:'#18110c',hi:'#3c2c20',len:0,beard:'none',brow:'#18110c',jaw:.45,stub:.35},torsoW:15,scarf:null,wrist:'#141216',logo:'pampa',tattoo:true});
  A('ric4',{ior:{hair:'crest',hairC:'#1a130e',hi:'#46362a',len:0,beard:'none',brow:'#1a130e',jaw:.55,stub:.38,gray:.2},top:'#141317',shirt:'#141317',torsoW:15,vest:null,scarf:null,wrist:'#141216',pants:'#2c3040',logo:'pampa'});
  A('ricT',{pants:'#1c1b20',ior:{hair:'crest',hairC:'#2a2420',hi:'#6a625a',len:0,beard:'none',brow:'#2a2420',gray:.4,jaw:.75,stub:.42},top:'#121114',shirt:'#1e1d22',buttons:true,rastra:true,jacket:false,bareFore:false,scarf:null,torsoW:15});
  A('ric5',{ior:{hair:'crest',hairC:'#8a847e',hi:'#ece8e0',len:0,beard:'none',brow:'#5a554e',gray:1,jaw:1,stub:.38,stubC:'#b0aaa0'},top:'#1b1a20',shirt:'#141318',coat:true,rastra:true,overall:null,pants:'#222128',boots:'#121114',bareFore:false,scarf:null,staff:true,torsoW:15.5});
  // físico por época (de las fotos): flaco de pibe, se ensancha en los 90, panza y espalda ancha de grande
  const BODY={ric1:[10.5,.84,0],ricV:[11,.87,0],ric2:[12,.93,0],ricH:[12.8,.98,0],ric3:[13.6,1.03,0],ricM:[14.2,1.06,.15],ricA:[14.8,1.1,.3],ric4:[15.4,1.13,.5],ricT:[16,1.15,.75],ric5:[16.6,1.14,1.05]};
  for(const k in BODY){const [w,b,p]=BODY[k];A(k,{torsoW:w,bulk:b,belly:p});}
  // ropa negra siempre: jeans negros gastados en vez de azules
  A('ric1',{pants:'#26262c'});A('ricV',{pants:'#232329'});A('ric2',{pants:'#1f1f25'});A('ricH',{pants:'#1c1b20'});A('ric4',{pants:'#1e1e23'});
})();
function P2(pts){const p=new Path2D();p.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++){const q=pts[i];if(q.length===4)p.quadraticCurveTo(q[0],q[1],q[2],q[3]);else p.lineTo(q[0],q[1]);}p.closePath();return p;}
let IKB=null;
function DEF(fn){if(IKB)IKB.push({d:fn});else fn();}
function GRP(fn){const prev=IKB;IKB=[];try{fn();}finally{const q=IKB;IKB=prev;ctx.strokeStyle=OUTP;ctx.lineJoin='round';for(const o of q)if(o.s){ctx.lineWidth=o.lw;for(const p of o.s)ctx.stroke(p);}for(const o of q){if(o.s){ctx.fillStyle=o.f;for(const p of o.s)ctx.fill(p);}else o.d();}}}
function INK(paths,fill,lw){if(IKB){IKB.push({s:paths,f:fill,lw:lw||1});return;}ctx.strokeStyle=OUTP;ctx.lineWidth=lw||1;ctx.lineJoin='round';for(const p of paths)ctx.stroke(p);ctx.fillStyle=fill;for(const p of paths)ctx.fill(p);}
function LG(x1,y1,x2,y2,c,hi,lo){const g=ctx.createLinearGradient(x1,y1,x2,y2),H=shade(c,hi||1.16),M=c,S=shade(c,lo||.66);g.addColorStop(0,H);g.addColorStop(.18,shade(c,((hi||1.16)+1)/2));g.addColorStop(.5,M);g.addColorStop(.6,shade(c,.8));g.addColorStop(.68,S);g.addColorStop(.88,S);g.addColorStop(1,shade(c,(lo||.66)*1.12));return g;}
// miembro con forma: más ancho en el medio, puntas redondas y luz del lado de arriba/adelante
function LIMB(x1,y1,x2,y2,w1,w2,c,fl,bul){const dx=x2-x1,dy=y2-y1,l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l,a=w1/2,b=w2/2,bm=Math.max(a,b)*(bul||1.1),mx=(x1+x2)/2,my=(y1+y2)/2,tn=Math.atan2(ny,nx);
  const p=new Path2D();p.moveTo(x1+nx*a,y1+ny*a);p.quadraticCurveTo(mx+nx*bm,my+ny*bm,x2+nx*b,y2+ny*b);p.arc(x2,y2,b,tn,tn-Math.PI,true);p.quadraticCurveTo(mx-nx*bm,my-ny*bm,x1-nx*a,y1-ny*a);p.arc(x1,y1,a,tn+Math.PI,tn,true);p.closePath();
  if(fl){INK([p],'#ffffff',.9);return p;}
  const s=(nx*.45-ny)>0?1:-1;INK([p],LG(mx+nx*bm*s,my+ny*bm*s,mx-nx*bm*s,my-ny*bm*s,c),.9);return p;}
function SHOE2(fx,fy,c,st,fl){const sn=st.sneak||(!st.coat&&parseInt(c.slice(1,3),16)>170);
  const p=sn?P2([[fx-3.4,fy-3.4],[fx+2,fy-3.9],[fx+6.4,fy-2.2,fx+7.6,fy+.4],[fx+7.6,fy+1.8],[fx-3.6,fy+1.8]]):P2([[fx-3.2,fy-6.4],[fx+1.6,fy-6.4],[fx+2.4,fy-3.6],[fx+6.6,fy-2.6,fx+7.2,fy+.2],[fx+7.2,fy+1.8],[fx-3.4,fy+1.8]]);
  if(fl){INK([p],'#fff',.9);return;}INK([p],LG(fx,fy-5,fx,fy+2,c,1.2,.7),.9);
  DEF(()=>{if(sn){ctx.fillStyle='#f4f0e6';ctx.fillRect(fx-3.4,fy+.6,11,1.2);ctx.strokeStyle=shade(c,.62);ctx.lineWidth=.5;ctx.beginPath();ctx.moveTo(fx-.6,fy-3.4);ctx.lineTo(fx+2.6,fy-.4);ctx.moveTo(fx+1,fy-3.6);ctx.lineTo(fx+4,fy-.8);ctx.stroke();}
  else{ctx.fillStyle='rgba(255,255,255,.18)';ctx.fillRect(fx+2.6,fy-2.4,2.4,.7);ctx.fillStyle='rgba(0,0,0,.45)';ctx.fillRect(fx-3.4,fy+1,10.6,.9);}});}
function HAND(hx,hy,a2,c,fl){const p=new Path2D();p.ellipse(hx+.4,hy,3.5,3,a2*-.3,0,7);const t=new Path2D();t.ellipse(hx+2.2,hy-1.9,1.7,1.4,.5,0,7);
  if(fl){INK([p,t],'#fff',.8);return;}const g=ctx.createRadialGradient(hx-.6,hy-1.2,.2,hx,hy,4);g.addColorStop(0,shade(c,1.18));g.addColorStop(.6,c);g.addColorStop(1,shade(c,.75));INK([p,t],g,1);
  DEF(()=>{ctx.strokeStyle=shade(c,.6);ctx.lineWidth=.3;ctx.beginPath();for(let k=-1;k<=1;k++){ctx.moveTo(hx+1.6,hy+k*1.5);ctx.lineTo(hx+3.6,hy+k*1.4);}ctx.moveTo(hx+1.4,hy-2.6);ctx.quadraticCurveTo(hx+2.4,hy,hx+1.4,hy+2.6);ctx.stroke();
    ctx.fillStyle=shade(c,1.12);for(let k=-1;k<=1;k++){ctx.beginPath();ctx.arc(hx+2,hy+k*1.5-.3,.45,0,7);ctx.fill();}});}
// torso en coordenadas locales (cadera en 0,0; cuello en 0,-25; adelante es +x)
function TORSO2(st,f,fl){const w=st.torsoW,h=w/2,bel=(+st.belly||0)*h*.55,c=st.top;
  const pts=[[-h*.95,1.5],[-h*.86,-8,-h*1.0,-15],[-h*1.05,-21,-h*.62,-24],[-1.8,-25.6],[2.4,-25.4],[h*.78,-24.2],[h*1.12,-19,h*1.06,-15],[h*1.0+bel*.6,-11,h*.9+bel,-7],[h*.95+bel*.7,-1.5,h*.92,1.5],[h*.2,2.6],[-h*.6,2.6]];
  const body=P2(pts);if(fl){INK([body],'#fff');return;}
  const g=ctx.createLinearGradient(-h,0,h+bel,0);g.addColorStop(0,shade(c,.62));g.addColorStop(.55,c);g.addColorStop(.85,shade(c,1.18));g.addColorStop(1,shade(c,.9));INK([body],g);
  ctx.save();ctx.clip(body);
  const v=ctx.createLinearGradient(0,-26,0,3);v.addColorStop(0,'rgba(255,240,220,.12)');v.addColorStop(.5,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.25)');ctx.fillStyle=v;ctx.fillRect(-h*2,-27,h*4+bel*2,31);
  const S=(c2,w2,pp)=>{ctx.strokeStyle=c2;ctx.lineWidth=w2;ctx.beginPath();ctx.moveTo(pp[0],pp[1]);for(let i=2;i<pp.length;i+=4)ctx.quadraticCurveTo(pp[i],pp[i+1],pp[i+2],pp[i+3]);ctx.stroke();};
  if(st.camo){const cc=['#3e3c26','#7a7452','#2c2a1c','#6a5a3a'];for(let k=0;k<18;k++){ctx.fillStyle=cc[k%4];ctx.beginPath();ctx.ellipse(-h+((k*7.3)%(w+bel)),-24+((k*5.7)%25),2.2,1.2,k,0,7);ctx.fill();}}
  if(st.overall){ctx.fillStyle=st.overall;ctx.fillRect(-h*1.2,-14,w*1.3+bel,18);ctx.strokeStyle=st.overall;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(-h*.5,-14);ctx.lineTo(-h*.4,-24);ctx.moveTo(h*.6,-14);ctx.lineTo(h*.5,-24);ctx.stroke();ctx.fillStyle=shade(st.overall,.7);ctx.fillRect(h*.1,-11,4,3);}
  if(st.coat){ // guardapolvo de trabajo campera de campo: botonera, cuello, bolsillos
    ctx.strokeStyle=shade(c,.55);ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(h*.62,-24);ctx.quadraticCurveTo(h*.8,-12,h*.7+bel*.6,3);ctx.stroke();
    ctx.fillStyle='#5a5862';for(let k=0;k<4;k++){ctx.beginPath();ctx.arc(h*.76+bel*(k/4)*.5,-21+k*5.5,.65,0,7);ctx.fill();}
    ctx.fillStyle=shade(c,1.35);ctx.beginPath();ctx.moveTo(-1.4,-25.4);ctx.lineTo(3.6,-25.2);ctx.lineTo(h*.9,-21.6);ctx.lineTo(1.4,-22.6);ctx.closePath();ctx.fill();
    ctx.strokeStyle=shade(c,1.3);ctx.lineWidth=.5;ctx.strokeRect(h*.05,-19.8,4,3.4);ctx.fillStyle='#c8c2b4';ctx.fillRect(h*.22,-18.8,.7,.7);
    S(shade(c,.6),.5,[-h*.3,-8,h*.2,-8.6,h*.6,-8]);}
  if(st.buttons&&!st.coat){ // camisa negra campera abotonada (2006 / 2012)
    ctx.strokeStyle='rgba(0,0,0,.55)';ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(h*.58,-24);ctx.lineTo(h*.66+bel*.5,2);ctx.stroke();
    ctx.fillStyle='#6a6872';for(let k=0;k<4;k++){ctx.beginPath();ctx.arc(h*.6+bel*(k/4)*.4,-21+k*5,.55,0,7);ctx.fill();}
    ctx.fillStyle=shade(c,1.38);ctx.beginPath();ctx.moveTo(-1,-25.4);ctx.lineTo(3.4,-25);ctx.lineTo(h*.75,-21.8);ctx.lineTo(1,-22.6);ctx.closePath();ctx.fill();
    ctx.strokeStyle=shade(c,1.35);ctx.lineWidth=.45;ctx.strokeRect(h*.06,-19.4,3.8,3.4);}
  if(st.jacket&&!st.coat){ // campera abierta: se ve la remera, solapa, cierre cruzado y tachas
    ctx.fillStyle=st.shirt||'#ccc';ctx.beginPath();ctx.moveTo(h*.25,-25);ctx.lineTo(h*.95,-23);ctx.quadraticCurveTo(h*1.2+bel*.4,-12,h+bel*.9,2);ctx.lineTo(h*.55,2);ctx.quadraticCurveTo(h*.65,-12,h*.25,-25);ctx.fill();
    ctx.fillStyle=shade(c,1.45);ctx.beginPath();ctx.moveTo(-1,-25.4);ctx.lineTo(h*.35,-25);ctx.lineTo(h*.82,-17.5);ctx.lineTo(h*.08,-20.5);ctx.closePath();ctx.fill();
    if(st.leather||st.studs){S('#d0d4dc',.55,[h*.48,-21,h*.62,-10,h*.58,1]);S('rgba(255,255,255,.26)',1.1,[-h*.6,-20,-h*.2,-14,-h*.5,-5]);ctx.fillStyle='#d8dce4';ctx.fillRect(h*.08,-12,2.5,.6);ctx.fillRect(h*.15,-7,2.2,.6);}
    if(st.studs){ctx.fillStyle='#e4e8f0';for(let k=0;k<5;k++){ctx.beginPath();ctx.arc(-h*.6+k*1.6,-23.4+k*.4,.48,0,7);ctx.fill();}
      ctx.beginPath();ctx.arc(h*.28,-22.5,.5,0,7);ctx.arc(h*.52,-19.5,.5,0,7);ctx.fill();}}
  if(st.logo==='H'){ // logo de Hermética en el pecho y cadenita
    const lx=h*.45,ly=-16.5;ctx.strokeStyle='#c8c4bc';ctx.lineWidth=.4;ctx.beginPath();ctx.arc(1.2,-24.2,2.6,.1,Math.PI*.9);ctx.stroke();
    ctx.strokeStyle='#f2b632';ctx.lineWidth=.55;ctx.beginPath();ctx.arc(lx,ly,2.7,0,7);ctx.stroke();
    ctx.fillStyle='#f2b632';ctx.fillRect(lx-1.5,ly-1.7,.7,3.4);ctx.fillRect(lx+.8,ly-1.7,.7,3.4);ctx.fillRect(lx-1.5,ly-.35,3,.7);}
  if(st.logo==='pampa'){ // Cruz Pampa de Almafuerte en el pecho
    const lx=h*.45,ly=-16.2;ctx.fillStyle='#e2b638';ctx.fillRect(lx-.7,ly-2.4,1.4,4.8);ctx.fillRect(lx-2.4,ly-.7,4.8,1.4);ctx.fillRect(lx-1.5,ly-1.5,3,3);
    ctx.fillStyle='#b82e24';ctx.fillRect(lx-.6,ly-.6,1.2,1.2);}
  if(!st.jacket&&!st.coat&&!st.overall){ // remera o camisa
    ctx.strokeStyle=shade(c,.55);ctx.lineWidth=.8;ctx.beginPath();ctx.arc(.6,-25.2,2.8,.15,Math.PI*.95);ctx.stroke();
    S(shade(c,.72),.45,[-h*.7,-19,-h*.1,-15,h*.3,-16]);S(shade(c,.72),.45,[-h*.6,-10,0,-7.5,h*.7,-9]);
    if(st.tie){ctx.fillStyle=st.shirt||'#eee';ctx.beginPath();ctx.moveTo(-.8,-25.4);ctx.lineTo(h*.75,-24.6);ctx.lineTo(h*.6,-15);ctx.closePath();ctx.fill();ctx.fillStyle=st.tie;ctx.beginPath();ctx.moveTo(h*.45,-24.4);ctx.lineTo(h*.75,-23.6);ctx.lineTo(h*.95,-12);ctx.lineTo(h*.7,-10.4);ctx.lineTo(h*.42,-12.4);ctx.closePath();ctx.fill();
      ctx.fillStyle=shade(c,1.3);ctx.beginPath();ctx.moveTo(h*.2,-25);ctx.lineTo(h*.55,-15);ctx.lineTo(h*.35,-25);ctx.fill();}
    if(st.tee&&typeof st.tee==='string'){ctx.fillStyle='rgba(200,194,176,.55)';ctx.fillRect(-h*.3,-18,h*1.1,1);ctx.fillRect(-h*.2,-16,h*.8,.8);}
    if(st.stripes){ctx.fillStyle=st.stripes;for(let k=-22;k<0;k+=4.5)ctx.fillRect(-h*1.2,k,w*1.3+bel,1.3);}
    if(st.flowers){for(let k=0;k<8;k++){ctx.fillStyle=['#e8c83a','#c8322a','#4f8a3a','#e8e2d0'][k%4];ctx.beginPath();ctx.arc(-h*.7+(k%3)*h*.75,-21+k*2.6,.9,0,7);ctx.fill();}}}
  if(st.vest){ctx.fillStyle=st.vest;ctx.beginPath();ctx.moveTo(-h*1.1,-23);ctx.lineTo(h*.4,-24.6);ctx.lineTo(h*.6,-4);ctx.lineTo(-h*1.1,0);ctx.closePath();ctx.fill();}
  if(st.apron){ctx.fillStyle=st.apron;ctx.beginPath();ctx.moveTo(h*.1,-17);ctx.lineTo(h*1.05+bel,-15);ctx.lineTo(h*1.2+bel,4);ctx.lineTo(h*.1,4);ctx.closePath();ctx.fill();ctx.strokeStyle=shade(st.apron,.7);ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(h*.2,-17);ctx.lineTo(0,-25);ctx.stroke();}
  if(!st.coat&&!st.overall&&(st.bareFore||st.jacket)&&!st.tie){ctx.restore();const hm=P2([[-h*1.02,-2],[h*.98+bel*.7,-2.4],[h*1.04+bel*.75,2.4],[h*.3,3.4,-h*.4,2.6],[-h*1.06,3]]);INK([hm],LG(0,-2,0,3.4,c,1.1,.62),.7);ctx.strokeStyle=shade(c,.55);ctx.lineWidth=.35;ctx.beginPath();ctx.moveTo(-h*.3,-1);ctx.quadraticCurveTo(-h*.1,1.4,-h*.4,2.8);ctx.moveTo(h*.5,-1.4);ctx.quadraticCurveTo(h*.6,1,h*.4,3);ctx.stroke();return;}
  if(st.belt!==false&&!st.coat&&!st.overall){ctx.fillStyle=st.belt||'#141216';ctx.fillRect(-h*1.2,-1.6,w*1.3+bel,2.2);
    if(st.rastra){const rx=h*.52+bel*.75;ctx.fillStyle='#dcd8ce';ctx.beginPath();ctx.ellipse(rx,-.5,2.2,1.5,0,0,7);ctx.fill();ctx.fillStyle='#f4f0e6';ctx.beginPath();ctx.arc(rx-2.8,-.5,.7,0,7);ctx.arc(rx+2.4,-.5,.7,0,7);ctx.fill();}
    else{ctx.fillStyle='#c9c2a8';ctx.fillRect(h*.55+bel*.8,-1.6,1.6,2.2);}}
  if(st.scarf){ctx.fillStyle=st.scarf;ctx.beginPath();ctx.moveTo(-2.4,-25.8);ctx.lineTo(4,-25.4);ctx.lineTo(h*.9,-20);ctx.lineTo(1,-22);ctx.closePath();ctx.fill();}
  if(st.hair==='boina'&&!st.ior){ctx.fillStyle='rgba(91,32,22,.85)';ctx.fillRect(-h*1.2,-25,w*1.3,3);}
  ctx.restore();}
// faldón del guardapolvo: tapa los muslos, se abre con las piernas
function SKIRT(st,hipY,sl,cl,k1,k2,fl){const w=st.torsoW,h=w/2,bel=(+st.belly||0)*h*.4,x0=sl*1.5,y0=hipY-cl*1.5,lo=Math.min(k1[0],k2[0])-h*.6,hi=Math.max(k1[0],k2[0])+h*.75+bel,ky=Math.max(k1[1],k2[1])-1.5;
  const p=P2([[x0-h*.98,y0-3],[x0+h*.95+bel,y0-3],[hi,ky],[(lo+hi)/2,ky+1.4,lo,ky]]);if(fl){INK([p],'#fff');return;}
  INK([p],LG(hi,y0,lo,ky,st.top,1.15,.55));ctx.strokeStyle=shade(st.top,.5);ctx.lineWidth=.5;ctx.beginPath();ctx.moveTo(x0+h*.6,y0-2);ctx.lineTo((hi+x0)/2+1,ky);ctx.stroke();
  ctx.fillStyle=shade(st.top,.45);ctx.beginPath();ctx.arc(x0+h*.66,y0+2,.6,0,7);ctx.fill();ctx.fillStyle=shade(st.top,.7);ctx.fillRect(x0-h*.3,y0+3,h*.9,.5);}
function drawPuppet(f,X,Y){
  const st=f.st,P=livePose(f),s=st.scale,fl=f.flash>0,BK=st.bulk||1;
  ctx.save();ctx.translate(X,Y);ctx.scale(f.face*s,s);ctx.lineCap='round';
  if(P.rot){ctx.translate(0,-Math.abs(Math.sin(P.rot))*6);ctx.rotate(P.rot);}
  const TH=16,SH=16,fy=(a,b)=>Math.cos(a)*TH+Math.cos(b)*SH;
  const hipY=-Math.max(fy(P.ft1,P.ft2),fy(P.bt1,P.bt2))+P.crouch;
  const sl=Math.sin(P.lean),cl=Math.cos(P.lean);
  const nx=sl*25,ny=hipY-cl*25,sx=nx-sl*3.5,sy=ny+cl*3.5;
  const D=(c,k)=>shade(c,k);
  const knee=(a1,ox)=>[ox+Math.sin(a1)*TH,hipY+Math.cos(a1)*TH];
  const leg=(a1,a2,ox,col,boot)=>{const [kx,ky]=knee(a1,ox),fx=kx+Math.sin(a2)*SH,fy2=ky+Math.cos(a2)*SH;
    GRP(()=>{SHOE2(fx,fy2,boot,st,fl);LIMB(kx,ky,fx,fy2-2,6.6*BK,st.bell?8.6:4.6*BK,col,fl,st.bell?1:1.14);LIMB(ox,hipY,kx,ky,10*BK,6.8*BK,col,fl,1.1);});
    if(!fl){const bend=Math.max(0,a1-a2),F=(x1,y1,cx,cy,x2,y2,c2,w2)=>{ctx.strokeStyle=c2;ctx.lineWidth=w2;ctx.beginPath();ctx.moveTo(x1,y1);ctx.quadraticCurveTo(cx,cy,x2,y2);ctx.stroke();};
      const dk=shade(col,.55),lt=shade(col,1.25),tx=Math.sin(a1),ty=Math.cos(a1);
      for(let k=0;k<2+(bend>.4?2:0);k++){const t=.6+k*.09,px=ox+tx*TH*t,py=hipY+ty*TH*t;F(px-3,py-.4+k*.3,px-.6,py+1.2,px+2.4,py-.8,dk,.45);}
      F(kx-2.8,ky+.6,kx-1.2,ky+2.4,kx-2.2,ky+4,dk,.4);F(kx+.4,ky-2.6,kx+2.2,ky-1.6,kx+2.6,ky,lt,.35);
      const ax=fx+.6,ay=fy2-4.6;F(ax-2.6,ay,ax-.4,ay+1,ax+2.2,ay-.4,dk,.4);F(ax-2.2,ay+1.4,ax,ay+2.2,ax+2.4,ay+1.2,dk,.35);
      if(/^#[23][a-f0-9][3-5]/i.test(col)||st.sneak){ctx.strokeStyle='rgba(220,200,150,.28)';ctx.lineWidth=.35;ctx.beginPath();ctx.moveTo(ox-3,hipY+2);ctx.lineTo(kx-2.6,ky);ctx.lineTo(fx-2,fy2-3);ctx.stroke();}}};
  const arm=(a1,a2,ox,col,skin,weapon,back)=>{const x0=sx+ox,ex=x0+Math.sin(a1)*12.5,ey=sy+Math.cos(a1)*12.5,hx=ex+Math.sin(a2)*12,hy=ey+Math.cos(a2)*12,bare=st.bareFore;
    GRP(()=>{if(bare){LIMB(x0,sy,ex,ey,6*BK,4.8*BK,skin,fl);const mx=x0+(ex-x0)*.55,my=sy+(ey-sy)*.55;LIMB(x0,sy,mx,my,7.4*BK,6.6*BK,col,fl,1.05);}
      else LIMB(x0,sy,ex,ey,6.8*BK,5.4*BK,col,fl,1.12);
      LIMB(ex,ey,hx,hy,(bare?5:5.6)*BK,(bare?3.8:4.6)*BK,bare?skin:col,fl,1.12);
      if(!fl&&!bare)DEF(()=>{ctx.fillStyle=shade(col,.5);const cx=ex+(hx-ex)*.82,cy=ey+(hy-ey)*.82;ctx.beginPath();ctx.arc(cx,cy,2.4,0,7);ctx.fill();});
      if(!(weapon||st.staff&&back))HAND(hx,hy,a2,skin,fl);});
    if(!fl&&!bare){ctx.strokeStyle=shade(col,.52);ctx.lineWidth=.4;for(let k=0;k<3;k++){const t=.72+k*.1,px=x0+(ex-x0)*t,py=sy+(ey-sy)*t;ctx.beginPath();ctx.moveTo(px-1.8,py-.6);ctx.quadraticCurveTo(px,py+.8,px+1.6,py-.4);ctx.stroke();}}
    if(!fl&&st.wrist){const wx=ex+(hx-ex)*.78,wy=ey+(hy-ey)*.78;LIMB(ex+(hx-ex)*.66,ey+(hy-ey)*.66,wx,wy,5,4.6,st.wrist,false,1);
      if(st.studs){ctx.fillStyle='#e0e4ec';ctx.beginPath();ctx.arc(wx-1.2,wy-.8,.4,0,7);ctx.arc(wx+1.2,wy+.6,.4,0,7);ctx.fill();}}
    if(st.tattoo&&bare&&!fl&&!back){ctx.fillStyle='rgba(28,44,72,.68)';ctx.beginPath();ctx.ellipse((ex+hx)/2,(ey+hy)/2,1.7,1.1,a2,0,7);ctx.fill();}
    if(weapon||st.staff&&back)HAND(hx,hy,a2,skin,fl);
    if(st.staff&&!weapon&&back&&(f.state==='idle'||f.state==='walk'||f.state==='stand')&&!fl){ // el bastón de madera de los últimos shows
      ctx.strokeStyle=OUTP;ctx.lineWidth=2.6;ctx.beginPath();ctx.moveTo(hx+3,hy-30);ctx.quadraticCurveTo(hx+1,hy-10,hx+2.6,-1);ctx.stroke();ctx.strokeStyle='#7a5a36';ctx.lineWidth=1.7;ctx.stroke();
      ctx.strokeStyle='#a8865a';ctx.lineWidth=.5;ctx.beginPath();ctx.moveTo(hx+2.6,hy-29);ctx.quadraticCurveTo(hx+.6,hy-10,hx+2.1,-2);ctx.stroke();HAND(hx,hy,a2,skin,fl);}
    if(weapon)HELD(weapon,hx,hy,a2,f,st);};
  const topB=D(st.top,.72),skB=D(st.skin,.8),pantB=D(st.pants,.72),bootB=D(st.boots,.8);
  arm(P.ba1,P.ba2,-1.5,topB,skB,f.holdBack,true);
  leg(P.bt1,P.bt2,-1.5,pantB,bootB);
  const hx=nx+Math.sin(P.lean+P.tilt*.5)*6.4,hy=ny-Math.cos(P.lean+P.tilt*.5)*6.4;
  LIMB(nx+.6,ny+2,hx-Math.sin(P.lean)*.4,hy+3,(st.ior&&st.ior.jaw?5.8:4.8)*BK,4.3*BK,D(st.skin,.86),fl,1);
  const br=(f.state==='idle'||f.state==='stand')?Math.sin(tick*.07+(f.x||0)*.1)*.018:0;
  ctx.save();ctx.translate(0,hipY);ctx.rotate(P.lean);ctx.scale(1+br*.5,1+br);TORSO2(st,f,fl);ctx.restore();
  leg(P.ft1,P.ft2,1.5,st.pants,st.boots);
  if(st.coat)SKIRT(st,hipY,sl,cl,knee(P.ft1,1.5),knee(P.bt1,-1.5),fl);
  if(!fl){ctx.fillStyle='rgba(30,16,12,.3)';ctx.beginPath();ctx.ellipse(hx+1,hy+5.4,3,1.4,P.lean,0,7);ctx.fill();}
  if(st.lizard)drawHead(hx,hy,P.lean*.5+P.tilt,st,fl);else drawHead2(hx,hy,P.lean*.5+P.tilt,st,fl,(f.state==='walk'?Math.sin(tick*.25)*1.4+1.2:Math.sin(tick*.05+(f.x||0))*.4)+(f.state==='hurt'?2:0));
  arm(P.fa1,P.fa2,1.5,st.top,st.skin,f.state==='spec'?'bass':f.hold,false);
  ctx.restore();
}
// cabeza de perfil 3/4 con rasgos reales de Ricardo Iorio por época: nariz aguileña con caballete, cejas espesas y bajas,
// mirada hundida, pómulos marcados y mejillas hundidas de joven, mandíbula ancha y papada de grande, melena/rapado/cresta/pelo blanco.
function headSpec(st){const I=st.ior;if(I)return Object.assign({},I,{hair:I.hair||'long',isIor:1});
  const h=st.hair||'short',old=['#d8d2c6','#c8c2b8','#8a8278','#7a746c','#6a625a'].includes(st.hairC);
  return {hair:h,hairC:st.hairC||'#1a1410',hi:shade(st.hairC||'#1a1410',1.7),len:h==='long'?13:0,beard:st.beard?'full':(st.stache?'stache':'none'),stacheC:st.stache,beardC:st.beardC||st.hairC,brow:shade(st.hairC||'#2a2018',.9),gray:old?1:0,age:old,jaw:st.belly?.6:0,stub:st.belly?.25:.1};}
function drawHead2(hx,hy,a,st,fl,sw){sw=sw||0;const H=headSpec(st),sk=fl?'#fff':st.skin,hc=fl?'#fff':H.hairC,hi=H.hi||shade(hc,1.6),jw=H.jaw||0,len=H.len||0,cur=H.curly,ior=H.isIor,thin=H.thin||0,fat=H.fat||0;
  ctx.save();ctx.translate(hx,hy);ctx.rotate(a);ctx.scale(.86,.86);
  const S=(c,w,pp)=>{ctx.strokeStyle=c;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(pp[0],pp[1]);for(let i=2;i<pp.length;i+=4)ctx.quadraticCurveTo(pp[i],pp[i+1],pp[i+2],pp[i+3]);ctx.stroke();};
  const wave=(x1,y1,x2,y2,n,amp)=>{const out=[];for(let k=1;k<=n;k++){const t=k/n,px=x1+(x2-x1)*t,py=y1+(y2-y1)*t,mx=x1+(x2-x1)*(t-.5/n),my=y1+(y2-y1)*(t-.5/n)+amp;out.push([mx,my,px,py]);}return out;};
  // pelo de atrás (melena)
  if(H.hair==='long'){const back=P2([[-1,-9.6],[-8,-8.8,-9.2,-2],[-10.2+(cur?-1.8:0)-sw*.4,len*.5,-9.6+(cur?-1.6:0)-sw,len+.6],...wave(-9.6+(cur?-1.6:0)-sw,len+.6,-.4-sw*.6,len-.6,cur?5:3,cur?2.1:1.5),[1.4,4],[1,-4]]);
    INK([back],fl?'#fff':LG(-9,-4,0,len,hc,1.3,.58),1);
    if(!fl)for(let k=0;k<6;k++)S(k%2?hi:shade(hc,.58),.45,[-2-k*1.2,-8,-8-k*.3+(cur?Math.sin(k)*1.6:0),len*.4,-7.6+k*1.1,len-1.2]);}
  if(H.hair==='swept'){const back=P2([[-1.8,-8.6],[-9,-6.4,-9,.4],[-9.2,4.6,-7,6.8],[-3.8,6.2],[-1.8,3.2]]);INK([back],fl?'#fff':shade(hc,.86),1);}
  // cráneo y cara (con caballete nasal y mandíbula/papada de Iorio cuando isIor=1)
  const j=jw*1.25+fat*.8-thin*.35;
  const skull=new Path2D();skull.ellipse(-.4,-1.6,6.8+fat*.4,7,0,0,7);
  const face=ior
    ?P2([[2,-7.6],[5.8,-6.8,7.1,-3.3],[7.8,-2.1],[7.7,-1.1],[9.2,.6],[10.5,2.4],[10.2,3.4],[8.5,3.7],[8.6,4.7],[8.0,5.3],[8.4,6.1],[7.9,7.0],[8.3,8.9+j*.35,6.8,9.8+j*.45],[4.2,10.7+j*.85,1.2,9.8+j*1.05],[-1.8-j,8.4+j*.7,-3-j,4.6],[-3.8,1],[-3,-4]])
    :P2([[2,-7.4],[5.6,-6.6,6.8,-3.4],[7.6,-2.2],[7.9,-1],[9.8,2.6],[9.6,3.3],[8.2,3.6],[8.5,4.6],[7.9,5.2],[8.3,6.1],[7.9,6.9],[8.1,8.8+j*.4,6.6,9.6+j*.5],[4,10.4+j*.8,1.6,9.4+j],[-1.4-j,8+j*.6,-2.6-j,4.6],[-3.6,1],[-3,-4]]);
  if(fl)INK([skull,face],'#fff');
  else{const g=ctx.createRadialGradient(5,-1,.5,1,1,11.5);g.addColorStop(0,shade(sk,1.08));g.addColorStop(.45,sk);g.addColorStop(.64,shade(sk,.88));g.addColorStop(1,shade(sk,.7));INK([skull,face],g);
    ctx.save();ctx.clip(face);
    if(H.stub){ctx.fillStyle=H.stubC?'rgba(165,160,152,'+(H.stub*.6)+')':'rgba(36,26,24,'+(H.stub*.52)+')';ctx.beginPath();ctx.moveTo(9.2,4.2);ctx.lineTo(8.8,10.8);ctx.lineTo(-3.4,9.6);ctx.lineTo(-2.6,3.4);ctx.quadraticCurveTo(2.2,6,6.8,4.1);ctx.closePath();ctx.fill();}
    if(ior&&thin>.3){ // mejilla hundida y pómulo saliente de pibe (1978-1994)
      ctx.fillStyle='rgba(55,22,14,'+(.22+thin*.18)+')';ctx.beginPath();ctx.ellipse(3.6,4.2,2.4,3.1,.2,0,7);ctx.fill();
      ctx.fillStyle='rgba(255,236,214,.28)';ctx.beginPath();ctx.ellipse(5.5,1.4,2.1,1.1,-.25,0,7);ctx.fill();
    }else{
      ctx.fillStyle='rgba(150,50,40,.14)';ctx.beginPath();ctx.ellipse(4.6,3.4,2.2,2.4,0,0,7);ctx.ellipse(8.6,2.4,1,.8,0,0,7);ctx.fill();
      ctx.fillStyle='rgba(60,30,20,.16)';ctx.beginPath();ctx.ellipse(1.6,-2,2.6,4,0,0,7);ctx.fill();
      ctx.fillStyle='rgba(255,236,214,.22)';ctx.beginPath();ctx.ellipse(5.4,1.6,1.8,1,-.3,0,7);ctx.fill();
    }
    if(ior&&fat>.25){ // surco nasogeniano, cachete caído y papada de grande (1998-2023)
      S(shade(sk,.55),.45,[7.4,3.6,5.8,5.8,6.2,8.2]);
      ctx.fillStyle='rgba(45,18,12,'+(.22+fat*.16)+')';ctx.beginPath();ctx.ellipse(1.2,9.8+j,6.4,2.4,0,0,7);ctx.fill();
    }else{
      ctx.fillStyle='rgba(40,18,12,.25)';ctx.beginPath();ctx.ellipse(1,9.6+j,6,2,0,0,7);ctx.fill();
    }
    ctx.restore();
    // oreja
    if(!(H.hair==='long')){const e=new Path2D();e.ellipse(-.8,1.4,1.6,2.4,.1,0,7);INK([e],shade(sk,.86),.7);S(shade(sk,.6),.35,[-.4,0,-1.4,1.4,-.4,2.6]);}
    // ojo profundo bajo ceja pesada
    ctx.fillStyle=ior?'rgba(42,18,12,.38)':'rgba(50,24,16,.28)';ctx.beginPath();ctx.ellipse(5.6,-.9,2.4,1.5,0,0,7);ctx.fill();
    ctx.fillStyle='#e9dfd2';ctx.beginPath();ctx.moveTo(4.3,-.6);ctx.quadraticCurveTo(5.5,-1.5,6.7,-.8);ctx.quadraticCurveTo(5.6,-.1,4.3,-.6);ctx.fill();
    ctx.fillStyle='#26160c';ctx.beginPath();ctx.arc(5.9,-.75,.55,0,7);ctx.fill();ctx.fillStyle='rgba(255,255,255,.75)';ctx.fillRect(6,-1.1,.32,.32);
    S('#160c08',.55,[4.1,-.7,5.4,-1.8,6.8,-.9]);
    if(ior||H.age||H.gray>=1){S(shade(sk,.58),.35,[4.5,.35,5.6,.9,6.7,.25]);}
    if(H.age||H.gray>=1||fat>.4){S(shade(sk,.58),.35,[7.4,3.8,6.7,5.3,6.9,6.8]);S(shade(sk,.64),.32,[3,-4.4,5,-4.8,6.6,-4.2]);}
    // ceja (en Iorio: gruesa, recta, baja y con entrecejo fruncido)
    ctx.fillStyle=fl?'#fff':(H.brow||hc);
    if(ior){ctx.beginPath();ctx.moveTo(3.4,-2.1);ctx.quadraticCurveTo(5.4,-3.3,7.7,-2.4);ctx.lineTo(7.5,-1.4);ctx.quadraticCurveTo(5.4,-2.1,3.5,-1.2);ctx.closePath();ctx.fill();
      S(shade(sk,.55),.4,[7.1,-3.1,7.3,-1.8,7.4,-1.2]);}
    else{ctx.beginPath();ctx.moveTo(3.8,-2.2);ctx.quadraticCurveTo(5.4,-3.4,7.4,-2.6);ctx.lineTo(7.2,-1.9);ctx.quadraticCurveTo(5.4,-2.5,3.9,-1.4);ctx.closePath();ctx.fill();}
    // nariz (con caballete marcado en Iorio) y boca firme
    if(ior){
      S(shade(sk,.62),.55,[7.4,-.6,8.6,1.6,8.7,3.3]);S('rgba(255,238,215,.45)',.45,[7.7,-.8,9.1,.8,9.8,2.5]);
      ctx.fillStyle=shade(sk,.48);ctx.beginPath();ctx.ellipse(8.6,3.3,.78,.44,.3,0,7);ctx.fill();
      ctx.fillStyle='rgba(255,240,226,.38)';ctx.beginPath();ctx.ellipse(9.5,2.3,.65,.52,0,0,7);ctx.fill();
      S(shade(sk,.44),.6,[8.2,5.4,7.1,5.6,5.9,5.6]);ctx.fillStyle='rgba(140,65,55,.45)';ctx.beginPath();ctx.ellipse(7.4,6.1,.95,.42,0,0,7);ctx.fill();
    }else{
      S(shade(sk,.66),.5,[7.4,-.4,8.2,1.8,8.4,3.2]);ctx.fillStyle=shade(sk,.5);ctx.beginPath();ctx.ellipse(8.4,3.2,.7,.4,.3,0,7);ctx.fill();
      ctx.fillStyle='rgba(255,240,226,.35)';ctx.beginPath();ctx.ellipse(9,2.1,.6,.5,0,0,7);ctx.fill();
      S(shade(sk,.48),.55,[8,5.4,7.2,5.7,6.3,5.4]);ctx.fillStyle='rgba(150,70,60,.45)';ctx.beginPath();ctx.ellipse(7.5,6.1,.9,.45,0,0,7);ctx.fill();
    }}
  // barba y bigote
  const bc=fl?'#fff':(H.beardC||hc),sc=fl?'#fff':(H.stacheC||hc);
  if(H.beard==='full'||H.beard==='long'){const by=H.beard==='long'?17:11.4;const b=P2([[-2.6,3.4],[-1.4,8.4,2,by-1],[5.4,by+.6,8,by-2.4],[8.6,7.6],[8.2,6.2],[7,6.6,6.4,5.6],[3,6],[-.6,4.4]]);INK([b],bc,.8);
    if(!fl)for(let k=0;k<7;k++)S(shade(bc,k%2?1.5:.7),.3,[k*1.2-1,6,k*1.1,by-3,k*1.2+.6,by-1.2]);}
  if(H.beard==='candado'){const b=P2([[6,5.6],[8.3,5.6],[8.4,8.4],[6.8,10.2],[4.4,10],[5,7.4]]);INK([b],bc,.6);}
  if(H.beard&&H.beard!=='none'){const m=P2([[6,3.9],[8.6,3.6],[8.9,4.7],[8.2,5.2],[7.2,4.9],[6.6,5.6],[6.4,7.2],[5.7,7],[5.6,5]]);INK([m],sc,.6);}
  // pelo de adelante
  const HP=(p,c2)=>INK([p],fl?'#fff':c2,.9);
  if(H.hair==='long'){const cap=P2([[2.2,-9.8],[-4.8,-10,-7.6,-5],[-8.2,0,-7,4],[-3,4],[-2.4,-2],[0,-6.2]]);HP(cap,LG(0,-10,-6,4,hc,1.25,.6));
    const side=P2([[1.6,-9.8],[5.8,-8.8,6.6,-5.4],[4.6,-6,3.4,-4.4],[2.8,-1.8,2.4,2.2],[2.5+(cur?.9:0)-sw*.3,len*.6,2.1-sw*.7,len-1.4],...wave(2.1-sw*.7,len-1.4,-3.2-sw,len-.4,cur?3:2,cur?1.7:1.1),[-3.2,3],[-3.8,-4],[-2,-8]]);
    HP(side,fl?'#fff':LG(4,-8,-3,len,hc,1.35,.62));
    if(!fl){for(let k=0;k<5;k++)S(k%2?hi:shade(hc,.55),.44,[1.6-k*.5,-9,3.6-k*.9,-2,1.6-k*1.1,len-1.8]);S(shade(hc,.5),.4,[1.6,-9.6,2.6,-7.4,4.4,-6.6]);
      if(cur){ctx.lineWidth=.42;for(let k=0;k<24;k++){ctx.strokeStyle=k%3?shade(hc,1.55):shade(hc,.55);const cx=-8.8+(k%5)*2.4+Math.sin(k*2.3)*.8,cy=-6+((k/5)|0)*(len+5)/5;ctx.beginPath();ctx.arc(cx,cy,.95,k,k+3.6);ctx.stroke();}}
      if(H.gray){ctx.globalAlpha=Math.min(1,H.gray);for(let k=0;k<4;k++)S('#d8d4cc',.35,[1-k*.8,-9,3-k,-2,1.2-k,len-3]);ctx.globalAlpha=1;}}}
  else if(H.hair==='short'||H.hair==='slick'){const p=P2([[6,-6],[4.4,-9.4,-.8,-9.2],[-6.6,-8.6,-7.4,-3.4],[-7.6,1.6,-5.8,3.2],[-3,2.8],[-1.6,-.6],[.4,-1],[1.6,-4.4],[4,-5]]);
    HP(p,LG(2,-9,-5,2,hc,1.35,.7));if(!fl){if(H.hair==='slick')for(let k=0;k<5;k++)S(hi,.35,[4.6-k*.4,-7.8+k*.6,0,-8.6+k*.9,-6-k*.2,-5+k]);else for(let k=0;k<9;k++)S(k%2?shade(hc,1.5):shade(hc,.6),.3,[4-k*1.2,-8.2+k*.3,1-k*1.3,-9+k*.6,-2.6-k*.6,-7.6+k*1.1]);
      ctx.fillStyle=hc;ctx.fillRect(.2,-1.2,1.2,3.2);}}
  else if(H.hair==='buzz'){const p=P2([[5.6,-5.8],[3.6,-9.4,-1,-9.4],[-6.8,-8.8,-7.4,-3.4],[-7.4,1.4,-5.6,2.8],[-3,2.6],[-1.4,-.4],[.6,-1],[1.8,-4.2]]);INK([p],fl?'#fff':'rgba(28,20,16,.68)',.5);
    if(!fl){ctx.fillStyle='rgba(18,12,8,.55)';for(let k=0;k<28;k++)ctx.fillRect(-6.4+(k*2.7)%11.4,-8.6+((k*1.9)%10),.45,.45);}}
  else if(H.hair==='crest'){
    const sides=P2([[5.4,-5.6],[3,-8.8,-1,-8.8],[-6.6,-8.4,-7.4,-3.4],[-7.4,1.4,-5.6,2.8],[-3,2.6],[-1.4,-.4],[.6,-1],[1.6,-4]]);
    INK([sides],fl?'#fff':'rgba('+(H.gray?'110,105,98':'36,28,24')+',.58)',.4);
    const top=P2([[6.2,-5.6],[5.8,-8.8],[4.6,-12.4],[3.2,-10.8],[1.8,-13.2],[.2,-11.4],[-1.4,-13.0],[-3.2,-11.2],[-5.2,-12.4],[-6.8,-9.2],[-7.6,-6.2],[-7.2,-2.5],[-5.8,-2.2],[-5.2,-5.8],[-1.4,-8.2],[3.6,-7.4]]);
    HP(top,LG(0,-13,0,-5,hc,1.4,.65));
    if(!fl){
      const tipCol=H.gray>=1?'#f0ece4':H.gray?'#a8a29a':hi;
      for(let k=0;k<8;k++){
        const px=4.8-k*1.5,py=-7.2+k*.3,tx=4.0-k*1.6,ty=-11.8+(k%2?-.8:.4);
        S(k%2?tipCol:shade(hc,.6),.42,[px,py,tx+.6,ty+1.6,tx,ty]);
      }
      if(H.gray){
        ctx.strokeStyle=H.gray>=1?'#ffffff':'rgba(210,205,198,.85)';ctx.lineWidth=.35;
        ctx.beginPath();ctx.moveTo(4.6,-12.4);ctx.lineTo(1.8,-13.2);ctx.lineTo(-1.4,-13.0);ctx.lineTo(-5.2,-12.4);ctx.stroke();
      }
    }
  }
  else if(H.hair==='swept'){const p=P2([[4.6,-6.8],[3.8,-10.6,-1.4,-10.4],[-6.8,-9.8,-8.6,-4.8],[-9.0,.6,-7.8,4.0],[-5.6,4.8],[-3.2,2.8],[-1.6,-.6],[.4,-1.4],[.6,-4],[2.8,-5.6]]);
    HP(p,LG(2,-10,-6,4,hc,1.22,.68));
    if(!fl){for(let k=0;k<8;k++)S(k%2?'#f4f0e8':shade(hc,.72),.34,[4.4-k*.3,-7.4+k*.55,-1-k*.4,-10.2+k*1.15,-7.6+k*.1,-4+k*1.15]);ctx.fillStyle=shade(hc,.82);ctx.fillRect(-.3,-1.4,1.2,3.2);}}
  else if(H.hair==='cap'){const p=P2([[7.2,-5],[6,-10.4,-1,-10.2],[-7.2,-9.6,-7.4,-4.2],[-6,-3.6],[7,-3.4]]);HP(p,LG(0,-10,0,-3,st.capC||'#333',1.3,.7));
    const v=P2([[5.6,-4.6],[11.6,-4.2],[11.4,-3],[5.2,-3.2]]);HP(v,shade(st.capC||'#333',.6));
    if(!fl){ctx.fillStyle=hc;ctx.fillRect(-6.6,-3.6,4,4.6);}}
  else if(H.hair==='boina'){const p=P2([[7.8,-5.6],[7.4,-10.6,-1,-10.8],[-8.6,-10.4,-8.4,-5.2],[0,-4.2]]);HP(p,LG(0,-11,0,-4,'#23212b',1.4,.7));if(!fl){ctx.fillStyle=hc;ctx.fillRect(-6.4,-5,3.4,5);}}
  else if(H.hair==='bald'&&!fl){ctx.fillStyle='rgba(40,30,26,.22)';ctx.beginPath();ctx.ellipse(-3.6,-1.4,3.6,4,0,0,7);ctx.fill();ctx.fillStyle='rgba(255,240,226,.12)';ctx.beginPath();ctx.ellipse(1,-6.6,2.4,1,-.2,0,7);ctx.fill();}
  if(st.band&&!fl){ctx.fillStyle=st.band;ctx.beginPath();ctx.moveTo(-6.8,-6.4);ctx.lineTo(6.2,-6.6);ctx.lineTo(6.4,-5);ctx.lineTo(-6.8,-4.6);ctx.closePath();ctx.fill();}
  if(st.glasses&&!fl){ctx.fillStyle='rgba(10,10,14,.9)';ctx.beginPath();ctx.moveTo(3.8,-1.8);ctx.lineTo(7.8,-1.8);ctx.lineTo(7.6,.3);ctx.lineTo(4.2,.3);ctx.closePath();ctx.fill();ctx.fillStyle='rgba(160,190,230,.6)';ctx.fillRect(6.2,-1.4,.8,.6);ctx.fillStyle='#141218';ctx.fillRect(-1,-1.6,5,.5);}
  if(st.cigar&&!fl){ctx.fillStyle='#6a4426';ctx.fillRect(7.6,5.2,5.4,1.4);ctx.fillStyle=tick%20<10?'#ff6a2a':'#c8322a';ctx.fillRect(12.6,5.2,1,1.4);}
  ctx.restore();}

// v18: guiños al artista. Un objeto para juntar por capítulo (la entrada de cine de 1978 y después sus discos reales),
// afiches de época en las paredes y la moto que vio de chico. Todo sale de la investigación (ricardio/investigacion-iorio.md).
const DISCOS=[
 {t:'ENTRADA DE CINE',c:'#d8c08a',s:'Julio de 1978: en una proyección de una película de Led Zeppelin conoció al Chofa Moreno. Con él armó V8.'},
 {t:'LUCHANDO POR EL METAL',c:'#c8322a',s:'El primer disco de V8 salió en 1983, con Pappo de invitado.'},
 {t:'UN PASO MÁS EN LA BATALLA',c:'#e8c83a',s:'El segundo disco de V8. Después vino "El fin de los inicuos" y la banda se separó a mediados de los 80.'},
 {t:'HERMÉTICA',c:'#3a8ad8',s:'El primer disco de Hermética salió en 1989. Él tocaba el bajo y escribía las letras.'},
 {t:'ÁCIDO ARGENTINO',c:'#8ad83a',s:'"Ácido argentino" salió en 1991. Antes salió el EP "Intérpretes", con "Cambalache".'},
 {t:'VÍCTIMAS DEL VACIAMIENTO',c:'#d87a3a',s:'El último disco de estudio de Hermética, de 1994. En 1995 salió "Lo último", en vivo en Obras.'},
 {t:'MUNDO GUANACO',c:'#e8e2d0',s:'El primer disco de Almafuerte, de 1995. El nombre de la banda homenajea al poeta Pedro B. Palacios.'},
 {t:'PIEDRA LIBRE',c:'#c8a060',s:'Almafuerte sacó "Piedra libre" en 2001. Antes: "Del entorno", "Almafuerte" y "A fondo blanco".'},
 {t:'TORO Y PAMPA',c:'#a83a2a',s:'"Toro y pampa" salió en 2006, ya con la vida de campo como tema.'},
 {t:'TRILLANDO LA FINA',c:'#6a8a3a',s:'El último disco de Almafuerte, de 2012. Como solista grabó "Tangos y milongas" (2014) y "Atesorando en los cielos" (2015).'}];
// afiches: [x, título, línea 1, línea 2, color]
const AFICHES=[
 [[520,'CINE','LED ZEPPELIN','LA PELÍCULA','#d8c08a'],[1640,'EL RELOJ','EN VIVO','ROCK PESADO','#c8322a']],
 [[560,'SE BUSCA','BATERISTA','PREG. POR RICARDO','#e8e2d0'],[1700,'PAPPO\'S BLUES','EN VIVO','','#e8c83a']],
 [[480,'BA ROCK IV','NOVIEMBRE','1982','#ff5ac8'],[1500,'RIFF','V8','LOS VIOLADORES','#c8322a']],
 [[700,'HERMÉTICA','PUB HELLOWEEN','SAN MARTÍN','#3a8ad8'],[1600,'HERMÉTICA','CENTRO CULTURAL','RECOLETA · GRATIS','#e8e2d0']],
 [[520,'HERMÉTICA','ÁCIDO','ARGENTINO','#8ad83a'],[1560,'1 PESO','=','1 DÓLAR','#c8c2b0']],
 [[560,'MONSTERS','OF ROCK','RIVER 3/9/94','#ff5a3a'],[1700,'DISCO DE ORO','OBRAS','12/11/94','#e8c83a']],
 [[520,'ALMAFUERTE','BIBLIOTECA','DE OLIVOS','#e8e2d0'],[1640,'ALMAFUERTE','ARPEGIOS','','#c8322a']],
 [[640,'IORIO','Y FLAVIO','PESO ARGENTO','#3a8ad8'],[1700,'ALMAFUERTE','PIEDRA LIBRE','GIRA','#c8a060']],
 [[600,'ALMAFUERTE','TORO Y PAMPA','','#a83a2a'],[1500,'PEÑAROL','MAR DEL PLATA','AGUANTE PELUSA','#f2d22a']],
 [[620,'UNAS ESTROFAS','MÁS · GIRA 2023','CON CHEWELCHE','#f2b632'],[1600,'ALL BOYS 2013','25 MIL','EN EL ESTADIO','#e8e2d0']]];
let GUI={moto:null,got:{}};
function guiReset(){GUI.moto=null;if(DISCOS[lvl])items.push({kind:'disco',x:Math.round(LW*.52),y:232,z:0,vz:0,t:0});}
function guiPick(it,f){if(it.kind!=='disco')return false;it.gone=true;const D=DISCOS[lvl];score+=1000;GUI.got[lvl]=1;sfx('pickup');
  floatTxt(f.x,f.y-90,'¡'+D.t+'! +1000',D.c);dato={s:D.s,t:420};say(f,lvl===0?'Esta la guardo.':'¡Este disco es mío!',80);return true;}
function drawDisco(X,y){const D=DISCOS[lvl]||DISCOS[0];
  if(lvl===0){ctx.fillStyle=OUT;ctx.fillRect(X-9,y-8,18,10);ctx.fillStyle=D.c;ctx.fillRect(X-8,y-7,16,8);ctx.fillStyle='#6a4a2a';ctx.fillRect(X+3,y-7,1,8);ctx.fillStyle='#3a2414';ctx.fillRect(X-6,y-5,7,1);ctx.fillRect(X-6,y-3,5,1);return;}
  const sp=(tick*.08)%6.3;ctx.fillStyle=OUT;ctx.beginPath();ctx.arc(X,y-6,8.5,0,7);ctx.fill();ctx.fillStyle='#141216';ctx.beginPath();ctx.arc(X,y-6,7.6,0,7);ctx.fill();
  ctx.strokeStyle='rgba(255,255,255,.12)';ctx.lineWidth=.6;ctx.beginPath();ctx.arc(X,y-6,5.6,sp,sp+1.2);ctx.stroke();ctx.beginPath();ctx.arc(X,y-6,6.6,sp+3,sp+4);ctx.stroke();
  ctx.fillStyle=D.c;ctx.beginPath();ctx.arc(X,y-6,2.8,0,7);ctx.fill();ctx.fillStyle='#000';ctx.fillRect(X-.5,y-6.5,1,1);
  if(tick%40<20){ctx.fillStyle='rgba(255,240,200,.8)';ctx.fillRect(X+5,y-13,1.5,1.5);}}
function drawAfiche(x,a,b,c,col){const X=Math.round(x),Y=118,out=lvl>=8;
  if(out){ctx.fillStyle='#4a3424';ctx.fillRect(X+14,Y+38,4,40);}
  ctx.fillStyle='rgba(0,0,0,.35)';ctx.fillRect(X+2,Y+2,32,40);ctx.fillStyle='#d8d0bc';ctx.fillRect(X,Y,32,40);ctx.fillStyle=col;ctx.fillRect(X,Y,32,11);
  ctx.fillStyle='rgba(60,40,20,.18)';ctx.fillRect(X,Y+30,32,10);ctx.fillRect(X+24,Y,8,40);
  ctx.save();ctx.font='4px '+FONT;ctx.textAlign='center';ctx.textBaseline='top';ctx.fillStyle='#141216';const T=s=>U(s);
  const fit=(s,y,c2)=>{s=T(s);let sz=4;while(sz>2.4&&ctx.measureText(s).width>30){sz-=.4;ctx.font=sz+'px '+FONT;}ctx.fillStyle=c2;ctx.fillText(s,X+16,y);ctx.font='4px '+FONT;};
  fit(a,Y+4,'#141216');fit(b,Y+17,'#2a2228');if(c)fit(c,Y+26,'#5a2a22');ctx.restore();
  ctx.fillStyle='#9aa0a8';ctx.fillRect(X+1,Y+1,1,1);ctx.fillRect(X+30,Y+1,1,1);}
function drawGuinos(cx){for(const [x,a,b,c,col] of (AFICHES[lvl]||[]))if(x-cx>-40&&x-cx<W+10)drawAfiche(x-cx,a,b,c,col);
  const M=GUI.moto;if(M){const X=M.x-cx;ctx.save();ctx.globalAlpha=.95;ctx.translate(X,214);ctx.scale(1.45,1.45);ctx.translate(-X,-214);drawMoto(X,206,true);const r={st:MOTOST,pose:Object.assign({},PO.sit,{fa1:1.4,fa2:1.5,ba1:1.3,ba2:1.4,lean:.25}),face:1,flash:0,state:'idle',x:M.x,kind:'motoquero'};drawPuppet(r,X-4,194);ctx.restore();}}
const MOTOST={scale:.95,skin:'#e6b48e',hair:'long',hairC:'#2a1a10',top:'#151418',shirt:'#0d0d10',pants:'#2f4a7a',boots:'#0b0b0d',torsoW:10,jacket:true,studs:true};

// v20: nivel "Muere monstruo muere" (Trillando la fina, 2012) + entrevista histórica con Beto Casella +
// "El Comerciante Informador" (de "El amasijo de un gran sueño": el mercader del rumor y la prensa amarilla que lucra y deshonra).
Object.assign(STY,{
  beto:{scale:1.03,skin:'#e4b28a',hair:'slick',hairC:'#161218',glasses:true,top:'#1a1820',shirt:'#e8e2d0',tie:'#c8322a',pants:'#24222c',boots:'#0b0b0d',torsoW:10.5,jacket:true},
  informador:{scale:1.0,skin:'#e2b08c',hair:'slick',hairC:'#2a2018',stache:'#2a2018',glasses:true,top:'#b89638',shirt:'#e8e2d0',tie:'#1a1418',pants:'#3a3632',boots:'#1a1410',torsoW:10.5,jacket:true},
  comerciante:{scale:1.34,skin:'#e6b490',hair:'slick',hairC:'#1e1612',stache:'#1e1612',glasses:true,top:'#4a2438',shirt:'#f2e6c8',tie:'#e2c24a',vest:'#2a1622',pants:'#2a2228',boots:'#120e0c',torsoW:15,belly:1.3,cigar:true},
  espanto:Object.assign({},STY.reptil,{skin:'#3e3a44',top:'#24202a',shirt:'#3a3440',pants:'#1e1a22',boots:'#2a2430',scale:1.12})
});
Object.assign(DEFS,{
  beto:N('beto'),
  informador:E('informador',30,1.0,'OPERADOR DEL CHISME',190,{ai:'ranged',shot:'papel',hold:'papel'}),
  espanto:Object.assign({},DEFS.reptil,{sty:'espanto',name:'ESPANTO DE MADRUGADA',hp:40}),
  comerciante:E('comerciante',420,.9,'EL COMERCIANTE INFORMADOR',8000,{boss:1,bthrow:'papel',hold:'mic'})
});
Object.assign(NAMES,{beto:'BETO CASELLA',informador:'OPERADOR AMARILLISTA',comerciante:'EL COMERCIANTE INFORMADOR',espanto:'EL ESPANTO'});
Object.assign(BARKS,{informador:['¡Comerciante informador: vendo el rumor al mejor postor!','¡Recortale esa frase que hacemos tapa!','¡Si hay pelea en la banda vendemos el doble!','¡Un título venenoso vale oro!'],
  espanto:['¡Uuuuhhh!','¡Grrrr!','¡Sábado Santo es mío!'],comerciante:['¡Yo rumoreo y deshonro por contrato!','¡Todo escándalo cotiza en mi mostrador!']});
Object.assign(DIEQ,{informador:'Como canté en "El amasijo de un gran sueño": comerciante informador que rumorea y deshonra.',espanto:'¡Fuera de acá, espanto! Que el pueblo duerma en paz.',comerciante:'El que comercia con la honra ajena termina masticando su propio veneno.'});

function monstruoLevel(){
  const L=L_STD([[['informador','R'],['espanto','R']],[['informador','L'],['buchon','R']]],[[['espanto','R'],['informador','L'],['buchon','R']],[['informador','R'],['espanto','L']]],
    [[['espanto','R'],['informador','L'],['espanto','R']],[['buchon','L'],['informador','R'],['espanto','R']]],[[['informador','L'],['espanto','R'],['informador','R']],[['espanto','R'],['informador','L'],['espanto','R'],['buchon','L']]]);
  return {LW:2600,skin:'ricT',song:'c8',bossSong:'b2',food:'asado',lmKey:'monstruo',
    villains:'Operadores de prensa amarilla, espantos de Sábado Santo y El Comerciante Informador',title:'MUERE MONSTRUO MUERE',place:'UN PUEBLO DE CAMPO · 2012',hazard:'jabali',
    card:['En 2012 Almafuerte editó su último álbum de estudio, "Trillando la fina", que abre con "Muere monstruo muere" (letra de Iorio, música de Marciello).','Fue amigo de Beto Casella, que lo entrevistó varias veces en televisión.','Pero detrás de las notas sinceras siempre merodea "El Comerciante Informador" (de "El amasijo de un gran sueño"), que lucra con el chisme y el espanto.'],
    npcs:[{kind:'beto',x:250,y:198,face:1,hold:'mic'}],guns:[[700,'escopeta'],[1700,'escopeta']],locks:L,
    rescue:{kind:'peon',x:1420,y:192},
    props:[[420,'fardo','asado'],[820,'tacho','asado'],[1520,'fardo','asado'],[1940,'tacho','asado'],[2080,'fardo','asado']],pipe:[1460,240],
    intro:[{w:'beto',s:'Querido Ricardo, vine hasta el campo para charlar como amigos de tus canciones y de tu vida tierra adentro.'},{w:'ricT',s:'Beto querido, con vos hablo de corazón porque venís de frente. El problema son los buitres que nos siguieron por la ruta.'},
      {w:'beto',s:'Vino "El Comerciante Informador" con sus pasquines amarillos, y encima de madrugada apareció el espanto de Sábado Santo.'},{w:'ricT',s:'Al comerciante informador que rumorea y deshonra lo saco carpiendo, y del monstruo me encargo yo para que el pueblo duerma en paz.'}],
    rescueLines:[{w:'peon',s:'¡Don Ricardo! Los pasquineros del Comerciante Informador me ataron para inventar que en su campo pasan cosas raras.'},{w:'ricT',s:'Viven del amasijo de los sueños ajenos: mienten en los diarios para vender papel y dividir amigos.'},
      {w:'peon',s:'Además soltaron al espanto del galpón para sacarle fotos y asustar a los vecinos en Sábado Santo.'},{w:'ricT',s:'Primero le cierro el quiosco al informador, y al bicho lo llevo lejos y lo encomiendo a Dios.'}],
    boss:'comerciante',summons:[['informador','espanto'],['espanto','informador']],
    bossLines:[{w:'comerciante',s:'¡Soy El Comerciante Informador! Yo invento internas, vendo rumores y convierto tu vida en espectáculo de feria.'},{w:'ricT',s:'Ya te retraté en "El amasijo de un gran sueño": comerciante informador que rumorea y deshonra.'},{w:'comerciante',s:'¡Paparazzis, pasquineros! ¡Suelten al espanto y saquen la foto de tapa!'}],
    winLines:[{w:'comerciante',s:'¡No me rompas los diarios! ¡Me vuelvo a las redacciones de la capital!'},{w:'ricT',s:'Rajá con tus chismes. Y al monstruo me lo llevo atado tierra adentro y que Dios se apiade: acá en el pueblo no asusta más.'}],
    winSay:'¡MUERE MONSTRUO MUERE!',quips:['Comerciante informador, que rumorea y deshonra.','Tierra adentro, el tiempo corre distinto.','Sábado Santo de madrugada: ¡muere monstruo muere!','Con mi amigo Beto hablo de frente; a los amarillistas ni cabida.']};
}
const MONSTRUO_SCENE={weather:'mist',light:'#b09aa6',
  lamps:[{x:520,y:70,r:110,c:'255,200,140'},{x:1180,y:70,r:110,c:'255,200,140',flick:true},{x:1880,y:70,r:110,c:'255,200,140'}],signs:[],
  far(g){sky(g,['#262642','#6a5478','#d8907a','#f0c08a'],40);
    g.fillStyle='rgba(255,230,190,.8)';g.beginPath();g.arc(1040,150,16,0,7);g.fill();
    g.fillStyle='#5a4a6a';g.beginPath();g.moveTo(0,190);for(let x=0;x<=1400;x+=20)g.lineTo(x,138-Math.sin(x*.005)*16-Math.sin(x*.02)*5-hsh(x,5)*4);g.lineTo(1400,190);g.fill();
    // fila de eucaliptos y el tanque de agua del pueblo
    for(let x=20;x<1400;x+=34+hsh(x,2)*30){const h=34+hsh(x,3)*22;g.fillStyle='#3a3048';g.fillRect(x+4,170-h,2,h);g.beginPath();g.ellipse(x+5,170-h,7+hsh(x,4)*5,h*.45,0,0,7);g.fill();}
    g.fillStyle='#2e2638';g.fillRect(860,104,4,70);g.fillRect(884,104,4,70);g.fillRect(852,88,44,18);g.fillRect(858,82,32,6);
    g.fillStyle='#4a5a3a';g.fillRect(0,168,1400,22);},
  bg(K){const {R,T,g,dirt,tree,alambre,houses,lamp,poster}=K;
    dirt(0,2600,'#7a6a58');R(0,176,2600,8,'#8a7864');for(let x=0;x<2600;x+=10)R(x,184,8,2,'rgba(60,46,34,.4)');
    // capilla blanca con campanario: Sábado Santo
    R(250,96,110,80,'#e8e2d6');g.fillStyle='#e8e2d6';g.beginPath();g.moveTo(244,98);g.lineTo(305,62);g.lineTo(366,98);g.fill();
    R(290,26,30,72,'#ece6da');g.beginPath();g.moveTo(286,28);g.lineTo(305,8);g.lineTo(324,28);g.fill();R(304,0,2,10,'#3a3440');R(300,3,10,2,'#3a3440');
    g.fillStyle='#4a3a2a';g.beginPath();g.arc(305,48,7,Math.PI,0);g.fill();R(298,48,14,10,'#4a3a2a');R(303,46,4,6,'#c8a040');
    g.fillStyle='#5a3a22';g.beginPath();g.arc(305,140,14,Math.PI,0);g.fill();R(291,140,28,36,'#5a3a22');R(304,140,2,36,'#3a2416');
    for(const wx of [264,332]){g.fillStyle='#6a90b0';g.beginPath();g.arc(wx+6,120,6,Math.PI,0);g.fill();R(wx,120,12,14,'#6a90b0');}
    poster(380,140,36,26,'#e8e2d0',[['SÁBADO','#5a3a8a',4],['SANTO','#5a3a8a',4],['MISA 8 HS','#c8322a',3]]);
    // casas bajas
    houses(440,820,61,['#d8c8a8','#c8a888','#b8b0a0'],{low:true,shutters:'#3a5a4a',white:true,notank:true});
    // el puesto del Comerciante Informador: agencia de rumores, pasquines y ramos generales
    R(860,92,420,84,'#d8b878');R(860,92,420,6,'#8a6a3a');R(852,84,436,10,'#a8885a');
    R(900,100,340,20,'#2a1a28');T('EL COMERCIANTE INFORMADOR · PRENSA Y RUMORES',1070,106,'#f2c84a',5,'center');
    for(let k=0;k<4;k++){const dx=880+k*100;R(dx,128,46,48,'#3a2a1e');R(dx+3,131,40,45,'#5a4430');R(dx+22,131,2,45,'#3a2a1e');}
    R(890,142,30,22,'#1a1418');R(892,144,26,18,'#3a1a28');T('RUMORES',905,146,'#f2b632',3,'center');T('CHISMES',905,151,'#e8e2d0',3,'center');T('EXCLUSIVO',905,156,'#e2462c',3,'center');
    R(1110,140,40,30,'#e8e2d0');T('PASQUÍN',1130,143,'#c8322a',3,'center');for(let k=0;k<4;k++)R(1114,150+k*4,32,1,'#8a8a92');
    for(let k=0;k<3;k++){R(1176+k*16,160,12,16,'#8a6a3a');R(1176+k*16,158,12,3,'#6a4a2a');}
    // galpón de chapa con el espanto adentro (ojos en la oscuridad)
    R(1520,100,170,76,'#8a8a92');for(let x=1520;x<1690;x+=6)R(x,100,2,76,'#6e6e78');g.fillStyle='#7a7a84';g.beginPath();g.moveTo(1512,102);g.lineTo(1605,74);g.lineTo(1698,102);g.fill();
    R(1570,122,70,54,'#141016');R(1592,140,4,3,'#f2d23a');R(1606,140,4,3,'#f2d23a');R(1640,122,4,54,'#5a4a3a');T('NO PASAR',1605,112,'#c8322a',4,'center');
    // molino, eucaliptos y alambrado
    const mx=2000;R(mx-1,70,3,106,'#4a4a52');R(mx-14,174,28,2,'#4a4a52');g.strokeStyle='#4a4a52';g.lineWidth=1.5;g.beginPath();g.moveTo(mx-12,176);g.lineTo(mx,74);g.lineTo(mx+12,176);g.stroke();
    for(let k=0;k<12;k++){const a=k/12*Math.PI*2;g.beginPath();g.moveTo(mx,68);g.lineTo(mx+Math.cos(a)*18,68+Math.sin(a)*18);g.stroke();}R(mx,64,22,6,'#6a6a72');
    R(2060,150,40,26,'#7a8a96');R(2058,148,44,3,'#5a6a76');
    for(const x of [1760,1840,2180,2300,2440])tree(x,176,92,'#4a5a3e',26);
    alambre(2120,2600,176);
    for(const x of [520,1180,1880])lamp(x,70);}
};
// BONUS: homenaje al tema "Ruta 76" de Almafuerte, capítulo extra que se desbloquea al terminar el juego. Ficción de fans: sin letra ni hechos reales.
Object.assign(STY,{
  motoquero:{scale:1.02,skin:'#d9a67e',hair:'long',hairC:'#1a1212',stache:'#1a1212',top:'#16161a',shirt:'#2a2a32',pants:'#1f2a44',boots:'#0b0b0d',torsoW:11.5,jacket:true,studs:true},
  peajero:{scale:1.3,skin:'#e0aa84',hair:'cap',hairC:'#1a1612',capC:'#d8a020',stache:'#1a1612',glasses:true,top:'#2c4a3a',shirt:'#e8e2d0',tie:'#c8322a',vest:'#d8a020',pants:'#22262e',boots:'#0f0d0b',torsoW:15,belly:1.2}
});
Object.assign(DEFS,{
  motoquero:E('motoquero',30,1.3,'MOTOQUERO DE LA RUTA',170,{punch:'mpunch',wind:10,reach:28,ai:'hitrun'}),
  peajero:E('peajero',430,.9,'EL DUEÑO DEL PEAJE',8500,{boss:1,bthrow:'contrato'})
});
Object.assign(NAMES,{motoquero:'MOTOQUERO',peajero:'EL DUEÑO DEL PEAJE'});
Object.assign(BARKS,{motoquero:['¡Esta ruta tiene dueño!','¡Cuarenta pesos o se queda a pie!','¡Rajá de mi carril!'],peajero:['¡Acá se paga hasta el aire!','¡Barrera abajo, nadie pasa!']});
Object.assign(DIEQ,{motoquero:'La ruta es de quien la camina, no de la pandilla de la curva.',peajero:'El camino es de todos: nadie le pone precio al horizonte.'});

function rutaLevel(){
  const L=L_STD([[['motoquero','R'],['cuatrero','R']],[['motoquero','L'],['chorro','R']]],[[['cuatrero','R'],['motoquero','L'],['chorro','R']],[['motoquero','R'],['cuatrero','L']]],
    [[['estibador','R'],['motoquero','L'],['cuatrero','R']],[['chorro','L'],['motoquero','R'],['estibador','R']]],[[['motoquero','L'],['cuatrero','R'],['motoquero','R']],[['estibador','R'],['motoquero','L'],['chorro','R'],['cuatrero','L']]]);
  return {LW:2800,skin:'ricT',song:'c8',bossSong:'b2',food:'pizza',bonus:true,lmKey:'ruta 76',
    villains:'Motoqueros de la ruta, cuatreros de peaje y El Dueño del Peaje',title:'RUTA 76',place:'KM 76 · UNA NOCHE CUALQUIERA',hazard:'jabali',
    card:['CAPÍTULO BONUS: homenaje al tema "Ruta 76" de Almafuerte, del disco "Ultimando" (2003). La escena es ficción de fans: no cuenta hechos reales ni reproduce la letra.','Una ruta de noche, un camión con la luz baja y una barrera de peaje que nadie sabe quién puso.','Para llegar al amanecer hay que cruzar el kilómetro 76, y el dueño del peaje no deja pasar a nadie gratis.'],
    npcs:[{kind:'camionero',x:250,y:198,face:1,hold:'mate'}],guns:[[700,'escopeta'],[1700,'bersa']],locks:L,
    rescue:{kind:'anselmo',x:1420,y:192},
    props:[[420,'tacho','asado'],[820,'fardo','asado'],[1520,'tacho','asado'],[1940,'fardo','asado'],[2300,'tacho','asado']],pipe:[1460,240],
    intro:[{w:'camionero',s:'Ricardo, la barrera del kilómetro 76 está bajada y los motoqueros no dejan pasar ni a los camiones.'},{w:'ricT',s:'Sirva el mate, compañero. Yo les explico que la ruta es de todos.'},
      {w:'camionero',s:'Dicen que el dueño del peaje cobra hasta por mirar el paisaje. Cuidado con las curvas.'},{w:'ricT',s:'Vamos de a poco, con la luz baja y el corazón alto.'}],
    rescueLines:[{w:'anselmo',s:'¡Gracias, Ricardo! Me ataron al guardarraíl porque no quise pagar el derecho de paso.'},{w:'ricT',s:'Nadie paga por caminar su propia tierra, don Anselmo.'},
      {w:'anselmo',s:'El dueño está en la cabina del peaje, contando monedas bajo el cartel luminoso.'},{w:'ricT',s:'Entonces vamos a levantar esa barrera.'}],
    boss:'peajero',summons:[['motoquero','cuatrero'],['motoquero','motoquero']],
    bossLines:[{w:'peajero',s:'¡Esta es mi ruta! Cada kilómetro tiene precio y cada precio tiene su recargo.'},{w:'ricT',s:'El camino no se compra: se recorre, y se deja libre para el que viene atrás.'},{w:'peajero',s:'¡Motoqueros, cierren el paso y que nadie cruce sin pagar!'}],
    winLines:[{w:'peajero',s:'¡Está bien, está bien! Levanto la barrera, pero no me rompas la cabina.'},{w:'ricT',s:'Que amanezca para todos. Y la próxima, pizza para el que cruza.'}],
    winSay:'¡RUTA LIBRE!',quips:['La ruta de noche tiene su propia música.','Más lejos que el kilómetro 76 todavía queda camino.','Pizza caliente y barrera arriba.','El amanecer no cobra peaje.']};
}
const RUTA_SCENE={weather:'mist',light:'#8f9ab8',
  lamps:[{x:520,y:70,r:110,c:'255,214,150'},{x:1280,y:70,r:110,c:'255,214,150',flick:true},{x:2080,y:70,r:110,c:'255,214,150'}],signs:[],
  far(g){sky(g,['#070914','#141a38','#2a2f5a','#4a4a78'],90);
    g.fillStyle='rgba(235,235,250,.85)';g.beginPath();g.arc(1120,60,14,0,7);g.fill();
    g.fillStyle='#1a1e36';g.beginPath();g.moveTo(0,190);for(let x=0;x<=1400;x+=20)g.lineTo(x,142-Math.sin(x*.004)*20-Math.sin(x*.018)*6-hsh(x,5)*4);g.lineTo(1400,190);g.fill();
    for(let x=30;x<1400;x+=60+hsh(x,2)*50){g.fillStyle='#10142a';g.fillRect(x,150,2,24);g.beginPath();g.ellipse(x+1,150,6,10,0,0,7);g.fill();}
    g.fillStyle='#0e1226';g.fillRect(0,168,1400,22);
    for(let x=60;x<1400;x+=140+hsh(x,7)*80){g.fillStyle='rgba(255,70,50,.9)';g.fillRect(x,150+hsh(x,8)*10,2,2);}},
  bg(K){const {R,T,g,ruta,tree,lamp,poster}=K;
    ruta(0,2800);
    // guardarraíl y postes kilométricos
    R(0,174,2800,3,'#8a8f9a');for(let x=0;x<2800;x+=48){R(x,170,3,12,'#5a5e68');}
    for(const [x,km] of [[300,'KM 74'],[900,'KM 75'],[1500,'KM 76'],[2200,'KM 77']]){R(x,128,3,48,'#d8d4cc');R(x-12,112,28,18,'#2a5a3a');R(x-11,113,26,16,'#1a3a28');T(km,x+2,118,'#f2f2ea',4,'center');}
    // estación de servicio con cartel
    R(560,96,300,80,'#2a2c38');R(560,96,300,6,'#c8322a');R(580,110,260,18,'#1a1c26');T('SERVICIO · PIZZA 24 HS',710,114,'#f2b632',6,'center');
    R(600,134,60,42,'#e8e2d0');R(606,140,48,26,'#4a6a8a');R(720,134,100,42,'#3a3c48');for(let k=0;k<3;k++){R(730+k*28,142,20,34,'#c8322a');R(733+k*28,146,14,8,'#1a1418');}
    poster(1000,120,40,28,'#e8e2d0',[['SE VENDE','#c8322a',4],['TALLER','#2a2a32',4],['TEL 76','#2a2a32',3]]);
    // el peaje: cabina, barrera y cartel luminoso
    R(2260,92,330,84,'#3a3c48');R(2250,84,350,10,'#c8322a');T('PEAJE · RUTA 76 · TARIFA ÚNICA',2425,100,'#f2d23a',6,'center');
    R(2300,118,80,58,'#1a1c26');R(2306,124,68,30,'#5a7a9a');R(2306,158,68,6,'#d8a020');
    R(2440,150,150,4,'#e8e2d0');for(let k=0;k<6;k++)R(2440+k*25,150,12,4,'#c8322a');R(2430,140,10,36,'#8a8f9a');
    for(const x of [1700,1800,2060,2120])tree(x,176,84,'#14201c',24);
    for(const x of [520,1280,2080])lamp(x,70);}
};
function rutaInsert(){
  const L=rutaLevel(),b=L.locks[L.locks.length-1];b.L=L.LW-W;b.trig=b.L+80;
  LEVELS.push(L);SCENES.push(RUTA_SCENE);
  DISCOS.push({t:'RUTA 76',c:'#5a6a9a',s:'Bonus: homenaje al tema "Ruta 76" de Almafuerte, del disco "Ultimando" (2003). Ficción de fans, sin la letra.'});
  AFICHES.push([[640,'ALMAFUERTE','RUTA 76','ULTIMANDO 2003','#c8322a'],[2000,'PEAJE','TARIFA ÚNICA','NO HAY CAMBIO','#f2d23a']]);
  DATOS.push(['"Ruta 76" es un tema de Almafuerte, del disco "Ultimando" (2003). Este capítulo bonus es un homenaje de fans y no reproduce la letra.','Los motoqueros y el peaje son ficción: ninguna persona real aparece en este nivel.','Se desbloquea al terminar el capítulo 11. Si cargás tu MP3 de "Ruta 76" (tecla M), suena en este nivel.']);
  MODS.push('');CLIMA.push({moth:1,sep:.4,lbl:'RUTA DE NOCHE, KM 76'});
}
function monstruoInsert(){if(monstruoInsert.done)return;monstruoInsert.done=1;
  const L=monstruoLevel(),b=L.locks[L.locks.length-1];b.L=L.LW-W;b.trig=b.L+80;
  LEVELS.splice(9,0,L);SCENES.splice(9,0,MONSTRUO_SCENE);
  DISCOS.splice(9,0,{t:'MUERE MONSTRUO MUERE',c:'#7a5a8a',s:'"Muere monstruo muere" abre "Trillando la fina" (2012): letra de Iorio y música de Claudio Marciello.'});
  AFICHES.splice(9,0,[[640,'ALMAFUERTE','TRILLANDO','LA FINA','#6a8a3a'],[2260,'SE VENDE','GALPÓN','CON ESPANTO','#e8e2d0']]);
  DATOS.splice(9,0,['"Trillando la fina" (2012) fue el último disco de estudio de Almafuerte.','"Muere monstruo muere" tiene letra de Iorio y música de Claudio Marciello.','La figura del comerciante informador aparece en "El amasijo de un gran sueño" (Mundo guanaco, 1995): el periodismo que lucra con rumores y rupturas.','Beto Casella, su amigo, lo entrevistó varias veces en televisión.']);
  MODS.splice(9,0,'');
  rutaInsert();
  DATOS[0].unshift('En 1972 recibió su primera guitarra y en 1978 su primer bajo, un Faim que le compraron sus padres.');
  AFICHES[4].push([1300,'BLACK SABBATH','OBRAS 1992','ABRE HERMÉTICA','#7a5a9a']);AFICHES[5].push([1700,'MONSTERS OF ROCK','KISS Y SABBATH','RIVER 3/9/94','#c8a060']);
  AFICHES[6].push([1500,'ALMAFUERTE','VERSIONA A','LARRALDE','#a87a4a']);AFICHES[10].push([1400,'JOSÉ LARRALDE','VERSIONADO','POR ALMAFUERTE','#a87a4a']);
  DATOS[4].push('En 1992, con Ácido argentino, Hermética abrió para Black Sabbath en Obras.');
  DATOS[5].push('A comienzos de septiembre de 1994 tocaron en el Monsters of Rock de River, con Kiss y Black Sabbath.');
  DATOS[6].push('Almafuerte también versionó tangos y folclore: Gardel, Troilo y José Larralde.');
  DATOS[10].push('Como solista grabó covers, entre ellos una versión en castellano de un tema de Black Sabbath.');
  DATOS[8].push('Su madre, Elda Pedraza, tenía ascendencia tehuelche.');
  LEVELS.forEach((l,i)=>l.chap=l.bonus?'CAPÍTULO BONUS':'CAPÍTULO '+(i+1));musicByEra();
  try{const sv=JSON.parse(localStorage.getItem('ricardio-v9')||'{}');if((sv.unl||1)>=10)unl=Math.max(unl,(sv.unl||1)>=12?12:11);}catch(e){}
}

// el loro (y los pájaros) del campo: en 2012 le contó a Beto Casella que tenía muchos pájaros
const LORO={x:0,y:0,on:false,fly:0,sayT:400,flap:0};
function loroOn(){return lvl>=8&&state!=='title'&&player&&!player.gone;}
function loroTick(){if(!loroOn()){LORO.on=false;return;}const p=player,s=(p.st.scale||1)*PSK;
  const perch=['idle','walk','stand'].includes(p.state)&&p.z<1;
  const tx=perch?p.x-p.face*4.5*s:p.x+Math.sin(tick*.06)*22,ty=perch?p.y-p.z-55*s:p.y-p.z-96*s+Math.cos(tick*.09)*6;
  if(!LORO.on){LORO.on=true;LORO.x=tx-80;LORO.y=ty-60;}
  const dx=tx-LORO.x,dy=ty-LORO.y;LORO.fly=perch&&Math.hypot(dx,dy)<2?0:1;LORO.x+=dx*(perch?.22:.08);LORO.y+=dy*(perch?.22:.08);LORO.face=LORO.fly?(dx>0?1:-1):p.face;
  if(state==='play'&&--LORO.sayT<=0){LORO.sayT=1800+(Math.random()*900|0);const P=['¡RICARDO!','¡RRRICARDIO!','¡METAL!','¡PRENDÉ LA RADIO!','¡TIERRA ADENTRO!','¡SÉ VOS!','¡FUERA BUCHÓN!'];
    floatTxt(LORO.x,LORO.y-8,P[Math.random()*P.length|0],'#a8e070');}}
function drawLoro(cx){if(!LORO.on)return;const X=LORO.x-cx,Y=LORO.y;ctx.save();ctx.translate(Math.round(X),Math.round(Y));ctx.scale((LORO.face||1)*1.5,1.5);
  const fl=LORO.fly?Math.sin(tick*.8):0,o=OUTP||'#141016';
  // loro barranquero: verde oliva, panza amarilla con mancha roja, rabadilla y alas con azul
  const E=(x,y,rx,ry,r,c)=>{ctx.fillStyle=c;ctx.beginPath();ctx.ellipse(x,y,rx,ry,r,0,7);ctx.fill();};
  E(-4.5,2.2,4.4,1.3,.5,o);E(-4.5,2.2,3.8,.8,.5,'#3a5a8a');
  E(0,0,4.2,3.4,0,o);E(0,0,3.6,2.8,0,'#6a7a3a');E(.6,1.4,2.4,1.6,0,'#d8c040');E(.4,2.4,1.6,.8,0,'#c8322a');
  E(2.8,-2.6,2.6,2.4,0,o);E(2.8,-2.6,2.1,1.9,0,'#7a8a44');E(3.4,-3,1,1,0,'#f2f2ea');E(3.6,-3,.45,.45,0,'#141016');
  ctx.fillStyle='#d8d2c6';ctx.beginPath();ctx.moveTo(4.6,-2.8);ctx.quadraticCurveTo(6.8,-2.6,5.6,-.6);ctx.lineTo(4.4,-1.6);ctx.fill();
  if(LORO.fly){E(-1,-1-fl*3,4.4,1.6,-.4-fl*.6,o);E(-1,-1-fl*3,3.8,1.1,-.4-fl*.6,'#4a6a3a');E(-3.6,-1.6-fl*4,1.6,.8,-.4-fl*.6,'#3a5a8a');}
  else{E(-1,.2,3,1.6,.25,'#56682e');E(-3,.9,1.4,.8,.3,'#3a5a8a');ctx.fillStyle='#8a7a6a';ctx.fillRect(-1,3,1,1.4);ctx.fillRect(1,3,1,1.4);}
  ctx.restore();}

// el bajo: el primero (el que le regaló el padre en el 78, un Faim de cuatro cuerdas) en las primeras épocas y uno negro después
function BASS(hx,hy,a2,old){const a=Math.atan2(Math.cos(a2),Math.sin(a2));ctx.save();ctx.translate(hx,hy);ctx.rotate(a);const o=OUTP||'#141016';
  const body=new Path2D('M-21,-1 C-22,-7 -17,-9 -13,-7 C-10,-6 -8,-8 -5,-9 C-3,-9.6 -2,-8 -4,-6 C-5,-4.6 -3,-3 -1,-3 L-1,3 C-3,3 -5,4.6 -4,6.4 C-2,8.6 -4,9.6 -7,8.6 C-10,7.4 -13,9 -16,8.6 C-21,8 -22,4 -21,-1 Z');
  ctx.lineJoin='round';ctx.strokeStyle=o;ctx.lineWidth=2;ctx.stroke(body);
  if(old){const gr=ctx.createRadialGradient(-12,0,1,-12,0,11);gr.addColorStop(0,'#f0b448');gr.addColorStop(.55,'#b8601e');gr.addColorStop(1,'#3a160a');ctx.fillStyle=gr;}else ctx.fillStyle='#141216';
  ctx.fill(body);
  ctx.fillStyle=old?'#ece2c8':'#2a2830';ctx.beginPath();ctx.moveTo(-15,-5);ctx.quadraticCurveTo(-8,-6.5,-4,-3.4);ctx.lineTo(-4,1);ctx.quadraticCurveTo(-10,2,-15,0);ctx.closePath();ctx.fill();
  if(!old){ctx.strokeStyle='rgba(220,220,230,.45)';ctx.lineWidth=.5;ctx.stroke(body);}
  ctx.fillStyle='#141216';ctx.fillRect(-12.5,-2.6,2.6,4);ctx.fillRect(-17.5,-1.6,1.6,3.6);ctx.fillStyle='#b8b8c0';ctx.fillRect(-19.6,-2,1.4,4);
  for(const [x,c] of [[-9,'#d8d2c6'],[-7,'#d8d2c6'],[-14,'#d8d2c6']])ctx.fillStyle=c,ctx.beginPath(),ctx.arc(x,5.2+(x===-14?.8:0),.7,0,7),ctx.fill();
  ctx.fillStyle=o;ctx.fillRect(-2,-1.9,30,3.8);ctx.fillStyle=old?'#c89a5a':'#d8b070';ctx.fillRect(-2,-1.3,29,2.6);ctx.fillStyle='#3a2414';ctx.fillRect(-2,-1.1,27,2.2);
  for(let k=1;k<6;k++){ctx.fillStyle='#c8c8d0';ctx.fillRect(k*4.6,-1.1,.4,2.2);}
  ctx.fillStyle=o;ctx.beginPath();ctx.moveTo(26,-2.4);ctx.lineTo(33,-3.4);ctx.lineTo(33.6,2.6);ctx.lineTo(26,2.4);ctx.fill();ctx.fillStyle=old?'#c89a5a':'#141216';ctx.beginPath();ctx.moveTo(26.6,-1.8);ctx.lineTo(32.6,-2.6);ctx.lineTo(33,1.9);ctx.lineTo(26.6,1.8);ctx.fill();
  ctx.fillStyle='#c8c8d0';for(let k=0;k<4;k++)ctx.fillRect(27.4+k*1.5,-3.4-(k%2),1,1.2);
  ctx.strokeStyle='rgba(230,230,235,.75)';ctx.lineWidth=.25;for(let k=0;k<4;k++){const y=-.9+k*.6;ctx.beginPath();ctx.moveTo(-19,y);ctx.lineTo(27,y);ctx.stroke();}
  ctx.restore();}

// v21: los lugares reales redibujados mirando fotos (solo referencia): Mercado de Abasto, Centro Cultural Recoleta
// con la torre del Pilar, la cancha de River y la estación Constitución.
function landmarkBG(cv,i){const g=cv.getContext('2d');g.save();g.setTransform(RS,0,0,RS,0,0);
  const R=(x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(x,y,w,h);};
  const T=(s,x,y,c,sz,al)=>{g.font=(sz||6)+'px '+FONT;g.textAlign=al||'left';g.textBaseline='top';g.fillStyle=c;g.fillText(U(s),x,y);};
  const arch=(x,y,w,h,c)=>{g.fillStyle=c;g.beginPath();g.moveTo(x,y+h);g.lineTo(x,y+w/2);g.arc(x+w/2,y+w/2,w/2,Math.PI,0);g.lineTo(x+w,y+h);g.fill();};
  const poster=(x,y,w,h,bg,lines)=>{R(x,y,w,h,bg);let yy=y+3;for(const [s,c,sz] of lines){T(s,x+w/2,yy,c,sz||4,'center');yy+=(sz||4)+2;}R(x+w-5,y,5,h,'rgba(0,0,0,.18)');};
  const glass=(x,y,w,h)=>{g.save();arch(x,y,w,h,'#3a4a52');g.clip();const gr=g.createLinearGradient(0,y,0,y+h);gr.addColorStop(0,'#7a9aa4');gr.addColorStop(.5,'#4a6670');gr.addColorStop(1,'#2a3a40');g.fillStyle=gr;g.fillRect(x,y,w,h);
    g.fillStyle='rgba(20,26,30,.85)';for(let xx=x+w/8;xx<x+w;xx+=w/8)g.fillRect(xx,y,1.2,h);for(let yy=y+10;yy<y+h;yy+=10)g.fillRect(x,yy,w,1.2);
    g.fillStyle='rgba(255,240,210,.12)';g.fillRect(x+w*.12,y+6,w*.1,h);g.restore();};
  if(i===0){g.clearRect(1600,0,1000,26); // Mercado de Abasto: fachada art déco ocre con cinco bóvedas vidriadas y pilares escalonados
    R(1600,26,1000,128,'#cfac74');R(1600,26,1000,3,'#a8844e');
    const piers=[1600,1800,2000,2200,2400,2560];
    for(let k=0;k<5;k++){const x0=piers[k]+40,w=(k===4?2560:piers[k+1])-x0;R(x0,40,w,114,'#c49e66');glass(x0+8,44,w-16,110);
      // luces colgantes del mercado y pilas de cajones adentro de las bóvedas
      for(let lx=x0+26;lx<x0+w-20;lx+=36){R(lx,52,1,18,'#2a241e');g.fillStyle='rgba(255,228,150,.55)';g.beginPath();g.arc(lx+.5,72,5,0,7);g.fill();}
      for(let cx=x0+18;cx<x0+w-30;cx+=28){R(cx,132,20,16,'#8a5e34');R(cx+2,122,18,10,'#9e7040');R(cx,137,20,1,'#5a3a1e');}
      R(x0+4,150,w-8,4,'#8a6a3e');}
    for(const px of piers){R(px,16,40,138,'#d8b880');R(px+6,8,28,10,'#d8b880');R(px+12,0,16,10,'#d8b880');
      for(let k=0;k<4;k++)R(px+7+k*8,20,2,130,'#b8945c');R(px,16,40,2,'#e8cc98');R(px+6,8,28,2,'#e8cc98');R(px+12,0,16,2,'#e8cc98');R(px+38,16,2,138,'#a8844e');}
    R(1960,22,280,16,'#5a4630');T('MERCADO DE ABASTO · PROVEEDOR',2100,27,'#ecd8a8',6,'center');
    // bolsas de arpillera apiladas en la vereda del Abasto
    for(let sx=1660;sx<2100;sx+=140){for(let b=0;b<3;b++){g.fillStyle=b%2?'#b08c58':'#9c7846';g.beginPath();g.ellipse(sx+b*9,162-(b===2?7:0),10,6,0,0,7);g.fill();}}
    {const x=2180;R(x,114,90,46,'#3f6a86');R(x+90,126,32,34,'#e6dcc2');R(x+96,130,20,12,'#24323e');for(const wx of [x+20,x+104]){g.fillStyle='#111';g.beginPath();g.arc(wx,166,10,0,7);g.fill();}T('PAPAS DEL SUR · DON ALFREDO',x+45,128,'#e8e2d0',4,'center');}}
  if(i===1){ // Cine Ocean de Ciudadela (donde conoció al Chofa viendo La canción es la misma) y garaje de ensayo de V8
    const cx=540;R(cx,48,220,128,'#2c2434');R(cx+6,54,208,120,'#3a2e42');R(cx-8,76,236,24,'#e8dcc2');R(cx-6,78,232,20,'#16121a');
    for(let lx=cx-4;lx<cx+224;lx+=8){R(lx,77,3,2,'#f2b632');R(lx,97,3,2,'#f2b632');}
    T('CINE OCEAN · CIUDADELA',cx+110,60,'#f2b632',6,'center');
    T('HOY: LED ZEPPELIN · LA CANCIÓN ES LA MISMA',cx+110,84,'#f8e6a0',5,'center');
    for(let k=0;k<3;k++){R(cx+26+k*60,118,46,56,'#1a1420');R(cx+30+k*60,122,38,48,'#4a2828');}
    poster(cx+10,118,22,32,'#141218',[['LED','#f2b632',4],['ZEP','#c8322a',4],['1979','#e8e2d0',4]]);
    // garaje de ensayo de V8 con persiana entreabierta y torres Marshall
    const gx=1480;R(gx,78,190,98,'#544842');R(gx+14,96,162,80,'#141216');
    for(let y=96;y<128;y+=4)R(gx+14,y,162,2,'#6e7278');
    for(const mx of [gx+30,gx+134]){R(mx,132,26,42,'#1c1a1e');R(mx+2,134,22,16,'#2a282e');R(mx+2,152,22,20,'#2a282e');T('MARSHALL',mx+13,136,'#e8d8a8',3,'center');}
    T('V8',gx+95,104,'#c8322a',10,'center');T('SALA DE ENSAYO · NO ENTRAR',gx+95,84,'#e8e2d0',4,'center');}
  if(i===3){ // Centro Cultural Recoleta (ex convento, rojo colonial con blanco) y la torre blanca de la Basílica del Pilar
    R(1180,58,720,118,'#a8503a');R(1180,58,720,6,'#ece6d8');R(1180,106,720,4,'#ece6d8');R(1180,170,720,6,'#ece6d8');
    for(let x=1180;x<1900;x+=60){R(x,58,6,118,'#ece6d8');}
    for(let x=1194;x<1890;x+=60){arch(x+4,68,24,32,'#ece6d8');arch(x+7,71,18,29,'#2a2a34');R(x+15,71,1,29,'#ece6d8');arch(x+2,118,30,52,'#ece6d8');arch(x+5,121,24,49,'#3a2e2a');}
    g.fillStyle='#ece6d8';g.beginPath();g.moveTo(1440,58);g.lineTo(1540,28);g.lineTo(1640,58);g.fill();g.fillStyle='#a8503a';g.beginPath();g.moveTo(1460,55);g.lineTo(1540,34);g.lineTo(1620,55);g.fill();
    T('CENTRO CULTURAL',1540,44,'#ece6d8',5,'center');R(1470,108,140,12,'#ece6d8');T('RECOLETA',1540,110,'#6a2a20',6,'center');
    // torre de la Basílica del Pilar
    R(1100,40,80,136,'#f0ece2');R(1100,40,80,4,'#d8d0c0');R(1112,22,56,20,'#f0ece2');arch(1128,24,24,18,'#3a3a44');R(1139,24,2,18,'#f0ece2');
    g.fillStyle='#e8e2d4';g.beginPath();g.arc(1140,22,16,Math.PI,0);g.fill();R(1139,0,2,8,'#3a3440');R(1136,2,8,2,'#3a3440');
    for(const yy of [60,100,140]){arch(1124,yy,32,26,'#d8d0c0');arch(1128,yy+3,24,23,'#3a3a44');}
    poster(1290,128,40,40,'#141218',[['HERMÉTICA','#e8e2d0',5],['DEBUT','#c8322a',6],['1988','#f2b632',6]]);poster(1680,128,40,40,'#e8e2d0',[['MUESTRA','#1a1a1a'],['DE ARTE','#1a1a1a'],['MODERNO','#c8322a']]);
    // Pub Helloween de San Martín (debut oficial del 7/5/1988)
    const hx=2100;R(hx,70,220,106,'#1c1622');R(hx+6,76,208,24,'#2a1a28');T('PUB HELLOWEEN · SAN MARTÍN',hx+110,83,'#f2b632',5,'center');
    T('7 DE MAYO 1988 · DEBUT DE HERMÉTICA',hx+110,104,'#e8e2d0',4,'center');arch(hx+86,120,48,56,'#0e0a12');}
  if(i===4){ // Talleres cerrados del conurbano, pintadas de la H y afiches de Obras 1992 (Black Sabbath / Motörhead)
    for(const sx of [520,1380,2140]){
      g.strokeStyle='#f2b632';g.lineWidth=2;g.beginPath();g.arc(sx,132,14,0,7);g.stroke();
      T('H',sx,125,'#f2b632',11,'center');T('LA H NO ES MUDA',sx,150,'#e8e2d0',4,'center');
    }
    poster(860,116,58,46,'#141218',[['OBRAS 92','#f2b632',5],['SABBATH','#c8322a',5],['HERMÉTICA','#e8e2d0',4]]);
    poster(1720,116,58,46,'#141218',[['ÁCIDO','#f2b632',5],['ARGENTINO','#c8322a',4],['ORO 1993','#e8e2d0',4]]);}
  if(i===5){ // el Monumental: tribunas blancas de hormigón con la banda roja, escenario Monsters of Rock y torres de luz
    R(0,20,1100,78,'#d8d6d0');for(let y=24;y<96;y+=6)R(0,y,1100,1,'#b8b6b0');
    g.fillStyle='#c8322a';g.beginPath();g.moveTo(0,52);g.lineTo(1100,30);g.lineTo(1100,44);g.lineTo(0,66);g.fill();
    for(let x=0;x<1100;x+=24)R(x,20,3,78,'#a8a6a0');R(0,94,1100,4,'#8a8882');
    for(const tx of [160,560,960]){R(tx,0,6,98,'#6a6a72');R(tx-22,0,50,16,'#3a3a44');for(let k=0;k<5;k++)for(let j=0;j<2;j++)R(tx-19+k*9,2+j*7,7,5,'#f8f2c8');}
    T('ESTADIO RIVER PLATE · MONSTERS OF ROCK 1994',560,72,'#c8322a',7,'center');
    // banderas de la hinchada metalera colgadas de la tribuna
    for(const [bx,t1,c1,c2] of [[80,'SAN JUSTO ES DE LA H','#141218','#f2b632'],[260,'AGUANTE EL METAL PESADO','#141218','#f2b632'],[460,'CASEROS Y CIUDADELA','#c8322a','#e8e2d0'],[690,'LOS DEL OESTE PRESENTES','#e8e2d0','#141218'],[880,'HERMÉTICA NO SE TOCA','#c8322a','#e8e2d0']]){R(bx,58,150,18,c1);R(bx,58,150,2,'rgba(0,0,0,.3)');T(t1,bx+75,63,c2,4,'center');}}
  if(i===6){ // estación Constitución: fachada francesa de piedra, mansardas de pizarra, el reloj y el templo de Cemento
    R(700,64,520,112,'#d8c8a6');for(let y=70;y<176;y+=8)R(700,y,520,1,'#c4b490');
    for(const px of [700,1120]){R(px,40,100,136,'#e0d2b2');g.fillStyle='#4a5260';g.beginPath();g.moveTo(px-4,42);g.lineTo(px+12,10);g.lineTo(px+88,10);g.lineTo(px+104,42);g.fill();
      g.fillStyle='#e0d2b2';g.beginPath();g.arc(px+50,28,7,0,7);g.fill();g.fillStyle='#2a2e36';g.beginPath();g.arc(px+50,28,4.5,0,7);g.fill();R(px+46,0,8,12,'#4a5260');}
    R(890,30,140,146,'#e0d2b2');g.fillStyle='#e0d2b2';g.beginPath();g.moveTo(884,32);g.lineTo(960,4);g.lineTo(1036,32);g.fill();
    g.fillStyle='#f4ecd8';g.beginPath();g.arc(960,48,14,0,7);g.fill();g.strokeStyle='#3a3440';g.lineWidth=1.4;g.beginPath();g.arc(960,48,14,0,7);g.stroke();g.beginPath();g.moveTo(960,48);g.lineTo(960,38);g.moveTo(960,48);g.lineTo(967,51);g.stroke();
    for(let k=0;k<12;k++){const a=k/12*Math.PI*2;R(960+Math.cos(a)*11.5-.5,48+Math.sin(a)*11.5-.5,1,1,'#3a3440');}
    R(800,68,90,4,'#c4b490');R(1030,68,90,4,'#c4b490');
    for(let x=810;x<880;x+=24){arch(x,76,14,20,'#3a3a44');}for(let x=1040;x<1112;x+=24){arch(x,76,14,20,'#3a3a44');}for(const px of [712,1132])for(let x=px;x<px+80;x+=26)arch(x,54,14,20,'#3a3a44');
    for(let k=0;k<7;k++){const ax=716+k*72;arch(ax,104,50,72,'#2a2422');arch(ax+4,108,42,68,'#3a3230');}
    R(880,84,160,14,'#5a3a22');T('ESTACIÓN CONSTITUCIÓN',960,87,'#f0e4c8',6,'center');T('F.C. ROCA',960,72,'#5a3a1a',5,'center');
    // fachada de Cemento (Estados Unidos 1238) con afiches de Mundo Guanaco
    const cm=1820;R(cm,66,240,110,'#242028');R(cm+10,74,220,22,'#141018');T('CEMENTO · ESTADOS UNIDOS 1238',cm+120,81,'#f2b632',5,'center');
    T('HOY: ALMAFUERTE · MUNDO GUANACO',cm+120,104,'#c8322a',5,'center');
    for(const dx of [cm+40,cm+160]){R(dx,120,40,56,'#121016');R(dx+4,124,32,48,'#2c2428');}}
  if(i===7){ // Ruta 2001: santuario rutero del Gauchito Gil con banderas rojas y Club Social del Interior con guirnaldas
    const gx=820;R(gx,136,38,38,'#a8241e');g.fillStyle='#c82e24';g.beginPath();g.moveTo(gx-6,136);g.lineTo(gx+19,118);g.lineTo(gx+44,136);g.fill();
    R(gx+17,108,4,12,'#8a1c16');R(gx+13,112,12,4,'#8a1c16');T('GAUCHITO GIL',gx+19,140,'#f8e6a0',4,'center');
    for(let k=0;k<6;k++){R(gx-28+k*18,124+(k%2)*6,3,18,'#d42820');R(gx+6+k*5,168,2,6,'#f8e6a0');}
    const cl=1920;R(cl,74,260,102,'#6e5440');R(cl+8,82,244,20,'#3a281c');T('CLUB SOCIAL Y DEPORTIVO · HOY ALMAFUERTE',cl+130,88,'#f2b632',5,'center');
    for(let lx=cl+14;lx<cl+246;lx+=18){g.fillStyle=lx%36===0?'#f2b632':'#e2462c';g.beginPath();g.arc(lx,110,2.5,0,7);g.fill();}}
  if(i===2){alvearBG(g,R,T,arch);
    // fachada de Obras Sanitarias ("El Templo del Rock") para el BA Rock IV
    const ox=2080;R(ox,54,320,122,'#c8b692');R(ox+12,64,296,24,'#242028');T('ESTADIO OBRAS SANITARIAS · BA ROCK IV',ox+160,72,'#f2b632',5,'center');
    T('FINES DE 1982 · RIFF · V8 · LOS VIOLADORES',ox+160,96,'#4a2018',5,'center');
    for(let k=0;k<4;k++){arch(ox+28+k*70,114,44,62,'#2a2422');}
    for(const [bx,t1,c1,c2] of [[760,'BRIGADAS METÁLICAS','#141218','#e8e2d0'],[1830,'V8 · METAL PESADO','#c8322a','#e8e2d0']]){R(bx,96,140,16,c1);T(t1,bx+70,101,c2,5,'center');}}
  baBG(g,R,T,arch,i);g.restore();}

// v21: movimientos más naturales. Caminata con peso (balanceo de brazos, cadera que sube y baja, el torso que acompaña)
// y transición suave entre poses en vez de saltar de golpe de una a otra.
function walkPose(ph,base){const p=Object.assign({},base||PO.idle);const s=Math.sin(ph),c=Math.cos(ph),s2=Math.sin(ph*2);
  p.ft1=s*.55;p.ft2=p.ft1-(.18+.5*Math.max(0,c))+Math.max(0,-c)*.12;p.bt1=-s*.55;p.bt2=p.bt1-(.18+.5*Math.max(0,-c))+Math.max(0,c)*.12;
  p.crouch=(base&&base.crouch||0)+(1-Math.abs(s2))*0+Math.abs(s)*1.2+.4*(1+s2)*.5;
  p.lean=(base?base.lean:0)+.05+Math.abs(c)*.025;p.tilt=(base?base.tilt:0)+s*.04;
  if(base===PO.stand){p.fa1=-s*.42;p.fa2=p.fa1+.25+Math.max(0,-s)*.35;p.ba1=s*.42;p.ba2=p.ba1+.25+Math.max(0,s)*.35;}
  else{p.fa1+=-s*.16;p.fa2+=-s*.1;p.ba1+=s*.16;p.ba2+=s*.1;}return p;}
// en guardia el peso va de un pie al otro, y al recibir un golpe la cabeza se va para atrás
function livePose(f){const P=f.pose;if(!P||f.x===undefined)return P;const st=f.state;
  if(st==='idle'&&f.team!==2){const w=Math.sin(tick*.05+(f.x||0)*.07);return Object.assign({},P,{lean:P.lean+w*.025,crouch:P.crouch+.8+w*.6,ft1:P.ft1+w*.05,bt1:P.bt1+w*.05,fa1:P.fa1+Math.sin(tick*.09)*.05,ba1:P.ba1+Math.cos(tick*.09)*.05});}
  if(st==='hurt'&&f.t<6)return Object.assign({},P,{tilt:P.tilt-.25*(1-f.t/6)});
  return P;}
// desde V8 deja las papas: "estoy podrido de las papas", ahora revolea discos de vinilo
function drawVinilo(s){ctx.rotate(s.t*.4);ctx.scale(1,.8);ctx.fillStyle='rgba(10,8,13,.9)';ctx.beginPath();ctx.arc(0,0,9.6,0,7);ctx.fill();ctx.fillStyle='#16141a';ctx.beginPath();ctx.arc(0,0,8.8,0,7);ctx.fill();
  ctx.strokeStyle='rgba(120,120,140,.45)';ctx.lineWidth=.4;for(const r of [7.6,6.4,5.2]){ctx.beginPath();ctx.arc(0,0,r,0,7);ctx.stroke();}
  ctx.fillStyle=s.back?'#f2b632':'#c8322a';ctx.beginPath();ctx.arc(0,0,3.2,0,7);ctx.fill();ctx.fillStyle='#0a080d';ctx.beginPath();ctx.arc(0,0,.8,0,7);ctx.fill();
  ctx.fillStyle='rgba(255,255,255,.35)';ctx.beginPath();ctx.ellipse(-3.5,-4,3,.9,-.6,0,7);ctx.fill();}
// un recuerdo de su vida por capítulo (datos de entrevistas y biografías)
const RECUERDOS=['En el 72 los Reyes me dejaron una criolla. Y este año mi viejo me trajo el Faim de cuatro cuerdas.',
  'Al Chofa Moreno lo conocí viendo la película de Led Zeppelin en un cine de barrio. Ahí nació V8.',
  'Antes del festival nos llevaron presos por el cuero y las tachas. Igual llegamos a Obras.',
  'Hermética nació en San Martín con O\'Connor y el Tano Romano. Al principio se llamó Helvética.',
  'En Hermética yo componía y tocaba el bajo; la voz era del cantante de la banda.',
  'De repartir papas en Caseros a llenar River con Kiss y Black Sabbath.',
  'Cuando todo parecía roto, con el Tano Marciello levantamos Almafuerte desde abajo.',
  'Por una tendinitis tuve que ir dejando el bajo para pararme al frente con el micrófono.',
  'Soy un hombre de tierra adentro, no un costero. Acá el silencio te enseña a escucharte.',
  'En el campo se escucha otro silencio.',
  'No se debe ser más de lo que uno es, ni menos de lo que uno vale.'];
const GUINO2={4:'Abrir para Black Sabbath en Obras... ¡quién lo hubiera dicho en el Abasto!',5:'Hoy River es nuestro, y después tocan Kiss y Sabbath.',
  6:'Un tema de Larralde también es metal, si se toca con el alma.',10:'Poné a Larralde en la radio.'};

// v25-v27: capítulo 1. Ricardo no puede seguir hasta que el viejo le trae su primer bajo (un Faim, 1978).
// El viejo entra caminando desde atrás con el bajo en la mano, se lo da en la escena y Ricardo lo levanta.
let BGIFT={p:null,done:false,on:false,v:null},_cineOnEnd=null;
const BGIFT_X=900,BGIFT_MAX=960;
function bajoTick(){if(BGIFT.p!==player)BGIFT={p:player,done:false,on:false,v:null,show:0};
  if(BGIFT.show&&player){if(tick>=BGIFT.show){BGIFT.show=0;player.holdBack=null;if(player.state==='victory')player.state='idle';}}
  if(lvl!==0||BGIFT.done||!player)return;
  if(state==='play'&&!BGIFT.on){if(player.x>BGIFT_MAX){player.x=BGIFT_MAX;player.vx=0;}
    if(!lock&&lockIdx>=2&&player.x>BGIFT_X&&!foesAlive()&&!GUI.moto&&!RIDE.on){BGIFT.on=1;MOMENT=1;bubbles=[];const v=mk('viejo',cam.x-30,player.y-2);v.hold='bass';v.face=1;v.state='gift';ents.push(v);BGIFT.v=v;}
    else if(player.x>=BGIFT_MAX-2&&tick%300===0&&!bubbles.some(b=>b.f===player))say(player,'Sin bajo no voy a ningún lado. ¿Dónde está el viejo?',120);}
  const v=BGIFT.v;if(!v)return;
  if(state==='play'&&BGIFT.on===1){const tx=player.x-34;
    if(!v.said&&v.x>cam.x+24){v.said=1;say(v,'¡Ricardo! ¡Esperá, pibe!',80);player.face=-1;}
    if(v.x<tx){v.x+=1.6;v.walkPh+=.22;v.face=1;if(player.state==='idle'||player.state==='walk')player.face=-1;}
    else{BGIFT.on=2;bubbles=[];v.state='idle';player.face=-1;v.face=1;
      // Ricardo se para: no puede estar tirado cuando llega el viejo
      player.state='idle';player.vx=0;if(player.hp<=0)player.hp=1;bubbles=[];
      CINE={P:[
        ['scene','CASEROS · 1978','Don Alfredo cruzó el barrio a pie con un estuche bajo el brazo para alcanzar a su hijo.'],
        ['face','EL BAJO FAIM','Un Faim nacional de cuatro cuerdas, pagado cajón por cajón en la feria y el Abasto.'],
        ['face','EL SEGUNDO GRAN REGALO','"Después de la criolla de los Reyes del 72, este bajo me cambió el destino para siempre."']
      ],i:0,t:0,ch:0,gift:1};
      _cineOnEnd=()=>{state='play';BGIFT.done=true;MOMENT=0;v.hold=null;player.holdBack='bass';player.state='victory';BGIFT.show=tick+110;player.face=1;sfx('pickup');
        floatTxt(player.x,player.y-100,'¡EL FAIM DE TU VIEJO!','#f2b632');v.state='walkoff';
        banner={a:'¡TU PRIMER BAJO!',b:'EL FAIM QUE TE REGALÓ TU VIEJO · YA PODÉS SEGUIR',t:170};
        setTimeout(()=>{dato={s:'En 1972 recibió su primera guitarra y en 1978 su primer bajo, un Faim que le compraron sus padres.',t:480};},2900);};
      state='cine';}}}
function sinBajo(f){if(f===player&&lvl===0&&!BGIFT.done){say(f,'¡Todavía no tengo bajo!',70);return true;}return false;}

// v25: si le gritan "¡papero!", Ricardo responde con una papa y aparece el viejo con el camión: se sube y reparte papas a todos
let RIDE={on:0,last:-99999};
function papaShot(e,z0){const p=player,dx=e.x-p.x,fr=Math.max(10,Math.abs(dx)/6.5);p.face=dx<0?-1:1;
  shots.push({x:p.x+p.face*10,y:p.y,z:z0,vx:p.face*6.5,vy:(e.y-p.y)/fr,vz:(30-z0)/fr+.03*fr,owner:p,t:0,k:'papa',back:true,life:90});p.state='papa';p.t=0;sfx('whoosh');}
function nearFoe(){let b=null,bd=1e9;for(const e of ents){if(e.gone||e.team!==1||e.hp<=0||!hittable(e))continue;const d=Math.abs(e.x-player.x)+Math.abs(e.y-player.y)*2;if(d<bd&&e.x>cam.x-10&&e.x<cam.x+W+10){bd=d;b=e;}}return b;}
function paperoRide(f){if(lvl>1||RIDE.on||state!=='play'||!player||tick-RIDE.last<1500||(lvl===0&&!BGIFT.done))return;
  if(f&&f.team===1)setTimeout(()=>{if(state==='play'&&!f.gone&&player)papaShot(f,34*player.st.scale);},350);
  RIDE={on:1,ph:'in',t:0,x:cam.x+W+90,last:tick};}
function rideTick(p){if(p===player&&BGIFT.show&&tick<BGIFT.show){p.state='victory';p.holdBack='bass';p.inv=Math.max(p.inv||0,4);try{smoothPose(p);}catch(e){}return true;}
  if(!RIDE.on||p!==player)return false;const R=RIDE;R.t++;p.inv=Math.max(p.inv||0,8);
  if(R.ph==='in'){const tx=clamp(p.x+30,cam.x+60,cam.x+W-40);R.x-=Math.max(1.5,Math.min(5,(R.x-tx)*.06));if(R.t%18===0)dust(R.x+40,224,1);
    if(R.x-tx<2){R.ph='up';R.t=0;R.x0=p.x;R.y0=p.y;sfx('truck');floatTxt(R.x-20,150,'¡SUBÍ, RICARDO!','#f2b632');}
    return false;}
  if(R.ph==='up'){const k=Math.min(1,R.t/22);p.x=R.x0+(R.x+8-R.x0)*k;p.y=R.y0+(224-R.y0)*k;p.z=Math.sin(k*Math.PI)*30+46*k;p.state='jump';p.walkPh=0;
    if(k>=1){R.ph='ride';R.t=0;R.cd=0;banner={a:'¡PAPAZOS PARA TODOS!',b:'EL VIEJO TRAJO EL CAMIÓN · B O Z TIRA',t:120};}return true;}
  if(R.ph==='ride'){p.x=R.x+8;p.y=224;p.z=46;if(R.cd>0)R.cd--;
    const e=nearFoe();if(e&&R.cd<=0&&(press.papa||press.atk||press.jump||R.t%16===0)){papaShot(e,64);R.cd=8;}
    if(p.state==='papa'&&++p.t>14)p.state='idle';
    if(R.t>420){R.ph='down';R.t=0;}return true;}
  if(R.ph==='down'){const k=Math.min(1,R.t/18);p.z=46*(1-k)+Math.sin(k*Math.PI)*16;p.x=R.x+8-k*30;p.state='jump';if(k>=1){p.z=0;p.state='idle';R.ph='out';R.t=0;say(p,'¡Gracias, viejo! ¡Nos vemos en el Abasto!',100);}return true;}
  if(R.ph==='out'){R.x+=3;if(R.x>cam.x+W+120){RIDE.on=0;}return false;}
  return false;}

// v26: cinemáticas antes de cada capítulo con escenas animadas de los protagonistas reales de su historia
const CINES=[
 [['scene','CASEROS · 1978','Madrugada helada en el Oeste: Ricardo carga cajones con su padre Alfredo antes de salir para el Abasto.'],['truck','RUMBO AL ABASTO','En el camión rumbo al Abasto: meses hombreando bolsas de papas con su viejo.'],['face','EL PAPERO Y EL SUEÑO','En el barrio lo conocen como "el papero". Él mira pasar las motos y sueña con un bajo eléctrico y distorsión.']],
 [['scene','UN CINE DE BARRIO · 1978','A la salida de la película de Led Zeppelin conoce al Chofa Moreno, mientras los patrulleros hacen razzias en la calle.'],['stage','EL RUGIDO DE V8','Los pibes de Ciudadela enchufan los amplificadores: nace V8, heavy metal crudo, veloz y en castellano.'],['face','CONTRA LA CENSURA','El pelo largo y el rock pesado no se negocian: un pibe de rulos que ruge frente al miedo de la época.']],
 [['scene','ANTES DEL FESTIVAL · 1982','Antes del BA Rock IV, la policía se lleva demorados a los V8 por su aspecto; los liberan unas dos horas después.'],['face','BRIGADAS METÁLICAS','Pappo pide que V8 esté en el cartel: sin ellos, Riff no toca.'],['stage','BA ROCK IV · OBRAS','Frente a una multitud hippie que les tira naranjas y pide paz, V8 sacude el escenario.']],
 [['scene','CENTRO CULTURAL RECOLETA · 6/5/1988','Entre galerías snobs y miradas de desprecio, cuatro pibes del conurbano arman sus equipos al aire libre.'],['stage','PUB HELLOWEEN · SAN MARTÍN 7/5/1988','Con Claudio O\'Connor y el Tano Romano debuta oficialmente Hermética: thrash argentino con conciencia obrera.'],['face','LA H NO ES MUDA','Hermética: cerrada a la careteada, abierta de par en par para el pibe trabajador del barrio.']],
 [['scene','EL CONURBANO · 1991','Persianas bajas, remates judiciales y despidos: la bronca del taller inspira las letras de "Ácido argentino".'],['stage','OBRAS SANITARIAS · 1992','El sueño del pibe del Abasto se vuelve realidad: Hermética llena Obras y abre para Black Sabbath y Motörhead.'],['face','GIL TRABAJADOR','Miente el patrón y miente el diario: al que sostiene la patria con sus manos no lo van a quebrar.']],
 [['stage','MONUMENTAL · SEPTIEMBRE 1994','Monsters of Rock en River Plate: decenas de miles de remeras negras del Oeste copan la cancha antes de Kiss y Sabbath.'],['scene','VÍCTIMAS DEL VACIAMIENTO','Afuera, los matones de valla y los empresarios quieren hacer negocio con la pasión popular (escena de ficción).'],['face','DISCO DE ORO Y DESPEDIDA','En el pico de su convocatoria, Hermética se separa en diciembre de 1994.']],
 [['face','EL AMASIJO DE UN GRAN SUEÑO · 1995','Tras la separación de Hermética, Ricardo funda Almafuerte en 1995: canta y toca el bajo.'],['scene','LLUVIA EN CONSTITUCIÓN','Junto a Claudio "Tano" Marciello y Claudio Cardaci vuelven a empezar desde abajo.'],['stage','MUNDO GUANACO','El metal pesado abraza la milonga, el tango y los versos de José Larralde y Pedro Bonifacio Palacios.']],
 [['road','RUTAS ARGENTINAS · 2001','Entre cacerolazos, corralito bancario y rutas cortadas, el micro de Almafuerte recorre cada provincia.'],['scene','PIEDRA LIBRE EN EL INTERIOR','Mientras los bancos se quedan con el ahorro de los abuelos, los clubes del interior laten con la banda.'],['face','PATRIA Y CAMINO','Donde otros ven crisis y se fugan, la banda sale ruta por ruta a cantarle a su gente.']],
 [['campo','SIERRA DE LA VENTANA · 2006','Lejos del cemento y la histeria porteña, el cantor halla su refugio entre cerros, molinos y eucaliptos.'],['face','TORO Y PAMPA','Le canta a los amigos y al orgullo de su sangre tehuelche.'],['stage','FOGÓN Y GUITARRA','Con el Tano Marciello y Beto Ceriotti, Almafuerte hace tronar el folclore pesado en todo el país.']],
 [['campo','SÁBADO SANTO · PUEBLO DE CAMPO 2012','En "Trillando la fina", un espanto nocturno desvela a los vecinos mientras la prensa amarilla busca carroña.'],['face','MUERE MONSTRUO MUERE','Al monstruo lo atan y lo llevan lejos; al comerciante informador lo sacan del pueblo.'],['scene','CHARLA CON BETO CASELLA','Una charla de amigos: Beto Casella lo entrevistó varias veces.']],
 [['campo','CORONEL SUÁREZ · TIERRA ADENTRO 2023','Coronel Suárez, tierra adentro: ahí vivía, lejos del ruido de la ciudad.'],['face','SÉ VOS, NOMÁS','Un saludo del juego a quien hizo del metal un oficio.'],['stage','UNAS ESTROFAS MÁS','En 2023 recorría el país con la gira "Unas estrofas más". Murió el 24 de octubre de 2023.']]];
let CINE=null;
function cineStart(){const P=CINES[lvl];if(!P)return false;CINE={P,i:0,t:0,ch:0};state='cine';return true;}
function cineEnd(){CINE=null;if(_cineOnEnd){const cb=_cineOnEnd;_cineOnEnd=null;cb();}else{state='card';cardT=0;}}
function cineUpd(){const C=CINE;if(!C){cineEnd();return;}C.t++;const cap=C.P[C.i][2];if(C.ch<cap.length){C.ch+=.9;if(tick%4===0)sfx('blip');}
  if(press.start){cineEnd();return;}
  if(press.atk||press.jump||C.t>300){if(C.ch<cap.length&&C.t<300){C.ch=cap.length;}else{C.i++;C.t=0;C.ch=0;if(C.i>=C.P.length)cineEnd();}}}
// dibuja un personaje animado en la cinemática sin alterar su escala global
function cineActor(styKey,x,y,face,poseKey,hold,scMul,walkPh){
  const st=STY[styKey]||STY.heavy;if(!st)return;
  const base=walkPh!=null?walkPose(walkPh,PO[poseKey]||PO.stand):(PO[poseKey]||PO.stand);
  const f={st,pose:Object.assign({},base),face:face||1,flash:0,state:walkPh!=null?'walk':'idle',x,kind:styKey,hold:hold||null,walkPh:walkPh||0,t:0};
  const sv=st.scale;st.scale=sv*(scMul||1.35);try{drawPuppet(f,x,y);}catch(e){}st.scale=sv;
}
function cineBG(kind,t){const g=ctx,sk=LV?LV.skin:'ric1',R=(a,b,w,h,c)=>{g.fillStyle=c;g.fillRect(a,b,w,h);};
  if(kind==='scene'){const sx=Math.min(1400-W,t*.35)*RS;g.drawImage(FAR,sx,0,W*RS,190*RS,-10-t*.03,0,W+20+t*.06,H);
    if(BG)g.drawImage(BG,Math.min(LW-W,180+t*.4)*RS,0,W*RS,H*RS,0,0,W,H);
    g.fillStyle='rgba(10,8,14,.25)';g.fillRect(0,0,W,H);
    // haz de luz dramático sobre la escena
    const sp=g.createRadialGradient(W*.5,170,12,W*.5,170,210);sp.addColorStop(0,'rgba(255,220,160,.16)');sp.addColorStop(1,'rgba(6,4,10,.45)');g.fillStyle=sp;g.fillRect(0,0,W,H);
    const wy=204,ph=t*.16;
    if(CINE&&CINE.gift){cineActor('viejo',W*.36+Math.min(40,t*.35),wy,1,'stand','bass',1.4,ph);cineActor('ric1',W*.58,wy,-1,'stand',null,1.4);}
    else if(lvl===0){g.save();g.translate(W*.28,198);g.scale(1.3,1.3);drawTruck(0,0,false);g.restore();cineActor('viejo',W*.46,wy,1,'mate','mate',1.35);cineActor('ric1',W*.62,wy,-1,'stand',null,1.35);}
    else if(lvl===1){
      // UN CINE DE BARRIO · 1978 · SALIDA DE LA PELÍCULA DE LED ZEPPELIN
      const cx=W*.08,cw=W*.48;
      g.fillStyle='#18121e';g.fillRect(cx,56,cw,78);
      g.fillStyle='#2c1e34';g.fillRect(cx+4,60,cw-8,24);
      g.strokeStyle='#f2b632';g.lineWidth=1.2;g.strokeRect(cx+4,60,cw-8,24);
      txt('CINE OCEAN · CIUDADELA',cx+cw/2,64,'#f2b632',6,'center');
      txt('HOY: LED ZEPPELIN · LA CANCIÓN ES LA MISMA',cx+cw/2,74,'#f8e6a0',4.5,'center');
      for(let bx=cx+6;bx<cx+cw-6;bx+=8){
        g.fillStyle=(bx+Math.floor(t*.25))%16===0?'#fff8d0':'#f2b632';
        g.beginPath();g.arc(bx,88,1.4,0,7);g.fill();
      }
      const prx=cx+cw*.78,pry=52;
      const pgr=g.createLinearGradient(prx,pry,prx+120,pry+110);
      pgr.addColorStop(0,'rgba(255,245,210,.35)');pgr.addColorStop(1,'rgba(255,245,210,0)');
      g.fillStyle=pgr;g.beginPath();g.moveTo(prx,pry);g.lineTo(prx+115,pry+75);g.lineTo(prx+75,pry+115);g.fill();
      for(let k=0;k<8;k++){g.fillStyle='rgba(255,255,255,.55)';g.fillRect(prx+15+hsh(k+t*.05,3)*70,pry+12+hsh(k,4)*65,1,1);}
      const sCol=(Math.floor(t*.3)%2===0)?'rgba(240,30,40,.24)':'rgba(30,80,255,.24)';
      g.fillStyle=sCol;g.fillRect(0,0,W,H);
      const px=W*.82;
      g.fillStyle='#121218';g.fillRect(px,162,56,24);g.fillStyle='#e8e2d0';g.fillRect(px+8,164,18,9);
      g.fillStyle='#f2b632';g.beginPath();g.arc(px+2,176,3,0,7);g.arc(px+54,176,3,0,7);g.fill();
      g.fillStyle=(Math.floor(t*.3)%2===0)?'#ff2222':'#2266ff';g.fillRect(px+25,157,6,5);
      cineActor('ricV',W*.36,wy,1,'stand','bass',1.4);
      cineActor('chofa',W*.54,wy,-1,'stand','gtr',1.4);
      cineActor('cana',W*.84-t*.12,wy,-1,'stand',null,1.3,ph);
      for(let k=0;k<3;k++){g.fillStyle='rgba(215,215,230,'+(.28-k*.08)+')';g.beginPath();g.arc(W*.53-k*2,wy-42-k*5,2+k*1.2,0,7);g.fill();}
    }
    else if(lvl===2){
      // Gala del Hotel Alvear y BA Rock IV
      g.fillStyle='#8a1c18';g.fillRect(W*.22,194,W*.56,8);
      for(let k=0;k<4;k++){R(W*.26+k*50,132,2,60,'#d8c898');R(W*.24+k*50,132,6,4,'#f2b632');}
      if(t%20<3){const fx=W*.25+rnd(0,W*.5),fy=140+rnd(0,30);g.fillStyle='rgba(255,255,255,.75)';g.beginPath();g.arc(fx,fy,14,0,7);g.fill();}
      cineActor('carpo',W*.32,wy,1,'stand',null,1.42);cineActor('ric2',W*.50,wy,1,'stand','bass',1.4);cineActor('cana',W*.72,wy,-1,'stand',null,1.35);
    }
    else if(lvl===3){cineActor('ricH',W*.42,wy,1,'stand','bass',1.4);cineActor('violero',W*.58,wy,-1,'stand','gtr',1.38);cineActor('curador',W*.78,wy,-1,'stand','papel',1.3);}
    else if(lvl===4){cineActor('tornero',W*.34,wy,1,'stand',null,1.38);cineActor('ric3',W*.52,wy,1,'stand','bass',1.4);cineActor('vaciador',W*.76,wy,-1,'stand','gavel',1.32);}
    else if(lvl===5){cineActor('pibe',W*.32,wy,1,'victory',null,1.35);cineActor('ricM',W*.50,wy,1,'stand','bass',1.42);cineActor('seguridad',W*.74,wy,-1,'idle',null,1.35);}
    else if(lvl===6){
      // noche de lluvia en Constitución y Cemento
      g.strokeStyle='rgba(170,205,240,.35)';g.lineWidth=.8;
      for(let k=0;k<32;k++){const rx=(k*23+t*6)%W,ry=(k*37+t*15)%H;g.beginPath();g.moveTo(rx,ry);g.lineTo(rx-3,ry+12);g.stroke();}
      g.fillStyle='rgba(120,160,210,.18)';for(let k=0;k<6;k++)g.fillRect(W*.2+k*46,wy-2,24,2);
      cineActor('ricA',W*.40,wy,1,'stand','bass',1.4);cineActor('violero',W*.60,wy,-1,'stand','gtr',1.4);
    }
    else if(lvl===7){cineActor('jubilado',W*.32,wy,1,'stand','cacerola',1.35);cineActor('ric4',W*.52,wy,1,'stand','mic',1.4);cineActor('camionero',W*.70,wy,-1,'stand',null,1.35);}
    else if(lvl===9){
      // jaula de pajaritos en el patio, mesa con radio AM y charla con Beto Casella
      g.fillStyle='#3a2a1a';g.fillRect(W*.48,136,2,54);g.fillRect(W*.55,136,2,54);g.fillStyle='#5a4a3a';g.fillRect(W*.47,132,42,4);
      g.strokeStyle='rgba(220,220,200,.75)';g.lineWidth=.7;for(let k=0;k<8;k++){g.beginPath();g.moveTo(W*.475+k*5,136);g.lineTo(W*.475+k*5,160);g.stroke();}
      for(let k=0;k<4;k++){g.fillStyle=['#f2d22a','#4fa04a','#e04a2a','#5aa0e8'][k];g.beginPath();g.arc(W*.485+k*8,148+(k%2)*5,2.2,0,7);g.fill();}
      g.fillStyle='#4a3622';g.fillRect(W*.49,180,26,18);g.fillStyle='#221e24';g.fillRect(W*.50,172,14,8);g.fillStyle='#d8a848';g.fillRect(W*.505,174,8,3);
      cineActor('ricT',W*.38,wy,1,'mate','mate',1.42);cineActor('beto',W*.64,wy,-1,'stand','mic',1.4);
    }
    else{cineActor(sk,W*.45,wy,1,'stand',null,1.4);}
    return;}
  if(kind==='truck'||kind==='road'){const gr=g.createLinearGradient(0,0,0,H);gr.addColorStop(0,kind==='truck'?'#1a1830':'#0e0c1a');gr.addColorStop(.55,kind==='truck'?'#5a3a4a':'#2a1a2a');gr.addColorStop(.56,'#1a1a1e');gr.addColorStop(1,'#0c0c10');g.fillStyle=gr;g.fillRect(0,0,W,H);
    for(let k=0;k<30;k++){g.fillStyle='rgba(239,228,210,.5)';g.fillRect(hsh(k,7)*W,hsh(k,8)*120,1,1);}
    // cartel rutero verde de Ruta Nacional
    const rx=((360-t*2.4)%(W+120)+W+120)%(W+120)-60;
    g.fillStyle='#787c82';g.fillRect(rx+10,124,2,34);g.fillRect(rx+48,124,2,34);g.fillStyle='#1e5a36';g.fillRect(rx,106,60,20);g.strokeStyle='#e8e2d0';g.lineWidth=1;g.strokeRect(rx+1.5,107.5,57,17);
    txt(kind==='truck'?'AV. RIVADAVIA':'RN 3 · SUR',rx+30,113,'#e8e2d0',4,'center');
    g.fillStyle='#14121a';for(let k=0;k<8;k++){const x=((k*90-t*1.2)%(W+90)+W+90)%(W+90)-60;g.fillRect(x,108,40+hsh(k,3)*30,44);g.fillStyle='rgba(242,200,110,.5)';g.fillRect(x+8,118,4,5);g.fillRect(x+22,128,4,5);g.fillStyle='#14121a';}
    g.fillStyle='#e8e2d0';for(let k=0;k<10;k++){const x=((k*60-t*5)%(W+60)+W+60)%(W+60)-30;g.fillRect(x,210,26,3);}
    if(kind==='truck'){g.save();g.translate(W*.55,200+Math.sin(t*.3)*.8);g.scale(2.2,2.2);drawTruck(0,0,true);g.restore();cineActor('ric1',W*.45,152,1,'stand',null,1.15);}
    else{g.save();g.translate(W*.42,196+Math.sin(t*.25)*.7);g.scale(1.35,1.35);drawCamion();g.restore();
      for(let k=0;k<2;k++){g.fillStyle='rgba(255,240,190,'+(.25+.1*Math.sin(t*.2))+')';g.beginPath();g.moveTo(W*.52+k*20,184);g.lineTo(W+20,150+k*30);g.lineTo(W+20,224+k*20);g.fill();}}
    return;}
  if(kind==='campo'){const gr=g.createLinearGradient(0,0,0,H);gr.addColorStop(0,'#2a2048');gr.addColorStop(.45,'#c8603a');gr.addColorStop(.6,'#f2b264');gr.addColorStop(.61,'#3a3a1e');gr.addColorStop(1,'#1a1a10');g.fillStyle=gr;g.fillRect(0,0,W,H);
    // silueta de las sierras pampeanas al fondo
    g.fillStyle='#241a2c';g.beginPath();g.moveTo(0,164);g.lineTo(90,126);g.lineTo(190,148);g.lineTo(310,118);g.lineTo(420,146);g.lineTo(W,132);g.lineTo(W,164);g.fill();
    g.fillStyle='rgba(255,220,150,.9)';g.beginPath();g.arc(W*.7,154,22,0,7);g.fill();
    const mx=W*.20,my=104;g.strokeStyle='#141016';g.lineWidth=2;g.beginPath();g.moveTo(mx-12,166);g.lineTo(mx,my);g.lineTo(mx+12,166);g.stroke();
    for(let k=0;k<8;k++){const a=t*.04+k*Math.PI/4;g.beginPath();g.moveTo(mx,my);g.lineTo(mx+Math.cos(a)*18,my+Math.sin(a)*18);g.stroke();}
    // alambrado rural y tranquera de madera
    g.strokeStyle='rgba(30,24,20,.75)';g.lineWidth=1;for(const wy of [154,159,163]){g.beginPath();g.moveTo(0,wy);g.lineTo(W,wy);g.stroke();}
    for(let px=18;px<W;px+=42){g.fillStyle='#241c16';g.fillRect(px,148,2,18);}
    g.strokeStyle='rgba(20,16,22,.85)';g.lineWidth=1.2;for(let k=0;k<9;k++){const x=(k*40+t*.6)%(W+40)-20,y=50+hsh(k,2)*50+Math.sin(t*.05+k)*4,w=Math.sin(t*.3+k)*2.5;g.beginPath();g.moveTo(x-4,y-w);g.quadraticCurveTo(x-2,y-1,x,y);g.quadraticCurveTo(x+2,y-1,x+4,y-w);g.stroke();}
    g.fillStyle='#141410';for(let x=0;x<W;x+=3)g.fillRect(x,164-hsh(x,5)*4,2,6);
    // fogón criollo con pava y llamas animadas
    const fx=W*.53,fy=196;
    g.fillStyle='#3a2416';g.fillRect(fx-9,fy,18,3);g.fillRect(fx-7,fy-2,14,3);
    for(let k=0;k<3;k++){g.fillStyle=k===0?'#e2462c':k===1?'#f29b2e':'#f8e27a';g.beginPath();g.arc(fx-3+k*3,fy-3-Math.abs(Math.sin(t*.25+k))*4,4-k*.8,0,7);g.fill();}
    if(lvl===8){cineActor('ricT',W*.42,198,1,'mate','mate',1.4);cineActor('pelusa',W*.64,198,-1,'stand',null,1.38);}
    else if(lvl===9){cineActor('ricT',W*.40,198,1,'stand',null,1.4);cineActor('espanto',W*.70,198,-1,'idle',null,1.35);}
    else{cineActor('ric5',W*.42,198,1,'stand',null,1.42);cineActor('anselmo',W*.64,198,-1,'mate','mate',1.35);}
    return;}
  if(kind==='stage'){g.fillStyle='#08060c';g.fillRect(0,0,W,H);
    // estructura metálica de luces (truss) y telón de fondo con emblema de cada banda
    g.fillStyle='#1c1822';g.fillRect(20,24,W-40,5);for(let x=24;x<W-28;x+=14){g.strokeStyle='#342c3e';g.lineWidth=1;g.beginPath();g.moveTo(x,24);g.lineTo(x+7,29);g.lineTo(x+14,24);g.stroke();}
    g.fillStyle='#120e18';g.fillRect(W*.26,34,W*.48,88);g.strokeStyle='#3a2c38';g.lineWidth=1.5;g.strokeRect(W*.26,34,W*.48,88);
    const bName=lvl<=2?'V8':lvl<=5?'HERMÉTICA':lvl<=9?'ALMAFUERTE':'IORIO';
    txt(bName,W*.5,50,lvl<=2?'#e2462c':'#f2b632',16,'center');
    if(lvl>=3&&lvl<=5){g.strokeStyle='rgba(242,182,50,.45)';g.lineWidth=1.5;g.beginPath();g.arc(W*.5,88,16,0,7);g.stroke();txt('H',W*.5,80,'rgba(242,182,50,.55)',12,'center');}
    else if(lvl>=6){g.fillStyle='rgba(242,182,50,.35)';g.fillRect(W*.5-14,84,28,4);g.fillRect(W*.5-2,74,4,24);}
    // torres de amplificadores Marshall a ambos lados del escenario
    for(const mx of [44,90,W-74,W-120]){
      g.fillStyle='#16141a';g.fillRect(mx,96,28,54);g.fillStyle='#26222a';g.fillRect(mx+2,98,24,22);g.fillRect(mx+2,123,24,24);
      g.fillStyle='#d8c498';g.fillRect(mx+7,102,14,2);g.fillRect(mx+7,127,14,2);
    }
    for(let k=0;k<4;k++){const a=Math.sin(t*.03+k*1.7)*.35,x=60+k*120;g.save();g.translate(x,26);g.rotate(a);const gr=g.createLinearGradient(0,0,0,200);gr.addColorStop(0,k%2?'rgba(226,70,44,.55)':'rgba(242,182,50,.45)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.beginPath();g.moveTo(-6,0);g.lineTo(6,0);g.lineTo(60,210);g.lineTo(-60,210);g.fill();g.restore();}
    g.fillStyle='#1a1418';g.fillRect(0,150,W,12);g.fillStyle='#2e242a';g.fillRect(0,150,W,2);
    if(!SHOW){
      drawDrums(W*.5,152,t);
      showMan(STY[sk]||STY.ric2,W*.36,158,lvl>=8&&lvl!==9?'mic':'bass',t,0,1,true);
      showMan(STY[lvl<=1?'chofa':'violero']||STY.violero,W*.66,158,'gtr',t,1,-1,false);
    }
    // niebla sobre las tablas del escenario
    g.fillStyle='rgba(210,195,220,.08)';for(let k=0;k<7;k++){g.beginPath();g.ellipse((k*75+t*.8)%(W+60)-30,156+Math.sin(t*.06+k)*3,36,7,0,0,7);g.fill();}
    for(let r=0;r<3;r++)for(let k=0;k<26;k++){const x=k*19+(r%2)*9-6,y=196+r*22+Math.abs(Math.sin(t*.15+k*.7+r))*-5;g.fillStyle=r===0?'#151018':r===1?'#1d1620':'#251c28';g.beginPath();g.ellipse(x,y,7,8,0,0,7);g.fill();g.fillRect(x-9,y+6,18,30);
      if((k+r)%4===0){g.fillRect(x+5,y-20+Math.sin(t*.2+k)*3,3,16);g.fillRect(x+4,y-23+Math.sin(t*.2+k)*3,5,5);}}
    return;}
  // face: fondo atmosférico con viñeta escénica a la derecha del retrato de Ricardo
  const gr=g.createRadialGradient(W*.28,H*.45,10,W*.28,H*.45,260);gr.addColorStop(0,'#421c1c');gr.addColorStop(.6,'#1a0e16');gr.addColorStop(1,'#08060c');g.fillStyle=gr;g.fillRect(0,0,W,H);}
function drawCine(){const C=CINE;if(!C)return;const [kind,head,cap]=C.P[C.i],t=C.t,g=ctx;
  cineBG(kind,t);
  // Efectos de película cinematográfica (grano de 35mm y proyector)
  g.fillStyle='rgba(255,245,215,'+(Math.sin(t*2.8)*.012+.01)+')';g.fillRect(0,0,W,H);
  if(hsh(t,29)>.65){const sx=hsh(t,31)*W;g.strokeStyle='rgba(255,255,255,.07)';g.lineWidth=.5;g.beginPath();g.moveTo(sx,0);g.lineTo(sx+rnd(-1,1),H);g.stroke();}
  if(kind==='face'){
    const sz=172+t*.12;g.save();g.beginPath();g.rect(0,24,W,H-48);g.clip();
    // viñeta enmarcada a la derecha del retrato de Ricardo con la escena viva del capítulo
    const vx=W*.54,vy=36,vw=W*.41,vh=164;
    g.save();g.beginPath();g.rect(vx,vy,vw,vh);g.clip();
    if(FAR)g.drawImage(FAR,Math.min(1200,t*.3)*RS,0,vw*RS,vh*RS,vx,vy,vw,vh);
    if(BG)g.drawImage(BG,Math.min(LW-W,240+t*.35)*RS,20*RS,vw*RS,vh*RS,vx,vy,vw,vh);
    g.fillStyle='rgba(12,8,16,.38)';g.fillRect(vx,vy,vw,vh);
    const sk=LV?LV.skin:'ric1';
    if(C.gift&&C.i===1){g.save();g.translate(vx+vw*.5,vy+vh*.54);g.scale(2.2,2.2);BASS(0,0,-.35,true);g.restore();}
    else{
      const ally=lvl===0?'viejo':lvl===1?'chofa':lvl===2?'carpo':lvl<=6?'violero':lvl===7?'jubilado':lvl===8?'pelusa':lvl===9?'beto':'anselmo';
      cineActor(sk,vx+vw*.36,vy+vh-12,1,lvl>=8?'mate':'stand',lvl>=7&&lvl<8?'mic':lvl<7?'bass':'mate',1.15);
      cineActor(ally,vx+vw*.70,vy+vh-12,-1,'stand',ally==='chofa'||ally==='violero'?'gtr':null,1.12);
    }
    g.restore();
    g.strokeStyle='rgba(242,182,50,.45)';g.lineWidth=1.2;g.strokeRect(vx,vy,vw,vh);
    const gr=g.createLinearGradient(W*.34,0,W*.62,0);gr.addColorStop(0,'rgba(8,6,12,0)');gr.addColorStop(1,'rgba(8,6,12,.55)');g.fillStyle=gr;g.fillRect(0,24,W,H-48);
    // retrato en primer plano de Ricardo Iorio a la izquierda
    drawFaceFront(STY[LV.skin],W*.06-t*.03,38-t*.05,sz);
    g.restore();
  }
  const vg=g.createRadialGradient(W/2,H/2,H*.3,W/2,H/2,H*.9);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.6)');g.fillStyle=vg;g.fillRect(0,0,W,H);
  g.fillStyle='#000';g.fillRect(0,0,W,24);
  g.fillStyle='rgba(242,182,50,.35)';g.fillRect(0,24,W,1);
  g.fillStyle='rgba(242,182,50,.35)';g.fillRect(0,H-60,W,1);
  g.fillStyle='#000';g.fillRect(0,H-60,W,60);
  const fi=Math.min(1,t/16);g.globalAlpha=fi;txt(head,14,8,'#f2b632',8);
  const reelTag='[ 35mm · '+LV.chap.toUpperCase()+' ]';
  txt(reelTag,W-14,9,'#9b8aa3',5.5,'right');
  wrap(cap.slice(0,Math.floor(C.ch)),58).forEach((l,k)=>txt(l,W/2,H-50+k*9.5,'#efe4d2',6.5,'center'));
  for(let k=0;k<C.P.length;k++){g.fillStyle=k===C.i?'#e2462c':'#4a3a4e';g.fillRect(W/2-C.P.length*7+k*14,H-10,10,3);}
  txt(coarse?'TOCÁ: SIGUE':'Z: SIGUE · ENTER: SALTEAR',W-10,H-11,'#6a5a6e',5,'right');g.globalAlpha=1;
  nostalgia(Math.max(.25,(CLIMA[lvl]||{}).sep||0));
  if(t<10){g.fillStyle='rgba(0,0,0,'+(1-t/10)+')';g.fillRect(0,0,W,H);}}
// ---- álbum de figuritas: cada dato real que aparece en el juego se pega en el álbum (queda guardado en el navegador)
const ALB={got:{},pg:0,prev:'title',last:''};
try{ALB.got=JSON.parse(localStorage.getItem('ricardio-album')||'{}')||{};}catch(e){}
function albumSave(){try{localStorage.setItem('ricardio-album',JSON.stringify(ALB.got));}catch(e){}}
function albumTick(){if(!dato||!dato.s||dato.s===ALB.last)return;ALB.last=dato.s;if(ALB.got[dato.s]!=null)return;ALB.got[dato.s]=lvl;albumSave();
  const n=Object.keys(ALB.got).length;if(player)floatTxt(player.x,player.y-110,'¡FIGURITA NUEVA! '+n+'/'+albumTotal(),'#9fd8ff');sfx('pickup');}
function albumList(i){const L=(DATOS[i]||[]).slice();for(const s in ALB.got)if(ALB.got[s]===i&&!L.includes(s))L.push(s);return L;}
function albumTotal(){let n=0;for(let i=0;i<LEVELS.length;i++)n+=albumList(i).length;return n;}
function albumOpen(){if(state!=='title'&&state!=='pause')return;ALB.prev=state;ALB.pg=state==='pause'?lvl:Math.min(sel,LEVELS.length-1);state='album';sfx('blip');}
function albumUpd(){if(press.left){ALB.pg=(ALB.pg+LEVELS.length-1)%LEVELS.length;sfx('blip');}if(press.right){ALB.pg=(ALB.pg+1)%LEVELS.length;sfx('blip');}
  if(press.start||press.atk||press.jump||press.album)state=ALB.prev;}
function drawAlbum(){const g=ctx,i=ALB.pg,L=LEVELS[i],F=albumList(i);g.fillStyle='#1a1410';g.fillRect(0,0,W,H);
  g.fillStyle='#e8dcc0';g.fillRect(16,14,W-32,H-28);g.fillStyle='#c8b890';g.fillRect(W/2-1,14,2,H-28);g.strokeStyle='#5a4630';g.lineWidth=2;g.strokeRect(16,14,W-32,H-28);
  txt('ÁLBUM DE FIGURITAS',W/2,20,'#7a1a14',9,'center');
  txt((i+1)+'. '+L.title+' · '+L.place,W/2,34,'#3a2a1a',6,'center');
  const got=F.filter(s=>ALB.got[s]!=null).length;txt(got+'/'+F.length+' EN ESTE CAPÍTULO · '+Object.keys(ALB.got).length+'/'+albumTotal()+' EN TOTAL',W/2,44,'#7a5a3a',5,'center');
  let col=0,y=56;F.forEach((s,k)=>{const x=col?W/2+8:26,has=ALB.got[s]!=null,lines=has?wrap(s,36):['???','Seguí jugando este capítulo.'],h=lines.length*8+8;
    if(y+h>H-42){if(col)return;col=1;y=56;}
    const xx=col?W/2+8:26;g.fillStyle=has?'#fff8e4':'#d0c4a4';g.fillRect(xx,y,W/2-34,h);g.strokeStyle=has?'#c8322a':'#a89870';g.lineWidth=1;g.strokeRect(xx,y,W/2-34,h);
    lines.forEach((l,j)=>txt(l,xx+5,y+4+j*8,has?'#2a1a10':'#8a7a5a',5));y+=h+4;});
  txt('Fuentes: Wikipedia, Los Andes, Sitio Andino y notas de 2023. Los diálogos son ficción.',W/2,H-26,'#7a6a4a',4,'center');
  txt(coarse?'◀ ▶ PÁGINA · TOCÁ PARA VOLVER':'◀ ▶ PÁGINA · Z O ENTER: VOLVER',W/2,H-11,'#e8dcc0',5,'center');}
function albumBtn(){try{const b0=LM.btns&&LM.btns[0];if(!b0||document.getElementById('albBtn'))return;const b=b0.cloneNode(false);b.id='albBtn';b.textContent='ÁLBUM';b.addEventListener('click',e=>{e.stopPropagation();audioInit&&audioInit();albumOpen();});b0.parentNode.appendChild(b);LM.btns.push(b);}catch(e){}}
setTimeout(albumBtn,300);setTimeout(albumBtn,1500);
// ---- correr: doble toque adelante; atacar corriendo es una embestida
function runChk(f,ix){if(!MOVES.rush)MOVES.rush={dur:24,a0:4,a1:12,reach:34,dmg:12,kd:1,pose:'cross',h:44,step:6};
  const tap=press.right?1:press.left?-1:0;if(tap){if(f.tapD===tap&&tick-(f.tapT||-99)<16)f.run=tap;f.tapD=tap;f.tapT=tick;}
  if(f.run&&ix!==f.run)f.run=0;if(f.run&&tick%7===0)dust(f.x-f.run*6,f.y,1);return f.run?1.75:1;}
// ---- 1982: la salida del Hotel Alvear
function alvearInit(){if(alvearInit.done)return;alvearInit.done=1;try{trimTalk();auditFix();}catch(e){console.error(e)}try{AFICHES[7].push([1900,'PESO ARGENTO','IORIO Y FLAVIO','1997','#c8a060']);AFICHES[9].push([1700,'AYER DESEO','HOY REALIDAD','IORIO SOLISTA','#7a5a9a']);AFICHES[10].push([2100,'TANGOS Y','MILONGAS','IORIO 2014','#a87a4a']);}catch(e){}const L=LEVELS[2];if(!L)return;
  L.locks[0].groups=[[['cana','R'],['cana','R']],[['cana2','R'],['cana','L'],['cana','R']]];L.locks[0].alvear=1;
  if(L.intro&&L.intro[0])L.intro[0].s='Antes del festival nos cayó la cana. Nos soltaron, pero en la puerta hay más.';}
function alvearBG(g,R,T,arch){R(40,30,600,146,'#ddd0b4');for(let y=36;y<176;y+=7)R(40,y,600,1,'#c8bb9c');
  g.fillStyle='#3e4450';g.beginPath();g.moveTo(32,34);g.lineTo(60,6);g.lineTo(620,6);g.lineTo(648,34);g.fill();
  for(let x=80;x<620;x+=60){R(x,12,22,18,'#ddd0b4');arch(x+4,14,14,16,'#2a2e36');}
  R(40,30,600,4,'#efe4cc');R(40,92,600,4,'#efe4cc');
  for(let x=60;x<630;x+=40){R(x,44,16,36,'#2a2e36');R(x-2,42,20,3,'#efe4cc');R(x-2,80,20,3,'#efe4cc');R(x+7,44,2,36,'#ddd0b4');}
  for(let x=60;x<630;x+=80){arch(x,104,30,72,'#efe4cc');arch(x+3,107,24,69,'#3a2a26');}
  R(250,96,180,20,'#6a1a1e');T('ALVEAR PALACE HOTEL',340,101,'#f2dca0',6,'center');
  for(const fx of [180,500]){R(fx,4,2,30,'#5a5048');R(fx+2,6,18,10,'#7aa8d8');R(fx+2,9,18,3,'#f0ece2');}
  R(260,150,160,6,'#6a1a1e');T('GALA',340,151,'#f2dca0',4,'center');}

// v27: diálogos sincronizados con lo que pasa en pantalla. Las frases "de ambiente" esperan su turno:
// no se pisan con peleas, cinemáticas, la moto, el viejo con el bajo ni el camión.
let MOMENT=0,AMB=[],ambLast=0;const AMBDONE={};
function foesAlive(){return ents.some(e=>!e.gone&&e.team===1&&e.hp>0);}
function calm(){return state==='play'&&!MOMENT&&!dato&&!(BGIFT.on&&!BGIFT.done)&&!RIDE.on&&!banner&&!(boss&&boss.hp>0);}
function ambient(key,s,d){if(AMBDONE[lvl+':'+key])return;AMBDONE[lvl+':'+key]=1;AMB.push({s,d:d||200,lv:lvl});}
function ambTick(){if(AMB.length&&AMB[0].lv!==lvl)AMB=AMB.filter(a=>a.lv===lvl);
  if(!AMB.length||!calm()||!player||bubbles.some(b=>b.f===player)||tick-ambLast<150)return;
  const a=AMB.shift();ambLast=tick;say(player,a.s,a.d);}
function discoTick(){const bp=document.getElementById('bPap'),t=lvl>=2?'DISCO':'PAPA';if(bp&&bp.textContent!==t)bp.textContent=t;
  if(AMBDONE.p!==player){AMBDONE.p=player;for(const k in AMBDONE)if(k!=='p'&&k.startsWith(lvl+':'))delete AMBDONE[k];AMB=[];}
  if(state!=='play')return;ambTick();
  if(lvl===2&&datoT>200)ambient('papas','¡Estoy podrido de las papas! Desde ahora revoleo discos.',170);
  if(datoT>330&&RECUERDOS[lvl])ambient('rec',RECUERDOS[lvl],230);}
// la moto pasa cuando no hay pelea, y el texto del dato aparece justo cuando la mira
function guiTick(){if(state!=='play')return;
  if(lvl===0&&!GUI.moto&&!GUI.motoDone&&datoT>150&&!lock&&!foesAlive()&&calm()){GUI.moto={x:cam.x-70};GUI.motoDone=1;sfx('truck');MOMENT=1;}
  const M=GUI.moto;if(!M)return;M.x+=2.3;
  if(!M.said&&M.x>cam.x+W*.18){M.said=1;bubbles=bubbles.filter(b=>b.f!==player);say(player,'¡Mirá esa moto! ¡Yo quiero ser eso!',230);
    const s=(DATOS[0]||[]).find(x=>/moto/i.test(x));if(s)dato={s,t:420};}
  if(M.said&&(player.state==='idle'||player.state==='walk'))player.face=M.x>player.x?1:-1;
  if(M.x>cam.x+W+80){GUI.moto=null;MOMENT=0;}}
// los datos sueltos tampoco se adelantan: el del primer bajo espera al viejo y el de la moto sale con la moto
function factOK(s){if(lvl===0&&!BGIFT.done&&/bajo|Faim/i.test(s))return false;if(lvl===0&&/moto/i.test(s))return false;return true;}
function nextFact(L){for(let k=0;k<L.length;k++){const s=L[datoI++%L.length];if(factOK(s))return s;}return null;}
// v28: menos charla. Un solo enemigo grita por vez, las réplicas tienen pausa y las frases sueltas son pocas.
let BARKT=-999,CBT=-999;
function barkOK(){if(tick-BARKT<300||bubbles.some(b=>b.f&&b.f.team===1))return false;BARKT=tick;return true;}
function comebackOK(){if(tick-CBT<900||Math.random()>.35)return false;CBT=tick;return true;}

// v27: al terminar cada capítulo, un recital con la banda real de esa época (nombres en los créditos, sin diálogos inventados)
// y referencias a lo que pasó en el nivel. Datos: rag-iorio.jsonl (formaciones, fechas, lugares).
const SHOWS=[
 {v:'EL FONDO DE LA VERDULERÍA',d:'CASEROS · 1978',b:'PRIMERA ZAPADA',L:[['Ricardo Iorio','bajo','me'],['Chofa Moreno','guitarra','chofa']],set:['Una zapada imaginada en el patio'],
  r:['El Capanga ya no cobra peaje: el barrio se acerca a escuchar.','El viejo mira desde el camión, con las papas cargadas.','El Faim suena por primera vez.'],f:['EL PAPERO','CASEROS']},
 {v:'UN CLUB DEL OESTE',d:'1979 · 1981',b:'V8',L:[['Ricardo Iorio','bajo y voz','me'],['Chofa Moreno','guitarra','chofa'],['Gerardo Osemberg','batería','heavy']],set:['Heavy rápido y en castellano'],
  r:['La razzia no pudo con los melenudos.','Primera formación de V8: un trío.','El Chofa y Ricardo, como lo charlaron a la salida del cine.'],f:['V8','METAL PESADO']},
 {v:'OBRAS · BA ROCK IV',d:'FINES DE 1982',b:'V8',L:[['Ricardo Iorio','bajo','me'],['Beto Zamarbide','voz','heavy'],['Osvaldo Civile','guitarra','violero'],['Gustavo Rowek','batería','heavy']],set:['Lo que va a ser Luchando por el metal (1983)'],
  r:['Recién salidos de la cana, antes del festival.','El público hippie silba; V8 sube el volumen.','Pappo, El Carpo, los apadrinó para que tocaran.'],f:['V8','BRIGADAS METÁLICAS']},
 {v:'PUB HELLOWEEN · SAN MARTÍN',d:'7 DE MAYO DE 1988',b:'HERMÉTICA',L:[['Ricardo Iorio','bajo','me'],["Claudio O'Connor",'voz','heavy'],['Antonio Romano','guitarra','violero'],['Fabián Spataro','batería','heavy']],set:['El debut oficial de Hermética'],
  r:['El día antes tocaron gratis en el Centro Cultural Recoleta.','La banda se llamó primero Helvética.','Nace la banda del laburante y del barrio.'],f:['HERMÉTICA','SAN MARTÍN']},
 {v:'OBRAS SANITARIAS',d:'1992',b:'HERMÉTICA',L:[['Ricardo Iorio','bajo','me'],["Claudio O'Connor",'voz','heavy'],['Antonio Romano','guitarra','violero'],['Claudio Strunz','batería','heavy']],set:['Cambalache (versión)','Temas de Ácido argentino'],
  r:['La metalúrgica del barrio no se remata: el Vaciador se fue sin nada.','Con Ácido argentino abren para Black Sabbath.','Ese año también abren para Motörhead.'],f:['HERMÉTICA','LOS DEL OESTE']},
 {v:'MONSTERS OF ROCK · RIVER',d:'PRINCIPIOS DE SEPTIEMBRE DE 1994',b:'HERMÉTICA',L:[['Ricardo Iorio','bajo','me'],["Claudio O'Connor",'voz','heavy'],['Antonio Romano','guitarra','violero'],['Claudio Strunz','batería','heavy']],set:['Temas de Víctimas del vaciamiento'],
  r:['Las banderas del Oeste copan la cancha de River.','En el festival también tocan Kiss, Black Sabbath y Slayer.','En diciembre, último show en Go! de Mar del Plata.'],f:['HERMÉTICA NO SE TOCA','AGUANTE EL METAL']},
 {v:'LOS PRIMEROS SHOWS',d:'1995',b:'ALMAFUERTE',L:[['Ricardo Iorio','voz y bajo','me'],['Claudio Marciello','guitarra','violero'],['Claudio Cardaci','batería','heavy']],set:['Temas de Mundo guanaco'],
  r:['"Mundo guanaco" sale en 1995.','El nombre homenajea al poeta Almafuerte.','Después de Hermética, empezar de nuevo.'],f:['ALMAFUERTE','MUNDO GUANACO']},
 {v:'UN CLUB DEL INTERIOR',d:'2001',b:'ALMAFUERTE',L:[['Ricardo Iorio','voz y bajo','me'],['Claudio Marciello','guitarra','violero'],['Bin Valencia','batería','heavy']],set:['Temas de Piedra libre'],
  r:['Afuera, el corralito. Adentro, el club lleno.','Ese año graban En vivo Obras 2001.','La tendinitis avanza: pronto deja el bajo.'],f:['ALMAFUERTE','PIEDRA LIBRE']},
 {v:'ALMAFUERTE EN VIVO',d:'2006',b:'ALMAFUERTE',L:[['Ricardo Iorio','voz','me'],['Claudio Marciello','guitarra','violero'],['Beto Ceriotti','bajo','heavy'],['Bin Valencia','batería','heavy']],set:['Toro y pampa'],
  r:['Iorio deja el bajo y entra Beto Ceriotti; él canta.','Toro y pampa: campo, asado y amistad.','Del pueblo de la sierra, sin cazadores ni loteadores.'],f:['ALMAFUERTE','TORO Y PAMPA']},
 {v:'ESTADIO ISLAS MALVINAS · ALL BOYS',d:'22 DE JUNIO DE 2013',b:'ALMAFUERTE',L:[['Ricardo Iorio','voz','me'],['Claudio Marciello','guitarra','violero'],['Bin Valencia','batería','heavy'],['Beto Zamarbide','invitado: temas de V8','heavy']],set:['Temas de Trillando la fina','Temas de V8 con Zamarbide'],
  r:['El espanto del pueblo ya no asusta a nadie.','Unas 20 mil personas llenan el estadio.','Iorio se retira un rato y Zamarbide canta los de V8.'],f:['ALMAFUERTE','TRILLANDO LA FINA']},
 {v:'GIRA UNAS ESTROFAS MÁS · TRELEW',d:'9 DE SEPTIEMBRE DE 2023',b:'RICARDO IORIO',L:[['Ricardo Iorio','voz','me'],['Banda de gira','guitarra','violero'],['Banda de gira','bajo','heavy'],['Banda de gira','batería','heavy']],set:['Temas de V8, Hermética y Almafuerte'],
  r:['Como solista grabó covers, tangos y milongas.','Larralde, uno de sus referentes criollos.','Su gente lo sigue cantando.'],f:['RICARDO IORIO','TIERRA ADENTRO']}];
let SHOW=null;
function showStart(){const S=SHOWS[lvl];if(!S){showEnd();return;}SHOW={S,t:0,i:0,ch:0};state='show';try{song=LV.song;}catch(e){}sfx('win');}
function showEnd(){SHOW=null;if(lvl<LEVELS.length-1&&!LEVELS[lvl+1].bonus)startChapter(lvl+1,true);else{state='ending';endT=0;song='l5';}}
function showUpd(){const Q=SHOW;if(!Q){showEnd();return;}Q.t++;const r=Q.S.r[Q.i]||'';if(Q.ch<r.length)Q.ch+=.8;
  if(press.start){showEnd();return;}
  if(Q.t>40&&(press.atk||press.jump||Q.ch>=r.length+150)){if(Q.ch<r.length)Q.ch=r.length;else{Q.i++;Q.ch=0;if(Q.i>=Q.S.r.length)showEnd();}}}
function showRole(role,who){if(who==='me'){if(/bajo/.test(role)&&!(lvl>=8&&lvl!==9))return 'bass';return 'mic';}if(/batería/.test(role))return 'drums';if(/guitarra/.test(role))return 'gtr';if(/bajo/.test(role))return 'bass';return 'mic';}
function drawDrums(x,y,t){const g=ctx,hit=Math.sin(t*.5)>.6;g.fillStyle='#1a1418';g.fillRect(x-30,y-6,60,6);
  g.fillStyle='#5a1a1e';g.beginPath();g.ellipse(x,y-18,16,16,0,0,7);g.fill();g.fillStyle='#e8e2d0';g.beginPath();g.ellipse(x,y-18,11,11,0,0,7);g.fill();txt('♦',x,y-24,'#5a1a1e',8,'center');
  g.fillStyle='#3a3440';g.fillRect(x-28,y-30,14,10);g.fillRect(x+14,y-30,14,10);g.fillStyle=hit?'#ffe08a':'#c8a040';g.beginPath();g.ellipse(x-30,y-44,12,2.4,0,0,7);g.fill();g.beginPath();g.ellipse(x+30,y-46,12,2.4,0,0,7);g.fill();
  g.strokeStyle='#6a6a72';g.lineWidth=1;g.beginPath();g.moveTo(x-30,y-44);g.lineTo(x-30,y);g.moveTo(x+30,y-46);g.lineTo(x+30,y);g.stroke();}
function showMan(st,x,y,hold,t,k,face,me){const ph=t*.22+k*1.3,bang=Math.sin(ph);
  let pose=Object.assign({},hold==='mic'?PO.stand:PO.idle,{tilt:bang*.16,lean:.06+Math.max(0,bang)*.12,crouch:Math.abs(bang)*2});
  const r={st,pose,face,flash:0,state:hold==='drums'?'sit':'idle',x,kind:'band',hold:hold==='drums'?null:hold,walkPh:0,t:0};
  if(hold==='drums'){r.pose=Object.assign({},PO.sit,{fa1:1.6+Math.sin(t*.5)*.5,fa2:2.2,ba1:1.5+Math.cos(t*.5)*.5,ba2:2.1,tilt:bang*.1});}
  const sv=st.scale;st.scale=sv*1.25;try{drawPuppet(r,x,y);}catch(e){}st.scale=sv;}
function drawShow(){const Q=SHOW;if(!Q)return;const S=Q.S,t=Q.t,g=ctx;
  cineBG('stage',t);g.fillStyle='#08060c';g.fillRect(0,150,W,30);
  // banda en el escenario
  const n=S.L.length,stage=166;let k=0;const xs=n<=2?[W*.4,W*.6]:n===3?[W*.3,W*.5,W*.7]:[W*.22,W*.42,W*.62,W*.8];
  S.L.forEach(([name,role,who],j)=>{const hold=showRole(role,who),x=xs[j];
    if(hold==='drums'){drawDrums(x,stage-2,t);showMan(STY[who]||STY.heavy,x,stage-14,'drums',t,j,1);}
    else showMan(who==='me'?STY[LV.skin]:(STY[who]||STY.heavy),x,stage,hold,t,j,x<W/2?1:-1,who==='me');});
  // público con banderas que nombran lo que pasó
  for(let r=0;r<3;r++)for(let c=0;c<26;c++){const x=c*19+(r%2)*9-6,y=200+r*22+Math.abs(Math.sin(t*.15+c*.7+r))*-5;g.fillStyle=r===0?'#151018':r===1?'#1d1620':'#251c28';g.beginPath();g.ellipse(x,y,7,8,0,0,7);g.fill();g.fillRect(x-9,y+6,18,30);
    if((c+r)%4===0){g.fillRect(x+5,y-20+Math.sin(t*.2+c)*3,3,16);g.fillRect(x+4,y-23+Math.sin(t*.2+c)*3,5,5);}}
  S.f.forEach((s,j)=>{const x=60+j*230,y=178+Math.sin(t*.06+j)*2;g.fillStyle=j?'#c8322a':'#141218';g.fillRect(x,y,150,16);g.fillStyle='#5a5048';g.fillRect(x-2,y-4,2,30);g.fillRect(x+150,y-4,2,30);txt(s,x+75,y+5,j?'#efe4d2':'#f2b632',6,'center');});
  // cartel y créditos
  g.fillStyle='rgba(0,0,0,.78)';g.fillRect(0,0,W,30);txt('RECITAL · '+S.v,10,5,'#f2b632',8);txt(S.d,10,18,'#efe4d2',6);txt(S.b,W-10,18,'#e2462c',7,'right');
  g.fillStyle='rgba(0,0,0,.7)';g.fillRect(W-180,34,174,10+S.L.length*9);S.L.forEach(([name,role],j)=>txt(name+' · '+role,W-12,38+j*9,'#d8cfc0',5,'right'));
  g.fillStyle='rgba(0,0,0,.7)';{const SL=[];S.set.forEach(s=>wrap(s,38).forEach(l=>SL.push(l)));g.fillRect(6,34,170,12+SL.length*9);txt('SUENA:',12,38,'#e2462c',5);SL.forEach((l,j)=>txt(l,12,47+j*9,'#efe4d2',5));}
  g.fillStyle='rgba(0,0,0,.82)';g.fillRect(0,H-42,W,42);const r=S.r[Q.i]||'';wrap(r.slice(0,Math.floor(Q.ch)),64).forEach((l,j)=>txt(l,W/2,H-36+j*9.5,'#efe4d2',6.5,'center'));
  txt(coarse?'TOCÁ: SIGUE':'Z: SIGUE · ENTER: SALTEAR',W-8,H-8,'#6a5a6e',4,'right');
  if(t<12){g.fillStyle='rgba(0,0,0,'+(1-t/12)+')';g.fillRect(0,0,W,H);}}

// v27: más Buenos Aires en las calles: kioscos, fileteado, taxis negro y amarillo, colectivos, pintadas de época
// y el Obelisco a lo lejos en los capítulos de la Capital.
const BAK=[ // por capítulo: [pintadas], cartel fileteado, línea de colectivo, obelisco, posiciones libres
 {p:['EL PAPERO','CASEROS'],fil:'BAR EL CRUCE · BILLARES',col:'124',ob:0,xs:[700,1150,1450]},
 {p:['V8','METAL PESADO'],fil:'PIZZERÍA · FAINÁ',col:'53',ob:0,xs:[700,1300,1900]},
 {p:['V8','BA ROCK'],fil:'CAFÉ · BILLARES',col:'60',ob:1,xs:[1150,1320,1500],nobus:1},
 {p:['HERMÉTICA','EL CUBO'],fil:'CONFITERÍA',col:'110',ob:1,xs:[300,700,2100]},
 {p:['HERMÉTICA','NO AL REMATE'],fil:'PARRILLA EL OESTE',col:'136',ob:0,xs:[400,900,1500]},
 {p:['LOS DEL OESTE','HERMÉTICA'],fil:'CHORIPÁN · BONDIOLA',col:'29',ob:1,xs:[1250,1650,2050],stadium:1},
 {p:['ALMAFUERTE','MUNDO GUANACO'],fil:'BAR · TANGO',col:'12',ob:1,xs:[200,450,1400]}];
function baBG(g,R,T,arch,i){const K=BAK[i];if(!K)return;const base=176;
  const filete=(x,y,w,h,s,bg)=>{R(x,y,w,h,bg||'#141218');g.strokeStyle='#f2b632';g.lineWidth=1.2;g.strokeRect(x+2,y+2,w-4,h-4);
    for(const [cx,dir] of [[x+8,1],[x+w-8,-1]]){g.strokeStyle='#e2462c';g.beginPath();g.arc(cx,y+h/2,4,dir>0?Math.PI*.5:-Math.PI*.5,dir>0?Math.PI*2:Math.PI);g.stroke();g.strokeStyle='#4f9a6a';g.beginPath();g.arc(cx+dir*3,y+h/2,2,0,7);g.stroke();}
    T(s,x+w/2,y+h/2-3,'#f4ecd0',6,'center');};
  const kiosco=(x)=>{R(x,base-46,60,46,'#2e5a8a');R(x-3,base-52,66,8,'#c8322a');T('KIOSCO',x+30,base-51,'#fff',5,'center');R(x+6,base-38,48,22,'#e8dcc0');
    for(let k=0;k<6;k++)R(x+8+k*8,base-36,6,7,['#e2462c','#f2b632','#4f8a3a','#3a8ad8','#e8e2d0','#a83aa8'][k]);for(let k=0;k<6;k++)R(x+8+k*8,base-26,6,7,['#f2b632','#3a8ad8','#e2462c','#e8e2d0','#4f8a3a','#c8a060'][k]);
    R(x,base-14,60,14,'#24486e');T('GOLOSINAS',x+30,base-11,'#e8e2d0',4,'center');};
  const taxi=(x)=>{const y=base+4;g.fillStyle='#141216';g.beginPath();g.moveTo(x,y-10);g.lineTo(x+8,y-20);g.lineTo(x+40,y-20);g.lineTo(x+50,y-10);g.lineTo(x+62,y-9);g.lineTo(x+62,y);g.lineTo(x-4,y);g.lineTo(x-4,y-9);g.fill();
    g.fillStyle='#f2c82a';g.beginPath();g.moveTo(x+10,y-19);g.lineTo(x+39,y-19);g.lineTo(x+46,y-11);g.lineTo(x+3,y-11);g.fill();g.fillStyle='#6a8a9a';g.fillRect(x+12,y-18,12,6);g.fillRect(x+27,y-18,11,6);
    R(x+20,y-24,12,4,'#f2c82a');T('TAXI',x+26,y-24,'#141216',3,'center');for(const wx of [x+8,x+48]){g.fillStyle='#0b0b0d';g.beginPath();g.arc(wx,y,5,0,7);g.fill();g.fillStyle='#8a8a92';g.beginPath();g.arc(wx,y,2,0,7);g.fill();}};
  const bondi=(x,n)=>{const y=base+4;R(x,y-38,110,34,'#e8dcc0');R(x,y-38,110,4,'#c8322a');R(x,y-14,110,6,'#2e5a8a');for(let k=0;k<5;k++)R(x+18+k*17,y-32,13,11,'#3a4a52');R(x+2,y-32,12,22,'#3a4a52');
    g.strokeStyle='#c8322a';g.lineWidth=1;for(let k=0;k<6;k++){g.beginPath();g.arc(x+20+k*16,y-17,3,Math.PI,0);g.stroke();}R(x+96,y-36,12,8,'#141218');T(n,x+102,y-35,'#f2b632',5,'center');
    for(const wx of [x+20,x+90]){g.fillStyle='#0b0b0d';g.beginPath();g.arc(wx,y-2,7,0,7);g.fill();}};
  const pintada=(x,y,s,c)=>{g.save();g.translate(x,y);g.rotate(-.05);T(s,0,0,c,9,'left');g.restore();};
  kiosco(K.xs[0]);filete(K.xs[1],108,104,22,K.fil);if(!K.stadium){taxi(K.xs[1]+20);if(!K.nobus)bondi(K.xs[2],K.col);}
  pintada(K.xs[0]+80,132,K.p[0],'rgba(232,226,208,.75)');pintada(K.xs[2]-140,124,K.p[1],'rgba(226,70,44,.8)');
  if(K.ob){const f=FAR.getContext('2d');f.save();f.setTransform(RS,0,0,RS,0,0);const ox=900;f.fillStyle='rgba(58,54,70,.92)';
    f.beginPath();f.moveTo(ox-7,150);f.lineTo(ox-4,22);f.lineTo(ox,12);f.lineTo(ox+4,22);f.lineTo(ox+7,150);f.fill();f.fillStyle='rgba(255,230,160,.8)';f.fillRect(ox-.5,30,1,1.4);f.restore();}}

// v29: clima por capítulo y un aire de nostalgia: las épocas viejas se ven como foto o película gastada.
// garúa porteña, niebla, tormenta de verano con relámpagos, hojas de plátano, viento de ruta, polen de campo.
const CLIMA=[
 {g:1,mist:.5,sep:.55,lbl:'GARÚA DE MADRUGADA'},          // 1978 Caseros
 {g:1,mist:.7,sep:.5,lbl:'NIEBLA EN CIUDADELA'},           // 1979
 {moth:1,sep:.42,lbl:'NOCHE DE NOVIEMBRE, CALOR'},         // 1982
 {leaf:1.4,wind:1,sep:.34,lbl:'OTOÑO EN RECOLETA'},        // 1988
 {storm:1,sep:.26,lbl:'TORMENTA DE VERANO'},               // 1991
 {papel:1,sep:.2,lbl:'NOCHE DE RIVER'},                    // 1994
 {g:1,mist:.4,sep:.18,lbl:'LLOVIZNA EN CONSTITUCIÓN'},     // 1995
 {wind:2,dust:1,sep:.12,lbl:'VIENTO DE RUTA'},             // 2001
 {wind:1.5,cloud:1,leaf:.8,sep:.08,lbl:'VIENTO EN LA SIERRA'}, // 2006
 {mist:.8,sep:.06,lbl:'AMANECER CON NIEBLA'},              // 2012
 {pollen:1,gold:1,sep:.04,lbl:'ATARDECER EN EL CAMPO'}];   // 2023
const CLP=Array.from({length:120},(_,i)=>({x:Math.random()*W,y:Math.random()*H,s:.6+Math.random(),k:Math.random()}));
let FLASH=0,THUNDER=0;
function climaDraw(cx){const C=CLIMA[lvl];if(!C)return;const g=ctx;
  if(C.g||C.storm){const n=C.storm?110:60,sp=C.storm?7:3.2;g.strokeStyle=C.storm?'rgba(170,190,230,.35)':'rgba(200,210,230,.22)';g.lineWidth=1;g.beginPath();
    for(let i=0;i<n;i++){const p=CLP[i];p.y+=sp*p.s;p.x-=sp*.25;if(p.y>H){p.y=-6;p.x=Math.random()*(W+60);}g.moveTo(p.x,p.y);g.lineTo(p.x+1.4,p.y-(C.storm?9:5));}g.stroke();
    // charcos que brillan en la calle mojada
    g.globalCompositeOperation='lighter';for(let k=0;k<6;k++){const x=((k*97-cx*1)%(W+80)+W+80)%(W+80)-40,y=200+((k*37)%50);g.fillStyle='rgba(180,200,240,'+(.05+.04*Math.sin(tick*.05+k))+')';g.beginPath();g.ellipse(x,y,26,3,0,0,7);g.fill();}g.globalCompositeOperation='source-over';}
  if(C.storm){if(FLASH>0)FLASH--;else if(Math.random()<.004){FLASH=10;THUNDER=50+(Math.random()*40|0);}
    if(THUNDER>0&&--THUNDER===0&&AC){try{nz(AC.currentTime,1.6,.22,'lowpass',160,master,.7);}catch(e){}}
    if(FLASH>0){g.fillStyle='rgba(230,235,255,'+(FLASH>6?.35:FLASH*.04)+')';g.fillRect(0,0,W,H);}}
  if(C.mist){g.globalCompositeOperation='lighter';for(let k=0;k<4;k++){const y=160+k*24,x=((tick*.15*(k%2?1:-1)-cx*.3+k*190)%(W+340)+W+340)%(W+340)-170;g.globalAlpha=.06*C.mist;g.drawImage(glow('#d8dce8'),x,y-34,340,68);}g.globalAlpha=1;g.globalCompositeOperation='source-over';}
  if(C.leaf){for(let i=0;i<30*C.leaf;i++){const p=CLP[i];p.y+=.4+p.s*.4;p.x+=Math.sin(tick*.03+i)*.7+(C.wind||0)*.9;if(p.y>H){p.y=-6;p.x=Math.random()*W-60;}if(p.x>W+10)p.x=-10;
    g.save();g.translate(p.x,p.y);g.rotate(tick*.05+i);g.fillStyle=i%3?'#a8742a':'#c8943a';g.fillRect(-2.5,-1.2,5,2.4);g.restore();}}
  if(C.wind&&!C.leaf){g.strokeStyle='rgba(230,220,200,.12)';g.lineWidth=1;g.beginPath();for(let i=0;i<14*C.wind;i++){const p=CLP[i];p.x+=4*C.wind*p.s;if(p.x>W+40){p.x=-40;p.y=60+Math.random()*190;}g.moveTo(p.x,p.y);g.lineTo(p.x+22,p.y+Math.sin(tick*.1+i));}g.stroke();}
  if(C.dust){for(let i=40;i<80;i++){const p=CLP[i];p.x+=2.4*p.s;p.y+=Math.sin(tick*.05+i)*.4;if(p.x>W+5){p.x=-5;p.y=120+Math.random()*140;}g.fillStyle='rgba(210,180,130,.45)';g.fillRect(p.x,p.y,2,1);}}
  if(C.cloud){for(let k=0;k<3;k++){const x=((tick*.25+k*220-cx*.1)%(W+300)+W+300)%(W+300)-150;g.globalAlpha=.08;g.drawImage(glow('#e8e8f0'),x,10+k*18,300,50);}g.globalAlpha=1;}
  if(C.moth){for(const L of LAMPS||[]){const X=L.x-cx;if(X<-30||X>W+30)continue;for(let k=0;k<4;k++){const a=tick*.12+k*1.6;g.fillStyle='rgba(255,240,200,.7)';g.fillRect(X+Math.cos(a*1.3)*8,(L.y||70)+6+Math.sin(a)*6,1,1);}}}
  if(C.papel){for(let i=0;i<40;i++){const p=CLP[i];p.y+=.6+p.s*.6;p.x+=Math.sin(tick*.04+i)*.8;if(p.y>H){p.y=-4;p.x=Math.random()*W;}g.fillStyle=['#efe4d2','#e2462c','#f2b632'][i%3];g.fillRect(p.x,p.y,2,2);}}
  if(C.pollen){for(let i=0;i<40;i++){const p=CLP[i];p.x+=.3*p.s;p.y+=Math.sin(tick*.02+i)*.3;if(p.x>W)p.x=0;g.fillStyle='rgba(255,236,170,'+(.3+.3*Math.sin(tick*.05+i))+')';g.fillRect(p.x,p.y,1.5,1.5);}}
  if(C.gold){const gr=g.createLinearGradient(0,0,W,0);gr.addColorStop(0,'rgba(255,190,110,.12)');gr.addColorStop(1,'rgba(255,190,110,0)');g.fillStyle=gr;g.fillRect(0,0,W,H);}}
// nostalgia: tono sepia que se va apagando con los años, rayas y motas de película, y un parpadeo suave
function nostalgia(sepOverride){const C=CLIMA[lvl]||{},s=sepOverride!=null?sepOverride:(C.sep||0);if(s<=0)return;const g=ctx;g.save();
  g.globalCompositeOperation='multiply';g.globalAlpha=s*.55;g.fillStyle='#d8b07a';g.fillRect(0,0,W,H);
  g.globalCompositeOperation='source-over';g.globalAlpha=1;
  const fl=.02*s*Math.sin(tick*.9)+.02*s*Math.sin(tick*2.3);g.fillStyle='rgba(255,240,210,'+Math.max(0,fl)+')';g.fillRect(0,0,W,H);
  if(s>.15){for(let k=0;k<2;k++){if(hsh(Math.floor(tick/7)+k,3)<.5)continue;const x=hsh(Math.floor(tick/7)+k,5)*W;g.fillStyle='rgba(240,230,210,'+(.12*s+.04)+')';g.fillRect(x,0,1,H);}
    for(let k=0;k<5;k++){const r=hsh(Math.floor(tick/3)*7+k,9);if(r<.6)continue;g.fillStyle='rgba(30,20,10,'+(.3*s)+')';g.fillRect(hsh(tick+k,2)*W,hsh(tick+k,4)*H,1+(r>.9),1);}}
  const vg=g.createRadialGradient(W/2,H/2,H*.35,W/2,H/2,H*.85);vg.addColorStop(0,'rgba(40,24,10,0)');vg.addColorStop(1,'rgba(40,24,10,'+(.35*s)+')');g.fillStyle=vg;g.fillRect(0,0,W,H);g.restore();}
// el nombre del clima aparece un momento al empezar, como el epígrafe de una foto vieja
function climaLabel(){const C=CLIMA[lvl];if(!C||state!=='play'||datoT>260)return;const a=Math.min(1,datoT/30,(260-datoT)/30);ctx.globalAlpha=a;txt(C.lbl,W-10,H-16,'#e8dcc0',6,'right');ctx.globalAlpha=1;}

// v30: correcciones de la auditoría y preservación de las nuevas cinemáticas, placas y recuerdos biográficos.
function auditFix(){const D=DATOS,mv=(from,to,re)=>{const i=(D[from]||[]).findIndex(s=>re.test(s));if(i>=0){const s=D[from].splice(i,1)[0];if(to!=null&&D[to]&&!D[to].includes(s))D[to].push(s);}};
  const rp=(arr,re,s)=>{if(!arr)return;const i=arr.findIndex(x=>re.test(typeof x==='string'?x:x.s));if(i>=0){if(typeof arr[i]==='string')arr[i]=s;else arr[i].s=s;}};
  rp(D[1],/Alarma/,'Antes de V8 pasó por las bandas Alarma y Comunión Humana.');
  mv(4,5,/Olmos/);mv(5,null,/^El Monsters of Rock en River fue/);mv(6,7,/Peso argento/);mv(7,null,/^Almafuerte versionaba tangos/);
  mv(8,null,/^En 2012 contó en la tele/);mv(8,null,/Elda Pedraza/);mv(8,9,/En 2008 dijo/);
  try{const A=AFICHES[4],i=A.findIndex(a=>a[1]==='BLACK SABBATH');if(i>=0)A[i]=[1300,'ÁCIDO ARGENTINO','HERMÉTICA','YA SALIÓ','#7a5a9a'];}catch(e){}
  try{SHOWS[8].r[2]='Sin cazadores ni country: el arroyo queda para todos.';}catch(e){}
  dedupe();}
// v31: limpieza de datos duplicados en el álbum sin pisar las placas, cinemáticas ni recuerdos de cada capítulo.
function dedupe(){const D=DATOS;
  const del=(arr,re)=>{if(!arr)return;for(let i=arr.length-1;i>=0;i--){const x=arr[i];if(re.test(typeof x==='string'?x:x.s))arr.splice(i,1);}};
  const show=(i,k,s)=>{try{SHOWS[i].r[k]=s;}catch(e){}};
  // datos que ya decía la placa, la cinemática, el regalo del bajo o el recital
  const X=[[0,/Faim/],[0,/Abasto/],[1,/Chofa/],[2,/Alvear/],[3,/Helvética/],[3,/Cubo de Recoleta/],[4,/Black Sabbath en Obras/],
    [5,/12 de noviembre/],[5,/Monsters of Rock de River/],[6,/primeros shows/],[7,/Larralde/],[8,/Toro y pampa/],[8,/Ceriotti/],
    [9,/último disco/],[9,/muchos pájaros/],[10,/Beto Casella/],[10,/covers de Black Sabbath/]];
  for(const [i,re] of X)del(D[i],re);
  // el recital recuerda lo que pasó en el nivel
  show(3,2,'El Curador anotó a Hermética en el catálogo.');
  show(4,1,'Los muchachos de la metalúrgica, en primera fila.');show(4,2,'En octubre del 92, abren para Motörhead.');
  show(5,1,'El pibe de la entrada trucha, adentro.');show(5,2,'El Empresario se fue sin la recaudación.');
  show(6,0,'Sin sobre y sin faja: el Clausurador habilitó.');show(6,1,'Al equipo del violero no lo tocó nadie.');
  show(7,2,'Los abuelos recuperan lo suyo.');show(8,1,'Asado para todos después del show.');show(8,2,'Sin cazadores ni country en la sierra.');
  show(10,2,'Ni El Loteador ni Mandinga: el campo sigue libre.');
  try{delete GUINO2[10];}catch(e){}
  try{if(ALB&&ALB.got){const canon='En 1972 recibió su primera guitarra y en 1978 su primer bajo, un Faim que le compraron sus padres.';const hadFaim=Object.keys(ALB.got).some(k=>/[Ff]aim|primer bajo/.test(k));let chg=false;for(const k in ALB.got)if(k!==canon&&/[Ff]aim|primer bajo/.test(k)){delete ALB.got[k];chg=true;}if(hadFaim&&!(canon in ALB.got)){ALB.got[canon]=0;chg=true;}if(chg)albumSave();}}catch(e){}
}
// recorte de diálogos: mantiene los diálogos completos de hasta 6 líneas junto con sus efectos
function trimTalk(){for(const L of LEVELS)for(const k of ['intro','rescueLines'])if(L[k]&&L[k].length>6){const n=6;const fx=L[k].filter((l,i)=>i>=n&&l.fx);L[k]=L[k].slice(0,n).concat(fx);}}
// ayuda de controles al empezar el primer capítulo (solo un rato, abajo, sin tapar la pelea)
function controlTip(){if(lvl!==0||state!=='play'||datoT>600)return;const a=Math.min(1,datoT/20,(600-datoT)/30);ctx.globalAlpha=a*.92;ctx.fillStyle='rgba(10,8,13,.8)';ctx.fillRect(0,H-22,W,22);
  txt(coarse?'GOLPE: PEGAR · SALTO · ESPEC: BAJAZO · ESQUI: ESQUIVAR · PAPA: TIRAR · DOBLE TOQUE: CORRER':'Z GOLPE · X SALTO · C BAJAZO · SHIFT ESQUIVA · B PAPA · DOBLE TOQUE ADELANTE: CORRER',W/2,H-15,'#efe4d2',5,'center');ctx.globalAlpha=1;}

// v22: interfaz más grande y legible: panel con retrato grande, barras con marco, textos más grandes
function hudBar(x,y,w,h,v,tr,c,bg){ctx.fillStyle='#000';ctx.fillRect(x-1,y-1,w+2,h+2);ctx.fillStyle=bg||'#3a1414';ctx.fillRect(x,y,w,h);
  if(tr!=null){ctx.fillStyle='#f4efe4';ctx.fillRect(x,y,w*tr,h);}const gr=ctx.createLinearGradient(0,y,0,y+h);gr.addColorStop(0,shade(c,1.35));gr.addColorStop(.5,c);gr.addColorStop(1,shade(c,.7));ctx.fillStyle=gr;ctx.fillRect(x,y,w*v,h);
  ctx.fillStyle='rgba(255,255,255,.35)';ctx.fillRect(x,y,w*v,1);ctx.fillStyle='rgba(0,0,0,.35)';if(w>60)for(let k=1;k<10;k++)ctx.fillRect(x+Math.round(w*k/10),y,1,h);}
function drawHUD2(){
  {const gr=ctx.createLinearGradient(0,4,0,58);gr.addColorStop(0,'rgba(22,16,26,.9)');gr.addColorStop(1,'rgba(10,8,13,.82)');ctx.fillStyle=gr;
   ctx.beginPath();ctx.moveTo(4,4);ctx.lineTo(236,4);ctx.lineTo(224,58);ctx.lineTo(4,58);ctx.closePath();ctx.fill();ctx.fillStyle='#e2462c';ctx.fillRect(4,4,232,2);ctx.fillStyle='rgba(226,70,44,.5)';ctx.fillRect(4,57,220,1);}
  portrait(skin,8,9,44);
  txt(NAMES[skin],58,9,'#f2b632',8);
  for(let i=0;i<3;i++){drawHeart(196+i*11,10,i<lives,1.05);}
  const hp=Math.max(0,player.hp)/player.max,tr=Math.max(0,hpTrail)/player.max;
  hudBar(58,20,164,8,hp,tr,hp>.3?'#e2c24a':'#e2462c');
  for(let i=0;i<3;i++){const v=clamp((meter-i*100)/100,0,1);hudBar(58+i*34,33,31,5,v,null,v>=1?(tick%30<15?'#ffb340':'#ff8a1a'):'#8a5a2a','#2a1a30');}
  txt(lvl>=8?'VOZARRÓN':'BAJAZO',162,32,'#c8b8cc',6);
  for(let i=0;i<8;i++){const x=62+i*10;ctx.fillStyle=OUT;ctx.beginPath();ctx.ellipse(x,48,4.4,3.6,0,0,7);ctx.fill();ctx.fillStyle=i<papas?(lvl>=2?'#d8322a':'#b8864a'):'#3a2a22';ctx.beginPath();ctx.ellipse(x,48,3.5,2.7,0,0,7);ctx.fill();
    if(i<papas&&lvl>=2){ctx.fillStyle='#16141a';ctx.beginPath();ctx.arc(x,48,1.2,0,7);ctx.fill();}}
  txt(lvl>=2?'DISCOS (B)':'PAPAS (B)',144,45,'#c8b8cc',6);
  if(GUNS[player.hold]){const G=GUNS[player.hold];txt(G.name+' x'+player.ammo,244,14,G.col,7);txt('Z DISPARA',244,25,'#c8b8cc',5);}
  txt(String(score).padStart(7,'0'),W-8,8,'#fff',10,'right');txt(LV.place,W-8,22,'#c8b8cc',6,'right');
  const df=DIFFS[diff];txt(df.name,W-8,32,df.col,5,'right');
  if(!musicOn)txt('MÚSICA: NO',W-8,41,'#c8b8cc',5,'right');else{const cS=SONGS[song];if(cS&&cS.name)txt('♫ '+cS.name,W-8,41,'#f2b632',4.5,'right');}
  if(lastHit&&lastHit.e&&!lastHit.e.D.boss&&lastHit.e.max>1){const e=lastHit.e,v=Math.max(0,e.hp)/e.max;txt(e.D.name,8,63,'#efe4d2',6);hudBar(8,72,120,4,v,null,'#e2462c');}
  if(boss&&boss.hp>0&&state==='play'){const v=boss.hp/boss.max,bx=W/2-130,by=H-20;ctx.fillStyle='rgba(10,8,13,.8)';ctx.fillRect(bx-6,by-16,272,30);ctx.fillStyle='#e2462c';ctx.fillRect(bx-6,by-16,272,2);
    txt(boss.D.name,bx,by-12,'#ff6a4a',8);hudBar(bx,by,260,8,v,null,'#e2462c');}
  if(combo>=2){const pop=comboT>100?1+(comboT-100)*.04:1;ctx.save();ctx.translate(W-60,74);ctx.scale(pop,pop);txt(String(combo),0,0,'#f2b632',18,'center');txt('GOLPES',0,22,'#efe4d2',7,'center');ctx.restore();
    const r=combo>=25?'S':combo>=15?'A':combo>=8?'B':combo>=4?'C':'';if(r)txt(r,W-18,78,r==='S'?'#ff5a3a':'#efe4d2',12,'center');}
  if(goT>0&&goT%40<26&&state==='play'){txt('¡SEGUÍ!',W-74,H/2-8,'#f2b632',12,'center');ctx.fillStyle='#f2b632';ctx.beginPath();ctx.moveTo(W-30,H/2-12);ctx.lineTo(W-14,H/2-2);ctx.lineTo(W-30,H/2+8);ctx.fill();}
  if(banner){const b=banner,k=Math.min(1,(150-b.t)/14),o=Math.min(1,b.t/14),y=96;ctx.globalAlpha=o;ctx.fillStyle=b.boss?'rgba(120,20,16,.85)':'rgba(10,8,13,.82)';
    ctx.beginPath();ctx.moveTo(-20+W*(1-k),y);ctx.lineTo(W+20,y);ctx.lineTo(W+20,y+54);ctx.lineTo(-40+W*(1-k),y+54);ctx.fill();ctx.fillStyle='#f2b632';ctx.fillRect(0,y,W,2);ctx.fillRect(0,y+52,W,2);
    txt(b.a,W/2+(1-k)*200,y+10,b.boss?'#fff':'#f2b632',16,'center');txt(b.b,W/2-(1-k)*200,y+33,'#efe4d2',9,'center');ctx.globalAlpha=1;}
}
const BUBR={a:[]};
// globos de diálogo más grandes, con salto de línea
function drawBubble2(b){const f=b.f;const X=Math.round(f.x-cam.x),Y0=Math.round(f.y-f.z-(f.D.boss?104:92)*f.st.scale/1.1*PSK);ctx.font='6px '+FONT;
  const lines=wrapTxt(U(b.s),34),w=Math.max(...lines.map(l=>ctx.measureText(l).width))+10,h=lines.length*8+6;
  let bx=clamp(X-w/2,4,W-w-4),Y=Y0-h+12;
  // si otro globo ya ocupa ese lugar en este cuadro, este sube (o se corre) para no encimarse
  for(let k=0;k<6;k++){const r=BUBR.a.find(r=>bx<r.x+r.w+2&&bx+w+2>r.x&&Y<r.y+r.h+8&&Y+h+8>r.y);if(!r)break;Y=r.y-h-9;if(Y<62){Y=Math.max(62,r.y+r.h+9);bx=clamp(r.x+r.w+6,4,W-w-4);}}
  BUBR.a.push({x:bx,y:Y,w,h});ctx.fillStyle=OUT;ctx.fillRect(bx-1,Y-1,w+2,h+2);ctx.fillStyle='#f4efe4';ctx.fillRect(bx,Y,w,h);{const tx=clamp(X,bx+6,bx+w-6);ctx.beginPath();ctx.moveTo(tx-4,Y+h);ctx.lineTo(tx+4,Y+h);ctx.lineTo(tx,Y+h+5);ctx.fill();}
  ctx.fillStyle='#1a1418';ctx.textAlign='left';ctx.textBaseline='top';lines.forEach((l,i)=>ctx.fillText(l,bx+5,Y+3+i*8));}
// a veces, al voltear a uno, Ricardio lo bardea
const BARDO=['¡Andá a laburar, vago!','¡Sé vos, nomás, careta!','¡Esto es metal pesado argentino!','¡No seas menos de lo que valés!','¡Chupamedias del patrón!','¡Rajá de acá, comerciante informador!','¡Tomá, entregador!','¡Te falta calle y galpón, nene!','¡La pobreza es no superarse!','¡Andá a quejarte al multimedio!','¡Yo soy un trabajador de la música!','¡Cipayo de cuarta!'];
let bardoT=0;
function bardo(t){if(MOMENT||!t||t.team!==1||!player||state!=='play'||tick-bardoT<900||Math.random()>.12)return;if(bubbles.some(b=>b.f===player))return;bardoT=tick;say(player,pick(BARDO),110);}
const PAPERO_INS=['¡Papero del Abasto y a mucha honra, gil!','¡Con bolsas de papas me compré el bajo Faim!','¡Laburá vos, vago, que yo descargué el Bedford!','¡De repartir papas con mi viejo aprendí a no arrodillarme!','¡El trabajo dignifica, careta!','¡Andá a levantar un cajón al mercado, nabo!'];
// los pájaros de su casa de campo (le contó a Casella que tenía setecientos) y la famosa lombriz doméstica
function drawPajaros(cx){if(lvl<8)return;for(let f=0;f<2;f++){const T=(tick*.6+f*900)%(W+700)-300,by=40+f*26+Math.sin(tick*.01+f)*8;
  for(let k=0;k<7;k++){const r=k>>1,x=T+(k%2?1:-1)*r*9-r*2,y=by+r*5+Math.sin(tick*.08+k)*1.5,wf=Math.sin(tick*.35+k*1.3);ctx.strokeStyle='rgba(30,26,34,.85)';ctx.lineWidth=1.1;
    ctx.beginPath();ctx.moveTo(x-4,y-wf*2.4);ctx.quadraticCurveTo(x-2,y-1,x,y);ctx.quadraticCurveTo(x+2,y-1,x+4,y-wf*2.4);ctx.stroke();}}}
function drawLombriz(X,y){ctx.strokeStyle=OUT;ctx.lineWidth=4;ctx.lineCap='round';ctx.beginPath();for(let k=0;k<=8;k++){const px=X-8+k*2,py=y-3+Math.sin(tick*.2+k*.9)*1.6;k?ctx.lineTo(px,py):ctx.moveTo(px,py);}ctx.stroke();
  ctx.strokeStyle='#d88a8a';ctx.lineWidth=2.6;ctx.stroke();ctx.fillStyle='#141016';ctx.fillRect(X+7,y-4+Math.sin(tick*.2+8*.9)*1.6,1,1);}
function lombrizPick(it,f){if(it.kind!=='lombriz')return false;it.gone=true;score+=700;sfx('pickup');floatTxt(f.x,f.y-90,'¡LA LOMBRIZ DOMÉSTICA! +700','#f2b4b4');
  dato={s:'Beto Casella fue su amigo y lo entrevistó varias veces en televisión.',t:420};say(f,'Esta va por Beto.',110);return true;}

// v23: Bandas sonoras de Ricardo Iorio en 16-bits (V8, Hermética, Almafuerte)
function musicByEra(){LEVELS.forEach((L,i)=>{L.song=SONGS['c'+i]?'c'+i:'c8';L.bossSong=i<=2?'b0':i<=5?'b1':'b2';});}

function stepWorld(){
  timeF++;
  if(diff===0&&tick%45===0&&player&&player.hp>0&&player.hp<player.max){player.hp=Math.min(player.max,player.hp+1);}
  if(comboT>0){comboT--;if(comboT===0){if(combo>=5){const b=combo*combo*5;score+=b;floatTxt(player.x,player.y-95,'COMBO +'+b,'#f2b632');}combo=0;}}
  if(lastHit&&--lastHit.t<=0)lastHit=null;
  assignEngage();
  for(const e of ents){if(e.gone)continue;if(e===player)updPlayer(e);else if(e.team===1)updEnemy(e);else updNPC(e);}
  ents=ents.filter(e=>!e.gone);
  for(const it of items){it.t++;if(it.z>0||it.vz){it.z+=it.vz;it.vz-=.25;if(it.z<=0){it.z=0;it.vz=0;}}}
  items=items.filter(i=>!i.gone);
  if(!lock){const tg=player.x-W*.45;const maxC=lockIdx<LV.locks.length?LV.locks[lockIdx].L:LW-W;if(tg>cam.x)cam.x=Math.min(cam.x+Math.min(3,tg-cam.x),maxC);}
  else cam.x+=(lock.L-cam.x)*.08;
  if(train){train.t++;train.x-=8;if(train.t<70)shake=Math.max(shake,1.2);if(train.x<SCENES[lvl].track.x0-700)train=null;}
  updLocks();updHazard();updShots();
  if(player.dazed>0)player.dazed--;
  combatMix=alive().length>0||(boss&&boss.hp>0&&state==='play')?1:0;
}
function updParts(){for(const p of parts){p.t++;if(p.k==='dust'){p.x+=p.vx;p.y+=p.vy;}if(p.k==='deb'){p.x+=p.vx;p.y+=p.vy;p.vy+=.25;}if(p.k==='txt')p.y-=.5;}parts=parts.filter(p=>p.t<p.max);
  for(const b of bubbles)b.t--;bubbles=bubbles.filter(b=>b.t>0&&!b.f.gone);}
let noPause=0;
function update(){tick++;readInput();if(state!=='play')noPause=40;else if(noPause>0)noPause--;
  if(press.mute)musicOn=!musicOn;
  if(shake>0)shake=Math.max(0,shake-.3);if(flashT>0)flashT--;
  const hp=player?player.hp:0;if(player){if(hpTrail>hp)hpTrail=Math.max(hp,hpTrail-.6);else hpTrail=hp;}
  if(state==='title'){if(press.album){albumOpen();return;}
    if(press.up){sel=(sel+unl-1)%unl;sfx('blip');try{song=LEVELS[sel].song;step=0;}catch(e){}}
    if(press.down){sel=(sel+1)%unl;sfx('blip');try{song=LEVELS[sel].song;step=0;}catch(e){}}
    if(press.left){diffSet(diff-1);sfx('blip');}
    if(press.right){diffSet(diff+1);sfx('blip');}
    if(press.start||press.atk||press.jump){audioInit();startChapter(sel,false);}}
  else if(state==='card'){cardT++;if(cardT>40&&(press.start||press.atk||press.jump))startIntro();}
  else if(state==='intro'){updIntro();for(const e of ents)if(e!==player&&e.team===2)updNPC(e);updParts();}
  else if(state==='cut'){updCut();for(const e of ents)if(e.team===2)updNPC(e);updParts();}
  else if(state==='play'){
    if((press.start||press.pause||press.esc)&&noPause<=0){state='pause';return;}
    modTick();datoTick();if(banner&&--banner.t<=0)banner=null;if(goT>0)goT--;
    if(slowT>0){slowT--;if(slowT%3===0){stepWorld();}if(boss&&boss.D.monster&&!boss.gone)monsterDeath();updParts();if(slowT===0){if(LV.final&&boss&&!boss.D.monster)startMonsterCut();else startWinCut();}}
    else if(stopT>0){stopT--;updParts();}
    else{stepWorld();updParts();if(papas<8&&++papaT>=200){papas++;papaT=0;}}
  }
  else if(state==='pause'){
    if(press.start||press.pause)state='play';
    else if(press.esc||press.menu){toTitleMenu();return;}
    else if(press.restart){startChapter(lvl,false);return;}
    if(press.album)albumOpen();
  }
  else if(state==='cine'){if(press.esc||press.menu){toTitleMenu();return;}cineUpd();}
  else if(state==='album'){albumUpd();}
  else if(state==='victory'){introT++;updParts();if(introT===20)say(player,LV.winSay,130);if(introT===150){if(LV.truck&&!truckDone)startTruck();else{makeResults();state='results';}}}
  else if(state==='truck'){updTruck();updParts();}
  else if(state==='results'){
    if(press.esc||press.menu){toTitleMenu();return;}
    results.k++;if(results.k>60&&(press.start||press.atk||press.jump)){showStart();}
  }
  else if(state==='show'){if(press.esc||press.menu){toTitleMenu();return;}showUpd();}
  else if(state==='ending'){if(press.esc||press.menu){toTitleMenu();return;}endT++;updParts();if(endT>300&&endT<420&&(press.start||press.atk||press.jump)){endT=420;}else if(endT>620&&(press.start||press.atk||press.jump)){toTitleMenu();}}
  else if(state==='gameover'){
    if(press.esc||press.menu){toTitleMenu();return;}
    gameoverT++;if(gameoverT>20&&(press.start||press.atk||press.jump||press.papa||press.spec||press.dodge)){resurrectPlayer();}
    if(gameoverT>800){toTitleMenu();}
  }
  for(const e of ents)smoothPose(e);
  musicTick();lmTick();}


/* ================= poses per state ================= */
function targetPose(f){
  const mvPose=()=>{const m=f.move;if(!m)return PO.idle;if(f.t<m.a0)return PO[m.wind||'idle'];if(f.t<=m.a1+3)return PO[m.pose];return PO.idle;};
  switch(f.state){
    case 'walk':return walkPose(f.walkPh,(f.team===2||f.hold==='mate')?PO.stand:PO.idle);
    case 'atk':return mvPose();
    case 'windup':return PO.windup;
    case 'jump':return f.jatk?PO.jkick:PO.jump;
    case 'land':return Object.assign({},PO.idle,{crouch:6});
    case 'hurt':return f.hurtAlt?PO.hurt2:PO.hurt;
    case 'fall':case 'thrown':return Object.assign({},PO.fall,{rot:-Math.min(1.5,.3+f.t*.13)});
    case 'down':case 'dead':return Object.assign({},PO.down,{rot:-1.52});
    case 'getup':return Object.assign({},PO.getup,{rot:-1.52*Math.max(0,1-f.t/10)});
    case 'grab':return PO.grab;case 'grabbed':return PO.grabbed;
    case 'knee':return f.t<10?PO.knee:PO.grab;
    case 'hbutt':return f.t<8?Object.assign({},PO.grab,{lean:-.3,tilt:-.4}):PO.hbutt;
    case 'throw':return f.t<8?PO.grab:PO.throw;
    case 'spec':return f.t<12?PO.specw:PO.spec;
    case 'dodge':return PO.dodge;
    case 'ctele':return Object.assign({},PO.charge,{crouch:8+Math.sin(f.t*.8)*2});
    case 'charge':case 'bcharge':return walkPose(tick*.5,PO.charge);
    case 'slamj':return f.t<20?PO.jump:PO.jkick;
    case 'slam':return Object.assign({},PO.idle,{crouch:10,lean:.35});
    case 'taunt':return PO.taunt;
    case 'ride':return PO.sit;
    case 'aim':return PO.film;
    case 'throwp':return f.t<14?PO.windup:PO.jab;
    case 'bthrow':return (f.t%14)<8?PO.windup:PO.jab;
    case 'papa':return f.t<6?PO.windup:PO.jab;
    case 'shoot':return PO.jab;
    case 'kick':return f.t<8?PO.windup:PO.jab;
    case 'gift':case 'runin':return walkPose(f.walkPh,PO.stand);
    case 'hidden':return PO.stand;
    case 'tied':return PO.tied;
    case 'victory':return PO.victory;
    case 'runoff':case 'walkoff':return walkPose(f.walkPh,PO.stand);
    default:return f.team===2?(f.hold==='mate'?PO.mate:PO.stand):Object.assign({},PO.idle,{crouch:Math.sin(tick*.08+f.walkPh)*1});
  }}
function smoothPose(f){let tp=targetPose(f);if(f.hold==='camera'&&['idle','walk','aim'].includes(f.state)){tp=Object.assign({},tp,{fa1:PO.film.fa1,fa2:PO.film.fa2});}const fast=['atk','spec','knee','hbutt','throw','jump','hurt'].includes(f.state),r=fast?.5:.28;for(const k of PK)f.pose[k]+=(tp[k]-f.pose[k])*(k==='rot'?.3:r);}

/* ================= rendering ================= */
const RAIN=Array.from({length:90},()=>({x:Math.random()*W,y:Math.random()*H,s:rnd(4,7),k:Math.random()}));
function drawTrain(cx){const S=SCENES[lvl],T=S.track;if(!T||cx+W<T.x0-40||cx>T.x1+40)return;
  ctx.fillStyle='#24222a';ctx.fillRect(T.x0-cx,132,T.x1-T.x0,10);ctx.fillStyle='#6a6a72';ctx.fillRect(T.x0-cx,134,T.x1-T.x0,1);ctx.fillRect(T.x0-cx,139,T.x1-T.x0,1);
  if(train){for(let c=0;c<5;c++){const tx=Math.round(train.x+c*124-cx);if(tx>W||tx<-130)continue;ctx.fillStyle=T.col;ctx.fillRect(tx,88,120,48);ctx.fillStyle=shade(T.col,.7);ctx.fillRect(tx,88,120,6);ctx.fillStyle='#2f3542';ctx.fillRect(tx,128,120,8);
    ctx.fillStyle=T.stripe;ctx.fillRect(tx,118,120,4);for(let w=0;w<6;w++){ctx.fillStyle='#ffe9a8';ctx.fillRect(tx+8+w*19,98,13,14);}
    if(c===0){ctx.fillStyle='#d8d2c6';ctx.fillRect(tx-6,96,8,30);}}}}
function drawDyn(cx){
  if(LV.dyn==='ruta'){for(const fx of [1036,1106,1124]){const X=fx-cx;if(X<-30||X>W+30)continue;const wv=Math.sin(tick*.12+fx)*3;ctx.fillStyle='#d8241e';ctx.beginPath();ctx.moveTo(X+2,90);ctx.lineTo(X+22+wv,95+wv*.4);ctx.lineTo(X+2,102);ctx.fill();}}
  if(LV.dyn==='campo'){const X=771-cx;if(X>-40&&X<W+40){ctx.save();ctx.translate(X,60);ctx.rotate(tick*.05);ctx.fillStyle='#8a8a92';for(let k=0;k<12;k++){ctx.rotate(Math.PI/6);ctx.fillRect(2,-1.5,18,3);}ctx.restore();ctx.fillStyle='#5a5a64';ctx.fillRect(X-2,58,4,4);ctx.fillRect(X+2,59,14,2);ctx.fillRect(X+14,54,2,10);}}
  for(const s of SIGNS){const X=s.x-cx;if(X<-120||X>W+120)continue;const on=tick%180<170&&!(s.flick&&tick%97<6);ctx.fillStyle=on?s.c:s.off;ctx.font=(s.size||8)+'px '+FONT;ctx.textAlign='center';ctx.textBaseline='top';ctx.fillText(U(s.t),X,s.y);
    if(on){ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.35;ctx.drawImage(glow(s.c),X-50,s.y-16,100,40);ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';}}}
function drawWeather(cx){const w=SCENES[lvl].weather;
  if(w==='rain'){for(const r of RAIN){r.y+=r.s;r.x-=r.s*.22;if(r.y>H){r.y=-8;r.x=Math.random()*(W+40);}if(cx>1900)continue;ctx.strokeStyle='rgba(150,170,230,.22)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(r.x,r.y);ctx.lineTo(r.x+2,r.y-8);ctx.stroke();}}
  else if(w==='mist'){ctx.globalCompositeOperation='lighter';for(let k=0;k<5;k++){const y=150+k*22,x=((tick*.2*(k%2?1:-1)+k*170)%(W+300))-150;ctx.globalAlpha=.07;ctx.drawImage(glow('#ffd8c8'),x,y-30,300,60);ctx.drawImage(glow('#ffd8c8'),x+260,y-24,260,48);}ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';}
  else if(w==='spots'){ctx.globalCompositeOperation='lighter';const cols=['255,80,60','90,130,255','220,90,255','255,200,90'];
    for(let k=0;k<4;k++){const bx=(k*160+80+Math.sin(tick*.02+k)*60),a=Math.sin(tick*.017+k*1.7)*.5;ctx.save();ctx.translate(bx,-10);ctx.rotate(a);const gr=ctx.createLinearGradient(0,0,0,240);gr.addColorStop(0,'rgba('+cols[k]+',.32)');gr.addColorStop(1,'rgba('+cols[k]+',0)');ctx.fillStyle=gr;ctx.beginPath();ctx.moveTo(-4,0);ctx.lineTo(4,0);ctx.lineTo(40,240);ctx.lineTo(-40,240);ctx.fill();ctx.restore();}
    ctx.globalCompositeOperation='source-over';
    for(let k=0;k<26;k++){const x=(hsh(k,1)*W+tick*(.3+hsh(k,2)))%W,y=(hsh(k,3)*H+tick*(.6+hsh(k,4)*.6))%H;ctx.fillStyle=['#f2b632','#e2462c','#9fd0ff','#fff'][k%4];ctx.fillRect(x,y,2,1);}}
  else if(w==='dust'){for(let k=0;k<40;k++){const x=(hsh(k,1)*W*1.5+tick*(.4+hsh(k,2)*.8))%(W+20)-10,y=60+hsh(k,3)*200+Math.sin(tick*.02+k)*6;ctx.fillStyle='rgba(255,220,170,'+(.25+hsh(k,4)*.3).toFixed(2)+')';ctx.fillRect(x,y,1+(k%3===0),1);}}
  else if(w==='leaves'){for(const r of RAIN){if(r.k>.35)continue;r.y+=.5+r.s*.12;r.x+=Math.sin(tick*.04+r.s)*.6+.8;if(r.y>H){r.y=-6;r.x=Math.random()*W-40;}if(r.x>W+10)r.x=-10;ctx.fillStyle=r.s>5.5?'#7a8a3a':'#a8843a';ctx.fillRect(r.x,r.y,3,2);}}}
function drawWorld(){
  const cx=Math.round(cam.x);
  ctx.drawImage(FAR,Math.round(cx*.25)*RS,0,W*RS,190*RS,0,0,W,190);
  drawTrain(cx);
  ctx.drawImage(BG,cx*RS,0,W*RS,H*RS,0,0,W,H);
  drawDyn(cx);drawPajaros(cx);drawGuinos(cx);
  const draw=[];for(const e of ents)draw.push({y:e.y,f:()=>drawEnt(e)});for(const p of props)draw.push({y:p.y,f:()=>drawProp(p)});for(const it of items)draw.push({y:it.y,f:()=>drawItem(it)});
  if(state==='truck'&&truck){const tx=truck.x-cx;draw.push({y:223.9,f:()=>drawTruckL(tx)});}if(RIDE.on&&state!=='truck'){const tx=RIDE.x-cx;draw.push({y:223.9,f:()=>drawTruckL(tx)});}
  if(LV.ride&&player.mx!==undefined){const mx=player.mx;if(mx>-140)draw.push({y:224,f:()=>drawTruck(mx-cx,224,player.state==='ride')});}
  for(const p of parts)if(p.k==='ghost')draw.push({y:p.y-.1,f:()=>drawGhost(p)});
  for(const s of shots)draw.push({y:s.y,f:()=>drawShot(s)});if(LORO.on)draw.push({y:player.y+.5,f:()=>drawLoro(cx)});if(hazard)draw.push({y:hazard.y,f:drawHazard});
  for(const e of ents){if(e.gone||e.state==='hidden')continue;const s=e.st.scale,r=Math.max(.4,1-e.z/90);ctx.fillStyle='rgba(0,0,0,.42)';ctx.beginPath();ctx.ellipse(Math.round(e.x-cx),Math.round(e.y),14*s*r,4*r,0,0,Math.PI*2);ctx.fill();}
  draw.sort((a,b)=>a.y-b.y);for(const d of draw)d.f();
  ctx.globalCompositeOperation='multiply';ctx.drawImage(LIGHT,cx,0,W,H,0,0,W,H);
  ctx.globalCompositeOperation='lighter';
  for(const l of LAMPS){const x=l.x+10-cx;if(x<-60||x>W+60)continue;let a=1;if(l.flick)a=(tick%97<6||tick%53<3)?.15:1;ctx.globalAlpha=.75*a;const s=l.r>140?56:34;ctx.drawImage(glow('rgb('+l.c+')'),x-s/2,l.y+6-s/2,s,s);}
  if(train){ctx.globalAlpha=.8;ctx.drawImage(glow('#fff2c0'),train.x-cx-40,80,50,50);}
  ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
  drawWeather(cx);climaDraw(cx);
}

function drawDozer(e,X,Y){ctx.save();ctx.translate(X,Y);ctx.scale(e.face,1);const R=(a,b,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(a,b,w,h);};
  R(-40,-34,62,26,OUT);R(-39,-33,60,24,'#e8b82a');R(-30,-56,30,24,OUT);R(-29,-55,28,22,'#e8b82a');R(-26,-52,22,12,'#24323e');R(24,-40,6,38,OUT);R(25,-39,4,36,'#8a8a92');R(-42,-10,66,10,'#2a2a30');for(let k=0;k<8;k++)R(-40+k*8,-9,4,8,'#4a4a52');ctx.restore();}
const PCW=330,PCH=330,PC=document.createElement('canvas');PC.width=PCW*RS;PC.height=PCH*RS;const PCX=PC.getContext('2d');
let PGRP_=null;function PGRAIN(g){if(!PGRP_){const c=document.createElement('canvas');c.width=c.height=96;const x=c.getContext('2d'),d=x.createImageData(96,96);for(let i=0;i<d.data.length;i+=4){const v=Math.random()<.5?0:255;d.data[i]=d.data[i+1]=d.data[i+2]=v;d.data[i+3]=Math.random()*26;}x.putImageData(d,0,0);PGRP_=g.createPattern(c,'repeat');}return PGRP_;}
function drawEnt(e){if(e.gone||e.state==='ride'||e.state==='hidden')return;if(e.state==='dead'&&e.t%6<3)return;if(e===player&&e.inv>40&&tick%4<2&&state==='play')return;
  const X=Math.round(e.x-cam.x),Y=Math.round(e.y-e.z);
  if(e===npcs.rescue&&e.state==='tied'){ctx.fillStyle=LV.dyn==='campo'?'#6a4a2e':'#2e2c34';ctx.fillRect(X-8,Y-62,4,62);}
  if(e.D.dozer&&(e.state==='bcharge'||e.state==='ctele'))drawDozer(e,X,Y);
  if(e.st.tail){const s=e.st.scale,w=Math.sin(tick*.1)*6;for(const p of [0,1]){ctx.strokeStyle=p?e.st.skin:OUT;ctx.lineWidth=p?7:10;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(X-e.face*4*s,Y-22*s);ctx.quadraticCurveTo(X-e.face*24*s,Y-8+w,X-e.face*44*s,Y-6-w);ctx.stroke();}if(e.st.horns){const tx=X-e.face*44*s,ty=Y-6-w;ctx.fillStyle=e.st.skin;ctx.beginPath();ctx.moveTo(tx,ty-6*s);ctx.lineTo(tx-e.face*8*s,ty);ctx.lineTo(tx,ty+6*s);ctx.fill();}}
  drawPuppetLit(e,X,Y);
  if(e.papeT>0){e.papeT--;const bob=Math.sin(tick*.25)*2;txt('¡PAPERO!',X,Y-98*e.st.scale+bob,'#ff6a4a',5,'center');ctx.fillStyle='#b8864a';ctx.beginPath();ctx.ellipse(X,Y-86*e.st.scale+bob,5,3.6,0,0,7);ctx.fill();}
  if(e===npcs.rescue&&e.state==='tied'){ctx.strokeStyle='#c9b26a';ctx.lineWidth=1.5;for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(X-9,Y-38+i*7);ctx.lineTo(X+6,Y-40+i*7);ctx.stroke();}}
  if(e.state==='ctele'){ctx.fillStyle='#ff3b2a';txt('!',X,Y-86*e.st.scale,'#ff3b2a',12,'center');}
  if(e.state==='aim'){const k=e.t/46;if(k<1){ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.3+k*.6;const s=10+k*26;ctx.drawImage(glow('#fff2c8'),X+e.face*24-s/2,Y-54*e.st.scale-s/2,s,s);ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';}}
  if(e.dazed>0){for(let i=0;i<3;i++){const a=tick*.15+i*2.1;ctx.fillStyle='#f2e6a0';ctx.fillRect(X+Math.cos(a)*12-1,Y-90*e.st.scale+Math.sin(a)*3,3,3);}}}
function drawShot(s){const X=Math.round(s.x-cam.x),Y=Math.round(s.y-s.z);ctx.fillStyle='rgba(0,0,0,.35)';ctx.beginPath();ctx.ellipse(X,Math.round(s.y),5,2,0,0,Math.PI*2);ctx.fill();
  if(s.k==='frase'){drawFrase(s,X,Y);return;}if(s.k==='pizza'){drawPizza(s,X,Y);return;}
  if(s.k==='soda'){const d=Math.sign(s.vx);ctx.fillStyle='rgba(200,235,255,.55)';ctx.fillRect(d>0?X-16:X,Y-1.5,16,3);ctx.fillStyle='#f4fbff';for(let k=0;k<4;k++)ctx.fillRect(X-d*k*4+Math.sin(s.t+k)*1.5,Y-2+Math.cos(s.t*1.3+k)*2,1.5,1.5);return;}
  if(s.k==='bala'||s.k==='perdigon'){const d=Math.sign(s.vx),l=s.k==='bala'?14:8;ctx.fillStyle='rgba(255,220,120,.45)';ctx.fillRect(X-d*l-(d<0?-l:0)*0,Y-1,l*d,2);ctx.fillStyle='#fff6c8';ctx.fillRect(X-1.5,Y-1,3,2);return;}
  ctx.save();ctx.translate(X,Y);ctx.rotate(s.t*.45);const k=s.k||'phone';
  if(k==='tomate'){ctx.fillStyle=OUT;ctx.beginPath();ctx.arc(0,0,5,0,Math.PI*2);ctx.fill();ctx.fillStyle=s.back?'#ffd27a':'#d8322a';ctx.beginPath();ctx.arc(0,0,4,0,Math.PI*2);ctx.fill();ctx.fillStyle='#4f8a3a';ctx.fillRect(-1,-5,2,2);}
  else if(k==='papel'||k==='contrato'){ctx.fillStyle=OUT;ctx.fillRect(-6,-5,12,10);ctx.fillStyle=s.back?'#ffd27a':'#ece8e0';ctx.fillRect(-5,-4,10,8);ctx.fillStyle='#8a8a92';ctx.fillRect(-4,-2,8,1);ctx.fillRect(-4,1,6,1);}
  else if(k==='promesa'){ctx.rotate(-s.t*.45);ctx.fillStyle=OUT;ctx.fillRect(-11,-6,22,11);ctx.fillStyle=s.back?'#ffd27a':'#f4efe4';ctx.fillRect(-10,-5,20,9);ctx.fillStyle='#1a1418';ctx.font='4px '+FONT;ctx.textAlign='center';ctx.textBaseline='top';ctx.fillText('BLA',0,-3);}
  else if(k==='papa'&&lvl>=2){drawVinilo(s);}
  else if(k==='papa'){ctx.rotate(s.t*.25);ctx.fillStyle='rgba(10,8,13,.8)';ctx.beginPath();ctx.ellipse(0,0,10.5,7.6,0,0,Math.PI*2);ctx.fill();const pg=ctx.createRadialGradient(-3,-3,1,0,0,10);pg.addColorStop(0,'#e0b47a');pg.addColorStop(.6,'#b8864a');pg.addColorStop(1,'#7a5430');ctx.fillStyle=pg;ctx.beginPath();ctx.ellipse(0,0,9.5,6.8,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#5a3a1e';for(const [a,b] of [[-4,-1],[3,2],[1,-3],[-1,3],[5,-1]])ctx.fillRect(a,b,1.3,1.3);ctx.fillStyle='rgba(255,240,210,.5)';ctx.beginPath();ctx.ellipse(-3,-3,3,1.4,-.4,0,7);ctx.fill();}
  else if(k==='baba'){const gl=ctx.createRadialGradient(0,0,1,0,0,16);gl.addColorStop(0,'rgba(220,255,240,.95)');gl.addColorStop(.35,s.back?'rgba(255,210,120,.7)':'rgba(120,230,200,.6)');gl.addColorStop(1,'rgba(80,200,180,0)');ctx.fillStyle=gl;ctx.beginPath();ctx.arc(0,0,16,0,Math.PI*2);ctx.fill();ctx.fillStyle='#f4fff8';ctx.beginPath();ctx.arc(0,0,4,0,Math.PI*2);ctx.fill();}
  else if(k==='patacon'){ctx.fillStyle=OUT;ctx.fillRect(-7,-4,14,8);ctx.fillStyle=s.back?'#ffd27a':'#a8c08a';ctx.fillRect(-6,-3,12,6);ctx.fillStyle='#5a7a4a';ctx.fillRect(-2,-2,4,4);}
  else{ctx.fillStyle=OUT;ctx.fillRect(-4,-6,8,12);ctx.fillStyle=s.back?'#ffd27a':'#9fd0ff';ctx.fillRect(-3,-5,6,10);}
  ctx.restore();}
function drawZorra(){ctx.fillStyle=OUT;ctx.fillRect(-24,-26,48,22);ctx.fillStyle='#6a4426';ctx.fillRect(-23,-25,46,20);for(let k=0;k<3;k++){ctx.fillStyle='#8a6a42';ctx.fillRect(-21+k*15,-38,13,14);ctx.fillStyle='#6a4a2a';ctx.fillRect(-19+k*15,-34,9,2);}
  ctx.fillStyle='#8a8790';ctx.fillRect(18,-44,3,40);for(const w of [-14,14]){ctx.fillStyle='#141216';ctx.beginPath();ctx.arc(w,-4,5,0,Math.PI*2);ctx.fill();}
  ctx.fillStyle=OUT;ctx.fillRect(22,-58,10,26);ctx.fillStyle='#d8d0c0';ctx.fillRect(23,-57,8,24);ctx.fillStyle='#c98d66';ctx.beginPath();ctx.arc(27,-62,5,0,Math.PI*2);ctx.fill();ctx.fillStyle='#1a120c';ctx.fillRect(22,-67,10,3);}
function drawCamion(){const R=(a,b,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(a,b,w,h);};
  R(-66,-62,92,52,OUT);R(-65,-61,90,50,'#c8a24a');for(let k=0;k<6;k++)R(-62+k*15,-58,12,44,'#b8923a');R(26,-52,36,42,OUT);R(27,-51,34,40,'#3a5a8a');R(40,-47,18,14,'#24323e');R(58,-24,6,8,'#ffe9a8');
  for(const w of [-46,-24,40]){ctx.fillStyle=OUT;ctx.beginPath();ctx.arc(w,-8,10,0,Math.PI*2);ctx.fill();ctx.fillStyle='#1c1b20';ctx.beginPath();ctx.arc(w,-8,9,0,Math.PI*2);ctx.fill();ctx.fillStyle='#8a8790';ctx.beginPath();ctx.arc(w,-8,3,0,Math.PI*2);ctx.fill();}}
function drawToro(t){const R=(a,b,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(a,b,w,h);};const lg=Math.sin(t*.5)*5;
  for(const [x,o] of [[-18,lg],[-10,-lg],[10,lg],[18,-lg]]){R(x-2+o*.3,-16,5,16,'#141012');}
  ctx.fillStyle=OUT;ctx.beginPath();ctx.ellipse(0,-24,26,13,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#1e1a1a';ctx.beginPath();ctx.ellipse(0,-24,25,12,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#1e1a1a';ctx.beginPath();ctx.arc(24,-28,9,0,Math.PI*2);ctx.fill();R(28,-24,8,6,'#3a2e2e');ctx.fillStyle='#e8e2d0';ctx.beginPath();ctx.moveTo(20,-34);ctx.lineTo(14,-44);ctx.lineTo(23,-36);ctx.fill();ctx.beginPath();ctx.moveTo(28,-34);ctx.lineTo(34,-44);ctx.lineTo(29,-36);ctx.fill();
  R(26,-31,2,2,'#ff3a2a');R(-26,-30,3,12,'#1e1a1a');ctx.fillStyle='rgba(255,255,255,.12)';ctx.beginPath();ctx.ellipse(-4,-30,14,4,0,0,Math.PI*2);ctx.fill();}
function drawHazard(){const h=hazard;if(!h)return;const cx=cam.x;
  if(h.t<=50){if(h.t%10<6){ctx.fillStyle='rgba(255,60,40,.55)';for(let x=0;x<W;x+=14)ctx.fillRect(x,Math.round(h.y),8,2);txt('!',h.dir>0?16:W-16,Math.round(h.y)-24,'#ff3b2a',12,'center');}return;}
  ctx.save();ctx.translate(Math.round(h.x-cx),Math.round(h.y));if(h.dir<0)ctx.scale(-1,1);
  if(h.k==='zorra')drawZorra();else if(h.k==='camion')drawCamion();else if(h.k==='toro')drawToro(h.t);else if(HZD[h.k])HZD[h.k](h.t);
  else{drawMoto(0,0);ctx.fillStyle=OUT;ctx.fillRect(-10,-48,12,24);ctx.fillStyle='#2a2a30';ctx.fillRect(-9,-47,10,22);ctx.fillStyle=OUT;ctx.beginPath();ctx.arc(-3,-52,7,0,Math.PI*2);ctx.fill();ctx.fillStyle='#c8322a';ctx.beginPath();ctx.arc(-3,-52,6,0,Math.PI*2);ctx.fill();ctx.fillStyle='#111';ctx.fillRect(-1,-54,6,3);}
  ctx.restore();}
function drawGhost(p){ctx.globalAlpha=.25*(1-p.t/p.max);const f=p.f,sv=f.pose,sf=f.flash;f.pose=p.pose;f.flash=1;drawPuppet(Object.assign({},f,{face:p.face}),Math.round(p.x-cam.x),Math.round(p.y));f.pose=sv;f.flash=sf;ctx.globalAlpha=1;}
function drawProp(p){const X=Math.round(p.x-cam.x),Y=Math.round(p.y),R=(a,b,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(a,b,w,h);};
  if(p.hp<=0){R(X-9,Y-6,18,6,p.kind==='cajon'?'#4a3020':p.kind==='fardo'?'#a88a4a':'#3c3d46');return;}
  if(p.kind==='cajon'){R(X-13,Y-21,26,22,OUT);R(X-12,Y-20,24,20,'#8a5a2e');R(X-12,Y-13,24,2,'#6a4022');R(X-12,Y-6,24,2,'#6a4022');R(X-1,Y-20,2,20,'#6a4022');
    const fc=lvl===0?['#c8a26a','#b8925a','#c8a26a']:p.drop==='mate'?['#9fd0ff','#5aa0c8','#9fd0ff']:['#c8322a','#e07a1a','#e8c83a'];for(let d=0;d<5;d++){ctx.fillStyle=fc[d%3];ctx.beginPath();ctx.arc(X-9+d*4.5,Y-21,2.6,0,Math.PI*2);ctx.fill();}return;}
  if(p.kind==='fardo'){R(X-15,Y-21,30,22,OUT);R(X-14,Y-20,28,20,'#d8b866');for(let k=0;k<6;k++)R(X-14,Y-18+k*3,28,1,'#b8964a');R(X-6,Y-20,2,20,'#8a6a3a');R(X+5,Y-20,2,20,'#8a6a3a');return;}
  if(p.kind==='ampli'){R(X-13,Y-30,26,31,OUT);R(X-12,Y-29,24,29,'#1a181e');R(X-10,Y-27,20,4,'#2a2830');R(X-8,Y-26,2,2,'#d8a22a');R(X-4,Y-26,2,2,'#d8a22a');ctx.fillStyle='#2a2830';ctx.beginPath();ctx.arc(X,Y-11,8,0,Math.PI*2);ctx.fill();ctx.fillStyle='#3a3840';ctx.beginPath();ctx.arc(X,Y-11,3,0,Math.PI*2);ctx.fill();return;}
  R(X-11,Y-27,22,28,OUT);R(X-10,Y-24,20,24,'#6e7080');R(X-10,Y-24,4,24,'#858897');for(let i=0;i<3;i++)R(X-10,Y-18+i*6,20,1,'#55575f');R(X-12,Y-28,24,4,'#9aa0a8');R(X-3,Y-30,6,2,'#3c3d46');}
const FOOD={chori:['¡CHORIPÁN! +45','#f2b632',45],mila:['¡MILANESA! +45','#f2b632',45],pizza:['¡PIZZA Y FAINÁ! +45','#f2b632',45],empanada:['¡EMPANADAS! +45','#f2b632',45],asado:['¡TIRA DE ASADO! +45','#f2b632',45],fruta:['FRUTA +20','#ff6a4a',20],mate:['WHISKY +20','#e0a040',20]};
function drawItem(it){const X=Math.round(it.x-cam.x),Y=Math.round(it.y-it.z),bob=it.z<=0?Math.round(Math.sin(it.t*.1)*1):0,R=(a,b,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(a,b,w,h);};
  ctx.fillStyle='rgba(0,0,0,.35)';ctx.beginPath();ctx.ellipse(X,Math.round(it.y),9,3,0,0,Math.PI*2);ctx.fill();const y=Y+bob;
  if(it.kind==='disco')drawDisco(X,y);else if(it.kind==='lombriz')drawLombriz(X,y);
  else if(GUNS[it.kind])drawGunItem(it.kind,X,y);
  else if(it.kind==='pipe'){ctx.save();ctx.translate(X-12,Y-3+bob);drawMelee(0,0,Math.PI/2-.15);ctx.restore();}
  else if(it.kind==='fruta'){for(const [dx,c] of [[-4,'#c8322a'],[4,'#e07a1a']]){ctx.fillStyle=OUT;ctx.beginPath();ctx.arc(X+dx,y-5,5,0,Math.PI*2);ctx.fill();ctx.fillStyle=c;ctx.beginPath();ctx.arc(X+dx,y-5,4,0,Math.PI*2);ctx.fill();}R(X-4,y-11,3,2,'#4f8a3a');}
  else if(it.kind==='chori'){R(X-11,y-9,22,9,OUT);R(X-10,y-8,20,7,'#e0b464');R(X-8,y-7,16,3,'#8c2a1a');R(X-6,y-7,3,1,'#c8322a');}
  else if(it.kind==='mila'){ctx.fillStyle=OUT;ctx.beginPath();ctx.ellipse(X,y-5,12,6,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#c8903a';ctx.beginPath();ctx.ellipse(X,y-5,11,5,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#e0b05a';for(let k=0;k<5;k++)ctx.fillRect(X-8+k*4,y-7+(k%2)*2,2,1);R(X+5,y-9,4,3,'#e8e070');}
  else if(it.kind==='pizza'){ctx.fillStyle=OUT;ctx.beginPath();ctx.moveTo(X-10,y-2);ctx.lineTo(X+10,y-2);ctx.lineTo(X,y-16);ctx.fill();ctx.fillStyle='#e8c060';ctx.beginPath();ctx.moveTo(X-8,y-3);ctx.lineTo(X+8,y-3);ctx.lineTo(X,y-14);ctx.fill();R(X-8,y-4,16,2,'#c8903a');R(X-3,y-8,2,2,'#c8322a');R(X+1,y-6,2,2,'#c8322a');}
  else if(it.kind==='empanada'){ctx.fillStyle=OUT;ctx.beginPath();ctx.arc(X,y-2,9,Math.PI,Math.PI*2);ctx.fill();ctx.fillStyle='#d8a050';ctx.beginPath();ctx.arc(X,y-2,8,Math.PI,Math.PI*2);ctx.fill();for(let k=0;k<5;k++)R(X-7+k*3.4,y-4-Math.sin((k+.5)/5*Math.PI)*6,2,2,'#b8803a');}
  else if(it.kind==='asado'){R(X-13,y-9,26,9,OUT);R(X-12,y-8,24,7,'#8c3a1a');for(let k=0;k<4;k++)R(X-10+k*6,y-8,2,7,'#e8d8c0');R(X-12,y-8,24,1,'#b85a2a');}
  else{R(X-6,y-12,12,12,OUT);R(X-5,y-11,10,10,'#dfe8ec');R(X-5,y-7,10,6,'#c8862a');R(X-5,y-7,10,1,'#e8a848');R(X-4,y-10,3,3,'rgba(240,250,255,.85)');R(X,y-9,3,3,'rgba(240,250,255,.7)');R(X-5,y-2,10,1,'#9aa4a8');R(X-4,y-11,1,9,'rgba(255,255,255,.6)');}
  if(it.t%40<20){ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.35;ctx.drawImage(glow('#ffe9a8'),X-14,y-20,28,28);ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';}}

function drawParts(){const cx=cam.x;for(const p of parts){const k=p.t/p.max,X=p.x-cx;
  if(p.k==='spark'){ctx.strokeStyle=k<.4?'#ffffff':'#ff4a2a';ctx.lineWidth=p.big?2:1.5;const n=p.big?8:6,r1=(p.big?6:4)+k*(p.big?16:10),r2=r1+(p.big?8:5)*(1-k);
    ctx.beginPath();for(let i=0;i<n;i++){const a=i/n*Math.PI*2+p.x;ctx.moveTo(X+Math.cos(a)*r1,p.y+Math.sin(a)*r1);ctx.lineTo(X+Math.cos(a)*r2,p.y+Math.sin(a)*r2);}ctx.stroke();
    if(k<.3){ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(X,p.y,(p.big?6:4)*(1-k*2),0,Math.PI*2);ctx.fill();}}
  else if(p.k==='ring'){ctx.strokeStyle='rgba(255,240,200,'+(1-k).toFixed(2)+')';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(X,p.y,p.r*k+3,(p.r*k+3)*.6,0,0,Math.PI*2);ctx.stroke();}
  else if(p.k==='wave'){const c=p.col||'255,215,120';ctx.strokeStyle='rgba('+c+','+(1-k).toFixed(2)+')';ctx.lineWidth=4*(1-k)+1;ctx.beginPath();ctx.ellipse(X,p.y-6,10+k*100,4+k*30,0,0,Math.PI*2);ctx.stroke();
    ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(X,p.y-6,k*70,k*20,0,0,Math.PI*2);ctx.stroke();}
  else if(p.k==='dust'){ctx.fillStyle='rgba(150,145,160,'+(.5*(1-k)).toFixed(2)+')';ctx.beginPath();ctx.arc(X,p.y,p.r*(1+k),0,Math.PI*2);ctx.fill();}
  else if(p.k==='camflash'){ctx.globalCompositeOperation='lighter';ctx.globalAlpha=1-k;ctx.drawImage(glow('#fff6e0'),X-60,p.y-60,120,120);ctx.fillStyle='rgba(255,250,235,'+(.35*(1-k)).toFixed(2)+')';ctx.fillRect(0,0,W,H);ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';}
  else if(p.k==='deb'){ctx.fillStyle=p.c;ctx.fillRect(Math.round(X),Math.round(p.y),p.w,p.h);}
  else if(fxDraw(p,X,k)){}else if(p.k==='txt'){ctx.globalAlpha=1-Math.max(0,k-.6)*2.5;txt(p.s,Math.round(X),Math.round(p.y),p.c,10,'center');ctx.globalAlpha=1;}}}
function drawBubble(b){return drawBubble2(b);}
function portrait(who,x,y,sz){ctx.save();ctx.fillStyle='#120e16';ctx.fillRect(x,y,sz,sz);ctx.beginPath();ctx.rect(x,y,sz,sz);ctx.clip();
  const g=ctx.createLinearGradient(x,y,x,y+sz);g.addColorStop(0,'#3a2440');g.addColorStop(1,'#120e16');ctx.fillStyle=g;ctx.fillRect(x,y,sz,sz);
  const st=STY[who];
  drawFaceFront(st,x+sz*.02,y+sz*.06,sz*.96);
  ctx.restore();ctx.strokeStyle='#e2462c';ctx.lineWidth=1;ctx.strokeRect(x+.5,y+.5,sz-1,sz-1);}
function drawHUD(){return drawHUD2();}
function drawCut(){const c=cut;if(!c)return;const l=c.lines[c.i];const y=H-74;
  ctx.fillStyle='rgba(8,6,11,.88)';ctx.fillRect(8,y,W-16,66);ctx.fillStyle='#e2462c';ctx.fillRect(8,y,W-16,2);
  const who=DEFS[l.w]?DEFS[l.w].sty:l.w;portrait(who,14,y+8,50);txt(NAMES[l.w]||NAMES[who]||'',72,y+8,'#f2b632',8);
  const lines=wrap(l.s.slice(0,Math.floor(c.ch)),52);lines.forEach((s,i)=>txt(s,72,y+22+i*10.5,'#efe4d2',6.5));
  if(c.ch>=l.s.length&&tick%40<26){ctx.fillStyle='#f2b632';ctx.beginPath();ctx.moveTo(W-24,y+52);ctx.lineTo(W-16,y+52);ctx.lineTo(W-20,y+58);ctx.fill();}
  ctx.fillStyle='#000';ctx.fillRect(0,0,W,14);}

const GRAIN=(()=>{const c=mkc(W+64,H+32),g=c.getContext('2d'),d=g.createImageData(c.width,c.height);for(let i=0;i<d.data.length;i+=4){const v=Math.random()*255|0;d.data[i]=d.data[i+1]=d.data[i+2]=v;d.data[i+3]=255;}g.putImageData(d,0,0);return c;})();
const VIGN=(()=>{const c=mkc(W,H),g=c.getContext('2d'),gr=g.createRadialGradient(W/2,H/2,H*.35,W/2,H/2,W*.62);gr.addColorStop(0,'#ffffff');gr.addColorStop(1,'#9a8a76');g.fillStyle=gr;g.fillRect(0,0,W,H);return c;})();
function grade(){ctx.save();ctx.globalCompositeOperation='saturation';ctx.globalAlpha=.62;ctx.fillStyle='#808080';ctx.fillRect(0,0,W,H);
  ctx.globalCompositeOperation='multiply';ctx.globalAlpha=.32;ctx.fillStyle='#f0cc94';ctx.fillRect(0,0,W,H);
  ctx.globalAlpha=1;ctx.drawImage(VIGN,0,0);
  ctx.globalCompositeOperation='overlay';ctx.globalAlpha=.12;ctx.drawImage(GRAIN,-((tick*13)%64),-((tick*7)%32));ctx.restore();}
function drawTitle(){
  ctx.fillStyle='#0b0910';ctx.fillRect(0,0,W,H);
  const g=ctx.createRadialGradient(110,150,10,110,150,190);g.addColorStop(0,'rgba(226,70,44,.38)');g.addColorStop(1,'rgba(226,70,44,0)');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  for(let k=0;k<40;k++){ctx.fillStyle='rgba(239,228,210,'+(.05+hsh(k,2)*.1).toFixed(2)+')';ctx.fillRect(hsh(k,1)*W,(hsh(k,3)*H+tick*.2*(1+hsh(k,4)))%H,1,1);}
  const L5=LEVELS[sel],st=STY[L5.skin];
  ctx.save();ctx.beginPath();ctx.rect(14,40,190,214);ctx.clip();drawFaceFront(st,10,46,200);ctx.restore();
  ctx.strokeStyle='#e2462c';ctx.lineWidth=2;ctx.strokeRect(14,40,190,214);
  txt(L5.place.split('·').pop().trim(),109,240,'#f2b632',8,'center');
  ctx.save();ctx.translate(342,30);ctx.rotate(-.05);txt('RICARDO IORIO',3,3,'#7a1a14',18,'center');txt('RICARDO IORIO',0,0,'#f2b632',18,'center');ctx.restore();
  ctx.fillStyle='#e2462c';ctx.save();ctx.translate(342,66);ctx.rotate(-.05);ctx.fillRect(-112,-8,224,18);txt('UNA VIDA DE METAL',0,-3,'#fff',9,'center');ctx.restore();
  LEVELS.forEach((L,i)=>{const y=82+i*10,open=i<unl,on=i===sel;
    if(on){ctx.fillStyle='rgba(226,70,44,.28)';ctx.fillRect(222,y-2,240,11);ctx.fillStyle='#f2b632';ctx.fillRect(222,y-2,3,11);}
    txt((L.bonus?'★':(i+1)+'.')+' '+(open?L.title:'???'),230,y,open?(on?'#fff':'#efe4d2'):'#5a4a5e',5);});
  const df=DIFFS[diff];
  ctx.fillStyle='rgba(18,14,24,.92)';ctx.fillRect(222,201,240,17);
  ctx.strokeStyle=df.col;ctx.lineWidth=1.2;ctx.strokeRect(222.5,201.5,239,16);
  txt('◄ DIFICULTAD: '+df.name+' ►',342,204,df.col,6,'center');
  txt(df.desc,342,212,'#b0a2b8',4,'center');
  const curS=SONGS[LEVELS[sel]?.song]||SONGS[song];if(curS&&curS.name)txt('♫ 16-BIT: '+curS.name,342,219,'#f2b632',5,'center');if(tick%60<40)txt(coarse?'TOCÁ PARA JUGAR':'ENTER / ESPACIO PARA JUGAR',342,227.5,'#fff',7,'center');
  txt('▲/▼: CAPÍTULO · ◄/►: DIFICULTAD · '+(sel<unl?LEVELS[sel].place:'BLOQUEADO'),342,237.5,'#9b8aa3',4,'center');
  txt(coarse?'BOTÓN ÁLBUM: TUS FIGURITAS':'G: ÁLBUM · DOBLE TOQUE: CORRER',342,243.5,'#f2b632',4,'center');
  txt('FAN GAME · DIÁLOGOS DE FICCIÓN · SIN FINES DE LUCRO',342,249.5,'#7a6a80',4.5,'center');
  if(hiscore)txt('RÉCORD '+String(hiscore).padStart(7,'0'),342,256.5,'#f2b632',5,'center');}
function drawCard(){ctx.fillStyle='#0b0910';ctx.fillRect(0,0,W,H);
  const k=Math.min(1,cardT/30);ctx.globalAlpha=k;
  if(FAR)ctx.drawImage(FAR,0,0,W*RS,190*RS,0,0,W,190);
  ctx.fillStyle='rgba(8,6,12,.82)';ctx.fillRect(0,0,W,H);
  const px=22,py=26,psz=66;
  portrait(LV.skin,px,py,psz);
  txt(LV.chap,98,28,'#e2462c',7);
  txt(LV.title,98,40,'#f2b632',14);
  txt(LV.place,98,58,'#efe4d2',6.5);const cS=SONGS[LV.song];if(cS&&cS.name)txt('♫ 16-BIT: '+cS.name,98,72,'#f2b632',6);
  ctx.fillStyle='rgba(226,70,44,.55)';ctx.fillRect(22,96,W-44,1.5);
  ctx.fillStyle='rgba(242,182,50,.35)';ctx.fillRect(22,97.5,80,1);
  let y=104;
  LV.card.forEach((s,i)=>{
    if(cardT>15+i*12){
      wrap(s,66).forEach(l=>{txt(l,24,y,'#d8cfc0',6.5);y+=9;});
      y+=3;
    }
  });
  if(cardT>55){
    const vy=Math.min(y+2,188);
    ctx.fillStyle='rgba(20,14,24,.65)';ctx.fillRect(20,vy-2,W-40,24);
    ctx.fillStyle='#e2462c';ctx.fillRect(20,vy-2,3,24);
    txt('VILLANOS:',28,vy+3,'#e2462c',6);
    wrap(LV.villains,66).forEach((l,i)=>txt(l,88,vy+2+i*8.5,'#efe4d2',6));
  }
  ctx.fillStyle='rgba(255,255,255,.08)';ctx.fillRect(22,232,W-44,1);
  txt('Los hechos son reales; los diálogos y peleas, ficción de fan.',W/2,238,'#8a7a8e',5,'center');
  if(cardT>30&&tick%60<40)txt(coarse?'TOCÁ PARA SEGUIR':'ENTER / ESPACIO PARA SEGUIR',W/2,252,'#ffffff',7,'center');
  ctx.globalAlpha=1;}
function drawResults(){const r=results;ctx.fillStyle='rgba(8,6,11,.86)';ctx.fillRect(40,24,W-80,H-48);ctx.fillStyle='#e2462c';ctx.fillRect(40,24,W-80,3);
  txt(LV.chap+' SUPERADO',W/2,36,'#f2b632',12,'center');txt(LV.title+' · '+LV.place,W/2,52,'#efe4d2',6,'center');
  const rows=[['TIEMPO',Math.floor(r.t/60)+':'+String(r.t%60).padStart(2,'0')],['DIFICULTAD',DIFFS[diff].name],['COMBO MÁXIMO',r.combo+' GOLPES'],['GOLPES RECIBIDOS',String(r.hits)],['PUNTAJE',String(r.score).padStart(7,'0')]];
  rows.forEach(([a,b],i)=>{if(r.k>8+i*9){txt(a,70,74+i*16,'#9b8aa3',6.5);txt(b,W-170,74+i*16,i===1?DIFFS[diff].col:'#fff',6.5,'right');}});
  if(r.k>55){const s=1+Math.max(0,(65-r.k))*.08;ctx.save();ctx.translate(W-105,116);ctx.scale(s,s);txt(r.rank,0,-20,r.rank==='S'?'#ff5a3a':'#f2b632',38,'center');ctx.restore();txt('RANGO',W-105,142,'#9b8aa3',6,'center');}
  const nx=LEVELS[lvl+1];txt(nx?'PRÓXIMO: '+nx.title+' · '+nx.place:'PRÓXIMO: LA GIRA FEDERAL',W/2,176,'#e2462c',6,'center');
  if(r.k>55&&tick%60<40)txt(coarse?'TOCÁ PARA SEGUIR':'ENTER PARA SEGUIR',W/2,204,'#fff',7,'center');}
// Final: tierra adentro, en el campo, con la bandera flameando al atardecer
const FANS=Array.from({length:46},(_,i)=>({x:250+(i%23)*10+hsh(i,1)*6,y:200+(i/23|0)*14+hsh(i,2)*4,c:['#151418','#1c1a22','#2a2230','#201a1e'][i%4],ph:hsh(i,3)*6}));
function drawFlag(x,y,w,h,t){const n=48,sw=w/n;
  for(let i=0;i<n;i++){const k=i/n,off=Math.sin(i*.28-t*.09)*6*k+Math.sin(i*.11-t*.05)*3*k,sh=.82+.18*Math.cos(i*.28-t*.09);
    const X=x+i*sw,Y=y+off;
    for(const [a,b,c] of [[0,1/3,'#6cace4'],[1/3,2/3,'#f4f4f0'],[2/3,1,'#6cace4']]){ctx.fillStyle=shade(c,sh);ctx.fillRect(X,Y+h*a,sw+.6,h*(b-a)+.6);}}
  const cx=x+w/2,cy=y+h/2+Math.sin(n/2*.28-t*.09)*3+Math.sin(n/2*.11-t*.05)*1.5,r=h*.09;
  ctx.fillStyle='#e8a82a';for(let k=0;k<16;k++){const a=k/16*Math.PI*2+Math.sin(t*.02)*.05;ctx.beginPath();ctx.moveTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r);ctx.lineTo(cx+Math.cos(a+.1)*r*1.8,cy+Math.sin(a+.1)*r*1.8);ctx.lineTo(cx+Math.cos(a+.2)*r,cy+Math.sin(a+.2)*r);ctx.fill();}
  ctx.fillStyle='#f2c03a';ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.fill();ctx.fillStyle='#a8741a';ctx.fillRect(cx-r*.45,cy-r*.25,r*.25,r*.2);ctx.fillRect(cx+r*.2,cy-r*.25,r*.25,r*.2);ctx.fillRect(cx-r*.3,cy+r*.35,r*.6,r*.12);}

// v13: antes del final, el mapa del país con el camino de la historia y la gira 2023
const ARG=[[-65.7,-22.1],[-62.6,-22.2],[-61,-23.8],[-58,-25.2],[-55.7,-25.9],[-53.8,-26.6],[-55.7,-28],[-57.6,-30.2],[-58.2,-32.4],[-58.4,-34],[-57.2,-35.3],[-57.5,-36.4],[-56.7,-36.9],[-57.7,-38.2],[-61,-38.9],[-62.3,-39.3],[-62.1,-40.6],[-65,-40.8],[-65.1,-42.1],[-64,-42.5],[-65.4,-44.6],[-67.6,-46.5],[-65.8,-47.8],[-67.6,-49.5],[-69,-51],[-68.4,-52.3],[-71.9,-52],[-72.4,-50.6],[-73.2,-49.2],[-71.8,-46.5],[-71.9,-44],[-71.7,-40],[-71.1,-37],[-70.4,-35],[-69.8,-33],[-70.5,-31],[-69.6,-28.5],[-68.3,-26.9],[-67.2,-24.1],[-66.8,-22.4]];
const TDF=[[-68.6,-52.6],[-65.1,-54.9],[-68.6,-54.9]];
const STOPS=[['VILLA BALLESTER',-58.55,-34.55,'',6,-3,'left'],['SAN FRANCISCO (8/7)',-62.08,-31.43,'',6,-6,'left'],['BARILOCHE',-71.3,-41.13,'',-6,-3,'right'],['TRELEW (9/9)',-65.3,-43.25,'',6,-3,'left']];
function mapXY(lo,la){return [70+(lo+74)*6.2,18+(-22-la)*-(-7.1)];}
function drawTourMap(t){ctx.fillStyle='#0c1020';ctx.fillRect(0,0,W,H);
  for(let k=0;k<60;k++){ctx.fillStyle='rgba(255,255,255,'+(.15+hsh(k,7)*.4).toFixed(2)+')';ctx.fillRect(hsh(k,8)*W,hsh(k,9)*H,1,1);}
  const poly=(pts,fill)=>{ctx.beginPath();pts.forEach(([lo,la],i)=>{const [x,y]=mapXY(lo,la);i?ctx.lineTo(x,y):ctx.moveTo(x,y);});ctx.closePath();ctx.fillStyle=fill;ctx.fill();ctx.strokeStyle='#8fb4e0';ctx.lineWidth=1;ctx.stroke();};
  const gr=ctx.createLinearGradient(0,20,0,250);gr.addColorStop(0,'#3a5a3a');gr.addColorStop(.5,'#6a7a4a');gr.addColorStop(1,'#8a9aa8');poly(ARG,gr);poly(TDF,'#8a9aa8');
  const n=Math.min(STOPS.length,Math.floor(t/26));ctx.strokeStyle='#f2b632';ctx.lineWidth=1.6;ctx.setLineDash([3,2]);ctx.beginPath();
  for(let i=0;i<n;i++){const [x,y]=mapXY(STOPS[i][1],STOPS[i][2]);i?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();ctx.setLineDash([]);
  for(let i=0;i<n;i++){const s=STOPS[i],[x,y]=mapXY(s[1],s[2]),pulse=i===n-1?1+Math.sin(t*.2)*.4:1;ctx.fillStyle='#e2462c';ctx.beginPath();ctx.arc(x,y,2.6*pulse,0,7);ctx.fill();
    txt(s[0],x+s[4],y+s[5],'#efe4d2',4,s[6]);}
  const a=Math.min(1,t/60);ctx.globalAlpha=a;
  txt('GIRA FEDERAL 2023',360,46,'#f2b632',8,'center');txt('UNAS ESTROFAS MÁS',360,62,'#efe4d2',7,'center');
  const L=['Algunas fechas documentadas','de la gira "Unas estrofas más".','','Del oeste del conurbano','a todo el país, pueblo por pueblo.','','Toda una vida tierra adentro.'];
  L.forEach((s,i)=>txt(s,360,96+i*13,'#c8bcd0',4,'center'));
  if(t>300&&t%60<40)txt('ENTER PARA SEGUIR',360,236,'#9b8aa3',4,'center');ctx.globalAlpha=1;}
function drawEnding(){if(endT<420){drawTourMap(endT);return;}const t=endT-420;
  const sk=ctx.createLinearGradient(0,0,0,190);sk.addColorStop(0,'#1e2a5a');sk.addColorStop(.45,'#a85a6a');sk.addColorStop(.8,'#f0a060');sk.addColorStop(1,'#ffd890');ctx.fillStyle=sk;ctx.fillRect(0,0,W,H);
  for(let k=0;k<30;k++){ctx.fillStyle='rgba(255,255,255,'+(.3+hsh(k,4)*.5).toFixed(2)+')';ctx.fillRect(hsh(k,1)*W,hsh(k,2)*60,1,1);}
  const sg=ctx.createRadialGradient(330,176,6,330,176,180);sg.addColorStop(0,'rgba(255,230,160,.95)');sg.addColorStop(.15,'rgba(255,200,120,.5)');sg.addColorStop(1,'rgba(255,200,120,0)');ctx.fillStyle=sg;ctx.fillRect(0,0,W,H);
  ctx.fillStyle='#ffe2a0';ctx.beginPath();ctx.arc(330,180-Math.min(t,600)*.02,22,0,Math.PI*2);ctx.fill();
  // sierras lejanas y la pampa
  ctx.fillStyle='#6a5a7a';ctx.beginPath();ctx.moveTo(0,180);for(let x=0;x<=W;x+=10)ctx.lineTo(x,160-Math.sin(x*.012)*14-Math.sin(x*.04)*5);ctx.lineTo(W,180);ctx.fill();
  const gr=ctx.createLinearGradient(0,176,0,H);gr.addColorStop(0,'#7a7a3a');gr.addColorStop(1,'#3a4a1e');ctx.fillStyle=gr;ctx.fillRect(0,176,W,H-176);
  for(let k=0;k<160;k++){const x=hsh(k,7)*W,y=180+hsh(k,8)*90,sw=Math.sin(t*.05+k)*1.5;ctx.strokeStyle=hsh(k,9)>.5?'#9a9a4a':'#5a6a2a';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+sw,y-4-hsh(k,3)*4);ctx.stroke();}
  // molino, alambrado y caballos
  ctx.fillStyle='#2a2024';ctx.fillRect(56,96,3,84);ctx.fillRect(50,176,15,4);ctx.save();ctx.translate(57,96);ctx.rotate(t*.04);for(let k=0;k<12;k++){ctx.rotate(Math.PI/6);ctx.fillRect(2,-1.2,16,2.4);}ctx.restore();
  for(let x=0;x<W;x+=40){ctx.fillStyle='#3a2a20';ctx.fillRect(x,168,2,14);}ctx.fillStyle='rgba(60,40,30,.6)';ctx.fillRect(0,172,W,1);ctx.fillRect(0,177,W,1);
  for(const [hx,ph] of [[120,0],[150,2]]){const b=Math.sin(t*.06+ph)*1;ctx.fillStyle='#2a1a14';ctx.beginPath();ctx.ellipse(hx,170+b,11,5,0,0,Math.PI*2);ctx.fill();ctx.fillRect(hx+7,160+b,4,10);ctx.beginPath();ctx.ellipse(hx+12,159+b,5,3,-.4,0,Math.PI*2);ctx.fill();for(const lx of [-8,-4,5,8])ctx.fillRect(hx+lx,173+b,2,8);}
  // el mástil y la bandera grande
  ctx.fillStyle='#d8d4cc';ctx.fillRect(196,20,3,180);ctx.fillStyle='#f2c03a';ctx.beginPath();ctx.arc(197.5,19,3,0,Math.PI*2);ctx.fill();
  const fy=Math.max(24,150-t*.8);drawFlag(199,fy,150,96,t);
  // fogón, la banda y los amigos
  const fx=300,fy2=214;for(let k=0;k<6;k++){const a=t*.3+k;ctx.fillStyle=k%2?'rgba(255,140,40,.9)':'rgba(255,220,90,.9)';ctx.beginPath();ctx.ellipse(fx+Math.sin(a)*3,fy2-6-k*2,5-k*.6,8-k,0,0,Math.PI*2);ctx.fill();}
  ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.5;ctx.drawImage(glow('#ffb060'),fx-40,fy2-40,80,60);ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
  for(let k=0;k<12;k++){const a=(t*2+k*37)%60;ctx.fillStyle='rgba(255,200,90,'+(1-a/60).toFixed(2)+')';ctx.fillRect(fx+Math.sin(k+t*.05)*8,fy2-10-a,1,1);}
  for(const f of FANS){const up=Math.sin(t*.2+f.ph)>.3;ctx.fillStyle=f.c;ctx.beginPath();ctx.arc(f.x,f.y,4,0,Math.PI*2);ctx.fill();ctx.fillRect(f.x-4,f.y+3,8,16);if(up){ctx.fillRect(f.x+2,f.y-12,2,10);}}
  const hero={st:STY.ric5,pose:Object.assign({},t%80<40?PO.victory:PO.spec,{tilt:Math.sin(t*.08)*.08}),face:1,flash:0,holdBack:'bass',kind:'ric5',state:t%80<40?'victory':'spec'};
  const sv=STY.ric5.scale;STY.ric5.scale=1.9;drawPuppet(hero,150,236);STY.ric5.scale=sv;
  grade();
  // título y créditos
  if(t>40){const a=Math.min(1,(t-40)/40);ctx.globalAlpha=a;txt('TIERRA ADENTRO',W/2+2,14,'#3a1410',18,'center');txt('TIERRA ADENTRO',W/2,12,'#f2b632',18,'center');ctx.globalAlpha=1;}
  const lines=['Lejos del ruido, donde la patria se hace con las manos.','Fue quien fue, por ser él mismo, sin pedir permiso.','','Gracias por jugar. Ricardio es una parodia de fans, sin fines de lucro,','en homenaje a la música de Ricardo Iorio: V8, Hermética y Almafuerte.','Los diálogos son ficción. In memoriam: Ricardo Iorio (1962 - 2023).','',total?'TIEMPO TOTAL '+Math.floor(total.t/60)+':'+String(total.t%60).padStart(2,'0')+' · PUNTAJE '+String(score).padStart(7,'0'):''];
  if(t>120){ctx.fillStyle='rgba(8,6,11,.66)';ctx.fillRect(12,38,178,118);let yy=44;lines.forEach((s,i)=>{if(!s){yy+=4;return;}const ls=wrap(s,i<2?28:34);if(t>120+i*20)ls.forEach((l,j)=>txt(l,101,yy+j*7,i<2?'#f2e2b0':'#d8cfc0',i<2?5:4,'center'));yy+=ls.length*7+2;});}
  if(t>260&&tick%60<40)txt(coarse?'TOCÁ PARA VOLVER':'ENTER PARA VOLVER',W/2,256,'#fff',7,'center');}


// v13: cada capítulo tiene su vuelta: pogo que empuja, ruta de noche, viento en la sierra, cortes de luz en Cemento, flashes en Recoleta
const MODS=['','','pogo','flash','','pogo','apagon','noche','viento','viento'];
let MOD={t:0,gust:0,dir:1,warn:0,dark:0};
function modOf(){return MODS[lvl]||'';}
function modReset(){MOD={t:0,gust:0,dir:1,warn:0,dark:0};}
function modTick(){const m=modOf();if(!m||!player)return;MOD.t++;
  if(m==='pogo'||m==='viento'){const per=m==='pogo'?520:440;
    if(MOD.t%per===per-80){MOD.dir=Math.random()<.5?-1:1;MOD.warn=80;banner={a:m==='pogo'?'¡POGO!':'¡VIENTO!',b:m==='pogo'?'LA GENTE EMPUJA: AGUANTÁ':'SE VIENE UNA RÁFAGA',t:70,boss:false};}
    if(MOD.warn>0&&--MOD.warn===0)MOD.gust=m==='pogo'?110:150;
    if(MOD.gust>0){MOD.gust--;const k=(m==='pogo'?1.1:.8)*Math.sin(Math.PI*MOD.gust/(m==='pogo'?110:150));
      for(const e of ents){if(e.state==='dead'||e===boss||e.team===2)continue;const res=e===player&&(e.state==='block'||e.state==='dodge')?.3:1;e.x+=MOD.dir*k*res;if(m==='pogo')e.y+=Math.sin(MOD.t*.3+e.x)*.4;}
      if(m==='viento'&&tick%3===0)parts.push({k:'deb',x:cam.x+(MOD.dir>0?-10:W+10),y:rnd(150,250),vx:MOD.dir*rnd(4,7),vy:rnd(-.6,.6),t:0,max:90,c:Math.random()<.5?'#a8863a':'#6a8a3a',w:3,h:2});}}
  if(m==='apagon'){if(MOD.t%600===0){MOD.dark=150;floatTxt(player.x,player.y-90,'¡SE CORTÓ LA LUZ!','#9fc4ff');}if(MOD.dark>0)MOD.dark--;}
  if(m==='flash'&&MOD.t%240===0)flashT=Math.max(flashT,4);}
function modDraw(){const m=modOf();if(state!=='play'&&state!=='cut')return;if(!player)return;
  const dark=m==='noche'?0:(m==='apagon'&&MOD.dark>0?(MOD.dark%40<4?.2:.8):0);if(!dark)return;
  if(!modDraw.c){modDraw.c=document.createElement('canvas');modDraw.c.width=W;modDraw.c.height=H;}
  const c=modDraw.c,g=c.getContext('2d');g.globalCompositeOperation='source-over';g.clearRect(0,0,W,H);g.fillStyle='rgba(4,4,14,'+dark+')';g.fillRect(0,34,W,H-34);
  g.globalCompositeOperation='destination-out';const px=player.x-cam.x,py=player.y-34-(player.z||0);
  const r=g.createRadialGradient(px,py,8,px,py,m==='noche'?140:70);r.addColorStop(0,'rgba(0,0,0,1)');r.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=r;g.fillRect(0,0,W,H);
  if(m==='noche'){for(const l of LAMPS){const lx=l.x+8-cam.x;if(lx<-80||lx>W+80)continue;const r2=g.createRadialGradient(lx,190,4,lx,190,70);r2.addColorStop(0,'rgba(0,0,0,.9)');r2.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=r2;g.fillRect(lx-80,100,160,170);}
    if(hazard&&hazard.x!=null){const hx=hazard.x-cam.x;const r3=g.createRadialGradient(hx,215,4,hx,215,90);r3.addColorStop(0,'rgba(0,0,0,.95)');r3.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=r3;g.fillRect(hx-100,120,200,150);}}
  ctx.drawImage(c,0,0);}

// v15: lo que él contaba en entrevistas, capítulo por capítulo (datos de la investigación; diálogos parafraseados)
const DATOS=[
 ['De pibe ayudaba a su viejo, que tenía una verdulería y un galpón de papas junto a la casa.','Su vieja tenía sangre tehuelche, y él lo decía con orgullo.','Su primera banda fue Alarma, con amigos de Caseros, antes de Comunión Humana y V8.','Iba con el viejo en el camión al Abasto a buscar fruta y verdura.'],
 ['V8 lo fundó con Ricardo "Chofa" Moreno, en 1979.','Antes pasó por bandas como Alarma y Comunión.','En 1984 contó que la guitarra criolla no se escuchaba arriba del ruido de un motor, y por eso usaba un equipo enorme.'],
 ['Pappo ponía una condición: si querían a Riff, tenían que llevar también a V8 y a Los Violadores.','Antes del festival la policía los demoró unas dos horas.','"Luchando por el metal" salió en 1983, con Pappo de invitado.'],
 ['Al principio la banda se llamó Helvética.','El Cubo de Recoleta fue gratis y al aire libre. Al otro día tocaron en el pub Helloween de San Martín.','Él tocaba el bajo y escribía las letras; la voz era de Claudio O\'Connor.'],
 ['En 1990 editaron el EP "Intérpretes", con una versión de "Cambalache".','En 1992 abrieron para Black Sabbath y Motörhead en Obras.','Hermética se separó en diciembre de 1994; su último show fue el 18 de diciembre en Mar del Plata.'],
 ['El Monsters of Rock en River fue a comienzos de septiembre de 1994.','"Ácido argentino" salió a fines de 1991.','El 12 de noviembre de 1994 recibieron el disco de oro en Obras.'],
 ['Almafuerte se llama así por el poeta Pedro Bonifacio Palacios, que firmaba con ese nombre.','En 1997 grabó "Peso argento" con el Sr. Flavio de Los Fabulosos Cadillacs.','"Mundo guanaco" salió en junio de 1995, con Iorio en voz y bajo, Marciello en guitarra y Cardaci en batería.'],
 ['Almafuerte versionaba tangos y folclore: Gardel, Troilo, Larralde.','Entre sus influencias criollas estaba José Larralde, de quien versionó "De los pagos del tiempo".','Hacia 2002 dejó el bajo por una tendinitis y se dedicó a cantar.'],
 ['Se definía como un hombre de tierra adentro.','Beto Casella fue su amigo y lo entrevistó varias veces en televisión.','Vivía en Coronel Suárez, lejos del ruido de la ciudad.'],
 ['En 2023 estaba de gira por el país con "Unas estrofas más".','La gira pasó por Trelew en septiembre de 2023. Iorio murió el 24 de octubre de 2023, en Coronel Suárez.','Beto Casella, su amigo, lo entrevistó varias veces en la tele.']];
let datoT=0,datoI=0,dato=null;
// Jefe final: un recuadro con el título de un tema que dialoga con la pelea. El texto de la segunda línea es del juego, no es la letra.
let songCap=null,songCapT=0,songCapI=0;
const SONGCAP_L=[['BUITRES','ALMAFUERTE · 1995','Los que quieren alambrar el arroyo dan vueltas sobre el pueblo.'],['DEJA DE ROBAR','HERMÉTICA · 1989','El loteador firma papeles de una tierra que no es suya.'],['COMO LOS BUEYES','ALMAFUERTE · 1995','Se pelea con paciencia, paso a paso y sin aflojar.'],['TORO Y PAMPA','ALMAFUERTE · 2006','La tierra es de quien la camina y la trabaja.']];
const SONGCAP_M=[['MUERE MONSTRUO MUERE','ALMAFUERTE · 2012','El espanto cae y el pueblo vuelve a dormir tranquilo.'],['SENTIR INDIANO','ALMAFUERTE · 1995','La sangre tehuelche de la familia pesa en cada golpe.'],['ZAMBA DE RESURRECCIÓN','ALMAFUERTE · 1995','Después de cada caída, se vuelve a levantar.'],['DESTRUCCIÓN','V8 · 1983','Volumen al máximo contra el bicho.']];
function songCapTick(){const on=LV&&LV.final&&boss&&!boss.gone&&boss.hp>0;
  if(on){songCapT++;if(songCapT%540===90){const L=boss.D.monster?SONGCAP_M:SONGCAP_L;songCap={c:L[songCapI++%L.length],t:330};}}else{songCapT=0;if(!boss||boss.gone)songCap=null;}
  if(songCap&&--songCap.t<=0)songCap=null;}
function songCapDraw(){if(!songCap||state!=='play')return;const [a,b,c]=songCap.c,k=songCap,al=Math.min(1,k.t/20,(330-k.t)/20);ctx.globalAlpha=al;
  const w=232,x0=W/2-w/2,y0=76;ctx.fillStyle='rgba(10,8,14,.88)';ctx.fillRect(x0,y0,w,32);ctx.fillStyle='#e2462c';ctx.fillRect(x0,y0,3,32);
  txt('♫ '+a,W/2+1,y0+4,'#f2b632',6,'center');txt(b,W/2+1,y0+13,'#9b8aa3',4,'center');txt(c,W/2+1,y0+22,'#efe4d2',4,'center');ctx.globalAlpha=1;}
function datoTick(){loroTick();discoTick();bajoTick();albumTick();guiTick();if(state!=='play'){return;}songCapTick();datoT++;if(datoT%2400===420){const L=DATOS[lvl]||[];if(L.length){const fs=nextFact(L);if(fs)dato={s:fs,t:420};}}if(dato&&--dato.t<=0)dato=null;}
function datoDraw(){songCapDraw();if(!dato||state!=='play')return;if(banner){return;}const a=Math.min(1,dato.t/30,(420-dato.t)/20);ctx.globalAlpha=a;
  const lines=wrapTxt(dato.s,46);const h=16+lines.length*10,y0=H-h-22;ctx.fillStyle='rgba(10,8,14,.86)';ctx.fillRect(W/2-150,y0,300,h);ctx.fillStyle='#f2b632';ctx.fillRect(W/2-150,y0,3,h);
  txt('¿SABÍAS QUE...?',W/2-142,y0+4,'#f2b632',6);lines.forEach((l,i)=>txt(l,W/2-142,y0+15+i*10,'#efe4d2',6));ctx.globalAlpha=1;}
function wrapTxt(s,n){const w=s.split(' '),out=[];let c='';for(const x of w){if((c+' '+x).trim().length>n){out.push(c.trim());c=x;}else c+=' '+x;}if(c.trim())out.push(c.trim());return out;}
// el campo: jaulas con pájaros, pileta, parrilla, fogón criollo, asado a la cruz y camino de ripio
function extraBG(cv,i){if(i<8)return;const g=cv.getContext('2d');g.save();g.setTransform(RS,0,0,RS,0,0);const R=(x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(x,y,w,h);};
  const xs=i===9?[640,1240,2050]:[560,1500];
  for(const x of xs){R(x,150,2,26,'#3a2a1a');R(x+30,150,2,26,'#3a2a1a');R(x-4,128,40,4,'#5a4a3a');g.strokeStyle='rgba(200,200,190,.8)';g.lineWidth=.5;
    for(let k=0;k<=8;k++){g.beginPath();g.moveTo(x-2+k*4.5,132);g.lineTo(x-2+k*4.5,152);g.stroke();}g.beginPath();g.moveTo(x-2,152);g.lineTo(x+34,152);g.stroke();
    const cols=['#f2d22a','#4fa04a','#e04a2a','#5aa0e8','#f2f2f2'];for(let k=0;k<5;k++){g.fillStyle=cols[k];g.beginPath();g.ellipse(x+3+k*7,140+(k%2)*5,2.4,1.7,0,0,7);g.fill();g.fillStyle='#1a1a1a';g.fillRect(x+4.5+k*7,139+(k%2)*5,.8,.8);}}
  if(i===9){const x=1500;R(x,166,60,8,'#d8d2c6');R(x+2,167,56,5,'#4aa0c8');R(x+4,168,20,1,'rgba(255,255,255,.6)');
    R(x+80,146,26,22,'#8a4a32');for(let k=0;k<4;k++)R(x+80,146+k*6,26,1,'#6a3622');R(x+82,140,22,4,'#2a2a2e');for(let k=0;k<6;k++)R(x+83+k*3.6,138,1,3,'#5a5a62');
    g.fillStyle='rgba(200,200,210,.25)';for(let k=0;k<4;k++){g.beginPath();g.ellipse(x+93+k*2,128-k*8,4+k*2,3+k,0,0,7);g.fill();}}
  // fogón criollo con asado a la cruz en Sierra de la Ventana / Coronel Suárez
  const fx=i===10?1020:i===8?1120:860;
  R(fx-12,174,24,4,'#2a1810');for(let k=0;k<5;k++){g.fillStyle=k%2?'#c84420':'#e88424';g.beginPath();g.arc(fx-8+k*4,171,3,0,7);g.fill();}
  // cruz de hierro del asado
  g.strokeStyle='#4a464c';g.lineWidth=1.5;g.beginPath();g.moveTo(fx,174);g.lineTo(fx+4,142);g.moveTo(fx-6,152);g.lineTo(fx+12,154);g.moveTo(fx-4,162);g.lineTo(fx+10,164);g.stroke();
  g.fillStyle='#7a321e';g.beginPath();g.ellipse(fx+3,154,6,12,.1,0,7);g.fill();
  // mástil con bandera argentina flameando en Coronel Suárez
  if(i===10){const mx=1750;R(mx,68,2,106,'#a8b0b8');g.fillStyle='#75aadb';R(mx+2,70,24,6);R(mx+2,80,24,6);g.fillStyle='#f4f6f8';R(mx+2,76,24,5);
    g.fillStyle='#f2b632';g.beginPath();g.arc(mx+14,78.5,2,0,7);g.fill();}
  {const ux=i===9?1950:1150,uy=34;const gl=g.createRadialGradient(ux,uy+8,2,ux,uy+40,46);gl.addColorStop(0,'rgba(160,255,200,.35)');gl.addColorStop(1,'rgba(160,255,200,0)');g.fillStyle=gl;g.beginPath();g.moveTo(ux-10,uy+6);g.lineTo(ux+10,uy+6);g.lineTo(ux+30,uy+70);g.lineTo(ux-30,uy+70);g.fill();
    g.fillStyle='#8a929a';g.beginPath();g.ellipse(ux,uy,26,6,0,0,7);g.fill();g.fillStyle='#c8d0d8';g.beginPath();g.ellipse(ux,uy-1,26,3,0,0,7);g.fill();g.fillStyle='rgba(160,230,255,.8)';g.beginPath();g.ellipse(ux,uy-5,10,6,0,Math.PI,0);g.fill();
    for(let k=0;k<5;k++){g.fillStyle=k%2?'#ffd27a':'#7aff9a';g.fillRect(ux-18+k*9,uy+1,2,2);}}
  for(let k=0;k<(cv.width/RS)/6;k++){g.fillStyle=k%3?'rgba(120,110,100,.35)':'rgba(220,210,190,.25)';g.fillRect(hsh(k,31)*cv.width/RS,180+hsh(k,32)*80,1.5,1);}
  g.restore();}
function render(){render0();ctx.setTransform(RS,0,0,RS,0,0);modDraw();datoDraw();lmDraw();}
function render0(){
  ctx.setTransform(RS,0,0,RS,0,0);ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
  if(state==='title'){drawTitle();return;}
  if(state==='card'){drawCard();return;}if(state==='cine'){drawCine();return;}if(state==='show'){drawShow();return;}if(state==='album'){drawAlbum();return;}
  if(state==='ending'){drawEnding();return;}
  const sx=shake>0?Math.round(rnd(-shake,shake)):0,sy=shake>0?Math.round(rnd(-shake,shake)):0;
  ctx.save();ctx.translate(sx,sy);drawWorld();ctx.restore();grade();nostalgia();climaLabel();controlTip();hurtVig();ctx.save();ctx.translate(sx,sy);drawParts();BUBR.a.length=0;for(const b of bubbles)drawBubble(b);ctx.restore();
  if(flashT>0){ctx.fillStyle='rgba(255,250,235,'+(flashT/12).toFixed(2)+')';ctx.fillRect(0,0,W,H);}
  if(slowT>0){ctx.fillStyle='rgba(120,20,16,.18)';ctx.fillRect(0,0,W,H);}
  if(state==='cut'||state==='intro'){ctx.fillStyle='#000';ctx.fillRect(0,0,W,14);ctx.fillRect(0,H-6,W,6);}
  if(state!=='intro'&&state!=='cut'&&state!=='results')drawHUD();
  if(state==='cut')drawCut();
  if(state==='pause'){drawPause();return;}
  if(state==='gameover'){
    ctx.fillStyle='rgba(8,6,11,.88)';ctx.fillRect(0,0,W,H);
    const rg=ctx.createRadialGradient(W/2,H/2,10,W/2,H/2,190);
    rg.addColorStop(0,'rgba(180,26,20,.42)');rg.addColorStop(1,'rgba(0,0,0,.75)');
    ctx.fillStyle=rg;ctx.fillRect(0,0,W,H);
    txt('¡ÚLTIMA OPORTUNIDAD!',W/2,26,'#f2b632',15,'center');
    txt('¿QUERÉS RESUCITAR?',W/2,44,'#ff4a3a',9.5,'center');
    const pulse=1+Math.sin(tick*.15)*.12;
    for(let i=0;i<3;i++){drawHeart(W/2-32+i*32,68,true,2.4*pulse);}
    txt('3 CORAZONES RESTAURADOS',W/2,98,'#f8e6a0',6.5,'center');
    txt('"El metal pesado nunca muere. Levantate y seguí peleando."',W/2,110,'#d8cfc0',5.5,'center');
    txt(LV.chap+' · '+LV.title+'   |   PUNTAJE: '+String(score).padStart(7,'0'),W/2,122,'#8a7a8e',5,'center');
    const bx=W/2-115,by=136,bw=230,bh=36;
    const btnOn=(tick%40<26);
    ctx.fillStyle=btnOn?'#c8241c':'#941612';ctx.fillRect(bx,by,bw,bh);
    ctx.strokeStyle='#f2b632';ctx.lineWidth=2;ctx.strokeRect(bx,by,bw,bh);
    txt('♥  TOCÁ ACÁ PARA RESUCITAR  ♥',W/2,by+7,'#fff',8,'center');
    txt(coarse?'TOCÁ ACÁ PARA RESUCITAR':'ENTER / ESPACIO / Z: RESUCITAR',W/2,by+20,'#f8e6a0',5,'center');
    const mx=W/2-95,my=180,mw=190,mh=22;
    ctx.fillStyle='rgba(26,20,30,.92)';ctx.fillRect(mx,my,mw,mh);
    ctx.strokeStyle='#ff4a3a';ctx.lineWidth=1.2;ctx.strokeRect(mx,my,mw,mh);
    txt('🏠 VOLVER AL MENÚ (ESC / M)',W/2,my+6,'#ff6a5a',6.5,'center');
    txt('O ESPERÁ PARA VOLVER AUTOMÁTICAMENTE',W/2,212,'#7a6a7e',4.5,'center');
  }
  if(state==='results')drawResults();
}
function drawPause(){
  ctx.fillStyle='rgba(6,4,9,.82)';ctx.fillRect(0,0,W,H);
  const px=W/2-115,py=40,pw=230,ph=170;
  ctx.fillStyle='rgba(16,12,20,.95)';ctx.fillRect(px,py,pw,ph);
  ctx.strokeStyle='#e2462c';ctx.lineWidth=2;ctx.strokeRect(px,py,pw,ph);
  txt('PAUSA',W/2,py+10,'#f2b632',14,'center');
  txt(LV.chap+' · '+LV.title,W/2,py+28,'#efe4d2',6.5,'center');
  txt(LV.place,W/2,py+38,'#9b8aa3',5,'center');
  const by1=py+48;
  ctx.fillStyle='rgba(30,24,36,.92)';ctx.fillRect(px+16,by1,pw-32,22);
  ctx.strokeStyle='#f2b632';ctx.lineWidth=1.2;ctx.strokeRect(px+16,by1,pw-32,22);
  txt('► CONTINUAR (ENTER / II)',W/2,by1+6,'#fff',7,'center');
  const by2=py+76;
  ctx.fillStyle='rgba(30,24,36,.92)';ctx.fillRect(px+16,by2,pw-32,22);
  ctx.strokeStyle='#e2462c';ctx.lineWidth=1;ctx.strokeRect(px+16,by2,pw-32,22);
  txt('⟳ REINICIAR CAPÍTULO (R)',W/2,by2+6,'#efe4d2',6.5,'center');
  const by3=py+104;
  ctx.fillStyle='rgba(42,16,18,.94)';ctx.fillRect(px+16,by3,pw-32,22);
  ctx.strokeStyle='#ff4a3a';ctx.lineWidth=1.3;ctx.strokeRect(px+16,by3,pw-32,22);
  txt('🏠 VOLVER AL MENÚ (ESC / M)',W/2,by3+6,'#ff6a5a',7,'center');
  txt(DIFFS[diff].name+' · '+DIFFS[diff].tag,W/2,py+138,DIFFS[diff].col,5,'center');
  txt('G: ÁLBUM DE FIGURITAS',W/2,py+148,'#7a6a7e',4.5,'center');
}

// v32: personajes más definidos y golpes con efecto.
// Personajes: contorno de tinta, luz de borde del color de cada escenario, menos ruido sobre la ropa negra
// y destello blanco al recibir. Golpes: estrella de impacto, rayas de velocidad, gotitas, temblor del golpeado,
// onomatopeyas de historieta, polvo y onda al caer, y borde rojo cuando le pegan a Ricardo.
const RIMC=['#ffcf8a','#8fb4ff','#ff8a70','#ffd9a0','#a8c4e0','#e8f0ff','#ff9ad0','#ffb070','#ffc890','#b0c8ff','#ffe0a0'];
const RIML=[[-1,-1],[1,-1],[0,-1],[-1,-1],[1,-1],[0,-1],[-1,-1],[1,-1],[-1,-1],[1,-1],[-1,-1]];
// las máscaras se calculan a media resolución: el borde queda igual de nítido en pantalla y cuesta la cuarta parte
const SILC=document.createElement('canvas'),SILX=SILC.getContext('2d'),RIMCV=document.createElement('canvas'),RIMX=RIMCV.getContext('2d'),OUTC=document.createElement('canvas'),OUTX=OUTC.getContext('2d');
function fxCanvas(w,h){for(const c of [SILC,RIMCV,OUTC])if(c.width!==w||c.height!==h){c.width=w;c.height=h;}}
// si la compu o el celular no llegan a mover el juego fluido, se apagan el contorno y la luz de borde
let FXQ=1,fxT0=0,fxAcc=0,fxN=0,fxTk=-1;
function fxPerf(){if(tick===fxTk)return;fxTk=tick;const n=performance.now(),dt=n-fxT0;fxT0=n;if(state!=='play'||dt>200||!FXQ)return;
  fxAcc+=dt;if(++fxN>=180){if(fxAcc/fxN>27)FXQ=0;fxAcc=0;fxN=0;}}
function drawPuppetLit(e,X,Y){fxPerf();const sv=ctx,g=PCX,ox=PCW/2,oy=PCH-30,sc=e.st.scale||1;
  if(e.jit>0){X+=(e.jit%2?1.6:-1.6)*(e.jit>3?1:.5);e.jit--;}
  g.setTransform(1,0,0,1,0,0);g.globalCompositeOperation='source-over';g.clearRect(0,0,PC.width,PC.height);g.setTransform(RS*PSK,0,0,RS*PSK,RS*ox*(1-PSK),RS*oy*(1-PSK));
  ctx=g;OW=.42;OUTP='rgba(14,10,12,.78)';try{drawPuppet(e,ox,oy);}finally{ctx=sv;OW=1;OUTP=OUT;}
  if(!e.flash){g.globalCompositeOperation='source-atop';const top=oy-95*sc;
    const v=g.createLinearGradient(0,top,0,oy);v.addColorStop(0,'rgba(255,236,206,.2)');v.addColorStop(.35,'rgba(255,236,206,.03)');v.addColorStop(.7,'rgba(0,0,0,.06)');v.addColorStop(1,'rgba(0,0,0,.3)');g.fillStyle=v;g.fillRect(0,0,PCW,PCH);
    const f=e.face||1,h=g.createLinearGradient(ox-26*sc*f,0,ox+26*sc*f,0);h.addColorStop(0,'rgba(0,0,0,.22)');h.addColorStop(.5,'rgba(0,0,0,0)');h.addColorStop(1,'rgba(255,240,215,.1)');g.fillStyle=h;g.fillRect(0,0,PCW,PCH);
    g.save();g.setTransform(1,0,0,1,0,0);g.globalAlpha=.4;g.fillStyle=PGRAIN(g);g.fillRect(0,0,PC.width,PC.height);g.restore();
    g.globalCompositeOperation='source-over';}
  if(!FXQ){ctx.drawImage(PC,X-ox,Y-oy,PCW,PCH);return;}
  // solo la zona donde está el muñeco, para no procesar todo el lienzo
  const bw=Math.min(PCW,150*sc*PSK),bh=Math.min(PCH,(PCH-30)*.98),lx=ox-bw/2,ly=PCH-bh,sw=Math.round(bw*RS),sh=Math.round(bh*RS),sx=Math.round(lx*RS),sy=Math.round(ly*RS);
  const hw=Math.ceil(sw/2),hh=Math.ceil(sh/2);fxCanvas(hw,hh);const dx=X-ox+lx,dy=Y-oy+ly;
  // silueta en tinta: contorno que despega al personaje del fondo
  SILX.globalCompositeOperation='source-over';SILX.clearRect(0,0,hw,hh);SILX.drawImage(PC,sx,sy,sw,sh,0,0,hw,hh);
  SILX.globalCompositeOperation='source-in';SILX.fillStyle='#06040a';SILX.fillRect(0,0,hw,hh);SILX.globalCompositeOperation='source-over';
  OUTX.clearRect(0,0,hw,hh);for(const [ax,ay] of [[-1,0],[1,0],[0,-1],[0,1]])OUTX.drawImage(SILC,ax,ay);
  // todo se compone en el lienzo del muñeco y se pega una sola vez en pantalla
  g.setTransform(1,0,0,1,0,0);
  // luz de borde del lado de donde viene la luz del escenario
  if(!e.flash&&state!=='cine'){const L=RIML[lvl]||[-1,-1],c=RIMC[lvl]||'#ffd9a0',o=1.2;
    RIMX.globalCompositeOperation='source-over';RIMX.clearRect(0,0,hw,hh);RIMX.drawImage(SILC,0,0);
    RIMX.globalCompositeOperation='destination-out';RIMX.drawImage(SILC,-L[0]*o,-L[1]*o);
    RIMX.globalCompositeOperation='source-in';RIMX.fillStyle=c;RIMX.fillRect(0,0,hw,hh);RIMX.globalCompositeOperation='source-over';
    g.globalCompositeOperation='source-atop';g.globalAlpha=.55;g.drawImage(RIMCV,sx,sy,sw,sh);}
  // destello blanco al recibir el golpe
  if(e.flash>0){SILX.globalCompositeOperation='source-in';SILX.fillStyle='#fff8ec';SILX.fillRect(0,0,hw,hh);SILX.globalCompositeOperation='source-over';
    g.globalCompositeOperation='source-atop';g.globalAlpha=.22+.08*e.flash;g.drawImage(SILC,sx,sy,sw,sh);}
  // contorno de tinta por detrás: despega al personaje del fondo
  g.globalCompositeOperation='destination-over';g.globalAlpha=.9;g.drawImage(OUTC,sx,sy,sw,sh);g.globalAlpha=1;g.globalCompositeOperation='source-over';
  ctx.drawImage(PC,sx,sy,sw,sh,dx,dy,bw,bh);}

const ONO_S=['¡PAF!','¡PUM!','¡ZAS!','¡PLAF!','¡PIÑA!','¡TOMÁ!'],ONO_B=['¡CATAPLUM!','¡KRAK!','¡BOOM!','¡PATADÓN!'],ONO_W=['¡CLONK!','¡CLANG!'];
let hurtV=0,onoLast=-99;
function hitFx(a,t,mv,x,y,big){const dir=a.face||1,byP=a===player||a.thrownBy===player,spec=a.mname==='spec'||mv===MOVES.spec;big=big||t.hp<=0;
  const col=byP?'255,214,70':'255,80,60';
  parts.push({k:'impact',x,y,t:0,max:big?13:9,big,dir,col,rot:rnd(0,6.3)});
  parts.push({k:'streak',x,y,t:0,max:big?10:7,dir,n:big?8:5,seed:rnd(0,99),col});
  for(let i=0;i<(big?6:3);i++)parts.push({k:'deb',x,y:y+rnd(-4,4),vx:dir*rnd(1,3.4),vy:rnd(-3,-.6),t:0,max:24,c:i%2?'#eaf2ff':'#c9d8f0',w:2,h:2});
  if(spec)for(let i=0;i<5;i++)parts.push({k:'zap',x,y,t:0,max:12,a:rnd(0,6.3),len:rnd(16,30),seed:rnd(0,99)});
  t.jit=big?10:6;
  if(t===player){hurtV=big?16:10;}
  if(big&&byP){parts.push({k:'ring',x,y,t:0,max:14,r:30});shake=Math.max(shake,5);}
  if(byP&&tick-onoLast>26&&(big||spec||combo%3===0||Math.random()<.2)){onoLast=tick;
    const s=spec?'¡BAJAZO!':mv.weapon?pick(ONO_W):big?pick(ONO_B):pick(ONO_S);
    parts.push({k:'ono',x:x+dir*16,y:y-30,s,t:0,max:30,rot:rnd(-.2,.2),big:big||spec});}}
// al caer: polvo, onda contra el piso y un sacudón
function landFx(f){parts.push({k:'gring',x:f.x,y:f.y,t:0,max:16,r:(f.D&&f.D.boss)?46:30});dust(f.x-10,f.y,4);dust(f.x+10,f.y,4);
  if(f.team===1&&f.hp<=0&&tick-onoLast>26)parts.push({k:'ono',x:f.x,y:f.y-40,s:'¡PLAF!',t:0,max:26,rot:rnd(-.2,.2),big:false});}
function starPath(g,x,y,r1,r2,n,rot){g.beginPath();for(let i=0;i<n*2;i++){const r=i%2?r2:r1,a=rot+i*Math.PI/n;g.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r);}g.closePath();}
function fxDraw(p,X,k){
  if(p.k==='impact'){const pop=k<.25?k/.25:1-(k-.25)/.75*.6,R=(p.big?18:11)*pop;
    ctx.globalCompositeOperation='lighter';ctx.globalAlpha=1-k;ctx.drawImage(glow('rgb('+p.col+')'),X-R*2,p.y-R*2,R*4,R*4);ctx.globalCompositeOperation='source-over';
    starPath(ctx,X,p.y,R,R*.42,p.big?10:8,p.rot);ctx.fillStyle='rgba('+p.col+','+(1-k*.8).toFixed(2)+')';ctx.fill();
    starPath(ctx,X,p.y,R*.6,R*.26,p.big?10:8,p.rot+.3);ctx.fillStyle='rgba(255,255,250,'+(1-k).toFixed(2)+')';ctx.fill();ctx.globalAlpha=1;return true;}
  if(p.k==='streak'){ctx.strokeStyle='rgba('+p.col+','+(1-k).toFixed(2)+')';ctx.lineCap='round';
    for(let i=0;i<p.n;i++){const a=(hsh(p.seed,i)-.5)*1.3,l=10+hsh(p.seed+1,i)*16,d0=6+k*18,dx=Math.cos(a)*p.dir,dy=Math.sin(a);
      ctx.lineWidth=(p.big?2:1.4)*(1-k)+.4;ctx.beginPath();ctx.moveTo(X+dx*d0,p.y+dy*d0);ctx.lineTo(X+dx*(d0+l*(1-k*.5)),p.y+dy*(d0+l*(1-k*.5)));ctx.stroke();}
    ctx.lineCap='butt';return true;}
  if(p.k==='zap'){ctx.strokeStyle='rgba(170,220,255,'+(1-k).toFixed(2)+')';ctx.lineWidth=1.2;ctx.beginPath();let x=X,y=p.y;ctx.moveTo(x,y);
    for(let i=1;i<=4;i++){const d=p.len*i/4;x=X+Math.cos(p.a)*d+(hsh(p.seed+tick,i)-.5)*7;y=p.y+Math.sin(p.a)*d+(hsh(p.seed,i+tick)-.5)*7;ctx.lineTo(x,y);}ctx.stroke();return true;}
  if(p.k==='gring'){ctx.strokeStyle='rgba(230,220,200,'+(.7*(1-k)).toFixed(2)+')';ctx.lineWidth=2*(1-k)+.5;ctx.beginPath();ctx.ellipse(X,p.y,p.r*(.3+k),p.r*(.3+k)*.28,0,0,7);ctx.stroke();return true;}
  if(p.k==='ono'){const pop=k<.15?.5+k/.15*.6:k<.3?1.1-(k-.15)/.15*.1:1,a=k>.7?1-(k-.7)/.3:1,sz=p.big?7:6;
    ctx.save();ctx.translate(X,p.y-k*8);ctx.rotate(p.rot);ctx.scale(pop,pop);ctx.globalAlpha=a;ctx.font=sz+'px '+FONT;
    const s=U(p.s),w=ctx.measureText(s).width;ctx.save();ctx.scale(1,.62);starPath(ctx,0,sz*.3,w*.56+5,w*.44+3,11,p.rot*3);ctx.fillStyle='#0a080d';ctx.fill();
    starPath(ctx,0,sz*.3,w*.56+3.5,w*.44+1.5,11,p.rot*3);ctx.fillStyle=p.big?'#ffe14a':'#fff3c8';ctx.fill();ctx.restore();
    ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#0a080d';for(const [ox,oy] of [[-1,0],[1,0],[0,-1],[0,1],[1,1]])ctx.fillText(s,ox,sz*.2+oy);
    ctx.fillStyle=p.big?'#d2241a':'#e2462c';ctx.fillText(s,0,sz*.2);ctx.restore();return true;}
  return false;}
// borde rojo cuando le pegan a Ricardo
function hurtVig(){if(hurtV<=0)return;const a=hurtV/16;hurtV--;const g=ctx.createRadialGradient(W/2,H/2,H*.35,W/2,H/2,W*.62);
  g.addColorStop(0,'rgba(200,20,20,0)');g.addColorStop(1,'rgba(200,20,20,'+(.45*a).toFixed(2)+')');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);}

// v33: Ricardio más parecido al real, época por época, mirando las fotos de referencia (sin copiar ninguna).
// De pibe: cara larga y flaca, pómulos marcados, mejillas hundidas, nariz larga con caballete, labios finos y
// melena oscura con raya al medio: ondulada en Hermética, más enrulada y con volumen en V8.
// Desde Almafuerte se ensancha: cara llena, cuello grueso, papada y cachetes caídos de grande.
(()=>{const E={ric1:{thin:.95,fat:0,wave:.55,vol:.35,len:9},ricV:{thin:.95,fat:0,wave:1.3,vol:1.15,len:12,curly:true},ric2:{thin:.85,fat:0,wave:1.35,vol:1.3,len:15,curly:true},
  ricH:{thin:.75,fat:0,wave:.9,vol:.85,len:18,curly:false},ric3:{thin:.6,fat:.05,wave:.9,vol:.9,len:21},ricM:{thin:.5,fat:.1,wave:.85,vol:.95,len:21},
  ricA:{hair:'crest',thin:0,fat:.4,len:0},ric4:{hair:'crest',thin:0,fat:.55,len:0},ricT:{hair:'crest',thin:0,fat:.8,len:0},ric5:{hair:'crest',thin:0,fat:1,len:0}};
  for(const k in E)if(STY[k]&&STY[k].ior)Object.assign(STY[k].ior,E[k]);
  // siempre el corte cresta (mohawk) desde Mundo Guanaco (Almafuerte 1995) hasta el final
  if(STY.ricA)Object.assign(STY.ricA.ior,{hair:'crest',hairC:'#18110c',hi:'#3c2c20',gray:0,len:0});
  if(STY.ric4)Object.assign(STY.ric4.ior,{hair:'crest',hairC:'#1a130e',hi:'#46362a',gray:.2,len:0});
  if(STY.ricT)Object.assign(STY.ricT.ior,{hair:'crest',hairC:'#2e2824',hi:'#7a7068',gray:.4,len:0});
  if(STY.ric5)Object.assign(STY.ric5.ior,{hair:'crest',hairC:'#8a847e',hi:'#e8e4dc',gray:1,len:0});
})();
function drawIorioPortrait(st,x,y,sz){const I=st.ior,g=ctx,u=sz/40,sk=st.skin;g.save();g.translate(x,y);g.scale(u,u);g.lineJoin='round';g.lineCap='round';
  const P=(pts,c)=>{g.fillStyle=c;g.beginPath();g.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++){const p=pts[i];if(p.length===4)g.quadraticCurveTo(p[0],p[1],p[2],p[3]);else if(p.length===6)g.bezierCurveTo(p[0],p[1],p[2],p[3],p[4],p[5]);else g.lineTo(p[0],p[1]);}g.closePath();g.fill();};
  const S=(pts,c,w)=>{g.strokeStyle=c;g.lineWidth=w;g.beginPath();g.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++){const p=pts[i];if(p.length===4)g.quadraticCurveTo(p[0],p[1],p[2],p[3]);else g.lineTo(p[0],p[1]);}g.stroke();};
  const Ell=(cx,cy,rx,ry,c,r)=>{g.fillStyle=c;g.beginPath();g.ellipse(cx,cy,rx,ry,r||0,0,7);g.fill();};
  const hair=I.hair||'long',hc=I.hairC||'#1a120c',hi=I.hi||shade(hc,1.8),age=I.gray>=1?2:I.gray?1:0,thin=I.thin||0,fat=I.fat||0,len=(I.len||0)*1.25,hd=shade(hc,.55);
  const dk=shade(sk,.7),dd=shade(sk,.52),lt=shade(sk,1.14);
  const W=9.4-thin*1.3+fat*1.9,CH=30.9+thin*1.3-fat*.3,JW=thin?3.4:4.6+fat*2.6; // media cara, mentón, ancho de mandíbula
  const wavy=(x1,y1,x2,y2,n,a,ph)=>{const o=[];const dx=x2-x1,dy=y2-y1,l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l;for(let k=0;k<n;k++){const tc=(k+.5)/n,te=(k+1)/n;const wc=Math.sin((tc*n+ph)*Math.PI)*a,we=Math.sin((te*n+ph)*Math.PI)*a;o.push([x1+dx*tc+nx*wc,y1+dy*tc+ny*wc,x1+dx*te+nx*we,y1+dy*te+ny*we]);}return o;};
  // hombros y ropa por época (remera negra, campera de cuero con tachas, musculosa con la H, remera Cruz Pampa o camisa/guardapolvo de campo)
  {const top=st.top||'#141317',gr=g.createLinearGradient(0,29,0,44);gr.addColorStop(0,shade(top,1.5));gr.addColorStop(1,shade(top,.8));const sh=fat*1.6;
   P([[-1,44],[1,37-sh*.4],[3,33-sh*.5,9,31.4-sh*.6],[15,29.6],[25,29.6],[31,31.4-sh*.6],[37,33-sh*.5,39,37-sh*.4],[41,44]],gr);
   P([[3,36],[8,32],[13,31],[9,34],[5,38]],'rgba(255,255,255,.07)');
   if(st.logo==='H'){S([[15.8,31.5],[20,36.2,24.2,31.5]],'#c8c4bc',.4);
     g.strokeStyle='#f2b632';g.lineWidth=.55;g.beginPath();g.arc(20,39.5,3.2,0,7);g.stroke();
     g.fillStyle='#f2b632';g.fillRect(18.2,37.5,.8,4);g.fillRect(21,37.5,.8,4);g.fillRect(18.2,39.1,3.6,.8);}
   if(st.logo==='pampa'){const lx=20,ly=39.2;g.fillStyle='#e2b638';g.fillRect(lx-.9,ly-3,1.8,6);g.fillRect(lx-3,ly-.9,6,1.8);g.fillRect(lx-1.9,ly-1.9,3.8,3.8);g.fillStyle='#b82e24';g.fillRect(lx-.7,ly-.7,1.4,1.4);}
   if(st.leather||st.jacket){P([[5,44],[8.6,34.4],[15.6,30.6],[18.8,44]],shade(top,1.95));P([[35,44],[31.4,34.4],[24.4,30.6],[21.2,44]],shade(top,1.95));
     S([[15.6,30.6],[17.4,37.5],[18.8,44]],'rgba(0,0,0,.65)',.55);S([[24.4,30.6],[22.6,37.5],[21.2,44]],'rgba(0,0,0,.65)',.55);S([[9,35],[13,33]],'rgba(255,255,255,.22)',.55);
     S([[30.4,36],[28.6,41]],'rgba(220,220,230,.55)',.45);
     if(st.studs){g.fillStyle='#e4e6ec';for(let k=0;k<5;k++){g.beginPath();g.arc(9.4+k*1.3,36.4+k*1.3,.45,0,7);g.arc(30.6-k*1.3,36.4+k*1.3,.45,0,7);g.fill();}}}
   if(st.coat){P([[6,44],[10,33],[16,30.2],[19,44]],shade(top,1.35));P([[34,44],[30,33],[24,30.2],[21,44]],shade(top,1.35));
     S([[10,38],[15,38]],shade(top,1.6),.45);S([[25,38],[30,38]],shade(top,1.6),.45);for(let k=0;k<3;k++)Ell(20,34.5+k*3.4,.5,.5,'#6a6872');}
   if(st.buttons){P([[11,33.5],[15.6,30.5],[18.5,35.5],[14,36.5]],shade(top,1.4));P([[29,33.5],[24.4,30.5],[21.5,35.5],[26,36.5]],shade(top,1.4));
     for(let k=0;k<3;k++)Ell(20,34+k*3.6,.48,.48,'#5a5a64');S([[20,31],[20,44]],'rgba(0,0,0,.55)',.45);
     S([[9.5,39.5],[15.5,39.5]],shade(top,1.55),.4);S([[24.5,39.5],[30.5,39.5]],shade(top,1.55),.4);}}
  // melena de atrás: masa oscura con borde ondulado, más ancha cuanto más volumen
  const longH=hair==='long',vol=I.vol||0,wv=I.wave||0;
  if(longH){const ox=W+3.2+vol*3.2,bot=10+len;const gr=g.createLinearGradient(0,3,0,bot);gr.addColorStop(0,shade(hc,1.1));gr.addColorStop(1,hd);
    P([[20,1.4],[20-W-1.6,2.4,20-ox+1,9],...wavy(20-ox+1,9,20-ox-vol*.6,bot,Math.round(4+len/5),.9+wv*.9,.3),...wavy(20-ox-vol*.6,bot,20+ox+vol*.6,bot+1,9,.8+wv*.7,0),...wavy(20+ox+vol*.6,bot,20+ox-1,9,Math.round(4+len/5),.9+wv*.9,.7),[20+W+1.6,2.4,20,1.4]],gr);}
  // cuello: fino con nuez marcada de pibe, grueso con trapecios fuertes de grande
  {const nw=4.6-thin*.6+fat*2.2;P([[20-nw,23],[20-nw-.6,30.8],[20,32.4],[20+nw+.6,30.8],[20+nw,23]],dk);
   Ell(20,25.6,nw,2.6,'rgba(40,16,10,.42)');S([[20-nw+.6,27],[20-nw-.4,31]],'rgba(40,16,10,.32)',.6);S([[20+nw-.6,27],[20+nw+.4,31]],'rgba(40,16,10,.28)',.55);
   if(thin>.4){Ell(20,27.8,1.1,1.3,'rgba(40,16,10,.22)');S([[20.6,27.4],[21,31]],'rgba(40,16,10,.25)',.45);}}
  // orejas (la melena las tapa)
  if(!longH)for(const sx of [-1,1]){const ex=20+sx*(W+.3);Ell(ex,18.6,1.7+fat*.2,3.1,sk,sx*.15);Ell(ex+sx*.2,18.6,.9,2,dk,sx*.15);}
  // cabeza: frente, pómulos altos, mejillas (hundidas o llenas), mandíbula y mentón
  const cb=W+.6+thin*.5,mid=W-thin*1.1+fat*.5;
  const head=[[20,4.4],[20+W-1.2,6.4,20+W+.2,12.6],[20+cb,16.8],[20+mid,21.4,20+JW+1.8,26.4],[20+JW,29.6,20+2.4,CH-.4],[20,CH],[20-2.4,CH-.4],[20-JW,29.6,20-JW-1.8,26.4],[20-mid,21.4,20-cb,16.8],[20-W-.2,12.6],[20-W+1.2,6.4,20,4.4]];
  const headPath=()=>{g.beginPath();g.moveTo(head[0][0],head[0][1]);for(let i=1;i<head.length;i++){const p=head[i];if(p.length===4)g.quadraticCurveTo(p[0],p[1],p[2],p[3]);else g.lineTo(p[0],p[1]);}g.closePath();};
  // papada y cachetes caídos (de grande)
  if(fat>.3){const a=Math.min(1,(fat-.3)/.6);Ell(20,CH+.6,4.2+fat*2,1.6+a*1.2,shade(sk,.86));S([[20-4-fat*1.6,CH+.2],[20,CH+1.6+a*1.1],[20+4+fat*1.6,CH+.2]],'rgba(60,24,14,.38)',.42);}
  {const gr=g.createRadialGradient(16.6,14,1,19,18,14.5);gr.addColorStop(0,lt);gr.addColorStop(.55,sk);gr.addColorStop(1,dk);g.fillStyle=gr;headPath();g.fill();}
  g.save();headPath();g.clip();
   P([[25.4,4],[31,4],[31,34],[22,34],[25.6,26],[27.4,19],[26.6,10]],'rgba(60,24,14,.24)');
   // pómulos marcados y mejilla hundida de pibe
   if(thin){g.globalAlpha=.38+thin*.35;P([[20-W+.4,19.4],[20-5.2,20.6],[20-4.8,26.4],[20-W+1.2,25.6]],'rgba(70,28,16,.34)');P([[20+W-.4,19.4],[20+5.2,20.6],[20+4.8,26.4],[20+W-1.2,25.6]],'rgba(70,28,16,.44)');g.globalAlpha=1;
     Ell(20-6.2,18.2,2.4,1.1,'rgba(255,214,186,.24)',-.2);Ell(20+6.2,18.2,2.2,1,'rgba(255,214,186,.14)',.2);}
   else{P([[11,20.4],[14.4,21.4],[15.6,25.6],[12.6,24.6]],'rgba(70,28,16,.18)');P([[29,20.4],[25.6,21.4],[24.4,25.6],[27.4,24.6]],'rgba(70,28,16,.26)');}
   // cachetes llenos y caídos
   if(fat>.3){Ell(20-W+2.4,26.4,2.4,2.8,'rgba(60,24,14,.16)');Ell(20+W-2.4,26.4,2.4,2.8,'rgba(60,24,14,.22)');S([[20-W+1.6,24],[20-W+2.4,28.6],[20-3.6,CH-.6]],'rgba(60,24,14,.28)',.42);S([[20+W-1.6,24],[20+W-2.4,28.6],[20+3.6,CH-.6]],'rgba(60,24,14,.32)',.42);}
   Ell(20,CH-1.2,3.6,1.3,'rgba(255,230,200,.14)');Ell(20,CH-.5,1.2,.8,'rgba(60,24,14,.16)');Ell(14.4,18.4,2.6,1.6,'rgba(255,190,160,.14)');
   const stub=I.stub||0;if(stub){const sc=I.stubC||shade(hc,.9);g.globalAlpha=Math.min(.44,stub*.92);
     P([[20-W+.4,20],[20-W+1.6,25.4],[17,CH-.4],[20,CH],[23,CH-.4],[20+W-1.6,25.4],[20+W-.4,20],[25,24.8],[23.4,23.4],[20,22.8],[16.6,23.4],[15,24.8]],sc);
     g.globalAlpha=Math.min(.52,stub);for(let k=0;k<170;k++){const px=20+(hsh(k,11)-.5)*2*(W-1),py=21+hsh(k,12)*(CH-21.4);if(Math.abs(px-20)<3.4&&py<25&&py>23.6)continue;g.fillStyle=sc;g.fillRect(px,py,.17,.17);}g.globalAlpha=1;}
  g.restore();
  // arrugas y surcos nasogenianos marcados
  if(age||fat>.35){const wa=fat>.6?Math.max(.22,(.42-(fat-.6)*.4)):age>1?.55:.36;g.globalAlpha=wa;
    if(fat<.55)for(const yy of [8.6,10,11.4])S([[14.6,yy+.3],[20,yy-.3],[25.4,yy+.3]],dd,.32);
    S([[16.6,21.2],[14.8,24.8],[15.6,27.4]],dd,.48);S([[23.4,21.2],[25.2,24.8],[24.4,27.4]],dd,.48);
    for(const sx of [-1,1]){S([[20+sx*7.3,15.6],[20+sx*8.6,15.1]],dd,.32);S([[20+sx*7.3,16.4],[20+sx*8.6,16.8]],dd,.32);}
    if(age>1||fat>.45){S([[17.6,10.6],[18.6,13.2]],dd,.34);S([[22.4,10.6],[21.4,13.2]],dd,.34);}g.globalAlpha=1;}
  // ojos hundidos y chicos, cejas rectas, tupidas y pesadas (mirada bien de Iorio)
  const eyS=fat>.5?.86:1;
  for(const sx of [-1,1]){const ex=20+sx*(4.2-thin*.2+fat*.3),ey=16.2;
    Ell(ex,ey-.8,3.4,2.0,'rgba(45,18,12,.4)');
    P([[ex-2.2*eyS,ey+.2],[ex,ey-1.1*eyS,ex+2.2*eyS,ey+.2],[ex,ey+1.1*eyS,ex-2.2*eyS,ey+.2]],'#ece2d6');
    Ell(ex+sx*.1,ey+.1,1*eyS,1*eyS,'#362012');Ell(ex+sx*.1,ey+.1,.54,.54,'#0c0806');Ell(ex+sx*.1-.35,ey-.25,.25,.25,'#fff');
    S([[ex-2.4*eyS,ey+.3],[ex,ey-1.3*eyS,ex+2.4*eyS,ey+.2]],'#1a100a',.65);S([[ex-1.8,ey+1.2],[ex,ey+1.7,ex+2,ey+1.1]],'rgba(60,26,16,.58)',.32);
    if(age||fat>.4){S([[ex-1.8,ey+2.1],[ex,ey+2.9,ex+2,ey+2]],'rgba(60,26,16,.52)',.36);Ell(ex,ey+2.1,1.9,.75,'rgba(60,26,16,.14)');}
    const bc=I.brow||hc;P([[ex-sx*2.7,ey-1.5],[ex-sx*2.9,ey-3.1],[ex-sx*.4,ey-3.9,ex+sx*2.1,ey-3.5],[ex+sx*3.5,ey-2.5],[ex+sx*2,ey-2.5,ex,ey-2.2],[ex-sx*1.4,ey-1.8]],bc);
    for(let k=0;k<6;k++)S([[ex-sx*(2.3-k*.95),ey-1.9],[ex-sx*(1.7-k*.95),ey-3.2]],shade(bc,1.7),.17);}
  S([[19.2,13.6],[19.5,15.1]],'rgba(55,20,12,.48)',.36);S([[20.8,13.6],[20.5,15.1]],'rgba(55,20,12,.48)',.36);
  // nariz aguileña con caballete: puente firme, joroba dorsal, punta redondeada caída y aletas fuertes
  {const nl=1.3+thin*.6,ty=22.2+thin*.5,tw=2.3+fat*.5;
   S([[21,14.8],[21.6,17.4],[22,18.4],[22.1,20.2],[23.2,ty-.4]],'rgba(60,24,14,.54)',.62);
   S([[19.1,15],[18.9,17.2],[19.4,18.2],[19,20]],'rgba(255,232,206,.46)',.58);Ell(19.6,18,.6,.95,'rgba(255,240,220,.4)');
   Ell(20,ty-1,tw,1.7*nl/1.4,lt);Ell(20.5,ty-.6,tw*.75,1.2,sk);Ell(19.3,ty-1.5,.78,.52,'rgba(255,240,220,.65)');
   Ell(17.6,ty-.3,1.25,1,sk);Ell(22.4,ty-.3,1.25,1,dk);Ell(18.5,ty+.3,.68,.4,'#2a120c');Ell(21.5,ty+.3,.68,.4,'#2a120c');
   S([[16.8,ty-.9],[17.2,ty+.4],[18.4,ty+.6]],'rgba(60,24,14,.52)',.32);S([[23.2,ty-.9],[22.8,ty+.4],[21.6,ty+.6]],'rgba(60,24,14,.62)',.32);
   S([[20,ty+.9],[20,ty+2.2]],'rgba(60,24,14,.28)',.5);}
  // boca firme, comisuras marcadas
  {const my=25.9+thin*.7,lw=3.3+fat*.5,th=thin>.4?.55:1;
   P([[20-lw,my+.2],[18.4,my-.7],[20,my-.45],[21.6,my-.7],[20+lw,my+.2],[20,my+.25]],shade(sk,.6));
   P([[20-lw+.4,my+.2],[20,my+.4],[20+lw-.4,my+.2],[21.8,my+1.5*th],[20,my+1.8*th],[18.2,my+1.5*th]],shade(sk,.78));Ell(20,my+1*th,1.5,.32,'rgba(255,230,210,.32)');
   S([[20-lw-.2,my+.3],[20,my+.3],[20+lw+.2,my+.3]],'#36140c',.45);S([[20-lw-.2,my+.3],[20-lw-.6,my+.95]],'rgba(60,24,14,.48)',.32);S([[20+lw+.2,my+.3],[20+lw+.6,my+.95]],'rgba(60,24,14,.48)',.32);
   Ell(20,my+3.1,1.6,.55,'rgba(60,24,14,.2)');}
  // pelo de adelante
  const strand=(pts,c,w)=>S(pts,c,w);
  if(longH){const gr=g.createLinearGradient(8,0,32,0);gr.addColorStop(0,shade(hc,1.25));gr.addColorStop(.5,hc);gr.addColorStop(1,hd);
    const bot=9+len,ow=W+2.6+vol*2.2,n=Math.round(3+len/5),a=.7+wv*.8;
    for(const sx of [-1,1]){const X=v=>20+sx*v;
      const pts=[[20,2.4],[X(6),2.8,X(W-1),6.2],[X(W+.4),11],[X(W-.4),15.5],...wavy(X(W-.2),15.5,X(W+.6),bot,n,a*.6,0),...wavy(X(W+.6),bot,X(ow),bot-.6,2,a,.5),...wavy(X(ow),bot-.6,X(W+1.6+vol),8,n,a,.2),[X(W+.4),3.4,20,1.8]];
      P(pts,gr);
      for(let k=0;k<7;k++){const t=k/6,x0=W-.2+t*(ow-W),c=k%2?hi:shade(hc,.6);
        const L=[[X(2+k*.9),2.8+k*.25]];for(let j=1;j<=5;j++){const yy=6+j*(bot-7)/5;L.push([X(x0+Math.sin(j*1.7+k)*a*(I.curly?1.1:.6)),yy]);}strand(L,c,I.curly?.32:.26);}
      if(I.curly)for(let k=0;k<16;k++){const cx=X(W+.6+hsh(k,31+sx)*(ow-W)),cy=9+hsh(k,33+sx)*(bot-9);g.strokeStyle=k%3?shade(hc,1.6):hi;g.lineWidth=.3;g.beginPath();g.arc(cx,cy,.7+hsh(k,35)*.5,sx>0?.4:2.6,(sx>0?.4:2.6)+3.4);g.stroke();}}
    S([[20,2.6],[20,5.4]],shade(sk,.85),.5);
    if(I.curly){g.fillStyle=hc;for(const sx of [-1,1]){g.beginPath();g.moveTo(20,2.2);g.quadraticCurveTo(20+sx*4,1,20+sx*8,3.4);g.quadraticCurveTo(20+sx*4,3.4,20+sx*.6,4.6);g.fill();}}}
  else if(hair==='buzz'){g.save();P([[20-W-.2,13],[20-W+1,6.4,20,4.2],[20+W-1,6.4,20+W+.2,13],[20+W-1,10,20+W-3,9.4],[20,8.2],[20-W+3,9.4],[20-W+1,10,20-W-.2,13]],shade(hc,1.1));g.globalAlpha=.5;for(let k=0;k<70;k++){g.fillStyle=k%2?hd:hi;g.fillRect(20+(hsh(k,21)-.5)*2*W*.9,4.6+hsh(k,22)*5.6,.3,.3);}g.restore();}
  else if(hair==='short'){P([[20-W-.4,14],[20-W,5.6,20,3.4],[20+W,5.6,20+W+.4,14],[20+W-1.2,9.6,20+W-3.2,8.8],[22,8.4],[20,9.4],[16,8.4],[20-W+3.2,8.8],[20-W+1.2,9.6,20-W-.4,14]],hc);
    for(let k=0;k<8;k++)strand([[13+k*2,8.6],[14+k*2,5]],k%2?hi:hd,.25);}
  else if(hair==='crest'){
    g.save();
    P([[20-W-.2,13.4],[20-W+.6,6.8,20,4.8],[20+W-.6,6.8,20+W+.2,13.4],[20+W-1.6,9.6,20,8.8],[20-W+1.6,9.6,20-W-.2,13.4]],shade(I.gray?'#6e6862':hc,1));
    g.globalAlpha=.42;
    for(let k=0;k<55;k++){g.fillStyle=I.gray?(k%2?'#b0aaa0':'#3a3430'):(k%2?'#2e2018':'#140c08');g.fillRect(20+(hsh(k,41)-.5)*2*W*.9,6+hsh(k,42)*7,.3,.3);}
    g.restore();
    const gr=g.createLinearGradient(0,-3.5,0,9);gr.addColorStop(0,I.gray>=1?'#ece8e0':I.gray?'#9c948c':hi);gr.addColorStop(.35,hc);gr.addColorStop(1,hd);
    P([[16.2,8.8],[15.8,5.2],[16.6,2.1],[17.0,-1.2],[18.0,1.2],[18.8,-2.8],[20.0,-3.6],[21.2,-2.8],[22.0,1.2],[23.0,-1.2],[23.4,2.1],[24.2,5.2],[23.8,8.8],[22.4,8.0],[20.0,8.4],[17.6,8.0]],gr);
    const crTip=I.gray>=1?'#f8f6f0':I.gray?'#c8c2b8':hi;
    for(let k=0;k<11;k++){const t=k/10,x0=16.6+t*6.8,x1=17.2+t*5.6+(Math.sin(k*1.8)*.4),y1=-3.2+Math.abs(t-.5)*4.2+(k%2?-.4:.3);
      strand([[x0,8.2],[x0+(t-.5)*1.2,4.2],[x1,y1]],k%2?crTip:shade(hc,.7),.28);}
    if(I.gray){const silv=I.gray>=1?'#ffffff':'rgba(235,230,222,.9)';for(let k=0;k<6;k++){const sx=17.2+k*1.1,sy=-2.8+Math.abs(k-2.5)*1.2;strand([[sx,2.5],[sx+.2,sy]],silv,.32);}}
  }
  else if(hair==='swept'){const gr=g.createLinearGradient(0,0,0,12);gr.addColorStop(0,hi);gr.addColorStop(1,hc);
    P([[20-W-.6,15],[20-W-1.2,6,15,1.6],[20,.8],[25,1.6],[20+W+1.2,6,20+W+.6,15],[20+W-1,9.6,20+W-2.6,8.4],[24,6.6],[20,6.2],[16,6.6],[20-W+2.6,8.4],[20-W+1,9.6,20-W-.6,15]],gr);
    for(let k=0;k<10;k++)strand([[12.6+k*1.65,7.2],[13.6+k*1.5,2.6],[15.6+k*1.1,1.1]],k%2?'#f8f4ec':shade(hc,.72),.3);
    S([[20-W-.4,14],[20-W,19.5]],hc,1.3);S([[20+W+.4,14],[20+W,19.5]],hc,1.3);}
  g.restore();}


/* ================= loop & sizing ================= */
const coarse=!!(window.matchMedia&&matchMedia('(pointer:coarse)').matches);
const stage=document.getElementById('stage');
function fit(){const port=innerHeight>innerWidth,w=stage.clientWidth-(coarse&&!port?280:0),h=stage.clientHeight-(coarse&&port?200:0);let s=Math.min(w/W,Math.max(h,120)/H);if(s>=2)s=Math.floor(s*2)/2;cv.style.width=Math.floor(W*s)+'px';cv.style.height=Math.floor(H*s)+'px';}
try{new ResizeObserver(fit).observe(stage);}catch(e){addEventListener('resize',fit);}fit();
resetWorld(0);monstruoInsert();alvearInit();render();
let acc=0,lt=performance.now();const DT=1000/60;
function frame(t){acc+=Math.min(100,t-lt);lt=t;let u=0;while(acc>=DT){update();acc-=DT;u=1;}if(u)render();requestAnimationFrame(frame);}
requestAnimationFrame(frame);
if(/[?&]debug\b/.test(location.search))window.__game={get songs(){return SONGS;},get song(){return song;},truck(){cam.x=LW-W;player.x=LW-200;startTruck();},rec(ms){return new Promise(res=>{const d=AC.createMediaStreamDestination();master.connect(d);const r=new MediaRecorder(d.stream),ch=[];r.ondataavailable=e=>ch.push(e.data);r.onstop=()=>{const fr=new FileReader();fr.onload=()=>res(fr.result);fr.readAsDataURL(new Blob(ch));};r.start();setTimeout(()=>r.stop(),ms);});},get audio(){return {st:AC&&AC.state,drum:!!drumG,lead:!!gLead,t:AC&&AC.currentTime};},get state(){return state;},get player(){return player;},get ents(){return ents;},get cam(){return cam;},get boss(){return boss;},get lockIdx(){return lockIdx;},get lvl(){return lvl;},get score(){return score;},set meter(v){meter=v;},get hazard(){return hazard;},
  start(i){audioInit();startChapter(i,false);},skip(){if(state==='card')startIntro();},warp(i,x){ents.filter(e=>e.team===1).forEach(e=>e.gone=true);lock=null;lockIdx=i;cam.x=x-120;player.x=x;},unlockAll(){unl=LEVELS.length;},monster(){boss=mk('loteador',player.x+90,player.y);ents.push(boss);startMonsterCut();},killBoss(){boss.hp=0;},ending(){total={t:300,combo:20,hits:10};state='ending';endT=0;}};
})();
