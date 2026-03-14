const Groq = require("groq-sdk");
const Pet = require("../models/Pet");
const Vaccination = require("../models/Vaccination");
const Appointment = require("../models/Appointment");
const MedicalRecord = require("../models/MedicalRecord");
const Prescription = require("../models/Prescription");
const ChatSession = require("../models/ChatSession");

const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

// ─── Tool Definitions (OpenAI/Groq Format) ──────────────────────────────────
const tools = [
  {
    type: "function",
    function: {
      name: "get_pet_health_summary",
      description: "Get a comprehensive health and medical summary for a specific pet by name.",
      parameters: {
        type: "object",
        properties: {
          petName: { type: "string", description: "The name of the pet." }
        },
        required: ["petName"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "list_upcoming_appointments",
      description: "List all scheduled vet appointments for the user.",
      parameters: {
        type: "object",
        properties: {},
      }
    }
  }
];

// ─── Tool Implementations ─────────────────────────────────────────────────────
const executableTools = {
  get_pet_health_summary: async (args, userId) => {
    const petQuery = typeof args === 'string' ? JSON.parse(args).petName : args.petName;
    const pet = await Pet.findOne({ ownerId: userId, name: new RegExp(`^${petQuery}$`, 'i') });
    if (!pet) return { error: `Pet named ${petQuery} not found.` };
    const [vaccs, records] = await Promise.all([
      Vaccination.find({ petId: pet._id }),
      MedicalRecord.find({ petId: pet._id }).sort({ recordDate: -1 }).limit(5)
    ]);
    return {
      pet: pet.name, breed: pet.breed, age: pet.age,
      vaccinations: vaccs.map(v => `${v.vaccineType} (Next: ${v.nextDueDate?.toDateString()})`),
      recentHistory: records.map(r => `${r.recordDate?.toDateString()}: ${r.diagnosis}`)
    };
  },
  list_upcoming_appointments: async (args, userId) => {
    const apps = await Appointment.find({ userId, status: 'scheduled' }).populate('vetId petId');
    return apps.map(a => ({
      pet: a.petId?.name, vet: a.vetId?.name,
      date: a.date?.toDateString(), time: a.time, reason: a.reason
    }));
  }
};

// ─── Helper: Build Pet Context ────────────────────────────────────────────────
async function getPetContext(userId) {
  const pets = await Pet.find({ ownerId: userId });
  const petIds = pets.map(p => p._id);

  const [vaccinations, appointments, medicalRecords] = await Promise.all([
    Vaccination.find({ petId: { $in: petIds } }),
    Appointment.find({ userId }).populate('vetId petId'),
    MedicalRecord.find({ petId: { $in: petIds } }).sort({ recordDate: -1 }).limit(10),
  ]);

  if (pets.length === 0) return "User has no pets registered yet.";

  let ctx = "User's Registered Pets:\n";
  pets.forEach(pet => {
    ctx += `- **${pet.name}** (${pet.type}, ${pet.breed || 'Unknown'}, Age: ${pet.age || 'N/A'}, Weight: ${pet.weight || 'N/A'}kg)\n`;
    const petVaccs = vaccinations.filter(v => v.petId.toString() === pet._id.toString());
    if (petVaccs.length > 0) {
      ctx += `  Vaccines: ${petVaccs.map(v => `${v.vaccineType} (Next due: ${v.nextDueDate?.toDateString() || 'N/A'})`).join(', ')}\n`;
    }
  });

  const upcoming = appointments.filter(a => a.status === 'scheduled');
  if (upcoming.length > 0) {
    ctx += "\nUpcoming Appointments:\n";
    upcoming.forEach(a => {
      ctx += `- ${a.petId?.name || 'Pet'} with Dr. ${a.vetId?.name || 'Vet'} on ${a.date?.toDateString()} at ${a.time}\n`;
    });
  }

  if (medicalRecords.length > 0) {
    ctx += "\nRecent Medical History:\n";
    medicalRecords.forEach(r => {
      const petName = pets.find(p => p._id.toString() === r.petId?.toString())?.name || 'Pet';
      ctx += `- ${petName}: ${r.diagnosis} (${r.recordDate?.toDateString()}). Meds: ${r.medication || 'None'}\n`;
    });
  }

  return ctx;
}

// ─── Helper: System Prompt ────────────────────────────────────────────────────
function getSystemPrompt(petContext) {
  return `You are PawsAI 🐾, a warm, professional veterinary assistant inside the PetCare Super App.

## Formatting Rules (CRITICAL - Follow exactly)
- Always use proper Markdown formatting.
- Use **bold** for pet names, key terms, and important values.
- Use bullet points (- ) for lists. Never use raw asterisks (*) as bullet points.
- Use ## for section headers.
- Keep paragraphs short (2-3 lines max).
- Never output raw Markdown syntax like **, *, or ## as visible text.
- If you need to use a tool, use the official JSON function format. Do not output raw <function> XML tags in your response.

## Tone
- Warm, empathetic, and expert. Like a trusted vet friend.
- Always suggest consulting a vet for serious symptoms.

## Pet Data
${petContext}

Today: ${new Date().toDateString()}`;
}

// ─── Main Chat Endpoint ───────────────────────────────────────────────────────
exports.chatWithAI = async (req, res, next) => {
  try {
    const { message } = req.body;
    const userId = req.user?.id || "000000000000000000000000"; // Valid ObjectId length string for guest

    if (!groq) {
      return res.status(200).json({
        reply: "Hi! I'm PawsAI 🐾. (Demo Mode — add GROQ_API_KEY to .env). How can I help?",
        isMock: true
      });
    }

    // Load or create chat session for memory
    let chatSession = await ChatSession.findOne({ userId });
    if (!chatSession) chatSession = new ChatSession({ userId, messages: [] });

    const petContext = await getPetContext(userId);
    const systemPrompt = getSystemPrompt(petContext);

    // Map Gemini DB schema to Groq/OpenAI Array
    const messages = [
      { role: "system", content: systemPrompt },
      ...chatSession.messages.slice(-20).map(m => ({
        role: m.role === "model" ? "assistant" : m.role,
        content: m.parts[0]?.text || ""
      })),
      { role: "user", content: message }
    ];

    let chatCompletion;
    try {
      chatCompletion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: messages,
        tools: tools,
        tool_choice: "auto",
      });
    } catch (apiError) {
      // Handle Groq's tool_use_failed (model outputs XML instead of JSON)
      if (apiError.error?.code === "tool_use_failed" || apiError.status === 400) {
        console.warn("[PawsAI Warning] Tool parsing failed by model, retrying without tools...");
        chatCompletion = await groq.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          messages: messages,
        });
      } else {
        throw apiError;
      }
    }

    let responseMessage = chatCompletion.choices[0].message;
    let finalContent = responseMessage.content;

    // Handle Tool Calls
    if (responseMessage.tool_calls) {
      messages.push(responseMessage); // Add assistant's tool call intent

      for (const toolCall of responseMessage.tool_calls) {
        console.log(`[PawsAI Tool] Calling: ${toolCall.function.name}`);
        const args = JSON.parse(toolCall.function.arguments);
        const toolResult = executableTools[toolCall.function.name]
          ? await executableTools[toolCall.function.name](args, userId)
          : { error: "Unknown tool" };
          
        messages.push({
          tool_call_id: toolCall.id,
          role: "tool",
          name: toolCall.function.name,
          content: JSON.stringify(toolResult),
        });
      }

      // Second round trip 
      const secondCompletion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: messages,
      });
      finalContent = secondCompletion.choices[0].message.content;
    }

    // Persist conversation to DB
    chatSession.messages.push({ role: "user", parts: [{ text: message }] });
    chatSession.messages.push({ role: "model", parts: [{ text: finalContent }] });
    if (chatSession.messages.length > 60) {
      chatSession.messages = chatSession.messages.slice(-60);
    }
    await chatSession.save();

    res.status(200).json({ reply: finalContent });

  } catch (error) {
    console.error("[PawsAI Error]", error.message, error.stack);
    res.status(500).json({
      reply: "Sorry, I'm having trouble right now. Please try again in a moment! 🐾",
      error: error.message
    });
  }
};

// ─── Streaming Chat Endpoint ──────────────────────────────────────────────────
exports.chatWithAIStream = async (req, res, next) => {
  try {
    const { message } = req.body;
    const userId = req.user?.id || "000000000000000000000000";

    if (!groq) {
      return res.status(400).json({ error: "Groq API Key missing" });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    let chatSession = await ChatSession.findOne({ userId });
    if (!chatSession) chatSession = new ChatSession({ userId, messages: [] });

    const petContext = await getPetContext(userId);
    const systemPrompt = getSystemPrompt(petContext);

    const messages = [
      { role: "system", content: systemPrompt },
      ...chatSession.messages.slice(-20).map(m => ({
        role: m.role === "model" ? "assistant" : m.role,
        content: m.parts[0]?.text || ""
      })),
      { role: "user", content: message }
    ];

    const stream = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: messages,
      stream: true,
    });

    let fullResponse = "";
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || "";
      if (content) {
        fullResponse += content;
        res.write(`data: ${JSON.stringify({ text: content })}\n\n`);
      }
    }

    chatSession.messages.push({ role: "user", parts: [{ text: message }] });
    chatSession.messages.push({ role: "model", parts: [{ text: fullResponse }] });
    if (chatSession.messages.length > 60) chatSession.messages = chatSession.messages.slice(-60);
    await chatSession.save();

    res.write('data: [DONE]\n\n');
    res.end();

  } catch (error) {
    console.error("[PawsAI Stream Error]", error.message);
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
};
