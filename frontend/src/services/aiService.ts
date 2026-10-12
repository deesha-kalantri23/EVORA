/**
 * EVORA AI Assistant Service Layer.
 * Designed to seamlessly connect to backend AI / LLM APIs (e.g. Gemini, OpenAI)
 * while providing immediate fallback intelligence with vehicle telemetry & Indian datasets.
 */

export interface ChatAction {
  label: string;
  route: string;
  description?: string;
}

export interface AIMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  time: string;
  action?: ChatAction;
  dataLabel?: string;
}

export interface AIResponse {
  reply: string;
  action?: ChatAction;
  dataLabel: string;
  provider: string;
}

const API_BASE_URL = 'http://127.0.0.1:8000/api';

export const aiService = {
  /**
   * Send a query to EVORA AI service layer.
   * Tries backend endpoint first, falls back gracefully to local intelligence.
   */
  async sendMessage(query: string, vehicleContext?: any): Promise<AIResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, vehicle_context: vehicleContext })
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (err) {
      console.warn('Backend AI service unreachable, using local fallback:', err);
    }

    // Local Fallback Simulation Intelligence
    return this.getLocalFallbackResponse(query);
  },

  getLocalFallbackResponse(query: string): AIResponse {
    const q = query.toLowerCase().trim();

    if (q.includes('battery') && (q.includes('health') || q.includes('healthy') || q.includes('soh') || q.includes('degrad'))) {
      return {
        reply: "Battery is Healthy: 94.0% SoH across 421 cycles with pack temp at 28.4°C (394.8V balanced). Degradation is nominal at ~1.4% per 10k km.",
        action: { label: 'Navigate to Battery Health', route: '/battery-health', description: 'Explore cell balance & degradation curve' },
        dataLabel: 'EVORA Copilot',
        provider: 'EVORA Local Intelligence'
      };
    }

    if (q.includes('charge') || q.includes('pune') || q.includes('station') || q.includes('near') || q.includes('where')) {
      return {
        reply: "Found 8 verified charging hubs in Pune, including Tata Power 60 kW at Phoenix Mall and Jio-bp 120 kW at Baner.",
        action: { label: 'Navigate to Chargers Map', route: '/chargers', description: 'Open Indian Charging Map on Google Maps' },
        dataLabel: 'EVORA Copilot',
        provider: 'EVORA Local Intelligence'
      };
    }

    if (q.includes('mumbai') || q.includes('reach') || q.includes('route') || q.includes('expressway') || q.includes('trip')) {
      return {
        reply: "Trip is 148 km. A 15-minute top-up at Zeon Urse (150 kW) is recommended before Khandala ghats.",
        action: { label: 'Navigate to Route Planner', route: '/route', description: 'View expressway route & charging stops' },
        dataLabel: 'EVORA Copilot',
        provider: 'EVORA Local Intelligence'
      };
    }

    if (q.includes('range') || q.includes('predict') || q.includes('distance') || q.includes('how far')) {
      return {
        reply: "At 78% battery, estimated range is 78 km (benchmark: 100 km average at 100% full charge).",
        action: { label: 'Navigate to Range Prediction', route: '/range-prediction', description: 'Simulate range under weather & style' },
        dataLabel: 'EVORA Copilot',
        provider: 'EVORA Local Intelligence'
      };
    }

    if (q.includes('cost') || q.includes('price') || q.includes('tariff') || q.includes('80%')) {
      return {
        reply: "Charging 20% to 80% costs ~₹182 on Home AC (₹7.5/unit) vs ~₹450 on DC Fast (₹18.5/unit). EV cost is ~₹1.45/km.",
        action: { label: 'Navigate to Cost Calculator', route: '/charging-cost', description: 'Calculate and compare Indian tariffs' },
        dataLabel: 'EVORA Copilot',
        provider: 'EVORA Local Intelligence'
      };
    }

    if (q.includes('improve') || q.includes('life') || q.includes('longevity') || q.includes('care')) {
      return {
        reply: "Keep daily charging between 20%–80%, cool pack 15 min after fast driving, and park in shade during Pune summers.",
        action: { label: 'Navigate to Battery Health', route: '/battery-health', description: 'Thermal regulation advisory' },
        dataLabel: 'EVORA Copilot',
        provider: 'EVORA Local Intelligence'
      };
    }

    if (q.includes('carbon') || q.includes('co2') || q.includes('green') || q.includes('saving')) {
      return {
        reply: "You've saved 126 kg CO₂ and ₹8,425 this month compared to petrol, equivalent to planting ~6 mature trees.",
        action: { label: 'Navigate to Carbon Footprint', route: '/carbon', description: 'View emissions & savings dashboard' },
        dataLabel: 'EVORA Copilot',
        provider: 'EVORA Local Intelligence'
      };
    }

    if (q.includes('wallet') || q.includes('balance') || q.includes('pay') || q.includes('money')) {
      return {
        reply: "Your EVORA demo wallet balance is ₹2,450, ready for one-tap RFID and QR charging sessions.",
        action: { label: 'Navigate to Wallet', route: '/wallet', description: 'Manage wallet balance & receipts' },
        dataLabel: 'EVORA Copilot',
        provider: 'EVORA Local Intelligence'
      };
    }

    return {
      reply: `I analyzed your request. Your Nexon EV is at 78% SoC (78 km range). How can I assist you?`,
      action: { label: 'Navigate to Dashboard', route: '/dashboard', description: 'Open main EVORA overview' },
      dataLabel: 'EVORA Copilot',
      provider: 'EVORA Local Intelligence'
    };
  }
};

