Parallax.CameraScrollControl = function(stage, camera, options){
  var options = options || {};

  var camera = camera;
  var stage = stage;

  var speed = 0;
  var acceleration = 0;
  var maxspeed = 50;
  
  var handleScroll = function(event){
    event.preventDefault();
    if(Math.abs(event.deltaX) > Math.abs(event.deltaY)){
      acceleration = -event.deltaX;
    }else{
      acceleration = -event.deltaY;
    }
    
    acceleration = acceleration/50;
  }
  handleScroll = _.bind(handleScroll, this);
  
  this.update = function(){
    speed += acceleration;

    if(speed == 0){
      return;
    }

    if(speed > maxspeed){
      speed = maxspeed
    }else if(speed < -maxspeed){
      speed = -maxspeed;
    }

    speed *= 0.95;
    
    if(Math.abs(speed) < 0.1){
      speed = 0;
    }

    camera.position[0] += speed;
    acceleration = 0;
  } 


  $('#scene-canvas').on('mousewheel',handleScroll);
    
}