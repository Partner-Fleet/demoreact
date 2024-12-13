import type { AuthProvider } from "@refinedev/core";

export const TOKEN_KEY = "refine-auth";

// Mock user data - move this to a separate file if you prefer
const USERS = {
  "john@refine.com": {
    id: 1,
    name: "John Doe",
    avatar: "https://i.pravatar.cc/300?img=1",
    role: "Admin"
  },
  "jane@refine.com": {
    id: 2,
    name: "Jane Smith",
    avatar: "https://i.pravatar.cc/300?img=2",
    role: "Editor"
  },
  "bob@refine.com": {
    id: 3,
    name: "Bob Johnson",
    avatar: "https://i.pravatar.cc/300?img=3",
    role: "Viewer"
  }
};

export const authProvider: AuthProvider = {
  login: async ({ email, password }) => {
    if (email && password) {
      localStorage.setItem(TOKEN_KEY, email);
      return {
        success: true,
        redirectTo: "/",
      };
    }

    return {
      success: false,
      error: {
        name: "LoginError",
        message: "Invalid email or password",
      },
    };
  },
  logout: async () => {
    localStorage.removeItem(TOKEN_KEY);
    return {
      success: true,
      redirectTo: "/login",
    };
  },
  check: async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      return {
        authenticated: true,
      };
    }

    return {
      authenticated: false,
      redirectTo: "/login",
    };
  },
  getPermissions: async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token && USERS[token]) {
      return USERS[token].role;
    }
    return null;
  },
  getIdentity: async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token && USERS[token]) {
      return {
        id: USERS[token].id,
        name: USERS[token].name,
        avatar: USERS[token].avatar,
        email: token,
        role: USERS[token].role,
      };
    }
    return null;
  },
  onError: async (error) => {
    console.error(error);
    return { error };
  },
};