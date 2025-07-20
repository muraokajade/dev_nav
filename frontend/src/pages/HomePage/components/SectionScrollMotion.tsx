import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import type { SectionItem } from "./sectionData";  // 型インポート！

type Props = {
  section: SectionItem;
  mt?: string;
};

export default function SectionScrollMotion({ section, mt = "" }: Props) {
  // HTMLElement型を明示！
  const ref = useRef<HTMLElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  });

  const scale = useTransform(scrollYProgress, [0, 1], [0.7, 1.08]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 1], [0, 1, 1]);

  return (
    <motion.section
      ref={ref}
      style={{ scale, opacity }}
      className={`mb-16 w-full ${mt} min-h-[36rem]`}
    >
      <h2 className="text-2xl font-semibold mb-3 text-white flex items-center gap-2">
        {section.title}
      </h2>
      {section.content}
    </motion.section>
  );
}
