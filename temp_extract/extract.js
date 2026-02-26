
  import AdmZip from 'adm-zip';

  try {
    console.log("Reading zip file...");
    const zip = new AdmZip('/home/runner/workspace/frontend-template.zip');
    
    console.log("Extracting all files (this might take a minute for 300MB)...");
    zip.extractAllTo('extracted_files', true);
    console.log("Done extracting!");
  } catch (err) {
    console.error("Error:", err.message);
  }
  