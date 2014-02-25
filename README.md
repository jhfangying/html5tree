html5tree
=========

一个基于html5 canva创建的树控件，这个控件可以通过json和js进行控制操作。

功能：
-----
 支持自定义节点的样式（颜色，宽度，高度，缩进，间距）<br />
 支持拖拽节点，改变的节点的顺序和父子关系<br />
 支持节点的收缩和展开操作<br />
 支持给节点绑定onclick事件<br />
 支持给拖拽节点操作的onmouseup绑定事件<br />
 支持在一个canvas上画多个tree<br />
 支持在多个canvas上画多个tree<br />
 支持同一个canvas上的tree可以互动<br />
 支持不同canvas上的tree不可以互动<br />
 支持自适应画布大小<br />
 支持删除节点操作<br />
 支持节点固定宽度，文字超出宽度自动换行，自动拉长节点高度

调用方法
<pre><code>
$(document).ready(function() {
    var treeViewInstance = new TreeView;
    treeViewInstance.init({'container': 'canvas', 'data': json});
});
</code></pre>

