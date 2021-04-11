import * as BABYLON from "babylonjs";
import { PressedKeys } from "../../../server/src/entities/Player";
import Keycode from "keycode.js";

export class CharacterBuilder {
	character?: Promise<any>;

	constructor(scene: BABYLON.Scene) {
		let character = null;
		const promise = new Promise((resolve, reject) => {
			BABYLON.SceneLoader.ImportMesh(
				["ObjObject"],
				'src/assets/',
				"character-game-test.gltf",
				scene,
				function (meshes, particleSystems, skeletons) {
					character = meshes[0] as BABYLON.Mesh;
					character.scaling = new BABYLON.Vector3(0.2, 0.2, 0.2);
					resolve(character);
				}
			);
		});
		this.character = promise;
	}
}


export class MasticRoom {
	scene: BABYLON.Scene;

	room: any;

	camera: BABYLON.FollowCamera;

	playerViews: Map<string, BABYLON.Mesh>;

	constructor(
		room: any,
		scene: BABYLON.Scene,
		camera: BABYLON.FollowCamera
	) {
		this.room = room;
		this.scene = scene;
		this.camera = camera;
		this.room.state.players.onAdd = this.playerOnAdd;
		this.room.state.players.onRemove = this.playerOnRemove;

		// Move keyboard input when creating gamepad input
		const self = this;
		const keyboard: PressedKeys = { x: 0, y: 0 };
		window.addEventListener("keydown", function (e) {
			console.log(e);
			if (e.which === Keycode.LEFT) {
				keyboard.x = -1;
			} else if (e.which === Keycode.RIGHT) {
				keyboard.x = 1;
			} else if (e.which === Keycode.UP) {
				keyboard.y = -1;
			} else if (e.which === Keycode.DOWN) {
				keyboard.y = 1;
			}
			self.room.send('key', keyboard);
		});

		window.addEventListener("keyup", function (e) {
			console.log(e);
			if (e.which === Keycode.LEFT) {
				keyboard.x = 0;
			} else if (e.which === Keycode.RIGHT) {
				keyboard.x = 0;
			} else if (e.which === Keycode.UP) {
				keyboard.y = 0;
			} else if (e.which === Keycode.DOWN) {
				keyboard.y = 0;
			}
			self.room.send('key', keyboard);
		});
	}

	async playerOnAdd(player, key) {
		let characterBuilder = new CharacterBuilder(this.scene);
		const testCharacter = await characterBuilder.character;
		if (!this.playerViews) {
			this.playerViews = new Map();
		}
		this.playerViews.set(key, testCharacter.clone());
		this.playerViews.get(key).position.set(
			player.position.x,
			player.position.y,
			player.position.z
		);

		player.position.onChange = () => {
			this.playerViews.get(key).position.set(
				player.position.x,
				player.position.y,
				player.position.z
			);
		};

		// Set camera to follow current player
		if (key === this.room.sessionId) {
			this.camera.setTarget(this.playerViews.get(key).position);
		}

		this.room.onStateChange((state) => {
			this.stateChange(state);
		});
	}

	playerOnRemove(player: any, key: any) {
		this.scene.removeMesh(this.playerViews.get(key));
		this.playerViews.delete(key);
	}

	stateChange(state) {
		console.log("New room state:", state.toJSON());
	}
}