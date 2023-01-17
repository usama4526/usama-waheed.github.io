import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import * as dat from 'dat.gui'
import { VertexNormalsHelper } from 'three/examples/jsm/helpers/VertexNormalsHelper'
/**
 * Base
 */
// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Models
 */
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('/draco/')

const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)

const cubeTextureLoader = new THREE.CubeTextureLoader()
const environmentMap = cubeTextureLoader.load([
  'textures/environmentMaps/1/px.jpg',
  'textures/environmentMaps/1/nx.jpg',
  'textures/environmentMaps/1/py.jpg',
  'textures/environmentMaps/1/ny.jpg',
  'textures/environmentMaps/1/pz.jpg',
  'textures/environmentMaps/1/nz.jpg',
])

const textureLoader = new THREE.TextureLoader()
const greenCushionTexture = textureLoader.load(
  '/models/sofa/cushion_textures/green_cushion.png'
)

let mixer = null

gltfLoader.load('/models/walls.glb', (gltf) => {
  gltf.scene.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true
      child.receiveShadow = true
    }
  })
  gltf.scene.rotation.set(0, -1, 0)
  scene.add(gltf.scene)
})

gltfLoader.load('/models/sofa/sofa.gltf', (gltf) => {
  // const cushion = gltf.scene.getObjectByName('Sofa_Cushion')
  gltf.scene.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true
      child.receiveShadow = true
    }
    gltf.scene.rotation.set(0, -1, 0)
    gltf.scene.position.set(9.43, 0, -4.8)
    scene.add(gltf.scene)
  })
  // setTimeout(() => {
  //   cushion.material.map.dispose()
  //   cushion.material.map = greenCushionTexture
  //   cushion.material.needsUpdate = true
  // }, 4000)
})
/**
 * Floor
 */
const floor = new THREE.Mesh(
  new THREE.PlaneBufferGeometry(50, 50),
  new THREE.MeshStandardMaterial({
    color: '#444444',
    metalness: 0,
    roughness: 0.5,
  })
)
floor.receiveShadow = true
floor.rotation.x = -Math.PI * 0.5
// scene.add(floor)

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xfdfbd3, 0.8)
scene.add(ambientLight)
gui
  .add(ambientLight, 'intensity')
  .min(0)
  .max(10)
  .step(0.01)
  .name('Am Intensity')

const directionalLight = new THREE.DirectionalLight(0xfdfbd3, 20)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.bias = 0.0001
directionalLight.shadow.normalBias = 0.1
directionalLight.shadow.camera.far = 35
directionalLight.shadow.camera.left = -15
directionalLight.shadow.camera.top = 7
directionalLight.shadow.camera.right = 7
directionalLight.shadow.camera.bottom = -7

directionalLight.position.set(-18, 2, -5)
// const directionalLightCameraHelper = new THREE.CameraHelper(
//   directionalLight.shadow.camera
// )
// scene.add(directionalLightCameraHelper)
scene.add(directionalLight)

gui.add(directionalLight.position, 'x').min(-100).max(100).step(1)
gui.add(directionalLight.position, 'y').min(-100).max(100).step(1)
gui.add(directionalLight.position, 'z').min(-100).max(100).step(1)
gui
  .add(directionalLight, 'intensity')
  .min(0)
  .max(50)
  .step(0.01)
  .name('DL Intensity')

const pointLight = new THREE.PointLight('#ffffff', 20, 10, 2)
pointLight.position.set(-0.27, 2, -3)
scene.add(pointLight)
gui.add(pointLight.position, 'x').min(-100).max(100).step(0.01)
gui.add(pointLight.position, 'y').min(-100).max(100).step(0.01)
gui.add(pointLight.position, 'z').min(-100).max(100).step(0.01)
/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
}

window.addEventListener('resize', () => {
  // Update sizes
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight

  // Update camera
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  // Update renderer
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
)
camera.position.set(-8, 4, 8)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.target.set(0, 1, 0)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
})

renderer.shadowMap.enabled = true
renderer.physicallyCorrectLights = true
renderer.shadowMap.type = THREE.VSMShadowMap
renderer.outputEncoding = THREE.sRGBEncoding
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

scene.background = environmentMap
/**
 * Animate
 */
const clock = new THREE.Clock()
let previousTime = 0

const tick = () => {
  const elapsedTime = clock.getElapsedTime()
  const deltaTime = elapsedTime - previousTime
  previousTime = elapsedTime

  if (mixer) {
    mixer.update(deltaTime)
  }

  // Update controls
  controls.update()

  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()
