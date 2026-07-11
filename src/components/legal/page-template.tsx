import type { ReactNode } from "react";
import { InfoIcon } from "lucide-react";
import type { LegalSection } from "@/types/legal";

import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/container";
import { LegalOutline } from "@/components/legal/outline";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface LegalPageTemplateProps {
  title: string;
  lastUpdated: string;
  summary: ReactNode;
  sections: LegalSection[];
}

export function LegalPageTemplate({
  title,
  lastUpdated,
  summary,
  sections,
}: LegalPageTemplateProps) {
  return (
    <Container className="py-16">
      <div className="lg:grid lg:grid-cols-[1fr_220px] lg:gap-12">
        <article className="max-w-none">
          <header className="mb-12">
            <h1 className="font-serif text-4xl text-foreground">{title}</h1>

            <div className="mt-4 flex items-center gap-3">
              <Badge variant="secondary" className="font-normal">
                Last updated: {lastUpdated}
              </Badge>
            </div>
          </header>

          <Alert className="mb-12">
            <InfoIcon aria-hidden="true" />
            <AlertTitle>Quick Summary</AlertTitle>

            <AlertDescription className="leading-relaxed">
              {summary}
            </AlertDescription>
          </Alert>

          <div className="flex flex-col gap-16">
            {sections.map((section) => (
              <section key={section.id} id={section.id} className="scroll-mt-8">
                <div className="mb-4 flex items-baseline gap-4">
                  <span className="font-mono text-sm text-muted-foreground/60">
                    {section.number}
                  </span>

                  <h2 className="text-xl font-medium tracking-tight text-foreground">
                    {section.title}
                  </h2>
                </div>

                <div className="flex flex-col gap-4 leading-relaxed text-muted-foreground [&_b]:font-medium [&_b]:text-foreground [&_code]:rounded [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs [&_strong]:font-medium [&_strong]:text-foreground">
                  {section.content}
                </div>
              </section>
            ))}
          </div>
        </article>

        {/* Sidebar TOC */}
        <aside className="hidden lg:block">
          <LegalOutline
            sections={sections.map(({ id, number, title }) => ({
              id,
              number,
              title,
            }))}
          />
        </aside>
      </div>
    </Container>
  );
}
