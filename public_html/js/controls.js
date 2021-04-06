/// <reference path="babylon.d.ts" />
{
var map = {};
let scene = wrapper.scene;
let engine = wrapper.engine;
scene.actionManager = new BABYLON.ActionManager(scene);

let car_body = scene.getMeshByName("Car_Body");
let pivot = scene.getMeshByName("Car_Pivot");
let pivotFR = scene.getMeshByName("WheelPivotFR");
let pivotFL = scene.getMeshByName("WheelPivotFL");
let wheels = [
    scene.getMeshByName("Car_WFL"),
    scene.getMeshByName("Car_WFR"),
    scene.getMeshByName("Car_WBL"),
    scene.getMeshByName("Car_WBR"),
];

let AxleF = scene.getMeshByName("AxleF");
let AxleB = scene.getMeshByName("AxleB");
// let AxleLength = AxleF.getAbsolutePosition().subtract(AxleB.getAbsolutePosition()).length();
// let FrontAxleLength = pivotFR.getAbsolutePosition().subtract(pivotFL.getAbsolutePosition()).length();

scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, function (evt) {								
    map[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
    
}));

scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, function (evt) {								
    map[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
}));	


let speed = 0;
scene.registerBeforeRender(function() {	
    let timeElapsed = engine.getDeltaTime();
    if(map['1']){
        scene.activeCamera = scene.getCameraByName('PlayerCam');
    }
    if(map['2']){
        scene.activeCamera = scene.getCameraByName('StartCam');
    }
       //Linear Travel
    if((map['w'] || map['W']) && speed<15){
        speed += 1;
    }else
    if((map['s'] || map['S']) && speed>-15){
        speed -= 1;
    }

    if(speed>0.15 && !(map['w'] || map['W'])){
        speed -= 0.15;
    }else if(speed<-0.15 && !(map['s'] || map['s'])){
        speed += 0.15;
    }else if(!(map['s'] || map['s'] || map['w'] || map['W'])){
        speed = 0;
    }
    let travel = speed/1000*timeElapsed;

    pivot.translate(BABYLON.Axis.Z, -travel, BABYLON.Space.LOCAL);
});
}