var c=document.getElementById("myCanvas");
if(c.getContext){
  var cxt=c.getContext("2d");
  console.log(cxt);
 
 //左上角开始（0,0）
 //绘制红色矩形
  cxt.fillStyle="#ff0000";
  cxt.fillRect(10,10,50,50);
  
  //绘制半透明蓝色矩形
  cxt.fillStyle="rgba(0,0,225,0.5)";
  cxt.fillRect(30,30,50,50);
  
  /*
  cxt.strokeStyle = "#ff0000":
  cxt.strokeRect(10,10,50,50);
  
  //绘制半透明蓝色描边矩形
  cxt.strokeStyle = "rgba(0,0,225,0.5)";
  cxt.strokeRect(30,30,50,50);
  
  */
  
  cxt.clearRect(40,40,10,10);
}
