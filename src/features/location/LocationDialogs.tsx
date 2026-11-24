"use client";

import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { PinIcon } from "@/components/ui/icons";

type PermissionDialogProps = {
  open: boolean;
  onAllow: () => void;
  onRefuse: () => void;
};

export function LocationPermissionDialog({ open, onAllow, onRefuse }: PermissionDialogProps) {
  return (
    <Dialog open={open} onClose={onRefuse} labelledBy="location-permission-title">
      <PinIcon size={26} className="text-brand" />
      <h2 id="location-permission-title" className="mt-3 text-[17px] font-bold text-ink">
        현재 위치를 사용하도록 허용할까요?
      </h2>
      <p className="mt-1.5 text-[13px] text-sub">내 위치에서 가까운 매장 혜택을 찾을 수 있어요.</p>
      <div className="mt-6 grid grid-cols-2 gap-2.5">
        <Button variant="muted" onClick={onRefuse}>
          허용 안 함
        </Button>
        <Button onClick={onAllow}>허용</Button>
      </div>
    </Dialog>
  );
}

type DeniedDialogProps = { open: boolean; onConfirm: () => void };

export function LocationDeniedDialog({ open, onConfirm }: DeniedDialogProps) {
  return (
    <Dialog open={open} onClose={onConfirm} labelledBy="location-denied-title">
      <PinIcon size={26} className="text-brand" />
      <h2 id="location-denied-title" className="mt-3 text-[17px] font-bold text-ink">
        에리카 기준으로 보여드릴게요
      </h2>
      <p className="mt-1.5 text-[13px] text-sub">위치 접근을 허용하지 않아 캠퍼스를 기준으로 정렬해요.</p>
      <Button className="mt-6" onClick={onConfirm}>
        확인
      </Button>
    </Dialog>
  );
}
