# Javascript Metaverse #
### [Working Link](https://metaversescript.glitch.me)

### Idea ###
I aim to create a 3D Multplayer game with THREE.js and socket.io.It is 3D multiplayer game where you can meet and talk to new player in the virtual world. You can go up to anyone and initiate the conversation simply by clicking on them and chat!.The idea is to engage in social activities together while immersing yourself in the virtual environment.

### Motivation && Inspiration ###
1. To test the limits of socket.io !
2. Creation of 3D game
3. A place to socialize and relax

### Technical Decision ###
1. I will be using THREE.js to render the 3D content in the browser
2. I plan to use socket.io for the multipayer connectivity
3. I plan to develop the entire project using object oriented approach by making objects and encapsulating it with functions
4. I plan to use webpack to bundle all the files into a single js file which is used by the index.html

### Design Decision ###
1. I will be using 3D models and 3D animations from ![Mixamo](https://www.mixamo.com/#/)
2. I will be using the 3D environment from the asset store
3. I will keep the UI very minimalistic and simple
4. Standard Arrow keys will be used to move and rotate the player in the game


## How it works ? ##


### Step 1 : Setting up the scene ###

The three JS renders lights , plane , grid , cameras and intializes the renderer in the browser. The constructor also intializes the remotePlayers array , remoteColliders array , animation arrays which will be used in the game. It also adds Oneventlistener for mouse click in this phase.
```class Game
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

        //Model
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
    
 ```

### Step 2 : Intializing the player ###



### Step 3 : Collision Detection ###
### Step 4 : Socket Integration ###
### Step 5 : Chat functionality ###
### Step 6 : Server Side ###









## WorkFlow
![](https://github.com/Tauke190/Connections-Lab/blob/master/Project%201%20-%20Weather%20App/Screen%20Shot%202022-09-29%20at%2011.11.13%20PM.png)
Pinpoint the location on the map to reveal its weather data

## Key Challenges
1. Drawing the world map piece by piece as a HTML element because it has to be hoverable and give the right information. Uploading a Image cannot work.
2. Learning D3.js which is a java script library for data visualization
3. Understanding the Object oriented method in javascript 


## 25-Sept (Next Steps)

1. Incorporating D3.js for drawing the SVG of the world map from the geographical co-ordinates encoded in JSON
2. Incorporation p5.js for additional interactivity in the Web App
3. Finding a better API that can supply updated and latest images of places of the world/city/country 
4. Styling the elements better and addding animation in the website
5. Adding a load screen for the images because it takes some time to download the images from the API , or adding a small game during the load time


## 29-Sept (Next Steps)
1. Zooming in Feature so you can see weather of specific cities
2. Adding the past history of major weather events in that specific place
3. Adding live clipart animation overlaying the map showing the weather of many places at once 
4. Adding major landmarks of that place so that you can learn about that country as you browse through the weather

## References/Resources
1. [Openweathermap API](https://openweathermap.org/api)
2. [D3.js - JS library](https://openweathermap.org/api)
3. [Splash Image API](https://unsplash.com/developers)


## Final Result
![Final Result](https://github.com/Tauke190/Connections-Lab/blob/master/Project%201%20-%20Weather%20App/Final.png)

