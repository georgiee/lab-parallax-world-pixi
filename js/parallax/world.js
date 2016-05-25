Parallax.Object3D = function(options){
  var options = options || {};
  options.position = options.position || {x:0,y:0,z:0};
  options.pivot = options.pivot || {x:0,y:0};
  options.scale = options.scale || {x:1,y:1};
  
  this.position = vec3.fromValues(options.position.x,options.position.y,options.position.z);
  this.pivot = vec2.fromValues(options.pivot.x,options.pivot.y);
  this.scale = vec2.fromValues(options.scale.x, options.scale.y);


  Object.defineProperty(this, "px", {
    set: function (value) { this.position[0] = value; },
    get: function () { return this.position[0]; }
  });

  this.rotation = 0;

  this.getMatrix = function(){
    var mat = mat4.identity([]);
    mat4.translate(mat, mat, this.position);
    mat4.scale(mat, mat, this.scale);

    return mat;
  }
}

Parallax.Camera = function(){
  this.focalLength = 1000;
  this.position = vec3.create();
  this.pivot = vec2.fromValues(0,0);
  this.scale = vec2.fromValues(1,1);

  Object.defineProperty(this, "pivotx", {
    set: function (value) { this.pivot[0] = value; },
    get: function () { return this.pivot[0]; }
  });
  Object.defineProperty(this, "pivoty", {
    set: function (value) { this.pivot[1] = value; },
    get: function () { return this.pivot[1]; }
  });

  this.getProjectedScale = function(depth){
    return this.focalLength / (this.focalLength + depth);
  }

  this.reset = function(){
    vec3.set(this.position, 0, 0, 0);
  }

  this.getMatrix = function(parallaxVector){
    var mat = mat2d.identity([]);
    var pos = vec3.copy([], this.position);
    var parallaxInvert = [1/parallaxVector[0], 1/parallaxVector[1]];
    
    pos = vec2.multiply([], pos, parallaxVector) //apply parallax factor to position
    
    //move everything to the pivot of the camera
    mat2d.translate(mat, mat, [this.pivot[0], this.pivot[1] ]);

    //fix the center to scale the parallax (flip y)
    mat2d.translate(mat, mat, [0, -this.pivot[1] ]);
    mat2d.scale(mat, mat, parallaxInvert);//inverse of parallax scale so that nearer objects are large not smaller
    mat2d.translate(mat, mat, [0, this.pivot[1] ]);

    //flip y
    mat2d.translate(mat, mat, [0, -this.pivot[1]]);//flip by neg y pivot
    //2. move them but with parallax factor included (slow movement of far object)
    //now we are transformed, adjust camera pivot, so that the view is centered on the pivot
    mat2d.translate(mat, mat, pos); //apply position
    //apply scale around pivot point to scale relatie to the center of the pivot (here: center of canvas)    
    mat2d.scale(mat, mat, this.scale); //apply camera scale
    //clear the pivot of the camera
    
    mat2d.translate(mat, mat, [-this.pivot[0], -this.pivot[1] ]);
    return mat;
  }
}

Parallax.Camera.prototype = {
  updateMatrix: function(){

  }  
}

Parallax.DeepWorld = function(canvas){
  this.__super__.call(this);
  
  this.canvas = canvas;
  this.camera = new Parallax.Camera();
  
  this.getCamera = function(){
    return this.camera;
  }
}

Parallax.DeepWorld.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
Parallax.DeepWorld.prototype.__super__ = PIXI.DisplayObjectContainer;

Parallax.DeepWorld.prototype.update = function(){
  var child;

  for(var i=0, l=this.children.length;i<l;i++){
    child = this.children[i];
    this.applyProjection(child);
  }
}
Parallax.DeepWorld.prototype.depthSort = function(a ,b){
  return b.object3D.position[2] - a.object3D.position[2]
}

Parallax.DeepWorld.prototype.add = function(child, object3D){
    object3D.__id = child.__id;

  child.object3D = object3D;
  object3D.parent = child;
  var ss = this.camera.getProjectedScale(object3D.position[2])

  var pivox = 1359/2;
  var dx =  + (1 - ss)*1/ss*(-pivox)
  //child.object3D.position[0] = child.object3D.position[0] + dx;
  
  if(child.__id == 'patterns/UV_Grid_Sm.jpg' && child.alpha < 1){
    console.log(dx);
  }

  this.addChild(child);
  this.children.sort(this.depthSort);
}

Parallax.DeepWorld.prototype.applyProjection = function(child){
  var camera = this.camera;
  var object3D = child.object3D;
  child.pivot.x = object3D.pivot[0];
  child.pivot.y = object3D.pivot[1];

  var depth = object3D.position[2] - camera.position[2];
  var projectionScale = camera.getProjectedScale(depth);
  var originScale = camera.getProjectedScale(object3D.position[2]);
  var vecParallax = [projectionScale, projectionScale];

  //view matrix is just he inverse of the camera view
  var cameraMatrix = camera.getMatrix(vecParallax);
  var viewMatrix = mat2d.invert([], cameraMatrix);
  
  //important!
  //move everything to the left of the screen (aligned left) according to the own depth (not relative to the camera like in projectionScale)
  var dx =  (1 - 1/originScale) * camera.pivot[0]; 
  mat2d.translate(viewMatrix, viewMatrix, [dx, 0, 0])

  //that's is, our translation is solely based on the camera, now apply to the object itself
  //position = vec3.subtract([], position, object3D.pivot);
  var position = vec3.copy([], object3D.position)// - (1 - parallaxVector[0]) * this.pivot[0])

  vec2.transformMat2d(position, position, viewMatrix)

  child.position.x = position[0];// + camera.pivot[0];// - this.canvas.clientWidth/2;
  child.position.y = position[1];
  
  child.scale.set(object3D.scale[0] * viewMatrix[0], object3D.scale[1] * viewMatrix[3]);
}