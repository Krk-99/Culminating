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

let grounds = []
let gl;
let hit;
let risinggrounds = []
let direction1 = new BABYLON.Vector3(0, 1, 0)
let direction2 = new BABYLON.Vector3(0, 1, 0)
let direction3 = new BABYLON.Vector3(0, 1, 0)
let direction = [direction1, direction2, direction3]
let collide;
let colliding;
let positionset = false;
let pos;
let maxdrop;
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
    const skybox = BABYLON.MeshBuilder.CreateBox('skyBox', {size: 1000.0}, scene)
    const skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene)
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.reflectionTexture = new BABYLON.Texture("https://i.postimg.cc/zXwmXwR8/unnamed.jpg", scene)
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.FIXED_EQUIRECTANGULAR_MODE
    skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    skybox.material = skyboxMaterial;   
    const camera = new BABYLON.UniversalCamera('PlayerCamera', new BABYLON.Vector3(0, 2, -3), scene);
    camera.rotation.x = Math.PI / 5.5;
    // Temporary box for player
    const material = new BABYLON.StandardMaterial("material", scene);
    const box = BABYLON.MeshBuilder.CreateSphere('player', {}, scene);
    box.position.z = 3;
    box.isPickable = false;
    // box.ellipsoid = new BABYLON.Vector3(0.5, 0.5, 0.5)
    height.addInPlace(box.getDirection(new BABYLON.Vector3(0, -1, 0)))
    // box.checkCollisions = true; 
    // camera.checkCollisions = true; 
    camera.ellipsoid = new BABYLON.Vector3(0.5, 0.5, 0.5)
    const ground = BABYLON.MeshBuilder.CreateGround('ground', {width: 10, height: 10}, scene);
    ground.position.y = -1;
    // ground.checkCollisions = true;
    ground.IsGround = true
    ground.fakeground = false
    ground.setEnabled(true)
    const ground2 = BABYLON.MeshBuilder.CreateBox('jump1', {width: 2, height:1, depth: 2}, scene);
    ground2.position.z = -7;
    // ground2.checkCollisions = true;
    ground2.IsGround = true
    ground2.setEnabled(false)
    ground2.fakeground = true
    const ground3 = BABYLON.MeshBuilder.CreateBox('jump2', {width: 2, height:1, depth: 2}, scene);
    ground3.position.z = -12;
    // ground3.checkCollisions = true;
    ground3.IsGround = true
    ground3.setEnabled(false)
    ground3.fakeground = true
    const ground4 = BABYLON.MeshBuilder.CreateBox('jump3', {width: 2, height:1, depth: 2}, scene);
    ground4.position.z = -14;
    ground4.position.y = 2;
    // ground4.checkCollisions = true;
    ground4.IsGround = true
    ground4.fakeground = true
    ground4.setEnabled(false)
    const ground5 = BABYLON.MeshBuilder.CreateBox('jump4', {width: 2, height:1, depth: 2}, scene);
    ground5.position.z = -17;
    // ground5.checkCollisions = true;
    ground5.IsGround = true
    ground5.fakeground = true
    ground5.setEnabled(false)
    const ground6 = BABYLON.MeshBuilder.CreateBox('jump5', {width: 2, height:1, depth: 2}, scene);
    ground6.position.z = -22;
    ground6.position.x = 2
    // ground6.checkCollisions = true;
    ground6.IsGround = true
    ground6.fakeground = true
    ground6.setEnabled(false)
    const ground7 = BABYLON.MeshBuilder.CreateBox('jump5', {width: 2, height:1, depth: 2}, scene);
    ground7.position.z = -24;
    ground7.position.x = 2
    ground7.position.y = 2
    // ground7.checkCollisions = true;
    ground7.fakeground = true
    ground7.IsGround = true
    ground7.setEnabled(false)
    const ground8 = BABYLON.MeshBuilder.CreateBox('jump5', {width: 2, height:1, depth: 2}, scene);
    ground8.position.z = -27;
    ground8.position.x = 2
    ground8.position.y = -1
    // ground8.checkCollisions = true;
    ground8.IsGround = true
    ground8.fakeground = true
    ground8.setEnabled(false)
    const ground9 = BABYLON.MeshBuilder.CreateBox('jump5', {width: 2, height:1, depth: 2}, scene);
    ground9.position.z = -30;
    ground9.position.x = 2
    ground9.position.y = 1
    // ground9.checkCollisions = true;
    ground9.IsGround = true
    ground9.fakeground = true
    ground9.setEnabled(false)
    scene.gravity = new BABYLON.Vector3(0, -1, 0)
    grounds.push(
        ground, 
        ground2, 
        ground3, 
        ground4, 
        ground5, 
        ground6,
        ground7,
        ground8,
        ground9
    )
    risinggrounds.push(
        ground7,
        ground8,
        ground9
    )
    for (let i of grounds) {
        material.diffuseTexture = new BABYLON.Texture("https://i.postimg.cc/yNYqT9qP/pixil-frame-0.png", scene);
        i.material = material
    }
    gl = grounds.length
    return scene;
}




const scene = createScene();

engine.runRenderLoop(function() {
    if (box.position.y < -50) {
        box.position.z = 0
        box.position.x = 0
        timercount2 = 0;
        timercount = 0;
        box.position.y = 4;
        reset();
    }
    if (timer) timercount++;
    if (timer2) timercount2++;
    mouselocked = engine.isPointerLock;
    if (jump && !isGrounded) {
        jumpcount--;
    }
    // let movement = velocity.scale(speed)
    // movement.y = -drop / 10
    // box.moveWithCollisions(movement)
    scene.render();
});


window.addEventListener('resize', function() {
    engine.resize();
});


const box = scene.getMeshByName('player');
const camera = scene.getCameraByName('PlayerCamera');
const ground = scene.getMeshByName('ground')
camera.parent = box;

const reset = function() {
    for (let i of grounds) {
        if (i === ground) {
            i.setEnabled(true)
        } else {
            i.setEnabled(false)
        }
    }
    timercount = 0;
    timercount2 = 0;
    
}

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
    speed = BABYLON.Scalar.Clamp(speed, 0, 0.3 * multipler)
    box.moveWithCollisions(velocity.scale(speed))
});

scene.onBeforeRenderObservable.add(() => {
    if (hit != null) {
        let groundd = hit.pickedMesh
        
        for (let i = 0; i<gl; i++) {
            if (hit.pickedMesh === grounds[i]) {
                if (gl - i == 1) {
                    grounds[i - 2].setEnabled(true)
                    grounds[i - 1].setEnabled(true)
                    grounds[i].setEnabled(true)
                } else if (gl - i == 2) {
                    grounds[i - 2].setEnabled(true)
                    grounds[i - 1].setEnabled(true)
                    grounds[i].setEnabled(true)
                    grounds[i + 1].setEnabled(true)
                } else if (i > 1) {
                    grounds[i - 2].setEnabled(true)
                    grounds[i - 1].setEnabled(true)
                    grounds[i].setEnabled(true)
                    grounds[i + 1].setEnabled(true)
                    grounds[i + 2].setEnabled(true)
                } else if (i == 1) {
                    grounds[i - 1].setEnabled(true)
                    grounds[i].setEnabled(true)
                    grounds[i + 1].setEnabled(true)
                    grounds[i + 2].setEnabled(true)
                } else if (i == 0) {
                    grounds[i].setEnabled(true)
                    grounds[i + 1].setEnabled(true)
                    grounds[i + 2].setEnabled(true)
                }
            }
        }
    }
    for(let i =0; i<risinggrounds.length; i++) {
        if (risinggrounds[i].position.y > 6) {
            direction[i] = new BABYLON.Vector3(0, -1, 0)
        } else if (risinggrounds[i].position.y < -3) {
            direction[i] = new BABYLON.Vector3(0, 1, 0)
        }
        if (hit != null) {
            if (hit.pickedMesh == risinggrounds[i]) {
                box.moveWithCollisions(direction[i].scale(0.05))
            }
        }
        risinggrounds[i].position.addInPlace(direction[i].scale(0.05))
        
    }
});
const origin = box.position.clone()
const height1 = box.getBoundingInfo().boundingBox.extendSizeWorld.y
const raylength = 6
const directionraydown = new BABYLON.Vector3(0, -1, 0)
const rayf = new BABYLON.Ray(origin.clone().addInPlace(new BABYLON.Vector3(0, 0.042, 0.2)), directionraydown, raylength)
const rayr = new BABYLON.Ray(origin.clone().addInPlace(new BABYLON.Vector3(-0.2, 0.042, 0)), directionraydown, raylength)
const rayl = new BABYLON.Ray(origin.clone().addInPlace(new BABYLON.Vector3(0.2, 0.042, 0)), directionraydown, raylength)
const rayb = new BABYLON.Ray(origin.clone().addInPlace(new BABYLON.Vector3(0, 0.042, -0.2)), directionraydown, raylength)
const ray = new BABYLON.Ray(origin, directionraydown, raylength)

scene.onBeforeRenderObservable.add(() => {
    origin.copyFrom(box.position)
    // origin.y -= height1
    // origin.y += 0.1
    rayf.origin.copyFrom(origin.clone().addInPlace(new BABYLON.Vector3(0, 0.042, 0.2)))
    rayb.origin.copyFrom(origin.clone().addInPlace(new BABYLON.Vector3(0, 0.042, -0.2)))
    rayr.origin.copyFrom(origin.clone().addInPlace(new BABYLON.Vector3(-0.2, 0.042, 0)))
    rayl.origin.copyFrom(origin.clone().addInPlace(new BABYLON.Vector3(0, 0.042, -0.2)))
    ray.origin.copyFrom(origin)
    

    // BABYLON.RayHelper.CreateAndShow(rayf, scene, new BABYLON.Color3(0,1,0))
    // BABYLON.RayHelper.CreateAndShow(rayb, scene, new BABYLON.Color3(0,1,0))
    // BABYLON.RayHelper.CreateAndShow(rayr, scene, new BABYLON.Color3(0,1,0))
    // BABYLON.RayHelper.CreateAndShow(rayl, scene, new BABYLON.Color3(0,1,0))
    // BABYLON.RayHelper.CreateAndShow(ray, scene, new BABYLON.Color3(0,1,0))
    hit = scene.pickWithRay(ray, (mesh) => {
        return mesh.IsGround
    });
    if (!hit.pickedMesh) {
        hit = scene.pickWithRay(rayf, (mesh) => {
            return mesh.IsGround
        })
        if (!hit.pickedMesh) {
            hit = scene.pickWithRay(rayb, (mesh) => {
                return mesh.IsGround
            })
            if (!hit.pickedMesh) {
                hit = scene.pickWithRay(rayl, (mesh) => {
                    return mesh.IsGround
                })
                if (!hit.pickedMesh) {
                    hit = scene.pickWithRay(rayr, (mesh) => {
                        return mesh.IsGround
                    })
                }
            } 
        }
    }
    if (jump && jumpcount > 0) {
        box.moveWithCollisions(height.scale(-0.6))
    }
    // isGrounded = true
    // isGrounded = false

    if (hit.pickedMesh) {
        // when it detects a mesh in the 1 distance it will set colliding true 
        // colliding is a boolean that says the player is gonna hit the ground soon hence we should stop normal falling and conduct a 
        // falling thats set to distance till ground and then set IsGrounded to true
        if (!isGrounded) {
            colliding = true
            // this sets collide variable to the distance left till ball hits ground
        }
    }else {
        // this says the player is not going to hit the ground
        // isGrounded = false
        colliding = false
        
    }
    // this sets the isgrounded feature
    if (hit != null && hit.pickedMesh != null){
        console.log(hit.pickedMesh)
        if (hit.pickedMesh.IsGround && hit.distance < 0.7) {
            isGrounded = true;
        } else {
            isGrounded = false
        }
    }
    // if player isnt grounded it will go to gravitys if statement
    if (!isGrounded) {
        // if player is nowhere near ground it will go to the first if block which will let the player fall completely
        startTimer2(); 
        drop = gravity * timercount2/500
        if (!colliding) {
            // starts the normal gravity feature
            isGrounded = false
            box.moveWithCollisions(height.scale(drop))
            // if player is near ground it will change from normal gravity to a set distance falling
        } else if (colliding) {
            // positiontracker();
            // let heighttrack = 0;
            // heighttrack +=  pos - box.position.y;
            // maxdrop = box.position.clone().addInPlace(new BABYLON.Vector3(0, -(collide), 0))
            box.moveWithCollisions(height.scale(drop)) 
            console.log(collide) 
            console.log(hit.distance) 
            maxdrop = box.position.y - collide
            if (box.position.y < hit.distance){
                box.position.y = maxdrop
                isGrounded = true
            }
        }   
    } else {
        timer2 = false
        timercount2 = 0
    }
});

// const positiontracker = function() {
//     if (!positionset) {
//         pos = box.position.y
//         maxdrop = box.position.clone().addInPlace(0, collide, 0)
//         positionset = true
//     }
// }

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
                if (camera.rotation.x > 0.208) camera.position.y += movementY/200;
                
                camera.position.y = BABYLON.Scalar.Clamp(camera.position.y, 0, 3.2)
                camera.rotation.x -= -(BABYLON.NormalizeRadians(movementY * 0.0009));
                camera.rotation.x = BABYLON.Scalar.Clamp(camera.rotation.x, 0.2, 0.769)
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
    if (key === 'k') {
        console.log("Box Y")
        console.log(box.position.y)
        console.log("collide distance")
        console.log(collide)
    };
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
