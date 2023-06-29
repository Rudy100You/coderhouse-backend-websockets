import { Router } from "express";
import ProductManager from "../js/managers/ProductManager.js";
const productMan = new ProductManager("src/data/productData.json");

const productsRouter = Router();

productsRouter.get("/", async (req, res) => {
  let responseData = { products: [] };
  let { limit } = req.query;
  responseData = await productMan.getProducts();
  if (Number.parseInt(limit) >= 0) {
    res.json({ products: responseData.products.slice(0, limit) });
  } else {
    res.json(responseData);
  }
});

productsRouter.get("/:pid", (req, res) => {
  let productID = req.params.pid;
  productMan.getProductById(productID).then((product) => {
    if (product) {
      res.json({ product });
    } else {
      res.status(404).send(`Product with id [${productID}] not found`);
    }
  });
});

productsRouter.post("/", (req, res) => {
  const newProduct = req.body;
  const newProdFields = Object.keys(newProduct);

  if (newProdFields.length > 0) {
    if (productMan.validateFields(...newProdFields)) {
      productMan
        .addProduct(newProduct)
        .then(() => {
          res.status(201).send({message:"Product created successfully"});
        })
        .catch((err) => {
          res.status(422).send({message:err.message});
        });
    } else {
      res.status(422).send({message:"Invalid Request"});
    }
  } else {
    res.status(415).send({message:"Request is empty"});
  }
});

productsRouter.put("/:pid", (req, res) => {
  const productID = req.params.pid;
  const modProduct = req.body;
  const modProdFields = Object.keys(modProduct);
  if (modProdFields.length > 0) {
    if (productMan.validateNotInvalidFields(...modProdFields)) {
      productMan
        .updateProduct(parseInt(productID), modProduct)
        .then(() => {
          res.status(200).send({message:"Product updated successfully"});
        })
        .catch((err) => {
          res.status(422).send({message:err.message});
        });
    } else {
      res.status(422).send({message:"Invalid Request"});
    }
  } else {
    res.status(415).send({message:"Request is empty"});
  }
});

productsRouter.delete("/:pid", (req, res) => {
  const productID = req.params.pid;

  productMan
    .deleteProduct(parseInt(productID))
    .then(() => {
      res.status(200).send({message:"Product deleted successfully"});
    })
    .catch((err) => {
      res.status(422).send({message:err.message});
    });
});

export default productsRouter;
