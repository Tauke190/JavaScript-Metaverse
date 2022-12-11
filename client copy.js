import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import {JoyStick, toon3D} from './toon3D'


let UP = false;
let DOWN = false;
let LEFT = false;
let RIGHT = false;


class Game
{
    constructor()
    {
        this.container;  // HTML Container
        this.player = {};
        this.animations = {}; // The animations are saved into this object
        this.stats;
        this.controls;
        this.camera;
        this.scene;
        this.renderer;
        this.assetspath = '../assets/'
        this.clock = new THREE.Clock();
       
        this.SPEED = 300;

        this.remotePlayers = [];
        this.intializingPlayers = [];
        this.remoteColliders = [];
        this.remoteData = [];
        const game = this;


        this.anims = ['Running','Left Turn','Right Turn','Walking Left Turn','Walking Right Turn'];
       

        this.container = document.createElement('div');
        this.container.style.height = '100%';


        document.body.appendChild(this.container);

        // this.player = new PlayerLocal(this);

        // window.onerror = function(error)
        // {
        //     console.error(JSON.stringify(error));
        // }


        //  this.init();
    }

    init() // Initialization of the scene
    {
        //Cameras
        this.camera = new THREE.PerspectiveCamera(75,window.innerWidth/window.innerHeight,0.1,4000)
        this.camera.position.set(112,100,400);

        //Scenes
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xa0a0a0);
        // this.scene.fog = new THREE.Fog(0xa0a0a0,500,1700);


        // Lights
        const ambient = new THREE.AmbientLight(0x707070);
        let light = new THREE.HemisphereLight(0xffffff,0x444444);
        light.position.set(0,200,0);
        this.scene.add(light);
        light = new THREE.DirectionalLight(0xffffff);
        light.position.set(0,200,100);
        light.castShadow = true;
        light.shadow.camera.top = 180;
        light.shadow.camera.bottom = -100;
        light.shadow.camera.left = -120;
        light.shadow.camera.right = 120;
        this.scene.add(light);
        this.scene.add(ambient);

        
        //Ground
        var mesh =  new THREE.Mesh(new THREE.PlaneGeometry(4000,4000), new THREE.MeshPhongMaterial({color : 0x999999, depthWrite : false}))
        mesh.rotation.x = - Math.PI/2;
        mesh.recieveShadow = true;
        this.scene.add(mesh);


        //Grid
        var grid = new THREE.GridHelper(4000,80,0x000000,0x000000);
        grid.material.opacity = 0.2;
        grid.material.transparent = true;
        this.scene.add(grid);


        this.createColliders();

         
        //Renderer
        this.renderer = new THREE.WebGLRenderer({antialias:true});
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth,window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        document.body.append(this.renderer.domElement);

        //Controls

        this.controls = new OrbitControls(this.camera,this.renderer.domElement);
        this.controls.target.set(0,150,0);
        this.controls.update();


        this.camera.position.z = 5;
    }

    // Loads all the animation from the FBX file into animations objects
    loadnextAnim(loader)
    {
        let anim = this.anims.pop();
        const game = this;
        loader.load('../../Animations/'+anim+'.fbx' , function(object){
            game.animations[anim] = object.animations[0]; // Pushes FBX animation into the animations
            if(game.anims.length > 0)
            {
                game.loadnextAnim(loader);
            }
            else
            {
                delete game.anims;
                game.createCameras();
                game.action = "Idle";
                game.animate();
            }
        });
     }


    set activeCamera(object) // player.cameras.active is made here
    {
        this.player.cameras.active = object;
    }

    createCameras()
    {
        const offset = new THREE.Vector3(0,80,0);
        const front = new THREE.Object3D();
        const back = new THREE.Object3D();
        back.position.set(0,300,-400);
        back.parent = this.player.object;
        this.player.cameras = {back};
        game.activeCamera = this.player.cameras.back;
    }

    createColliders()
    {
        const geometry = new THREE.BoxGeometry(500,400,500);
        const material = new THREE.MeshBasicMaterial({color:0x222222,wireframe:true})

        this.colliders = [];

        for(let x = -5000 ; x < 5000 ; x+=1000)
        {
            for(let z = -5000 ; z < 5000 ; z+=1000)
            {
                if(x == 0 && z ==0)
                {
                    continue;
                }
                const box = new THREE.Mesh(geometry,material);
                box.position.set(x,200,z);
                this.scene.add(box);
                this.colliders.push(box);
            }
        }

        const geometry2 = new THREE.BoxGeometry(1000,40,1000);
        const stage = new THREE.Mesh(geometry2,material);
        stage.position.set(0,20,0);
        this.scene.add(stage);
        this.colliders.push(stage);
    }

   
    animate() // GameLoop
    {
        const game = this;
        const dt = this.clock.getDelta();

        requestAnimationFrame(function(){ game.animate();});
        if(this.player.mixer) 
        {
            this.player.mixer.update(dt);
        }
        this.movePlayer(dt);

        if(this.player.cameras != undefined && this.player.cameras.active != undefined)
        {
          
            this.camera.position.lerp(this.player.cameras.active.getWorldPosition(new THREE.Vector3()),0.05);
            const pos = this.player.object.position.clone();
            pos.y += 200;
            this.camera.lookAt(pos);

        }
        this.renderer.render(this.scene,this.camera);
    }
}

// class Player{

//     constructor(game,options)
//     {
//         this.local = true;

//         this.SPEED = 300;
//         let model , color;
        

//         this.model = "Robot";
//         this.color = "Black";
//         this.game = game;
//         this.animations = this.game.animations; // Animations are same of all player


//         const loader = new FBXLoader();
//         const player = this;


//         loader.load('/Animations/'+this.model+'.fbx' , function(object){ 
//             object.mixer = new THREE.AnimationMixer(object);
//             player.mixer = object.mixer;
//             player.root = object.mixer.getRoot();

//             object.name = "Avinash";
//             object.traverse(function(child){
//                 if(child.isMesh){
//                    child.material.map = null;
//                    child.castShadow = true;
//                    child.recieveShadow = true;
//                 }
//             })

//         player.object = new THREE.Object3D();
//         player.object.position.set(3122,0,-173);
//         player.object.rotation.set(0,2,0);
//         player.object.add(object); // Adds the 3D model as the child of the player transform object

//         if(player.deleted === undefined){
//             game.scene.add(player.object);
//         }

//         if(player.local)
//         {
//             game.createCameras();
//             game.animations.Idle = object.animations[0];
//             player.initSocket();
//         }
//         else
//         {

//             //Make Player colliders of other remote players in the game

//             const geometry = new THREE.BoxGeometry(100,300,100);
//             const material = new THREE.MeshBasicMaterial({visible:false});
//             const box = new THREE.Mesh(geometry,material);
//             box.name = "Collider"; // Player Collider
//             box.position.set(0,150,0);
//             player.object.add(box);
//             player.collider = box;
//             player.object.userData.id = player.id;
//             player.object.userData.remotePlayer = true;

//             const players = game.InitalizingPlayers.splice(game.InitalizingPlayers.indexof(this),1);
//             game.remotePlayer.push(players[0]);
//         }


//         if(game.animations.Idle !== undefined)
//         {
//             player.action = "Idle";
//         }

//     });
//  }

//     set action(name)
//     {
//         const action = this.player.mixer.clipAction(this.animations[name]);
//         action.time = 0;
//         this.player.mixer.stopAllAction();
//         this.player.action = name;
//         this.player.actionTime = Date.now();
//         this.player.actionName = name;

//         action.fadeIn(0.5);
//         action.play();
//     }

//     get action()
//     {
//         if(this.player === undefined || this.player.actionName === undefined) return "";
//         return this.player.actionName;
//     }
// }


//     //Socket Only Applies to PlayerLocal
// class PlayerLocal extends Player{ 

//     constructor(game,model)
//     {

//        super(game,model);
//        const player = this;
//        const socket = io();  


//        socket.on('setId',(data)=>{
//            player.id = data.id;
//        })

//        socket.on('remoteData',(data)=>{
//            game.remoteData = data;
//        })

//        socket.on('deletePlayer',(data)=>{

//        })


//        this.socket = socket;    // this.socket is in the base class Player

//     }
//     initSocket()
//     {
//         this.socket.emit('init',{
//             model : this.model,
//             color : this.color,
//             x : this.player.object.position.x,
//             y : this.player.object.position.y,
//             z : this.player.object.position.z,
//             h : this.player.object.rotation.y,
//             pb : this.player.object.rotation.z
//         })
//     }

//     updateSocket()
//     {
//         if(this.socket)
//         {
//             this.socket.emit('update',{
//                 x : this.player.object.position.x,
//                 y : this.player.object.position.y,
//                 z : this.player.object.position.z,
//                 h : this.player.object.rotation.y,
//                 pb : this.player.object.rotation.x,
//                 action: this.action
//             })
//         }
//     }

//     movePlayer(dt)
//     {
//         const dir = new THREE.Vector3();
//         const pos = this.player.object.position.clone();

//         pos.y+=60;
//         this.player.object.getWorldDirection(dir);


//         let raycaster = new THREE.Raycaster(pos,dir);
//         let blocked = false;
//         const colliders = this.colliders;

//         if(colliders !== undefined)
//         {
//             const intersect = raycaster.intersectObjects(colliders)

//             if(intersect.length > 0)
//             {
//                 if(intersect[0].distance < 50)
//                 {
//                     blocked = true;
//                 }
//             }
//         }

//         if(colliders!== undefined)
//         {
//             dir.set(-1,0,0); //Cast left
//             dir.applyMatrix4(this.player.object.matrix);
//             dir.normalize();

//             raycaster = new THREE.Raycaster(dir,pos);
//             let intersect = raycaster.intersectObjects(colliders)

         
//             if(intersect.length > 0)
//             {
//                 if(intersect[0].distance < 50)
//                 {
//                      // Pushes Player Right
//                     this.player.object.translateX(300 - intersect[0].distance);
//                 }
//             }

//             dir.set(1,0,0); //Cast Right
//             dir.applyMatrix4(this.player.object.matrix);
//             dir.normalize();

//             raycaster = new THREE.Raycaster(dir,pos);
//             intersect = raycaster.intersectObjects(colliders)

         
//             if(intersect.length > 0)
//             {
//                 if(intersect[0].distance < 50)
//                 {
//                      // Pushed Player Left
//                     this.player.object.translateX(intersect[0].distance - 300); // Pushed Player Left
//                 }
                
//             }
//         }

//         if(!UP && !DOWN && !LEFT && !RIGHT)
//         {
//             if(this.player.action != 'Idle')
//             {
//                 this.action = 'Idle';
//             }
//         }
//        if(UP)
//        {
//            if(!blocked)
//            {
//                 this.player.object.translateZ(dt*this.SPEED);
//            }
//            if(LEFT)
//            {
//                 this.player.object.rotateY(dt*0.7);
//                 if(this.player.action != "Walking Left Turn")
//                 {  
//                     this.action = 'Walking Left Turn';
//                 }
//            }
//            else if(RIGHT)
//            {
               
//                 this.player.object.rotateY(-dt*0.7);
                

//                 if(this.player.action != "Walking Right Turn")
//                 {  
//                     this.action = 'Walking Right Turn';
//                 }
//            }
//            else
//            {
//                 if(this.player.action != "Running")
//                 {
//                     this.action = 'Running';
//                 }
//            }
//        }
//        if(!UP && RIGHT)
//        {
          
//             this.player.object.rotateY(-dt*0.7);
           
           
//            if(this.player.action != "Right Turn")
//            {
//                this.action = "Right Turn";
//            }
//        }
//       if(!UP && LEFT)
//        {
//             this.player.object.rotateY(dt*0.7);
           
//             if(this.player.action != "Left Turn")
//             {
//                 this.action = "Left Turn";
//             }
//        }
//     }
// }


//const game = new Game();



function Keyup(e) {
    // console.log(UP,DOWN,LEFT,RIGHT);
    if (e.key !== undefined) {
        const pressedKey = e.key;
        switch (pressedKey) {
        case "ArrowLeft":
            LEFT = false;
            break;
        case "ArrowUp":
            UP = false;
            break;
        case "ArrowRight":
            RIGHT = false;
            break;
        case "ArrowDown":
            DOWN = false;
        }  
    }
}

function KeyDown(e) {
    // console.log(UP,DOWN,LEFT,RIGHT);
    const game = this;
    if (e.key !== undefined) {

        const pressedKey = e.key;
        switch (pressedKey) {
        case "ArrowLeft":
            LEFT = true;
            break;
        case "ArrowUp":
            UP = true;
            break;
        case "ArrowRight":
            RIGHT = true;
            break;
        case "ArrowDown":
            DOWN = true;
        }
    }   
}
document.addEventListener('keydown',KeyDown);
document.addEventListener('keyup',Keyup);