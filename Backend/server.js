const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");
const axios = require("axios");
require('dotenv').config();

const app = express();
const PORT = 5000;

// Avoid stale assets during local development.
// In production you can set NODE_ENV=production and handle caching separately.
const IS_PROD = process.env.NODE_ENV === 'production';

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://api.emailjs.com"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.emailjs.com"],
      fontSrc: ["'self'"],
    },
  },
}));
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100,
});
app.use(limiter);

// Serve static files from Frontend folder
app.disable('etag');
app.use(express.static(path.join(__dirname, '../Frontend'), {
  etag: false,
  lastModified: false,
  setHeaders: (res) => {
    if (!IS_PROD) {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.setHeader('Surrogate-Control', 'no-store');
    }
  }
}));

// Load projects from JSON
const projectsFile = path.join(__dirname, "projects.json");
let projects = {};
try {
  const data = fs.readFileSync(projectsFile, "utf8");
  projects = JSON.parse(data);
} catch (err) {
  console.error("Error reading projects.json:", err);
}

// Routes
app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.get("/api/projects", (req, res) => {
  res.json(projects);
});

app.get("/api/projects/:id", (req, res) => {
  const project = projects[req.params.id];
  if (!project) return res.status(404).json({ error: "Project not found" });
  res.json(project);
});

// GitHub API endpoints
app.get("/api/github/stats", async (req, res) => {
  try {
    const username = "nasicbadar"; // Replace with actual GitHub username

    const githubHeaders = {
      'User-Agent': 'secure-portfolio',
      'Accept': 'application/vnd.github+json'
    };

    if (process.env.GITHUB_TOKEN && process.env.GITHUB_TOKEN !== 'YOUR_GITHUB_TOKEN') {
      githubHeaders.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    const [userRes, reposRes] = await Promise.all([
      axios.get(`https://api.github.com/users/${username}`, { headers: githubHeaders }),
      axios.get(`https://api.github.com/users/${username}/repos?per_page=100`, { headers: githubHeaders })
    ]);

    const user = userRes.data;
    const repos = reposRes.data;

    const stats = {
      followers: user.followers,
      following: user.following,
      publicRepos: user.public_repos,
      totalStars: repos.reduce((sum, repo) => sum + repo.stargazers_count, 0),
      totalForks: repos.reduce((sum, repo) => sum + repo.forks_count, 0),
      languages: {},
      recentActivity: repos
        .filter(repo => !repo.fork)
        .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
        .slice(0, 5)
        .map(repo => ({
          name: repo.name,
          description: repo.description,
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          language: repo.language,
          updatedAt: repo.updated_at,
          url: repo.html_url
        }))
    };

    // Count languages
    repos.forEach(repo => {
      if (repo.language) {
        stats.languages[repo.language] = (stats.languages[repo.language] || 0) + 1;
      }
    });

    res.json(stats);
  } catch (error) {
    const status = error?.response?.status;
    const apiMessage = error?.response?.data?.message;
    console.error("GitHub API error:", { status, message: error.message, apiMessage });

    // Return a safe fallback payload so the UI continues to work without noisy console errors.
    // You still get details in the server console logs above.
    const fallback = {
      followers: 0,
      following: 0,
      publicRepos: 0,
      totalStars: 0,
      totalForks: 0,
      languages: {},
      recentActivity: [],
      meta: {
        source: 'fallback',
        upstreamStatus: status || null,
        upstreamMessage: typeof apiMessage === 'string' ? apiMessage : null
      }
    };

    return res.status(200).json(fallback);
  }
});

app.get("/api/github/contributions", async (req, res) => {
  try {
    // GitHub doesn't provide contribution data via API for security reasons
    // We'll return mock data for demonstration
    const contributions = [];
    const today = new Date();

    for (let i = 364; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      // Generate realistic contribution pattern
      let count = 0;
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      if (!isWeekend) {
        // Workdays have higher activity
        count = Math.floor(Math.random() * 8) + 1;
      } else {
        // Weekends have lower activity
        count = Math.floor(Math.random() * 3);
      }

      contributions.push({
        date: date.toISOString().split('T')[0],
        count: count
      });
    }

    res.json({ contributions });
  } catch (error) {
    console.error("Contributions API error:", error.message);
    res.status(500).json({ error: "Failed to fetch contributions" });
  }
});

// Contact form endpoint
app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if email credentials are configured (not placeholder values)
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS ||
        process.env.EMAIL_USER === 'your-email@gmail.com' ||
        process.env.EMAIL_PASS === 'your-16-character-app-password') {
      console.log('New contact form submission (email not configured):');
      console.log(`From: ${name} <${email}>`);
      console.log(`Subject: ${subject}`);
      console.log(`Message: ${message}`);
      console.log('---');

      return res.json({
        success: true,
        message: "Message received! (Email sending not configured - check server console)",
        note: "Configure EMAIL_USER and EMAIL_PASS in .env file to enable email sending"
      });
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Email options
    const mailOptions = {
      from: `"${name}" <${process.env.EMAIL_USER}>`, // Send from your email
      to: process.env.EMAIL_TO || process.env.EMAIL_USER, // Send to your email
      replyTo: email, // Allow replying to the sender
      subject: `Portfolio Contact: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #22c55e;">New Contact Form Message</h2>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong></p>
            <div style="background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #22c55e;">
              ${message.replace(/\n/g, '<br>')}
            </div>
          </div>
          <p style="color: #666; font-size: 12px;">This message was sent from your portfolio contact form.</p>
        </div>
      `
    };

    // Send email
    await transporter.sendMail(mailOptions);

    console.log(`✅ Email sent successfully from ${name} (${email}) to ${process.env.EMAIL_TO || process.env.EMAIL_USER}`);
    res.json({
      success: true,
      message: "Message sent successfully! I'll get back to you soon."
    });

  } catch (error) {
    console.error("❌ Error sending email:", error);
    res.status(500).json({
      error: "Failed to send email",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
