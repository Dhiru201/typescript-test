enum ItemType {
  CAR,
  BIKE,
  SCOOTER,
}

interface CartItem {
  readonly type: ItemType;
  readonly sellerPrice: number;
  afterDiscountPrice: number;
}

interface CartCoupon {
  setDiscount(cart: ShoppingCart, position: number): void;
}
type ShoppingCartItem = CartItem | CartCoupon;
const isSellableItem = (item: ShoppingCartItem): item is CartItem =>
  item instanceof Item;

class ShoppingCart {
  readonly items: ShoppingCartItem[];
  itemsRecord: Record<ItemType, CartItem[]>;

  constructor(items: ShoppingCartItem[]) {
    this.items = items;
    this.itemsRecord = {
      [ItemType.CAR]: [],
      [ItemType.BIKE]: [],
      [ItemType.SCOOTER]: [],
    };
    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i];
      if (isSellableItem(item)) {
        this.itemsRecord[item.type].push(item);
      }
    }

    for (let i = 0; i < this.items.length; i++) {
      const coupon = this.items[i];
      if (!isSellableItem(coupon)) {
        coupon.setDiscount(this, i);
      }
    }
  }

  finalPrice(): number {
    var totalPrice = 0;
    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i];
      if (isSellableItem(item)) {
        totalPrice += item.afterDiscountPrice;
      }
    }
    return totalPrice;
  }
}

class Item implements CartItem {
  readonly type: ItemType;
  readonly sellerPrice: number;
  afterDiscountPrice: number;

  constructor(price: number, type: ItemType) {
    this.type = type;
    this.sellerPrice = price;
    this.afterDiscountPrice = price;
  }
}

class PercentageDiscountOnEachItem implements CartCoupon {
  readonly discountPercentage: number;
  constructor(discount: number) {
    this.discountPercentage = discount;
  }
  setDiscount(cart: ShoppingCart, _: number): void {
    for (let i = 0; i < cart.items.length; i++) {
      const item = cart.items[i];
      if (isSellableItem(item)) {
        (cart.items[i] as CartItem).afterDiscountPrice =
          (cart.items[i] as CartItem).afterDiscountPrice *
          (1 - this.discountPercentage / 100);
      }
    }
  }
}
class NextProductPercentageDiscount implements CartCoupon {
  readonly discountPercentage: number;
  constructor(discount: number) {
    this.discountPercentage = discount;
  }
  setDiscount(cart: ShoppingCart, position: number): void {
    for (let i = position + 1; i < cart.items.length; i++) {
      const item = cart.items[i];
      if (isSellableItem(item)) {
        (cart.items[i] as CartItem).afterDiscountPrice =
          (cart.items[i] as CartItem).afterDiscountPrice *
          (1 - this.discountPercentage / 100);
        return;
      }
    }
  }
}

class NthProductAmountDiscountByType implements CartCoupon {
  readonly discountAmount: number;
  readonly itemType: ItemType;
  readonly nthProduct: number;
  constructor(discountAmount: number, itemType: ItemType, nthProduct: number) {
    this.discountAmount = discountAmount;
    this.itemType = itemType;
    this.nthProduct = nthProduct;
  }

  setDiscount(cart: ShoppingCart, _: number): void {
    let selectedRecord = cart.itemsRecord[this.itemType];
    let nthItem = selectedRecord[this.nthProduct];
    if (nthItem) {
      (nthItem as CartItem).afterDiscountPrice =
        (nthItem as CartItem).afterDiscountPrice - this.discountAmount;
      return;
    }
  }
}

let item1 = new Item(10, ItemType.CAR);
let item2 = new Item(15, ItemType.BIKE);
let item3 = new Item(10, ItemType.CAR);
let item4 = new Item(18, ItemType.SCOOTER);
let item5 = new Item(16, ItemType.CAR);
let item6 = new Item(10, ItemType.CAR);

const coupon2 = new NthProductAmountDiscountByType(5, ItemType.CAR, 3);
const coupon1 = new PercentageDiscountOnEachItem(5);
const coupon3 = new NextProductPercentageDiscount(50);
const coupon4 = new NthProductAmountDiscountByType(2, ItemType.CAR, 2);

const cart = new ShoppingCart([
  coupon1,
  item1,
  item2,
  coupon2,
  coupon3,
  item3,
  item4,
  coupon4,
  item5,
  item6,
]);
console.log(cart.finalPrice().toFixed(2)); // 63.30
