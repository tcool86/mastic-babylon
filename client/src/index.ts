import { MasticRoom } from "./room";

import * as BABYLON from "babylonjs";
import 'babylonjs-loaders';

import { client } from "./game/network";

// Re-using server-side types for networking
// This is optional, but highly recommended
import { StateHandler } from "../../server/src/rooms/StateHandler";

const canvas = document.getElementById('game') as HTMLCanvasElement;
const engine = new BABYLON.Engine(canvas, true);

// This creates a basic Babylon Scene object (non-mesh)
let scene = new BABYLON.Scene(engine);

// This creates and positions a free camera (non-mesh)
let camera = new BABYLON.FollowCamera(
	"camera1",
	new BABYLON.Vector3(0, 5, -10),
	scene
);

// This targets the camera to scene origin
camera.setTarget(BABYLON.Vector3.Zero());

// This attaches the camera to the canvas
camera.attachControl(true);

let light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
light.intensity = 0.7;

// Our built-in 'ground' shape. Params: name, width, depth, subdivs, scene
const ground = BABYLON.Mesh.CreateGround("ground1", 6, 6, 2, scene);

// Colyseus / Join Room
client.joinOrCreate<StateHandler>("game").then(room => {
	const masticRoom = new MasticRoom(
		room,
		scene,
		camera
	);

	// Resize the engine on window resize
	window.addEventListener('resize', function () {
		engine.resize();
	});
});

// Scene render loop
engine.runRenderLoop(function () {
	scene.render();
});
