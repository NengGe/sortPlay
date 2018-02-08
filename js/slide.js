(function (window, undefined) {
    var nengGe = {};  //定义需要暴露的接口,
    //函数缓存,提升性能,减少dom操作。
    function getElements(str) {
        var name = str.match(/[a-z]+/g).join('');
        if (!getElements.ele) getElements.ele = {};
        return getElements.ele[name] = getElements.ele[name] || document.querySelectorAll(str);
    }
    //根据animate-box定制改变图片的大小
    function setImgSize(ele, sizeW, sizeH) {
        for (var i = 0; i < ele.length; i++) {
            ele[i].setAttribute('width', sizeW);
            ele[i].setAttribute('height', sizeH);
        }
    }
    //动画函数
    function animate(ele, xTarget, yTarget, time, flag) {
        var speed = 10,
            xPos = ele.offsetLeft,
            yPos = ele.offsetTop;
        if (ele.movement) {  //每次只保证一个定时器。
            clearTimeout(ele.movement);
        }
        if (flag) {   //递归程序终止条件
            if (yPos == yTarget) {
                return false;
            }
        } else {
            if (xPos == xTarget) {
                return false;
            }
        }
        xShift = Math.ceil(Math.abs(xTarget - xPos) / speed);
        yShift = Math.ceil(Math.abs(yTarget - yPos) / speed);
        xPos = xPos < xTarget ? xPos + xShift : xPos - xShift;
        yPos = yPos < yTarget ? yPos + yShift : yPos - yShift;
        ele.style.left = xPos + 'px';
        ele.style.top = yPos + 'px';
        ele.movement = setTimeout(function () {
            animate(ele, xTarget, yTarget, time, flag);
        }, time);
    }
    //取得对应的索引点函数
    function moveIndex(aList, index) {
        for (var i = 0; i < aList.length; i++) {
            aList[i].className = '';
        }
        aList[index].className = 'on';
    }
    nengGe.slide = { //定义一个轮播对象实现轮播的封装。
        getInit: function (opt) {
            return new nengGe.slide.init(opt);
        }
    };
    nengGe.slide.init = function (opt) {
        this.ulWidth = 10000 + 'px';  //定义初始ul宽度
        this.animateBox = document.querySelector('.animate-box');
        this.oAnimate = document.querySelector('.animate');
        this.aLi = document.querySelectorAll('.animate ul li');
        this.index = 0;
        this.anBoxWidth = this.animateBox.clientWidth;
        this.anBoxHeight = this.animateBox.clientHeight;
        this.flag = false;  //用来判断轮播方向。默认false为水平。
        this.timer = null; //定义一个定时器,控制动画运动的时间间隔。
        this.opt = {
            direction: 'vertical',
            timeOut: 2500,
        }
        for (var key in opt) {
            this.opt[key] = opt[key];
        }
    }

    //根据direction的值去调整宽度 
    nengGe.slide.init.prototype.getulWidth = function () {
        if (this.opt.direction === 'horizen') {
            this.ulWidth = 10000 + 'px';
            document.querySelector('.animate ul').style.width = this.ulWidth;
        } else if (this.opt.direction === 'vertical') {
            this.ulWidth = this.animateBox.clientWidth + 'px';
            document.querySelector('.animate ul').style.width = this.ulWidth;
        }
    }
    //显示样式
    nengGe.slide.init.prototype.showStyle = function () {
        var oUl = getElements('.animate ul')[0],
            oDiv = getElements('.animate')[0];
        ulinnerHtml = oUl.innerHTML;
        str = '';
        str += '<ul>' + ulinnerHtml + '</ul>';
        str += '<font class="left"><</font><font class="right">></font>';
        str += '<div class="icon">';
        for (var i = 0; i < this.aLi.length; i++) {
            str += i == 0 ? '<a href="javascript:;" class="on"></a>' : '<a href="javascript:;"></a>';
        }
        str += '</div>';
        oDiv.innerHTML = str;
        setImgSize(getElements('.animate ul li img'), this.anBoxWidth, this.anBoxHeight);  //图片大小自适应animate-box容器大小。
        this.getulWidth();
    }
    nengGe.slide.init.prototype.move = function () {
        this.clickMove();
        this.autoSwiper();
        this.hover();
        this.changeImg();
    }
    //点击左右两边图标时候
    nengGe.slide.init.prototype.clickMove = function () {
        var oLeft = getElements('.left')[0],
            oRight = getElements('.right')[0],
            that = this,
            oUl = document.querySelector('.animate ul');
        oLeft.onclick = function () {
            that.autoplay();
        }
        oRight.onclick = function () {
            if (--that.index < 0) {
                that.index = that.aLi.length - 1;
            }
            moveIndex(getElements('.icon a'), that.index);
            if (that.opt.direction == 'horizen') {
                that.flag = false;
                animate(oUl, -that.index * that.anBoxWidth, 0, 20, that.flag);
            } else {
                that.flag = true;
                animate(oUl, 0, -that.index * that.anBoxHeight, 20, that.flag);
            }
        }
        //自动轮播函数
        nengGe.slide.init.prototype.autoplay = function () {
            var that = this;
            if (++that.index == that.aLi.length) {
                that.index = 0;
            }
            moveIndex(getElements('.icon a'), that.index);
            if (that.opt.direction == 'horizen') {
                that.flag = false;
                animate(oUl, - that.index * that.anBoxWidth, 0, 20, that.flag);
            } else {
                that.flag = true;
                animate(oUl, 0, - that.index * that.anBoxHeight, 20, that.flag);
            }
        }
        //插件使用时自动轮播
        nengGe.slide.init.prototype.autoSwiper = function () {
            var that = this;
            that.timer = setInterval(function () {
                that.autoplay();
            }, that.opt.timeOut);
        }
        //鼠标移动到图片上停止定时器 移下来启动定时器
        nengGe.slide.init.prototype.hover = function () {
            var that = this;
            that.oAnimate.onmouseover = function () {
                clearInterval(that.timer);
            }
            that.oAnimate.onmouseout = function () {
                that.timer = setInterval(function () {
                    that.autoplay();
                }, that.opt.timeOut);
            }
        }
        //根据小图标索引切换图片
        nengGe.slide.init.prototype.changeImg = function () {
            var that = this;
            for (var i = 0; i < that.aLi.length; i++) {
                (function (j) {
                    getElements('.icon a')[j].onmouseover = function () {
                        that.index = j - 1;//矫正索引
                        that.autoplay();
                    }
                })(i)
            }
        }
    }
    window.N = nengGe;
})(window);