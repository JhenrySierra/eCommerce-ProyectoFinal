const ProductDaoFS = require("./filesystem/product.dao.js");
const UserDaoFS = require("./filesystem/user.dao.js");
const ProductDaoMongo = require("./mongodb/product.dao.js");
const UserDaoMongo = require("./mongodb/user.dao.js");
const logger = require('../middlewares/logger.js')

let userDao;
let prodDao;
let persistence = process.argv[2]; 

switch (persistence) {
    case "fs":
        userDao = new UserDaoFS();
        prodDao = new ProductDaoFS();
        logger.info("Using File System for data persistence.");
        break;
    case "mongo":
        userDao = new UserDaoMongo();
        prodDao = new ProductDaoMongo();
        logger.info("Using MongoDB for data persistence.");
        break;
    default:
        userDao = new UserDaoFS();
        prodDao = new ProductDaoFS();
        persistence = "fs";
        logger.info("Defaulting to File System for data persistence.");
        break;
}

module.exports = { prodDao, userDao, persistence };
