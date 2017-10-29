//Global interface alias
type NativeGamepadEvent = GamepadEvent;
type NativeGamepad = Gamepad;
type NativeGamepadButton = GamepadButton;

import InputDevice from "./InputDevice";

export const enum GamePadEvents {
    ButtonValueChange = "BUTTONVALUECHANGE",
    AxisValueChange = "AXISVALUECHANGE",
    Disconnect = "DISCONNECT"
}

export type GamePadButton = NativeGamepadButton;

export class GamePad extends InputDevice {
    private _pollRate: number = 15;
    private _pollTimer: number;
    private _gamePadID: number;
    private _buttons: Number[] = [];
    private _axes: number[] = [];

    constructor(id: number) {
        super();

        this._gamePadID = id;
        let gamePad: NativeGamepad = navigator.getGamepads()[id];

        //Build an array of buttons & axes for this GamePad
        for (var i = 0; i < gamePad.buttons.length; i++) {
            this._buttons.push(gamePad.buttons[i].value);
        }

        for (var i = 0; i < gamePad.axes.length; i++) {
            this._axes.push(gamePad.axes[i]);
        }

        this._initializePolling();
    }

    public getAxis(index: number): number {
        return this._axes[index];
    }

    public setPollRate(pollRate: number): void {
        this._pollRate = pollRate;
        this._initializePolling();
    }

    private _initializePolling(): void {
        if (this._pollTimer) {
            clearInterval(this._pollTimer);
        }
        this._pollTimer = setInterval(this._poll.bind(this), this._pollRate); 
    }

    private _poll(): void {
        let gamePad: NativeGamepad = navigator.getGamepads()[this._gamePadID];

        //Gamepad no longer exists, it was disconnected
        if (!gamePad) {
            this._disconnect();
            return null;
        }

        //Compare Button Values
        for (var i = 0; i < gamePad.buttons.length; i++) {
            if (gamePad.buttons[i].value != this._buttons[i]) {
                this._buttons[i] = gamePad.buttons[i].value;
                this.emit(GamePadEvents.ButtonValueChange, i, gamePad.buttons[i].value);
            }
        }

        //Compare Axes Values
        for (var i = 0; i < gamePad.axes.length; i++) {
            if (gamePad.axes[i] != this._axes[i]) {
                this._axes[i] = gamePad.axes[i];
                this.emit(GamePadEvents.AxisValueChange, i, gamePad.axes[i]);
            }
        }
    }

    private _disconnect(): void {
        clearInterval(this._pollTimer);
        this.emit(GamePadEvents.Disconnect, this);
    }
}