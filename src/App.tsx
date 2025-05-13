import React, { useState, useEffect } from 'react';
import { Thermometer, Sun, Volume2, Lightbulb, Droplets } from 'lucide-react';
import { SensorCard } from './components/SensorCard';
import { SensorData } from './types';

// API endpoints
const Temperature_API = 'https://api.openweathermap.org/data/2.5/weather?q=kuopio&units=metric&appid=895284fb2d2c50a520ea537456963d9c';
const RoomTemp_API = 'https://blynk.cloud/external/api/get?token=xU_s3G1PHj7iWOWN20CbE5_JO-G-H5jX&V0';
const Sound_API = 'https://blynk.cloud/external/api/get?token=xU_s3G1PHj7iWOWN20CbE5_JO-G-H5jX&V3';
const Humidity_API = 'https://blynk.cloud/external/api/get?token=xU_s3G1PHj7iWOWN20CbE5_JO-G-H5jX&V1';
const Light_API = 'https://blynk.cloud/external/api/get?token=xU_s3G1PHj7iWOWN20CbE5_JO-G-H5jX&V2';

function App() {
  const [sensorData, setSensorData] = useState<SensorData>({
    homeTemp: 0,
    cityTemp: 0,
    soundLevel: 0,
    lightStatus: false,
    humidity: 0
  });
  const [error, setError] = useState<string | null>(null);
  const [sensorErrors, setSensorErrors] = useState<{[key: string]: string}>({});
  const [weatherEmoji, setWeatherEmoji] = useState('🌡️');
  const [greeting, setGreeting] = useState('Welcome to your Smart Home!');

  // Function to get weather emoji and greeting based on temperature
  const updateWeatherMood = (temp: number) => {
    const hour = new Date().getHours();
    let timeGreeting = '';
    
    if (hour < 12) timeGreeting = 'Good morning';
    else if (hour < 18) timeGreeting = 'Good afternoon';
    else timeGreeting = 'Good evening';

    if (temp < 0) {
      setWeatherEmoji('❄️');
      setGreeting(`${timeGreeting}! It's freezing outside! Stay warm!`);
    } else if (temp < 10) {
      setWeatherEmoji('🥶');
      setGreeting(`${timeGreeting}! It's quite chilly today!`);
    } else if (temp < 20) {
      setWeatherEmoji('😊');
      setGreeting(`${timeGreeting}! The weather is mild and pleasant!`);
    } else if (temp < 30) {
      setWeatherEmoji('☀️');
      setGreeting(`${timeGreeting}! It's a beautiful day!`);
    } else {
      setWeatherEmoji('🔥');
      setGreeting(`${timeGreeting}! It's hot outside! Stay cool!`);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const newSensorErrors: {[key: string]: string} = {};
      
      try {
        // Fetch room temperature
        try {
          const roomTempResponse = await fetch(RoomTemp_API);
          if (!roomTempResponse.ok) throw new Error('Room temperature API error');
          const roomTemp = await roomTempResponse.text();
          const temp = parseFloat(roomTemp);
          setSensorData(prev => ({ ...prev, homeTemp: temp }));
          updateWeatherMood(temp);
        } catch {
          newSensorErrors.homeTemp = 'Failed to fetch room temperature';
        }
        
        // Fetch city temperature
        try {
          const cityTempResponse = await fetch(Temperature_API);
          if (!cityTempResponse.ok) throw new Error('City temperature API error');
          const cityTempData = await cityTempResponse.json();
          setSensorData(prev => ({ ...prev, cityTemp: cityTempData.main?.temp || 0 }));
        } catch {
          newSensorErrors.cityTemp = 'Failed to fetch city temperature';
        }
        
        // Fetch sound level
        try {
          const soundResponse = await fetch(Sound_API);
          if (!soundResponse.ok) throw new Error('Sound API error');
          const soundLevel = await soundResponse.text();
          setSensorData(prev => ({ ...prev, soundLevel: parseInt(soundLevel, 10) }));
        } catch {
          newSensorErrors.soundLevel = 'Failed to fetch sound level';
        }
        
        // Fetch humidity
        try {
          const humidityResponse = await fetch(Humidity_API);
          if (!humidityResponse.ok) throw new Error('Humidity API error');
          const humidity = await humidityResponse.text();
          setSensorData(prev => ({ ...prev, humidity: parseFloat(humidity) }));
        } catch {
          newSensorErrors.humidity = 'Failed to fetch humidity';
        }
        
        // Fetch light status
        try {
          const lightResponse = await fetch(Light_API);
          if (!lightResponse.ok) throw new Error('Light API error');
          const lightLevel = await lightResponse.text();
          setSensorData(prev => ({ ...prev, lightStatus: parseInt(lightLevel, 10) > 50 }));
        } catch {
          newSensorErrors.lightStatus = 'Failed to fetch light status';
        }
        
        setSensorErrors(newSensorErrors);
        setError(Object.keys(newSensorErrors).length > 0 ? 'Some sensors are not responding' : null);
      } catch (error) {
        console.error('Error fetching sensor data:', error);
        setError('Failed to fetch sensor data. Please try again later.');
      }
    };

    // Initial fetch
    fetchData();

    // Poll every 5 seconds
    const interval = setInterval(fetchData, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')" }}>
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <span className="text-6xl animate-bounce">{weatherEmoji}</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">Home Monitoring Dashboard</h1>
          <p className="text-white drop-shadow-lg text-xl mb-4">{greeting}</p>
          <p className="text-white drop-shadow-lg">Real-time sensor data from your smart home</p>
          {error && (
            <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-md">
              {error}
              {Object.entries(sensorErrors).map(([sensor, error]) => (
                <div key={sensor} className="text-sm mt-1">
                  {sensor}: {error}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="backdrop-blur-sm bg-white/30 rounded-lg p-6 transform hover:scale-105 transition-transform duration-200">
            <SensorCard
              title="Home Temperature"
              value={sensorData.homeTemp}
              unit="°C"
              icon={<Thermometer className="w-6 h-6 text-blue-500" />}
              subtitle={`Humidity: ${sensorData.humidity}%`}
            />
          </div>
          
          <div className="backdrop-blur-sm bg-white/30 rounded-lg p-6 transform hover:scale-105 transition-transform duration-200">
            <SensorCard
              title="City Temperature"
              value={sensorData.cityTemp}
              unit="°C"
              icon={<Sun className="w-6 h-6 text-orange-500" />}
            />
          </div>
          
          <div className="backdrop-blur-sm bg-white/30 rounded-lg p-6 transform hover:scale-105 transition-transform duration-200">
            <SensorCard
              title="Sound Level"
              value={sensorData.soundLevel}
              unit="dB"
              icon={<Volume2 className="w-6 h-6 text-purple-500" />}
            />
          </div>
          
          <div className="backdrop-blur-sm bg-white/30 rounded-lg p-6 transform hover:scale-105 transition-transform duration-200">
            <SensorCard
              title="Light Status"
              value={sensorData.lightStatus}
              icon={<Lightbulb className="w-6 h-6 text-yellow-500" />}
            />
          </div>

          <div className="backdrop-blur-sm bg-white/30 rounded-lg p-6 transform hover:scale-105 transition-transform duration-200">
            <SensorCard
              title="Humidity"
              value={sensorData.humidity}
              unit="%"
              icon={<Droplets className="w-6 h-6 text-cyan-500" />}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;