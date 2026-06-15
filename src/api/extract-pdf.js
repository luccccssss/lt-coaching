export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { pdfBase64 } = req.body

    if (!pdfBase64) return res.status(400).json({ error: 'No PDF data provided' })

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) return res.status(500).json({ error: 'API key not configured' })

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
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
                text: `Extract all food/ingredient nutritional information from this document. Return data per 100g where possible. If per serving, convert to per 100g.

Return ONLY valid JSON, no markdown:
{"foods":[{"name":"Food name","category":"Protein|Carbs|Fats|Veg|Dairy|Other","calories":165,"protein":31,"carbs":0,"fats":3.6,"per_grams":100}]}

If no nutritional data found, return {"foods":[]}`
              }
            ]
          }
        ]
      })
    })

    const responseText = await response.text()

    if (!response.ok) {
      console.error('Anthropic API error:', responseText)
      return res.status(500).json({ error: 'API error: ' + response.status + ' ' + responseText.slice(0, 200) })
    }

    let data
    try {
      data = JSON.parse(responseText)
    } catch (e) {
      return res.status(500).json({ error: 'Invalid API response: ' + responseText.slice(0, 200) })
    }

    if (!data.content || !data.content[0]) {
      return res.status(500).json({ error: 'No content in API response' })
    }

    const text = data.content[0].text.replace(/```json|```/g, '').trim()

    let parsed
    try {
      parsed = JSON.parse(text)
    } catch (e) {
      return res.status(500).json({ error: 'Could not parse food data from PDF. Try a different PDF.' })
    }

    res.status(200).json(parsed)
  } catch (error) {
    console.error('PDF extraction error:', error)
    res.status(500).json({ error: 'Server error: ' + error.message })
  }
}
