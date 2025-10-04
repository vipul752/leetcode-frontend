# 🚀 LeetCode Clone - Advanced Coding Platform

> **A modern, feature-rich coding platform inspired by LeetCode, built with cutting-edge technologies**

## 📋 Table of Contents

- [✨ Features](#-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [📦 Installation](#-installation)
- [🚀 Usage](#-usage)
- [📁 Project Structure](#-project-structure)
- [🔗 API Endpoints](#-api-endpoints)
- [🎯 Contributing](#-contributing)
- [📞 Contact](#-contact)

---

## ✨ Features

### 🎨 **Modern User Interface**

- **Dark Theme Design** - Sleek, modern dark UI with beautiful gradients
- **Responsive Layout** - Optimized for desktop, tablet, and mobile devices
- **Smooth Animations** - Engaging transitions and hover effects
- **Professional Navigation** - Intuitive navigation with user-friendly interface

### 💻 **Advanced Code Editor**

- **Multi-Language Support** - C++, Python, Java, JavaScript support
- **Monaco Editor Integration** - Industry-standard code editor with IntelliSense
- **Syntax Highlighting** - Beautiful syntax highlighting for all supported languages
- **Real-time Code Execution** - Instant code running and testing

### 🔐 **Authentication & User Management**

- **Secure Authentication** - JWT-based authentication system
- **User Registration & Login** - Complete user onboarding flow
- **Role-based Access Control** - Admin and user role management
- **Profile Management** - User profile customization and settings

### 📊 **Progress Tracking & Analytics**

- **Problem Solving Statistics** - Comprehensive stats dashboard
- **Progress Visualization** - Visual progress bars and achievement badges
- **Difficulty Tracking** - Separate tracking for Easy, Medium, Hard problems
- **Submission History** - Detailed submission logs with performance metrics

### 🤖 **AI-Powered Features**

- **AI Chat Assistant** - Powered by Gemini AI for coding help
- **Intelligent Code Suggestions** - AI-powered code hints and solutions
- **Smart Debugging Help** - AI assistance for debugging and optimization
- **Interactive Learning** - Context-aware problem explanations

### 📚 **Rich Content Management**

- **Problem Descriptions** - Detailed problem statements with examples
- **Video Editorial Support** - Integrated video explanations
- **Multiple Language Solutions** - Reference solutions in multiple programming languages
- **Test Case Management** - Comprehensive test case coverage

### 🔧 **Advanced Problem Solving**

- **Live Code Execution** - Real-time code running and validation
- **Test Case Visualization** - Detailed test case results and debugging info
- **Performance Metrics** - Runtime, memory usage, and efficiency tracking
- **Submission Status Tracking** - Real-time submission status updates

### 🏆 **Gamification Elements**

- **Achievement System** - Unlock badges and achievements
- **Streak Tracking** - Daily coding streak counters
- **Ranking System** - User ranking based on problem-solving performance
- **Progress Celebrations** - Visual feedback for completed challenges

---

## 🛠️ Tech Stack

### **Frontend Technologies**

- **[React 19.1.1](https://reactjs.org/)** - Modern React with latest features
- **[Vite 7.1.2](https://vitejs.dev/)** - Lightning-fast build tool and dev server
- **[Tailwind CSS 4.1.12](https://tailwindcss.com/)** - Utility-first CSS framework
- **[DaisyUI 5.0.51](https://daisyui.com/)** - Customizable Tailwind CSS components

### **State Management**

- **[Redux Toolkit 2.8.2](https://redux-toolkit.js.org/)** - Predictable state container
- **[React Redux 9.2.0](https://react-redux.js.org/)** - Official React bindings for Redux

### **Code Editor**

- **[Monaco Editor 4.7.0](https://microsoft.github.io/monaco-editor/)** - VS Code's editor
- **[@monaco-editor/react](https://www.npmjs.com/package/@monaco-editor/react)** - React wrapper for Monaco

### **Form Handling & Validation**

- **[React Hook Form 7.62.0](https://react-hook-form.com/)** - Performant forms library
- **[@hookform/resolvers](https://react-hook-form.com/get-started#ValidationResolver)** - Validation resolvers
- **[Zod 4.1.3](https://zod.dev/)** - TypeScript-first schema validation

### **HTTP Client & Communication**

- **[Axios 1.11.0](https://axios-http.com/)** - Promise-based HTTP client
- **[React Router 7.8.2](https://reactrouter.com/)** - Declarative routing for React

### **UI Components & Icons**

- **[Lucide React 0.542.0](https://lucide.dev/)** - Beautiful & consistent icon toolkit
- **[React Icons 5.5.0](https://react-icons.github.io/react-icons/)** - Popular icons library

### **Cloud Integration**

- **[@cloudinary/react](https://cloudinary.com/documentation/react_integration)** - Cloud-based asset management

### **Development Tools**

- **[ESLint 9.33.0](https://eslint.org/)** - Code linting and formatting
- **[TypeScript Support](https://www.typescriptlang.org/)** - Type definitions for React

---

## 📦 Installation

### Prerequisites

- **[Node.js](https://nodejs.org/)** (v18.0 or higher)
- **[npm](https://www.npmjs.com/)** (v8.0 or higher) or **[Yarn](https://yarnpkg.com/)**
- **Git** for version control

### Step-by-Step Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/leetcode-client.git
   cd leetcode-client
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Configuration**

   ```bash
   # Create environment file (if needed)
   cp .env.example .env
   ```

   > **Note**: Ensure your backend server is running on `http://localhost:3000`

4. **Start the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Build for production**

   ```bash
   npm run build
   # or
   yarn build
   ```

6. **Preview production build**
   ```bash
   npm run preview
   # or
   yarn preview
   ```

### Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix
```

---

## 🚀 Usage

### Getting Started

1. **Start the Application**

   ```bash
   npm run dev
   ```

   Navigate to `http://localhost:5173` (or the port shown in terminal)

2. **Create Your Account**

   - Click on "Sign Up" to create a new account
   - Fill in your details and verify your email
   - Log in with your credentials

3. **Start Coding**
   - Browse available problems from the homepage
   - Filter by difficulty, tags, or search for specific topics
   - Click on any problem to start solving

### 🎯 **Key Features Walkthrough**

#### **Problem Solving Interface**

- **Left Panel**: Problem description, examples, reference solutions
- **Right Panel**: Monaco code editor with language selection
- **Live Testing**: Run code against visible test cases
- **Submission**: Submit code for official grading

#### **AI Assistant**

- Click the "Chat AI" tab in any problem
- Ask questions about algorithms, debugging, or optimization
- Get AI-powered code suggestions and explanations

#### **Progress Tracking**

- View your solving statistics on the homepage
- Track your progress across different difficulty levels
- Monitor your coding streak and achievements

### 📸 **Screenshots**

> **Add beautiful screenshots of your application here**

- Homepage with problem listing
- Problem detail page with editor
- AI Chat Assistant interface
- User dashboard with statistics
- Solution submission interface

---

## 📁 Project Structure

```
📦 leetcode-client/
├── 📁 public/                    # Static assets
│   └── vite.svg
├── 📁 src/                       # Source code
│   ├── 📁 assets/               # Images and icons
│   │   └── react.svg
│   ├── 📁 components/           # Reusable React components
│   │   ├── ChatAI.jsx          # AI Chat Assistant
│   │   ├── Editorial.jsx        # Video editorial component
│   │   └── Profile.jsx          # User profile component
│   ├── 📁 pages/                # Main application pages
│   │   ├── HomePage.jsx        # Problem listing dashboard
│   │   ├── ProblemPage.jsx      # Individual problem interface
│   │   ├── Login.jsx           # Authentication pages
│   │   ├── SignUp.jsx          # User registration
│   │   ├── Admin.jsx            # Admin dashboard
│   │   ├── AdminPanel.jsx       # Admin problem management
│   │   └── ...                 # Other admin pages
│   ├── 📁 store/                # Redux store configuration
│   │   └── store.js            # Store setup and configuration
│   ├── 📁 utils/                # Utility functions
│   │   └── axiosClient.js       # HTTP client configuration
│   ├── App.jsx                  # Main application component
│   ├── App.css                  # Application styles
│   ├── authSlice.js             # Authentication Redux slice
│   ├── index.css                # Global styles
│   └── main.jsx                 # Application entry point
├── 📁 node_modules/             # Dependencies
├── 📄 package.json              # Project configuration
├── 📄 vite.config.js           # Vite configuration
├── 📄 eslint.config.js          # ESLint configuration
└── 📄 README.md                 # Project documentation
```

### **Component Architecture**

```
📦 Component Tree
├── 🏠 App
│   ├── 🏠 HomePage
│   │   ├── 📊 Progress Dashboard
│   │   ├── 🔍 Problem Filters
│   │   └── 📋 Problem List
│   ├── 🔐 Authentication
│   │   ├── 📝 Login
│   │   └── ✍️ SignUp
│   ├── 💻 ProblemPage
│   │   ├── 📖 Problem Description
│   │   ├── 🤖 AI Chat Assistant
│   │   ├── 📚 Reference Solutions
│   │   ├── 🧪 Test Cases
│   │   └── 📊 Submission History
│   ├── 👤 Profile
│   └── ⚙️ Admin Panel
```

---

## 🔗 API Endpoints

> **Note**: This frontend connects to a backend API running on `http://localhost:3000`

### **Authentication Endpoints**

```
POST /api/auth/register        # User registration
POST /api/auth/login           # User login
POST /api/auth/logout          # User logout
GET  /api/auth/profile         # Get user profile
```

### **Problem Management Endpoints**

```
GET  /api/problems             # Get all problems
GET  /api/problems/:id         # Get specific problem
POST /api/problems             # Create new problem (Admin)
PUT  /api/problems/:id         # Update problem (Admin)
DELETE /api/problems/:id       # Delete problem (Admin)
```

### **Code Execution Endpoints**

```
POST /api/submissions/run/:id   # Run code against test cases
POST /api/submissions/submit/:id # Submit solution for grading
GET  /api/submissions/history  # Get submission history
```

### **AI Assistant Endpoints**

```
POST /api/ai/chat              # Send message to AI assistant
POST /api/ai/suggestions       # Get AI code suggestions
```

### **User Progress Endpoints**

```
GET  /api/user/stats           # Get user statistics
GET  /api/user/progress        # Get problem solving progress
GET  /api/user/achievements    # Get user achievements
```

---

## 🎯 Contributing

We welcome contributions from the community! Here's how you can help:

### **Ways to Contribute**

#### 🐛 **Bug Reports**

- Search existing issues before creating new ones
- Use the provided issue template
- Include detailed reproduction steps
- Provide screenshots or error logs when applicable

#### 💡 **Feature Requests**

- Check existing feature requests first
- Clearly describe the feature and its benefits
- Consider the impact on existing functionality

#### 🔧 **Code Contributions**

1. **Fork the repository**

   ```bash
   git clone https://github.com/yourusername/leetcode-client.git
   cd leetcode-client
   ```

2. **Create a feature branch**

   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make your changes**

   - Follow the existing code style
   - Add tests for new functionality
   - Update documentation as needed

4. **Commit your changes**

   ```bash
   git commit -m 'Add amazing feature'
   ```

5. **Push to the branch**

   ```bash
   git push origin feature/amazing-feature
   ```

6. **Create a Pull Request**
   - Use a descriptive title
   - Explain your changes thoroughly
   - Reference any related issues

### **Development Guidelines**

#### **Code Standards**

- Follow React best practices
- Use functional components with hooks
- Implement proper error handling
- Write meaningful commit messages
- Add JSDoc comments for complex functions

#### **Styling Guidelines**

- Use Tailwind CSS classes consistently
- Follow mobile-first responsive design
- Maintain dark theme consistency
- Use semantic color schemes

#### **Testing**

- Write unit tests for utility functions
- Test component rendering
- Include accessibility tests
- Ensure cross-browser compatibility

### **Community Guidelines**

- Be respectful and inclusive
- Help others learn and grow
- Share knowledge and best practices
- Report inappropriate behavior

---

## 📞 Contact

### **Developer Profile**

<div align="center">

**[Vipul Kumar](https://github.com/vipul752)**

</div>

---

<div align="center">

### ⭐ **Show Your Support**

If this project helped you learn or inspired you in any way, please give it a star! ⭐

**Built with ❤️ using React, Tailwind CSS, and AI**

**Made by [Vipul Kumar](https://github.com/vipul752)**

</div>
