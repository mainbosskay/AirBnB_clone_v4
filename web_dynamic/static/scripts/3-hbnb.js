// JavaScript that requests and displays places dynamically from backend endpoint to frontend
'use strict';
$(() => {
  let selectedAmenities = [];
  const selectors = {
    amenitiesHeader: '.amenities > h4',
    amenityCheckBox: '.amenities > .popover > ul > li > input[type="checkbox"]',
    amenityListItem: '.amenities > .popover > ul > li'
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

  $(selectors.amenityListItem).on('mousedown', evn => {
    evn.target.getElementsByTagName('input')?.item(0)?.click();
  });

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
        objt => (objt.id !== amenityId) && (objt.name !== amenityName)
      );
    }
    const htmlContent = selectedAmenities.map(objt => objt.name).join(', ');
    $(selectors.amenitiesHeader).html(
      selectedAmenities.length > 0 ? htmlContent : '&nbsp;'
    );
  });

  $.get(`${APIURL}/status`, (data, status) => {
    if ((status === 'success') && (data.status === 'OK')) {
      if (!$('div#api_status').hasClass('available')) {
        $('div#api_status').addClass('available');
      }
    } else {
      $('div#api_status').removeClass('available');
    }
  });

  updatePlacesDisplay({});
});
