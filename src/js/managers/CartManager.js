import fs from "fs";
import { v4 } from "uuid";
class CartManager {
  validFields = ["products"];
  mandatoryFields = ["products"];

  validProductFields = ["id", "quantity"];
  mandatoryProductFields = ["id", "quantity"];

  constructor(path) {
    if (!fs.existsSync(path)) {
      console.error("File not found");
      throw new Error("File not found");
    }
    this.path = path;
  }

  async createNewCart(products) {
    let data = await this.parseDataFromFile();
    this.parseDataFromFile()
      .then((fileData) => {
        data = fileData;
      })
      .catch((err) => {
        console.info(
          "data file not found or empty, formatting/creating new file"
        );
        data = { carts: [] };
      });

    let id = v4();
    while (data.carts.some((cart) => cart.id === id)) {
      id = v4();
    }

    let newCart = {
      id,
      products,
    };
    data.carts.push(newCart);
    await fs.promises.writeFile(this.path, JSON.stringify(data));
  }

  async retrieveCartById(id) {
    let data = await this.parseDataFromFile();
    let cart = data.carts.find((cart) => cart.id == id);
    if (cart == null)
      throw new Error("Product not found");
    else 
      return cart;
  }

  async addProductToCart(cartID, productID){
    let cart = {products:[]}
    let data = await this.parseDataFromFile()
    cart = await this.retrieveCartById(cartID)
    const existingProdIdx = cart.products.findIndex(p => p.id == productID)
    if(existingProdIdx>=0)
    {
      cart.products[existingProdIdx].quantity = cart.products[existingProdIdx].quantity +1
    }
    else{
      cart.products.push({id: productID, quantity:1})
    }
    let cartIdx = data.carts.findIndex(c => c.id === cart.id)

    data.carts.splice(cartIdx,1,cart)

    await fs.promises.writeFile(this.path, JSON.stringify(data));
  }

  async parseDataFromFile() {
    return JSON.parse(await fs.promises.readFile(this.path, "utf-8"));
  }

  //TODO: optimize field validation
  validateFields(req) {
    return (
      this.validateMandatoryFields(this.mandatoryFields, ...Object.keys(req)) &&
      this.validateNotInvalidFields(this.validFields, ...Object.keys(req))
    );
  }

  validateMandatoryFields(mandatoryFields, ...fields) {
    const presentMandatoryFields = mandatoryFields.filter((field) =>
      fields.includes(field)
    );
    return (
      presentMandatoryFields.length === mandatoryFields.length &&
      this.validateNotInvalidFields(...fields)
    );
  }

  validateNotInvalidFields(validFields, ...fields) {
    const invalidFields = fields.filter(
      (fieldName) => !validFields.includes(fieldName)
    );
    return invalidFields.length === 0;
  }
}

export default CartManager;
