// Advanced Rule-Based Homeopathic Engine
// Matches patient symptoms against a Materia Medica database using weighted scoring.

const materiaMedica = [
    {
        name: "Arsenicum Album",
        profile: "Anxiety, restlessness, burning pains, perfectionist, fastidious.",
        mind: ["anxiety", "fear", "restless", "fastidious", "perfectionist", "avarice", "fear of death", "fear of disease"],
        physical: ["burning", "thirst", "vomiting", "diarrhea", "asthma", "skin eruptions", "food poisoning"],
        modalities: { worse: ["cold", "midnight", "1am", "2am"], better: ["heat", "warm drinks", "elevating head"] }
    },
    {
        name: "Nux Vomica",
        profile: "Irritable, workaholic, chilly, gastric complaints from excess.",
        mind: ["irritable", "angry", "impatient", "competitive", "workaholic", "sensitive to noise"],
        physical: ["constipation", "indigestion", "headache", "hangover", "cramps", "insomnia"],
        modalities: { worse: ["cold", "morning", "stimulants", "overeating"], better: ["heat", "rest", "evening"] }
    },
    {
        name: "Pulsatilla",
        profile: "Weepy, changeable, thirstless, desires fresh air.",
        mind: ["weepy", "emotional", "changeable", "mild", "yielding", "dependent", "craves sympathy"],
        physical: ["catarrh", "styes", "varicose veins", "menstrual issues", "wandering pain"],
        modalities: { worse: ["heat", "rich food", "evening", "warm room"], better: ["fresh air", "cold applications", "consolation"] }
    },
    {
        name: "Rhus Toxicodendron",
        profile: "Restlessness, stiffness, better with continued motion.",
        mind: ["restless", "anxious", "superstitious"],
        physical: ["joint pain", "stiffness", "arthritis", "skin rash", "itchy"],
        modalities: { worse: ["first motion", "cold damp", "rest"], better: ["continued motion", "heat", "warm bath"] }
    },
    {
        name: "Lycopodium",
        profile: "Lack of confidence, right-sided complaints, gas/bloating.",
        mind: ["low confidence", "anticipation anxiety", "dictatorial", "intellectual"],
        physical: ["gas", "bloating", "liver issues", "right side", "kidney stones", "impotence", "hair loss"],
        modalities: { worse: ["4pm", "8pm", "tight clothes", "cold food"], better: ["warm food", "eructations", "cool air"] }
    },
    {
        name: "Natrum Muriaticum",
        profile: "Reserved, grief, dwelling on past, craves salt.",
        mind: ["grief", "reserved", "introverted", "depressed", "holds grudges", "hates consolation"],
        physical: ["headache", "migraine", "dry skin", "herpes", "back pain", "thyroid"],
        modalities: { worse: ["sun", "heat", "consolation", "10am"], better: ["open air", "cold bathing", "missing a meal"] }
    },
    {
        name: "Sepia",
        profile: "Indifference, hormonal imbalance, dragging sensation.",
        mind: ["indifferent", "irritable", "depressed", "weepy", "wants to be alone"],
        physical: ["menstrual issues", "prolapse", "back pain", "hormonal", "hot flashes", "herpes"],
        modalities: { worse: ["cold", "damp", "before menses"], better: ["exercise", "warmth", "occupation"] }
    },
    {
        name: "Sulphur",
        profile: "Philosophical, messy, hot, skin issues.",
        mind: ["lazy", "selfish", "messy", "philosophical", "critical", "egotistical"],
        physical: ["skin", "itch", "burning", "redness", "diarrhea", "hemorrhoids"],
        modalities: { worse: ["heat", "bathing", "standing", "11am"], better: ["open air", "motion"] }
    },
    {
        name: "Belladonna",
        profile: "Sudden onset, heat, redness, throbbing.",
        mind: ["delirium", "hallucinations", "rage", "fear of dogs"],
        physical: ["fever", "inflammation", "throbbing pain", "headache", "red face", "dilated pupils"],
        modalities: { worse: ["touch", "noise", "jarring", "light"], better: ["rest", "standing"] }
    },
    {
        name: "Phosphorus",
        profile: "Outgoing, fearful, burning pains, bleeding.",
        mind: ["sympathetic", "open", "fearful", "anxious", "clairvoyant"],
        physical: ["respiratory", "cough", "bleeding", "burning", "weakness"],
        modalities: { worse: ["cold", "twilight", "lying on left side"], better: ["cold drinks", "sleep", "massage"] }
    },
    {
        name: "Calcarea Carbonica",
        profile: "Slow, chilly, sweaty head, fears.",
        mind: ["fearful", "anxious about health", "slow", "overworked"],
        physical: ["obesity", "sweat", "bone issues", "glands", "polyps"],
        modalities: { worse: ["cold", "exertion", "full moon"], better: ["dry weather", "lying down"] }
    },
    {
        name: "Ignatia",
        profile: "Acute grief, changeable moods, sighing.",
        mind: ["grief", "shock", "hysteria", "sighing", "mood swings"],
        physical: ["lump in throat", "spasms", "headache", "cough"],
        modalities: { worse: ["coffee", "tobacco", "morning"], better: ["eating", "warmth"] }
    },
    {
        name: "Mercurius Solubilis",
        profile: "Syphilitic, instability, sweating, offensive.",
        mind: ["hurried", "suspicious", "poor memory", "impulsive"],
        physical: ["mouth ulcers", "sweating", "trembling", "glands", "odorous"],
        modalities: { worse: ["night", "heat of bed", "damp", "perspiration"], better: ["rest"] }
    },
    {
        name: "Silicea",
        profile: "Lack of grit, chilly, precise, suppuration.",
        mind: ["timid", "yielding", "precise", "stubborn", "fear of pins"],
        physical: ["abscess", "skin", "nails", "bones", "constipation"],
        modalities: { worse: ["cold", "drafts", "new moon"], better: ["warmth", "wrapping up"] }
    },
    {
        name: "Thuja Occidentalis",
        profile: "Sycotic, warts, fixed ideas, deceitful.",
        mind: ["deceitful", "low self-esteem", "fixed ideas", "delusion glass"],
        physical: ["warts", "growths", "genitourinary", "vaccination reaction"],
        modalities: { worse: ["damp", "cold", "3am"], better: ["movement", "warmth"] }
    }
];

function analyzeCase(patient) {
    if (!patient) return null;

    // 1. Aggregate Patient Data
    const features = [
        patient.ChiefComplaint,
        patient.SymptomDescription,
        patient.EmotionalState,
        patient.Mind, // If mapped
        patient.Generals, // If mapped
        patient.AggravatingFactors,
        patient.ThermalPreference,
        patient.ThirstAndWater,
        patient.Fears,
        patient.DreamsNightmares,
        patient.SelfDescription
    ].join(' ').toLowerCase();

    // 2. Score Remedies
    const scores = materiaMedica.map(remedy => {
        let score = 0;
        let reasons = [];

        // Check Mind
        remedy.mind.forEach(kw => {
            if (features.includes(kw)) {
                score += 3; // Mind symptoms weighted higher
                reasons.push(`Mind: ${kw}`);
            }
        });

        // Check Physical
        remedy.physical.forEach(kw => {
            if (features.includes(kw)) {
                score += 2;
                reasons.push(`Physical: ${kw}`);
            }
        });

        // Check Modalities
        if (remedy.modalities && remedy.modalities.worse) {
            remedy.modalities.worse.forEach(kw => {
                if (features.includes(kw)) {
                    score += 1;
                    reasons.push(`Worse: ${kw}`);
                }
            });
        }
        if (remedy.modalities && remedy.modalities.better) {
            remedy.modalities.better.forEach(kw => {
                if (features.includes(kw)) {
                    score += 1;
                    reasons.push(`Better: ${kw}`);
                }
            });
        }

        // Check Profile Keywords (General)
        const profileWords = remedy.profile.toLowerCase().split(/[ ,.]+/);
        profileWords.forEach(w => {
            if (w.length > 3 && features.includes(w)) {
                score += 0.5;
            }
        });

        return {
            name: remedy.name,
            score: score,
            profile: remedy.profile,
            reason: [...new Set(reasons)].slice(0, 5).join(', ') // Top 5 distinct reasons
        };
    });

    // 3. Sort and Rank
    const topRemedies = scores
        .filter(r => r.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);

    // 4. Generate Comparison for Top 3
    let comparison = [];
    const top3 = topRemedies.slice(0, 3);

    if (top3.length > 1) {
        // Base comparison
        comparison.push({
            criteria: "Key Essence",
            rem1: top3[0].profile,
            rem2: top3[1].profile,
            rem3: top3[2] ? top3[2].profile : "-"
        });

        // Compare Modalities (simplified)
        comparison.push({
            criteria: "Modalities (Worse)",
            rem1: getModalities(top3[0].name, 'worse'),
            rem2: getModalities(top3[1].name, 'worse'),
            rem3: top3[2] ? getModalities(top3[2].name, 'worse') : "-"
        });
    }

    return {
        topRemedies,
        comparison
    };
}

function getModalities(remedyName, type) {
    const rem = materiaMedica.find(r => r.name === remedyName);
    if (rem && rem.modalities && rem.modalities[type]) {
        return rem.modalities[type].join(', ');
    }
    return "N/A";
}

// Keep the old simple one just in case, or alias it
function analyzeSymptoms(symptoms) {
    // Adapter for legacy calls if any
    return analyzeCase({ ChiefComplaint: symptoms }).topRemedies.map(r => r.name);
}

module.exports = { analyzeCase, analyzeSymptoms };
