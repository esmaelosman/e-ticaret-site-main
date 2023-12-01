
var cartItems = [];
var products = [];
var current_product;
var current_quantity = 1;
document.addEventListener("DOMContentLoaded", () => {
  getCartItems();
});

var getCartItems = function () {
  var cartItems = localStorage.getItem("cartItems");
  if (cartItems) {
    window.cartItems = JSON.parse(cartItems);
  } else {
    cartItems = [];
  }
  updateCartIcon();
  getTableItems();
  updateCartSummary();
  

}

var kuponDogrulandi = false;
var updateCartSummary = function () {
  const totalAdetElement = document.querySelector(".toplamAdet span");
  if (totalAdetElement) {
    totalAdetElement.textContent = getQuantity();
  }
  let totalPrice = getProductsTotal();

  const urunToplamiElement = document.querySelector(".urunToplami span");
  if (urunToplamiElement) {
    urunToplamiElement.textContent = "$" + totalPrice.toFixed(2);
  }

  const urunToplamiSepet = document.querySelector(".total-price");
  if (urunToplamiSepet) {
    urunToplamiSepet.textContent = "$" + totalPrice.toFixed(2);
  }


  const kargoVarElement = document.querySelector(".kargo-var");
  const kargoYokElement = document.querySelector(".kargo-yok");
  const toplamTutarElement = document.querySelector(".toplamTutar span");

  if (kargoVarElement && kargoYokElement && toplamTutarElement) {
    const shipping_price = getShippingPrice();
    if (shipping_price == 0) {
      // Kargo ücretsiz
      kargoVarElement.classList.add("d-none");
      kargoYokElement.classList.remove("d-none");
    } else {
      // Kargo ücreti ekle
      kargoVarElement.classList.remove("d-none");
      kargoYokElement.classList.add("d-none");
      const kargoUcreti = getShippingPrice();
      totalPrice += kargoUcreti;
      kargoVarElement.textContent = "$" + kargoUcreti.toFixed(2);
    }
    const kuponKodu = localStorage.getItem("kuponKodu");
    if (kuponKodu) {
      if (setCoupon(kuponKodu)) {
        totalPrice -= setCoupon(kuponKodu);
      }
    }

    toplamTutarElement.textContent = "$" + totalPrice.toFixed(2);
  }

  

  const promoCodeInput = document.getElementById("promoCode");
  const kuponUygulaButton = document.getElementById("kuponUygulaButton");
  const kuponTR = document.querySelector(".kupon-tr");
  const kuponVarElement = document.querySelector(".kupon-var strong");
  

if(promoCodeInput && kuponUygulaButton && kuponTR && kuponVarElement){
 
      
      kuponUygulaButton.addEventListener("click", function () {
           
        kuponTR.classList.remove("d-none");

       
        const girilenKuponKodu = promoCodeInput.value; 
        if (setCoupon(girilenKuponKodu)) {
          updateCartSummary();
            showToast("İndirim Fiyatı tanımlanmıştır!");
            
            
          } else {
            showToast("Geçersiz kupon kodu!"); 
          }
      });
    } 
}

var getProductsTotal = function () {
  total = 0;
  window.cartItems.map((item) => {
    total += item.price * item.quantity;
  })
  return total;
}
var getQuantity = function () {
  quantity = 0;
  window.cartItems.map((item) => {
    quantity += item.quantity;
  })
  return quantity;
}

var updateCartIcon = function () {
  var cartIcon = document.querySelector("#cart-icon");
  cartIcon.setAttribute("data-quantity", getQuantity());
}

var deleteItem = function (productId) {
  const items = window.cartItems;
  const index = items.findIndex((item) => item.id === productId);
  if (index >= 0) {
    items.splice(index, 1);
    window.cartItems = items;
    localStorage.setItem("cartItems", JSON.stringify(items));
  }
  getCartItems();
  showToast("Ürün sepetten çıkarıldı.");
}


var addToCart = function (productId, quantity = 1) {
  const product = window.products.find(item => item.id === productId);

  const items = window.cartItems;

  if (!items || !Array.isArray(items)) {
    product.quantity = quantity;
    if (stokkontrolu(product.id,product.quantity) ){
      localStorage.setItem("cartItems", JSON.stringify([product]));
    }
  } else {
    const cart_index = window.cartItems.findIndex((item) => item.id === productId);
    if (cart_index >= 0) {
      product.quantity = window.cartItems[cart_index].quantity + quantity;
      items[cart_index] = product;
    } else {
      product.quantity = quantity;
      items.push(product);
    }
    if (stokkontrolu(product.id,product.quantity) ){
      localStorage.setItem("cartItems", JSON.stringify(items));
    }
  }
 
 
  

  getCartItems();
}

function stokkontrolu(productId,quantity) {
  const product = window.products.find(item => item.id === productId);
  if (product) {
    if (product.stock < quantity ){
      showToast(`Bu üründen en fazla ${product.stock} adet kadar ürün ekleyebilirsiniz.`);
      return false;
    }
  }

  showToast("Ürün sepete eklendi!");
  return true;
}

var updateQuantity = function (productId, quantity,event) {
  if (stokkontrolu(productId,quantity)){
    const index = window.products.findIndex((item) => item.id === productId);
    const product = window.products[index];
    const items = window.cartItems;
    const cart_index = window.cartItems.findIndex((item) => item.id === productId);
    product.quantity = parseFloat(quantity);
    items[cart_index] = product;
    localStorage.setItem("cartItems", JSON.stringify(items));
    getCartItems();
  }
}

var decreaseItem = function (productId) {
  const items = window.cartItems;
  const cart_index = window.cartItems.findIndex((item) => item.id === productId);
  if (cart_index >= 0) {
    const quantity = window.cartItems[cart_index].quantity - 1;
    if (quantity > 0) {
      items[cart_index].quantity = quantity;
      localStorage.setItem("cartItems", JSON.stringify(items));

    } 
    getCartItems();
  }
}


function setCoupon(girilenKuponKodu) {
  const kuponTR = document.querySelector(".kupon-tr");
  if (!kuponTR) {
    return false;
  }
  var dogruKuponKodu = 1234;
  const indirimMiktari = 1000;

  if (girilenKuponKodu == dogruKuponKodu) {
    const totalPriceElement = document.querySelector(".toplamTutar span");
    const totalPrice = parseFloat(getProductsTotal());
    const yeniToplamTutar = totalPrice - indirimMiktari;

    localStorage.setItem("kuponKodu", dogruKuponKodu);
    const kuponVarElement = document.querySelector(".kupon-var strong");

    kuponVarElement.textContent = "$" + indirimMiktari.toFixed(2);
    kuponTR.classList.remove("d-none");

    if (yeniToplamTutar < 0) {
      totalPriceElement.textContent = "$00.00";
    } else {
      totalPriceElement.textContent = "$" + yeniToplamTutar.toFixed(2);
    }
    
    const promoCode = document.getElementById("promoCode");
    promoCode.value = girilenKuponKodu;
    kuponDogrulandi = true;
    const deleteKupon = document.getElementById("delete-kupon");
    deleteKupon.classList.remove('d-none');
    return indirimMiktari;
  } else {
    return false;
  }
}

function getShippingPrice() {
  const price = 35;
  if (getProductsTotal() >= 1750) {
    return 0;
  }
  return price;
}
function removeCoupon() {
  localStorage.removeItem("kuponKodu");
  const kuponTR = document.querySelector(".kupon-tr");
  kuponTR.classList.add("d-none");
  const promoCode = document.getElementById("promoCode");
  promoCode.value = '';
  const deleteKupon = document.getElementById("delete-kupon");
  deleteKupon.classList.add('d-none');
  updateCartSummary();
}


var getTableItems = function () {
  var cartTable = document.getElementById("root");
  const discountDiv = document.querySelector('.discount');
  const summaryDiv = document.querySelector('.summary');
  const cartItems = document.getElementsByClassName("cart-content")[0];
  if (cartItems) {
    cartItems.innerHTML = '';
    var cartShopBox = document.createElement("div");
    cartShopBox.classList.add("cart-box");
    window.cartItems.forEach(function (item) {
      cartShopBox.innerHTML = cartShopBox.innerHTML + `
      <img src="${item.thumbnail}" alt="" class="cart-img">
    <div class="detail-box">
        <div class="cart-product-title">${item.title}</div>
        <div class="cart-price">$ ${item.price.toFixed(2)}</div>
        <input type="number" name="" min="1" max="${item.stock}" id="" onchange="updateQuantity(${item.id},this.value,event)" value="${item.quantity}" class="cart-quantity">

    </div>

    <i class="fas fa-trash cart-remove" onClick="deleteItem(${item.id})"></i>
      `;
    });
    cartItems.append(cartShopBox);

  }

  if (cartTable) {
    cartTable.innerHTML = '';
    if (window.cartItems.length) {
      window.cartItems.forEach(function (item) {
        var row = cartTable.insertRow();
        var cell1 = row.insertCell(0);
        var cell2 = row.insertCell(1);
        var cell3 = row.insertCell(2);
        var cell4 = row.insertCell(3);
        var cell5 = row.insertCell(4);
        var cell6 = row.insertCell(5);
        // Görseli ekleyin
        cell1.innerHTML = '<div class="img-box"><img class="img" src="' + item.thumbnail + '" alt="Ürün Resmi"></div>';

        // Ürün adı ekleyin
        cell2.innerHTML = item.title;

        // Fiyat ekleyin
        cell3.innerHTML = '$' + item.price.toFixed(2);

        // Adet ekleyin
        cell4.innerHTML = `<div class="quantity-control">
                <button id="btn-decrease" onClick="decreaseItem(${item.id})" class="btn">-</button>
                <input id="quant-input" type="text" value="${item.quantity}" min="1" max="${item.stock}" class="form-control">
                <button id="btn-increase" onClick="addToCart(${item.id})" class="btn">+</button>
      </div>`;




        // Tutarı hesaplayın ve ekleyin
        var subtotal = item.price * item.quantity;
        cell5.innerHTML = '$' + subtotal.toFixed(2);

        // Sil butonu ekleyin
        cell6.innerHTML = '<button class="btn btn-danger delete-button" onClick="deleteItem(' + item.id + ')">Sil</button>';
      });
      if (discountDiv) {
        discountDiv.style.display = 'block';
      }
      if (summaryDiv) {
        summaryDiv.style.display = 'block';
      }

    }else {
      cartTable.innerHTML = '<div class="uyari-mesaj">Your cart is empty</div>';

      if (discountDiv) {
        discountDiv.style.display = 'none';
      }
      if (summaryDiv) {
        summaryDiv.style.display = 'none';
      }
    }


  }
}

function showToast(message) {
  const toastContent = document.querySelector(".toast-body"); // .toast-body içeriği değiştirildi
  toastContent.innerHTML =
    '<i class="fas fa-check-circle me-2"></i>' + message; // Toast içeriği mesaj ile güncellendi

  const toast = new bootstrap.Toast(document.querySelector(".toast"));
  toast.show();
}

function updateModelQuantity(quantity){
  if (window.current_quantity + quantity > 0){
    window.current_quantity += quantity;
    const quant_input = document.getElementById('quant-input');
    quant_input.value = window.current_quantity;
    
    
  } 
}


document.addEventListener("DOMContentLoaded", () => {

  fetch("new.json").then(response => response.json()).then(data => {
    window.products = data.products;
    const cardShop = document.getElementById("card-shop");
    if (cardShop) {
      for (const product of data.products) {
        cardShop.innerHTML += `
          <div class="product-box" id="${product.id}">
            <img src="${product.thumbnail}" alt="" class="product-img">
            <h2 class="product-title">${product.title}</h2>
            <span class="price"> $ ${product.price} </span>
            <i class="fas fa-shopping-bag add-cart" onClick="addToCart(${product.id})"></i>
          </div>`;
      }

      cardShop.addEventListener("click", event => {
        if (event.target.classList.contains("product-img")) {
          // Existing modal code
          const modal = document.getElementById("product-modal");
          const modalImage = document.getElementById("modal-image");
          const modalTitle = document.getElementById("modal-title");
          const modalDescription = document.getElementById("modal-description");
          const modalPrice = document.getElementById("modal-price");
          const productBox = event.target.closest(".product-box");
          const productId = productBox.getAttribute("id");
          const product = data.products.find(item => item.id == productId);
          window.current_product = product;
          window.current_quantity = 1;

          // Reset quantity input

          quantityInput.value = 1;

          modalImage.src = product.thumbnail;
          modalTitle.textContent = product.title;
          modalDescription.textContent = product.description;
          modalPrice.textContent = " $" + product.price;
          quantityInput.value = 1; // Reset quantity input

          // Show modal
          const productModal = new bootstrap.Modal(
            document.getElementById("product-modal")
          );
          productModal.show();
        }
      });
    }

    const quantityInput = document.getElementById("quant-input");
    // Quantity control



    // // Cart Open Close

    let cartIcon = document.querySelector("#cart-icon");
    let cart = document.querySelector(".cart");
    let closeCart = document.querySelector("#close-cart");

    //Open Cart

    cartIcon.onclick = () => {
      cart.classList.add("active");
    };

    closeCart.onclick = () => {
      cart.classList.remove("active");
    };

  });

});


///merhaba