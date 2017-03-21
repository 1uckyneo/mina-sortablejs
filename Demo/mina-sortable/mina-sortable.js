class Sortable {

    constructor(itemCount, topAvg, spaceLimit, opacity = .5) {

        this.itemCount = itemCount;
        this.topAvg = topAvg;
        this.spaceLimit = spaceLimit;
        this.opacity = opacity;

        /*

        itemCount
        拖拽元素的数量

        topAvg
        上一个拖拽元素顶部与下一个拖拽元素顶部的间距

        spaceLimit
        所有拖拽元素的上下区间
        可选

        targetOpacity
        被拖拽元素透明度
        可选 默认值0.5

        */

        this.theTarget = null; //被拖拽元素
        this.topFromFatherStart = 0; //获取开始拖动瞬间,元素与父元素的距离
        this.pointY_dragStart = 0; //拖拽开始瞬间touch Y坐标
        this.pointY_movedNow = 0; //拖拽期间 touch此刻移动距离
        this.pointY_movedLast = 0; //拖拽期间 touch上次移动距离1
        this.topFromFatherNow = 0; //拖拽期间 此刻拖拽元素离父级的top值;
        this.directionY = 0; //拖拽的方向

        this.upLimit = 0; //拖拽元素的上限
        this.bottomLimit = 0; //拖拽元素的下限

        this.topCssClasses = null; //所有控制元素top值的CSS属性数组|动态变化角标
        this.topCssClassNum = null; //开始拖动时,被拖动元素所在行数
        this.rowNumBeforeSwitch = null; //在换行之前拖动元素的所在行
        this.lastIdNum = null; //上一次拖拽元素的Id尾数
        this.data = [];

    }

    /*初始化*/

    init(topCssClasses, disorder) {

        this.topCssClasses = topCssClasses;

        if (this.spaceLimit !== undefined) {
            this.upLimit = -this.spaceLimit; //拖拽元素的上区间
            this.bottomLimit = (this.itemCount - 1) * this.topAvg + this.spaceLimit; //下区间
        }

        if (disorder) {
            return this.disorder(topCssClasses);
        } else {
            this.idx = [];
            for (let i = 0; i < this.itemCount; i++) {
                this.idx[i] = i;
            }
            return topCssClasses;
        }

    }

    /* 打乱顺序  *  只在init函数第二个参数为true才触发 */

    disorder(topCssClasses) {

        let topCssClass = topCssClasses[0];
        let rowHead = topCssClass.substr(0, topCssClass.length - 1);

        this.idx = [];
        while (this.idx.length < this.itemCount) {
            let randomNum = Math.floor(Math.random() * this.itemCount);
            let notSame = true;
            for (let i = 0; i < this.idx.length; i++) {
                if (this.idx[i] === randomNum) {
                    notSame = false;
                    break;
                } else {
                    notSame = true;
                }
            }
            if (notSame) {
                this.idx.push(randomNum);
            }
        }

        for (let i = 0; i < this.idx.length; i++) {
            let key = this.idx[i];
            topCssClasses[key] = rowHead + i;
        }
        this.topCssClasses = topCssClasses;

        return topCssClasses
    }

    /* 拖拽开始 */

    dragStart(ev) {

        this.theTarget = ev.currentTarget; //获取拖动元素
        this.topFromFatherStart = this.theTarget.offsetTop; //获取开始拖动瞬间元素与父元素的距离
        this.pointY_dragStart = ev.touches[0].clientY; //获取并保存住:开始拖动元素时的touch Y坐标

        let id = this.theTarget.id;
        let idNum = this.idNum = parseInt(id.substr(id.length - 1, 1));
        let topCssClass = this.topCssClasses[idNum];
        let topCssClassNum = this.topCssClassNum = parseInt(topCssClass.substr(topCssClass.length - 1, 1));

        if (idNum !== this.lastIdNum) {
            this.rowNumBeforeSwitch = topCssClassNum;
        }

        let styles = [];
        styles[idNum] = "z-index:1000;box-shadow:0 10px 10px #888;transition:top 0s;" + 'opacity:' + this.opacity + ";";

        return styles;

    }

    /* 拖拽中 */

    dragging(ev, styles) {

        this.pointY_movedNow = ev.touches[0].clientY - this.pointY_dragStart; //记录 此刻 touch Y坐标与 开始移动瞬间 的touch Y坐标之间的 距离
        this.directionY = this.pointY_movedNow - this.pointY_movedLast; //以距离的正或负来决定拖动事件是否为上或下

        if (this.spaceLimit !== undefined) {
            //如果传入区间参数,则动态生成不同位置拖拽元素的上下区间
            this.giveSpaceLimitDyna();
        }

        let idNum = this.idNum;

        let targetStyles = styles[idNum].split(";");
        targetStyles.pop();
        let moved = this.topFromFatherStart + this.pointY_movedNow;
        targetStyles.push("top:" + moved + "px");
        targetStyles = targetStyles.join(";");

        styles[idNum] = targetStyles;

        this.data[0] = styles;
        this.data[1] = this.topCssClasses;

        //实时获取此刻拖动元素与父元素的距离
        this.topFromFatherNow = parseInt(moved);

        //元素向下拖动时
        if (this.directionY > 0) {
            this.moveDownward();
            //元素向上拖动时
        } else if (this.directionY < 0) {
            this.moveUpward();
        }

        this.pointY_movedLast = this.pointY_movedNow;

        /*
            记录此次移动事件touch Y坐标的移动距离
            用来 在下次事件开始时,再与下次touch Y坐标移动距离来记录比较
            用正负关系来确定元素是否上下移动
        */

        return this.data;

    }

    /*向下拖动时的处理*/

    moveDownward() {

        let rNBS = this.rowNumBeforeSwitch;
        let topCssClasses = this.topCssClasses;
        let idx = this.idx;

        for (let i = (this.itemCount - 1); i > 0; i--) {
            let switchLine = i * this.topAvg - this.topAvg / 2;
            if (this.topFromFatherNow > switchLine) {
                if (i !== rNBS) {

                    [
                        topCssClasses[idx[rNBS]],
                        topCssClasses[idx[rNBS + 1]]
                    ] = [
                        topCssClasses[idx[rNBS + 1]],
                        topCssClasses[idx[rNBS]]
                    ];
                    this.data[1] = topCssClasses;
                    this.topCssClasses = topCssClasses;

                    let arr = this.idx.splice(rNBS, 1);
                    this.idx.splice(rNBS + 1, 0, arr[0]);

                    this.rowNumBeforeSwitch = i;

                }
                break;
            }
        }
    }

    /*向上拖动时的处理*/

    moveUpward() {

        let rNBS = this.rowNumBeforeSwitch;
        let topCssClasses = this.topCssClasses;
        let idx = this.idx;

        for (let i = 0; i < (this.itemCount - 1); i++) {
            let switchLine = i * this.topAvg + this.topAvg / 2;
            if (this.topFromFatherNow < switchLine) {
                if (i !== this.rowNumBeforeSwitch) {

                    [
                        topCssClasses[idx[rNBS]],
                        topCssClasses[idx[rNBS - 1]]
                    ] = [
                        topCssClasses[idx[rNBS - 1]],
                        topCssClasses[idx[rNBS]]
                    ];
                    this.data[1] = topCssClasses;
                    this.topCssClasses = topCssClasses;

                    let arr = this.idx.splice(rNBS, 1);
                    this.idx.splice(rNBS - 1, 0, arr[0]);

                    this.rowNumBeforeSwitch = i;

                }
                break;
            }
        }
    }

    /* 动态给不同起始位置的拖拽元素生成上下区间 */

    giveSpaceLimitDyna() {

        let topCssClassNum = this.topCssClassNum;
        for (let i = 0; i < this.itemCount; i++) {
            if (topCssClassNum === i) {

                /*

                当touch Y坐标移动范围超过限定范围时
                强行给pointY_movedNow一个特定值

                */

                this.pointY_movedNow = this.pointY_movedNow < this.upLimit - i * this.topAvg ? this.upLimit - i * this.topAvg :
                    this.pointY_movedNow > this.bottomLimit - i * this.topAvg ? this.bottomLimit - i * this.topAvg : this.pointY_movedNow;

                break;
            }
        }
    }

    /* 拖拽结束 */

    dragEnd() {
        this.lastIdNum = this.idNum; //记录下这次的id尾数

        let ordered;
        for (let i = 0; i < this.idx.length; i++) {
            if (i !== this.idx[i]) {
                ordered = false;
                break;
            } else {
                ordered = true;
            }
        }

        return ordered;

    }

    /*Sortable结束*/

}



export {
    Sortable
};