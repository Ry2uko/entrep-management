$(document).ready(function(){
  loadPage();

  $('.pending-orders-container .orders-container').on('click', '.cancel-order', function(){
    const orderId = $(this).parents('.order').data('id');

    $.ajax({
      url: `/api/orders/${orderId}`,
      type: 'DELETE',
      contentType: 'application/json',
      data: JSON.stringify({}),
      success: () => {
        $(this).parents('.order').addClass('cancelled');
      },
      error: (xhr, status, err) => {
        console.error('Error: ', err);
      }
    });

    
  });

  $('.pending-orders-container .orders-container').on('click', '.complete-order', function(){
    const orderId = $(this).parents('.order').data('id');

    $.ajax({
      url: `/api/orders/${orderId}/complete`,
      method: 'PUT',
      contentType: 'application/json',
      data: JSON.stringify({}),
      success: () => {
        $(this).parents('.order').addClass('completed');
      },
      error: (xhr, status, err) => {
        console.error('Error: ', err);
      }
    });
  });
});

function loadPage() {
  $.ajax({
    url: '/api/orders',
    method: 'GET',
    success: (data) => {
      loadOrders(data);
    },
    error: (err) => {
      console.error('Error: ', err);
    }
  });
}

function loadOrders(orders) {
  orders.forEach(order => {
    if (order.status === 'PENDING') {
      $('.pending-orders-container .orders-container').append(`
          <div class="order" data-id="${order.id}">
            <div class="row">
                <div class="col-1 column">
                    <span class="order-id"># ${order.id}</span>
                </div>
                <div class="col column">
                    <span class="order-name">${order.customer_name}</span>
                </div>
                <div class="col-3 column">
                    <span class="order-total">₱${order.total_price}</span>
                </div>
                <div class="col-2 btn-group column">
                  <button type="button" class="btn-order cancel-order">
                      <i class="fa-solid fa-xmark"></i>
                  </button>
                  <button type="button" class="btn-order complete-order">
                      <i class="fa-solid fa-check"></i>
                  </button>
                </div>
            </div>
          </div>
        `);
    } else {
      $('.completed-orders-container .orders-container').append(`
        <div class="order" data-id="${order.id}">
          <div class="row">
              <div class="col-1 column">
                  <span class="order-id"># ${order.id}</span>
              </div>
              <div class="col column">
                  <span class="order-name">${order.customer_name}</span>
              </div>
              <div class="col-3 column">
                  <span class="order-total">₱${order.total_price}</span>
              </div>
              <div class="col-2 column">
                  <span class="checkmark">
                      <i class="fa-solid fa-check"></i>
                  </span>
              </div>
          </div>
        </div>
      `);
    }
    setTimeout(() => {
      $('.orders-container').css('display', 'flex');
      $('.loader').css('display', 'none');
    }, 1000);
  });
}