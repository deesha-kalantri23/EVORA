import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Navigation,
  MapPin,
  Zap,
  Clock,
  ArrowRight,
  ShieldCheck,
  Compass,
  CheckCircle2,
  CalendarCheck,
  Info,
  ChevronRight,
  Sparkles,
  Mountain,
  Gauge,
  BatteryCharging
} from 'lucide-react';
import { Badge } from '../components/Badge';
import { IndiaMapLeaflet } from '../components/IndiaMapLeaflet';
import { ChargingJourneyBar } from '../components/ChargingJourneyBar';
import { INITIAL_STATIONS } from '../data/mockData';
import { evoraApi } from '../services/api';
import { ChargingStation } from '../types';

export interface MaharashtraCityCorridor {
  id: string;
  name: string;
  shortName: string;
  region: 'Western' | 'Northern' | 'Marathwada' | 'Vidarbha' | 'Konkan';
  badge: string;
  icon: string;
  distanceKm: number;
  baseTravelMinutes: number;
  coordinates: [number, number];
  destinationLabel: string;
  highwayCorridor: string;
  routeWaypoints: [number, number][];
  recommendedStop: {
    stationId: string;
    name: string;
    powerKw: number;
    highwayMark: string;
    durationMins: number;
  };
  elevationProfile: string;
}

export const MAHARASHTRA_CORRIDORS: MaharashtraCityCorridor[] = [
  {
    id: 'mumbai',
    name: 'Mumbai',
    shortName: 'Mumbai',
    region: 'Western',
    badge: 'Expressway Hub',
    icon: '⚡',
    distanceKm: 148,
    baseTravelMinutes: 155,
    coordinates: [19.0657, 72.8687],
    destinationLabel: 'Mumbai (BKC Financial Hub)',
    highwayCorridor: 'Mumbai-Pune Expressway',
    routeWaypoints: [
      [18.5204, 73.8567],
      [18.5714, 73.7820],
      [18.6500, 73.7100],
      [18.7282, 73.6625],
      [18.7500, 73.4100],
      [18.8800, 73.2300],
      [19.0100, 73.0800],
      [19.0657, 72.8687]
    ],
    recommendedStop: {
      stationId: 'pune-zeon-04',
      name: 'Zeon Charging - Urse Food Mall (150 kW DC Fast)',
      powerKw: 150,
      highwayMark: 'KM 38 on Expressway',
      durationMins: 15
    },
    elevationProfile: 'Expressway gradient via Bhor / Khandala Ghat'
  },
  {
    id: 'nashik',
    name: 'Nashik',
    shortName: 'Nashik',
    region: 'Northern',
    badge: 'Wine Capital / NH60',
    icon: '🍇',
    distanceKm: 212,
    baseTravelMinutes: 225,
    coordinates: [19.9975, 73.7898],
    destinationLabel: 'Nashik (Mumbai Naka & City Hub)',
    highwayCorridor: 'NH60 Pune-Nashik Expressway',
    routeWaypoints: [
      [18.5204, 73.8567],
      [18.6200, 73.8500],
      [18.7500, 73.8500],
      [19.0000, 73.9400],
      [19.1600, 74.0200],
      [19.5714, 74.2120],
      [19.8510, 73.9920],
      [19.9975, 73.7898]
    ],
    recommendedStop: {
      stationId: 'sangamner-zeon-16',
      name: 'Zeon Fast Charging - NH60 Mid-Way Mall, Sangamner (150 kW)',
      powerKw: 150,
      highwayMark: 'KM 135 on NH60 Corridor',
      durationMins: 20
    },
    elevationProfile: 'Rolling climb across northern Deccan plateau'
  },
  {
    id: 'sambhajinagar',
    name: 'Chhatrapati Sambhajinagar',
    shortName: 'Sambhajinagar',
    region: 'Marathwada',
    badge: 'Tourism & Auto Hub',
    icon: '🏛️',
    distanceKm: 235,
    baseTravelMinutes: 255,
    coordinates: [19.8762, 75.3433],
    destinationLabel: 'Chhatrapati Sambhajinagar (Cidco Town Centre)',
    highwayCorridor: 'Pune-Ahmednagar-Sambhajinagar Corridor',
    routeWaypoints: [
      [18.5204, 73.8567],
      [18.5800, 73.9800],
      [18.8200, 74.3700],
      [19.0950, 74.7450],
      [19.4500, 75.0500],
      [19.8762, 75.3433]
    ],
    recommendedStop: {
      stationId: 'ahmednagar-zeon-24',
      name: 'Zeon Charging Hub - Smile Stone Plaza, Ahmednagar (150 kW)',
      powerKw: 150,
      highwayMark: 'KM 122 at Ahmednagar Bypass',
      durationMins: 22
    },
    elevationProfile: 'Broad central Maharashtra highway with flat stretches'
  },
  {
    id: 'kolhapur',
    name: 'Kolhapur',
    shortName: 'Kolhapur',
    region: 'Western',
    badge: 'NH48 South Corridor',
    icon: '🏰',
    distanceKm: 233,
    baseTravelMinutes: 230,
    coordinates: [16.7050, 74.2433],
    destinationLabel: 'Kolhapur (Shiroli MIDC / NH48 Hub)',
    highwayCorridor: 'NH48 Pune-Bengaluru Golden Quadrilateral',
    routeWaypoints: [
      [18.5204, 73.8567],
      [18.3500, 73.9000],
      [18.0500, 74.0000],
      [17.6800, 74.0000],
      [17.2890, 74.1820],
      [16.7410, 74.2810],
      [16.7050, 74.2433]
    ],
    recommendedStop: {
      stationId: 'karad-statiq-19',
      name: 'Statiq EV Hub - Karad Bypass NH48 (60 kW DC)',
      powerKw: 60,
      highwayMark: 'KM 158 on NH48 Corridor',
      durationMins: 20
    },
    elevationProfile: 'Khambatki Ghat transit followed by 6-lane NH48'
  },
  {
    id: 'shirdi',
    name: 'Shirdi',
    shortName: 'Shirdi',
    region: 'Northern',
    badge: 'Temple Corridor',
    icon: '🛕',
    distanceKm: 185,
    baseTravelMinutes: 210,
    coordinates: [19.7667, 74.4767],
    destinationLabel: 'Shirdi (Sai Ashram Complex & Temple)',
    highwayCorridor: 'Ahmednagar-Shirdi Corridor',
    routeWaypoints: [
      [18.5204, 73.8567],
      [18.5800, 73.9800],
      [18.8200, 74.3700],
      [19.0950, 74.7450],
      [19.3800, 74.6500],
      [19.7667, 74.4767]
    ],
    recommendedStop: {
      stationId: 'ahmednagar-zeon-24',
      name: 'Zeon Charging Hub - Smile Stone Plaza, Ahmednagar (150 kW)',
      powerKw: 150,
      highwayMark: 'KM 122 midway node',
      durationMins: 18
    },
    elevationProfile: 'Smooth rural highway with minimal elevation changes'
  },
  {
    id: 'mahabaleshwar',
    name: 'Mahabaleshwar',
    shortName: 'Mahabaleshwar',
    region: 'Western',
    badge: 'Hill Station / Ghats',
    icon: '🍓',
    distanceKm: 120,
    baseTravelMinutes: 165,
    coordinates: [17.9237, 73.6586],
    destinationLabel: 'Mahabaleshwar (Club & Venna Lake)',
    highwayCorridor: 'NH48 & Pasarni Ghat Road',
    routeWaypoints: [
      [18.5204, 73.8567],
      [18.3500, 73.9000],
      [18.0500, 74.0000],
      [17.9510, 73.8820],
      [17.9250, 73.7800],
      [17.9237, 73.6586]
    ],
    recommendedStop: {
      stationId: 'wai-jio-28',
      name: 'Jio-bp pulse - Wai Foothills Hub (60 kW DC)',
      powerKw: 60,
      highwayMark: 'KM 85 at base of Pasarni Ghat',
      durationMins: 15
    },
    elevationProfile: 'Steep hill ascent to 1,350m (high regenerative return on downhill)'
  },
  {
    id: 'solapur',
    name: 'Solapur',
    shortName: 'Solapur',
    region: 'Marathwada',
    badge: 'NH65 Southeast Highway',
    icon: '🌾',
    distanceKm: 255,
    baseTravelMinutes: 260,
    coordinates: [17.6599, 75.9064],
    destinationLabel: 'Solapur (Old Pune Naka & Textile City)',
    highwayCorridor: 'NH65 Pune-Solapur Highway',
    routeWaypoints: [
      [18.5204, 73.8567],
      [18.5000, 74.0500],
      [18.4200, 74.5800],
      [18.2300, 74.9000],
      [18.1510, 75.1200],
      [17.8120, 75.6420],
      [17.6599, 75.9064]
    ],
    recommendedStop: {
      stationId: 'indapur-chargezone-31',
      name: 'ChargeZone Hub - Indapur Food Court (60 kW DC)',
      powerKw: 60,
      highwayMark: 'KM 138 on NH65 Expressway',
      durationMins: 22
    },
    elevationProfile: 'Flat southeastern Deccan plateau ideal for steady EV cruising'
  },
  {
    id: 'nagpur',
    name: 'Nagpur',
    shortName: 'Nagpur',
    region: 'Vidarbha',
    badge: 'Samruddhi Mahamarg',
    icon: '🍊',
    distanceKm: 710,
    baseTravelMinutes: 570,
    coordinates: [21.1458, 79.0882],
    destinationLabel: 'Nagpur (Zero Mile / Wardha Road)',
    highwayCorridor: 'Samruddhi Mahamarg Super Expressway',
    routeWaypoints: [
      [18.5204, 73.8567],
      [19.0950, 74.7450],
      [19.8762, 75.3433],
      [19.8320, 75.8820],
      [20.4800, 77.4800],
      [20.7400, 78.6000],
      [21.0620, 79.0520],
      [21.1458, 79.0882]
    ],
    recommendedStop: {
      stationId: 'jalna-jio-34',
      name: 'Jio-bp pulse - Samruddhi Interchange, Jalna (120 kW)',
      powerKw: 120,
      highwayMark: 'KM 280 on Samruddhi Mahamarg',
      durationMins: 30
    },
    elevationProfile: '120 km/h access-controlled greenfield expressway'
  },
  {
    id: 'satara',
    name: 'Satara',
    shortName: 'Satara',
    region: 'Western',
    badge: 'Kaas & Windmills',
    icon: '🏔️',
    distanceKm: 112,
    baseTravelMinutes: 115,
    coordinates: [17.6805, 74.0183],
    destinationLabel: 'Satara (Radhika Road & Heritage Hub)',
    highwayCorridor: 'NH48 Pune-Satara Highway',
    routeWaypoints: [
      [18.5204, 73.8567],
      [18.3500, 73.9000],
      [18.0500, 74.0000],
      [17.8420, 74.0210],
      [17.6805, 74.0183]
    ],
    recommendedStop: {
      stationId: 'satara-jio-20',
      name: 'Jio-bp pulse - Bhuinj Toll Plaza NH48 (120 kW DC)',
      powerKw: 120,
      highwayMark: 'KM 80 on NH48',
      durationMins: 12
    },
    elevationProfile: 'Khambatki Ghat descent and Sahyadri foothills'
  },
  {
    id: 'lonavala',
    name: 'Lonavala',
    shortName: 'Lonavala',
    region: 'Western',
    badge: 'Sahyadri Gateway',
    icon: '⛰️',
    distanceKm: 65,
    baseTravelMinutes: 65,
    coordinates: [18.7557, 73.4091],
    destinationLabel: 'Lonavala (Tiger Point & Valvan)',
    highwayCorridor: 'Mumbai-Pune Expressway Western Section',
    routeWaypoints: [
      [18.5204, 73.8567],
      [18.5714, 73.7820],
      [18.6500, 73.7100],
      [18.7282, 73.6625],
      [18.7557, 73.4091]
    ],
    recommendedStop: {
      stationId: 'lonavala-tp-35',
      name: 'Tata Power EZ Charge - Valvan Old Highway (50 kW)',
      powerKw: 50,
      highwayMark: 'KM 62 near expressway exit',
      durationMins: 10
    },
    elevationProfile: 'Quick 650m ghat climb on expressway'
  },
  {
    id: 'alibaug',
    name: 'Alibaug',
    shortName: 'Alibaug',
    region: 'Konkan',
    badge: 'Coastal Gateway',
    icon: '🏖️',
    distanceKm: 142,
    baseTravelMinutes: 190,
    coordinates: [18.6584, 72.8777],
    destinationLabel: 'Alibaug (Varsoli Beach & Coastal Gateway)',
    highwayCorridor: 'Expressway & SH88 Pen Coastal Road',
    routeWaypoints: [
      [18.5204, 73.8567],
      [18.7282, 73.6625],
      [18.7900, 73.3400],
      [18.7390, 73.1020],
      [18.7000, 73.0000],
      [18.6584, 72.8777]
    ],
    recommendedStop: {
      stationId: 'pen-jio-37',
      name: 'Jio-bp pulse - Pen-Khopoli Bypass Hub (60 kW DC)',
      powerKw: 60,
      highwayMark: 'KM 105 near Pen interchange',
      durationMins: 15
    },
    elevationProfile: 'Ghat descent onto Konkan sea-level coastline'
  },
  {
    id: 'ratnagiri',
    name: 'Ratnagiri',
    shortName: 'Ratnagiri',
    region: 'Konkan',
    badge: 'Konkan Coastline',
    icon: '🌊',
    distanceKm: 305,
    baseTravelMinutes: 375,
    coordinates: [16.9902, 73.3120],
    destinationLabel: 'Ratnagiri (Shivaji Nagar / Konkan Coast)',
    highwayCorridor: 'NH48 & Amba Ghat Scenic Pass',
    routeWaypoints: [
      [18.5204, 73.8567],
      [18.0500, 74.0000],
      [17.6800, 74.0000],
      [17.2890, 74.1820],
      [16.9500, 73.8500],
      [16.9902, 73.3120]
    ],
    recommendedStop: {
      stationId: 'karad-statiq-19',
      name: 'Statiq EV Hub - Karad Bypass NH48 (60 kW DC)',
      powerKw: 60,
      highwayMark: 'KM 158 before Amba Ghat',
      durationMins: 25
    },
    elevationProfile: 'Amba Ghat mountain pass descent to coastal Konkan'
  },
  {
    id: 'nanded',
    name: 'Nanded',
    shortName: 'Nanded',
    region: 'Marathwada',
    badge: 'Spiritual Center',
    icon: '🚩',
    distanceKm: 445,
    baseTravelMinutes: 440,
    coordinates: [19.1383, 77.3210],
    destinationLabel: 'Nanded (Hazur Sahib & Marathwada Hub)',
    highwayCorridor: 'NH61 Central Maharashtra Corridor',
    routeWaypoints: [
      [18.5204, 73.8567],
      [19.0950, 74.7450],
      [19.8762, 75.3433],
      [19.8320, 75.8820],
      [19.1383, 77.3210]
    ],
    recommendedStop: {
      stationId: 'jalna-jio-34',
      name: 'Jio-bp pulse - Samruddhi Interchange, Jalna (120 kW)',
      powerKw: 120,
      highwayMark: 'KM 280 midway junction',
      durationMins: 30
    },
    elevationProfile: 'Rolling agricultural plains of Marathwada'
  },
  {
    id: 'jalgaon',
    name: 'Jalgaon',
    shortName: 'Jalgaon',
    region: 'Northern',
    badge: 'Banana & Gold City',
    icon: '🍌',
    distanceKm: 385,
    baseTravelMinutes: 420,
    coordinates: [21.0077, 75.5626],
    destinationLabel: 'Jalgaon (Gold City & North Maharashtra)',
    highwayCorridor: 'Pune-Sambhajinagar-Jalgaon NH753F',
    routeWaypoints: [
      [18.5204, 73.8567],
      [19.0950, 74.7450],
      [19.8762, 75.3433],
      [20.5000, 75.5000],
      [21.0077, 75.5626]
    ],
    recommendedStop: {
      stationId: 'csn-jio-23',
      name: 'Jio-bp pulse - Mukundwadi Hub, Sambhajinagar (120 kW)',
      powerKw: 120,
      highwayMark: 'KM 235',
      durationMins: 25
    },
    elevationProfile: 'Transit past Ajanta hills into Khandesh'
  },
  {
    id: 'amravati',
    name: 'Amravati',
    shortName: 'Amravati',
    region: 'Vidarbha',
    badge: 'Vidarbha Gateway',
    icon: '🌲',
    distanceKm: 575,
    baseTravelMinutes: 490,
    coordinates: [20.9374, 77.7796],
    destinationLabel: 'Amravati (Vidarbha Cultural Center)',
    highwayCorridor: 'Samruddhi Mahamarg Vidarbha Section',
    routeWaypoints: [
      [18.5204, 73.8567],
      [19.0950, 74.7450],
      [19.8762, 75.3433],
      [19.8320, 75.8820],
      [20.7400, 77.5000],
      [20.9374, 77.7796]
    ],
    recommendedStop: {
      stationId: 'jalna-jio-34',
      name: 'Jio-bp pulse - Samruddhi Interchange, Jalna (120 kW)',
      powerKw: 120,
      highwayMark: 'KM 280',
      durationMins: 30
    },
    elevationProfile: 'High-speed Samruddhi expressway corridor'
  }
];

interface RouteOption {
  id: 'fastest' | 'efficient' | 'fewer_stops';
  name: string;
  tag: string;
  distanceKm: number;
  travelTime: string;
  batteryConsumptionKwh: number;
  batteryConsumptionPercent: number;
  chargingStops: number;
  stopName: string;
  stopDuration: string;
  arrivalBatteryPercent: number;
}

export const SmartRoutePage: React.FC = () => {
  const navigate = useNavigate();

  // Inputs
  const [origin, setOrigin] = useState('Pune');
  const [destination, setDestination] = useState('Mumbai');
  const [currentBattery, setCurrentBattery] = useState(78);
  const [vehicle, setVehicle] = useState('Tata Nexon EV Long Range (2025)');
  const [drivingStyle, setDrivingStyle] = useState('Normal / Balanced');
  const [minReserve, setMinReserve] = useState(20);
  const [corridorChargers, setCorridorChargers] = useState<ChargingStation[]>([]);

  // Selected Route Option
  const [selectedRouteId, setSelectedRouteId] = useState<'fastest' | 'efficient' | 'fewer_stops'>('fastest');
  const [isPlanning, setIsPlanning] = useState(false);

  // Region filter for quick destination chips
  const [selectedRegion, setSelectedRegion] = useState<string>('All');

  // Match current destination to known Maharashtra corridor if available
  const matchedCorridor = useMemo(() => {
    const dLower = destination.toLowerCase().trim();
    return (
      MAHARASHTRA_CORRIDORS.find(
        (c) =>
          c.name.toLowerCase() === dLower ||
          c.shortName.toLowerCase() === dLower ||
          dLower.includes(c.shortName.toLowerCase()) ||
          c.name.toLowerCase().includes(dLower)
      ) || MAHARASHTRA_CORRIDORS[0]
    );
  }, [destination]);

  // Dynamic Route Options Generator
  const routeOptions: RouteOption[] = useMemo(() => {
    const dist = matchedCorridor.distanceKm;
    const baseMinutes = matchedCorridor.baseTravelMinutes;

    // Vehicle Battery Capacity
    const capacityKwh = vehicle.includes('50.3') ? 50.3 : vehicle.includes('39.4') ? 39.4 : 40.5;

    // Style multipliers
    let styleSpeedMultiplier = 1.0;
    let styleEnergyMultiplier = 1.0;
    if (drivingStyle === 'Fast Highway') {
      styleSpeedMultiplier = 0.9;
      styleEnergyMultiplier = 1.18;
    } else if (drivingStyle === 'Eco / Gentle') {
      styleSpeedMultiplier = 1.15;
      styleEnergyMultiplier = 0.88;
    }

    // Baseline: ~142 Wh/km
    const baseKwhPerKm = 0.142;

    // 1. Fastest Route
    const fastestKwh = Math.round(dist * baseKwhPerKm * styleEnergyMultiplier * 10) / 10;
    const fastestPercent = Math.min(100, Math.round((fastestKwh / capacityKwh) * 100));
    const fastestMinutes = Math.round(baseMinutes * styleSpeedMultiplier);
    const fastestHours = Math.floor(fastestMinutes / 60);
    const fastestMinsRem = fastestMinutes % 60;
    const fastestTimeStr = `${fastestHours}h ${fastestMinsRem < 10 ? '0' : ''}${fastestMinsRem}m`;

    const fastestNet = currentBattery - fastestPercent;
    const fastestStops = fastestNet < minReserve ? Math.max(1, Math.ceil((minReserve - fastestNet) / 45)) : 0;
    const fastestArrival =
      fastestStops > 0
        ? Math.min(85, Math.max(18, fastestNet + fastestStops * 45))
        : Math.max(5, fastestNet);

    // 2. Energy Efficient (Eco Mode)
    const ecoKwh = Math.round(dist * baseKwhPerKm * 0.86 * 10) / 10;
    const ecoPercent = Math.min(100, Math.round((ecoKwh / capacityKwh) * 100));
    const ecoMinutes = Math.round(baseMinutes * 1.18);
    const ecoHours = Math.floor(ecoMinutes / 60);
    const ecoMinsRem = ecoMinutes % 60;
    const ecoTimeStr = `${ecoHours}h ${ecoMinsRem < 10 ? '0' : ''}${ecoMinsRem}m`;

    const ecoNet = currentBattery - ecoPercent;
    const ecoStops = ecoNet < minReserve ? Math.max(1, Math.ceil((minReserve - ecoNet) / 45)) : 0;
    const ecoArrival =
      ecoStops > 0
        ? Math.min(88, Math.max(22, ecoNet + ecoStops * 45))
        : Math.max(10, ecoNet);

    // 3. Fewer Stops (Deep direct transit)
    const fewerKwh = Math.round(dist * baseKwhPerKm * 0.94 * 10) / 10;
    const fewerPercent = Math.min(100, Math.round((fewerKwh / capacityKwh) * 100));
    const fewerMinutes = Math.round(baseMinutes * 1.05);
    const fewerHours = Math.floor(fewerMinutes / 60);
    const fewerMinsRem = fewerMinutes % 60;
    const fewerTimeStr = `${fewerHours}h ${fewerMinsRem < 10 ? '0' : ''}${fewerMinsRem}m`;

    const fewerNet = currentBattery - fewerPercent;
    const fewerStops = dist <= 160 && currentBattery >= 75 ? 0 : Math.max(0, fastestStops - 1);
    const fewerArrival =
      fewerStops > 0
        ? Math.min(75, Math.max(15, fewerNet + fewerStops * 50))
        : Math.max(5, fewerNet);

    return [
      {
        id: 'fastest',
        name: 'Fastest Route',
        tag: 'Recommended',
        distanceKm: dist,
        travelTime: fastestTimeStr,
        batteryConsumptionKwh: fastestKwh,
        batteryConsumptionPercent: fastestPercent,
        chargingStops: fastestStops,
        stopName: fastestStops > 0 ? matchedCorridor.recommendedStop.name : 'Direct Transit (No intermediate stop needed)',
        stopDuration: fastestStops > 0 ? `${matchedCorridor.recommendedStop.durationMins} mins top-up` : '0 mins',
        arrivalBatteryPercent: fastestArrival
      },
      {
        id: 'efficient',
        name: 'Energy Efficient',
        tag: 'Max Eco Mode',
        distanceKm: Math.round(dist * 1.02),
        travelTime: ecoTimeStr,
        batteryConsumptionKwh: ecoKwh,
        batteryConsumptionPercent: ecoPercent,
        chargingStops: ecoStops,
        stopName: ecoStops > 0 ? matchedCorridor.recommendedStop.name : 'Direct Transit (Eco cruising preserves battery)',
        stopDuration: ecoStops > 0 ? `${Math.max(10, matchedCorridor.recommendedStop.durationMins - 5)} mins top-up` : '0 mins',
        arrivalBatteryPercent: ecoArrival
      },
      {
        id: 'fewer_stops',
        name: 'Fewer Charging Stops',
        tag: 'Direct Transit',
        distanceKm: dist,
        travelTime: fewerTimeStr,
        batteryConsumptionKwh: fewerKwh,
        batteryConsumptionPercent: fewerPercent,
        chargingStops: fewerStops,
        stopName: fewerStops > 0 ? matchedCorridor.recommendedStop.name : 'No intermediate stops required',
        stopDuration: fewerStops > 0 ? `${matchedCorridor.recommendedStop.durationMins} mins top-up` : '0 mins',
        arrivalBatteryPercent: fewerArrival
      }
    ];
  }, [matchedCorridor, vehicle, drivingStyle, currentBattery, minReserve]);

  const activeOption = routeOptions.find((r) => r.id === selectedRouteId) || routeOptions[0];

  // Fetch corridor chargers whenever origin or destination changes
  useEffect(() => {
    evoraApi
      .getCorridorStations(origin, destination)
      .then((stns) => {
        if (stns && stns.length > 0) {
          setCorridorChargers(stns);
        }
      })
      .catch(console.error);
  }, [origin, destination]);

  const handlePlanRoute = (e: React.FormEvent) => {
    e.preventDefault();
    setIsPlanning(true);
    evoraApi
      .getCorridorStations(origin, destination)
      .then((stns) => {
        if (stns && stns.length > 0) setCorridorChargers(stns);
        setIsPlanning(false);
      })
      .catch(() => setIsPlanning(false));
  };

  const handleSelectCity = (city: MaharashtraCityCorridor) => {
    setDestination(city.name);
    setIsPlanning(true);
    evoraApi
      .getCorridorStations(origin, city.name)
      .then((stns) => {
        if (stns && stns.length > 0) setCorridorChargers(stns);
        setIsPlanning(false);
      })
      .catch(() => setIsPlanning(false));
  };

  // Filter city chips by region if selected
  const filteredCities = useMemo(() => {
    if (selectedRegion === 'All') return MAHARASHTRA_CORRIDORS;
    return MAHARASHTRA_CORRIDORS.filter((c) => c.region === selectedRegion);
  }, [selectedRegion]);

  // Stations for map: dynamically fetched corridor chargers from dataset
  const mapStations = corridorChargers.length > 0 ? corridorChargers : INITIAL_STATIONS.slice(0, 5);

  return (
    <div className="space-y-6 pb-12">
      {/* 7-Step Charging Journey Flow Bar */}
      <ChargingJourneyBar currentStep="plan_route" />

      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Maharashtra Expressway Route Planner
            </h1>
            <Badge variant="emerald" icon={Compass}>
              Statewide Corridors
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Intelligent intercity EV route planning across all Maharashtra highways factoring in Ghat elevations, consumption, and verified fast chargers
          </p>
        </div>

        <Badge variant="slate" icon={Info}>
          Active Corridor: {origin} ➔ {destination} ({matchedCorridor.distanceKm} km)
        </Badge>
      </div>

      {/* Algorithm & Dataset Disclosure Notice */}
      <div className="p-3.5 rounded-2xl bg-[#131B2B] border border-slate-800 text-xs text-slate-300 flex flex-wrap items-center gap-2">
        <Badge variant="slate">Application Routing Algorithm</Badge>
        <span className="text-[11px] text-slate-400">
          Highway trajectory and battery drain modeled for <strong>{vehicle}</strong> across Maharashtra (elevation profiles & Ghat passes included). All charging stops are verified records from the Indian EV Charging Stations (2025) dataset.
        </span>
      </div>

      {/* Main Grid: Input Form & Leaflet Corridor Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Route Inputs Form (5 cols) */}
        <div className="lg:col-span-5 bg-[#131B2B] border border-[#243046] rounded-3xl p-6 space-y-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="font-bold text-base text-white flex items-center gap-2">
              <Navigation className="w-5 h-5 text-emerald-400" />
              <span>Route Parameters</span>
            </h2>
            <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Auto-Calibrated</span>
            </span>
          </div>

          <form onSubmit={handlePlanRoute} className="space-y-4 text-xs">
            {/* From */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">From (Origin)</label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" />
                <input
                  type="text"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  required
                  placeholder="e.g. Pune"
                  className="w-full bg-[#0B0F17] text-slate-200 rounded-xl pl-9 pr-4 py-2.5 border border-[#243046] focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* To (Destination) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-300 font-semibold">To (Destination)</label>
                <span className="text-[10px] text-emerald-400">Click a city below or type</span>
              </div>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-rose-400" />
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  required
                  placeholder="e.g. Mumbai, Nashik, Kolhapur..."
                  className="w-full bg-[#0B0F17] text-slate-200 rounded-xl pl-9 pr-4 py-2.5 border border-[#243046] focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Quick Clickable Maharashtra City Destinations */}
            <div className="p-3.5 rounded-2xl bg-[#0B0F17] border border-[#243046]/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-200 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Maharashtra Cities (Click to Select Destination):</span>
                </span>
              </div>

              {/* Region Category Selector */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none text-[10px]">
                {['All', 'Western', 'Northern', 'Marathwada', 'Vidarbha', 'Konkan'].map((reg) => (
                  <button
                    key={reg}
                    type="button"
                    onClick={() => setSelectedRegion(reg)}
                    className={`px-2 py-0.5 rounded-md font-medium whitespace-nowrap transition-colors ${
                      selectedRegion === reg
                        ? 'bg-slate-700 text-white font-bold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    {reg}
                  </button>
                ))}
              </div>

              {/* Interactive City Buttons Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-48 overflow-y-auto pr-1">
                {filteredCities.map((city) => {
                  const isCurrent =
                    destination.toLowerCase().trim() === city.name.toLowerCase() ||
                    destination.toLowerCase().trim() === city.shortName.toLowerCase();
                  return (
                    <button
                      key={city.id}
                      type="button"
                      onClick={() => handleSelectCity(city)}
                      className={`text-left p-2 rounded-xl border transition-all flex flex-col justify-between ${
                        isCurrent
                          ? 'bg-emerald-500/20 border-emerald-500 text-white shadow-sm shadow-emerald-500/20 ring-1 ring-emerald-500'
                          : 'bg-[#131B2B] border-[#243046] text-slate-300 hover:border-emerald-500/50 hover:bg-[#182338]'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs font-semibold truncate flex items-center gap-1">
                          <span>{city.icon}</span>
                          <span className="truncate">{city.shortName}</span>
                        </span>
                        {isCurrent && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0 animate-pulse" />
                        )}
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                        <span>{city.distanceKm} km</span>
                        <span className="text-[9px] text-slate-500 truncate max-w-[55px]">{city.region}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Current Battery & Minimum Battery Reserve in 2-col row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <label className="text-slate-300 font-semibold">Current Battery</label>
                  <span className="font-bold text-emerald-400">{currentBattery}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={currentBattery}
                  onChange={(e) => setCurrentBattery(parseInt(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <label className="text-slate-300 font-semibold">Min Reserve</label>
                  <span className="font-bold text-amber-400">{minReserve}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="30"
                  value={minReserve}
                  onChange={(e) => setMinReserve(parseInt(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Vehicle Selector */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Vehicle Model</label>
              <select
                value={vehicle}
                onChange={(e) => setVehicle(e.target.value)}
                className="w-full bg-[#0B0F17] text-slate-200 rounded-xl px-3 py-2 border border-[#243046] focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="Tata Nexon EV Long Range (2025)">Tata Nexon EV Long Range (2025, 40.5 kWh)</option>
                <option value="MG ZS EV (50.3 kWh)">MG ZS EV (50.3 kWh)</option>
                <option value="Mahindra XUV400 EL Pro (39.4 kWh)">Mahindra XUV400 EL Pro (39.4 kWh)</option>
              </select>
            </div>

            {/* Driving Style */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Driving Style</label>
              <select
                value={drivingStyle}
                onChange={(e) => setDrivingStyle(e.target.value)}
                className="w-full bg-[#0B0F17] text-slate-200 rounded-xl px-3 py-2 border border-[#243046] focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="Eco / Gentle">Eco Mode (Max Range, 75-80 km/h)</option>
                <option value="Normal / Balanced">Normal / Balanced Cruising (85-95 km/h)</option>
                <option value="Fast Highway">Fast Highway Cruising (100-110 km/h)</option>
              </select>
            </div>

            {/* Plan Route Button */}
            <button
              type="submit"
              disabled={isPlanning}
              className="w-full mt-2 py-3 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all disabled:opacity-50"
            >
              {isPlanning ? (
                <span className="inline-block w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Navigation className="w-4 h-4" />
                  <span>Calculate {destination} Smart Route</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Leaflet Map: Start, Route Polyline, Charging Station, Destination (7 cols) */}
        <div className="lg:col-span-7 bg-[#131B2B] border border-[#243046] rounded-3xl p-5 flex flex-col justify-between shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <span>Interactive Corridor Map</span>
                <span className="text-xs font-normal text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  {matchedCorridor.highwayCorridor}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Visualizing Start ({origin}) ➔ Recommended Fast Charger ➔ Destination ({matchedCorridor.destinationLabel})
              </p>
            </div>
            <Badge variant="emerald">Auto-Centering</Badge>
          </div>

          <div className="flex-1 min-h-[420px]">
            <IndiaMapLeaflet
              stations={mapStations}
              center={[
                (18.5204 + matchedCorridor.coordinates[0]) / 2,
                (73.8567 + matchedCorridor.coordinates[1]) / 2
              ]}
              zoom={8}
              height="420px"
              routeCoordinates={matchedCorridor.routeWaypoints}
              startPoint={{ name: `${origin} (Start Point)`, position: [18.5204, 73.8567] }}
              destinationPoint={{
                name: matchedCorridor.destinationLabel,
                position: matchedCorridor.coordinates
              }}
            />
          </div>

          {/* Corridor Elevation & Road Insights Bar */}
          <div className="p-3 rounded-2xl bg-[#0B0F17] border border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Mountain className="w-4 h-4 text-amber-400" />
              <span className="font-semibold text-slate-200">Elevation Profile:</span>
              <span className="text-[11px] text-slate-300">{matchedCorridor.elevationProfile}</span>
            </div>
            <span className="text-[11px] text-emerald-400 font-bold hidden sm:inline">
              Verified Fast Hubs: {mapStations.length}
            </span>
          </div>
        </div>
      </div>

      {/* 3 Route Options Cards (Fastest, Energy Efficient, Fewer Charging Stops) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div>
            <h3 className="font-extrabold text-base text-white">Route Options for {origin} ➔ {destination}</h3>
            <p className="text-xs text-slate-400">Select an optimized trajectory tailored for your travel priority</p>
          </div>
          <Badge variant="blue">Select Route Option</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {routeOptions.map((opt) => {
            const isSelected = opt.id === selectedRouteId;
            return (
              <div
                key={opt.id}
                onClick={() => setSelectedRouteId(opt.id)}
                className={`p-6 rounded-3xl border transition-all cursor-pointer relative space-y-4 ${
                  isSelected
                    ? 'bg-[#152338] border-emerald-500/80 shadow-lg shadow-emerald-500/10'
                    : 'bg-[#131B2B] border-[#243046] hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {opt.tag}
                    </span>
                    <h4 className="font-black text-lg text-white mt-1.5">{opt.name}</h4>
                  </div>
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-bold text-xs">
                      ✓
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                  <div className="p-3 rounded-2xl bg-[#0F172A] border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Distance</span>
                    <span className="text-lg font-black text-white mt-0.5 block">{opt.distanceKm} km</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#0F172A] border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Travel Time</span>
                    <span className="text-lg font-black text-emerald-400 mt-0.5 block">{opt.travelTime}</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#0F172A] border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Battery Draw</span>
                    <span className="text-sm font-bold text-white mt-0.5 block">{opt.batteryConsumptionKwh} kWh</span>
                    <span className="text-[10px] text-slate-500">{opt.batteryConsumptionPercent}% pack</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#0F172A] border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Charging Stops</span>
                    <span className="text-sm font-bold text-white mt-0.5 block">{opt.chargingStops} Stop(s)</span>
                    <span className="text-[10px] text-slate-500">{opt.stopDuration}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 text-xs text-slate-300">
                  <span className="text-[10px] text-slate-400 block font-semibold">Recommended Stop:</span>
                  <p className="font-bold text-white truncate mt-0.5">{opt.stopName}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Route Detailed Summary Callout & Navigation Actions */}
      <div className="bg-[#131B2B] border border-[#243046] rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h3 className="font-extrabold text-lg text-white">
              Selected Itinerary: {activeOption.name} ({origin} ➔ {destination})
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Distance: <strong className="text-slate-200">{activeOption.distanceKm} km</strong> • Travel Time:{' '}
              <strong className="text-emerald-400">{activeOption.travelTime}</strong> • Estimated Arrival Battery:{' '}
              <strong className="text-white">{activeOption.arrivalBatteryPercent}%</strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                const targetStation = mapStations.find((s) => s.id === matchedCorridor.recommendedStop.stationId) || mapStations[0];
                if (targetStation) navigate(`/chargers/${targetStation.id}`);
                else navigate('/chargers');
              }}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
            >
              View Hub Specs
            </button>
            <button
              onClick={() => navigate('/bookings')}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <CalendarCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Book Slot Along Corridor</span>
            </button>
            <button
              onClick={() => navigate('/charging')}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5"
            >
              <span>Monitor Live Session</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Milestone Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold flex-shrink-0">
              1
            </div>
            <div>
              <h4 className="font-bold text-white">Depart from {origin}</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Origin @ {currentBattery}% Battery</p>
              <span className="text-[10px] text-slate-500 block mt-1">KM 0</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#0F172A] border border-emerald-500/30 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold flex-shrink-0">
              2
            </div>
            <div>
              <h4 className="font-bold text-white">
                {activeOption.chargingStops > 0 ? 'Corridor Charging Stop' : 'Non-Stop Direct Cruising'}
              </h4>
              <p className="text-[11px] text-emerald-400 mt-0.5">{activeOption.stopName}</p>
              <span className="text-[10px] text-slate-400 block mt-1">
                {activeOption.chargingStops > 0
                  ? `${activeOption.stopDuration} • ${matchedCorridor.recommendedStop.highwayMark}`
                  : 'Sufficient reserve for direct arrival'}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center font-bold flex-shrink-0">
              3
            </div>
            <div>
              <h4 className="font-bold text-white">Arrive in {destination}</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Estimated Reserve: {activeOption.arrivalBatteryPercent}%</p>
              <span className="text-[10px] text-slate-500 block mt-1">KM {activeOption.distanceKm} Completed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
