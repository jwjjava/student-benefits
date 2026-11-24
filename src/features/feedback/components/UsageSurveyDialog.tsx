"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { track } from "@/features/analytics/track";
import { submitUsageSurvey } from "../api";
import { MIN_AWAY_MS, pendingUsageStore } from "../pending";

type Step = "closed" | "ask" | "knew";

/**
 * 외부 신청 페이지에 다녀온 뒤 이 상세로 돌아오면 '혜택을 이용하셨나요?'를 묻는다. (POP-01)
 * 자기보고 응답이며 자동 이용 검증은 하지 않는다.
 */
type UsageSurveyDialogProps = { benefitId: string; benefitTitle: string };

export function UsageSurveyDialog({ benefitId, benefitTitle }: UsageSurveyDialogProps) {
  const [step, setStep] = useState<Step>("closed");

  useEffect(() => {
    const check = () => {
      if (document.visibilityState !== "visible") return;
      const pending = pendingUsageStore.get();
      if (!pending || pending.benefitId !== benefitId) return;
      if (Date.now() - pending.at < MIN_AWAY_MS) return;
      pendingUsageStore.set(null);
      setStep("ask");
      track({ name: "survey_open", benefitId });
    };
    check();
    document.addEventListener("visibilitychange", check);
    window.addEventListener("focus", check);
    window.addEventListener("pageshow", check);
    return () => {
      document.removeEventListener("visibilitychange", check);
      window.removeEventListener("focus", check);
      window.removeEventListener("pageshow", check);
    };
  }, [benefitId]);

  const finish = (response: "used" | "not_yet", knewBefore: boolean | null) => {
    setStep("closed");
    track({ name: "survey_submit", benefitId, props: { response } });
    void submitUsageSurvey({ benefitId, response, knewBefore });
  };

  const later = () => {
    setStep("closed");
    track({ name: "survey_dismiss", benefitId });
  };

  return (
    <Dialog
      open={step !== "closed"}
      onClose={later}
      labelledBy="usage-survey-title"
      // 응답이 성공 지표라서 배경 클릭으로는 닫지 않는다. Esc나 '나중에 답할게요'로만 닫힌다.
      dismissOnBackdrop={false}
    >
      {/* POP-01: 어떤 혜택에 대한 질문인지 대상 혜택명을 보여 준다. */}
      <p className="mb-1.5 line-clamp-2 text-[13px] font-medium text-accent">{benefitTitle}</p>
      {step === "knew" ? (
        <>
          <h2 id="usage-survey-title" className="text-[17px] font-bold text-ink">
            이 혜택을 원래 알고 있었나요?
          </h2>
          <div className="mt-5 space-y-3">
            <Button size="lg" onClick={() => finish("used", false)}>
              여기서 처음 알았어요
            </Button>
            <Button size="lg" variant="secondary" onClick={() => finish("used", true)}>
              원래 알고 있었어요
            </Button>
          </div>
        </>
      ) : (
        <>
          <h2 id="usage-survey-title" className="text-[17px] font-bold text-ink">
            혜택을 이용하셨나요?
          </h2>
          <div className="mt-5 space-y-3">
            <Button size="lg" onClick={() => setStep("knew")}>
              네, 이용했어요
            </Button>
            <Button size="lg" variant="secondary" onClick={() => finish("not_yet", null)}>
              아직 이용하지 않았어요
            </Button>
          </div>
          <button
            type="button"
            onClick={later}
            className="mx-auto mt-4 block text-xs text-ink-list underline underline-offset-2"
          >
            나중에 답할게요
          </button>
        </>
      )}
    </Dialog>
  );
}
