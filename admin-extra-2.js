(function(){
  const works = document.getElementById("works");
  const services = document.getElementById("services");
  const quickAdd = document.getElementById("quickAdd");
  const quickAddService = document.getElementById("quickAddService");

  if(quickAdd){
    quickAdd.style.display = works?.classList.contains("active") ? "inline-flex" : "none";
  }

  if(quickAddService){
    quickAddService.style.display = services?.classList.contains("active") ? "inline-flex" : "none";
  }
})();
