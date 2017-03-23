import {
    Sortable
} from '../../mina-sortable/mina-sortable.js';

Page({
    data: {
        /*

        控制top值的CSS Class数组 topCssClasses * 命名不强制

        topCssClasses数组内的每一个Class值名称要以整数结尾,并且从0开始升序排列

        控制内联样式的数组 styles  * 命名不强制

        */

        topCssClasses: [
            'row0',
            'row1',
            'row2',
            'row3',
            'row4',
            'row5'
        ],
        styles: []
    },
    onShow: function() {
        this.data.sort = new Sortable(6, 50, 25);
        /*

          需要将new出来的对象赋值给this.data对象中

          第一个参数为 可拖拽元素「数量」* 必选
          第二个参数为 每一个拖拽元素的上边框与下一个元素的上边框之间的「距离」* 必选
          第三个参数为 拖拽时元素可超出的最上和最下的距离「区间」* 可选 默认无限制
          第四个参数为 被拖拽元素的不透明度 * 可选 默认值0.5

        */

        let topCssClasses = this.data.topCssClasses;
        
        topCssClasses = this.data.sort.init(topCssClasses,true);
        
        this.setData({
            topCssClasses: topCssClasses
        });
        
        /*
            * 初始化函数 * 必须调用

            第一个参数为 * 控制top值的CSS Class数组 * 必填

            第二个参数作用是 打乱顺序 * 可选 默认值为false 

            若打乱顺序 需要将返回值赋予 this.data.topCssClasses

            * new Sortable() 和 init() 应该放在同一个周期中 (onHide周期中 sort对象里的属性并未清空)

        */
    },
    ondragstart: function(ev) {
        let styles = this.data.sort.dragStart(ev);
        this.setData({
            styles: styles
        });

        /*
           * 拖拽开始函数 *
           参数为 * 事件对象 * 必填
           返回值 控制内联样式的数组
        */
    },
    ondrag: function(ev) {
        let data = this.data.sort.dragging(ev);

        this.setData({
            styles: data[0],
            topCssClasses: data[1]
        });

        /*
           * 拖拽中函数 *
           
           参数为 * 事件对象 * 必填

           返回值 一个数组
           返回数组 0 位置为 控制内联样式的数组
           返回数组 1 位置为 控制top值的CSS Class数组

        */
    },
    ondragend: function() {
        this.data.ordered = this.data.sort.dragEnd();

        let styles = [];
        this.setData({
            styles: styles
        });

        /*
            * 拖拽停止函数 *

            *** 返回一个布尔值 若排列顺序正确 返回true

            *** 拖拽结束后 必须清空 控制内联样式的数组

        */
    },
    onConfirm:function(){
            wx.showToast({
                title:this.data.ordered?"顺序正确":"顺序错误",
                duration:5000
            })
    },
    onShareAppMessage: function() {
        return {
            title: 'mina-sortable | 拖拽排序插件',
            path: '/pages/demo/demo'
        }
    }
})
