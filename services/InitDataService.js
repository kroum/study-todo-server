import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from 'node:url';

const pathToFile = path.join(path.dirname(fileURLToPath(import.meta.url)), "../_InitData/data.json");
const initData = JSON.parse(fs.readFileSync(pathToFile));

class InitDataService {
    #fullData;
    #users;
    #todoLists;
    #todos;
    constructor(dataJson) {
        this.#fullData = dataJson;
    }

    get users() {
        return this.#fullData.users;
    }
    get todoLists() {
        return this.#fullData.todoLists;
    }
    get todos() {
        return this.#fullData.todos;
    }

}

export default new InitDataService(initData);