Parallax.DragDropControl = function(stage, camera, options){
  var options = options || {allowX: true, allowY: true, considerScale: false};

  this.allowX = options.allowX;
  this.allowY = options.allowY;
  this.automove = options.automove;
  this.canvas = options.canvas;
  this.stage = stage;
  this.camera = camera;

  this.considerScale = options.considerScale;
  this.dragging = false;
  this.handleMouseDown = _.bind(this.handleMouseDown, this);
  this.handleMouseUp = _.bind(this.handleMouseUp, this);
  this.handleMouseMove = _.bind(this.handleMouseMove, this);
  
  //stage.mouseupoutside = stage.mouseup = this.handleMouseUp;
  //stage.mousedown = this.handleMouseDown;
  this.stage.mousemove = this.handleMouseMove;

  this.accelerationX = 0;
  this.speedX = 0;


  var _this = this;

  var mc = new Hammer($('canvas').get(0));
  mc.add(new Hammer.Tap({ event: 'touch', taps: 1, interval:15, time:10 }));
  
  mc.on("panstart", function(ev){
    _this.saveContext(ev.center.x, ev.center.y);
  });

  mc.on("pan", function(ev){
    _this._dragCamera(ev.deltaX, ev.deltaY);
  });
}

Parallax.DragDropControl.prototype = {
  saveContext: function(sx,sy){
    this.mouseStart = {
      x: sx,
      y: sy
    };

    this.cameraStart = {
      x: this.camera.position[0],
      y: this.camera.position[1]
    }

  },
  reset: function(){
    this.speedX = 0;
    this.camera.reset();

    if(this.onChange){
      this.onChange.call();
    }
  },

  handleMouseDown: function(e){
    this.dragging = true;
    this.speedX = 0;
    this.saveContext(e.global.x, e.global.y);
    
  },
  update: function(){
    if(this.dragging || !this.automove){
      return;
    }
    
    this.camera.position[0] += this.speedX;
    
    if(this.camera.position[0] < 0){
      //this.camera.position[0] = 0;
    }
  },

  _slideCamera: function(x, y){
    var w = this.canvas.clientWidth;
    var h = this.canvas.clientHeight;
    
    var dx = x - w/2;
    //this.speedX = (e.global.x - w/2)/w * 10;
    //this.speedX = Math.min(-10, Math.max(this.speedX, 10));
    
    //this.accelerationX = - dx/w*2;

    //if( (this.speedX ^ (-dx) ) < 0){//different signs == different directions
      //this.speedX = 0;//reset, opposite direction
    //}

    this.speedX = dx/w * 10;
  },

  _dragCamera: function(dx, dy){
    this.speedX = 0;

    var scaleCompensationX = this.camera.scale[0];
    var scaleCompensationY = this.camera.scale[1];
    if(!this.considerScale){
      //clear out compensation, so moving is the same speed in every
      //camera scaling position (slower when zoomed out, faster when zoomed in)
      scaleCompensationX = 1;
      scaleCompensationY = 1;
    }
    
    if(this.allowX){
      this.camera.position[0] = this.cameraStart.x - dx * scaleCompensationX;
    }

    if(this.allowY){
      this.camera.position[1] = this.cameraStart.y - dy * scaleCompensationY;
    }
    
    //keep direction sliding
    //var w = this.canvas.clientWidth;
    //this.accelerationX = - dx/w*2;

    //if( (this.speedX ^ (-dx) ) < 0){//different signs == different directions
    //  this.speedX = 0;//reset
    //}

    if(this.onChange){
      this.onChange.call();
    }
  },

  handleMouseMove: function(e){
    if(this.dragging){
      var dx = e.global.x - this.mouseStart.x;
      var dy = e.global.y - this.mouseStart.y;

      this._dragCamera(dx, dy)
    }else{
      this._slideCamera(e.global.x, e.global.y);
    }
  },
  
  handleMouseUp: function(e){
    this.dragging = false;
  }
}