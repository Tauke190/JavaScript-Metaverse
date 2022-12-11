import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import {FontLoader} from 'three/examples/jsm/loaders/FontLoader'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import {JoyStick, toon3D} from './toon3D'


let UP = false;
let DOWN = false;
let LEFT = false;
let RIGHT = false;

let FIRE = false;


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


        this.textmesh;
        this.remotePlayers = [];
        this.intializingPlayers = [];
        this.remoteColliders = [];
        this.remoteData = [];
        const game = this;
       

        this.anims = ['Running','Walking Left Turn','Walking Right Turn','TurnIdle'];
       

        this.container = document.createElement('div');
        this.container.style.height = '100%';
        document.body.appendChild(this.container);
        


    

        window.onerror = function(error)
        {
            console.error(JSON.stringify(error));
        }

        game.init();

    }

    init() // Initialization of the scene
    {
       
        //Cameras
        this.camera = new THREE.PerspectiveCamera(75,window.innerWidth/window.innerHeight,0.1,200000)
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

        const game = this;
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
      


        //Renderer
        this.renderer = new THREE.WebGLRenderer({antialias:true});
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth,window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        document.body.append(this.renderer.domElement);

        //Controls

  

    
        //model
        const loader = new FBXLoader();
        this.player = new PlayerLocal(this);
        game.loadnextAnim(loader);    
        game.loadEnvironment(loader);
        this.speechBubble = new SpeechBubble(this, "", 150);
        
	     this.speechBubble.mesh.position.set(0, 350, 0);

        if ('ontouchstart' in window){
			window.addEventListener( 'touchdown', (event) => game.onMouseDown(event), false );
		}else{
			window.addEventListener( 'mousedown', (event) => game.onMouseDown(event), false );	
		}
		
		window.addEventListener( 'resize', () => game.onWindowResize(), false );

    }

    onWindowResize() {
		this.camera.aspect = window.innerWidth / window.innerHeight;
		this.camera.updateProjectionMatrix();

		this.renderer.setSize( window.innerWidth, window.innerHeight );

	}


    loadEnvironment(loader){
		const game = this;
		loader.load('assets/town.fbx', function(object){
			game.environment = object;
			game.colliders = [];
			game.scene.add(object);
			object.traverse( function ( child ) {
				if ( child.isMesh ) {
					if (child.name.startsWith("proxy")){
						game.colliders.push(child);
						child.material.visible = false;
					}else{
						child.castShadow = true;
						child.receiveShadow = true;
					}
				}
			} );
			
			const tloader = new THREE.CubeTextureLoader();
			tloader.setPath( 'assets/images/');

			var textureCube = tloader.load( [
				'px.jpg', 'nx.jpg',
				'py.jpg', 'ny.jpg',
				'pz.jpg', 'nz.jpg'
			] );

			game.scene.background = textureCube;
		
		})
	}
	

    onMouseDown( event ) {

		if (this.remoteColliders===undefined || this.remoteColliders.length==0 || this.speechBubble===undefined || this.speechBubble.mesh===undefined) return;
		
		// calculate mouse position in normalized device coordinates
		// (-1 to +1) for both components
		const mouse = new THREE.Vector2();
		mouse.x = ( event.clientX / this.renderer.domElement.clientWidth ) * 2 - 1;
		mouse.y = - ( event.clientY / this.renderer.domElement.clientHeight ) * 2 + 1;

		const raycaster = new THREE.Raycaster();
		raycaster.setFromCamera( mouse, this.camera );
		
		const intersects = raycaster.intersectObjects( this.remoteColliders );
	     const chat = document.getElementById('chat');
         console.log(chat);
		
		if (intersects.length>0){
			const object = intersects[0].object;
			const players = this.remotePlayers.filter( function(player){
				if (player.collider!==undefined && player.collider==object){
					return true;
				}
			});
			if (players.length>0){
				const player = players[0];
				console.log(`onMouseDown: player ${player.id}`);
				this.speechBubble.player = player;
				this.speechBubble.update('');
				this.scene.add(this.speechBubble.mesh);
				this.chatSocketId = player.id;
				chat.style.bottom = '0px';
				 this.activeCamera = this.player.cameras.chat;
			}
		}else{
			//Is the chat panel visible?
			if (chat.style.bottom=='0px' && (window.innerHeight - event.clientY)>40){
				console.log("onMouseDown: No player found");
				if (this.speechBubble.mesh.parent!==null) this.speechBubble.mesh.parent.remove(this.speechBubble.mesh);
				delete this.speechBubble.player;
				delete this.chatSocketId;
				chat.style.bottom = '-50px';
				 this.activeCamera = this.player.cameras.back;
			}else{
				console.log("onMouseDown: typing");
			}
		 }
	}


    getRemotePlayerById(id){
		if (this.remotePlayers===undefined || this.remotePlayers.length==0) return;
		
		const players = this.remotePlayers.filter(function(player){
			if (player.id == id) return true;
		});	
		
		if (players.length==0) return;
		
		return players[0];
	}


    updateRemotePlayer(dt)
    {
      
        if(this.remoteData === undefined || this.remoteData.length == 0 || this.player === undefined || this.player.id === undefined ) return;
        const newPlayers = [];
        const game = this;
        const remotePlayers = [];
        const remoteColliders = [];



        this.remoteData.forEach(function(data){
            if(game.player.id != data.id) // We do for all remoteplayers except us
            {
                //Is the remoteplayer being intialized
                let iplayer;
                game.intializingPlayers.forEach(function(player){
                    if(player.id == data.id){
                        iplayer = player;   
                    }
                })// Is the player already intialized check the remoteplayers array
                if(iplayer === undefined)
                {
                    let rplayer;
                    game.remotePlayers.forEach(function(player)
                    {
                        if(player.id == data.id)
                        {
                            rplayer = player;
                        }
                    });

                    if(rplayer === undefined) // If player is not in remoteplayerslist or intialziing players list
                    {
                        game.intializingPlayers.push(new Player(game,data));
                    }
                    else
                    {
                        remotePlayers.push(rplayer);
                        remoteColliders.push(rplayer.collider);
                    }
                }
            }
        });

        this.scene.children.forEach( function(object){
			if (object.userData.remotePlayer && game.getRemotePlayerById(object.userData.id)==undefined){
				game.scene.remove(object);
			}	
		});
		
		this.remotePlayers = remotePlayers;
		this.remoteColliders = remoteColliders;
		this.remotePlayers.forEach(function(player){ player.update( dt ); });	
        



    }

    // Loads all the animation from the FBX file into animations objects
    loadnextAnim(loader)
    {
        let anim = this.anims.pop();
        const game = this;
        loader.load('Animations/'+anim+'.fbx' , function(object){
            game.player.animations[anim] = object.animations[0]; // Pushes FBX animation into the animations
            if(game.anims.length > 0)
            {
                game.loadnextAnim(loader);
            }
            else
            {
                delete game.anims;
                game.action = "Idle";
                game.animate();
            }
        });
     }

    
     set activeCamera(object) // player.cameras.active is made here
     {
         this.player.cameras.active = object;
     }

 


	createCameras(){
		const offset = new THREE.Vector3(0, 80, 0);
		const front = new THREE.Object3D();
		front.position.set(112, 100, 600);
		front.parent = this.player.object;
		const back = new THREE.Object3D();
		back.position.set(0, 300, -600);
		back.parent = this.player.object;
		const chat = new THREE.Object3D();
		chat.position.set(0, 200, -450);
		chat.parent = this.player.object;
		const wide = new THREE.Object3D();
		wide.position.set(178, 139, 1665);
		wide.parent = this.player.object;
		const overhead = new THREE.Object3D();
		overhead.position.set(0, 400, 0);
		overhead.parent = this.player.object;
		const collect = new THREE.Object3D();
		collect.position.set(40, 82, 94);
		collect.parent = this.player.object;
		this.player.cameras = { front, back, wide, overhead, collect, chat };
		this.activeCamera = this.player.cameras.back;	
	}


    loadFonts()
    {

    
      const loader = new FontLoader();
      loader.load( 'fonts/helvetiker_regular.typeface.json', function ( font ) {
      
        const textgeo = new TextGeometry( 'Hello three.js!', {
              font: font,
              size: 80,
              height: 5,
              curveSegments: 12,
              bevelEnabled: true,
              bevelThickness: 10,
              bevelSize: 8,
              bevelOffset: 0,
              bevelSegments: 5
          } );

          const planeMaterial = new THREE.MeshBasicMaterial()
          const textMesh = new THREE.Mesh(textgeo,planeMaterial);
      } );

    
    }

  
    

   
    animate() // GameLoop
    {
        const game = this;
        const dt = this.clock.getDelta();



        requestAnimationFrame(function(){ game.animate();});

       
        //  console.log(game.intializingPlayers)

        this.updateRemotePlayer(dt);
        if(this.player.mixer !== undefined) // Updates the animation
        {
            this.player.mixer.update(dt);
        }
        if(this.player)
        {       
            this.player.movePlayer(dt);
        }
        if(this.player.cameras != undefined && this.player.cameras.active != undefined)
        {
            this.camera.position.lerp(this.player.cameras.active.getWorldPosition(new THREE.Vector3()),0.05);
            const pos = this.player.object.position.clone();
            pos.y += 200;
            this.camera.lookAt(pos);
        }

        if (this.speechBubble!==undefined) this.speechBubble.show(this.camera.position);
        this.renderer.render(this.scene,this.camera);
    }
}


class SpeechBubble{
	constructor(game, msg, size=1){
		 this.config = { font:'Calibri', size:24, padding:10, colour:'#222', width:256, height:256 };
		
		const planeGeometry = new THREE.PlaneGeometry(size, size);
		const planeMaterial = new THREE.MeshBasicMaterial()
		this.mesh = new THREE.Mesh(planeGeometry, planeMaterial);
		game.scene.add(this.mesh);
		
		const self = this;
		const loader = new THREE.TextureLoader();
		loader.load(
			// resource URL
			'assets/speech.png',

			// onLoad callback
			function ( texture ) {
				// in this example we create the material when the texture is loaded
				self.img = texture.image;
				self.mesh.material.map = texture;
				self.mesh.material.transparent = true;
				self.mesh.material.needsUpdate = true;
				if (msg!==undefined) self.update(msg);
			},

			// onProgress callback currently not supported
			undefined,

			// onError callback
			function ( err ) {
				console.error( 'An error happened.' );
			}
		);
	}
	
	update(msg){
		if (this.mesh===undefined) return;
		
		let context = this.context;
		
		if (this.mesh.userData.context===undefined){
			const canvas = this.createOffscreenCanvas(this.config.width, this.config.height);
			this.context = canvas.getContext('2d');
			context = this.context;
			context.font = `${this.config.size}pt ${this.config.font}`;
			context.fillStyle = this.config.colour;
			context.textAlign = 'center';
			this.mesh.material.map = new THREE.CanvasTexture(canvas);
		}
		
		const bg = this.img;
		context.clearRect(0, 0, this.config.width, this.config.height);
		context.drawImage(bg, 0, 0, bg.width, bg.height, 0, 0, this.config.width, this.config.height);
		this.wrapText(msg, context);
		
		this.mesh.material.map.needsUpdate = true;
	}
	
	createOffscreenCanvas(w, h) {
		const canvas = document.createElement('canvas');
		canvas.width = w;
		canvas.height = h;
		return canvas;
	}
	
	wrapText(text, context){
		const words = text.split(' ');
        let line = '';
		const lines = [];
		const maxWidth = this.config.width - 2*this.config.padding;
		const lineHeight = this.config.size + 8;
		
		words.forEach( function(word){
			const testLine = `${line}${word} `;
        	const metrics = context.measureText(testLine);
        	const testWidth = metrics.width;
			if (testWidth > maxWidth) {
				lines.push(line);
				line = `${word} `;
			}else {
				line = testLine;
			}
		});
		
		if (line != '') lines.push(line);
		
		let y = (this.config.height - lines.length * lineHeight)/2;
		
		lines.forEach( function(line){
			context.fillText(line, 128, y);
			y += lineHeight;
		});
	}
	
	show(pos){
		if (this.mesh!==undefined && this.player!==undefined){
			this.mesh.position.set(this.player.object.position.x, this.player.object.position.y + 380, this.player.object.position.z);
			this.mesh.lookAt(pos);
		}
	}
}


class Player{

    constructor(game,options)
    {

        this.local = true;
        this.SPEED = 300;
        let model , color;

        const colours = ['Black', 'Brown', 'White'];
		color = colours[Math.floor(Math.random()*colours.length)];
									
		if (options===undefined){
			const people = ['Robot1', 'Robot2'];
			model = people[Math.floor(Math.random()*people.length)];
		}else if (typeof options =='object'){
			this.local = false;
			this.options = options;
			this.id = options.id;
			model = options.model;
			color = options.colour;
		}else{
			model = options;
		}


        this.playername = "Avinash";

        this.model = model;
        this.color = "Black";
        this.game = game;
        this.animations = this.game.animations; // Animations are same of all player
        this.ballons = [];
        this.player_direction = new THREE.Vector3();

        const loader = new FBXLoader();
        const player = this;
        this.cannon = new Cannon();

        loader.load('Models/'+this.model+'.fbx' , function(object){ 
            object.mixer = new THREE.AnimationMixer(object);
            player.mixer = object.mixer;
            player.root = object.mixer.getRoot();

            object.name = "Avinash";
            object.traverse(function(child){
                if(child.isMesh){
                   child.material.map = null;
                   child.castShadow = true;
                   child.recieveShadow = true;
                }
            })

            const textureLoader = new THREE.TextureLoader();
            console.log(player.model);


        
                // textureLoader.load('Textures/'+player.model+'.png', function(texture){
                //     console.log("Why is this taking so long");
                //     object.traverse( function ( child ) {
                //         if ( child.isMesh ){
                //             child.material.map = texture;
                //         }
                //     } );
                // });
            
        
          

    
        player.object = new THREE.Object3D();
        player.object.position.set(Math.random() * 1000,0,Math.random() * -1000);
        player.object.rotation.set(0,2,0);
        player.object.add(object); // Adds the 3D model as the child of the player transform object
      

        if(player.deleted === undefined){
            game.scene.add(player.object);
        }

        if(player.local)
        {
            game.createCameras();
            game.animations.Idle = object.animations[0];
             if(player.initSocket !== undefined)
             {
                player.initSocket(); // initItSocket in is PlayerLocal Class
             }
        }
        else
        {
            //Make Player colliders of other remote players in the game
            const geometry = new THREE.BoxGeometry(100,300,100);
            const material = new THREE.MeshBasicMaterial({visible:false});
            const box = new THREE.Mesh(geometry,material);
            box.name = "Collider"; // Player Collider
            box.position.set(0,150,0);
            player.object.add(box);
            player.collider = box;
            player.object.userData.id = player.id;
            player.object.userData.remotePlayer = true;
            //Remove this player from Initializingplayers array
            const players = game.intializingPlayers.splice(game.intializingPlayers.indexOf(this),1);
            game.remotePlayers.push(players[0]);
        }

        if(game.animations.Idle !== undefined)
        {
             player.action = "Idle"; // Assigning this action to the player;
        } 

     });
  }


 
  randomInRange(min, max) {  
    return Math.floor(Math.random() * (max - min) + min); 
} 

  set action(name){
    //Make a copy of the clip if this is a remote player
    if (this.actionName == name) return;
    const clip = (this.local) ? this.animations[name] : THREE.AnimationClip.parse(THREE.AnimationClip.toJSON(this.animations[name])); 
    const action = this.mixer.clipAction( clip );
    action.time = 0;
    this.mixer.stopAllAction();
    this.actionName = name;
    this.actionTime = Date.now();
    
    action.fadeIn(0.5);	
    action.play();
}

    get action()
    {
        return this.actionName;
    }

   

    update(dt)
    {

        this.mixer.update(dt); //Updates the remote player animation

        if(this.game.remoteData.length > 0)
        {
            let found = false;
            for(let data of this.game.remoteData)
            {
                if(data.id != this.id) continue;
                this.object.position.set(data.x,data.y,data.z);
                const euler = new THREE.Euler(data.pb,data.heading,data.pb);
                this.object.quaternion.setFromEuler(euler);
                this.action = data.action;
                found = true;
            }
            if(!found)
            {
                this.game.removePlayer(this);
            }
        }
     }
}



class Cannon{

    constructor()
    {
        const geometry = new THREE.BoxGeometry(3,32,32); // radius , width segments , height segments;
        const material = new THREE.MeshBasicMaterial({color:0x222222});
        const ballonobj = new THREE.Mesh(geometry,material);
    }


    createballon()
    {
        const geometry = new THREE.SphereGeometry(10,32,32); // radius , width segments , height segments;
        const material = new THREE.MeshBasicMaterial({color:0xffffff});
        const ballonobj = new THREE.Mesh(geometry,material);
        return ballonobj;
    }
}


//Socket Only Applies to PlayerLocal
class PlayerLocal extends Player{ 

    constructor(game,model)
    {
     
       super(game,model);   // Calls the base class constructor
       const player = this;
       const socket = io();  


       socket.on('setId',(data)=>{
           player.id = data.id;
       })

       socket.on('remoteData',(data)=>{
           game.remoteData = data;
       })

       socket.on('deletePlayer', function(data){
        const players = game.remotePlayers.filter(function(player){
            if (player.id == data.id){
                return player;
            }
        });
        if (players.length>0){
            let index = game.remotePlayers.indexOf(players[0]);
            if (index!=-1){
                game.remotePlayers.splice( index, 1 );
                game.scene.remove(players[0].object);
            }
        }else{
            index = game.intializingPlayers.indexOf(data.id);
            if (index!=-1){
                const player = game.intializingPlayers[index];
                player.deleted = true;
                game.intializingPlayers.splice(index, 1);
            }
        }
    });
    


    socket.on('chat message', function(data)
    {
        document.getElementById('chat').style.bottom = '0px';
        const player = game.getRemotePlayerById(data.id);
        game.speechBubble.player = player;
        game.chatSocketId = player.id;
        game.activeCamera = game.player.cameras.chat;

        game.speechBubble.update(data.playername + " : "+data.message);
    });
    
    $('#msg-form').submit(function(e){
        socket.emit('chat message', { id:game.chatSocketId, message: $('#m').val() , playername : $('#name').val()});
        $('#m').val('');
        return false;
    });

       this.socket = socket;
    }



    initSocket()
    {
        this.socket.emit('init',{
            model : this.model,
            color : this.color,
            x : this.object.position.x,   // Acesses the base class object
            y : this.object.position.y,
            z : this.object.position.z,
            h : this.object.rotation.y,
            pb : this.object.rotation.x
        })
    }

    updateSocket()
    {
        if(this.socket !== undefined)
        {
            this.socket.emit('update',{
                x : this.object.position.x,
                y : this.object.position.y,
                z : this.object.position.z,
                h : this.object.rotation.y,
                pb : this.object.rotation.x,
                action: this.action
            })
        }
    }


    movePlayer(dt)
    {

        const dir = new THREE.Vector3();
        const pos = this.object.position.clone();

        pos.y+=60;
        this.object.getWorldDirection(dir);


        let raycaster = new THREE.Raycaster(pos,dir);
        let blocked = false;
        const colliders = game.colliders;

        game.remoteColliders.forEach((remoteCollider)=>{

            colliders.push(remoteCollider);

        });


        if(colliders !== undefined)
        {
            const intersect = raycaster.intersectObjects(colliders)

            

            if(intersect.length > 0)
            {
                if(intersect[0].distance < 50)
                {
                    blocked = true;
                }
            }
        }

        if(colliders!== undefined)
        {
            //this refereces to the player in the base class
            dir.set(-1,0,0); //Cast left
            dir.applyMatrix4(this.object.matrix);
            dir.normalize();

            raycaster = new THREE.Raycaster(dir,pos);
            let intersect = raycaster.intersectObjects(colliders)

            

         
            if(intersect.length > 0)
            {
                if(intersect[0].distance < 50)
                {
                     // Pushes Player Right
                    this.object.translateX(300 - intersect[0].distance);
                }
            }

            dir.set(1,0,0); //Cast Right
            dir.applyMatrix4(this.object.matrix);
            dir.normalize();

            raycaster = new THREE.Raycaster(dir,pos);
            intersect = raycaster.intersectObjects(colliders)

         
            if(intersect.length > 0)
            {
                if(intersect[0].distance < 50)
                {
                     // Pushed Player Left
                    this.object.translateX(intersect[0].distance - 300); // Pushed Player Left
                }
            }
        }

        if(!UP && !DOWN && !LEFT && !RIGHT)
        {
            if(this.action != 'Idle')
            {
                this.action = 'Idle';
            }
        }
       if(UP)
       {
           if(!blocked)
           {
                this.object.translateZ(dt*this.SPEED);
           }
           if(LEFT)
           {
                this.object.rotateY(dt*0.7);
                if(this.action != "Walking Left Turn")
                {  
                    this.action = 'Walking Left Turn';
                }
           }
           else if(RIGHT)
           {
               
                this.object.rotateY(-dt*0.7);
                

                if(this.action != "Walking Right Turn")
                {  
                    this.action = 'Walking Right Turn';
                }
           }
           else
           {
                if(this.action != "Running")
                {
                    this.action = 'Running';
                }
           }
       }
       if(!UP && RIGHT)
       {
          
            this.object.rotateY(-dt*0.7);
           
           
        //    if(this.action != "Right Turn")
        //    {
        //        this.action = "Right Turn";
        //    }
       }
      if(!UP && LEFT)
       {
            this.object.rotateY(dt*0.7);
           
            // if(this.action != "Left Turn")
            // {
            //     this.action = "Left Turn";
            // }
       }

    //    this.object.rotateY(this.motion.turn*dt);
       this.updateSocket();
    }
}
function Keyup(e) {
   // console.log(UP,DOWN,LEFT,FIRE);
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
        case " ":
            FIRE = false;
        }  
    }
}

let game;

function KeyDown(e) {  
  //  console.log(UP,DOWN,LEFT,RIGHT,FIRE);
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
        case " ":
            FIRE = true;
        }
    }   
}
document.addEventListener('keydown',KeyDown);
document.addEventListener('keyup',Keyup);


$('#name-form').submit(function(e){
  
    const Intro = document.getElementById('Intro');
    Intro.style.top = '-120px';

   setTimeout(function()
   {
    game = new Game();
   },1000)
   return false;
});






