var rootNode = new XG5.GUINode({
  name: 'top-node',
  isRoot: true
});

rootNode.addInput('\00');

rootNode.moveTo({x: 5, y: 60});

rootNode.initUI();

// The Node Types and Menu stuffs
// =================================
var Nodes = {
  functions: [
    {
      name  : "Clamp",
      inputs: [ "Min", "Max", "Value" ],
      types : [ "i", "i", "c" ]
    },
    {
      name  : "Abs",
      inputs: [ "Value" ],
      types : [ "c" ]
    },
    {
      name  : "Multiply (A*B)",
      inputs: [ "A", "B" ],
      types : [ "c", "c" ]
    },
    {
      name  : "Divide (A/B)",
      inputs: [ "A", "B" ],
      types : [ "c", "c" ]
    },
    {
      name  : "Phong",
      inputs: [ "% Amb", "% Diff", "% Spec", "Ambient", "Diffuse", "Specular" ],
      types : [ "i", "i", "i", "c", "c", "c" ]
    }
  ],
  components: [
    {
      name  : "R Component",
      inputs: [ "\00" ],
      types : [ "c" ]
    },
    {
      name  : "G Component",
      inputs: [ "\00" ],
      types : [ "c" ]
    },
    {
      name  : "B Component",
      inputs: [ "\00" ],
      types : [ "c" ]
    },
    {
      name  : "A Component",
      inputs: [ "\00" ],
      types : [ "c" ]
    },
    {
      name  : "X Component",
      inputs: [ "\00" ],
      types : [ "c" ]
    },
    {
      name  : "Y Component",
      inputs: [ "\00" ],
      types : [ "c" ]
    },
    {
      name  : "Z Component",
      inputs: [ "\00" ],
      types : [ "c" ]
    },
    {
      name  : "W Component",
      inputs: [ "\00" ],
      types : [ "c" ]
    }
  ],
  uniforms: [
    {
      name  : "Uniform vec4",
      inputs: [ "Name" ],
      types : [ "i" ]
    },
    {
      name  : "Uniform vec3",
      inputs: [ "Name" ],
      types : [ "i" ]
    },
    {
      name  : "Uniform vec2",
      inputs: [ "Name" ],
      types : [ "i" ]
    },
    {
      name  : "Uniform sampler2D",
      inputs: [ "Name" ],
      types : [ "i" ]
    }
  ]
};

var appMouse = {
  pos: {x: 0, y: 0},
  ctxPos: {x: 0, y: 0}
};

var ctxMenu = document.createElement('div');
ctxMenu.id = 'ctx_menu';
ctxMenu.style.display = 'none';
document.body.appendChild(ctxMenu);

var svg = document.getElementById('node-graph');
var svgOnClick = svg.onclick;

svg.onclick = function(e){
  if (svgOnClick != undefined) svgOnClick(e);
  
  ctxMenu.style.display = 'none';
};

svg.oncontextmenu = function(e){
  appMouse.ctxPos.x = e.clientX;
  appMouse.ctxPos.y = e.clientY;
  
  ctxMenu.style.top = 'calc(' + e.clientY + 'px - 1em)';
  ctxMenu.style.left = e.clientX + 'px';
  ctxMenu.style.display = 'inline-block';
  
  window.event.returnValue = false;
};

var ctxUL = document.createElement('ul');
ctxMenu.appendChild(ctxUL);

for (var prop in Nodes){
  var subLi = document.createElement('li');
  subLi.textContent = prop;
  
  var ul = document.createElement('ul');
  subLi.appendChild(ul)
  ctxUL.appendChild(subLi);
  
  var sub = [];
  for (var i = 0; i < Nodes[prop].length; i++){
    var li = document.createElement('li');
    li.dataset.prop = prop;
    li.dataset.index = i;
    
    li.textContent = Nodes[prop][i].name;
    li.onclick = function(e){
      var nProp = Nodes[this.dataset.prop];
      var node = nProp[this.dataset.index * 1];
      
      var guiNode = new XG5.GUINode({ name: node.name });
      for (var j = 0; j < node.inputs.length; j++){
        var type = node.types[j] == 'i' ? 'input' : 'connection';
        guiNode.addInput(node.inputs[j], type);
      }
      
      guiNode.moveTo(appMouse.ctxPos);
      
      appMouse.ctxPos.x = 0;
      appMouse.ctxPos.y = 0;
      ctxMenu.style.display = 'none';
      
      guiNode.initUI();
    };
    
    ul.appendChild(li);
  }
}