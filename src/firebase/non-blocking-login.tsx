
'use client';
import {
  Auth,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';

/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth): void {
  signInAnonymously(authInstance).catch(err => console.error("Sign in failed", err));
}

/** Initiate email/password sign-up (non-blocking). */
export function initiateEmailSignUp(authInstance: Auth, email: string, password: string): void {
  createUserWithEmailAndPassword(authInstance, email, password).catch(err => console.error("Sign up failed", err));
}

/** Initiate email/password sign-in (non-blocking). */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string): void {
  signInWithEmailAndPassword(authInstance, email, password).catch(err => console.error("Sign in failed", err));
}

/** Sign out user. */
export function signOutUser(authInstance: Auth): void {
  signOut(authInstance).catch(err => console.error("Sign out failed", err));
}
