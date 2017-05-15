 var hub = io.connect(window.location.origin);

function sendSolutionNumber(){
  hub.emit("solution", {
    number : 1
    }); 
}
sendSolutionNumber();
   
// Pour eviter la désync 
hub.on("callMobile",function(event) {
    if(event.needSolution){
      sendSolutionNumber();
    }

});