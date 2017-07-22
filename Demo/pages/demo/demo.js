import {
    Sortable
} from '../../mina-sortable/mina-sortable.js';

Page({
    data: {
        /*

        控制所有拖拽元素top值的CSS Class的数组 topList * 数组命名不强制

        topList数组内的 Class命名规范参照 demo.wxss

        控制内联样式的数组 styles  * 数组命名不强制

        */

        topList: [
            'row-0',
            'row-1',
            'row-2',
            'row-3',
            'row-4',
            'row-5'
        ],
        styles: []
    },
    onShow: function () {
        this.data.sort = new Sortable({
            topList: this.data.topList,
            topAvg: 50
        });
        /* 
         需要将实例化的Sortable对象赋值在this.data对象中

         topList 控制所有拖拽元素top值的CSS Class的数组 * 必填
         topAvg 每一个拖拽元素的上边框与下一个元素的上边框之间的「距离」* 必填
         spaceLimit 拖拽时元素可超出的最上和最下的距离「区间」* 可选 默认为topAvg的一半
         opacity 被拖拽元素的不透明度 * 可选 默认值0.5
        */
        let topList = this.data.sort.init(true);
        this.setData({
            topList: topList
        });
        /*
            * init() 初始化函数 * 必须调用
            
            参数为布尔值 作用是随机打乱 topList数组顺序 * 可选 默认值为false 

            需要将返回数组赋予 this.data.topList数组 用于改变inner view的排列顺序

            *** new Sortable() 和 init() 应该放在同一个onLoad或者onShow周期中 
            (onHide周期中 this.data.sort对象里的属性并未清空) ***

        */
    },
    ondragstart: function (ev) {
        let styles = this.data.sort.dragStart(ev);
        this.setData({
            styles: styles
        });

        /*
           * 拖拽开始函数 *
           参数为 * 事件对象 * 必填
           返回值 控制拖拽元素内联样式的数组
        */
    },
    ondrag: function (ev) {
        let cssList = this.data.sort.dragging(ev);

        this.setData({
            styles: cssList[0],
            topList: cssList[1]
        });

        /*
           * 拖拽中函数 *
           
           参数为 * 事件对象 * 必填

           返回值 一个数组
           返回数组 0 位置为 控制拖拽元素内联样式的数组
           返回数组 1 位置为 控制所有拖拽元素top值的CSS Class的数组

        */
    },
    ondragend: function () {
        this.data.ordered = this.data.sort.dragEnd();

        let styles = [];
        this.setData({
            styles: styles
        });

        /*
            * 拖拽停止函数 *
            
            参数为 布尔值 默认值 false 根据排列顺序的 对错 返回 布尔值
                        若传入 true  会返回一个排列顺序的 数组

            *** 拖拽结束后 必须清空 控制内联样式的数组 ***

        */

        console.log(this.data.ordered);
    },
    onConfirm: function () {
        wx.showToast({
            title: this.data.ordered ? "顺序正确" : "顺序错误",
            duration: 5000
        })
    },

    onShareAppMessage: function () {
        return {
            title: 'mina-sortable | 拖拽排序插件',
            path: '/pages/demo/demo'
        }
    }
})