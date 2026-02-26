
  import zipfile
  import sys
  import os

  print("Extracting frontend-template.zip...")
  try:
      if not os.path.exists('extracted_files'):
          os.makedirs('extracted_files')
          
      with zipfile.ZipFile('frontend-template.zip', 'r') as zip_ref:
          zip_ref.extractall('extracted_files')
          
      print("Extraction successful!")
  except Exception as e:
      print(f"Error: {e}")
      sys.exit(1)
  