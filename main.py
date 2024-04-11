import subprocess

if __name__ == '__main__':
  print('Starting bot...')
  tel_process = subprocess.Popen(['python', 'tel.py'])

  print('Starting Flask app...')
  app_process = subprocess.Popen(['python', 'app.py'])

  # Wait for both processes to finish
  tel_process.wait()
  app_process.wait()
