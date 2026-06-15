export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { pdfBase64, filename } = req.body

    if (!pdfBase64) return res.status(400).json({ error: 'No PDF data provided' })

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'document',
                source: {
                  type: 'base64',
                  media_type: 'application/pdf',
                  data: pdfBase64
                }
              },
              {
                type: 'text',
                text: `Extract all food/ingredient nutritional information from this document.
For each food item found, return the data per 100g where possible.
If the document shows per serving, convert to per 100g.

Return ONLY valid JSON, no markdown, no explanation:
{
  "foods": [
    {
      "name": "Food name",
      "category": "Protein|Carbs|Fats|Veg|Dairy|Other",
      "calories": 165,
      "protein": 31,
      "carbs": 0,
      "fats": 3.6,
      "per_grams": 100
    }
  ]
}

If no nutritional data is found, return { "foods": [] }`
              }
            ]
          }
        ]
      })
    })

    const data = await response.json()

    if (!data.content || !data.content[0]) {
      return res.status(500).json({ error: 'No response from AI' })
    }

    const text = data.content[0].text.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(text)

    res.status(200).json(parsed)
  } catch (error) {
    console.error('PDF extraction error:', error)
    res.status(500).json({ error: 'Failed to extract food data: ' + error.message })
  }
}
