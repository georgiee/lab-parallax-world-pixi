Parallax.Goonie = function(world){
  var goonie = Parallax.Characters.create("goonie/goonie-", 9);
  goonie.play();

  

  var create = function(){
    world.add(goonie, new Parallax.Object3D({
      position: {x: 1000, y: -200, z: -300},
      scale: {x:2, y: 2},
      pivot: {x:38/2, y: 55}
    })); 
    
    var repeatCounter = 0;
    TweenMax.to(goonie.object3D, 10, {px: 300, repeat:-1, yoyo:true,ease: Linear.easeOut, onRepeat: function(){
      repeatCounter++;
      goonie.object3D.scale[0] = goonie.object3D.scale[0] * (2*repeatCounter%2 - 1)
    }});

  }

  create();
}
Parallax.Characters = {

  create: function(name, count, speed, padsize){
    padsize = padsize || 2;
    var textures = [];
    for (var i=0; i < count; i++){
       var texture = PIXI.Texture.fromFrame(name + _.padLeft(i+1, padsize, '0') + ".png");
       textures.push(texture);
    };
    var animation = new PIXI.MovieClip(textures);
    //animation.scale.set(4,4);
    animation.animationSpeed = speed || 0.2;

    return animation;
  }
}

Parallax.Scene04 = function(params){
  this.params = params;
  this.initialize();
}

Parallax.Scene04.prototype = {
  initialize: function(){
    this.create = _.bind(this.create, this);
    this.update = _.bind(this.update, this);
  },
  
  buildPixi: function(){
    var params = params;

    this.stage = new PIXI.Stage(0x333333);
    this.canvas = document.getElementById('scene-canvas');
    this.renderer = PIXI.autoDetectRenderer(600,400,  {view: this.canvas, resolution: 1});
  },

  run: function(){
    this.preload([
      "assets/sprites/nintendo-0.json",
      "assets/UV_Grid_Sm.jpg",
      "assets/objects.json"
    ]);
  },
  
  reset: function(){
    this.cameraControl.reset();
  },
  validateSound: function(){
    if(this.params.muted){
      this.ambientMusic.pause();
    }else{
      if(!this.ambientMusic){
        this.ambientMusic = new Howl({
          urls: ['assets/sound/DeserveToBeLoved.mp3', 'assets/sound/DeserveToBeLoved.ogg'],
          loop: true,
          volume: 0.5,
        }).play()
      }else{
        this.ambientMusic.play()
      }
    }
  },

  create: function(){
    this.handleItemOver = _.bind(this.handleItemOver, this);
    this.handleItemOut = _.bind(this.handleItemOut, this);
    this.handleItemClick = _.bind(this.handleItemClick, this);

    this.buildPixi();

    var worldJSON = this.loader.getJSON('assets/objects.json');
    this.world = new Parallax.DeepWorld(this.canvas);

    this.stage.addChild(this.world);
    
    this.cameraControl = new Parallax.DragDropControl(this.stage, this.world.getCamera(),{
      automove: this.params.controls.automove,
      allowX: this.params.controls.allowX,
      allowY: this.params.controls.allowY,
      considerScale: this.params.controls.considerScale,
      canvas: this.canvas
    });
    
    this.camera = this.world.getCamera();

    this.scrollCameraControl = new Parallax.CameraScrollControl(this.stage, this.world.getCamera());
    
    this.cameraControl.onChange = _.bind(function(){
      var camera = this.cameraControl.camera;
      var params = this.params;
      params.camera.x = camera.position[0];
      params.camera.y = camera.position[1];
    }, this);


    var sprite;
    for(var i =0, l = worldJSON.items.length; i<l; i++){
      var objectData = worldJSON.items[i];
      sprite = this.itemFactory(objectData);

      this.world.add(sprite, new Parallax.Object3D({
        position: objectData.position,
        scale: objectData.scale,
        pivot: objectData.pivot
      }));
    }
    
    var texture = PIXI.Texture.fromFrame('patterns/chessboard.jpg');
    
    this.chessboardBackground = new PIXI.TilingSprite(texture, this.canvas.clientWidth, this.canvas.clientHeight);  
    this.chessboardBackground.alpha = 1;
    //this.chessboardBackground.pivot.x = this.canvas.clientWidth/2;
    //this.chessboardBackground.pivot.y = this.canvas.clientHeight/2;

    this.stage.addChildAt(this.chessboardBackground, 0);
    this.createSky(worldJSON.sky);

    this.createYoshi();
    this.createSNES();
    this.createHUD();
    this.update();
  },
  
  createHUD: function(){
    var hudContainer = new PIXI.DisplayObjectContainer();
    var hudbar = PIXI.Sprite.fromFrame('other/healthbar.png');
    hudbar.anchor.x = 0.5;
    
    //hud container is aligned to the bottom, add 100 so we are in a distance of 100 to th bottom
    hudbar.anchor.y = 1;
    hudbar.pivot.y = 50;
    hudContainer.addChild(hudbar)
    
    var hudicon = PIXI.Sprite.fromFrame('other/sonic-icon.png');
    hudicon.y = -75;
    hudicon.x = -100;
    hudContainer.addChild(hudicon);

    this.hudContainer = hudContainer;
    this.stage.addChild(this.hudContainer);
  },

  createSNES: function(){
    var apu = Parallax.Characters.create("apu/apu-", 7,0.1,1);
    apu.play();

    this.world.add(apu, new Parallax.Object3D({
      position: {x: 2237, y: -141, z: 1},
      scale: {x:3, y: 3},
      anchor: {x:0, y: 1}
    }));
  },

  createYoshi:function(){
    var goonie = new Parallax.Goonie(this.world)

    var shyguy = Parallax.Characters.create("danceguy/danceguy-", 19);
    shyguy.anchor = {x:0.5, y:0.9};
    shyguy.play();
    //this.stage.addChild(shyguy);
   this.world.add(shyguy, new Parallax.Object3D({
      position: {x: 110, y: 0, z: 0},
      scale: {x:2, y: 2},
    }));


   var shyguy2 = Parallax.Characters.create("danceguy/danceguy-", 19);
    shyguy2.anchor = {x:0.5, y:1};
    shyguy2.play();
    //this.stage.addChild(shyguy2);
   this.world.add(shyguy2, new Parallax.Object3D({
      position: {x: 2000, y: 0, z: 0},
      scale: {x:2, y: 2},
      anchor: {x:0, y: 0.9}
    }));


   var shyguy3 = Parallax.Characters.create("danceguy/danceguy-", 19);
   shyguy3.anchor = {x:0.5, y:0.9};
    shyguy3.play();
    //this.stage.addChild(shyguy3);
   this.world.add(shyguy3, new Parallax.Object3D({
      position: {x: 3000, y: 0, z: 0},
      scale: {x:2, y: 2},
      anchor: {x:0, y: 1}
    }));
  },

  createSky: function(skyList){
    var skyLayer = new PIXI.DisplayObjectContainer();
    var skyLayerObject = new Parallax.Object3D({position: { x:0, y:0, z: 1100}, pivot:{x:0,y:0},scale:{x:1,y:1} });
    skyLayer.__id = 'sky';
    this.world.add(skyLayer, skyLayerObject);

    var offsetX = 0;
    for(var i =0, l = skyList.length; i<l; i++){
      var skyPart = this.itemFactory(skyList[i]);
      skyPart.x = offsetX;
      offsetX += skyPart.width * skyPart.scale.x;

      skyLayer.addChild(skyPart);
    }

    this.skyLayer = skyLayer;
  },
  
  itemFactory: function(objectData){
    var texture;

    var defaults = {
      atlas: true,
      alpha: 1,
      tiling: false,
      tileScale: 1,
      interactive: false,
      pivot: {
        x: 0,
        y: 0
      },
      anchor: {
        x: 0,
        y: 0
      },
      position: {
        x: 0,
        y: 0,
        z: 0
      },
      scale: {
        x: 1,
        y: 1
      },
      rotation: 0
    }

    objectData = _.defaults(objectData, defaults)
    if(objectData.atlas){
      texture = PIXI.Texture.fromFrame(objectData.id);
    }else{
      texture = PIXI.Texture.fromImage(objectData.id);
    }
    
    if(objectData.tiling){
      sprite = new PIXI.TilingSprite(texture, objectData.size.width, objectData.size.height);
      sprite.tileScale.set(objectData.tileScale, objectData.tileScale);
    }else{
      sprite = new PIXI.Sprite(texture, 300, 300);  
    }
    sprite.alpha = objectData.alpha;

    if(objectData.interactive){
      sprite.interactive = true;
      sprite.mousedown = sprite.touchstart = this.handleItemClick;
      sprite.mouseover = this.handleItemOver;
      sprite.mouseout = this.handleItemOut;
    }
    sprite.anchor.set(objectData.anchor.x, objectData.anchor.y);
    sprite.pivot.set(objectData.pivot.x, objectData.pivot.y)
    sprite.scale.x = objectData.scale.x;
    sprite.scale.y = objectData.scale.y;
    sprite.__id = objectData.id;

    return sprite;
  },
  handleItemOver: function(e){
    e.target.alpha = 0.8;
  },
  handleItemOut: function(e){
    e.target.alpha = 1;
  },
  handleItemClick: function(e){
    modalVideoWindow.open(); //modalVideoWindow is a global reference
  },

  preload: function(items){
    var loader = new PIXI.AssetLoader(items);
    loader.JSON_STORE = [];
    loader.getJSON = function(id){
        return loader.JSON_STORE[id];
    }

    loader.on('onProgress', function(evt){
      var l = evt.content.loader;
      if(l.url && (l.url.indexOf('.json') != -1) ){
        layerItems = l.json.items;
        loader.JSON_STORE[l.url] = l.json
      } 
    });

    this.loader = loader;
    
    loader.onComplete = this.create;
    loader.load();
  },
  
  update: function(){
    stats.begin();

    var safeband = 260;
    
    var camera = this.cameraControl.camera;
    this.cameraControl.update();
    this.hudContainer.x = this.canvas.clientWidth/2;
    this.hudContainer.y = this.canvas.clientHeight;
    
    this.scrollCameraControl.update();

    //pivot of the camera is always 400px from the bottom- so we can maintain
    //a "safe band" of 260px aligned to the bottom of the viewport
    camera.scale[0] = camera.scale[1] = 1/this.params.camera.scale;
    
    camera.pivot[0] = this.canvas.clientWidth/2 + this.params.camera.offsetPivotX; //center of the screen
    camera.pivot[1] = this.canvas.clientHeight - safeband + this.params.camera.offsetPivotY;
    
    //this.world.x = camera.pivot[0]
    //this.world.y = camera.pivot[1]
    var chessScale = this.camera.getProjectedScale(9000); //calcualte scale at z-depth of 2000
    this.chessboardBackground.tilePosition.x = -camera.position[0] * chessScale;
    this.chessboardBackground.tilePosition.y = -camera.position[1] * chessScale;
    this.chessboardBackground.width = this.canvas.clientWidth;
    this.chessboardBackground.height = this.canvas.clientHeight;
    


    this.renderer.resize(this.canvas.clientWidth, this.canvas.clientHeight);
    //this.renderer.resize(1200, 800);
    this.world.update();
    //this.tilingSprite.tilePosition.x+=10
    this.renderer.render(this.stage);

    requestAnimFrame(this.update);
    stats.end();
  }
}