/*
 *Html5tree是基于canvas的一个树控件
 *version 0.7
 *todo:这个控件还需要更好的美观设置
 *todo:可以改成更简洁的代码
 *todo:文档可以做的更详细
 *todo:增加更多的例子代码
 *todo:增加对节点内容的自动换行支持
 *功能：
 *支持自定义节点的样式（颜色，宽度，高度，缩进，间距）
 *支持拖拽节点，改变的节点的顺序和父子关系
 *支持节点的收缩和展开操作
 *支持给节点绑定onclick事件
 *支持给拖拽节点操作的onmouseup绑定事件
 *支持在一个canvas上画多个tree
 *支持在多个canvas上画多个tree
 *支持同一个canvas上的tree可以互动
 *支持不同canvas上的tree不可以互动
 */
var TreeView = function() {
    //树在canvas中的上边距
    this.topmargin = 0;
    //树在canva中的左边距
    this.leftmargin = 0;
    //每一级树的缩进
    this.tabspace = 60;
    //上下2个节点间的间距
    this.space = 50;
    //节点间连线颜色
    this.linecolor = "#000000";
    //节点连接的样式
    this.linestyle = 1;
    //节点样式
    this.rectangle = {"width": 40, "height": 20, "strokecolor": "#ffffff", "fillcolor": "#aad7ff", "select_strokecolor": '#eeeeee', 'select_fillcolor': '#0dd7ff'};
    //目前选中的节点
    this.selectpoints = [];
    //单选模式 1单选 2多选
    this.singlechoice = 2;
    var _container;
    var _canvas;
    var _data;
    var _toppoints, _capturepoint, _currentX, _currentY;
    var _controller_width = 10;
    var _controller_height = 10;
    var _controller_color = '#000000'
    var _controller_content_color = '#ffffff';
    _capturepoint = '';
    _lastcapturepoint = '';
    //重置过程中的参数值
    var _resetParams = function() {
        _toppoints = [];
        _currentX = 0;
        _currentY = 0;
    };
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
        if (typeof (params['data']) === 'string') {
            _data = JSON.parse(params['data']);
        } else {
            _data = clone(params['data']);
        }
        _canvas = _container.getContext("2d");
        _resetParams();
        _procData(_data);
        //end 处理传入参数
        //begin 画图
        procAllTree(_data);
        //end 画图
        render();
        //处理点击事件
        procClick();
        //处理拖拽事件
        procDragAndDrop();
    };

    //重置参数，刷新canvas
    var refresh = function() {
        _resetParams();
        _canvas.clearRect(0, 0, _container.width, _container.height);
        _procData(_data);
        //begin 画图
        procAllTree(_data);
        //end 画图
        render();
    };

    //渲染整个图
    var render = function() {
        for (var item in _data) {
            if (_data[item]['draw'] == 1) {
                _drawPoint(item);
                _drawLine(item);
                _drawController(item);
            }
        }
    };



    //画出多棵树
    var procAllTree = function(data) {
        for (var i = 0, l = _toppoints.length; i < l; i++) {
            _currentX = self.leftmargin + _controller_width;
            procTree(_toppoints[i]);
        }
    };

//    var _draw = 1;
    //画单棵树
    var procTree = function(pointindex) {
        if (!_data[pointindex]['parent']) {
            _data[pointindex]['level'] = 0;
        } else {
            _data[pointindex]['level'] = _data[_data[pointindex]['parent']]['level'] + 1;
        }
        if (_currentY === 0) {
            _currentY = self.topmargin;
        }
        setPointStatus(pointindex);
        var draw=1;
        //如果有父节点，并且父节点是收缩或者不显示状态
        //那么这个节点也是不显示状态
        if(_data[pointindex]['parent'] &&( _data[_data[pointindex]['parent']]['folder']==2 || _data[_data[pointindex]['parent']]['draw']==2)){
            draw=2;
        }
        if (draw == 2) {
            _data[pointindex]['draw'] = 2;
        } else {
            _currentY = _currentY + self.space;
            _data[pointindex]['pos'] = {"x": _currentX + self.tabspace * _data[pointindex]['level'], "y": _currentY};
            _data[pointindex]['draw'] = 1;
        }
        //处理子节点
        if (_data[pointindex]['children'] != undefined && _data[pointindex]['children'] != '') {
            for (var i = 0, l = _data[pointindex]['children'].length; i < l; i++) {
                procTree(_data[pointindex]['children'][i]);
            }
        }
    };
    //获取节点索引
    var getPointIndex = function(x, y) {
        for (var item in _data) {
            if (_data[item]['pos']['x'] < x && _data[item]['pos']['x'] + self.rectangle.width > x) {
                if (_data[item]['pos']['y'] < y && _data[item]['pos']['y'] + self.rectangle.height > y) {
                    if(_data[item]['draw']==2)return false;
                    return {'index': item, 'action': 'selected', 'message': ''};
                }
            }
        }
        return false;
    };
    var getPointControllerIndex = function(x, y) {
        for (var item in _data) {
            if (_data[item]['pos']['x'] - _controller_width < x && _data[item]['pos']['x'] > x) {
                if (_data[item]['pos']['y'] + (self.rectangle.height - _controller_height) / 2 < y && _data[item]['pos']['y'] + (self.rectangle.height + _controller_height) / 2 > y) {
                    if(_data[item]['draw']==2)return false;
                    return {'index': item, 'action': 'folder', 'message': ''};
                }
            }
        }
        return false;
    };
    var procDragAndDrop = function() {
        var dragpoint = {};
        $(_container).bind('mousedown', function() {
            var x = event.pageX - this.offsetLeft;
            var y = event.pageY - this.offsetTop + $(_container).scrollTop();
            var ret = getPointIndex(x, y);
            _lastcapturepoint = '';
            if (ret) {
                _capturepoint = ret;
            }
        });

        $(_container).bind('mousemove', function() {
            if (_capturepoint) {
                var x = event.pageX - this.offsetLeft;
                var y = event.pageY - this.offsetTop + $(_container).scrollTop();
                dragpoint = clone(_data[_capturepoint['index']]);
                _data[_capturepoint['index']]['alpha'] = 0.5;
                dragpoint['pos'] = {'x': x - self.rectangle.width / 2, 'y': y - self.rectangle.height / 2};
                setPoint(_capturepoint['index'], x, y);
                refresh();
                _canvas.globalAlpha = 0.5;
                _drawPoint(dragpoint, false);
                _canvas.globalAlpha = 1;
                showRange(x, y);
            }
        });
        $(_container).bind('mouseup', function() {
            if (_capturepoint) {
                var x = event.pageX - this.offsetLeft;
                var y = event.pageY - this.offsetTop + $(_container).scrollTop();
                setPoint(_capturepoint['index'], x, y);
                _data[_capturepoint['index']]['alpha'] = 1;
                _lastcapturepoint = _capturepoint;
                _capturepoint = '';
                refresh();
                _lastcapturepoint['action'] = 'drop';
                _lastcapturepoint['message'] = _data[_lastcapturepoint['index']]['parent'];
            }
        });
    };

    //处理点击事件
    var procClick = function() {
        $(_container).bind('click', function() {
            var x = event.pageX - this.offsetLeft;
            var y = event.pageY - this.offsetTop + $(_container).scrollTop();
            var ret = getPointIndex(x, y);
            
            //如果点在节点上
            if (ret) {
//                if(_data[ret['index']]['draw']==2)return false;
                //如果是单选模式
                if (self.singlechoice == 1) {
                    if (self.selectpoints[0] == undefined) {
                        gotoUrl(ret['index']);
                        self.selectpoints[0] = ret;
                    } else {
                        if (self.selectpoints[0]['index'] == ret['index']) {
                            self.selectpoints = [];
                        } else {
                            gotoUrl(ret['index']);
                            self.selectpoints[0] = ret;
                        }
                    }
                } else {
                    //多选模式
                    if (self.selectpoints.length != 0) {
                        var isselected = '';
                        for (var i = 0, l = self.selectpoints.length; i < l; i++) {
                            if (self.selectpoints[i]['index'] == ret['index']) {
                                isselected = i;
                            }
                        }
                        if (isselected !== '') {
                            self.selectpoints.splice(isselected, 1);
                        } else {
                            gotoUrl(ret['index']);
                            self.selectpoints.push(ret);
                        }
                    } else {
                        gotoUrl(ret['index']);
                        self.selectpoints.push(ret);
                    }
                }

            }
            ret = getPointControllerIndex(x, y);
            if (ret) {
                if (_data[ret['index']]['folder'] == undefined || _data[ret['index']]['folder'] == 1) {
                    _data[ret['index']]['folder'] = 2;
                } else {
                    _data[ret['index']]['folder'] = 1;
                }
            }
            refresh();
        });
    };
    var gotoUrl = function(pointindex) {
        if (_data[pointindex]['link']) {
            window.open(_data[pointindex]['link']);
        }
    };
    //点击事件绑定
    this.onClick = function(func) {
        $(_container).bind('click', function() {
            if (typeof (func) === 'function') {
                func(self.selectpoints);
            }
        });
    };
    //目标弹起绑定
    this.onMouseUp = function(func) {
        $(_container).bind('mouseup', function() {
            if (typeof (func) === 'function') {
                func(_lastcapturepoint);
            }
        });
    };
    var isParentPoint = function(parent, son) {
        var parents = '';
        var getParents = function(pointindex) {
            if (_data[pointindex]['parent'] == undefined || _data[pointindex]['parent'] == '')
                return;
            parents = _data[pointindex]['parent'] + ',' + parents;
            getParents(_data[_data[pointindex]['parent']]['_id'], parents);
        };
        getParents(son);
        if (parents.indexOf(parent) !== -1)
            return true;
        return false;
    };

    //设置节点的位置
    var setPoint = function(pointindex, x, y) {
        var index = getNearestPoint(x, y);
        if (index === false)
            return;
        //如果移动的节点是最近的节点的父节点，那就不相应这个移动操作
        if (isParentPoint(pointindex, index)) {
            return;
        }
        var nearestpoint = _data[index];
        //如果鼠标坐标在节点左侧超出半个节点宽度
        if (nearestpoint['pos']['x'] - x > self.rectangle.width / 2) {
            _data[pointindex]['parent'] = nearestpoint['parent'] != '' ? _data[nearestpoint['parent']]['parent'] : '';
            _data[pointindex]['level'] = nearestpoint['level'] > 0 ? (nearestpoint['level'] - 1) : 0;
            return;
        }
        //如果鼠标在节点右侧超出半个节点宽度
        if (x - nearestpoint['pos']['x'] > self.rectangle.width / 2) {
            if (pointindex == nearestpoint['_id'])
                return;
            _data[pointindex]['parent'] = nearestpoint['_id'];
            _data[pointindex]['level'] = nearestpoint['level'] + 1;
            return;
        }
        //如果鼠标在节点下方，左右都不超出半个节点宽度，下方超出半个节点高度
        if (y - nearestpoint['pos']['y'] > self.rectangle.height / 2) {
            _data[pointindex]['parent'] = nearestpoint['parent'];
            _data[pointindex]['orderno'] = nearestpoint['orderno'] + 0.5;
            return;
        }
        //如果鼠标在节点上方，左右都不超出半个节点宽度，上方超出半个节点高度
        if (nearestpoint['pos']['y'] - y > self.rectangle.height / 2) {
            _data[pointindex]['parent'] = nearestpoint['parent'];
            _data[pointindex]['orderno'] = nearestpoint['orderno'] - 0.5;
            return;
        }

    };
    //显示选择范围
    var showRange = function(x, y) {
        _canvas.globalAlpha = 0.2;
        _canvas.fillStyle = "#FF0000";
        _canvas.beginPath();
        _canvas.arc(x, y, self.r, 0, Math.PI * 2, true);
        _canvas.closePath();
        _canvas.fill();
        _canvas.globalAlpha = 1;
    };
    //找出最近的节点的索引
    var getNearestPoint = function(x, y) {
        var points = nearPoints(x, y);
        var len = points.length;
        if (len === 0)
            return false;
        if (len === 1)
            return points[0]['index'];
        var distance = points[0]['distance'];
        var index = points[0]['index'];
        for (var i = 1, l = len; i < l; i++) {
            if (distance > points[i]['distance']) {
                distance = points[i]['distance'];
                index = points[i]['index'];
            }
        }
        return index;
    };
    //选取节点的半径
    this.r = 30;
    //寻找附近的节点
    var nearPoints = function(x, y) {
        var nearpoints = [];
        var distance = false;
        for (var item in _data) {
            distance = rectangleOverCircle(_data[item]['pos']['x'], _data[item]['pos']['y'], self.rectangle.width, self.rectangle.height, x, y, self.r);
            if (distance !== false) {
                nearpoints.push({'index': item, 'distance': distance});
            }
        }
        return nearpoints;
    };
    //矩形是否和圆有重叠（近似算法，不严格有待改善）
    var rectangleOverCircle = function(x, y, width, height, x1, y1, r) {
        var distance = [];
        distance.push(isInCircle(x1, y1, r, x, y));
        distance.push(isInCircle(x1, y1, r, x + width, y));
        distance.push(isInCircle(x1, y1, r, x + width, y + height));
        distance.push(isInCircle(x1, y1, r, x, y + height));
        for (var i = 0; i < distance.length; i++) {
            if (distance[i] === false) {
                distance.splice(i, 1);
                i = i - 1;
            }
        }
        if (distance.length > 0) {
            return distance.min();
        }
        return false;
    };
    //点是否在圆上
    var isInCircle = function(x, y, r, x1, y1) {
        var distance = (x - x1) * (x - x1) + (y - y1) * (y - y1);
        if (distance <= r * r) {
            return distance;
        } else {
            return false;
        }
    };

    //设置节点为选中或者未选中状态
    var setPointStatus = function(pointindex) {
        if (self.singlechoice == 1) {
            if (self.selectpoints.length == 0) {
                _data[pointindex]['selected'] = 2;
            } else if (self.selectpoints[0].index != pointindex) {
                _data[pointindex]['selected'] = 2;
            } else if (self.selectpoints[0].index == pointindex) {
                _data[pointindex]['selected'] = 1;
            }
        } else {
            //没有选中的节点
            if (self.selectpoints.length == 0) {
                _data[pointindex]['selected'] = 2;
            } else {
                _data[pointindex]['selected'] = 2;
                var isselected = false;
                for (var i = 0, l = self.selectpoints.length; i < l; i++) {
                    if (self.selectpoints[i]['index'] == pointindex) {
                        isselected = true;
                    }
                }
                if (isselected) {
                    _data[pointindex]['selected'] = 1;
                }
            }

        }
    };
    //处理数据，遍历数据给数据加children字段
    //记录所有顶点索引
    var _procData = function(data) {
        for (var item in data) {
            //如果没有folder字段 则赋值为1 表示张开状态
            if (!data[item]['folder']) {
                data[item]['folder'] = 1;
            }
            //节点默认都要画出
            if (!data[item]['draw']) {
                data[item]['draw'] = 1;
            }

            data[item]['children'] = [];
        }
        for (var item in data) {
            //增加children字段
            setChildren(item);
            //记录顶点
            if (isTopPoint(data[item])) {
                if (_toppoints.inarray(item) === false) {
                    _toppoints.push(item);
                }
            } else {
                if (_toppoints.inarray(item) !== false) {
                    _toppoints.splice(item, 1);
                }
            }
        }
        _toppoints = _quickSortPoints(_toppoints);
        _resetOrderno(_toppoints);
    };
    //计算Children字段的值
    var setChildren = function(pointsindex) {
        if (_data[pointsindex]['parent']) {
            if (!_data[_data[pointsindex]['parent']]['children']) {
                _data[_data[pointsindex]['parent']]['children'] = [];
            }
            if (_data[_data[pointsindex]['parent']]['children'].inarray(pointsindex) === false) {
                _data[_data[pointsindex]['parent']]['children'].push(pointsindex);
            }
            _data[_data[pointsindex]['parent']]['children'] = _quickSortPoints(_data[_data[pointsindex]['parent']]['children']);
            _resetOrderno(_data[_data[pointsindex]['parent']]['children']);
        }
    };

    //获取所有顶点的索引值
    var isTopPoint = function(data) {
        if (!data.parent || data.parent === "") {
            return true;
        }
        return false;
    };
    var _resetOrderno = function(sortedpoints) {
        for (var i = 0, l = sortedpoints.length; i < l; i++) {
            _data[sortedpoints[i]]['orderno'] = i + 1;
        }
    };
    //把节点按照 orderno 从小到大排序
    var _quickSortPoints = function(points) {
        var length = points.length;
        if (length <= 1)
            return points;
        var pindex = Math.floor(length / 2);
        var point = points.splice(pindex, 1)[0];
        if (!_data[point]['orderno'])
            _data[point]['orderno'] = 999999;
        var left = [], right = [];
        for (var i = 0; i < points.length; i++) {
            if (!_data[points[i]]['orderno'])
                _data[points[i]]['orderno'] = 999999;

            if (_data[points[i]]['orderno'] < _data[point]['orderno']) {
                left.push(points[i]);
            } else {
                right.push(points[i]);
            }
        }
        return _quickSortPoints(left).concat([point], _quickSortPoints(right));
    };
    //画线
    var _drawLine = function(pointindex) {
        if (_data[pointindex]['parent']) {
            _canvas.beginPath();
            if (self.linestyle == 2) {
                _canvas.moveTo(_data[_data[pointindex]['parent']]['pos']['x'] + self.rectangle.width - _controller_width / 2, _data[_data[pointindex]['parent']]['pos']['y'] + self.rectangle.height / 2 + _controller_height / 2);
                _canvas.lineTo(_data[pointindex]['pos']['x'] - _controller_width / 2, _data[pointindex]['pos']['y'] + self.rectangle.height / 2);
                _canvas.strokeStyle = self.linecolor;
            } else if (self.linestyle == 3) {
                _canvas.moveTo(_data[_data[pointindex]['parent']]['pos']['x'] - _controller_width / 2 + self.rectangle.width, _data[_data[pointindex]['parent']]['pos']['y'] + self.rectangle.height / 2 + _controller_height / 2);
                var tab = _data[_data[pointindex]['parent']]['pos']['x'] - _controller_width / 2 + self.rectangle.width + (self.tabspace - self.rectangle.width) / 2;
                _canvas.lineTo(tab, _data[_data[pointindex]['parent']]['pos']['y'] + self.rectangle.height / 2);
                _canvas.lineTo(tab, _data[pointindex]['pos']['y'] + self.rectangle.height / 2);
                _canvas.lineTo(_data[pointindex]['pos']['x'] - _controller_width / 2, _data[pointindex]['pos']['y'] + self.rectangle.height / 2);
                _canvas.strokeStyle = self.linecolor;
            } else {
                _canvas.moveTo(_data[_data[pointindex]['parent']]['pos']['x'] - _controller_width / 2, _data[_data[pointindex]['parent']]['pos']['y'] + self.rectangle.height / 2 + _controller_height / 2);
                _canvas.lineTo(_data[_data[pointindex]['parent']]['pos']['x'] - _controller_width / 2, _data[pointindex]['pos']['y'] + self.rectangle.height / 2);
                _canvas.lineTo(_data[pointindex]['pos']['x'] - _controller_width / 2, _data[pointindex]['pos']['y'] + self.rectangle.height / 2);
                _canvas.strokeStyle = self.linecolor;
            }
            _canvas.stroke();
            _canvas.closePath();

        }
    };

    var _drawController = function(pointindex) {
        _canvas.fillStyle = _controller_color;
        _canvas.fillRect(_data[pointindex]['pos']['x'] - _controller_width, _data[pointindex]['pos']['y'] + (self.rectangle.height - _controller_height) / 2, _controller_width, _controller_height);
        _canvas.strokeStyle = _controller_content_color;
        _canvas.beginPath();
        _canvas.moveTo(_data[pointindex]['pos']['x'] - _controller_width, _data[pointindex]['pos']['y'] + self.rectangle.height / 2);
        _canvas.lineTo(_data[pointindex]['pos']['x'], _data[pointindex]['pos']['y'] + self.rectangle.height / 2);
        //如果节点有子节点，并且子节点是不显示的
        if (_data[pointindex]['children'] && _data[pointindex]['children'] != '' && _data[pointindex]['folder'] && _data[pointindex]['folder'] == 2) {
            _canvas.moveTo(_data[pointindex]['pos']['x'] - _controller_width / 2, _data[pointindex]['pos']['y'] + (self.rectangle.height - _controller_height) / 2);
            _canvas.lineTo(_data[pointindex]['pos']['x'] - _controller_width / 2, _data[pointindex]['pos']['y'] + (self.rectangle.height + _controller_height) / 2);
        }
        _canvas.closePath();
        _canvas.stroke();
    };
    //画节点
    var _drawPoint = function(pointindex) {
        var point = pointindex;
        if (typeof (pointindex) === 'string') {
            point = _data[pointindex];
        }
        //画节点
        _drawRectangle(point);
        //写文字
        _drawText(point);
    };
    //画矩形
    var _drawRectangle = function(point) {
        if (point['alpha'] < 1) {
            _canvas.strokeStyle = '#000000';
            _canvas.strokeRect(point['pos']['x'], point['pos']['y'], self.rectangle.width, self.rectangle.height);
            _canvas.globalAlpha = point['alpha'];
        }
        _canvas.fillStyle = point['selected'] == 1 ? self.rectangle.select_fillcolor : self.rectangle.fillcolor;
        _canvas.fillRect(point['pos']['x'], point['pos']['y'], self.rectangle.width, self.rectangle.height);
        _canvas.globalAlpha = 1;
    };
    //画文字
    var _drawText = function(point) {
        _canvas.fillStyle = "#00f";
        _canvas.font = "italic 16px sans-serif";
        _canvas.textBaseline = "top";
        _canvas.fillText(point['text'], point['pos']['x'], point['pos']['y']);
    };
    Array.prototype.min = function() {
        return Math.min.apply({}, this);
    };
    Array.prototype.inarray = function(element) {
        for (var i = 0, l = this.length; i < l; i++) {
            if (this[i] == element)
                return i;
        }
        return false;
    };
};
//clone对象，避免引用对象
function clone(obj) {
    // Handle the 3 simple types, and null or undefined
    if (null == obj || "object" != typeof obj)
        return obj;
    // Handle Date
    if (obj instanceof Date) {
        var copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }

    // Handle Array
    if (obj instanceof Array) {
        var copy = [];
        for (var i = 0, len = obj.length; i < len; ++i) {
            copy[i] = clone(obj[i]);
        }
        return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
        var copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr))
                copy[attr] = clone(obj[attr]);
        }
        return copy;
    }

    throw new Error("Unable to copy obj! Its type isn't supported.");
}