const fs = require('fs');

async function extract() {
  try {
    const AdmZip = require('adm-zip');
    const zip = new AdmZip('frontend-template.zip');
    
    console.log("Extracting all files...");
    zip.extractAllTo('extracted_files', true);
    console.log("Done extracting!");
  } catch (err) {
    console.error("Error:", err.message);
  }
}

extract();
