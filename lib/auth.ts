
import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/lib/firebase";
import bcrypt from "bcryptjs";

export const authOptions: AuthOptions = {
    session: {
        strategy: "jwt",
    },
    providers: [
        CredentialsProvider({
            name: "Sign in",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials.password) {
                    return null;
                }

                try {
                    // Query Firestore for user
                    const usersRef = db.collection("users");
                    const snapshot = await usersRef.where("email", "==", credentials.email).limit(1).get();

                    if (snapshot.empty) {
                        // For first time setup / admin fallback if no users exist
                        if (credentials.email === "admin@nebula.com" && credentials.password === "admin123") {
                            // Create default admin in Firestore
                            const newUserRef = usersRef.doc();
                            const hashedPassword = await bcrypt.hash(credentials.password, 10);
                            const newUser = {
                                id: newUserRef.id,
                                email: credentials.email,
                                password: hashedPassword,
                                role: "ADMIN",
                                createdAt: new Date().toISOString()
                            };
                            await newUserRef.set(newUser);
                            return {
                                id: newUser.id,
                                email: newUser.email,
                                name: "Admin User",
                                role: "ADMIN"
                            };
                        }
                        return null;
                    }

                    const userDoc = snapshot.docs[0];
                    const userData = userDoc.data();

                    const isPasswordValid = await bcrypt.compare(
                        credentials.password,
                        userData.password
                    );

                    if (!isPasswordValid) return null;

                    return {
                        id: userDoc.id,
                        email: userData.email,
                        name: userData.name || userData.email.split("@")[0],
                        role: userData.role || "USER",
                    };

                } catch (error) {
                    console.error("Auth Error:", error);
                    return null;
                }
            }
        })
    ],
    callbacks: {
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;
            }
            return session;
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
            }
            return token;
        }
    },
    pages: {
        signIn: '/auth',
    }
};
