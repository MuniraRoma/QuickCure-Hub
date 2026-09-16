import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/FirstAidTips.css";
import { 
  FaMoon, FaSun, FaHeartbeat, FaBrain, FaHeart,
  FaTint, FaFire, FaLungs, FaPumpSoap, FaBone, FaSkull,
  FaPlus, FaPhoneAlt, FaMapMarkerAlt, FaTimes, FaArrowLeft,
  FaBook, FaAmbulance, FaBandAid, FaNotesMedical, FaSyringe,
  FaPills, FaThermometerHalf, FaWheelchair, FaStethoscope,
  FaList
} from "react-icons/fa";
import { GiBrokenBone, GiSnake, GiDrowning, GiMedicines } from "react-icons/gi";
import { AppContext } from "../Contexts/AppContexts";
import bgImage from "../images/ai.jpg";

function FirstAidTips() {
  const { darkMode, toggleDarkMode, lang, toggleLanguage } = useContext(AppContext);
  const navigate = useNavigate();
  
  const [selectedCondition, setSelectedCondition] = useState(null);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Translation object for UI elements
  const text = {
    en: {
      // Navbar
      home: "Home",
      about: "About",
      contact: "Contact",
      firstAid: "First Aid",
      darkMode: "Dark Mode",
      lightMode: "Light Mode",
      
      // Page Header
      title: "First Aid Tips",
      subtitle: "Get quick emergency care guides for burns, bleeding, choking, and more.",
      
      // Dropdown
      selectCondition: "Select a condition...",
      
      // Sections
      symptoms: "Symptoms",
      firstAid: "First Aid / Cure",
      dangerSigns: "Danger Signs",
      
      // Placeholder
      noSelection: "Select a condition from the dropdown above to view first aid information.",
      
      // Emergency Modal
      emergencyTitle: "Emergency Assistance",
      emergencyDesc: "You've activated the emergency button. Please choose an action:",
      emergencyCall: "Call Emergency Services",
      emergencyHospital: "Find Nearest Hospital",
      emergencyCancel: "Cancel",
      
      // Footer
      copyright: "© 2025 QuickCure Hub. All rights reserved.",
      tagline: "Empowering Health Through Technology"
    },
    bn: {
      // Navbar
      home: "হোম",
      about: "আমাদের সম্পর্কে",
      contact: "যোগাযোগ",
      firstAid: "প্রাথমিক চিকিৎসা",
      darkMode: "ডার্ক মোড",
      lightMode: "লাইট মোড",
      
      // Page Header
      title: "প্রাথমিক চিকিৎসা নির্দেশিকা",
      subtitle: "পোড়া, রক্তপাত, দম বন্ধ হওয়া এবং আরও অনেক কিছুর জন্য দ্রুত জরুরি যত্ন নির্দেশিকা পান।",
      
      // Dropdown
      selectCondition: "একটি রোগ নির্বাচন করুন...",
      
      // Sections
      symptoms: "লক্ষণসমূহ",
      firstAid: "প্রাথমিক চিকিৎসা / করণীয়",
      dangerSigns: "বিপদের লক্ষণ",
      
      // Placeholder
      noSelection: "প্রাথমিক চিকিৎসা তথ্য দেখতে উপরের ড্রপডাউন থেকে একটি রোগ নির্বাচন করুন।",
      
      // Emergency Modal
      emergencyTitle: "জরুরী সহায়তা",
      emergencyDesc: "আপনি জরুরী বাটন সক্রিয় করেছেন। দয়া করে একটি কর্ম নির্বাচন করুন:",
      emergencyCall: "জরুরী পরিষেবা কল করুন",
      emergencyHospital: "নিকটস্থ হাসপাতাল খুঁজুন",
      emergencyCancel: "বাতিল করুন",
      
      // Footer
      copyright: "© ২০২৫ কুইককিউর হাব। সমস্ত অধিকার সংরক্ষিত।",
      tagline: "প্রযুক্তির মাধ্যমে স্বাস্থ্য ক্ষমতায়ন"
    }
  };

  // First Aid Data - Bilingual
  const firstAidData = [
    {
      id: 1,
      category: "heart",
      icon: <FaHeartbeat />,
      title: {
        en: "Low Blood Pressure (Hypotension)",
        bn: "নিম্ন রক্তচাপ (হাইপোটেনশন)"
      },
      symptoms: {
        en: [
          "Lightheadedness or dizziness, especially when standing up",
          "Fainting or feeling like fainting",
          "Blurred or dim vision",
          "Cold, pale, or sweaty (clammy) skin",
          "Extreme tiredness or weakness",
          "Fast, shallow breathing",
          "Confusion (in severe cases)"
        ],
        bn: [
          "দাঁড়ালে মাথা ঘোরা বা হালকা লাগা",
          "অজ্ঞান হয়ে যাওয়া বা অজ্ঞান হওয়ার মতো অনুভূতি",
          "ঝাপসা বা অন্ধকার দৃষ্টি",
          "ঠান্ডা, ফ্যাকাশে বা ঘামে ভেজা (ঝরঝরে) ত্বক",
          "অত্যধিক ক্লান্তি বা দুর্বলতা",
          "দ্রুত ও অগভীর শ্বাস",
          "বিভ্রান্তি (গুরুতর ক্ষেত্রে)"
        ]
      },
      firstAid: {
        en: [
          "Make the person lie down and elevate their legs to improve blood flow to the brain",
          "Give water, ORS, or slightly salty fluids",
          "Loosen tight clothing (belts, collars, etc.)",
          "Keep them in a cool, comfortable environment",
          "Avoid sudden standing or fast movement",
          "If symptoms don't improve, seek medical help"
        ],
        bn: [
          "ব্যক্তিকে শুইয়ে দিন এবং পা উঁচু করে দিন যাতে মস্তিষ্কে রক্ত চলাচল বাড়ে",
          "পানি, ওআরএস বা সামান্য লবণ মেশানো তরল পান করান",
          "টাইট কাপড় (বেল্ট, কলার ইত্যাদি) আলগা করে দিন",
          "ঠান্ডা ও আরামদায়ক পরিবেশে রাখুন",
          "হঠাৎ দাঁড়ানো বা দ্রুত চলাফেরা করতে দেবেন না",
          "লক্ষণ না কমলে দ্রুত চিকিৎসকের কাছে নিয়ে যান"
        ]
      },
      dangerSigns: {
        en: [
          "Repeated fainting",
          "Chest pain",
          "Very slow or very fast pulse",
          "Signs of shock"
        ],
        bn: [
          "বারবার অজ্ঞান হওয়া",
          "বুকে ব্যথা",
          "খুব ধীর বা খুব দ্রুত নাড়ি",
          "শকের লক্ষণ"
        ]
      }
    },
    {
      id: 2,
      category: "heart",
      icon: <FaHeart />,
      title: {
        en: "High Blood Pressure (Hypertension Crisis)",
        bn: "উচ্চ রক্তচাপ (হাইপারটেনশন ক্রাইসিস)"
      },
      symptoms: {
        en: [
          "Sudden, severe headache",
          "Nosebleed",
          "Chest pain or tightness",
          "Vision problems (blurry or double vision)",
          "Difficulty breathing",
          "Confusion or dizziness",
          "Anxiety or restlessness"
        ],
        bn: [
          "হঠাৎ তীব্র মাথাব্যথা",
          "নাক দিয়ে রক্ত পড়া",
          "বুকে ব্যথা বা চাপ",
          "দৃষ্টি ঝাপসা হওয়া বা দ্বিগুণ দেখা",
          "শ্বাসকষ্ট",
          "বিভ্রান্তি বা মাথা ঘোরা",
          "উদ্বেগ বা অস্থিরতা"
        ]
      },
      firstAid: {
        en: [
          "Keep the person seated and calm",
          "Encourage slow, deep breathing",
          "If they have prescribed BP medicine, they may take it",
          "Do NOT give them salt or salty drinks",
          "Keep them away from noise and stress",
          "Seek emergency care if symptoms worsen"
        ],
        bn: [
          "ব্যক্তিকে বসিয়ে শান্ত রাখুন",
          "ধীরে ধীরে গভীর শ্বাস নিতে বলুন",
          "যদি ডাক্তারের দেওয়া রক্তচাপের ওষুধ থাকে, তাহলে সেটি খাওয়াতে পারেন",
          "লবণ বা লবণযুক্ত পানীয় কখনোই দেবেন না",
          "শব্দ ও চাপ থেকে দূরে রাখুন",
          "লক্ষণ বাড়লে বা রক্তচাপ না কমলে জরুরি চিকিৎসা নিন"
        ]
      },
      dangerSigns: {
        en: [
          "Severe chest pain",
          "Shortness of breath",
          "Weakness on one side (possible stroke)",
          "Seizure"
        ],
        bn: [
          "তীব্র বুকে ব্যথা",
          "শ্বাসকষ্ট",
          "শরীরের একপাশ দুর্বল হয়ে যাওয়া (স্ট্রোকের লক্ষণ)",
          "খিঁচুনি"
        ]
      }
    },
    {
      id: 3,
      category: "brain",
      icon: <FaBrain />,
      title: {
        en: "Stroke",
        bn: "স্ট্রোক"
      },
      symptoms: {
        en: [
          "Face: One side droops while smiling",
          "Arm: Weak or unable to raise one arm",
          "Speech: Slurred, confused, or unable to talk",
          "Sudden confusion",
          "Severe headache",
          "Loss of balance or coordination",
          "Sudden vision loss",
          "Dizziness or blackout"
        ],
        bn: [
          "মুখ: হাসলে মুখের একপাশ ঝুলে যাওয়া",
          "হাত: একটি হাত তুলতে না পারা বা দুর্বল লাগা",
          "কথা: জিভ জড়িয়ে যাওয়া, অস্পষ্ট কথা বা কথা বলতে না পারা",
          "হঠাৎ বিভ্রান্তি",
          "প্রচণ্ড মাথাব্যথা",
          "ভারসাম্য হারানো",
          "হঠাৎ দৃষ্টিশক্তি চলে যাওয়া",
          "মাথা ঘোরা বা অজ্ঞান হয়ে যাওয়া"
        ]
      },
      firstAid: {
        en: [
          "Call emergency help immediately - every minute matters",
          "Keep the person lying with head elevated 30°",
          "Loosen tight clothing",
          "Do NOT give food, drink, or medicine (risk of choking)",
          "Stay calm and reassure the person",
          "Monitor breathing and be ready to perform CPR if needed"
        ],
        bn: [
          "তৎক্ষণাৎ জরুরি সেবায় ফোন করুন - প্রতি মিনিট মূল্যবান",
          "ব্যক্তিকে শুইয়ে মাথা ৩০ ডিগ্রি উঁচু করে রাখুন",
          "টাইট কাপড় আলগা করুন",
          "কিছুতেই খাবার, পানি বা ওষুধ দেবেন না (দম বন্ধ হওয়ার ঝুঁকি)",
          "শান্ত থাকুন এবং আশ্বস্ত করুন",
          "শ্বাস-প্রশ্বাসের দিকে নজর রাখুন, প্রয়োজনে সিপিআর শুরু করুন"
        ]
      },
      dangerSigns: {
        en: [
          "Sudden collapse",
          "Unresponsiveness",
          "No pulse or breathing"
        ],
        bn: [
          "হঠাৎ পড়ে যাওয়া",
          "সাড়া না দেওয়া",
          "নাড়ি বা শ্বাস না থাকা"
        ]
      }
    },
    {
      id: 4,
      category: "heart",
      icon: <FaHeart />,
      title: {
        en: "Heart Attack",
        bn: "হার্ট অ্যাটাক"
      },
      symptoms: {
        en: [
          "Heavy pressure or squeezing in the chest",
          "Pain spreading to left arm, jaw, back, or shoulder",
          "Shortness of breath",
          "Cold sweating",
          "Nausea or vomiting",
          "Feeling extremely anxious",
          "Dizziness or fainting"
        ],
        bn: [
          "বুকে ভারী চাপ বা চেপে ধরার মতো ব্যথা",
          "ব্যথা বাঁ হাত, চোয়াল, পিঠ বা কাঁধে ছড়িয়ে পড়া",
          "শ্বাসকষ্ট",
          "ঠান্ডা ঘাম",
          "বমি বমি ভাব বা বমি",
          "অত্যধিক উদ্বিগ্ন লাগা",
          "মাথা ঘোরা বা অজ্ঞান হয়ে যাওয়া"
        ]
      },
      firstAid: {
        en: [
          "Call emergency services immediately",
          "Keep the person sitting upright and calm",
          "Loosen tight clothing",
          "Give aspirin (150–300 mg) to chew if conscious and not allergic",
          "Do NOT allow them to walk around",
          "If unresponsive, start CPR immediately"
        ],
        bn: [
          "তৎক্ষণাৎ জরুরি সেবায় ফোন করুন",
          "ব্যক্তিকে সোজা হয়ে বসিয়ে শান্ত রাখুন",
          "টাইট কাপড় আলগা করুন",
          "যদি অ্যালার্জি না থাকে এবং পুরোপুরি সচেতন থাকে, তাহলে ১৫০-৩০০ মি.গ্রা. অ্যাসপিরিন চিবিয়ে খাওয়ান",
          "হাঁটাহাঁটি করতে দেবেন না",
          "যদি সাড়া না দেয়, তৎক্ষণাৎ সিপিআর শুরু করুন"
        ]
      },
      dangerSigns: {
        en: [
          "Sudden collapse",
          "No breathing",
          "Blue lips or fingertips"
        ],
        bn: [
          "হঠাৎ পড়ে যাওয়া",
          "শ্বাস না চলা",
          "ঠোঁট বা আঙ্গুল নীল হয়ে যাওয়া"
        ]
      }
    },
    {
      id: 5,
      category: "injury",
      icon: <GiSnake />,
      title: {
        en: "Snake Bite",
        bn: "সাপের কামড়"
      },
      symptoms: {
        en: [
          "Sharp pain at bite area",
          "Swelling, bruising, or redness",
          "Two distinct fang marks",
          "Nausea or vomiting",
          "Difficulty breathing or swallowing",
          "Blurred vision",
          "Weakness or fainting"
        ],
        bn: [
          "কামড়ের জায়গায় তীব্র ব্যথা",
          "ফোলা, কালশিটে বা লালচে হওয়া",
          "দুটি স্পষ্ট দাঁতের চিহ্ন",
          "বমি বমি ভাব বা বমি",
          "শ্বাস বা গিলতে কষ্ট",
          "ঝাপসা দৃষ্টি",
          "দুর্বলতা বা অজ্ঞান হয়ে যাওয়া"
        ]
      },
      firstAid: {
        en: [
          "Keep the person calm - movement spreads venom faster",
          "Keep the bitten limb below heart level",
          "Remove rings, bracelets, or tight clothing near the bite",
          "Apply a firm pressure bandage (for non-cobra bites)",
          "Do NOT cut the wound or suck the venom",
          "Do NOT apply ice or chemicals",
          "Quickly transport to hospital for antivenom"
        ],
        bn: [
          "ব্যক্তিকে শান্ত রাখুন - নড়াচড়া করলে বিষ দ্রুত ছড়ায়",
          "কামড়ানো অঙ্গ হৃদয়ের নিচে রাখুন",
          "আংটি, বালা বা টাইট কাপড় খুলে ফেলুন",
          "কোবরা ছাড়া অন্য সাপের কামড়ে মজবুত চাপ ব্যান্ডেজ লাগান",
          "কখনো কাটবেন না, চুষবেন না, বরফ বা রাসায়নিক লাগাবেন না",
          "যত তাড়াতাড়ি সম্ভব হাসপাতালে নিয়ে যান (অ্যান্টিভেনম লাগবে)"
        ]
      },
      dangerSigns: {
        en: [
          "Difficulty breathing",
          "Severe swelling",
          "Unconsciousness"
        ],
        bn: [
          "শ্বাসকষ্ট",
          "তীব্র ফোলা",
          "অজ্ঞান হয়ে যাওয়া"
        ]
      }
    },
    {
      id: 6,
      category: "injury",
      icon: <FaBandAid />,
      title: {
        en: "Minor Injuries (Cuts & Scrapes)",
        bn: "ছোটখাটো আঘাত (কাটা ও ছড়ে যাওয়া)"
      },
      symptoms: {
        en: [
          "Redness or swelling",
          "Mild bleeding",
          "Tenderness or pain around the wound"
        ],
        bn: [
          "লালচে ভাব বা ফোলা",
          "সামান্য রক্তপড়া",
          "জায়গাটি স্পর্শে ব্যথা"
        ]
      },
      firstAid: {
        en: [
          "Wash the wound gently with clean water",
          "Remove any dirt or debris",
          "Apply antiseptic solution or ointment",
          "Cover with sterile bandage or plaster",
          "Keep the area clean and dry",
          "Replace the dressing daily"
        ],
        bn: [
          "পরিষ্কার পানি দিয়ে আলতো করে ধুয়ে ফেলুন",
          "ময়লা বা ধূলিকণা বের করে দিন",
          "অ্যান্টিসেপটিক বা মলম লাগান",
          "জীবাণুমুক্ত ব্যান্ডেজ বা প্লাস্টার দিয়ে ঢেকে দিন",
          "জায়গাটি পরিষ্কার ও শুকনো রাখুন",
          "প্রতিদিন ব্যান্ডেজ বদলান"
        ]
      },
      dangerSigns: {
        en: [
          "Pus or foul smell",
          "Increasing redness spreading outward",
          "Fever (possible infection)"
        ],
        bn: [
          "পুঁজ বা দুর্গন্ধ",
          "চারদিকে লালচে ভাব ছড়িয়ে পড়া",
          "জ্বর (সংক্রমণের লক্ষণ)"
        ]
      }
    },
    {
      id: 7,
      category: "emergency",
      icon: <GiDrowning />,
      title: {
        en: "Drowning",
        bn: "ডুবে যাওয়া"
      },
      symptoms: {
        en: [
          "Unconscious or unresponsive",
          "Not breathing or abnormal breathing",
          "Blue skin, lips, or nails",
          "Weak or no pulse",
          "Vomiting foam or water"
        ],
        bn: [
          "অচেতন বা সাড়া না দেওয়া",
          "শ্বাস না চলা বা অস্বাভাবিক শ্বাস",
          "ত্বক, ঠোঁট বা নখ নীল হয়ে যাওয়া",
          "দুর্বল বা কোনো নাড়ি নেই",
          "মুখ দিয়ে ফেনা বা পানি বের হওয়া"
        ]
      },
      firstAid: {
        en: [
          "Check for breathing",
          "Call emergency services immediately",
          "Start CPR if not breathing: 30 chest compressions, 2 rescue breaths",
          "Continue CPR until help arrives",
          "Ensure head is tilted back to open airway",
          "Keep the person warm after recovery"
        ],
        bn: [
          "শ্বাস আছে কি না দেখুন",
          "তৎক্ষণাৎ জরুরি সেবায় ফোন করুন",
          "শ্বাস না থাকলে সিপিআর শুরু করুন: ৩০ বার বুকে চাপ, ২ বার মুখে শ্বাস",
          "চিকিৎসা সহায়তা না আসা পর্যন্ত সিপিআর চালিয়ে যান",
          "মাথা পিছনে হেলিয়ে শ্বাসনালী খোলা রাখুন",
          "সুস্থ হলে শরীর গরম রাখুন"
        ]
      },
      dangerSigns: {
        en: [
          "No pulse",
          "No breathing",
          "Hypothermia"
        ],
        bn: [
          "নাড়ি না থাকা",
          "শ্বাস না চলা",
          "শরীর ঠান্ডা হয়ে যাওয়া"
        ]
      }
    },
    {
      id: 8,
      category: "injury",
      icon: <FaFire />,
      title: {
        en: "Burns",
        bn: "পোড়া (ত্বক পুড়ে যাওয়া)"
      },
      symptoms: {
        en: [
          "Redness and swelling",
          "Severe pain",
          "Blisters forming",
          "Peeling skin",
          "Charred or white skin (in severe burns)"
        ],
        bn: [
          "লালচে ভাব ও ফোলা",
          "তীব্র ব্যথা",
          "ফোসকা পড়া",
          "ত্বক উঠে যাওয়া",
          "গুরুতর ক্ষেত্রে কালো বা সাদা ত্বক"
        ]
      },
      firstAid: {
        en: [
          "Cool burn under running water for 15-20 minutes",
          "Remove jewelry or tight clothing before swelling starts",
          "Cover with clean, sterile dressing",
          "Apply aloe vera gel or burn cream",
          "Do NOT pop blisters",
          "Do NOT apply toothpaste, butter, oil, or ice",
          "Seek medical help for large, deep, or facial burns"
        ],
        bn: [
          "১৫-২০ মিনিট ঠান্ডা চলন্ত পানির নিচে রাখুন",
          "গয়না বা টাইট কাপড় ফোলার আগেই খুলে ফেলুন",
          "পরিষ্কার জীবাণুমুক্ত কাপড় দিয়ে ঢেকে দিন",
          "অ্যালোভেরা জেল বা বার্ন ক্রিম লাগাতে পারেন",
          "ফোসকা ফাটাবেন না",
          "টুথপেস্ট, মাখন, তেল বা বরফ কখনো লাগাবেন না",
          "মুখে বা বড় জায়গায় পোড়া হলে হাসপাতালে নিয়ে যান"
        ]
      },
      dangerSigns: {
        en: [
          "Difficulty breathing (if inhaled smoke)",
          "Burns larger than the palm",
          "Charring or nerve damage"
        ],
        bn: [
          "ধোঁয়া শ্বাসে নিলে শ্বাসকষ্ট",
          "হাতের তালুর চেয়ে বড় পোড়া",
          "ত্বক পুড়ে কালো হয়ে যাওয়া"
        ]
      }
    },
    {
      id: 9,
      category: "respiratory",
      icon: <FaLungs />,
      title: {
        en: "Cough",
        bn: "কাশি"
      },
      symptoms: {
        en: [
          "Dry or wet cough",
          "Sore or irritated throat",
          "Mild chest discomfort",
          "Fever (sometimes)",
          "Trouble breathing (in severe cases)"
        ],
        bn: [
          "শুকনো বা কফযুক্ত কাশি",
          "গলা চুলকানো বা ব্যথা",
          "বুকে হালকা অস্বস্তি",
          "কখনো জ্বর",
          "গুরুতর ক্ষেত্রে শ্বাসকষ্ট"
        ]
      },
      firstAid: {
        en: [
          "Drink warm water frequently",
          "Use honey, ginger tea, or warm soups",
          "Steam inhalation to open airway",
          "Avoid cold or iced drinks",
          "Take rest and avoid dusty areas",
          "If cough lasts more than 7 days, get medical evaluation"
        ],
        bn: [
          "প্রচুর গরম পানি পান করান",
          "মধু, আদা চা বা গরম স্যুপ খাওয়ান",
          "ভাপ নিতে দিন",
          "ঠান্ডা বা বরফযুক্ত পানীয় এড়িয়ে চলুন",
          "বিশ্রাম নিতে বলুন, ধুলোবালি এড়িয়ে চলুন",
          "৭ দিনের বেশি থাকলে ডাক্তার দেখান"
        ]
      },
      dangerSigns: {
        en: [
          "High fever",
          "Breathing difficulty",
          "Coughing blood"
        ],
        bn: [
          "উচ্চ জ্বর",
          "শ্বাসকষ্ট",
          "কাশির সাথে রক্ত"
        ]
      }
    },
    {
      id: 10,
      category: "digestive",
      icon: <FaPumpSoap />,
      title: {
        en: "Diarrhea",
        bn: "ডায়রিয়া (পাতলা পায়খানা)"
      },
      symptoms: {
        en: [
          "Loose or watery stools",
          "Stomach cramps",
          "Dehydration (dry mouth, little urine)",
          "Weakness or dizziness",
          "Nausea"
        ],
        bn: [
          "পাতলা বা পানির মতো পায়খানা",
          "পেটে মোচড়",
          "ডিহাইড্রেশন (মুখ শুকনো, প্রস্রাব কম)",
          "দুর্বলতা বা মাথা ঘোরা",
          "বমি বমি ভাব"
        ]
      },
      firstAid: {
        en: [
          "Drink ORS after every loose motion",
          "Eat bananas, rice, toast, yogurt (BRAT diet)",
          "Avoid oily, spicy, or unhygienic food",
          "Maintain good hand hygiene",
          "Take zinc tablets if suggested by a doctor",
          "Seek medical help if symptoms persist >3 days"
        ],
        bn: [
          "প্রতিবার পায়খানার পর ওআরএস খাওয়ান",
          "কলা, ভাত, টোস্ট, দই (BRAT ডায়েট) খাওয়ান",
          "তেল-ঝাল বা বাহিরের খাবার এড়িয়ে চলুন",
          "হাত পরিষ্কার রাখুন",
          "ডাক্তারের পরামর্শে জিঙ্ক ট্যাবলেট দিতে পারেন",
          "৩ দিনের বেশি চললে ডাক্তার দেখান"
        ]
      },
      dangerSigns: {
        en: [
          "Blood in stool",
          "Severe dehydration",
          "High fever",
          "Diarrhea lasting more than 72 hours"
        ],
        bn: [
          "পায়খানায় রক্ত",
          "তীব্র ডিহাইড্রেশন",
          "উচ্চ জ্বর",
          "৭২ ঘণ্টার বেশি চলা"
        ]
      }
    },
    {
      id: 11,
      category: "heart",
      icon: <FaSkull />,
      title: {
        en: "Cardiac Arrest",
        bn: "কার্ডিয়াক অ্যারেস্ট"
      },
      symptoms: {
        en: [
          "Sudden collapse",
          "Loss of consciousness",
          "No pulse",
          "No breathing",
          "Abnormal breathing (gasping)",
          "Sudden stop of heartbeat",
          "Bluish or pale skin",
          "Extreme weakness (before collapse)",
          "Dizziness (before arrest)",
          "Chest pain (may occur before arrest)"
        ],
        bn: [
          "হঠাৎ পড়ে যাওয়া",
          "জ্ঞান হারানো / অজ্ঞান হয়ে যাওয়া",
          "নাড়ির স্পন্দন পাওয়া যায় না",
          "শ্বাস-প্রশ্বাস বন্ধ হয়ে যাওয়া",
          "অস্বাভাবিক শ্বাস (হাঁসফাঁস করা)",
          "হার্টের স্পন্দন হঠাৎ বন্ধ হয়ে যাওয়া",
          "ত্বক নীলচে বা ফ্যাকাশে হয়ে যাওয়া",
          "পড়ে যাওয়ার আগে তীব্র দুর্বলতা",
          "মাথা ঘোরা",
          "কখনো কখনো বুকে ব্যথা"
        ]
      },
      firstAid: {
        en: [
          "Check responsiveness",
          "Call emergency services",
          "Check breathing & pulse",
          "Start CPR immediately",
          "30 chest compressions, then 2 rescue breaths",
          "Use AED (Automated External Defibrillator) if available",
          "Continue until help arrives"
        ],
        bn: [
          "রোগী সাড়া দিচ্ছে কি না পরীক্ষা করা",
          "সাথে সাথে জরুরি সেবায় কল করা",
          "শ্বাস-প্রশ্বাস ও নাড়ির স্পন্দন পরীক্ষা করা",
          "সাথে সাথে CPR শুরু করা",
          "৩০ বার বুকে চাপ, তারপর ২ বার শ্বাস দেওয়া",
          "AED থাকলে ব্যবহার করা",
          "চিকিৎসা সহায়তা না আসা পর্যন্ত CPR চালিয়ে যাওয়া"
        ]
      },
      dangerSigns: {
        en: [
          "No pulse",
          "No breathing",
          "Unresponsiveness"
        ],
        bn: [
          "নাড়ি না থাকা",
          "শ্বাস না চলা",
          "সাড়া না দেওয়া"
        ]
      }
    }
  ];

  // Get all conditions for the main dropdown
  const allConditions = [
    { id: "all", name: { en: text.en.selectCondition, bn: text.bn.selectCondition } },
    ...firstAidData.map(condition => ({
      id: condition.id,
      name: { en: condition.title.en, bn: condition.title.bn }
    }))
  ];

  // Handle condition selection from dropdown
  const handleConditionSelect = (e) => {
    const conditionId = parseInt(e.target.value);
    if (conditionId === "all" || isNaN(conditionId)) {
      setSelectedCondition(null);
    } else {
      const condition = firstAidData.find(c => c.id === conditionId);
      setSelectedCondition(condition);
    }
  };

  // Handle scroll to top button visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Find nearby hospitals
  const findHospital = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          window.open(`https://www.google.com/maps/search/hospitals/@${latitude},${longitude},15z`, "_blank");
        },
        () => {
          window.open("https://www.google.com/maps/search/hospitals+near+me", "_blank");
        }
      );
    } else {
      window.open("https://www.google.com/maps/search/hospitals+near+me", "_blank");
    }
    setShowEmergencyModal(false);
  };

  const callEmergency = () => {
    window.location.href = "tel:999";
    setShowEmergencyModal(false);
  };

  return (
    <div className={`firstaid-page ${darkMode ? 'dark-mode' : 'light-mode'}`} data-lang={lang}>
      {/* Background image with overlay */}
      <div className="background-overlay" style={{ backgroundImage: `url(${bgImage})` }}></div>

      {/* Navbar */}
      <nav className="navbar">
        <div className="logo">QuickCure Hub</div>
        <div className="nav-controls">
          <ul className="nav-links">
            <li><Link to="/">{text[lang].home}</Link></li>
            <li><Link to="/about">{text[lang].about}</Link></li>
            <li><Link to="/contact">{text[lang].contact}</Link></li>
            <li><Link to="/first-aid" className="active">{text[lang].firstAid}</Link></li>
          </ul>
          <button className="theme-toggle" onClick={toggleDarkMode}>
            {darkMode ? <FaSun /> : <FaMoon />}
            <span>{darkMode ? text[lang].lightMode : text[lang].darkMode}</span>
          </button>
          <button className="language-toggle" onClick={toggleLanguage}>
            {lang === "en" ? "বাংলা" : "English"}
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="firstaid-main">
        <div className="firstaid-container">
          {/* Centered Title */}
          <div className="firstaid-header-centered">
            <h1 className="firstaid-title">{text[lang].title}</h1>
            <p className="firstaid-subtitle">{text[lang].subtitle}</p>
          </div>

          {/* Main Dropdown - Centered below title */}
          <div className="main-dropdown-container">
            <div className="main-dropdown-wrapper">
              <FaList className="dropdown-icon" />
              <select 
                onChange={handleConditionSelect}
                className="main-category-select"
                value={selectedCondition ? selectedCondition.id : "all"}
              >
                {allConditions.map(option => (
                  <option key={option.id} value={option.id}>
                    {option.name[lang]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Selected Condition Detail View */}
          {selectedCondition ? (
            <div className="condition-detail">
              <div className="detail-card">
                <div className="detail-header">
                  <div className="detail-icon">{selectedCondition.icon}</div>
                  <h2>{selectedCondition.title[lang]}</h2>
                </div>

                <div className="detail-section">
                  <h3>
                    <FaHeartbeat /> {text[lang].symptoms}
                  </h3>
                  <ul className="symptoms-list">
                    {selectedCondition.symptoms[lang].map((symptom, index) => (
                      <li key={index}>{symptom}</li>
                    ))}
                  </ul>
                </div>

                <div className="detail-section">
                  <h3>
                    <FaBandAid /> {text[lang].firstAid}
                  </h3>
                  <ul className="firstaid-list">
                    {selectedCondition.firstAid[lang].map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ul>
                </div>

                <div className="detail-section danger">
                  <h3>
                    <FaSkull /> {text[lang].dangerSigns}
                  </h3>
                  <ul className="danger-list">
                    {selectedCondition.dangerSigns[lang].map((sign, index) => (
                      <li key={index}>{sign}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            /* Placeholder when no condition selected */
            <div className="no-selection">
              <FaNotesMedical className="no-selection-icon" />
              <p>{text[lang].noSelection}</p>
            </div>
          )}
        </div>
      </main>

      {/* Emergency Button */}
      <button className="emergency-btn" onClick={() => setShowEmergencyModal(true)}>
        <FaPlus />
      </button>

      {/* Emergency Modal */}
      {showEmergencyModal && (
        <div className="emergency-modal" onClick={() => setShowEmergencyModal(false)}>
          <div className="emergency-content" onClick={(e) => e.stopPropagation()}>
            <h3>
              <FaPhoneAlt />
              {text[lang].emergencyTitle}
            </h3>
            <p>{text[lang].emergencyDesc}</p>
            <div className="emergency-actions">
              <button className="btn-call" onClick={callEmergency}>
                <FaPhoneAlt />
                {text[lang].emergencyCall}
              </button>
              <button className="btn-call" onClick={findHospital}>
                <FaMapMarkerAlt />
                {text[lang].emergencyHospital}
              </button>
              <button className="btn-cancel" onClick={() => setShowEmergencyModal(false)}>
                <FaTimes />
                {text[lang].emergencyCancel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button className="scroll-top-btn" onClick={scrollToTop}>
          ↑
        </button>
      )}

      {/* Footer */}
      <footer>
        <p>{text[lang].copyright}</p>
        <p className="tagline">{text[lang].tagline}</p>
      </footer>
    </div>
  );
}

export default FirstAidTips;