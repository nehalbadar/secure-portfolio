const path = require('path');
const express = require('express');
const fetch = require('node-fetch');
const NodeCache = require('node-cache');
const dotenv = require('dotenv');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

dotenv.config();

const app = express();
const cache = new NodeCache({ stdTTL: 300 }); // 5 minutes
const PORT = process.env.PORT || 5001;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public'), { maxAge: 1000 * 60 * 60 * 24 })); // static assets cache 1 day

// Rate limiter for API endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 120, // limit each IP to 120 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', apiLimiter);

// Use Open-Meteo (no API key) for geocoding + forecast
// /api/weather?city=London   OR /api/weather?lat=..&lon=..
app.get('/api/weather', async (req, res) => {
  try {
    const { city, lat, lon } = req.query;
    if (!city && !(lat && lon)) return res.status(400).json({ error: 'Provide city or lat & lon' });

    let cacheKey = city ? `city:${city.toLowerCase()}` : `coords:${lat},${lon}`;
    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    let latitude = lat;
    let longitude = lon;
    let locationName = city || `${lat},${lon}`;

    if (city) {
      // Use Open-Meteo geocoding
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`;
      const geoResp = await fetch(geoUrl);
      const geoJson = await geoResp.json();
      if (!geoJson || !geoJson.results || !geoJson.results[0]) return res.status(404).json({ error: 'City not found' });
      latitude = geoJson.results[0].latitude;
      longitude = geoJson.results[0].longitude;
      locationName = `${geoJson.results[0].name}${geoJson.results[0].country ? ', ' + geoJson.results[0].country : ''}`;
    }

    // Call Open-Meteo forecast API
    const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&timezone=auto&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode,sunrise,sunset&forecast_days=7`;
    const weatherResp = await fetch(forecastUrl);
    const weatherJson = await weatherResp.json();

    if (!weatherJson || weatherJson.error) {
      return res.status(400).json({ error: 'Weather API error' });
    }

    // helper: map weathercode to description + emoji
    const codeMap = {
      0: ['Clear sky', '☀️'],
      1: ['Mainly clear', '🌤️'],
      2: ['Partly cloudy', '⛅'],
      3: ['Overcast', '☁️'],
      45: ['Fog', '🌫️'],
      48: ['Depositing rime fog', '🌫️'],
      51: ['Light drizzle', '🌦️'],
      53: ['Moderate drizzle', '🌦️'],
      55: ['Dense drizzle', '🌧️'],
      56: ['Light freezing drizzle', '🌧️'],
      57: ['Dense freezing drizzle', '🌧️'],
      61: ['Slight rain', '🌧️'],
      63: ['Moderate rain', '🌧️'],
      65: ['Heavy rain', '🌧️'],
      71: ['Slight snow', '❄️'],
      73: ['Moderate snow', '❄️'],
      75: ['Heavy snow', '❄️'],
      80: ['Rain showers', '🌧️'],
      81: ['Moderate rain showers', '🌧️'],
      82: ['Violent rain showers', '⛈️'],
      95: ['Thunderstorm', '⛈️']
    };

    const daily = (weatherJson.daily && weatherJson.daily.time) ? weatherJson.daily.time.map((dateStr, idx) => {
      const rawMax = weatherJson.daily.temperature_2m_max ? weatherJson.daily.temperature_2m_max[idx] : null;
      const rawMin = weatherJson.daily.temperature_2m_min ? weatherJson.daily.temperature_2m_min[idx] : null;
      const max = rawMax != null ? Number(rawMax) : null;
      const min = rawMin != null ? Number(rawMin) : null;
      const wc = weatherJson.daily.weathercode ? weatherJson.daily.weathercode[idx] : null;
      const sunriseRaw = weatherJson.daily.sunrise ? weatherJson.daily.sunrise[idx] : null;
      const sunsetRaw = weatherJson.daily.sunset ? weatherJson.daily.sunset[idx] : null;
      const desc = wc != null && codeMap[wc] ? codeMap[wc][0] : 'Unknown';
      const icon = wc != null && codeMap[wc] ? codeMap[wc][1] : '❓';
      const dtMs = Date.parse(dateStr + 'T12:00:00Z');
      const dt = isNaN(dtMs) ? null : Math.floor(dtMs / 1000);
      const sunriseMs = sunriseRaw ? Date.parse(sunriseRaw) : NaN;
      const sunsetMs = sunsetRaw ? Date.parse(sunsetRaw) : NaN;
      const sunrise = !isNaN(sunriseMs) ? Math.floor(sunriseMs / 1000) : null;
      const sunset = !isNaN(sunsetMs) ? Math.floor(sunsetMs / 1000) : null;
      const avg = (max != null && min != null) ? Math.round((max + min) / 2) : (max != null ? Math.round(max) : (min != null ? Math.round(min) : null));
      return {
        dt,
        temp: { day: avg, min: min != null ? Math.round(min) : null, max: max != null ? Math.round(max) : null },
        weather: [{ description: String(desc), icon }],
        humidity: null,
        wind_speed: null,
        sunrise,
        sunset
      };
    }) : [];

    const current = weatherJson.current_weather ? {
      temp: weatherJson.current_weather.temperature,
      weather: [{ description: (weatherJson.current_weather.weathercode != null && codeMap[weatherJson.current_weather.weathercode]) ? codeMap[weatherJson.current_weather.weathercode][0] : 'Current' , icon: (weatherJson.current_weather.weathercode != null && codeMap[weatherJson.current_weather.weathercode]) ? codeMap[weatherJson.current_weather.weathercode][1] : '❓' }],
      wind_speed: weatherJson.current_weather.windspeed || null,
      dt: weatherJson.current_weather.time ? Math.floor(Date.parse(weatherJson.current_weather.time)/1000) : null
    } : null;

    const out = {
      location: locationName,
      timezone: weatherJson.timezone || null,
      current,
      daily
    };

    cache.set(cacheKey, out);
    res.set('Cache-Control', 'public, max-age=300');
    res.json(out);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => console.log(`Weather app running on port ${PORT}`));
