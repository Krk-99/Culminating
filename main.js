import * as BABYLON from '@babylonjs/core';
const canvas = document.getElementById('renderCanvas');

let forward = false;
let backward = false;
let left = false;
let right = false;

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
    // did that by removing the attach control line
    // Now to fix the rotation issue
    // Im going to try arc rotate camera instead since its possible for it to follow target better maybe idk ill have to see
    // gotta figure out how to set the target for arc rotate camera tho to the box
    // it works kinda just need to zoom in to make sure no weird things happening 
    // const camera = new BABYLON.FollowCamera('PlayerCamera', new BABYLON.Vector3(0, 1, -4), scene);
    // camera.radius = -5; 
    // camera.heightOffset = 3;
    // camera.rotationOffset = 0;
    // camera.cameraAcceleration = 0.05;
    // camera.maxCameraSpeed = 5;
    // Hmm i want to tilt this forward a bit so its looking down at the player
    // wow this thing alr knows how to do it
    // wait this should be in the vector 3 right?
    // nvm it doesnt
    // why am i facing right?
    const camera = new BABYLON.UniversalCamera('PlayerCamera', new BABYLON.Vector3(0, 2, -2), scene);
    camera.checkCollisions = false;
    // hmm y rotates what should be the z axis?
    // i guess the image was wrong
    // Perfect now to make the mesh move i need to parent camera to mesh apparently that rotates the mesh as well?
    camera.rotation.x = Math.PI / 5;
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
    // setting box rotation to normal
    // well that didnt work but its getting late so do this later
    box.rotation.x = 5/Math.PI;
    const sphere = BABYLON.MeshBuilder.CreateSphere('sphere', {}, scene);
    sphere.position.z = -3;
    const ground = BABYLON.MeshBuilder.CreateGround('ground', {width: 10, height: 10}, scene);
    ground.position.y = -1;
    return scene;
}


const scene = createScene();
// Auto complete is rly helpful :)
// Hope this works
// ohhh forgot to set false if not clicked ummm
// that should do it
engine.runRenderLoop(function() {
    // Oh wait that overides the keydown event listener hmm
    // Now need to move cam position instrad of mesh
    if (forward) {
        camera.position.z += 0.1;
    } else if (backward) {
        camera.position.z -= 0.1;
    }
    if (left) {
        camera.position.x -= 0.1;
    } else if (right) {
        camera.position.x += 0.1;
    }
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
// now im gonna move the movement to render loop cuz this is running independently of frame rate :(0
// The logic im gonna use are booleans and movements based of booleans
// Just realized dont know how to create booleans 
// Nvm just rmb im using javascript idiot 
// I LOVE AUTO COMPLETE
// That should make if key is not pressed set boolean to false
// but need to figure out how to do it if no key is pressed since listener only triggers on key press
// smooth movement but i need to get while pressing maybe
const box = scene.getMeshByName('player');
const camera = scene.getCameraByName('PlayerCamera');
// Hmm parenting seems to place me above the box
// ITS NOT ROTATING WITH THE CAMERA WHOS LYING TO ME
// Oh shoot im in the box local space not world space duh
// so i need to change the position relative to the box
// OHH i parent the box to the camera maybe
box.parent = camera;
// No clue wht the request pointer lock code does so Ill search it up
// K so the request pointer lock is fetching the pointer lock API to lock the mouse pointer to the canvas from different browser hence so many calls
// then it locks using requestPointerLock method
// but i dont need this since camera.attachControl already does this for me
// but I just got convinced to move from arcrotate to universal camera sooo les get moving
// why am i above it
// canvas.onclick = function() {
//     canvas.requestPointerLock = canvas.requestPointerLock || canvas.msRequestPointerLock || canvas.mozRequestPointerLock || canvas.webkitRequestPointerLock;
//     if (canvas.requestPointerLock) {
//         canvas.requestPointerLock();
//     }
// };
window.addEventListener('keydown', function(event) {
    if (event.key === 'w') {
        forward = true;
    }
    if (event.key === 's') {
        backward = true;
    }
    if (event.key === 'a') {
        left = true;  
    }
    if (event.key === 'd') {
        right = true;
    }
});
// Wow this thing wrote by itself this should work now cuz once key is released it sets boolean to false
// YES SMOOTH MOVEMENT WORKS YAY
// Now to rotate following the mouse :(
window.addEventListener('keyup', function(event) {
    if (event.key === 'w') {
        forward = false;
    }
    if (event.key === 's') {
        backward = false;
    }
    if (event.key === 'a') {
        left = false;
    }
    if (event.key === 'd') {
        right = false;
    }
});