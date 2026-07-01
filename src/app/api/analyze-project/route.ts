import { NextRequest, NextResponse } from "next/server";
import { TIPO_ACABAMENTO_OPCOES } from "@/lib/pricing";

export const runtime = "nodejs";
export const maxDuration = 60;

// =========================================================
// Esta rota recebe um arquivo de projeto (PDF ou imagem),
// envia para a IA configurada (Gemini, Anthropic ou OpenAI) e devolve
// uma lista estruturada de ambientes + itens sugeridos, já no
// formato que a tela "Novo Orçamento" sabe consumir.
//
// O usuário final NUNCA lida com JSON ou prompts: ele apenas
// anexa o arquivo e clica em "Analisar com IA".
// =========================================================

const TIPOS_VALIDOS = TIPO_ACABAMENTO_OPCOES.map((o) => o.value);

const PROMPT_SISTEMA = `Você é um especialista em marcenaria e móveis planejados da empresa Oriente Móveis.
Analise a planta baixa, projeto arquitetônico ou desenho de marcenaria anexado e identifique:

1. Cada ambiente (ex: Cozinha, Quarto, Sala, Banheiro, Escritório).
2. Para cada ambiente, os móveis planejados presentes (armários, guarda-roupas, cozinhas, painéis, cabeceiras, etc).
3. Para cada móvel: uma descrição curta, a largura em metros e a altura em metros (estimadas a partir das medidas do desenho; se não houver cotas explícitas, estime de forma conservadora com base em proporções típicas de marcenaria residencial).
4. Um "tipoAcabamentoSugerido" para cada móvel, escolhido OBRIGATORIAMENTE entre estes valores exatos:
${TIPOS_VALIDOS.map((t) => `   - "${t}"`).join("\n")}

Responda SOMENTE com um JSON válido, sem markdown, sem texto antes ou depois, no seguinte formato exato:
{
  "resumo": "breve resumo do projeto em uma frase",
  "ambientes": [
    {
      "nome": "Cozinha",
      "itens": [
        {
          "descricao": "Armário planejado superior",
          "tipoAcabamentoSugerido": "branco_branco_telescopica",
          "larguraM": 3.2,
          "alturaM": 0.7,
          "observacao": "medida estimada a partir do desenho"
        }
      ]
    }
  ]
}`;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });
    }

    const provider = (process.env.AI_PROVIDER || "anthropic").toLowerCase();
    const bytes = Buffer.from(await file.arrayBuffer());
    const base64 = bytes.toString("base64");

    let resultadoTexto: string;

    if (provider === "gemini") {
      resultadoTexto = await analisarComGemini(base64, file.type);
    } else if (provider === "openai") {
      resultadoTexto = await analisarComOpenAI(base64, file.type);
    } else {
      resultadoTexto = await analisarComAnthropic(base64, file.type);
    }

    const jsonLimpo = resultadoTexto.replace(/```json|```/g, "").trim();
    const resultado = JSON.parse(jsonLimpo);

    return NextResponse.json({ sucesso: true, resultado });
  } catch (erro: any) {
    console.error("[analyze-project] erro:", erro);
    return NextResponse.json(
      {
        error:
          "Não foi possível analisar o projeto automaticamente. Você pode preencher os itens manualmente.",
        detalhe: erro?.message
      },
      { status: 500 }
    );
  }
}

async function analisarComAnthropic(base64: string, mimeType: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY não configurada.");

  const isPdf = mimeType === "application/pdf";

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: "claude-sonnet-5",
      max_tokens: 8192,
      system: PROMPT_SISTEMA,
      messages: [
        {
          role: "user",
          content: [
            {
              type: isPdf ? "document" : "image",
              source: {
                type: "base64",
                media_type: mimeType,
                data: base64
              }
            },
            {
              type: "text",
              text: "Analise este projeto e responda apenas com o JSON solicitado."
            }
          ]
        }
      ]
    })
  });

  if (!response.ok) {
    const erroTexto = await response.text();
    throw new Error(`Erro na API da Anthropic: ${erroTexto}`);
  }

  const data = await response.json();
  const textBlock = data.content?.find((c: any) => c.type === "text");
  if (!textBlock) throw new Error("Resposta da IA não contém texto.");
  return textBlock.text;
}

async function analisarComGemini(base64: string, mimeType: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY não configurada.");

  // Google AI Studio (Gemini) tem um nível gratuito de verdade — sem cartão de
  // crédito e sem prazo de expiração, com limites diários de uso.
  const modelo = "gemini-2.5-flash";

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: PROMPT_SISTEMA }] },
        contents: [
          {
            role: "user",
            parts: [
              { text: "Analise este projeto e responda apenas com o JSON solicitado." },
              { inline_data: { mime_type: mimeType, data: base64 } }
            ]
          }
        ],
        generationConfig: { maxOutputTokens: 8192, responseMimeType: "application/json" }
      })
    }
  );

  if (!response.ok) {
    const erroTexto = await response.text();
    throw new Error(`Erro na API do Gemini: ${erroTexto}`);
  }

  const data = await response.json();
  const texto = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!texto) throw new Error("Resposta da IA não contém texto.");
  return texto;
}

async function analisarComOpenAI(base64: string, mimeType: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY não configurada.");

  // OpenAI (Chat Completions com visão) — usado apenas para imagens.
  // Para PDFs, recomenda-se converter para imagem antes de enviar, ou usar a Anthropic.
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        { role: "system", content: PROMPT_SISTEMA },
        {
          role: "user",
          content: [
            { type: "text", text: "Analise este projeto e responda apenas com o JSON solicitado." },
            { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64}` } }
          ]
        }
      ],
      max_tokens: 8192
    })
  });

  if (!response.ok) {
    const erroTexto = await response.text();
    throw new Error(`Erro na API da OpenAI: ${erroTexto}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}
