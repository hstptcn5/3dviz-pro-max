import {THREE, add, box, material, rod, ring, grain} from '../breadth/src/craft-forms.js';
import {workflow, executionFrames} from '../../renyro-execution-observatory/fixture.js';
import {activeEdgeIds, activeNode, projectRenyroState} from '../../renyro-execution-observatory/model.js';
import {P, terrainY, clearing, seeded, makeTerrain, makeTrail, addForest, addAtmosphere} from './renyro-forest-environment.js';

const STATUS={RUNNING:'#f2c86b',SUCCESS:'#75d39b',WAITING:'#8dbfff',FAILED:'#ff7777',SKIPPED:'#99a899',IDLE:'#73866d'};
const N={upload:'Forest Gate',read:'Ranger Archive Hut',extract:'Ancient Insight Tree',confidence:'Forked Trail',review:'Review Camp',decision:'Decision Lookout',export:'Output Lodge',exception:'Shadow Grove'};
const TAU=Math.PI*2;

function textMaterial(text,background='#d9cfaa',ink='#32493a') {
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=192;
  const ctx=canvas.getContext('2d');ctx.fillStyle=background;ctx.fillRect(0,0,512,192);
  ctx.strokeStyle=ink;ctx.globalAlpha=.25;ctx.lineWidth=4;ctx.strokeRect(15,15,482,162);ctx.globalAlpha=1;
  ctx.fillStyle=ink;ctx.font='600 62px Georgia,serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,256,102,455);
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
  return new THREE.MeshStandardMaterial({map:texture,roughness:.86});
}
function sign(g,m,text,p,width=.48,background) {
  box(g,m.wood,p,[width+.045,width*.375+.04,.045],.008);
  return add(g,new THREE.PlaneGeometry(width,width*.375),textMaterial(text,background),[p[0],p[1],p[2]+.025]);
}
function lamp(g,m,p,{mat=m.lantern,scale=1}={}) {
  const frame=new THREE.Group();frame.position.set(...p);frame.scale.setScalar(scale);g.add(frame);
  box(frame,m.iron,[0,-.09,0],[.13,.03,.13],.006);box(frame,m.iron,[0,.09,0],[.15,.035,.15],.006);
  add(frame,new THREE.ConeGeometry(.11,.06,4),m.iron,[0,.13,0]);
  for(const x of [-.049,.049])for(const z of [-.049,.049])rod(frame,m.iron,[x,-.08,z],[x,.09,z],.009);
  const light=add(frame,new THREE.SphereGeometry(.055,8,6),mat);light.scale.y=1.35;light.castShadow=false;
  ring(frame,m.iron,[0,.19,0],.027,.007);return light;
}
function station(root,id,m) {
  const group=new THREE.Group();group.name=`forest-station-${id}`;group.position.set(...P[id]);root.add(group);
  clearing(root,P[id][0],P[id][2],id==='extract'?1.2:.87,id==='exception'?m.shadowSoil:m.soil,Object.keys(N).indexOf(id)+7);
  const statusMat=new THREE.MeshStandardMaterial({color:STATUS.IDLE,emissive:STATUS.IDLE,emissiveIntensity:.18,roughness:.5});
  const indicator=add(group,new THREE.TorusGeometry(id==='extract'?1.04:.76,.016,5,60,Math.PI*1.15),statusMat,[0,.035,0]);indicator.rotation.x=Math.PI/2;indicator.rotation.z=-.25;
  rod(group,m.wood,[.6,.025,.48],[.6,.43,.48],.022);
  const lantern=lamp(group,m,[.6,.53,.48],{mat:statusMat,scale:.72});
  const anchor=new THREE.Object3D();anchor.position.set(0,.31,id==='extract'?1.02:.84);group.add(anchor);
  return {group,indicator,statusMat,lantern,anchor,id,lastStatus:null};
}
function plank(g,m,p,s,rotation=0) {const o=box(g,m,p,s,.008);o.rotation.z=rotation;return o;}
function crate(g,m,p,size=.2) {
  box(g,m.wood,p,[size,size,size],.012);
  for(const y of [-.3,.3])box(g,m.bark,[p[0],p[1]+y*size,p[2]+size*.505],[size*1.04,size*.1,.014],.003);
  rod(g,m.rope,[p[0]-size*.4,p[1]-size*.4,p[2]+size*.52],[p[0]+size*.4,p[1]+size*.4,p[2]+size*.52],.007);
}
function windowPane(g,m,x,y,z) {
  box(g,m.bark,[x,y,z],[.25,.29,.045],.012);box(g,m.glass,[x,y,z+.024],[.19,.23,.018],.003);
  box(g,m.wood,[x,y,z+.04],[.02,.23,.02],.003);box(g,m.wood,[x,y,z+.04],[.19,.02,.02],.003);
  box(g,m.wood,[x,y-.155,z+.045],[.29,.035,.09],.005);
}
function cabin(g,m,{width=1.12,depth=.85,roofMat=m.roof}={}) {
  box(g,m.stone,[0,.09,0],[width+.09,.18,depth+.08],.035);
  for(let i=0;i<6;i++)box(g,i%3===0?m.board:m.cream,[0,.23+i*.102,0],[width,.096,depth],.012);
  for(const x of [-width/2,width/2])for(const z of [-depth/2,depth/2])box(g,m.wood,[x,.47,z],[.075,.77,.075],.009);
  // A supported gable, thick eaves and overlapping roof courses, rather than a four-sided cone.
  const half=width*.61,rise=.42,eave=.84,angle=Math.atan2(rise,half),slope=Math.hypot(half,rise);
  for(const side of [-1,1]) {
    plank(g,m.bark,[side*half*.5,eave+rise*.5,0],[slope+.06,.08,depth+.34],-side*angle);
    for(let row=0;row<4;row++)for(let tile=0;tile<5;tile++) {
      const t=(row+.5)/4,x=side*half*t,y=eave+rise*(1-t)+.055,z=(tile-2)*(depth+.27)/5;
      plank(g,(tile+row)%4===0?m.roofLight:roofMat,[x,y,z],[slope/4+.055,.043,(depth+.3)/5-.007],-side*angle);
    }
  }
  rod(g,m.bark,[0,eave+rise+.08,-depth*.65],[0,eave+rise+.08,depth*.65],.035);
  for(const z of [-depth*.51,depth*.51]) {
    rod(g,m.wood,[-half,eave,z],[0,eave+rise,z],.032);rod(g,m.wood,[0,eave+rise,z],[half,eave,z],.032);
    rod(g,m.wood,[0,eave,z],[0,eave+rise,z],.025);
  }
  box(g,m.bark,[0,.39,depth*.51],[.31,.62,.055],.009);box(g,m.wood,[0,.4,depth*.51+.035],[.25,.56,.04],.009);
  add(g,new THREE.SphereGeometry(.018,6,4),m.iron,[.082,.4,depth*.51+.065]);
  windowPane(g,m,-width*.32,.55,depth*.51);windowPane(g,m,width*.32,.55,depth*.51);
}

function forestGate(root,m) {
  const s=station(root,'upload',m),g=s.group;
  for(const x of [-.55,.55]) {
    box(g,m.stone,[x,.09,0],[.26,.18,.3],.045);rod(g,m.bark,[x,.12,0],[x*.95,1.35,0],.079,.058);
    rod(g,m.wood,[x,1.03,0],[x*.55,1.4,0],.035);
  }
  rod(g,m.wood,[-.73,1.38,0],[.7,1.43,0],.065,.055);
  for(let i=0;i<9;i++){const x=(i-4)*.165;plank(g,m.roof,[x,1.53-.1*Math.abs(x),0],[.16,.06,.34],-.16*Math.sign(x));}
  sign(g,m,'RENYRO',[0,1.22,.08],.7);
  lamp(g,m,[-.58,.91,.1]);lamp(g,m,[.58,.91,.1]);
  sign(g,m,'START',[-.82,.43,.16],.32);rod(g,m.wood,[-.82,.03,.14],[-.82,.49,.14],.022);
  for(const side of [-1,1])for(let k=0;k<3;k++)add(g,new THREE.IcosahedronGeometry(.12,0),m.leaf,[side*(.56+k*.12),.15+k*.08,-.06],[1,.6,1]);
  return s;
}
function archiveHut(root,m) {
  const s=station(root,'read',m),g=s.group;cabin(g,m,{});
  for(let i=0;i<6;i++)plank(g,m.wood,[(i-2.5)*.16,.13,.63],[.151,.07,.4]);
  box(g,m.stone,[0,.04,.84],[.52,.085,.18],.025);
  sign(g,m,'ARCHIVE',[0,.93,.57],.54);
  // Exposed document shelves and rolled maps identify the read station at inspection distance.
  box(g,m.bark,[-.73,.4,.1],[.06,.65,.44],.009);
  for(const y of [.16,.38,.6]) {
    box(g,m.wood,[-.72,y,.2],[.4,.03,.42],.005);
    for(let k=0;k<3;k++)box(g,k%2?m.canvas:m.paper,[-.84+k*.105,y+.083,.2],[.079,.13,.25],.005);
  }
  rod(g,m.paper,[.62,.21,.28],[.85,.21,.28],.05);
  crate(g,m,[.72,.13,-.14]);lamp(g,m,[.4,.89,.49],{scale:.62});return s;
}

function taperBranch(g,mat,points,radius) {
  const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),frames=curve.computeFrenetFrames(18,false),positions=[],indices=[];
  for(let i=0;i<=18;i++) {
    const t=i/18,p=curve.getPoint(t),r=radius*(1-t*.83)*(1+.055*Math.sin(t*23));
    for(let j=0;j<9;j++) {const a=j/9*TAU,q=p.clone().addScaledVector(frames.normals[i],Math.cos(a)*r).addScaledVector(frames.binormals[i],Math.sin(a)*r);positions.push(q.x,q.y,q.z);}
    if(i<18)for(let j=0;j<9;j++){const a=i*9+j,b=i*9+(j+1)%9;indices.push(a,b,a+9,b,b+9,a+9);}
  }
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setIndex(indices);geo.computeVertexNormals();return add(g,geo,mat);
}
function insightTree(root,m) {
  const s=station(root,'extract',m),g=s.group;
  taperBranch(g,m.bark,[[0,.02,0],[-.13,.65,-.03],[.03,1.36,0],[-.16,2.2,-.08],[-.38,2.78,-.14]],.43);
  const random=seeded(181);
  for(let k=0;k<7;k++) {
    const a=k/7*TAU+.13,r=.78+random()*.29;
    taperBranch(g,k%2?m.root:m.bark,[[Math.cos(a)*.2,.4,Math.sin(a)*.2],[Math.cos(a)*.46,.15,Math.sin(a)*.46],[Math.cos(a)*r,.045,Math.sin(a)*r]],.16);
  }
  const limbs=[
    [[-.08,.83,0],[-.48,1.48,.07],[-1.15,1.93,.12],[-1.44,2.31,.08]],
    [[0,1.2,0],[.42,1.64,.05],[.93,2.07,.12],[1.2,2.34,.16]],
    [[-.1,1.6,-.02],[-.62,2.08,-.5],[-.9,2.6,-.65]],
    [[0,1.1,.05],[.13,1.81,.42],[.28,2.33,.8]],
    [[-.12,1.85,-.04],[.37,2.22,-.4],[.53,2.8,-.5]],
  ];
  limbs.forEach((points,i)=>taperBranch(g,m.bark,points,i<2?.2:.14));
  const crown=new THREE.Group();crown.position.y=2.25;g.add(crown);
  const lobes=[
    [-1.12,.08,.08,.79,.28],[-.93,.31,-.28,.71,.33],[-.5,.56,-.5,.84,.35],
    [.03,.76,-.26,.94,.39],[.7,.36,.09,.84,.3],[1.19,.13,.22,.49,.23],
    [.35,.04,.73,.65,.25],[-.39,.17,.59,.67,.29],[.68,.62,-.51,.64,.3],
    [-.24,.94,-.35,.61,.24],[-1.31,.25,-.28,.43,.22],[.05,.4,.32,.68,.3],
  ];
  const foliage=[m.heroLeaf,m.heroMid,m.heroMid,m.heroMid,m.heroLeaf,m.heroMid,m.heroLeaf,m.heroLeaf,m.heroMid,m.heroLight,m.heroMid,m.heroMid];
  lobes.forEach(([x,y,z,r,ry],i)=>{
    const geometry=new THREE.IcosahedronGeometry(1,1),position=geometry.attributes.position;
    for(let j=0;j<position.count;j++){const px=position.getX(j),py=position.getY(j),pz=position.getZ(j),d=1+.065*Math.sin(px*7+pz*5+i);position.setXYZ(j,px*d,py,pz*d);}
    geometry.computeVertexNormals();
    const o=add(crown,geometry,foliage[i],[x,y,z],[r,ry,r*.87]);o.rotation.y=i*.7;
  });
  // An illuminated knot in the living trunk, with a real warm pool on the roots.
  const knot=ring(g,m.root,[-.02,1.16,.35],.215,.05);knot.scale.set(.75,1.25,1);
  const orb=add(g,new THREE.SphereGeometry(.14,12,8),m.glow,[-.02,1.16,.38],[.82,1.35,.55]);orb.castShadow=false;
  const coreLight=new THREE.PointLight('#b8e4ac',.65,2.2,2);coreLight.position.set(-.02,1.12,.56);g.add(coreLight);
  for(const [x,y,z] of [[-.91,1.79,.22],[.79,1.93,.31],[.24,2.08,.72]]) {
    rod(g,m.rope,[x,y,z],[x,y-.27,z],.006);const charm=add(g,new THREE.OctahedronGeometry(.04),m.rune,[x,y-.3,z],[.7,1.5,.7]);charm.castShadow=false;
  }
  const motes=[];for(let i=0;i<10;i++){const a=i/10*TAU,o=add(g,new THREE.SphereGeometry(.019,6,4),m.wisp,[Math.cos(a)*.84,.68+(i%4)*.28,Math.sin(a)*.75]);o.castShadow=false;motes.push(o);}
  s.animated={crown,orb,coreLight,motes};return s;
}
function forkedTrail(root,m) {
  const s=station(root,'confidence',m),g=s.group;
  rod(g,m.wood,[0,.05,0],[0,1.15,0],.057,.042);
  sign(g,m,'HIGH  →',[.18,.9,.025],.7,'#cdd6ad');
  sign(g,m,'LOW  ↗',[-.11,.63,.055],.64,'#dbc9ac');
  for(const x of [-.2,.18])add(g,new THREE.DodecahedronGeometry(.12,0),m.rock,[x,.05,-.08],[1,.6,1]);
  lamp(g,m,[0,1.32,0],{scale:.7});
  s.animated={charm:lamp(g,m,[-.33,.31,.28],{scale:.5,mat:m.rune})};return s;
}
function reviewCamp(root,m) {
  const s=station(root,'review',m),g=s.group;
  const w=.62,top=1.06,depth=.98,angle=Math.atan2(top-.08,w),slope=Math.hypot(w,top-.08);
  for(const side of [-1,1]) {
    const cloth=plank(g,m.canvas,[side*w*.5,(top+.08)*.5,-.07],[slope,.024,depth],-side*angle);
    cloth.castShadow=true;
    rod(g,m.rope,[side*w*.7,.38,.31],[side*.86,.02,.61],.009);rod(g,m.wood,[side*.86,.02,.61],[side*.87,.12,.61],.015);
  }
  const front=new THREE.Shape();front.moveTo(-w,.08);front.lineTo(0,top);front.lineTo(w,.08);front.lineTo(.2,.08);front.lineTo(0,.66);front.lineTo(-.2,.08);front.closePath();
  add(g,new THREE.ShapeGeometry(front),m.canvas,[0,0,.43]);
  const back=new THREE.Shape();back.moveTo(-w,.08);back.lineTo(w,.08);back.lineTo(0,top);back.closePath();add(g,new THREE.ShapeGeometry(back),m.canvas,[0,0,-.56]);
  rod(g,m.bark,[0,1.085,-.65],[0,1.085,.56],.025);rod(g,m.wood,[0,.03,-.57],[0,1.09,-.57],.026);
  box(g,m.dark,[0,.027,-.08],[.96,.03,.9],.01);
  // Work table, paper and stools make this a human hold point rather than an empty campsite.
  box(g,m.wood,[-.72,.31,.44],[.46,.065,.42],.014);
  for(const x of [-.89,-.55])for(const z of [.3,.58])rod(g,m.wood,[x,.03,z],[x,.31,z],.022);
  box(g,m.paper,[-.71,.347,.44],[.25,.008,.21],.002);rod(g,m.iron,[-.62,.36,.41],[-.72,.36,.49],.005);
  for(const z of [.03,.84]) {box(g,m.wood,[-.72,.17,z],[.37,.045,.17],.012);for(const x of [-.84,-.6])rod(g,m.bark,[x,.02,z],[x,.17,z],.022);}
  const fire=add(g,new THREE.OctahedronGeometry(.085,0),m.fire,[.53,.15,-.02],[.75,1.7,.75]);fire.castShadow=false;
  for(let i=0;i<8;i++){const a=i/8*TAU;add(g,new THREE.DodecahedronGeometry(.052,0),m.rock,[.53+Math.cos(a)*.15,.043,-.02+Math.sin(a)*.15],[1,.65,1]);}
  rod(g,m.wood,[.7,.03,-.37],[.7,1.07,-.37],.025);lamp(g,m,[.7,1.11,-.37],{mat:s.statusMat});
  const hold=ring(g,m.waiting,[.7,1.11,-.37],.2,.017);hold.visible=false;
  const pennant=box(g,m.waiting,[.82,.88,-.36],[.2,.12,.02],.003);pennant.visible=false;
  s.animated={fire,hold,pennant};return s;
}
function lookout(root,m) {
  const s=station(root,'decision',m),g=s.group;
  for(const x of [-.43,.43])for(const z of [-.35,.35]) {
    box(g,m.stone,[x,.05,z],[.18,.1,.18],.025);rod(g,m.bark,[x,.08,z],[x,.72,z],.038);
  }
  for(let i=0;i<7;i++)plank(g,m.wood,[(i-3)*.147,.73,0],[.137,.07,.85]);
  for(const x of [-.44,.44]){
    rod(g,m.wood,[x,.17,-.35],[x,.65,.35],.021);rod(g,m.wood,[x,.17,.35],[x,.65,-.35],.021);
    for(const z of [-.37,.37])rod(g,m.wood,[x,.74,z],[x,1.07,z],.02);
    rod(g,m.wood,[x,1.07,-.37],[x,1.07,.37],.023);
  }
  rod(g,m.wood,[-.44,1.07,-.37],[.44,1.07,-.37],.023);
  for(let i=0;i<5;i++){const z=.43+(4-i)*.12,y=.1+i*.13;box(g,m.wood,[0,y,z],[.39,.07,.14],.009);for(const x of [-.16,.16])rod(g,m.bark,[x,.03,z],[x,y,z],.016);}
  rod(g,m.wood,[0,.75,-.2],[0,1.55,-.2],.025);sign(g,m,'DECIDE',[0,1.34,-.165],.56);
  sign(g,m,'YES',[-.32,1.11,.4],.26,'#c7d6ac');sign(g,m,'NO',[.32,1.11,.4],.26,'#cbb0a3');
  box(g,m.wood,[0,.95,-.03],[.38,.06,.3],.01);box(g,m.paper,[0,.985,-.03],[.26,.01,.22],.002);return s;
}
function outputLodge(root,m) {
  const s=station(root,'export',m),g=s.group;cabin(g,m,{width:1.25,depth:.96,roofMat:m.outputRoof});
  for(let i=0;i<8;i++)plank(g,m.wood,[(i-3.5)*.168,.13,.74],[.158,.065,.48]);
  for(const x of [-.56,.56])rod(g,m.wood,[x,.15,.88],[x,.86,.88],.024);
  plank(g,m.outputRoof,[0,.91,.75],[1.4,.05,.52],0);box(g,m.stone,[0,.045,1.04],[.58,.08,.19],.03);
  sign(g,m,'OUTPUT',[0,1.0,.51],.58);
  crate(g,m,[-.42,.27,.67],.22);crate(g,m,[.38,.25,.68],.18);
  sign(g,m,'JSON',[-.42,.39,.81],.27);sign(g,m,'CSV',[.38,.37,.81],.25);
  box(g,m.stone,[-.4,1.21,-.21],[.15,.42,.16],.022);box(g,m.rock,[-.4,1.44,-.21],[.21,.045,.23],.01);
  lamp(g,m,[.54,.77,.89],{scale:.75});return s;
}
function shadowGrove(root,m) {
  const s=station(root,'exception',m),g=s.group;
  for(const [x,z,h,lean] of [[-.43,-.28,1.12,-.19],[.32,-.24,1.42,.22],[.65,.04,.88,.14]]) {
    taperBranch(g,m.dark,[[x,.01,z],[x+lean*.4,h*.5,z],[x+lean,h,z-.05]],.12);
    taperBranch(g,m.dark,[[x+lean*.4,h*.48,z],[x-.21,h*.77,z+.13],[x-.32,h*.9,z+.17]],.04);
    add(g,new THREE.IcosahedronGeometry(.36,1),m.shadowLeaf,[x+lean,h-.03,z],[1,.58,.85]);
  }
  // A sheltered receiving box; the recess and papers carry the inbox identity.
  for(const side of [-1,1])for(let i=0;i<3;i++)box(g,m.rock,[side*.3,.1+i*.14,.31],[.15,.14,.32],.035);
  box(g,m.rock,[0,.51,.31],[.81,.15,.45],.045);box(g,m.dark,[0,.21,.24],[.44,.39,.06],.008);
  box(g,m.iron,[0,.13,.37],[.38,.15,.29],.009);box(g,m.paper,[.02,.22,.38],[.22,.014,.18],.002);
  sign(g,m,'INBOX',[0,.51,.55],.39,'#bac3b1');
  const ember=lamp(g,m,[-.53,.29,.42],{mat:s.statusMat,scale:.65});
  s.animated={ember};return s;
}

function createLabels(stations,ground) {
  const layer=document.createElement('div');layer.className='station-labels';layer.setAttribute('aria-label','Workflow stations');
  document.querySelector('#viewport').append(layer);
  const entries=workflow.nodes_json.map((node,i)=>{
    const element=document.createElement('div');element.className='station-label';
    const title=document.createElement('span');title.className='label-name';
    const number=document.createElement('span');number.className='label-number';number.textContent=String(i+1).padStart(2,'0');
    title.append(number,document.createTextNode(node.name));
    const place=document.createElement('span');place.className='label-place';place.textContent=N[node.id];
    const state=document.createElement('span');state.className='label-status';element.append(title,place,state);layer.append(element);
    return {id:node.id,element,state,station:stations.get(node.id),point:new THREE.Vector3()};
  });
  let visible=true;
  ground.onBeforeRender=(_renderer,_scene,camera)=>{
    const width=layer.clientWidth,height=layer.clientHeight;
    for(const e of entries) {
      e.station.anchor.getWorldPosition(e.point);e.point.project(camera);
      const show=visible&&e.point.z>-1&&e.point.z<1&&Math.abs(e.point.x)<1.04&&Math.abs(e.point.y)<1.04;
      e.element.hidden=!show;if(!show)continue;
      e.element.style.transform=`translate(${(e.point.x*.5+.5)*width}px,${(-e.point.y*.5+.5)*height}px) translate(-50%,0)`;
    }
  };
  return {setVisible(value){visible=value;layer.hidden=!value;},setStatus(id,status){
    const entry=entries.find(e=>e.id===id);if(entry.element.dataset.status===status)return;
    entry.element.dataset.status=status;entry.element.style.setProperty('--state',STATUS[status]||STATUS.IDLE);
    entry.state.textContent=status==='WAITING'?'WAITING · HUMAN REVIEW':status;
  },dispose(){ground.onBeforeRender=()=>{};layer.remove();}};
}
function setStatus(s,status,t) {
  if(s.lastStatus!==status){const color=STATUS[status]||STATUS.IDLE;s.statusMat.color.set(color);s.statusMat.emissive.set(color);s.lastStatus=status;}
  s.statusMat.emissiveIntensity=status==='RUNNING'?.75+Math.sin(t*5)*.16:status==='WAITING'?.65+Math.sin(t*2)*.15:status==='FAILED'?.9:.18;
  const active=['RUNNING','WAITING','FAILED'].includes(status);s.indicator.visible=status!==''&&status!=='SKIPPED';s.lantern.scale.setScalar(active?1.13+Math.sin(t*3)*.07:1);
}

export async function createRenyroForestTrail() {
  const group=new THREE.Group();group.name='Renyro Forest Trail';
  const matte=(color)=>material(color,.91,0),emissive=(color,intensity)=>new THREE.MeshStandardMaterial({color,emissive:color,emissiveIntensity:intensity,roughness:.62});
  const m={
    ground:new THREE.MeshStandardMaterial({vertexColors:true,roughness:.98,flatShading:true}),earth:new THREE.MeshStandardMaterial({vertexColors:true,roughness:1,flatShading:true,side:THREE.DoubleSide}),
    soil:matte('#9a9c74'),shadowSoil:matte('#6f8375'),path:matte('#d1b983'),reviewPath:matte('#b49d78'),exceptionPath:matte('#95887e'),pathEdge:matte('#797f5b'),pathMark:matte('#eee0b5'),routeRust:matte('#d0ac99'),
    wood:matte('#9b7850'),board:matte('#ae9d74'),bark:matte('#5b4b36'),root:matte('#806243'),cream:matte('#c1b28b'),paper:matte('#e4daba'),
    roof:matte('#5c7860'),roofLight:matte('#889473'),outputRoof:matte('#a48e63'),forest:matte('#adbb9b'),leaf:matte('#b6c3a3'),heroLeaf:matte('#467b5d'),heroMid:matte('#658c60'),heroLight:matte('#94a866'),shadowLeaf:matte('#506b64'),shrub:matte('#b5bfa0'),grass:matte('#b1b683'),rock:matte('#959b84'),stone:matte('#a2a18c'),canvas:matte('#c2b68d'),dark:matte('#354d46'),rope:matte('#c0ac7c'),iron:material('#46564b',.68,.25),
    glass:emissive('#c9cd97',.18),lantern:emissive('#ffe2a0',.9),waiting:emissive('#8dbfff',.85),fire:emissive('#edb067',.8),glow:emissive('#d0edb2',.65),rune:emissive('#cee2a5',.4),wisp:emissive('#eefbd3',1.2),pathGlow:emissive('#dae7ad',.6),mushroom:matte('#ba9971'),
    bank:matte('#6c826c'),water:material('#83b4a9',.34,.08),ripple:material('#c3d5b7',.4,0),
  };
  m.grass.side=m.canvas.side=THREE.DoubleSide;
  for(const mat of [m.heroLeaf,m.heroMid,m.heroLight])mat.flatShading=true;
  m.wood.bumpMap=grain('wood');m.wood.bumpScale=.01;m.bark.bumpMap=m.wood.bumpMap;m.bark.bumpScale=.014;
  const {ground,creek}=makeTerrain(group,m),atmosphere=addAtmosphere(group);
  const stations=new Map([
    ['upload',forestGate(group,m)],['read',archiveHut(group,m)],['extract',insightTree(group,m)],['confidence',forkedTrail(group,m)],
    ['review',reviewCamp(group,m)],['decision',lookout(group,m)],['export',outputLodge(group,m)],['exception',shadowGrove(group,m)],
  ]);
  const trails=workflow.edges_json.map((edge,i)=>makeTrail(group,edge,m,i));addForest(group,m,trails,creek);
  const annotations=createLabels(stations,ground);
  let frameIndex=0,autoplay=true,labels=true,frameClock=0,elapsed=0,model=projectRenyroState(workflow,executionFrames[0]);
  const apply=()=>{model=projectRenyroState(workflow,executionFrames[frameIndex]);frameClock=0;};
  const update=dt=>{
    elapsed+=dt;
    if(autoplay&&dt>0){frameClock+=dt;if(frameClock>2.5){frameIndex=(frameIndex+1)%executionFrames.length;apply();}}
    const active=activeEdgeIds(model);
    for(const node of model.nodes){setStatus(stations.get(node.id),node.status,elapsed);annotations.setStatus(node.id,node.status);}
    const tree=stations.get('extract').animated;
    tree.crown.rotation.z=Math.sin(elapsed*.35)*.009;tree.crown.rotation.y=Math.sin(elapsed*.22)*.012;
    tree.coreLight.intensity=model.nodes.find(n=>n.id==='extract')?.status==='RUNNING'?.8+Math.sin(elapsed*2)*.12:.48;
    tree.motes.forEach((o,i)=>{const a=i/10*TAU+elapsed*.08;o.position.set(Math.cos(a)*.84,.68+(i%4)*.28+Math.sin(elapsed*.9+i)*.045,Math.sin(a)*.75);});
    const review=stations.get('review').animated,waiting=model.nodes.find(n=>n.id==='review')?.status==='WAITING';
    review.hold.visible=review.pennant.visible=waiting;review.hold.scale.setScalar(1+Math.sin(elapsed*2)*.065);review.fire.scale.y=1.7+Math.sin(elapsed*5)*.12;
    for(const trail of trails){
      const on=active.has(trail.id);trail.glow.visible=on;trail.wisp.visible=on;
      const q=(elapsed*.15+trail.offset)%1;
      if(on){const p=trail.curve.getPoint(q);trail.wisp.position.set(p.x,terrainY(p.x,p.z)+.13,p.z);}
      trail.tail.forEach((mote,i)=>{mote.visible=on;if(on){const p=trail.curve.getPoint((q-.012*(i+1)+1)%1);mote.position.set(p.x,terrainY(p.x,p.z)+.115,p.z);}});
    }
    return dt>0;
  };
  return {
    group,stage:false,update,needsAnimation:()=>true,title:'Renyro Forest Trail Workflow',
    description:'A peaceful forest operations trail. Follow a document from the forest gate to insight, review and output.',
    note:'The forest projects the existing Renyro-shaped Document AI fixture. Workflow IDs, edges, routes, execution statuses and durations belong to that model. Terrain and ambient animation are illustrative. The supplied playback follows human review and approval; it does not include a failed or rejected execution.',
    craft:'Custom terrain, grounded trail ribbons, a branching canopy, timber stations and clustered vegetation use shared 3dviz craft primitives and the existing standalone runtime.',
    lighting:{exposure:.98,environment:.28,key:2.2,fill:1.6,rim:3.2,contact:0,keyColor:'#ffe6bc',fillColor:'#abcac2'},
    controls:[
      {type:'select',label:'Execution frame',options:executionFrames.map((_,i)=>({value:String(i),label:`${i+1} · ${['Trailhead','Archive','Insight tree','Review camp hold','Decision lookout','Output path','Complete'][i]}`})),get:()=>String(frameIndex),set:v=>{frameIndex=Number(v);apply();}},
      {type:'button',getLabel:()=>`Next frame (${frameIndex+1}/${executionFrames.length})`,set:()=>{frameIndex=(frameIndex+1)%executionFrames.length;apply();}},
      {type:'button',getLabel:()=>`Autoplay: ${autoplay?'on':'off'}`,set:()=>{autoplay=!autoplay;frameClock=0;}},
      {type:'button',getLabel:()=>`Labels: ${labels?'on':'off'}`,set:()=>{labels=!labels;annotations.setVisible(labels);}},
      {type:'button',label:'Visit the Insight Tree',set:()=>window.__viewer?.setView('source')},
    ],
    stats:()=>{const active=activeNode(model),success=model.nodes.filter(n=>n.status==='SUCCESS').length,waiting=model.nodes.filter(n=>n.status==='WAITING').length;return [
      {label:'Frame',value:`${frameIndex+1} / ${executionFrames.length}`},{label:'Execution',value:model.executionStatus||'—'},
      {label:waiting?'Waiting for a human':'Active station',value:active?N[active.id]:'Complete'},{label:'Success / waiting',value:`${success} / ${waiting}`},
    ];},
    reset:()=>{frameIndex=0;autoplay=true;labels=true;annotations.setVisible(true);apply();},
    dispose:()=>{annotations.dispose();atmosphere.dispose();},
  };
}

createRenyroForestTrail.views={
  overview:{position:[2.9,9,15.2],target:[0,-.8,.1]},
  detail:{position:[7.8,5.8,8.25],target:[3.6,-1.45,-.15]},
  source:{position:[.1,3,7],target:[-2.25,-.52,-.5]},
};
