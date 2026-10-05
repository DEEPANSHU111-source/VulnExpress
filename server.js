const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const app = express();

const PORT = 3000;

const JWT_SECRET = process.env.JWT_SECRET || "development-secret";




app.use(express.json());


app.use(express.urlencoded({ extended: true }));


app.use(cors());


app.use(helmet());

const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    message: {
        error: "Too many requests. Try again later."
    }
});

app.use(limiter);

const users = [
    {
        id: 1,
        username: "deepanshu",
        password: bcrypt.hashSync("password123", 10),
        role: "user"
    },
    {
        id: 2,
        username: "admin",
        password: bcrypt.hashSync("admin123", 10),
        role: "admin"
    }
];



const products = [
    {
        id: 1,
        name: "Laptop",
        price: 60000
    },
    {
        id: 2,
        name: "Keyboard",
        price: 2000
    },
    {
        id: 3,
        name: "Mouse",
        price: 1000
    }
];



const orders = [
    {
        id: 1,
        userId: 1,
        product: "Laptop"
    },
    {
        id: 2,
        userId: 2,
        product: "Keyboard"
    }
];


const upload = multer({
    dest: "uploads/"
});


function authenticateToken(req, res, next) {

    const authHeader = req.headers["authorization"];

    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            error: "Access token required"
        });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {

        if (err) {
            return res.status(403).json({
                error: "Invalid or expired token"
            });
        }

        req.user = user;

        next();
    });
}


function requireAdmin(req, res, next) {

    if (req.user.role !== "admin") {
        return res.status(403).json({
            error: "Admin access required"
        });
    }

    next();
}


app.get("/", (req, res) => {

    res.json({
        message: "VulnExpress API is running",
        version: "1.0"
    });
});


app.get("/users", (req, res) => {

    const safeUsers = users.map(user => ({
        id: user.id,
        username: user.username,
        role: user.role
    }));

    res.json(safeUsers);
});


app.get("/products", (req, res) => {

    res.json(products);
});

app.get("/products/:id", (req, res) => {

    const id = Number(req.params.id);

    const product = products.find(
        product => product.id === id
    );

    if (!product) {
        return res.status(404).json({
            error: "Product not found"
        });
    }

    res.json(product);
});



app.post("/register", async (req, res) => {

    try {

        const { username, password } = req.body;

   
        if (!username || !password) {
            return res.status(400).json({
                error: "Username and password are required"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                error: "Password must be at least 6 characters"
            });
        }

     
        const existingUser = users.find(
            user => user.username === username
        );

        if (existingUser) {
            return res.status(409).json({
                error: "Username already exists"
            });
        }

   
        const hashedPassword = await bcrypt.hash(
            password,
            10
        );

        const newUser = {
            id: users.length + 1,
            username: username,
            password: hashedPassword,
            role: "user"
        };

        users.push(newUser);

        res.status(201).json({
            message: "User registered successfully",
            user: {
                id: newUser.id,
                username: newUser.username,
                role: newUser.role
            }
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Registration failed"
        });
    }
});


app.post("/login", async (req, res) => {

    try {

        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                error: "Username and password are required"
            });
        }

        const user = users.find(
            user => user.username === username
        );

        if (!user) {
            return res.status(401).json({
                error: "Invalid username or password"
            });
        }

        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                error: "Invalid username or password"
            });
        }

        const token = jwt.sign(
            {
                id: user.id,
                username: user.username,
                role: user.role
            },
            JWT_SECRET,
            {
                expiresIn: "1h"
            }
        );

        res.json({
            message: "Login successful",
            token: token
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Login failed"
        });
    }
});


app.get(
    "/profile",
    authenticateToken,
    (req, res) => {

        const user = users.find(
            user => user.id === req.user.id
        );

        if (!user) {
            return res.status(404).json({
                error: "User not found"
            });
        }

        res.json({
            id: user.id,
            username: user.username,
            role: user.role
        });
    }
);


app.get(
    "/users/:id/profile",
    authenticateToken,
    (req, res) => {

        const id = Number(req.params.id);

        const user = users.find(
            user => user.id === id
        );

        if (!user) {
            return res.status(404).json({
                error: "User not found"
            });
        }

      

        res.json({
            id: user.id,
            username: user.username,
            role: user.role
        });
    }
);



app.put(
    "/users/:id",
    authenticateToken,
    (req, res) => {

        const id = Number(req.params.id);

        const user = users.find(
            user => user.id === id
        );

        if (!user) {
            return res.status(404).json({
                error: "User not found"
            });
        }

        const { username, role } = req.body;

       

        if (username) {
            user.username = username;
        }

        if (role) {
            user.role = role;
        }

        res.json({
            message: "User updated",
            user: {
                id: user.id,
                username: user.username,
                role: user.role
            }
        });
    }
);



app.get(
    "/admin",
    authenticateToken,
    requireAdmin,
    (req, res) => {

        res.json({
            message: "Welcome administrator",
            users: users.map(user => ({
                id: user.id,
                username: user.username,
                role: user.role
            }))
        });
    }
);



app.get(
    "/orders",
    authenticateToken,
    (req, res) => {

        const userOrders = orders.filter(
            order => order.userId === req.user.id
        );

        res.json(userOrders);
    }
);


app.get(
    "/orders/:id",
    authenticateToken,
    (req, res) => {

        const id = Number(req.params.id);

        const order = orders.find(
            order => order.id === id
        );

        if (!order) {
            return res.status(404).json({
                error: "Order not found"
            });
        }



        res.json(order);
    }
);


app.post(
    "/orders",
    authenticateToken,
    (req, res) => {

        const { product } = req.body;

        if (!product) {
            return res.status(400).json({
                error: "Product is required"
            });
        }

        const newOrder = {
            id: orders.length + 1,
            userId: req.user.id,
            product: product
        };

        orders.push(newOrder);

        res.status(201).json({
            message: "Order created",
            order: newOrder
        });
    }
);


app.get("/search", (req, res) => {

    const query = req.query.q;

    if (!query) {
        return res.status(400).json({
            error: "Search query required"
        });
    }

    const results = products.filter(
        product =>
            product.name
                .toLowerCase()
                .includes(query.toLowerCase())
    );

    res.json({
        query: query,
        results: results
    });
});


app.post(
    "/upload",
    authenticateToken,
    upload.single("file"),
    (req, res) => {

        if (!req.file) {
            return res.status(400).json({
                error: "No file uploaded"
            });
        }

        res.json({
            message: "File uploaded",
            file: {
                originalName: req.file.originalname,
                filename: req.file.filename,
                size: req.file.size,
                mimetype: req.file.mimetype
            }
        });
    }
);



app.get("/error", (req, res) => {

    throw new Error("Intentional test error");
});


app.use((req, res) => {

    res.status(404).json({
        error: "Route not found"
    });
});

app.use((err, req, res, next) => {

    console.error(err);

    res.status(500).json({
        error: "Internal server error"
    });
});


app.listen(PORT, () => {

    console.log(
        `VulnExpress running at http://localhost:${PORT}`
    );

});
