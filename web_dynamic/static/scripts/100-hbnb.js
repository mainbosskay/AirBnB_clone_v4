// JavaScript that implements filtering by State and City, updating locations on checkbox change
'use strict';
$(() => {
  let selectedAmenities = [];
  let selectedLocations = [];
  const LocationList = {
    state: 1,
    city: 2
  };
  const selectors = {
    amenitiesHeader: '.amenities > h4',
    amenityCheckBox: '.amenities > .popover > ul > li > input[type="checkbox"]',
    amenityListItem: '.amenities > .popover > ul > li',
    locationsHeader: '.locations > h4',
    stateBox: '.locations > .popover > ul > li > h2 > input[type="checkbox"]',
    stateItem: '.locations > .popover > ul > li > h2',
    cityBox:
      '.locations > .popover > ul > li > ul > li > input[type="checkbox"]',
    cityItem: '.locations > .popover > ul > li > ul > li'
  };
  const APIURL = 'http://localhost:5001/api/v1';

  const buildPlaceElement = place => {
    if (place) {
      const article = document.createElement('article');

      const titleBox = document.createElement('div');
      titleBox.className = 'title_box';
      const titleHTML = `<h2>${place.name}</h2>`;
      const priceByNightHTML = '<div class="price_by_night">' +
        `$${place.price_by_night}` +
        '</div>';
      titleBox.insertAdjacentHTML('beforeend', titleHTML);
      titleBox.insertAdjacentHTML('beforeend', priceByNightHTML);

      const informationBox = document.createElement('div');
      informationBox.className = 'information';
      const maxGuestHTML = '<div class="max_guest">' +
        `${place.max_guest}` +
        ` Guest${place.max_guest !== 1 ? 's' : ''}` +
        '</div>';
      const numberRoomsHTML = '<div class="number_rooms">' +
        `${place.number_rooms}` +
        ` Bedroom${place.number_rooms !== 1 ? 's' : ''}` +
        '</div>';
      const numberBathroomsHTML = '<div class="number_bathrooms">' +
        `${place.number_bathrooms}` +
        ` Bathroom${place.number_bathrooms !== 1 ? 's' : ''}` +
        '</div>';
      informationBox.insertAdjacentHTML('beforeend', maxGuestHTML);
      informationBox.insertAdjacentHTML('beforeend', numberRoomsHTML);
      informationBox.insertAdjacentHTML('beforeend', numberBathroomsHTML);

      const userBox = document.createElement('div');
      userBox.className = 'user';
      if (place.user) {
        const userHTML = '<b>Owner:</b>' +
          ` ${place.user.first_name} ${place.user.last_name}`;
        userBox.insertAdjacentHTML('beforeend', userHTML);
      }

      const descriptionBox = document.createElement('div');
      descriptionBox.className = 'description';
      descriptionBox.innerHTML = place.description;

      article.insertAdjacentElement('beforeend', titleBox);
      article.insertAdjacentElement('beforeend', informationBox);
      article.insertAdjacentElement('beforeend', userBox);
      article.insertAdjacentElement('beforeend', descriptionBox);
      return article;
    } else {
      return null;
    }
  };
  const getPlaces = filter => {
    const placesFetcher = new Promise((resolve, reject) => {
      $.ajax({
        url: `${APIURL}/places_search`,
        type: 'POST',
        data: JSON.stringify(filter || {}),
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        success: data => {
          const placeOwnerPromises = data.map(place => new Promise((resolve, reject) => {
            $.get(`${APIURL}/users/${place.user_id}`, (data, status) => {
              const fullPlace = place;
              fullPlace.user = data;
              resolve(fullPlace);
            });
          }));
          Promise
            .all(placeOwnerPromises)
            .then(places => resolve(places))
            .catch(err => reject(err));
        }
      });
    });
    return placesFetcher;
  };
  const updatePlacesDisplay = filter => {
    getPlaces(filter)
      .then(places => {
        $('section.places').empty();
        $('section.places').append('<h1>Places</h1>');
        for (let k = 0; k < places.length; k++) {
          $('section.places').append(buildPlaceElement(places[k]));
        }
      });
  };
  const clickChildInput = evn => {
    evn.target.getElementsByTagName('input')?.item(0)?.click();
  };

  $(selectors.amenityListItem).on('mousedown', clickChildInput);
  $(selectors.stateItem).on('mousedown', clickChildInput);
  $(selectors.cityItem).on('mousedown', clickChildInput);

  $(selectors.amenityCheckBox).change(evn => {
    const amenityId = evn.target.getAttribute('data-id');
    const amenityName = evn.target.getAttribute('data-name');

    if (evn.target.checked) {
      if (!selectedAmenities.find(objt => objt.id === amenityId)) {
        selectedAmenities.push({
          id: amenityId,
          name: amenityName
        });
      }
    } else {
      selectedAmenities = selectedAmenities.filter(
        objt => objt.id !== amenityId && objt.name !== amenityName
      );
    }
    const htmlContent = selectedAmenities.map(objt => objt.name).join(', ');
    $(selectors.amenitiesHeader).html(
      selectedAmenities.length > 0 ? htmlContent : '&nbsp;'
    );
  });

  $(selectors.stateBox).change(evn => {
    const stateId = evn.target.getAttribute('data-id');
    const stateName = evn.target.getAttribute('data-name');
    const statePred = objt => (
      (objt.id === stateId) && (objt.type === LocationList.state)
    );

    if (evn.target.checked) {
      if (!selectedLocations.find(statePred)) {
        const stateElement = evn.target.parentElement.parentElement;
        const citiesULElement = stateElement.getElementsByTagName('ul').item(0);
        const cityElements = citiesULElement.getElementsByTagName('li');
        const cityIdsToRemove = [];

        selectedLocations.push({
          type: LocationList.state,
          id: stateId,
          name: stateName
        });
        for (let k = 0; k < cityElements.length; k++) {
          const inputElements = cityElements[k].getElementsByTagName('input');

          if (inputElements) {
            const inputCheckBox = inputElements.item(0);
            if (!inputCheckBox.checked) {
              inputCheckBox.checked = true;
            } else {
              cityIdsToRemove.push(inputCheckBox.getAttribute('data-id'));
            }
          }
        }
        selectedLocations = selectedLocations
          .filter(
            objt => (!(
              cityIdsToRemove.includes(objt.id) &&
              (objt.type === LocationList.city)
            ))
          );
      }
    } else {
      const stateElement = evn.target.parentElement.parentElement;
      const citiesULElement = stateElement.getElementsByTagName('ul').item(0);
      const cityElements = citiesULElement.getElementsByTagName('li');
      const cityIdsToRemove = [];

      for (let k = 0; k < cityElements.length; k++) {
        const inputElements = cityElements[k].getElementsByTagName('input');

        if (inputElements) {
          const inputCheckBox = inputElements.item(0);
          if (inputCheckBox.checked) {
            inputCheckBox.checked = false;
            cityIdsToRemove.push(inputCheckBox.getAttribute('data-id'));
          }
        }
      }
      selectedLocations = selectedLocations
        .filter(objt => !statePred(objt))
        .filter(
          objt => (!(
            cityIdsToRemove.includes(objt.id) &&
            (objt.type === LocationList.city)
          ))
        );
    }
    const htmlContent = selectedLocations.map(objt => objt.name).join(', ');
    $(selectors.locationsHeader).html(
      selectedLocations.length > 0 ? htmlContent : '&nbsp;'
    );
  });

  $(selectors.cityBox).change(evn => {
    const cityId = evn.target.getAttribute('data-id');
    const cityName = evn.target.getAttribute('data-name');
    const cityPred = objt => (
      (objt.id === cityId) &&
      (objt.type === LocationList.city)
    );

    if (evn.target.checked) {
      if (!selectedLocations.find(cityPred)) {
        const stateElement =
          evn.target.parentElement.parentElement.parentElement;
        const stateHeader = stateElement.getElementsByTagName('h2').item(0);
        const stateCheckBox = stateHeader.getElementsByTagName('input').item(0);
        const citiesULElement = stateElement.getElementsByTagName('ul').item(0);
        const cityElements = citiesULElement.getElementsByTagName('li');
        const cityIdsSelected = [];

        for (let k = 0; k < cityElements.length; k++) {
          const inputElements = cityElements[k].getElementsByTagName('input');

          if (inputElements) {
            const inputCheckBox = inputElements.item(0);
            if (inputCheckBox.checked) {
              cityIdsSelected.push(inputCheckBox.getAttribute('data-id'));
            }
          }
        }
        if (cityIdsSelected.length === cityElements.length) {
          // change cities to state
          selectedLocations = selectedLocations
            .filter(
              objt => (!(
                cityIdsSelected.includes(objt.id) &&
                (objt.type === LocationList.city)
              ))
            );
          selectedLocations.push({
            type: LocationList.state,
            id: stateCheckBox.getAttribute('data-id'),
            name: stateCheckBox.getAttribute('data-name')
          });
          stateCheckBox.checked = true;
        } else {
          selectedLocations.push({
            type: LocationList.city,
            id: cityId,
            name: cityName
          });
        }
      }
    } else {
      const stateElement =
        evn.target.parentElement.parentElement.parentElement;
      const stateHeader = stateElement.getElementsByTagName('h2').item(0);
      const stateCheckBox = stateHeader.getElementsByTagName('input').item(0);
      const citiesULElement = stateElement.getElementsByTagName('ul').item(0);
      const cityElements = citiesULElement.getElementsByTagName('li');
      const citiesSelected = [];

      for (let k = 0; k < cityElements.length; k++) {
        const inputElements = cityElements[k].getElementsByTagName('input');

        if (inputElements) {
          const inputCheckBox = inputElements.item(0);
          if (inputCheckBox.checked) {
            citiesSelected.push({
              id: inputCheckBox.getAttribute('data-id'),
              name: inputCheckBox.getAttribute('data-name')
            });
          }
        }
      }
      if (stateCheckBox.checked) {
        const stateId = stateCheckBox.getAttribute('data-id');
        const statePred = objt => (
          (objt.id === stateId) && (objt.type === LocationList.state)
        );
        selectedLocations = selectedLocations
          .filter(objt => !statePred(objt));
        for (let k = 0; k < citiesSelected.length; k++) {
          selectedLocations.push({
            type: LocationList.city,
            id: citiesSelected[k].id,
            name: citiesSelected[k].name
          });
        }
        stateCheckBox.checked = false;
      } else {
        selectedLocations = selectedLocations.filter(objt => !cityPred(objt));
      }
    }
    const htmlContent = selectedLocations.map(objt => objt.tname).join(', ');
    $(selectors.locationsHeader).html(
      selectedLocations.length > 0 ? htmlContent : '&nbsp;'
    );
  });

  $.get(`${APIURL}/status`, (data, status) => {
    if (status === 'success' && data.status === 'OK') {
      if (!$('div#api_status').hasClass('available')) {
        $('div#api_status').addClass('available');
      }
    } else {
      $('div#api_status').removeClass('available');
    }
  });

  updatePlacesDisplay({});

  $('section.filters > button').click(() => {
    const filter = {
      states: selectedLocations
        .filter(objt => objt.type === LocationList.state)
        .map(objt => objt.id),
      cities: selectedLocations
        .filter(objt => objt.type === LocationList.city)
        .map(objt => objt.id),
      amenities: selectedAmenities.map(objt => objt.id)
    };

    updatePlacesDisplay(filter);
  });
});
