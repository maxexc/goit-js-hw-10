import '../css/styles.css';
import Notiflix from 'notiflix';
import debounce from 'lodash.debounce';
import { fetchCountries } from './fetchCountries.js';

const DEBOUNCE_DELAY = 300;

const input = document.querySelector('#search-box');
const countryList = document.querySelector('.country-list');
const countryInfo = document.querySelector('.country-info');

input.addEventListener('input', debounce(onChangeHandler, DEBOUNCE_DELAY));
countryList.addEventListener('click', onClickLink);

function onChangeHandler(e) {
  const searchValue = e.target.value.trim();
  countryInfo.innerHTML = '';
  countryList.innerHTML = '';

  if (searchValue) {
    fetchCountries(searchValue)
      .then(result => {
        if (result.length > 10) {
          setTimeout(() => countryList.classList.remove('translate'), 200);
          Notiflix.Notify.info(
            'Too many matches found. Please enter a more specific name.'
          );
          return;
        }
        renderingHtml(result);
        setTimeout(() => countryList.classList.add('translate'), 200);
      })
      .catch(err => {
        Notiflix.Notify.failure('Oops, there is no country with that name.');
        console.log(`Something wrong... ${err}`);
      });
  }
}

function renderingHtml(countriesData) {
  if (countriesData.length <= 10 && countriesData.length >= 2) {
    countryList.insertAdjacentHTML(
      'afterbegin',
      createMarkupCountyList(countriesData)
    );
    return;
  }
  if (countriesData.length === 1) {
    countryList.insertAdjacentHTML(
      'afterbegin',
      createMarkupCountyList(countriesData, true)
    );
    countryInfo.insertAdjacentHTML(
      'afterbegin',
      createMarkupCountyInfo(countriesData)
    );
    return;
  }
}

function createMarkupCountyList(countriesData, isSingle = false) {
  console.log(countriesData);
  return countriesData
    .map(({ name, flags }) => {
      return `<li class='country-item ${
        isSingle ? 'country-item--single' : null
      }'>
      <a data-href="${name.official}" class="country-item__link" href="#"> 
      <img data-href="${name.official}" class='country-flag ${
        isSingle ? 'country-flag--single' : null
      }' src='${flags.svg}' alt="${name.official}"'/> ${name.official}
      </a>
      </li>`;
    })
    .join(' ');
}

function createMarkupCountyInfo(countriesData) {
  const capitalStr = countriesData[0].capital.join(', ');
  const population = countriesData[0].population;
  const languagesStr = Object.values(countriesData[0].languages).join(', ');
  return `<p class='country-description'><span class='description-label'>Capital:</span>${capitalStr}</p><p class='country-description'><span class='description-label'>Population:</span>${population}</p><p class='country-description'><span class='description-label'>Languages:</span>${languagesStr}</p>`;
}

function onClickLink(evt) {
  evt.preventDefault();

  input.value = evt.target.dataset.href.trim();
  console.log(evt.target);
  onChangeHandler({ target: input });
}
