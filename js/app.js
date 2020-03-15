// ---------- Materialize Components Initialization ----------
document.addEventListener('DOMContentLoaded', function() {
  M.AutoInit();
});


// ---------- Modules Initialization ----------
const request = http();
const news = newsService();


// ---------- ELEMENTS UI ----------
const newsContainer = document.querySelector('.news-container .row');
const searchForm = document.forms['newsControls'];
const inputCountry = searchForm.elements['country'];
const inputSearch = searchForm.elements['search'];


// ---------- EVENTS ----------
searchForm.addEventListener('submit', e => {
  e.preventDefault();
  const searchText = inputSearch.value;
  if (searchText) {
    news.everything(searchText);
    return;
  }

  news.headlines(inputCountry.value);
});


// ---------- DEFAULT REQUEST ----------
news.headlines();


// --------------------------------------------------------------------------------------

// ---------- CONTENT CREATION ----------
function afterRequest(error, resp) {
  if (error) {
    console.log(error);
    return;
  }

  renderNews(resp);
}

function renderNews(resp) {
  const news = resp.articles;
  if (!news.length) {
    console.log('NO NEWS');
    return;
  }
  let fragment = '';
  news.forEach(n => {
    fragment += newsItemTemplate(n);
  });

  clearNewsContainer();
  newsContainer.insertAdjacentHTML("afterbegin", fragment);
}


function clearNewsContainer() {
  newsContainer.innerHTML = '';
}


// ---------- MAKEUP TEMPLATE ----------
function newsItemTemplate({title, description, url, urlToImage}) {
  return `<div class="col s12">
            <div class="card">
              <div class="card-image">
                <img src="${urlToImage || 'images/no-image.jpg'}" alt="">
                <span class="card-title">${title}</span>
              </div>
                <div class="card-content">
                <p>${description || ''}</p>
              </div>
              <div class="card-action">
                <a href="${url}">Читать дальше...</a>
              </div>
            </div>
          </div>`;
}


// ---------- NEWS SERVICE FOR API ----------
function newsService() {
  const apiURL = 'http://newsapi.org/v2/';
  const apiKey = 'f46f43f8bb084a74a6fd2b07a0ec4249';
  return {
    headlines(country = 'ru') {
      request.get(`${apiURL}top-headlines?country=${country}&apiKey=${apiKey}`, afterRequest);
    },
    everything(searchText = 'fuck') {
      request.get(`${apiURL}everything?q=${searchText}&apiKey=${apiKey}`, afterRequest);
    },
  };
}


// ---------- REQUEST MODULE ----------
function http() {
  return {
    get(url, cb) {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.addEventListener('load', () => {
          if (Math.floor(xhr.status / 100) !== 2) {
            cb(`Error! Status code: ${xhr.status}`, xhr);
            return;
          }

          const response = JSON.parse(xhr.responseText);
          cb(null, response);
        });
        xhr.addEventListener('error', () => {
          cb(`Error! Status code: ${xhr.status}`, xhr);
        });

        xhr.send();
      }
      catch (error) {
        cb(error);
      }
    },
    post(url, body, headers, cb) {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', url);
        if (headers) {
          Object.entries(headers).forEach(([key, value]) => {
            xhr.setRequestHeader(key, value);
          });
        }

        xhr.addEventListener('load', () => {
          if (Math.floor(xhr.status / 100) !== 2) {
            cb(`Error! Status code: ${xhr.status}`, xhr);
            return;
          }

          const response = JSON.parse(xhr.responseText);
          cb(null, response);
        });
        xhr.addEventListener('error', () => {
          cb(`Error! Status code: ${xhr.status}`, xhr);
        });

        xhr.send(JSON.stringify(body));
      }
      catch (error) {
        cb(error);
      }
    }

  };
}


