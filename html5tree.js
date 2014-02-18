/*
*Html5tree是基于canvas的一个树控件
*version 0.1
*todo:选择节点的功能尚未完成
*/
var TreeView = function() {
	//树在canvas中的上边距
    this.topmargin = 0;
    //树在canva中的左边距
    this.leftmargin = 0;
    //每一级树的缩进
    this.tabspace = 60;
    //上下2个节点间的间距
    this.space = 30;
    //节点间连线颜色
    this.linecolor = "#000000";
    //节点连接的样式
    this.linestyle=1;
    //节点样式
    this.rectangle = {"width": 40, "height": 20, "strokecolor": "#ffffff", "fillcolor": "#0dd7ff"};
    
    var _container;
    var _canvas;
    var _data;
    var _toppoints = [];
    var self;
    this.init = function(params) {
        self = this;
        //begin 处理传入参数
        if (!params)
            return false;
        if (typeof (params['container']) === 'string') {
            _container = document.getElementById(params['container']);
        } else {
            _container = params['container'];
        }
        //todo:如果传入的数据是以个数组
        if (typeof (params['data']) == 'string') {
            _data = JSON.parse(params['data']);
        } else {
            _data = params['data'];
        }
        _canvas = _container.getContext("2d");
        _procData(_data);
        //end 处理传入参数
        //begin 画图
        drawAllTree(_data);
        //end 画图
    };
    //画出多棵树
    var drawAllTree = function(data) {
        for (var i = 0, l = _toppoints.length; i < l; i++) {
            _currentX = self.leftmargin;
            drawTree(_toppoints[i]);
//            drawLine();
            _linepoints = [];
        }
    };
    var _linepoints = [];
    //画单棵树
    var drawTree = function(pointindex) {
        _currentY = _currentY + self.topmargin + self.space;
        drawPoint(pointindex);
        if (!_data[pointindex]['pos']) {
            _data[pointindex]['pos'] = {"x": _currentX, "y": _currentY};
        }
        drawLine(pointindex);
        console.log(pointindex);
        if (_data[pointindex]['children'] != undefined && _data[pointindex]['children'] != '') {
            _currentX = _currentX + self.leftmargin + self.tabspace;
            for (var i = 0, l = _data[pointindex]['children'].length; i < l; i++) {
                drawTree(_data[pointindex]['children'][i]);
            }
        }
    };

    //画线
    var drawLine = function(pointindex ) {
        if (_data[pointindex]['parent']) {
            _canvas.beginPath();
            if (self.linestyle == 2) {
                _canvas.moveTo(_data[_data[pointindex]['parent']]['pos']['x']+self.rectangle.width, _data[_data[pointindex]['parent']]['pos']['y'] + self.rectangle.height / 2);
                _canvas.lineTo(_data[pointindex]['pos']['x'], _data[pointindex]['pos']['y'] + self.rectangle.height / 2);
                _canvas.strokeStyle = self.linecolor;
            } else if(self.linestyle == 3){
                _canvas.moveTo(_data[_data[pointindex]['parent']]['pos']['x']+self.rectangle.width, _data[_data[pointindex]['parent']]['pos']['y'] + self.rectangle.height / 2);
                var tab=_data[_data[pointindex]['parent']]['pos']['x']+self.rectangle.width+(self.tabspace-self.rectangle.width)/2;
                _canvas.lineTo(tab,  _data[_data[pointindex]['parent']]['pos']['y'] + self.rectangle.height / 2);
                _canvas.lineTo(tab, _data[pointindex]['pos']['y'] + self.rectangle.height / 2);
                _canvas.lineTo(_data[pointindex]['pos']['x'], _data[pointindex]['pos']['y'] + self.rectangle.height / 2);
                _canvas.strokeStyle = self.linecolor;
            }else {
                _canvas.moveTo(_data[_data[pointindex]['parent']]['pos']['x'], _data[_data[pointindex]['parent']]['pos']['y'] + self.rectangle.height / 2);
                _canvas.lineTo(_data[_data[pointindex]['parent']]['pos']['x'], _data[pointindex]['pos']['y'] + self.rectangle.height / 2);
                _canvas.lineTo(_data[pointindex]['pos']['x'], _data[pointindex]['pos']['y'] + self.rectangle.height / 2);
                _canvas.strokeStyle = self.linecolor;
            }
            _canvas.stroke();
        }
    };
    var _currentX = 0;
    var _currentY = 0;

    
    //画节点
    var drawPoint = function(pointindex) {
        _canvas.fillStyle = self.rectangle.fillcolor;
        _canvas.fillRect(_currentX, _currentY, self.rectangle.width, self.rectangle.height);
        _canvas.fillStyle = "#00f";
        _canvas.font = "italic 16px sans-serif";
        _canvas.textBaseline = "top";
        _canvas.fillText(_data[pointindex]['text'], _currentX, _currentY);
    };
    //处理数据，遍历数据给数据加children字段
    //记录所有顶点索引
    var _procData = function(data) {
        for (var item in data) {
            //增加children字段
            setChildren(item);
            //记录顶点
            if (isTopPoint(data[item])) {
                _toppoints.push(item);
            }
        }

    };
    //计算Children字段的值
    var setChildren = function(pointsindex) {
        if (_data[pointsindex]['parent']) {
            if (!_data[_data[pointsindex]['parent']]['children']) {
                _data[_data[pointsindex]['parent']]['children'] = [];
            }
            _data[_data[pointsindex]['parent']]['children'].push(pointsindex);
        }
    };
    //获取所有顶点的索引值
    var isTopPoint = function(data) {
        if (!data.parent || data.parent === "") {
            return true;
        }
        return false;
    };
};