/// <reference path="babylon.d.ts" />
{
let scene = wrapper.scene;

let ground = scene.getMeshByName("ground");
ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, friction: 2.0, restitution: 0.7 }, scene);
let car = scene.getMeshByName("Car_Body");

let axleBack = scene.getMeshByName("Car_AxleB");
let axleFront = scene.getMeshByName("Car_AxleF");
let wheelBL = scene.getMeshByName("Car_WBL");
let wheelBR = scene.getMeshByName("Car_WBR");
let wheelFL = scene.getMeshByName("Car_WFL");
let wheelFR = scene.getMeshByName("Car_WFR");

const wheelmass = 3;
const wheelfriction = 1;


axleBack.physicsImpostor = new BABYLON.PhysicsImpostor(axleBack, BABYLON.PhysicsImpostor.BoxImpostor, {ignoreParent: true, mass: 2, restitution: 0.1}, scene);
wheelBL.physicsImpostor = new BABYLON.PhysicsImpostor(wheelBL, BABYLON.PhysicsImpostor.CylinderImpostor, {ignoreParent: true, mass: 1, friction: 2, restitution: 0.2}, scene);

var axleBackHinge = new BABYLON.MotorEnabledJoint(BABYLON.PhysicsJoint.HingeJoint, {
    mainPivot: new BABYLON.Vector3(0, 0, 0),
    connectedPivot: new BABYLON.Vector3(0, 2, 0),
    mainAxis: new BABYLON.Vector3(0, 1, 0),
    connectedAxis: new BABYLON.Vector3(1, 0, 0),
}); 

axleBack.physicsImpostor.addJoint(wheelBL, axleBackHinge);




}