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
camera.position.set(0, 5, 9);
camera.lookAt(0, 0, 0);


let canvas = document.querySelector("canvas")
const renderer = new THREE.WebGLRenderer({canvas})
renderer.setSize(window.innerWidth, window.innerHeight)

let textureParameters = {
    pillow_1: "Fabric009",
    pillow_2: "Fabric008",
    lateral: "Fabric008",
    bottom: "Wood070", // FISSO
    legs: "Metal032", // FISSO
    repeatS: 4.0, // FISSO
    repeatT: 4.0, // FISSO
    normalScale: 1 // FISSO
}

let textures = {
    pillow_1: {},
    pillow_2: {},
    lateral: {},
    bottom: {},
    legs: {}
}
initTextures();

let repeat = new THREE.Vector2(textureParameters.repeatS, textureParameters.repeatT);

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

let lightValues = new THREE.Vector3(
    lightParameters.red * lightParameters.intensity,
    lightParameters.green * lightParameters.intensity,
    lightParameters.blue * lightParameters.intensity
);


let uniforms = {
    pillow_1: {},
    pillow_2: {},
    lateral: {},
    bottom: {},
    legs: {}
}
buildUniform('pillow_1');
buildUniform('pillow_2');
buildUniform('lateral');
buildUniform('bottom');
buildUniform('legs');

let materials = {
    pillow_1: {},
    pillow_2: {},
    lateral: {},
    bottom: {},
    legs: {}
}
buildMaterial('pillow_1');
buildMaterial('pillow_2');
buildMaterial('lateral');
buildMaterial('bottom');
buildMaterial('legs');

const objLoader = new THREE.OBJLoader()
objLoader.load(
    'obj/couch.obj',
    object => {
        for (let i = 0; i < 12; i++) {
            let part = object.children[i]
            let geometry = part.geometry.toIndexed()
            geometry.scale(2, 2, 2)
            let mesh;
            if (i === 6)
                mesh = new THREE.Mesh(geometry, materials["bottom"]);
            else if (i === 3)
                mesh = new THREE.Mesh(geometry, materials["legs"]);
            else if (i === 7 || i === 8)
                mesh = new THREE.Mesh(geometry, materials["lateral"]);
            else if (i === 0 || i === 2 || i === 4 || i === 10)
                mesh = new THREE.Mesh(geometry, materials["pillow_2"]);
            else
                mesh = new THREE.Mesh(geometry, materials["pillow_1"]);
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
controls.minDistance = 5;
controls.maxDistance = 13;

window.addEventListener('resize', onWindowResize, false)

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    render()
}

function animate() {
    requestAnimationFrame(animate)
    controls.update()
    render()
}

function render() {
    updateMaterials();
    updateUniforms();
    renderer.render(scene, camera)
}

function loadTexture(file) {
    return new THREE.TextureLoader().load(file, texture => {
        texture.minFilter = THREE.LinearMipMapLinearFilter;
        texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.offset.set(0, 0);
        texture.needsUpdate = true;
        render();
    });
}

function callLoadTexture(material, textureType){
    return loadTexture("materials/" + material + "/" + material + "_1K_" + textureType + ".png")
}

function initTextures() {
    textures.pillow_1.diffuseMap = callLoadTexture(textureParameters.pillow_1, "Color");
    textures.pillow_2.diffuseMap = callLoadTexture(textureParameters.pillow_2, "Color");
    textures.lateral.diffuseMap = callLoadTexture(textureParameters.lateral, "Color");
    textures.bottom.diffuseMap = callLoadTexture(textureParameters.bottom, "Color");
    textures.legs.diffuseMap =  callLoadTexture(textureParameters.legs, "Color");

    textures.pillow_1.normalMap = callLoadTexture(textureParameters.pillow_1, "NormalGL");
    textures.pillow_2.normalMap = callLoadTexture(textureParameters.pillow_2, "NormalGL");
    textures.lateral.normalMap = callLoadTexture(textureParameters.lateral, "NormalGL");
    textures.bottom.normalMap = callLoadTexture(textureParameters.bottom, "NormalGL");
    textures.legs.normalMap =  callLoadTexture(textureParameters.legs, "NormalGL");

    textures.pillow_1.roughnessMap = callLoadTexture(textureParameters.pillow_1, "Roughness");
    textures.pillow_2.roughnessMap = callLoadTexture(textureParameters.pillow_2, "Roughness");
    textures.lateral.roughnessMap = callLoadTexture(textureParameters.lateral, "Roughness");
    textures.bottom.roughnessMap = callLoadTexture(textureParameters.bottom, "Roughness");
    textures.legs.roughnessMap =  callLoadTexture(textureParameters.legs, "Roughness");

    textures.pillow_1.specularMap = callLoadTexture(textureParameters.pillow_1, "Specular");
    textures.pillow_2.specularMap = callLoadTexture(textureParameters.pillow_2, "Specular");
    textures.lateral.specularMap = callLoadTexture(textureParameters.lateral, "Specular");

    textures.legs.metalnessMap =  callLoadTexture(textureParameters.legs, "Metalness");
}

function buildUniform(type) {
    uniforms[type].normalScale = {type: "v2", value: new THREE.Vector2(1, 1)};
    uniforms[type].textureRepeat = {type: "v2", value: repeat};
    uniforms[type].pointLightPosition = {value: [pointLight_0, pointLight_1, pointLight_2, pointLight_3, pointLight_4, pointLight_5, pointLight_6, pointLight_7]};
    uniforms[type].clight = {type: "v3", value: lightValues};
    uniforms[type].normalMap = {type: "t", value: textures[type].normalMap};
    uniforms[type].diffuseMap = {type: "t", value: textures[type].diffuseMap};
    uniforms[type].roughnessMap = {type: "t", value: textures[type].roughnessMap};
    if (type !== 'legs' && type !== 'bottom')
        uniforms[type].specularMap = {type: "t", value: textures[type].specularMap};
    else if (type === 'legs')
        uniforms[type].metalnessMap = {type: "t", value: textures[type].metalnessMap};
        uniforms[type].envMap = {type: "t", value: textureCube};
}

function buildMaterial(type) {
    materials[type] = new THREE.ShaderMaterial({
        uniforms: uniforms[type],
        vertexShader: vs,
        extensions: materialExtensions
    });
    if (type === 'legs')
        materials[type].fragmentShader = fs_metal;
    else if (type === 'bottom')
        materials[type].fragmentShader = fs_wood;
    updateMaterials();
}

function loadNewTexture(type) {
    textures[type].diffuseMap = callLoadTexture(textureParameters[type], "Color");
    textures[type].specularMap = callLoadTexture(textureParameters[type], "Specular");
    textures[type].roughnessMap = callLoadTexture(textureParameters[type], "Roughness");
    textures[type].normalMap = callLoadTexture(textureParameters[type], "NormalGL");
    materials[type].needsUpdate = true;
    render();
}

function updateUniforms() {
    uniforms.pillow_1.diffuseMap.value = textures.pillow_1.diffuseMap;
    uniforms.pillow_1.specularMap.value = textures.pillow_1.specularMap;
    uniforms.pillow_1.roughnessMap.value = textures.pillow_1.roughnessMap;
    uniforms.pillow_1.normalMap.value = textures.pillow_1.normalMap;

    uniforms.pillow_2.diffuseMap.value = textures.pillow_2.diffuseMap;
    uniforms.pillow_2.specularMap.value = textures.pillow_2.specularMap;
    uniforms.pillow_2.roughnessMap.value = textures.pillow_2.roughnessMap;
    uniforms.pillow_2.normalMap.value = textures.pillow_2.normalMap;

    uniforms.lateral.diffuseMap.value = textures.lateral.diffuseMap;
    uniforms.lateral.specularMap.value = textures.lateral.specularMap;
    uniforms.lateral.roughnessMap.value = textures.lateral.roughnessMap;
    uniforms.lateral.normalMap.value = textures.lateral.normalMap;
}

function updateMaterials() {
    materials.pillow_1.fragmentShader = getFragment(textureParameters.pillow_1);
    materials.pillow_2.fragmentShader = getFragment(textureParameters.pillow_2);
    materials.lateral.fragmentShader = getFragment(textureParameters.lateral);
}

function getFragment(material) {
    if (material.includes('Fabric'))
        return fs_cloth;
    else
        return fs_leather;
}

document.querySelectorAll('.form-select').forEach(selectElement =>
    selectElement.addEventListener('change', (event) => {
        if (selectElement.id === "1") {
            textureParameters.pillow_1 = event.target.value;
            loadNewTexture('pillow_1');
        } else if (selectElement.id === "2") {
            textureParameters.pillow_2 = event.target.value;
            loadNewTexture('pillow_2');
        } else {
            textureParameters.lateral = event.target.value;
            loadNewTexture('lateral');
        }
    })
);

animate()