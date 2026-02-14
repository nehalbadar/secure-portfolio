const form = document.getElementById('searchForm');
const cityInput = document.getElementById('cityInput');
const locBtn = document.getElementById('locBtn');
const result = document.getElementById('result');
const locName = document.getElementById('locName');
const current = document.getElementById('current');
const daily = document.getElementById('daily');
const errorBox = document.getElementById('error');
const loader = document.getElementById('loader');
const unitToggle = document.getElementById('unitToggle');
const unitLabel = document.getElementById('unitLabel');

let unit = 'C'; // 'C' or 'F'

function cToF(c){ return Math.round((c * 9/5) + 32); }
function fToC(f){ return Math.round((f - 32) * 5/9); }

if(unitToggle){
  unitToggle.addEventListener('change', ()=>{
    unit = unitToggle.checked ? 'F' : 'C';
    unitLabel.textContent = unit === 'C' ? '°C' : '°F';
    // re-render visible data by reusing lastData if set
    if(window.lastWeatherData) render(window.lastWeatherData);
  });
}

async function fetchWeather(params) {
  try {
    errorBox.textContent = '';
    result.classList.add('hidden');
    showLoader();
    const qs = new URLSearchParams(params).toString();
    const res = await fetch(`/api/weather?${qs}`);
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to fetch weather');
    }
    render(data);
  } catch (err) {
    errorBox.textContent = err.message;
  }
  finally { hideLoader(); }
}

function render(data) {
  locName.textContent = data.location || '';
  window.lastWeatherData = data; // store for unit toggling
  // Current weather (if present)
    if (data.current && data.current.temp != null) {
    // icon may be an emoji or URL; support both
    const curIcon = data.current.weather && data.current.weather[0] ? data.current.weather[0].icon : '';
    const iconHtml = curIcon && curIcon.startsWith('http') ? `<img src="${curIcon}" alt="icon" />` : curIcon ? `<div class="emoji-icon">${curIcon}</div>` : '';
    current.innerHTML = `
      <div class="card current-card">
        <div class="left">
          ${iconHtml}
        </div>
        <div class="right">
          <div class="temp">${displayTemp(data.current.temp)}</div>
          <div class="desc">${data.current.weather ? data.current.weather[0].description : ''}</div>
          <div class="meta">Wind ${data.current.wind_speed || '-'} m/s</div>
        </div>
      </div>`;
  } else {
    current.innerHTML = `<div class="card">Current weather not available.</div>`;
  }

  // 7-day forecast
    daily.innerHTML = data.daily.map(d => {
    const date = new Date(d.dt * 1000);
    const dayName = date.toLocaleDateString(undefined, { weekday: 'short' });
    const wc = d.weather && d.weather[0] ? d.weather[0] : null;
    const icon = wc ? wc.icon : '';
    const iconHtml = icon && icon.startsWith('http') ? `<img src="${icon}" alt="icon"/>` : icon ? `<div class="emoji-icon">${icon}</div>` : '';
    const tempDay = d.temp && d.temp.day != null ? d.temp.day : null;
    const tempMin = d.temp && d.temp.min != null ? d.temp.min : null;
    const tempMax = d.temp && d.temp.max != null ? d.temp.max : null;
    const humidity = d.humidity != null ? d.humidity : '-';
    const wind = d.wind_speed != null ? d.wind_speed : '-';
    const sunrise = d.sunrise ? new Date(d.sunrise * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '';
    const sunset = d.sunset ? new Date(d.sunset * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '';
    return `
      <li class="day-card">
        <div class="day-header"><div class="day-name">${dayName}</div><div class="date">${date.toLocaleDateString()}</div></div>
        <div class="icon">${iconHtml}</div>
        <div class="temps">${displayTemp(tempDay)} <span class="minmax">(${displayTemp(tempMin)} / ${displayTemp(tempMax)})</span></div>
        <div class="small">${d.weather ? d.weather[0].description : ''}</div>
        <div class="small">Wind ${wind} m/s</div>
        <div class="small">Rise ${sunrise} • Set ${sunset}</div>
      </li>`;
  }).join('');
  result.classList.remove('hidden');
}

function displayTemp(val){
  if (val == null || isNaN(val)) return '-';
  if (unit === 'C') return `${Math.round(val)}°C`;
  return `${cToF(val)}°F`;
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const city = cityInput.value.trim();
  if (!city) return;
  fetchWeather({ city });
});

locBtn.addEventListener('click', () => {
  if (!navigator.geolocation) {
    errorBox.textContent = 'Geolocation not supported';
    return;
  }
  navigator.geolocation.getCurrentPosition((pos) => {
    fetchWeather({ lat: pos.coords.latitude, lon: pos.coords.longitude });
  }, (err) => {
    errorBox.textContent = 'Unable to get location';
  });
});

function showLoader(){ if(loader) loader.classList.remove('hidden'); }
function hideLoader(){ if(loader) loader.classList.add('hidden'); }
