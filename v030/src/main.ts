import "./styles/main.css";
import { AppController } from "./app/AppController";
import { SaveRepository } from "./services/SaveRepository";

const root = document.querySelector<HTMLElement>("#app");
if (!root) throw new Error("アプリのroot要素が見つかりません。");

const repository = new SaveRepository(window.localStorage);
const loaded = repository.load();
new AppController(root, repository, loaded);
