(function(){
  const MAX_DESCRIPTION_LENGTH = 500;

  function applyDescriptionLimits(root = document){
    const selectors = [
      "#projectDescription",
      "#seDescription",
      "#serviceDescription",
      'textarea[name="description"]',
      'textarea[data-field="description"]'
    ];

    selectors.forEach(selector => {
      root.querySelectorAll?.(selector).forEach(field => {
        field.maxLength = MAX_DESCRIPTION_LENGTH;

        if(field.value && field.value.length > MAX_DESCRIPTION_LENGTH){
          field.value = field.value.slice(0, MAX_DESCRIPTION_LENGTH);
        }

        if(field.dataset.max500Bound === "1") return;
        field.dataset.max500Bound = "1";

        field.addEventListener("input", () => {
          if(field.value.length > MAX_DESCRIPTION_LENGTH){
            field.value = field.value.slice(0, MAX_DESCRIPTION_LENGTH);
          }
        });
      });
    });
  }

  applyDescriptionLimits();

  const observer = new MutationObserver(() => applyDescriptionLimits());
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });
})();
