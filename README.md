# FoodWise-Backend 🍉
Foodwise is aiming to be your number one go to application that gives you the ability and flexibility to control your food tracking. It is made for people who constantly forget that they still have food in their fridge, or for those who are looking to keep track of their food intake. Foodwise is a mobile application that allows users to keep track of their food inventory and also provides recipes based on the ingredients that the user has in their inventory.

# Features ⭐
- User Authentication and Authorization: Secure login and registration system to keep user data safe and secure.
- Food Inventory Management: Keep track of the food you have in your fridge and pantry and the food you have consumed or thrown away.
- Expiry Date Notifications: Get notifications when your food is about to expire.
- Recipe Finder: Find recipes based on the ingredients you have in your inventory.

# API Documentation 📃
The API Documentation is made with Postman and accessible at
this link: <br> [FoodWise API Documentation](https://documenter.getpostman.com/view/13401392/Tz5tZQ8v)

# Deployment
The backend is deployed on Google App Engine and can be accessed at this link: <br> [FoodWise Backend](https://foodwise-backend.ue.r.appspot.com/)

# Technologies Used ⚙️
- Node.js
- Express.js
- Supabase
- TypeScript
- JWT (JSON Web Token)
- Postman
- nodemon
- node-cron
- Google App Engine
- PostgreSQL

# Getting Started 🚀
## Prerequisites
- Node.js v14.x or higher
- npm v6.x or higher
- PostgreSQL
- Supabase Account, Project, Database, and Object Storage
- Google Cloud Platform Account
- Postman
- Git
- VS Code or any other code editor
- Google Chrome or any other browser
## Installation
1. Clone the repository
```bash
git clone https://github.com/TeamFoodWise/FoodWise-Backend.git
cd FoodWise-Backend
```

2. Install dependencies
```bash
npm install
```

3Create a `.env` file in the root directory and add the following environment variables
```bash
PORT=8080
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
JWT_SECRET=your_jwt_secret
```
## Running the Application
### Development mode
```bash
npx nodemon src/index.ts
```

or
```bash
npm run dev
```

### Production mode
1. Build the project
```bash
npm run build
```

2. Start the server
```bash
npm start
```

# Core Project Structure
```
FoodWise-Backend
├── src
│   ├── config
│   │   ├── supabase.ts
│   ├── controllers
│   │   ├── consumption.controller.ts
│   │   ├── inventory.controller.ts
│   │   ├── user.controller.ts
│   ├── middleware
│   │   ├── auth.ts
│   │   ├── validateSchema.ts
│   ├── models
│   │   ├── consumption.model.ts
│   │   ├── inventory.model.ts
│   │   ├── user.model.ts
│   │   ├── item.model.ts
│   ├── routes
│   │   ├── consumption.routes.ts
│   │   ├── inventory.routes.ts
│   │   ├── user.routes.ts
│   │   ├── auth.routes.ts
│   │   ├── index.ts
│   │   ├── recipe.routes.ts
│   │   ├── item.routes.ts
│   ├── services
│   │   ├── auth
│   │   │   ├── auth.services.ts
│   │   ├── Homepage
│   │   │   ├── expiring.services.ts
│   │   │   ├── statistics.services.ts
│   │   ├── Inventory
│   │   │   ├── item.services.ts
│   │   │   ├── summary.services.ts
│   │   ├── Recipes
│   │   │   ├── recommendation.services.ts
│   │   │   ├── detail.services.ts
│   ├── schemas
│   │   ├── auth.schema.ts
├── app.ts
├── index.ts
├── .env
├── .gitignore
├── package.json
├── tsconfig.json
├── README.md
```
