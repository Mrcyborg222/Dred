require('dotenv').config();
const axios = require('axios');
const { Configuration, OpenAIApi } = require('openai');
const fs = require('fs');
const path = require('path');

// Charger la config JSON
const config = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, 'whatsapp_status_automation.json'))
);

const { ACCESS_TOKEN, PHONE_NUMBER, BUSINESS_ID, OPENAI_API_KEY } = process.env;

const openai = new OpenAIApi(new Configuration({ apiKey: OPENAI_API_KEY }));

async function generateStatus() {
  const res = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: 'Tu es un assistant pour créer des statuts WhatsApp.' },
      { role: 'user', content: 'Propose un statut accrocheur pour une promotion.' }
    ]
  });
  return res.data.choices[0].message.content.trim();
}

async function sendStatus(text) {
  const url = `https://graph.facebook.com/v18.0/${BUSINESS_ID}/messages`;
  const payload = {
    messaging_product: 'whatsapp',
    to: PHONE_NUMBER,
    type: 'text',
    text: { body: text }
  };
  const res = await axios.post(url, payload, {
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    }
  });
  console.log('✅ Statut envoyé :', text);
}

(async () => {
  console.log('🔄 Génération du statut…');
  const status = await generateStatus();
  console.log('💡 Statut généré :', status);
  console.log('🚀 Envoi du statut…');
  await sendStatus(status);
})();
