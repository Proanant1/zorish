
  const https = require('https');
  const fs = require('fs');

  function download(url, dest) {
    return new Promise((resolve, reject) => {
      https.get(url, (response) => {
        let redirectUrl = '';
        
        // Handle redirects
        if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
          console.log("Redirecting to:", response.headers.location);
          
          // Sometimes Google Drive redirects have cookies we need to capture
          const cookies = response.headers['set-cookie'];
          const options = { headers: {} };
          if (cookies) {
             options.headers.Cookie = cookies.join(';');
             console.log("Got cookies");
          }
          
          return https.get(response.headers.location, options, (res2) => {
            const file = fs.createWriteStream(dest);
            res2.pipe(file);
            file.on('finish', () => {
              file.close(resolve);
            });
          }).on('error', reject);
        }
        
        // We might get the warning page
        let data = '';
        if (response.statusCode === 200) {
          response.on('data', chunk => data += chunk);
          response.on('end', () => {
            // If it's HTML, it's the warning page
            if (data.includes('Virus scan warning')) {
              console.log("Got warning page, extracting link...");
              
              // Extract the download link from the form
              // <form id="download-form" action="https://drive.usercontent.google.com/download" method="get">
              // <input type="hidden" name="id" value="...">
              // <input type="hidden" name="export" value="download">
              // <input type="hidden" name="confirm" value="t">
              // <input type="hidden" name="uuid" value="...">
              
              const uuidMatch = data.match(/name="uuid" value="([^"]+)"/);
              const idMatch = data.match(/name="id" value="([^"]+)"/);
              
              if (uuidMatch && idMatch) {
                const dlUrl = `https://drive.usercontent.google.com/download?id=${idMatch[1]}&export=download&confirm=t&uuid=${uuidMatch[1]}`;
                console.log("Direct download URL:", dlUrl);
                
                // Get cookies from the warning page response
                const cookies = response.headers['set-cookie'];
                const options = { headers: {} };
                if (cookies) {
                   options.headers.Cookie = cookies.join(';');
                }
                
                https.get(dlUrl, options, (res3) => {
                  const file = fs.createWriteStream(dest);
                  res3.pipe(file);
                  file.on('finish', () => {
                    file.close(resolve);
                  });
                }).on('error', reject);
              } else {
                console.log("Couldn't find required fields in warning page");
                fs.writeFileSync(dest, data); // Just save it anyway
                resolve();
              }
            } else {
              console.log("Writing directly (not a warning page)");
              const file = fs.createWriteStream(dest);
              file.write(data);
              file.close(resolve);
            }
          });
        } else {
           console.log("Unexpected status code:", response.statusCode);
           resolve();
        }
      }).on('error', reject);
    });
  }

  const fileId = '10vMF3pUNHkyVnVVQ93osJ6CGsVCoG-e8';
  const url = `https://drive.google.com/uc?export=download&id=${fileId}`;
  console.log("Starting download...");
  download(url, 'app_downloaded.zip')
    .then(() => console.log("Done!"))
    .catch(err => console.error("Error:", err));
  