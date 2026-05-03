const JOBS = [
    { niveau: 1, nom: 'Apprenti',          salaireMin: 10,   salaireMax: 30   },
    { niveau: 2, nom: 'Livreur',            salaireMin: 30,   salaireMax: 60   },
    { niveau: 3, nom: 'Policier',           salaireMin: 60,   salaireMax: 100  },
    { niveau: 4, nom: 'Développeur Junior', salaireMin: 150,  salaireMax: 300  },
    { niveau: 5, nom: 'Inspecteur',         salaireMin: 500,  salaireMax: 900  },
    { niveau: 6, nom: 'Commissaire',        salaireMin: 1000, salaireMax: 1800 },
    { niveau: 7, nom: 'Ingénieur IA',       salaireMin: 1800, salaireMax: 3000 },
];

const SHOP = [
    { id: 1,  nom: "Eau glacée",              prix: 1,       type: "soif",    valeur: 15,  categorie: "nourriture" },
    { id: 2,  nom: "Jus Bissap",              prix: 2,       type: "soif",    valeur: 20,  categorie: "nourriture" },
    { id: 3,  nom: "Plat de Garba",           prix: 3,       type: "faim",    valeur: 20,  categorie: "nourriture" },
    { id: 4,  nom: "Placali Sauce Graine",    prix: 5,       type: "faim",    valeur: 35,  categorie: "nourriture" },
    { id: 5,  nom: "Alloco Poulet",           prix: 7,       type: "faim",    valeur: 40,  categorie: "nourriture" },
    { id: 75, nom: "Pizza Margherita",        prix: 12,      type: "faim",    valeur: 50,  categorie: "nourriture" },
    { id: 76, nom: "Hamburger Deluxe",        prix: 9,       type: "faim",    valeur: 40,  categorie: "nourriture" },
    { id: 77, nom: "Kebab Poulet",            prix: 10,      type: "faim",    valeur: 45,  categorie: "nourriture" },
    { id: 78, nom: "Frites Fromage",          prix: 5,       type: "faim",    valeur: 30,  categorie: "nourriture" },
    { id: 79, nom: "Coca Cola",               prix: 3,       type: "soif",    valeur: 25,  categorie: "nourriture" },
    { id: 80, nom: "Sandwich Thon",           prix: 7,       type: "faim",    valeur: 35,  categorie: "nourriture" },
    { id: 81, nom: "Ice Cream Vanille",       prix: 4,       type: "faim",    valeur: 20,  categorie: "nourriture" },
    { id: 6,  nom: "Paracétamol",             prix: 10,      type: "vie",     valeur: 20,  categorie: "sante"      },
    { id: 7,  nom: "Kit Medical",             prix: 200,     type: "vie",     valeur: 100, categorie: "sante"      },
    { id: 8,  nom: "PlayStation 5",           prix: 600,     type: "gaming",               categorie: "gaming"     },
    { id: 9,  nom: "Xbox Series X",           prix: 650,     type: "gaming",               categorie: "gaming"     },
    { id: 10, nom: "Nintendo Switch",         prix: 400,     type: "gaming",               categorie: "gaming"     },
];

const QUIZ = [
    { question: "La terre tourne autour du soleil ?", reponse: "oui",  gain: 50  },
    { question: "L'eau bout à 80°C ?",                 reponse: "non",  gain: 50  },
    { question: "Paris est la capitale de la France ?", reponse: "oui", gain: 50  },
    { question: "Un carré a 5 côtés ?",               reponse: "non",  gain: 50  },
];

module.exports = { JOBS, SHOP, QUIZ };
