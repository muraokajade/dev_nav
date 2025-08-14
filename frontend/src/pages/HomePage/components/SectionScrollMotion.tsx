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
      className={`w-full ${mt} mb-16 min-h-[28rem] md:min-h-[36rem]`}
    >
      <h2 className="text-2xl md:text-3xl font-semibold mb-4 text-white flex items-center gap-3">
        {section.title}
      </h2>
      {section.content}
    </motion.section>
  );
};
