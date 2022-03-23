const MemberController = require("../controllers/MemberController");

const router = require("express").Router();

router.post("/", MemberController.updateMember);

module.exports = router;
