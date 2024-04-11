import argparse
import subprocess
from flask import Flask, render_template, request, send_file, send_from_directory
import os

app = Flask(__name__,
            template_folder=os.path.abspath(os.path.dirname(__file__)),
            static_folder=os.path.abspath(os.path.dirname(__file__)))


def parse_arguments():
  parser = argparse.ArgumentParser(description='Run the web app with options.')
  parser.add_argument('-d',
                      '--default-domain',
                      default='https://redteamacademy.com/',
                      help='Default domain to use in the iframe URL')
  return parser.parse_args()


def read_urls_from_file():
  with open('url.txt', 'r') as file:
    urls = file.readlines()
  # Remove whitespace characters like `\n` at the end of each line
  urls = [url.strip() for url in urls]
  return urls


@app.route('/')
def index():
  # Read URLs from file
  urls = read_urls_from_file()

  # Check if there are URLs in the file
  if urls:
    # Use the first URL from the file
    iframe_url = urls[0]
  else:
    # If no URLs found in the file, use the default domain
    iframe_url = args.default_domain

  domain = get_domain(iframe_url)
  title = f"Explore {domain.capitalize()}"

  return render_template('index.html', iframe_url=iframe_url, title=title)


@app.route('/javascript.js')
def javascript():
  return send_file('javascript.js')


@app.route('/private_chat_id.txt')
def private_chat_id():
  return send_from_directory(os.path.abspath(os.path.dirname(__file__)),
                             'private_chat_id.txt')


def get_domain(url):
  # Extract domain from URL
  return url.split('//')[-1].split('/')[0]


if __name__ == '__main__':
  args = parse_arguments()

  # Start Cloudflare Tunnel
  # Adjust this according to your Cloudflare Tunnel setup
  # Example command: cloudflared tunnel --url http://localhost:5000/
  # cloudflared_command = [
  #    'cloudflared', 'tunnel', '--url', 'http://localhost:8080/'
  # ]
  # tunnel_process = subprocess.Popen(cloudflared_command)

  # Run Flask app
  app.run(port=8080)
