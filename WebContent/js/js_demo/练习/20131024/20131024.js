var c=document.getElementById("myCanvas");
if(c.getContext){
  var cxt=c.getContext("2d");
  console.log(cxt);
 
 //���Ͻǿ�ʼ��0,0��
 //���ƺ�ɫ����
  cxt.fillStyle="#ff0000";
  cxt.fillRect(10,10,50,50);
  
  //���ư�͸����ɫ����
  cxt.fillStyle="rgba(0,0,225,0.5)";
  cxt.fillRect(30,30,50,50);
  
  /*
  cxt.strokeStyle = "#ff0000":
  cxt.strokeRect(10,10,50,50);
  
  //���ư�͸����ɫ��߾���
  cxt.strokeStyle = "rgba(0,0,225,0.5)";
  cxt.strokeRect(30,30,50,50);
  
  */
  
  cxt.clearRect(40,40,10,10);
}
