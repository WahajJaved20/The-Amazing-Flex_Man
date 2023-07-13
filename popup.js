document.addEventListener("DOMContentLoaded", function() {
  var getHtmlButton = document.getElementById("getHtmlButton");
  getHtmlButton.textContent = "Calculate Summary :D";
  getHtmlButton.addEventListener("click", function() {
    chrome.runtime.sendMessage({ action: "getHTMLCode" });
  });
  const generatePdfButton = document.getElementById("generate-pdf");
  generatePdfButton.addEventListener("click", function() {
      chrome.runtime.sendMessage({ action: "generatePDF"});
});
})
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.action === "htmlCode") {
    var htmlCode = message.data;
    var tables = extractTables(htmlCode);
    var selector = "#accordion"
    const extractedText = extractTextFromElements(htmlCode, selector);
    clearTableRows()
    const results = makeResultArrays(tables, extractedText);
    populateTable(results, extractedText)
    }
    if (message.action === "generatePDF") {
       generatePdf(message.data)
      };

});
function populateTable(results, text) {
  var tableBody = document.querySelector("#marksTable tbody");
    for (var i = 0; i < results.length; i++) {
      var row = document.createElement("tr");
      for (var j = 0; j < 3; j++) {
        var cell = document.createElement("td");
        cell.textContent = results[i][j];
        row.appendChild(cell);
      }
      tableBody.appendChild(row);
  };
}
function extractTables(htmlCode) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlCode, "text/html");
  const tables = doc.querySelectorAll("table");
  
  const tableData = [];
  
  tables.forEach(table => {
    const rows = table.rows;
    const tableRows = [];
    
    for (let i = 0; i < rows.length; i++) {
      const rowData = [];
      const cells = rows[i].cells;
      
      for (let j = 0; j < cells.length; j++) {
        const cellData = cells[j].innerText.trim();
        rowData.push(cellData);
      }
      
      tableRows.push(rowData);
    }
    
    tableData.push(tableRows);
  });
  
  return tableData;
}
function clearTableRows() {
  var tableBody = document.querySelector("#marksTable tbody");
  tableBody.innerHTML = "";
}

function extractTextFromElements(htmlCode, selector) {
  const parser = new DOMParser();
  const textData = [];

  const doc = parser.parseFromString(htmlCode, "text/html");
  const elements = doc.querySelectorAll(selector);
  for (let index = 0; index < elements.length; index++) {
    const element = elements[index];
    console.log(element);
    const ele = element.firstElementChild;
    console.log(ele);
    let text = ele.innerText;
    textData.push(text);

  }
  return textData;
}
function makeResultArrays(tables, text) {
  const resultArrays = [];
  let courseIndex = 0;
  let totalMarks = parseFloat("0");
  let obtainedMarks = parseFloat("0");
  for (let index = 0; index < tables.length; index++) {
    const element = tables[index];
    const finalElement = element[element.length - 1];
    if (finalElement[0] === "Total Marks") {
      resultArrays.push([text[courseIndex], totalMarks.toFixed(2), obtainedMarks.toFixed(2)]);
      totalMarks = 0;
      obtainedMarks = 0;
      courseIndex++;
    }else{
      totalMarks += parseFloat(finalElement[1]);
      obtainedMarks += parseFloat(finalElement[2]);
    }
    
  }
  return resultArrays;
}
function splitString(string) {
  const parts = string.split(/\s{2,}/);
  return parts;
}
function getTextAfterColon(string) {
  const parts = string.split(":");
  const textAfterColon = parts.length > 1 ? parts[1].trim() : "";
  return textAfterColon;
}
function generatePdf(htmlCode) {
  const parser = new DOMParser();
  console.log("generating PDF");
  const doc = parser.parseFromString(htmlCode, "text/html");
  const elements = doc.querySelectorAll("div.m-portlet__body");
  var resolvedArray=[]
  var headings = ["Code","CourseName","Crd","Pnt","Grd","Rmk"]
  for (let index = 0; index < elements.length; index++) {
    const element = elements[index];
    const ele = element.firstElementChild;
    let text = ele.innerText;
    var array = text.split('\n');
    const filteredArray = array
  .filter(item => item.trim() !== "")
  .map(item => item.trim());
  resolvedArray.push(filteredArray);
  }
  const userInformation = resolvedArray[0];
  const transcriptInformation = [];
let currentKeyword = "";
let currentArray = [];
const keywords = ["Fall", "Spring", "Summer"];
for (const item of resolvedArray[1]) {
  const foundKeyword = keywords.find(keyword => item.includes(keyword));
  if (foundKeyword) {
    if (currentArray.length > 0) {
      transcriptInformation.push([currentKeyword, ...currentArray]);
      currentArray = [];
    }
    currentKeyword = item;
  } else {
    currentArray.push(item);
  }
}
if (currentArray.length > 0) {
  transcriptInformation.push([currentKeyword, ...currentArray]);
}
console.log(userInformation);
console.log(transcriptInformation);
const htmlcode = `
<!DOCTYPE html>
<html>
<head>
  <style>
    .table-container {
      display: flex;
      flex-wrap: wrap;
    }
    td.course {
      max-width: 200px;
      overflow: hidden;
      padding-right: 10px;
    }
    caption{
      padding-bottom: 5px;
    }
    table {
      font-size: 8px;
      border-collapse: collapse;
      width: 200px;
      margin-bottom: 20px;
      border: 1px solid black;
    }
    td {
      white-space: nowrap;
      padding-right: 10px;
    }
    th {
      border-bottom: 1px solid black;
      padding: 4px;
      text-align: left;
    }
    p {
      font-size: 8px;
    }
  </style>
</head>
<body>
  <div class="table-container">
  </div>
</body>
</html>`;
const tempContainer = document.createElement('div');
tempContainer.innerHTML = htmlcode;
// START LOOPING
for(let i=0;i<transcriptInformation.length;i++){
  const semester = transcriptInformation[i][0];
  const creds = transcriptInformation[i][1];
  const gpa = transcriptInformation[i][2];
  const divElement = document.createElement('div');
  divElement.className = 'flex flex-col';
  const tableElement = document.createElement('table');
  const caption = document.createElement('caption');
  caption.innerText=semester;
  tableElement.appendChild(caption);
  const row = document.createElement('tr');
  for(let j=0;j<headings.length;j++){
    const head = document.createElement('th');
    head.innerText = headings[j];
    row.appendChild(head);
  }
  tableElement.appendChild(row);
  for(let j=11;j<transcriptInformation[i].length;j+=7){
    const contentRow = document.createElement('tr');
    for(let k=0;k<6;k++){
      if(k==2){
        continue;
      }
      const head = document.createElement('td');
      if(k==1){
        head.className = "course";
      }
      head.innerText = transcriptInformation[i][j+k];
      contentRow.appendChild(head);
    }
    tableElement.appendChild(contentRow);
  }
  const contentRow = document.createElement('tr');
  const head = document.createElement('td');
  head.innerText = " ";
  contentRow.appendChild(head);
  tableElement.appendChild(contentRow);
  divElement.appendChild(tableElement);
  const para = document.createElement('p');
  para.style.whiteSpace = "pre";
  const strings = splitString(creds)
  const gpas = splitString(gpa)
  para.innerText = `Credits Attempted:              ${getTextAfterColon(strings[0])}                                      GPA:       ${getTextAfterColon(gpas[0])}`;
  divElement.appendChild(para);
  const para2 = document.createElement('p');
  para2.style.whiteSpace = "pre";
  para2.innerText = `Credits Earned:                    ${getTextAfterColon(strings[1])}                                      CGPA:    ${getTextAfterColon(gpas[1])}`;
  divElement.appendChild(para2);
  tempContainer.children[1].appendChild(divElement);
}

const htmlString = tempContainer.innerHTML;


  const pageSource = htmlString;
  const pdfWindow = window.open('', '_blank');
  pdfWindow.document.open();
  pdfWindow.document.write(pageSource);
  pdfWindow.document.close();
  pdfWindow.print();
}

