from ddgs import DDGS


def web_search(query: str):
    try:
        print("SEARCH QUERY =", query)

        with DDGS() as ddgs:
            results = list(ddgs.text(query, max_results=5))

        print("RESULTS =", results)

        if not results:
            return None

        response = "🌐 Latest Information:\n\n"

        for i, result in enumerate(results, start=1):
            response += (
                f"{i}. {result.get('title', 'No title')}\n"
                f"{result.get('body', '')}\n\n"
            )

        return response

    except Exception as e:
        print("DDGS ERROR =", e)
        return None


KNOWLEDGE_BASE = {
    "flood"        : "🌊 Floods occur when water overflows onto dry land. Most affected states: Bihar, Assam, UP. Key rivers: Ganga, Brahmaputra, Kosi. Bihar alone sees 50+ flood events (1900–2021).",
    "earthquake"   : "🏔️ Earthquakes are caused by tectonic plate movements. High-risk zones: Himalayan belt, Northeast India, Andaman & Nicobar. 2001 Bhuj earthquake killed 20,000+ people.",
    "cyclone"      : "🌀 Cyclones form over warm ocean water. India's east coast (Bay of Bengal) is more prone. Most affected: Odisha, Andhra Pradesh, Tamil Nadu. 1999 Odisha Super Cyclone: 10,000+ deaths.",
    "drought"      : "🌵 Drought is prolonged water shortage due to low rainfall. Most drought-prone states: Rajasthan, Maharashtra, Karnataka, Andhra Pradesh.",
    "landslide"    : "⛰️ Landslides occur due to heavy rain on steep slopes. High-risk zones: Uttarakhand, Himachal Pradesh, Northeast India, Western Ghats.",
    "wildfire"     : "🔥 Wildfires spread in dry, hot, windy conditions. Uttarakhand forests are most affected, especially March–June every year.",
    "tsunami"      : "🌊 Tsunamis are giant waves triggered by underwater earthquakes. 2004 Indian Ocean Tsunami killed 10,000+ in India — Tamil Nadu worst hit.",
    "ndrf"         : "🛡️ NDRF (National Disaster Response Force) is India's specialized disaster response agency with 16 battalions across the country. Helpline: 011-24363260.",
    "ndma"         : "🏛️ NDMA (National Disaster Management Authority) is India's apex disaster management body, headed by the Prime Minister.",
    "preparedness" : "✅ Disaster preparedness tips: Keep emergency kit ready, know evacuation routes, save emergency numbers — NDRF: 011-24363260, Emergency: 112.",
    "climate"      : "🌍 Climate change is increasing disaster frequency in India — more extreme rainfall, stronger cyclones, and longer droughts every year.",
    "relief"       : "🤝 Disaster relief in India is coordinated by NDMA, state governments, NDRF, and NGOs. PM Relief Fund accepts donations.",
    "warning"      : "📡 India has early warning systems for cyclones (IMD), floods (CWC), and earthquakes (NCS). Alerts sent via SMS and TV.",
    "kedarnath"    : "⛰️ 2013 Kedarnath disaster: Flash flood + landslide combo, 5,000+ deaths. India's worst multi-disaster event.",
    "uttarakhand"  : "🌊 2013 Uttarakhand Flash Flood: 6,054 deaths, lakhs homeless. Kedarnath was worst affected. India's deadliest flood disaster.",
    "kerala"       : "🌊 2018 Kerala Floods: 504 deaths, 5.4 million affected, all 14 districts hit. Worst flood in 100 years.",
    "assam"        : "🌊 Assam is India's most flood-prone state, caused by Brahmaputra river. 32 lakh people affected in 2022 alone.",
    "bhuj"         : "🏔️ 2001 Bhuj Earthquake: Magnitude 7.7, 20,000+ deaths. India's deadliest earthquake in modern history.",
    "2004"         : "🌊 2004 Indian Ocean Tsunami: 10,000+ deaths in India. Tamil Nadu, Andhra Pradesh, Kerala worst affected. Caused by 9.1 magnitude quake.",
}


def search_knowledge(query: str):
    query_lower = query.lower()
    for keyword, info in KNOWLEDGE_BASE.items():
        if keyword in query_lower:
            return info
    return None