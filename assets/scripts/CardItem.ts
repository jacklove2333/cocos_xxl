import { _decorator, Component, Sprite, SpriteFrame, UITransform, Color } from 'cc';
const { ccclass, property } = _decorator;

import { eventManager } from "./EventManger";

@ccclass('CardItem')
export default class CardItem extends Component {
    @property(Sprite)
    private icon: Sprite | null = null;
    @property(SpriteFrame)
    private arrSprite: SpriteFrame[] = [];
    private bClick: boolean = true;
    private index: number = 0;   //content里的位置
    private idx: number = 0;    //content里的第几项/移出里的第几项
    private gameState: number = 0;   //1地图，2游戏点击，3移出的点击
    private type: number = 0;
    public setInfo(type: number, index?: number, idx?: number, x?: number, y?: number) {
        if (!type) {
            this.icon.spriteFrame = null;
            this.node.active = false;
            return;
        }
        this.node.active = true;
        this.icon.spriteFrame = this.arrSprite[type];
        this.type = type;
        if (index !== undefined) {
            this.index = index;
            this.idx = idx;
            this.node.setPosition(x, y);
        }
    }
    public setBGame(state: number) {
        this.gameState = state;
    }
    public getType() {
        return this.type;
    }
    public setClick(bClick: boolean) {
        this.bClick = bClick;
        this.icon.color = bClick?new Color().fromHEX('#FFFFFF'):new Color().fromHEX('#968989');
    }
    private onClick() {
        if (this.bClick && this.gameState === 2) {
            eventManager.dispatch('game_click_card', [this.idx - 1]);
        } else if (this.gameState === 3) {
            eventManager.dispatch('ydBox_click_card', [this.type]);
            this.node.destroy();
        }
    }
}


