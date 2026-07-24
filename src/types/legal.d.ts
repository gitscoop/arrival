import type { ReactNode } from "react";

export interface LegalSection<TContent = ReactNode> {
  id: string;
  number: string;
  title: string;
  content: TContent;
}
