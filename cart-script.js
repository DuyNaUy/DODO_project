// Cart Page Functionality
document.addEventListener('DOMContentLoaded', () => {
    // Sample cart data
    let cartItems = [
        {
            id: 1,
            name: 'Ostrokyslá 0,25 l',
            image: 'images/sp1.png',
            price: 8.90,
            quantity: 1
        },
        {
            id: 2,
            name: 'Pho houdete (0,700)',
            image: 'images/sp2.png',
            price: 8.90,
            quantity: 1
        },
        {
            id: 3,
            name: 'Hovädží steak s omáčkou z čierneho korenia 300g',
            image: 'images/sp3.png',
            price: 8.90,
            quantity: 1
        }
    ];

    // Save cart to localStorage
    function saveCart() {
        localStorage.setItem('dodoCart', JSON.stringify(cartItems));
    }

    // Load cart from localStorage
    function loadCart() {
        const saved = localStorage.getItem('dodoCart');
        if (saved) {
            try {
                cartItems = JSON.parse(saved);
            } catch (e) {
                console.error('Error loading cart:', e);
            }
        }
    }

    // Calculate totals
    function calculateTotals() {
        const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const discount = 0;
        const total = subtotal - discount;

        return {
            subtotal: subtotal.toFixed(2),
            discount: discount.toFixed(2),
            total: total.toFixed(2)
        };
    }

    // Update cart display
    function updateCartDisplay() {
        const cartItemsList = document.getElementById('cartItemsList');
        if (!cartItemsList) return;

        if (cartItems.length === 0) {
            cartItemsList.innerHTML = `
                <div style="text-align: center; padding: 40px 20px; color: var(--dodo-gold);">
                    <p style="font-size: 1.2rem; margin-bottom: 20px;">Váš košík je prázdny</p>
                    <a href="menu.html" style="display: inline-block; padding: 12px 24px; background: var(--dodo-gold); color: var(--dodo-dark-green); text-decoration: none; font-weight: 600;">Prejsť do menu</a>
                </div>
            `;
        } else {
            let html = '';
            cartItems.forEach((item, index) => {
                html += `
                    <div class="cart-page-item" data-index="${index}">
                        <img src="${item.image}" alt="${item.name}" class="cart-page-item-img">
                        <div class="cart-page-item-info">
                            <h3 class="cart-page-item-name">${item.name}</h3>
                        </div>
                        <div class="cart-page-item-price">${item.price.toFixed(2).replace('.', ',')}</div>
                        <div class="cart-page-item-controls">
                            <button class="cart-page-qty-btn minus" data-index="${index}">-</button>
                            <span class="cart-page-qty-value">${item.quantity}</span>
                            <button class="cart-page-qty-btn plus" data-index="${index}">+</button>
                        </div>
                        <button class="cart-page-item-remove" data-index="${index}">
                            <img src="images/remove.png" alt="Remove">
                        </button>
                    </div>
                `;
            });
            cartItemsList.innerHTML = html;
        }

        // Update totals
        const totals = calculateTotals();
        const summaryRows = document.querySelectorAll('.order-summary-row');
        if (summaryRows.length >= 3) {
            summaryRows[0].querySelector('.order-summary-value').textContent = totals.subtotal.replace('.', ',');
            summaryRows[1].querySelector('.order-summary-value').textContent = '- ' + totals.discount.replace('.', ',');
            summaryRows[2].querySelector('.order-summary-value').textContent = totals.total.replace('.', ',');
        }

        // Attach event listeners
        attachCartEventListeners();
        saveCart();

        if (window.dodoRevealElements) {
            window.dodoRevealElements([
                { selector: '.cart-page-title', baseClass: 'scroll-from-left', startDelay: 0, stagger: 0 },
                { selector: '.cart-page-item', baseClass: 'scroll-animate', startDelay: 80, stagger: 90 },
                { selector: '.frequently-ordered', baseClass: 'scroll-animate', startDelay: 160, stagger: 0 },
                { selector: '.order-summary', baseClass: 'scroll-from-right', startDelay: 120, stagger: 0 },
                { selector: '.coupon-code', baseClass: 'scroll-animate', startDelay: 220, stagger: 0 },
                { selector: '.checkout-btn', baseClass: 'scroll-scale', startDelay: 280, stagger: 0 }
            ]);
        }
    }

    // Attach event listeners to cart buttons
    function attachCartEventListeners() {
        // Toggle active class on controls for mobile support
        document.querySelectorAll('.cart-page-item-controls').forEach(controls => {
            controls.addEventListener('click', (e) => {
                controls.classList.add('active');
            });
            controls.addEventListener('mouseleave', () => {
                controls.classList.remove('active');
            });
        });

        // Quantity buttons
        document.querySelectorAll('.cart-page-qty-btn.plus').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation(); // prevent parent click from toggling

                const index = parseInt(btn.dataset.index);
                cartItems[index].quantity++;
                console.log('Increased product quantity on cart page:', cartItems[index]);
                updateCartDisplay();
                showNotification('Množstvo bolo zvýšené');
            });
        });

        document.querySelectorAll('.cart-page-qty-btn.minus').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation(); // prevent parent click from toggling
                const index = parseInt(btn.dataset.index);
                if (cartItems[index].quantity > 1) {
                    cartItems[index].quantity--;
                    showNotification('Množstvo bolo znížené');
                } else {
                    if (confirm('Chcete odstrániť tento produkt z košíka?')) {
                        cartItems.splice(index, 1);
                        showNotification('Produkt bol odstránený');
                    }
                }
                updateCartDisplay();
            });
        });

        // Remove buttons
        document.querySelectorAll('.cart-page-item-remove').forEach(btn => {
            btn.addEventListener('click', () => {
                if (confirm('Chcete odstrániť tento produkt z košíka?')) {
                    const index = parseInt(btn.dataset.index);
                    cartItems.splice(index, 1);
                    updateCartDisplay();
                    showNotification('Produkt bol odstránený');
                }
            });
        });

        // Frequently ordered add buttons
        document.querySelectorAll('.frequently-ordered-add').forEach((btn, index) => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Get the item details from the parent element
                const itemElement = btn.closest('.frequently-ordered-item');
                const itemName = itemElement.querySelector('.frequently-ordered-name').textContent;
                const itemImg = itemElement.querySelector('.frequently-ordered-img').src;
                
                // Check if item already exists in cart
                const existingItemIndex = cartItems.findIndex(item => item.name === itemName);
                
                if (existingItemIndex !== -1) {
                    // Item exists, increase quantity
                    cartItems[existingItemIndex].quantity++;
                    console.log('Increased frequently ordered product quantity in cart:', cartItems[existingItemIndex]);
                    showNotification(`Množstvo "${itemName}" bolo zvýšené`);
                } else {
                    // Add new item to cart
                    const newItem = {
                        id: Date.now(),
                        name: itemName,
                        image: itemImg,
                        price: 8.90,
                        quantity: 1
                    };
                    cartItems.push(newItem);
                    console.log('Added frequently ordered product to cart:', newItem);
                    showNotification(`"${itemName}" bol pridaný do košíka`);
                }
                
                updateCartDisplay();
                
                // Visual feedback on button
                btn.style.transform = 'scale(0.9)';
                setTimeout(() => {
                    btn.style.transform = 'scale(1)';
                }, 150);
            });
        });
    }

    // Show notification
    function showNotification(message) {
        // Remove existing notification
        const existing = document.querySelector('.cart-notification');
        if (existing) {
            existing.remove();
        }

        // Create notification
        const notification = document.createElement('div');
        notification.className = 'cart-notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            background: var(--dodo-gold);
            color: var(--dodo-dark-green);
            padding: 15px 25px;
            border-radius: 4px;
            font-weight: 600;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Coupon code functionality
    const couponBtn = document.querySelector('.coupon-code-btn');
    if (couponBtn) {
        couponBtn.addEventListener('click', () => {
            const couponInput = document.querySelector('.coupon-code-input');
            const code = couponInput.value.trim();
            
            if (code) {
                showNotification(`Zľavový kód "${code}" bol aplikovaný`);
                couponInput.value = '';
            } else {
                showNotification('Prosím zadajte zľavový kód');
            }
        });

        // Enter key support
        document.querySelector('.coupon-code-input')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                couponBtn.click();
            }
        });
    }

    // Checkout button
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cartItems.length === 0) {
                showNotification('Váš košík je prázdny!');
                return;
            }
            window.location.href = 'checkout.html';
        });
    }

    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);

    // Load saved cart and initial render
    loadCart();
    updateCartDisplay();
});
