document.addEventListener("DOMContentLoaded", function() {
  var getHtmlButton = document.getElementById("getHtmlButton");
  getHtmlButton.textContent = "Calculate Summary :D";
  getHtmlButton.addEventListener("click", function() {
    chrome.runtime.sendMessage({ action: "getHTMLCode" });
  });
  const getInfoButton = document.getElementById("get-info");
  getInfoButton.addEventListener("click", function() {
    chrome.runtime.sendMessage({ action: "getInfo"});
    getInfoButton.style.backgroundColor = 'green';
});
  const generatePdfButton = document.getElementById("generate-pdf");
  generatePdfButton.addEventListener("click", function() {
      chrome.runtime.sendMessage({ action: "generatePDF"});
  
})
})
var activeTabData="",newTabData="";
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
    if(message.action === "setInfo"){
      localStorage.setItem("newTabData",message.activeTabData);
      console.log("sheesh");
    }
    if (message.action === "generatePDF") {
      newTabData = localStorage.getItem("newTabData")
      activeTabData = message.activeTabData;
       generatePdf()
      };
   

});
function setGlobalVariable(value) {
  chrome.storage.local.set({ infoHtml: value }, () => {
    console.log('Global variable has been set.');
  });
}
function getGlobalVariable(callback) {
  chrome.storage.local.get('infoHtml', (result) => {
    const value = result.myVariable;
    return callback(value);
  });
}
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
function generateInformation(){
  const htmlCode = newTabData;
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlCode, "text/html");
  const elements = doc.querySelectorAll("div.m-portlet__body");
  var resolvedArray = []
  for (let index = 0; index < 2; index++) {
    const element = elements[index];
    const ele = element.firstElementChild;
    let text = ele.innerText;
    var array = text.split('\n');
    const filteredArray = array
  .filter(item => item.trim() !== "")
  .map(item => item.trim());
  resolvedArray.push(filteredArray);
  }
  return [resolvedArray[0][5],resolvedArray[1][2],resolvedArray[0][2]]
}
function formatDate(dateString) {
  const dateParts = dateString.split('/');
  const month = parseInt(dateParts[0], 10) - 1; // Subtract 1 to match JavaScript's month index (0-11)
  const day = parseInt(dateParts[1], 10);
  const year = parseInt(dateParts[2], 10);
  
  const formattedDate = new Date(year, month, day).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  
  return formattedDate;
}
function generatePdf() {
  const htmlCode = activeTabData;
  const parser = new DOMParser();
  console.log("generating PDF");
  const studentInformation = generateInformation();
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
      padding-left: 0px;
      max-width: 160px;
      overflow: hidden;
      padding-right: 10px;
    }
    caption{
      padding-bottom: 5px;
    }
    table {
      min-width:320px;
      max-width:320px;
      margin-right:6px;
      font-size: 8px;
      border-collapse: collapse;
      width: 200px;
      margin-bottom: 20px;
      border: 1px solid black;
    }
    td {
      padding-left: 4px;
      white-space: nowrap;
      padding-right: 10px;
    }
    th {
      border-bottom: 1px solid black;
      padding: 4px;
      text-align: left;
    }
    p {
      margin-top: -5px;
      font-size: 8px;
    }
    .info-container{
      padding-top: 5px;
      border: 1px solid black;
      min-width: 646px;
      max-width:646px;
      
    }
    span{
      white-space: nowrap;
      padding: 5px;
    }
    .rowrow{
      white-space: nowrap;
      display: flex;
      justify-content: space-between;
    }
    h2{
      margin-right: 40px;
      margin-top: 40px;
      margin-left: 50px;
    }
    .header{
      margin-top: 30px;
      display: flex;
      flex-direction: row;
      margin-bottom: 3px;
      border-bottom: 1px solid black;
    }
    img {
      margin-right: 10px;
      margin-bottom: 20px;
    }
    h1{
      margin-top: -10px;
    }
    .he {
      margin-top: -8px;
      font-size: 16px;
    }
    .heh {
      margin-top: -8px;
      font-size: 16px;
      font-weight: bold;
    }
  </style>
</head>
<div class="header">
<h2> INTERIM TRANSCRIPT </h2>
<img src="assets/nuces.png" width="100" height="100"/>
<div><h1> NATIONAL <br/> UNIVERSITY</h1> <div class="he" > of Computer and Emerging Sciences </div><br/><div class="heh" > Karachi Campus </div></div>
</div>
<div class="info" ></div>
<body>
  <div class="table-container">
  </div>
  <div class="info-container">
  </div>
</body>
</html>`;
const tempContainer = document.createElement('div');
tempContainer.innerHTML = htmlcode;
const infoRowOne = document.createElement('div');
infoRowOne.className = "flex flex-row"
const stName = document.createElement('span');
stName.innerText = userInformation[2]
stName.style.marginRight = "150px"
const roll = document.createElement('span');
roll.innerText = userInformation[1];
infoRowOne.appendChild(stName);
infoRowOne.appendChild(roll);
tempContainer.children[2].appendChild(infoRowOne);
const infoRowTwo = document.createElement('div');
infoRowTwo.className = "flex flex-row"
let dob = getTextAfterColon(studentInformation[1])
const birth = document.createElement('span');
birth.innerText = `Date of Birth: ${formatDate(dob)}`
birth.style.marginRight = "135px"
const degree = document.createElement('span');
degree.innerText = `Degree: ${getTextAfterColon(studentInformation[2])}`
infoRowTwo.appendChild(birth);
infoRowTwo.appendChild(degree);
tempContainer.children[2].appendChild(infoRowTwo)
const regNp = document.createElement('span');
regNp.innerText = `Univ. Reg. No: ${getTextAfterColon(userInformation[1])}`
tempContainer.children[2].appendChild(regNp)
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
  para.innerText = `   Credits Attempted:              ${getTextAfterColon(strings[0])}                                                     GPA:       ${getTextAfterColon(gpas[0])}`;
  divElement.appendChild(para);
  const para2 = document.createElement('p');
  para2.style.whiteSpace = "pre";
  para2.innerText = `   Credits Earned:                    ${getTextAfterColon(strings[1])}                                                     CGPA:    ${getTextAfterColon(gpas[1])}`;
  divElement.appendChild(para2);
  tempContainer.children[3].appendChild(divElement);
}
const firstCol = document.createElement("div");
firstCol.className = "flex flex-col"
const firstRow = document.createElement("div");
firstRow.className = "rowrow"
const firstSpan = document.createElement('span');
firstSpan.innerText = "CGPA Required:           2.00"
const secondSpan = document.createElement('span');
secondSpan.innerText = "Credits Required:   130"
const thirdSpan = document.createElement('span');
thirdSpan.innerText = "Credits Transferred:           0"

firstRow.appendChild(firstSpan);
firstRow.appendChild(secondSpan);
firstRow.appendChild(thirdSpan);
firstCol.appendChild(firstRow);
const secondRow = document.createElement("div");
secondRow.className = "rowrow"
const fourthSpan = document.createElement('span');
const finalgpa = splitString(transcriptInformation[transcriptInformation.length - 1][2]);
fourthSpan.innerText = `CGPA Earned:            ${getTextAfterColon(finalgpa[1])}`
const fifthSpan = document.createElement('span');
fifthSpan.innerText = `Degree Status:   ${getTextAfterColon(studentInformation[0])}`
const sixthSpan = document.createElement("span");
const finalcreds = splitString(transcriptInformation[transcriptInformation.length - 1][1]);
sixthSpan.innerText = `Credits Earned:    ${getTextAfterColon(finalcreds[1])}`
secondRow.appendChild(fourthSpan);
secondRow.appendChild(fifthSpan);
secondRow.appendChild(sixthSpan);
firstCol.appendChild(secondRow)
const thirdRow = document.createElement("div");
thirdRow.className = "rowrow"
const seventhSpan = document.createElement("span");
seventhSpan.innerText = `Credits Completed:    ${getTextAfterColon(finalcreds[1])}`
thirdRow.appendChild(seventhSpan);
firstCol.appendChild(thirdRow)
tempContainer.children[4].appendChild(firstCol);
const htmlString = tempContainer.innerHTML;

  const pageSource = htmlString;
  const pdfWindow = window.open('', '_blank');
  pdfWindow.document.open();
  pdfWindow.document.write(pageSource);
  pdfWindow.document.close();
}