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

// Add to cart buttons
document.querySelectorAll('.add-to-cart').forEach(button => {
  button.addEventListener('click', () => {
    const name = button.getAttribute('data-name');
    const price = parseFloat(button.getAttribute('data-price'));

    // Prompt for custom notes (optional)
    const notes = prompt(`Notas para "${name}" (opcional):`, "").trim();

    // Find existing item with same name AND same notes
    const existingItem = cart.find(item => 
      item.name === name && item.notes === notes
    );

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ name, price, quantity: 1, notes });
    }

    updateCartUI();
    // Cart does NOT auto-open — only count updates (as requested)
  });
});

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
    });
  });

  document.querySelectorAll('.qty-btn.plus').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = e.target.getAttribute('data-index');
      cart[index].quantity += 1;
      updateCartUI();
    });
  });

  document.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = e.target.getAttribute('data-index');
      cart.splice(index, 1);
      updateCartUI();
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

// Event Listeners
cartIcon.addEventListener('click', showCart);
closeCartBtn.addEventListener('click', hideCart);
cartOverlay.addEventListener('click', hideCart);

// Checkout button
checkoutBtn.addEventListener('click', () => {
  if (cart.length === 0) {
    alert('Tu carrito está vacío.');
    return;
  }

  // Build order message (for future WhatsApp or email)
  let message = '¡Nuevo pedido!\n\n';
  cart.forEach(item => {
    message += `- ${item.quantity}x ${item.name} (${item.price.toFixed(2)}€ c/u)`;
    if (item.notes) message += ` [${item.notes}]`;
    message += '\n';
  });
  message += `\nTotal: ${cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}€`;

  alert('¡Gracias por tu pedido!\n\n(A continuación, en versión real, se enviaría al administrador o WhatsApp.)\n\n' + message);
});

// Initialize
updateCartUI();
