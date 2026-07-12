document.addEventListener('DOMContentLoaded', () => {
    // Reset scroll to top on page load (if no anchor link in URL)
    if (!window.location.hash) {
        window.scrollTo(0, 0);
    } else {
        // If there's an anchor link, scroll to it after a small delay
        setTimeout(() => {
            const element = document.querySelector(window.location.hash);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 100);
    }

    // Shared reveal helper for page sections and dynamically rendered items
    window.dodoRevealElements = (groups) => {
        if (!Array.isArray(groups)) return;

        groups.forEach(group => {
            const selector = group.selector;
            if (!selector) return;

            const elements = document.querySelectorAll(selector);
            const baseClass = group.baseClass || 'scroll-animate';
            const startDelay = group.startDelay || 0;
            const stagger = group.stagger || 90;

            elements.forEach((element, index) => {
                if (element.dataset.revealAnimated === '1') return;

                element.classList.add(baseClass);

                window.requestAnimationFrame(() => {
                    window.setTimeout(() => {
                        element.classList.add('active');
                        element.dataset.revealAnimated = '1';
                    }, startDelay + index * stagger);
                });
            });
        });
    };

    // Hero Section Animation (Page Load)
    setTimeout(() => {
        const heroContainer = document.querySelector('.hero-container');
        const heroTopTitle = document.querySelector('.hero-top-title');
        const heroMiddleRow = document.querySelector('.hero-middle-row');
        const heroMainTitle = document.querySelector('.hero-main-title');

        if (heroContainer) {
            heroContainer.classList.add('active');

            // Animate individual elements with faster delays
            if (heroTopTitle) {
                setTimeout(() => heroTopTitle.classList.add('active'), 100);
            }
            if (heroMiddleRow) {
                setTimeout(() => heroMiddleRow.classList.add('active'), 200);
            }
            if (heroMainTitle) {
                setTimeout(() => heroMainTitle.classList.add('active'), 300);
            }
        }
    }, 150);

    // 1. Dynamic Footer Year
    const yearEl = document.getElementById('currentYear');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }

    // 2. Language Selector Interaction
    const langLinks = document.querySelectorAll('.lang-link');
    langLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            alert('Jazyk bol prepnutý / Language switched');
        });
    });

    // 3. Mobile Navigation Drawer Interaction
    const header = document.querySelector('.dodo-header');
    const menuTrigger = document.getElementById('mobileMenuTrigger');
    const menuDrawer = document.getElementById('mobileMenuDrawer');
    const drawerOverlay = document.getElementById('mobileDrawerOverlay');
    const drawerLinks = document.querySelectorAll('.mobile-drawer-link, .mobile-drawer-btn');

    function toggleMenu() {
        const isOpen = menuTrigger.classList.toggle('is-open');
        menuDrawer.classList.toggle('is-open', isOpen);
        drawerOverlay.classList.toggle('is-open', isOpen);
        document.body.style.overflow = isOpen ? 'hidden' : '';
        menuTrigger.setAttribute('aria-expanded', isOpen);
    }

    if (menuTrigger) {
        menuTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMenu();
        });
    }

    if (drawerOverlay) {
        drawerOverlay.addEventListener('click', toggleMenu);
    }

    // Close menu when clicking on any links
    drawerLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (menuTrigger.classList.contains('is-open')) {
                toggleMenu();
            }
        });
    });

    // 4. Header Scroll Effect (Shadow & Backdrop Blur adjustment)
    const handleScroll = () => {
        if (header) {
            if (window.scrollY > 10) {
                header.classList.add('is-scrolled');
            } else {
                header.classList.remove('is-scrolled');
            }
        }
    };

    // Initial check on load
    handleScroll();
    window.addEventListener('scroll', handleScroll);

    // 5. Enhanced Scroll Animation System
    const animateOnScroll = () => {
        const scrollElements = document.querySelectorAll('.scroll-animate, .scroll-fade-in, .scroll-from-left, .scroll-from-right, .scroll-scale, .menu-card');

        const elementInView = (el, offset = 0.8) => {
            const elementTop = el.getBoundingClientRect().top;
            return elementTop <= (window.innerHeight || document.documentElement.clientHeight) * offset;
        };

        const displayScrollElement = (element) => {
            element.classList.add('active');
        };

        const hideScrollElement = (element) => {
            element.classList.remove('active');
        };

        scrollElements.forEach((el) => {
            if (elementInView(el, 0.85)) {
                displayScrollElement(el);
            }
        });
    };

    // Initial check
    animateOnScroll();

    // Listen to scroll event with throttling for performance
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        if (scrollTimeout) {
            window.cancelAnimationFrame(scrollTimeout);
        }
        scrollTimeout = window.requestAnimationFrame(() => {
            animateOnScroll();
        });
    });

    // Legacy reveal system for backwards compatibility
    const revealElements = document.querySelectorAll('.reveal-fade-up');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-visible');
                // Stop observing once animated to optimize performance
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.05,
        rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // 6. Menu Tabs Switching Logic
    const tabBtns = document.querySelectorAll('.menu-tab-btn');
    const tabPanels = document.querySelectorAll('.menu-category-panel');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active state from all buttons
            tabBtns.forEach(b => b.classList.remove('active'));
            // Hide all panels
            tabPanels.forEach(p => {
                p.style.display = 'none';
                p.classList.remove('active');
            });

            // Set current button active
            btn.classList.add('active');
            // Show corresponding panel
            const category = btn.getAttribute('data-category');
            const targetPanel = document.getElementById(`category-${category}`);
            if (targetPanel) {
                targetPanel.style.display = 'block';
                setTimeout(() => {
                    targetPanel.classList.add('active');
                }, 10);
            }
        });
    });

    // 7. Shopping Cart System
    let cart = []; // Array to store cart items
    let currentModalItem = null; // Store current item being configured

    // Save cart to localStorage
    function saveCart() {
        localStorage.setItem('dodoCart', JSON.stringify(cart));
    }

    // Load cart from localStorage
    function loadCart() {
        const saved = localStorage.getItem('dodoCart');
        if (saved) {
            try {
                cart = JSON.parse(saved);
            } catch (e) {
                console.error('Error loading cart:', e);
            }
        }
    }

    const cartIcon = document.getElementById('cartIcon');
    const cartBadge = document.getElementById('cartBadge');
    const cartOverlay = document.getElementById('cartOverlay');
    const cartSidebar = document.getElementById('cartSidebar');
    const cartClose = document.getElementById('cartClose');
    const cartBody = document.getElementById('cartBody');
    const cartTotalPrice = document.getElementById('cartTotalPrice');
    const cartCheckoutBtn = document.getElementById('cartCheckoutBtn');

    const optionsModalOverlay = document.getElementById('optionsModalOverlay');
    const optionsModal = document.getElementById('optionsModal');
    const optionsModalClose = document.getElementById('optionsModalClose');
    const optionsModalTitle = document.getElementById('optionsModalTitle');
    const optionsModalBody = document.getElementById('optionsModalBody');
    const optionsConfirmBtn = document.getElementById('optionsConfirmBtn');

    // Update cart badge
    function updateCartBadge() {
        if (!cartBadge) return;

        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        if (totalItems > 0) {
            cartBadge.textContent = totalItems;
            cartBadge.style.display = 'flex';
        } else {
            cartBadge.style.display = 'none';
        }
    }

    // Update cart display
    function updateCartDisplay() {
        if (!cartBody || !cartTotalPrice || !cartCheckoutBtn) return;

        if (cart.length === 0) {
            cartBody.innerHTML = '<p class="cart-empty">Váš košík je prázdny</p>';
            cartTotalPrice.textContent = '0,00 €';
            cartCheckoutBtn.disabled = true;
            return;
        }

        cartCheckoutBtn.disabled = false;
        let total = 0;
        let html = '';

        cart.forEach((item, index) => {
            total += item.price * item.quantity;
            html += `
                <div class="cart-item">
                    <div class="cart-item-header">
                        <span class="cart-item-name">${item.name}</span>
                        <button class="cart-item-remove" data-index="${index}">&times;</button>
                    </div>
                    ${item.option ? `<div class="cart-item-details">${item.option}</div>` : ''}
                    <div class="cart-item-footer">
                        <div class="cart-item-quantity">
                            <button class="cart-qty-btn" data-index="${index}" data-action="decrease">-</button>
                            <span class="cart-qty-value">${item.quantity}</span>
                            <button class="cart-qty-btn" data-index="${index}" data-action="increase">+</button>
                        </div>
                        <span class="cart-item-price">${(item.price * item.quantity).toFixed(2).replace('.', ',')} €</span>
                    </div>
                </div>
            `;
        });

        cartBody.innerHTML = html;
        cartTotalPrice.textContent = total.toFixed(2).replace('.', ',') + ' €';

        // Add event listeners for cart item buttons
        cartBody.querySelectorAll('.cart-item-remove').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.dataset.index);
                cart.splice(index, 1);
                updateCart();
            });
        });

        cartBody.querySelectorAll('.cart-qty-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.dataset.index);
                const action = btn.dataset.action;

                if (action === 'increase') {
                    cart[index].quantity++;
                } else if (action === 'decrease') {
                    if (cart[index].quantity > 1) {
                        cart[index].quantity--;
                    } else {
                        cart.splice(index, 1);
                    }
                }
                updateCart();
            });
        });
    }

    // Update cart and UI
    function updateCart() {
        saveCart();
        updateCartBadge();
        updateCartDisplay();
        updateMenuCardStates();
    }

    // Update menu card states (show counter if in cart)
    function updateMenuCardStates() {
        document.querySelectorAll('.menu-order-btn, .menu-quantity-control').forEach(el => {
            const card = el.closest('.menu-card');
            const cardBody = el.closest('.menu-card-body');

            if (!cardBody) return;

            // Get item info from button or control
            let itemName, itemPrice;
            const btn = cardBody.querySelector('.menu-order-btn');
            const qtyCtrl = cardBody.querySelector('.menu-quantity-control');

            if (btn) {
                itemName = btn.dataset.itemName;
                itemPrice = btn.dataset.itemPrice;
            } else if (qtyCtrl) {
                itemName = qtyCtrl.dataset.itemName;
                itemPrice = qtyCtrl.dataset.itemPrice;
            }

            // Check if item is in cart
            const cartItem = cart.find(item => item.name === itemName && (itemPrice === undefined || item.price === parseFloat(itemPrice)));

            if (cartItem && btn) {
                // Show quantity control
                showQuantityControl(btn, cartItem);
            } else if (!cartItem && !btn) {
                // Restore order button
                const quantityControl = cardBody.querySelector('.menu-quantity-control');
                if (quantityControl) {
                    const orderBtn = document.createElement('button');
                    orderBtn.className = 'menu-order-btn';
                    orderBtn.textContent = 'OBJEDNAŤ JEDLO';
                    orderBtn.dataset.itemName = itemName;
                    if (itemPrice) orderBtn.dataset.itemPrice = itemPrice;
                    quantityControl.parentElement.replaceChild(orderBtn, quantityControl);

                    // if (card) card.classList.remove('has-items');
                    attachOrderButtonListener(orderBtn);
                }
            }
        });
    }

    // Show quantity control for item
    function showQuantityControl(btn, cartItem) {
        const card = btn.closest('.menu-card');
        const quantityControl = document.createElement('div');
        quantityControl.className = 'menu-quantity-control';
        quantityControl.dataset.itemName = btn.dataset.itemName;
        if (btn.dataset.itemPrice) quantityControl.dataset.itemPrice = btn.dataset.itemPrice;
        quantityControl.innerHTML = `
            <button class="quantity-btn minus">-</button>
            <span class="quantity-value">${cartItem.quantity}</span>
            <button class="quantity-btn plus">+</button>
        `;

        btn.parentElement.replaceChild(quantityControl, btn);
        //  if (card) card.classList.add('has-items');

        // Add event listeners
        const minusBtn = quantityControl.querySelector('.minus');
        const plusBtn = quantityControl.querySelector('.plus');
        const valueSpan = quantityControl.querySelector('.quantity-value');

        minusBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // prevent triggering parent click
            if (cartItem.quantity > 1) {
                cartItem.quantity--;
                valueSpan.textContent = cartItem.quantity;
                updateCart();
            } else {
                const index = cart.indexOf(cartItem);
                if (index > -1) cart.splice(index, 1);
                updateCart();
            }
        });

        plusBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // prevent triggering parent click
            cartItem.quantity++;
            console.log('Increased product quantity in cart:', cartItem);
            valueSpan.textContent = cartItem.quantity;
            updateCart();
        });
    }

    // Open/close cart sidebar
    function toggleCart(open) {
        if (open) {
            cartOverlay.classList.add('is-open');
            cartSidebar.classList.add('is-open');
            document.body.style.overflow = 'hidden';
        } else {
            cartOverlay.classList.remove('is-open');
            cartSidebar.classList.remove('is-open');
            document.body.style.overflow = '';
        }
    }

    // Show toast notification when an item is added to the cart
    function showAddToCartNotification(name, option) {
        // Remove existing notification if any
        const existing = document.querySelector('.add-to-cart-notification');
        if (existing) {
            existing.remove();
        }

        // Build subtitle
        const subtitleText = option ? `${name} (${option})` : name;

        // Create container
        const notif = document.createElement('div');
        notif.className = 'add-to-cart-notification';

        notif.innerHTML = `
            <div class="icon-container">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
            </div>
            <div class="text-container">
                <h4 class="notif-title">Pridané do košíka</h4>
                <p class="notif-subtitle">${subtitleText}</p>
            </div>
            <div class="progress-bar"></div>
        `;

        document.body.appendChild(notif);

        // Trigger reflow to enable transition
        notif.offsetHeight;

        // Add class to show (slide-in)
        notif.classList.add('show');

        // Hide and remove after 3 seconds
        const duration = 3000;
        const hideTimeout = setTimeout(() => {
            dismissNotification();
        }, duration);

        function dismissNotification() {
            notif.classList.remove('show');
            notif.classList.add('hide');
            setTimeout(() => {
                notif.remove();
            }, 400); // match CSS transition duration
        }

        // Allow clicking the notification to dismiss it instantly
        notif.addEventListener('click', () => {
            clearTimeout(hideTimeout);
            dismissNotification();
        });
    }

    if (cartIcon) {
        cartIcon.addEventListener('click', (e) => {
            e.preventDefault();
            // Redirect to cart page instead of opening popup
            window.location.href = 'cart.html';
        });
    }

    if (cartClose) {
        cartClose.addEventListener('click', () => toggleCart(false));
    }

    if (cartOverlay) {
        cartOverlay.addEventListener('click', () => toggleCart(false));
    }

    // Open/close options modal
    function toggleOptionsModal(open) {
        if (open) {
            optionsModalOverlay.classList.add('is-open');
            optionsModal.classList.add('is-open');
            document.body.style.overflow = 'hidden';
        } else {
            optionsModalOverlay.classList.remove('is-open');
            optionsModal.classList.remove('is-open');
            document.body.style.overflow = '';
            currentModalItem = null;
        }
    }

    if (optionsModalClose) {
        optionsModalClose.addEventListener('click', () => toggleOptionsModal(false));
    }

    if (optionsModalOverlay) {
        optionsModalOverlay.addEventListener('click', () => toggleOptionsModal(false));
    }

    // Show options modal
    function showOptionsModal(itemName, options, itemImg) {
        currentModalItem = {
            name: itemName,
            options: options,
            image: itemImg,
            selectedOption: null
        };

        optionsModalTitle.textContent = itemName;

        let html = '';
        options.forEach((option, index) => {
            html += `
                <div class="option-item" data-index="${index}">
                    <span class="option-label">${option.label}</span>
                    <span class="option-price">${option.price.toFixed(2).replace('.', ',')} €</span>
                </div>
            `;
        });

        optionsModalBody.innerHTML = html;
        optionsConfirmBtn.disabled = true;

        // Add click handlers
        optionsModalBody.querySelectorAll('.option-item').forEach(item => {
            item.addEventListener('click', () => {
                optionsModalBody.querySelectorAll('.option-item').forEach(i => i.classList.remove('selected'));
                item.classList.add('selected');
                currentModalItem.selectedOption = options[parseInt(item.dataset.index)];
                optionsConfirmBtn.disabled = false;
            });
        });

        toggleOptionsModal(true);
    }

    // Add item to cart from options modal
    if (optionsConfirmBtn) {
        optionsConfirmBtn.addEventListener('click', () => {
            if (currentModalItem && currentModalItem.selectedOption) {
                const item = {
                    name: currentModalItem.name,
                    price: currentModalItem.selectedOption.price,
                    image: currentModalItem.image,
                    option: currentModalItem.selectedOption.label,
                    quantity: 1
                };

                cart.push(item);
                console.log('Added new product to cart:', item);
                updateCart();
                toggleOptionsModal(false);
                showAddToCartNotification(item.name, item.option);
            }
        });
    }

    // Order button click handler
    function attachOrderButtonListener(btn) {
        btn.addEventListener('click', function () {
            const itemName = this.dataset.itemName;
            const itemPrice = this.dataset.itemPrice;
            const itemPrices = this.dataset.itemPrices;

            const card = this.closest('.menu-card');
            const imgEl = card ? card.querySelector('.menu-card-img') : null;
            const itemImg = imgEl ? imgEl.getAttribute('src') : 'images/logo.png';

            // Check if item has multiple prices/options
            if (itemPrices) {
                try {
                    const options = JSON.parse(itemPrices);
                    showOptionsModal(itemName, options, itemImg);
                } catch (e) {
                    console.error('Invalid prices data:', e);
                }
            } else if (itemPrice) {
                // Simple item with single price
                const item = {
                    name: itemName,
                    price: parseFloat(itemPrice),
                    image: itemImg,
                    option: null,
                    quantity: 1
                };

                cart.push(item);
                console.log('Added new product to cart:', item);
                updateCart();
                showAddToCartNotification(item.name, item.option);
            }
        });
    }

    // Attach listeners to all order buttons using event delegation
    // This works for dynamically loaded content too
    document.addEventListener('click', function (e) {
        // Check if clicked element is or contains .menu-order-btn
        const btn = e.target.closest('.menu-order-btn');
        if (!btn) return;

        e.preventDefault();

        const itemName = btn.dataset.itemName;
        const itemPrice = btn.dataset.itemPrice;
        const itemPrices = btn.dataset.itemPrices;

        const card = btn.closest('.menu-card');
        const imgEl = card ? card.querySelector('.menu-card-img') : null;
        const itemImg = imgEl ? imgEl.getAttribute('src') : 'images/logo.png';

        // Check if item has multiple prices/options
        if (itemPrices) {
            try {
                const options = JSON.parse(itemPrices);
                showOptionsModal(itemName, options, itemImg);
            } catch (e) {
                console.error('Invalid prices data:', e);
            }
        } else if (itemPrice) {
            // Simple item with single price
            const item = {
                name: itemName,
                price: parseFloat(itemPrice),
                image: itemImg,
                option: null,
                quantity: 1
            };

            cart.push(item);
            console.log('Added new product to cart:', item);
            updateCart();

            // Visual feedback
            btn.classList.add('added');
            setTimeout(() => btn.classList.remove('added'), 1000);

            showAddToCartNotification(item.name, item.option);
        }
    });

    // Checkout button
    if (cartCheckoutBtn) {
        cartCheckoutBtn.addEventListener('click', () => {
            alert('Ďakujeme za vašu objednávku!\n\nTento je demo. V produkčnej verzii by sa tu otvorilo platobné okno.');
            // Here you would implement actual checkout logic
        });
    }

    // Load saved cart and initial render
    loadCart();
    updateCart();

    // =======================================================================
    // Product Showcase Tabs & Carousel
    // =======================================================================

    // Tab switching functionality
    const productTabs = document.querySelectorAll('.product-tab');

    productTabs.forEach(tab => {
        tab.addEventListener('click', function () {
            // Remove active class from all tabs
            productTabs.forEach(t => t.classList.remove('active'));

            // Add active class to clicked tab
            this.classList.add('active');

            // Get category data
            const category = this.dataset.category;
            console.log('Selected category:', category);

            // Here you can add logic to filter/change products based on category
            // For now, we'll just log the category
        });
    });

    // Carousel functionality
    const carouselTrack = document.querySelector('.product-carousel-track');
    const prevButton = document.querySelector('.carousel-prev');
    const nextButton = document.querySelector('.carousel-next');
    const productCards = document.querySelectorAll('.product-carousel-track > div');

    if (carouselTrack && productCards.length > 0) {
        let currentPage = 0; // Trang hiện tại (mỗi trang = 3 sản phẩm)
        const cardsPerPage = 3; // Số sản phẩm hiển thị mỗi trang
        const totalCards = productCards.length;
        const totalPages = Math.ceil(totalCards / cardsPerPage); // Tổng số trang

        const updateCarousel = () => {
            // Lấy chiều rộng của wrapper để tính chính xác
            const wrapperWidth = document.querySelector('.product-carousel-wrapper').offsetWidth;
            const offset = currentPage * wrapperWidth; // Lướt theo chiều rộng của wrapper
            carouselTrack.style.transform = `translateX(-${offset}px)`;

            // Update button states
            if (prevButton) {
                prevButton.style.opacity = currentPage === 0 ? '0.5' : '1';
                prevButton.style.cursor = currentPage === 0 ? 'not-allowed' : 'pointer';
                prevButton.disabled = currentPage === 0;
            }

            if (nextButton) {
                const isLastPage = currentPage >= totalPages - 1;
                nextButton.style.opacity = isLastPage ? '0.5' : '1';
                nextButton.style.cursor = isLastPage ? 'not-allowed' : 'pointer';
                nextButton.disabled = isLastPage;
            }
        };

        // Previous button - lướt về trang trước (3 sản phẩm)
        if (prevButton) {
            prevButton.addEventListener('click', () => {
                if (currentPage > 0) {
                    currentPage--;
                    updateCarousel();
                }
            });
        }

        // Next button - lướt sang trang sau (3 sản phẩm)
        if (nextButton) {
            nextButton.addEventListener('click', () => {
                if (currentPage < totalPages - 1) {
                    currentPage++;
                    updateCarousel();
                }
            });
        }

        // Initialize carousel
        updateCarousel();

        // Update on window resize
        window.addEventListener('resize', updateCarousel);
    }

    // Product order button functionality (for carousel) - Removed duplicate code
    // Carousel buttons now use the same attachOrderButtonListener function above
    // Event listeners are already attached at line ~550

    // =======================================================================
    // Gallery Carousel
    // =======================================================================
    const galleryTrack = document.querySelector('.gallery-carousel-track');
    const galleryPrevBtn = document.querySelector('.gallery-carousel-prev');
    const galleryNextBtn = document.querySelector('.gallery-carousel-next');
    const galleryProgressPrevBtn = document.querySelector('.gallery-progress-prev');
    const galleryProgressNextBtn = document.querySelector('.gallery-progress-next');
    const galleryItems = document.querySelectorAll('.gallery-item');
    const galleryProgressFill = document.querySelector('.gallery-progress-fill');

    if (galleryTrack && galleryItems.length > 0) {
        let currentGalleryIndex = 0; // Chỉ số ảnh hiện tại (0, 1, 2...)
        const totalItems = galleryItems.length;
        const maxIndex = totalItems - 1; // Index cuối cùng

        const updateGalleryCarousel = () => {
            // Tính toán offset dựa trên chiều rộng của 1 ảnh + gap
            const itemWidth = galleryItems[0].offsetWidth;
            const gap = 20;
            const offset = currentGalleryIndex * (itemWidth + gap);
            galleryTrack.style.transform = `translateX(-${offset}px)`;

            // Update progress bar - chia đều theo số ảnh
            if (galleryProgressFill) {
                const progress = ((currentGalleryIndex + 1) / totalItems) * 100;
                galleryProgressFill.style.width = `${progress}%`;
            }

            // Update large button states
            if (galleryPrevBtn) {
                galleryPrevBtn.style.opacity = currentGalleryIndex === 0 ? '0.5' : '1';
                galleryPrevBtn.style.cursor = currentGalleryIndex === 0 ? 'not-allowed' : 'pointer';
                galleryPrevBtn.disabled = currentGalleryIndex === 0;
            }

            if (galleryNextBtn) {
                const isLast = currentGalleryIndex >= maxIndex;
                galleryNextBtn.style.opacity = isLast ? '0.5' : '1';
                galleryNextBtn.style.cursor = isLast ? 'not-allowed' : 'pointer';
                galleryNextBtn.disabled = isLast;
            }

            // Update small progress button states
            if (galleryProgressPrevBtn) {
                galleryProgressPrevBtn.disabled = currentGalleryIndex === 0;
            }

            if (galleryProgressNextBtn) {
                galleryProgressNextBtn.disabled = currentGalleryIndex >= maxIndex;
            }
        };

        const goPrev = () => {
            if (currentGalleryIndex > 0) {
                currentGalleryIndex--;
                updateGalleryCarousel();
            }
        };

        const goNext = () => {
            if (currentGalleryIndex < maxIndex) {
                currentGalleryIndex++;
                updateGalleryCarousel();
            }
        };

        // Previous button (large)
        if (galleryPrevBtn) {
            galleryPrevBtn.addEventListener('click', goPrev);
        }

        // Next button (large)
        if (galleryNextBtn) {
            galleryNextBtn.addEventListener('click', goNext);
        }

        // Previous button (small - progress bar)
        if (galleryProgressPrevBtn) {
            galleryProgressPrevBtn.addEventListener('click', goPrev);
        }

        // Next button (small - progress bar)
        if (galleryProgressNextBtn) {
            galleryProgressNextBtn.addEventListener('click', goNext);
        }

        // Initialize
        updateGalleryCarousel();

        // Update on resize
        window.addEventListener('resize', updateGalleryCarousel);

        // Gallery View Button - scroll to carousel
        const galleryViewBtn = document.getElementById('galleryViewBtn');
        if (galleryViewBtn) {
            galleryViewBtn.addEventListener('click', () => {
                const carouselWrapper = document.querySelector('.gallery-carousel-wrapper');
                if (carouselWrapper) {
                    carouselWrapper.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            });
        }
    }

    // =======================================================================
    // SMOOTH ANIMATIONS & INTERACTIONS FOR ENTIRE WEBSITE
    // =======================================================================

    // 1. Smooth Parallax Effect on Hero & Large Images (Desktop only)
    const parallaxElements = document.querySelectorAll('.hero-img, .about-us-img');
    const isMobile = window.innerWidth <= 768;

    if (!isMobile) {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;

            parallaxElements.forEach(el => {
                if (el.getBoundingClientRect().top < window.innerHeight && el.getBoundingClientRect().bottom > 0) {
                    const speed = 0.3;
                    const yPos = -(scrolled * speed);
                    el.style.transform = `translateY(${yPos}px)`;
                }
            });
        });
    }

    // 2. Smooth Hover Effects for All Buttons
    const allButtons = document.querySelectorAll('button, .btn, .menu-order-btn, .dodo-nav-link, .mobile-drawer-link');

    allButtons.forEach(button => {
        button.addEventListener('mouseenter', function (e) {
            this.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
        });

        button.addEventListener('mouseleave', function (e) {
            this.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
        });
    });

    // 3. Smooth Card Entrance Animations (Optimized for mobile)
    const observeCards = () => {
        const cards = document.querySelectorAll('.menu-card, .product-card, .about-card');
        const galleryItems = document.querySelectorAll('.gallery-item');

        const cardObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0) scale(1)';
                    }, index * 100);
                    cardObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        // Gallery items with simpler animation for mobile
        const galleryObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    const delay = isMobile ? index * 50 : index * 100;
                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = isMobile ? 'translateX(0)' : 'translateY(0) scale(1)';
                    }, delay);
                    galleryObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: isMobile ? 0.05 : 0.1,
            rootMargin: '0px 0px -30px 0px'
        });

        cards.forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px) scale(0.95)';
            card.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
            cardObserver.observe(card);
        });

        // Simpler animation for gallery items on mobile
        galleryItems.forEach(item => {
            item.style.opacity = '0';
            item.style.transform = isMobile ? 'translateX(20px)' : 'translateY(30px) scale(0.95)';
            item.style.transition = isMobile ? 'all 0.4s ease-out' : 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
            galleryObserver.observe(item);
        });
    };

    observeCards();

    // 4. Smooth Image Loading Effect
    const images = document.querySelectorAll('img');

    images.forEach(img => {
        if (img.complete) {
            img.style.opacity = '1';
        } else {
            img.style.opacity = '0';
            img.style.transition = 'opacity 0.5s ease-in-out';

            img.addEventListener('load', function () {
                setTimeout(() => {
                    this.style.opacity = '1';
                }, 50);
            });
        }
    });

    // 5. Smooth Text Reveal Animation
    const textElements = document.querySelectorAll('h1, h2, h3, .menu-section-subtitle, .about-text');

    const textObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('text-revealed');
                textObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.2,
        rootMargin: '0px 0px -80px 0px'
    });

    textElements.forEach(el => {
        if (!el.classList.contains('hero-main-title') && !el.classList.contains('hero-top-title')) {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
            textObserver.observe(el);
        }
    });

    // Add revealed class styles dynamically
    const style = document.createElement('style');
    style.textContent = `
        .text-revealed {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
        
        .menu-card:hover, .product-card:hover {
            transform: translateY(-8px) scale(1.02) !important;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3) !important;
        }
        
        .dodo-nav-link:hover {
            transform: translateY(-2px);
        }
        
        button:active, .btn:active {
            transform: scale(0.96) !important;
        }
        
        .cart-item {
            animation: slideInCart 0.3s ease-out;
        }
        
        @keyframes slideInCart {
            from {
                opacity: 0;
                transform: translateX(-20px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
        
        .menu-card, .product-card {
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        
        .gallery-item img {
            transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        
        @media (min-width: 769px) {
            .gallery-item:hover img {
                transform: scale(1.05) !important;
            }
        }
        
        @media (max-width: 768px) {
            .gallery-item {
                transition: all 0.3s ease-out !important;
            }
            
            .gallery-carousel-track {
                transition: transform 0.5s ease-out !important;
            }
        }
    `;
    document.head.appendChild(style);

    // 6. Smooth Modal Transitions
    const modals = document.querySelectorAll('.time-modal-overlay, .cart-overlay, .options-modal-overlay');

    modals.forEach(modal => {
        const originalDisplay = getComputedStyle(modal).display;

        modal.addEventListener('transitionend', function (e) {
            if (e.propertyName === 'opacity' && !this.classList.contains('is-open')) {
                this.style.display = 'none';
            }
        });
    });

    // 7. Add Ripple Effect to Buttons
    function createRipple(event) {
        const button = event.currentTarget;
        const circle = document.createElement('span');
        const diameter = Math.max(button.clientWidth, button.clientHeight);
        const radius = diameter / 2;

        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${event.clientX - button.offsetLeft - radius}px`;
        circle.style.top = `${event.clientY - button.offsetTop - radius}px`;
        circle.classList.add('ripple');

        const ripple = button.getElementsByClassName('ripple')[0];
        if (ripple) {
            ripple.remove();
        }

        button.appendChild(circle);
    }

    const rippleButtons = document.querySelectorAll('.menu-order-btn, .checkout-submit-btn, .cart-checkout-btn, .time-modal-submit-btn');

    rippleButtons.forEach(btn => {
        btn.style.position = 'relative';
        btn.style.overflow = 'hidden';
        btn.addEventListener('click', createRipple);
    });

    // Add ripple CSS
    const rippleStyle = document.createElement('style');
    rippleStyle.textContent = `
        .ripple {
            position: absolute;
            border-radius: 50%;
            background-color: rgba(255, 255, 255, 0.4);
            transform: scale(0);
            animation: ripple-animation 0.6s ease-out;
            pointer-events: none;
        }
        
        @keyframes ripple-animation {
            to {
                transform: scale(2.5);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(rippleStyle);

    // 8. Smooth Input Focus Effects
    const inputs = document.querySelectorAll('input, textarea, select');

    inputs.forEach(input => {
        input.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';

        input.addEventListener('focus', function () {
            this.style.transform = 'scale(1.02)';
        });

        input.addEventListener('blur', function () {
            this.style.transform = 'scale(1)';
        });
    });

    // 9. Stagger Animation for Menu Items
    const menuCards = document.querySelectorAll('.menu-card');

    menuCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.08}s`;
    });

    // 10. Smooth Scroll for All Internal Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#' && href.length > 1) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
});