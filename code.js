import {RGBELoader} from './libs/RGBELoader.js';
import {LightProbeGenerator} from "./libs/LightProbeGenerator.js";

let gui, textureParams, vs, fs, lightProbeEnv;

vs = document.getElementById("vertex").textContent;
fs = document.getElementById("fragment").textContent;

const scene = new THREE.Scene();

let camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 100);
camera.position.set(0, 0, 5);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

let textureParameters = {
    material: "Wood",
    repeatS: 1.0,
    repeatT: 1.0
}

let lightParameters = {
    red: 1.0,
    green: 1.0,
    blue: 1.0,
    intensity: 1.0,
}

let diffuseMap = loadTexture("materials/" + textureParameters.material + "/" + textureParameters.material + "_Color.jpg");
let specularMap = loadTexture("materials/" + textureParameters.material + "/" + textureParameters.material + "_Specular.jpg");
let roughnessMap = loadTexture("materials/" + textureParameters.material + "/" + textureParameters.material + "_Roughness.jpg");

new RGBELoader()
    .load('studio_country_hall_1k.hdr', texture => {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        scene.background = texture;
        scene.environment = texture;
        lightProbeEnv = new LightProbeGenerator.fromCubeTexture(texture)
        render()
    });

// lights


let uniforms = {
    specularMap: { type: "t", value: specularMap},
    diffuseMap:	{ type: "t", value: diffuseMap},
    roughnessMap:	{ type: "t", value: roughnessMap},
    pointLightPosition:	{ type: "v3", value: new THREE.Vector3() },
    clight:	{ type: "v3", value: new THREE.Vector3() },
    textureRepeat: { type: "v2", value: new THREE.Vector2(1,1) }
};

let lightMesh = new THREE.Mesh( new THREE.SphereGeometry( 1, 16, 16),
    new THREE.MeshBasicMaterial ({color: 0xffff00, wireframe:true}));
lightMesh.position.set( 7.0, 7.0, 7.0 );
uniforms.pointLightPosition.value = new THREE.Vector3(
    lightMesh.position.x,
    lightMesh.position.y,
    lightMesh.position.z
);



let ourMaterial = new THREE.ShaderMaterial({ uniforms: uniforms, vertexShader: vs, fragmentShader: fs});
const objLoader = new THREE.OBJLoader()
objLoader.load(
    'obj/wineglasses.obj',
    function (object) {
        let glass = object.children[1]
        glass.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.material = ourMaterial
            }
        });
        glass.geometry.center();
        scene.add(glass);
    },
    function (xhr) {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    function (error) {
        console.log('An error happened');
    }
);

const controls = new THREE.OrbitControls(camera, renderer.domElement)
controls.enableDamping = true

window.addEventListener('resize', onWindowResize, false)

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    render()
}

const stats = Stats()
document.body.appendChild(stats.dom)

function animate() {
    requestAnimationFrame(animate)
    buildGui()
    controls.update()
    render()
    stats.update()
}

function render() {
    updateUniforms();
    renderer.render(scene, camera)
}

function loadTexture(file) {
    let texture = new THREE.TextureLoader().load(file, texture => {
        // Fare qualcosa
        render();
    })
    return texture;
}

function clearGui() {
    if (gui) gui.destroy();
    gui = new dat.GUI();
    gui.open();
}

function buildGui() {
    clearGui();
    let textureSettings = gui.addFolder('Texture parameters');
    textureSettings.add(textureParameters, 'material', ['Wood', 'Metal', 'Plastic']).onChange(
        function (material) {
            diffuseMap = loadTexture("materials/" + material + "/" + material + "_Color.jpg");
            specularMap = loadTexture("materials/" + material + "/" + material + "_Specular.jpg");
            roughnessMap = loadTexture("materials/" + material + "/" + material + "_Roughness.jpg");
            ourMaterial.needsUpdate = true;
            render()
        });
}

function updateUniforms() {
    uniforms.clight.value = new THREE.Vector3(
        lightParameters.red * lightParameters.intensity,
        lightParameters.green * lightParameters.intensity,
        lightParameters.blue * lightParameters.intensity
    );
    uniforms.textureRepeat.value = new THREE.Vector2( textureParameters.repeatS, textureParameters.repeatT);
    uniforms.diffuseMap.value = diffuseMap;
    uniforms.specularMap.value = specularMap;
    uniforms.roughnessMap.value = roughnessMap;
}

animate()