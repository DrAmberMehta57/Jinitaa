const express = require('express');
const router = express.Router();
const db = require('../database/database');
// const bcrypt = require('bcrypt'); // Uncomment when ready to use real hashing

// Middleware to check authentication
function isAuthenticated(req, res, next) {
    if (req.session.isLoggedIn) {
        return next();
    }
    res.redirect('/admin/login');
}

// Login Page
router.get('/login', (req, res) => {
    res.render('login', { title: 'Doctor Login', error: null });
});

// Login Handler
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    // TODO: Use real hashing. Current logic simulates auth for placeholder 'admin'/'admin123'
    // or checks against DB if we inserted the hash.
    // For MVP prototype without running node to seed DB with hash:
    // We will hardcode a check for now, OR fetch from DB if we could.
    // Since we created the table but didn't seed a hash:

    // TEMPORARY: Hardcoded check for demo purposes until valid hash is in DB
    if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
        req.session.isLoggedIn = true;
        req.session.user = username;
        return res.redirect('/admin/dashboard');
    }

    /* 
    // Real Logic:
    const stmt = db.prepare("SELECT * FROM Table_Doctors WHERE Username = ?");
    const user = stmt.get(username);
    if (user && await bcrypt.compare(password, user.PasswordHash)) {
        req.session.isLoggedIn = true;
        res.redirect('/admin/dashboard');
    } else {
       res.render('login', { error: 'Invalid Credentials' });
    }
    */

    res.render('login', { title: 'Doctor Login', error: 'Invalid Credentials' });
});

// Logout
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/admin/login');
});

// Dashboard
router.get('/dashboard', isAuthenticated, (req, res) => {
    const { search } = req.query;
    let patients = [];

    if (search) {
        const stmt = db.prepare(`
            SELECT * FROM Table_Patients 
            WHERE FullName LIKE ? OR ReferenceID LIKE ? OR Phone LIKE ?
            ORDER BY SubmissionDate DESC
        `);
        patients = stmt.all(`%${search}%`, `%${search}%`, `%${search}%`);
    } else {
        const stmt = db.prepare("SELECT * FROM Table_Patients ORDER BY SubmissionDate DESC LIMIT 20");
        patients = stmt.all();
    }

    res.render('dashboard', { title: 'Doctor Dashboard', patients, search });
});

const { analyzeCase } = require('../services/aiService');

// Patient Detail & Analysis
router.get('/patient/:id', isAuthenticated, (req, res) => {
    const { id } = req.params;
    const patientStmt = db.prepare("SELECT * FROM Table_Patients WHERE PatientID = ?");
    const patient = patientStmt.get(id);

    const remedyStmt = db.prepare("SELECT * FROM Table_Remedies WHERE PatientID = ?");
    const remedies = remedyStmt.all(id);

    if (!patient) return res.redirect('/admin/dashboard');

    // AI Analysis Logic
    const aiResults = analyzeCase(patient);
    // aiResults = { topRemedies: [{name, score, reason, profile}], comparison: [{criteria, rem1, rem2, rem3}] }

    res.render('patient-detail', { title: `Patient: ${patient.FullName}`, patient, remedies, aiResults });
});

// Save Analysis
router.post('/patient/:id/analysis', isAuthenticated, (req, res) => {
    const { id } = req.params;
    const { rem1, rem2, rem3, rem4, rem5, miasm, notes } = req.body;

    const stmt = db.prepare(`
        INSERT INTO Table_Remedies (PatientID, Rem_1, Rem_2, Rem_3, Rem_4, Rem_5, Miasm, Clinic_Notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(id, rem1, rem2, rem3, rem4, rem5, miasm, notes);

    res.redirect(`/admin/patient/${id}`);
});

// Export Database for Synchronization
router.get('/sync/export', (req, res) => {
    const { token } = req.query;

    // Security: Check if token matches admin password
    if (token !== process.env.ADMIN_PASSWORD) {
        return res.status(403).send("Unauthorized: Invalid sync token.");
    }

    try {
        const backupPath = path.resolve(__dirname, '../../clinic_data_backup.db');
        // Perform a safe backup of the database
        db.backup(backupPath)
            .then(() => {
                res.download(backupPath, 'clinic_data.db', (err) => {
                    if (err) console.error('Download error:', err);
                    // Cleanup backup file after download
                    const fs = require('fs');
                    if (fs.existsSync(backupPath)) fs.unlinkSync(backupPath);
                });
            })
            .catch((err) => {
                console.error('Backup error:', err);
                res.status(500).send("Error creating database backup.");
            });
    } catch (err) {
        console.error('Sync error:', err);
        res.status(500).send("Sync service failure.");
    }
});

module.exports = router;
