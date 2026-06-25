const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");

const {addIDSearch,updateIDSearch,deleteIDSearch,getIDSearchByNid} =require("../controllers/idSearchController")
const auth =require("../middleware/authMiddleware")
router.post("/addIdSearch",auth, upload.fields([
  {
    name: "profileImage",
    maxCount: 1,
  },
]),addIDSearch)
router.put("/updateIdSearch",auth, upload.fields([
  {
    name: "profileImage",
    maxCount: 1,
  },
]),updateIDSearch)
router.delete("/deleteIdSearch",auth,deleteIDSearch)
router.get("/getIdSearch/:NID",auth,getIDSearchByNid)
module.exports=router