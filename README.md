# Market

Market is our latest e-commerce platform that will allow users to browse and purchase a wide selection of products.

## Database

![Visual representation of the database schema linked below](/docs/schema.svg)\
_[textual representation of the database schema in DBML](/docs/schema.dbml)_

1. Create a new Postgres database named `market`.
2. Initialize Prisma and connect it to the database.
3. Define the models according to the schema above.
   - The `username` of a `User` must be unique.
4. Seed the database with at least 20 products.

## API

Build an Express app that serves the following routes.

The 🔒 lock icon next to a route indicates that it must be a protected route. A user can only access that route by attaching a valid token to their request. If a valid token is not provided, immediately send a 401 Unauthorized error.

### Authentication Routes

- `POST /register` creates a new User with the provided credentials and sends a token
  - request body should include `username` and `password`
  - the password should be hashed in the database
- `POST /login` sends a token if the provided credentials are valid
  - request body should include `username` and `password`

### Product Routes

- `GET /products` sends array of all products
- `GET /products/:id` sends specific product
  - if user is logged in, then also include all orders made by the user that have this product

### Order Routes

- 🔒 `GET /orders` sends array of all orders made by the logged in user
- 🔒 `POST /orders` creates a new order by the logged in user
  - the request body should include the `date`, a `note`, and ids of the products to purchase
- 🔒 `GET /orders/:id` sends specific order, including all products
  - if the logged-in user is not the one who made the order, send a 403 Forbidden error
