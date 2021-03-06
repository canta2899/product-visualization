import './libs/three.js';
// import Stats from './libs/stats.module.js'
import './libs/OrbitControls.js';
import './libs/OBJLoader.js';
import './libs/BufferGeometryUtils.js';
import './libs/BufferGeometryToIndexed.js';
import './libs/EffectComposer.js';
import './libs/ShaderPass.js';
import './libs/CopyShader.js';
import './libs/RenderPass.js';
import './libs/GammaCorrectionShader.js';

let vs, fs_cloth, fs_wood, fs_metal, fs_leather;

// Acquiring vertex and fragment shaders
vs = document.getElementById("vertex").textContent;
fs_cloth = document.getElementById("fragment_cloth").textContent;
fs_wood = document.getElementById("fragment_wood").textContent;
fs_metal = document.getElementById("fragment_metal").textContent;
fs_leather = document.getElementById("fragment_leather").textContent;


// Initializing scene and camera
const scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 100);
camera.position.set(0, 4, 9);
camera.lookAt(0, 0, 0);

// Binding renderer to the existent canvas
let canvas = document.querySelector("canvas")
const renderer = new THREE.WebGLRenderer({canvas, antialias: true})
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(window.devicePixelRatio);

// Cineon tonemapping (choice described in the report)
renderer.toneMapping = THREE.ACESFilmicToneMapping;

// Default texture configuration

let textureParameters = {
    pillow_1: "Fabric009",
    pillow_2: "Fabric008",
    lateral: "Fabric008",
    bottom: "MetalPlates006",
    legs: "Metal032", // fixed
    repeatS: 4.0, // fixed
    repeatT: 4.0, // fixed
    normalScale: 2 // fixed
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


// Loading the environment map

let loader = new THREE.CubeTextureLoader().setPath('./cubemap/');

let textureCube = loader.load([
    'px.png', 'nx.png',
    'py.png', 'ny.png',
    'pz.png', 'nz.png'
]);

scene.background = textureCube;
textureCube.minFilter = THREE.LinearMipMapLinearFilter;

// Adds the eight lights according to the technique described in the report

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


// Uniforms for the shaders

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

// let stats = new Stats();
// stats.domElement.style.position = 'absolute';
// stats.domElement.style.top = '50px';
// document.body.appendChild( stats.domElement );


buildMaterial('pillow_1');
buildMaterial('pillow_2');
buildMaterial('lateral');
buildMaterial('bottom');
buildMaterial('legs');

// Loads the object and assigns different materials to the meshes

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

/*
    Orbit controls to inspect the product. Zoom is limited
    in order to avoid clipping or too much distancing.
*/

const controls = new THREE.OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.minDistance = 5;
controls.maxDistance = 13;


// Event listener for window resizing

window.addEventListener('resize', onWindowResize, false)

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    render()
}

// Rendering functions

function animate() {
    requestAnimationFrame(animate)
    controls.update()
    // stats.update();
    render()
}

function render() {
    updateFragmentShaders();
    updateUniforms();
    renderer.render(scene, camera)
}

// Loads a texture from given path
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

// Calls the texture loader composing the file name according to the choice
function callLoadTexture(material, textureType){
    return loadTexture("materials/" + material + "/" + material + "_1K_" + textureType + ".png")
}


// Loads textures maps for each available material
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
    textures.bottom.metalnessMap =  callLoadTexture(textureParameters.bottom, "Metalness");
}


// Builds uniforms for the shader, according to the material type
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
    else if (type === 'legs' || (type === 'bottom' && textureParameters.bottom.includes("Metal"))) {
        uniforms[type].metalnessMap = {type: "t", value: textures[type].metalnessMap};
        uniforms[type].envMap = {type: "t", value: textureCube};
    }
}


/*
    Builds the right material (binding it to the proper shader)
    for the given material type
*/
function buildMaterial(type) {
    materials[type] = new THREE.ShaderMaterial({
        uniforms: uniforms[type],
        vertexShader: vs
    });
    if (type === 'legs')
        materials[type].fragmentShader = fs_metal;
}

// Once the texture for the given type is changed, loads the new textures from the file
function loadNewTexture(type) {
    textures[type].diffuseMap = callLoadTexture(textureParameters[type], "Color");
    if(type !== "bottom"){
        textures[type].specularMap = callLoadTexture(textureParameters[type], "Specular");
    }
    textures[type].roughnessMap = callLoadTexture(textureParameters[type], "Roughness");
    textures[type].normalMap = callLoadTexture(textureParameters[type], "NormalGL");
    materials[type].needsUpdate = true;
    render();
}

// Updates the uniforms for each material according to the selected texture
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

    uniforms.bottom.diffuseMap.value = textures.bottom.diffuseMap;
    uniforms.bottom.roughnessMap.value = textures.bottom.roughnessMap;
    uniforms.bottom.normalMap.value = textures.bottom.normalMap;

    if (textureParameters.bottom.includes("Metal")) {
        uniforms.bottom.metalnessMap.value = textures.bottom.metalnessMap;
        uniforms.bottom.envMap.value = textures.bottom.envMap;
    }
}

// Updates the fragment shader for each material according to the selected texture
function updateFragmentShaders() {
    materials.pillow_1.fragmentShader = getFragment(textureParameters.pillow_1);
    materials.pillow_2.fragmentShader = getFragment(textureParameters.pillow_2);
    materials.lateral.fragmentShader = getFragment(textureParameters.lateral);
    materials.bottom.fragmentShader = getFragment(textureParameters.bottom);
}

// Bind the right fragment shader to the given name
function getFragment(material) {
    if (material.includes('Fabric'))
        return fs_cloth;
    else if(material.includes('Metal'))
        return fs_metal;
    else if(material.includes('Wood'))
        return fs_wood;
    else
        return fs_leather;
}

// Maps a price for each selection
let mapPrices = {
    "Fabric009": 209.0,
    "Fabric008": 229.0,
    "Fabric042": 269.0,
    "Fabric036": 249.0,
    "Leather009": 329.0,
    "Leather011": 369.0,
    "MetalPlates006": 419.0,
    "Wood070": 399.0
};

// Default configuration
let configuration = ["Fabric009", "Fabric008", "Fabric008", "MetalPlates006"];

// Calculates the price according to the current configuration
function computePrice(){
    let price = 0.0;
    configuration.forEach((el) => {
        price += mapPrices[el];
    })
    return price;
}

/*
    Even listener for each select element in the HTML.
    The selection passes, as value, the new name of the selected texture.
    The selection updates the texture in textureParameters and then calls
    the texture loader. The price is updated respectively.

    The render calls updateMaterials() and updateUniforms() so the shaders
    and their uniforms are updated consequently.
*/
document.querySelectorAll('.form-select').forEach(selectElement => {
        document.querySelector("#price").innerHTML = computePrice() + 0.99;
        selectElement.addEventListener('change', (event) => {
            if (selectElement.id === "1") {
                textureParameters.pillow_1 = event.target.value;
                configuration[0] = event.target.value;
                loadNewTexture('pillow_1');
            } else if (selectElement.id === "2") {
                textureParameters.pillow_2 = event.target.value;
                configuration[1] = event.target.value;
                loadNewTexture('pillow_2');
            } else if (selectElement.id === "3"){
                textureParameters.lateral = event.target.value;
                configuration[2] = event.target.value;
                loadNewTexture('lateral');
            } else{
                textureParameters.bottom = event.target.value;
                configuration[3] = event.target.value;
                loadNewTexture('bottom');
            }
            document.querySelector("#price").innerHTML = computePrice() + 0.99;
        });
    }
);

animate()
