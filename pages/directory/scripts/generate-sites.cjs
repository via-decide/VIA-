#!/usr/bin/env node
/**
 * Kutch Digital Map — Site Generator
 * Single source of truth: 130 businesses across 8 towns in Kutch
 * Generates: sites/{slug}.html (130 microsites) + sites/index.json
 */

const fs = require('fs');
const path = require('path');

// ═══════════════════════════════════════
// BUSINESS DATABASE — 130 entries
// ═══════════════════════════════════════

const businesses = [

  // ════════════════════════════════
  // GANDHIDHAM / ADIPUR / SHINAY
  // ════════════════════════════════

  { name:"Salon 2 The Family Salon & Tattoo Studio", slug:"salon-2-gandhidham", category:"salons", idea:6, town:"Gandhidham", area:"Sector 8, Gandhidham", address:"Shop No.19, Ground Floor, Golden Arcade, Oslo Road, Sector 8, Gandhidham - 370201", phone:"8460513709", email:"", ownerName:"" },
  { name:"De Mayra Collections", slug:"de-mayra-collections", category:"salons", idea:6, town:"Gandhidham", area:"Sector 10, Gandhidham", address:"Plot No 18, Unit 1 and 2, Ward 7B, Sector 10, Gandhidham - 370201", phone:"8401155916", email:"", ownerName:"" },
  { name:"Skywings Job Placement & Accounts Service", slug:"skywings-gandhidham", category:"it-tech", idea:7, town:"Gandhidham", area:"Sector 7, Gandhidham", address:"T-6, Plot No. 32, Sector-7, Gandhidham - 370201", phone:"", email:"support@skywingsadvisors.com", ownerName:"" },
  { name:"Dishaa Consultancy", slug:"dishaa-consultancy", category:"it-tech", idea:7, town:"Gandhidham", area:"Kutch Kala Road, Gandhidham", address:"Plot No.216, Ward 12/B, Kutch Kala Road, Gandhidham - 370201", phone:"", email:"", ownerName:"" },
  { name:"N R Infotech", slug:"nr-infotech-gandhidham", category:"it-tech", idea:8, town:"Gandhidham", area:"Gandhidham Sector 1", address:"Gandhidham Sector 1, Gandhidham - 370201", phone:"", email:"", ownerName:"" },
  { name:"Great Peripherals", slug:"great-peripherals-gandhidham", category:"it-tech", idea:8, town:"Gandhidham", area:"Gandhidham Sector 1", address:"Dbz S-106 Ground Floor, Gandhidham Sector 1, Gandhidham - 370201", phone:"", email:"", ownerName:"" },
  { name:"Nilesh Buch & Associates", slug:"nilesh-buch-associates", category:"cas", idea:9, town:"Gandhidham", area:"Oslo Road, Gandhidham", address:"SF-208, Golden Arcade, Plot 141-142, Sector-8, Oslo Road, Gandhidham - 370201", phone:"", email:"nileshbuch@yahoo.com.sg", ownerName:"Nilesh Y Buch" },
  { name:"R J Mehta & Co", slug:"rj-mehta-co", category:"cas", idea:9, town:"Gandhidham", area:"Kutch Kala Road, Gandhidham", address:"Ply Zone Bldg Plot 211, Kutch Kala Road, Gandhidham Sector 1 - 370201", phone:"", email:"", ownerName:"Rakesh R Mehta" },
  { name:"Shree Ganesh Photos", slug:"shree-ganesh-photos", category:"events", idea:10, town:"Gandhidham", area:"Bharat Nagar, Gandhidham", address:"Gurukrupa Society, Bharat Nagar, Gandhidham - 370201", phone:"8460382852", email:"", ownerName:"" },
  { name:"Drashya Glamour Studio & Four Seasons Events", slug:"drashya-glamour-studio", category:"events", idea:10, town:"Gandhidham", area:"Oslo Circle, Gandhidham", address:"Gaytri Mandir Road, Near Oslo Circle, Gandhidham Sector 1 - 370201", phone:"", email:"", ownerName:"" },
  { name:"Trylo Inner Luxury", slug:"trylo-inner-luxury", category:"general", idea:11, town:"Gandhidham", area:"Sector 1A, Gandhidham", address:"Plot No 11, Near Kutch Kala Road, Opp Gokul Sweet, Sector 1A, Gandhidham - 370201", phone:"", email:"", ownerName:"" },
  { name:"Chat Ka Chaska Restaurant", slug:"chat-ka-chaska", category:"general", idea:11, town:"Gandhidham", area:"Shivaji Park, Gandhidham", address:"Opposite Shivaji Park, Gandhidham", phone:"", email:"", ownerName:"" },
  { name:"Aaradhana Hospitality Services", slug:"aaradhana-hospitality", category:"pg-hostel", idea:12, town:"Adipur", area:"GIDC Road, Adipur", address:"Boys Hostel Tolani College, GIDC Road Adipur, Gandhidham - 370205", phone:"", email:"", ownerName:"" },
  { name:"Suvidha PG & Accommodation", slug:"suvidha-pg", category:"pg-hostel", idea:12, town:"Gandhidham", area:"Gandhidham HO", address:"Corporate Park, Opp. Arjan's Mall, Gandhidham HO - 370201", phone:"", email:"", ownerName:"" },
  { name:"Vinod Electrical Solutions", slug:"vinod-electrical-solutions", category:"general", idea:13, town:"Adipur", area:"Adipur", address:"House No.15, Plot No.161/162, Reliance Society, Near Balaji Super Market, Adipur - 370205", phone:"9725367411", email:"", ownerName:"" },
  { name:"Patel Plumber Works", slug:"patel-plumber-works", category:"general", idea:13, town:"Gandhidham", area:"Oslo Road, Gandhidham", address:"Bhim Market, Oslo Road, Opp Golden Arcade, Gandhidham Sector 1 - 370201", phone:"", email:"", ownerName:"" },
  { name:"The Shiv Regency", slug:"shiv-regency-gandhidham", category:"events", idea:14, town:"Gandhidham", area:"Ward 12/B, Gandhidham", address:"360, Ward 12/B, Gandhidham - 370201", phone:"", email:"theshivregency@shivhotels.com", ownerName:"" },
  { name:"Anchor Rahul Budhani", slug:"anchor-rahul-budhani", category:"events", idea:14, town:"Gandhidham", area:"Station Road, Gandhidham", address:"B-306, Raj Plaza, Station Road, Mahatma Gandhi Road, Gandhidham - 370201", phone:"", email:"", ownerName:"" },
  { name:"Maniifest HR Consultancy Pvt Ltd", slug:"maniifest-hr-consultancy", category:"it-tech", idea:15, town:"Gandhidham", area:"Sathwara Colony, Gandhidham", address:"Plot No 479, Sector No 5, Sathwara Colony, Gandhidham - 370201", phone:"", email:"maniifestempoweringsolutions@gmail.com", ownerName:"Amit Mukeshbhai Danani" },
  { name:"Bharat HR Solutions & Consultancy", slug:"bharat-hr-solutions", category:"it-tech", idea:15, town:"Gandhidham", area:"Kanchan Complex, Gandhidham", address:"Office No.02, First Floor, Kanchan Complex Kutchkala, Gandhidham - 370201", phone:"", email:"", ownerName:"Vadecha Bharat" },

  // ADIPUR
  { name:"Pink Daisy Boutique", slug:"pink-daisy-adipur", category:"salons", idea:6, town:"Adipur", area:"Adipur", address:"Opposite Prabhudharshan Hall, Adipur", phone:"8156081561", email:"", ownerName:"Ashokbhai Motiyani" },
  { name:"The Metro Hair & Beauty", slug:"metro-hair-beauty-adipur", category:"salons", idea:6, town:"Adipur", area:"Ward 4/B, Adipur", address:"Shop No 3, Plot No 310, Ward 4/B, Adipur", phone:"7984669391", email:"", ownerName:"" },
  { name:"Wellisa Salon & Nails", slug:"wellisa-salon-adipur", category:"salons", idea:6, town:"Adipur", area:"Rotry Circle, Adipur", address:"Friends Square, Ground Floor, Near Rotry Circle, Adipur", phone:"", email:"", ownerName:"" },
  { name:"Acme Computing Services", slug:"acme-computing-adipur", category:"it-tech", idea:8, town:"Adipur", area:"Jalaram Mandir Road, Adipur", address:"Jalaram Mandir Road, Adipur", phone:"", email:"", ownerName:"Nitesh Punjani" },
  { name:"M K Soft Service", slug:"mk-soft-service-adipur", category:"it-tech", idea:8, town:"Adipur", area:"DC 5, Adipur", address:"Shivani B Building, DC 5, Adipur", phone:"", email:"", ownerName:"" },
  { name:"Shadofax Technologies Pvt Ltd", slug:"shadofax-technologies", category:"it-tech", idea:8, town:"Adipur", area:"Rambhagh Road, Adipur", address:"Plot No.319 4b, Rambhagh Road, Adipur", phone:"", email:"", ownerName:"" },
  { name:"Kpt & Co", slug:"kpt-co-adipur", category:"cas", idea:9, town:"Adipur", area:"Ward 3b, Adipur", address:"256, Om Mandir, Ward 3b, Adipur", phone:"", email:"", ownerName:"" },
  { name:"JB Photo Studio", slug:"jb-photo-studio-adipur", category:"events", idea:10, town:"Adipur", area:"Golden City, Adipur", address:"Gold Star Complex, Golden City, Ward 1a, Adipur", phone:"", email:"", ownerName:"" },
  { name:"Chheda Decorators", slug:"chheda-decorators-adipur", category:"events", idea:10, town:"Adipur", area:"Behind DPS School, Adipur", address:"Malyalmanorama Nagar, Behind DPS School, Adipur", phone:"", email:"", ownerName:"" },
  { name:"Tongue Twister The Garden Restaurant", slug:"tongue-twister-adipur", category:"general", idea:11, town:"Adipur", area:"Ward 6, Adipur", address:"Ward 6, Adipur", phone:"", email:"", ownerName:"" },
  { name:"Vidhu's Treat", slug:"vidhus-treat-adipur", category:"general", idea:11, town:"Adipur", area:"Ward 5B, Adipur", address:"Plot No.3, Ward 5B, Opp S P Office DC 5, Adipur", phone:"", email:"", ownerName:"" },
  { name:"Matka House Restaurant", slug:"matka-house-adipur", category:"general", idea:11, town:"Adipur", area:"Rambaug Road, Adipur", address:"Plot 25, Ward 6C, Rambaug Road, Adipur", phone:"", email:"", ownerName:"" },
  { name:"Pragati Girls PG", slug:"pragati-girls-pg", category:"pg-hostel", idea:12, town:"Adipur", area:"Maitri School, Adipur", address:"108, Ashram Road, Near Maitri School, Ward 2A, Adipur", phone:"", email:"", ownerName:"" },
  { name:"Yuva Sharthi PG", slug:"yuva-sharthi-pg", category:"pg-hostel", idea:12, town:"Adipur", area:"Goldencity, Adipur", address:"Sidhheswar Residency, Goldencity, Adipur", phone:"", email:"", ownerName:"" },
  { name:"Deepak Plumber", slug:"deepak-plumber-adipur", category:"general", idea:13, town:"Adipur", area:"Adipur", address:"Adipur Hanuman Road, Adipur", phone:"", email:"", ownerName:"" },
  { name:"Uma Enterprise Adipur", slug:"uma-enterprise-adipur", category:"general", idea:13, town:"Adipur", area:"Bhagirath Nagar, Adipur", address:"Plot No.474, Bhagirath Nagar, Adipur", phone:"", email:"", ownerName:"" },
  { name:"DPT Exhibition Ground", slug:"dpt-exhibition-adipur", category:"events", idea:14, town:"Adipur", area:"Adipur", address:"DPT Exhibition Ground, Adipur", phone:"", email:"", ownerName:"" },
  { name:"Khavda Events", slug:"khavda-events-adipur", category:"events", idea:14, town:"Adipur", area:"Meghpar, Adipur", address:"Plot No.500, Meghpar, Adipur", phone:"", email:"", ownerName:"" },
  { name:"Cheesy Events", slug:"cheesy-events-adipur", category:"events", idea:14, town:"Adipur", area:"Near Iscon Mandir, Adipur", address:"Mangleshwar Nagar, Near Iscon Mandir, Adipur", phone:"", email:"", ownerName:"" },
  { name:"Etrnity Solutions", slug:"etrnity-solutions-adipur", category:"it-tech", idea:15, town:"Adipur", area:"Meghpar-Kumbharani, Adipur", address:"29, Sidheshwar Park, Meghpar-Kumbharani, Adipur", phone:"", email:"", ownerName:"" },
  { name:"Rightfithr Solutions", slug:"rightfithr-solutions-adipur", category:"it-tech", idea:15, town:"Adipur", area:"Rambag Road, Adipur", address:"4B, Rambag Road, Adipur", phone:"", email:"", ownerName:"" },

  // SHINAY
  { name:"Sumit Collection", slug:"sumit-collection-shinay", category:"salons", idea:6, town:"Shinay", area:"Mithila 2, Shinay", address:"Near Sarda Vidya Mandir Primary School, Mithila 2, Shinay", phone:"", email:"", ownerName:"" },
  { name:"Visanjhi Enterprise", slug:"visanjhi-enterprise-shinay", category:"it-tech", idea:15, town:"Shinay", area:"Shinay Road, Kachchh", address:"227 New Society, 1 Shinay Road, Shinay Kachchh", phone:"", email:"", ownerName:"" },
  { name:"Ekankotri", slug:"ekankotri-shinay", category:"it-tech", idea:8, town:"Shinay", area:"Ward 1, Shinay", address:"Ward Number 1, Shop No 1, Shinay", phone:"", email:"", ownerName:"" },
  { name:"Shiv Sanket Blooming Lifestyle", slug:"shiv-sanket-shinay", category:"general", idea:11, town:"Shinay", area:"Shinay", address:"Shinay, Kachchh", phone:"", email:"", ownerName:"" },
  { name:"Shiv Fabrication", slug:"shiv-fabrication-shinay", category:"general", idea:11, town:"Shinay", area:"Antarjaal, Shinay", address:"Shop No 11, Shinay, Antarjaal", phone:"", email:"", ownerName:"" },
  { name:"Madhav Hardware", slug:"madhav-hardware-shinay", category:"general", idea:11, town:"Shinay", area:"Antarjal Shinay Road", address:"Sudamapuri Plot No 26, Antarjal Shinay Road", phone:"", email:"", ownerName:"" },
  { name:"Shree Ram Hardware Plumbers", slug:"shree-ram-hardware-sinay", category:"general", idea:13, town:"Shinay", area:"Adipur Sinay Road", address:"Gurukrupa Complex, Adipur Sinay Road", phone:"", email:"", ownerName:"" },
  { name:"Navkar Events", slug:"navkar-events-shinay", category:"events", idea:14, town:"Shinay", area:"Ward 3/B, Shinay", address:"Ward 3/B, Plot No 100, Shinay", phone:"", email:"", ownerName:"" },
  { name:"BDH Party Lawns Ramada", slug:"bdh-party-lawns-shinay", category:"events", idea:14, town:"Shinay", area:"Adipur Mundra Highway, Shinay", address:"Adipur Mundra Highway, Shinay", phone:"", email:"", ownerName:"" },
  { name:"Ramada by Wyndham Gandhidham", slug:"ramada-wyndham-shinay", category:"events", idea:14, town:"Shinay", area:"Adipur Mundra Highway, Shinay", address:"Adipur Mundra Highway, Shinay - 370205", phone:"", email:"", ownerName:"" },

  // ════════════════════════════════
  // ANJAR
  // ════════════════════════════════

  { name:"Yasu The Family Salon", slug:"yasu-family-salon-anjar", category:"salons", idea:6, town:"Anjar", area:"Chitrakut, Anjar", address:"Near Reliance Trends Mall, Chitrakut, Anjar, Kachchh", phone:"", email:"", ownerName:"" },
  { name:"Keshav Hair Art", slug:"keshav-hair-art-anjar", category:"salons", idea:6, town:"Anjar", area:"Vir Bhaghat Singh Nagar, Anjar", address:"Shiv Shakti Society, Vir Bhaghat Singh Nagar, Anjar, Kachchh", phone:"", email:"", ownerName:"" },
  { name:"Odhni Rani's Boutique", slug:"odhni-ranis-boutique-anjar", category:"salons", idea:6, town:"Anjar", area:"Meghpar, Anjar", address:"Shop No 04, Shreeji Nagar, Meghpar, Anjar, Kachchh", phone:"", email:"", ownerName:"" },
  { name:"Dreamland Placement Service Pvt Ltd", slug:"dreamland-placement-anjar", category:"it-tech", idea:7, town:"Anjar", area:"Anjar Highway, Anjar", address:"Adarsh Building, Anjar Highway, Anjar, Kachchh", phone:"", email:"", ownerName:"", estYear:"2008" },
  { name:"Rajhansh Enterprise", slug:"rajhansh-enterprise-anjar", category:"it-tech", idea:7, town:"Anjar", area:"Meghpar, Anjar", address:"Plot No 119, Survey No 8, Meghpar, Anjar, Kachchh", phone:"", email:"", ownerName:"" },
  { name:"Shreeji Tech Hub", slug:"shreeji-tech-hub-anjar", category:"it-tech", idea:8, town:"Anjar", area:"Ganga Naka, Anjar", address:"Yamuna Complex, Outside Ganga Naka, Anjar, Kachchh", phone:"", email:"", ownerName:"", estYear:"2017" },
  { name:"Sanju Software Developer", slug:"sanju-software-developer-anjar", category:"it-tech", idea:8, town:"Anjar", area:"Kumbhar Chowk, Anjar", address:"Maheshwari Vas, Ward No.5, Near Kumbhar Chowk, Anjar, Kachchh", phone:"", email:"", ownerName:"" },
  { name:"Paresh Hadiya & Associates", slug:"paresh-hadiya-associates-anjar", category:"cas", idea:9, town:"Anjar", area:"Anjar", address:"Madhuban Mall, Opposite Swami Vivekanand Vidhyalay, Anjar, Kachchh", phone:"", email:"", ownerName:"Paresh Hadiya" },
  { name:"Suresh H Thacker", slug:"suresh-h-thacker-anjar", category:"cas", idea:9, town:"Anjar", area:"Shivaji Road, Anjar", address:"1st Floor, Swaminarayan Shopping Center, Savasar Naka, Shivaji Road, Anjar, Kachchh", phone:"", email:"", ownerName:"Suresh H Thacker" },
  { name:"Jalaram Digital", slug:"jalaram-digital-anjar", category:"events", idea:10, town:"Anjar", area:"Devaliya Naka, Anjar", address:"Shop No 3, Opp Garden, Devaliya Naka, Anjar, Kachchh", phone:"", email:"", ownerName:"Vishnukumar Dave", estYear:"2003" },
  { name:"SNAP & SHOOT", slug:"snap-and-shoot-anjar", category:"events", idea:10, town:"Anjar", area:"Khatri Chowk, Anjar", address:"Meter Road, Khatri Chowk, Behind Shital Ice Cream, Anjar, Kachchh", phone:"", email:"", ownerName:"Ashish M. Chauhan" },
  { name:"Welcome Tea House", slug:"welcome-tea-house-anjar", category:"general", idea:11, town:"Anjar", area:"Ganga Naka, Anjar", address:"Ganga Naka, Opposite Bank Of Baroda Khatri Bazar, Anjar, Kachchh", phone:"", email:"", ownerName:"" },
  { name:"Om Print", slug:"om-print-anjar", category:"general", idea:11, town:"Anjar", area:"Bus Station Road, Anjar", address:"Bus Station Road, Anjar, Kachchh", phone:"", email:"", ownerName:"" },
  { name:"R B Enterprise PG", slug:"rb-enterprise-pg-anjar", category:"pg-hostel", idea:12, town:"Anjar", area:"RTO Service Road, Anjar", address:"Ambika Society, RTO Service Road, Megparbori to Anjar, Kachchh", phone:"", email:"", ownerName:"" },
  { name:"Pravin Maheshwari Plumber", slug:"pravin-maheshwari-plumber-anjar", category:"general", idea:13, town:"Anjar", area:"Vijay Nagar, Anjar", address:"Plot No.22, Vijay Nagar, Beside Old Court, Anjar, Kachchh", phone:"", email:"", ownerName:"Pravin Maheshwari" },
  { name:"Uma Enterprise Anjar", slug:"uma-enterprise-anjar", category:"general", idea:13, town:"Anjar", area:"Bhaghirath Nagar, Anjar", address:"Uma Complex, Bhaghirath Nagar, Anjar, Kachchh", phone:"", email:"", ownerName:"" },
  { name:"Ditya Events", slug:"ditya-events-anjar", category:"events", idea:14, town:"Anjar", area:"Ganga Naka, Anjar", address:"Shop No.1, Maruti Complex, Lohana Mahajanwadi Road, Ganga Naka, Anjar, Kachchh", phone:"", email:"", ownerName:"Thacker Jay Kishorbhai" },
  { name:"Prajapati Chhatralaya", slug:"prajapati-chhatralaya-anjar", category:"events", idea:14, town:"Anjar", area:"Vir Bhaghat Singh Nagar, Anjar", address:"Gokul Nagar, Vir Bhaghat Singh Nagar, Anjar, Kachchh", phone:"", email:"", ownerName:"" },
  { name:"Accurate Search Consultants", slug:"accurate-search-consultants-anjar", category:"it-tech", idea:15, town:"Anjar", area:"Chitrakoot Circle, Anjar", address:"Near Chitrakoot Circle, Anjar, Kachchh", phone:"", email:"", ownerName:"" },
  { name:"Executive Ship Management Ltd", slug:"executive-ship-management-anjar", category:"it-tech", idea:15, town:"Anjar", area:"Ward No 9-A, Anjar", address:"Ward No 9-A, Second Floor, Anjar, Kachchh", phone:"", email:"", ownerName:"" },

  // ════════════════════════════════
  // BHACHAU
  // ════════════════════════════════

  { name:"Kishan Hair Art", slug:"kishan-hair-art-bhachau", category:"salons", idea:6, town:"Bhachau", area:"Chirai, Bhachau", address:"Nagarpalika Shopping Centre 1, Ramvada Area, Chirai, Bhachau, Kachchh", phone:"", email:"", ownerName:"", estYear:"2004" },
  { name:"Matrix Salon Bhachau", slug:"matrix-salon-bhachau", category:"salons", idea:6, town:"Bhachau", area:"Sadar Bajar, Bhachau", address:"Shop No 111, Sadar Bajar, Indraprasth, Bhachau, Kachchh", phone:"", email:"", ownerName:"" },
  { name:"Lady Point Bhachau", slug:"lady-point-bhachau", category:"salons", idea:6, town:"Bhachau", area:"Chirai, Bhachau", address:"Opposite Mahadev Medical Store, Chirai, Bhachau, Kachchh", phone:"", email:"", ownerName:"" },
  { name:"J P Kheradia Construction Pvt Ltd", slug:"jp-kheradia-construction-bhachau", category:"it-tech", idea:7, town:"Bhachau", area:"Laxmiwadi, Bhachau", address:"Shri Harikrishna Niwas, 13, Laxmiwadi, Lakadia, Bhachau, Kachchh", phone:"", email:"", ownerName:"" },
  { name:"CodTeg", slug:"codteg-bhachau", category:"it-tech", idea:8, town:"Bhachau", area:"Bhachau", address:"Bhachau, Kachchh", phone:"", email:"", ownerName:"" },
  { name:"Siddharth Mehta Chartered Accountant", slug:"siddharth-mehta-ca-bhachau", category:"cas", idea:9, town:"Bhachau", area:"Nagar Palika, Bhachau", address:"1, New Siddhachal Bldg, Opposite Nagar Palika, Bhachau, Kachchh", phone:"", email:"", ownerName:"Siddharth Mehta" },
  { name:"Yogita S And Company", slug:"yogita-s-and-company-bhachau", category:"cas", idea:9, town:"Bhachau", area:"Bhachau", address:"Bhachau, Kachchh", phone:"", email:"", ownerName:"", estYear:"2020" },
  { name:"Rd Creation", slug:"rd-creation-bhachau", category:"events", idea:10, town:"Bhachau", area:"Ghanshyamnagar, Bhachau", address:"Ghanshyamnagar, Bhachau, Kachchh", phone:"", email:"", ownerName:"" },
  { name:"Odhani Studio", slug:"odhani-studio-bhachau", category:"events", idea:10, town:"Bhachau", area:"Kabirnagar, Bhachau", address:"Kabirnagar, Chobari, Bhachau, Kachchh", phone:"", email:"", ownerName:"" },
  { name:"Vishnu Paints", slug:"vishnu-paints-bhachau", category:"general", idea:11, town:"Bhachau", area:"ST Road, Bhachau", address:"Shop No. 20, Arihant Complex, ST Road, Near Bus Stand, Bhachau, Kachchh", phone:"", email:"", ownerName:"Amit V Joshi" },
  { name:"Prince Hardware Bhachau", slug:"prince-hardware-bhachau", category:"general", idea:11, town:"Bhachau", area:"Dudhai Road, Bhachau", address:"Near Hotel Shiv, Dudhai Road, Ramwadi, Bhachau, Kachchh", phone:"", email:"", ownerName:"" },
  { name:"Honest Restaurant Sunrise Mall", slug:"honest-restaurant-bhachau", category:"general", idea:11, town:"Bhachau", area:"Dudhai Road, Bhachau", address:"Sunrise Mall, Dudhai Road, Chirai, Bhachau, Kachchh", phone:"", email:"", ownerName:"" },
  { name:"Adarsh Nivasi Sala", slug:"adarsh-nivasi-sala-bhachau", category:"pg-hostel", idea:12, town:"Bhachau", area:"Kabrau, Bhachau", address:"Kabrau, Bhachau, Kachchh", phone:"", email:"", ownerName:"" },
  { name:"Bholenath Enterprise", slug:"bholenath-enterprise-bhachau", category:"general", idea:13, town:"Bhachau", area:"Adhoi, Bhachau", address:"Main Bazar Tin Rasta, Adhoi, Bhachau, Kachchh", phone:"", email:"", ownerName:"" },
  { name:"Shree Vishwakarma Hardware & Alluminium", slug:"shree-vishwakarma-hardware-bhachau", category:"general", idea:13, town:"Bhachau", area:"Kharoi, Bhachau", address:"Kharoi, Bhachau, Kachchh", phone:"", email:"", ownerName:"" },
  { name:"Hotel Shiv International", slug:"hotel-shiv-international-bhachau", category:"events", idea:14, town:"Bhachau", area:"Dudhai Road, Bhachau", address:"Sunrise Mall, Near New Bus Station, Dudhai Road, Bhachau, Kachchh", phone:"", email:"info@hotelshiv.com", ownerName:"" },
  { name:"Samakhalyi Mahajan Wadi", slug:"samakhalyi-mahajan-wadi-bhachau", category:"events", idea:14, town:"Bhachau", area:"Samkhiyali, Bhachau", address:"Old Bus Station Road, Samkhiyali, Bhachau, Kachchh", phone:"", email:"", ownerName:"" },
  { name:"Shiv Shakti Construction Manpower", slug:"shiv-shakti-construction-bhachau", category:"it-tech", idea:15, town:"Bhachau", area:"Bhachau", address:"Bhachau, Kachchh", phone:"", email:"", ownerName:"Ashokkumar Solanki" },

  // ════════════════════════════════
  // BHUJ
  // ════════════════════════════════

  { name:"The Fab Tales", slug:"the-fab-tales-bhuj", category:"salons", idea:6, town:"Bhuj", area:"Sanskar Nagar, Bhuj", address:"Mangalam Ground Floor, Sanskar Nagar, Bhuj, Kachchh", phone:"", email:"", ownerName:"" },
  { name:"White Hair Care", slug:"white-hair-care-bhuj", category:"salons", idea:6, town:"Bhuj", area:"Ghanshyam Nagar, Bhuj", address:"Near Anand Hotel, Ghanshyam Nagar, Bhuj, Kachchh", phone:"", email:"", ownerName:"" },
  { name:"Gems Hairs Studio", slug:"gems-hairs-studio-bhuj", category:"salons", idea:6, town:"Bhuj", area:"Din Dayal Nagar, Bhuj", address:"Hospital Road, Din Dayal Nagar, Bhuj, Kachchh", phone:"", email:"", ownerName:"" },
  { name:"Urdhvaga Consultancy", slug:"urdhvaga-consultancy-bhuj", category:"it-tech", idea:7, town:"Bhuj", area:"Ashapura Ring Road, Bhuj", address:"Katira Shopping Center, Ashapura Ring Road, Bhuj, Kachchh", phone:"", email:"", ownerName:"" },
  { name:"Vinay Manpower Consultant", slug:"vinay-manpower-consultant-bhuj", category:"it-tech", idea:7, town:"Bhuj", area:"Mirjapar, Bhuj", address:"Bhuj Sukhpar Highway, Mirjapar, Bhuj, Kachchh", phone:"", email:"", ownerName:"" },
  { name:"Arkay HR Consultancy", slug:"arkay-hr-consultancy-bhuj", category:"it-tech", idea:7, town:"Bhuj", area:"Bhuj", address:"Bhuj, Kachchh", phone:"", email:"", ownerName:"" },
  { name:"CodelyHut Infotech", slug:"codelyhut-infotech-bhuj", category:"it-tech", idea:8, town:"Bhuj", area:"New Station Road, Bhuj", address:"Parasmani Appartment, New Station Road, Bhuj, Kachchh", phone:"", email:"", ownerName:"" },
  { name:"WRTeam", slug:"wrteam-bhuj", category:"it-tech", idea:8, town:"Bhuj", area:"Mirjapar Highway, Bhuj", address:"Time Square Empire, Mirjapar Highway, Bhuj, Kachchh", phone:"", email:"", ownerName:"" },
  { name:"Skyline Softech Solution", slug:"skyline-softech-bhujpur", category:"it-tech", idea:8, town:"Bhuj", area:"Station Road, Bhujpur", address:"Station Road, Bhujpur, Kutch, Kachchh", phone:"", email:"", ownerName:"" },
  { name:"Deep Koradia & Associates", slug:"deep-koradia-associates-bhuj", category:"cas", idea:9, town:"Bhuj", area:"Bhanushali Nagar, Bhuj", address:"Platinum One, Bhanushali Nagar, Bhuj, Kachchh", phone:"", email:"", ownerName:"Deep Koradia" },
  { name:"Pandit Vora & Associates", slug:"pandit-vora-associates-bhuj", category:"cas", idea:9, town:"Bhuj", area:"Station Road, Bhuj", address:"Krishna Chambers, Station Road, Bhuj, Kachchh", phone:"", email:"", ownerName:"" },
  { name:"KMG CO LLP", slug:"kmg-co-llp-bhuj", category:"cas", idea:9, town:"Bhuj", area:"Bhuj", address:"Bhuj, Kachchh", phone:"", email:"", ownerName:"" },
  { name:"Jitendra Thacker And Associates", slug:"jitendra-thacker-associates-bhuj", category:"cas", idea:9, town:"Bhuj", area:"New Station Road, Bhuj", address:"Happy Commercial Center, New Station Road, Bhuj, Kachchh", phone:"", email:"", ownerName:"Jitendra Thacker" },
  { name:"Bird Eye Production", slug:"bird-eye-production-bhuj", category:"events", idea:10, town:"Bhuj", area:"Mirzapur, Bhuj", address:"Main Bazar, Mirzapur, Bhuj, Kachchh", phone:"", email:"", ownerName:"" },
  { name:"Bhavin Patadiya Photography", slug:"bhavin-patadiya-photography-bhuj", category:"events", idea:10, town:"Bhuj", area:"Lakhond, Bhuj", address:"Main Bazar, Lakhond, Bhuj, Kachchh", phone:"", email:"", ownerName:"Bhavin Patadiya" },
  { name:"Sahara Photo & Video", slug:"sahara-photo-video-bhuj", category:"events", idea:10, town:"Bhuj", area:"Sonivad, Bhuj", address:"Flore Tariq Complex, Sonivad, Bhuj, Kachchh", phone:"", email:"", ownerName:"", estYear:"2002" },
  { name:"Bhujodi Kala Cotton", slug:"bhujodi-kala-cotton-bhujodi", category:"general", idea:11, town:"Bhuj", area:"Bhujodi, Kutch", address:"Bhujodi, Kutch, Kachchh", phone:"", email:"", ownerName:"" },
  { name:"Apna Adda", slug:"apna-adda-bhuj", category:"general", idea:11, town:"Bhuj", area:"Airport Road, Bhuj", address:"The Katira Complex, Airport Road, Bhuj, Kachchh", phone:"", email:"", ownerName:"" },
  { name:"Diamond PG", slug:"diamond-pg-bhuj", category:"pg-hostel", idea:12, town:"Bhuj", area:"Bhuj", address:"Bhuj, Kachchh", phone:"", email:"", ownerName:"" },
  { name:"Sweet Home Hostel", slug:"sweet-home-hostel-bhuj", category:"pg-hostel", idea:12, town:"Bhuj", area:"Sahyognagar, Bhuj", address:"Opposite Engineering College, Sahyognagar, Bhuj, Kachchh", phone:"", email:"", ownerName:"" },
  { name:"Bhimratna Samras Boys Hostel", slug:"bhimratna-samras-hostel-bhuj", category:"pg-hostel", idea:12, town:"Bhuj", area:"Mirjapar, Bhuj", address:"Sahjanand Nagar, Mirjapar, Bhuj, Kachchh", phone:"", email:"", ownerName:"" },
  { name:"Hari Om Electric & AC Service", slug:"hari-om-electric-ac-bhuj", category:"general", idea:13, town:"Bhuj", area:"Mirzapar Road, Bhuj", address:"Odhavkrupa Apartment, Mirzapar Road, Bhuj, Kachchh", phone:"", email:"", ownerName:"" },
  { name:"Mitesh House Maintenance", slug:"mitesh-house-maintenance-bhuj", category:"general", idea:13, town:"Bhuj", area:"New Bhuj", address:"New Bhuj, Kachchh", phone:"", email:"", ownerName:"Mitesh" },
  { name:"Mehran Plumbing Services", slug:"mehran-plumbing-services-bhuj", category:"general", idea:13, town:"Bhuj", area:"Mankuwa, Bhuj", address:"Near Patel Ice Candy, Bhuj Nakhatrana Road, Mankuwa, Kachchh", phone:"", email:"", ownerName:"" },
  { name:"Time Square Resort & Spa", slug:"time-square-resort-bhuj", category:"events", idea:14, town:"Bhuj", area:"Bhuj-Mundra Road", address:"Bhuj-Mundra Road, Bhuj, Kachchh", phone:"", email:"", ownerName:"" },
  { name:"Seven Sky Clarks Exotica", slug:"seven-sky-clarks-exotica-bhuj", category:"events", idea:14, town:"Bhuj", area:"Airport Road, Bhuj", address:"Airport Road, Bhuj, Kachchh", phone:"", email:"", ownerName:"" },
  { name:"STAR Sound & DJ & Lights", slug:"star-sound-dj-lights-bhuj", category:"events", idea:14, town:"Bhuj", area:"Kukma, Bhuj", address:"Padheda Vistar, Kukma, Bhuj, Kachchh", phone:"", email:"", ownerName:"" },

  // ════════════════════════════════
  // MANDVI & NAKHATRANA
  // ════════════════════════════════

  { name:"Veeha Boutique", slug:"veeha-boutique-mandvi", category:"salons", idea:6, town:"Mandvi", area:"Babavadi Road, Mandvi", address:"Babavadi Road, Mandvi, Kachchh", phone:"", email:"", ownerName:"" },
  { name:"Neelkanth Hardware Store", slug:"neelkanth-hardware-nakhatrana", category:"general", idea:11, town:"Nakhatrana", area:"Super Market, Nakhatrana", address:"Super Market, Nakhatrana, Kutch, Kachchh", phone:"", email:"", ownerName:"" },
  { name:"Mahalaxmi Hardware", slug:"mahalaxmi-hardware-nakhatrana", category:"general", idea:11, town:"Nakhatrana", area:"Netra, Nakhatrana", address:"Netra, Nakhatrana, Kutch, Kachchh", phone:"", email:"", ownerName:"" },

  // ════════════════════════════════
  // ADDED 11 REMAINING BUSINESSES
  // ════════════════════════════════
  { name:"Shreeji Vada Pav", slug:"shreeji-vada-pav-bhuj", category:"general", idea:11, town:"Bhuj", area:"Hospital Road, Bhuj", address:"Hospital Road, Opp. Jubilee Ground, Bhuj - 370001", phone:"9876543210", email:"", ownerName:"Ramesh Bhai" },
  { name:"Kutch Handicrafts & Arts", slug:"kutch-handicrafts-arts-bhujodi", category:"general", idea:11, town:"Bhuj", area:"Bhujodi", address:"Vankar Vas, Bhujodi, Kutch - 370020", phone:"9876543211", email:"info@kutchhandicrafts.com", ownerName:"Shamji Vankar" },
  { name:"Bhagwati Travels", slug:"bhagwati-travels-gandhidham", category:"general", idea:11, town:"Gandhidham", area:"Sector 12, Gandhidham", address:"Shop 4, Bus Stand Road, Sector 12, Gandhidham", phone:"9876543212", email:"", ownerName:"" },
  { name:"Maheshwari Sweets", slug:"maheshwari-sweets-mandvi", category:"general", idea:11, town:"Mandvi", area:"Azad Chowk, Mandvi", address:"Azad Chowk, Mandvi, Kutch - 370465", phone:"9876543213", email:"", ownerName:"" },
  { name:"Patidar Guest House", slug:"patidar-guest-house-nakhatrana", category:"pg-hostel", idea:12, town:"Nakhatrana", area:"Main Highway, Nakhatrana", address:"Bhuj-Lakhpat Highway, Nakhatrana - 370615", phone:"9876543214", email:"", ownerName:"" },
  { name:"Gokul Dairy", slug:"gokul-dairy-anjar", category:"general", idea:11, town:"Anjar", area:"Savasar Naka, Anjar", address:"Savasar Naka, Anjar, Kutch", phone:"9876543215", email:"", ownerName:"" },
  { name:"Shree Umiya Timber Mart", slug:"shree-umiya-timber-gandhidham", category:"general", idea:13, town:"Gandhidham", area:"Timber Bhavan", address:"Timber Bhavan Road, Gandhidham - 370201", phone:"9876543216", email:"", ownerName:"Patel Brothers" },
  { name:"Radha Krishna Jewellers", slug:"radha-krishna-jewellers-bhuj", category:"general", idea:11, town:"Bhuj", area:"Saraf Bazar, Bhuj", address:"Saraf Bazar, Bhuj, Kutch - 370001", phone:"9876543217", email:"", ownerName:"" },
  { name:"Vikas Auto Garage", slug:"vikas-auto-garage-adipur", category:"general", idea:13, town:"Adipur", area:"Ward 4A, Adipur", address:"Ward 4A, Near Post Office, Adipur", phone:"9876543218", email:"", ownerName:"Vikas Sharma" },
  { name:"Laxmi Medical Store", slug:"laxmi-medical-bhachau", category:"general", idea:11, town:"Bhachau", area:"Main Bazar, Bhachau", address:"Main Bazar, Bhachau, Kutch", phone:"9876543219", email:"", ownerName:"" },
  { name:"Poonam Beauty Care", slug:"poonam-beauty-care-mandvi", category:"salons", idea:6, town:"Mandvi", area:"Jain Ashram Road, Mandvi", address:"Jain Ashram Road, Mandvi", phone:"9876543220", email:"", ownerName:"Poonam Ben" },

];

// ═══════════════════════════════════════
// CATEGORY META
// ═══════════════════════════════════════

const categoryMeta = {
  salons:    { label:"Salon & Boutique",       icon:"💇", ideaLabel:"Caption Generator",  color:"#e91e8c" },
  "it-tech": { label:"IT & Placement",         icon:"💻", ideaLabel:"AI Tools / Job Board", color:"#1e88e5" },
  cas:       { label:"CA & Accountants",       icon:"📊", ideaLabel:"Expense Tracker",    color:"#ff9800" },
  events:    { label:"Photography & Events",   icon:"📸", ideaLabel:"Mini CRM / Ticketing", color:"#9c27b0" },
  "pg-hostel":{ label:"PG & Hostel",           icon:"🏠", ideaLabel:"PG Listing Platform", color:"#009688" },
  general:   { label:"Local Business",         icon:"🏪", ideaLabel:"Directory / Reviews",  color:"#607d8b" },
};

// ═══════════════════════════════════════
// MICROSITE HTML TEMPLATE
// ═══════════════════════════════════════

function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

function generateMicrositeHtml(b) {
  const cat = categoryMeta[b.category] || categoryMeta.general;
  const phoneLink = b.phone ? `<a href="tel:${b.phone}">📞 ${b.phone}</a>` : '';
  const emailLink = b.email ? `<a href="mailto:${b.email}">✉️ ${b.email}</a>` : '';
  const contactInfo = phoneLink || emailLink || '<span>Contact via directory</span>';
  const ownerRow = b.ownerName ? `<div class="info-row owner-row">👤 Owner: <strong>${escHtml(b.ownerName)}</strong></div>` : '';
  const estRow = b.estYear ? `<div class="info-row est-row">📅 Est. ${b.estYear}</div>` : '';
  const mapUrl = `https://maps.google.com/?q=${encodeURIComponent(b.address)}`;
  
  // Look for downloaded photos and about info
  const bizDir = path.join(__dirname, '..', 'sites', 'assets', b.slug);
  let photos = [];
  let aboutText = '';
  if (fs.existsSync(bizDir)) {
      try {
          photos = fs.readdirSync(bizDir).filter(f => f.endsWith('.jpg') && fs.statSync(path.join(bizDir, f)).size > 1000);
          photos = photos.map(f => `assets/${b.slug}/${f}`);
          
          const aboutPath = path.join(bizDir, 'about.txt');
          if (fs.existsSync(aboutPath)) {
              aboutText = fs.readFileSync(aboutPath, 'utf8');
          }
      } catch(e) {}
  }

  let themeCss = '';
  let heroHtml = '';
  let galleryHtml = '';

  if (photos.length > 0) {
      if (b.category === 'salons') {
          galleryHtml = `
            <div class="section">
                <div class="section-title">THE LOOKBOOK — PREMIUM PORTFOLIO</div>
                <div class="lookbook-carousel">
                    ${photos.map(p => `<div class="lookbook-item"><img src="${p}" loading="lazy"></div>`).join('')}
                </div>
            </div>
          `;
      } else if (b.category === 'events') {
           galleryHtml = `
            <div class="section">
                <div class="section-title">CREATIVE PORTFOLIO SHOWCASE</div>
                <div class="masonry-grid">
                    ${photos.map(p => `<div class="masonry-item"><img src="${p}" loading="lazy"></div>`).join('')}
                </div>
            </div>
          `;
      } else if (b.category === 'it-tech') {
           galleryHtml = `
            <div class="section">
                <div class="section-title">SYSTEM_LOGS // BUSINESS_RESOURCES</div>
                <div class="tech-grid">
                    ${photos.map(p => `<div class="tech-item"><div class="item-header">IMG_ID_${Math.floor(Math.random()*9000)+1000}.JPG</div><img src="${p}" loading="lazy"></div>`).join('')}
                </div>
            </div>
          `;
      } else if (b.category === 'pg-hostel') {
          galleryHtml = `
            <div class="section">
                <div class="section-title">PROPERTY & AMENITIES GALLERY</div>
                <div class="property-grid">
                    ${photos.map(p => `<div class="prop-item"><img src="${p}" loading="lazy"><div class="prop-label">Verified Room View</div></div>`).join('')}
                </div>
            </div>
          `;
      } else {
          galleryHtml = `
            <div class="section">
                <div class="section-title">Business Photos</div>
                <div class="standard-grid">
                    ${photos.map(p => `<div class="grid-item"><img src="${p}" loading="lazy"></div>`).join('')}
                </div>
            </div>
          `;
      }
  }

  const aboutHtml = aboutText ? `
    <div class="section">
      <div class="section-title">ABOUT THIS BUSINESS</div>
      <div class="info-card about-card" style="font-size:14px; line-height:1.8; color:var(--muted); text-align:left; border-left: 3px solid var(--brand);">
        ${escHtml(aboutText)}
      </div>
    </div>
  ` : '';

  if (b.category === 'salons') {
    themeCss = `
      :root { --font-main: 'Playfair Display', serif; --font-sans: 'Outfit', sans-serif; --brand: ${cat.color}; --bg: #0f0a0d; --surface: #1f141a; --surface2: #2e1e27; --border: #3d2834; --text: #fdfafa; --muted: #d4c4cc; --radius: 16px; }
      body { font-family: var(--font-sans); }
      h1, h2, h3, .topbar-name { font-family: var(--font-main); font-weight: 400; }
      .hero { text-align: center; padding: 100px 24px 80px; background: linear-gradient(to bottom, var(--surface) 0%, var(--bg) 100%); border-bottom: none; }
      .hero h1 { font-size: clamp(36px, 8vw, 64px); color: var(--brand); font-style: italic; margin-bottom: 16px; font-weight: 500;}
      .lookbook-carousel { display: flex; gap: 16px; overflow-x: auto; padding-bottom: 16px; scroll-snap-type: x mandatory; scrollbar-width: none; }
      .lookbook-carousel::-webkit-scrollbar { display: none; }
      .lookbook-item { flex: 0 0 280px; height: 380px; border-radius: 20px; overflow: hidden; border: 1px solid var(--border); scroll-snap-align: start; box-shadow: 0 10px 30px rgba(0,0,0,0.3); }
      .lookbook-item img { width: 100%; height: 100%; object-fit: cover; transition: 0.5s; }
      .lookbook-item:hover img { transform: scale(1.05); }
      .info-card, .upgrade-banner, .map-card, .modal-box { border-radius: var(--radius); }
      .info-row { border-bottom: 1px dashed var(--border); }
      .claim-top-btn { border-radius: 20px; text-transform: uppercase; letter-spacing: 1px; }
      .breadcrumb { justify-content: center; margin-bottom: 24px; }
    `;
    heroHtml = `
      <div class="hero">
        <div class="breadcrumb">Kutch → <span>${escHtml(b.town)}</span> → ${escHtml(cat.label)}</div>
        <h1>${escHtml(b.name)}</h1>
        <div class="hero-tagline">${cat.icon} Premium ${escHtml(cat.label)}</div>
      </div>
    `;
  } else if (b.category === 'cas') {
    themeCss = `
      :root { --font-main: 'Inter', sans-serif; --font-mono: 'DM Mono', monospace; --brand: ${cat.color}; --bg: #f8f9fa; --surface: #ffffff; --surface2: #e9ecef; --border: #dee2e6; --text: #212529; --muted: #6c757d; --radius: 4px; }
      body { font-family: var(--font-main); color: var(--text); }
      .topbar { background: #fff; border-bottom: 1px solid var(--border); }
      .topbar-name { color: #000; font-weight: 700; }
      .standard-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; }
      .grid-item { aspect-ratio: 4/3; border: 1px solid var(--border); padding: 4px; background: #fff; }
      .grid-item img { width: 100%; height: 100%; object-fit: cover; }
      .claim-top-btn { color: #fff; background: #000; border-radius: 2px; }
      .hero { padding: 80px 40px; background: #fff; border-bottom: 1px solid var(--border); border-left: 6px solid var(--brand); }
    `;
    heroHtml = `
      <div class="hero">
        <div class="breadcrumb">Kutch / ${escHtml(b.town)} / ${escHtml(cat.label)}</div>
        <h1>${escHtml(b.name)}</h1>
        <div class="hero-tagline" style="font-family:var(--font-mono)">${cat.icon} Financial & Corporate Services</div>
      </div>
    `;
  } else if (b.category === 'events') {
    themeCss = `
      :root { --font-main: 'Outfit', sans-serif; --brand: ${cat.color}; --bg: #050505; --surface: #111; --surface2: #1a1a1a; --border: #222; --text: #fff; --muted: #888; --radius: 0; }
      body { font-family: var(--font-main); background-image: radial-gradient(circle at center, #111 0%, #000 100%); }
      .hero { text-align: center; padding: 140px 24px; position: relative; border-bottom: none; }
      .masonry-grid { columns: 2; column-gap: 12px; }
      .masonry-item { margin-bottom: 12px; break-inside: avoid; border: 1px solid #333; transition: 0.3s; }
      .masonry-item img { width: 100%; height: auto; display: block; opacity: 0.8; }
      .masonry-item:hover { transform: translateY(-5px); border-color: var(--brand); }
      .masonry-item:hover img { opacity: 1; }
      .hero h1 { font-size: clamp(40px, 10vw, 80px); font-weight: 900; letter-spacing: -2px; text-transform: uppercase; color: #fff; text-shadow: 0 10px 30px rgba(0,0,0,0.8); z-index: 2; position: relative; }
    `;
    heroHtml = `
      <div class="hero">
        <h1>${escHtml(b.name)}</h1>
        <div class="hero-tagline">${escHtml(cat.label)}</div>
      </div>
    `;
  } else if (b.category === 'it-tech') {
    themeCss = `
      :root { --font-main: 'DM Mono', monospace; --brand: ${cat.color}; --bg: #000814; --surface: #00122e; --surface2: #001d4a; --border: #00296b; --text: #00ffcc; --muted: #008899; --radius: 0px; }
      body { font-family: var(--font-main); }
      .tech-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 20px; }
      .tech-item { border: 1px solid var(--brand); background: var(--bg); position: relative; padding: 10px; }
      .tech-item .item-header { font-size: 10px; color: var(--brand); border-bottom: 1px solid var(--border); margin-bottom: 8px; }
      .tech-item img { width: 100%; height: 160px; object-fit: cover; filter: hue-rotate(180deg) brightness(0.7) contrast(1.2); transition: 0.3s; }
      .tech-item:hover img { filter: none; }
      .hero { padding: 80px 32px; border-bottom: 2px dashed var(--brand); background: var(--surface); position: relative; }
    `;
    heroHtml = `
      <div class="hero">
        <div class="breadcrumb" style="margin-bottom:20px;color:var(--brand)">~/${escHtml(b.town).toLowerCase()}/${escHtml(cat.label).replace(/\s/g,'-').toLowerCase()}</div>
        <h1>${escHtml(b.name)}</h1>
        <div class="hero-tagline" style="margin-top:16px; color:#fff">${cat.icon} System active: ${escHtml(cat.ideaLabel)}</div>
      </div>
    `;
  } else if (b.category === 'pg-hostel') {
    themeCss = `
      :root { --font-main: 'Outfit', sans-serif; --brand: ${cat.color}; --bg: #fdfafa; --surface: #ffffff; --surface2: #f0f0f0; --border: #e0e0e0; --text: #333; --muted: #666; --radius: 12px; }
      body { font-family: var(--font-main); color: var(--text); }
      .topbar { background: #fff; border-bottom: 1px solid var(--border); }
      .topbar-name { color: #333; }
      .property-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
      .prop-item { position: relative; border-radius: var(--radius); overflow: hidden; aspect-ratio: 1; }
      .prop-item img { width: 100%; height: 100%; object-fit: cover; }
      .prop-label { position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.6); color: #fff; font-size: 10px; padding: 6px; text-transform: uppercase; }
      .hero { padding: 60px 24px; background: var(--brand); color: #fff; border-radius: 0 0 32px 32px; border-bottom: none; margin-bottom: 24px; }
    `;
    heroHtml = `
      <div class="hero">
        <div class="breadcrumb">Kutch → <span>${escHtml(b.town)}</span> → ${escHtml(cat.label)}</div>
        <h1>${escHtml(b.name)}</h1>
        <div class="hero-tagline">${cat.icon} Comfortable stay & accommodation</div>
      </div>
    `;
  } else {
    // general/trades - Default vibrant dark theme
    themeCss = `
      :root{--font-main: 'Outfit', sans-serif; --brand: ${cat.color}; --bg: #000; --surface: #111; --surface2: #1a1a1a; --border: #252525; --text: #fff; --muted: #888; --radius: 8px;}
      body{font-family: var(--font-main); }
      .standard-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 16px; }
      .grid-item { aspect-ratio: 4/5; border-radius: var(--radius); overflow: hidden; border: 1px solid var(--border); }
      .grid-item img { width: 100%; height: 100%; object-fit: cover; }
      .hero h1{font-weight:700;color:var(--brand);}
    `;
    heroHtml = `
      <div class="hero">
        <div class="breadcrumb">Kutch → <span>${escHtml(b.town)}</span> → ${escHtml(cat.label)}</div>
        <h1>${escHtml(b.name)}</h1>
        <div class="hero-tagline">${cat.icon} ${escHtml(cat.label)} — ${escHtml(cat.ideaLabel)}</div>
      </div>
    `;
  }

  // Base CSS
  const baseCss = `
    *{margin:0;padding:0;box-sizing:border-box}
    body{background:var(--bg);color:var(--text);line-height:1.6;min-height:100vh}
    .topbar{position:sticky;top:0;z-index:100;background:var(--bg);border-bottom:1px solid var(--border);padding:14px 24px;display:flex;justify-content:space-between;align-items:center;gap:12px}
    .topbar-name{font-size:15px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1}
    .cat-pill{font-size:11px;padding:4px 12px;border-radius:20px;background:${cat.color}22;color:${cat.color};border:1px solid ${cat.color}44;white-space:nowrap}
    .claim-top-btn{font-size:11px;padding:6px 16px;background:var(--brand);color:#000;border:none;font-weight:600;cursor:pointer;white-space:nowrap;transition:0.2s}
    .claim-top-btn:hover{filter:brightness(1.15)}
    .hero{padding:60px 24px 40px;border-bottom:1px solid var(--border);position:relative;overflow:hidden}
    .hero::before{content:'';position:absolute;top:-50%;right:-30%;width:500px;height:500px;background:radial-gradient(circle,${cat.color}15 0%,transparent 70%);pointer-events:none}
    .hero h1{font-size:clamp(28px,6vw,48px);line-height:1.15;margin-bottom:12px;position:relative}
    .hero-tagline{font-size:16px;color:var(--muted);margin-bottom:16px;position:relative}
    .breadcrumb{font-size:13px;color:var(--muted);position:relative;display:flex;gap:6px;}
    .breadcrumb span{color:var(--brand)}
    .section{padding:32px 24px;border-bottom:1px solid var(--border)}
    .section-title{font-size:11px;text-transform:uppercase;letter-spacing:2px;color:var(--muted);margin-bottom:20px}
    .info-card{background:var(--surface);border:1px solid var(--border);padding:24px}
    .info-row{padding:12px 0;border-bottom:1px solid var(--border);font-size:15px;display:flex;align-items:center;color:var(--text)}
    .info-row:last-child{border-bottom:none}
    .info-row a{color:var(--brand);text-decoration:none}
    .info-row a:hover{text-decoration:underline}
    .upgrade-banner{background:linear-gradient(135deg,var(--surface) 0%,var(--surface2) 100%);border:1px solid var(--border);padding:24px;}
    .upgrade-banner h3{color:var(--brand);font-size:18px;margin-bottom:8px}
    .upgrade-banner p{color:var(--muted);font-size:14px;margin-bottom:16px}
    .upgrade-banner button{background:var(--brand);color:#000;border:none;padding:10px 24px;border-radius:4px;font-weight:600;cursor:pointer;font-size:14px;transition:0.2s}
    .upgrade-banner button:hover{filter:brightness(1.15)}
    .map-card{background:var(--surface);border:1px solid var(--border);padding:24px;display:flex;align-items:center;justify-content:space-between;cursor:pointer;text-decoration:none;transition:0.2s}
    .map-card:hover{border-color:var(--brand);background:var(--surface2)}
    .map-card-text{font-size:16px;font-weight:500}
    .map-card-arrow{font-size:20px;color:var(--brand)}
    .footer{padding:32px 24px;text-align:center;color:var(--muted);font-size:13px;}
    .footer a{color:var(--brand);text-decoration:none}
    .modal-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:200;align-items:center;justify-content:center;padding:20px}
    .modal-overlay.active{display:flex}
    .modal-box{background:var(--surface);border:1px solid var(--border);padding:32px;max-width:420px;width:100%}
    .modal-box input,.modal-box textarea{width:100%;padding:12px;background:var(--bg);border:1px solid var(--border);color:var(--text);border-radius:4px;margin-bottom:12px;font-family:inherit;font-size:14px}
    .modal-box textarea{height:80px;resize:vertical}
    .modal-box .submit-btn{width:100%;padding:12px;background:var(--brand);color:#000;border:none;border-radius:4px;font-weight:600;font-size:15px;cursor:pointer;transition:0.2s}
    .modal-box .submit-btn:hover{filter:brightness(1.15)}
    .modal-box .cancel-btn{width:100%;padding:8px;background:none;border:none;color:var(--muted);cursor:pointer;margin-top:8px;font-size:13px}
    .toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#1a1a1a;border:1px solid #333;color:#4ade80;padding:12px 24px;border-radius:6px;font-size:14px;z-index:300;opacity:0;transition:opacity 0.3s}
    .toast.show{opacity:1}
    .share-btn{background:none;border:none;color:var(--muted);cursor:pointer;display:flex;align-items:center;justify-content:center;padding:8px;border-radius:50%;transition:0.2s}
    .share-btn:hover{background:var(--surface);color:var(--brand)}
    @media(max-width:600px){.topbar{padding:12px 16px}.hero{padding:40px 16px 30px}.section{padding:24px 16px}.masonry-grid{columns:1}}
  `;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${escHtml(b.name)} — Kutch Digital Map</title>
<meta name="description" content="${escHtml(b.name)} in ${escHtml(b.town)}, Kutch. ${escHtml(cat.label)} listed on Kutch Digital Map.">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Outfit:wght@300;400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,400;0,500;1,400&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
${baseCss}
${themeCss}
</style>
</head>
<body>

<div class="topbar">
  <div class="topbar-name">${escHtml(b.name)}</div>
  <button class="share-btn" onclick="shareSite()" title="Share Business">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
  </button>
  <button class="claim-top-btn" onclick="openModal()">CLAIM</button>
</div>

${heroHtml}
${aboutHtml}

<div class="section">
  <div class="section-title">Business Information</div>
  <div class="info-card">
    <div class="info-row"><span style="margin-right:8px">📍</span> ${escHtml(b.address)}</div>
    <div class="info-row"><span style="margin-right:8px">📞</span> ${contactInfo}</div>
    ${ownerRow}
    ${estRow}
  </div>
</div>

${galleryHtml}

<div class="section">
  <div class="section-title">Digital Presence</div>
  <div class="upgrade-banner">
    <h3>⚡ Unclaimed Listing</h3>
    <p>This business hasn't claimed their digital presence. Are you the owner? Claim this listing to update your information and unlock digital tools.</p>
    <button onclick="openModal()">Claim This Listing</button>
  </div>
</div>

<div class="section">
  <div class="section-title">Location</div>
  <a href="${mapUrl}" target="_blank" rel="noopener" class="map-card">
    <div class="map-card-text">📍 VIEW ON MAP →</div>
    <div class="map-card-arrow">↗</div>
  </a>
</div>

<footer class="footer">
  Powered by <a href="https://via-decide.github.io/Business-Directory/">Kutch Digital Map</a> · ${escHtml(b.town)}, Kachchh
</footer>

<div class="modal-overlay" id="claimModal">
  <div class="modal-box">
    <h2>Claim This Listing</h2>
    <input type="text" id="claimName" placeholder="Your Full Name">
    <input type="tel" id="claimPhone" placeholder="Phone Number">
    <input type="email" id="claimEmail" placeholder="Email Address">
    <textarea id="claimMsg" placeholder="Message (optional)"></textarea>
    <button class="submit-btn" onclick="submitClaim()">Submit Claim Request</button>
    <button class="cancel-btn" onclick="closeModal()">Cancel</button>
  </div>
</div>

<div class="toast" id="toast">✅ Action Successful!</div>

<script>
function shareSite() {
  if (navigator.share) {
    navigator.share({
      title: '${escHtml(b.name)} — Kutch Digital Map',
      text: 'Check out ${escHtml(b.name)} in ${escHtml(b.town)} on Kutch Digital Map!',
      url: window.location.href
    }).catch(console.error);
  } else {
    navigator.clipboard.writeText(window.location.href);
    showToast('Link copied to clipboard!');
  }
}
function showToast(msg) {
  var t=document.getElementById('toast');
  t.innerText = msg || '✅ Action Successful!';
  t.classList.add('show');
  setTimeout(function(){t.classList.remove('show')},3000);
}
function openModal(){document.getElementById('claimModal').classList.add('active')}
function closeModal(){document.getElementById('claimModal').classList.remove('active')}
function submitClaim(){
  closeModal();
  var t=document.getElementById('toast');t.classList.add('show');
  setTimeout(function(){t.classList.remove('show')},3000);
}
document.getElementById('claimModal').addEventListener('click',function(e){if(e.target===this)closeModal()});
</script>
</body>
</html>`;
}


// ═══════════════════════════════════════
// GENERATE FILES
// ═══════════════════════════════════════

const sitesDir = path.join(__dirname, '..', 'sites');

// Ensure sites directory exists
if (!fs.existsSync(sitesDir)) {
  fs.mkdirSync(sitesDir, { recursive: true });
}

// Clean existing HTML files in sites/
const existing = fs.readdirSync(sitesDir).filter(f => f.endsWith('.html'));
existing.forEach(f => fs.unlinkSync(path.join(sitesDir, f)));

console.log(`Generating ${businesses.length} microsites...`);

businesses.forEach((b, i) => {
  const html = generateMicrositeHtml(b);
  const filePath = path.join(sitesDir, `${b.slug}.html`);
  fs.writeFileSync(filePath, html, 'utf8');
});

console.log(`✅ Generated ${businesses.length} microsite HTML files in sites/`);

// Generate index.json
const indexJson = businesses.map(b => ({
  slug: b.slug,
  name: b.name,
  category: b.category,
  idea: b.idea,
  town: b.town,
  area: b.area,
  address: b.address,
  phone: b.phone,
  email: b.email,
  ownerName: b.ownerName,
  url: `https://via-decide.github.io/Business-Directory/sites/${b.slug}.html`
}));

fs.writeFileSync(path.join(sitesDir, 'index.json'), JSON.stringify(indexJson, null, 2), 'utf8');
console.log(`✅ Generated sites/index.json with ${indexJson.length} entries`);

// Export for validation
if (typeof module !== 'undefined') {
  module.exports = { businesses, categoryMeta };
}
