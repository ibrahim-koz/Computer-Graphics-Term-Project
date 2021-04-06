/// <reference path="babylon.d.ts" />
/// <reference path="babylon.gui.d.ts" />

{
    const leftMargin = 50;
    const topMargin = 10;

    var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("StartScreenUI");
    let logo = new BABYLON.GUI.Image("Logo", "img/Logo.png");
    logo.width = "300px";
    logo.height = "120px";
    logo.horizontalAlignment = 0;
    logo.verticalAlignment = 0;
    logo.left = leftMargin;
    logo.top = topMargin+20;

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

    let startButton = BABYLON.GUI.Button.CreateImageOnlyButton("start", "img/start.png");
    
    startButton.width = "150px";
    startButton.height = "70px";
    startButton.horizontalAlignment = 0;
    startButton.verticalAlignment = 0;
    startButton.left = leftMargin;
    startButton.top = topMargin+180;
    startButton.onPointerClickObservable.add(function(){
        wrapper.scene.activeCamera = wrapper.scene.getCameraByName("PlayerCam");
        removeHomeScreen();
    });

    function removeHomeScreen(){
        advancedTexture.removeControl(logo);
        advancedTexture.removeControl(settingsButton);
        advancedTexture.removeControl(startButton);
    }
    
    function createHomeScreen(){
        advancedTexture.addControl(logo);
        advancedTexture.addControl(settingsButton);
        advancedTexture.addControl(startButton);
    }

    function createSettingsScreen(){
        advancedTexture.addControl(logo);
        advancedTexture.addControl(homeButton);
    }

    function removeSettingsScreen(){
        advancedTexture.removeControl(logo);
        advancedTexture.removeControl(homeButton);
    }
    

    createHomeScreen();

}

