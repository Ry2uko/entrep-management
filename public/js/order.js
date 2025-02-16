let selectedMenuItem;
let menuData;
let selectedItems = [];

$(document).ready(function(){
  $('main.container').css('display', 'none');
  $('.loader').css('display', 'block');
  resetPage(() => {
    $('main.container-fluid').css('display', 'block');
    $('.loader').css('display', 'none');
  });

  $('.menu-selection').on('click', '.menu-select-btn', function(){
    const menuId = $(this).data('id');
    $('.menu-select-btn.active').removeClass('active');
    $(this).addClass('active');

    loadModalMenu(menuId);
  });

  $('.menu-items-container').on('click', '.menu-item', function(){
    selectedMenuItem = parseInt($(this).data('id'));
    $('.menu-item.selected').removeClass('selected');
    $(this).addClass('selected');
  });

  $('#modal-add-btn').on('click', addMenuItem);
  $('.close-modal-btn').on('click', closeModal);
  $('#modal-cancel-btn').on('click', closeModal);
  $('#add-item-btn').on('click', openModal);
  $('.order-items').on('click', '.remove-order-btn', removeMenuItem);

  $('#cancel-btn').on('click', () => {
    resetPage();
  });

  $('#order-btn').on('click', () => {
    const customerName = $('#customer-name').val();
    if (!customerName) return;

    $('main.container-fluid').css('display', 'none');
    $('.loader').css('display', 'block');

    $.ajax({
      url: '/api/orders',
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({
        'items': selectedItems,
        'customer_name': customerName,
        'total_cost': parseInt($('.order-total').text().slice(1)),
      }),
      success: (response) => {
        resetPage(() => {
          $('main.container-fluid').css('display', 'block');
          $('.loader').css('display', 'none');
        });
      },
      error: (xhr, status, err) => {
        console.error('Error: ', err);
      }
    });
  });
});

function resetPage(cb) {
  selectedMenuItem = undefined;
  menuData = undefined;
  selectedItems = [];

  $('input[type="text"]').val('');
  $('.order-items').empty();
  $('.menu-selection').empty();
  $('.menu-items-container').empty();
  updateTotal();

  $.ajax({
    url: '/api/menus',
    method: 'GET',
    success: (data) => {
      menuData = data;
      console.log(menuData);
      data.forEach((menu, i) => {
        const menuName = menu.name.replace(/\(.*\)/, '').trim();
        if (i === 0) modalMenuActive = menu.id;
        $('.menu-selection').append(`
          <button type="button" class="menu-select-btn ${i === 0 ? 'active' : ''}" data-id="${menu.id}">${menuName}</button>
        `);
      });

      let activeMenuId = parseInt($('.menu-select-btn').first().data('id'));
      loadModalMenu(activeMenuId);
      if (cb) cb();
    },
    error: (err) => {
      console.error('Error fetching data: ', err);
    }
  });
}

function openModal() {
  $('.overlay').css('display', 'block').animate({'opacity': 0.4 }, 500);
  $('#order-modal').css('display', 'block').animate({'opacity': 1}, 500, function() {
    $('.parent-container').css('pointerEvents', 'auto');
  });

  $('.menu-select-btn.active').removeClass('active');
  $('.menu-select-btn').first().addClass('active');
  let activeMenuId = parseInt($('.menu-select-btn').first().data('id'));
  loadModalMenu(activeMenuId);
}

function closeModal() {
  $('.overlay').animate({'opacity': 0 }, 500, function(){
    $(this).css('display', 'none');
  });
  $('#order-modal').animate({'opacity': 0}, 500, function() {
    $(this).css('display', 'none');
    $('.parent-container').css('pointerEvents', 'auto');

    selectedMenuItem = undefined;
    $('.menu-item.selected').removeClass('selected');
    $('.menu-items-container').empty();
  });
}

function updateTotal() {
  let totalCost = 0;

  selectedItems.forEach(item => {
    totalCost += item.quantity * item.price;
  });

  $('.order-total').text(`₱${totalCost}`);
}

function removeMenuItem() {
  let orderItem = $(this).parents('.order-item');
  let orderItemId = orderItem.data('id');
  orderItem.remove();

  let itemIndex;
  for (let i = 0; i < selectedItems.length; i++) {
    if (selectedItems[i].id === orderItemId) {
      itemIndex = i
      break;
    };
  }
  
  selectedItems.splice(itemIndex, 1);
  updateTotal();
}

function addMenuItem() {
  if (!selectedMenuItem) return;

  let menuName, menuItem;

  menuData.forEach(menu => {
    menu.items.forEach(mi => {
      if (mi.id === selectedMenuItem) {
        menuItem = mi;
        menuName = menu.name;
      }
    });
  });

  for (let i = 0; i < selectedItems.length; i++) {
    if (selectedItems[i].id === selectedMenuItem) {
      selectedItems[i].quantity += 1;

      let quantity = selectedItems[i].quantity;
      let orderItem = $(`.order-item[data-id="${menuItem.id}"]`);
      orderItem.find('.order-quantity').text(`x${quantity}`)
      orderItem.find('.order-subtotal').text(`₱${quantity * menuItem.price}`);

      updateTotal();
      closeModal();
      return;
    }
  }

  // Not added yet
  menuItem.quantity = 1
  selectedItems.push(menuItem);

  let parsedItemName = parseName(menuName, menuItem.name);
      $('.order-items').append(`
        <div class="order-item container-fluid d-flex overflow-hidden" data-id="${menuItem.id}">
          <div class="order-img-container">
              <img class="order-img" src="/public/img/${parsedItemName}.png" alt="" />
          </div>
          <div class="order-details-container d-flex flex-column w-100 ms-2 position-relative">
              <span class="order-name">${menuItem.name}</span>
              <span class="order-price">₱${menuItem.price}</span>
              <span class="order-quantity">x1</span>
              <span class="subtotal-container d-flex">
                  <span>Subtotal</span>
                  <span class="order-subtotal ms-auto d-block">₱${menuItem.price}</span>
              </span>
              <button type="button" class="remove-order-btn">
                  <i class="fa-solid fa-xmark"></i>
              </button>
          </div>
      </div>
    `);

  updateTotal();
  closeModal();
}

function loadModalMenu(menuId) {
  if (!menuData) return;

  let menu = menuData.filter(m => m.id === menuId)[0];
  let menuItems = menu.items;
  let menuName = menu.name;

  $('.menu-items-container').empty();
  let row;

  menuItems.forEach((menuItem, i) => {
    if (i % 3 === 0) {
      row = $('<div class="row"></div>');
      $('.menu-items-container').append(row);
    }

    let parsedItemName = parseName(menuName, menuItem.name);
    let img = new Image();
    img.src = `/public/img/${parsedItemName}.png`;

    row.append(`
        <div class="col-4 menu-item ${menuItem.id === selectedMenuItem ? 'selected' : ''}" data-id="${menuItem.id}">
            <div class="item-img-container">
                <img src="/public/img/${parsedItemName}.png" alt="">
            </div>
            <div class="item-details-container">
                <h4 class="item-name">${menuItem.name}</h5>
                <h5 class="item-price">₱${menuItem.price}</h5>
            </div>
        </div>
    `);
  });

  $('')
}

function parseName(menuName, itemName) {
  // Format: menu-name-item-name
  return [
    menuName.toLowerCase().replace(/\(.*\)/, '').trim().replace(' ', '-'),
    itemName.split(' ')[0].toLowerCase().replace(/[^A-Za-z0-9]/g, ''),
  ].join('-')
}