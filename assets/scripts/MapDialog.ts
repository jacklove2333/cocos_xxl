import { _decorator, Component, Label, Node, ToggleContainer, Prefab, instantiate } from 'cc';
const { ccclass, property } = _decorator;

import { eventManager } from "./EventManger";
import { userconfig } from "./UserConfig";
import LineItem from "./LineItem";
import CardItem from "./CardItem";

@ccclass('MapDialog')
export default class MapDialog extends Component {
    @property(Label)
    private title: Label | null = null;
    @property(Node)
    private content: Node | null = null;
    @property(Node)
    private mapContent: Node | null = null;
    @property(ToggleContainer)
    private toggle: ToggleContainer | null = null;
    @property(Prefab)
    private lineItem: Prefab | null = null;
    @property(Prefab)
    private cardItem: Prefab | null = null;
    @property(Label)
    private arrNum: Label[] = [];
    public static nSelect: number = 0;   //0随机
    private map_select: { [key: number]: number } = {};  //图片类型:数量
    private arrMap: number[][] = [];
    private arrType: number[] = [];    //顺序选择的图片
    private bSure: boolean = false;
    private nLevel: number = 1;    //当前关卡
    onLoad() {
        for (let i = 0, len = this.toggle.toggleItems.length; i < len; i++) {
            this.toggle.toggleItems[i].node.on(Node.EventType.TOUCH_END, () => {
                MapDialog.nSelect = i;
            }, this);
        }
        let data = userconfig.getMapData();
        for (let i in data) {
            this.nLevel = Number(i) + 1;
        }
        this.initTitle();
        this.initLine();
    }
    private initTitle() {
        this.title.string = '第' + this.nLevel + '关';
    }
    private initLine() {
        this.mapContent.removeAllChildren();
        for (let i = 0; i < 225; i++) {
            let item = instantiate(this.lineItem);
            if (item) {
                this.mapContent.addChild(item);
                item.getComponent(LineItem).setInfo(i);
            }
        }
    }
    // onDestroy() {
    //     for(let i=0,len=this.toggle.toggleItems.length; i<len; i++){
    //         this.toggle.toggleItems[i].node.off('touchstart');
    //     }
    // }
    //切换关卡编辑
    private otherLevel() {
        this.map_select = {};
        this.arrMap = [];
        this.arrType = [];
        this.bSure = false;
        for (let i = 1; i < this.arrNum.length; i++) {
            this.arrNum[i].string = '0';
        }
        this.clearMap();
    }
    public clearMap() {
        this.content.removeAllChildren();
    }
    private onClickLeft() {
        if (this.nLevel === 1) {
            eventManager.dispatch('tip_text', ['前面没有关卡']);
            return;
        }
        if (this.bSure || !this.content.children.length) {
            this.nLevel--;
            this.initTitle();
            this.otherLevel();
        } else {
            eventManager.dispatch('tip_text', ['请先编辑此关卡']);
        }
    }
    private onClickRight() {
        if (this.bSure) {
            this.nLevel++;
            this.initTitle();
            this.otherLevel();
            return;
        }
        if (!this.content.children.length && userconfig.getMapData()[this.nLevel]) {
            this.nLevel++;
            this.initTitle();
            this.otherLevel();
        } else {
            eventManager.dispatch('tip_text', ['请先编辑此关卡']);
        }
    }
    private onClose() {
        this.node.destroy();
    }
    private onClickCancel() {
        console.log('清空地图布阵');
        if (!this.checkContentMap()) {
            return;
        }
        this.otherLevel();
    }
    private onClickReturn() {
        console.log('清除上一步添加');
        if (!this.checkContentMap()) {
            return;
        }
        let arrReturn = this.arrMap[this.arrMap.length - 1];   //当前去掉的图片及位置
        this.content.removeChild(this.content.children[this.content.children.length - 1]);
        this.arrMap.pop();
        let type = this.arrType[this.arrType.length - 1];
        this.map_select[type]--;
        this.arrNum[type].string = (Number(this.arrNum[type].string) - 1).toString();
        this.arrType.pop();
        this.clickCard(arrReturn[0], arrReturn[1]);
    }
    private onClickSure() {
        if (!this.checkContentMap()) {
            return;
        }
        if (!this.checkMap()) {
            eventManager.dispatch('tip_text', ['阵容非法，数量不是3的倍数,重新选择']);
            return;
        }
        userconfig.setMapData(this.nLevel, this.arrMap);
        this.bSure = true;
        this.onClickRight();
        eventManager.dispatch('tip_text', ['保存成功，已存入本地']);
    }
    private onClickHide() {
        this.mapContent.active = !this.mapContent.active;
    }
    private checkContentMap() {
        if (!this.content.children.length) {
            eventManager.dispatch('tip_text', ['请先添加布阵']);
            return false;
        }
        return true;
    }
    //    //检测阵容合法性
    private checkMap() {
        for (let i in this.map_select) {
            if (this.map_select[i] % 3 !== 0) {
                return false;
            }
        }
        return true;
    }
    start() {
        eventManager.addEvent('click_mapCard', this.clickMapCard.bind(this), this);
    }
    onDestroy() {
        eventManager.removeEvents(this);
    }
    private clickMapCard(args: any[]) {
        //格子15*15，card大小80*80
        let num_y: number = Math.floor(args[0] / 15);
        let num_x: number = Math.floor(args[0] % 15);
        let x: number = 40 + num_x * 40;
        let y: number = -40 - num_y * 40;
        if (args[1] === 0) {
            //0取1-6随机数
            args[1] = Math.floor(Math.random() * 6) + 1;
        }
        this.checkClickMap(args[0], args[1], this.content.children.length);
        let item = instantiate(this.cardItem);
        if (item) {
            this.content.addChild(item);
            item.getComponent(CardItem).setInfo(args[1], args[0], this.content.children.length, x, y);
            item.getComponent(CardItem).setBGame(1);
        }
        //数字显示
        let num: number = Number(this.arrNum[args[1]].string);
        this.arrNum[args[1]].string = (num + 1).toString();
    }
    private checkClickMap(index: number, type: number, count: number) {
        //赋值
        if (!this.map_select[type]) {
            this.map_select[type] = 0;
        }
        this.map_select[type]++;
        this.arrMap.push([index, type]);
        this.arrType.push(type);

        let arrIndex: number[] = userconfig.getPos(index);   //第一层
        let nextIndex: number[] = [];   //第二层

        for (let i = count - 1; i >= 0; i--) {
            if (!this.content.children[i]) {
                continue;
            }
            let item_index = this.arrMap[i][0];
            if (arrIndex.indexOf(item_index) >= 0) {
                if (!nextIndex.length || nextIndex.indexOf(item_index) < 0) {
                    nextIndex = nextIndex.concat(userconfig.getPos(item_index));
                }
                this.content.children[i].getComponent(CardItem).setClick(false);
            }
        }
    }
    //    //去掉上层卡片后下层卡片的状态改变，游戏会用到：位置，类型
    private clickCard(pos: number, type: number) {
        let arrIndex: number[] = userconfig.getPos(pos);   //去掉的第一层
        let nextIndex: number[] = [];   //第二层
        for (let i = this.content.children.length - 1; i >= 0; i--) {
            if (!this.content.children[i]) {
                continue;
            }
            let item_index = this.arrMap[i][0];
            if (arrIndex.indexOf(item_index) >= 0) {
                if (!nextIndex.length || nextIndex.indexOf(item_index) < 0) {
                    nextIndex = nextIndex.concat(userconfig.getPos(item_index));
                    this.content.children[i].getComponent(CardItem).setClick(true);
                }
            }
        }
    }
}


