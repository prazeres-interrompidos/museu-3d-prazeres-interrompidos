(function(){
'use strict';
if(!window.THREE){
  var e=document.getElementById('error');e.hidden=false;e.textContent='Não foi possível carregar o motor 3D (Three.js). Verifica a ligação à Internet e recarrega a página.';document.getElementById('loading').classList.add('hidden');return;
}
var THREE=window.THREE;
var scene=new THREE.Scene();
scene.background=new THREE.Color(0xd9d1c4);
scene.fog=new THREE.Fog(0xd9d1c4,35,95);
var camera=new THREE.PerspectiveCamera(72,innerWidth/innerHeight,.05,120);
// Exterior of the main entrance, looking into the museum (-Z).
camera.position.set(0,1.72,26);
camera.rotation.order='YXZ';
camera.rotation.y=0;
var renderer=new THREE.WebGLRenderer({antialias:true});
renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
document.body.appendChild(renderer.domElement);
var ambient=new THREE.HemisphereLight(0xfff5e7,0x6f665b,1.55);scene.add(ambient);
var sun=new THREE.DirectionalLight(0xfff0d8,1.4);sun.position.set(-18,26,18);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);scene.add(sun);
var colliders=[];
var roomAreas=[];
var mats={
 floor:new THREE.MeshStandardMaterial({color:0xe7dfd0,roughness:.52,metalness:.03}),
 wall:new THREE.MeshStandardMaterial({color:0x4c4a47,roughness:.68}),
 innerWall:new THREE.MeshStandardMaterial({color:0xeee7da,roughness:.72}),
 wood:new THREE.MeshStandardMaterial({color:0x6f4d2e,roughness:.46}),
 woodDark:new THREE.MeshStandardMaterial({color:0x30261d,roughness:.55}),
 cushion:new THREE.MeshStandardMaterial({color:0x252628,roughness:.78}),
 gold:new THREE.MeshStandardMaterial({color:0xb59b66,metalness:.65,roughness:.25}),
 planter:new THREE.MeshStandardMaterial({color:0x8c8174,roughness:.62}),
 leaf:new THREE.MeshStandardMaterial({color:0x38573a,roughness:.86}),
 trunk:new THREE.MeshStandardMaterial({color:0x5a3c26,roughness:.9})
};
function box(name,x,y,z,sx,sy,sz,mat,collide){var m=new THREE.Mesh(new THREE.BoxGeometry(sx,sy,sz),mat);m.name=name;m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;scene.add(m);if(collide)colliders.push({minX:x-sx/2,maxX:x+sx/2,minZ:z-sz/2,maxZ:z+sz/2});return m;}
function cylinder(name,x,y,z,r,h,mat,collide){var m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,24),mat);m.name=name;m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;scene.add(m);if(collide)colliders.push({minX:x-r,maxX:x+r,minZ:z-r,maxZ:z+r});return m;}
var A=16,RW=14,RD=11,H=4.2,WT=.42;
box('Piso',0,-.12,0,56,.24,45,mats.floor,false);
function floorRoom(cx,cz){box('Pavimento',cx,.02,cz,RW,.16,RD,mats.floor,false);}
function wallSegment(x,z,sx,sz){return box('Parede',x,H/2,z,sx,H,sz,mats.wall,true);}
var rooms=[
{id:1,label:'SALA 1',episodes:'EPISÓDIOS 1–100',cx:-9.5,cz:13.2},
{id:2,label:'SALA 2',episodes:'EPISÓDIOS 101–200',cx:9.5,cz:13.2},
{id:3,label:'SALA 3',episodes:'EPISÓDIOS 201–300',cx:-18,cz:0},
{id:4,label:'SALA 4',episodes:'EPISÓDIOS 301–400',cx:18,cz:0},
{id:5,label:'SALA 5',episodes:'EPISÓDIOS 401–500',cx:-9.5,cz:-13.2},
{id:6,label:'SALA 6',episodes:'EPISÓDIOS 501–600',cx:9.5,cz:-13.2}
];
rooms.forEach(function(r){floorRoom(r.cx,r.cz);roomAreas.push({r:r,minX:r.cx-RW/2+.3,maxX:r.cx+RW/2-.3,minZ:r.cz-RD/2+.3,maxZ:r.cz+RD/2-.3});});
box('Atrio',0,.02,0,A,.16,A,mats.floor,false);
function buildRoomShell(r,vertical){var L=RW/2,D=RD/2,x=r.cx,z=r.cz,opening=5.4;if(vertical){
 var backZ=z+(z>0?-D:D);wallSegment(x,backZ,RW,WT);var frontZ=z+(z>0?-D:D);var sideLen=(RW-opening)/2;wallSegment(x-L+sideLen/2,frontZ,sideLen,WT);wallSegment(x+L-sideLen/2,frontZ,sideLen,WT);wallSegment(x-L,z,WT,RD);wallSegment(x+L,z,WT,RD);
}else{
 var frontX=x+(x>0?-L:L);wallSegment(frontX,z-D+(RD-opening)/4,WT,(RD-opening)/2);wallSegment(frontX,z+D-(RD-opening)/4,WT,(RD-opening)/2);wallSegment(x,z-D,RW,WT);wallSegment(x,z+D,RW,WT);
}}
rooms.forEach(function(r){buildRoomShell(r,[1,2,5,6].indexOf(r.id)>=0);});
// Main entrance: a broad open passage, no door.
wallSegment(-10.5,22.2,7,WT);wallSegment(10.5,22.2,7,WT);
rooms.forEach(function(r){box('Cornija',r.cx,H+.05,r.cz-RD/2+.25,RW,.12,.22,mats.gold,false);});
function coverTexture(text){var c=document.createElement('canvas');c.width=180;c.height=240;var g=c.getContext('2d');g.fillStyle='#eee5d5';g.fillRect(0,0,c.width,c.height);g.fillStyle='#b79a68';g.fillRect(10,10,c.width-20,c.height-20);g.fillStyle='#fffaf0';g.font='bold 18px Georgia';g.textAlign='center';g.fillText(text,c.width/2,120);g.font='12px Arial';g.fillText('Prazeres Interrompidos',c.width/2,150);return new THREE.CanvasTexture(c);}
function frame(x,y,z,rotY,label){var group=new THREE.Group();group.position.set(x,y,z);group.rotation.y=rotY;var outer=new THREE.Mesh(new THREE.BoxGeometry(.72,1.02,.08),mats.gold);group.add(outer);var art=new THREE.Mesh(new THREE.PlaneGeometry(.58,.82),new THREE.MeshStandardMaterial({map:coverTexture(label),roughness:.8}));art.position.z=-.045;group.add(art);scene.add(group);}
function addFrames(r){var x=r.cx,z=r.cz,L=RW/2,D=RD/2,rows=25;for(var i=0;i<rows;i++){var t=(i+.5)/rows,xx=x-L+.7+t*(RW-1.4);frame(xx,2.45,z-D+.23,0,'E'+String((r.id-1)*100+i+1).padStart(3,'0'));frame(xx,2.45,z+D-.23,Math.PI,'E'+String((r.id-1)*100+26+i).padStart(3,'0'));var zSide=z-D+.7+t*(RD-1.4),ep=(r.id-1)*100+51+i;frame(x-L+.23,2.45,zSide,Math.PI/2,'E'+String(ep).padStart(3,'0'));frame(x+L-.23,2.45,zSide,-Math.PI/2,'E'+String(ep+25).padStart(3,'0'));}}
rooms.forEach(addFrames);
function bench(x,z,rot){var g=new THREE.Group();g.position.set(x,.55,z);g.rotation.y=rot||0;scene.add(g);var seat=new THREE.Mesh(new THREE.BoxGeometry(3.2,.28,.62),mats.wood);g.add(seat);var c=new THREE.Mesh(new THREE.BoxGeometry(2.9,.18,.54),mats.cushion);c.position.y=.23;g.add(c);[-1.25,1.25].forEach(function(sx){var l=new THREE.Mesh(new THREE.BoxGeometry(.16,.55,.16),mats.woodDark);l.position.set(sx,-.28,0);g.add(l);});}
function lowTable(x,z,rot){var g=new THREE.Group();g.position.set(x,.42,z);g.rotation.y=rot||0;scene.add(g);g.add(new THREE.Mesh(new THREE.BoxGeometry(2.8,.16,1),mats.wood));[-1.05,1.05].forEach(function(dx){[-.3,.3].forEach(function(dz){var l=new THREE.Mesh(new THREE.BoxGeometry(.12,.42,.12),mats.woodDark);l.position.set(dx,-.22,dz);g.add(l);});});}
function sofa(x,z,rot){var g=new THREE.Group();g.position.set(x,.58,z);g.rotation.y=rot||0;scene.add(g);g.add(new THREE.Mesh(new THREE.BoxGeometry(3.4,.42,.9),mats.woodDark));var s=new THREE.Mesh(new THREE.BoxGeometry(3.2,.24,.82),mats.cushion);s.position.y=.28;g.add(s);var b=new THREE.Mesh(new THREE.BoxGeometry(3.2,.72,.16),mats.cushion);b.position.set(0,.58,.33);g.add(b);}
rooms.forEach(function(r){var x=r.cx,z=r.cz;bench(x,z+1.9);bench(x,z-2.1);bench(x-4.5,z,Math.PI/2);bench(x+4.5,z,Math.PI/2);sofa(x,z+3.9);lowTable(x,z-3.6);});
function plant(x,z,scale){var g=new THREE.Group();g.position.set(x,.1,z);g.scale.setScalar(scale||1);scene.add(g);var pot=new THREE.Mesh(new THREE.CylinderGeometry(.45,.58,.65,20),mats.planter);pot.position.y=.33;g.add(pot);var tr=new THREE.Mesh(new THREE.CylinderGeometry(.08,.12,.9,10),mats.trunk);tr.position.y=1.05;g.add(tr);for(var i=0;i<8;i++){var leaf=new THREE.Mesh(new THREE.SphereGeometry(.45,10,8),mats.leaf),a=i*Math.PI/4;leaf.position.set(Math.cos(a)*.42,1.35+Math.sin(i*2)*.12,Math.sin(a)*.42);leaf.scale.set(1,.7,1);g.add(leaf);}}
rooms.forEach(function(r){var x=r.cx,z=r.cz;plant(x-5.4,z-4,.9);plant(x+5.4,z-4,.9);plant(x-5.4,z+4,.85);plant(x+5.4,z+4,.85);});
cylinder('Mesa central',0,.55,0,1.8,1,mats.innerWall,true);cylinder('Vaso central',0,1.15,0,.8,.9,mats.planter,false);plant(0,0,.85);
for(var i=0;i<6;i++){var a=i*Math.PI/3;lowTable(Math.cos(a)*3,Math.sin(a)*3,a+Math.PI/2);}
rooms.forEach(function(r){[[-4,-3],[0,-3],[4,-3],[-4,3],[0,3],[4,3]].forEach(function(p){var l=new THREE.PointLight(0xffe6bd,55,8,2);l.position.set(r.cx+p[0],H-.25,r.cz+p[1]);l.castShadow=true;scene.add(l);});});
[[-7,7],[7,7],[-7,-7],[7,-7],[-12,0],[12,0]].forEach(function(p){var l=new THREE.PointLight(0xffe8c2,75,10,2);l.position.set(p[0],3.8,p[1]);scene.add(l);});
var sign=box('Placa',0,2.7,21.6,6.4,1.9,.12,mats.innerWall,false);var signTex=coverTexture('ENTRADA PRINCIPAL');var signArt=new THREE.Mesh(new THREE.PlaneGeometry(5.8,1.5),new THREE.MeshStandardMaterial({map:signTex,roughness:.9}));signArt.position.set(0,2.7,21.5);scene.add(signArt);
// --- robust movement / collision ---
var player={radius:.42,height:1.72,speed:3.4};
var keys={};
function setKey(code,value){if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].indexOf(code)>=0){keys[code]=value;}}
window.addEventListener('keydown',function(e){setKey(e.code,true);if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].indexOf(e.code)>=0)e.preventDefault();},{passive:false});
window.addEventListener('keyup',function(e){setKey(e.code,false);},{passive:false});
renderer.domElement.tabIndex=0;renderer.domElement.addEventListener('click',function(){renderer.domElement.focus();});
function blocked(x,z){var r=player.radius;for(var i=0;i<colliders.length;i++){var c=colliders[i];if(x>c.minX-r&&x<c.maxX+r&&z>c.minZ-r&&z<c.maxZ+r)return true;}return false;}
function moveWithCollision(dx,dz){var x=camera.position.x,z=camera.position.z;var nx=x+dx,nz=z+dz;if(!blocked(nx,z))x=nx;if(!blocked(x,nz))z=nz;camera.position.x=x;camera.position.z=z;}
function updateRoomLabel(){var best='ENTRADA PRINCIPAL';for(var i=0;i<roomAreas.length;i++){var a=roomAreas[i];if(camera.position.x>=a.minX&&camera.position.x<=a.maxX&&camera.position.z>=a.minZ&&camera.position.z<=a.maxZ){best=a.r.label+' — '+a.r.episodes;break;}}document.getElementById('roomLabel').textContent=best;}
var clock=new THREE.Clock();
function animate(){requestAnimationFrame(animate);var dt=Math.min(clock.getDelta(),.05);var f=0;if(keys.ArrowUp)f+=1;if(keys.ArrowDown)f-=1;if(keys.ArrowLeft)camera.rotation.y+=1.65*dt;if(keys.ArrowRight)camera.rotation.y-=1.65*dt;if(f){var dir=new THREE.Vector3(0,0,-1);dir.applyAxisAngle(new THREE.Vector3(0,1,0),camera.rotation.y);moveWithCollision(dir.x*f*player.speed*dt,dir.z*f*player.speed*dt);}camera.position.y=player.height;updateRoomLabel();renderer.render(scene,camera);}
animate();
document.getElementById('loading').classList.add('hidden');
window.addEventListener('resize',function(){camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
})();
