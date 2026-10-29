
import { useEffect, useMemo, useState } from "react";
import { request, getToken } from "./api";

const domains = ["All","AI/ML","IoT","Smart Cities","Agriculture","Healthcare","Sustainability","FinTech","Education","Climate Tech","Renewable Energy","Blockchain","Mobile"];
const roles = ["Student","Innovator","Recruiter","Industry","Startup","NGO"];
const icons = {};
const initialAchievements = [
  {title:"First application",description:"Apply to your first challenge"},
  {title:"Challenge explorer",description:"Save three challenges"},
  {title:"Problem solver",description:"Apply to five challenges"},
  {title:"Profile created",description:"Create your account"}
];

export default function App() {
  const [page,setPage] = useState("home");
  const [user,setUser] = useState(null);
  const [authMode,setAuthMode] = useState("register");
  const [authForm,setAuthForm] = useState({name:"",email:"",password:"",role:"Student",college:""});
  const [challenges,setChallenges] = useState([]);
  const [saved,setSaved] = useState([]);
  const [applied,setApplied] = useState([]);
  const [domain,setDomain] = useState("All");
  const [difficulty,setDifficulty] = useState("All");
  const [search,setSearch] = useState("");
  const [notice,setNotice] = useState("");
  const [error,setError] = useState("");
  const [loading,setLoading] = useState(false);
  const [dark,setDark] = useState(false);
  const [achievements,setAchievements] = useState(initialAchievements);

  const flash = (message) => { setNotice(message); window.setTimeout(()=>setNotice(""),2800); };
  const fail = (err) => setError(err.message || "Something went wrong.");

  async function loadChallenges() {
    try {
      const params = new URLSearchParams({search,domain,difficulty});
      const data = await request(`/challenges?${params}`);
      setChallenges(data.challenges);
    } catch (err) { fail(err); }
  }
  async function loadAccount() {
    if (!getToken()) return;
    try {
      const [me,summary,ach] = await Promise.all([
        request("/auth/me"),request("/me/summary"),request("/achievements")
      ]);
      setUser(me.user); setSaved(summary.saved); setApplied(summary.applied); setAchievements(ach.achievements);
      setPage("dashboard");
    } catch { localStorage.removeItem("ss_token"); }
  }
  useEffect(()=>{ loadChallenges(); },[search,domain,difficulty]);
  useEffect(()=>{ loadAccount(); },[]);

  async function submitAuth(e) {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      const endpoint = authMode === "register" ? "/auth/register" : "/auth/login";
      const payload = authMode === "register" ? authForm : {email:authForm.email,password:authForm.password};
      const data = await request(endpoint,{method:"POST",body:JSON.stringify(payload)});
      localStorage.setItem("ss_token",data.token); setUser(data.user);
      const summary = await request("/me/summary");
      setSaved(summary.saved); setApplied(summary.applied);
      const ach = await request("/achievements"); setAchievements(ach.achievements);
      setPage("dashboard"); flash(authMode === "register" ? "Account created successfully!" : "Welcome back!");
    } catch(err) { fail(err); } finally { setLoading(false); }
  }
  async function toggleSave(id) {
    if (!user) { setAuthMode("login"); setPage("auth"); return; }
    try {
      const data = await request(`/challenges/${id}/save`,{method:"POST"});
      setSaved(old=>data.saved ? [...old,id] : old.filter(x=>x!==id));
      flash(data.saved ? "Challenge saved." : "Challenge removed from saved.");
    } catch(err) { fail(err); }
  }
  async function apply(id) {
    if (!user) { setAuthMode("login"); setPage("auth"); return; }
    try {
      await request(`/challenges/${id}/apply`,{method:"POST"});
      setApplied(old=>[...old,id]); flash("Application submitted!");
      await loadChallenges();
      const ach = await request("/achievements"); setAchievements(ach.achievements);
    } catch(err) { fail(err); }
  }
  function signOut() {
    localStorage.removeItem("ss_token"); setUser(null); setSaved([]); setApplied([]);
    setPage("home"); flash("Signed out.");
  }

  const featured = useMemo(()=>challenges.slice(0,3),[challenges]);
  const myChallenges = challenges.filter(c=>applied.includes(c.id));
  const savedChallenges = challenges.filter(c=>saved.includes(c.id));

  return <div className={dark ? "app dark" : "app light"}>
    <header className="topbar">
      
<button className="brand" onClick={()=>setPage(user?"dashboard":"home")}>
  <span className="brand-icon" aria-hidden="true">
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="2"/>
      <path d="M12 15L24 24L37 15M12 35L24 24L37 35" stroke="#36A7A0" strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx="24" cy="24" r="6" fill="currentColor"/>
      <circle cx="12" cy="15" r="4" fill="#36A7A0"/>
      <circle cx="37" cy="15" r="4" fill="#36A7A0"/>
      <circle cx="12" cy="35" r="4" fill="#36A7A0"/>
      <circle cx="37" cy="35" r="4" fill="#36A7A0"/>
    </svg>
  </span>
  <span className="brand-name">Solution <span>Sphere</span></span>
</button>

      <nav className="top-actions">
        {user ? <>
          <button className="nav-link" onClick={()=>setPage("dashboard")}>Dashboard</button>
          <button className="nav-link" onClick={()=>setPage("challenges")}>Challenges</button>
          <button className="nav-link" onClick={()=>setPage("saved")}>Saved ({saved.length})</button>
          <button className="theme-btn" onClick={()=>setDark(!dark)} aria-label="Toggle theme">{dark?"Light mode":"Dark mode"}</button>
          <button className="avatar" onClick={()=>setPage("profile")}>{user.name.split(/\s+/).map(x=>x[0]).slice(0,2).join("").toUpperCase()}</button>
          <button className="btn btn-ghost" onClick={signOut}>Sign out</button>
        </> : <>
          <button className="nav-link" onClick={()=>{setAuthMode("login");setPage("auth");}}>Sign in</button>
          <button className="btn btn-primary" onClick={()=>{setAuthMode("register");setPage("auth");}}>Join now</button>
        </>}
      </nav>
    </header>

    {notice && <div className="toast success">{notice}</div>}
    {error && <div className="toast error"><span>{error}</span><button onClick={()=>setError("")}>×</button></div>}

    {page==="home" && <main>
      <section className="hero">
        <div className="eyebrow">OPEN INNOVATION PLATFORM</div>
        <h1>Good ideas need<br/><span>room to grow.</span></h1>
        <p>Solution Sphere connects students, innovators, professionals, and organisations around real-world problem statements. Discover challenges, contribute solutions, and make practical work visible.</p>
        <div className="hero-actions">
          <button className="btn btn-primary btn-large" onClick={()=>{setAuthMode("register");setPage("auth");}}>Create an account</button>
          <button className="btn btn-ghost btn-large" onClick={()=>setPage("challenges")}>Browse challenges</button>
        </div>
        <div className="hero-note"><span className="hero-note-mark"></span><span>A working space for problem statements, teams, and early-stage solutions.</span></div>
        <div className="hero-orb orb-one"></div><div className="hero-orb orb-two"></div>
      </section>
      <section className="section">
        <div className="section-heading"><div><p className="eyebrow">CURRENT OPPORTUNITIES</p><h2>Challenges to explore</h2></div><button className="text-button" onClick={()=>setPage("challenges")}>Browse all</button></div>
        <div className="challenge-grid">{featured.map(c=><ChallengeCard key={c.id} c={c} saved={saved.includes(c.id)} applied={applied.includes(c.id)} onSave={toggleSave} onApply={apply}/>)}</div>
      </section>
      <section className="section feature-section">
        <p className="eyebrow">HOW IT WORKS</p><h2>From problem statement to practical solution</h2>
        <div className="feature-grid">
          <Feature title="Explore a brief" desc="Review the problem, domain, timeline, and team requirements before committing."/>
          <Feature title="Find your next step" desc="Save opportunities and keep your applications organised in one place."/>
          <Feature title="Work with others" desc="Connect with people who bring different skills and perspectives to a shared problem."/>
        </div>
      </section>
    </main>}

    {page==="auth" && <main className="auth-wrap"><form className="auth-card" onSubmit={submitAuth}>
      <div className="auth-logo">S</div><p className="eyebrow">{authMode==="register"?"START YOUR JOURNEY":"WELCOME BACK"}</p>
      <h1>{authMode==="register"?"Create your account":"Sign in"}</h1><p className="muted">{authMode==="register"?"Create a profile to track challenges, document your interests, and participate in problem-solving.":"Continue exploring challenges and opportunities."}</p>
      {authMode==="register" && <>
        <label>Full name<input required value={authForm.name} onChange={e=>setAuthForm({...authForm,name:e.target.value})} placeholder="Your name"/></label>
        <label>Role<select value={authForm.role} onChange={e=>setAuthForm({...authForm,role:e.target.value})}>{roles.map(r=><option key={r}>{r}</option>)}</select></label>
        <label>College or organization (optional)<input value={authForm.college} onChange={e=>setAuthForm({...authForm,college:e.target.value})} placeholder="Your college"/></label>
      </>}
      <label>Email address<input required type="email" value={authForm.email} onChange={e=>setAuthForm({...authForm,email:e.target.value})} placeholder="you@example.com"/></label>
      <label>Password<input required minLength={authMode==="register"?8:1} type="password" value={authForm.password} onChange={e=>setAuthForm({...authForm,password:e.target.value})} placeholder={authMode==="register"?"At least 8 characters":"Your password"}/></label>
      <button className="btn btn-primary btn-full btn-large" disabled={loading}>{loading?"Please wait…":authMode==="register"?"Create account →":"Sign in →"}</button>
      <p className="auth-switch">{authMode==="register"?"Already have an account?":"New to Solution Sphere?"} <button type="button" onClick={()=>{setError("");setAuthMode(authMode==="register"?"login":"register");}}>{authMode==="register"?"Sign in":"Create account"}</button></p>
      <button type="button" className="text-button" onClick={()=>setPage("home")}>← Back to home</button>
    </form></main>}

    {page==="challenges" && <main className="page-wrap">
      <div className="page-title"><div><p className="eyebrow">OPEN OPPORTUNITIES</p><h1>Browse challenges</h1><p className="muted">{challenges.length} matching challenges · {applied.length} applications from your account</p></div></div>
      <div className="filters"><input aria-label="Search" placeholder="Search title, domain or description…" value={search} onChange={e=>setSearch(e.target.value)}/><select value={domain} onChange={e=>setDomain(e.target.value)}>{domains.map(d=><option key={d}>{d}</option>)}</select><select value={difficulty} onChange={e=>setDifficulty(e.target.value)}>{["All","Easy","Medium","Hard"].map(d=><option key={d}>{d}</option>)}</select><button className="btn btn-ghost" onClick={()=>{setSearch("");setDomain("All");setDifficulty("All");}}>Clear</button></div>
      {challenges.length ? <div className="challenge-grid">{challenges.map(c=><ChallengeCard key={c.id} c={c} saved={saved.includes(c.id)} applied={applied.includes(c.id)} onSave={toggleSave} onApply={apply}/>)}</div> : <div className="empty-state"><h2>No matching challenges</h2><p>Try changing your search or filters.</p></div>}
    </main>}

    {page==="dashboard" && <main className="page-wrap">
      <div className="page-title"><div><p className="eyebrow">OVERVIEW</p><h1>Welcome back, {user?.name?.split(" ")[0]}</h1><p className="muted">Review your activity and continue where you left off.</p></div><button className="btn btn-primary" onClick={()=>setPage("challenges")}>Explore challenges →</button></div>
      <div className="metric-grid"><Metric label="Applications" value={applied.length}/><Metric label="Saved challenges" value={saved.length}/><Metric label="Achievements earned" value={achievements.filter(a=>a.earned).length}/></div>
      <div className="dashboard-columns"><section className="panel"><div className="section-heading"><h2>Your applications</h2><button className="text-button" onClick={()=>setPage("challenges")}>Find more →</button></div>{myChallenges.length?myChallenges.map(c=><div className="list-row" key={c.id}><div className="domain-icon" aria-hidden="true">{c.domain.slice(0,2).toUpperCase()}</div><div className="grow"><strong>{c.title}</strong><p className="muted">{c.domain} · {c.difficulty}</p></div><span className="status-pill">Applied</span></div>):<div className="empty-inline">You haven't applied to any challenges yet. <button className="text-button" onClick={()=>setPage("challenges")}>Explore challenges</button></div>}</section>
      <section className="panel"><h2>Getting started</h2><div className="step-row"><span>1</span><div><strong>Explore a challenge</strong><p className="muted">Find a problem that interests you.</p></div></div><div className="step-row"><span>2</span><div><strong>Save or apply</strong><p className="muted">Keep track of your opportunities.</p></div></div><div className="step-row"><span>3</span><div><strong>Show your work</strong><p className="muted">Use your profile to document skills, contributions, and completed work.</p></div></div></section></div>
    </main>}

    {page==="saved" && <main className="page-wrap"><div className="page-title"><div><p className="eyebrow">YOUR BOOKMARKS</p><h1>Saved challenges</h1><p className="muted">Challenges you want to revisit.</p></div></div>{savedChallenges.length?<div className="challenge-grid">{savedChallenges.map(c=><ChallengeCard key={c.id} c={c} saved applied={applied.includes(c.id)} onSave={toggleSave} onApply={apply}/>)}</div>:<div className="empty-state"><h2>No saved challenges yet</h2><p>Save interesting challenges to find them here.</p><button className="btn btn-primary" onClick={()=>setPage("challenges")}>Browse challenges</button></div>}</main>}

    {page==="profile" && <main className="page-wrap"><div className="profile-hero"><div className="profile-avatar">{user?.name?.split(/\s+/).map(x=>x[0]).slice(0,2).join("").toUpperCase()}</div><div><p className="eyebrow">YOUR PROFILE</p><h1>{user?.name}</h1><p className="muted">{user?.role} · {user?.college || "College not provided"}</p><p className="muted">{user?.email}</p></div></div><div className="metric-grid"><Metric label="Applications" value={applied.length}/><Metric label="Saved challenges" value={saved.length}/></div><section className="panel achievement-panel"><h2>Achievements</h2><div className="achievement-grid">{achievements.map(a=><div className={`achievement ${a.earned?"earned":""}`} key={a.title}><span className="achievement-mark" aria-hidden="true">{a.earned ? "✓" : "—"}</span><strong>{a.title}</strong><p className="muted">{a.description || a.desc}</p><small>{a.earned?"✓ Earned":"Not yet earned"}</small></div>)}</div></section></main>}

    <footer className="footer"><strong>Solution Sphere</strong><p>Real-world problems. Practical solutions. Shared recognition.</p><small>Prototype edition · Challenge listings use sample data</small></footer>
  </div>;
}

function ChallengeCard({c,saved,applied,onSave,onApply}) {
  const color = c.difficulty==="Easy"?"green":c.difficulty==="Medium"?"yellow":"red";
  return <article className="challenge-card">
    <div className="card-tags"><span className="tag">{c.domain}</span><span className={`tag difficulty ${color}`}>{c.difficulty}</span></div>
    <h3>{c.title}</h3><p className="description">{c.description}</p>
    <div className="challenge-meta"><span>Deadline: {c.deadline}</span><span>Team: {c.teamSize}</span><span>{c.applicants} sample applications</span></div>
    <div className="card-bottom"><span className="muted card-category">{c.category}</span><div className="card-buttons"><button className={`icon-btn ${saved?"selected":""}`} title={saved?"Remove saved challenge":"Save challenge"} onClick={()=>onSave(c.id)}>{saved?"Saved":"Save"}</button><button className="btn btn-primary btn-small" disabled={applied} onClick={()=>onApply(c.id)}>{applied?"✓ Applied":"Apply now"}</button></div></div>
    <div className="card-org">Posted by {c.organization} · {c.category}</div>
  </article>;
}
function Feature({title,desc}) { return <article className="feature-card"><h3>{title}</h3><p>{desc}</p></article>; }
function Metric({label,value}) { return <article className="metric"><strong>{value}</strong><p>{label}</p></article>; }
