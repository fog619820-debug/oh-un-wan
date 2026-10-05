async function fetchWithRetry(url: string, init: RequestInit, retries = 2): Promise<Response> {
  let lastResponse: Response | undefined;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const response = await fetch(url, init);
    if (!response || ![429, 500, 503].includes(response.status)) {
      return response;
    }

    lastResponse = response;

    if (attempt < retries) {
      await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
    }
  }

  return lastResponse ?? new Response(JSON.stringify({ error: 'No response' }), { status: 500 });
}

function buildWorkoutPrompt(body: {
  message?: string;
  history?: Array<{ role: 'assistant' | 'user'; text: string }>;
  context?: {
    selectedDay?: string;
    today?: string;
    routineSummary?: Array<{
      name: string;
      totalSets: number;
      completedSets: number;
    }>;
    completed?: boolean;
  };
}) {
  const userMessage = body.message?.trim();
  const routineSummary = body.context?.routineSummary?.length
    ? body.context.routineSummary.map(
        (exercise) => `${exercise.name}: ${exercise.completedSets}/${exercise.totalSets} 세트 완료`,
      )
    : ['오늘 예정된 루틴 정보가 아직 없습니다.'];

  const contextText = `
오늘 날짜: ${body.context?.today ?? '알 수 없음'}
선택된 요일: ${body.context?.selectedDay ?? '알 수 없음'}
완료 여부: ${body.context?.completed ? '완료' : '미완료'}
루틴 요약:
- ${routineSummary.join('\n- ')}
`;

  return `당신은 운동 전문 코치이자 피트니스 상담 도우미입니다. 사용자에게는 운동 루틴, 근육통, 회복, 중량 증가, 휴식, 스트레칭, 근육 성장, 부상 예방에 대한 조언을 제공합니다. 한국어로 답변하고, 짧고 실용적이며, 안전한 조언을 우선하세요. 사용자에게 다음 상황을 반영해서 답하세요.\n\n${contextText}\n\n대화 기록:\n${(body.history ?? [])
    .map((item) => `${item.role === 'user' ? '사용자' : '코치'}: ${item.text}`)
    .join('\n')}\n\n사용자 질문: ${userMessage}`;
}

async function callOllama(prompt: string): Promise<{ ok: boolean; reply?: string; status?: number; error?: string }> {
  try {
    const baseUrl = (process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434').replace(/\/$/, '');
    const model = process.env.OLLAMA_MODEL ?? 'llama3.2';

    const response = await fetchWithRetry(`${baseUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        prompt,
        stream: false,
        options: {
          temperature: 0.7,
          num_predict: 500,
        },
      }),
    }, 2);

    if (!response.ok) {
      const errorBody = await response.text();
      return {
        ok: false,
        status: response.status,
        error: errorBody,
      };
    }

    const data = (await response.json()) as {
      response?: string;
    };

    const reply = (data.response ?? '').trim();
    return {
      ok: Boolean(reply),
      reply: reply || '로컬 AI가 답변을 준비하고 있습니다. 잠시 후 다시 시도해 주세요.',
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'unknown error',
    };
  }
}

async function callGemini(prompt: string) {
  const apiKey = process.env.GOOGLE_API_KEY ?? process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return {
      ok: false,
      status: 401,
      error: 'No api key',
    };
  }

  const response = await fetchWithRetry(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500,
        },
      }),
    },
    2,
  );

  if (!response.ok) {
    const errorBody = await response.text();
    return {
      ok: false,
      status: response.status,
      error: errorBody,
    };
  }

  const data = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };

  const reply =
    data.candidates
      ?.flatMap((candidate) => candidate.content?.parts ?? [])
      .map((part) => part.text ?? '')
      .join('')
      .trim() || '운동 코치가 답을 준비 중입니다. 잠시 후 다시 물어보세요.';

  return { ok: true, reply };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      message?: string;
      history?: Array<{ role: 'assistant' | 'user'; text: string }>;
      context?: {
        selectedDay?: string;
        today?: string;
        routineSummary?: Array<{
          name: string;
          totalSets: number;
          completedSets: number;
        }>;
        completed?: boolean;
      };
    };

    const userMessage = body.message?.trim();
    if (!userMessage) {
      return Response.json({ reply: '질문 내용을 입력해 주세요.' }, { status: 400 });
    }

    const prompt = buildWorkoutPrompt(body);

    const ollamaResult = await callOllama(prompt);
    if (ollamaResult.ok && ollamaResult.reply) {
      return Response.json({ reply: ollamaResult.reply });
    }

    const geminiResult = await callGemini(prompt);
    if (geminiResult.ok && geminiResult.reply) {
      return Response.json({ reply: geminiResult.reply });
    }

    if (ollamaResult.status === 404 || ollamaResult.status === 500 || ollamaResult.error) {
      return Response.json(
        {
          reply:
            '로컬 Ollama 서버에 연결할 수 없어요. 먼저 Ollama를 실행하고, 모델을 설치해 주세요. 예: ollama pull llama3.2',
          detail: ollamaResult.error,
        },
        { status: 503 },
      );
    }

    const code = geminiResult.status ?? 500;
    const isTemporary = [429, 500, 503].includes(code);

    return Response.json(
      {
        reply: isTemporary
          ? 'AI 서버가 잠시 응답하지 않고 있어요. 잠시 후 다시 시도해 주세요.'
          : `AI 서버 응답 오류가 발생했습니다. 잠시 후 다시 시도해 주세요. (${code})`,
        error: geminiResult.error,
      },
      { status: 500 },
    );
  } catch (error) {
    return Response.json(
      {
        reply: '서버 연결 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.',
        error: error instanceof Error ? error.message : 'unknown error',
      },
      { status: 500 },
    );
  }
}
