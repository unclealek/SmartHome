import React, { useState, useEffect } from 'react';
import { Thermometer, Sun, Lightbulb, Droplets, Clock, RefreshCw } from 'lucide-react';
import { SensorCard } from './components/SensorCard';
import { SensorData } from './types';

// API endpoints
const Temperature_API = 'https://api.openweathermap.org/data/2.5/weather?q=kuopio&units=metric&appid=895284fb2d2c50a520ea537456963d9c';
const RoomTemp_API = 'https://blynk.cloud/external/api/get?token=xU_s3G1PHj7iWOWN20CbE5_JO-G-H5jX&V0';
const Sound_API = 'https://blynk.cloud/external/api/get?token=xU_s3G1PHj7iWOWN20CbE5_JO-G-H5jX&V3';
const Humidity_API = 'https://blynk.cloud/external/api/get?token=xU_s3G1PHj7iWOWN20CbE5_JO-G-H5jX&V1';
const Light_API = 'https://blynk.cloud/external/api/get?token=xU_s3G1PHj7iWOWN20CbE5_JO-G-H5jX&V2';
const Light_Control_API = 'https://blynk.cloud/external/api/update?token=xU_s3G1PHj7iWOWN20CbE5_JO-G-H5jX&V4=';
const Reset_API = 'https://blynk.cloud/external/api/update?token=xU_s3G1PHj7iWOWN20CbE5_JO-G-H5jX&V5=1';

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
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

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

  // Function to toggle light
  const toggleLight = async (newState: boolean) => {
    try {
      const response = await fetch(`${Light_Control_API}${newState ? '1' : '0'}`);
      if (!response.ok) throw new Error('Failed to update light status');
      setSensorData(prev => ({ ...prev, lightStatus: newState }));
    } catch (error) {
      console.error('Error toggling light:', error);
      setError('Failed to update light status');
    }
  };

  // Function to reset to sound sensor mode
  const resetToSoundMode = async () => {
    try {
      const response = await fetch(Reset_API);
      if (!response.ok) throw new Error('Failed to reset to sound mode');
      setError('Reset to sound sensor mode successful');
      // Clear the error message after 3 seconds
      setTimeout(() => setError(null), 3000);
    } catch (error) {
      console.error('Error resetting to sound mode:', error);
      setError('Failed to reset to sound mode');
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
          const lightStatus = await lightResponse.text();
          console.log('Raw light status:', lightStatus);
          const isLightOn = lightStatus === '1';
          console.log('Is light on:', isLightOn);
          setSensorData(prev => ({ ...prev, lightStatus: isLightOn }));
        } catch (error) {
          console.error('Error fetching light status:', error);
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
          <p className="text-white drop-shadow-lg mb-4">Real-time sensor data from your smart home</p>

          {/* Time and Date Display */}
          <div className="flex items-center justify-center space-x-2 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full inline-block">
            <Clock className="w-5 h-5 text-white" />
            <span className="text-white font-medium">
              {currentTime.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit', 
                second: '2-digit',
                hour12: true 
              })}
            </span>
            <span className="text-white/70">•</span>
            <span className="text-white font-medium">
              {currentTime.toLocaleDateString('en-US', { 
                weekday: 'long',
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
          </div>

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
              title="Humidity"
              value={sensorData.humidity}
              unit="%"
              icon={<Droplets className="w-6 h-6 text-cyan-500" />}
            />
          </div>

          {/* Light Control Card - Centered */}
          <div className="col-span-full flex justify-center">
            <div className="backdrop-blur-sm bg-white/30 rounded-lg p-6 transform hover:scale-105 transition-transform duration-200 w-full max-w-2xl">
              <div className="flex flex-col items-center">
                {/* Large Light Bulb Icon */}
                <div className="mb-4">
                  <Lightbulb 
                    className={`w-16 h-16 ${sensorData.lightStatus ? 'text-yellow-500 animate-pulse' : 'text-gray-400'}`}
                  />
                </div>

                {/* Title and Controls */}
                <div className="w-full space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-white">Light Control</h3>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => toggleLight(!sensorData.lightStatus)}
                        className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 ${
                          sensorData.lightStatus ? 'bg-yellow-500' : 'bg-gray-400'
                        }`}
                      >
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                            sensorData.lightStatus ? 'translate-x-8' : 'translate-x-1'
                          }`}
                        />
                      </button>
                      <button
                        onClick={resetToSoundMode}
                        className="p-2 text-white hover:text-yellow-500 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 rounded-full bg-white/10 hover:bg-white/20"
                        title="Reset to sound sensor mode"
                      >
                        <RefreshCw className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Status and Mode */}
                  <div className="flex flex-col items-center space-y-2">
                    <div className={`px-4 py-2 rounded-full ${
                      sensorData.lightStatus 
                        ? 'bg-yellow-500/30 text-yellow-200' 
                        : 'bg-gray-500/30 text-gray-200'
                    }`}>
                      {sensorData.lightStatus ? 'Light is ON' : 'Light is OFF'}
                    </div>
                    <div className="text-sm text-white/70">
                      Click the switch to toggle light manually
                    </div>
                    <div className="text-sm text-white/70">
                      Use reset button to enable sound sensor mode
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;