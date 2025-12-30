// Ready for future features (online orders, modal menu, etc.)
console.log("Kebab Cavaleri website loaded");

// Cart state
let cart = [];

// DOM Elements
const cartIcon = document.getElementById('cart-icon');
const cartSidebar = document.getElementById('cart-sidebar');
const cartOverlay = document.getElementById('cart-overlay');
const closeCartBtn = document.getElementById('close-cart');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotalElement = document.getElementById('cart-total');
const cartCountElement = document.getElementById('cart-count');
const checkoutBtn = document.getElementById('checkout-btn');

// Modal elements
const orderModal = document.getElementById('order-modal');
const closeModalBtn = document.getElementById('close-modal');
const orderTypeRadios = document.querySelectorAll('input[name="order-type"]');
const postalCodeInput = document.getElementById('postal-code');
const addressField = document.getElementById('address-field');
const addressTextarea = document.getElementById('address');
const customerNameInput = document.getElementById('customer-name');
const customerPhoneInput = document.getElementById('customer-phone');
const paymentRadios = document.querySelectorAll('input[name="payment"]');
const submitOrderBtn = document.getElementById('submit-order');
const postalError = document.getElementById('postal-error');

// === LOCALSTORAGE HELPER FUNCTIONS ===
function saveCartToStorage() {
  localStorage.setItem('kebabCavaleriCart', JSON.stringify(cart));
}

function loadCartFromStorage() {
  const saved = localStorage.getItem('kebabCavaleriCart');
  if (saved) {
    try {
      cart = JSON.parse(saved);
    } catch (e) {
      console.warn('Invalid cart data in localStorage, resetting...');
      cart = [];
    }
  }
}

// Initialize cart from storage
loadCartFromStorage();

// === TEMPORARY STORAGE FOR ITEM BEING ADDED ===
let pendingItem = null;

// Add to cart buttons
document.querySelectorAll('.add-to-cart').forEach(button => {
  button.addEventListener('click', () => {
    const name = button.getAttribute('data-name');
    const price = parseFloat(button.getAttribute('data-price'));
    
    // Store item temporarily
    pendingItem = { name, price };
    
    // Open note modal
    document.getElementById('note-modal').classList.remove('hidden');
    document.getElementById('item-note').value = '';
    document.body.style.overflow = 'hidden'; // prevent background scroll
  });
});

// Close note modal (X button)
document.getElementById('close-note-modal').addEventListener('click', () => {
  document.getElementById('note-modal').classList.add('hidden');
  document.body.style.overflow = '';
  pendingItem = null;
});

// Skip note
document.getElementById('skip-note').addEventListener('click', () => {
  if (pendingItem) {
    addToCart(pendingItem.name, pendingItem.price, '');
  }
  document.getElementById('note-modal').classList.add('hidden');
  document.body.style.overflow = '';
  pendingItem = null;
});

// Save note and add to cart
document.getElementById('save-note').addEventListener('click', () => {
  const notes = document.getElementById('item-note').value.trim();
  if (pendingItem) {
    addToCart(pendingItem.name, pendingItem.price, notes);
  }
  document.getElementById('note-modal').classList.add('hidden');
  document.body.style.overflow = '';
  pendingItem = null;
});

// Reusable function to add item to cart (with or without notes)
function addToCart(name, price, notes) {
  const existingItem = cart.find(item => 
    item.name === name && item.notes === notes
  );

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ name, price, quantity: 1, notes });
  }

  updateCartUI();
  saveCartToStorage();
}

// Update cart UI
function updateCartUI() {
  // Update count
  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCountElement.textContent = totalCount;

  // Update total
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  cartTotalElement.textContent = total.toFixed(2);

  // Render cart items
  cartItemsContainer.innerHTML = '';
  if (cart.length === 0) {
    cartItemsContainer.innerHTML = '<p>Tu carrito está vacío.</p>';
    return;
  }

  cart.forEach((item, index) => {
    let itemDisplay = `<span>${item.name}`;
    if (item.notes) {
      itemDisplay += `<br><small style="color:#666; font-weight:normal;">"${item.notes}"</small>`;
    }
    itemDisplay += `</span>`;

    const itemDiv = document.createElement('div');
    itemDiv.className = 'cart-item';
    itemDiv.innerHTML = `
      ${itemDisplay}
      <div>
        <button class="qty-btn minus" data-index="${index}">−</button>
        <span class="qty">${item.quantity}</span>
        <button class="qty-btn plus" data-index="${index}">+</button>
      </div>
      <span class="item-total">${(item.price * item.quantity).toFixed(2)}€</span>
      <button class="remove-btn" data-index="${index}">×</button>
    `;
    cartItemsContainer.appendChild(itemDiv);
  });

  // Add event listeners to +/-/remove buttons
  document.querySelectorAll('.qty-btn.minus').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = e.target.getAttribute('data-index');
      if (cart[index].quantity > 1) {
        cart[index].quantity -= 1;
      } else {
        cart.splice(index, 1);
      }
      updateCartUI();
      saveCartToStorage(); // 👈 Save after every change
    });
  });

  document.querySelectorAll('.qty-btn.plus').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = e.target.getAttribute('data-index');
      cart[index].quantity += 1;
      updateCartUI();
      saveCartToStorage(); // 👈 Save after every change
    });
  });

  document.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = e.target.getAttribute('data-index');
      cart.splice(index, 1);
      updateCartUI();
      saveCartToStorage(); // 👈 Save after every change
    });
  });
}

// Show/Hide Cart
function showCart() {
  cartSidebar.classList.add('active');
  cartOverlay.classList.add('active');
}

function hideCart() {
  cartSidebar.classList.remove('active');
  cartOverlay.classList.remove('active');
}

// Modal: Show
function showOrderModal() {
  if (cart.length === 0) {
    alert('Tu carrito está vacío.');
    return;
  }
  // Reset form
  document.querySelector('input[name="order-type"][value="pickup"]').checked = true;
  postalCodeInput.value = '';
  addressTextarea.value = '';
  customerNameInput.value = '';
  customerPhoneInput.value = '';
  document.querySelector('input[name="payment"][value="cash"]').checked = true;
  postalError.classList.add('hidden');
  addressField.classList.add('hidden');

  orderModal.classList.remove('hidden');
  document.body.style.overflow = 'hidden'; // prevent background scroll
}

// Modal: Hide (cancel order)
function hideOrderModal() {
  orderModal.classList.add('hidden');
  document.body.style.overflow = ''; // restore scroll
}

// Toggle address field and update total dynamically
function toggleAddressAndTotal() {
  const isDelivery = document.querySelector('input[name="order-type"]:checked').value === 'delivery';
  if (isDelivery) {
    addressField.classList.remove('hidden');
  } else {
    addressField.classList.add('hidden');
  }
}

// Validate postal code in real time
function validatePostalCode() {
  const code = postalCodeInput.value.trim();
  if (code && code !== '41100') {
    postalError.classList.remove('hidden');
    return false;
  } else {
    postalError.classList.add('hidden');
    return true;
  }
}

// Validate entire form
function validateForm() {
  let valid = true;

  // Reset errors
  postalError.classList.add('hidden');

  // Postal code (only required for delivery)
  const isDelivery = document.querySelector('input[name="order-type"]:checked').value === 'delivery';
  if (isDelivery) {
    if (!validatePostalCode()) valid = false;
    if (!addressTextarea.value.trim()) valid = false;
  }

  // Name and phone always required
  if (!customerNameInput.value.trim()) valid = false;
  const phone = customerPhoneInput.value.trim();
  if (!phone || phone.replace(/\D/g, '').length < 9) valid = false;

  return valid;
}

// Handle form submission
function submitOrder() {
  if (!validateForm()) {
    alert('Por favor, completa todos los campos correctamente.');
    return;
  }

  const isDelivery = document.querySelector('input[name="order-type"]:checked').value === 'delivery';
  const baseTotal = parseFloat(cartTotalElement.textContent);
  const finalTotal = isDelivery ? (baseTotal + 1.5).toFixed(2) : baseTotal.toFixed(2);

  // Collect order data (for future Google Sheet integration)
  const orderData = {
    items: cart.map(item => ({
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      notes: item.notes
    })),
    type: isDelivery ? 'delivery' : 'pickup',
    postalCode: isDelivery ? postalCodeInput.value.trim() : null,
    address: isDelivery ? addressTextarea.value.trim() : null,
    name: customerNameInput.value.trim(),
    phone: customerPhoneInput.value.trim(),
    payment: document.querySelector('input[name="payment"]:checked').value,
    total: parseFloat(finalTotal),
    timestamp: new Date().toLocaleString('es-ES')
  };

  // For now: just show confirmation (later: send to Google Sheet)
  alert(`¡Pedido confirmado!\nTotal: ${finalTotal}€\n\n(Ahora se enviaría al restaurante.)`);

  // Reset cart and close modal
  cart = [];
  updateCartUI();
  hideOrderModal();

  // Clear localStorage after successful order
  localStorage.removeItem('kebabCavaleriCart');
}

// Event Listeners
cartIcon.addEventListener('click', showCart);
closeCartBtn.addEventListener('click', hideCart);
cartOverlay.addEventListener('click', hideCart);

// Checkout opens modal
checkoutBtn.addEventListener('click', showOrderModal);

// Modal close
closeModalBtn.addEventListener('click', hideOrderModal);
orderModal.addEventListener('click', (e) => {
  if (e.target === orderModal) hideOrderModal(); // close if clicking overlay
});

// Delivery/pickup toggle
orderTypeRadios.forEach(radio => {
  radio.addEventListener('change', toggleAddressAndTotal);
});

// Real-time postal validation
postalCodeInput.addEventListener('input', validatePostalCode);

// Form submission
submitOrderBtn.addEventListener('click', submitOrder);

// Initialize
updateCartUI();

