/// <reference path="babylon.d.ts" />



var wrapper;
var engine;
var scene;
let cameras = [];
const leftMargin = 50;
const topMargin = 10;
var advancedTexture;

let breakingForce;
let engineForce;
let vehicleSteering;
let chasis;

var game = {
    gasLevel: 550,
    throttle: 0,
    currentSpeed: 0,
    consumption: 0,
    consumption_max: 10,
    throttle_max: 100,
    gasLevel_max: 550,
    eto: 10
}

var levels = ["world"]
/**
 * ui: 
 * 0->startScreen
 * 1->settingsScreen
 * 2->gameScreen
 * 3->credits
 */
var states = {
    level: 0,
    ui: 0,
}

window.onload = function(){

    wrapper = init();
    engine = wrapper.engine;
    scene = wrapper.scene;
    wrapper.engine.displayLoadingUI();
    // loadScript("js/particleSystem.js", function(){console.log("Particle System loaded")}); 
    // loadScript("js/physics.js", function(){console.log("Physics loaded")});  
    // loadScript("js/controls.js", function(){console.log("Controls loaded")});  
    // loadScript("js/startScreen.js", function(){console.log("Start Screen loaded")});  
    // loadScript("js/level.js", function(){console.log("Level loaded")});  


    wrapper.engine.runRenderLoop(function() {
        wrapper.scene.render();
    });
    // if (BABYLON.VideoRecorder.IsSupported(engine)) {
    //     var recorder = new BABYLON.VideoRecorder(engine);
    //     recorder.startRecording("test.webm", 25);
    // }
    wrapper.engine.hideLoadingUI();
};

function loadScript(url, callback){
    
    var script = document.createElement("script");
    script.src = url;
    script.type = "text/javascript";
    script.async = false;
    if (script.readyState){  //IE
        script.onreadystatechange = function(){
            if (script.readyState == "loaded" ||
                    script.readyState == "complete"){
                script.onreadystatechange = null;
                callback();
            }
        };
    } else {  //Others
        script.onload = function(){
            callback();
        };
    }
    
    
    document.getElementsByTagName("head")[0].appendChild(script);
}
var canvas;
function init(){
   // Get the canvas DOM element
    canvas = document.getElementById('app');
    
    // Load the 3D engine
    var engine = new BABYLON.Engine(canvas, true, {preserveDrawingBuffer: true, stencil: true});
    engine.displayLoadingUI();
    
    // CreateScene function that creates and return the scene
    var controllables = {}; 
    var createScene = function(){

        var scene = new BABYLON.Scene(engine);
        
        scene.enablePhysics(new BABYLON.Vector3(0, -10, 0), new BABYLON.AmmoJSPlugin());
        scene.clearColor = new BABYLON.Color3(0.45, 0.45, 0.45);

        const skybox = BABYLON.MeshBuilder.CreateBox("skyBox", {size:700}, scene);
        const skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("Assets/SkyBox/skybox", scene);
        skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        skybox.material = skyboxMaterial;

        var camera = new BABYLON.ArcRotateCamera('PlayerCam', 0, 0, 15, new BABYLON.Vector3(0, 0, 0), scene);
        camera.fov = 0.15;
        camera.maxZ = 100;
        camera.setPosition(new BABYLON.Vector3(10.5, 15.5, 10.5));
        camera.attachControl(canvas, true);
        scene.activeCamera = camera;

        var cameraGameStart = new BABYLON.ArcRotateCamera('StartCam', 0, 0, 15, new BABYLON.Vector3(0, 0, 0), scene);
        cameraGameStart.fov = 0.15;
        cameraGameStart.maxZ = 100;
        cameraGameStart.setPosition(new BABYLON.Vector3(10.5, 15.5, 10.5));
        

        var light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0, 100, 0), scene);
        light.diffuse = new BABYLON.Vector3(0.85, 0.85, 0.85);
        light.intensity = 1;
        light.parent = camera;
        light.target = camera.target;

        // BABYLON.MeshBuilder.CreateBox
        engine.displayLoadingUI();
        let AssetsManager = new BABYLON.AssetsManager(scene);
        let meshTask1 = AssetsManager.addMeshTask("Loading world", "", "assets/World/", levels[0]+".babylon");

         let meshTask2 = AssetsManager.addMeshTask("Loading models", "", "assets/Car/", "car.babylon");
         meshTask2.onSuccess = function(task){
             cameraGameStart.parent = scene.getMeshByName("Car_Body");
             scene.getMeshByName("Car_Body").isVisible = false;
             let myMesh = scene.getMeshByName("Car_Pivot");
             myMesh.isVisible = false;
             scene.getMeshByName("Car_ParticleSource").isVisible = false;
             scene.getMeshByName("Car_AxleB").isVisible = false;
             scene.getMeshByName("Car_AxleF").isVisible = false;
             scene.getMeshByName("Car_AxleFL").isVisible = false;
             scene.getMeshByName("Car_AxleFR").isVisible = false;
             scene.getMeshByName("Car_WBL").isVisible = false;
             scene.getMeshByName("Car_WBR").isVisible = false;
             scene.getMeshByName("Car_WFL").isVisible = false;
             scene.getMeshByName("Car_WFR").isVisible = false;
         };

        
        AssetsManager.onFinish = function(tasks) {

            scene.fogMode = BABYLON.Scene.FOGMODE_LINEAR;
            scene.fogStart = 20.0;
            scene.fogEnd = 100.0;
            scene.fogColor = new BABYLON.Color3(0.45, 0.45, 0.45);
            scene.fogDensity = 0.01;
            wrapper.ui = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("StartScreenUI");
            advancedTexture = wrapper.ui;
            loadCar();

            chasis = scene.getMeshByName("car_chasis");
            scene.cameras[0].parent = chasis;
            scene.cameras[1].parent = chasis;
            loadControls();
            loadLevel();
            loadUI();
            scene.activeCamera = cameraGameStart;
            startScreen();
            settingsListener();
            cameraControls();
            engine.hideLoadingUI();
        };

        AssetsManager.load();
       





       
        return scene;
    }
    // call the createScene function
    var scene = createScene();

    // run the render loop
    // engine.runRenderLoop(function(){
    //     scene.render
    //     scene.render();
    // });
    // the canvas/window resize event handler
    window.addEventListener('resize', function(){
        engine.resize();
    });
    return {'engine': engine, 'scene': scene, 'game_end': false};
}

var state = true;
states.cameraCount = 0;
function cameraControls(){
    states.cameraCount = scene.cameras.length;
    scene.registerBeforeRender(() => {
        if(states.ui == 2){
            let ind = 0;
            scene.cameras.forEach(camera => {
                if(map[ind+""]){
                    scene.activeCamera = camera;
                
                }
                ind++;
            });
        }
    });
}
var map = {};
function loadControls(){
    

    scene.actionManager = new BABYLON.ActionManager(scene);



    scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, function (evt) {								
        map[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
        
    }));

    scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, function (evt) {								
        map[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
    }));	

}

function settingsListener(){

}

function loadCar(){
    addVehicleReady();
    loadParticleSystem();
    // createChasis();

}

function resetGame (){
    game = {
        gasLevel: 550,
        throttle: 0,
        currentSpeed: 0,
        consumption: 0,
        consumption_max: 10,
        throttle_max: 100,
        gasLevel_max: 550,
        eto: 10
    }
}

function loadUI(){
    
    startScreen();
    
}

var activePanels = [];
function createGUI(){

    states.ui = 2;

    let playerPanel = new BABYLON.GUI.StackPanel("PlayerGUI");
    playerPanel.isVertical = true;
    playerPanel.width = "340px";
    playerPanel.height = "220px";
    playerPanel.verticalAlignment = 1;
    playerPanel.horizontalAlignment = 0;
    playerPanel.left = "20px";
    playerPanel.paddingBottom = "20px";
    playerPanel.isPointerBlocker = true;
    playerPanel.background = "#F29544";
    playerPanel.shadowBlur = 10;
    playerPanel.shadowOffsetX = 0;
    playerPanel.shadowOffsetY = 0;
    playerPanel.shadowColor = "#000000A5";

    let fuelPanel = new BABYLON.GUI.StackPanel("Health");
    fuelPanel.width = "340px";
    fuelPanel.height = "80px";
    fuelPanel.verticalAlignment = 0;
    fuelPanel.horizontalAlignment = 0;
    fuelPanel.paddingLeft = "10px";
    fuelPanel.paddingTop = "10px";
    fuelPanel.paddingBottom = "10px";
    fuelPanel.paddingRight = "10px";
    fuelPanel.isVertical = false;

    let fuelText = new BABYLON.GUI.TextBlock();
    fuelText.text = "FUEL";
    fuelText.width = "60px";
    fuelText.textHorizontalAlignment = 0;
    fuelText.color = "0D0D0D";

    fbarw = 240;
    let fuelBar = new BABYLON.GUI.Rectangle();
    fuelBar.thickness = 0;
    fuelBar.color = "#0D0D0D";
    fuelBar.background = "#0D0D0D";
    fuelBar.height = "50px";
    fuelBar.width = fbarw+"px";

    let fuelBarInner = new BABYLON.GUI.Rectangle();
    fuelBarInner.thickness = 0;
    fuelBarInner.color = "#F29544";
    fuelBarInner.background = "#F29544";
    fuelBarInner.height = "30px";
    fuelBarInner.width = (game.gasLevel)*(fbarw-20)/(game.gasLevel_max)+20+ "px";
    fuelBarInner.horizontalAlignment = 0;
    fuelBarInner.paddingLeft = "10px";
    fuelBarInner.paddingRight = "10px";

    fuelBar.addControl(fuelBarInner);
    fuelPanel.addControl(fuelText);
    fuelPanel.addControl(fuelBar);
    playerPanel.addControl(fuelPanel);

    let consumptionPanel = new BABYLON.GUI.StackPanel("consumption");
    consumptionPanel.width = "340px";
    consumptionPanel.height = "80px";
    consumptionPanel.verticalAlignment = 0;
    consumptionPanel.horizontalAlignment = 0;
    consumptionPanel.paddingLeft = "10px";
    consumptionPanel.paddingTop = "10px";
    consumptionPanel.paddingBottom = "10px";
    consumptionPanel.paddingRight = "10px";
    consumptionPanel.isVertical = false;

    let consumptionText = new BABYLON.GUI.TextBlock();
    consumptionText.text = "CON";
    consumptionText.width = "60px";
    consumptionText.textHorizontalAlignment = 0;
    consumptionText.color = "0D0D0D";

    fbarw = 240;
    let consumptionBar = new BABYLON.GUI.Rectangle();
    consumptionBar.thickness = 0;
    consumptionBar.color = "#0D0D0D";
    consumptionBar.background = "#0D0D0D";
    consumptionBar.height = "50px";
    consumptionBar.width = fbarw+"px";

    let consumptionBarInner = new BABYLON.GUI.Rectangle();
    consumptionBarInner.thickness = 0;
    consumptionBarInner.color = "#F29544";
    consumptionBarInner.background = "#F29544";
    consumptionBarInner.height = "30px";
    consumptionBarInner.width = (Math.abs(game.consumption))*(fbarw-20)/(game.consumption_max)+20+ "px";
    consumptionBarInner.horizontalAlignment = 0;
    consumptionBarInner.paddingLeft = "10px";
    consumptionBarInner.paddingRight = "10px";

    consumptionBar.addControl(consumptionBarInner);
    consumptionPanel.addControl(consumptionText);
    consumptionPanel.addControl(consumptionBar);
    playerPanel.addControl(consumptionPanel);

    let speedandcamera = new BABYLON.GUI.StackPanel();
    speedandcamera.width = "340px";
    speedandcamera.height = "40px";
    speedandcamera.verticalAlignment = 0;
    speedandcamera.horizontalAlignment = 0;
    speedandcamera.top = 0;
    speedandcamera.paddingLeft = "10px";
    speedandcamera.paddingTop = "0px";
    speedandcamera.paddingBottom = "10px";
    speedandcamera.paddingRight = "10px";
    speedandcamera.isVertical = false;

    let speed = new BABYLON.GUI.TextBlock();
    speed.text = "Speed: "+Math.round(game.currentSpeed)+"km/h";
    speed.width = "140px";
    speed.textHorizontalAlignment = 0;
    speed.color = "0D0D0D";

    let camera = new BABYLON.GUI.TextBlock();
    camera.text = "Use key(s) 0"+(states.cameraCount>0 ? ("-"+states.cameraCount) : "")+" for camera.";
    camera.fontSize = "13px";
    camera.width = "160px";
    camera.textHorizontalAlignment = 0;
    camera.color = "0D0D0D";


    speedandcamera.addControl(speed);
    speedandcamera.addControl(camera);
    playerPanel.addControl(speedandcamera);

    scene.registerBeforeRender(()=>{
        if(typeof speed != "undefined")
            speed.text = "Speed: "+Math.round(game.currentSpeed)+"km/h";
        if(typeof fuelBarInner != "undefined")
            fuelBarInner.width = (game.gasLevel)*(fbarw-20)/(game.gasLevel_max)+20 + "px";
        if(typeof consumptionBarInner != "undefined"){
            if(game.consumption>0)
                consumptionBarInner.width = (Math.abs(game.consumption))*(fbarw-20)/(game.consumption_max)+20 + "px";
            else
                consumptionBarInner.width = "0px";
        }
    });





    activePanels.push(playerPanel);
    advancedTexture.addControl(playerPanel);


}

function clearUI(){
    console.log(activePanels);
    activePanels.forEach(panel => {
        console.log("removing:");
        console.log(panel);
        advancedTexture.removeControl(panel);
    });
    
}

function startScreen(){

    createHomeScreen();
}


function createHomeScreen(){
    states.ui = 0;
    let logo = new BABYLON.GUI.Image("Logo", "img/Logo.png");
    logo.width = "300px";
    logo.height = "120px";
    logo.horizontalAlignment = 0;
    logo.verticalAlignment = 0;
    logo.left = leftMargin;
    logo.top = topMargin+20;
    wrapper.uielements = {};
    activePanels.push(logo);
    

    let settingsButton = BABYLON.GUI.Button.CreateImageOnlyButton("settings", "img/settings.png");
    settingsButton.width = "250px";
    settingsButton.height = "70px";
    settingsButton.horizontalAlignment = 0;
    settingsButton.verticalAlignment = 0;
    settingsButton.left = leftMargin;
    settingsButton.top = topMargin+270;
    settingsButton.onPointerClickObservable.add(function(){
        clearUI();
        createSettingsScreen();
    });
    activePanels.push(settingsButton);

    let startButton = BABYLON.GUI.Button.CreateImageOnlyButton("start", "img/start.png");
    startButton.width = "150px";
    startButton.height = "70px";
    startButton.horizontalAlignment = 0;
    startButton.verticalAlignment = 0;
    startButton.left = leftMargin;
    startButton.top = topMargin+180;
    startButton.onPointerClickObservable.add(function(){
        // wrapper.scene.activeCamera = wrapper.scene.getCameraByName("PlayerCam");
        clearUI();
        scene.activeCamera = scene.cameras[2];
        resetGame();
        createGUI();
    });
    activePanels.push(startButton);
    
    advancedTexture.addControl(logo);
    advancedTexture.addControl(settingsButton);
    advancedTexture.addControl(startButton);
}

var settings = {
    fog: true,
    camera_frustum: 100,
}

function endScreenCountDownStart(){
    if(states.ui == 2){
        let counter = new BABYLON.GUI.TextBlock();
        counter.verticalAlignment = 0;
        counter.horizontalAlignment = 0;
        counter.top = topMargin+20;
        counter.fontSize = 72;
        counter.text = "10";
    
        
        scene.registerBeforeRender(()=>{
            if(typeof counter != "undefined"){
                if(game.eto > 0)
                    counter.text = Math.round(game.eto)+"";
                else
                    counter.text = "0";
            }
        });

        activePanels.push(counter);
        advancedTexture.addControl(counter);
    }
    
}


function endGame(){

    states.ui = 4;
    resetGame();
}

function endScreenWin(){
    clearUI();
    let endScreen = new BABYLON.GUI.Rectangle();
    endScreen.background = "#fff";
    endScreen.width = 100;
    endScreen.height = 100;
    endScreen.isPointerBlocker = true;

    let logo = new BABYLON.GUI.Image("Logo", "img/Logo_black.png");
    logo.width = "300px";
    logo.height = "120px";
    logo.horizontalAlignment = 2;
    logo.verticalAlignment = 2;
    logo.left = 0;
    logo.top = topMargin+150;
    endScreen.addControl(logo);

    let endScreenText = new BABYLON.GUI.TextBlock();
    if(game.gasLevel > game.gasLevel_max*0.7)
        endScreenText.text = "Grace will live, because you chose the best way that you consumed less than 30% of fuel.";
    else if(game.gasLevel > game.gasLevel_max*0.4)
        endScreenText.text = "Grace will live, because you got it!";
    else if(game.gasLevel > game.gasLevel_max*0.3)
        endScreenText.text = "Grace will live, but you could make it better.";
    else
        endScreenText.text = "Grace will live. Just live.";
    endScreenText.color = "#0D0D0D";
    endScreenText.verticalAlignment = 2;
    endScreenText.horizontalAlignment = 2;
    
    endScreen.addControl(endScreenText);
    
    activePanels.push(endScreen);
    advancedTexture.addControl(endScreen);
    endGame();
}

function endScreenFail(){
    clearUI();
    let endScreen = new BABYLON.GUI.Rectangle();
    endScreen.background = "#000";
    endScreen.width = 100;
    endScreen.height = 100;
    endScreen.isPointerBlocker = true;

    let logo = new BABYLON.GUI.Image("Logo", "img/Logo.png");
    logo.width = "300px";
    logo.height = "120px";
    logo.horizontalAlignment = 2;
    logo.verticalAlignment = 2;
    logo.left = 0;
    logo.top = topMargin+150;
    endScreen.addControl(logo);

    let endScreenText = new BABYLON.GUI.TextBlock();
    endScreenText.text = "Grace lost her life."
    endScreenText.color = "white";
    endScreenText.verticalAlignment = 2;
    endScreenText.horizontalAlignment = 2;

    endScreen.addControl(endScreenText);

    activePanels.push(endScreen);
    advancedTexture.addControl(endScreen);
    endGame();
}

function createSettingsScreen(){
    states.ui = 1;
    
    let logo = new BABYLON.GUI.Image("Logo", "img/Logo.png");
    logo.width = "300px";
    logo.height = "120px";
    logo.horizontalAlignment = 0;
    logo.verticalAlignment = 0;
    logo.left = leftMargin;
    logo.top = topMargin+20;
    wrapper.uielements = {};
    wrapper.uielements.logo = logo;
    activePanels.push(logo);

    let homeButton = BABYLON.GUI.Button.CreateImageOnlyButton("home", "img/home.png");
    homeButton.width = "70px";
    homeButton.height = "70px";
    homeButton.horizontalAlignment = 0;
    homeButton.verticalAlignment = 0;
    homeButton.left = leftMargin;
    homeButton.top = topMargin+180;
    homeButton.onPointerClickObservable.add(function(){
        clearUI();
        createHomeScreen();
    });
    activePanels.push(homeButton);

    var panel = new BABYLON.GUI.StackPanel("settings_panel");
    panel.width = "400px";
    panel.height = "400px";
    panel.isVertical = true;
    panel.horizontalAlignment = 0;
    panel.verticalAlignment = 0;
    panel.left = leftMargin;
    panel.top = topMargin+250;


    let fogPanel = new BABYLON.GUI.StackPanel();
    fogPanel.width = "400px";
    fogPanel.height = "60px";
    fogPanel.isVertical = false;

    let fogText = new BABYLON.GUI.TextBlock();
    fogText.text = "Fog on/off";
    fogText.width = "355px";
    fogText.paddingLeft = "15px";
    fogText.textHorizontalAlignment = 0;
    fogText.color = "white";

    let fog = new BABYLON.GUI.Checkbox("enable fog");
    fog.width = "40px";
    fog.height = "40px";
    fog.isChecked = true;
    fog.color = "#F29544";
    fog.onIsCheckedChangedObservable.add(function(value) {

        settings.fog = value;

        if(value === true){
            scene.fogMode = BABYLON.Scene.FOGMODE_LINEAR;
            scene.fogStart = 20.0;
            scene.fogEnd = 100.0;
            scene.fogColor = new BABYLON.Color3(0.45, 0.45, 0.45);
            scene.fogDensity = 0.01;
        }else{
            scene.fogMode = BABYLON.Scene.FOGMODE_NONE;
        }
      
    });
    
    fogPanel.addControl(fog);
    fogPanel.addControl(fogText);

    let frustumPanel= new BABYLON.GUI.StackPanel();
    frustumPanel.width = "400px";
    frustumPanel.height = "60px";
    frustumPanel.isVertical = false;

    let frustumText = new BABYLON.GUI.TextBlock();
    frustumText.text = "Frustum MaxZ: "+ settings.camera_frustum + " ";
    frustumText.width = "235px";
    frustumText.paddingLeft = "15px";
    frustumText.textHorizontalAlignment = 0;
    frustumText.color = "white";

    let frustum = new BABYLON.GUI.Slider();
    frustum.minimum = 60;
    frustum.maximum = 200;
    frustum.value = settings.camera_frustum;
    frustum.height = "40px";
    frustum.width = "100px";
    frustum.step = 1;
    frustum.color = "#F29544";
    frustum.isThumbClamped = true;
    frustum.horizontalAlignment = 0;
    frustum.onValueChangedObservable.add(function(value) {
        frustumText.text = "Frustum MaxZ: " + settings.camera_frustum + " ";
        if (settings) {
            settings.camera_frustum = value;
            scene.cameras.forEach(camera =>{
                camera.maxZ = settings.camera_frustum;
            });
           
        }
    });
    
    frustumPanel.addControl(frustum);
    frustumPanel.addControl(frustumText);



    panel.addControl(fogPanel);
    panel.addControl(frustumPanel);
    advancedTexture.addControl(panel);
    activePanels.push(panel)
    advancedTexture.addControl(logo);
    advancedTexture.addControl(homeButton);
}

var checkpoints = [];
function loadLevel(){
    
    {
        let scene = wrapper.scene;
        let levelStart = scene.getMeshByName("Start");
        let levelFinish = scene.getMeshByName("Finish");
        // let car_body = scene.getMeshByName("Car_Body");
        let pivot = scene.getMeshByName("car_chasis");
        let limit = scene.getMeshByName("LIMITS");
        let nodes = scene.getMeshByName("NODES");
        if(nodes != undefined){
            let childs = nodes.getChildMeshes();
            console.log("There's "+childs.length+" nodes");
            childs.forEach(child => {
                checkpoints.push(child.position);
                child.isVisible = false;
            });
        }
    
        if(limit != undefined){
            
            let childs = limit.getChildMeshes();
            childs.forEach(child => {
    
                child.isVisible = false;
            });
        }
        if(levelStart != undefined){
            levelStart.isVisible = false;
            pivot.position = levelStart.position;
            pivot.position.y += 10;
        }
        if(levelFinish != undefined){
            levelFinish.isVisible = false;
            levelFinish.actionManager = new BABYLON.ActionManager(scene);
            levelFinish.actionManager.registerAction(
            new BABYLON.ExecuteCodeAction(
                {
                    trigger: BABYLON.ActionManager.OnIntersectionEnterTrigger,
                    parameter: pivot
                },
                function () { 
                    endScreenWin();
                }
            ));
        }
        
    
    }
}

function loadParticleSystem(){
    let exhoustEmission = wrapper.scene.getMeshByName("car_chasis_ps");
    let particleSystem = new BABYLON.GPUParticleSystem("exhoust", 10, wrapper.scene);
    particleSystem.particleTexture = new BABYLON.Texture("assets/Car/exhaust.bmp");
    particleSystem.emitter = exhoustEmission;
    particleSystem.minSize = 0.02;
    particleSystem.maxSize = 0.2;
    particleSystem.minEmitPower = 2;
    particleSystem.maxEmitPower = 2.5;
    particleSystem.minAngularSpeed = 0;
    particleSystem.maxAngularSpeed = Math.PI;
    particleSystem.emitRate = 5;
    particleSystem.minLifeTime = 0.3;
    particleSystem.maxLifeTime = 1.5;
    particleSystem.gravity = new BABYLON.Vector3(0, 0.21, 0);
    particleSystem.direction1 = new BABYLON.Vector3(0, 0, 1);
    particleSystem.direction2 = new BABYLON.Vector3(0, 0, 2);
    particleSystem.start();
}

var vehicle, scene, chassisMesh, redMaterial, blueMaterial, greenMaterial, blackMaterial;
var wheelMeshes = [];
var actions = {accelerate:false,brake:false,right:false,left:false};

var keysActions = {
	"KeyW":'acceleration',
	"KeyS":'braking',
	"KeyA":'left',
	"KeyD":'right'
};

var vehicleReady = false;  

var ZERO_QUATERNION = new BABYLON.Quaternion(); 

var chassisWidth = 1.8;
var chassisHeight = .6;
var chassisLength = 4;
var massVehicle = 200;

var wheelAxisPositionBack = -1;
var wheelRadiusBack = .4;
var wheelWidthBack = .3;
var wheelHalfTrackBack = 1;
var wheelAxisHeightBack = 0.4;

var wheelAxisFrontPosition = 1.0;
var wheelHalfTrackFront = 1;
var wheelAxisHeightFront = 0.4;
var wheelRadiusFront = .4;
var wheelWidthFront = .3;

var friction = 5;
var suspensionStiffness = 10;
var suspensionDamping = 0.3;
var suspensionCompression = 4.4;
var suspensionRestLength = 0.6;
var rollInfluence = 0.0;

var steeringIncrement = .01;
var steeringClamp = 0.2;
var maxEngineForce = 500;
var maxBreakingForce = 10;
var incEngine = 10.0;

var FRONT_LEFT = 0;
var FRONT_RIGHT = 1;
var BACK_LEFT = 2;
var BACK_RIGHT = 3;
				
var wheelDirectionCS0;
var wheelAxleCS;
var redMaterial;
var greenMaterial;
var blueMaterial;

function addVehicleReady() {



    redMaterial = new BABYLON.StandardMaterial("RedMaterial", scene);
    redMaterial.diffuseColor = new BABYLON.Color3(0.8,0.4,0.5);
    redMaterial.emissiveColor = new BABYLON.Color3(0.8,0.4,0.5);

    blueMaterial = new BABYLON.StandardMaterial("RedMaterial", scene);
    blueMaterial.diffuseColor = new BABYLON.Color3(0.5,0.4,0.8);
    blueMaterial.emissiveColor = new BABYLON.Color3(0.5,0.4,0.8);

    greenMaterial = new BABYLON.StandardMaterial("RedMaterial", scene);
    greenMaterial.diffuseColor = new BABYLON.Color3(0.5,0.8,0.5);
    greenMaterial.emissiveColor = new BABYLON.Color3(0.5,0.8,0.5);

    blackMaterial = new BABYLON.StandardMaterial("RedMaterial", scene);
    blackMaterial.diffuseColor = new BABYLON.Color3(0.1,0.1,0.1);
    blackMaterial.emissiveColor = new BABYLON.Color3(0.1,0.1,0.1);
    // Enable physics

    wheelDirectionCS0 = new Ammo.btVector3(0, -1, 0);
    wheelAxleCS = new Ammo.btVector3(-1, 0, 0);




    createVehicle(new BABYLON.Vector3(0, 4, -20), ZERO_QUATERNION);
    
    window.addEventListener( 'keydown', keydown);
	window.addEventListener( 'keyup', keyup);


    scene.registerBeforeRender(function(){

        var dt = engine.getDeltaTime().toFixed()/1000;
        

        if(vehicleReady ){
            var oldSpeed = game.currentSpeed;
            var speed = vehicle.getCurrentSpeedKmHour();
            var maxSteerVal = 0.2;
            breakingForce = 0;
			engineForce = 0;
      
            if(game.gasLevel>0){
                if(actions.acceleration && states.ui == 2){
                    if (speed < -1){
                        breakingForce = maxBreakingForce;
                    }else {
                        engineForce = maxEngineForce;
                    }
                        
                } else if(actions.braking && states.ui == 2){
                    if (speed > 1){
                        breakingForce = maxBreakingForce;
                    }else {
                        engineForce = -maxEngineForce ;
                    }
                } 
                        
                if(actions.right && states.ui == 2){
                    if (vehicleSteering < steeringClamp){
                        vehicleSteering += steeringIncrement;
                    }
                        
                } else if(actions.left && states.ui == 2){
                    if (vehicleSteering > -steeringClamp){
                        vehicleSteering -= steeringIncrement;
                    }
                        
                } else {
                    vehicleSteering = 0;
                }
                        
                vehicle.applyEngineForce(engineForce, FRONT_LEFT);
                vehicle.applyEngineForce(engineForce, FRONT_RIGHT);
                        
                vehicle.setBrake(breakingForce / 2, FRONT_LEFT);
                vehicle.setBrake(breakingForce / 2, FRONT_RIGHT);
                vehicle.setBrake(breakingForce, BACK_LEFT);
                vehicle.setBrake(breakingForce, BACK_RIGHT);
                        
                vehicle.setSteeringValue(vehicleSteering, FRONT_LEFT);
                vehicle.setSteeringValue(vehicleSteering, FRONT_RIGHT);
                        
                        
                var tm, p, q, i;
                var n = vehicle.getNumWheels();
                for (i = 0; i < n; i++) {
                    vehicle.updateWheelTransform(i, true);
                    tm = vehicle.getWheelTransformWS(i);
                    p = tm.getOrigin();
                    q = tm.getRotation();
                    wheelMeshes[i].position.set(p.x(), p.y(), p.z());
                    wheelMeshes[i].rotationQuaternion.set(q.x(), q.y(), q.z(), q.w());
                    wheelMeshes[i].rotate(BABYLON.Axis.Z, Math.PI/2);
                }

                tm = vehicle.getChassisWorldTransform();
                p = tm.getOrigin();
                q = tm.getRotation();
                chassisMesh.position.set(p.x(), p.y() + 0.8, p.z());
                chassisMesh.rotationQuaternion.set(q.x(), q.y(), q.z(), q.w());
                chassisMesh.rotate(BABYLON.Axis.Y, Math.PI);

                if(game.consumption>=0){
                    scene.fogStart = 20*(game.gasLevel/game.gasLevel_max);
                    scene.fogEnd = 100*(game.gasLevel/game.gasLevel_max)+30;
                    scene.fogDensity += 0.01;
                    var consumptionCoeff = (Math.abs(speed-oldSpeed)/80.0+Math.abs(oldSpeed)*0.1);
                    
                    var consumption = consumptionCoeff*2;
                    if(consumption>0.05){
                        game.consumption = consumption;
                        game.gasLevel = game.gasLevel-consumptionCoeff/10;	 
                        
                    }else{
                        game.consumption = 0;
                    }
                    // console.log(game);
                }
            }else{
                
                if(game.eto<0){
                    endScreenFail();
                }else if(game.eto == 10){
                    endScreenCountDownStart();
                }
                var timeout = engine.getDeltaTime()/1000;
                game.eto = game.eto -timeout;
                if(speed < -1 || speed>1){
                    breakingForce = maxBreakingForce/2;
                }
                if(actions.braking && states.ui == 2){
                    
                    breakingForce = maxBreakingForce+breakingForce;
                    
                } 
                if(actions.right && states.ui == 2){
                    if (vehicleSteering < steeringClamp){
                        vehicleSteering += steeringIncrement;
                    }
                        
                } else if(actions.left && states.ui == 2){
                    if (vehicleSteering > -steeringClamp){
                        vehicleSteering -= steeringIncrement;
                    }
                        
                } else {
                    vehicleSteering = 0;
                }

                vehicle.applyEngineForce(0, FRONT_LEFT);
                vehicle.applyEngineForce(0, FRONT_RIGHT);
                vehicle.setBrake(breakingForce / 2, FRONT_LEFT);
                vehicle.setBrake(breakingForce / 2, FRONT_RIGHT);
                vehicle.setBrake(breakingForce, BACK_LEFT);
                vehicle.setBrake(breakingForce, BACK_RIGHT);
                        
                vehicle.setSteeringValue(vehicleSteering, FRONT_LEFT);
                vehicle.setSteeringValue(vehicleSteering, FRONT_RIGHT);

                var tm, p, q, i;
                var n = vehicle.getNumWheels();
                for (i = 0; i < n; i++) {
                    vehicle.updateWheelTransform(i, true);
                    tm = vehicle.getWheelTransformWS(i);
                    p = tm.getOrigin();
                    q = tm.getRotation();
                    wheelMeshes[i].position.set(p.x(), p.y(), p.z());
                    wheelMeshes[i].rotationQuaternion.set(q.x(), q.y(), q.z(), q.w());
                    wheelMeshes[i].rotate(BABYLON.Axis.Z, Math.PI/2);
                }

                tm = vehicle.getChassisWorldTransform();
                p = tm.getOrigin();
                q = tm.getRotation();
                chassisMesh.position.set(p.x(), p.y() + 0.8, p.z());
                chassisMesh.rotationQuaternion.set(q.x(), q.y(), q.z(), q.w());
                chassisMesh.rotate(BABYLON.Axis.Y, Math.PI);

                var consumptionCoeff = 0;
                var consumption = 0;
                game.consumption = consumption;
                game.gasLevel = 0;	 
            }
             
            game.currentSpeed = speed;
        }
		

    });

}


function createVehicle(pos, quat) {
//Going Native
var physicsWorld = scene.getPhysicsEngine().getPhysicsPlugin().world;
			
var geometry = new Ammo.btBoxShape(new Ammo.btVector3(chassisWidth * .5, chassisHeight * 0.1, chassisLength * .5));
var transform = new Ammo.btTransform();
transform.setIdentity();
transform.setOrigin(new Ammo.btVector3(0,5,0));
transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
var motionState = new Ammo.btDefaultMotionState(transform);
var localInertia = new Ammo.btVector3(0, 0, 0);
geometry.calculateLocalInertia(massVehicle, localInertia);
				
chassisMesh = createChassisMesh(chassisWidth, chassisHeight, chassisLength);
				
var massOffset = new Ammo.btVector3( 0, 0.4, 0);
var transform2 = new Ammo.btTransform();
transform2.setIdentity();
transform2.setOrigin(massOffset);
var compound = new Ammo.btCompoundShape();
compound.addChildShape( transform2, geometry );
				
var body = new Ammo.btRigidBody(new Ammo.btRigidBodyConstructionInfo(massVehicle, motionState, compound, localInertia));
body.setActivationState(4);
				
physicsWorld.addRigidBody(body);
				
var engineForce = 0;
var vehicleSteering = 0;
var breakingForce = 0;
var tuning = new Ammo.btVehicleTuning();
var rayCaster = new Ammo.btDefaultVehicleRaycaster(physicsWorld);
vehicle = new Ammo.btRaycastVehicle(tuning, body, rayCaster);
vehicle.setCoordinateSystem(0, 1, 2);
physicsWorld.addAction(vehicle);
				
var trans = vehicle.getChassisWorldTransform();
		
				

    function addWheel(isFront, pos, radius, width, index) {

				
		var wheelInfo = vehicle.addWheel(
			pos,
			wheelDirectionCS0,
			wheelAxleCS,
			suspensionRestLength,
			radius,
			tuning,
			isFront);

		wheelInfo.set_m_suspensionStiffness(suspensionStiffness);
		wheelInfo.set_m_wheelsDampingRelaxation(suspensionDamping);
		wheelInfo.set_m_wheelsDampingCompression(suspensionCompression);
		wheelInfo.set_m_maxSuspensionForce(600000);
		wheelInfo.set_m_frictionSlip(40);
		wheelInfo.set_m_rollInfluence(rollInfluence);

		wheelMeshes[index] = createWheelMesh(radius, width);
	}

    addWheel(true, new Ammo.btVector3(wheelHalfTrackFront, wheelAxisHeightFront, wheelAxisFrontPosition), wheelRadiusFront, wheelWidthFront, FRONT_LEFT);
	addWheel(true, new Ammo.btVector3(-wheelHalfTrackFront, wheelAxisHeightFront, wheelAxisFrontPosition), wheelRadiusFront, wheelWidthFront, FRONT_RIGHT);
	addWheel(false, new Ammo.btVector3(-wheelHalfTrackBack, wheelAxisHeightBack, wheelAxisPositionBack), wheelRadiusBack, wheelWidthBack, BACK_LEFT);
	addWheel(false, new Ammo.btVector3(wheelHalfTrackBack, wheelAxisHeightBack, wheelAxisPositionBack), wheelRadiusBack, wheelWidthBack, BACK_RIGHT);

    vehicleReady = true;
}	


function createChassisMesh(w, l, h) {

	//var mesh = new BABYLON.MeshBuilder.CreateBox("car_chasis", {width:w, depth:h, height:l}, scene);
    let mesh = scene.getMeshByName("Car_Body").createInstance("car_chasis");
    let particleSource = scene.getMeshByName("Car_ParticleSource").createInstance("car_chasis_ps");
    particleSource.parent = mesh;
    mesh.scaling = new BABYLON.Vector3(2, 2, 2);
	mesh.rotationQuaternion = new BABYLON.Quaternion(1, 0, 1, Math.PI * 2);
	//mesh.material = greenMaterial;

    {
        var camera = new BABYLON.FollowCamera("FollowCam", new BABYLON.Vector3(0, 10, -10), scene);
        camera.radius = 10;
        camera.heightOffset = 4;
        camera.rotationOffset = 0;
        camera.cameraAcceleration = 0.05;
        camera.maxCameraSpeed = 400;
        camera.attachControl(canvas, true);
        camera.lockedTarget = mesh; //version 2.5 onwards
        scene.activeCamera = camera
        cameras.push(camera)
    }

    {
        // Parameters: name, position, scene
        var camera = new BABYLON.FollowCamera("FollowCam", new BABYLON.Vector3(0, 10, -10), scene);
        // The goal distance of camera from target
        camera.radius = 30;
        // The goal height of camera above local origin (centre) of target
        camera.heightOffset = 10;
        // The goal rotation of camera around local origin (centre) of target in x y plane
        camera.rotationOffset = 0;
        // Acceleration of camera in moving from current to goal position
        camera.cameraAcceleration = 0.005;
        // The speed at which acceleration is halted
        camera.maxCameraSpeed = 10;
        // This attaches the camera to the canvas
        camera.attachControl(canvas, true);

        camera.lockedTarget = mesh; //version 2.5 onwards
        cameras.push(camera)
    }

    {
        var camera = new BABYLON.UniversalCamera("UniversalCamera", new BABYLON.Vector3(40, 40, 40), scene);
        // Targets the camera to a particular position. In this case the scene origin
        camera.setTarget(BABYLON.Vector3.Zero());
        // Attach the camera to the canvas
        camera.attachControl(canvas, true);
        cameras.push(camera)
    }

    scene.activeCamera = cameras[0]

    // myGUI.createGUI(scene, cameras)

    return mesh;
}
		

function createWheelMesh(radius, width) {
    //Wheel Material
    var wheelMaterial = new BABYLON.StandardMaterial("wheelMaterial", scene);
    var wheelTexture = new BABYLON.Texture("http://i.imgur.com/ZUWbT6L.png", scene);
    wheelMaterial.diffuseTexture = wheelTexture;

    //Set color for wheel tread as black
    var faceColors = [];
    faceColors[1] = new BABYLON.Color3(0, 0, 0);

    //set texture for flat face of wheel
    var faceUV = [];
    faceUV[0] = new BABYLON.Vector4(0, 0, 1, 1);
    faceUV[2] = new BABYLON.Vector4(0, 0, 1, 1);

    //create wheel front inside and apply material
    var wheelMesh = BABYLON.MeshBuilder.CreateCylinder("wheelMesh", {
        diameter: 0.8,
        height: width,
        tessellation: 24,
        faceColors: faceColors,
        faceUV: faceUV
    }, scene);
    wheelMesh.material = wheelMaterial;
    wheelMesh.rotationQuaternion = new BABYLON.Quaternion();
    return wheelMesh;
}


function keyup(e) {
	if(keysActions[e.code]) {
		actions[keysActions[e.code]] = false;
		//e.preventDefault();
		//e.stopPropagation();

		//return false;
	}
}

function keydown(e) {
	if(keysActions[e.code]) {
		actions[keysActions[e.code]] = true;
		//e.preventDefault();
		//e.stopPropagation();

		//return false;
	}
}           