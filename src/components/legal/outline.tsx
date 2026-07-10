"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState, useRef } from "react";

interface LegalOutlineItem {
  id: string;
  number: string;
  title: string;
}

interface LegalOutlineProps {
  sections: LegalOutlineItem[];
}

export function LegalOutline({ sections }: LegalOutlineProps) {
  const currentSectionRef = useRef<string>("");
  const isFooterVisibleRef = useRef<boolean>(false);
  const [activeId, setActiveId] = useState<string>("");

  /*
    Syncs the TOC highlight with scroll position. When the footer enters the viewport,
    keeps the last section active instead of clearing the highlight.
  */
  useEffect(() => {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            currentSectionRef.current = entry.target.id;

            if (!isFooterVisibleRef.current) {
              setActiveId(entry.target.id);
            }
          }
        });
      },
      { rootMargin: "-80px 0px -80% 0px", threshold: 0 },
    );

    sections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) sectionObserver.observe(element);
    });

    const footerObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            isFooterVisibleRef.current = true;

            if (sections.length > 0) {
              setActiveId(sections[sections.length - 1].id);
            }
          } else {
            isFooterVisibleRef.current = false;

            if (currentSectionRef.current) {
              setActiveId(currentSectionRef.current);
            }
          }
        });
      },
      { rootMargin: "0px", threshold: 0 },
    );

    const footer = document.querySelector("footer");
    if (footer) footerObserver.observe(footer);

    return () => {
      sectionObserver.disconnect();
      footerObserver.disconnect();
    };
  }, [sections]);

  return (
    <nav aria-label="On this page" className="sticky top-8">
      <p className="mb-4 text-xs font-medium tracking-wider text-muted-foreground/60 uppercase">
        On this page
      </p>

      <ul className="flex flex-col gap-2">
        {sections.map((section) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              aria-current={activeId === section.id ? "location" : undefined}
              className={cn(
                "block text-sm transition-colors duration-150",
                activeId === section.id
                  ? "font-medium text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
              onClick={(e) => {
                e.preventDefault();

                const prefersReducedMotion = window.matchMedia(
                  "(prefers-reduced-motion: reduce)",
                ).matches;

                document.getElementById(section.id)?.scrollIntoView({
                  behavior: prefersReducedMotion ? "instant" : "smooth",
                });
              }}
            >
              <span className="mr-2 font-mono text-xs text-muted-foreground/50">
                {section.number}
              </span>

              {section.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
