const cartBtn = document.querySelector('.cart-btn');
const closeCartBtn = document.querySelector('.close-cart');
const clearCartBtn = document.querySelector('.clear-cart');
const cartDOM = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector('.cart-total');
const cartContent = document.querySelector('.cart-content');
const productsDOM = document.querySelector('.products-center');

//cart data
let cart = [] || Storage.getCart()
let btnDom = []

//getting the products
class Products {
  async getProducts() {
    try {
      let result = await fetch('products.json');
      let data = await result.json()
      let products = data.items;

      products = products.map(item => {
        const {title, price} = item.fields;
        const {id} = item.sys;
        const image = item.fields.image.fields.file.url;
        return {title, price, id, image}
      })
      return products
    } catch (err) {
      console.log(err)
    }
  }
}

//display products
class UI {
  displayProducts(products){
    let result = ''
    products.forEach(product => {
      result += `
       <!--  single product-->
      <article class="product">
        <div class="img-container">
          <img class='product-img'
               src=${product.image} alt="product">
          <button class="bag-btn" data-id=${ product.id }>
            <i class="fa fa-shopping-cart"></i>
            Add to cart
          </button>
        </div>
        <h3>${ product.title }</h3>
        <h4>$${ product.price }</h4>
      </article>
      <!--  end of single product-->
      `
      return result
    })
    productsDOM.innerHTML = result
  }
  getBagBtns(){
    //turn nodeList into an arr
    const buttons = [...document.querySelectorAll('.bag-btn')]
    btnDom = buttons
    buttons.forEach( (button, idx) => {
      let id = button.dataset.id
      let AlreadyInCart = cart.find( item => item.id === id)

      if( AlreadyInCart ){
        button.innerText = 'Already in your cart';
        button.disabled = true
      }
      button.addEventListener('click', event => {
        event.target.innerText = 'Already in your cart';
        event.target.disabled = true
        //get product from products when clicked
        let cartItem = {...Storage.getProduct(id), amount: 1}
        //add product to cart
        cart = [...cart, cartItem ]
        //save cart to localStorage
        console.log(`@@@ cart`, cart)
        Storage.saveCart(cart)
        //set cart values
        this.setCartValues(cart)
        //display cart item
        this.addCartItems(cartItem)
        //Show the cart
        this.showCart()
        //Get cart data from localStorage
        // this.setupApp()
      })
    })
  }
  setCartValues(cart){
    let amtTotal = 0;
    let quantTotal = 0;
    cart.map( item => {
      amtTotal += item.price * item.amount;
      quantTotal += item.amount;
    })
    cartTotal.innerText = parseFloat( amtTotal.toFixed(2) ) ;
    cartItems.innerText = quantTotal;
  }
  addCartItems ( item ){
    const div = document.createElement('div')
    div.classList.add('cart-item')
    div.innerHTML = `
          <img src=${ item.image } alt="product">
          <div>
            <h4>${ item.title }</h4>
            <h5>$ ${item.price}</h5>
            <span class="remove-item" data-id=${ item.id }>remove</span>
          </div>
          <div>
            <i class="fas fa-chevron-up" data-id=${ item.id }></i>
            <p class="item-amount">${ item.amount }</p>
            <i class="fas fa-chevron-down" data-id=${ item.id }></i>
          </div>`
     cartContent.appendChild(div)
  }
  showCart(){
    cartOverlay.classList.add('transparentBcg');
    cartDOM.classList.add('showCart')
  }
  setupApp(){
    cart = Storage.getCart();
    this.setCartValues(cart);
    this.populate(cart);
    cartBtn.addEventListener('click', this.showCart )
    closeCartBtn.addEventListener('click', this.hideCart )
  }
  populate(cart){
    cart.forEach(item => this.addCartItems(item))
  }

  hideCart(){
    cartOverlay.classList.remove('transparentBcg')
    cartDOM.classList.remove('showCart')
  }
  cartLogic(){
    clearCartBtn.addEventListener('click', () => {
      this.clearCart()
    })
  }
  clearCart(){
    let cartItems = cart.map( item => item.id )
    cartItems.forEach( id => this.removeItem(id) )
    console.log(cartContent)
    while( cartContent.children.length > 0 ){
      cartContent.removeChild( cartContent.children[0] )
    }
    this.hideCart()
  }
  removeItem(id){
    cart = cart.filter( item => item.id !== id)
    this.setCartValues( cart )
    Storage.saveCart(cart)
    let button = this.getSingleBtn(id);
    button.disabled = false;
    button.innerHTML = ` <i class="fa fa-shopping-cart"></i>Add to cart`
  }

  getSingleBtn(id) {
    return btnDom.find( btn => btn.dataset.id === id )
  }
}
//Local storage
class Storage{
  static saveProducts( products ){
    localStorage.setItem('products', JSON.stringify(products))
  }
  static saveCart(cart){
    localStorage.setItem('cart', JSON.stringify(cart))
  }
  static getProduct(id) {
    let products = JSON.parse(localStorage.getItem('products'))
    return products.find(product => product.id === id)
  }
  static getCart(){
    return localStorage.getItem('cart') ?
      JSON.parse(localStorage.getItem('cart')) : []
  }
}

document.addEventListener("DOMContentLoaded", ()=>{
  const ui = new UI();
  const products = new Products();
  //get cart data
  ui.setupApp();

  //get product data
  products.getProducts().then( products => {
    ui.displayProducts(products)
    Storage.saveProducts(products)
  }).then(() => {
    ui.getBagBtns()
    ui.cartLogic()
  });

})