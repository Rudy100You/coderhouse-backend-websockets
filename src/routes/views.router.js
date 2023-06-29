import { Router } from "express";
import ProductManager from "../js/managers/ProductManager.js";

const socketViewsRouter = Router();
const productMan = new ProductManager("src/data/productData.json");

const viewsRouter = (io) => {
  socketViewsRouter.get("/", async (req, res) => {
    res.render("home", await productMan.getProducts());
  });

  socketViewsRouter.get("/realtimeproducts", async (req, res) => {
    res.render("realTimeProducts", {});
    let products = await productMan.getProducts();

    io.on("connection", (socket) => {
      io.emit("dataUpdated", products);
      console.log("Cliente conectado");
      socket.on("updateProductList", async (message) => {
        products = await productMan.getProducts();
        io.emit("dataUpdated", products);
      });
    });
  });

  return socketViewsRouter;
};

export default viewsRouter;
