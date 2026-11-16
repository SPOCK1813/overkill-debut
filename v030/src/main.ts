import "./styles/main.css";
import { AppController } from "./app/AppController";
import { SaveRepository } from "./services/SaveRepository";
import { GAME_FEEL_PROTOTYPE } from "./services/GameFeelPrototype";

if (GAME_FEEL_PROTOTYPE.enabled) document.documentElement.dataset.gamefeel = "prototype";

const root = document.querySelector<HTMLElement>("#app");
if (!root) throw new Error("アプリのroot要素が見つかりません。");

const repository = new SaveRepository(window.localStorage);
const loaded = repository.load();
new AppController(root, repository, loaded);
