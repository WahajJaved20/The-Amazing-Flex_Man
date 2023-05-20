// (()=>{
//     chrome.runtime.onMessage.addListener((message, sender, sendResponse)=>{
//         const {type, semesterId} = message;
//         let currentSemester;
//         if(type === "NEW"){
//             currentSemester = semesterId;

//         }
//     })
//     // const data = document.getElementsByClassName("m-grid m-grid--hor m-grid--root m-page");
//     // console.log(data);
// })
chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const tabId = tabs[0].id;
  
    chrome.scripting.executeScript(
      {
        target: { tabId: tabId },
        function: getPageSourceCode,
      },
      (result) => {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError);
        } else {
          const sourceCode = result[0].result;
          console.log("Page Source Code:", sourceCode);
        }
      }
    );
  });
  
  function getPageSourceCode() {
    return document.documentElement.outerHTML;
  }
  