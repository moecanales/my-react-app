const maleNames = ["Jebediah", "Silas", "Cornelius", "Elias", "Hiram", "Amos", "Thaddeus", "Ezekiel", "Gideon", "Phineas", "Josiah", "Caleb", "Ephraim", "Levi", "Obadiah"];
const femaleNames = ["Martha", "Clara", "Cora", "Beatrice", "Abigail", "Henrietta", "Eleanor", "Florence", "Agnes", "Mildred", "Josephine", "Hattie", "Ida", "Lillian", "Maude"];
const lastNames = ["Abernathy", "Vance", "Higgins", "Thorne", "Miller", "Callahan", "O'Reilly", "Sweeney", "Galloway", "Carmichael", "Hawthorne", "Pendleton", "Mercer", "Grange", "Walsh"];

const getDemonym = (town) => {
    if (!town) return "Locals";
    const t = town.trim();
    const lastChar = t.slice(-1).toLowerCase();
    const lastTwo = t.slice(-2).toLowerCase();

    if (t.toLowerCase().endsWith('city')) return t.slice(0, -1) + "ians"; 
    if (lastTwo === 'on') return t + "ians"; 
    if (lastChar === 'o') return t + "ans";  
    if (lastChar === 'a') return t + "ns";   
    if (lastChar === 'y') return t.slice(0, -1) + "ians"; 
    if (lastChar === 'e') return t + "rs"; 
    if (['t', 'd', 'k', 'g', 'p', 'b'].includes(lastChar)) return t + "ers"; 
    return t + "ers";
};

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const loreData = {
    // --- PRE-CONNECTION (GOSSIP) ---
    anticipation: {
        setups: [
            "Rumors are swirling around {town}.",
            "A traveler passing through mentioned the {company} is surveying nearby.",
            "Excited murmurs fill the local tavern.",
            "The town council holds an emergency meeting regarding the railroad.",
            "Property speculators have been spotted buying up land near {town}."
        ],
        punchlines: [
            "They say the iron horse is finally heading our way.",
            "Could this be the end of our isolation?",
            "Many hope it brings prosperity, while some fear the inevitable change.",
            "The {demonym} are checking the horizon every morning for steam.",
            "If the {company} comes here, this entire valley will be transformed."
        ]
    },
    
    // --- LEFT BEHIND (GHOST TOWN) ---
    bypassed: {
        setups: [
            "The distant whistle of the {company} train mocks the people of {town}.",
            "Mayor {lastName} stares at the empty horizon, a drafted welcome speech sitting unread on his desk.",
            "Grass grows high on the surveyed dirt where the {company} tracks were supposed to lie.",
            "At the local tavern, {maleName} {lastName} counts his worthless land deeds.",
            "The {demonym} watch bitterly as freight wagons slowly pack up for the multi-day trek east.",
            "Widow {femaleName} {lastName} cancels her trip. The stagecoach fare is simply too high."
        ],
        punchlines: [
            "It seems the iron horse has passed us by for good.",
            "Without the rail, this place will be a ghost town within the decade.",
            "I suppose we'll have to haul our grain fifty miles to the nearest siding.",
            "He whispers into his glass, 'I thought we bribed the right surveyors...'",
            "To think we were so close to joining the modern world.",
            "The youth are already packing their bags to move closer to the {company} railhead."
        ]
    },

    // --- POST-CONNECTION (HISTORY) ---
    connection: {
        civic: {
            setups: ["Mayor {lastName} has declared today a public holiday in {town}.", "A local brass band plays terribly out of tune by the station.", "Crowds gather in the muddy streets of {town}."],
            punchlines: ["The {demonym} cheer as the {company}'s Iron Horse finally arrives.", "A ceremonial silver spike is driven, linking them to the civilized world.", "Civic pride swells, though some wonder if the {company} holds too much power."]
        },
        sentimental: {
            setups: ["Widow {femaleName} {lastName} wept on the wooden platform today.", "A young boy chases the {company} locomotive down the tracks.", "Old {maleName} {lastName} tips his hat to the smoking engine."],
            punchlines: ["Thanks to the {company}, she can finally take the train to visit family out East.", "He dreams of the day he can buy a ticket, leave {town}, and see the ocean.", "He never thought he'd see the day the rails reached this far out."]
        },
        economic: {
            setups: ["Not everyone is celebrating in {town}.", "The stagecoach drivers of {town} watch the smoking engine in bitter silence.", "{maleName} {lastName}, the local tanner, curses the {company}'s arrival."],
            punchlines: ["With the {company} here, their lucrative monopoly on transport has vanished overnight.", "Cheap Eastern catalog goods will soon flood in, threatening local craftsmen.", "Land values near the tracks have tripled, making a few lucky men very rich."]
        },
        baron: {
            setups: ["The Baron slams his fist onto his mahogany desk in Chicago.", "A telegram arrives at the {town} telegraph office, signed by the Baron.", "Pinkerton detectives hired by the Baron were seen taking notes near {town}."],
            punchlines: ["By securing {town}, you just severed one of his most lucrative planned supply routes.", "It reads: 'Enjoy the mud in {town}. We will bankrupt the {company} before the year is out.'", "He vows to run a parallel track and price the {company} out of the region."]
        },
        labor: {
            setups: ["Irish immigrant {maleName} {lastName} leans heavily on his sledgehammer.", "A crew of exhausted gandy dancers sets up camp just outside {town}.", "Tracklayer {maleName} {lastName} rubs his blistered, scarred hands."],
            punchlines: ["It's backbreaking work for a dollar a day, but at least the {town} saloon is open.", "The work is brutal, but a hot meal in {town} beats another night of cold hardtack.", "Several men quit yesterday, but the promise of a steady wage keeps the rest driving steel."]
        }
    }
};

export const generateTownLore = (townName, companyName, mode = 'connection') => {
    let setup, punchline;
    
    if (mode === 'anticipation') {
        setup = pick(loreData.anticipation.setups);
        punchline = pick(loreData.anticipation.punchlines);
    } else if (mode === 'bypassed') {
        setup = pick(loreData.bypassed.setups);
        punchline = pick(loreData.bypassed.punchlines);
    } else {
        const categories = Object.keys(loreData.connection);
        const selectedCategory = pick(categories);
        const loreDef = loreData.connection[selectedCategory];
        setup = pick(loreDef.setups);
        punchline = pick(loreDef.punchlines);
    }

    let rawText = `${setup} ${punchline}`;

    const vars = {
        town: townName || "the settlement",
        company: companyName || "railroad",
        demonym: getDemonym(townName),
        maleName: pick(maleNames),
        femaleName: pick(femaleNames),
        lastName: pick(lastNames)
    };

    rawText = rawText.replace(/{town}/g, vars.town);
    rawText = rawText.replace(/{company}/g, vars.company);
    rawText = rawText.replace(/{demonym}/g, vars.demonym);
    rawText = rawText.replace(/{maleName}/g, vars.maleName);
    rawText = rawText.replace(/{femaleName}/g, vars.femaleName);
    rawText = rawText.replace(/{lastName}/g, vars.lastName);

    return rawText;
};