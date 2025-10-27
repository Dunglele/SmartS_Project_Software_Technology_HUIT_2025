/* === GLOBAL CART FUNCTIONS (KHÔNG ĐỔI) === */
/**
 * Lấy giỏ hàng từ localStorage
 * @returns {Array} Mảng các sản phẩm trong giỏ
 */
function getCart() {
  return JSON.parse(localStorage.getItem('cart')) || [];
}

/**
 * Lưu giỏ hàng vào localStorage
 * @param {Array} cart Mảng các sản phẩm trong giỏ
 */
function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
}

/**
 * Thêm sản phẩm vào giỏ hàng
 * @param {string} id ID sản phẩm
 * @param {string} name Tên sản phẩm
 * @param {number} price Giá sản phẩm
 * @param {string} image URL hình ảnh
 */
function addToCart(id, name, price, image) {
  let cart = getCart();
  const productIndex = cart.findIndex(item => item.id === id);

  if (productIndex > -1) {
    // Sản phẩm đã có, tăng số lượng
    cart[productIndex].quantity++;
  } else {
    // Sản phẩm mới, thêm vào giỏ
    cart.push({ id, name, price, image, quantity: 1 });
  }

  saveCart(cart);
  updateCartCount();
  alert(`${name} đã được thêm vào giỏ!`);
}

/**
 * Xóa sản phẩm khỏi giỏ hàng
 * @param {string} id ID sản phẩm
 */
function removeFromCart(id) {
  let cart = getCart();
  cart = cart.filter(item => item.id !== id);
  saveCart(cart);
  displayCart(); // Tải lại trang giỏ hàng
  updateCartCount(); // Cập nhật lại số lượng ở header
}

/**
 * Cập nhật số lượng sản phẩm
 * @param {string} id ID sản phẩm
 * @param {number} quantity Số lượng mới
 */
function updateCartItemQuantity(id, quantity) {
  let cart = getCart();
  const productIndex = cart.findIndex(item => item.id === id);

  if (productIndex > -1) {
    const newQuantity = parseInt(quantity);
    if (newQuantity > 0) {
      cart[productIndex].quantity = newQuantity;
    } else {
      // Nếu số lượng <= 0, xóa luôn
      cart = cart.filter(item => item.id !== id);
    }
  }

  saveCart(cart);
  displayCart(); // Tải lại trang giỏ hàng
  updateCartCount(); // Cập nhật lại số lượng ở header
}

/**
 * Cập nhật số lượng hiển thị trên icon giỏ hàng
 */
function updateCartCount() {
  const cart = getCart();
  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
  
  const cartCountElement = document.getElementById('cart-count');
  if (cartCountElement) {
    cartCountElement.textContent = totalQuantity;
    cartCountElement.style.display = totalQuantity > 0 ? 'block' : 'none';
  }
}

/**
 * Tính toán tổng tiền giỏ hàng (sử dụng cho Cart và Checkout)
 * @returns {{subtotal: number, tax: number, total: number}} Tổng tiền
 */
function calculateCartTotals() {
    const cart = getCart();
    let subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.1; // 10% VAT
    const total = subtotal + tax;
    return { subtotal, tax, total };
}

/**
 * Hiển thị các sản phẩm trong trang giỏ hàng (cart.html)
 */
function displayCart() {
  const cartItemsContainer = document.getElementById('cart-items-container');
  const cartTotalContainer = document.getElementById('cart-total-container');
  const cartEmptyMessage = document.getElementById('cart-empty-msg');
  
  // Chỉ chạy nếu chúng ta đang ở trang giỏ hàng
  if (!cartItemsContainer) return;

  const cart = getCart();
  const totals = calculateCartTotals();

  if (cart.length === 0) {
    // Giỏ hàng trống
    cartItemsContainer.innerHTML = '';
    if (cartTotalContainer) cartTotalContainer.style.display = 'none';
    if (cartEmptyMessage) cartEmptyMessage.style.display = 'block';
  } else {
    // Có sản phẩm
    if (cartTotalContainer) cartTotalContainer.style.display = 'flex'; // Dùng 'flex' nếu là row
    if (cartEmptyMessage) cartEmptyMessage.style.display = 'none';

    let itemsHtml = '';

    cart.forEach(item => {
      const itemTotal = item.price * item.quantity;
      
      itemsHtml += `
        <tr>
          <td>
            <div class="d-flex align-items-center">
              <img src="${item.image}" alt="${item.name}" class="me-3">
              <span>${item.name}</span>
            </div>
          </td>
          <td>$${item.price.toFixed(2)}</td>
          <td>
            <input 
              type="number" 
              class="form-control quantity-input" 
              value="${item.quantity}" 
              min="1"
              onchange="updateCartItemQuantity('${item.id}', this.value)"
            >
          </td>
          <td>$${itemTotal.toFixed(2)}</td>
          <td>
            <button class="btn btn-sm btn-outline-danger" onclick="removeFromCart('${item.id}')">
              <i class="bi bi-trash"></i>
            </button>
          </td>
        </tr>
      `;
    });

    cartItemsContainer.innerHTML = itemsHtml;

    // Cập nhật tổng cộng
    document.getElementById('subtotal').textContent = `$${totals.subtotal.toFixed(2)}`;
    document.getElementById('tax').textContent = `$${totals.tax.toFixed(2)}`;
    document.getElementById('total').textContent = `$${totals.total.toFixed(2)}`;
  }
}

/**
 * Hiển thị tổng tiền trong trang thanh toán (checkout.html)
 */
function displayCheckoutTotal() {
    const checkoutTotalContainer = document.getElementById('checkout-total-summary');
    if (!checkoutTotalContainer) return;

    const cart = getCart();
    if (cart.length === 0) {
        checkoutTotalContainer.innerHTML = '<p class="text-danger">Giỏ hàng trống. Vui lòng quay lại trang Sản phẩm.</p>';
        document.getElementById('checkout-form').style.display = 'none';
        return;
    }

    const totals = calculateCartTotals();
    
    let itemsHtml = cart.map(item => `
        <li class="list-group-item d-flex justify-content-between lh-sm">
            <div>
                <h6 class="my-0">${item.name}</h6>
                <small class="text-muted">SL: ${item.quantity} x $${item.price.toFixed(2)}</small>
            </div>
            <span class="text-muted">$${(item.price * item.quantity).toFixed(2)}</span>
        </li>
    `).join('');

    checkoutTotalContainer.innerHTML = `
        <h4 class="d-flex justify-content-between align-items-center mb-3">
            <span class="text-primary">Đơn hàng</span>
            <span class="badge bg-primary rounded-pill">${cart.length}</span>
        </h4>
        <ul class="list-group mb-3">
            ${itemsHtml}
            <li class="list-group-item d-flex justify-content-between">
                <span>Tạm tính (USD)</span>
                <strong>$${totals.subtotal.toFixed(2)}</strong>
            </li>
            <li class="list-group-item d-flex justify-content-between">
                <span>Thuế (10% VAT)</span>
                <strong>$${totals.tax.toFixed(2)}</strong>
            </li>
            <li class="list-group-item d-flex justify-content-between fw-bold bg-light">
                <span>Tổng cộng (USD)</span>
                <strong class="fs-5 text-dark">$${totals.total.toFixed(2)}</strong>
            </li>
        </ul>
    `;
}

/**
 * Xử lý sự kiện khi thanh toán
 */
function processCheckout(event) {
    event.preventDefault();
    const cart = getCart();

    if (cart.length === 0) {
        alert('Giỏ hàng trống. Không thể thanh toán.');
        return;
    }

    // Ở đây sẽ là logic gửi đơn hàng lên server thực tế.
    // Tạm thời chỉ hiển thị thông báo và xóa giỏ hàng.
    
    const name = document.getElementById('firstName').value + ' ' + document.getElementById('lastName').value;
    
    alert(`Cảm ơn ${name}! Đơn hàng của bạn trị giá $${calculateCartTotals().total.toFixed(2)} đã được đặt thành công.`);
    
    // Xóa giỏ hàng sau khi thanh toán thành công
    localStorage.removeItem('cart');
    updateCartCount();
    
    // Chuyển hướng về trang chủ
    window.location.href = 'index.html';
}


/* === PRODUCT FILTER FUNCTIONS (ĐÃ CẬP NHẬT) === */

/**
 * Áp dụng bộ lọc sản phẩm (products.html)
 */
function applyProductFilters() {
  const searchInput = document.getElementById('filterSearch');
  const tagInput = document.getElementById('filterTag');
  const priceInput = document.getElementById('filterPrice'); // NEW
  
  // Chỉ chạy nếu chúng ta đang ở trang sản phẩm
  if (!searchInput || !tagInput || !priceInput) return;

  const searchTerm = searchInput.value.toLowerCase();
  const selectedTag = tagInput.value;
  const selectedPrice = priceInput.value; // NEW: Ví dụ: "500-800"
  const productList = document.querySelectorAll('.product-col');

  // Phân tích khoảng giá (NEW)
  let minPrice = 0;
  let maxPrice = Infinity;
  if (selectedPrice !== 'all') {
      const priceParts = selectedPrice.split('-');
      if (priceParts.length === 2) {
          minPrice = parseInt(priceParts[0]) || 0;
          maxPrice = parseInt(priceParts[1]) || Infinity;
      } else if (selectedPrice === '1000plus') {
          minPrice = 1000;
          maxPrice = Infinity;
      }
  }


  productList.forEach(product => {
    const name = product.dataset.name.toLowerCase();
    const tag = product.dataset.tag;
    const price = parseInt(product.dataset.price); // Lấy giá trị data-price

    // 1. Lọc theo Tên
    const nameMatch = name.includes(searchTerm);
    
    // 2. Lọc theo Danh mục
    const tagMatch = (selectedTag === 'all' || selectedTag === tag);

    // 3. Lọc theo Giá (NEW)
    const priceMatch = (price >= minPrice && price <= maxPrice);

    // Hiển thị nếu tất cả điều kiện đều đúng
    if (nameMatch && tagMatch && priceMatch) {
      product.style.display = 'block';
    } else {
      product.style.display = 'none';
    }
  });
}

/* === EVENT LISTENERS === */

// Chạy khi DOM đã tải xong
document.addEventListener('DOMContentLoaded', () => {
  
  // Cập nhật số lượng giỏ hàng trên mọi trang
  updateCartCount();

  // Hiển thị giỏ hàng (chỉ chạy trên cart.html)
  displayCart();
  
  // Hiển thị tổng tiền thanh toán (chỉ chạy trên checkout.html)
  displayCheckoutTotal();
  
  // Gắn listener cho form thanh toán (chỉ chạy trên checkout.html)
  const checkoutForm = document.getElementById('checkout-form');
  if (checkoutForm) {
      checkoutForm.addEventListener('submit', processCheckout);
  }

  // Gắn listener cho bộ lọc (chỉ chạy trên products.html)
  const searchInput = document.getElementById('filterSearch');
  const tagInput = document.getElementById('filterTag');
  const priceInput = document.getElementById('filterPrice');
  
  if (searchInput && tagInput && priceInput) {
    searchInput.addEventListener('keyup', applyProductFilters);
    tagInput.addEventListener('change', applyProductFilters);
    priceInput.addEventListener('change', applyProductFilters); // NEW listener
  }

});