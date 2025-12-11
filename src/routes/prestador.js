const express = require("express");
const {
    loginPrestador
} = require("../controllers/prestador");

const router = express.Router();

router.post("/login", loginPrestador);


module.exports = router;