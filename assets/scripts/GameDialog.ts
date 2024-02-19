import { _decorator, Component, Label, Node, Prefab, instantiate } from 'cc';
const { ccclass, property } = _decorator;

import { userconfig } from "./UserConfig";
import { eventManager } from "./EventManger";
import CardItem from "./CardItem";

@ccclass('GameDialog')
export default class GameDialog extends Component {
    @property(Label)
    private title: Label | null = null;
    @property(Node)
    private content: Node | null = null;
    @property(Node)
    private box: Node | null = null;
    @property(Node)
    private ydBox: Node | null = null;
    @property(Prefab)
    private cardItem: Prefab | null = null;
    @property(Label)
    private arrNum: Label[] = [];
    private nLevel: number = 1;
    private arrMap: number[][] = [];    //当前地图数据
    private before_index: number[] = [];   //上一个点击的图标位置
    private num: number = 0;   //消除次数
    private mapBox = {};   //盒子里的道具类型
    private nums: number[] = [2, 2, 2];    //上移次数//回退次数//刷新次数
    onLoad() {
        this.initGame();
        this.initNum();
    }
    private initGame() {
        if (!userconfig.getMapData()[this.nLevel]) {
            eventManager.dispatch('tip_text', ['请先编辑关卡']);
            return;
        }
        this.mapBox = {};
        this.num = 0;
        this.before_index = [];
        this.title.string = '第' + this.nLevel + '关';
        this.arrMap = userconfig.getMapData()[this.nLevel];
        this.initMap();
    }
    private initMap() {
        this.content.removeAllChildren();
        this.box.removeAllChildren();
        for (let i = 0; i < this.arrMap.length; i++) {
            this.clickMapCard(this.arrMap[i]);
        }
    }
    private initNum() {
        for (let i in this.arrNum) {
            this.arrNum[i].string = this.nums[i].toString();
        }
    }
    private clickMapCard(args: any[]) {
        //格子15*15，card大小80*80
        let num_y: number = Math.floor(args[0] / 15);
        let num_x: number = Math.floor(args[0] % 15);
        let x: number = 40 + num_x * 40;
        let y: number = -40 - num_y * 40;
        this.checkClickMap(args[0], this.content.children.length);
        let item = instantiate(this.cardItem);
        if (item) {
            this.content.addChild(item);
            item.getComponent(CardItem).setInfo(args[1], args[0], this.content.children.length, x, y);
            item.getComponent(CardItem).setBGame(2);
        }
    }
    private checkClickMap(index: number, count: number) {
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
    //    //去掉上层卡片后下层卡片的状态改变，游戏会用到：位置，第几项
    private clickCard(pos: number, index: number) {
        let arrIndex: number[] = userconfig.getPos(pos);   //去掉的第一层
        let nextIndex: number[] = [];   //第二层
        let arrState: number[] = [];   //改变了状态的第几项
        for (let i = index; i >= 0; i--) {
            if (!this.content.children[i]) {
                continue;
            }
            let item_index = this.arrMap[i][0];
            if (arrIndex.indexOf(item_index) >= 0) {
                if (!nextIndex.length || nextIndex.indexOf(item_index) < 0) {
                    nextIndex = nextIndex.concat(userconfig.getPos(item_index));
                    // this.content.children[i].getComponent(CardItem).setClick(true);
                    //改变了状态的图片
                    arrState.push(i);
                }
            }
        }
        //向上遍历，状态是否能正确改变
        let mapPos = userconfig.getMapDataPos()['map_' + this.nLevel];
        for (let i = 0; i < arrState.length; i++) {
            for (let j = arrState[i] + 1; j < this.content.children.length; j++) {
                if (this.before_index.indexOf(j) >= 0) {
                    continue;
                }
                if (mapPos[j].indexOf(this.arrMap[arrState[i]][0]) >= 0) {
                    //被覆盖了
                    arrState.splice(i, 1);
                    i--;
                    break;
                }
            }
        }
        for (let i = 0; i < arrState.length; i++) {
            this.content.children[arrState[i]].getComponent(CardItem).setClick(true);
        }
    }
    private deleteCard(args: any[]) {
        this.before_index.push(args[0]);
        let map = this.arrMap[args[0]];
        this.content.children[args[0]].getComponent(CardItem).setInfo(0);
        this.clickCard(map[0], args[0]);  //改变状态
        //到box保存
        this.addBox(map[1]);
    }
    //    //box添加
    private addBox(type: number) {
        if (!this.mapBox[type]) {
            this.mapBox[type] = 0;
        }
        this.mapBox[type]++;
        let item = instantiate(this.cardItem);
        if (item) {
            this.box.addChild(item);
            item.getComponent(CardItem).setInfo(type);
        }

        //判断是否可消
        let bXc: boolean = false;
        for (let k in this.mapBox) {
            if (this.mapBox[k] >= 3) {
                this.mapBox[k] -= 3;
                for (let i = 0; i < this.box.children.length; i++) {
                    if (!this.box.children[i]) {
                        break;
                    }
                    let item = this.box.children[i];
                    if (k === item.getComponent(CardItem).getType().toString()) {
                        this.box.removeChild(item);
                        i--;
                    }
                }
                this.num++;
                bXc = true;
                break;
            }
        }
        if (!bXc) {
            let nums: number = 0;
            for (let k in this.mapBox) {
                nums += this.mapBox[k];
            }
            if (nums >= 7) {
                eventManager.dispatch('tip_message', ['挑战失败，是否重新开始', () => {
                    this.initGame();
                }, true])
                return;
            }
        }
        if (this.checkGameEnd()) {
            eventManager.dispatch('tip_text', ['通关成功']);
            this.nLevel++;
            this.initGame();
        }
    }
    //    //游戏结束逻辑
    public checkGameEnd() {
        return this.num * 3 === this.arrMap.length;
    }
    start() {
        eventManager.addEvent('game_click_card', this.deleteCard.bind(this), this);
        eventManager.addEvent('ydBox_click_card', this.clickYdBox.bind(this), this);
    }
    onDestroy() {
        eventManager.removeEvents(this);
    }
    private clickYdBox(args: any[]) {
        this.addBox(args[0]);
    }
    private onClickSy() {
        if (this.nums[0] <= 0) {
            eventManager.dispatch('tip_text', ['剩余次数不足']);
            return;
        }
        if (this.box.children.length < 3) {
            eventManager.dispatch('tip_text', ['图标数量不足']);
            return;
        }
        let i: number = 0;
        let arrType: number[] = [];
        while (i < 3) {
            let item = this.box.children[0];
            let type = item.getComponent(CardItem).getType();
            arrType.push(type);
            this.box.removeChild(item);
            this.mapBox[type]--;
            i++;
        }
        let arrPosX = [];
        if (this.ydBox.children.length % 3 === 0) {
            arrPosX = [-90, 0, 90];
        } else if (this.ydBox.children.length % 3 === 1) {
            arrPosX = [0, 90, -90];
        } else {
            arrPosX = [90, -90, 0];
        }
        for (let i = 0; i < arrType.length; i++) {
            let item = instantiate(this.cardItem);
            if (item) {
                this.ydBox.addChild(item);
                item.getComponent(CardItem).setInfo(arrType[i], 0, this.ydBox.children.length - 1, arrPosX[i], 0);
                item.getComponent(CardItem).setBGame(3);
            }
        }
        this.nums[0]--;
        this.initNum();
    }
    private onClickHt() {
        if (this.nums[1] <= 0) {
            eventManager.dispatch('tip_text', ['剩余次数不足']);
            return;
        }
        if (!this.box.children.length) {
            eventManager.dispatch('tip_text', ['请先点击图标']);
            return;
        }
        //获取box最后一项
        let item = this.box.children[this.box.children.length - 1];
        let type = item.getComponent(CardItem).getType();

        let idx: number = this.before_index[this.before_index.length - 1];
        this.arrMap[idx][1] = type;
        this.content.children[idx].getComponent(CardItem).setInfo(type);
        this.box.removeChild(item);
        this.before_index.pop();
        this.mapBox[type]--;
        //重新设置层级
        this.checkClickMap(this.arrMap[idx][0], idx);
        this.nums[1]--;
        this.initNum();
    }
    private onClickSx() {
        if (this.nums[2] <= 0) {
            eventManager.dispatch('tip_text', ['剩余次数不足']);
            return;
        }
        //图片类型随机打乱
        let newArr: number[] = [];
        for (let i = 0; i < this.arrMap.length; i++) {
            if (this.before_index.indexOf(i) >= 0) {
                continue;
            }
            newArr.push(this.arrMap[i][1]);
        }
        newArr.sort(() => { return Math.random() - 0.5 });
        for (let i = 0; i < this.arrMap.length; i++) {
            if (this.before_index.indexOf(i) >= 0) {
                continue;
            }
            if (newArr[0]) {
                this.arrMap[i][1] = newArr[0];
                newArr.shift();
                this.content.children[i].getComponent(CardItem).setInfo(this.arrMap[i][1]);
            }
        }
        this.nums[2]--;
        this.initNum();
    }
    private onClose() {
        this.node.destroy();
    }
}


