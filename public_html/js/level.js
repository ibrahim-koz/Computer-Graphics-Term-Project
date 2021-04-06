/// <reference path="babylon.d.ts" />
var checkpoints = [];
{
    let scene = wrapper.scene;
    let levelStart = scene.getMeshByName("Start");
    let levelFinish = scene.getMeshByName("Finish");
    let car_body = scene.getMeshByName("Car_Body");
    let pivot = scene.getMeshByName("Car_Pivot");
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
    // if(levelStart != undefined){
    //     levelStart.isVisible = false;
    //     pivot.position = levelStart.position;
    //     pivot.position.y += 10;
    // }
    if(levelFinish != undefined){
        levelFinish.isVisible = false;
        levelFinish.actionManager = new BABYLON.ActionManager(scene);
        levelFinish.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(
            {
                trigger: BABYLON.ActionManager.OnIntersectionEnterTrigger,
                parameter: car_body
            },
            function () { 
                alert("Game over!");
            }
        ));
    }
    

}
var gameReady= true;
console.log(checkpoints);