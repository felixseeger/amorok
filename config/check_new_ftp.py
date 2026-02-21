from ftplib import FTP

try:
    ftp = FTP('w0105bd5.kasserver.com')
    ftp.login('f01809de', '1JN!)*A4O,j.NPKUq,jW')
    print("Files in root:")
    ftp.retrlines('LIST')
    ftp.quit()
except Exception as e:
    print(f"Error: {e}")
