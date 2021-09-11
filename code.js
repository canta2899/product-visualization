import './libs/BufferGeometryUtils.js';
import './libs/BufferGeometryToIndexed.js';

let vs, fs_cloth, fs_wood, fs_metal, fs_leather;

vs = document.getElementById("vertex").textContent;
fs_cloth = document.getElementById("fragment_cloth").textContent;
fs_wood = document.getElementById("fragment_wood").textContent;
fs_metal = document.getElementById("fragment_metal").textContent;
fs_leather = document.getElementById("fragment_leather").textContent;


const scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 100);
camera.position.set(0, 0, 7);
camera.lookAt(0, 0, 0);


let canvas = document.querySelector("canvas")
const renderer = new THREE.WebGLRenderer({canvas})
renderer.setSize(window.innerWidth, window.innerHeight)

let textureParameters = {
    pillow_material_1: "Leather009",
    pillow_material_2: "Leather011",
    lateral_material: "Leather011",
    bottom: "Wood070", // FISSO
    legs: "Metal032", // FISSO
    repeatS: 3.0, // FISSO
    repeatT: 3.0, // FISSO
    normalScale: 1 // FISSO
}

let repeat = new THREE.Vector2(textureParameters.repeatS, textureParameters.repeatT);

let diffuseMap_pillow_1 = loadTexture("materials/" + textureParameters.pillow_material_1 + "/" + textureParameters.pillow_material_1 + "_1K_Color.png");
let specularMap_pillow_1 = loadTexture("materials/" + textureParameters.pillow_material_1 + "/" + textureParameters.pillow_material_1 + "_1K_Specular.png");
let roughnessMap_pillow_1 = loadTexture("materials/" + textureParameters.pillow_material_1 + "/" + textureParameters.pillow_material_1 + "_1K_Roughness.png");
let normalMap_pillow_1 = loadTexture("materials/" + textureParameters.pillow_material_1 + "/" + textureParameters.pillow_material_1 + "_1K_NormalGL.png");

let diffuseMap_pillow_2 = loadTexture("materials/" + textureParameters.pillow_material_2 + "/" + textureParameters.pillow_material_2 + "_1K_Color.png");
let specularMap_pillow_2 = loadTexture("materials/" + textureParameters.pillow_material_2 + "/" + textureParameters.pillow_material_2 + "_1K_Specular.png");
let roughnessMap_pillow_2 = loadTexture("materials/" + textureParameters.pillow_material_2 + "/" + textureParameters.pillow_material_2 + "_1K_Roughness.png");
let normalMap_pillow_2 = loadTexture("materials/" + textureParameters.pillow_material_2 + "/" + textureParameters.pillow_material_2 + "_1K_NormalGL.png");

let diffuseMap_lateral = loadTexture("materials/" + textureParameters.lateral_material + "/" + textureParameters.lateral_material + "_1K_Color.png");
let specularMap_lateral = loadTexture("materials/" + textureParameters.lateral_material + "/" + textureParameters.lateral_material + "_1K_Specular.png");
let roughnessMap_lateral = loadTexture("materials/" + textureParameters.lateral_material + "/" + textureParameters.lateral_material + "_1K_Roughness.png");
let normalMap_lateral = loadTexture("materials/" + textureParameters.lateral_material + "/" + textureParameters.lateral_material + "_1K_NormalGL.png");

let diffuseMap_bottom = loadTexture("materials/" + textureParameters.bottom + "/" + textureParameters.bottom + "_1K_Color.png");
let roughnessMap_bottom = loadTexture("materials/" + textureParameters.bottom + "/" + textureParameters.bottom + "_1K_Roughness.png");
let normalMap_bottom = loadTexture("materials/" + textureParameters.bottom + "/" + textureParameters.bottom + "_1K_NormalGL.png");

let diffuseMap_legs = loadTexture("materials/" + textureParameters.legs + "/" + textureParameters.legs + "_1K_Color.png");
let metalnessMap_legs = loadTexture("materials/" + textureParameters.legs + "/" + textureParameters.legs + "_1K_Metalness.png");
let roughnessMap_legs = loadTexture("materials/" + textureParameters.legs + "/" + textureParameters.legs + "_1K_Roughness.png");
let normalMap_legs = loadTexture("materials/" + textureParameters.legs + "/" + textureParameters.legs + "_1K_NormalGL.png");

let loader = new THREE.CubeTextureLoader().setPath('./cubemap/');

let textureCube = loader.load([
    'px.png', 'nx.png',
    'py.png', 'ny.png',
    'pz.png', 'nz.png'
]);

scene.background = textureCube;
textureCube.minFilter = THREE.LinearMipMapLinearFilter;

let materialExtensions = {
    shaderTextureLOD: true
};

let lightParameters = {
    red: 1.0,
    green: 1.0,
    blue: 1.0,
    intensity: 1
}
let pointLight_0 = new THREE.Vector3(10, 10, 10);
let pointLight_1 = new THREE.Vector3(10, -10, 10);
let pointLight_2 = new THREE.Vector3(-10, 10, -10);
let pointLight_3 = new THREE.Vector3(-10, -10, -10);
let pointLight_4 = new THREE.Vector3(-10, 10, 10);
let pointLight_5 = new THREE.Vector3(-10, -10, 10);
let pointLight_6 = new THREE.Vector3(10, 10, -10);
let pointLight_7 = new THREE.Vector3(10, -10, -10);
// let geometry = new THREE.SphereGeometry( 1, 16, 16);
// let material = new THREE.MeshBasicMaterial ({color: 0xffff00, wireframe:true})
// let lightMesh_0 = new THREE.Mesh(geometry, material);
// lightMesh_0.position.copy(pointLight_0);
// let lightMesh_1 = new THREE.Mesh(geometry, material);
// lightMesh_1.position.copy(pointLight_1);
// let lightMesh_2 = new THREE.Mesh(geometry, material);
// lightMesh_2.position.copy(pointLight_2);
// let lightMesh_3 = new THREE.Mesh(geometry, material);
// lightMesh_3.position.copy(pointLight_3);
// let lightMesh_4 = new THREE.Mesh(geometry, material);
// lightMesh_4.position.copy(pointLight_4);
// let lightMesh_5 = new THREE.Mesh(geometry, material);
// lightMesh_5.position.copy(pointLight_5);
// let lightMesh_6 = new THREE.Mesh(geometry, material);
// lightMesh_6.position.copy(pointLight_6);
// let lightMesh_7 = new THREE.Mesh(geometry, material);
// lightMesh_7.position.copy(pointLight_7);
// scene.add(lightMesh_0);
// scene.add(lightMesh_1);
// scene.add(lightMesh_2);
// scene.add(lightMesh_3);
// scene.add(lightMesh_4);
// scene.add(lightMesh_5);
// scene.add(lightMesh_6);
// scene.add(lightMesh_7);

let lightValues = new THREE.Vector3(
    lightParameters.red * lightParameters.intensity,
    lightParameters.green * lightParameters.intensity,
    lightParameters.blue * lightParameters.intensity
);

let pillow_uniforms_1 = {
    normalScale: {type: "v2", value: new THREE.Vector2(1, 1)},
    textureRepeat: {type: "v2", value: repeat},
    normalMap: {type: "t", value: normalMap_pillow_1},
    specularMap: {type: "t", value: specularMap_pillow_1},
    diffuseMap: {type: "t", value: diffuseMap_pillow_1},
    roughnessMap: {type: "t", value: roughnessMap_pillow_1},
    pointLightPosition: {value: [pointLight_0, pointLight_1, pointLight_2, pointLight_3, pointLight_4, pointLight_5, pointLight_6, pointLight_7]},
    clight: {type: "v3", value: lightValues}
};

let pillow_material_1 = new THREE.ShaderMaterial({
    uniforms: pillow_uniforms_1,
    vertexShader: vs,
    fragmentShader: fs_cloth,
    extensions: materialExtensions
});

let pillow_uniforms_2 = {
    normalScale: {type: "v2", value: new THREE.Vector2(1, 1)},
    textureRepeat: {type: "v2", value: repeat},
    normalMap: {type: "t", value: normalMap_pillow_2},
    specularMap: {type: "t", value: specularMap_pillow_2},
    diffuseMap: {type: "t", value: diffuseMap_pillow_2},
    roughnessMap: {type: "t", value: roughnessMap_pillow_2},
    pointLightPosition: {value: [pointLight_0, pointLight_1, pointLight_2, pointLight_3, pointLight_4, pointLight_5, pointLight_6, pointLight_7]},
    clight: {type: "v3", value: lightValues}
};

let pillow_material_2 = new THREE.ShaderMaterial({
    uniforms: pillow_uniforms_2,
    vertexShader: vs,
    fragmentShader: fs_cloth,
    extensions: materialExtensions
});

let lateral_unifroms = {
    normalScale: {type: "v2", value: new THREE.Vector2(1, 1)},
    textureRepeat: {type: "v2", value: repeat},
    normalMap: {type: "t", value: normalMap_lateral},
    specularMap: {type: "t", value: specularMap_lateral},
    diffuseMap: {type: "t", value: diffuseMap_lateral},
    roughnessMap: {type: "t", value: roughnessMap_lateral},
    pointLightPosition: {value: [pointLight_0, pointLight_1, pointLight_2, pointLight_3, pointLight_4, pointLight_5, pointLight_6, pointLight_7]},
    clight: {type: "v3", value: lightValues}
};

let lateral_material = new THREE.ShaderMaterial({
    uniforms: lateral_unifroms,
    vertexShader: vs,
    fragmentShader: fs_leather,
    extensions: materialExtensions
});

let bottom_unifroms = {
    normalScale: {type: "v2", value: new THREE.Vector2(1, 1)},
    envMap: {type: "t", value: textureCube},
    textureRepeat: {type: "v2", value: repeat},
    normalMap: {type: "t", value: normalMap_bottom},
    diffuseMap: {type: "t", value: diffuseMap_bottom},
    roughnessMap: {type: "t", value: roughnessMap_bottom},
    pointLightPosition: {value: [pointLight_0, pointLight_1, pointLight_2, pointLight_3, pointLight_4, pointLight_5, pointLight_6, pointLight_7]},
    clight: {type: "v3", value: lightValues}
};

let bottom_material = new THREE.ShaderMaterial({
    uniforms: bottom_unifroms,
    vertexShader: vs,
    fragmentShader: fs_wood,
    extensions: materialExtensions
});

let legs_unifroms = {
    normalScale: {type: "v2", value: new THREE.Vector2(1, 1)},
    envMap: {type: "t", value: textureCube},
    textureRepeat: {type: "v2", value: repeat},
    normalMap: {type: "t", value: normalMap_legs},
    metalnessMap: {type: "t", value: metalnessMap_legs},
    diffuseMap: {type: "t", value: diffuseMap_legs},
    roughnessMap: {type: "t", value: roughnessMap_legs},
    pointLightPosition: {value: [pointLight_0, pointLight_1, pointLight_2, pointLight_3, pointLight_4, pointLight_5, pointLight_6, pointLight_7]},
    clight: {type: "v3", value: lightValues}
};

let legs_material = new THREE.ShaderMaterial({
    uniforms: legs_unifroms,
    vertexShader: vs,
    fragmentShader: fs_metal,
    extensions: materialExtensions
});

const objLoader = new THREE.OBJLoader()
objLoader.load(
    'obj/couch.obj',
    object => {
        for (let i = 0; i < 12; i++) {
            let part = object.children[i]
            let geometry = part.geometry.toIndexed()
            let mesh;
            if (i === 6)
                mesh = new THREE.Mesh(geometry, bottom_material);
            else if (i === 3)
                mesh = new THREE.Mesh(geometry, legs_material);
            else if (i === 7 || i === 8)
                mesh = new THREE.Mesh(geometry, lateral_material);
            else if (i === 0 || i === 2 || i === 4 || i === 10)
                mesh = new THREE.Mesh(geometry, pillow_material_2);
            else
                mesh = new THREE.Mesh(geometry, pillow_material_1);
            THREE.BufferGeometryUtils.computeTangents(geometry);
            scene.add(mesh);
        }
    },
    xhr => {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    error => {
        console.log(error)
    }
)

const controls = new THREE.OrbitControls(camera, renderer.domElement)
controls.enableDamping = true

window.addEventListener('resize', onWindowResize, false)

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    render()
}

// const stats = Stats()
// document.body.appendChild(stats.dom)

function animate() {
    requestAnimationFrame(animate)
    controls.update()
    render()
    // stats.update()
}

function render() {
    updateUniforms();
    updateMaterials();
    renderer.render(scene, camera)
}

function loadTexture(file) {
    return new THREE.TextureLoader().load(file, texture => {
        texture.minFilter = THREE.LinearMipMapLinearFilter;
        texture.anisotropy = renderer.getMaxAnisotropy();
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.offset.set(0, 0);
        texture.needsUpdate = true;
        render();
    });
}

// function clearGui() {
//     if (gui) gui.destroy();
//     gui = new dat.GUI();
//     gui.open();
// }

// function buildGui() {
//     clearGui();
//     let textureSettings = gui.addFolder('Texture parameters');
//     textureSettings.add(textureParameters, 'pillow_material_1', ['Fabric008', 'Fabric009']).onChange(
//         function (material) {
//             diffuseMap_pillow_1 = loadTexture("materials/" + material + "/" + material + "_1K_Color.png");
//             specularMap_pillow_1 = loadTexture("materials/" + material + "/" + material + "_1K_Specular.png");
//             roughnessMap_pillow_1 = loadTexture("materials/" + material + "/" + material + "_1K_Roughness.png");
//             normalMap_pillow_1 = loadTexture("materials/" + material + "/" + material + "_1K_NormalGL.png");
//             pillow_material_1.needsUpdate = true;
//             render()
//         });
//     textureSettings.add(textureParameters, 'pillow_material_2', ['Fabric008', 'Fabric009']).onChange(
//         function (material) {
//             diffuseMap_pillow_2 = loadTexture("materials/" + material + "/" + material + "_1K_Color.png");
//             specularMap_pillow_2 = loadTexture("materials/" + material + "/" + material + "_1K_Specular.png");
//             roughnessMap_pillow_2 = loadTexture("materials/" + material + "/" + material + "_1K_Roughness.png");
//             normalMap_pillow_2 = loadTexture("materials/" + material + "/" + material + "_1K_NormalGL.png");
//             pillow_material_2.needsUpdate = true;
//             render()
//         });
// }

function loadPillow1() {
    diffuseMap_pillow_1 = loadTexture("materials/" + material + "/" + material + "_1K_Color.png");
    specularMap_pillow_1 = loadTexture("materials/" + material + "/" + material + "_1K_Specular.png");
    roughnessMap_pillow_1 = loadTexture("materials/" + material + "/" + material + "_1K_Roughness.png");
    normalMap_pillow_1 = loadTexture("materials/" + material + "/" + material + "_1K_NormalGL.png");
    pillow_material_1.needsUpdate = true;
    render()
}

function loadPillow2() {
    diffuseMap_pillow_2 = loadTexture("materials/" + material + "/" + material + "_1K_Color.png");
    specularMap_pillow_2 = loadTexture("materials/" + material + "/" + material + "_1K_Specular.png");
    roughnessMap_pillow_2 = loadTexture("materials/" + material + "/" + material + "_1K_Roughness.png");
    normalMap_pillow_2 = loadTexture("materials/" + material + "/" + material + "_1K_NormalGL.png");
    pillow_material_2.needsUpdate = true;
    render()
}

function loadLateral() {
    diffuseMap_lateral = loadTexture("materials/" + material + "/" + material + "_1K_Color.png");
    specularMap_lateral = loadTexture("materials/" + material + "/" + material + "_1K_Specular.png");
    roughnessMap_lateral = loadTexture("materials/" + material + "/" + material + "_1K_Roughness.png");
    normalMap_lateral = loadTexture("materials/" + material + "/" + material + "_1K_NormalGL.png");
    lateral_material.needsUpdate = true;
    render()
}

function updateUniforms() {
    pillow_uniforms_1.diffuseMap.value = diffuseMap_pillow_1;
    pillow_uniforms_1.specularMap.value = specularMap_pillow_1;
    pillow_uniforms_1.roughnessMap.value = roughnessMap_pillow_1;
    pillow_uniforms_1.normalMap.value = normalMap_pillow_1;

    pillow_uniforms_2.diffuseMap.value = diffuseMap_pillow_2;
    pillow_uniforms_2.specularMap.value = specularMap_pillow_2;
    pillow_uniforms_2.roughnessMap.value = roughnessMap_pillow_2;
    pillow_uniforms_2.normalMap.value = normalMap_pillow_2;
}

function updateMaterials() {
    pillow_material_1.fragmentShader = getFragment(textureParameters.pillow_material_1);
    pillow_material_2.fragmentShader = getFragment(textureParameters.pillow_material_2);
    lateral_material.fragmentShader = getFragment(textureParameters.lateral_material);
}

function getFragment(material) {
    if (material.includes('Fabric'))
        return fs_cloth;
    else
        return fs_leather;
}

// buildGui()
animate()