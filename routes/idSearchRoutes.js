const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");

const {addIDSearch,updateIDSearch,deleteIDSearch,getIDSearchByNid,getMyNID} =require("../controllers/idSearchController")
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
router.get("/getIdSearch/:NID",getIDSearchByNid)
router.get("/mynidsearch",auth,getMyNID)
module.exports=router