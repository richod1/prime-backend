const port=4000
const path=require('path')
const express=require("express")
const cors=require('cors')
const jwt=require('jsonwebtoken')
const app=express()
const multer=require('multer')
require('dotenv').config()
const bodyParser=require('body-parser')

app.use(express.json())
app.use(cors())
app.use(express.static(path.join(__dirname,'public/uploads')))
app.use(bodyParser.urlencoded({extended:false}))


//multer for picture uploads handling
const storage=multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,'public/uploads')
    },
    filename:function(req,file,cb){
        let uploadFile=file.originalname.split('.')
        let name=`${uploadFile[0]}-${Date.now()}.${uploadFile[uploadFile.length-1]}`
        cb(null,name)
    }
})
const upload=multer({storage:storage})

const { register, login, updateUser, deleteUser, userById, resetPassword } = require("./controllers/auth/auth");
const { addProduct, updateProduct, deleteProduct, getAllProducts } = require("./controllers/products/products")
const { checkout, addToCart, cart, removeFromCart } = require("./controllers/user/cart")
const { isAdmin, checkAuth } = require("./controllers/middlewares/auth");
const { dashboardData, getAllUsers } = require('./controllers/admin/dashboard');
const { getAllOrders, changeStatusOfOrder } = require('./controllers/admin/orders');
const { orders } = require('./controllers/user/orders');
const { addCategory, getCategories, updateCategory, deleteCategory } = require('./controllers/categories/category');
const { addToWishlist, wishlist, removeFromWishlist } = require('./controllers/user/wishlist');
const mongoose = require("./config/database")()

app.get('/',(req,res)=>{
    res.send('hello react native')
})

// AUTH
app.post('/register', register);
app.post("/login", login)


// User Routes
app.post("/update-user", updateUser)
app.get("/user", userById)
app.get("/delete-user", deleteUser)
app.post("/reset-password", resetPassword)


// Products
app.post("/product", [isAdmin], addProduct)
app.get("/products", getAllProducts)
app.post("/update-product", [isAdmin], updateProduct)
app.get("/delete-product", [isAdmin], deleteProduct)


// CATEGORIES
app.post("/category", [isAdmin], addCategory)
app.get("/categories", getCategories)
app.post("/update-category", [isAdmin], updateCategory)
app.get("/delete-category", [isAdmin], deleteCategory)


// ORDERS
app.get("/orders",[checkAuth],orders)

// CHECKOUT
app.post("/checkout",[checkAuth],checkout)

// WISHLIST
app.post("/add-to-wishlist",[checkAuth],addToWishlist)
app.get("/wishlist",[checkAuth],wishlist)
app.get("/remove-from-wishlist",[checkAuth],removeFromWishlist)

// ADMIN
app.get("/dashboard",[isAdmin],dashboardData)
app.get("/admin/orders",[isAdmin],getAllOrders)
app.get("/admin/order-status",[isAdmin],changeStatusOfOrder)
app.get("/admin/users",[isAdmin],getAllUsers)

// HELPER
app.post('/photos/upload', upload.array('photos', 12), function (req, res, next) {  
  // req.files is array of `photos` files

  try{
    let files = req.files;
    if(!files.length){
      return res.status(400).json({ err:'Please upload an image', msg:'Please upload an image' })
    }
    let file = req.files[0]
    if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
        return res.json({"image" : file.filename}) 
    }
  }
  catch(error){
    return res.send(error.message)
  }
})

app.listen(port,(err)=>{
    if(err) throw new Error('problem with server port')
    console.log(`server started on port ${port}`)
})