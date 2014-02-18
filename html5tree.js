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
        procClick();
    };
    this.refresh=function(){
    	_currentX = 0;
    	_currentY = 0;
	
        _canvas.clearRect(0, 0, _container.width, _container.height);
    	//begin 画图
        drawAllTree(_data);
        //end 画图
        // procClick();
    }
    //画出多棵树
    drawAllTree = function(data) {
        for (var i = 0, l = _toppoints.length; i < l; i++) {
            _currentX = self.leftmargin;
            drawTree(_toppoints[i]);
        }
    };
    //画单棵树
    var drawTree = function(pointindex) {
        _currentY = _currentY + self.topmargin + self.space;
        drawPoint(pointindex);
        if (!_data[pointindex]['pos']) {
            _data[pointindex]['pos'] = {"x": _currentX, "y": _currentY};
        }
        drawLine(pointindex);
        if (_data[pointindex]['children'] != undefined && _data[pointindex]['children'] != '') {
            _currentX = _currentX + self.leftmargin + self.tabspace;
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
    //处理点击事件
    var procClick=function(){
        $(_container).bind('click',function(){
            var x = event.pageX - this.offsetLeft;
            var y = event.pageY - this.offsetTop+$(_container).scrollTop();
            var ret=self.getPointIndex(x,y);
            if(ret){
            	if(self.singlechoice==1){
            		if(self.selectpoints[0]==undefined){
						self.selectpoints[0]=ret;
            		}else{
            			if(self.selectpoints[0]['index']==ret['index']){
            				self.selectpoints=[];
            			}else{
            				self.selectpoints[0]=ret;
            			}
            		}
            	} else{
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
	            			self.selectpoints.push(ret);
	            		}
	            	}else{
	            		self.selectpoints.push(ret);
	            	}
            	}
            }
        });
    };
    //点击事件绑定
    this.onClick=function(func){
        $(_container).bind('click',function(){
            func(self.selectpoints);
        }); 
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
    	setPointStatus(pointindex);
        _canvas.fillStyle = _data[pointindex]['selected']==1?self.rectangle.select_fillcolor:self.rectangle.fillcolor;
        _canvas.fillRect(_currentX, _currentY, self.rectangle.width, self.rectangle.height);
        _canvas.fillStyle = "#00f";
        _canvas.font = "italic 16px sans-serif";
        _canvas.textBaseline = "top";
        _canvas.fillText(_data[pointindex]['text'], _currentX, _currentY);
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