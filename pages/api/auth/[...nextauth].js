import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import Auth0Provider from 'next-auth/providers/auth0';
import CredentialsProvider from 'next-auth/providers/credentials';
import { MongoDBAdapter } from '@next-auth/mongodb-adapter';
import bcrypt from 'bcrypt';
import clientPromise from './lib/mongodb';
import User from '../../../models/User';
import db from '../../../utils/db';

db.connectDB();

export const authOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        // username: { label: 'Username', type: 'text', placeholder: 'jsmith' },
        // password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
        const email = credentials.email;
        const password = credentials.password;
        const user = await User.findOne({ email });
        if (user) {
          return SignInUser({ password, user });
        } else {
          throw new Error('This email does not exist.');
        }
      },
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
    Auth0Provider({
      clientId: process.env.AUTH0_CLIENT_ID,
      clientSecret: process.env.AUTH0_CLIENT_SECRET,
      issuer: process.env.AUTH0_ISSUER,
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      let user = await User.findById(token.sub);
      session.user._id = token.sub || user._id.toString();
      session.user.role = user.role || 'user';
      session.user.emailVerified = user.emailVerified;
      return session;
    },
  },
  pages: {
    signIn: '/signin',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.JWT_SECRET,
};

const SignInUser = async ({ password, user }) => {
  if (!user.password) {
    throw new Error('Please enter your password.');
  }
  const testPassword = await bcrypt.compare(password, user.password);
  if (!testPassword) {
    throw new Error('Email or password is wrong!');
  }
  return user;
};

export default NextAuth(authOptions);
