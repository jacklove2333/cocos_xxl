import { _decorator, Component } from 'cc';
const { ccclass, property } = _decorator;

import { eventManager } from "./EventManger";
import MapDialog from "./MapDialog";

@ccclass('LineItem')
export default class LineItem extends Component {
    private index: number = 0;
    public setInfo(index: number) {
        this.index = index;
    }
    private onClickAdd() {
        eventManager.dispatch('click_mapCard', [this.index, MapDialog.nSelect])
    }
}



