var XG5 = window.XG5 || {};
//if (!jQuery) alert('Must include jQueryUI');

(function(sys){
  if (sys.GUINode) return;

  // SVG Setup
  var svgNS = "http://www.w3.org/2000/svg";  

  var svg = document.createElementNS(svgNS, 'svg');
  svg.id = 'node-graph';
  svg.ns = svg.namespaceURI;
  document.getElementById("diag").appendChild(svg);
  
  // function createCircle()
  // {
  //     var myCircle = document.createElementNS(svgNS,"circle"); //to create a circle. for rectangle use "rectangle"
  //     myCircle.setAttributeNS(null,"id","mycircle");
  //     myCircle.setAttributeNS(null,"cx",100);
  //     myCircle.setAttributeNS(null,"cy",100);
  //     myCircle.setAttributeNS(null,"r",50);
  //     myCircle.setAttributeNS(null,"fill","black");
  //     myCircle.setAttributeNS(null,"stroke","none");
  
  //     document.getElementById("node-graph").appendChild(myCircle);
  // }     
  // createCircle()

  function createPath(a, b){
    var diff = {
      x: b.x - a.x,
      y: b.y - a.y
    };
    
    var pathStr = [
      'M' + a.x + ',' + a.y + ' C',
      a.x + diff.x / 3 * 2 + ',' + a.y + ' ',
      a.x + diff.x / 3 + ',' + b.y + ' ',
      b.x + ',' + b.y
    ].join('');
    
    return pathStr;
  }
  
  var mouse = {
    currentInput: undefined
  };
  
  svg.onmousemove = function(e){
    if (mouse.currentInput){
      var path = mouse.currentInput.path;
      var inputPt = mouse.currentInput.getAttachPoint();
      var outputPt = {x: e.pageX, y: e.pageY};
      var val = createPath(inputPt, outputPt);
      path.setAttributeNS(null, 'd', val);
    }
  };
  
  svg.onclick = function(e){
    if (mouse.currentInput){
      mouse.currentInput.path.removeAttribute('d');
      
      if (mouse.currentInput.node)
        mouse.currentInput.node.detachInput(mouse.currentInput);
      
      mouse.currentInput = undefined;
    }
  };
  
  var getFullOffset = function(e){
    var offset = {
      top: e.offsetTop,
      left: e.offsetLeft
    };
    
    if (e.offsetParent){
      var parentOff = getFullOffset(e.offsetParent);
      offset.top += parentOff.top;
      offset.left += parentOff.left;
    }
    
    return offset;
  };
  
  function node(options){
    this.name = ' ';
    this.value = '';
    this.isRoot = false;
    
    for (var prop in options)
      if (this.hasOwnProperty(prop))
        this[prop] = options[prop];
    
    this.inputs = [];
    this.attachedPaths = [];
    this.connected = false;
    
    this.domElement = document.createElement('div');
    this.domElement.classList.add('x-node');
    this.domElement.setAttribute('title', this.name);
    
    var outputDom = document.createElement('span');
    outputDom.classList.add('x-output');
    outputDom.textContent = ' ';
    
    if (this.isRoot)
      outputDom.classList.add('hide');
    
    this.domElement.appendChild(outputDom);
    
    var that = this;
    outputDom.onclick = function(e){
      if (mouse.currentInput && !that.ownsInput(mouse.currentInput)){
        that.connectTo(mouse.currentInput);
        mouse.currentInput = undefined;
      }
      
      e.stopPropagation();
    };
  }
  
  function nodeInput(options){
    this.name = '';
    this.type = 'connection';
    
    for (var prop in options)
      if (this.hasOwnProperty(prop))
        this[prop] = options[prop];
    
    this.node = undefined;
    
    this.domElement = document.createElement('div');
    this.domElement.textContent = this.name;
    this.domElement.title = this.name;
    
    this.domElement.classList.add('x-' + this.type);
    this.domElement.classList.add('empty');
    
    var that = this;
    if (this.type == 'input'){
      var input = document.createElement('input');
      Object.defineProperty(that, 'value', {
        get: function(){ return input.value; },
        set: function(val){ input.value = val },
        enumerable: true
      });
      this.domElement.textContent += ' ';
      this.domElement.appendChild(input);
    }
    
    this.path = document.createElementNS(svg.ns, 'path');
    this.path.setAttributeNS(null, 'stroke', '#8e8e8e');
    this.path.setAttributeNS(null, 'stroke-width', '2');
    this.path.setAttributeNS(null, 'fill', 'none');
    svg.appendChild(this.path);
    
    if (this.type == 'connection'){
      this.domElement.onclick = function(e){
        if (mouse.currentInput){
          if (mouse.currentInput.path.hasAttribute('d'))
            mouse.currentInput.path.removeAttribute('d');
          if (mouse.currentInput.node){
            mouse.currentInput.node.detachInput(mouse.currentInput);
            mouse.currentInput.node = undefined;
          }
        }
        
        mouse.currentInput = that;
        if (that.node){
          that.node.detachInput(that);
          that.domElement.classList.remove('filled');
          that.domElement.classList.add('empty');
        }
        
        e.stopPropagation();
      };
    }
  }
  
  nodeInput.prototype = {
    getAttachPoint: function(){
      var offset = getFullOffset(this.domElement);
      return {
        x: offset.left + this.domElement.offsetWidth - 2,
        y: offset.top + this.domElement.offsetHeight / 2
      };
    }
  };
  
  node.prototype = {
    getOutputPoint: function(){
      var fchild = this.domElement.firstElementChild;
      var offset = getFullOffset(fchild);
      return {
        x: offset.left + fchild.offsetWidth / 2,
        y: offset.top + fchild.offsetHeight / 2
      };
    },
    addInput: function(name, type){
      var options = {};
      options.name = name;
      type === undefined ? true : options.type = type;
      
      var input = new nodeInput(options);
      this.inputs.push(input);
      this.domElement.appendChild(input.domElement);
      
      return input;
    },
    detachInput: function(input){
      var index = -1;
      for (var i = 0; i < this.attachedPaths.length; i++){
        if (this.attachedPaths[i].input == input)
          index = i;
      }
      
      if (index >= 0){
        this.attachedPaths[index].path.removeAttribute('d');
        this.attachedPaths[index].input.node = undefined;
        this.attachedPaths.splice(index, 1);
      }
      
      if (this.attachedPaths.length <= 0)
        this.domElement.classList.remove('connected');
    },
    ownsInput: function(input){
      for (var i = 0; i < this.inputs.length; i++){
        if (this.inputs[i] == input)
          return true;
      }
      
      return false;
    },
    updatePosition: function(){
      var outputPt = this.getOutputPoint();
      
      for (var i = 0; i < this.attachedPaths.length; i++){
        var inputPt = this.attachedPaths[i].input.getAttachPoint();
        var pathStr = createPath(inputPt, outputPt);
        this.attachedPaths[i].path.setAttributeNS(null, 'd', pathStr);
      }
      
      for (var j = 0; j < this.inputs.length; j++){
        if (this.inputs[j].node === undefined) continue;
        
        var inputPt = this.inputs[j].getAttachPoint();
        var outputPt = this.inputs[j].node.getOutputPoint();
        
        var pathStr = createPath(inputPt, outputPt);
        this.inputs[j].path.setAttributeNS(null, 'd', pathStr);
      }
    },
    connectTo: function(input){
      input.node = this;
      this.connected = true;
      this.domElement.classList.add('connected');
      
      input.domElement.classList.remove('empty');
      input.domElement.classList.add('filled');
      
      this.attachedPaths.push({
        input: input,
        path: input.path
      });
      
      var inputPt = input.getAttachPoint();
      var outputPt = this.getOutputPoint();
      
      var pathStr = createPath(inputPt, outputPt);
      input.path.setAttributeNS(null, 'd', pathStr);
    },
    moveTo: function(point){
      this.domElement.style.top = point.y + 'px';
      this.domElement.style.left = point.x + 'px';
      this.updatePosition();
    },
    initUI: function(){
      var that = this;
      
      // this.draggable({         // was JQ
      //   containment: 'window',
      //   cancel: '.x-connection, .x-output, .x-input',
      //   drag: function(e, ui){
      //     that.updatePosition();
      //   }
      // });
      
      this.domElement.style.position = 'absolute';
      document.body.appendChild(this.domElement);
      this.updatePosition();
    }
  };
  
  sys.GUINode = node;
})(XG5);