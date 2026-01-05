import * as BABYLON from '@babylonjs/core';
const canvas = document.getElementById('renderCanvas');

const engine = new BABYLON.Engine(canvas);

const createScene = function() {
    const scene = new BABYLON.Scene(engine);
    // Camera and light
    // Scrapping this simple one for a more complex setup right away
    // Still haven't decided between universal camera or arc rotate camera
    // Just going to use universal for now and try it out
    // Setting starter location to be behind the player model and above it a bit
    // This sets us up for a third-person perspective
    // First add light cuz its too dark otherwise
    scene.createDefaultLight(true, true);
    // Now to add controls to camera
    // Using a follow camera to keep it focused on the player
    // thats done creating the camera now just need to focus it on the player model
    // set radius to negative to be behind player
    // did not work hmm
    // nvm it did work just didnt save :( soo stupid
    // hmm my camera is rotating while player moves not sure why
    // first need to remove the rotation ability of the camera
    const camera = new BABYLON.FollowCamera('PlayerCamera', new BABYLON.Vector3(0, 1, -4), scene);
    camera.radius = -5; 
    camera.heightOffset = 3;
    camera.rotationOffset = 0;
    camera.cameraAcceleration = 0.05;
    camera.maxCameraSpeed = 5;
    camera.attachControl(canvas, true);
    
    // camera Acceleration meaning that how fast will it increase speed as time moves on I dont know if this is necessary but whatever
    // Setting prevent default to true so that the browser doesn't also try to move when we do
    // Controls work but need to tweak speed and sensitivity later
    // Right now need to make player move first before adjusting camera speed
    // I'm going to manually change the camera position in the movement code for the player cuz it seems easier that way
    // scene.createDefaultCameraOrLight(true, false, true);
    
    // Temporary box for player
    const box = BABYLON.MeshBuilder.CreateBox('player', {}, scene);
    box.position.z = 3;
    const sphere = BABYLON.MeshBuilder.CreateSphere('sphere', {}, scene);
    sphere.position.z = -3;
    const ground = BABYLON.MeshBuilder.CreateGround('ground', {width: 10, height: 10}, scene);
    ground.position.y = -1;
    return scene;
}


const scene = createScene();

engine.runRenderLoop(function() {
    scene.render();
});

window.addEventListener('resize', function() {
    engine.resize();
});
// I LOVE VISUAL STUDIO CODE'S AUTO COMPLETE FEATURE
// Now to add basic movement controls for the player
// Using WASD for movement
// since we are staring at the z axis positive, W will move forward in negative z direction
// S will move backward in positive z direction
// A will move left in negative x direction
// D will move right in positive x direction
// Hopefully negative moves us forward, positive moves us backward
// Oops forgot to get the box mesh first didnt know why I thought I could just use box directly since it local variable in a function
// Nope need to reverse the polarity of the z axis movement
// Regretting the autocomplete feature a bit there
// K now need to link camera to player movement
// What's a camera parent? Going to look that up right now
// Just learned about follow cameras so going to try that instead
// focusing the camera on the playermesh 
// should follow the camera
const box = scene.getMeshByName('player');
const camera = scene.getCameraByName('PlayerCamera');
camera.lockedTarget = box;
window.addEventListener('keydown', function(event) {
    if (event.key === 'w') {
        box.position.z += 0.1;
    } else if (event.key === 's') {
        box.position.z -= 0.1;
    } else if (event.key === 'a') {
        box.position.x -= 0.1;
    } else if (event.key === 'd') {
        box.position.x += 0.1;
    }
});