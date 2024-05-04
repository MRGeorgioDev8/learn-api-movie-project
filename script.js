// Добавление элементов DOM
const searchStatus = document.getElementById('search-status');
const titleInput = document.getElementById('title');
const typeSelect = document.getElementById('type');
const searchResultsContainer = document.getElementById('search-results-container');
const statusOutput = document.getElementById('status-output');

// Создание объекта запроса XMLHttpRequest
const request = new XMLHttpRequest();
request.responseType = 'json'; // Установка типа ответа на JSON
const apiKey = '1542f441-100e-479c-8513-47ebe4cff099'; // Ключ API
let title, type;

// Создание кнопки поиска и добавление обработчика события клика
const searchButton = document.getElementById('search-button');
searchButton.addEventListener('click', function(event) {
    processInitialRequest();
});

// Функция для обработки начального запроса
function processInitialRequest() {
    if (!titleInput.value) {
        updateStatus('Пустой заголовок \nПожалуйста введите данные для поиска!!!');
        return;
    }

    if (titleInput.value == title && typeSelect.value == type) {
        updateStatus('Повторение заголовка\nПожалуйста введите новый заголовок');
        return;
    }

    event.stopPropagation();
    title = titleInput.value;
    titleInput.value = '';
    console.log('searchForm.addEvenlistener =>', title);
    type = typeSelect.value;
    statusOutput.innerText = 'Загрузка...';
    const url = `https://kinopoiskapiunofficial.tech/api/v2.2/films?order=RATING&ratingFrom=0&ratingTo=10&yearFrom=1000&yearTo=3000&type=${type}&keyword=${title}&page=1`;

    // GSAP Плавное появление контейнера с результатами поиска
    gsap.from(searchResultsContainer, { duration: 0.7, delay:0.4, opacity: 0, scale: 1, ease: "power2.inOut" });

    sendRequest(url);

    const cinemaCards = searchResultsContainer.querySelectorAll('.cinema-card');
    for (const cinemaCard of cinemaCards) {
        cinemaCard.remove();
    }
}

// Функция для обновления статуса
function updateStatus(statusText) {
    const prevStatus = statusOutput.innerText;
    statusOutput.innerText = statusText;

    if (prevStatus) {
        setTimeout(() => {
            statusOutput.innerText = '';
        }, 10e3);
    }
}

// Функция для отправки запроса
function sendRequest(url) {
    request.open('GET', url);
    request.setRequestHeader('X-API-KEY', apiKey);
    request.send();
    console.time('request');
}

// Функция для обработки ответа на запрос
function processResponse() {
    console.timeEnd('request');
    if (request.status == 200) {
        const typeString = typeSelect.selectedOptions[0].text;
        statusOutput.innerText = `${typeString}  с названием "${title}"`;
        const response = request.response;
        if ('items' in request.response) {
            searchResults = response.items;
            processSearchResults(searchResults);
            processSearchResults(request.response.items);
        } else {
            processDetails(request.response);
        }
    } else {
        console.log(request.statusText);
    }
}

request.addEventListener('load', processResponse);

// Функция для обработки деталей фильма
function processDetails(cinemaFullInfo) {
    const { posterUrl: poster, ratingKinopoisk: rating, nameRu: title, genres, countries, year, shortDescription: description, webUrl } = cinemaFullInfo;

    const cinemaFullCard = `
		<div id="fixed-container">
			<div id="cinema-full-card">
				<div class="poster">
					<img src="${poster}" alt="Poster of ${title}">
				</div>
				<div class="info">
					<p class="rating">Рейтинг: ${rating}</p>
					<h2 class="title">${title}</h2>
					<h3 class="genre">Жанр:
						${genres
        .map(item => item.genre)
        .join(', ')
        .replace(/^./, letter => letter.toUpperCase())}
					</h3>
					<h4 class="country">Страна:
					${countries
        .map(item => item.country)
        .join(', ')
        .replace(/^./, letter => letter.toUpperCase())}
					<p class="year">Год выпуска: ${year}</p>
					<p class="description">${description}</p>
					<a href="${webUrl}" target="_blank" style="color: orange; text-decoration: none;">Ссылка на Кинопоиск</a>
				</div>
				<button style="color: azure">&times;</button>
			</div>
		</div> `;

    document.body.insertAdjacentHTML('beforeend', cinemaFullCard);

    document.body.style.width = getComputedStyle(document.body).width;
    document.body.style.overflow = 'hidden';
    const fixedContainer = document.getElementById('fixed-container');
    const removeFixedContainer = () => {
        fixedContainer.remove();
        document.body.style.width = '';
        document.body.style.overflow = '';
    };

    document.querySelector('#cinema-full-card button').addEventListener('click', function() {
    const cinemaFullCard = document.getElementById('cinema-full-card');

    // Получаем высоту контейнера
    const containerHeight = cinemaFullCard.offsetHeight;

    // Анимация GSAP плавного закрытия cinema-full-card
    gsap.to(cinemaFullCard, { duration: 0.4, opacity: 0, y: -11, scaleY: 0, ease: "power2.out", onComplete: removeFixedContainer });

    // Добавляем анимацию для уменьшения высоты контейнера сверху и снизу
    gsap.to(cinemaFullCard, { duration: 11, height: 0, top: containerHeight / 2, bottom: containerHeight / 2, ease: "power1.in" });

    }, { once: true });

    fixedContainer.addEventListener('click', function(event) {
        if (event.target.matches('#fixed-container')) {
            removeFixedContainer();
        }
    }, { once: true });

   // Функция эффекта всплывающего окна с использованием GSAP
    function showCinemaFullCard() {
        const cinemaFullCard = document.getElementById('cinema-full-card');
        gsap.set(cinemaFullCard, { scale: 0, opacity: 1 });
        gsap.to(cinemaFullCard, { duration: 0.2, opacity: 1, y: -50, scale: 1, ease: "power2.out" });
    }

    showCinemaFullCard();
}

// Функция для обработки результатов поиска
function processSearchResults(searchResults) {
    console.log('Поиск =>', searchResults);

    searchResults.forEach(function(result) {
        const { posterUrl: poster, nameRu: title, ratingKinopoisk: rating, year, kinopoiskId } = result;

        const card = `
			<div class="cinema-card" data-kinopoisk-id=${kinopoiskId}>
				<div class="poster"><img src="${poster}" alt="Poster of ${title}"></div>
				<div class="info">
					<div class="rating-favorite-container">
						<p class="rating">Рейтинг: ${rating}</p>
					</div>
					<h6 class="title">${title}</h6>
					<p class="year">Год выпуска: ${year}</p>
				</div>
			</div>`;

        searchResultsContainer.insertAdjacentHTML('beforeend', card);
    });
}

searchResultsContainer.addEventListener('click', processDetailsResponse);

function processDetailsResponse(event) {
    const card = event.target.closest('div.cinema-card');

    if (card) {
        const kinopoiskId = card.dataset.kinopoiskId;
        const url = `https://kinopoiskapiunofficial.tech/api/v2.2/films/${kinopoiskId}`;
        sendRequest(url);
    }
}