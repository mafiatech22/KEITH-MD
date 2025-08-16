# Command: * (Wildcard command to handle any message)

def is_youtube_url(url):
    youtube_patterns = [
        "https://www.youtube.com/watch?v=",
        "http://www.youtube.com/watch?v=",
        "https://youtube.com/watch?v=",
        "http://youtube.com/watch?v=",
        "https://youtu.be/",
        "http://youtu.be/",
        "www.youtube.com/watch?v=",
        "youtube.com/watch?v=",
        "youtu.be/",
        "https://m.youtube.com/watch?v=",
        "http://m.youtube.com/watch?v="
    ]
    url_lower = url.lower().strip()
    for pattern in youtube_patterns:
        if url_lower.startswith(pattern.lower()):
            return True
    return False

def extract_video_id(url):
    if "youtu.be/" in url:
        return url.split("youtu.be/")[1].split("?")[0]
    elif "watch?v=" in url:
        return url.split("watch?v=")[1].split("&")[0]
    return None

user_input = message.text.strip()

if is_youtube_url(user_input):
    youtube_url = user_input
    video_id = extract_video_id(youtube_url)
    
    if not video_id:
        bot.sendMessage("❌ Invalid YouTube URL format. Please check your link.")
        raise ReturnCommand()
    
    processing_msg = bot.sendMessage("⏳ Processing...")
    
    try:
        api_url = f"https://swrovchimuhe.techzone.workers.dev/youtube?url={youtube_url}"
        response = HTTP.get(api_url)
        
        if response.status_code != 200:
            bot.editMessageText(
                chat_id=message.chat.id,
                message_id=processing_msg.message_id,
                text="❌ Service unavailable. Please try again later."
            )
            raise ReturnCommand()
        
        data = response.json()
        
        if data and data.get("download_url"):
            download_url = data["download_url"]
            title = data.get("title", "YouTube Audio")
            duration = data.get("duration", "Unknown")
            caption = f"🎵 <b>{title}</b>\n⏱️ Duration: {duration}\n🎧 Quality: High\n⭐ Powered by @MARC_701\n\n✅ Converted to MP3"
            
            try:
                bot.sendDocument(
                    chat_id=message.chat.id,
                    document=download_url,
                    caption=caption,
                    parse_mode="HTML"
                )
                bot.deleteMessage(
                    chat_id=message.chat.id,
                    message_id=processing_msg.message_id
                )
            except Exception:
                bot.editMessageText(
                    chat_id=message.chat.id,
                    message_id=processing_msg.message_id,
                    text=f"📤 <b>MP3 Ready!</b>\n\n🎵 <b>{title}</b>\n⏱️ Duration: {duration}\n\n⚠️ Too large, use the button:",
                    parse_mode="HTML",
                    reply_markup={
                        "inline_keyboard": [
                            [{"text": "⬇️ Download MP3", "url": download_url}]
                        ]
                    }
                )
        else:
            bot.editMessageText(
                chat_id=message.chat.id,
                message_id=processing_msg.message_id,
                text="❌ Could not process. Check URL/Restrictions."
            )
    
    except Exception:
        bot.editMessageText(
            chat_id=message.chat.id,
            message_id=processing_msg.message_id,
            text="❌ Processing failed. Try again!"
        )

elif user_input.startswith("http"):
    bot.sendMessage("❌ Only YouTube URLs are supported.")

elif len(user_input) > 10:
    bot.sendMessage("❌ Please send a valid YouTube URL.")
