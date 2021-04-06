/// <reference path="babylon.d.ts" />

var wrapper;
var engine;
var scene;
const leftMargin = 50;
const topMargin = 10;
var advancedTexture;

var game = {
    gasLevel: 550,
    throttle: 0,
    currentSpeed: 0,
    consumption: 0,
    consumption_max: 10,
    throttle_max: 100,
    gasLevel_max: 500
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
        var camera = new BABYLON.ArcRotateCamera('PlayerCam', 0, 0, 15, new BABYLON.Vector3(0, 0, 0), scene);
        camera.fov = 0.15;
        camera.maxZ = 100;
        camera.setPosition(new BABYLON.Vector3(10.5, 15.5, 10.5));
        camera.attachControl(canvas, true);
        scene.activeCamera = cameraGameStart;
        var cameraGameStart = new BABYLON.ArcRotateCamera('StartCam', 0, 0, 15, new BABYLON.Vector3(0, 0, 0), scene);
        cameraGameStart.fov = 0.15;
        cameraGameStart.maxZ = 100;
        cameraGameStart.setPosition(new BABYLON.Vector3(10.5, 15.5, 10.5));
        scene.activeCamera = cameraGameStart;

        var light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0, 100, 0), scene);
        light.diffuse = new BABYLON.Vector3(0.85, 0.85, 0.85);
        light.intensity = 1;
        light.parent = camera;
        light.target = camera.target;

        // BABYLON.MeshBuilder.CreateBox
        engine.displayLoadingUI();
        let AssetsManager = new BABYLON.AssetsManager(scene);
        let meshTask1 = AssetsManager.addMeshTask("Loading world", "", "assets/World/", "world.babylon");

        let meshTask2 = AssetsManager.addMeshTask("Loading models", "", "assets/Car/", "car.babylon");
        meshTask2.onSuccess = function(task){
            cameraGameStart.parent = scene.getMeshByName("Car_Body");
            camera.parent = scene.getMeshByName("Car_Body");
            
            
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
            startScreen();
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
function loadControls(){
    var map = {};
    let scene = wrapper.scene;
    let engine = wrapper.engine;
    scene.actionManager = new BABYLON.ActionManager(scene);

    var car_body = scene.getMeshByName("Car_Body");
    var pivot = scene.getMeshByName("Car_Pivot");
    var pivotFR = scene.getMeshByName("WheelPivotFR");
    var pivotFL = scene.getMeshByName("WheelPivotFL");
    var wheels = [
        scene.getMeshByName("Car_WFL"),
        scene.getMeshByName("Car_WFR"),
        scene.getMeshByName("Car_WBL"),
        scene.getMeshByName("Car_WBR"),
    ];

    var AxleF = scene.getMeshByName("AxleF");
    var AxleB = scene.getMeshByName("AxleB");
    // let AxleLength = AxleF.getAbsolutePosition().subtract(AxleB.getAbsolutePosition()).length();
    // let FrontAxleLength = pivotFR.getAbsolutePosition().subtract(pivotFL.getAbsolutePosition()).length();

    scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, function (evt) {								
        map[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
        
    }));

    scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, function (evt) {								
        map[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
    }));	


    let speed = 0;
    // scene.registerBeforeRender(function() {	
    //     let timeElapsed = engine.getDeltaTime();
    //     if(map['1']){
    //         scene.activeCamera = scene.getCameraByName('PlayerCam');
    //     }
    //     if(map['2']){
    //         scene.activeCamera = scene.getCameraByName('StartCam');
    //     }
    //     //Linear Travel
    //     if((map['w'] || map['W']) && speed<15){
    //         speed += 1;
    //     }else
    //     if((map['s'] || map['S']) && speed>-15){
    //         speed -= 1;
    //     }

    //     if(speed>0.15 && !(map['w'] || map['W'])){
    //         speed -= 0.15;
            
    //     }else if(speed<-0.15 && !(map['s'] || map['s'])){
    //         speed += 0.15;
    //     }else if(!(map['s'] || map['s'] || map['w'] || map['W'])){
    //         speed = 0;
    //     }
    //     let travel = speed/1000*timeElapsed;
        
    //     // pivot.translate(BABYLON.Axis.Z, -travel, BABYLON.Space.LOCAL);
    // });
}

function loadCar(){
    addVehicleReady();
    // loadParticleSystem();
    // createChasis();

}

function createChasis(){
    let scene = wrapper.scene;

    let ground = scene.getMeshByName("ground");
    // console.log(ground);
    // ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, friction: 2.0, restitution: 0.7 }, scene);
    let pivot = scene.getMeshByName("Car_Pivot");
    let car = scene.getMeshByName("Car_Body");

    let axleBack = scene.getMeshByName("Car_AxleB");
    let axleFront = scene.getMeshByName("Car_AxleF");
    let rodeL = scene.getMeshByName("Car_AxleFL");
    let rodeR = scene.getMeshByName("Car_AxleFR");
    let wheelBL = scene.getMeshByName("Car_WBL");
    let wheelBR = scene.getMeshByName("Car_WBR");
    let wheelFL = scene.getMeshByName("Car_WFL");
    let wheelFR = scene.getMeshByName("Car_WFR");

    const wheelmass = 3;
    const wheelfriction = 1;

    // console.log(car);
    car.physicsImpostor = new BABYLON.PhysicsImpostor(car, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 2, restitution: 0.1}, scene);

    axleBack.physicsImpostor = new BABYLON.PhysicsImpostor(axleBack, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 10, restitution: 0.1}, scene);
    wheelBL.physicsImpostor = new BABYLON.PhysicsImpostor(wheelBL, BABYLON.PhysicsImpostor.SphereImpostor, { mass: 0.2, friction: 0.2, restitution: 0.2}, scene);
    wheelBR.physicsImpostor = new BABYLON.PhysicsImpostor(wheelBR, BABYLON.PhysicsImpostor.SphereImpostor, { mass: 0.2, friction: 0.2, restitution: 0.2}, scene);
    
    axleFront.physicsImpostor = new BABYLON.PhysicsImpostor(axleFront, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 10, restitution: 0.1}, scene);
    rodeL.physicsImpostor = new BABYLON.PhysicsImpostor(rodeL, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 10, restitution: 0.1}, scene);
    rodeR.physicsImpostor = new BABYLON.PhysicsImpostor(rodeR, BABYLON.PhysicsImpostor.BoxImpostor, {mass: 10, restitution: 0.1}, scene);
    wheelFL.physicsImpostor = new BABYLON.PhysicsImpostor(wheelFL, BABYLON.PhysicsImpostor.SphereImpostor, { mass: 0.1, friction: 0.1, restitution: 0.2}, scene);
    wheelFR.physicsImpostor = new BABYLON.PhysicsImpostor(wheelFR, BABYLON.PhysicsImpostor.SphereImpostor, { mass:  0.1, friction: 0.1, restitution: 0.2}, scene);
    // car.physicsImpostor = new BABYLON.PhysicsImpostor(wheelFR, BABYLON.PhysicsImpostor.BoxImpostor, {ignoreParent: true,  mass:  0.1, friction: 0.1, restitution: 0.2}, scene);
    pivot.physicsImpostor = new BABYLON.PhysicsImpostor(pivot, BABYLON.PhysicsImpostor.NoImpostor, {mass: 10, restitution: 0.1}, scene);
    
    wrapper.axles = {};
   
    var axleBackHingeL = new BABYLON.MotorEnabledJoint(BABYLON.PhysicsJoint.HingeJoint, {
        mainPivot: new BABYLON.Vector3(0, 0, 0),
        connectedPivot: new BABYLON.Vector3(-0.4, 0, 0),
        mainAxis: new BABYLON.Vector3(1, 0, 0),
        connectedAxis: new BABYLON.Vector3(1, 0, 0),
    }); 
    var axleBackHingeR = new BABYLON.MotorEnabledJoint(BABYLON.PhysicsJoint.HingeJoint, {
        mainPivot: new BABYLON.Vector3(0, 0, 0),
        connectedPivot: new BABYLON.Vector3(0.4, 0, 0),
        mainAxis: new BABYLON.Vector3(1, 0, 0),
        connectedAxis: new BABYLON.Vector3(1, 0, 0),
    }); 

    var lockJoint = new BABYLON.PhysicsJoint(BABYLON.PhysicsJoint.LockJoint, {
        mainPivot: new BABYLON.Vector3(0, -0.2, 0.5),
        connectedPivot: new BABYLON.Vector3(0, 0, 0),
        mainAxis: new BABYLON.Vector3(1, 0, 0),
        connectedAxis: new BABYLON.Vector3(1, 0, 0)
    });
    var lockJoint2 = new BABYLON.PhysicsJoint(BABYLON.PhysicsJoint.LockJoint, {
        mainPivot: new BABYLON.Vector3(0, -0.2, -0.5),
        connectedPivot: new BABYLON.Vector3(0, 0, 0),
        mainAxis: new BABYLON.Vector3(1, 0, 0),
        connectedAxis: new BABYLON.Vector3(1, 0, 0)
    });

    var axleFrontRodeL = new BABYLON.PhysicsJoint(BABYLON.PhysicsJoint.HingeJoint, {
        mainPivot: new BABYLON.Vector3(0, 0, 0),
        connectedPivot: new BABYLON.Vector3(0.3, 0, 0),
        mainAxis: new BABYLON.Vector3(0, 1, 0),
        connectedAxis: new BABYLON.Vector3(0, 1, 0)
    });

    var axleFrontRodeR = new BABYLON.PhysicsJoint(BABYLON.PhysicsJoint.HingeJoint, {
        mainPivot: new BABYLON.Vector3(0, 0, 0),
        connectedPivot: new BABYLON.Vector3(-0.3, 0, 0),
        mainAxis: new BABYLON.Vector3(0, 1, 0),
        connectedAxis: new BABYLON.Vector3(0, 1, 0),
    }); 

    var rodeLeft = new BABYLON.MotorEnabledJoint(BABYLON.PhysicsJoint.HingeJoint, {
        mainPivot: new BABYLON.Vector3(0, 0, 0),
        connectedPivot: new BABYLON.Vector3(0.1, 0, 0),
        mainAxis: new BABYLON.Vector3(1, 0, 0),
        connectedAxis: new BABYLON.Vector3(1, 0, 0),
    }); 
    var rodeRight = new BABYLON.MotorEnabledJoint(BABYLON.PhysicsJoint.HingeJoint, {
        mainPivot: new BABYLON.Vector3(0, 0, 0),
        connectedPivot: new BABYLON.Vector3(-0.1, 0, 0),
        mainAxis: new BABYLON.Vector3(1, 0, 0),
        connectedAxis: new BABYLON.Vector3(1, 0, 0),
    });
    
    wrapper.axles.back = axleBackHingeL;
    axleBack.physicsImpostor.addJoint(wheelBL.physicsImpostor, axleBackHingeL);
    axleBack.physicsImpostor.addJoint(wheelBR.physicsImpostor, axleBackHingeR);
    axleFront.physicsImpostor.addJoint(rodeL.physicsImpostor, axleFrontRodeL);
    axleFront.physicsImpostor.addJoint(rodeR.physicsImpostor, axleFrontRodeR);
    rodeL.physicsImpostor.addJoint(wheelFL.physicsImpostor, rodeLeft);
    rodeR.physicsImpostor.addJoint(wheelFR.physicsImpostor, rodeRight);
    car.physicsImpostor.addJoint(axleBack.physicsImpostor, lockJoint);
    car.physicsImpostor.addJoint(axleFront.physicsImpostor, lockJoint);
    axleBackHingeL.setMotor(10);
    axleBackHingeR.setMotor(10);
    console.log("Physics initalized correctly")
}


function loadUI(){
    
    let logo = new BABYLON.GUI.Image("Logo", "img/Logo.png");
    logo.width = "300px";
    logo.height = "120px";
    logo.horizontalAlignment = 0;
    logo.verticalAlignment = 0;
    logo.left = leftMargin;
    logo.top = topMargin+20;
    wrapper.uielements = {};
    wrapper.uielements.logo = logo;
    let homeButton = BABYLON.GUI.Button.CreateImageOnlyButton("home", "img/home.png");
    homeButton.width = "70px";
    homeButton.height = "70px";
    homeButton.horizontalAlignment = 0;
    homeButton.verticalAlignment = 0;
    homeButton.left = leftMargin;
    homeButton.top = topMargin+180;
    homeButton.onPointerClickObservable.add(function(){
        removeSettingsScreen();
        createHomeScreen();
    });
    wrapper.uielements.homeButton = homeButton;
    let settingsButton = BABYLON.GUI.Button.CreateImageOnlyButton("settings", "img/settings.png");
    settingsButton.width = "250px";
    settingsButton.height = "70px";
    settingsButton.horizontalAlignment = 0;
    settingsButton.verticalAlignment = 0;
    settingsButton.left = leftMargin;
    settingsButton.top = topMargin+270;
    settingsButton.onPointerClickObservable.add(function(){
        removeHomeScreen();
        createSettingsScreen();
    });
    wrapper.uielements.settingsButton = settingsButton;
    let startButton = BABYLON.GUI.Button.CreateImageOnlyButton("start", "img/start.png");
    
    startButton.width = "150px";
    startButton.height = "70px";
    startButton.horizontalAlignment = 0;
    startButton.verticalAlignment = 0;
    startButton.left = leftMargin;
    startButton.top = topMargin+180;
    startButton.onPointerClickObservable.add(function(){
        loadGameGUI();
        removeHomeScreen();
    });
    wrapper.uielements.startButton = startButton;
}

function startScreen(){
    createHomeScreen();
}

function removeHomeScreen(){
    advancedTexture.removeControl(wrapper.uielements.logo);
    advancedTexture.removeControl(wrapper.uielements.settingsButton);
    advancedTexture.removeControl(wrapper.uielements.startButton);
}

function createHomeScreen(){
    advancedTexture.addControl(wrapper.uielements.logo);
    advancedTexture.addControl(wrapper.uielements.settingsButton);
    advancedTexture.addControl(wrapper.uielements.startButton);
}

function createSettingsScreen(){
    advancedTexture.addControl(wrapper.uielements.logo);
    advancedTexture.addControl(wrapper.uielements.homeButton);
}

function removeSettingsScreen(){
    advancedTexture.removeControl(wrapper.uielements.logo);
    advancedTexture.removeControl(wrapper.uielements.homeButton);
}

function loadLevel(){
    var checkpoints = [];
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
                    alert("Game over!");
                }
            ));
        }
        
    
    }
}

function loadParticleSystem(){
    let exhoustEmission = wrapper.scene.getMeshByName("Car_ParticleSource");
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
    let startPos = scene.getMeshByName("Start").getAbsolutePosition();
    console.log(scene.getMeshByName("Start"));
    let startOrient = scene.getMeshByName("Start")._absoluteRotationQuaternion;

    createVehicle(startPos, startOrient);
    
    window.addEventListener( 'keydown', keydown);
	window.addEventListener( 'keyup', keyup);

    scene.registerBeforeRender(function(){

        var dt = engine.getDeltaTime().toFixed()/1000;

        if(vehicleReady){
            var oldSpeed = game.currentSpeed;
            var speed = vehicle.getCurrentSpeedKmHour();
            var maxSteerVal = 0.2;
            breakingForce = 0;
            engineForce = 0;
            if(game.gasLevel>0){
                if(actions.acceleration){
                
                    if (speed < -1){
                        breakingForce = maxBreakingForce;
                    }else {
                        engineForce = maxEngineForce;
                    }
                        
                } else if(actions.braking){
                    if (speed > 1){
                        breakingForce = maxBreakingForce;
                    }else {
                        engineForce = -maxEngineForce ;
                    }
                } 
                        
                if(actions.right){
                    if (vehicleSteering < steeringClamp){
                        vehicleSteering += steeringIncrement;
                    }
                        
                } else if(actions.left){
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
                    wheelMeshes[i].rotate(BABYLON.Axis.Y, Math.PI/2);
                }

                tm = vehicle.getChassisWorldTransform();
                p = tm.getOrigin();
                q = tm.getRotation();
                wheelMeshes[i].position.set(p.x(), p.y(), p.z());
				wheelMeshes[i].rotationQuaternion.set(q.x(), q.y(), q.z(), q.w());
                wheelMeshes[i].rotate(BABYLON.Axis.Z, Math.PI/2);
    
                if(game.consumption>=0){
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
                if(speed < -1 || speed>1){
                    breakingForce = maxBreakingForce/2;
                }
                if(actions.braking){
                    
                    breakingForce = maxBreakingForce+breakingForce;
                    
                } 
                if(actions.right){
                    if (vehicleSteering < steeringClamp){
                        vehicleSteering += steeringIncrement;
                    }
                        
                } else if(actions.left){
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
                chassisMesh.position.set(p.x(), p.y(), p.z());
                chassisMesh.rotationQuaternion.set(q.x(), q.y(), q.z(), q.w());
                chassisMesh.rotate(BABYLON.Axis.X, Math.PI);
                
                var consumptionCoeff = 0;
                var consumption = 0;
                game.consumption = consumption;
                game.gasLevel = 0;	 
                // console.log(game);
            }
            game.currentSpeed = speed;
        }
		

    });

}

function loadGameGUI(){

}

function createVehicle(pos, quat) {
//Going Native
var physicsWorld = scene.getPhysicsEngine().getPhysicsPlugin().world;
var geometry = new Ammo.btBoxShape(new Ammo.btVector3(chassisWidth * .5, chassisHeight * .5, chassisLength * .5));
var transform = new Ammo.btTransform();
transform.setIdentity();
transform.setOrigin(new Ammo.btVector3(0, 5, 0));
transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));

var motionState = new Ammo.btDefaultMotionState(transform);
var localInertia = new Ammo.btVector3(0, 0, 0);
geometry.calculateLocalInertia(massVehicle, localInertia);
				
chassisMesh = createChassisMesh(chassisWidth, chassisHeight, chassisLength);
				
var massOffset = new Ammo.btVector3( 0,0.4,0);
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
startPoint = scene.getMeshByName("Start");
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
			
    var mesh = new BABYLON.MeshBuilder.CreateBox("car_chasis", {width:w, depth:h, height:l}, scene);		
	// var mesh = scene.getMeshByName("Car_Body").createInstance("car_chasis");
    
	mesh.rotationQuaternion = new BABYLON.Quaternion();
	mesh.material = greenMaterial;
    mesh.position = scene.getMeshByName("Start").position;
	var camera = new BABYLON.FollowCamera("FollowCam", new BABYLON.Vector3(0, 10, -10), scene);
    camera.radius = 10;
    camera.heightOffset = 4;
    camera.rotationOffset = 0;
    camera.cameraAcceleration = 0.05;
    camera.maxCameraSpeed = 400;
    camera.attachControl(canvas, true);
    camera.lockedTarget = mesh; //version 2.5 onwards
    scene.activeCamera = camera;

    return mesh;
}
		

function createWheelMesh(radius, width) {
	//var mesh = new BABYLON.MeshBuilder.CreateBox("wheel", {width:.82, height:.82, depth:.82}, scene);
    var mesh = new BABYLON.MeshBuilder.CreateCylinder("Wheel", {diameter:1, height:0.5, tessellation: 6}, scene);
	mesh.rotationQuaternion = new BABYLON.Quaternion();
    mesh.material = blackMaterial;

	return mesh;
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