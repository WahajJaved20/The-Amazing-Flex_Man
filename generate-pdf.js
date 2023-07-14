chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "generate_pdf") {
        console.log("generate_pdf");
      chrome.scripting.executeScript({
        target: { tabId: sender.tab.id },
        function: generatePdf
      });
    }
  });
  
  async function generatePdf() {
    // Get the HTML content of the webpage
    const htmlContent = document.documentElement.outerHTML;
  
    // Create a new PDF document
    const { PDFDocument } = window.pdfLib;
    const pdfDoc = await PDFDocument.create();
  
    // Convert HTML content to PDF
    const page = pdfDoc.addPage();
    const svgUrl = URL.createObjectURL(new Blob([htmlContent], { type: 'image/svg+xml' }));
    const svg = await page.svg(svgUrl, { width: page.getWidth(), height: page.getHeight() });
    URL.revokeObjectURL(svgUrl);
    page.svg(svg, { x: 0, y: 0, width: page.getWidth(), height: page.getHeight() });
  
    // Serialize the PDF document to a data URL
    const pdfBytes = await pdfDoc.save();
    const dataUri = `data:application/pdf;base64,${pdfBytes.toString('base64')}`;
  
    // Open the PDF in a new tab for the user to download or view
    window.open(dataUri);
  }
  