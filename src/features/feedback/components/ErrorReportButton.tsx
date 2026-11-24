"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { track } from "@/features/analytics/track";
import { cn } from "@/lib/utils";
import { REPORT_KINDS, submitErrorReport, type ReportKind } from "../api";

type Status = "idle" | "sending" | "done" | "failed";

export function ErrorReportButton({ benefitId }: { benefitId: string }) {
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<ReportKind | null>(null);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  const close = () => {
    setOpen(false);
    setKind(null);
    setMessage("");
    setStatus("idle");
  };

  const submit = async () => {
    if (!kind) return;
    setStatus("sending");
    const ok = await submitErrorReport({ benefitId, kind, message });
    if (ok) track({ name: "report_submit", benefitId, props: { kind } });
    setStatus(ok ? "done" : "failed");
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs text-sub underline underline-offset-2"
      >
        정보가 잘못됐나요? 제보하기
      </button>

      <Dialog open={open} onClose={close} labelledBy="report-title">
        {status === "done" ? (
          <>
            <h2 id="report-title" className="text-[17px] font-bold text-ink">
              제보해 주셔서 고마워요
            </h2>
            <p className="mt-1.5 text-[13px] text-sub">확인한 뒤 혜택 정보를 고칠게요.</p>
            <Button className="mt-6" onClick={close}>
              확인
            </Button>
          </>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void submit();
            }}
          >
            <h2 id="report-title" className="text-[17px] font-bold text-ink">
              어떤 정보가 잘못됐나요?
            </h2>
            <fieldset className="mt-4 space-y-2">
              <legend className="sr-only">제보 유형</legend>
              {REPORT_KINDS.map((k) => (
                <label
                  key={k.value}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm",
                    kind === k.value ? "border-brand bg-brand/5 font-semibold text-brand" : "border-field text-ink",
                  )}
                >
                  <input
                    type="radio"
                    name="report-kind"
                    value={k.value}
                    checked={kind === k.value}
                    onChange={() => setKind(k.value)}
                    className="accent-brand"
                  />
                  {k.label}
                </label>
              ))}
            </fieldset>
            <label className="mt-4 block">
              <span className="text-[13px] font-semibold text-ink">자세한 내용 (선택)</span>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={1000}
                rows={3}
                placeholder="예: 기간이 12월 31일까지로 바뀌었어요"
                className="mt-2 w-full resize-none rounded-xl bg-field px-3.5 py-3 text-sm text-ink outline-none placeholder:text-sub focus:ring-2 focus:ring-brand"
              />
              <span className="mt-1 block text-[11px] text-sub">이름·연락처 같은 개인정보는 적지 말아 주세요.</span>
            </label>
            {status === "failed" ? (
              <p role="alert" className="mt-3 text-[13px] text-like">
                전송하지 못했어요. 잠시 후 다시 시도해 주세요.
              </p>
            ) : null}
            <div className="mt-5 grid grid-cols-2 gap-2.5">
              <Button variant="muted" onClick={close}>
                취소
              </Button>
              <Button type="submit" disabled={!kind || status === "sending"}>
                {status === "sending" ? "보내는 중…" : "보내기"}
              </Button>
            </div>
          </form>
        )}
      </Dialog>
    </>
  );
}
