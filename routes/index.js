const express = require('express');
const router = express.Router();
const db = require('../database/database');
const multer = require('multer');
const path = require('path');
const { sendConfirmationEmail, sendWhatsAppNotification, getWhatsAppLink } = require('../services/notificationService');

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'REPORT-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage }).array('reportFiles', 5); // Allow up to 5 files

function generateReferenceID() {
    // DJC-2026-XXXX
    const year = new Date().getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000); // 4 digit random
    return `DJC-${year}-${random}`;
}

router.get('/', (req, res) => {
    res.render('index', { title: 'Patient Intake' });
});

router.post('/submit', (req, res) => {
    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            return res.status(500).send("File upload error: " + err.message);
        } else if (err) {
            return res.status(500).send("Unknown error: " + err.message);
        }

        // Extract fields
        const {
            fullName, email, phone, dob, gender, maritalStatus, occupation, address, foodPreference,
            chiefComplaint, durationOfIllness, symptomDescription, severity, aggravatingFactors, previousTreatments,
            pastMedicalHistory, allergies,
            // Family History (Checkbox Grid - might need processing if coming as distinct fields)
            // For now, let's assume we capture it or it's passed as a JSON string if client-side processed,
            // or we might need to aggregate it. Let's assume flat fields for simplicity or JSON.
            // Simplified: We'll serialize req.body.familyHistory if it exists.
            sleepPattern, appetite, thirstAndWater, bowelHabits, urination, thermalPreference, dietaryHabits, exerciseRoutine, tobaccoUse, cigarettesPerDay, alcoholUse,
            menstrualHistory, leukorrhea, menopauseDetails,
            emotionalState, majorLifeStressors, sleepQualityDetails, dreamsNightmares, phobiasFears, pastPsychiatricHistory, selfDescription,
            childhoodIllnesses, childhoodDevelopment, vaccinations, bedwetting, childhoodTraumas, childhoodTemperament,
            // Body parts might be array
            affectedAreas, painLocation, bodyPartComments,
            otherSymptoms, currentMedications, referringPhysician, consent
        } = req.body;

        const referenceID = generateReferenceID();

        // Process Arrays/JSON
        const familyHistoryStr = req.body.familyHistory ? JSON.stringify(req.body.familyHistory) : '';
        const affectedAreasStr = affectedAreas ? (Array.isArray(affectedAreas) ? affectedAreas.join(', ') : affectedAreas) : '';

        // Process Files
        const reportFilesStr = req.files ? req.files.map(f => '/uploads/' + f.filename).join(',') : '';

        try {
            const stmt = db.prepare(`
                INSERT INTO Table_Patients (
                    ReferenceID, FullName, Email, Phone, DOB, Gender, MaritalStatus, Occupation, Address, FoodPreference,
                    ChiefComplaint, DurationOfIllness, SymptomDescription, Severity, AggravatingFactors, PreviousTreatments,
                    PastMedicalHistory, Allergies, FamilyMedicalHistory,
                    SleepPattern, Appetite, ThirstAndWater, BowelHabits, Urination, ThermalPreference, DietaryHabits, ExerciseRoutine, TobaccoUse, CigarettesPerDay, AlcoholUse,
                    MenstrualHistory, Leukorrhea, MenopauseDetails,
                    EmotionalState, MajorLifeStressors, SleepQualityDetails, DreamsNightmares, PhobiasFears, PastPsychiatricHistory, SelfDescription,
                    ChildhoodIllnesses, ChildhoodDevelopment, Vaccinations, Bedwetting, ChildhoodTraumas, ChildhoodTemperament,
                    AffectedAreas, PainLocation, BodyPartComments, ReportFiles,
                    OtherSymptoms, CurrentMedications, ReferringPhysician, Consent
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);

            stmt.run(
                referenceID, fullName, email, phone, dob, gender, maritalStatus, occupation, address, foodPreference,
                chiefComplaint, durationOfIllness, symptomDescription, severity, aggravatingFactors, previousTreatments,
                pastMedicalHistory, allergies, familyHistoryStr,
                sleepPattern, appetite, thirstAndWater, bowelHabits, urination, thermalPreference, dietaryHabits, exerciseRoutine, tobaccoUse, cigarettesPerDay, alcoholUse,
                menstrualHistory, leukorrhea, menopauseDetails,
                emotionalState, majorLifeStressors, sleepQualityDetails, dreamsNightmares, phobiasFears, pastPsychiatricHistory, selfDescription,
                childhoodIllnesses, childhoodDevelopment, vaccinations, bedwetting, childhoodTraumas, childhoodTemperament,
                affectedAreasStr, painLocation, bodyPartComments, reportFilesStr,
                otherSymptoms, currentMedications, referringPhysician, consent ? 1 : 0
            );

            // 4. Trigger Notifications (Async)
            sendConfirmationEmail(email, fullName, referenceID);
            sendWhatsAppNotification(phone, fullName, referenceID);

            const waLink = getWhatsAppLink(phone, fullName, referenceID);

            res.render('thank-you', { referenceID, fullName, waLink });
        } catch (err) {
            console.error(err);
            res.status(500).send("Error submitting form: " + err.message);
        }
    });
});

module.exports = router;
