import auth from "@react-native-firebase/auth";
import { useAuthStore } from "../store/useAuthStore";
import { api } from "./api";

export const subscribeToAuthChanges = () => {
  return auth().onAuthStateChanged(async (firebaseUser) => {
    const { setAuth, setLoading } = useAuthStore.getState();
    
    if (firebaseUser) {
      try {
        setLoading(true);
        const idToken = await firebaseUser.getIdToken(true);
        
        // Let FastAPI backend verify token and sync/retrieve user
        const response = await api.post("/auth/login", {}, {
          headers: {
            Authorization: `Bearer ${idToken}`
          }
        });
        
        setAuth(response.data, idToken);
      } catch (error) {
        console.error("Failed to login to backend", error);
        setAuth(null, null);
      }
    } else {
      setAuth(null, null);
    }
  });
};
