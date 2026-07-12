// Checkout Page Functionality
document.addEventListener('DOMContentLoaded', () => {
    let cartItems = [];
    let appliedCoupon = null;
    let discountAmount = 0;

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

    // Save cart to localStorage
    function saveCart() {
        localStorage.setItem('dodoCart', JSON.stringify(cartItems));
    }

    // Calculate totals
    function calculateTotals() {
        const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        // Calculate discount
        discountAmount = 0;
        if (appliedCoupon === 'DODO10') {
            discountAmount = subtotal * 0.10;
        } else if (appliedCoupon === 'DODO20') {
            discountAmount = subtotal * 0.20;
        } else if (appliedCoupon === 'DODO30') {
            discountAmount = subtotal * 0.30;
        } else if (appliedCoupon) {
            // General coupon gives 10%
            discountAmount = subtotal * 0.10;
        }

        const delivery = 0;
        const total = Math.max(0, subtotal - discountAmount + delivery);

        return {
            subtotal: subtotal.toFixed(2),
            discount: discountAmount.toFixed(2),
            delivery: delivery.toFixed(2),
            total: total.toFixed(2)
        };
    }

    // Format price for Slovak localization (e.g. 8,90 instead of 8.90)
    function formatPrice(val) {
        return parseFloat(val).toFixed(2).replace('.', ',');
    }

    // Update checkout display
    function updateCheckoutDisplay() {
        const summaryItemsContainer = document.getElementById('checkoutSummaryItems');
        if (!summaryItemsContainer) return;

        if (cartItems.length === 0) {
            summaryItemsContainer.innerHTML = `
                <div style="text-align: center; padding: 30px 10px; color: var(--dodo-dark-green);">
                    <p style="font-size: 1.1rem; font-weight: 600; margin-bottom: 15px;">Váš košík je prázdny</p>
                    <a href="menu.html" style="display: inline-block; padding: 10px 20px; background: var(--dodo-dark-green); color: var(--dodo-gold); text-decoration: none; font-weight: 600;">Prejsť do menu</a>
                </div>
            `;
            // Redirect back to cart page after a small delay if user is on empty checkout
            setTimeout(() => {
                window.location.href = 'cart.html';
            }, 3000);
        } else {
            let html = '';
            cartItems.forEach((item, index) => {
                // Show old price crossed out and current total below
                const unitPriceFormatted = formatPrice(item.price);
                const totalItemPriceFormatted = formatPrice(item.price * item.quantity);

                html += `
                    <div class="checkout-summary-item" data-index="${index}">
                        <img src="${item.image}" alt="${item.name}" class="checkout-item-img">
                        <div class="checkout-item-info">
                            <span class="checkout-item-name">${item.name}</span>
                            <div class="checkout-item-controls">
                                <button type="button" class="checkout-qty-btn minus" data-index="${index}">-</button>
                                <span class="checkout-qty-value">${item.quantity}</span>
                                <button type="button" class="checkout-qty-btn plus" data-index="${index}">+</button>
                            </div>
                        </div>
                        <div class="checkout-item-price-wrapper">
                            <span class="checkout-item-old-price">${unitPriceFormatted}</span>
                            <span class="checkout-item-price">${totalItemPriceFormatted}</span>
                        </div>
                    </div>
                `;
            });
            summaryItemsContainer.innerHTML = html;
        }

        // Update price breakdown
        const totals = calculateTotals();
        document.getElementById('checkoutSubtotal').textContent = formatPrice(totals.subtotal);
        document.getElementById('checkoutDiscount').textContent = `- ${formatPrice(totals.discount)}`;
        document.getElementById('checkoutDelivery').textContent = formatPrice(totals.delivery);
        document.getElementById('checkoutTotal').textContent = formatPrice(totals.total);

        // Attach event listeners
        attachEventListeners();
        saveCart();

        if (window.dodoRevealElements) {
            window.dodoRevealElements([
                { selector: '.checkout-title', baseClass: 'scroll-from-left', startDelay: 0, stagger: 0 },
                { selector: '.checkout-section', baseClass: 'scroll-animate', startDelay: 80, stagger: 90 },
                { selector: '.checkout-summary-box', baseClass: 'scroll-from-right', startDelay: 120, stagger: 0 },
                { selector: '.checkout-summary-item', baseClass: 'scroll-animate', startDelay: 150, stagger: 70 },
                { selector: '.checkout-coupon-wrapper', baseClass: 'scroll-animate', startDelay: 220, stagger: 0 },
                { selector: '.checkout-totals', baseClass: 'scroll-scale', startDelay: 280, stagger: 0 },
                { selector: '.checkout-submit-btn', baseClass: 'scroll-scale', startDelay: 340, stagger: 0 }
            ]);
        }
    }

    // Attach event listeners to quantity buttons
    function attachEventListeners() {
        // Toggle active class on controls for mobile support
        document.querySelectorAll('.checkout-item-controls').forEach(controls => {
            controls.addEventListener('click', (e) => {
                controls.classList.add('active');
            });
            controls.addEventListener('mouseleave', () => {
                controls.classList.remove('active');
            });
        });

        document.querySelectorAll('.checkout-qty-btn.plus').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation(); // prevent parent click from toggling
                const index = parseInt(btn.dataset.index);
                cartItems[index].quantity++;
                updateCheckoutDisplay();
            });
        });

        document.querySelectorAll('.checkout-qty-btn.minus').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation(); // prevent parent click from toggling
                const index = parseInt(btn.dataset.index);
                if (cartItems[index].quantity > 1) {
                    cartItems[index].quantity--;
                } else {
                    if (confirm('Chcete odstrániť tento produkt z objednávky?')) {
                        cartItems.splice(index, 1);
                    }
                }
                updateCheckoutDisplay();
            });
        });
    }

    // Coupon Code Action
    const applyCouponBtn = document.getElementById('applyCoupon');
    if (applyCouponBtn) {
        applyCouponBtn.addEventListener('click', () => {
            const couponInput = document.getElementById('couponCode');
            const code = couponInput.value.trim().toUpperCase();

            if (!code) {
                showNotification('Zadajte zľavový kód');
                return;
            }

            if (code === 'DODO10' || code === 'DODO20' || code === 'DODO30') {
                appliedCoupon = code;
                const percent = code.replace('DODO', '');
                showNotification(`Zľavový kód "${code}" bol aplikovaný (${percent}% zľava)`);
                updateCheckoutDisplay();
            } else {
                // Apply fallback 10% discount for any other code for demo purposes
                appliedCoupon = code;
                showNotification(`Zľava bola úspešne aplikovaná`);
                updateCheckoutDisplay();
            }
        });

        // Add Enter key support
        document.getElementById('couponCode')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                applyCouponBtn.click();
            }
        });
    }

    // Form Submission
    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const email = document.getElementById('email').value.trim();
            const phone = document.getElementById('phone').value.trim();
            const pickupTime = document.getElementById('pickupTime').value;
            const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;

            if (cartItems.length === 0) {
                showNotification('Košík je prázdny!');
                return;
            }

            if (!email || !phone || !pickupTime) {
                showNotification('Vyplňte všetky povinné polia!');
                return;
            }

            // Perform order submission
            showSuccessModal(email, phone, pickupTime, paymentMethod);
        });
    }

    // Custom success overlay
    function showSuccessModal(email, phone, time, payment) {
        // Clear the cart
        cartItems = [];
        saveCart();

        // Create a beautiful success message modal matching the website theme
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 50, 42, 0.95);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 99999;
            opacity: 0;
            transition: opacity 0.5s ease;
        `;

        const modal = document.createElement('div');
        modal.style.cssText = `
            background-color: var(--dodo-dark-green);
            border: 2px solid var(--dodo-gold);
            padding: 50px 40px;
            max-width: 500px;
            width: 90%;
            text-align: center;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            transform: scale(0.8);
            transition: transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        `;

        modal.innerHTML = `
            <div style="font-size: 4rem; color: var(--dodo-gold); margin-bottom: 20px;">✓</div>
            <h2 class="font-serif" style="color: var(--dodo-gold); font-size: 2.2rem; margin-bottom: 20px;">Ďakujeme!</h2>
            <p style="color: var(--dodo-beige); font-size: 1.05rem; line-height: 1.6; margin-bottom: 30px;">
                Vaša objednávka bola úspešne prijatá. Potvrdenie sme odoslali na <strong>${email}</strong>.
            </p>
            <div style="text-align: left; background-color: rgba(239, 217, 135, 0.05); border: 1px solid rgba(239, 217, 135, 0.2); padding: 15px; margin-bottom: 30px; font-size: 0.9rem; color: var(--dodo-beige);">
                <div style="margin-bottom: 8px;"><strong>Spôsob doručenia:</strong> Osobný odber v reštaurácii</div>
                <div style="margin-bottom: 8px;"><strong>Čas vyzdvihnutia:</strong> ${time}</div>
                <div><strong>Spôsob platby:</strong> ${getPaymentName(payment)}</div>
            </div>
            <button id="closeSuccessBtn" style="background-color: var(--dodo-gold); color: var(--dodo-dark-green); border: none; padding: 12px 40px; font-weight: 700; font-size: 1rem; cursor: pointer; transition: all 0.3s ease;">
                Prejsť na domovskú stránku
            </button>
        `;

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        // Fade in
        setTimeout(() => {
            overlay.style.opacity = '1';
            modal.style.transform = 'scale(1)';
        }, 50);

        document.getElementById('closeSuccessBtn').addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }

    function getPaymentName(code) {
        switch (code) {
            case 'cod': return 'Platba pri prevzatí (COD)';
            case 'card-intl': return 'Medzinárodná platobná karta';
            case 'card-local': return 'Tuzemská platobná karta';
            case 'qr': return 'Platba cez QR kód';
            default: return code;
        }
    }

    // Show notifications
    function showNotification(message) {
        const existing = document.querySelector('.checkout-notification');
        if (existing) {
            existing.remove();
        }

        const notification = document.createElement('div');
        notification.className = 'checkout-notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            background: var(--dodo-gold);
            color: var(--dodo-dark-green);
            padding: 15px 25px;
            border-radius: 0;
            font-weight: 600;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(notification);

        // Animation keyframes injected dynamically
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(400px); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(400px); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Initial load and render
    loadCart();
    updateCheckoutDisplay();

    // ==========================================================================
    // Custom Time Selection Modal Functionality
    // ==========================================================================
    const timeModal = document.getElementById('timeModal');
    const timeModalTrigger = document.getElementById('timeModalTrigger');
    const closeTimeModal = document.getElementById('closeTimeModal');
    const confirmTimeBtn = document.getElementById('confirmTimeBtn');
    const timeModalDays = document.getElementById('timeModalDays');
    const timeModalSlots = document.getElementById('timeModalSlots');
    const nextDayBtn = document.getElementById('nextDayBtn');
    const pickupTimeInput = document.getElementById('pickupTime');
    const selectedTimeDisplay = document.getElementById('selectedTimeDisplay');

    let selectedDayIndex = 0;
    let selectedTimeSlot = '';
    let daysData = [];

    // Helper to get Slovak day of week name
    function getSlovakDayName(dayIndex) {
        const days = ['Ned', 'Pon', 'Ut', 'Str', 'Štv', 'Pia', 'Sob'];
        return days[dayIndex];
    }

    // Generate days dynamically starting from tomorrow
    function generateDays() {
        daysData = [];
        for (let i = 1; i <= 4; i++) {
            const date = new Date();
            date.setDate(date.getDate() + i);
            const dayNum = date.getDate().toString().padStart(2, '0');
            const monthNum = (date.getMonth() + 1).toString().padStart(2, '0');
            const dayLabel = i === 1 ? 'Zajtra' : getSlovakDayName(date.getDay());
            daysData.push({
                label: dayLabel,
                dateStr: `${dayNum}/${monthNum}`
            });
        }
    }

    // Generate Slovak time slots: 11.00 to 21.00
    function generateTimeSlots() {
        const slots = [];
        for (let hour = 11; hour <= 21; hour++) {
            slots.push(`${hour}.00`);
            if (hour !== 21) {
                slots.push(`${hour}.30`);
            }
        }
        return slots;
    }

    // Render the day tabs
    function renderDays() {
        if (!timeModalDays) return;
        let html = '';
        daysData.forEach((day, index) => {
            const activeClass = index === selectedDayIndex ? 'is-active' : '';
            html += `
                <button type="button" class="time-modal-day-tab ${activeClass}" data-index="${index}">
                    <span class="day-name">${day.label}</span>
                    <span class="day-date">${day.dateStr}</span>
                </button>
            `;
        });
        timeModalDays.innerHTML = html;

        // Add event listeners to day tabs
        document.querySelectorAll('.time-modal-day-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                selectedDayIndex = parseInt(tab.dataset.index);
                renderDays();
                renderTimeSlots();
            });
        });
    }

    // Render the time slots
    function renderTimeSlots() {
        if (!timeModalSlots) return;
        const slots = generateTimeSlots();
        let html = '';
        slots.forEach((slot) => {
            const isChecked = selectedTimeSlot === slot ? 'checked' : '';
            const isSelectedClass = selectedTimeSlot === slot ? 'is-selected' : '';
            html += `
                <label class="time-modal-slot-option ${isSelectedClass}" data-slot="${slot}">
                    <input type="radio" name="modalTimeRadio" value="${slot}" ${isChecked}>
                    <span class="time-modal-radio"></span>
                    <span class="time-slot-text">${slot}</span>
                </label>
            `;
        });
        timeModalSlots.innerHTML = html;

        // Add event listeners to slot options
        document.querySelectorAll('.time-modal-slot-option').forEach(option => {
            option.addEventListener('click', () => {
                const slot = option.dataset.slot;
                selectedTimeSlot = slot;
                
                // Update styling immediately
                document.querySelectorAll('.time-modal-slot-option').forEach(o => {
                    o.classList.remove('is-selected');
                });
                option.classList.add('is-selected');
                const radio = option.querySelector('input');
                if (radio) radio.checked = true;
            });
        });
    }

    // Initialize custom modal events
    function initTimeModal() {
        generateDays();
        
        if (timeModalTrigger) {
            timeModalTrigger.addEventListener('click', () => {
                // Initialize default selections if not already set
                if (!selectedTimeSlot) {
                    selectedTimeSlot = '11.00'; // Default to first slot
                }
                renderDays();
                renderTimeSlots();
                timeModal.classList.add('is-open');
                document.body.style.overflow = 'hidden';
            });
        }

        if (closeTimeModal) {
            closeTimeModal.addEventListener('click', () => {
                timeModal.classList.remove('is-open');
                document.body.style.overflow = '';
            });
        }

        // Close on overlay background click
        if (timeModal) {
            timeModal.addEventListener('click', (e) => {
                if (e.target === timeModal) {
                    timeModal.classList.remove('is-open');
                    document.body.style.overflow = '';
                }
            });
        }

        // Next Day button logic: switch to the next day
        if (nextDayBtn) {
            nextDayBtn.addEventListener('click', () => {
                selectedDayIndex = (selectedDayIndex + 1) % daysData.length;
                renderDays();
                renderTimeSlots();
            });
        }

        // Submit/Confirm selection
        if (confirmTimeBtn) {
            confirmTimeBtn.addEventListener('click', () => {
                if (!selectedTimeSlot) {
                    showNotification('Prosím vyberte čas vyzdvihnutia');
                    return;
                }
                
                const activeDay = daysData[selectedDayIndex];
                const formattedSelection = `${activeDay.label} ${activeDay.dateStr} o ${selectedTimeSlot}`;
                
                // Update hidden input and display label
                pickupTimeInput.value = formattedSelection;
                selectedTimeDisplay.textContent = formattedSelection;
                selectedTimeDisplay.style.color = 'var(--dodo-gold)';
                
                // Close modal
                timeModal.classList.remove('is-open');
                document.body.style.overflow = '';
                
                showNotification(`Vybraný čas: ${formattedSelection}`);
            });
        }
    }

    // Initialize modal on load
    initTimeModal();
});
