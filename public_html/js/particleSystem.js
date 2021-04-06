/// <reference path="babylon.d.ts" />
{
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