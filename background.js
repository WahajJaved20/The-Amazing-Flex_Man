// chrome.tabs.onUpdated.addListener(function(tabId,changeInfo, tab) {
//     chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
//         var currentTab = tabs[0];
//         var url = currentTab.url;
//         if(url && url.includes("flexstudent.nu.edu.pk/Student/StudentMarks?semid")){
//             const queryParameters = url.split("?")[1];
//             const urlParameters = new URLSearchParams(queryParameters);
//             console.log(urlParameters);
//             if (changeInfo.status === 'complete') {
//                 chrome.scripting.executeScript(tabId, { code: 'document.documentElement.outerHTML' }, function (result) {
//                   if (chrome.runtime.lastError) {
//                     console.error(chrome.runtime.lastError);
//                   } else {
//                     var sourceCode = result[0];
//                     console.log('Page Source Code:', sourceCode);
//                   }
//                 });
//               }
//             // chrome.tabs.sendMessage(tabId, {
//             //     type:"NEW",
//             //     semesterId: urlParameters.get("semid"),
//             // });
//         }
       
//     });
    
// });
// chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
//   if (changeInfo.status === 'complete') {
//     chrome.scripting.executeScript(tabId, { code: 'document.documentElement.outerHTML' }, function (result) {
//       if (chrome.runtime.lastError) {
//         console.error(chrome.runtime.lastError);
//       } else {
//         var sourceCode = result[0];
//         console.log('Page Source Code:', sourceCode);
//       }
//     });
//   }
// });

chrome.action.onClicked.addListener((tab) => {
    chrome.scripting.executeScript(
      {
        target: { tabId: tab.id },
        files: ["contentScript.js"],
      },
      () => {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError);
        }
      }
    );
  });
  
  