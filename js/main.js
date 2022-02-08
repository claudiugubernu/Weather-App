window.addEventListener('load', () => {
    let long;
    let lat;

    if (!sessionStorage.getItem('key')) {
        let key = prompt("API Key missing. Please enter your API Key here. To get a free API key register here: https://api.openweathermap.org", "")
        sessionStorage.setItem('key',key);
    }

    
    function acceptCookieNotice() {
        let cookieNoticeWrapper = document.querySelector('#cookie-notice');
        let acceptBtn = document.querySelector('.accept-btn');

        if(!getCookie('CookieNotice')) {
            cookieNoticeWrapper.classList.add('active');
        } else {
            cookieNoticeWrapper.classList.remove('active');
        }

        acceptBtn.addEventListener('click', () => {
            cookieNoticeWrapper.classList.remove('active');
            setCookie('CookieNotice', 'Accept', 1);
        });
    }
    acceptCookieNotice();

    function setCookie(cname, cvalue, exdays) {
        const d = new Date();
        d.setTime(d.getTime() + (exdays*24*60*60*1000));
        let expires = "expires="+ d.toUTCString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    }

    function getCookie(cname) {
        let name = cname + "=";
        let ca = document.cookie.split(';');
        for(let i = 0; i < ca.length; i++) {
          let c = ca[i];
          while (c.charAt(0) == ' ') {
            c = c.substring(1);
          }
          if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
          }
        }
        return "";
      }

    const API = {
        key: sessionStorage.getItem('key'),
        base: "https://api.openweathermap.org/data/2.5/"
    }
    const appScreen = document.querySelector('.app');
    const addBtn = document.querySelector('.search-btn');
    const city = document.querySelector('.location');
    const icon = document.querySelector('.weather-icn');
    const tempDeg = document.querySelector('.temperature');
    const feelLikeTemp = document.querySelector('.feels-like__deg');
    const humidity = document.querySelector('.humidity__value');
    const windSpeed = document.querySelector('.wind-speed__value');
    const description = document.querySelector('.description__value');

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(setPosition => {
            long = setPosition.coords.longitude;
            lat = setPosition.coords.latitude;
            const apiLocation = `${API.base}weather?lat=${lat}&lon=${long}&units=metric&appid=${API.key}`
            fetch(apiLocation)
                .then(weather => {
                    return weather.json();
                }).then(displayResults);
        });
    } else {
        showError(error);
        alert("User did not allowed GEO-Location");
    }

    function showError(error) {
        alert(`${error.message}`);
    }

    //Open-Close Search Box
    let open = false;

    addBtn.addEventListener('click', () => {
        $('#city-input').val("");

        if (!open) {
            $('.overlay').css("visibility", "visible");
            addBtn.style.transform = "rotate(-45deg)";
            addBtn.style.transition = ".35s ease-in-out";
            document.querySelector('.app__bottom-body').classList.add('blur');
            document.querySelector('.app__top-body').classList.add('blur');
            open = true;
        } else {
            $('.overlay').css("visibility", "hidden");
            addBtn.style.transform = "none";
            document.querySelector('.app__bottom-body').classList.remove('blur');
            document.querySelector('.app__top-body').classList.remove('blur');
            open = false;
        }
    });


    //Search-box functionality 
    const searchBox = document.querySelector('#city-input');
    searchBox.addEventListener("keypress", setQuery);

    function setQuery(evt) {
        if (evt.keyCode == 13) {
            getResults(searchBox.value);
            $('.overlay').css("visibility", "hidden");
            addBtn.style.transform = "none";
            document.querySelector('.app__bottom-body').classList.remove('blur');
            document.querySelector('.app__top-body').classList.remove('blur');
            open = false;
        }
    }

    //Get results from API with Search-box
    function getResults(query) {
        fetch(`${API.base}weather?q=${query}&units=metric&APPID=${API.key}`)
            .then(weather => {
                return weather.json();
            }).then(displayResults);
    }

    //Display results
    function displayResults(weather) {
        //Assign API data
        city.textContent = `${weather.name}, ${weather.sys.country}`;
        icon.innerHTML = `<img src="./assets/wicons/${weather.weather[0].icon}.png"/>`;
        tempDeg.textContent = parseInt(`${Math.round(weather.main.temp)}`);
        feelLikeTemp.textContent = `${Math.round(weather.main.feels_like)}`
        humidity.textContent = `${Math.round(weather.main.humidity)}`;
        windSpeed.textContent = `${weather.wind.speed}`;
        description.textContent = `${weather.weather[0].description}`;

        //Get the time
        function getTime() {
            var d = new Date();
            h = (d.getHours() < 10 ? '0' : '') + d.getHours(),
                m = (d.getMinutes() < 10 ? '0' : '') + d.getMinutes();
            document.querySelector(".time").textContent = h + ":" + m;
            setTimeout(getTime, 1000);
        }

        getTime();
        const time = document.querySelector('.time').textContent;
        
        //Color themes
        //Sunrise
        let unix_timestampSunrise = `${weather.sys.sunrise}`;
        let unformattedSunrise = new Date(unix_timestampSunrise * 1000);
        let sunriseHours = unformattedSunrise.getHours();
        let sunriseMinute = "0" + unformattedSunrise.getMinutes();
        let sunrise = sunriseHours + ":" + sunriseMinute.substr(-2);
        //Sundown
        let unix_timestampSunset = `${weather.sys.sunset}`;
        let unformattedSunset = new Date(unix_timestampSunset * 1000);
        let sunsetHours = unformattedSunset.getHours();
        let sunsetMinute = "0" + unformattedSunset.getMinutes();
        let sunset = sunsetHours + ":" + sunsetMinute.substr(-2);
        
        //Data
        let temp = parseInt(`${Math.round(weather.main.temp)}`);
        let lowMargin = "10";
        let highMargin = "26";
        let day = time >= sunrise && time < sunset;
        let night = time < sunrise || time > sunset;

        if (temp <= lowMargin && day) {
            //low-day
            let color1 = "#80848D";
            let color2 = "#ADB7BE";
            appScreen.style.background = `linear-gradient(${color1}, ${color2})`;
        } else if (temp <= lowMargin && night) {
            //low-night
            let color1 = "#3E393F";
            let color2 = "#535876";
            appScreen.style.background = `linear-gradient(${color1}, ${color2})`;
        } else if (temp > highMargin && day) {
            //high-day
            let color5 = "#EC7303";
            let color6 = "#ECB327";
            appScreen.style.background = `linear-gradient(${color5}, ${color6})`;
        } else if (temp > highMargin && night) {
            //high-night
            let color5 = "#18255E";
            let color6 = "#8E0000";
            appScreen.style.background = `linear-gradient(${color5}, ${color6})`;
        } else if (temp > lowMargin && temp < highMargin && day) {
            //normal-day
            let color3 = "#52A4DB";
            let color4 = "#73BAE1";
            appScreen.style.background = `linear-gradient(${color3}, ${color4})`;
        } else {
            //normal-night
            let color3 = "#18255E";
            let color4 = "#2B2349";
            appScreen.style.background = `linear-gradient(${color3}, ${color4})`;
        }
    }
});