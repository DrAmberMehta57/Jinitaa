const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(__dirname, '../clinic_data.db');
const db = new Database(dbPath, { verbose: console.log });

// Initialize Tables
const initDb = () => {
    // Patients Table - Comprehensive Case Record Form (Adult)
    db.exec(`
        CREATE TABLE IF NOT EXISTS Table_Patients (
            PatientID INTEGER PRIMARY KEY AUTOINCREMENT,
            ReferenceID TEXT UNIQUE,
            SubmissionDate DATETIME DEFAULT CURRENT_TIMESTAMP,
            
            -- Personal Information
            FullName TEXT,
            Email TEXT,
            Phone TEXT,
            DOB DATE,
            Gender TEXT,
            MaritalStatus TEXT,
            Occupation TEXT,
            Address TEXT,
            FoodPreference TEXT, -- Veg/Non-Veg
            
            -- Present Illness
            ChiefComplaint TEXT,
            DurationOfIllness TEXT,
            SymptomDescription TEXT,
            Severity TEXT,
            AggravatingFactors TEXT,
            PreviousTreatments TEXT,
            
            -- Past and Family History
            PastMedicalHistory TEXT,
            Allergies TEXT,
            FamilyMedicalHistory TEXT, -- JSON String
            
            -- Personal History
            SleepPattern TEXT,
            Appetite TEXT,
            ThirstAndWater TEXT,
            BowelHabits TEXT,
            Urination TEXT,
            ThermalPreference TEXT,
            DietaryHabits TEXT,
            ExerciseRoutine TEXT,
            TobaccoUse TEXT,
            CigarettesPerDay TEXT,
            AlcoholUse TEXT,
            
            -- Sexual & Reproductive Health
            MenstrualHistory TEXT,
            Leukorrhea TEXT,
            MenopauseDetails TEXT,
            
            -- Mind & Emotions
            EmotionalState TEXT,
            MajorLifeStressors TEXT,
            SleepQualityDetails TEXT,
            DreamsNightmares TEXT,
            PhobiasFears TEXT,
            PastPsychiatricHistory TEXT,
            SelfDescription TEXT,
            
            -- Childhood History
            ChildhoodIllnesses TEXT,
            ChildhoodDevelopment TEXT,
            Vaccinations TEXT,
            Bedwetting TEXT,
            ChildhoodTraumas TEXT,
            ChildhoodTemperament TEXT,
            
            -- Affected Body Parts
            AffectedAreas TEXT, -- JSON String or Checkbox list
            PainLocation TEXT,
            BodyPartComments TEXT,
            ReportFiles TEXT, -- Path to uploaded files
            
            -- Additional Information
            OtherSymptoms TEXT,
            CurrentMedications TEXT,
            ReferringPhysician TEXT,
            Consent INTEGER -- 1 for True
        )
    `);

    // Remedies Table
    db.exec(`
        CREATE TABLE IF NOT EXISTS Table_Remedies (
            RemedyID INTEGER PRIMARY KEY AUTOINCREMENT,
            PatientID INTEGER,
            Rem_1 TEXT,
            Rem_2 TEXT,
            Rem_3 TEXT,
            Rem_4 TEXT,
            Rem_5 TEXT,
            Miasm TEXT,
            Clinic_Notes TEXT,
            AnalysisDate DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(PatientID) REFERENCES Table_Patients(PatientID)
        )
    `);

    // Doctors Table (for Login)
    db.exec(`
        CREATE TABLE IF NOT EXISTS Table_Doctors (
            DoctorID INTEGER PRIMARY KEY AUTOINCREMENT,
            Username TEXT UNIQUE,
            PasswordHash TEXT
        )
    `);

    // Create default admin if not exists
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const stmt = db.prepare("SELECT count(*) as count FROM Table_Doctors WHERE Username = ?");
    const adminExists = stmt.get(adminUsername);

    if (adminExists.count === 0) {
        // Use placeholder or actual hash if needed. 
        // Note: The login route currently uses hardcoded string check from .env for simplicity.
        const insertAdmin = db.prepare("INSERT INTO Table_Doctors (Username, PasswordHash) VALUES (?, ?)");
        insertAdmin.run(adminUsername, '$2b$10$YourHashHere');
    }
};

initDb();

module.exports = db;
