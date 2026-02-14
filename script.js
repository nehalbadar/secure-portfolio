function renderThemeIconSvg(theme) {
    // Uses currentColor so icon color follows --accent-color
    if (theme === 'light') {
        // Sun
        return `
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
                <circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="2" />
                <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M19.78 4.22l-2.12 2.12M6.34 17.66l-2.12 2.12" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            </svg>
        `.trim();
    }

    if (theme === 'blue') {
        // Droplet
        return `
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
                <path d="M12 2s6 6.2 6 12a6 6 0 11-12 0c0-5.8 6-12 6-12z" stroke="currentColor" stroke-width="2" stroke-linejoin="round" />
            </svg>
        `.trim();
    }

    // Default: dark (moon)
    return `
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
            <path d="M21 14.5A8.5 8.5 0 0110.5 3a6.5 6.5 0 1010.5 11.5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
    `.trim();
}

document.addEventListener('DOMContentLoaded', () => {
    // Show page loading animation
    showPageLoading();

    // Hide loading after content loads
    window.addEventListener('load', () => {
        setTimeout(() => {
            hidePageLoading();
        }, 500);
    });

    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = themeToggle ? themeToggle.querySelector('.theme-icon') : null;

    const themes = ['dark', 'light', 'blue'];

    // Load saved theme preference
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const currentIndex = themes.indexOf(currentTheme);
            const newIndex = (currentIndex + 1) % themes.length;
            const newTheme = themes[newIndex];

            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcon(newTheme);
        });
    } else {
        console.error('Theme toggle button not found');
    }

    function updateThemeIcon(theme) {
        if (themeIcon) {
            themeIcon.innerHTML = renderThemeIconSvg(theme);
        }
    }

    // Hamburger menu functionality
    const hamburgerMenu = document.getElementById('hamburger-menu');
    const navLinks = document.querySelector('.nav-links');

    if (hamburgerMenu && navLinks) {
        hamburgerMenu.addEventListener('click', () => {
            // Add a subtle bounce effect
            hamburgerMenu.style.transform = 'scale(0.95)';
            setTimeout(() => {
                hamburgerMenu.style.transform = '';
            }, 150);

            const isActive = hamburgerMenu.classList.contains('active');
            if (isActive) {
                // Closing animation - fade out
                navLinks.style.opacity = '0';
                setTimeout(() => {
                    hamburgerMenu.classList.remove('active');
                    navLinks.classList.remove('active');
                    navLinks.style.opacity = '';
                }, 300);
            } else {
                // Opening animation
                hamburgerMenu.classList.add('active');
                navLinks.classList.add('active');
            }
        });

        // Close menu when clicking on a link
        navLinks.addEventListener('click', (e) => {
            if (e.target.tagName === 'A') {
                // Smooth fade out animation
                navLinks.style.opacity = '0';
                setTimeout(() => {
                    hamburgerMenu.classList.remove('active');
                    navLinks.classList.remove('active');
                    navLinks.style.opacity = '';
                }, 300);
            }
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!hamburgerMenu.contains(e.target) && !navLinks.contains(e.target) && navLinks.classList.contains('active')) {
                // Smooth fade out animation
                navLinks.style.opacity = '0';
                setTimeout(() => {
                    hamburgerMenu.classList.remove('active');
                    navLinks.classList.remove('active');
                    navLinks.style.opacity = '';
                }, 300);
            }
        });
    }

    // Page-specific functionality
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    if (currentPage === 'projects.html') {
        loadProjects();
    } else if (currentPage === 'project-detail.html') {
        loadProjectDetail();
    } else if (currentPage === 'skills.html') {
        animateSkillBars();
    } else if (currentPage === 'index.html' || currentPage === '') {
        loadGitHubStats();
        loadFeaturedProjects();
    }

    // Skills animation
    function animateSkillBars() {
        const skillBars = document.querySelectorAll('.skill-progress');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const bar = entry.target;
                    const width = bar.style.width;
                    bar.style.width = '0';
                    setTimeout(() => {
                        bar.style.width = width;
                    }, 100);
                }
            });
        }, { threshold: 0.5 });

        skillBars.forEach(bar => observer.observe(bar));
    }

    // Contact form (works on all pages that have the form)
    const form = document.getElementById('contactForm');
    if (form) {
        console.log('Contact form found, adding event listener');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Get form data
            const formData = {
                name: form.querySelector('input[name="name"]').value.trim(),
                email: form.querySelector('input[name="email"]').value.trim(),
                subject: form.querySelector('input[name="subject"]').value.trim(),
                message: form.querySelector('textarea[name="message"]').value.trim()
            };

            // Basic validation
            if (!formData.name || !formData.email || !formData.subject || !formData.message) {
                showNotification('Please fill in all fields.', 'error');
                return;
            }

            if (!isValidEmail(formData.email)) {
                showNotification('Please enter a valid email address.', 'error');
                return;
            }

            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;

            // Show loading state
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="loading-spinner"></span>Sending...';

            try {
                await sendEmail(formData);

                // Show success overlay animation
                showSuccessOverlay();
                form.reset();

            } catch (error) {
                console.error('Error sending email:', error);
                showNotification('Failed to send message. Please try again later.', 'error');
            } finally {
                // Reset button
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        });
    }

    // Email validation helper
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Email sending function using backend API
    async function sendEmail(formData) {
        try {
            const response = await fetch(`${API_BASE}/contact`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const result = await response.json();
            console.log('Email sent successfully via backend API');
            return result;
        } catch (error) {
            console.error('Backend email API failed:', error);
            throw new Error('Failed to send email. Please try again later.');
        }
    }

    // Notification system
    function showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => notification.remove());

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;

        // Add to page
        document.body.appendChild(notification);

        // Show notification
        setTimeout(() => notification.classList.add('show'), 100);

        // Hide and remove after 5 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    // Success overlay animation
    function showSuccessOverlay() {
        const overlay = document.querySelector('.success-overlay');
        if (overlay) {
            overlay.classList.add('show');

            // Auto-hide after 5 seconds
            setTimeout(() => {
                hideSuccessOverlay();
            }, 5000);
        }
    }

    function hideSuccessOverlay() {
        const overlay = document.querySelector('.success-overlay');
        if (overlay) {
            overlay.classList.remove('show');
        }
    }

    // Add event listener for success overlay close button
    const closeBtn = document.querySelector('.success-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', hideSuccessOverlay);
    }

    // Close overlay when clicking outside
    const overlay = document.querySelector('.success-overlay');
    if (overlay) {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                hideSuccessOverlay();
            }
        });
    }
});

// API base URL
// - When served by the backend (same origin), use relative `/api`.
// - During local dev when the frontend is served separately (e.g., Live Server on 5500), fall back to localhost:5000.
const API_BASE = (() => {
    try {
        const { hostname, port, protocol } = window.location;

        // If the frontend is being served by the Express backend on port 5000, keep it same-origin.
        if ((hostname === 'localhost' || hostname === '127.0.0.1') && port === '5000') {
            return '/api';
        }

        // If running locally but not on the backend origin, call the backend directly.
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return 'http://localhost:5000/api';
        }

        // For production deployments where frontend + backend share an origin.
        if (protocol === 'http:' || protocol === 'https:') {
            return '/api';
        }
    } catch (_) {
        // Ignore and fall back.
    }

    return 'http://localhost:5000/api';
})();

// Global variable to store projects data
let allProjects = [];

// Function to load featured projects (homepage)
async function loadFeaturedProjects() {
    const container = document.getElementById('featured-projects-container');
    if (!container) return;

    try {
        const response = await fetch(`${API_BASE}/projects`);
        const projects = await response.json();

        const featured = Object.keys(projects)
            .map(key => ({ id: key, ...projects[key] }))
            .filter(p => p && p.featured)
            .slice(0, 3);

        container.innerHTML = '';

        if (featured.length === 0) {
            container.innerHTML = '<p style="text-align:center; color: var(--muted-text);">Featured projects coming soon.</p>';
            return;
        }

        featured.forEach(project => {
            const projectCard = document.createElement('div');
            projectCard.className = 'project-card';
            projectCard.innerHTML = `
                <div class="card-content">
                    <h2>${project.title}</h2>
                    <p>${project.description}</p>
                    <div class="project-tech">
                        ${(project.stack || []).slice(0, 6).map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
                    </div>
                </div>
            `;

            projectCard.addEventListener('click', () => {
                window.location.href = `project-detail.html?id=${project.id}`;
            });

            container.appendChild(projectCard);
        });
    } catch (error) {
        console.error('Error loading featured projects:', error);
        container.innerHTML = '<p style="text-align:center; color: var(--muted-text);">Unable to load featured projects.</p>';
    }
}

// Function to load projects
async function loadProjects() {
    const container = document.getElementById('projects-container');

    // Show skeleton loading
    container.innerHTML = `
        <div class="skeleton-card">
            <div class="skeleton skeleton-text"></div>
            <div class="skeleton skeleton-text"></div>
            <div class="skeleton skeleton-text"></div>
        </div>
        <div class="skeleton-card">
            <div class="skeleton skeleton-text"></div>
            <div class="skeleton skeleton-text"></div>
            <div class="skeleton skeleton-text"></div>
        </div>
        <div class="skeleton-card">
            <div class="skeleton skeleton-text"></div>
            <div class="skeleton skeleton-text"></div>
            <div class="skeleton skeleton-text"></div>
        </div>
    `;

    try {
        const response = await fetch(`${API_BASE}/projects`);
        const projects = await response.json();

        // Store projects data globally
        allProjects = Object.keys(projects).map(key => ({
            id: key,
            ...projects[key]
        }));

        // Display all projects initially
        displayProjects(allProjects);

    } catch (error) {
        console.error('Error loading projects:', error);
        document.getElementById('projects-container').innerHTML = '<p>Error loading projects</p>';
    }
}

// Function to display projects
function displayProjects(projects) {
    const container = document.getElementById('projects-container');
    const noResults = document.getElementById('no-results');

    container.innerHTML = '';

    if (projects.length === 0) {
        noResults.style.display = 'block';
        return;
    }

    noResults.style.display = 'none';

    projects.forEach(project => {
        const projectCard = document.createElement('div');
        projectCard.className = 'project-card';
        projectCard.innerHTML = `
            <div class="card-content">
                <h2>${project.title}</h2>
                <p>${project.description}</p>
                <div class="project-tech">
                    ${project.stack.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
                </div>
            </div>
        `;
        projectCard.addEventListener('click', () => {
            window.location.href = `project-detail.html?id=${project.id}`;
        });
        container.appendChild(projectCard);
    });
}

// Function to filter projects
function filterProjects(searchTerm = '', category = 'all') {
    let filteredProjects = allProjects;

    // Filter by search term
    if (searchTerm) {
        filteredProjects = filteredProjects.filter(project =>
            project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            project.stack.some(tech => tech.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }

    // Filter by category
    if (category !== 'all') {
        filteredProjects = filteredProjects.filter(project => {
            const domain = project.domain.toLowerCase();
            switch (category) {
                case 'web':
                    return domain.includes('web') || project.stack.some(tech =>
                        ['html', 'css', 'javascript', 'react', 'vue', 'angular', 'node', 'express'].includes(tech.toLowerCase())
                    );
                case 'data':
                    return domain.includes('data') || project.stack.some(tech =>
                        ['python', 'pandas', 'numpy', 'scikit-learn', 'tensorflow', 'machine learning'].includes(tech.toLowerCase())
                    );
                case 'security':
                    return domain.includes('security') || project.stack.some(tech =>
                        ['security', 'encryption', 'penetration testing'].includes(tech.toLowerCase())
                    );
                case 'mobile':
                    return domain.includes('mobile') || project.stack.some(tech =>
                        ['react native', 'flutter', 'ios', 'android'].includes(tech.toLowerCase())
                    );
                default:
                    return true;
            }
        });
    }

    displayProjects(filteredProjects);
}

// Function to load project detail
async function loadProjectDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (!id) {
        document.getElementById('project-detail').innerHTML = '<p>Project not found</p>';
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/projects/${id}`);
        if (!response.ok) {
            throw new Error('Project not found');
        }
        const project = await response.json();

        // Create comprehensive case study HTML
        const caseStudyHTML = project.caseStudy ? `
            <!-- Project Header -->
            <div class="project-header">
                <a href="projects.html" class="back-link">← Back to Projects</a>
                <div class="project-meta">
                    <h1 class="project-title">${project.title}</h1>
                    <p class="project-domain">${project.domain}</p>
                    <div class="project-tech-stack">
                        ${project.stack.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
                    </div>
                </div>
            </div>

            <!-- Project Overview -->
            <section class="case-study-section">
                <h2>Project Overview</h2>
                <p class="project-description">${project.description}</p>
                <p class="case-study-overview">${project.caseStudy.overview}</p>
            </section>

            <!-- Challenge & Solution -->
            <div class="challenge-solution-grid">
                <section class="case-study-section challenge">
                    <h2>🎯 Challenge</h2>
                    <p>${project.caseStudy.challenge}</p>
                </section>
                <section class="case-study-section solution">
                    <h2>💡 Solution</h2>
                    <p>${project.caseStudy.solution}</p>
                </section>
            </div>

            <!-- Architecture -->
            <section class="case-study-section">
                <h2>🏗️ Architecture & Design</h2>
                <div class="architecture-grid">
                    ${Object.entries(project.caseStudy.architecture).map(([key, value]) => `
                        <div class="architecture-item">
                            <h3>${key.charAt(0).toUpperCase() + key.slice(1)}</h3>
                            <p>${value}</p>
                        </div>
                    `).join('')}
                </div>
            </section>

            <!-- Key Features -->
            <section class="case-study-section">
                <h2>✨ Key Features</h2>
                <div class="features-grid">
                    ${project.caseStudy.features.map(feature => `
                        <div class="feature-item">
                            <span class="feature-icon">✓</span>
                            <span>${feature}</span>
                        </div>
                    `).join('')}
                </div>
            </section>

            <!-- Technology Stack -->
            <section class="case-study-section">
                <h2>🛠️ Technology Stack</h2>
                <div class="tech-stack-detailed">
                    ${Object.entries(project.caseStudy.technologies).map(([category, techs]) => `
                        <div class="tech-category">
                            <h3>${category.charAt(0).toUpperCase() + category.slice(1).replace(/_/g, ' ')}</h3>
                            <div class="tech-list">
                                ${techs.map(tech => `<span class="tech-item">${tech}</span>`).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </section>

            <!-- Key Challenges & Decisions -->
            ${project.caseStudy.challenges ? `
            <section class="case-study-section">
                <h2>⚡ Key Challenges & Technical Decisions</h2>
                <div class="challenges-grid">
                    ${project.caseStudy.challenges.map((item, index) => `
                        <div class="challenge-item">
                            <div class="challenge-number">${index + 1}</div>
                            <div class="challenge-content">
                                <h3>Challenge</h3>
                                <p>${item.problem}</p>
                                <h3>Decision</h3>
                                <p>${item.decision}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </section>
            ` : ''}

            <!-- Code Snippets -->
            ${project.caseStudy.codeSnippets ? `
            <section class="case-study-section">
                <h2>💻 Code Examples</h2>
                <div class="code-examples">
                    ${Object.entries(project.caseStudy.codeSnippets).map(([title, code]) => `
                        <div class="code-example">
                            <h3>${title.charAt(0).toUpperCase() + title.slice(1)}</h3>
                            <pre><code>${code}</code></pre>
                        </div>
                    `).join('')}
                </div>
            </section>
            ` : ''}

            <!-- Results -->
            <section class="case-study-section results">
                <h2>📊 Results & Impact</h2>
                <p>${project.caseStudy.results}</p>
                ${project.caseStudy.metrics ? `
                <div class="metrics-grid">
                    ${Object.entries(project.caseStudy.metrics).map(([key, value]) => `
                        <div class="metric-card">
                            <div class="metric-value">${value}</div>
                            <div class="metric-label">${key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</div>
                        </div>
                    `).join('')}
                </div>
                ` : ''}
            </section>

            <!-- Project Links -->
            <section class="case-study-section project-links">
                <h2>🔗 Project Links</h2>
                <div class="project-actions">
                    ${project.github !== '#' ? `<a href="${project.github}" target="_blank" class="btn-primary">View on GitHub</a>` : ''}
                    ${project.demo !== '#' ? `<a href="${project.demo}" target="_blank" class="btn-secondary">Live Demo</a>` : ''}
                </div>
            </section>
        ` : `
            <!-- Basic Project Display (fallback) -->
            <a href="projects.html" class="back-link">← Back to Projects</a>
            <h1>${project.title}</h1>
            <p><strong>Domain:</strong> ${project.domain}</p>
            <p>${project.description}</p>
            <div class="project-tech">
                ${project.stack.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
            </div>
            <div class="project-actions">
                ${project.github !== '#' ? `<a href="${project.github}" target="_blank" class="btn-primary">View on GitHub</a>` : ''}
                ${project.demo !== '#' ? `<a href="${project.demo}" target="_blank" class="btn-secondary">Live Demo</a>` : ''}
            </div>
        `;

        document.getElementById('project-detail').innerHTML = caseStudyHTML;

        // Add syntax highlighting if code examples exist
        if (project.caseStudy && project.caseStudy.codeSnippets) {
            // Load Prism.js for syntax highlighting if available
            loadSyntaxHighlighting();
        }

    } catch (error) {
        console.error('Error loading project:', error);
        document.getElementById('project-detail').innerHTML = '<p>Project not found</p>';
    }
}

// Function to load syntax highlighting for code examples
function loadSyntaxHighlighting() {
    // Load Prism.js if not already loaded
    if (!window.Prism) {
        const prismCSS = document.createElement('link');
        prismCSS.rel = 'stylesheet';
        prismCSS.href = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css';
        document.head.appendChild(prismCSS);

        const prismJS = document.createElement('script');
        prismJS.src = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js';
        prismJS.onload = () => {
            // Re-highlight all code blocks
            Prism.highlightAll();
        };
        document.head.appendChild(prismJS);
    } else {
        // If already loaded, just highlight
        Prism.highlightAll();
    }
}

// Function to load GitHub stats
async function loadGitHubStats() {
    const statsContainer = document.getElementById('github-stats');
    const activityContainer = document.getElementById('recent-activity');

    if (!statsContainer || !activityContainer) return;

    try {
        // Load GitHub stats
        const statsResponse = await fetch(`${API_BASE}/github/stats`);
        if (!statsResponse.ok) {
            throw new Error(`GitHub stats request failed: ${statsResponse.status}`);
        }
        const stats = await statsResponse.json();

        // Update stats cards
        const statCards = statsContainer.querySelectorAll('.stat-card');
        statCards[0].innerHTML = `
            <div class="stat-icon">📊</div>
            <div class="stat-number" data-target="${stats.publicRepos}">${stats.publicRepos}</div>
            <div class="stat-label">Public Repos</div>
        `;
        statCards[1].innerHTML = `
            <div class="stat-icon">⭐</div>
            <div class="stat-number" data-target="${stats.totalStars}">${stats.totalStars}</div>
            <div class="stat-label">Stars Earned</div>
        `;
        statCards[2].innerHTML = `
            <div class="stat-icon">🍴</div>
            <div class="stat-number" data-target="${stats.totalForks}">${stats.totalForks}</div>
            <div class="stat-label">Total Forks</div>
        `;
        statCards[3].innerHTML = `
            <div class="stat-icon">👥</div>
            <div class="stat-number" data-target="${stats.followers}">${stats.followers}</div>
            <div class="stat-label">Followers</div>
        `;

        // Remove skeleton classes
        statCards.forEach(card => card.classList.remove('skeleton'));

        // Update recent activity
        activityContainer.innerHTML = '';
        const hasRecentActivity = Array.isArray(stats.recentActivity) && stats.recentActivity.length > 0;

        if (hasRecentActivity) {
            stats.recentActivity.forEach(activity => {
                const activityItem = document.createElement('div');
                activityItem.className = 'activity-item';
                activityItem.innerHTML = `
                    <div class="activity-content">
                        <h4>${activity.name}</h4>
                        <p>${activity.description || 'No description available'}</p>
                        <div class="activity-meta">
                            <span>⭐ ${activity.stars} • 🍴 ${activity.forks}</span>
                            <span>${activity.language || 'N/A'}</span>
                        </div>
                    </div>
                `;
                activityContainer.appendChild(activityItem);
            });
        } else {
            // If backend returns fallback stats (or GitHub is unavailable), keep the section populated.
            activityContainer.innerHTML = `
                <div class="activity-item">
                    <div class="activity-content">
                        <h4>Portfolio Website</h4>
                        <p>Full-stack portfolio with security features and modern design</p>
                        <div class="activity-meta">
                            <span>⭐ 15 • 🍴 8</span>
                            <span>JavaScript</span>
                        </div>
                    </div>
                </div>
                <div class="activity-item">
                    <div class="activity-content">
                        <h4>Medical AI Assistant</h4>
                        <p>RAG-based AI for medical document analysis</p>
                        <div class="activity-meta">
                            <span>⭐ 22 • 🍴 12</span>
                            <span>Python</span>
                        </div>
                    </div>
                </div>
            `;
        }

    } catch (error) {
        console.error('Error loading GitHub stats:', error);
        // Show fallback content
        statsContainer.innerHTML = `
            <div class="stat-card">
                <div class="stat-icon">📊</div>
                <div class="stat-number">10+</div>
                <div class="stat-label">Projects</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">⭐</div>
                <div class="stat-number">50+</div>
                <div class="stat-label">GitHub Stars</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">🍴</div>
                <div class="stat-number">25+</div>
                <div class="stat-label">Forks</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">👥</div>
                <div class="stat-number">100+</div>
                <div class="stat-label">Followers</div>
            </div>
        `;

        activityContainer.innerHTML = `
            <div class="activity-item">
                <div class="activity-content">
                    <h4>Portfolio Website</h4>
                    <p>Full-stack portfolio with security features and modern design</p>
                    <div class="activity-meta">
                        <span>⭐ 15 • 🍴 8</span>
                        <span>JavaScript</span>
                    </div>
                </div>
            </div>
            <div class="activity-item">
                <div class="activity-content">
                    <h4>Medical AI Assistant</h4>
                    <p>RAG-based AI for medical document analysis</p>
                    <div class="activity-meta">
                        <span>⭐ 22 • 🍴 12</span>
                        <span>Python</span>
                    </div>
                </div>
            </div>
        `;
    }
}

// Scroll-triggered animations
document.addEventListener('DOMContentLoaded', () => {
    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animateElements = document.querySelectorAll('.project-card, .skill-card, .testimonial-card, .blog-card, .about-content, .contact-content');
    animateElements.forEach(el => observer.observe(el));

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Parallax effect for hero sections
    const heroSections = document.querySelectorAll('.hero, .blog-hero');
    if (heroSections.length > 0) {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            heroSections.forEach(section => {
                const rate = scrolled * -0.5;
                section.style.transform = `translateY(${rate}px)`;
            });
        });
    }

    // Typing animation for hero text
    const heroTitles = document.querySelectorAll('.hero h1, .hero h2');
    heroTitles.forEach(title => {
        const text = title.textContent;
        title.textContent = '';
        title.style.borderRight = '2px solid var(--accent-color)';

        let i = 0;
        const typeWriter = () => {
            if (i < text.length) {
                title.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, 100);
            } else {
                title.style.borderRight = 'none';
            }
        };

        // Start typing animation after a delay
        setTimeout(typeWriter, 1000);
    });

    // Hover effects for cards
    const cards = document.querySelectorAll('.project-card, .skill-card, .testimonial-card, .blog-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });

    // Counter animation for stats
    const counters = document.querySelectorAll('.stat-number');
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.getAttribute('data-target'));
                animateCounter(entry.target, target);
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => counterObserver.observe(counter));

    function animateCounter(element, target) {
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;

        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                element.textContent = target;
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current);
            }
        }, 16);
    }

    // Project search and filter functionality
    const searchInput = document.getElementById('project-search');
    const filterButtons = document.querySelectorAll('.filter-btn');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value;
            const activeFilter = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
            filterProjects(searchTerm, activeFilter);
        });
    }

    if (filterButtons.length > 0) {
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Remove active class from all buttons
                filterButtons.forEach(btn => btn.classList.remove('active'));
                // Add active class to clicked button
                button.classList.add('active');

                const category = button.dataset.filter;
                const searchTerm = searchInput?.value || '';
                filterProjects(searchTerm, category);
            });
        });
    }
});

// Page loading functions
function showPageLoading() {
    const loadingOverlay = document.createElement('div');
    loadingOverlay.id = 'page-loading';
    loadingOverlay.innerHTML = `
        <div class="loading-content">
            <div class="loading-spinner" style="width: 40px; height: 40px; margin: 0 auto 1rem;"></div>
            <p>Loading Secure Portfolio...</p>
        </div>
    `;
    loadingOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: var(--bg-color, #000);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        transition: opacity 0.3s ease;
    `;
    document.body.appendChild(loadingOverlay);
}

function hidePageLoading() {
    const loadingOverlay = document.getElementById('page-loading');
    if (loadingOverlay) {
        loadingOverlay.style.opacity = '0';
        setTimeout(() => {
            loadingOverlay.remove();
        }, 300);
    }
}

// ===== PERFORMANCE OPTIMIZATIONS & PWA =====

function isLocalhost() {
    return (
        location.hostname === 'localhost' ||
        location.hostname === '127.0.0.1' ||
        location.hostname === '::1'
    );
}

async function disableServiceWorkerAndCachesInDev() {
    if (!isLocalhost()) return;

    // Prevent stale assets during development.
    try {
        if ('serviceWorker' in navigator) {
            const registrations = await navigator.serviceWorker.getRegistrations();
            await Promise.all(registrations.map((r) => r.unregister()));
        }

        if ('caches' in window) {
            const keys = await caches.keys();
            await Promise.all(keys.map((k) => caches.delete(k)));
        }
    } catch (error) {
        console.warn('[Dev] Failed to disable SW/caches:', error);
    }
}

// Run ASAP (before SW registration) so refresh always loads latest files.
disableServiceWorkerAndCachesInDev();

// Service Worker Registration
if ('serviceWorker' in navigator && !isLocalhost()) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('[SW] Registered successfully:', registration.scope);

                // Check for updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    if (newWorker) {
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                // New content available, show update prompt
                                showUpdateNotification();
                            }
                        });
                    }
                });
            })
            .catch((error) => {
                console.error('[SW] Registration failed:', error);
            });
    });
}

// Show update notification
function showUpdateNotification() {
    const notification = document.createElement('div');
    notification.className = 'update-notification';
    notification.innerHTML = `
        <div class="update-content">
            <p>🚀 New version available!</p>
            <button onclick="updateApp()">Update Now</button>
            <button onclick="dismissUpdate()">Later</button>
        </div>
    `;
    document.body.appendChild(notification);

    // Auto-hide after 10 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 10000);
}

// Update the app
function updateApp() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then((registration) => {
            registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
        });
    }
    window.location.reload();
}

// Dismiss update notification
function dismissUpdate() {
    const notification = document.querySelector('.update-notification');
    if (notification) {
        notification.remove();
    }
}

// Listen for service worker updates
if ('serviceWorker' in navigator && !isLocalhost()) {
    navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SKIP_WAITING') {
            window.location.reload();
        }
    });
}

// ===== PERFORMANCE MONITORING =====

// Core Web Vitals tracking
function trackWebVitals() {
    // Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
        try {
            const lcpObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                console.log('[Performance] LCP:', lastEntry.startTime);
                // Send to analytics if available
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'lcp', {
                        value: Math.round(lastEntry.startTime)
                    });
                }
            });
            lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

            // First Input Delay (FID)
            const fidObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach((entry) => {
                    console.log('[Performance] FID:', entry.processingStart - entry.startTime);
                    if (typeof gtag !== 'undefined') {
                        gtag('event', 'fid', {
                            value: Math.round(entry.processingStart - entry.startTime)
                        });
                    }
                });
            });
            fidObserver.observe({ entryTypes: ['first-input'] });

            // Cumulative Layout Shift (CLS)
            let clsValue = 0;
            const clsObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach((entry) => {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                    }
                });
                console.log('[Performance] CLS:', clsValue);
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'cls', {
                        value: Math.round(clsValue * 1000) / 1000
                    });
                }
            });
            clsObserver.observe({ entryTypes: ['layout-shift'] });

        } catch (error) {
            console.warn('[Performance] Error tracking Web Vitals:', error);
        }
    }
}

// ===== IMAGE OPTIMIZATION =====

// Lazy loading for images
function initLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');

    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    observer.unobserve(img);
                }
            });
        });

        images.forEach((img) => imageObserver.observe(img));
    } else {
        // Fallback for browsers without IntersectionObserver
        images.forEach((img) => {
            img.src = img.dataset.src;
        });
    }
}

// ===== NETWORK OPTIMIZATION =====

// Detect network status and adjust behavior
function initNetworkOptimization() {
    if ('connection' in navigator) {
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

        function updateConnectionStatus() {
            const { effectiveType, downlink, rtt } = connection;
            console.log(`[Network] ${effectiveType}, ${downlink} Mbps, ${rtt}ms RTT`);

            // Adjust loading strategies based on connection
            if (effectiveType === 'slow-2g' || effectiveType === '2g') {
                // Reduce image quality, disable non-essential features
                document.documentElement.classList.add('low-bandwidth');
            } else {
                document.documentElement.classList.remove('low-bandwidth');
            }
        }

        connection.addEventListener('change', updateConnectionStatus);
        updateConnectionStatus();
    }

    // Handle online/offline events
    window.addEventListener('online', () => {
        console.log('[Network] Back online');
        document.documentElement.classList.remove('offline');
        // Retry failed requests
        retryFailedRequests();
    });

    window.addEventListener('offline', () => {
        console.log('[Network] Gone offline');
        document.documentElement.classList.add('offline');
    });
}

// Retry failed requests when back online
function retryFailedRequests() {
    // Retry GitHub stats loading if it failed
    if (document.getElementById('github-stats') && !document.querySelector('.stat-card .stat-number')) {
        loadGitHubStats();
    }
}

// ===== RESOURCE HINTS & PRELOADING =====

// Preload critical resources
function preloadCriticalResources() {
    // Preload critical CSS
    const criticalCSS = document.createElement('link');
    criticalCSS.rel = 'preload';
    criticalCSS.href = 'styles.css';
    criticalCSS.as = 'style';
    document.head.appendChild(criticalCSS);

    // Preload critical JavaScript
    const criticalJS = document.createElement('link');
    criticalJS.rel = 'preload';
    criticalJS.href = 'script.js';
    criticalJS.as = 'script';
    document.head.appendChild(criticalJS);

    // Preload hero images if any
    const heroImages = document.querySelectorAll('.hero img');
    heroImages.forEach((img) => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = img.src;
        link.as = 'image';
        document.head.appendChild(link);
    });
}

// ===== MEMORY MANAGEMENT =====

// Clean up event listeners and observers on page unload
function cleanupResources() {
    // Clear any intervals
    const intervals = window.portfolioIntervals || [];
    intervals.forEach((interval) => clearInterval(interval));

    // Disconnect observers
    if (window.portfolioObservers) {
        window.portfolioObservers.forEach((observer) => observer.disconnect());
    }
}

// ===== ACCESSIBILITY IMPROVEMENTS =====

// Keyboard navigation for mobile menu
function initKeyboardNavigation() {
    const hamburgerMenu = document.getElementById('hamburger-menu');
    const navLinks = document.querySelector('.nav-links');

    // Handle hamburger menu keyboard interaction
    hamburgerMenu.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleMobileMenu();
        }
    });

    // Handle escape key to close menu
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navLinks.classList.contains('active')) {
            toggleMobileMenu();
            hamburgerMenu.focus();
        }
    });

    // Trap focus within mobile menu when open
    const focusableElements = navLinks.querySelectorAll('a, button');
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    navLinks.addEventListener('keydown', (e) => {
        if (e.key === 'Tab' && navLinks.classList.contains('active')) {
            if (e.shiftKey) {
                if (document.activeElement === firstFocusable) {
                    e.preventDefault();
                    lastFocusable.focus();
                }
            } else {
                if (document.activeElement === lastFocusable) {
                    e.preventDefault();
                    firstFocusable.focus();
                }
            }
        }
    });
}

// Update ARIA attributes for mobile menu
function updateMenuAria(expanded) {
    const hamburgerMenu = document.getElementById('hamburger-menu');
    hamburgerMenu.setAttribute('aria-expanded', expanded);
}

// Theme toggle accessibility
function initThemeToggleAccessibility() {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) return;

    const themeIcon = themeToggle.querySelector('.theme-icon');
    if (!themeIcon) return;

    const themes = ['dark', 'light', 'blue'];

    function getNextTheme(theme) {
        const index = themes.indexOf(theme);
        const safeIndex = index === -1 ? 0 : index;
        return themes[(safeIndex + 1) % themes.length];
    }

    function updateThemeAria() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
        const nextTheme = getNextTheme(currentTheme);
        themeToggle.setAttribute('aria-label', `Switch to ${nextTheme} theme`);
        themeIcon.innerHTML = renderThemeIconSvg(currentTheme);
    }

    // Update on theme change
    const observer = new MutationObserver(updateThemeAria);
    observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme']
    });

    // Initial update
    updateThemeAria();
}

// Live region for dynamic content announcements
function announceToScreenReader(message, priority = 'polite') {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;

    document.body.appendChild(announcement);

    // Remove after announcement
    setTimeout(() => {
        document.body.removeChild(announcement);
    }, 1000);
}

// Enhanced form accessibility
function initFormAccessibility() {
    const forms = document.querySelectorAll('form');

    forms.forEach(form => {
        const inputs = form.querySelectorAll('input, textarea, select');

        inputs.forEach(input => {
            // Add aria-describedby for error messages
            const errorId = `${input.id}-error`;
            const errorElement = document.getElementById(errorId);

            if (errorElement) {
                input.setAttribute('aria-describedby', errorId);
            }

            // Enhanced validation feedback
            input.addEventListener('invalid', (e) => {
                e.preventDefault();
                input.setAttribute('aria-invalid', 'true');

                const message = getValidationMessage(input);
                announceToScreenReader(message, 'assertive');

                if (errorElement) {
                    errorElement.textContent = message;
                    errorElement.style.display = 'block';
                }
            });

            input.addEventListener('input', () => {
                input.setAttribute('aria-invalid', 'false');
                if (errorElement) {
                    errorElement.style.display = 'none';
                }
            });
        });
    });
}

// Get validation message for accessibility
function getValidationMessage(input) {
    if (input.validity.valueMissing) {
        return `${input.name || 'This field'} is required`;
    }
    if (input.validity.typeMismatch) {
        return `Please enter a valid ${input.type}`;
    }
    if (input.validity.tooShort) {
        return `${input.name || 'This field'} must be at least ${input.minLength} characters`;
    }
    if (input.validity.tooLong) {
        return `${input.name || 'This field'} must be no more than ${input.maxLength} characters`;
    }
    return 'Please check your input';
}

// Skip link functionality
function initSkipLinks() {
    const skipLinks = document.querySelectorAll('.skip-link');

    skipLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const target = document.querySelector(link.getAttribute('href'));
            if (target) {
                target.focus();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

// ===== INITIALIZATION =====

// ===== INITIALIZATION =====

// Initialize all performance optimizations
document.addEventListener('DOMContentLoaded', () => {
    // Initialize performance monitoring
    trackWebVitals();

    // Initialize lazy loading
    initLazyLoading();

    // Initialize network optimization
    initNetworkOptimization();

    // Preload critical resources
    preloadCriticalResources();

    // Initialize accessibility features
    initKeyboardNavigation();
    initThemeToggleAccessibility();
    initFormAccessibility();
    initSkipLinks();

    // Show page loading complete
    hidePageLoading();
});

// Cleanup on page unload
window.addEventListener('beforeunload', cleanupResources);