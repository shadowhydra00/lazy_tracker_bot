from typing import Final
import re
import os
from telegram import Update
from telegram.ext import Application, CommandHandler, MessageHandler, filters, ContextTypes

TOKEN: Final = '6987122048:AAEHNuzQz3pV8ldUKQfrQ9X1cT20zsuBJaY'
BOT_USERNAME: Final = '@shadowhydra_bot'
PRIVATE_CHAT_ID_FILE: Final = 'private_chat_id.txt'


# Function to read the private chat ID from a file
def read_private_chat_id():
  try:
    with open(PRIVATE_CHAT_ID_FILE, 'r') as file:
      return file.read().strip()
  except FileNotFoundError:
    return None


# Function to write the private chat ID to a file
def write_private_chat_id(chat_id):
  with open(PRIVATE_CHAT_ID_FILE, 'w') as file:
    file.write(str(chat_id))


# Commands
async def start_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
  await update.message.reply_text('Hello! I am Lazy bot. I am very lazy.')


async def whatdoes_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
  await update.message.reply_text(
      'Hello! I am Lazy bot. This bot will work using the clickjacing vulnerability in a web application. Users can give me a URL of the webpage having clickjacking vulnerability, and I will create a spoofed webpage containing a malicious script to collect user data, including photos, public IP address, geolocation, what device they are using, battery and charging status.'
  )


async def create_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
  url = context.args[0] if context.args else None
  if url:
    with open('url.txt', 'w') as file:
      file.write(url)
    await update.message.reply_text('Checking errors. Creating crafted URL!')
  else:
    await update.message.reply_text('Please provide a URL.')


async def start_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
  await update.message.reply_text('Hello! I am Lazy bot. I am very lazy.')


# Responses
def is_valid_url(url):
  # Regular expression pattern to match a fully qualified URL with https or http only
  pattern = re.compile(
      r'^(?:https?://)'  # http:// or https://
      r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+(?:[A-Z]{2,6}\.?|[A-Z0-9-]{2,}\.?)|'  # domain...
      r'localhost|'  # localhost...
      r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})'  # ...or IP
      r'(?::\d+)?'  # optional port
      r'(?:/?|[/?]\S+)$',
      re.IGNORECASE)

  return bool(re.match(pattern, url))


def handle_response(text: str) -> str:
  processed: str = text.lower()

  if 'hello' in text:
    return 'Hello there'

  if 'hi' in text:
    return 'Hello there'

  if is_valid_url(text):
    return 'Got the URL boss...\n https://wheel.to/cWIgC3'

  return 'I do not understand what you are saying. And I am busy to look into it. If you are trying to give me domain. I dont accept it. Give me a full URL.'


# Message handling
async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
  chat_id = str(update.message.chat.id)
  message_type = update.message.chat.type
  text = update.message.text

  print(f'User ({chat_id}) in {message_type}: "{text}"')

  # Handling messages in private chat
  if message_type == 'private':
    write_private_chat_id(chat_id)  # Save private chat ID to file
    response = handle_response(text)
    if is_valid_url(text):
      await update.message.reply_text('Checking errors. Creating crafted URL!')
      with open('url.txt', 'w') as file:
        file.write(text)
    print('Bot:', response)
    await update.message.reply_text(response)

  # Handling messages in group chat
  elif message_type == 'group':
    if BOT_USERNAME in text:
      new_text = text.replace(BOT_USERNAME, '').strip()
      response = handle_response(new_text)
      if is_valid_url(new_text):
        await update.message.reply_text(
            'Checking errors. Creating crafted URL!!')
        with open('url.txt', 'w') as file:
          file.write(new_text)
    else:
      return


# Error handling
async def error(update: Update, context: ContextTypes.DEFAULT_TYPE):
  print(f'Update {update} caused error {context.error}')


if __name__ == '__main__':
  print('starting bot...')
  app = Application.builder().token(TOKEN).build()

  # Commands
  app.add_handler(CommandHandler('start', start_command))
  app.add_handler(CommandHandler('whatdoes', whatdoes_command))
  app.add_handler(CommandHandler('create', create_command))

  # Message handling
  app.add_handler(MessageHandler(filters.TEXT, handle_message))

  # Error handling
  app.add_error_handler(error)

  print('polling....')
  app.run_polling(poll_interval=3)
