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
       generatePdf()
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
function generatePdf() {
  var script = document.getElementById("pdfscriptlib");
  script.src = chrome.runtime.getURL('libs/library.js');
  console.log("generating PDF");
  script.onload = function() {
    // The library is loaded and ready to use.
    // Write your code here that depends on the library.
    const doc = new jsPDF();

// Add content to the PDF
doc.text('Hello, PDF!', 10, 10);

// Save the PDF as a blob
const pdfBlob = doc.output('blob');

// Create a URL for the PDF blob
const pdfUrl = URL.createObjectURL(pdfBlob);

// Open the PDF in a new tab for the user to download or view
window.open(pdfUrl);
  };
// Create a new jsPDF instance

}

