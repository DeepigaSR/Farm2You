from fastapi import FastAPI
import openai
from openai import OpenAI
import geocoder
import requests
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()
client = OpenAI()


openai.api_key = os.getenv("OPENAI_API_KEY")
API_KEY='1f24fb03e4bb5887eaf1c395aedc11f1'


@app.post("/recommend_alert")
async def recommend(data: dict):
    

# Get the current location
    location = geocoder.ip('me')

    # Extract latitude and longitude
    lat = location.latlng[0]
    lon = location.latlng[1]


    url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API_KEY}&units=metric"
    response = requests.get(url).json()
    # print(response)
    
    weather = {
        "temperature": response["main"]["temp"],
        "humidity": response["main"]["humidity"],
        "rainfall": response.get("rain", {}).get("1h", 0),  # Rainfall in last 1 hour
        "wind_speed": response["wind"]["speed"],
        "weather_condition": response["weather"][0]["description"]
    }
    crops = data["crops"]

    prompt = f"Given this weather: {weather} and these crops: {crops}, what should the farmer do?"
    Thread_ID='thread_sQI5OQKybbVn8VjIu0QyHjGw'

    # print(prompt)
    
    client.beta.threads.messages.create(thread_id=Thread_ID,
                role= "user",
                content= prompt,
        )
    
    response = client.beta.threads.runs.create_and_poll(
            thread_id=Thread_ID,
            assistant_id= 'asst_glTpPetRUEn11R5VUCyAs7GO'  # Dynamic Assistant ID
            
        )
    
    if response.status == 'completed':
        messages = client.beta.threads.messages.list(response.thread_id)
        return {'advice': messages.data[0].content[0].text.value}
    else:
        return {"error": f"Assistant run failed: {response.status}"}
    
    
