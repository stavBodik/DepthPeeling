import { App } from "./Control/App";

const canvas : HTMLCanvasElement = <HTMLCanvasElement> document.getElementById("gfx-main");

const app = new App(canvas);
app.run();
