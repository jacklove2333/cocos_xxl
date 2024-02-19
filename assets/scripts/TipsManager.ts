import { _decorator, Component, Label, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('TipsManager')
export default class TipsManager extends Component {
    @property(Label)
    private text: Label | null = null;
    @property(Node)
    private btnClose: Node | null = null;
    @property(Node)
    private btnCancel: Node | null = null;
    private target: any = null;
    private sureBack: Function = null;
    private back_prama: any[] = undefined;
    onHide() {
        this.unscheduleAllCallbacks();
    }
    public setText(str: string) {
        this.text.string = str;
    }
    public setSureClick(target: any, sureBack: Function, ...argArray: any[]) {
        this.target = target;
        this.sureBack = sureBack;
        this.back_prama = argArray;
    }
    private onSureClick() {
        if (this.target && this.sureBack) {
            this.sureBack.apply(this.target, this.back_prama);
        }
        this.onClose();
    }
    private onClose() {
        this.node.destroy();
    }
    public hideBtn() {
        this.btnClose.active = false;
        this.btnCancel.active = false;
    }
}


