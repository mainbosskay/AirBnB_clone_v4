// JavaScript that updates API endpoint, checks status and applies visual indicator
'use script';
$(() => {
  let selectedAmenities = [];
  const selectors = {
    amenitiesHeader: '.amenities > h4',
    amenityCheckBox: '.amenities > .popover > ul > li > input[type="checkbox"]',
    amenityListItem: '.amenities > .popover > ul > li'
  };
  const APIURL = 'http://localhost:5001/api/v1';

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
});
