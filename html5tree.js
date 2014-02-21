/*
*Html5tree是基于canvas的一个树控件
*version 0.6.1
*todo:这个控件还需要更好的美观设置
*todo:可以改成更简洁的代码
*todo:文档可以做的更详细
*todo:增加更多的例子代码
*todo:增加对节点内容的自动换行支持
*todo:增加对节点拖拽的支持
*todo:增加拖拽中的节点的显示样式，半透明，虚线框线
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
    this.rectangle = {"width": 40, "height": 20, "strokecolor": "#ffffff", "fillcolor": "#aad7ff","select_strokecolor":'#eeeeee','select_fillcolor':'#0dd7ff'};
    //目前选中的节点
    this.selectpoints=[];
    //单选模式 1单选 2多选
    this.singlechoice=2;
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
        if (typeof (params['data']) === 'string') {
            _data = JSON.parse(params['data']);
        } else {
            _data = clone(params['data']);
        }
        _canvas = _container.getContext("2d");
        // alert(['a','b'].inarray('b'));
        _procData(_data);
        //end 处理传入参数
        //begin 画图
        drawAllTree(_data);
        //end 画图
        procClick();
        procDragAndDrop();
    };
    var refresh=function(){
    	_currentX = 0;
    	_currentY = 0;
        _canvas.clearRect(0, 0, _container.width, _container.height);

        _procData(_data);
    	//begin 画图
        drawAllTree(_data);
        //end 画图
    }
    // var map={'posx':{},'posy':{}};
    var _treelevelmap=[];
    //画出多棵树
    var drawAllTree = function(data) {
        for (var i = 0, l = _toppoints.length; i < l; i++) {
            _currentX = self.leftmargin;
            drawTree(_toppoints[i]);
        }
    };
    //画单棵树
    var drawTree = function(pointindex) {
        if(!_data[pointindex]['parent']){
            _data[pointindex]['level']=0;
        }else{
            _data[pointindex]['level']= _data[_data[pointindex]['parent']]['level']+1;
        }
        _currentY = _currentY + self.topmargin + self.space;
        _data[pointindex]['pos'] = {"x":  self.leftmargin + self.tabspace* _data[pointindex]['level'], "y": _currentY};
        _treelevelmap[_data[pointindex]['level']]=_data[pointindex]['pos']['x'];
        drawPoint(pointindex,false);
        //画节点连线
        drawLine(pointindex);
        if (_data[pointindex]['children'] != undefined && _data[pointindex]['children'] != '') {
            for (var i = 0, l = _data[pointindex]['children'].length; i < l; i++) {
                drawTree(_data[pointindex]['children'][i]);
            }
        }
    };
    //获取节点索引
    this.getPointIndex=function(x,y){
        for(var item in _data){
            if(_data[item]['pos']['x']<x && _data[item]['pos']['x']+self.rectangle.width>x){
                if(_data[item]['pos']['y']<y && _data[item]['pos']['y']+self.rectangle.height>y){
                    return {'index':item,'action':'selected','message':''};
                }
            }
        }
        return false;
    };
    var _capturepoint='';
    var procDragAndDrop=function(){
        var dragpoint={};
        $(_container).bind('mousedown',function(){
            var x = event.pageX - this.offsetLeft;
            var y = event.pageY - this.offsetTop+$(_container).scrollTop();
            var ret=self.getPointIndex(x,y);
            if(ret){
                _capturepoint=ret;
            }
        });
        $(_container).bind('mousemove',function(){
            if(_capturepoint){
                var x = event.pageX - this.offsetLeft;
                var y = event.pageY - this.offsetTop+$(_container).scrollTop();
                dragpoint=clone(_data[_capturepoint['index']]);
                dragpoint['pos']={'x':x,'y':y};
                // setPoint(_data[_capturepoint['index']],x,y);
                refresh();
                drawPoint(dragpoint,false);
            }
        });
        $(_container).bind('mouseup',function(){
            if(_capturepoint){
                var x = event.pageX - this.offsetLeft;
                var y = event.pageY - this.offsetTop+$(_container).scrollTop();
                setPoint(_data[_capturepoint['index']],x,y);
                _capturepoint='';
                refresh();
            }
        });
    };
    //处理点击事件
    var procClick=function(){
        $(_container).bind('click',function(){
            var x = event.pageX - this.offsetLeft;
            var y = event.pageY - this.offsetTop+$(_container).scrollTop();
            var ret=self.getPointIndex(x,y);
            //如果点在节点上
            if(ret){
                //如果是单选模式
            	if(self.singlechoice==1){
            		if(self.selectpoints[0]==undefined){
                        gotoUrl(ret['index']);
						self.selectpoints[0]=ret;
            		}else{
            			if(self.selectpoints[0]['index']==ret['index']){
            				self.selectpoints=[];
            			}else{
                            gotoUrl(ret['index']);
            				self.selectpoints[0]=ret;
            			}
            		}
            	} else{
                    //多选模式
            		if(self.selectpoints.length!=0){
	            		var isselected='';
	            		for(var i=0,l=self.selectpoints.length;i<l;i++){
	            			if(self.selectpoints[i]['index']==ret['index']){
		            			isselected=i;
		            		}
	            		}
	            		if(isselected!==''){
	            			self.selectpoints.splice(isselected,1);
	            		}else{
                            gotoUrl(ret['index']);
	            			self.selectpoints.push(ret);
	            		}
	            	}else{
                        gotoUrl(ret['index']);
	            		self.selectpoints.push(ret);
	            	}
            	}
                refresh();
            }
        });
    };
    var gotoUrl=function(pointindex){
        if(_data[pointindex]['link']){
            window.open(_data[pointindex]['link']);
        }
    }
    //点击事件绑定
    this.onClick=function(func){
        $(_container).bind('click',function(){
        	if(typeof(func)=='function'){
        		func(self.selectpoints);
        	}
        }); 
    };
    Array.prototype.min = function() {
      return Math.min.apply({},this);
    };
    Array.prototype.inarray=function(element){
        for(var i=0,l=this.length;i<l;i++){
            if(this[i]==element)return i;
        }
        return false;
    };
    //设置节点的位置
    var setPoint=function(point,x,y){
        var currentlevel=point['level'];
        for(var i=1,l=_treelevelmap.length;i<l;i++){
            if(x+self.rectangle.width/2<=_treelevelmap[i]){
                currentlevel=i-1;
                break
            }
        }

        var pindex_top='';
        var distance_top=1000000;
        for(var index in _data){
            if(_data[index]['level']==currentlevel){
                if(_data[index]['pos']['y']>y){
                    if(pindex_top>_data[index]['pos']['y']-y){
                        pindex_top=_data[index]['pos']['y']-y;
                        pindex_top=index;
                    }
                }
            }
        }
        var pindex_bottom='';
        var distance_bottom=1000000;
        for(var index in _data){
            if(_data[index]['level']==currentlevel){
                if(_data[index]['pos']['y']<y){
                    if(distance_bottom>y-_data[index]['pos']['y']){
                        distance_bottom=y-_data[index]['pos']['y'];
                        pindex_bottom=index;
                    }
                }
            }
        }
        if(distance_top>distance_bottom){
            if(pindex_bottom!='' && pindex_bottom!=point['_id']){
                point['orderno']=_data[pindex_bottom]['orderno'];
                point['parent']=_data[pindex_bottom]['parent'];
                _data[pindex_bottom]['orderno']=_data[pindex_bottom]['orderno']-1;
            }
        }else{
            if(pindex_top!='' && pindex_top!=point['_id']){
                point['orderno']=_data[pindex_top]['orderno'];
                point['parent']=_data[pindex_top]['parent'];
                _data[pindex_top]['orderno']=_data[pindex_top]['orderno']+1;
            }
        }
    }
 
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
    var drawPoint = function(pointindex,grid) {
        if(!grid)
            grid=false;
        else 
            grid=true;
        var item=pointindex;
        if(typeof(pointindex)=='string'){
            setPointStatus(pointindex);
            item=_data[pointindex];
        }
        drawRectangle(item,grid);
        drawText(item,grid);
    };
    //画矩形
    var drawRectangle=function(pointindex,grid){
        var item=pointindex;
        if(typeof(pointindex)=='string'){
            item=_data[pointindex];
        }
        _canvas.fillStyle = item['selected']==1?self.rectangle.select_fillcolor:self.rectangle.fillcolor;
        var x=_currentX;
        var y=_currentY;
        if(!grid){
            x=item['pos']!=undefined?item['pos']['x']:_currentX;
            y=item['pos']!=undefined?item['pos']['y']:_currentY;
        }
        
        _canvas.fillRect(x, y, self.rectangle.width, self.rectangle.height);
    };
    //画文字
    var drawText=function(pointindex,grid){
        var item=pointindex;
        if(typeof(pointindex)=='string'){
            item=_data[pointindex];
        }
        _canvas.fillStyle = "#00f";
        _canvas.font = "italic 16px sans-serif";
        _canvas.textBaseline = "top";
        var x=_currentX;
        var y=_currentY;
        if(!grid){
            x=item['pos']!=undefined?item['pos']['x']:_currentX;
            y=item['pos']!=undefined?item['pos']['y']:_currentY;
        }
        _canvas.fillText(item['text'], x, y);
    };
    //设置节点为选中或者未选中状态
    var setPointStatus=function(pointindex){
    	if(self.singlechoice==1){
    		if(self.selectpoints.length==0){
    			_data[pointindex]['selected']=2;
    		}else if(self.selectpoints[0].index!=pointindex){
    			_data[pointindex]['selected']=2;
    		}else if(self.selectpoints[0].index==pointindex){
    			_data[pointindex]['selected']=1;    			
    		}
    	}else{
    		//没有选中的节点
    		if(self.selectpoints.length==0){
    			_data[pointindex]['selected']=2;
    		}else{
    			_data[pointindex]['selected']=2;
    			var isselected=false;
    			for(var i=0,l=self.selectpoints.length;i<l;i++){
    				if(self.selectpoints[i]['index']==pointindex){
    					isselected=true;
    				}
    			}
    			if(isselected){
    				_data[pointindex]['selected']=1;
    			}
    		}
    		
    	}
    }
    //处理数据，遍历数据给数据加children字段
    //记录所有顶点索引
    var _procData = function(data) {
        for (var item in data) {
            data[item]['children']=[];
            //增加children字段
            setChildren(item);
            //记录顶点
            if (isTopPoint(data[item])) {
                if(_toppoints.inarray(item)===false){
                    _toppoints.push(item);
                }
            }
        }
        _toppoints=_quickSortPoints(_toppoints);
    };
    //计算Children字段的值
    var setChildren = function(pointsindex) {
        if (_data[pointsindex]['parent']) {
            if (!_data[_data[pointsindex]['parent']]['children']) {
                _data[_data[pointsindex]['parent']]['children'] = [];
            }
            if(_data[_data[pointsindex]['parent']]['children'].inarray(pointsindex)===false){
                _data[_data[pointsindex]['parent']]['children'].push(pointsindex);
            }
            _data[_data[pointsindex]['parent']]['children']=_quickSortPoints(_data[_data[pointsindex]['parent']]['children']);
        }
    };
    
    //获取所有顶点的索引值
    var isTopPoint = function(data) {
        if (!data.parent || data.parent === "") {
            return true;
        }
        return false;
    };
    //把节点按照 orderno 从小到大排序
    var _quickSortPoints=function(points){
        var length=points.length;
        if(length<=1)return points;
        var pindex=Math.floor(length/2);
        var point=points.splice(pindex,1)[0];
        if(!_data[point]['orderno'])_data[point]['orderno']=999999;
        var left=[],right=[];
        for(var i=0;i<points.length;i++){
            if(!_data[points[i]]['orderno'])_data[points[i]]['orderno']=999999;

            if(_data[points[i]]['orderno'] <_data[point]['orderno']){
                left.push(points[i]);
            }else{
                right.push(points[i]);
            }
        }
        return _quickSortPoints(left).concat([point],_quickSortPoints(right));
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