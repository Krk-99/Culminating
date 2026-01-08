import * as BABYLON from '@babylonjs/core';
const canvas = document.getElementById('renderCanvas');
const engine = new BABYLON.Engine(canvas);

// Mouse movement variables
let movementX;
let movementY;
let mouselocked;


let inputs = false;
let input = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    jump: false
}

// Gravity and physics variables
let gravity = -9.81;
let velocity = new BABYLON.Vector3(0, 0, 0);
let isGrounded = false;

const createScene = function() {
    // Camera and light
    const scene = new BABYLON.Scene(engine);
    scene.collisionsEnabled = true;
    scene.createDefaultLight(true, true);
    const camera = new BABYLON.UniversalCamera('PlayerCamera', new BABYLON.Vector3(0, 2, -3), scene);
    camera.rotation.x = Math.PI / 5.5;
    // Temporary box for player
    const box = BABYLON.MeshBuilder.CreateBox('player', {}, scene);
    box.position.z = 3;
    box.ellipsoid = new BABYLON.Vector3(0.5, 0.5, 0.5)
    box.checkCollisions = true; 
    camera.checkCollisions = true; 
    camera.ellipsoid = new BABYLON.Vector3(0.5, 0.5, 0.5)
    const axis = new BABYLON.AxesViewer(scene, 2);
    axis.xAxis.parent = box;
    axis.yAxis.parent = box;
    axis.zAxis.parent = box;
    const sphere = BABYLON.MeshBuilder.CreateSphere('sphere', {}, scene);
    sphere.position.z = -3;
    const ground = BABYLON.MeshBuilder.CreateGround('ground', {width: 10, height: 10}, scene);
    ground.position.y = -1;
    ground.checkCollisions = true;
    scene.gravity = new BABYLON.Vector3(0, -1, 0)
    return scene;
}

const scene = createScene();

engine.runRenderLoop(function() {
    mouselocked = engine.isPointerLock;
    box.moveWithCollisions(new BABYLON.Vector3(0, -0.3, 0), false)
    // console.log(box.position.y)
    let directionf = box.forward;
    let directionr = box.right;
    let directionl = directionr.scale(-1);
    let directionb = directionf.scale(-1);
    if (input.forward) {
        box.position.addInPlace(directionf.scale(0.1));
    } else if (input.backward) {
        box.position.addInPlace(directionb.scale(0.1));
    }
    if (input.left) {
        box.position.addInPlace(directionl.scale(0.1));
    } else if (input.right) {
        box.position.addInPlace(directionr.scale(0.1));
    }
    if (input.jump) {
        box.position.y += 1
    }
    scene.render();
});


window.addEventListener('resize', function() {
    engine.resize();
});


const box = scene.getMeshByName('player');
const camera = scene.getCameraByName('PlayerCamera');
camera.parent = box;


canvas.onclick = function() {
    canvas.requestPointerLock = canvas.requestPointerLock || canvas.msRequestPointerLock || canvas.mozRequestPointerLock || canvas.webkitRequestPointerLock;
    if (canvas.requestPointerLock) {
        canvas.requestPointerLock();
    }
};


scene.onPointerObservable.add((pointerInfo) => {
    if (mouselocked) {
        switch (pointerInfo.type) {
            case BABYLON.PointerEventTypes.POINTERMOVE:
                const event = pointerInfo.event;
                movementX = event.movementX || 0;
                movementY = event.movementY || 0;
                // console.log(`MovementX: ${movementX}, MovementY: ${movementY}`);
                // camera.position.y += movementY/20
                // camera.rotation.x -= -(BABYLON.NormalizeRadians(movementY * 0.009));
                // console.log(camera.rotation.x)
                // console.log(camera.position.y)
                // if (camera.position.y <= 3.2 && camera.rotation.x <=0.769 ){
                //     if (camera.position.y >= 0.4 && camera.rotation.x >= 0.208) {
                //     } else {
                //         // camera.position.y = 0.4
                //         // camera.rotation.x = 0.208
                //     }
                // } else {
                //     // camera.position.y = 3.2
                //     // camera.rotation.x = 0.769
                //     // if (camera.position.y < 1) {
                //     // } else {
                //     // }
                // }
                box.rotation.y += movementX / 500;
                break;
        }
    }
});


window.addEventListener('keydown', function(event) {;
    if (event.key === 'w') {
        input.forward = true;
        // inputs = true;
    }
    if (event.key === 's') {
        input.backward = true;
        // inputs = true;
    }
    if (event.key === 'a') {
        input.left = true;
        // inputs = true;
    }
    if (event.key === 'd') {
        input.right = true;
        // inputs = true;  
    }
    if (event.key === ' ') {
        input.jump = true;
        // inputs = true;
    }
});


window.addEventListener('keyup', function(event) {
    if (event.key === 'w') {
        input.forward = false;
    }
    if (event.key === 's') {
        input.backward = false;
    }
    if (event.key === 'a') {
        input.left = false;
    }
    if (event.key === 'd') {
        input.right = false;
    }
    if (event.key === ' ') {
        input.jump = false;
    }
});


window.addEventListener("keydown", (e) => {
    let keyText = document.getElementById("keyText");
    keyText.textContent = `Key: ${e.key}`;
});


window.addEventListener("keyup", () => {
    let keyText = document.getElementById("keyText");   
    keyText.textContent = "Press a key";
});
