import { GoogleGenerativeAI } from "@google/generative-ai";
import { Cattle, MilkYield, HealthRecord } from "@/types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function getHerdAlerts(cattle: Cattle[], yields: MilkYield[]) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are an expert livestock veterinarian. 
      Analyze the production and status data for this dairy herd and identify 2-3 critical alerts.
      Focus on:
      1. Potential health issues (e.g., sudden drop in milk yield for specific cattle).
      2. Breeding pattern observations (e.g., cattle that should be checked for heat).
      3. Nutritional or environmental warnings.

      Herd Summary:
      Total Cattle: ${cattle.length}
      Cattle Statuses: ${cattle.map(c => `${c.name}: ${c.status}`).join(', ')}
      
      Recent Yields:
      ${yields.slice(0, 15).map(y => `${y.date}, Cattle ID ${y.cattleId}: ${y.total}L`).join('\n')}

      Format the output as a few concise bullet points. Be specific about which cattle might need attention if the data suggests it.
      Keep it very short and professional.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini Herd Error:", error);
    return "Ensure individual monitoring of high-yield cattle for any signs of fatigue.";
  }
}

export async function getCattleHealthInsights(cattle: Cattle, yields: MilkYield[], health: HealthRecord[]) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are an expert livestock veterinarian and dairy farm consultant.
      Analyze the data for this cattle and provide 2-3 concise, actionable health or production insights.
      
      Cattle Name: ${cattle.name}
      Breed: ${cattle.breed}
      Status: ${cattle.status}
      
      Recent Milk Yields (last 5 entries):
      ${yields.map(y => `${y.date}: ${y.total}L`).join('\n')}
      
      Recent Health incidents:
      ${health.map(h => `${h.date}: ${h.type} - ${h.description}`).join('\n')}
      
      Provide insights in simple, farmer-friendly language. Focus on trends and immediate actions.
      Keep it short (max 200 characters per insight).
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Ensure clean water and fresh fodder for optimal health.";
  }
}
