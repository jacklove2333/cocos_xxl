import { _decorator, Component, Label, tween, UIOpacity } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('TipsText')
export default class TipsText extends Component {
    @property(Label)
    private text: Label | null = null;
    private myTween = null;
    public setText(str: string, time: number = 2) {
        this.stopTween();
        this.text.string = str;
        let ui_opacity = this.node.getComponent(UIOpacity);
        ui_opacity.opacity = 255;
        this.myTween = tween(ui_opacity)
            .to(time, { opacity: 0 })
            .call(() => {
                this.node.destroy();
            })
            .start()
    }
    private stopTween() {
        if (this.myTween) {
            this.myTween.stop();
            this.myTween = null;
        }
    }
}
