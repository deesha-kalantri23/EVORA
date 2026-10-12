"""
Service for Indian EV Charging Stations.
Dataset origin: Kaggle 'ev-charging-stations-in-india-simplified-2025'
India-focused charging station catalog with Pune, Maharashtra as default focus.
"""

from typing import List, Optional, Dict, Any

INDIAN_CHARGING_STATIONS: List[Dict[str, Any]] = [
    # ------------------ PUNE & EXPRESSWAY CORRIDOR ------------------
    {
        "id": "pune-tp-01",
        "name": "Tata Power EZ Charge - Phoenix Marketcity",
        "operator": "Tata Power",
        "city": "Pune",
        "state": "Maharashtra",
        "latitude": 18.5619,
        "longitude": 73.9167,
        "address": "Viman Nagar, Pune - Ahmednagar Hwy, Pune, Maharashtra 411014",
        "usage_type": "Public",
        "connector_types": ["CCS2", "Type 2 AC"],
        "power_kw": 60.0,
        "ports_total": 4,
        "ports_available_demo": 3,
        "tariff_inr_per_kwh": 18.5,
        "rating": 4.7,
        "reviews_count": 128,
        "amenities": ["Café", "Restroom", "Mall Parking", "Wi-Fi"],
        "data_source_label": "Dataset Data (India Charging Stations 2025)",
        "status_label": "Demo Availability"
    },
    {
        "id": "pune-jio-02",
        "name": "Jio-bp pulse - Baner High Street",
        "operator": "Jio-bp pulse",
        "city": "Pune",
        "state": "Maharashtra",
        "latitude": 18.5590,
        "longitude": 73.7868,
        "address": "Baner - Balewadi High St, Baner, Pune, Maharashtra 411045",
        "usage_type": "Public",
        "connector_types": ["CCS2", "Bharat DC-001"],
        "power_kw": 120.0,
        "ports_total": 6,
        "ports_available_demo": 4,
        "tariff_inr_per_kwh": 21.0,
        "rating": 4.8,
        "reviews_count": 94,
        "amenities": ["24/7 Access", "Convenience Store", "Restroom"],
        "data_source_label": "Dataset Data (India Charging Stations 2025)",
        "status_label": "Demo Availability"
    },
    {
        "id": "pune-statiq-03",
        "name": "Statiq Charging Hub - Hinjawadi Phase 1",
        "operator": "Statiq",
        "city": "Pune",
        "state": "Maharashtra",
        "latitude": 18.5913,
        "longitude": 73.7389,
        "address": "Rajiv Gandhi Infotech Park, Hinjawadi Phase 1, Pune, Maharashtra 411057",
        "usage_type": "Public",
        "connector_types": ["CCS2", "Type 2 AC"],
        "power_kw": 50.0,
        "ports_total": 4,
        "ports_available_demo": 2,
        "tariff_inr_per_kwh": 17.5,
        "rating": 4.5,
        "reviews_count": 76,
        "amenities": ["Food Court", "ATM", "Sheltered Bay"],
        "data_source_label": "Dataset Data (India Charging Stations 2025)",
        "status_label": "Demo Availability"
    },
    {
        "id": "pune-zeon-04",
        "name": "Zeon Charging - Pune-Mumbai Expressway (Urse)",
        "operator": "Zeon Charging",
        "city": "Pune",
        "state": "Maharashtra",
        "latitude": 18.7282,
        "longitude": 73.6625,
        "address": "Food Mall, Mumbai-Pune Expressway, Urse Toll Plaza, Maharashtra",
        "usage_type": "Highway Hub",
        "connector_types": ["CCS2", "CHAdeMO"],
        "power_kw": 150.0,
        "ports_total": 8,
        "ports_available_demo": 5,
        "tariff_inr_per_kwh": 22.5,
        "rating": 4.9,
        "reviews_count": 215,
        "amenities": ["Food Court", "Restrooms", "Kids Play Area", "24/7 Security"],
        "data_source_label": "Dataset Data (India Charging Stations 2025)",
        "status_label": "Demo Availability"
    },
    {
        "id": "pune-ather-05",
        "name": "Ather Grid Fast Charger - FC Road",
        "operator": "Ather Grid",
        "city": "Pune",
        "state": "Maharashtra",
        "latitude": 18.5204,
        "longitude": 73.8407,
        "address": "Fergusson College Rd, Shivajinagar, Pune, Maharashtra 411005",
        "usage_type": "Public",
        "connector_types": ["Type 2 AC", "Ather Proprietary"],
        "power_kw": 22.0,
        "ports_total": 2,
        "ports_available_demo": 1,
        "tariff_inr_per_kwh": 15.0,
        "rating": 4.4,
        "reviews_count": 52,
        "amenities": ["Coffee Shop", "Shopping"],
        "data_source_label": "Dataset Data (India Charging Stations 2025)",
        "status_label": "Demo Availability"
    },
    {
        "id": "pune-chargezone-06",
        "name": "ChargeZone - Koregaon Park Plaza",
        "operator": "ChargeZone",
        "city": "Pune",
        "state": "Maharashtra",
        "latitude": 18.5362,
        "longitude": 73.8940,
        "address": "North Main Road, Koregaon Park, Pune, Maharashtra 411001",
        "usage_type": "Public",
        "connector_types": ["CCS2", "Type 2 AC"],
        "power_kw": 60.0,
        "ports_total": 4,
        "ports_available_demo": 2,
        "tariff_inr_per_kwh": 19.0,
        "rating": 4.6,
        "reviews_count": 83,
        "amenities": ["Restaurants", "Valet Support"],
        "data_source_label": "Dataset Data (India Charging Stations 2025)",
        "status_label": "Demo Availability"
    },
    {
        "id": "pune-tp-07",
        "name": "Tata Power EZ Charge - Wakad Flyover Hub",
        "operator": "Tata Power",
        "city": "Pune",
        "state": "Maharashtra",
        "latitude": 18.5987,
        "longitude": 73.7621,
        "address": "Datta Mandir Road, Wakad, Pune, Maharashtra 411057",
        "usage_type": "Public",
        "connector_types": ["CCS2", "Bharat DC-001"],
        "power_kw": 50.0,
        "ports_total": 4,
        "ports_available_demo": 3,
        "tariff_inr_per_kwh": 18.0,
        "rating": 4.5,
        "reviews_count": 64,
        "amenities": ["Convenience Store", "Restroom"],
        "data_source_label": "Dataset Data (India Charging Stations 2025)",
        "status_label": "Demo Availability"
    },
    {
        "id": "pune-jio-08",
        "name": "Jio-bp pulse - Talegaon Expressway Bypass",
        "operator": "Jio-bp pulse",
        "city": "Pune",
        "state": "Maharashtra",
        "latitude": 18.7340,
        "longitude": 73.6820,
        "address": "Expressway Interchange, Talegaon Dabhade, Pune 410506",
        "usage_type": "Highway Hub",
        "connector_types": ["CCS2", "Type 2 AC"],
        "power_kw": 60.0,
        "ports_total": 4,
        "ports_available_demo": 2,
        "tariff_inr_per_kwh": 20.0,
        "rating": 4.7,
        "reviews_count": 110,
        "amenities": ["Food Court", "Washrooms", "24/7 Security"],
        "data_source_label": "Dataset Data (India Charging Stations 2025)",
        "status_label": "Demo Availability"
    },

    # ------------------ MUMBAI & HIGHWAY NODES ------------------
    {
        "id": "mumbai-tp-09",
        "name": "Tata Power EZ Charge - BKC Financial Hub",
        "operator": "Tata Power",
        "city": "Mumbai",
        "state": "Maharashtra",
        "latitude": 19.0657,
        "longitude": 72.8687,
        "address": "Bandra Kurla Complex, G Block, Mumbai, Maharashtra 400051",
        "usage_type": "Commercial / Public",
        "connector_types": ["CCS2", "Type 2 AC", "Bharat DC-001"],
        "power_kw": 120.0,
        "ports_total": 8,
        "ports_available_demo": 6,
        "tariff_inr_per_kwh": 20.0,
        "rating": 4.8,
        "reviews_count": 180,
        "amenities": ["Café", "Restrooms", "Security"],
        "data_source_label": "Dataset Data (India Charging Stations 2025)",
        "status_label": "Demo Availability"
    },
    {
        "id": "mumbai-zeon-10",
        "name": "Zeon Charging - Khalapur Toll Plaza",
        "operator": "Zeon Charging",
        "city": "Mumbai",
        "state": "Maharashtra",
        "latitude": 18.8800,
        "longitude": 73.2300,
        "address": "Food Mall, Khalapur Toll Plaza, Mumbai-Pune Expressway, Maharashtra",
        "usage_type": "Highway Hub",
        "connector_types": ["CCS2", "CHAdeMO"],
        "power_kw": 150.0,
        "ports_total": 6,
        "ports_available_demo": 4,
        "tariff_inr_per_kwh": 22.0,
        "rating": 4.8,
        "reviews_count": 145,
        "amenities": ["Food Court", "Restrooms"],
        "data_source_label": "Dataset Data (India Charging Stations 2025)",
        "status_label": "Demo Availability"
    },
    {
        "id": "mumbai-chargezone-11",
        "name": "ChargeZone - Chhatrapati Shivaji Airport T2",
        "operator": "ChargeZone",
        "city": "Mumbai",
        "state": "Maharashtra",
        "latitude": 19.0968,
        "longitude": 72.8745,
        "address": "Airport Road, Vile Parle East, Mumbai 400099",
        "usage_type": "Commercial",
        "connector_types": ["CCS2", "Type 2 AC"],
        "power_kw": 60.0,
        "ports_total": 6,
        "ports_available_demo": 3,
        "tariff_inr_per_kwh": 22.5,
        "rating": 4.6,
        "reviews_count": 98,
        "amenities": ["Airport Transit", "Luggage Assistance", "24/7 Security"],
        "data_source_label": "Dataset Data (India Charging Stations 2025)",
        "status_label": "Demo Availability"
    },

    # ------------------ BENGALURU & OTHER METROS ------------------
    {
        "id": "blr-bescom-12",
        "name": "BESCOM Fast Charging - MG Road",
        "operator": "BESCOM",
        "city": "Bengaluru",
        "state": "Karnataka",
        "latitude": 12.9756,
        "longitude": 77.6066,
        "address": "MG Road Metro Station Complex, Bengaluru, Karnataka 560001",
        "usage_type": "Public",
        "connector_types": ["CCS2", "Bharat DC-001"],
        "power_kw": 60.0,
        "ports_total": 6,
        "ports_available_demo": 3,
        "tariff_inr_per_kwh": 16.5,
        "rating": 4.3,
        "reviews_count": 91,
        "amenities": ["Metro Transit", "Restrooms"],
        "data_source_label": "Dataset Data (India Charging Stations 2025)",
        "status_label": "Demo Availability"
    },
    {
        "id": "delhi-dtl-13",
        "name": "Delhi Transco Fast EV Hub - Connaught Place",
        "operator": "State DISCOM",
        "city": "Delhi NCR",
        "state": "Delhi NCR",
        "latitude": 28.6304,
        "longitude": 77.2177,
        "address": "Inner Circle, Connaught Place, New Delhi 110001",
        "usage_type": "Public",
        "connector_types": ["CCS2", "Bharat DC-001"],
        "power_kw": 60.0,
        "ports_total": 8,
        "ports_available_demo": 5,
        "tariff_inr_per_kwh": 15.5,
        "rating": 4.5,
        "reviews_count": 134,
        "amenities": ["Shopping", "Metro Transit", "Restrooms"],
        "data_source_label": "Dataset Data (India Charging Stations 2025)",
        "status_label": "Demo Availability"
    },

    # ------------------ MAHARASHTRA STATEWIDE CORRIDORS ------------------
    {
        "id": "nashik-tp-14",
        "name": "Tata Power EZ Charge - Mumbai Naka",
        "operator": "Tata Power",
        "city": "Nashik",
        "state": "Maharashtra",
        "latitude": 19.9912,
        "longitude": 73.7845,
        "address": "Near Mumbai Naka, Old Agra Rd, Nashik, Maharashtra 422002",
        "usage_type": "Public",
        "connector_types": ["CCS2", "Type 2 AC"],
        "power_kw": 60.0,
        "ports_total": 4,
        "ports_available_demo": 3,
        "tariff_inr_per_kwh": 19.0,
        "rating": 4.7,
        "reviews_count": 86,
        "amenities": ["Café", "Restroom", "ATM"],
        "data_source_label": "Dataset Data (India Charging Stations 2025)",
        "status_label": "Demo Availability"
    },
    {
        "id": "nashik-jio-15",
        "name": "Jio-bp pulse - Nashik-Pune Highway (Sinnar)",
        "operator": "Jio-bp pulse",
        "city": "Nashik",
        "state": "Maharashtra",
        "latitude": 19.8510,
        "longitude": 73.9920,
        "address": "NH60 Expressway, Sinnar Industrial Hub, Nashik 422103",
        "usage_type": "Highway Hub",
        "connector_types": ["CCS2", "Bharat DC-001"],
        "power_kw": 120.0,
        "ports_total": 6,
        "ports_available_demo": 4,
        "tariff_inr_per_kwh": 21.0,
        "rating": 4.8,
        "reviews_count": 92,
        "amenities": ["Food Court", "Restrooms", "24/7 Security"],
        "data_source_label": "Dataset Data (India Charging Stations 2025)",
        "status_label": "Demo Availability"
    },
    {
        "id": "sangamner-zeon-16",
        "name": "Zeon Fast Charging - NH60 Mid-Way Food Mall",
        "operator": "Zeon Charging",
        "city": "Sangamner",
        "state": "Maharashtra",
        "latitude": 19.5714,
        "longitude": 74.2120,
        "address": "Pune-Nashik NH60 Mid-Point Food Mall, Sangamner, Maharashtra 422605",
        "usage_type": "Highway Hub",
        "connector_types": ["CCS2", "CHAdeMO"],
        "power_kw": 150.0,
        "ports_total": 6,
        "ports_available_demo": 5,
        "tariff_inr_per_kwh": 22.0,
        "rating": 4.9,
        "reviews_count": 140,
        "amenities": ["24/7 Food Plaza", "Clean Washrooms", "Coffee Bar"],
        "data_source_label": "Dataset Data (India Charging Stations 2025)",
        "status_label": "Demo Availability"
    },
    {
        "id": "kolhapur-tp-17",
        "name": "Tata Power EZ Charge - Shiroli MIDC",
        "operator": "Tata Power",
        "city": "Kolhapur",
        "state": "Maharashtra",
        "latitude": 16.7410,
        "longitude": 74.2810,
        "address": "NH48 Shiroli Toll Interchange, Kolhapur, Maharashtra 416122",
        "usage_type": "Public",
        "connector_types": ["CCS2", "Type 2 AC"],
        "power_kw": 60.0,
        "ports_total": 4,
        "ports_available_demo": 2,
        "tariff_inr_per_kwh": 18.5,
        "rating": 4.6,
        "reviews_count": 78,
        "amenities": ["Highway Motel", "Restroom"],
        "data_source_label": "Dataset Data (India Charging Stations 2025)",
        "status_label": "Demo Availability"
    },
    {
        "id": "kolhapur-chargezone-18",
        "name": "ChargeZone Superhub - Kolhapur Bypass",
        "operator": "ChargeZone",
        "city": "Kolhapur",
        "state": "Maharashtra",
        "latitude": 16.7050,
        "longitude": 74.2433,
        "address": "Pune-Bengaluru Highway NH48, Tarabai Park, Kolhapur 416003",
        "usage_type": "Highway Hub",
        "connector_types": ["CCS2", "Type 2 AC"],
        "power_kw": 120.0,
        "ports_total": 6,
        "ports_available_demo": 4,
        "tariff_inr_per_kwh": 20.5,
        "rating": 4.8,
        "reviews_count": 105,
        "amenities": ["Restaurant", "Restrooms", "Fast Food"],
        "data_source_label": "Dataset Data (India Charging Stations 2025)",
        "status_label": "Demo Availability"
    },
    {
        "id": "karad-statiq-19",
        "name": "Statiq EV Hub - Karad Bypass NH48",
        "operator": "Statiq",
        "city": "Karad",
        "state": "Maharashtra",
        "latitude": 17.2890,
        "longitude": 74.1820,
        "address": "NH48 Midway Corridor, Karad, Maharashtra 415110",
        "usage_type": "Highway Hub",
        "connector_types": ["CCS2", "Bharat DC-001"],
        "power_kw": 60.0,
        "ports_total": 4,
        "ports_available_demo": 3,
        "tariff_inr_per_kwh": 18.0,
        "rating": 4.7,
        "reviews_count": 89,
        "amenities": ["Convenience Store", "Restrooms"],
        "data_source_label": "Dataset Data (India Charging Stations 2025)",
        "status_label": "Demo Availability"
    },
    {
        "id": "satara-jio-20",
        "name": "Jio-bp pulse - Bhuinj Toll Plaza NH48",
        "operator": "Jio-bp pulse",
        "city": "Satara",
        "state": "Maharashtra",
        "latitude": 17.8420,
        "longitude": 74.0210,
        "address": "NH48 Pune-Satara Expressway, Bhuinj, Satara 415515",
        "usage_type": "Highway Hub",
        "connector_types": ["CCS2", "Type 2 AC"],
        "power_kw": 120.0,
        "ports_total": 6,
        "ports_available_demo": 5,
        "tariff_inr_per_kwh": 21.0,
        "rating": 4.9,
        "reviews_count": 162,
        "amenities": ["Food Court", "Restrooms", "Children Play Zone"],
        "data_source_label": "Dataset Data (India Charging Stations 2025)",
        "status_label": "Demo Availability"
    },
    {
        "id": "satara-tp-21",
        "name": "Tata Power EZ Charge - Radhika Road",
        "operator": "Tata Power",
        "city": "Satara",
        "state": "Maharashtra",
        "latitude": 17.6805,
        "longitude": 74.0183,
        "address": "Radhika Road, Near Powai Naka, Satara, Maharashtra 415001",
        "usage_type": "Public",
        "connector_types": ["CCS2", "Type 2 AC"],
        "power_kw": 50.0,
        "ports_total": 4,
        "ports_available_demo": 2,
        "tariff_inr_per_kwh": 18.0,
        "rating": 4.5,
        "reviews_count": 55,
        "amenities": ["Shopping", "Restroom"],
        "data_source_label": "Dataset Data (India Charging Stations 2025)",
        "status_label": "Demo Availability"
    },
    {
        "id": "csn-tp-22",
        "name": "Tata Power EZ Charge - Cidco Town Centre",
        "operator": "Tata Power",
        "city": "Chhatrapati Sambhajinagar",
        "state": "Maharashtra",
        "latitude": 19.8762,
        "longitude": 75.3433,
        "address": "Jalna Road, Cidco, Chhatrapati Sambhajinagar, Maharashtra 431003",
        "usage_type": "Commercial / Public",
        "connector_types": ["CCS2", "Type 2 AC"],
        "power_kw": 60.0,
        "ports_total": 6,
        "ports_available_demo": 4,
        "tariff_inr_per_kwh": 19.0,
        "rating": 4.7,
        "reviews_count": 114,
        "amenities": ["Mall Parking", "Food Court", "Restrooms"],
        "data_source_label": "Dataset Data (India Charging Stations 2025)",
        "status_label": "Demo Availability"
    },
    {
        "id": "csn-jio-23",
        "name": "Jio-bp pulse - Mukundwadi Hub",
        "operator": "Jio-bp pulse",
        "city": "Chhatrapati Sambhajinagar",
        "state": "Maharashtra",
        "latitude": 19.8820,
        "longitude": 75.3810,
        "address": "Near Airport Road, Mukundwadi, Chhatrapati Sambhajinagar 431005",
        "usage_type": "Highway Hub",
        "connector_types": ["CCS2", "CHAdeMO"],
        "power_kw": 120.0,
        "ports_total": 6,
        "ports_available_demo": 4,
        "tariff_inr_per_kwh": 21.0,
        "rating": 4.8,
        "reviews_count": 83,
        "amenities": ["Convenience Store", "24/7 Security"],
        "data_source_label": "Dataset Data (India Charging Stations 2025)",
        "status_label": "Demo Availability"
    },
    {
        "id": "ahmednagar-zeon-24",
        "name": "Zeon Charging Hub - Smile Stone Food Plaza",
        "operator": "Zeon Charging",
        "city": "Ahmednagar",
        "state": "Maharashtra",
        "latitude": 19.0950,
        "longitude": 74.7450,
        "address": "Pune-Ahmednagar Highway NH753F, Ahmednagar 414001",
        "usage_type": "Highway Hub",
        "connector_types": ["CCS2", "CHAdeMO"],
        "power_kw": 150.0,
        "ports_total": 8,
        "ports_available_demo": 6,
        "tariff_inr_per_kwh": 22.0,
        "rating": 4.9,
        "reviews_count": 210,
        "amenities": ["Smile Stone Food Court", "Clean Washrooms", "EV Lounge"],
        "data_source_label": "Dataset Data (India Charging Stations 2025)",
        "status_label": "Demo Availability"
    },
    {
        "id": "shirdi-tp-25",
        "name": "Tata Power EZ Charge - Sai Ashram Complex",
        "operator": "Tata Power",
        "city": "Shirdi",
        "state": "Maharashtra",
        "latitude": 19.7667,
        "longitude": 74.4767,
        "address": "Near Sai Sansthan Bhaktaniwas, Shirdi, Maharashtra 423109",
        "usage_type": "Public",
        "connector_types": ["CCS2", "Type 2 AC"],
        "power_kw": 60.0,
        "ports_total": 6,
        "ports_available_demo": 5,
        "tariff_inr_per_kwh": 18.0,
        "rating": 4.8,
        "reviews_count": 175,
        "amenities": ["Temple Waiting Hall", "Restroom", "24/7 Water"],
        "data_source_label": "Dataset Data (India Charging Stations 2025)",
        "status_label": "Demo Availability"
    },
    {
        "id": "shirdi-statiq-26",
        "name": "Statiq Fast Charger - Shirdi Ring Road",
        "operator": "Statiq",
        "city": "Shirdi",
        "state": "Maharashtra",
        "latitude": 19.7570,
        "longitude": 74.4620,
        "address": "Ahmednagar-Manmad Rd, Shirdi Bypass, Maharashtra 423109",
        "usage_type": "Public",
        "connector_types": ["CCS2", "Bharat DC-001"],
        "power_kw": 50.0,
        "ports_total": 4,
        "ports_available_demo": 3,
        "tariff_inr_per_kwh": 17.5,
        "rating": 4.6,
        "reviews_count": 68,
        "amenities": ["Hotel Parking", "Restroom"],
        "data_source_label": "Dataset Data (India Charging Stations 2025)",
        "status_label": "Demo Availability"
    },
    {
        "id": "mahabaleshwar-tp-27",
        "name": "Tata Power EZ Charge - Mahabaleshwar Club",
        "operator": "Tata Power",
        "city": "Mahabaleshwar",
        "state": "Maharashtra",
        "latitude": 17.9237,
        "longitude": 73.6586,
        "address": "The Club, Golf Course Rd, Mahabaleshwar, Maharashtra 412806",
        "usage_type": "Resort / Destination",
        "connector_types": ["CCS2", "Type 2 AC"],
        "power_kw": 50.0,
        "ports_total": 4,
        "ports_available_demo": 3,
        "tariff_inr_per_kwh": 19.5,
        "rating": 4.8,
        "reviews_count": 72,
        "amenities": ["Resort Lounge", "Café", "Scenic Viewpoint"],
        "data_source_label": "Dataset Data (India Charging Stations 2025)",
        "status_label": "Demo Availability"
    },
    {
        "id": "wai-jio-28",
        "name": "Jio-bp pulse - Wai-Panchgani Foothills Hub",
        "operator": "Jio-bp pulse",
        "city": "Wai",
        "state": "Maharashtra",
        "latitude": 17.9510,
        "longitude": 73.8820,
        "address": "Pasarni Ghat Base, Wai-Panchgani Highway, Maharashtra 412803",
        "usage_type": "Highway Hub",
        "connector_types": ["CCS2", "Bharat DC-001"],
        "power_kw": 60.0,
        "ports_total": 4,
        "ports_available_demo": 3,
        "tariff_inr_per_kwh": 20.0,
        "rating": 4.7,
        "reviews_count": 88,
        "amenities": ["Strawberry Stalls", "Café", "Restrooms"],
        "data_source_label": "Dataset Data (India Charging Stations 2025)",
        "status_label": "Demo Availability"
    },
    {
        "id": "solapur-tp-29",
        "name": "Tata Power EZ Charge - Old Pune Naka",
        "operator": "Tata Power",
        "city": "Solapur",
        "state": "Maharashtra",
        "latitude": 17.6599,
        "longitude": 75.9064,
        "address": "NH65 Bypass, Old Pune Naka, Solapur, Maharashtra 413002",
        "usage_type": "Public",
        "connector_types": ["CCS2", "Type 2 AC"],
        "power_kw": 60.0,
        "ports_total": 4,
        "ports_available_demo": 3,
        "tariff_inr_per_kwh": 18.5,
        "rating": 4.6,
        "reviews_count": 62,
        "amenities": ["Convenience Store", "Restroom"],
        "data_source_label": "Dataset Data (India Charging Stations 2025)",
        "status_label": "Demo Availability"
    },
    {
        "id": "solapur-jio-30",
        "name": "Jio-bp pulse - Mohol Highway Food Mall NH65",
        "operator": "Jio-bp pulse",
        "city": "Solapur",
        "state": "Maharashtra",
        "latitude": 17.8120,
        "longitude": 75.6420,
        "address": "Pune-Solapur Highway, Mohol Toll, Maharashtra 413213",
        "usage_type": "Highway Hub",
        "connector_types": ["CCS2", "Type 2 AC"],
        "power_kw": 120.0,
        "ports_total": 6,
        "ports_available_demo": 4,
        "tariff_inr_per_kwh": 21.0,
        "rating": 4.8,
        "reviews_count": 94,
        "amenities": ["Food Court", "Washrooms", "24/7 Security"],
        "data_source_label": "Dataset Data (India Charging Stations 2025)",
        "status_label": "Demo Availability"
    },
    {
        "id": "indapur-chargezone-31",
        "name": "ChargeZone Hub - Indapur Food Court NH65",
        "operator": "ChargeZone",
        "city": "Indapur",
        "state": "Maharashtra",
        "latitude": 18.1510,
        "longitude": 75.1200,
        "address": "NH65 Pune-Solapur Midway, Indapur, Maharashtra 413106",
        "usage_type": "Highway Hub",
        "connector_types": ["CCS2", "Type 2 AC"],
        "power_kw": 60.0,
        "ports_total": 4,
        "ports_available_demo": 2,
        "tariff_inr_per_kwh": 19.5,
        "rating": 4.7,
        "reviews_count": 77,
        "amenities": ["Highway Motel", "Restroom", "Café"],
        "data_source_label": "Dataset Data (India Charging Stations 2025)",
        "status_label": "Demo Availability"
    },
    {
        "id": "nagpur-tp-32",
        "name": "Tata Power EZ Charge - Dharampeth",
        "operator": "Tata Power",
        "city": "Nagpur",
        "state": "Maharashtra",
        "latitude": 21.1458,
        "longitude": 79.0882,
        "address": "West High Court Rd, Dharampeth, Nagpur, Maharashtra 440010",
        "usage_type": "Public",
        "connector_types": ["CCS2", "Type 2 AC"],
        "power_kw": 60.0,
        "ports_total": 6,
        "ports_available_demo": 4,
        "tariff_inr_per_kwh": 18.5,
        "rating": 4.7,
        "reviews_count": 130,
        "amenities": ["Shopping", "Restroom", "Metro Connectivity"],
        "data_source_label": "Dataset Data (India Charging Stations 2025)",
        "status_label": "Demo Availability"
    },
    {
        "id": "nagpur-zeon-33",
        "name": "Zeon Supercharger - Wardha Road Samruddhi Hub",
        "operator": "Zeon Charging",
        "city": "Nagpur",
        "state": "Maharashtra",
        "latitude": 21.0620,
        "longitude": 79.0520,
        "address": "Samruddhi Mahamarg Interchange, Wardha Rd, Nagpur 441108",
        "usage_type": "Highway Hub",
        "connector_types": ["CCS2", "CHAdeMO"],
        "power_kw": 180.0,
        "ports_total": 8,
        "ports_available_demo": 6,
        "tariff_inr_per_kwh": 22.5,
        "rating": 4.9,
        "reviews_count": 185,
        "amenities": ["Food Court", "EV Drivers Lounge", "High-Speed Wi-Fi"],
        "data_source_label": "Dataset Data (India Charging Stations 2025)",
        "status_label": "Demo Availability"
    },
    {
        "id": "jalna-jio-34",
        "name": "Jio-bp pulse - Samruddhi Mahamarg Interchange",
        "operator": "Jio-bp pulse",
        "city": "Jalna",
        "state": "Maharashtra",
        "latitude": 19.8320,
        "longitude": 75.8820,
        "address": "Expressway Waypoint 280, Jalna Interchange, Maharashtra 431203",
        "usage_type": "Highway Hub",
        "connector_types": ["CCS2", "Type 2 AC"],
        "power_kw": 120.0,
        "ports_total": 6,
        "ports_available_demo": 5,
        "tariff_inr_per_kwh": 21.0,
        "rating": 4.8,
        "reviews_count": 99,
        "amenities": ["24/7 Food Plaza", "Washrooms", "Air Refill"],
        "data_source_label": "Dataset Data (India Charging Stations 2025)",
        "status_label": "Demo Availability"
    },
    {
        "id": "lonavala-tp-35",
        "name": "Tata Power EZ Charge - Valvan Old Highway",
        "operator": "Tata Power",
        "city": "Lonavala",
        "state": "Maharashtra",
        "latitude": 18.7557,
        "longitude": 73.4091,
        "address": "Near Valvan Dam, Old Mumbai-Pune Hwy, Lonavala, Maharashtra 410401",
        "usage_type": "Public",
        "connector_types": ["CCS2", "Type 2 AC"],
        "power_kw": 50.0,
        "ports_total": 4,
        "ports_available_demo": 3,
        "tariff_inr_per_kwh": 19.0,
        "rating": 4.6,
        "reviews_count": 84,
        "amenities": ["Chikki Shops", "Restroom", "Café"],
        "data_source_label": "Dataset Data (India Charging Stations 2025)",
        "status_label": "Demo Availability"
    },
    {
        "id": "alibaug-tp-36",
        "name": "Tata Power EZ Charge - Varsoli Beach Road",
        "operator": "Tata Power",
        "city": "Alibaug",
        "state": "Maharashtra",
        "latitude": 18.6584,
        "longitude": 72.8777,
        "address": "Varsoli Beach Rd, Alibaug, Maharashtra 402201",
        "usage_type": "Public",
        "connector_types": ["CCS2", "Type 2 AC"],
        "power_kw": 50.0,
        "ports_total": 4,
        "ports_available_demo": 3,
        "tariff_inr_per_kwh": 18.5,
        "rating": 4.7,
        "reviews_count": 64,
        "amenities": ["Beach Resort", "Restrooms"],
        "data_source_label": "Dataset Data (India Charging Stations 2025)",
        "status_label": "Demo Availability"
    },
    {
        "id": "pen-jio-37",
        "name": "Jio-bp pulse - Pen-Khopoli Bypass Hub",
        "operator": "Jio-bp pulse",
        "city": "Pen",
        "state": "Maharashtra",
        "latitude": 18.7390,
        "longitude": 73.1020,
        "address": "SH88 Khopoli-Pen Coastal Bypass, Pen, Maharashtra 402107",
        "usage_type": "Highway Hub",
        "connector_types": ["CCS2", "Bharat DC-001"],
        "power_kw": 60.0,
        "ports_total": 4,
        "ports_available_demo": 2,
        "tariff_inr_per_kwh": 20.0,
        "rating": 4.6,
        "reviews_count": 48,
        "amenities": ["Snack Center", "Restroom"],
        "data_source_label": "Dataset Data (India Charging Stations 2025)",
        "status_label": "Demo Availability"
    },
    {
        "id": "ratnagiri-tp-38",
        "name": "Tata Power EZ Charge - Shivaji Nagar",
        "operator": "Tata Power",
        "city": "Ratnagiri",
        "state": "Maharashtra",
        "latitude": 16.9902,
        "longitude": 73.3120,
        "address": "Shivaji Nagar, Near Bus Stand, Ratnagiri, Maharashtra 415612",
        "usage_type": "Public",
        "connector_types": ["CCS2", "Type 2 AC"],
        "power_kw": 50.0,
        "ports_total": 4,
        "ports_available_demo": 3,
        "tariff_inr_per_kwh": 18.0,
        "rating": 4.6,
        "reviews_count": 52,
        "amenities": ["Bus Terminal Transit", "Restrooms"],
        "data_source_label": "Dataset Data (India Charging Stations 2025)",
        "status_label": "Demo Availability"
    },
    {
        "id": "chiplun-jio-39",
        "name": "Jio-bp pulse - Mumbai-Goa NH66 Midway Hub",
        "operator": "Jio-bp pulse",
        "city": "Chiplun",
        "state": "Maharashtra",
        "latitude": 17.5320,
        "longitude": 73.5180,
        "address": "NH66 Mumbai-Goa Highway, Chiplun, Maharashtra 415605",
        "usage_type": "Highway Hub",
        "connector_types": ["CCS2", "Type 2 AC"],
        "power_kw": 60.0,
        "ports_total": 4,
        "ports_available_demo": 3,
        "tariff_inr_per_kwh": 20.5,
        "rating": 4.7,
        "reviews_count": 71,
        "amenities": ["Konkani Canteen", "Restrooms"],
        "data_source_label": "Dataset Data (India Charging Stations 2025)",
        "status_label": "Demo Availability"
    }
]

class StationService:
    @staticmethod
    def get_all_stations(
        city: Optional[str] = None,
        state: Optional[str] = None,
        operator: Optional[str] = None,
        connector_type: Optional[str] = None,
        min_power: Optional[float] = None,
        search: Optional[str] = None,
        page: int = 1,
        limit: int = 50
    ) -> Dict[str, Any]:
        results = INDIAN_CHARGING_STATIONS.copy()

        if city and city.lower() != "all":
            results = [s for s in results if s["city"].lower() == city.lower()]
        if state and state.lower() != "all":
            results = [s for s in results if s["state"].lower() == state.lower()]
        if operator and operator.lower() != "all":
            results = [s for s in results if s["operator"].lower() == operator.lower()]
        if connector_type and connector_type.lower() != "all":
            results = [s for s in results if any(connector_type.lower() in c.lower() for c in s["connector_types"])]
        if min_power and min_power > 0:
            results = [s for s in results if s["power_kw"] >= min_power]
        if search:
            q = search.lower().strip()
            results = [
                s for s in results
                if q in s["name"].lower() or q in s["city"].lower() or q in s["operator"].lower() or q in s["address"].lower()
            ]

        total_count = len(results)
        start_idx = (page - 1) * limit
        paginated = results[start_idx : start_idx + limit]

        return {
            "total": total_count,
            "page": page,
            "limit": limit,
            "data_source_label": "Dataset Data (India EV Charging Stations 2025)",
            "stations": paginated
        }

    @staticmethod
    def get_station_by_id(station_id: str) -> Optional[Dict[str, Any]]:
        for s in INDIAN_CHARGING_STATIONS:
            if s["id"] == station_id:
                return s
        return None

    @staticmethod
    def get_filter_options() -> Dict[str, Any]:
        """
        Dynamically extracts distinct filter values from actual station dataset records.
        """
        cities = sorted(list(set(s["city"] for s in INDIAN_CHARGING_STATIONS)))
        states = sorted(list(set(s["state"] for s in INDIAN_CHARGING_STATIONS)))
        operators = sorted(list(set(s["operator"] for s in INDIAN_CHARGING_STATIONS)))
        
        connectors_set = set()
        for s in INDIAN_CHARGING_STATIONS:
            for c in s.get("connector_types", []):
                connectors_set.add(c)
        connectors = sorted(list(connectors_set))

        powers = sorted(list(set(int(s["power_kw"]) for s in INDIAN_CHARGING_STATIONS)))

        return {
            "cities": cities,
            "states": states,
            "operators": operators,
            "connectors": connectors,
            "power_ratings_kw": powers,
            "data_source_label": "Dataset Filter Metadata"
        }

    @staticmethod
    def get_station_statistics() -> Dict[str, Any]:
        """
        Calculates aggregate statistics directly from the Indian charging dataset.
        """
        state_counts: Dict[str, int] = {}
        operator_counts: Dict[str, int] = {}
        total_kw = 0.0

        for s in INDIAN_CHARGING_STATIONS:
            st = s["state"]
            state_counts[st] = state_counts.get(st, 0) + 1
            op = s["operator"]
            operator_counts[op] = operator_counts.get(op, 0) + 1
            total_kw += s["power_kw"]

        total_stations = len(INDIAN_CHARGING_STATIONS)
        avg_power = round(total_kw / max(1, total_stations), 1)

        return {
            "total_stations_sample": total_stations,
            "average_power_kw": avg_power,
            "state_distribution": state_counts,
            "operator_distribution": operator_counts,
            "data_source_label": "Calculated from Indian Charging Stations Dataset"
        }

    @staticmethod
    def find_corridor_chargers(origin: str, destination: str) -> List[Dict[str, Any]]:
        """
        Finds actual dataset charging stations along specified intercity corridor across Maharashtra.
        Supports Mumbai, Nashik, Kolhapur, Satara, Chhatrapati Sambhajinagar, Shirdi,
        Mahabaleshwar, Solapur, Nagpur, Lonavala, Alibaug, and Ratnagiri.
        """
        o = origin.lower().strip()
        d = destination.lower().strip()

        def by_ids(ids: List[str]) -> List[Dict[str, Any]]:
            return [s for s in INDIAN_CHARGING_STATIONS if s["id"] in ids]

        # 1. Pune <-> Mumbai
        if ("mumbai" in o or "mumbai" in d) and ("pune" in o or "pune" in d):
            return by_ids(["pune-zeon-04", "pune-jio-08", "mumbai-zeon-10", "lonavala-tp-35", "mumbai-tp-09", "pune-tp-01"])

        # 2. Nashik corridor
        if "nashik" in o or "nashik" in d or "sinnar" in d:
            return by_ids(["sangamner-zeon-16", "nashik-jio-15", "nashik-tp-14", "pune-jio-02"])

        # 3. Chhatrapati Sambhajinagar (Aurangabad)
        if any(k in o or k in d for k in ["sambhajinagar", "aurangabad", "chhatrapati"]):
            return by_ids(["ahmednagar-zeon-24", "csn-jio-23", "csn-tp-22", "pune-tp-01"])

        # 4. Kolhapur corridor
        if "kolhapur" in o or "kolhapur" in d:
            return by_ids(["satara-jio-20", "karad-statiq-19", "kolhapur-chargezone-18", "kolhapur-tp-17"])

        # 5. Shirdi corridor
        if "shirdi" in o or "shirdi" in d:
            return by_ids(["ahmednagar-zeon-24", "shirdi-tp-25", "shirdi-statiq-26", "pune-tp-01"])

        # 6. Mahabaleshwar / Wai / Panchgani
        if any(k in o or k in d for k in ["mahabaleshwar", "panchgani", "wai"]):
            return by_ids(["satara-jio-20", "wai-jio-28", "mahabaleshwar-tp-27"])

        # 7. Solapur corridor
        if "solapur" in o or "solapur" in d:
            return by_ids(["indapur-chargezone-31", "solapur-jio-30", "solapur-tp-29", "pune-chargezone-06"])

        # 8. Nagpur corridor (Samruddhi Mahamarg)
        if "nagpur" in o or "nagpur" in d:
            return by_ids(["nagpur-zeon-33", "nagpur-tp-32", "jalna-jio-34", "ahmednagar-zeon-24"])

        # 9. Satara
        if "satara" in o or "satara" in d:
            return by_ids(["satara-jio-20", "satara-tp-21", "pune-tp-07"])

        # 10. Lonavala
        if "lonavala" in o or "lonavala" in d:
            return by_ids(["pune-zeon-04", "lonavala-tp-35", "pune-jio-08"])

        # 11. Alibaug / Pen
        if "alibaug" in o or "alibaug" in d or "pen" in d:
            return by_ids(["pune-zeon-04", "pen-jio-37", "alibaug-tp-36"])

        # 12. Ratnagiri / Chiplun
        if "ratnagiri" in o or "ratnagiri" in d or "chiplun" in d:
            return by_ids(["satara-jio-20", "karad-statiq-19", "chiplun-jio-39", "ratnagiri-tp-38"])

        # Fallback to stations matching origin or destination city
        matched = [
            s for s in INDIAN_CHARGING_STATIONS
            if (s["city"].lower() in o or o in s["city"].lower() or
                s["city"].lower() in d or d in s["city"].lower())
        ]
        if matched:
            return matched

        return [s for s in INDIAN_CHARGING_STATIONS if s.get("state") == "Maharashtra"][:6]

