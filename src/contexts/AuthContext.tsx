
import React, { createContext, useState, useEffect, useContext, ReactNode } from "react";
import { User } from "@/lib/types";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (username: string, email: string, password: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const { toast } = useToast();

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log("Fetching user profile for ID:", userId);
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching user profile:", error);
        return null;
      }

      console.log("Profile fetched:", profile);
      return profile ? {
        id: profile.id,
        username: profile.username,
        email: '', // Email is not stored in the profiles table for security
        isAdmin: profile.is_admin,
        avatarUrl: profile.avatar_url
      } : null;
    } catch (error) {
      console.error("Error in fetchUserProfile:", error);
      return null;
    }
  };

  // Check if user is already logged in on mount
  useEffect(() => {
    console.log("AuthProvider mounted, setting up auth listener");
    
    // First set up the auth listener to catch any auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session?.user?.id);
        if (session && session.user) {
          // Use setTimeout to avoid potential deadlocks with Supabase client
          setTimeout(async () => {
            const profile = await fetchUserProfile(session.user.id);
            if (profile) {
              setCurrentUser({
                ...profile,
                email: session.user.email || '',
              });
              console.log("User profile set after auth state change:", profile);
            } else {
              console.error("Could not fetch user profile after auth state change");
              setCurrentUser(null);
            }
          }, 0);
        } else {
          setCurrentUser(null);
        }
      }
    );

    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Error getting initial session:", error);
          return;
        }
        
        console.log("Initial session check:", session?.user?.id);
        if (session && session.user) {
          const profile = await fetchUserProfile(session.user.id);
          if (profile) {
            setCurrentUser({
              ...profile,
              email: session.user.email || '',
            });
            console.log("Initial user profile set:", profile);
          } else {
            console.error("Could not fetch user profile during initialization");
          }
        }
      } catch (error) {
        console.error("Error during auth initialization:", error);
      }
    };

    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const isAuthenticated = !!currentUser;
  const isAdmin = currentUser?.isAdmin || false;

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log("Attempting to login with:", email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error("Supabase login error:", error);
        
        // Special case for unconfirmed email
        if (error.message.includes("Email not confirmed")) {
          toast({
            title: "Email Not Verified",
            description: "Please check your email for a verification link.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Login Failed",
            description: error.message,
            variant: "destructive",
          });
        }
        return false;
      }

      if (!data.user) {
        console.error("No user returned from login");
        toast({
          title: "Login Failed",
          description: "No user data returned",
          variant: "destructive",
        });
        return false;
      }

      console.log("Login successful, user ID:", data.user.id);
      
      // Profile will be set by the auth listener
      // No need to fetch and set it here to avoid race conditions
      return true;
    } catch (error) {
      console.error("Unexpected login error:", error);
      toast({
        title: "Login Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setCurrentUser(null);
      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      });
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Logout Failed",
        description: "An error occurred during logout.",
        variant: "destructive",
      });
    }
  };

  const register = async (username: string, email: string, password: string): Promise<boolean> => {
    try {
      // Check if username is already taken
      const { data: existingUsers, error: checkError } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .limit(1);

      if (checkError) {
        console.error("Error checking username:", checkError);
        toast({
          title: "Registration Failed",
          description: "Error checking username availability.",
          variant: "destructive",
        });
        return false;
      }

      if (existingUsers && existingUsers.length > 0) {
        toast({
          title: "Registration Failed",
          description: "Username already exists. Please choose another one.",
          variant: "destructive",
        });
        return false;
      }

      // Register the user
      console.log("Registering new user:", email);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random`,
          }
        }
      });

      if (error) {
        console.error("Registration error:", error);
        toast({
          title: "Registration Failed",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }

      console.log("Registration response:", data.user?.id);
      
      // The profile will be created by the database trigger
      toast({
        title: "Registration Successful",
        description: "Please check your email to confirm your account.",
      });
      return true;
      
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Registration Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const value = {
    currentUser,
    isAuthenticated,
    isAdmin,
    login,
    logout,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
