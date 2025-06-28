# Task Tracker

A beautiful task management application built with Next.js 14, TypeScript, NextAuth, MongoDB, and custom CSS animations.

## Features

- ✨ Beautiful animated background with CSS animations
- 🔐 User authentication with NextAuth (credentials)
- 📝 Create, read, update, and delete tasks
- 🎨 Modern UI with custom CSS animations and pink theme
- 📱 Responsive design
- 🔒 Protected routes with middleware
- 🎯 Task status management (pending/completed)
- 💅 Animated flip card login/signup form
- 🚀 Custom animated buttons

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, CSS
- **Authentication**: NextAuth.js
- **Database**: MongoDB with Mongoose
- **Styling**: Custom CSS with animations
- **Password Hashing**: bcryptjs

## Getting Started

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd task-tracker
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root directory and add:

```env
# MongoDB Connection String
MONGODB_URI=mongodb://localhost:27017/task-tracker
# Or use MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/task-tracker

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Generate a secret key using: openssl rand -base64 32
```

### 4. Set up MongoDB

Option 1: **Local MongoDB**
- Install MongoDB locally
- Start MongoDB service
- The app will create the database automatically

Option 2: **MongoDB Atlas (Recommended)**
- Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
- Create a new cluster
- Get your connection string
- Replace the MONGODB_URI in .env.local

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Registration**: Visit the app and click "Login" to access the authentication page
2. **Login**: Use the flip card to switch between login and signup forms
3. **Create Tasks**: Once logged in, use the task form to create new tasks
4. **Manage Tasks**: 
   - Mark tasks as completed/pending
   - Edit existing tasks
   - Delete tasks
5. **Logout**: Use the logout button in the navbar

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth]/route.ts
│   │   │   └── register/route.ts
│   │   └── tasks/
│   │       ├── route.ts
│   │       └── [id]/route.ts
│   ├── auth/
│   │   └── page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── Navbar.tsx
│   ├── SessionWrapper.tsx
│   ├── TaskCard.tsx
│   └── TaskForm.tsx
├── lib/
│   └── mongodb.ts
├── models/
│   ├── User.ts
│   └── Task.ts
├── types/
│   └── next-auth.d.ts
└── middleware.ts
```

## API Routes

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/[...nextauth]` - NextAuth handlers

### Tasks
- `GET /api/tasks` - Get user's tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/[id]` - Update task
- `DELETE /api/tasks/[id]` - Delete task

## Features in Detail

### Animated Background
- Custom CSS keyframe animations
- Rain-like effect with multiple layers
- Smooth 150-second animation loop

### Authentication
- Secure password hashing with bcryptjs
- JWT-based sessions
- Route protection with middleware
- Automatic redirects for unauthenticated users

### Task Management
- CRUD operations for tasks
- Real-time updates
- Task status toggle
- Form validation

### UI/UX
- Responsive design for all screen sizes
- Smooth animations and transitions
- Modern glassmorphism effects
- Intuitive user interface

## Customization

### Colors
The app uses a pink theme. To change colors, update these CSS variables in `globals.css`:
- `--main-color: #ff69b4` (primary pink)
- `--input-focus: #ff69b4` (focus color)

### Animations
Animation speeds can be adjusted in the CSS keyframes sections.

## Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms
Make sure to:
- Set up environment variables
- Configure MongoDB connection
- Set NEXTAUTH_URL to your domain

## Troubleshooting

### Common Issues

1. **MongoDB connection failed**
   - Check your MONGODB_URI
   - Ensure MongoDB is running (if local)
   - Check network access for MongoDB Atlas

2. **NextAuth errors**
   - Verify NEXTAUTH_SECRET is set
   - Check NEXTAUTH_URL matches your domain

3. **Build errors**
   - Run `npm run build` to check for TypeScript errors
   - Ensure all dependencies are installed

## License

This project is open source and available under the [MIT License](LICENSE).

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
