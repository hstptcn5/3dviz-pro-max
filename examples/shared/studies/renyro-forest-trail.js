import {THREE, add, box, material, rod, ring} from '../breadth/src/craft-forms.js';
import {workflow, executionFrames} from '../../renyro-execution-observatory/fixture.js';
import {activeEdgeIds, activeNode, projectRenyroState} from '../../renyro-execution-observatory/model.js';

const STATUS={RUNNING:'#f2c86b',SUCCESS:'#75d39b',WAITING:'#7ab2ff',FAILED:'#ff7777',SKIPPED:'#71807a',IDLE:'#5c766b'};
const P={
  upload:[-5.35,-2.25,.35],read:[-3.75,-2.25,-.35],extract:[-2.05,-2.25,.2],confidence:[-.15,-2.25,0],
  review:[1.9,-2.25,-1.55],decision:[3.75,-2.25,-1.25],export:[4.45,-2.25,1.45],exception:[5.8,-2.25,-1.7]
};
const N={upload:'FOREST GATE',read:'RANGER ARCHIVE HUT',extract:'ANCIENT INSIGHT TREE',confidence:'FORKED TRAIL',review:'REVIEW CAMP',decision:'DECISION LOOKOUT',export:'OUTPUT LODGE',exception:'SHADOW GROVE'};

function labelSprite(text){
  const c=document.createElement('canvas');c.width=640;c.height=110;const x=c.getContext('2d');
  x.fillStyle='rgba(10,24,18,.82)';x.roundRect(12,18,616,70,18);x.fill();
  x.font='700 25px ui-sans-serif,system-ui';x.fillStyle='#eff8e9';x.textAlign='center';x.textBaseline='middle';x.fillText(text,320,53);
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;
  const s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true,depthWrite:false}));s.scale.set(1.95,.34,1);s.position.y=1.55;return s;
}

function station(root,p,m,name){
  const g=new THREE.Group();g.position.set(...p);root.add(g);
  const pad=add(g,new THREE.CylinderGeometry(.69,.77,.055,28),m.soil,[0,.01,0]);pad.receiveShadow=true;
  const statusMat=new THREE.MeshStandardMaterial({color:STATUS.IDLE,emissive:STATUS.IDLE,emissiveIntensity:.18,roughness:.5,metalness:.05});
  const indicator=ring(g,statusMat,[0,.08,0],.69,.028);indicator.rotation.x=Math.PI/2;g.add(labelSprite(name));
  return{group:g,indicator,statusMat};
}
function roof(g,m,p=[0,.82,0],scale=[1.05,.32,.86]){const r=add(g,new THREE.ConeGeometry(.78,.42,4),m.roof,p);r.rotation.y=Math.PI/4;r.scale.set(...scale);return r;}
function forestGate(r,p,m){const s=station(r,p,m,N.upload);box(s.group,m.wood,[-.48,.56,0],[.14,1.02,.18]);box(s.group,m.wood,[.48,.56,0],[.14,1.02,.18]);box(s.group,m.wood,[0,1.02,0],[1.08,.14,.18]);rod(s.group,m.rope,[-.34,.82,.1],[.34,.82,.1],.018);box(s.group,m.sign,[0,1.18,.03],[.68,.22,.08]);return s;}
function archiveHut(r,p,m){const s=station(r,p,m,N.read);box(s.group,m.cream,[0,.48,0],[1.05,.78,.82]);roof(s.group,m,[0,.96,0],[1,.75,1]);box(s.group,m.dark,[0,.42,.43],[.28,.48,.07]);for(const x of[-.35,.35])box(s.group,m.glass,[x,.57,.43],[.2,.2,.06]);return s;}
function insightTree(r,p,m){const s=station(r,p,m,N.extract);add(s.group,new THREE.CylinderGeometry(.18,.28,1.12,10),m.wood,[0,.58,0]);const crown=new THREE.Group();crown.position.y=1.05;s.group.add(crown);for(const q of[[0,.22,0],[-.3,.05,.06],[.28,.08,-.08],[0,.08,.28]])add(crown,new THREE.IcosahedronGeometry(.42,1),m.leaf,q);const orb=add(s.group,new THREE.SphereGeometry(.13,16,12),m.glow,[0,1.06,.42]);const halo=ring(s.group,m.glow,[0,1.07,.42],.24,.012);halo.rotation.y=Math.PI/2;s.animated={crown,orb,halo};return s;}
function forkedTrail(r,p,m){const s=station(r,p,m,N.confidence);rod(s.group,m.wood,[0,.18,0],[0,1.1,0],.045);rod(s.group,m.wood,[0,.86,0],[-.42,1.02,-.1],.035);rod(s.group,m.wood,[0,.7,0],[.42,.88,.1],.035);box(s.group,m.sign,[-.38,1.06,-.1],[.58,.17,.08]);box(s.group,m.sign,[.39,.92,.1],[.58,.17,.08]);const charm=add(s.group,new THREE.OctahedronGeometry(.16,0),m.glow,[0,1.25,0]);s.animated={charm};return s;}
function reviewCamp(r,p,m){const s=station(r,p,m,N.review);const tent=add(s.group,new THREE.ConeGeometry(.68,.8,4),m.canvas,[0,.48,0]);tent.rotation.y=Math.PI/4;box(s.group,m.dark,[0,.35,.49],[.25,.42,.05]);const fire=add(s.group,new THREE.ConeGeometry(.08,.22,7),m.waiting,[.46,.2,.18]);const hold=ring(s.group,m.waiting,[0,.12,0],.5,.035);hold.rotation.x=Math.PI/2;s.animated={fire,hold};return s;}
function lookout(r,p,m){const s=station(r,p,m,N.decision);box(s.group,m.wood,[0,.55,0],[1.02,.12,.82]);for(const x of[-.42,.42])for(const z of[-.31,.31])box(s.group,m.wood,[x,.3,z],[.09,.55,.09]);for(const x of[-.42,.42])rod(s.group,m.wood,[x,.62,-.34],[x,.62,.34],.025);rod(s.group,m.wood,[-.42,.62,.34],[.42,.62,.34],.025);rod(s.group,m.wood,[0,.62,0],[0,1.25,0],.025);box(s.group,m.success,[.15,1.08,0],[.3,.18,.04]);return s;}
function outputLodge(r,p,m){const s=station(r,p,m,N.export);box(s.group,m.cream,[0,.48,0],[1.1,.8,.86]);roof(s.group,m,[0,.98,0],[1.05,.8,1.05]);box(s.group,m.dark,[0,.43,.46],[.3,.5,.06]);for(const x of[-.36,.36])box(s.group,m.glass,[x,.58,.46],[.2,.2,.05]);box(s.group,m.wood,[.62,.2,.05],[.28,.26,.32]);return s;}
function shadowGrove(r,p,m){const s=station(r,p,m,N.exception);for(const [x,z,h] of[[-.32,-.12,.95],[.22,.1,1.18],[.45,-.25,.82]]){add(s.group,new THREE.CylinderGeometry(.07,.1,h,8),m.dark,[x,h*.5,z]);add(s.group,new THREE.IcosahedronGeometry(.24,0),m.shadowLeaf,[x,h+.04,z]);}const cave=add(s.group,new THREE.TorusGeometry(.38,.14,8,18,Math.PI),m.rock,[0,.28,.36]);cave.rotation.z=Math.PI;const ember=add(s.group,new THREE.SphereGeometry(.08,10,8),m.failed,[0,.28,.38]);s.animated={ember};return s;}

function makeTrail(root,from,to,m,id,route){
  const a=new THREE.Vector3(...from).add(new THREE.Vector3(0,.09,0)),b=new THREE.Vector3(...to).add(new THREE.Vector3(0,.09,0));
  const mid=a.clone().lerp(b,.5);mid.y+=.015;mid.z+=(route==='low-confidence'||route==='rejected')?-.24:(route==='high-confidence'||route==='approved')?.22:0;
  const curve=new THREE.CatmullRomCurve3([a,mid,b]);
  const mesh=add(root,new THREE.TubeGeometry(curve,28,.055,6,false),m.path);
  const glow=add(root,new THREE.TubeGeometry(curve,28,.018,5,false),m.pathGlow);glow.visible=false;
  const wisp=add(root,new THREE.SphereGeometry(.065,9,7),m.wisp);wisp.visible=false;
  return{id,route,curve,mesh,glow,wisp,offset:Math.random()};
}

function addForest(root,m){
  const ground=add(root,new THREE.CylinderGeometry(7.8,8.1,.16,64),m.ground,[.25,-2.42,0]);ground.receiveShadow=true;
  const trunkGeo=new THREE.CylinderGeometry(.055,.085,.55,7),crownGeo=new THREE.ConeGeometry(.25,.72,7),trunks=new THREE.InstancedMesh(trunkGeo,m.wood,44),crowns=new THREE.InstancedMesh(crownGeo,m.forest,44),dummy=new THREE.Object3D();
  let i=0;for(let k=0;k<52&&i<44;k++){const x=-6.6+(k*2.17%13.2),z=-2.55+(k*1.43%5.1);if(Math.abs(z)<.75&&x>-5.8&&x<5.5)continue;const scale=.78+(k%5)*.07;dummy.position.set(x,-2.02,z);dummy.scale.set(scale,scale,scale);dummy.rotation.y=k*.77;dummy.updateMatrix();trunks.setMatrixAt(i,dummy.matrix);dummy.position.y=-1.53;dummy.updateMatrix();crowns.setMatrixAt(i,dummy.matrix);i++;}
  trunks.count=crowns.count=i;trunks.castShadow=trunks.receiveShadow=true;crowns.castShadow=true;root.add(trunks,crowns);
  const rockGeo=new THREE.DodecahedronGeometry(.13,0),rocks=new THREE.InstancedMesh(rockGeo,m.rock,18);for(let j=0;j<18;j++){dummy.position.set(-6+(j*3.11%12),-2.27,-2.3+(j*1.71%4.6));dummy.scale.set(1+(j%3)*.25,.65+(j%2)*.2,.8+(j%4)*.1);dummy.rotation.set(j*.2,j*.6,0);dummy.updateMatrix();rocks.setMatrixAt(j,dummy.matrix);}rocks.castShadow=rocks.receiveShadow=true;root.add(rocks);
}

function setStatus(s,status,t){const color=STATUS[status]||STATUS.IDLE;s.statusMat.color.set(color);s.statusMat.emissive.set(color);s.statusMat.emissiveIntensity=status==='RUNNING'?.72+Math.sin(t*5)*.2:status==='WAITING'?.5+Math.sin(t*2)*.2:status==='FAILED'?.72:.18;}

export async function createRenyroForestTrail(){
  const group=new THREE.Group(),m={
    ground:material('#40644b',.92,.02),soil:material('#5c6f50',.88,.02),path:material('#826e4d',.92,.01),pathGlow:new THREE.MeshStandardMaterial({color:'#6f9677',emissive:'#315f46',emissiveIntensity:.7,roughness:.55}),
    wood:material('#6a4b32',.82,.03),cream:material('#c8b88d',.86,.01),roof:material('#46634c',.8,.02),forest:material('#4f7654',.9,.01),leaf:material('#6f9965',.86,.01),shadowLeaf:material('#304c3c',.92,.01),rock:material('#66736b',.92,.03),sign:material('#d1b674',.8,.02),canvas:material('#9f9b72',.9,.01),dark:material('#28352d',.86,.02),rope:material('#b49a65',.78,.02),glass:new THREE.MeshPhysicalMaterial({color:'#8fd3c4',transparent:true,opacity:.35,depthWrite:false,roughness:.18}),success:material('#75d39b',.5,.03),failed:material('#ff7777',.5,.03),waiting:new THREE.MeshStandardMaterial({color:'#7ab2ff',emissive:'#3f78c7',emissiveIntensity:.75,roughness:.45}),glow:new THREE.MeshStandardMaterial({color:'#c8ffe4',emissive:'#65dba4',emissiveIntensity:1.35,roughness:.2}),wisp:new THREE.MeshStandardMaterial({color:'#f1ffe8',emissive:'#8ee0a6',emissiveIntensity:1.4,roughness:.15})
  };
  addForest(group,m);
  const stations=new Map([['upload',forestGate(group,P.upload,m)],['read',archiveHut(group,P.read,m)],['extract',insightTree(group,P.extract,m)],['confidence',forkedTrail(group,P.confidence,m)],['review',reviewCamp(group,P.review,m)],['decision',lookout(group,P.decision,m)],['export',outputLodge(group,P.export,m)],['exception',shadowGrove(group,P.exception,m)]]);
  const trails=workflow.edges_json.map(e=>makeTrail(group,P[e.source],P[e.target],m,e.id,e.route));
  let frameIndex=0,autoplay=true,frameClock=0,elapsed=0,model=projectRenyroState(workflow,executionFrames[0]);const apply=()=>{model=projectRenyroState(workflow,executionFrames[frameIndex]);frameClock=0;};
  const update=dt=>{elapsed+=dt;if(autoplay&&dt>0){frameClock+=dt;if(frameClock>2.4){frameIndex=(frameIndex+1)%executionFrames.length;apply();}}const active=activeEdgeIds(model);for(const n of model.nodes)setStatus(stations.get(n.id),n.status,elapsed);
    const tree=stations.get('extract').animated;tree.crown.rotation.y+=dt*.08;tree.orb.position.y=1.06+Math.sin(elapsed*2.2)*.045;tree.halo.rotation.z+=dt*.45;stations.get('confidence').animated.charm.rotation.y+=dt*.7;
    const review=stations.get('review').animated,waiting=model.nodes.find(n=>n.id==='review')?.status==='WAITING';review.hold.scale.setScalar(waiting?1+Math.sin(elapsed*2)*.07:1);review.fire.scale.y=1+Math.sin(elapsed*6)*.08;
    const exc=stations.get('exception').animated.ember;exc.material.emissiveIntensity=model.nodes.find(n=>n.id==='exception')?.status==='FAILED'?1.5:.25;
    for(const t of trails){const on=active.has(t.id);t.glow.visible=on;t.wisp.visible=on;if(on)t.wisp.position.copy(t.curve.getPoint((elapsed*.16+t.offset)%1));}return true;};
  return{group,stage:false,update,needsAnimation:()=>true,title:'Renyro Forest Trail Workflow',description:'A calm low-poly forest trail where Renyro workflow stages become distinct ranger stations, execution moves as luminous wisps, and the confidence split becomes a literal fork in the path.',note:'Bounded skill-driven study only. The forest is a visual projection; Renyro workflow IDs, edges, execution status, and durations remain authoritative.',craft:'Nature-first object reasoning with procedural Three.js, shared 3Dviz runtime, instanced environmental vegetation, semantic station silhouettes, and state carried by rings plus active trail wisps.',lighting:{exposure:1.03,environment:.52,key:8.5,fill:4.5,rim:6.5,contact:.8,keyColor:'#fff0cf',fillColor:'#a8cbb7'},controls:[{type:'select',label:'Execution frame',options:executionFrames.map((_,i)=>({value:String(i),label:`${i+1} · ${['Trailhead','Archive','Insight tree','Review camp hold','Decision lookout','Output path','Complete'][i]}`})),get:()=>String(frameIndex),set:v=>{frameIndex=Number(v);apply();}},{type:'button',getLabel:()=>`Next frame (${frameIndex+1}/${executionFrames.length})`,set:()=>{frameIndex=(frameIndex+1)%executionFrames.length;apply();}},{type:'button',getLabel:()=>`Autoplay: ${autoplay?'on':'off'}`,set:()=>{autoplay=!autoplay;frameClock=0;}}],stats:()=>{const a=activeNode(model),success=model.nodes.filter(n=>n.status==='SUCCESS').length,waiting=model.nodes.filter(n=>n.status==='WAITING').length;return[{label:'Frame',value:`${frameIndex+1}/${executionFrames.length}`},{label:'Execution',value:model.executionStatus||'—'},{label:'Active station',value:a?N[a.id]:'Complete'},{label:'Success / waiting',value:`${success} / ${waiting}`}];},reset:()=>{frameIndex=0;autoplay=true;apply();}};
}
createRenyroForestTrail.views={overview:{position:[8.8,5.9,10.5],target:[.2,-1.72,0]},detail:{position:[4.8,1.4,-5.6],target:[2.55,-1.7,-1.3]},source:{position:[-3.6,1.1,5.7],target:[-2.2,-1.65,.1]}};
