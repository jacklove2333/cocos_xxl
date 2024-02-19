import { _decorator, Component, Prefab, Node, instantiate } from 'cc';
const { ccclass, property } = _decorator;

import { eventManager } from "./EventManger";
import TipsManager from "./TipsManager";
import TipsText from "./TipsText";
import { userconfig } from "./UserConfig";

@ccclass('Menu')
export default class Menu extends Component {
    @property(Prefab)
    private mapDialog: Prefab | null = null;
    @property(Prefab)
    private gameDialog: Prefab | null = null;
    @property(Node)
    private content: Node | null = null;
    @property(Prefab)
    private tipsManager: Prefab | null = null;
    @property(Prefab)
    private tipsDialog: Prefab | null = null;
    onLoad() {
        //获取本地地图数据
        let json = localStorage.getItem('map');
        if (json) {
            userconfig.setMapDateJson(JSON.parse(json))
        }
    }
    start() {
        eventManager.addEvent('tip_text', this.tipsText.bind(this), this);
        eventManager.addEvent('tip_message', this.tipsMessage.bind(this), this);
    }
    onDestroy() {
        eventManager.removeEvents(this);
    }
    //    //提示[string]
    private tipsText(arg: any[]) {
        let item = this.node.getChildByName('TipsText');
        if (!item) {
            item = instantiate(this.tipsDialog);
            this.node.addChild(item)
        }
        item.getComponent(TipsText).setText(arg[0]);
    }
    //    //是否确定[string,callback]
    private tipsMessage(arg: any[]) {
        let item = this.node.getChildByName('TipsManager');
        if (!item) {
            item = instantiate(this.tipsManager);
            this.node.addChild(item)
        }
        if (arg[2]) {
            item.getComponent(TipsManager).hideBtn();
        }
        item.getComponent(TipsManager).setText(arg[0]);
        item.getComponent(TipsManager).setSureClick(this, () => {
            if (arg[1]) {
                arg[1]();
            }
        })
    }
    private onClickGame() {
        if (!userconfig.getMapData()['1']) {
            this.tipsText(['请先编辑关卡']);
            return;
        }
        let item = instantiate(this.gameDialog);
        if (item) {
            this.content.addChild(item);
        }
    }
    private onClickMap() {
        let item = instantiate(this.mapDialog);
        if (item) {
            this.content.addChild(item);
        }
    }
}
