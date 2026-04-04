import { useState, useRef, useEffect } from 'react'
import { Bot, Send, User, Trash2, Sparkles } from 'lucide-react'

const QUICK_QUESTIONS = [
  'Quels sont les symptômes du glaucome ?',
  'Comment préparer un examen de la vue ?',
  'Quand dois-je consulter un ophtalmologue ?',
  'Comment bien entretenir mes lentilles ?',
]

// Simple local AI responses (no external API needed)
function generateResponse(question) {
  const q = question.toLowerCase()
  if (q.includes('glaucome'))
    return 'Le glaucome est une maladie oculaire qui endommage le nerf optique. Les symptômes incluent une perte progressive du champ visuel périphérique, des halos autour des lumières, et dans les cas aigus, une douleur oculaire intense avec nausées. Un dépistage régulier est essentiel car la maladie est souvent silencieuse au début. Consultez votre ophtalmologue au Centre Medical Danan pour un examen complet.'
  if (q.includes('examen') || q.includes('préparer'))
    return 'Pour préparer votre examen de la vue : apportez vos lunettes ou lentilles actuelles, la liste de vos médicaments, et vos anciens résultats si disponibles. Évitez de porter des lentilles 24h avant si l\'examen inclut une mesure de cornée. Si une dilatation pupillaire est prévue, prévoyez un accompagnateur pour le retour.'
  if (q.includes('consulter') || q.includes('quand'))
    return 'Consultez un ophtalmologue en urgence si vous ressentez : une perte soudaine de vision, des flashs lumineux, un voile noir, une douleur oculaire intense, ou une rougeur avec baisse de vision. En routine, un contrôle annuel est recommandé après 40 ans, ou tous les 2 ans avant. Les porteurs de lunettes/lentilles doivent consulter chaque année.'
  if (q.includes('lentille'))
    return 'Pour l\'entretien de vos lentilles : lavez-vous toujours les mains avant manipulation, utilisez uniquement la solution recommandée (jamais d\'eau du robinet), changez l\'étui tous les 3 mois, respectez la durée de port quotidien, et ne dormez jamais avec vos lentilles sauf si elles sont prévues pour. En cas d\'irritation, retirez-les immédiatement.'
  if (q.includes('rendez-vous') || q.includes('rdv'))
    return 'Vous pouvez prendre rendez-vous directement depuis la section "Rendez-vous" du portail. Sélectionnez votre médecin, choisissez une date et un créneau disponible. Pour les urgences, contactez le Centre Medical Danan au +225 21 23 45 67 00.'
  if (q.includes('ordonnance') || q.includes('renouvellement'))
    return 'Pour renouveler une ordonnance, rendez-vous dans la section "Ordonnances", sélectionnez l\'ordonnance active et cliquez sur "Demander un renouvellement". Votre médecin examinera la demande sous 48-72h. Vous recevrez une notification une fois la demande traitée.'
  if (q.includes('bonjour') || q.includes('salut') || q.includes('hello'))
    return 'Bonjour ! Je suis l\'assistant virtuel du Centre Medical Danan. Je peux vous aider avec des questions sur la santé oculaire, vos rendez-vous, ordonnances ou résultats d\'examens. Comment puis-je vous aider ?'
  return 'Merci pour votre question. En tant qu\'assistant du Centre Medical Danan, je peux vous renseigner sur la santé oculaire, vos rendez-vous, ordonnances et résultats. Pour toute question médicale spécifique, je vous recommande de consulter directement votre ophtalmologue. N\'hésitez pas à reformuler votre question ou à choisir l\'une des suggestions rapides.'
}

export default function Chatbot() {
  const [messages, setMessages] = useState([
    {
      id: '1',
      role: 'assistant',
      content: 'Bonjour ! Je suis l\'assistant virtuel du Centre Medical Danan. 👁️ Je peux vous aider avec des questions sur la santé oculaire, vos rendez-vous, et le fonctionnement du portail. Comment puis-je vous aider ?',
    },
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  const sendMessage = async (text) => {
    const trimmed = text.trim()
    if (!trimmed) return

    const userMsg = { id: Date.now().toString(), role: 'user', content: trimmed }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setTyping(true)

    // Simulate delay
    await new Promise(r => setTimeout(r, 800 + Math.random() * 1000))

    const response = generateResponse(trimmed)
    setMessages(prev => [...prev, {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response,
    }])
    setTyping(false)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    sendMessage(input)
  }

  const clearChat = () => {
    setMessages([{
      id: Date.now().toString(),
      role: 'assistant',
      content: 'Chat réinitialisé. Comment puis-je vous aider ?',
    }])
  }

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-gray-900 flex items-center gap-2">
            <Bot className="w-6 h-6 text-primary" /> Assistant IA
          </h1>
          <p className="text-sm text-gray-500 mt-1">Posez vos questions sur la santé oculaire</p>
        </div>
        <button onClick={clearChat} className="btn-secondary text-sm py-2">
          <Trash2 className="w-4 h-4" /> Effacer
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto card p-4 space-y-4 mb-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
              ${msg.role === 'assistant'
                ? 'bg-gradient-to-br from-primary to-accent'
                : 'bg-gradient-to-br from-secondary to-primary-600'
              }`}>
              {msg.role === 'assistant'
                ? <Bot className="w-4 h-4 text-white" />
                : <User className="w-4 h-4 text-white" />
              }
            </div>
            <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed
              ${msg.role === 'assistant'
                ? 'bg-surface-200 text-gray-800 rounded-tl-sm'
                : 'bg-primary text-white rounded-tr-sm'
              }`}>
              {msg.content}
            </div>
          </div>
        ))}

        {typing && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-surface-200 px-4 py-3 rounded-2xl rounded-tl-sm">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick questions */}
      {messages.length <= 2 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {QUICK_QUESTIONS.map((q) => (
            <button key={q} onClick={() => sendMessage(q)}
              className="text-xs px-3 py-1.5 rounded-full border border-primary-200 text-primary-700
                         hover:bg-primary-50 transition-colors flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Tapez votre question..."
          className="input-field flex-1"
          disabled={typing}
        />
        <button type="submit" disabled={!input.trim() || typing} className="btn-primary px-4">
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  )
}
