chrome.tabs.onUpdated.addListener(function(tabId, tab) {
    if(tab.url && tab.url.includes("flexstudent.nu.edu.pk/Student/StudentMarks")){
        const queryParameters = tab.url.split("?")[1];
        const urlParameters = new URLSearchParams(queryParameters);
        chrome.tabs.sendMessage(tabId, {
            type:"NEW",
            semesterId: urlParameters.get("semid"),
        });
    }
});