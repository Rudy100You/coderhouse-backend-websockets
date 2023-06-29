import { Router } from "express";
import CartManager from "../js/managers/CartManager.js";
const cartMan =  new CartManager("src/data/cartData.json");

const cartsRouter = Router();

cartsRouter.get("/:cid",(req,res)=>{
    let cartID = req.params.cid;
    cartMan.retrieveCartById(cartID).then((product) => {
        res.json({ product });
    }).catch(err=>{
        res.status(404).send(err.message)
    });
})

cartsRouter.post("/",async(req,res)=>{
    const products = req.body.products??[]
    if(products.length > 0) {
        await cartMan.createNewCart(products)
        res.status(201).send("cart created")
    }
    else{
        res.status(422).send("Invalid request body")
    }

})

cartsRouter.post("/:cid/product/:pid",(req,res)=>
{
    cartMan.addProductToCart(req.params.cid, parseInt(req.params.pid)).then(()=>{
        res.status(201).send("Product added")
    }).catch(err=>{
        res.status(422).send(err.message)
    })   
})

export default cartsRouter