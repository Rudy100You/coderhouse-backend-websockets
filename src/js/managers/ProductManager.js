import fs from "fs";

class ProductManager {
  validFields = [
    "title",
    "description",
    "code",
    "price",
    "status",
    "stock",
    "category",
    "thumbnails",
  ];
  mandatoryFields = [
    "title",
    "description",
    "code",
    "price",
    "stock",
    "category",
  ];

  constructor(path) {
    this.path = path;
    if (!fs.existsSync(path)) throw "Error: File not Found";
  }

  async addProduct(newProduct) {
    let data = { products: [] };
    await this.parseDataFromFile()
      .then((fileData) => {
        data = fileData;
      })
      .catch((err) => {
        console.info(
          "data file not found or empty, formatting/creating new file"
        );
      });
    let partialProduct = { ...newProduct };

    if (partialProduct.status == null || partialProduct.status == undefined) {
      partialProduct.status = true;
    }

    partialProduct = Object.fromEntries(
      this.validFields.map((key) => [key, partialProduct[key]])
    );

    let codeFound;
    if (
      !data.products.some((p) => {
        let { id, ...rest } = p;
        codeFound = rest.code;
        return partialProduct.code === rest.code;
      })
    ) {
      let nextProductId =
        data.products.reduce((max, obj) => {
          return obj.id > max ? obj.id : max;
        }, 0) + 1;

      data.products.push({
        id: nextProductId,
        ...partialProduct,
      });

      fs.writeFileSync(this.path, JSON.stringify(data));
      console.log("Product added successfully");
    } else {
      throw new Error(
        `Product rejected: Product with code "${codeFound}" already exists`
      );
    }
  }

  async getProducts() {
    return await this.parseDataFromFile();
  }

  async getProductById(id) {
    let data = await this.parseDataFromFile();
    let product = data.products.find((p) => p.id == id);
    if (product == null) console.error("Product not found");
    else return product;
  }

  async updateProduct(id, contentToUpdate) {
    const data = await this.parseDataFromFile();
    let codeFound;
    let indexToUpdate = data.products.findIndex((product) => product.id == id);
    if (
      !data.products.some((p) =>{ 
        codeFound = p.code
        return p.id !== id && p.code === contentToUpdate.code
      })
    ) {
      if (indexToUpdate >= 0) {
        data.products.splice(indexToUpdate, 1, {
          id: indexToUpdate + 1,
          ...contentToUpdate,
        });
        fs.writeFileSync(this.path, JSON.stringify(data));
        console.log("Updated Successfully");
      } else {
        new Error("Nothing to update: id not found");
      }
    } else {
      throw new Error(
        `Product rejected: Product with code "${codeFound}" already exists`
      );
    }
  }

  async deleteProduct(id) {
    let data = await this.parseDataFromFile();
    if (data.products.some((product) => product.id == id)) {
      data.products.splice(
        data.products.findIndex((product) => product.id === id),
        1
      );
      fs.writeFileSync(this.path, JSON.stringify(data));
      console.log(`Product with Id [${id}] has been deleted successfully`);
    } else {
      throw new Error(`Product with Id [${id}] does not exist`);
    }
  }

  validateFields(...fields) {
    const presentMandatoryFields = this.mandatoryFields.filter((field) =>
      fields.includes(field)
    );
    return (
      presentMandatoryFields.length === this.mandatoryFields.length &&
      this.validateNotInvalidFields(...fields)
    );
  }

  validateNotInvalidFields(...fields) {
    const invalidFields = fields.filter(
      (fieldName) => !this.validFields.includes(fieldName)
    );
    return invalidFields.length === 0;
  }

  async parseDataFromFile() {
    return JSON.parse(await fs.promises.readFile(this.path, "utf-8"));
  }
}

export default ProductManager;
