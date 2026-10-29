
import "dotenv/config";
import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "./db.js";
import { requireAuth } from "./auth.js";

const app = express();
const PORT = Number(process.env.PORT || 4000);
const JWT_SECRET = process.env.JWT_SECRET || "local-development-secret-change-me";

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json({ limit: "1mb" }));

const publicUser = (u) => ({
  id: u.id, name: u.name, email: u.email, role: u.role, college: u.college || ""
});
const tokenFor = (u) => jwt.sign(
  { id: u.id, email: u.email, name: u.name, role: u.role },
  JWT_SECRET,
  { expiresIn: "7d" }
);

app.get("/api/health", (_req, res) => res.json({ ok: true, service: "Solution Sphere API" }));

app.post("/api/auth/register", (req, res) => {
  const { name, email, password, role = "Student", college = "" } = req.body || {};
  if (!name?.trim() || !email?.trim() || !password) {
    return res.status(400).json({ error: "Name, email and password are required." });
  }
  if (password.length < 8) return res.status(400).json({ error: "Password must be at least 8 characters." });
  if (!["Student","Innovator","Recruiter","Industry","Startup","NGO"].includes(role)) {
    return res.status(400).json({ error: "Choose a valid account role." });
  }
  const normalizedEmail = email.trim().toLowerCase();
  if (db.prepare("SELECT id FROM users WHERE email = ?").get(normalizedEmail)) {
    return res.status(409).json({ error: "An account with this email already exists." });
  }
  const passwordHash = bcrypt.hashSync(password, 12);
  const result = db.prepare("INSERT INTO users (name,email,password_hash,role,college) VALUES (?,?,?,?,?)")
    .run(name.trim(), normalizedEmail, passwordHash, role, college.trim());
  const user = db.prepare("SELECT id,name,email,role,college FROM users WHERE id = ?").get(result.lastInsertRowid);
  res.status(201).json({ user: publicUser(user), token: tokenFor(user) });
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body || {};
  if (!email?.trim() || !password) return res.status(400).json({ error: "Email and password are required." });
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email.trim().toLowerCase());
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: "Incorrect email or password." });
  }
  res.json({ user: publicUser(user), token: tokenFor(user) });
});

app.get("/api/auth/me", requireAuth, (req, res) => {
  const user = db.prepare("SELECT id,name,email,role,college FROM users WHERE id = ?").get(req.user.id);
  if (!user) return res.status(404).json({ error: "Account not found." });
  res.json({ user: publicUser(user) });
});

app.get("/api/challenges", (req, res) => {
  const { search = "", domain = "All", difficulty = "All" } = req.query;
  let sql = "SELECT * FROM challenges WHERE 1=1";
  const params = [];
  if (domain !== "All") { sql += " AND (domain = ? OR category = ?)"; params.push(domain, domain); }
  if (difficulty !== "All") { sql += " AND difficulty = ?"; params.push(difficulty); }
  if (search.trim()) {
    sql += " AND (title LIKE ? OR description LIKE ? OR domain LIKE ? OR category LIKE ?)";
    const q = `%${search.trim()}%`; params.push(q,q,q,q);
  }
  sql += " ORDER BY points DESC, title ASC";
  const rows = db.prepare(sql).all(...params).map(c => ({
    id:c.id, title:c.title, domain:c.domain, difficulty:c.difficulty, deadline:c.deadline,
    teamSize:c.team_size, points:c.points, description:c.description, category:c.category,
    organization:c.organization, applicants:c.applicants
  }));
  res.json({ challenges: rows });
});

app.get("/api/me/summary", requireAuth, (req, res) => {
  const saved = db.prepare("SELECT challenge_id FROM saved_challenges WHERE user_id = ?").all(req.user.id).map(r => r.challenge_id);
  const applied = db.prepare("SELECT challenge_id FROM applications WHERE user_id = ?").all(req.user.id).map(r => r.challenge_id);
  res.json({ saved, applied, stats: { savedCount:saved.length, appliedCount:applied.length, points:applied.length * 100 } });
});

app.post("/api/challenges/:id/save", requireAuth, (req, res) => {
  const challengeId = Number(req.params.id);
  if (!db.prepare("SELECT id FROM challenges WHERE id = ?").get(challengeId)) return res.status(404).json({ error: "Challenge not found." });
  const existing = db.prepare("SELECT 1 FROM saved_challenges WHERE user_id = ? AND challenge_id = ?").get(req.user.id, challengeId);
  if (existing) {
    db.prepare("DELETE FROM saved_challenges WHERE user_id = ? AND challenge_id = ?").run(req.user.id, challengeId);
    return res.json({ saved: false });
  }
  db.prepare("INSERT INTO saved_challenges (user_id,challenge_id) VALUES (?,?)").run(req.user.id, challengeId);
  res.json({ saved: true });
});

app.post("/api/challenges/:id/apply", requireAuth, (req, res) => {
  const challengeId = Number(req.params.id);
  if (!db.prepare("SELECT id FROM challenges WHERE id = ?").get(challengeId)) return res.status(404).json({ error: "Challenge not found." });
  try {
    db.prepare("INSERT INTO applications (user_id,challenge_id) VALUES (?,?)").run(req.user.id, challengeId);
    db.prepare("UPDATE challenges SET applicants = applicants + 1 WHERE id = ?").run(challengeId);
    res.status(201).json({ applied: true });
  } catch (err) {
    if (String(err).includes("UNIQUE")) return res.status(409).json({ error: "You have already applied to this challenge." });
    throw err;
  }
});

app.get("/api/achievements", requireAuth, (req, res) => {
  const appliedCount = db.prepare("SELECT COUNT(*) AS n FROM applications WHERE user_id = ?").get(req.user.id).n;
  const savedCount = db.prepare("SELECT COUNT(*) AS n FROM saved_challenges WHERE user_id = ?").get(req.user.id).n;
  res.json({ achievements: [
    { title:"First Application", description:"Apply to your first challenge", earned:appliedCount >= 1, icon:"" },
    { title:"Challenge Explorer", description:"Save three challenges", earned:savedCount >= 3, icon:"" },
    { title:"Problem Solver", description:"Apply to five challenges", earned:appliedCount >= 5, icon:"" },
    { title:"Innovation Starter", description:"Create your Solution Sphere account", earned:true, icon:"" }
  ]});
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Unexpected server error. Check the server terminal for details." });
});

app.listen(PORT, () => console.log(`Solution Sphere API running at http://localhost:${PORT}`));
