import {THREE, add, box, rod} from '../breadth/src/craft-forms.js';

// Authored presentation coordinates only. The fixture owns the graph and execution.
export const XZ = {
  upload: [-6.25, 1.25], read: [-4.8, -.85], extract: [-2.25, -.65],
  confidence: [.25, .2], review: [1.7, -2.15], decision: [4.15, -1.9],
  export: [4.7, 1.6], exception: [6.65, -.95],
};
const TAU = Math.PI * 2;
const smooth = t => {t = THREE.MathUtils.clamp(t, 0, 1); return t * t * (3 - 2 * t);};
const hill = (x, z, cx, cz, sx, sz, height) => height * Math.exp(-(((x-cx)/sx)**2 + ((z-cz)/sz)**2));
function landHeight(x, z) {
  return -2.24 + .12*Math.sin(x*.57+z*.22) + .09*Math.cos(z*.95-x*.18)
    + hill(x,z,-5.2,-3.1,2.2,1.3,.52) + hill(x,z,-.7,-3.25,2.6,1.3,.74)
    + hill(x,z,4.6,-3.25,2.6,1.35,.6) + hill(x,z,-3.4,2.9,2,1.25,.25);
}
export function terrainY(x,z) {
  let y=landHeight(x,z);
  for (const [nx,nz] of Object.values(XZ)) {
    const d=Math.hypot(x-nx,z-nz), flatten=1-smooth((d-.5)/.85);
    y=THREE.MathUtils.lerp(y,landHeight(nx,nz),flatten);
  }
  return y;
}
export const P=Object.fromEntries(Object.entries(XZ).map(([id,[x,z]])=>[id,[x,terrainY(x,z)+.015,z]]));

export function seeded(seed=4180) {
  return () => {seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
}

// Every ribbon edge samples the same height field; wider trails never float on slopes.
export function ribbonGeometry(curve,width,offset=.018,segments=80,irregular=false) {
  const positions=[],uvs=[],indices=[];
  for(let i=0;i<=segments;i++) {
    const t=i/segments,p=curve.getPoint(t),tangent=curve.getTangent(t).setY(0).normalize();
    const w=width*.5*(irregular?1+.075*Math.sin(i*1.7)+.045*Math.cos(i*.63):1);
    for(const side of [-1,1]) {
      const x=p.x-tangent.z*w*side,z=p.z+tangent.x*w*side;
      positions.push(x,terrainY(x,z)+offset,z);uvs.push((side+1)*.5,t);
    }
    if(i<segments){const a=i*2;indices.push(a,a+1,a+2,a+1,a+3,a+2);}
  }
  const geo=new THREE.BufferGeometry();
  geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  geo.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));geo.setIndex(indices);geo.computeVertexNormals();
  return geo;
}

export function clearing(root,x,z,radius,mat,seed=1) {
  const random=seeded(seed),vertices=[x,terrainY(x,z)+.025,z],index=[],count=36;
  for(let i=0;i<count;i++) {
    const angle=i/count*TAU,r=radius*(.93+random()*.13),px=x+Math.cos(angle)*r,pz=z+Math.sin(angle)*r*.8;
    vertices.push(px,terrainY(px,pz)+.025,pz);
  }
  for(let i=0;i<count;i++)index.push(0,1+(i+1)%count,1+i);
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geo.setIndex(index);geo.computeVertexNormals();
  const mesh=add(root,geo,mat);mesh.castShadow=false;return mesh;
}

export function trailCurve(edge) {
  const [ax,az]=XZ[edge.source],[bx,bz]=XZ[edge.target];
  const bends={
    e1:[[-6.05,.3],[-5.8,-.6]],e2:[[-3.7,-1.03]],e3:[[-1.05,-.4]],
    e4:[[.65,-.5],[.95,-1.45]],e5:[[1.3,.8],[2.65,1.65],[3.7,1.8]],
    e6:[[2.8,-2.38]],e7:[[4.6,-.85],[4.85,.25]],e8:[[5.3,-1.8],[5.95,-1.2]],
  };
  return new THREE.CatmullRomCurve3([[ax,az],...(bends[edge.id]||[]),[bx,bz]].map(([x,z])=>new THREE.Vector3(x,0,z)),false,'centripetal');
}

export function makeTrail(root,edge,m,index) {
  const curve=trailCurve(edge),exception=edge.route==='rejected',success=['high-confidence','approved'].includes(edge.route);
  const width=exception?.3:success?.42:.36,pathMat=exception?m.exceptionPath:success?m.path:m.reviewPath;
  add(root,ribbonGeometry(curve,width+.16,.012,80,true),m.pathEdge).castShadow=false;
  const mesh=add(root,ribbonGeometry(curve,width,.021,80,true),pathMat);mesh.castShadow=false;
  const glow=add(root,ribbonGeometry(curve,.035,.033),m.pathGlow);glow.castShadow=false;glow.visible=false;
  const wisp=add(root,new THREE.SphereGeometry(.05,8,6),m.wisp);wisp.castShadow=false;wisp.visible=false;
  const tail=[];for(let i=0;i<3;i++){const mote=add(root,new THREE.SphereGeometry(.023-i*.004,6,4),m.wisp);mote.castShadow=false;mote.visible=false;tail.push(mote);}
  // Small inset chevrons retain direction even when the execution is paused.
  const q=curve.getPoint(.6),t=curve.getTangent(.6).setY(0).normalize(),side=new THREE.Vector3(-t.z,0,t.x);
  for(const sign of [-1,1]) {
    const a=q.clone().addScaledVector(t,-.1).addScaledVector(side,sign*.07),b=q.clone().addScaledVector(t,.035);
    rod(root,exception?m.routeRust:m.pathMark,[a.x,terrainY(a.x,a.z)+.034,a.z],[b.x,terrainY(b.x,b.z)+.034,b.z],.012).castShadow=false;
  }
  return {id:edge.id,route:edge.route,curve,mesh,glow,wisp,tail,offset:index*.137};
}

function boundary(angle) {
  const c=Math.cos(angle),s=Math.sin(angle),r=1+.025*Math.sin(angle*5)+.018*Math.cos(angle*9);
  return [8.35*Math.sign(c)*Math.abs(c)**.78*r,4.35*Math.sign(s)*Math.abs(s)**.82*r];
}

export function makeTerrain(root,m) {
  const count=96,rings=30,positions=[0,terrainY(0,0),0],colors=[],indices=[],c=new THREE.Color();
  const shade=(x,z,y)=>{
    const blend=THREE.MathUtils.clamp(.4+.14*Math.sin(x*.8+z)+.11*Math.cos(x-z*1.5)+(y+2.2)*.2,0,1);
    c.set('#456d53').lerp(new THREE.Color('#8f9c64'),blend);colors.push(c.r,c.g,c.b);
  };
  shade(0,0,terrainY(0,0));
  for(let ring=1;ring<=rings;ring++)for(let i=0;i<count;i++) {
    const [bx,bz]=boundary(i/count*TAU),r=ring/rings,x=bx*r,z=bz*r,y=terrainY(x,z);
    positions.push(x,y,z);shade(x,z,y);
  }
  for(let i=0;i<count;i++)indices.push(0,1+(i+1)%count,1+i);
  for(let ring=1;ring<rings;ring++)for(let i=0;i<count;i++) {
    const a=1+(ring-1)*count+i,b=1+(ring-1)*count+(i+1)%count,d=1+ring*count+i,e=1+ring*count+(i+1)%count;
    indices.push(a,b,d,b,e,d);
  }
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geo.setIndex(indices);geo.computeVertexNormals();
  const ground=add(root,geo,m.ground);ground.castShadow=false;
  const wall=[],wallColors=[],wallIndex=[];
  for(let i=0;i<=count;i++) {
    const [x,z]=boundary(i%count/count*TAU),y=terrainY(x,z);
    for(let j=0;j<3;j++) {
      wall.push(x*(1-j*.015),j===0?y-.012:j===1?y-.14:-2.94,z*(1-j*.015));
      c.set(j===0?'#5d754c':j===1?'#726752':'#444b40');c.multiplyScalar(.93+.06*Math.sin(i*1.13));wallColors.push(c.r,c.g,c.b);
    }
    if(i<count)for(let j=0;j<2;j++){const a=i*3+j;wallIndex.push(a,a+3,a+1,a+3,a+4,a+1);}
  }
  const sideGeo=new THREE.BufferGeometry();sideGeo.setAttribute('position',new THREE.Float32BufferAttribute(wall,3));sideGeo.setAttribute('color',new THREE.Float32BufferAttribute(wallColors,3));sideGeo.setIndex(wallIndex);sideGeo.computeVertexNormals();
  add(root,sideGeo,m.earth);
  // A quiet creek sits below the workflow. Its bridge belongs to the trailhead approach.
  const creek=new THREE.CatmullRomCurve3([[-7.1,2.75],[-5.8,2.64],[-3.6,3.05],[-.6,3.12],[2.1,3.43],[4.3,3.0],[7.05,2.6]].map(([x,z])=>new THREE.Vector3(x,0,z)));
  add(root,ribbonGeometry(creek,.66,.012,110,true),m.bank).castShadow=false;
  add(root,ribbonGeometry(creek,.44,.024,110,true),m.water).castShadow=false;
  for(let i=0;i<22;i++) {
    const t=.025+i*.044,p=creek.getPoint(t),v=creek.getTangent(t).normalize();
    rod(root,m.ripple,[p.x,terrainY(p.x,p.z)+.036,p.z],[p.x+v.x*.15,terrainY(p.x+v.x*.15,p.z+v.z*.15)+.036,p.z+v.z*.15],.008).castShadow=false;
  }
  const bridge=new THREE.Group(),bx=-6.25,bz=2.7,y=terrainY(bx,bz);bridge.position.set(bx,y+.07,bz);root.add(bridge);
  for(let i=0;i<9;i++)box(bridge,i%3===0?m.bark:m.wood,[0,.06+Math.sin(i/8*Math.PI)*.045,(i-4)*.1],[.57,.055,.095],.008);
  for(const x of [-.28,.28]) {
    for(const z of [-.48,.48])rod(bridge,m.wood,[x,-.06,z],[x,.34,z],.023);
    rod(bridge,m.rope,[x,.3,-.48],[x,.3,.48],.012);
    rod(bridge,m.bark,[x,-.04,-.48],[x,-.04,.48],.035);
  }
  const approach=new THREE.CatmullRomCurve3([new THREE.Vector3(-6.25,0,2.75),new THREE.Vector3(-6.34,0,2.1),new THREE.Vector3(...[XZ.upload[0],0,XZ.upload[1]])]);
  add(root,ribbonGeometry(approach,.32,.019,32,true),m.reviewPath).castShadow=false;
  return {ground,creek};
}

export function addForest(root,m,trails,creek) {
  const random=seeded(7391),dummy=new THREE.Object3D(),pools=[];
  const pool=(geometry,mat,capacity,shadow=true)=>{
    const mesh=new THREE.InstancedMesh(geometry,mat,capacity);mesh.count=0;mesh.castShadow=shadow;mesh.receiveShadow=true;root.add(mesh);pools.push(mesh);return mesh;
  };
  const trunk=pool(new THREE.CylinderGeometry(.055,.095,1,6),m.bark,100);
  const pine=pool(new THREE.ConeGeometry(1,1,7),m.forest,240);
  const leaves=pool(new THREE.IcosahedronGeometry(1,1),m.leaf,200);
  const shrubs=pool(new THREE.IcosahedronGeometry(1,0),m.shrub,460,false);
  const rocks=pool(new THREE.DodecahedronGeometry(1,0),m.rock,160);
  const bladesGeo=new THREE.BufferGeometry();bladesGeo.setAttribute('position',new THREE.Float32BufferAttribute([-.08,0,0,.03,.3,.015,.035,0,0,0,0,-.055,.02,.22,.015,0,0,.06,-.045,0,-.035,-.1,.18,-.01,.02,0,.025],3));bladesGeo.computeVertexNormals();
  const grass=pool(bladesGeo,m.grass,1000,false);
  const put=(mesh,p,scale,rotation,color)=>{
    if(mesh.count>=mesh.instanceMatrix.count)return;
    dummy.position.set(...p);dummy.scale.set(...scale);dummy.rotation.set(0,rotation,0);dummy.updateMatrix();mesh.setMatrixAt(mesh.count,dummy.matrix);
    if(color)mesh.setColorAt(mesh.count,new THREE.Color(color));mesh.count++;
  };
  const samples=trails.flatMap(t=>t.curve.getPoints(70)),water=creek.getPoints(70);
  const dist=(x,z,points)=>{let d=Infinity;for(const p of points)d=Math.min(d,(x-p.x)**2+(z-p.z)**2);return Math.sqrt(d);};
  const nodeDistance=(x,z)=>Math.min(...Object.entries(XZ).map(([id,[nx,nz]])=>Math.hypot(x-nx,z-nz)-(id==='extract'?1.3:.85)));
  const blocksStation=(x,z)=>Object.entries(XZ).some(([id,[nx,nz]])=>{
    const dz=z-nz;
    return dz>-.1&&dz<1.95&&Math.abs(x-nx)<(id==='extract'?1.05:.68);
  });
  const inside=(x,z)=>Math.abs(x/8.0)**2.6+Math.abs(z/4.1)**2.5<.96;
  const treeColors=['#6f8b65','#82966e','#9da678','#6c8972','#a4ae80'];
  const clusters=[[-6.85,-1.75,6],[-4.7,-3.05,7],[-1.6,-3.55,7],[1,-3.6,5],[4.8,-3.5,6],[7.1,.5,4],[-7.35,1.4,3],[-4.5,2.1,5],[-1.4,2.55,4],[1,2.8,3],[5.7,2.7,3]];
  const occupied=[];
  for(const [cx,cz,count] of clusters)for(let n=0,attempt=0;n<count&&attempt<count*18;attempt++) {
    const angle=random()*TAU,r=Math.sqrt(random())*1.05,x=cx+Math.cos(angle)*r,z=cz+Math.sin(angle)*r*.8;
    if(!inside(x,z)||blocksStation(x,z)||nodeDistance(x,z)<.28||dist(x,z,samples)<.65||dist(x,z,water)<.47||occupied.some(([tx,tz])=>Math.hypot(x-tx,z-tz)<.43))continue;
    occupied.push([x,z]);n++;
    const y=terrainY(x,z),front=z>1,height=(front?.58:1.05)+random()*(front?.45:.75),angleY=random()*TAU,color=treeColors[Math.floor(random()*treeColors.length)];
    put(trunk,[x,y+height*.4,z],[.8+random()*.45,height*.8,.8+random()*.45],angleY);
    if(random()<.56)for(let k=0;k<3;k++) {
      const radius=height*(.31-k*.052);put(pine,[x,y+height*(.53+k*.22),z],[radius,height*.55,radius],angleY+k*.23,color);
    } else {
      for(let k=0;k<4;k++) {const a=k*2.4,rad=height*.18;put(leaves,[x+Math.cos(a)*rad,y+height*(.72+(k%2)*.18),z+Math.sin(a)*rad],[height*.31,height*(.29+k*.01),height*.32],angleY+k,color);}
    }
    for(let k=0;k<3;k++) {const a=random()*TAU,r=.2+random()*.32,s=.1+random()*.12;put(shrubs,[x+Math.cos(a)*r,y+s*.45,z+Math.sin(a)*r],[s,s*.6,s*.85],a,'#8e9e72');}
  }
  for(let i=0;i<1000;i++) {
    const x=(random()-.5)*16,z=(random()-.5)*8;if(!inside(x,z)||nodeDistance(x,z)<.18)continue;
    const pathDist=dist(x,z,samples),waterDist=dist(x,z,water);if(pathDist<.34||waterDist<.28)continue;
    const y=terrainY(x,z),a=random()*TAU;
    if(i<65) {const s=.07+random()*.13;put(rocks,[x,y+s*.35,z],[s*(1+random()),s*.7,s],a,i%4===0?'#b1b097':'#8c9987');}
    if(i<160&&pathDist>.55) {const s=.07+random()*.14;put(shrubs,[x,y+s*.35,z],[s*1.6,s*.75,s],a,i%3===0?'#b4b480':'#92a574');}
    const patch=Math.sin(x*2.1+z)*Math.cos(z*2.4-x*.2);
    if(patch>.05||pathDist<.7||waterDist<.53) {const s=.35+random()*.65;put(grass,[x,y+.004,z],[s,s,s],a,i%5===0?'#c7c190':'#a1af77');}
  }
  // Fallen wood and a few mushrooms identify the shaded understory without filling the clearings.
  for(const [x,z,a] of [[-3.5,2.3,.45],[.1,-3.35,-.22],[6.4,-2.65,.6]]) {
    const y=terrainY(x,z);rod(root,m.bark,[x,y+.09,z],[x+Math.cos(a)*.6,y+.08,z+Math.sin(a)*.6],.085,.065);
    for(let k=0;k<3;k++){const mx=x+k*.13,mz=z+.2,my=terrainY(mx,mz);rod(root,m.cream,[mx,my,mz],[mx,my+.09,mz],.017);add(root,new THREE.SphereGeometry(.055,7,4,0,TAU,0,Math.PI*.52),m.mushroom,[mx,my+.09,mz]);}
  }
  for(const mesh of pools){mesh.instanceMatrix.needsUpdate=true;if(mesh.instanceColor)mesh.instanceColor.needsUpdate=true;mesh.computeBoundingSphere();}
}

export function addAtmosphere(root) {
  const sky=new THREE.Mesh(new THREE.SphereGeometry(85,24,12),new THREE.ShaderMaterial({
    side:THREE.BackSide,depthWrite:false,toneMapped:false,
    uniforms:{top:{value:new THREE.Color('#192e32')},bottom:{value:new THREE.Color('#547466')},resolution:{value:new THREE.Vector2(1,1)}},
    vertexShader:'varying vec3 vPosition; void main(){vPosition=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
    fragmentShader:'uniform vec3 top; uniform vec3 bottom; uniform vec2 resolution; void main(){float h=smoothstep(0.0,1.0,gl_FragCoord.y/resolution.y); gl_FragColor=vec4(mix(bottom,top,h),1.0);\n#include <colorspace_fragment>\n}',
  }));
  sky.onBeforeRender=renderer=>renderer.getDrawingBufferSize(sky.material.uniforms.resolution.value);
  sky.renderOrder=-10;root.add(sky);
  const sun=new THREE.DirectionalLight('#ffe8c6',1.9);sun.position.set(-5.5,9,5);sun.target.position.set(0,-1.8,0);sun.castShadow=true;
  Object.assign(sun.shadow.camera,{left:-10,right:10,top:7,bottom:-7,near:.5,far:28});sun.shadow.camera.updateProjectionMatrix();
  sun.shadow.mapSize.set(2048,2048);sun.shadow.normalBias=.025;sun.shadow.bias=-.00012;sun.shadow.radius=3;
  root.add(sun,sun.target);
  return {dispose(){sun.shadow.map?.dispose();sun.dispose();}};
}
