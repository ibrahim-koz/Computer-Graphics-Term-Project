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
let AxleLength = AxleF.getAbsolutePosition().subtract(AxleB.getAbsolutePosition()).length();
let FrontAxleLength = pivotFR.getAbsolutePosition().subtract(pivotFL.getAbsolutePosition()).length();

scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, function (evt) {								
    map[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
    
}));

scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, function (evt) {								
    map[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
}));	

var R = 0; //turning radius, initial set at pivot z value
var NR; //Next turning radius on wheel turn
var r = 1.5;
let speed = 0;
let theta = 0;


scene.registerBeforeRender(function() {	
    let timeElapsed = engine.getDeltaTime();
    let F = engine.getFps();
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

    //Rotation
    if((map["a"] || map["A"]) && -Math.PI/6 < theta) {
        deltaTheta = -Math.PI/252;
        theta += deltaTheta;
        pivotFR.rotate(BABYLON.Axis.Y, deltaTheta, BABYLON.Space.LOCAL);
        pivotFL.rotate(BABYLON.Axis.Y, deltaTheta, BABYLON.Space.LOCAL);
        if(Math.abs(theta) > 0.00000001) {
            NR = AxleLength/2 + FrontAxleLength/Math.tan(theta);	
        }
        else {
            theta = 0;
            NR = 0;
        }
        pivot.translate(BABYLON.Axis.X, -(NR - R), BABYLON.Space.LOCAL);
        car_body.translate(BABYLON.Axis.X, -(R - NR), BABYLON.Space.LOCAL);
        R = NR;
                                
    }else
    if((map["d"] || map["D"])  && theta < Math.PI/6) {
        deltaTheta = Math.PI/252;
        theta += deltaTheta;
        pivotFR.rotate(BABYLON.Axis.Y, deltaTheta, BABYLON.Space.LOCAL);
        pivotFL.rotate(BABYLON.Axis.Y, deltaTheta, BABYLON.Space.LOCAL);
        if(Math.abs(theta) > 0.00000001) {
            NR = AxleLength/2 +FrontAxleLength/Math.tan(theta);	
        }
        else {
            theta = 0;
            NR = 0;
        }
        pivot.translate(BABYLON.Axis.X, -(NR - R), BABYLON.Space.LOCAL);
        car_body.translate(BABYLON.Axis.X, -(R - NR), BABYLON.Space.LOCAL);
        R = NR;
                
    }else
    if(theta > Math.PI/252 || theta < -Math.PI/252){
        deltaTheta = 0;
        if(theta > 0)
            deltaTheta = -Math.PI/252;
        else if(theta < 0)
            deltaTheta = Math.PI/252;
        theta += deltaTheta;
        
        pivotFR.rotate(BABYLON.Axis.Y, deltaTheta, BABYLON.Space.LOCAL);
        pivotFL.rotate(BABYLON.Axis.Y, deltaTheta, BABYLON.Space.LOCAL);

        if(Math.abs(theta) > 0.00000001) {
            NR = AxleLength/2 + FrontAxleLength/Math.tan(theta);	
        }
        else {
            theta = 0;
            NR = 0;
        }
        pivot.translate(BABYLON.Axis.X, -(NR - R), BABYLON.Space.LOCAL);
        car_body.translate(BABYLON.Axis.X, -(R - NR), BABYLON.Space.LOCAL);
        R = NR;
    }else{
        deltaTheta = theta;
        pivotFR.rotate(BABYLON.Axis.Y, deltaTheta, BABYLON.Space.LOCAL);
        pivotFL.rotate(BABYLON.Axis.Y, deltaTheta, BABYLON.Space.LOCAL);
        theta = 0;
        if(Math.abs(theta) > 0.00000001) {
            NR = AxleLength/2 + FrontAxleLength/Math.tan(theta);	
        }
        else {
            theta = 0;
            NR = 0;
        }
        pivot.translate(BABYLON.Axis.X, -(NR - R), BABYLON.Space.LOCAL);
        car_body.translate(BABYLON.Axis.X, -(R - NR), BABYLON.Space.LOCAL);
        R = NR;
    }

    

    let travel = speed/1000*timeElapsed;
    let psi = speed/(r * F);
    if(speed > 0 || speed<0) {
        phi = speed/(R * F);
        if(Math.abs(theta)>0) {	 
            pivot.rotate(BABYLON.Axis.Y, phi, BABYLON.Space.WORLD);
        
            wheels.forEach(wheel => {
                wheel.rotate(BABYLON.Axis.X, psi, BABYLON.Space.LOCAL); 
            });
         }
         else {
            pivot.translate(BABYLON.Axis.Z, -travel, BABYLON.Space.LOCAL);
            wheels.forEach(wheel => {
                wheel.rotate(BABYLON.Axis.X, psi, BABYLON.Space.LOCAL); 
            });
         }
    }

});
}