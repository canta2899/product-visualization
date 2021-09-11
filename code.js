import './libs/BufferGeometryUtils.js';
import './libs/BufferGeometryToIndexed.js';
let gui, vs, fs;

vs = document.getElementById("vertex").textContent;
fs = document.getElementById("fragment").textContent;

const scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 100);
camera.position.set(0, 0, 7);
camera.lookAt(0, 0, 0);


var canvas = document.querySelector("canvas")
const renderer = new THREE.WebGLRenderer({canvas})
renderer.setSize(window.innerWidth, window.innerHeight)

let textureParameters = {
    material_1: "Fabric008",
    material_2: "Fabric009",
    repeatS: 2.0,
    repeatT: 2.0,
    normalScale: 3,
    roughness: 1
}

let diffuseMap_1 = loadTexture("materials/" + textureParameters.material_1 + "/" + textureParameters.material_1 + "_1K_Color.png");
let specularMap_1 = loadTexture("materials/" + textureParameters.material_1 + "/" + textureParameters.material_1 + "_1K_Specular.png");
let roughnessMap_1 = loadTexture("materials/" + textureParameters.material_1 + "/" + textureParameters.material_1 + "_1K_Roughness.png");
let normalMap_1 = loadTexture("materials/" + textureParameters.material_1 + "/" + textureParameters.material_1 + "_1K_NormalGL.png");

let diffuseMap_2 = loadTexture("materials/" + textureParameters.material_2 + "/" + textureParameters.material_2 + "_1K_Color.png");
let specularMap_2 = loadTexture("materials/" + textureParameters.material_2 + "/" + textureParameters.material_2 + "_1K_Specular.png");
let roughnessMap_2 = loadTexture("materials/" + textureParameters.material_2 + "/" + textureParameters.material_2 + "_1K_Roughness.png");
let normalMap_2 = loadTexture("materials/" + textureParameters.material_2 + "/" + textureParameters.material_2 + "_1K_NormalGL.png");

let loader = new THREE.CubeTextureLoader().setPath('./cubemap/');

let textureCube = loader.load([
    'px.png', 'nx.png',
    'py.png', 'ny.png',
    'pz.png', 'nz.png'
]);

scene.background = textureCube;
textureCube.minFilter = THREE.LinearMipMapLinearFilter;
// lights

let materialExtensions = {
    shaderTextureLOD: true // set to use shader texture LOD
};

var lightParameters = {
    red: 1.0,
    green: 1.0,
    blue: 1.0,
    intensity: 1,
}

let uniforms_1 = {
    normalScale: {type: "v2", value: new THREE.Vector2(1, 1)},
    envMap: {type: "t", value: textureCube},
    textureRepeat: {type: "v2", value: new THREE.Vector2(1, 1)},
    normalMap: {type: "t", value: normalMap_1},
    specularMap: {type: "t", value: specularMap_1},
    diffuseMap: {type: "t", value: diffuseMap_1},
    roughnessMap: {type: "t", value: roughnessMap_1},
    pointLightPosition: {type: "v3", value: new THREE.Vector3()},
    clight: {type: "v3", value: new THREE.Vector3()}
};

let material_1 = new THREE.ShaderMaterial({
    uniforms: uniforms_1,
    vertexShader: vs,
    fragmentShader: fs,
    extensions: materialExtensions
});

let uniforms_2 = {
    normalScale: {type: "v2", value: new THREE.Vector2(1, 1)},
    envMap: {type: "t", value: textureCube},
    textureRepeat: {type: "v2", value: new THREE.Vector2(1, 1)},
    normalMap: {type: "t", value: normalMap_2},
    specularMap: {type: "t", value: specularMap_2},
    diffuseMap: {type: "t", value: diffuseMap_2},
    roughnessMap: {type: "t", value: roughnessMap_2},
    pointLightPosition: {type: "v3", value: new THREE.Vector3()},
    clight: {type: "v3", value: new THREE.Vector3()}
};

let material_2 = new THREE.ShaderMaterial({
    uniforms: uniforms_2,
    vertexShader: vs,
    fragmentShader: fs,
    extensions: materialExtensions
});
uniforms_1.pointLightPosition.value = new THREE.Vector3(7.0, 7.0, 7.0);
uniforms_2.pointLightPosition.value = new THREE.Vector3(7.0, 7.0, 7.0);


const objLoader = new THREE.OBJLoader()
objLoader.load(
    'obj/couch.obj',
    object => {
        for(let i = 0; i < 12; i++) {
            let part = object.children[i]
            let geometry = part.geometry.toIndexed()
            let mesh
            if(i % 2 === 0)
                mesh = new THREE.Mesh(geometry, material_2);
            else
                mesh = new THREE.Mesh(geometry, material_1);
            THREE.BufferGeometryUtils.computeTangents(geometry);
            scene.add(mesh);
        }
    },
    xhr =>{
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
//     textureSettings.add(textureParameters, 'material_1', ['Fabric008', 'Fabric009']).onChange(
//         function (material) {
//             diffuseMap_1 = loadTexture("materials/" + material + "/" + material + "_1K_Color.png");
//             specularMap_1 = loadTexture("materials/" + material + "/" + material + "_1K_Specular.png");
//             roughnessMap_1 = loadTexture("materials/" + material + "/" + material + "_1K_Roughness.png");
//             normalMap_1 = loadTexture("materials/" + material + "/" + material + "_1K_NormalGL.png");
//             material_1.needsUpdate = true;
//             render()
//         });
//     textureSettings.add(textureParameters, 'material_2', ['Fabric008', 'Fabric009']).onChange(
//         function (material) {
//             diffuseMap_2 = loadTexture("materials/" + material + "/" + material + "_1K_Color.png");
//             specularMap_2 = loadTexture("materials/" + material + "/" + material + "_1K_Specular.png");
//             roughnessMap_2 = loadTexture("materials/" + material + "/" + material + "_1K_Roughness.png");
//             normalMap_2 = loadTexture("materials/" + material + "/" + material + "_1K_NormalGL.png");
//             material_2.needsUpdate = true;
//             render()
//         });
// }

function updateUniforms() {
    let lightValues = new THREE.Vector3(
        lightParameters.red * lightParameters.intensity,
        lightParameters.green * lightParameters.intensity,
        lightParameters.blue * lightParameters.intensity
    );

    let repeat = new THREE.Vector2( textureParameters.repeatS, textureParameters.repeatT);

    uniforms_1.clight.value = lightValues;
    uniforms_1.textureRepeat.value = repeat;
    uniforms_1.diffuseMap.value = diffuseMap_1;
    uniforms_1.specularMap.value = specularMap_1;
    uniforms_1.roughnessMap.value = roughnessMap_1;
    uniforms_1.normalMap.value = normalMap_1;

    uniforms_2.clight.value = lightValues;
    uniforms_2.textureRepeat.value = repeat;
    uniforms_2.diffuseMap.value = diffuseMap_2;
    uniforms_2.specularMap.value = specularMap_2;
    uniforms_2.roughnessMap.value = roughnessMap_2;
    uniforms_2.normalMap.value = normalMap_2;
}

// buildGui()
animate()