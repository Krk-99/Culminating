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
    jump: false,
    shift: false
}


let nomove;

// Gravity and physics variables
let gravity = 10;
let height = new BABYLON.Vector3(0,0,0)
let timer = false;
let timer2 = false;
let timercount = 0;
let timercount2 = 0;
let speed = 0;
let drop = 0;
let velocity = new BABYLON.Vector3(0, 0, 0);
let isGrounded = false;
let jumpcount = 5
let jump = false;
 

const createScene = function() {
    // Camera and light
    const scene = new BABYLON.Scene(engine);
    scene.collisionsEnabled = true;
    scene.createDefaultLight(true, true);
    const camera = new BABYLON.UniversalCamera('PlayerCamera', new BABYLON.Vector3(0, 2, -3), scene);
    camera.rotation.x = Math.PI / 5.5;
    // Temporary box for player
    const box = BABYLON.MeshBuilder.CreateSphere('player', {}, scene);
    box.position.z = 3;
    box.ellipsoid = new BABYLON.Vector3(0.5, 0.5, 0.5)
    height.addInPlace(box.getDirection(new BABYLON.Vector3(0, -1, 0)))
    box.checkCollisions = true; 
    camera.checkCollisions = true; 
    camera.ellipsoid = new BABYLON.Vector3(0.5, 0.5, 0.5)
    const sphere = BABYLON.MeshBuilder.CreateSphere('sphere', {}, scene);
    sphere.position.z = -3;
    const ground = BABYLON.MeshBuilder.CreateGround('ground', {width: 10, height: 10}, scene);
    ground.position.y = -1;
    ground.checkCollisions = true;
    ground.IsGround = true
    const ground2 = BABYLON.MeshBuilder.CreateGround('jump1', {width: 2, height:2}, scene);
    ground2.position.z = -7;
    ground2.checkCollisions = true;
    ground2.IsGround = true
    const ground3 = BABYLON.MeshBuilder.CreateGround('jump2', {width: 2, height:2}, scene);
    ground3.position.z = -12;
    ground3.checkCollisions = true;
    ground3.IsGround = true
    scene.gravity = new BABYLON.Vector3(0, -1, 0)
    return scene;
}

const scene = createScene();

engine.runRenderLoop(function() {
    if (timer) timercount++;
    if (timer2) timercount2++;
    mouselocked = engine.isPointerLock;
    box.moveWithCollisions(height.scale(drop))
    console.log(box.position)
    if (jump && jumpcount > 0) {
        box.moveWithCollisions(height.scale(-0.6))
    }
    box.moveWithCollisions(velocity.scale(speed))
    scene.render();
});


window.addEventListener('resize', function() {
    engine.resize();
});


const box = scene.getMeshByName('player');
const camera = scene.getCameraByName('PlayerCamera');
const ground = scene.getMeshByName('ground')
camera.parent = box;


canvas.onclick = function() {
    canvas.requestPointerLock = canvas.requestPointerLock || canvas.msRequestPointerLock || canvas.mozRequestPointerLock || canvas.webkitRequestPointerLock;
    if (canvas.requestPointerLock) {
        canvas.requestPointerLock();
    }
};

scene.onBeforeRenderObservable.add(() => {
    nomove = !input.forward && !input.backward && !input.left && !input.right;
    if (nomove) {
        timer = false
        timercount = 0;
    }
    velocity.set(0,0,0)
    if (jump && !isGrounded) {
        jumpcount--;
    }
    if (input.jump) {
        if (isGrounded) {
            jump = true
            jumpcount = 8
        }
    }
    if (input.forward) {
        const directionf = box.getDirection(new BABYLON.Vector3(0, 0, 1))
        velocity.addInPlace(directionf)
    } else if (input.backward) {
        const directionb = box.getDirection(new BABYLON.Vector3(0,0, -1))
        velocity.addInPlace(directionb)
    }
    if (input.left) {
        const directionl = box.getDirection(new BABYLON.Vector3(-1, 0, 0))
        velocity.addInPlace(directionl)
    } else if (input.right) {
        const directionr = box.getDirection(new BABYLON.Vector3(1, 0, 0))
        velocity.addInPlace(directionr)
    }
    let multipler = 1
    if (input.shift) multipler = 1.5;
    speed = timercount/400 * multipler
    // console.log(timercount)
    // console.log(velocity)
    speed = BABYLON.Scalar.Clamp(speed, 0, 0.3 * multipler)
    // console.log(speed)
});

scene.onBeforeRenderObservable.add(() => {
    const origin = box.position.clone()
    origin.y -= box.ellipsoid.y
    const direction = new BABYLON.Vector3(0, -1, 0)
    const ray = new BABYLON.Ray(origin, direction, 0.1)
    const hit = scene.pickWithRay(ray, (mesh) => {
        return mesh.IsGround
    });
    if (hit.pickedMesh) {
        isGrounded = true
    }else {
        isGrounded = false
    }
    // console.log(isGrounded)
    if (!isGrounded) {
        startTimer2(); 
        // console.log(timercount2) 
        drop = gravity * timercount2/500
        // console.log(drop)
    } else {
        timer2 = false
        timercount2 = 0
    }
});

const startTimer = function() {
    timer = true;
    timercount = 0;
}
const startTimer2 = function() {
    if (timer2) {
        return
    };
    timer2 = true;
    timercount2 = 0;
}

scene.onPointerObservable.add((pointerInfo) => {
    if (mouselocked) {
        switch (pointerInfo.type) {
            case BABYLON.PointerEventTypes.POINTERMOVE:
                const event = pointerInfo.event;
                movementX = event.movementX || 0;
                movementY = event.movementY || 0;
                // console.log(`MovementX: ${movementX}, MovementY: ${movementY}`);
                camera.position.y += movementY/200
                camera.position.y = BABYLON.Scalar.Clamp(camera.position.y, 0.4, 3.2)
                camera.rotation.x -= -(BABYLON.NormalizeRadians(movementY * 0.0009));
                camera.rotation.x = BABYLON.Scalar.Clamp(camera.rotation.x, 0.208, 0.769)
                // console.log(camera.rotation.x)
                // console.log(camera.position.y)
                box.rotation.y += movementX / 500;
                break;
        }
    }
});


window.addEventListener('keydown', function(event) {
    const key = event.key.toLowerCase()
    if (key === 'w') {
        input.forward = true;
        if (!timer) startTimer();
        // inputs = true;
    }
    if (key === 's') {
        input.backward = true;
        if (!timer) startTimer();
        // inputs = true;
    }
    if (key === 'a') {
        input.left = true;
        if (!timer) startTimer();
        // inputs = true;
    }
    if (key === 'd') {
        input.right = true;
        if (!timer) startTimer();
        // inputs = true;  
    }
    if (event.shiftKey) {
        input.shift = true
    }
    if (event.key === ' ') {
        input.jump = true;
        // inputs = true;
    }
});


window.addEventListener('keyup', function(event) {
    const key = event.key.toLowerCase()
    if (key === 'w') {
        input.forward = false;
    }
    if (key === 's') {
        input.backward = false;
    }
    if (key === 'a') {
        input.left = false;
    }
    if (key === 'd') {
        input.right = false;
    }
    if (event.key === ' ') {
        input.jump = false;
    }
    if (event.shiftKey) {
        input.shift = false
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
