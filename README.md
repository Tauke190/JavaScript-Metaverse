# Weather App #
### [Working Link](https://metaversescript.glitch.me)

## Production ##

### Idea ###
I aim to create a very simple weather web app that can display the image of the city and the weather when the user queries upon it. I plan to make a very minimalistic design that provides essential information regarding weather like temperature,humidity,windspeed etc. I will be using splash API for getting images of the city and I will be using openweather API to get the information of the weather by city name. The user can enter a valid city name and get the essential information about the current weather in that city. I am planning to expand my project as well to a map. So you can pinpoint the location on the map to get the weather data.The user interaction in the app is to enter the name of the valid city to retrieve the information about the weather

### Wireframe ###
![WireFrame](https://raw.githubusercontent.com/Tauke190/Connections-Lab/master/Project%201%20-%20Weather%20App/Wireframe.png)


### Motivation && Inspiration
1. What if I have trouble remembering names?
2. What if I need to know the basic weather of a place quicky?
3. The power of D3.js to draw SVG
4. Love for geography
![Intro](https://github.com/Tauke190/Connections-Lab/blob/master/Project%201%20-%20Weather%20App/Screen%20Shot%202022-09-29%20at%2011.10.47%20PM.png)


### Technical Decision ###
1. I am exploring API which provides relevant weather data
2. I plan to use D3.js library because of its flexibility to draw SVG files from JSON data
3. I plan to develop the entire project using object oriented approach by making objects and encapsulating it with functions

### Design Decision ###
1. I plan to move forward with a modern minimalistic design for the website
2. The user can hover and click in the world map which will pop up with a simple animation and display weather data for that location
3. Since it takes alot of time to download the image , I am planning to make some sort of interactive game when the image loads for the new place

 ## User Interaction ##
 <img width="500" alt="Screen Shot 2022-09-19 at 12 12 12 AM" src="https://user-images.githubusercontent.com/31856059/190926506-9459bdcb-d03b-4fc6-8881-afb06fde4d21.png">
 
 Type the name of the valid city/country to see its weather data

![4500px-A_large_blank_world_map_with_oceans_marked_in_blue svg](https://user-images.githubusercontent.com/31856059/190926490-69cff088-65f5-4c63-9855-7edf64bd52ac.png)



## WorkFlow
![](https://github.com/Tauke190/Connections-Lab/blob/master/Project%201%20-%20Weather%20App/Screen%20Shot%202022-09-29%20at%2011.11.13%20PM.png)

Pinpoint the location on the map to reveal its weather data

## Key Challenges

1. Drawing the world map piece by piece as a HTML element because it has to be hoverable and give the right information. Uploading a Image cannot work.
2. Learning D3.js which is a java script library for data visualization
3. Understanding the Object oriented method in javascript 
<img width="751" alt="Screen Shot 2022-09-19 at 12 17 58 AM" src="https://user-images.githubusercontent.com/31856059/190926685-3a635755-ea65-48f7-bd8e-09319b6c2beb.png">
4. Setting the background of SVG as a video but not the body background

 ![Key Challenges 1](https://github.com/Tauke190/Connections-Lab/blob/master/Project%201%20-%20Weather%20App/Challenge%20D3.png)
 
 ![Key Challenges 2](https://raw.githubusercontent.com/Tauke190/Connections-Lab/master/Project%201%20-%20Weather%20App/Screen%20Shot%202022-09-29%20at%209.48.31%20AM.png)


## 25-Sept (Next Steps)

1. Incorporating D3.js for drawing the SVG of the world map from the geographical co-ordinates encoded in JSON
2. Incorporation p5.js for additional interactivity in the Web App
3. Finding a better API that can supply updated and latest images of places of the world/city/country 
4. Styling the elements better and addding animation in the website
5. Adding a load screen for the images because it takes some time to download the images from the API , or adding a small game during the load time


## 29-Sept (Next Steps)
1. Zooming in Feature so you can see weather of specific cities
2. Adding the past history of major weather events in that specific place
3. Adding live clipart animation overlaying the map showing the weather of many places at once 
4. Adding major landmarks of that place so that you can learn about that country as you browse through the weather

## References/Resources
1. [Openweathermap API](https://openweathermap.org/api)
2. [D3.js - JS library](https://openweathermap.org/api)
3. [Splash Image API](https://unsplash.com/developers)


## Final Result
![Final Result](https://github.com/Tauke190/Connections-Lab/blob/master/Project%201%20-%20Weather%20App/Final.png)

