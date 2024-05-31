// JavaScript that enhances 1-hbnb.html with dynamic filters with jQuery
'use script';
$(() => {
  let selectedAmenities = [];
  const selectors = {
    amenitiesHeader: '.amenities > h4',
    amenityCheckBox: '.amenities > .popover > ul > li > input[type="checkbox"]',
    amenityListItem: '.amenities > .popover > ul > li'
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
});
