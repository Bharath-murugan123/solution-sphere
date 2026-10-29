
import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(here, "../data");
fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(path.join(dataDir, "solutionsphere.db"));
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'Student',
  college TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS challenges (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  domain TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  deadline TEXT NOT NULL,
  team_size TEXT NOT NULL,
  points INTEGER NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  organization TEXT NOT NULL,
  applicants INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS saved_challenges (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  challenge_id INTEGER NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, challenge_id)
);
CREATE TABLE IF NOT EXISTS applications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  challenge_id INTEGER NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, challenge_id)
);
`);

const count = db.prepare("SELECT COUNT(*) AS count FROM challenges").get().count;
if (count === 0) {
  const seed = [
    [1,"Smart Waste Management System","IoT","Hard","2026-11-30","2-5",500,"Build an AI-powered system to optimize urban waste collection routes and reduce landfill usage.","Smart Cities","Municipal Corporation",134],
    [2,"AI Traffic Optimization","AI/ML","Hard","2026-12-15","3-6",750,"Develop ML models to predict traffic congestion and dynamically adjust signal timings.","Smart Cities","Transport Department",210],
    [3,"Smart Irrigation for Farmers","IoT","Medium","2026-11-25","2-4",400,"Create affordable IoT sensors and an app to help farmers optimize water usage.","Agriculture","Agriculture Ministry",89],
    [4,"Flood Prediction Using AI","AI/ML","Hard","2026-12-10","3-5",650,"Train predictive models on rainfall and terrain data to forecast flood-prone zones.","Climate Tech","Disaster Management",156],
    [5,"Women Safety Monitoring App","Mobile","Medium","2026-11-20","2-5",350,"Build a safety app with SOS features, location sharing and emergency response workflows.","Healthcare","SafeCity NGO",203],
    [6,"Mental Health Support Platform","AI/ML","Medium","2026-12-05","2-4",450,"Create a supportive student wellbeing platform with curated resources and peer support.","Healthcare","Student Wellbeing Network",178],
    [7,"Smart Energy Consumption Tracker","IoT","Medium","2026-12-20","2-4",380,"Build a dashboard that monitors household energy usage and recommends savings.","Renewable Energy","Energy Innovation Group",97],
    [8,"Plastic Pollution Reduction","Sustainability","Easy","2026-11-28","2-6",300,"Design a community app that encourages plastic collection and recycling.","Sustainability","Green Earth NGO",241],
    [9,"Rural Healthcare Accessibility","Mobile","Hard","2026-12-25","3-5",600,"Build an offline-friendly telemedicine platform for low-connectivity communities.","Healthcare","Rural Health Network",122],
    [10,"AI Crop Disease Detection","AI/ML","Medium","2026-12-08","2-4",500,"Train a computer vision model to identify crop diseases from smartphone photos.","Agriculture","Agri Innovation Lab",167],
    [11,"Blockchain Voting System","Blockchain","Hard","2027-01-01","3-6",800,"Prototype a transparent, auditable voting system for controlled demonstration use.","FinTech","Civic Tech Lab",145],
    [12,"Water Quality Monitoring","IoT","Medium","2026-12-12","2-4",420,"Monitor water quality using low-cost sensors and alert operators to unusual readings.","Smart Cities","Water Innovation Group",88],
    [13,"AI-Based Career Guidance","AI/ML","Easy","2026-11-22","1-3",280,"Match student skills and interests to learning paths and career options.","Education","Career Guidance Network",312],
    [14,"Smart Public Transport System","IoT","Hard","2026-12-30","3-6",700,"Create a public transport tracking and route planning prototype.","Smart Cities","Urban Mobility Lab",133],
    [15,"Sustainable Urban Farming","IoT","Medium","2026-12-18","2-5",440,"Design a vertical farm management system with nutrient and yield tracking.","Agriculture","Urban Agriculture Network",76],
    [16,"Digital Education for Rural Students","Education","Easy","2026-11-30","2-4",320,"Build a low-bandwidth learning app with accessible learning resources.","Education","Digital Learning Network",289],
    [17,"Smart Air Pollution Monitoring","IoT","Medium","2026-12-22","2-4",410,"Use low-cost sensors to map local air quality and provide alerts.","Climate Tech","Clean Air Network",104],
    [18,"Elderly Healthcare Assistant","AI/ML","Medium","2026-12-15","2-4",470,"Create a voice-first reminder and family check-in application for older adults.","Healthcare","Community Care Network",91],
    [19,"Renewable Energy Optimization","AI/ML","Hard","2027-01-05","3-5",720,"Predict solar and wind output and support renewable energy planning.","Renewable Energy","Renewable Energy Lab",118],
    [20,"Smart Disaster Response System","AI/ML","Hard","2026-12-28","3-6",680,"Prototype a dashboard that helps coordinate information during disaster response.","Climate Tech","Emergency Response Lab",141]
  ];
  const insert = db.prepare(`INSERT INTO challenges
    (id,title,domain,difficulty,deadline,team_size,points,description,category,organization,applicants)
    VALUES (?,?,?,?,?,?,?,?,?,?,?)`);
  const tx = db.transaction(rows => rows.forEach(row => insert.run(...row)));
  tx(seed);
}

export default db;
