import type { Express, RequestHandler } from "express";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { randomUUID } from "crypto";

interface LocalUser {
  id: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role: 'admin' | 'supervisor' | 'user' | 'operator';
}

const users: LocalUser[] = [
  {
    id: 'validator-supervisor',
    email: 'x@example.com',
    password: 'secret',
    firstName: 'Validador',
    lastName: 'Supervisor',
    role: 'supervisor',
  },
];

export async function setupAuth(app: Express) {
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "secret",
      resave: false,
      saveUninitialized: false,
    })
  );
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(
      { usernameField: "email", passwordField: "password" },
      (email, password, done) => {
        const user = users.find(
          (u) => u.email === email && u.password === password
        );
        if (!user) {
          return done(null, false);
        }
        return done(null, user);
      }
    )
  );

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id: string, done) => {
    const user = users.find((u) => u.id === id);
    done(null, user || false);
  });

  app.post("/api/register", (req, res) => {
    const { email, password, firstName, lastName, role = 'user' } = req.body;
    if (users.some((u) => u.email === email)) {
      return res.status(400).json({ message: "User already exists" });
    }
    const newUser: LocalUser = {
      id: randomUUID(),
      email,
      password,
      firstName,
      lastName,
      role,
    };
    users.push(newUser);
    req.login(newUser, (err) => {
      if (err) {
        return res.status(500).json({ message: "Registration failed" });
      }
      const { password: _pw, ...userWithoutPassword } = newUser;
      res.json(userWithoutPassword);
    });
  });

  app.post("/api/login", passport.authenticate("local"), (req, res) => {
    const user = req.user as LocalUser;
    const { password: _pw, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });

  app.post("/api/logout", (req, res) => {
    req.logout(() => {
      res.json({ message: "Logged out" });
    });
  });

  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect("/login");
    });
  });
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ message: "Unauthorized" });
};

export type { LocalUser };
export { users };
