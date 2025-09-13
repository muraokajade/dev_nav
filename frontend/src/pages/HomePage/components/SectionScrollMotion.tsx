// SectionScrollMotion.tsx
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import type { SectionItem } from "./sectionData";

type Props = { section: SectionItem; mt?: string };

export const SectionScrollMotion: React.FC<Props> = ({ section, mt = "" }) => {
  const ref = useRef<HTMLDivElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 85%", "center 55%"], // 入りを少し遅らせて自然に
  });

  const scale = useTransform(scrollYProgress, [0, 1], [0.92, 1.03]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 1], [0, 1, 1]);

  return (
    <motion.section
      ref={ref}
      style={{ scale, opacity }}
      className={`relative w-full py-12 md:py-16 mb-12`}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0)_0%,rgba(56,189,248,0.06)_40%,rgba(2,6,23,0)_100%)]" />
        <div
          className="absolute left-1/2 -translate-x-1/2 top-8 w-[80vw] h-[40vh]
      bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.10),transparent_60%)] blur-2xl"
        />
      </div>

      <h2 className="text-2xl md:text-3xl font-semibold mb-4 text-white flex items-center gap-3">
        {section.title}
      </h2>
      {section.content}
    </motion.section>
  );
};
