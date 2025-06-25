# Zemelix Frontend Authentication Flow & Project Structure

This README outlines a clear, step-by-step approach to building a role-based authentication system for Zemelix platform using **TypeScript, React (with Vite), TailwindCSS, and shadcn/ui**. The app will support three roles: **Site Admin, Sellers/Service Providers, and Customers**.

---

## **Project Goals**

- Role-based authentication (JWT)
- Dynamic UI based on user roles
- Modern, scalable project structure
- Responsive, accessible UI with TailwindCSS and shadcn/ui

---

## **Step-by-Step Plan**

### 1. **Project Setup**

- Initialize a new Vite React project with TypeScript:
  ```bash
  npm create vite@latest my-ecommerce-frontend -- --template react-ts
  cd my-ecommerce-frontend
  ```
- Install dependencies:
  ```bash
  npm install react-router-dom axios tailwindcss shadcn/ui
  npx tailwindcss init -p
  ```
- Configure TailwindCSS and integrate shadcn/ui components.

---

### 2. **Define Roles and Authentication Flow**

- **Roles:** `admin`, `seller`, `customer`
- **Authentication:**
  - Registration (`/signup`)
  - Login (`/login`)
  - JWT token management (store in HttpOnly cookies or localStorage)
  - Role-based route protection
  - Logout

---

### 3. **Project Structure**

```
src/
│
├── api/ // Axios  & API calls
│   └── auth.ts
│
├── components/ //(shadcn, custom)
│   └── Navbar.tsx
│   └── ProtectedRoute.tsx
│
├── contexts/ //React Contexts
│   └── AuthContext.tsx
│
├── hooks/  //React hooks
│   └── useAuth.ts
│
├── layouts/ // Role-based Layouts
│   └── AdminLayout.tsx
│   └── SellerLayout.tsx
│   └── CustomerLayout.tsx
│
├── pages/      // Page components
│   └── auth/   // Login, Signup
│   └── admin/  // Admin dashboard
│   └── seller/ // Seller dashboard
│   └── customer/ // Customer 
│
├── routes/   // Route definitions
│   └── AppRoutes.tsx
│
├── types/      // TypeScript types
│   └── auth.d.ts
│
├── utils/ // Utility functions
│   └── token.ts
│
├── App.tsx
└── main.tsx
```


---

### 4. **Implement Authentication Logic**

- Use **React Context API** and `useReducer` for global auth state management.
- Store user info and JWT after login.
- Expose `login`, `logout`, and `register` functions via context.
- Protect routes using a `ProtectedRoute` component that checks role and authentication[1][5].

---

### 5. **Role-Based Routing & UI**

- Use React Router to define protected routes for each role.
- Dynamically render navigation and dashboard based on the logged-in user's role.
- Example:
  - `/admin/*` → Admin only
  - `/seller/*` → Seller only
  - `/customer/*` → Customer only

---

### 6. **UI Implementation**

- Use **TailwindCSS** for styling and **shadcn/ui** for accessible, modern components.
- Create forms for login and registration with validation.
- Build dashboards and navigation for each user role.

---

### 7. **API Integration**

- Use Axios to interact with backend endpoints:
  - `POST /api/auth/signup`
  - `POST /api/auth/login`
  - `GET /api/user/profile`
- Attach JWT to requests for protected resources[1][5].

---

### 8. **Testing & Optimization**

- Test authentication flows for all roles.
- Ensure unauthorized access is blocked and users are redirected appropriately.
- Optimize for performance and accessibility.

---

## **Authentication Flow Diagram**

1. **User visits `/login` or `/signup`**
2. **On success:**
   - JWT token received and stored
   - User context updated with role and info
   - Redirect to appropriate dashboard (`/admin`, `/seller`, `/customer`)
3. **On protected route access:**
   - `ProtectedRoute` checks auth state and role
   - If unauthorized, redirect to `/login` or show "Access Denied"
4. **Logout:**
   - Clear token and user context
   - Redirect to `/login`
---

## **Next Steps**

1. Scaffold project structure as above.
2. Implement AuthContext and reducer logic.
3. Build authentication forms and protected routes.
4. Style UI with TailwindCSS and shadcn/ui.
5. Integrate API and test all flows.

---