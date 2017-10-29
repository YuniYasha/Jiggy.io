import Engine from "../../src/Engine";
import {TwoDimensionalRenderingEngine, GroupLogicEngine} from "../../src/engines/";
import {HTML5AudioEngine} from "../../src/audio/";
import {Entity, GridMap} from "../../src/entities/";
import {Iterator, Camera} from "../../src/utils/";
// import {InputManager, ControllerType, InputEvent, KeyboardEventDetail, KeyCode} from '../../src/inputs/';
import {keyboard, KeyboardEvents, KeyDown, KeyUp, KeyboardKeys} from "../../src/inputs/Keyboard";
import { mouse, MouseEvents, MouseMoveEvent, MouseClickEvent, ScrollWheelMove} from "../../src/inputs/Mouse";
import {Animation, TextAssetBuilder, Spritesheet, Asset, AssetType, AssetFactory, AssetState} from "../../src/assets/";
import Character from "./Character";
import { EntityEventTypes, LocationUpdateEvent } from "../../src/entities/";
import { InputManager, InputManagerEvents } from "../../src/inputs/InputManager";
import { GamePad, GamePadEvents} from "../../src/inputs/GamePad";

class PalletDemo extends Engine {
	private _mapSpritesheet : Spritesheet;
	private _bgMusic : Asset;
	private _characterSpritesheet : Spritesheet;
    public player: Character;
    private _mainCamera: Camera;
    private _direction : String = "";

	constructor () {
		super();
		this.viewPort.size = ({width: 500, height: 500});
		this.renderingEngine = new TwoDimensionalRenderingEngine();
		this.audioEngine = new HTML5AudioEngine();
		this.logicEngine = new GroupLogicEngine();

		this.renderingEngine.HUDEntity = (this._createLoadingScreen());
		this._loadResources();
	}

	private _createLoadingScreen () : Entity {
		var textAssetBuilder : TextAssetBuilder = new TextAssetBuilder();

		var hud : Entity = new Entity();
		hud.width = 500;
		hud.height = 500;

		var loadingText : Entity = new Entity();
		loadingText.width = 165;
		loadingText.height = 50;
		loadingText.x = (500 / 2) - 100;
		loadingText.y = (500 / 2) - 25;
		hud.addChild(loadingText);

		var loading0 = textAssetBuilder.build("35px Georgia", "Loading", 165, 50, "black");
		var loading1 = textAssetBuilder.build("35px Georgia", "Loading.", 165, 50, "black");
		var loading2 = textAssetBuilder.build("35px Georgia", "Loading..", 165, 50, "black");
		var loading3 = textAssetBuilder.build("35px Georgia", "Loading...", 165, 50, "black");

		var loadingAnim : Animation = new Animation(loadingText, [
			{'asset': loading0,'delay': 250},
			{'asset': loading1, 'delay': 250},
			{'asset': loading2, 'delay': 250},
			{'asset': loading3, 'delay': 250}
		]);

		loadingAnim.start();


		return hud;
	}

	private _createMainMap () : Entity {
		var mapContainer : Entity = new Entity();

		var layer1 : GridMap = new GridMap({width: 16, height: 16}, {x: 50, y: 50});
		var layer2 : GridMap = new GridMap({width: 16, height: 16}, {x: 50, y: 50});
		var layer3 : GridMap = new GridMap({width: 16, height: 16}, {x: 50, y: 50});

		mapContainer.width = layer1.width;
		mapContainer.height = layer1.height;

		mapContainer.addChild(layer1);		
		mapContainer.addChild(layer2);		
		mapContainer.addChild(layer3);

		//TODO: Framework Level Data Driven Map Generation

		//Set Grass Trails & Background Tiles
		var layer1Iterator : Iterator = layer1.iterator();
		while(layer1Iterator.hasNext()) {
			var tile : Entity = layer1Iterator.next();
			tile.texture = (this._mapSpritesheet.getSprite('grass'));
		}

		layer3.getTile({x:10, y: 10}).texture = this._mapSpritesheet.getSprite('house_1_roof_11');
		layer3.getTile({x:11, y: 10}).texture = this._mapSpritesheet.getSprite('house_1_roof_12');
		layer3.getTile({x:12, y: 10}).texture = this._mapSpritesheet.getSprite('house_1_roof_13');

		layer2.getTile({x:10, y: 11}).texture = this._mapSpritesheet.getSprite('house_1_roof_21');
		layer2.getTile({x:11, y: 11}).texture = this._mapSpritesheet.getSprite('house_1_roof_22');
		layer2.getTile({x:12, y: 11}).texture = this._mapSpritesheet.getSprite('house_1_roof_23');

		layer2.getTile({x:10, y: 11}).collisionable = true;
		layer2.getTile({x:11, y: 11}).collisionable = true;
		layer2.getTile({x:12, y: 11}).collisionable = true;

		layer2.getTile({x:10, y: 12}).texture = this._mapSpritesheet.getSprite('house_1_roof_31');
		layer2.getTile({x:11, y: 12}).texture = this._mapSpritesheet.getSprite('house_1_roof_32');
		layer2.getTile({x:12, y: 12}).texture = this._mapSpritesheet.getSprite('house_1_roof_33');

		layer2.getTile({x:10, y: 12}).collisionable = true;
		layer2.getTile({x:11, y: 12}).collisionable = true;
		layer2.getTile({x:12, y: 12}).collisionable = true;

		layer2.getTile({x:10, y: 13}).texture = this._mapSpritesheet.getSprite('house_1_roof_41');
		layer2.getTile({x:11, y: 13}).texture = this._mapSpritesheet.getSprite('house_1_roof_42');
		layer2.getTile({x:12, y: 13}).texture = this._mapSpritesheet.getSprite('house_1_roof_43');

		layer2.getTile({x:10, y: 13}).collisionable = true;
		layer2.getTile({x:11, y: 13}).collisionable = true;
		layer2.getTile({x:12, y: 13}).collisionable = true;

		return mapContainer;
	}

	private _loadResources () : void {
		this._loadMapSpritesheet();
		this._loadBackgroundMusic();
		this._loadCharacterSpritesheet();
	}

	private _resourceLoaded () : void {
		if (this._mapSpritesheet && this._bgMusic && this._characterSpritesheet) {
			console.log("Resources all loaded");

			//Artifical Delay to show loading animation
			setTimeout(() => {
				//Remove Loading Screen
				delete this.renderingEngine.HUDEntity;

				//TODO: Stop Loading Animation

				//Load Map
				var map = this._createMainMap();
                var camera = new Camera(map, null, { width: 250, height: 250 }, null, { width: 500, height: 500 });
                this._mainCamera = camera;
				this.renderingEngine.addCamera(camera);

				mouse.on(MouseEvents.ScrollWheelMove, (e: ScrollWheelMove) => {
					// console.warn(e);
					var fov = camera.fov;
					var viewPoint = camera.viewPoint;
					if (e.yDelta > 0) {
						//Mouse wheel went up, zoom in by decreasing FOV
						camera.viewPoint = ({x: viewPoint.x + 5, y: viewPoint.y + 5});
						camera.fov = ({width: fov.width - 10, height: fov.height - 10});
					} else {
						//Zoom out
						camera.viewPoint = ({x: viewPoint.x - 5, y: viewPoint.y - 5});
						camera.fov = ({width: fov.width + 10, height: fov.height + 10});
					}
                });

				//Load Character
				this.player = new Character(this._characterSpritesheet);
				this.player.texture = this._characterSpritesheet.getSprite("player_down");
				let layer = <GridMap> map.getChildAt(1);	
				let tile = layer.getTile({x: 5, y: 5})
				layer.addChild(this.player);
				this.player.tileX = 5;
				this.player.tileY = 5;
				this.player.x = tile.x;
				this.player.y = tile.y - this.player.height - tile.height;

				var pokeball = new Entity();
				pokeball.width = 25;
				pokeball.height = 25;
				// layer.addChild(pokeball);
				var pokeball_asset : Asset = AssetFactory.getSingleton().build(AssetType.IMAGE,  'Resources/pokeball.png');

				pokeball_asset.onStateChange = (state : AssetState) => {
					if (state === AssetState.LOADED) {
						pokeball.texture = pokeball_asset;
						this.renderingEngine.HUDEntity = pokeball;
					}
				};

				pokeball_asset.load();


				mouse.on(MouseEvents.MouseMove, (e: MouseMoveEvent) => {
					pokeball.x = e.x - this.renderingEngine.viewPort.canvas.offsetLeft - 14;
					pokeball.y = e.y - this.renderingEngine.viewPort.canvas.offsetTop - 14;
                });

                mouse.on(MouseEvents.LeftButtonDown, (e: MouseClickEvent) => {
                    var newPokeball = new Entity();
                    console.log(e);
                    console.log(camera);
                    var x_fov = camera.fov.width / camera.renderDimension.width;
                    var y_fov = camera.fov.height / camera.renderDimension.height;
                    newPokeball.width = 25 * x_fov;
                    newPokeball.height = 25 * y_fov;
                    //23 is a magic number, this demo seems to be rendering at an offset...
                    newPokeball.x = camera.viewPoint.x + ((e.x * x_fov) - (23 * x_fov));
                    newPokeball.y = camera.viewPoint.y + ((e.y * y_fov) - (23 * y_fov));
                    newPokeball.texture = pokeball_asset;
                    layer.addChild(newPokeball);
                });

                mouse.on(MouseEvents.RightButtonDown, (e: MouseClickEvent) => {
                    alert("YOU SHALL NOT PASS");
                });

				this.player.on(EntityEventTypes.LOCATION_UPDATE.toString(), () => {
					var fov = camera.fov;
					camera.viewPoint = {x: this.player.x + ((this.player.width - fov.width) / 2), y: this.player.y + ((this.player.height - fov.height) / 2)};
				});

				//Load NPC's

				//Play Background Music
				this.audioEngine.addAudio('bg', this._bgMusic);
				this.audioEngine.loopAudio('bg', true);
				this.audioEngine.playAudio('bg');

				//Enable Input
				//Add Inputs to move Character around

				//var direction: string = null;
				this.logicEngine.addLogic('moveLogic', () => {
					switch(this._direction) {
						case 'left':
							this.player.moveLeft();
							break;
						case 'up':
							this.player.moveUp();
							break;
						case 'down':
							this.player.moveDown();
							break;
						case 'right':
							this.player.moveRight();
							break;
					}
                }, 1);

                this.logicEngine.addLogic('pokeballLogic', () => {
                    if (mouse.isLeftButtonClicked()) {
                        var newPokeball = new Entity();
                        var x_fov = camera.fov.width / camera.renderDimension.width;
                        var y_fov = camera.fov.height / camera.renderDimension.height;
                        newPokeball.width = 25 * x_fov;
                        newPokeball.height = 25 * y_fov;
                        var mouseCoordinates = mouse.getCurrentCoordinates();
                        //23 is a magic number, this demo seems to be rendering at an offset...
                        newPokeball.x = camera.viewPoint.x + ((mouseCoordinates.x * x_fov) - (23 * x_fov));
                        newPokeball.y = camera.viewPoint.y + ((mouseCoordinates.y * y_fov) - (23 * y_fov));
                        newPokeball.texture = pokeball_asset;
                        layer.addChild(newPokeball);
                    }
                }, 50);

                let inputManager : InputManager = InputManager.getInstance();
                if (inputManager.hasGamePads()) {
                    //Grab First GamePad
                    console.log("GamePadConnected");
                    var gamePads: GamePad[] = inputManager.getGamePads();
                    gamePads.forEach((gamePad: GamePad) => {
                        this.attachGamepad(gamePad);
                    });
                }

                //Listen for GamePad Connections
                inputManager.on(InputManagerEvents.GamePadAdded, (gamePad: GamePad) => {
                    console.log("GamePadConnected");
                    this.attachGamepad(gamePad);
                });


                //Global GamePad Disconnect event
                inputManager.on(InputManagerEvents.GamePadRemoved, (gamePad: GamePad) => {
                    console.log("GameaPad Disconnected");
                });

				keyboard.on(KeyboardEvents.KeyDown, (e: KeyDown) => {
					switch(e.key) {
						case KeyboardKeys.W:
							this._direction = 'up';
							break;
						case KeyboardKeys.A:
							this._direction = "left";
							break;
						case KeyboardKeys.S:
							this._direction = "down"
							break;
						case KeyboardKeys.D:
							this._direction = "right";
							break;
					}
				});

				keyboard.on(KeyboardEvents.KeyUp, (e: KeyUp) => {
					switch(e.key) {
						case KeyboardKeys.W:
						case KeyboardKeys.A:
						case KeyboardKeys.S:
						case KeyboardKeys.D:
							this._direction = null;
							break;
					}
				});
			}, 1000);			
		}
    }

    private attachGamepad(gamePad: GamePad): void {
        gamePad.on(GamePadEvents.AxisValueChange, (axisId: number, newValue: number) => {
            //console.log("Updating controller movement", gamePad.getAxis(0), gamePad.getAxis(1), axisId, newValue);
            if (gamePad.getAxis(0) < -.1 || gamePad.getAxis(0) > .1) {
                this.player.x += Math.floor(gamePad.getAxis(0) * 10);
            }

            if (gamePad.getAxis(1) < -.1 || gamePad.getAxis(1) > .1) {
                this.player.y += Math.floor(gamePad.getAxis(1) * 10);
            }

            if (gamePad.getAxis(2) < -.1 || gamePad.getAxis(2) > .1) {
                this._mainCamera.viewPoint.x += Math.floor(gamePad.getAxis(2) * 10);
            }

            if (gamePad.getAxis(3) < -.1 || gamePad.getAxis(3) > .1) {
                this._mainCamera.viewPoint.y += Math.floor(gamePad.getAxis(3) * 10);
            }
        });

        gamePad.on(GamePadEvents.ButtonValueChange, (buttonId: number, newValue: number) => {
            console.log(buttonId);
            console.log(newValue);
            if (buttonId === 12) {
                if (newValue === 0 && this._direction === "up") {
                    this._direction = "";
                } else {
                    this._direction = "up";
                }
            }

            if (buttonId === 13) {
                if (newValue === 0 && this._direction === "down") {
                    this._direction = "";
                } else {
                    this._direction = "down";
                }
            }

            if (buttonId === 14) {
                if (newValue === 0 && this._direction === "left") {
                    this._direction = "";
                } else {
                    this._direction = "left";
                }
            }

            if (buttonId === 15) {
                if (newValue === 0 && this._direction === "right") {
                    this._direction = "";
                } else {
                    this._direction = "right";
                }
            }
        });
    }

    private detachGamePad(gamepad: GamePad): void {
        //Don't need to do anything really...Destroy the anon func maybe for performance...
    }

	private _loadMapSpritesheet () : void {
		var map_asset : Asset = AssetFactory.getSingleton().build(AssetType.IMAGE,  'Resources/61816.png');

		map_asset.onStateChange = (state : AssetState) => {
			if (state === AssetState.LOADED) {
				this._mapSpritesheet =  new Spritesheet(map_asset, 
				{
				"grass": {
					x: 16,
					y: 0,
					width: 16,
					height: 16
				},
				"house_1_roof_11": {
					x: 0,
					y: 16,
					width: 16,
					height: 16
				},
				"house_1_roof_12": {
					x: 16,
					y: 16,
					width: 16,
					height: 16
				},
				"house_1_roof_13": {
					x: 32,
					y: 16,
					width: 16,
					height: 16
				},
				"house_1_roof_21": {
					x: 0,
					y: 32,
					width: 16,
					height: 16
				},
				"house_1_roof_22": {
					x: 16,
					y: 32,
					width: 16,
					height: 16
				},
				"house_1_roof_23": {
					x: 32,
					y: 32,
					width: 16,
					height: 16
				},
				"house_1_roof_31": {
					x: 0,
					y: 48,
					width: 16,
					height: 16
				},
				"house_1_roof_32": {
					x: 16,
					y: 48,
					width: 16,
					height: 16
				},
				"house_1_roof_33": {
					x: 32,
					y: 48,
					width: 16,
					height: 16
				},
				"house_1_roof_41": {
					x: 0,
					y: 64,
					width: 16,
					height: 16
				},
				"house_1_roof_42": {
					x: 16,
					y: 64,
					width: 16,
					height: 16
				},
				"house_1_roof_43": {
					x: 32,
					y: 64,
					width: 16,
					height: 16
				}});
				this._resourceLoaded();
			}
		}

		map_asset.load();
	}

	private _loadCharacterSpritesheet () : void {
		var character_spritesheet : Asset = AssetFactory.getSingleton().build(AssetType.IMAGE, 'Resources/3698.png');

		character_spritesheet.onStateChange = (state : AssetState) => {
			if (state === AssetState.LOADED) {
				this._characterSpritesheet = new Spritesheet(character_spritesheet, {
				"player_up": {x: 21, y: 10, width: 14, height: 20},
				"player_up_step1": {x: 66, y: 10, width: 14, height: 20},
				"player_up_step2": {x: 66, y: 10, width: 14, height: 20, "flipX": true},
				"player_left": {x: 36, y: 10, width: 14, height: 20},
				"player_left_step1": {x: 81, y: 10, width: 14, height: 20},
				"player_left_step2": {x: 95, y: 10, width: 14, height: 20},
				"player_right": {x: 36, y: 10, width: 14, height: 20, "flipX": true},
				"player_right_step1": {x: 81, y: 10, width: 14, height: 20, "flipX": true},
				"player_right_step2": {x: 95, y: 10, width: 14, height: 20, "flipX": true},
				"player_down": {x: 6, y: 10, width: 14, height: 20},
				"player_down_step1": {x: 51, y: 10, width: 14, height: 20},
				"player_down_step2": {x: 51, y: 10, width: 14, height: 20, "flipX": true}
				});

				this._resourceLoaded();
			}
		}

		character_spritesheet.load();
	}

	private _loadBackgroundMusic () : void {
		var bg_music : Asset = AssetFactory.getSingleton().build(AssetType.AUDIO,  'Resources/music.mp3');

		bg_music.onStateChange = (state: AssetState) => {
			if (state === AssetState.LOADED) {
				this._bgMusic  = bg_music;
				this._resourceLoaded();
			}
		}

		bg_music.load();
	}
}

(<any>window)._PalletDemo = new PalletDemo();
