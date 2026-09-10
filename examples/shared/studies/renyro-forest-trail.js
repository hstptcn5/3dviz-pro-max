import {THREE, add, box, material, rod, ring} from '../breadth/src/craft-forms.js';
import {workflow, executionFrames} from '../../renyro-execution-observatory/fixture.js';
import {activeEdgeIds, activeNode, projectRenyroState} from '../../renyro-execution-observatory/model.js';

const STATUS={RUNNING:'#f2c86b',SUCCESS:'#75d39b',WAITING:'#7ab2ff',FAILED:'#ff7777',SKIPPED:'#71807a',IDLE:'#61756a'};
const XZ={upload:[-5.6,.6],read:[-4.05,-.15],extract:[-2.05,.25],confidence:[.05,0],review:[2.0,-1.6],decision:[3.85,-1.25],export:[4.8,1.55],exception:[5.9,-1.95]};
const N={upload:'FOREST GATE',read:'RANGER ARCHIVE',extract:'ANCIENT INSIGHT TREE',confidence:'FORKED TRAIL',review:'REVIEW CAMP',decision:'DECISION LOOKOUT',export:'OUTPUT LODGE',exception:'SHADOW GROVE'};

function terrainY(x,z){return -2.28+.1*Math.sin(x*.48)+.06*Math.cos(z*1.15)+.035*Math.sin((x+z)*1.2);}
const P=Object.fromEntries(Object.entries(XZ).map(([id,[x,z]])=>[id,[x,terrainY(x,z)+.07,z]]));

function labelSprite(text){
  const c=document.createElement('canvas');c.width=640;c.height=116;const x=c.getContext('2d');
  x.fillStyle='rgba(37,55,39,.82)';x.strokeStyle='rgba(200,224,185,.35)';x.lineWidth=3;x.roundRect(18,18,604,76,18);x.fill();x.stroke();
  x.font='700 24px ui-sans-serif,system-ui';x.fillStyle='#f3f7e8';x.textAlign='center';x.textBaseline='middle';x.fillText(text,320,56);
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;
  const s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true,depthWrite:false}));s.scale.set(1.55,.28,1);s.position.set(0,1.48,.02);s.userData.label=true;return s;
}

function station(root,p,m,name){
  const g=new THREE.Group();g.position.set(...p);root.add(g);
  const pad=add(g,new THREE.CylinderGeometry(.72,.8,.05,32),m.soil,[0,.01,0]);pad.receiveShadow=true;
  const statusMat=new THREE.MeshStandardMaterial({color:STATUS.IDLE,emissive:STATUS.IDLE,emissiveIntensity:.2,roughness:.55,metalness:.02});
  const indicator=ring(g,statusMat,[0,.07,0],.7,.025);indicator.rotation.x=Math.PI/2;
  const lantern=add(g,new THREE.SphereGeometry(.055,10,8),statusMat,[.55,.2,.48]);
  const label=labelSprite(name);g.add(label);
  return{group:g,indicator,statusMat,lantern,label};
}

function roof(g,m,p=[0,.88,0],scale=[1,.7,1]){const r=add(g,new THREE.ConeGeometry(.8,.42,4),m.roof,p);r.rotation.y=Math.PI/4;r.scale.set(...scale);return r;}
function windowPane(g,m,p,s=[.2,.2,.04]){const pane=box(g,m.glass,p,s);const frame=box(g,m.wood,[p[0],p[1],p[2]-.025],[s[0]+.04,s[1]+.04,.025]);frame.renderOrder=-1;return pane;}
function crate(g,m,p,s=.18){box(g,m.wood,p,[s,s,s]);rod(g,m.rope,[p[0]-s*.42,p[1]+s*.52,p[2]+s*.51],[p[0]+s*.42,p[1]+s*.52,p[2]+s*.51],.009);}

function forestGate(r,p,m){
  const s=station(r,p,m,N.upload);
  for(const x of[-.5,.5]){box(s.group,m.wood,[x,.58,0],[.16,1.08,.18]);box(s.group,m.stone,[x,.12,0],[.28,.18,.32]);}
  box(s.group,m.wood,[0,1.05,0],[1.18,.16,.2]);
  const sign=box(s.group,m.sign,[0,1.22,.02],[.72,.24,.08]);sign.rotation.z=-.02;
  rod(s.group,m.rope,[-.33,.88,.12],[.33,.88,.12],.02);
  for(const x of[-.68,.68])add(s.group,new THREE.ConeGeometry(.16,.48,7),m.leaf,[x,.25,.16]);
  return s;
}

function archiveHut(r,p,m){
  const s=station(r,p,m,N.read);
  box(s.group,m.cream,[0,.48,0],[1.1,.78,.82]);roof(s.group,m,[0,.98,0],[1.08,.78,1.08]);
  box(s.group,m.wood,[0,.36,.45],[.3,.55,.06]);windowPane(s.group,m,[-.36,.58,.44]);windowPane(s.group,m,[.36,.58,.44]);
  box(s.group,m.wood,[.48,.83,-.22],[.12,.7,.12]);add(s.group,new THREE.CylinderGeometry(.08,.1,.28,8),m.stone,[.48,1.12,-.22]);
  box(s.group,m.wood,[0,.1,.54],[.92,.1,.34]);for(const x of[-.37,.37])box(s.group,m.wood,[x,.02,.54],[.08,.22,.08]);
  crate(s.group,m,[-.57,.17,.16],.17);
  return s;
}

function insightTree(r,p,m){
  const s=station(r,p,m,N.extract);
  const trunk=add(s.group,new THREE.CylinderGeometry(.22,.36,1.3,12),m.bark,[0,.63,0]);trunk.rotation.z=-.025;
  for(const [a,b] of[[[-.08,.92,0],[-.58,1.35,.02]],[[.06,1.02,0],[.56,1.48,-.05]],[[0,.82,.02],[.08,1.5,.38]]])rod(s.group,m.bark,a,b,.08,.12);
  for(const [x,z] of[[-.2,.05],[.2,.05],[0,-.18]])rod(s.group,m.root,[x,.12,z],[x*2.2,.02,z*2.2],.045,.075);
  const crown=new THREE.Group();crown.position.y=1.37;s.group.add(crown);
  const crownParts=[[-.42,.12,.02,.48],[.38,.1,-.06,.5],[0,.38,.02,.56],[-.06,.06,.4,.42],[.06,.08,-.38,.4]];
  for(const [x,y,z,sc] of crownParts){const o=add(crown,new THREE.IcosahedronGeometry(1,1),m.heroLeaf,[x,y,z]);o.scale.set(sc,sc*.9,sc);}
  const orb=add(s.group,new THREE.SphereGeometry(.14,20,14),m.glow,[0,1.28,.52]);
  const halo=ring(s.group,m.glow,[0,1.29,.52],.27,.012);halo.rotation.y=Math.PI/2;
  const rune=ring(s.group,m.rune,[0,.2,0],.5,.012);rune.rotation.x=Math.PI/2;
  const motes=[];for(let i=0;i<8;i++){const a=i/8*Math.PI*2,o=add(s.group,new THREE.SphereGeometry(.022,7,6),m.wisp,[Math.cos(a)*.52,.92+(i%3)*.18,Math.sin(a)*.52]);motes.push(o);}
  s.animated={crown,orb,halo,rune,motes};return s;
}

function forkedTrail(r,p,m){
  const s=station(r,p,m,N.confidence);
  rod(s.group,m.wood,[0,.16,0],[0,1.14,0],.05);
  rod(s.group,m.wood,[0,.84,0],[-.48,1.03,-.08],.04);rod(s.group,m.wood,[0,.7,0],[.48,.9,.08],.04);
  const left=box(s.group,m.sign,[-.43,1.06,-.08],[.62,.18,.08]);left.rotation.z=.04;
  const right=box(s.group,m.sign,[.43,.93,.08],[.62,.18,.08]);right.rotation.z=-.04;
  add(s.group,new THREE.CylinderGeometry(.09,.12,.22,9),m.stone,[0,.1,0]);
  const charm=add(s.group,new THREE.OctahedronGeometry(.15,0),m.glow,[0,1.28,0]);
  for(const x of[-.72,.72])add(s.group,new THREE.DodecahedronGeometry(.14,0),m.rock,[x,.08,.15]);
  s.animated={charm};return s;
}

function reviewCamp(r,p,m){
  const s=station(r,p,m,N.review);
  const tent=add(s.group,new THREE.ConeGeometry(.72,.86,4),m.canvas,[0,.5,0]);tent.rotation.y=Math.PI/4;
  box(s.group,m.dark,[0,.36,.51],[.27,.44,.05]);
  const awning=box(s.group,m.canvas,[0,.72,.54],[.68,.04,.38]);awning.rotation.x=-.16;
  for(const x of[-.27,.27])rod(s.group,m.wood,[x,.56,.47],[x,.26,.75],.02);
  box(s.group,m.wood,[-.58,.18,.02],[.48,.08,.18]);for(const x of[-.72,-.44])rod(s.group,m.wood,[x,.16,-.05],[x,.02,-.05],.025);
  const fire=add(s.group,new THREE.ConeGeometry(.075,.2,7),m.waiting,[.5,.16,.22]);
  for(let i=0;i<8;i++){const a=i/8*Math.PI*2;add(s.group,new THREE.DodecahedronGeometry(.045,0),m.rock,[.5+Math.cos(a)*.14,.045,.22+Math.sin(a)*.14]);}
  const hold=ring(s.group,m.waiting,[0,.1,0],.52,.032);hold.rotation.x=Math.PI/2;s.animated={fire,hold};return s;
}

function lookout(r,p,m){
  const s=station(r,p,m,N.decision);
  box(s.group,m.wood,[0,.57,0],[1.08,.12,.86]);
  for(const x of[-.44,.44])for(const z of[-.34,.34])box(s.group,m.wood,[x,.31,z],[.09,.58,.09]);
  for(const x of[-.44,.44])rod(s.group,m.wood,[x,.65,-.36],[x,.65,.36],.022);rod(s.group,m.wood,[-.44,.65,.36],[.44,.65,.36],.022);
  rod(s.group,m.wood,[0,.64,0],[0,1.35,0],.025);
  const flag=box(s.group,m.success,[.17,1.18,0],[.34,.2,.035]);flag.rotation.z=-.04;
  box(s.group,m.wood,[.62,.22,.18],[.38,.06,.16]);rod(s.group,m.wood,[.5,.2,.18],[.5,.02,.18],.025);rod(s.group,m.wood,[.74,.2,.18],[.74,.02,.18],.025);
  return s;
}

function outputLodge(r,p,m){
  const s=station(r,p,m,N.export);
  box(s.group,m.cream,[0,.48,0],[1.14,.8,.9]);roof(s.group,m,[0,1.0,0],[1.08,.82,1.1]);
  box(s.group,m.wood,[0,.42,.48],[.3,.52,.06]);windowPane(s.group,m,[-.38,.6,.47]);windowPane(s.group,m,[.38,.6,.47]);
  box(s.group,m.wood,[0,.12,.62],[1.0,.09,.32]);for(const x of[-.42,.42])box(s.group,m.wood,[x,.03,.62],[.08,.25,.08]);
  crate(s.group,m,[.65,.15,.13],.2);crate(s.group,m,[.82,.13,-.08],.16);
  const lantern=add(s.group,new THREE.SphereGeometry(.06,10,8),m.success,[0,.77,.5]);lantern.material.emissive=new THREE.Color('#3a8f65');lantern.material.emissiveIntensity=.5;
  return s;
}

function shadowGrove(r,p,m){
  const s=station(r,p,m,N.exception);
  for(const [x,z,h,lean] of[[-.34,-.12,1.0,-.12],[.22,.1,1.22,.1],[.5,-.26,.88,-.08]]){const trunk=add(s.group,new THREE.CylinderGeometry(.07,.12,h,8),m.dark,[x,h*.5,z]);trunk.rotation.z=lean;add(s.group,new THREE.IcosahedronGeometry(.25,0),m.shadowLeaf,[x+lean*.2,h+.03,z]);}
  const cave=add(s.group,new THREE.TorusGeometry(.4,.15,8,20,Math.PI),m.rock,[0,.3,.38]);cave.rotation.z=Math.PI;
  box(s.group,m.dark,[0,.18,.42],[.62,.4,.12]);
  const ember=add(s.group,new THREE.SphereGeometry(.075,10,8),m.failed,[0,.3,.49]);
  for(const q of[[-.55,.08,.28],[.56,.06,.18],[-.3,.05,.64]])add(s.group,new THREE.DodecahedronGeometry(.1,0),m.rock,q);
  s.animated={ember};return s;
}

function ribbonGeometry(curve,width,yOffset=.014,segments=34){
  const positions=[],uvs=[],indices=[];let prev=new THREE.Vector3();
  for(let i=0;i<=segments;i++){
    const t=i/segments,p=curve.getPoint(t),p2=curve.getPoint(Math.min(1,t+1/segments));
    if(i===segments)p2.copy(p).sub(prev).add(p);prev.copy(p);
    const tangent=p2.clone().sub(p).setY(0).normalize(),side=new THREE.Vector3(-tangent.z,0,tangent.x).multiplyScalar(width*.5);
    const y=terrainY(p.x,p.z)+yOffset;
    positions.push(p.x-side.x,y,p.z-side.z,p.x+side.x,y,p.z+side.z);uvs.push(0,t,1,t);
    if(i<segments){const a=i*2,b=a+1,c=a+2,d=a+3;indices.push(a,c,b,b,c,d);}
  }
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));g.setIndex(indices);g.computeVertexNormals();return g;
}

function makeTrail(root,from,to,m,id,route){
  const a=new THREE.Vector3(from[0],0,from[2]),b=new THREE.Vector3(to[0],0,to[2]),mid=a.clone().lerp(b,.5);
  mid.z+=(route==='low-confidence'||route==='rejected')?-.3:(route==='high-confidence'||route==='approved')?.26:0;
  const curve=new THREE.CatmullRomCurve3([a,mid,b]);
  const mesh=add(root,ribbonGeometry(curve,.23,.018),m.path);mesh.receiveShadow=true;
  const glow=add(root,ribbonGeometry(curve,.055,.027),m.pathGlow);glow.visible=false;
  const wisp=add(root,new THREE.SphereGeometry(.06,9,7),m.wisp);wisp.visible=false;
  return{id,route,curve,mesh,glow,wisp,offset:Math.random()};
}

function makeTerrain(root,m){
  const geo=new THREE.PlaneGeometry(16.6,8.7,52,28);geo.rotateX(-Math.PI/2);const pos=geo.attributes.position;
  for(let i=0;i<pos.count;i++)pos.setY(i,terrainY(pos.getX(i),pos.getZ(i))-.055);pos.needsUpdate=true;geo.computeVertexNormals();
  const ground=add(root,geo,m.ground);ground.receiveShadow=true;
  for(const [x,z,sx,sy,sz] of[[-4.8,-3.0,3.2,.7,1.7],[1.0,-3.55,4.5,.95,1.8],[5.7,-3.1,2.7,.65,1.5]]){
    const hill=add(root,new THREE.SphereGeometry(1,18,10),m.hill,[x,terrainY(x,z)-.35,z],[sx,sy,sz]);hill.receiveShadow=true;
  }
  const waterCurve=new THREE.CatmullRomCurve3([new THREE.Vector3(-1.8,0,2.85),new THREE.Vector3(1.0,0,2.45),new THREE.Vector3(3.4,0,2.7),new THREE.Vector3(6.2,0,2.25)]);
  const water=add(root,ribbonGeometry(waterCurve,.48,.012,44),m.water);water.renderOrder=1;
  for(let i=-3;i<=3;i++){const x=4.1+i*.12,z=2.3+i*.015,y=terrainY(x,z)+.09;const plank=box(root,m.wood,[x,y,z],[.1,.045,.62]);plank.rotation.y=.05;}
}

function addForest(root,m){
  const dummy=new THREE.Object3D();
  const trunkGeo=new THREE.CylinderGeometry(.055,.095,.62,7),pineGeo=new THREE.ConeGeometry(.27,.82,7),broadGeo=new THREE.IcosahedronGeometry(.29,1);
  const trunks=new THREE.InstancedMesh(trunkGeo,m.bark,80),pines=new THREE.InstancedMesh(pineGeo,m.forest,34),broad=new THREE.InstancedMesh(broadGeo,m.leaf,24);
  let ti=0,pi=0,bi=0;
  for(let k=0;k<80&&(pi<34||bi<24);k++){
    const x=-7.1+(k*2.73%14.2),z=-3.45+(k*1.79%6.9);const nearNode=Object.values(XZ).some(([nx,nz])=>(x-nx)**2+(z-nz)**2<.72);if(nearNode)continue;
    const scale=.72+(k%7)*.055,y=terrainY(x,z);
    dummy.position.set(x,y+.3,z);dummy.scale.set(scale,scale,scale);dummy.rotation.y=k*.73;dummy.updateMatrix();trunks.setMatrixAt(ti,dummy.matrix);
    dummy.position.y=y+.72;dummy.rotation.y=k*.51;dummy.updateMatrix();
    if(k%3===0&&bi<24)broad.setMatrixAt(bi++,dummy.matrix);else if(pi<34)pines.setMatrixAt(pi++,dummy.matrix);ti++;
  }
  trunks.count=ti;pines.count=pi;broad.count=bi;trunks.castShadow=trunks.receiveShadow=true;pines.castShadow=true;broad.castShadow=true;root.add(trunks,pines,broad);

  const rockGeo=new THREE.DodecahedronGeometry(.12,0),rocks=new THREE.InstancedMesh(rockGeo,m.rock,24);
  for(let j=0;j<24;j++){const x=-6.7+(j*3.17%13.4),z=-2.9+(j*1.57%5.8),y=terrainY(x,z);dummy.position.set(x,y+.06,z);dummy.scale.set(1+(j%3)*.24,.62+(j%2)*.16,.8+(j%4)*.1);dummy.rotation.set(j*.2,j*.62,0);dummy.updateMatrix();rocks.setMatrixAt(j,dummy.matrix);}rocks.castShadow=rocks.receiveShadow=true;root.add(rocks);

  const shrubGeo=new THREE.IcosahedronGeometry(.1,0),shrubs=new THREE.InstancedMesh(shrubGeo,m.shrub,38);
  for(let j=0;j<38;j++){const x=-7+(j*2.41%14),z=-3.15+(j*1.33%6.3),y=terrainY(x,z);dummy.position.set(x,y+.08,z);const sc=.6+(j%5)*.12;dummy.scale.set(sc*1.5,sc,sc*1.25);dummy.rotation.y=j*.9;dummy.updateMatrix();shrubs.setMatrixAt(j,dummy.matrix);}shrubs.castShadow=true;root.add(shrubs);

  const grassGeo=new THREE.ConeGeometry(.025,.18,4),grass=new THREE.InstancedMesh(grassGeo,m.grass,72);
  for(let j=0;j<72;j++){const x=-7.2+(j*1.91%14.4),z=-3.25+(j*1.21%6.5),y=terrainY(x,z);dummy.position.set(x,y+.08,z);const sc=.65+(j%4)*.12;dummy.scale.set(sc,sc,sc);dummy.rotation.y=j*.7;dummy.updateMatrix();grass.setMatrixAt(j,dummy.matrix);}grass.castShadow=false;root.add(grass);
}

function setStatus(s,status,t){
  const color=STATUS[status]||STATUS.IDLE;s.statusMat.color.set(color);s.statusMat.emissive.set(color);
  s.statusMat.emissiveIntensity=status==='RUNNING'?.8+Math.sin(t*5)*.2:status==='WAITING'?.58+Math.sin(t*2)*.18:status==='FAILED'?.8:.22;
  const active=['RUNNING','WAITING','FAILED'].includes(status);s.lantern.scale.setScalar(active?1.18+Math.sin(t*4)*.08:1);
}

export async function createRenyroForestTrail(){
  const group=new THREE.Group(),m={
    ground:material('#436f50',.94,.01),hill:material('#365b43',.95,.01),soil:material('#6d7652',.9,.01),path:material('#9b8055',.94,.01),pathGlow:new THREE.MeshStandardMaterial({color:'#9bc07e',emissive:'#4d7f59',emissiveIntensity:.8,roughness:.55}),
    wood:material('#765239',.84,.03),bark:material('#5b3e2d',.9,.02),root:material('#674733',.92,.01),cream:material('#d5c59b',.88,.01),roof:material('#4d6a50',.84,.02),forest:material('#4c7653',.92,.01),leaf:material('#719767',.9,.01),heroLeaf:material('#6f9f6b',.78,.02),shadowLeaf:material('#29463a',.95,.01),shrub:material('#5d815b',.94,.01),grass:material('#78966a',.96,.01),rock:material('#6e7a71',.94,.02),stone:material('#8b8f7c',.92,.02),sign:material('#d1b574',.82,.02),canvas:material('#aaa078',.92,.01),dark:material('#27362e',.9,.02),rope:material('#b79c6b',.8,.02),glass:new THREE.MeshPhysicalMaterial({color:'#9fd8c8',transparent:true,opacity:.32,depthWrite:false,roughness:.2}),success:material('#75d39b',.5,.03),failed:material('#ff7777',.5,.03),waiting:new THREE.MeshStandardMaterial({color:'#7ab2ff',emissive:'#3f78c7',emissiveIntensity:.75,roughness:.45}),glow:new THREE.MeshStandardMaterial({color:'#d4ffe8',emissive:'#70dda6',emissiveIntensity:1.5,roughness:.16}),rune:new THREE.MeshStandardMaterial({color:'#b9e9c3',emissive:'#61b880',emissiveIntensity:.9,roughness:.25}),wisp:new THREE.MeshStandardMaterial({color:'#f4ffe9',emissive:'#99e8a9',emissiveIntensity:1.55,roughness:.12}),water:new THREE.MeshPhysicalMaterial({color:'#6eaaa0',transparent:true,opacity:.62,roughness:.22,metalness:.05,depthWrite:false})
  };
  makeTerrain(group,m);addForest(group,m);
  const stations=new Map([['upload',forestGate(group,P.upload,m)],['read',archiveHut(group,P.read,m)],['extract',insightTree(group,P.extract,m)],['confidence',forkedTrail(group,P.confidence,m)],['review',reviewCamp(group,P.review,m)],['decision',lookout(group,P.decision,m)],['export',outputLodge(group,P.export,m)],['exception',shadowGrove(group,P.exception,m)]]);
  const trails=workflow.edges_json.map(e=>makeTrail(group,P[e.source],P[e.target],m,e.id,e.route));
  let frameIndex=0,autoplay=true,labels=true,frameClock=0,elapsed=0,model=projectRenyroState(workflow,executionFrames[0]);
  const apply=()=>{model=projectRenyroState(workflow,executionFrames[frameIndex]);frameClock=0;};
  const update=dt=>{
    elapsed+=dt;if(autoplay&&dt>0){frameClock+=dt;if(frameClock>2.5){frameIndex=(frameIndex+1)%executionFrames.length;apply();}}
    const active=activeEdgeIds(model);for(const n of model.nodes){const s=stations.get(n.id);setStatus(s,n.status,elapsed);s.label.visible=labels;}
    const tree=stations.get('extract').animated;tree.crown.rotation.y+=dt*.055;tree.orb.position.y=1.28+Math.sin(elapsed*2.15)*.045;tree.halo.rotation.z+=dt*.4;tree.rune.rotation.z-=dt*.08;tree.motes.forEach((o,i)=>{o.position.y=.92+(i%3)*.18+Math.sin(elapsed*1.6+i)*.035;});
    stations.get('confidence').animated.charm.rotation.y+=dt*.65;
    const review=stations.get('review').animated,waiting=model.nodes.find(n=>n.id==='review')?.status==='WAITING';review.hold.scale.setScalar(waiting?1+Math.sin(elapsed*2)*.07:1);review.fire.scale.y=1+Math.sin(elapsed*6)*.08;
    const exc=stations.get('exception').animated.ember;exc.material.emissiveIntensity=model.nodes.find(n=>n.id==='exception')?.status==='FAILED'?1.6:.28;
    for(const t of trails){const on=active.has(t.id);t.glow.visible=on;t.wisp.visible=on;if(on){const q=(elapsed*.15+t.offset)%1,p=t.curve.getPoint(q);t.wisp.position.set(p.x,terrainY(p.x,p.z)+.12,p.z);}}
    return true;
  };
  return{group,stage:false,update,needsAnimation:()=>true,title:'Renyro Forest Trail Workflow',description:'A refined low-poly forest operations trail: Renyro stages become distinctive ranger stations, execution travels as luminous wisps, and the confidence branch is embedded in a readable natural landscape.',note:'Skill-driven visual study only. Nature elements are illustrative; workflow IDs, edges, execution statuses, durations, and branch routes remain authoritative.',craft:'Final refinement after visible-browser evidence: terrain was reshaped, trails rebuilt as ground ribbons, vegetation diversified and instanced, the Ancient Insight Tree promoted to a hero object, station identity strengthened, and labels made less debug-like.',lighting:{exposure:1.08,environment:.48,key:9.6,fill:3.8,rim:7.2,contact:1.0,keyColor:'#ffe6b6',fillColor:'#a8cbb7'},controls:[{type:'select',label:'Execution frame',options:executionFrames.map((_,i)=>({value:String(i),label:`${i+1} · ${['Trailhead','Archive','Insight tree','Review camp hold','Decision lookout','Output path','Complete'][i]}`})),get:()=>String(frameIndex),set:v=>{frameIndex=Number(v);apply();}},{type:'button',getLabel:()=>`Next frame (${frameIndex+1}/${executionFrames.length})`,set:()=>{frameIndex=(frameIndex+1)%executionFrames.length;apply();}},{type:'button',getLabel:()=>`Autoplay: ${autoplay?'on':'off'}`,set:()=>{autoplay=!autoplay;frameClock=0;}},{type:'button',getLabel:()=>`Labels: ${labels?'on':'off'}`,set:()=>{labels=!labels;}}],stats:()=>{const a=activeNode(model),success=model.nodes.filter(n=>n.status==='SUCCESS').length,waiting=model.nodes.filter(n=>n.status==='WAITING').length;return[{label:'Frame',value:`${frameIndex+1}/${executionFrames.length}`},{label:'Execution',value:model.executionStatus||'—'},{label:'Active station',value:a?N[a.id]:'Complete'},{label:'Success / waiting',value:`${success} / ${waiting}`}];},reset:()=>{frameIndex=0;autoplay=true;labels=true;apply();}};
}

createRenyroForestTrail.views={
  overview:{position:[8.7,5.35,10.8],target:[.15,-1.72,.05]},
  detail:{position:[4.95,1.75,-5.7],target:[2.6,-1.62,-1.28]},
  source:{position:[-4.25,1.8,5.4],target:[-2.05,-1.5,.2]}
};
