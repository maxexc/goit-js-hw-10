import '../css/styles.css';
import Notiflix from 'notiflix';
import debounce from 'lodash.debounce';
import { fetchCountries } from './fetchCountries.js';

const DEBOUNCE_DELAY = 300;

const refs = {
  input: document.querySelector('#search-box'),
  countryList: document.querySelector('.country-list'),
  countryInfo: document.querySelector('.country-info'),
};
refs.input.addEventListener('input', debounce(onChangeHandler, DEBOUNCE_DELAY));
refs.countryList.addEventListener('click', onClickLink);

function onChangeHandler(evt) {
  const searchValue = evt.target.value.trim();
  refs.countryInfo.innerHTML = '';
  refs.countryList.innerHTML = '';

  if (searchValue) {
    fetchCountries(searchValue)
      .then(result => {
        if (result.length > 10) {
          setTimeout(() => refs.countryList.classList.remove('translate'), 250);
          Notiflix.Notify.info(
            'Too many matches found. Please enter a more specific name.'
          );
          return;
        }
        renderingHtml(result);
        setTimeout(() => refs.countryList.classList.add('translate'), 250);
      })
      .catch(err => {
        Notiflix.Notify.failure('Oops, there is no country with that name.');
        console.log(`Something wrong... ${err}`);
      });
  }
}

function renderingHtml(countriesData) {
  if (countriesData.length <= 10 && countriesData.length >= 2) {
    refs.countryList.insertAdjacentHTML(
      'afterbegin',
      createMarkupCountyList(countriesData)
    );
    return;
  }
  if (countriesData.length === 1) {
    refs.countryList.insertAdjacentHTML(
      'afterbegin',
      createMarkupCountyList(countriesData, true)
    );
    refs.countryInfo.insertAdjacentHTML(
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
      }' src='${flags.svg}' alt="${name.common}"'/> ${name.official}
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
  console.log(evt.target.nodeName);
  if (evt.target.nodeName === 'UL' || evt.target.nodeName === 'LI') {
    return;
  }

  refs.input.value = evt.target.dataset.href.trim();
  console.log(evt.target);
  onChangeHandler({ target: refs.input });
}
