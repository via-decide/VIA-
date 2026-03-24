// businesses.js — Kutch Digital Map data stub
// Shape: { id, name, category, photo, services, claimed, location, phone }
// Categories: salon | ca | photography | it | pg

const BUSINESSES = [

  // ── SALONS & BOUTIQUE ──
  {
    id: "salon_001",
    name: "Rann Glow Salon",
    category: "salon",
    photo: "https://via.placeholder.com/400x240?text=Rann+Glow+Salon",
    services: ["Haircut", "Facial", "Bridal Makeup", "Threading", "Waxing"],
    claimed: false,
    location: "Bhuj, Kutch",
    phone: ""
  },
  {
    id: "salon_002",
    name: "Shruti Beauty Studio",
    category: "salon",
    photo: "https://via.placeholder.com/400x240?text=Shruti+Beauty+Studio",
    services: ["Hair Colour", "Keratin Treatment", "Nail Art", "Mehendi"],
    claimed: false,
    location: "Gandhidham, Kutch",
    phone: ""
  },
  {
    id: "salon_003",
    name: "The Boutique by Mira",
    category: "salon",
    photo: "https://via.placeholder.com/400x240?text=Boutique+by+Mira",
    services: ["Saree Draping", "Blouse Stitching", "Lehenga Rentals", "Alterations"],
    claimed: false,
    location: "Adipur, Kutch",
    phone: ""
  },

  // ── CAs & ACCOUNTS ──
  {
    id: "ca_001",
    name: "Mehta & Associates",
    category: "ca",
    photo: "https://via.placeholder.com/400x240?text=Mehta+%26+Associates",
    services: ["GST Filing", "Income Tax Returns", "Company Registration", "Audit"],
    claimed: false,
    location: "Bhuj, Kutch",
    phone: ""
  },
  {
    id: "ca_002",
    name: "Shah Tax Consultants",
    category: "ca",
    photo: "https://via.placeholder.com/400x240?text=Shah+Tax+Consultants",
    services: ["TDS Filing", "Balance Sheet", "MSME Registration", "Business Advisory"],
    claimed: false,
    location: "Gandhidham, Kutch",
    phone: ""
  },
  {
    id: "ca_003",
    name: "Rathod Accounts",
    category: "ca",
    photo: "https://via.placeholder.com/400x240?text=Rathod+Accounts",
    services: ["Bookkeeping", "Payroll", "ROC Filing", "Startup Advisory"],
    claimed: false,
    location: "Mundra, Kutch",
    phone: ""
  },

  // ── PHOTOGRAPHY & EVENTS ──
  {
    id: "photo_001",
    name: "Desert Frames Studio",
    category: "photography",
    photo: "https://via.placeholder.com/400x240?text=Desert+Frames+Studio",
    services: ["Wedding Photography", "Pre-Wedding Shoots", "Portrait Sessions", "Album Design"],
    claimed: false,
    location: "Bhuj, Kutch",
    phone: ""
  },
  {
    id: "photo_002",
    name: "Rann Clicks",
    category: "photography",
    photo: "https://via.placeholder.com/400x240?text=Rann+Clicks",
    services: ["Event Coverage", "Corporate Shoots", "Product Photography", "Reels & Videos"],
    claimed: false,
    location: "Gandhidham, Kutch",
    phone: ""
  },
  {
    id: "photo_003",
    name: "Kanth Events & Media",
    category: "photography",
    photo: "https://via.placeholder.com/400x240?text=Kanth+Events",
    services: ["Full Event Management", "Stage Decoration", "Catering Coordination", "Live Streaming"],
    claimed: false,
    location: "Anjar, Kutch",
    phone: ""
  },

  // ── IT & TECH ──
  {
    id: "it_001",
    name: "DigitalKutch Solutions",
    category: "it",
    photo: "https://via.placeholder.com/400x240?text=DigitalKutch+Solutions",
    services: ["Website Development", "Social Media Management", "SEO", "Google My Business Setup"],
    claimed: false,
    location: "Bhuj, Kutch",
    phone: ""
  },
  {
    id: "it_002",
    name: "TechFix Gandhidham",
    category: "it",
    photo: "https://via.placeholder.com/400x240?text=TechFix+Gandhidham",
    services: ["Laptop Repair", "CCTV Installation", "Networking", "Data Recovery"],
    claimed: false,
    location: "Gandhidham, Kutch",
    phone: ""
  },
  {
    id: "it_003",
    name: "Bhuj Byte Works",
    category: "it",
    photo: "https://via.placeholder.com/400x240?text=Bhuj+Byte+Works",
    services: ["App Development", "Tally Integration", "Cloud Setup", "IT AMC"],
    claimed: false,
    location: "Bhuj, Kutch",
    phone: ""
  },

  // ── PG & HOSTEL ──
  {
    id: "pg_001",
    name: "Sunrise PG for Girls",
    category: "pg",
    photo: "https://via.placeholder.com/400x240?text=Sunrise+PG",
    services: ["AC Rooms", "Home Food", "WiFi", "Laundry", "24/7 Security"],
    claimed: false,
    location: "Bhuj, Kutch",
    phone: ""
  },
  {
    id: "pg_002",
    name: "Port City Hostel",
    category: "pg",
    photo: "https://via.placeholder.com/400x240?text=Port+City+Hostel",
    services: ["Dormitory Beds", "Private Rooms", "Mess Facility", "Parking", "Lockers"],
    claimed: false,
    location: "Gandhidham, Kutch",
    phone: ""
  },
  {
    id: "pg_003",
    name: "Kutch Boys PG",
    category: "pg",
    photo: "https://via.placeholder.com/400x240?text=Kutch+Boys+PG",
    services: ["Furnished Rooms", "WiFi", "RO Water", "Study Room", "Weekly Cleaning"],
    claimed: false,
    location: "Adipur, Kutch",
    phone: ""
  }

];

// Category metadata — used for tab labels and filter logic
const CATEGORIES = [
  { id: "all",         label: "All Businesses" },
  { id: "saved",       label: "Saved" },
  { id: "salon",       label: "Salons & Boutique" },
  { id: "ca",          label: "CAs & Accounts" },
  { id: "photography", label: "Photography & Events" },
  { id: "it",          label: "IT & Tech" },
  { id: "pg",          label: "PG & Hostel" }
];

// Website templates metadata
const TEMPLATES = [
  {
    id: "boutique",
    name: "The Boutique",
    description: "Elegant and clean design perfect for salons, spas, and boutique stores.",
    url: "https://via-decide.github.io/templates/salon.html",
    forCategories: ["salon"]
  },
  {
    id: "firm",
    name: "The Firm",
    description: "Professional and trustworthy layout for CAs, lawyers, and consultants.",
    url: "https://via-decide.github.io/templates/finance.html",
    forCategories: ["ca"]
  },
  {
    id: "studio",
    name: "The Studio",
    description: "Portfolio-first design for photographers, event planners, and artists.",
    url: "https://via-decide.github.io/templates/creative.html",
    forCategories: ["photography"]
  }
];

// localStorage key for saved listings
const SAVED_KEY = "via_saved_businesses";

// Helpers
function getSaved() {
  try {
    return JSON.parse(localStorage.getItem(SAVED_KEY)) || [];
  } catch { return []; }
}

function toggleSaved(id) {
  const saved = getSaved();
  const idx = saved.indexOf(id);
  if (idx === -1) saved.push(id);
  else saved.splice(idx, 1);
  localStorage.setItem(SAVED_KEY, JSON.stringify(saved));
  return saved;
}

function isSaved(id) {
  return getSaved().includes(id);
}

function filterByCategory(category) {
  if (category === "all") return BUSINESSES;
  if (category === "saved") {
    const saved = getSaved();
    return BUSINESSES.filter(b => saved.includes(b.id));
  }
  return BUSINESSES.filter(b => b.category === category);
}
