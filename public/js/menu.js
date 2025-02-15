$(document).ready(function(){
  const slidesContainer = $('.slides-container');
  let totalSlides = 0;
  let slideIndex = 0;

  $.ajax({
    url: '/api/menus',
    method: 'GET',
    success: (data) => {
      totalSlides = data.length;

      data.forEach(menu => {
        let menuName = menu.name;
        let parsedMenuName = menuName.toLowerCase().replace(/\(.*\)/, '').trim().replace(' ', '-');

        let menuItems = '';
        menu.items.forEach(menuItem => {
          let itemName = menuItem.name;
          let itemPrice = menuItem.price;
          let parsedItemName = parseName(menuName, itemName);
          
          let img = new Image();
          img.src = `/public/img/${parsedItemName}.png`;

          menuItems += `
            <div class="col-12 col-md menu-item d-flex flex-column">
                <div class="item-img-container d-block">
                    <img src="/public/img/${parsedItemName}.png" alt="Menu item" 
                    class="item-img d-block mx-auto"/>
                </div>
                <div class="item-details-container">
                    <h4 class="item-name">${itemName}</h4>
                    <h5 class="item-price">₱${itemPrice}</h5>
                </div>
            </div>
          `;
        });

        let img = new Image();
        img.src = `/public/img/${parsedMenuName}-title.png`;

        $('.slides-container').append(`
          <div class="slide container-fluid overflow-hidden">
            <div class="container-fluid title-container mb-4"> 
                <img src="/public/img/${parsedMenuName}-title.png" alt="menu-title" 
                class="menu-title d-block mx-auto" />
            </div>
            <div class="menu-items-container container-fluid p-4">
                <div class="row d-flex justify-content-evenly align-items-center">${menuItems}</div>
            </div>
          </div>  
        `);
      });
      
      $('.loader').css('display', 'none');
      $('main.container').css('display', 'flex');
    },
    error: (err) => {
      console.error('Error fetching data: ', err);
    }
  });

  $('#prev-menu-btn').on('click', () => {
    let slideWidth = $('.slide').outerWidth();

    slidesContainer.css('transform', `translateX(-${(slideIndex-1) * slideWidth}px)`);
    slideIndex -= 1;

    if (slideIndex === 0) {
      $('#prev-menu-btn').css({
        'color': '#4b4b4bee',
        'pointerEvents': 'none',
      });
    } 

    $('#next-menu-btn').css({
      'color': '#a6211aee',
      'pointerEvents': 'auto',
    });
  });

  $('#next-menu-btn').on('click', () => {
    let slideWidth = $('.slide').outerWidth();
    
    slidesContainer.css('transform', `translateX(-${(slideIndex+1) * slideWidth}px)`);
    slideIndex += 1;

    if (slideIndex === totalSlides-1) {
      $('#next-menu-btn').css({
        'color': '#4b4b4bee',
        'pointerEvents': 'none',
      });
    } 

    $('#prev-menu-btn').css({
      'color': '#a6211aee',
      'pointerEvents': 'auto',
    });
  });
});

function parseName(menuName, itemName) {
  // Format: menu-name-item-name
  return [
    menuName.toLowerCase().replace(/\(.*\)/, '').trim().replace(' ', '-'),
    itemName.split(' ')[0].toLowerCase().replace(/[^A-Za-z0-9]/g, ''),
  ].join('-')
}