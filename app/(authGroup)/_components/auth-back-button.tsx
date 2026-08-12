"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { motion } from "motion/react";

import { Button } from "@/components/ui/button";

export function AuthBackButton() {
  const router = useRouter();

  return (
    <motion.div whileHover={{ x: -2 }} whileTap={{ scale: 0.96 }}>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="gap-1.5 rounded-full text-muted-foreground hover:text-foreground"
        onClick={() => {
          if (typeof window !== "undefined" && window.history.length > 1) {
            router.back();
            return;
          }
          router.push("/");
        }}
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Back
      </Button>
    </motion.div>
  );
}
