// controllers
const functionController    = require('../controllers/functionController');
const nearestHundredths     = functionController.nearestHundredths;
const priceToCompleteString = functionController.priceToCompleteString;

module.exports = function Cart(oldCart) {
    this.items = oldCart.items || {};
    this.totalQty = oldCart.totalQty || 0;

    this.totalPrice = oldCart.totalPrice 
        ? Number.parseFloat(nearestHundredths(oldCart.totalPrice)) 
        : 0;

    this.isPromo = oldCart.isPromo || false;
    this.promoName = oldCart.promoName || "";
    this.promoPercent = oldCart.promoPercent || 0;
    this.promoMin = oldCart.promoMin || 0;
    this.promoTotal = nearestHundredths(oldCart.totalPrice * oldCart.promoPercent);
    this.afterPromoTotalPrice =  Number.parseFloat(nearestHundredths(this.totalPrice - this.promoTotal));

    // if promo code is applied
    if (this.isPromo) {
        this.totalAfterTax = nearestHundredths(this.afterPromoTotalPrice * 1.05);
        this.tax = nearestHundredths(this.afterPromoTotalPrice * 0.05);
    } else {
        this.totalAfterTax = nearestHundredths(this.totalPrice * 1.05);
        this.tax = nearestHundredths(this.totalPrice * 0.05);
    }

    // function to add item
    this.add = function(item, id) {
        var storedItem = this.items[id];
        if (!storedItem) {
            storedItem = this.items[id] = {item: item, qty: 0, price: 0};
            storedItem.id = id;
        }
        storedItem.qty++;
        storedItem.price = nearestHundredths(storedItem.item.price * storedItem.qty);
        this.totalQty++;
        this.totalPrice = nearestHundredths(this.totalPrice + storedItem.item.price);
    };

    // function to reduce individual item
    this.reduceByOne = function(id) {
        this.items[id].qty--;
        this.items[id].price = nearestHundredths(this.items[id].price - this.items[id].item.price);
        this.totalQty--;
        this.totalPrice = nearestHundredths(this.totalPrice - this.items[id].item.price);

        if (this.items[id].qty <= 0) {
            delete this.items[id];
        }
    };

    // function to reduce individual item completely
    this.removeItem = function(id) {
        this.totalQty -= this.items[id].qty;
        this.totalPrice = nearestHundredths(this.totalPrice - this.items[id].price);
        delete this.items[id];
    };

    // function to convert items to array
    this.generateArray = function() {
        var arr = [];
        for (var id in this.items) {
            const changeItem = this.items[id];
            changeItem.price = priceToCompleteString(changeItem.price);
            arr.push(this.items[id]);
        }
        return arr;
    };
}

