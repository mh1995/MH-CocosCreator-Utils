import { EventManager, GameEvent } from "../utils/EventManager";

const { property } = cc._decorator;
const EAction = cc.Enum({
    NONE: 0,
    OPEN: 1,
    CLOSE: 2,
    BOTH: 3
})

export default class UIBase extends cc.Component {

    @property({
        displayName: "销毁",
        tooltip: "UI关闭时是否销毁"
    })
    destroyNode = false;
    @property({
        displayName: "遮罩",
        tooltip: "是否在UI下层显示半透明遮罩"
    })
    showShade = false;
    @property({
        displayName: "完全覆盖",
        tooltip: "当前UI完全覆盖下层UI时，会隐藏下层UI"
    })
    cover = false;
    @property({
        displayName: "阻塞输入事件",
        tooltip: "是否阻塞所有的输入事件向下层传递"
    })
    blockInputEvent = true;
    @property({
        type: EAction,
        displayName: "动画",
        tooltip: "是否启用UI打开和关闭动画"
    })
    showAction = EAction.NONE;
    @property({
        type: cc.Button,
        displayName: "关闭按钮",
        tooltip: "自动为按钮绑定UI关闭事件"
    })
    closeBtn: cc.Button = null;

    protected args: any = null;
    protected uiName: string = null;

    /** 初始化UI，在子类重写该方法时，必须手动调用super.init() */
    init() {
        this.node.setContentSize(cc.winSize);
        this.closeBtn && this.closeBtn.node.on("click", this.safeClose, this);
        this.blockInputEvent && this.node.addComponent(cc.BlockInputEvents);
    }

    setUIName(name: string) {
        this.uiName = name;
    }

    setArgs(args: any) {
        this.args = args;
    }

    setZIndex(index: number) {
        this.node.zIndex = index;
    }

    setActive(bool: boolean) {
        this.node.active = bool;
    }

    setOpacity(opacity: number) {
        this.node.opacity = cc.misc.clampf(opacity, 0, 255);
    }

    open() {
        let p = new Promise<boolean>((resovle, reject) => {
            let callback = () => {
                if (this.showAction & EAction.OPEN) {
                    this.node.resumeSystemEvents(true);
                }
                EventManager.emit(this.uiName + "_open");
                resovle(true);
            };
            if (this.showAction & EAction.OPEN) {
                this.node.pauseSystemEvents(true);
                this.node.scale = 0.85;
                cc.tween(this.node)
                    .to(0.3, { scale: 1 }, { easing: "elasticOut" })
                    .call(callback)
                    .start();
            } else {
                callback();
            }
        })
        return p;
    }

    safeClose() {
        EventManager.emit(GameEvent.CloseUI, this.uiName);
    }

    close() {
        let p = new Promise<boolean>((resovle, reject) => {
            let callback = () => {
                if (this.showAction & EAction.CLOSE) {
                    this.node.resumeSystemEvents(true);
                }
                EventManager.emit(this.uiName + "_close");
                resovle(true);
            };
            if (this.showAction & EAction.CLOSE) {
                this.node.pauseSystemEvents(true);
                cc.tween(this.node)
                    .to(0.2, { scale: 0.5 }, { easing: "backIn" })
                    .call(callback)
                    .start();
            } else {
                callback();
            }
        });
        return p;
    }

}