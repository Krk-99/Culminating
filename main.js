import * as BABYLON from '@babylonjs/core';
// import * as GUI from '@babylonjs/gui'
import '@babylonjs/loaders/glTF/2.0/'
import { EXT_texture_webp } from '@babylonjs/loaders/glTF/2.0/';
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
let helmnode;
let grounds = []
let gl;
let hit;
let hitf;
let hitfl;
let hitfr;
let hitr;
let hitl;
let hitb;
let hitbl;
let hitbr;
let hitu;
let risinggrounds = []
let direction1 = new BABYLON.Vector3(0, 1, 0)
let direction2 = new BABYLON.Vector3(0, 1, 0)
let direction3 = new BABYLON.Vector3(0, 1, 0)
let direction = [direction1, direction2, direction3]
let directionf = new BABYLON.Vector3(0,0,1);
let directionr = new BABYLON.Vector3(-1,0,0);
let directionl = new BABYLON.Vector3(1,0,0);
let directionb = new BABYLON.Vector3(0,0,-1);
let directionfr = directionf.add(directionr).normalize()
let directionfl = directionf.add(directionl).normalize()
let directionbr = directionb.add(directionr).normalize()
let directionbl = directionb.add(directionl).normalize()
let collide;
let colliding;
let positionset = false;
let pos;
let maxdrop;
let nomove;

let buttons = [];
let lvl2 = false
let rocks;
let trees;
let rocky = [];
let forest = [];
let faceuv = new Array(6);
faceuv[0] = new BABYLON.Vector4(0.5, 0.5, 1, 1)
faceuv[1] = new BABYLON.Vector4(0.5, 0.5, 1, 1)
faceuv[2] = new BABYLON.Vector4(0.5, 0.5, 1, 1)
faceuv[3] = new BABYLON.Vector4(0.5, 0.5, 1, 1)
faceuv[4] = new BABYLON.Vector4(0, 0.5, 0.5, 1)
faceuv[5] = new BABYLON.Vector4(0, 0, 0.5, 0.5)


// Gravity and physics variables
let gravity = 10;
let height = new BABYLON.Vector3(0,-1,0)
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
    const scene = new BABYLON.Scene(engine);
    // Camera and light
    scene.createDefaultLight(true, true);
    const camera = new BABYLON.UniversalCamera('PlayerCamera', new BABYLON.Vector3(0, 2, -3), scene);
    camera.rotation.x = Math.PI / 5.5;
    // Skybox
    const skybox = BABYLON.MeshBuilder.CreateBox('skyBox', {size: 1000.0}, scene)
    const skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene)
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.reflectionTexture = new BABYLON.Texture("https://i.postimg.cc/zXwmXwR8/unnamed.jpg", scene)
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.FIXED_EQUIRECTANGULAR_MODE
    skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    skybox.material = skyboxMaterial;   
    // Temporary box for player
    const createGroundBlock = (name, x, y, z, width, height, depth, active, moving, secondlvl = false, horizontal = false) => {
        const blk = new BABYLON.MeshBuilder.CreateBox(name, {width: width, height: height, depth: depth, faceUV: faceuv, wrap: true,}, scene)
        blk.position.x = x
        blk.position.y = y
        blk.position.z = z
        blk.setEnabled(active)
        if (moving) {
            risinggrounds.push(blk)
            if (horizontal) {
                blk.moveHorizontal = true
            }
        }
        if (secondlvl) {
            blk.secondlvl = true
        }
        blk.IsGround = true
        grounds.push(blk)
        return blk
    }
    const box = BABYLON.MeshBuilder.CreateSphere('player', {}, scene);
    box.position.z = 3;
    box.isPickable = false;
    const boxcolor = new BABYLON.StandardMaterial('playercolor', scene)
    boxcolor.diffuseColor = new BABYLON.Color3(0.933,0.294,0.169)
    box.material = boxcolor
    BABYLON.ImportMeshAsync('https://cdn.jsdelivr.net/gh/Krk-99/Culminating@main/models/KnightHelmet.glb', scene).then ((result) => {
        console.log(result)
        const playerhelm = result.meshes[1]
        result.meshes[0].setEnabled(false)
        helmnode = new BABYLON.TransformNode('playerhelm')
        playerhelm.isPickable = false
        playerhelm.scaling = new BABYLON.Vector3(0.55, 0.55, 0.55)
        // playerhelm.position = box.position
        playerhelm.parent = box 
        playerhelm.rotation = new BABYLON.Vector3(0, -Math.PI/2, 0) 
        playerhelm.position.addInPlace(new BABYLON.Vector3(0, 0.2, 0))
        const helmcolor = new BABYLON.StandardMaterial('helm', scene)
        helmcolor.diffuseColor = new BABYLON.Color3(0.753, 0.753, 0.753)
        playerhelm.material = helmcolor
    })
    BABYLON.ImportMeshAsync('https://cdn.jsdelivr.net/gh/Krk-99/Culminating@main/models/Rocks.glb', scene).then((result) => {
        const masterRoot = result.meshes[0]
        const masterRocks = result.meshes[1]
        masterRoot.setEnabled(false)
        const createRockInstances = (name) => {
            const rockNode = new BABYLON.TransformNode(name + "_root", scene)
            const rock = masterRocks.createInstance(name + "_rock")
            rock.parent = rockNode
            return rockNode
        }
        const createRocks = (name, x, y, z, rotx, roty, rotz, scaling) => {
            const rock = createRockInstances(name)
            rock.position = new BABYLON.Vector3(x, y, z)
            rock.scaling = new BABYLON.Vector3(scaling, scaling, scaling)
            rock.rotation = new BABYLON.Vector3(rotx, roty, rotz)

            rocky.push(rock)
            return rock
        }
        createRocks('rock1', 5, -1, -5,0, 0, 0, 3)
        createRocks('rock2', -4.25, -1, 0.52,0, 0, 0, 8)
        createRocks('rock3', -2.285, -1, 2.496, 0.3, 0, 0, 2)
        createRocks('rock4', 4.044, -1, 3.814, 0, 0.5, 0, 10)

    })
    BABYLON.ImportMeshAsync('https://cdn.jsdelivr.net/gh/Krk-99/Culminating@main/models/Tree.glb', scene).then((result) => {
        const masterRoot = result.meshes[0];
        const masterTrunk = result.meshes[1];
        const masterLeaves = result.meshes[2]; 
        masterRoot.setEnabled(false);
        
        const createTreeInstances = (name) => {
            const instanceRoot = new BABYLON.TransformNode(name + "_root", scene);
            var trunkInstance = masterTrunk.createInstance(name + "_trunk");
            var leavesInstance = masterLeaves.createInstance(name + "_leaves");
            
            trunkInstance.parent = instanceRoot;
            leavesInstance.parent = instanceRoot;
            
            return instanceRoot;
        };
        
        const createTrees = (name, x, y, z, rotx, roty, rotz, scaling) => {
            const tree = createTreeInstances(name);
            tree.position = new BABYLON.Vector3(x, y, z);
            tree.scaling = new BABYLON.Vector3(scaling, scaling, scaling);
            tree.rotation = new BABYLON.Vector3(rotx, roty, rotz)
            forest.push(tree);
            return tree;
        };
        
        createTrees('tree', -4.5, -0.7, -1,0, 0, 0, 0.5);
        createTrees('tree1', 4.5, -0.7, -1,0, 0, 0,  0.5);
        createTrees('tree2', -1.424, -0.7, 3.75, 0, 0, 0, 0.5)
        createTrees('tree3', 1.719, -0.7, 1.64, 0, 1, 0, 0.5)
    });
    const buttonclickmaterial = new BABYLON.StandardMaterial('clickcolor', scene)
    buttonclickmaterial.diffuseColor = new BABYLON.Color3(1,0,0)
    const buttonbot = BABYLON.MeshBuilder.CreateBox('buttonholder', {width: 0.5, height:0.1, depth: 0.5}, scene)
    buttonbot.position = new BABYLON.Vector3(2, 1, -35.55)
    buttonbot.rotation.x = BABYLON.Tools.ToRadians(90)
    const buttonclick = BABYLON.MeshBuilder.CreateBox('buttonclick', {width: 0.4, height: 0.05, depth:0.4}, scene)
    buttonclick.position = new BABYLON.Vector3(2, 1, -35.5)
    buttonclick.rotation.x = BABYLON.Tools.ToRadians(90)
    buttonclick.material = buttonclickmaterial
    buttons.push(buttonclick)
    const ground = BABYLON.MeshBuilder.CreateGround('ground', {width: 10, height: 10}, scene);
    ground.position.y = -1;
    ground.IsGround = true
    ground.fakeground = false
    ground.setEnabled(true)
    grounds.push(ground)
    createGroundBlock('plat1', 0, 0, -7, 2, 1, 2, false, false)
    createGroundBlock('plat2', 0, 0, -12, 2, 1, 2, false, false)
    createGroundBlock('plat3', 0, 2, -14, 2, 1, 2, false, false)
    createGroundBlock('plat4', 0, 0, -17, 2, 1, 2, false, false)
    createGroundBlock('plat5', 2, 0, -22, 2, 1, 2, false, false)
    createGroundBlock('plat6', 2, 2, -25, 2, 1, 2, false, true)
    createGroundBlock('plat7', 2, -1, -28, 2, 1,  2, false, true)
    createGroundBlock('plat8', 2, 1, -31, 2, 1, 2, false, true)
    createGroundBlock('plat9', 2, 0, -34, 2, 1, 2, false, false)
    createGroundBlock('plat10', 0, 10, -36, 2, 1, 2, false, false, true)
    createGroundBlock('plat11', 8, 10, -39, 2, 1, 2, false, true, true, true)
    createGroundBlock('plat12', -8, 10, -42, 2, 1, 2, false, true, true, true)
    createGroundBlock('plat13', 10, 10, -45, 2, 1, 2, false, true, true, true)
    createGroundBlock('plat14',  0, 10, -50, 2, 1, 2, false, false, true)
    createGroundBlock('plat15', -3, 12, -53, 2, 1, 2, false, true, true, true)
    createGroundBlock('plat15', 2, 7, -56, 2, 1, 2, false, true, true)
    const material = new BABYLON.StandardMaterial("material", scene);
    const material1 = new BABYLON.StandardMaterial("material1", scene)
    for (let i of grounds) {
        if (i == grounds[0]) {
            material1.diffuseTexture = new BABYLON.Texture("https://i.postimg.cc/8CHPwDsR/Large-Ground.png")
            grounds[0].material = material1
        } else {
            material.diffuseTexture = new BABYLON.Texture("https://i.postimg.cc/vmqwcm46/Ground-Texture.png", scene);
            i.material = material
        }
    }
    gl = grounds.length


    return scene;
}


const scene = createScene();
const assetManager = new BABYLON.AssetsManager(scene);
const meshtask = assetManager.addMeshTask('loadRock', 'rock', "models/", "Rocks.glb", )
engine.runRenderLoop(function() {
    if (box.position.y < -50) {
        box.position.z = 0
        box.position.x = 0
        timercount2 = 0;
        timercount = 0;
        box.position.y = 4;
        reset();
    }
    scene.getMeshByName('skyBox').position = box.position
    if (timer) timercount++;
    if (timer2) timercount2++;
    mouselocked = engine.isPointerLock;
    if (jump && !isGrounded) jumpcount--;
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
    lvl2 = false
    grounds[9].position = new BABYLON.Vector3(2, 0, -34)
    buttons[0].position = new BABYLON.Vector3(2, 1, -35.5)

}


canvas.onclick = function() {
    canvas.requestPointerLock = canvas.requestPointerLock || canvas.msRequestPointerLock || canvas.mozRequestPointerLock || canvas.webkitRequestPointerLock;
    if (canvas.requestPointerLock) {
        canvas.requestPointerLock();
    }
};
origin = box.position.clone()
const height1 = box.getBoundingInfo().boundingBox.extendSizeWorld.y
const raylength = 6
const directionraydown = new BABYLON.Vector3(0, -1, 0)
const directionrayup = new BABYLON.Vector3(0, 1, 0)
const rayf = new BABYLON.Ray(origin.clone().addInPlace(new BABYLON.Vector3(0, 0.042, 0.2)), directionraydown, raylength)
const rayr = new BABYLON.Ray(origin.clone().addInPlace(new BABYLON.Vector3(-0.2, 0.042, 0)), directionraydown, raylength)
const rayl = new BABYLON.Ray(origin.clone().addInPlace(new BABYLON.Vector3(0.2, 0.042, 0)), directionraydown, raylength)
const rayb = new BABYLON.Ray(origin.clone().addInPlace(new BABYLON.Vector3(0, 0.042, -0.2)), directionraydown, raylength)
const ray = new BABYLON.Ray(origin, directionraydown, raylength)
const rayfu = new BABYLON.Ray(origin.clone().addInPlace(new BABYLON.Vector3(0, 0.042, 0.3)), directionrayup, 0.6)
const rayru = new BABYLON.Ray(origin.clone().addInPlace(new BABYLON.Vector3(-0.3, 0.042, 0)), directionrayup, 0.6)
const raylu = new BABYLON.Ray(origin.clone().addInPlace(new BABYLON.Vector3(0.3, 0.042, 0)), directionrayup, 0.6)
const raybu = new BABYLON.Ray(origin.clone().addInPlace(new BABYLON.Vector3(0, 0.042, -0.3)), directionrayup, 0.6)
const rayu = new BABYLON.Ray(origin, directionrayup, 0.6)
const raylf1 = new BABYLON.Ray(origin, directionf, 0.5)
const raylf2 = new BABYLON.Ray(origin, directionf, 0.5)
const raylf3 = new BABYLON.Ray(origin, directionf, 0.5)
const raylr1 = new BABYLON.Ray(origin, directionr, 0.5)
const raylr2 = new BABYLON.Ray(origin, directionr, 0.5)
const raylr3 = new BABYLON.Ray(origin, directionr, 0.5)
const rayll1 = new BABYLON.Ray(origin, directionl, 0.5)
const rayll2 = new BABYLON.Ray(origin, directionl, 0.5)
const rayll3 = new BABYLON.Ray(origin, directionl, 0.5)
const raylb1 = new BABYLON.Ray(origin, directionb, 0.5)
const raylb2 = new BABYLON.Ray(origin, directionb, 0.5)
const raylb3 = new BABYLON.Ray(origin, directionb, 0.5)
const raylfr1 = new BABYLON.Ray(origin, directionfr, 0.5)
const raylfr2 = new BABYLON.Ray(origin, directionfr, 0.5)
const raylfr3 = new BABYLON.Ray(origin, directionfr, 0.5)
const raylbr1 = new BABYLON.Ray(origin, directionfr, 0.5)
const raylbr2 = new BABYLON.Ray(origin, directionfr, 0.5)
const raylbr3 = new BABYLON.Ray(origin, directionfr, 0.5)
const raylfl1 = new BABYLON.Ray(origin, directionfr, 0.5)
const raylfl2 = new BABYLON.Ray(origin, directionfr, 0.5)
const raylfl3 = new BABYLON.Ray(origin, directionfr, 0.5)
const raylbl1 = new BABYLON.Ray(origin, directionfr, 0.5)
const raylbl2 = new BABYLON.Ray(origin, directionfr, 0.5)
const raylbl3 = new BABYLON.Ray(origin, directionfr, 0.5)


scene.onBeforeRenderObservable.add(() => {
    origin = box.position;
    rayfu.origin.copyFrom(origin.clone().addInPlace(new BABYLON.Vector3(0, -0.042, 0.3)))
    raybu.origin.copyFrom(origin.clone().addInPlace(new BABYLON.Vector3(0, -0.042, -0.3)))
    rayru.origin.copyFrom(origin.clone().addInPlace(new BABYLON.Vector3(-0.3, -0.042, 0)))
    raylu.origin.copyFrom(origin.clone().addInPlace(new BABYLON.Vector3(0.3, -0.042, 0)))
    rayu.origin.copyFrom(origin)
    raylf1.origin = origin.clone().addInPlace(new BABYLON.Vector3(0, 0.4, 0))
    raylf2.origin = origin.clone().addInPlace(new BABYLON.Vector3(0, 0, 0))
    raylf3.origin = origin.clone().addInPlace(new BABYLON.Vector3(0, -0.1, 0))
    raylr1.origin = origin.clone().addInPlace(new BABYLON.Vector3(0, 0.4, 0))
    raylr2.origin = origin.clone().addInPlace(new BABYLON.Vector3(0, 0, 0))
    raylr3.origin = origin.clone().addInPlace(new BABYLON.Vector3(0, -0.1, 0))
    raylb1.origin = box.position.clone().addInPlace(new BABYLON.Vector3(0, 0.4, 0))
    raylb2.origin = box.position.clone().addInPlace(new BABYLON.Vector3(0, 0, 0))
    raylb3.origin = box.position.clone().addInPlace(new BABYLON.Vector3(0, -0.4, 0))
    rayll1.origin = origin.clone().addInPlace(new BABYLON.Vector3(0, 0.4, 0))
    rayll2.origin = origin.clone().addInPlace(new BABYLON.Vector3(0, 0, 0))
    rayll3.origin = origin.clone().addInPlace(new BABYLON.Vector3(0, -0.1, 0))
    raylfr1.origin = origin.clone().addInPlace(new BABYLON.Vector3(0, 0.4, 0))
    raylfr2.origin = origin.clone().addInPlace(new BABYLON.Vector3(0, 0, 0))
    raylfr3.origin = origin.clone().addInPlace(new BABYLON.Vector3(0, -0.1, 0))
    raylfl1.origin = origin.clone().addInPlace(new BABYLON.Vector3(0, 0.4, 0))
    raylfl2.origin = origin.clone().addInPlace(new BABYLON.Vector3(0, 0, 0))
    raylfl3.origin = origin.clone().addInPlace(new BABYLON.Vector3(0, -0.1, 0))
    raylbr1.origin = origin.clone().addInPlace(new BABYLON.Vector3(0, 0.4, 0))
    raylbr2.origin = origin.clone().addInPlace(new BABYLON.Vector3(0, 0, 0))
    raylbr3.origin = origin.clone().addInPlace(new BABYLON.Vector3(0, -0.1, 0))
    raylbl1.origin = origin.clone().addInPlace(new BABYLON.Vector3(0, 0.4, 0))
    raylbl2.origin = origin.clone().addInPlace(new BABYLON.Vector3(0, 0, 0))
    raylbl3.origin = origin.clone().addInPlace(new BABYLON.Vector3(0, -0.1, 0))


    raylf1.direction = directionf
    raylf2.direction = directionf
    raylf3.direction = directionf
    raylb1.direction = directionb
    raylb2.direction = directionb
    raylb3.direction = directionb
    raylr1.direction = directionr
    raylr2.direction = directionr
    raylr3.direction = directionr
    rayll1.direction = directionl
    rayll2.direction = directionl
    rayll3.direction = directionl
    raylfr1.direction = directionfr
    raylfr2.direction = directionfr
    raylfr3.direction = directionfr
    raylbr1.direction = directionbr
    raylbr2.direction = directionbr
    raylbr3.direction = directionbr
    raylfl1.direction = directionfl
    raylfl2.direction = directionfl
    raylfl3.direction = directionfl
    raylbl1.direction = directionbl
    raylbl2.direction = directionbl
    raylbl3.direction = directionbl

    directionf = box.getDirection(new BABYLON.Vector3(0, 0, 1))
    directionb = box.getDirection(new BABYLON.Vector3(0,0, -1))
    directionl = box.getDirection(new BABYLON.Vector3(-1, 0, 0))
    directionr = box.getDirection(new BABYLON.Vector3(1, 0, 0))
    directionfr = directionf.add(directionr).normalize()
    directionfl = directionf.add(directionl).normalize()
    directionbr = directionb.add(directionr).normalize()
    directionbl = directionb.add(directionl).normalize()
    
    nomove = !input.forward && !input.backward && !input.left && !input.right;
    if (nomove) {
        timer = false
        timercount = 0;
    }
    hitf = scene.pickWithRay(raylf1)
    hitb = scene.pickWithRay(raylb1)
    hitfl = scene.pickWithRay(raylfl1)
    hitbl = scene.pickWithRay(raylbl1)
    hitfr = scene.pickWithRay(raylfr1)
    hitbr = scene.pickWithRay(raylbr1)
    hitr = scene.pickWithRay(raylr1)
    hitl = scene.pickWithRay(rayll1)
    hitu = scene.pickWithRay(rayu)
    if (!hitu.pickedMesh) {
        hitu = scene.pickWithRay(rayfu)
        if (!hitu.pickedMesh) {
            hitu = scene.pickWithRay(raybu)
            if (!hitu.pickedMesh) {
                hitu = scene.pickWithRay(raylu)
                if (!hitu.pickedMesh) {
                    hitu = scene.pickWithRay(rayru)
                }
            }
        }
    }
    if (!hitfl.pickedMesh) {
        hitfl = scene.pickWithRay(raylfl2)
        if (!hitfl.pickedMesh) {
            hitfl = scene.pickWithRay(raylfl3, (mesh) => {
                return !mesh.IsGround && !mesh === box
            })
        }
    }
    if (!hitfr.pickedMesh) {
        hitfr = scene.pickWithRay(raylfr2)
        if (!hitfr.pickedMesh) {
            hitfr = scene.pickWithRay(raylfr3, (mesh) => {
                return !mesh.IsGround && !mesh === box
            })
        }
    }
    if (!hitf.pickedMesh) {
        hitf = scene.pickWithRay(raylf2)
        if (!hitf.pickedMesh) {
            hitf = scene.pickWithRay(raylf3, (mesh) => {
                return !mesh.IsGround && !mesh === box
            })
        }
    }
    if (!hitbl.pickedMesh) {
        hitbl = scene.pickWithRay(raylbl2)
        if (!hitbl.pickedMesh) {
            hitbl = scene.pickWithRay(raylbr3, (mesh) => {
                return !mesh.IsGround && !mesh === box
            })
        }
    }
    if (!hitbr.pickedMesh) {
        hitbr = scene.pickWithRay(raylbr2)
        if (!hitbr.pickedMesh) {
            hitbr = scene.pickWithRay(raylbr3, (mesh) => {
                return !mesh.IsGround && !mesh === box
            })
        }
    }
    if (!hitb.pickedMesh) {
        hitb = scene.pickWithRay(raylb2)
        if (!hitb.pickedMesh) {
            hitb = scene.pickWithRay(raylb3, (mesh) => {
                return !mesh.IsGround && !mesh === box
            })
        }
    }
    if (!hitr.pickedMesh) {
        hitr = scene.pickWithRay(raylr2)
        if (!hitr.pickedMesh) {
            hitr = scene.pickWithRay(raylr3, (mesh) => {
                return !mesh.IsGround && !mesh === box
            })
        }
    }
    if (!hitl.pickedMesh) {
        hitl = scene.pickWithRay(rayll2)
        if (!hitl.pickedMesh) {
            hitl = scene.pickWithRay(rayll3, (mesh) => {
                return !mesh.IsGround && !mesh === box
            })
        }
    }
    if (hitf.pickedMesh == buttons[0]) {
        buttons[0].position = new BABYLON.Vector3(2, 1, -35.54)
        lvl2 = true
        risinggrounds.push(grounds[9])
    }
    if (hitf.pickedMesh) {
        input.forward = false 
    };
    if (hitfr.pickedMesh) {
        input.forward = false 
        input.right = false
    };
    if (hitfl.pickedMesh) {
        input.forward = false 
        input.left = false        
    };
    if (hitb.pickedMesh){
        input.backward = false
    };
    if (hitbl.pickedMesh){
        input.backward = false
        input.left = false        
    };
    if (hitbr.pickedMesh){
        input.backward = false
        input.right = false
    };
    if (hitl.pickedMesh) {
        input.left = false        
    };
    if (hitr.pickedMesh) {
        input.right = false
    };
    velocity.set(0,0,0)
    if (input.jump) {
        if (isGrounded) {
            jump = true
            jumpcount = 8
        }
    }
    if (input.forward) {
        velocity.addInPlace(directionf)
    } else if (input.backward) {
        velocity.addInPlace(directionb)
    }
    if (input.left) {
        velocity.addInPlace(directionl)
    } else if (input.right) {
        velocity.addInPlace(directionr)
    }
    
    let multipler = 1
    if (input.shift) multipler = 1.5;
    speed = timercount/400 * multipler
    speed = BABYLON.Scalar.Clamp(speed, 0, 0.3 * multipler)
    if (hit!= null) 
        box.moveWithCollisions(velocity.scale(speed))
});

scene.onBeforeRenderObservable.add(() => {
    if (hit != null) {
        let groundd = hit.pickedMesh
        for (let i = 0; i<gl; i++) {
            if (i > 8) {
                if (lvl2) {
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
            } else if (hit.pickedMesh === grounds[i]) {
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
    if (!lvl2) {
        for (let i = 0; i<gl; i++) {
            let num = i + 10
            if (grounds[num]) {
                grounds[num].setEnabled(false)
            }

        }
    }
    for(let i =0; i<risinggrounds.length; i++) {
        if (risinggrounds[i] == grounds[9]) {
            if (risinggrounds[i].position.y < 10) {
                direction[i] = new BABYLON.Vector3(0, 1, 0)
            } else {
                risinggrounds.pop()
                continue;
            }
            if (hit != null) {
                if (hit.pickedMesh == risinggrounds[i]) {
                    box.moveWithCollisions(direction[i].scale(0.05))
                }
            }
            risinggrounds[i].position.addInPlace(direction[i].scale(0.05))
        } else if(risinggrounds[i].moveHorizontal) {
            if (!direction[i]) {
                direction.push(new BABYLON.Vector3(1,0,0))
            }
            if (risinggrounds[i].position.x > 6) {
                direction[i] = new BABYLON.Vector3(-1,0, 0)
            } else if (risinggrounds[i].position.x < -6) {
                direction[i] = new BABYLON.Vector3(1, 0, 0)
            }
            risinggrounds[i].position.addInPlace(direction[i].scale(0.05))
            if (hit != null) {
                if (hit.pickedMesh == risinggrounds[i]) {
                    box.moveWithCollisions(direction[i].scale(0.05))
                }
            }
        } else if(risinggrounds[i].secondlvl) {
            if (!direction[i]) {
                direction.push(new BABYLON.Vector3(0,1,0))
            }
            if (risinggrounds[i].position.y > 17) {
                direction[i] = new BABYLON.Vector3(0, -1, 0)
            } else if (risinggrounds[i].position.y < 5) {
                direction[i] = new BABYLON.Vector3(0, 1, 0)
            }
            if (hit != null) {
                if (hit.pickedMesh == risinggrounds[i]) {
                    box.moveWithCollisions(direction[i].scale(0.05))
                }
            }
            risinggrounds[i].position.addInPlace(direction[i].scale(0.05))
            
        } else { 
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
        
    }
});

scene.onBeforeRenderObservable.add(() => {
    origin.copyFrom(box.position)
    // origin.y -= height1
    // origin.y += 0.1
    rayf.origin.copyFrom(origin.clone().addInPlace(new BABYLON.Vector3(0, 0.042, 0.2)))
    rayb.origin.copyFrom(origin.clone().addInPlace(new BABYLON.Vector3(0, 0.042, -0.2)))
    rayr.origin.copyFrom(origin.clone().addInPlace(new BABYLON.Vector3(-0.2, 0.042, 0)))
    rayl.origin.copyFrom(origin.clone().addInPlace(new BABYLON.Vector3(0, 0.042, -0.2)))
    ray.origin.copyFrom(origin)
    
    
    // BABYLON.RayHelper.CreateAndShow(raylr1, scene, new BABYLON.Color3(0,1,0))
    // BABYLON.RayHelper.CreateAndShow(raylr2, scene, new BABYLON.Color3(0,1,0))
    // BABYLON.RayHelper.CreateAndShow(raylr3, scene, new BABYLON.Color3(0,1,0))
    // BABYLON.RayHelper.CreateAndShow(rayll1, scene, new BABYLON.Color3(0,1,0))
    // BABYLON.RayHelper.CreateAndShow(rayll2, scene, new BABYLON.Color3(0,1,0))
    // BABYLON.RayHelper.CreateAndShow(rayll3, scene, new BABYLON.Color3(0,1,0))
    // BABYLON.RayHelper.CreateAndShow(raylu, scene, new BABYLON.Color3(0,1,0))
    // BABYLON.RayHelper.CreateAndShow(rayu, scene, new BABYLON.Color3(0,1,0))
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
    // console.log(hit.pickedMesh)
    if (jump && jumpcount > 0) {
        if (hitu.pickedMesh) jumpcount = 0; 
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
        if (hit.pickedMesh.IsGround && hit.distance < 0.7) {
        } else {
            isGrounded = false
        }
    } else {
        isGrounded = false
    }
    // if player isnt grounded it will go to gravitys if statement
    if (!isGrounded) {
        // if player is nowhere near ground it will go to the first if block which will let the player fall completely
        startTimer2(); 
        drop = gravity * timercount2/1500
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
            maxdrop = box.position.y - hit.pickedPoint.y
            if (box.position.y < (box.position.y + 0.5 - maxdrop)){
                box.position.y = box.position.y - maxdrop + 0.5
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
        console.log(box.position)
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

const button = document.getElementById('button1')
const bg = document.getElementById('background')
const title = document.getElementById('title')

button.addEventListener('click', function() {
    button.style.visibility = "hidden"
    bg.style.visibility = "hidden"
    title.style.visibility = "hidden"
})
