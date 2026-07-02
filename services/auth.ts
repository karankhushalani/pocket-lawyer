import auth from "@react-native-firebase/auth";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { useAuthStore } from "../store/useAuthStore";
import { api } from "./api";

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_FIREBASE_WEB_CLIENT_ID,
});

async function syncUserToStore() {
  const firebaseUser = auth().currentUser;
  if (!firebaseUser) {
    await useAuthStore.getState().clearUser();
    return;
  }
  const token = await firebaseUser.getIdToken();
  await useAuthStore.getState().setUser({
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    name: firebaseUser.displayName,
    token,
  });
}

export async function signInWithGoogle() {
  await GoogleSignin.hasPlayServices();
  const { idToken } = await GoogleSignin.signIn();
  const googleCredential = auth.GoogleAuthProvider.credential(idToken);
  await auth().signInWithCredential(googleCredential);
  await syncUserToStore();
}

export async function signInWithEmail(email: string, password: string) {
  await auth().signInWithEmailAndPassword(email, password);
  await syncUserToStore();
}

export async function signOut() {
  await auth().signOut();
  await useAuthStore.getState().clearUser();
}

export async function getIdToken(): Promise<string | null> {
  const firebaseUser = auth().currentUser;
  if (!firebaseUser) return null;
  return firebaseUser.getIdToken();
}
