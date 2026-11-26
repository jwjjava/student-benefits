import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { parseArgs } from "node:util";
import { discoverBenefits, domainsSchema, reviewedBenefitsSql, summarizeRawResponse, todayInSeoul } from "./benefit-discovery.mjs";

const usage = `혜택 AI 수집 및 검수용 SQL 생성

npm run benefits:discover -- --topic "한국 대학생 개발 도구" --domains "jetbrains.com,github.com" --output "benefits-review.json"
npm run benefits:sql -- --input "benefits-review.json" --output "benefits-reviewed.sql"

수집에는 환경 변수 OPENAI_API_KEY가 필요합니다. --limit으로 후보 수(1~10, 기본 5)를 지정할 수 있습니다.
--raw를 붙이면 OpenAI 원본 응답(검색 기록, 필터 전 후보, 토큰 사용량)을 <output 이름>.raw.json에 함께 저장합니다.`;

/** review/a.json → review/a.raw.json */
function rawPathFor(output) {
  return /\.json$/i.test(output) ? output.replace(/\.json$/i, ".raw.json") : `${output}.raw.json`;
}

async function run(command, args) {
  if (args.includes("--help")) {
    console.log(usage);
    return;
  }

  const discovery = command === "discover";
  if (!discovery && command !== "sql") throw new Error("지원하는 명령은 discover와 sql입니다.");
  const { values } = parseArgs({
    args,
    options: {
      output: { type: "string" },
      ...(discovery
        ? {
          topic: { type: "string" },
          domains: { type: "string" },
          limit: { type: "string", default: "5" },
          raw: { type: "boolean", default: false },
        }
        : { input: { type: "string" } }),
    },
  });
  if (!values.output?.trim()) throw new Error("--output 파일 경로를 지정하세요.");
  const date = todayInSeoul();

  if (discovery) {
    const topic = values.topic?.trim();
    if (!topic || topic.length > 500) throw new Error("--topic에 1~500자의 검색 주제를 지정하세요.");
    const parsedDomains = domainsSchema.safeParse([...new Set((values.domains ?? "").split(",").map((domain) => domain.trim().toLowerCase()))]);
    if (!parsedDomains.success) throw new Error("--domains에 공식 도메인을 쉼표로 구분해 지정하세요. 예: github.com,jetbrains.com");
    const limit = Number(values.limit);
    if (!Number.isInteger(limit) || limit < 1 || limit > 10) throw new Error("--limit은 1~10의 정수여야 합니다.");
    const apiKey = process.env.OPENAI_API_KEY?.trim();
    if (!apiKey) throw new Error("터미널의 OPENAI_API_KEY 환경 변수를 설정하세요.");

    const rawPath = values.raw ? rawPathFor(values.output) : null;
    // API를 부르기 전에 확인한다. 끝난 뒤에 알면 토큰만 쓰고 결과를 못 남긴다.
    const taken = [values.output, rawPath].filter((path) => path && existsSync(path));
    if (taken.length) throw new Error(`출력 파일이 이미 있습니다: ${taken.join(", ")}\n다른 --output 경로를 지정하세요.`);
    const result = await discoverBenefits({
      apiKey, model: process.env.OPENAI_MODEL?.trim() || "gpt-5-mini",
      topic, domains: parsedDomains.data, limit, date,
      // 원본은 검증 전에 저장한다. 후보 검증이 실패해도 무엇을 받았는지 볼 수 있다.
      onResponse: async (body) => {
        const { usage } = body ?? {};
        if (usage) console.log(`토큰 사용: 입력 ${usage.input_tokens ?? "?"} · 출력 ${usage.output_tokens ?? "?"} · 합계 ${usage.total_tokens ?? "?"}`);
        if (!rawPath) return;
        await writeFile(rawPath, `${JSON.stringify(summarizeRawResponse(body), null, 2)}\n`, { flag: "wx" });
        console.log(`원본 응답 저장: ${rawPath}`);
      },
    });
    await writeFile(values.output, `${JSON.stringify(result, null, 2)}\n`, { flag: "wx" });
    console.log(`검수 후보 ${result.candidates.length}건 저장: ${values.output}`);
    return;
  }

  if (!values.input?.trim()) throw new Error("--input 검수 파일 경로를 지정하세요.");
  const document = JSON.parse(await readFile(values.input, "utf8"));
  const result = reviewedBenefitsSql(document, date);
  await writeFile(values.output, result.sql, { flag: "wx" });
  console.log(`검수 완료 후보 ${result.count}건의 등록 SQL 생성: ${values.output}`);
}

try {
  await run(process.argv[2], process.argv.slice(3));
} catch (error) {
  if (error.code === "EEXIST") {
    console.error("출력 파일이 이미 있습니다. 다른 --output 경로를 지정하세요.");
  } else {
    console.error(error instanceof Error ? error.message : "혜택 작업에 실패했습니다.");
  }
  process.exitCode = 1;
}
