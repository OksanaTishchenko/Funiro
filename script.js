window.onload = function () {
  document.addEventListener('click', documentActions)


  // Actions - делегирование события click
  function documentActions(event) {
    const targetElement = event.target; //!!!!!!!!! нажатый обьект
    if (window.innerWidth > 768) { //&& isMobile.any()//isMobile.any() - вернет true, если устройство с тачскрином
      if (targetElement.classList.contains('menu__arrow')) {
        targetElement.closest('.menu__item').classList.toggle('_hover');
      }
      let hoverMenu = document.querySelectorAll('.menu__item._hover');
      if (!targetElement.closest('.menu__item') && hoverMenu.length > 0) { // есть ли элементы с классом ховер(чтобы было что закрывать)
        for (var i = 0; i < hoverMenu.length; i++) {
          hoverMenu[i].classList.remove('_hover');
        }
      }
    }
    if (targetElement.classList.contains('search-form__icon')) {
      document.querySelector('.search-form').classList.toggle('_active');
    } else if (!targetElement.closest('.search-form') && document.querySelector('.search-form._active')) {
      document.querySelector('.search-form').classList.remove('_active');
    }
    if (targetElement.classList.contains('icon-menu')) {
      document.querySelector('.menu__body').classList.toggle('_active');
      targetElement.classList.toggle('_active');
    }

    // ПОДГРУЗКА товаров из json
    if (targetElement.classList.contains('products__more')) {
      event.preventDefault();
      getProducts(targetElement);
      //console.log(targetElement);

    }

    // ДОБАВИТЬ В КОРЗИНУ
    if (targetElement.classList.contains('actions-product__button')) {
      event.preventDefault();
      const productId = targetElement.closest('.item-product').dataset.pid; //Получила ID (closest- поиск в родителях)
      console.log(productId);
      addToCart(targetElement, productId);

    }
    if (targetElement.classList.contains('cart-header__icon') || targetElement.closest('cart-header__icon')) { // или в родителях есть такой класс(если юзер нажмет на спан(счетчик))
      event.preventDefault();
      if (document.querySelector('.cart-list').children.length > 0) { // существуют ли товары в списке
        document.querySelector('.cart-header').classList.toggle('_active');
      }

    } else if (!targetElement.closest('.cart-header') && !targetElement.classList.contains('actions-product__button')) {
      document.querySelector('.cart-header').classList.remove('_active');
    }
    if (targetElement.classList.contains('cart-list__delete')) {
      event.preventDefault();
      const productId = targetElement.closest('.cart-list__item').dataset.cartPid // получаем йади родителя (дата-атрибут)
      updateCart(targetElement, productId, false);
    }
  }

  // FUNCTION FETCH
  async function getProducts(button) {
    if (!button.classList.contains('_hold')) { // если у кнопки нет класса hold
      //ЭТОТ КЛАСС нужен, чтобы избежать повторных нажатий на кнопку, до того, как произойдет подгрузка товаров. Пользователю нужно дать понять, что не нужно тыкать на кнопку, а дождаться подгрузки товаров 
      button.classList.add('_hold'); //добавляю этот класс
      const file = "json/products.json";
      //console.log(file);
      let response = await fetch(file, {
        method: "GET"
      });

      if (response.ok) {
        let result = await response.json();
        console.log(result);
        loadProducts(result);
        button.classList.remove('_hold'); //удаляю класс
        button.remove(); //удаляю всю кнопку
      } else {
        alert('Ошибка');
      }
    }
  }

  function loadProducts(data) {
    const productsItems = document.querySelector('.products__items'); // Враппер куда подгружаем товары 
    data.products.forEach(item => {
      const productId = item.id;
      const productUrl = item.url;
      const productImage = item.image;
      const productTitle = item.title;
      const productText = item.text;
      const productPrice = item.price;
      const productOldPrice = item.priceOld;
      const productShareUrl = item.shareUrl;
      const productLikeUrl = item.likeUrl;
      const productLabels = item.labels;

      let productTemplateStart = `<article data-pid="${productId}" class="products__item item-product">`;
      let productTemplateEnd = `</article>`;

      let productTemplateLabels = '';
      if (productLabels) {
        let productTemplateLabelsStart = `<div class="item-product__labels">`;
        let productTemplateLabelsEnd = `</div>`;
        let productTemplateLabelsContent = '';

        productLabels.forEach(labelItem => {
          productTemplateLabelsContent += `<div class="item-product__label item-product__label_${labelItem.type}">${labelItem.value}</div>`;
        });

        productTemplateLabels += productTemplateLabelsStart;
        productTemplateLabels += productTemplateLabelsContent;
        productTemplateLabels += productTemplateLabelsEnd;
      }

      let productTemplateImage = `
		<a href="${productUrl}" class="item-product__image _ibg">
			<img src="img/products/${productImage}" alt="${productTitle}">
		</a>
	`;

      let productTemplateBodyStart = `<div class="item-product__body">`;
      let productTemplateBodyEnd = `</div>`;

      let productTemplateContent = `
		<div class="item-product__content">
			<h3 class="item-product__title">${productTitle}</h3>
			<div class="item-product__text">${productText}</div>
		</div>
	`;

      let productTemplatePrices = '';
      let productTemplatePricesStart = `<div class="item-product__prices">`;
      let productTemplatePricesCurrent = `<div class="item-product__price">Rp ${productPrice}</div>`;
      let productTemplatePricesOld = `<div class="item-product__price item-product__price_old">Rp ${productOldPrice}</div>`;
      let productTemplatePricesEnd = `</div>`;

      productTemplatePrices = productTemplatePricesStart;
      productTemplatePrices += productTemplatePricesCurrent;
      if (productOldPrice) {
        productTemplatePrices += productTemplatePricesOld;
      }
      productTemplatePrices += productTemplatePricesEnd;

      let productTemplateActions = `
<div class="item-product__actions actions-product">
  <div class="actions-product__body">
    <a href="" class="actions-product__button btn btn_white">Add to cart</a>
    <a href="${productShareUrl}" class="actions-product__link _icon-share">Share</a>
    <a href="${productLikeUrl}" class="actions-product__link _icon-favorite">Like</a>
  </div>
</div>
`;

      let productTemplateBody = '';
      productTemplateBody += productTemplateBodyStart;
      productTemplateBody += productTemplateContent;
      productTemplateBody += productTemplatePrices;
      productTemplateBody += productTemplateActions;
      productTemplateBody += productTemplateBodyEnd;

      let productTemplate = ''; // блок КАРТОЧКИ товара
      productTemplate += productTemplateStart;
      productTemplate += productTemplateLabels;
      productTemplate += productTemplateImage;
      productTemplate += productTemplateBody;
      productTemplate += productTemplateEnd;

      productsItems.insertAdjacentHTML('beforeend', productTemplate);

    });

  }

  //Функция ДОБАВЛЕНИЯ ТОВАРА в корзину
  function addToCart(productButton, productId) {
    if (!productButton.classList.contains('_hold')) { //чтобы избежать множественных нажатий
      productButton.classList.add('_hold');
      productButton.classList.add('_fly');

      const cart = document.querySelector('.cart-header__icon'); //иконка корзины
      const product = document.querySelector(`[data-pid="${productId}"]`); //товар с выбранным(конкретным) ID
      const productImage = product.querySelector('.item-product__image');//картинка конкретного товара

      const productImageFly = productImage.cloneNode(true); //клонирую обьект для "полета в корзину"

      const productImageFlyWidth = productImage.offsetWidth;
      const productImageFlyHeight = productImage.offsetHeight;
      const productImageFlyTop = productImage.getBoundingClientRect().top;
      const productImageFlyLeft = productImage.getBoundingClientRect().left;
      // console.log(productImageFlyWidth);
      // console.log(productImageFlyHeight);
      // console.log(productImageFlyTop);
      // console.log(productImageFlyLeft);

      productImageFly.setAttribute('class', '_flyImage _ibg');
      productImageFly.style.cssText =
        `
			left: ${productImageFlyLeft}px;
			top: ${productImageFlyTop}px;
			width: ${productImageFlyWidth}px;
			height: ${productImageFlyHeight}px;
		`;

      document.body.append(productImageFly);

      const cartFlyLeft = cart.getBoundingClientRect().left;  // координаты корзины
      const cartFlyTop = cart.getBoundingClientRect().top; // координаты корзины

      productImageFly.style.cssText =
        `
			left: ${cartFlyLeft}px;
			top: ${cartFlyTop}px;
			width: 0px;
			height: 0px;
			opacity:0;
		`;

      productImageFly.addEventListener('transitionend', function () {
        if (productButton.classList.contains('_fly')) {
          productImageFly.remove(); // удаляю клон (долетел до корзины и исчез)
          updateCart(productButton, productId);
          productButton.classList.remove('_fly');
        }
      });
    }
  }
  function updateCart(productButton, productId, productAdd = true) {
    const cart = document.querySelector('.cart-header');
    const cartIcon = cart.querySelector('.cart-header__icon');
    const cartQuantity = cartIcon.querySelector('span'); // СЧЕТЧИК ВНУТРИ ИКОНКИ
    const cartProduct = document.querySelector(`[data-cart-pid="${productId}"]`); // Товар в списке внутри корзины
    const cartList = document.querySelector('.cart-list');// оболочка списка товаров

    // ДОБАВЛЯЕМ
    if (productAdd) {
      if (cartQuantity) { // если счетчик существует
        cartQuantity.innerHTML = ++cartQuantity.innerHTML; // Увеличиваем на единицу
      } else {
        cartIcon.insertAdjacentHTML('beforeend', '<span>1</span>');
      }
      if (!cartProduct) {
        const product = document.querySelector(`[data-pid="${productId}"]`);
        const cartProductImage = product.querySelector('.item-product__image').innerHTML;
        const cartProductTitle = product.querySelector('.item-product__title').innerHTML;
        const cartProductContent = `
			<a href="" class="cart-list__image _ibg">${cartProductImage}</a>
			<div class="cart-list__body">
				<a href="" class="cart-list__title">${cartProductTitle}</a>
				<div class="cart-list__quantity">Quantity: <span>1</span></div>
				<a href="" class="cart-list__delete">Delete</a>
			</div>`;
        cartList.insertAdjacentHTML('beforeend', `<li data-cart-pid="${productId}" class="cart-list__item">${cartProductContent}</li>`);
      } else {
        const cartProductQuantity = cartProduct.querySelector('.cart-list__quantity span');
        cartProductQuantity.innerHTML = ++cartProductQuantity.innerHTML;
      }
      // После всех действий
      productButton.classList.remove('_hold');
    } else {
      const cartProductQuantity = cartProduct.querySelector('.cart-list__quantity span'); // кол-во добавленного в корзину товара
      cartProductQuantity.innerHTML = --cartProductQuantity.innerHTML; //уменьшаю на единицу
      if (!parseInt(cartProductQuantity.innerHTML)) { //если в корзине 0 товаров, то данный товар удаляю
        cartProduct.remove();
      }
      const cartQuantityValue = --cartQuantity.innerHTML; // Общее количество товаров
      if (cartQuantityValue) {
        cartQuantity.innerHTML = cartQuantityValue;
      } else {
        cartQuantity.remove(); // Удаляем спан с счетчиком
        cart.classList.remove('_active');
      }
    }
  }



  // HEADER (чтобы при скролле контент не налегал на содержимое хедера)
  const headerElement = document.querySelector('.header');

  // В тот момент, когда шапка находится в видимой части экрана, срабатывает это условие: entries[0].isIntersecting, и класс у шапки будет отбираться 
  const callback = function (entries, observer) {
    if (entries[0].isIntersecting) {
      headerElement.classList.remove('_scroll');
    } else {
      headerElement.classList.add('_scroll');
    }
  }

  // отлавливать нужные пиксели при прокрутке буду с IntersectionObserver
  const headerObserver = new IntersectionObserver(callback);
  headerObserver.observe(headerElement); // слежу за обьектом хедера
}

// Slider Main
if (document.querySelector('.slider-main__body')) { // существует ли такой блок 
  new Swiper('.slider-main__body', {
    observer: true,
    observeParents: true,
    slidesPerView: 1,
    spaceBetween: 32, //32px по макету отступ между картинками
    watchOverflow: true,
    speed: 800,
    loop: true,// бесконечный слайдер
    loopAdditionalSlides: 5,
    preloadImages: false,
    parallax: true,
    // Dotts
    pagination: {
      el: '.controlls-slider-main__dotts',
      clickable: true,
    },
    // Arrows
    navigation: {
      nextEl: '.slider-main .slider-arrow_next',
      prevEl: '.slider-main .slider-arrow_prev',
    }
  })
}

// Slider Rooms
if (document.querySelector('.slider-rooms__body')) { // существует ли такой блок 
  new Swiper('.slider-rooms__body', {
    observer: true,
    observeParents: true,
    slidesPerView: 'auto', // чтобы управлять шириной через стили
    spaceBetween: 24, //24px по макету отступ между картинками
    watchOverflow: true,
    speed: 800,
    loop: true,// бесконечный слайдер
    loopAdditionalSlides: 5,
    preloadImages: false,
    parallax: true,
    // Dotts
    pagination: {
      el: '.slider-rooms__dotts',
      clickable: true,
    },
    // Arrows
    navigation: {
      nextEl: '.slider-rooms .slider-arrow_next',
      prevEl: '.slider-rooms .slider-arrow_prev',
    }
  })
}

// Slider Tips
if (document.querySelector('.slider-tips__body')) { // существует ли такой блок 
  new Swiper('.slider-tips__body', {
    observer: true,
    observeParents: true,
    slidesPerView: 3, // количество слайдов
    spaceBetween: 32, //32px по макету отступ между картинками
    watchOverflow: true,
    speed: 800,
    loop: true,// бесконечный слайдер

    // Dotts
    pagination: {
      el: '.slider-tips__dotts',
      clickable: true,
    },
    // Arrows
    navigation: {
      nextEl: '.slider-tips .slider-arrow_next',
      prevEl: '.slider-tips .slider-arrow_prev',
    },
    breakpoints: {
      // when window width is >= 320px
      320: {
        slidesPerView: 1.1,
        spaceBetween: 15
      },
      // when window width is >= 768px
      768: {
        slidesPerView: 2,
        spaceBetween: 20
      },
      // when window width is >= 992px
      992: {
        slidesPerView: 3,
        spaceBetween: 32
      }
    }
  })
}

