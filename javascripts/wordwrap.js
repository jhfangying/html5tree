//文字内容，字号，可放文字的宽度
var WordWrap = function(text, fontsize, width) {
    //计算文字字符长度
    var wordslength = function(text) {
        var len = text.length, wordslength = 0;
        for (var i = 0; i < len; i++) {
            if (text.charCodeAt(i) > 128) {
                wordslength += 2;
            } else {
                wordslength += 1;
            }
        }
        return wordslength;
    };
    //字符串，截取长度
    //返回截取的位置
    var cutString=function(str, leng) {
        var len = str.length, tlen = len, nlen = 0;
        for (var x = 0; x < len; x++) {
            if (str.charCodeAt(x) > 128) {
                if (nlen + 2 < leng) {
                    nlen += 2;
                } else {
                    tlen = x+1;
                    break;
                }
            } else {
                if (nlen + 1 < leng) {
                    nlen += 1;
                } else {
                    tlen = x+1;
                    break;
                }
            }
        }
        return tlen;
    };
    
    var textperline = function(text,fontsize, width) {
        var lines=[];
        while(wordslength(text)>0){
            var len=Math.floor(width/(fontsize/1.8));
            var linewidth=cutString(text,len);
            lines.push(text.substr(0,linewidth));
            text=text.substr(linewidth);
        }
        return lines;
    };
    this.lines = textperline(text,fontsize,width);
    this.rows =this.lines.length;
};